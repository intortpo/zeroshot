//! Antigravity CLI (agy) adapter for native-v2 graph nodes.
//!
//! One adapter is constructed for the graph-wide Gemini or Vertex lane.
//! Admission has already selected the model, effort, session scope, and declared environment for
//! each node; it preserves those choices without consulting legacy coordination or ambient process
//! state.

#[path = "native_v2_agy/command.rs"]
mod command;
#[path = "native_v2_agy/session.rs"]
mod session;
#[path = "native_v2_agy/transcript.rs"]
mod transcript;
#[path = "native_v2_agy/turn_process.rs"]
mod turn_process;

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::time::Duration;

use tokio::time::Instant;

use crate::execution::process::{HostedProcessPool, ProcessSessionCommand, ProcessStdout};
use crate::native_v2_capsule::provider_process::{
    ClosedSessionFailure, ProviderProcessRunners, process_scope, redaction_values,
    with_driver_detail,
};
use crate::native_v2_contract::{AgyProvider, NodeRuntimeBinding};
use crate::native_v2_runner::{
    AgentResponse, resolve_agent_response, DriverControl, DriverInvocation, LiveOutput,
    LiveOutputStream, NodeRunnerError, ProviderSchemaDialect, ResolvedEnvironment,
};
use command::{
    AgyTurnArguments, agy_arguments, configure_provider, extend_declared_environment, prompt,
    reject_provider_controls, workspace_access,
};
use session::{AgySession, attempt_session_id, observe_session};
use transcript::{AgyAttempt, AgyEmission, AgyTranscript};
use turn_process::AgyProcessStart;

const MINIMAL_ENVIRONMENT_NAMES: [&str; 6] = ["HOME", "LANG", "LC_ALL", "PATH", "TERM", "TMPDIR"];

#[derive(Clone, Debug, Eq, PartialEq, thiserror::Error)]
pub enum AgyAdapterConfigError {
    #[error("agy executable must not be empty")]
    EmptyExecutable,
    #[error("base process environment contains non-minimal name {0}")]
    NonMinimalEnvironment(String),
    #[error("base process environment contains an invalid value")]
    InvalidEnvironment,
}

#[derive(Clone, Default)]
pub struct AgyProcessEnvironment(BTreeMap<String, String>);

impl AgyProcessEnvironment {
    pub fn new(values: BTreeMap<String, String>) -> Result<Self, AgyAdapterConfigError> {
        for (name, value) in &values {
            if !MINIMAL_ENVIRONMENT_NAMES.contains(&name.as_str()) {
                return Err(AgyAdapterConfigError::NonMinimalEnvironment(name.clone()));
            }
            if value.contains('\0') {
                return Err(AgyAdapterConfigError::InvalidEnvironment);
            }
        }
        Ok(Self(values))
    }

    fn clone_values(&self) -> BTreeMap<String, String> {
        self.0.clone()
    }

    #[allow(dead_code)]
    pub(crate) fn for_capsule(
        &self,
        runtime_home: &Path,
        default_path: &str,
    ) -> Result<Self, AgyAdapterConfigError> {
        let runtime_home = runtime_home
            .to_str()
            .filter(|value| !value.is_empty())
            .ok_or(AgyAdapterConfigError::InvalidEnvironment)?;
        let mut values = self.clone_values();
        values.insert("HOME".to_owned(), runtime_home.to_owned());
        values
            .entry("PATH".to_owned())
            .or_insert_with(|| default_path.to_owned());
        Self::new(values)
    }
}

impl std::fmt::Debug for AgyProcessEnvironment {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_tuple("AgyProcessEnvironment")
            .field(&self.0.keys().collect::<Vec<_>>())
            .finish()
    }
}

pub struct AgyAdapter {
    pub provider: AgyProvider,
    executable: String,
    prefix_arguments: Vec<String>,
    pub workspace: PathBuf,
    runtime_home: PathBuf,
    local_user_home: Option<PathBuf>,
    base_environment: AgyProcessEnvironment,
    turn_timeout: Duration,
    runners: ProviderProcessRunners,
}

pub struct AgyAdapterConfig {
    pub provider: AgyProvider,
    pub executable: String,
    pub prefix_arguments: Vec<String>,
    pub workspace: PathBuf,
    pub runtime_home: PathBuf,
    pub local_user_home: Option<PathBuf>,
    pub base_environment: AgyProcessEnvironment,
    pub turn_timeout: Duration,
    pub process_pool: HostedProcessPool,
}

impl AgyAdapter {
    pub fn new(mut configuration: AgyAdapterConfig) -> Result<Self, AgyAdapterConfigError> {
        configuration.local_user_home = None;
        let runners = ProviderProcessRunners::hosted(configuration.process_pool);
        Self::configured(configuration, runners)
    }

    pub fn new_local(configuration: AgyAdapterConfig) -> Result<Self, AgyAdapterConfigError> {
        Self::configured(configuration, ProviderProcessRunners::local())
    }

    fn configured(
        configuration: AgyAdapterConfig,
        runners: ProviderProcessRunners,
    ) -> Result<Self, AgyAdapterConfigError> {
        if configuration.executable.is_empty() {
            return Err(AgyAdapterConfigError::EmptyExecutable);
        }
        Ok(Self {
            provider: configuration.provider,
            executable: configuration.executable,
            prefix_arguments: configuration.prefix_arguments,
            workspace: configuration.workspace,
            runtime_home: configuration.runtime_home,
            local_user_home: configuration.local_user_home,
            base_environment: configuration.base_environment,
            turn_timeout: configuration.turn_timeout,
            runners,
        })
    }

    fn command(
        &self,
        turn: &AgyTurn<'_>,
        input: AgyCommandInput<'_>,
    ) -> Result<ProcessSessionCommand, NodeRunnerError> {
        let invocation = turn.invocation;
        let NodeRuntimeBinding::Agent { model, effort, .. } = &invocation.node.binding else {
            return Err(NodeRunnerError::DriverDetail(
                "Agy command requires an agent runtime binding".to_owned(),
            ));
        };
        let argv = agy_arguments(
            self.prefix_arguments.clone(),
            AgyTurnArguments {
                model: model.as_str(),
                effort: *effort,
                role: invocation.role,
                resume_id: input.resume_id,
                json_schema: match serde_json::to_string(
                    &invocation
                        .response
                        .provider_schema(ProviderSchemaDialect::Standard),
                ) {
                    Ok(schema) if schema != "null" => Some(schema),
                    _ => None,
                },
            },
        )
        .map_err(|error| {
            with_driver_detail(error, "Agy command rejected the selected node role")
        })?;

        Ok(ProcessSessionCommand {
            program: self.executable.clone(),
            argv,
            environment: self
                .process_environment(&invocation.environment, input.runtime_home)
                .map_err(|error| {
                    with_driver_detail(error, "Agy provider environment is invalid")
                })?,
            workspace: crate::execution::driver::WorkspaceCapability {
                current_dir: self.workspace.clone(),
                mode: workspace_access(invocation.role).map_err(|error| {
                    with_driver_detail(error, "Agy workspace policy rejected the node role")
                })?,
            },
            deadline: turn.deadline,
        })
    }

    fn process_environment(
        &self,
        resolved: &ResolvedEnvironment,
        runtime_home: &Path,
    ) -> Result<BTreeMap<String, String>, NodeRunnerError> {
        let mut environment = self.base_environment.clone_values();
        let runtime_home = runtime_home
            .to_str()
            .filter(|value| !value.is_empty())
            .ok_or_else(|| {
                NodeRunnerError::DriverDetail(
                    "Agy runtime home is not a valid non-empty platform path".to_owned(),
                )
            })?;
        let provider_home = self
            .local_user_home
            .as_deref()
            .and_then(Path::to_str)
            .filter(|value| !value.is_empty())
            .unwrap_or(runtime_home);
        environment.insert("HOME".to_owned(), provider_home.to_owned());
        environment.insert("TMPDIR".to_owned(), runtime_home.to_owned());
        extend_declared_environment(&mut environment, resolved).map_err(|error| {
            with_driver_detail(
                error,
                "Agy declared environment conflicts with reserved process configuration",
            )
        })?;
        reject_provider_controls(&environment).map_err(|error| {
            with_driver_detail(
                error,
                "Agy declared environment contains a provider-owned control variable",
            )
        })?;
        configure_provider(self.provider, &mut environment).map_err(|error| {
            with_driver_detail(
                error,
                "Agy credentials configuration failed",
            )
        })?;
        Ok(environment)
    }

    async fn advance_turn(
        &self,
        turn: &AgyTurn<'_>,
        resume_id: &mut Option<String>,
        prompt: String,
    ) -> Result<AgyTurnAdvance, NodeRunnerError> {
        turn.session
            .core
            .ensure_live(ClosedSessionFailure::SessionLost)?;
        let attempt = self
            .execute_turn(turn, resume_id.as_deref(), prompt)
            .await?;
        if let Err(diagnostic) = observe_session(resume_id, attempt_session_id(&attempt)) {
            return Ok(AgyTurnAdvance::ProviderFailure {
                retryable: false,
                diagnostic: diagnostic.to_owned(),
            });
        }
        resolve_agy_attempt(turn, resume_id, attempt).await
    }

    async fn execute_turn(
        &self,
        turn: &AgyTurn<'_>,
        resume_id: Option<&str>,
        prompt: String,
    ) -> Result<AgyAttempt, NodeRunnerError> {
        let mut process = match self.open_turn_process(turn, resume_id).await? {
            AgyProcessStart::Ready(process) => process,
            AgyProcessStart::Failed(attempt) => return Ok(attempt),
        };
        let transcript = AgyTranscript::new(redaction_values(
            turn.invocation.environment.iter().map(|(_, value)| value),
        ));
        turn_process::finish_process(&mut process, prompt.as_bytes(), transcript, turn.control)
            .await
    }

    async fn open_turn_process(
        &self,
        turn: &AgyTurn<'_>,
        resume_id: Option<&str>,
    ) -> Result<AgyProcessStart, NodeRunnerError> {
        let scope = process_scope(turn.invocation).map_err(|error| {
            with_driver_detail(error, "Agy process scope requires an agent node role")
        })?;
        let (runner, runtime_home) = match self.runners.turn_process(&self.runtime_home, scope) {
            Ok(process) => process,
            Err(error) => return turn_process::failed_before_start(error, turn.control),
        };
        let command = self.command(
            turn,
            AgyCommandInput {
                resume_id,
                runtime_home: &runtime_home,
            },
        )?;
        turn_process::open(runner, command, turn.control).await
    }
}

async fn resolve_agy_attempt(
    turn: &AgyTurn<'_>,
    resume_id: &Option<String>,
    attempt: AgyAttempt,
) -> Result<AgyTurnAdvance, NodeRunnerError> {
    let result = match attempt {
        AgyAttempt::Complete(result) => result,
        AgyAttempt::Failed(failure) => {
            return Ok(AgyTurnAdvance::ProviderFailure {
                retryable: failure.retryable,
                diagnostic: failure.diagnostic,
            });
        }
    };
    let response = resolve_agent_response(&turn.invocation.response, &result.message)?;
    if matches!(response, AgentResponse::Correction(_)) {
        if resume_id.is_none() {
            return Ok(AgyTurnAdvance::ProviderFailure {
                retryable: false,
                diagnostic:
                    "Agy output did not provide a session identifier required for correction"
                        .to_owned(),
            });
        }
        turn.control
            .emit(LiveOutput::new(
                LiveOutputStream::System,
                "Agy final output rejected; requesting correction",
            )?)
            .await?;
    }
    Ok(AgyTurnAdvance::Response(response))
}

struct AgyTurn<'a> {
    invocation: &'a DriverInvocation,
    session: &'a AgySession,
    control: &'a DriverControl,
    deadline: Instant,
}

enum AgyTurnAdvance {
    Response(AgentResponse),
    ProviderFailure { retryable: bool, diagnostic: String },
}

struct AgyCommandInput<'a> {
    resume_id: Option<&'a str>,
    runtime_home: &'a Path,
}

async fn collect_transcript(
    mut stdout: ProcessStdout,
    transcript: &mut AgyTranscript,
    control: &DriverControl,
) -> Result<(), NodeRunnerError> {
    let mut delivery_error = None;
    while let Some(chunk) = stdout.recv().await {
        let emissions = transcript.push(chunk.as_slice());
        if delivery_error.is_none() {
            delivery_error = emit_agy(control, emissions).await.err();
        }
    }
    let emissions = transcript.finish_stream();
    if delivery_error.is_none() {
        delivery_error = emit_agy(control, emissions).await.err();
    }
    delivery_error.map_or(Ok(()), Err)
}

async fn emit_agy(
    control: &DriverControl,
    emissions: Vec<AgyEmission>,
) -> Result<(), NodeRunnerError> {
    for emission in emissions {
        control
            .emit(LiveOutput::new(emission.stream, emission.text)?)
            .await?;
    }
    Ok(())
}
