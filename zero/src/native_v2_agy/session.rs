use std::sync::Arc;

use async_trait::async_trait;
use openengine_cluster_protocol::WorkerOutcome;
use tokio::sync::Mutex;
use tokio::time::Instant;

use crate::execution::SessionScope;
use crate::native_v2_capsule::provider_process::{
    ProviderFailure, ProviderFailureRetry, ProviderSessionCore, impl_provider_node_session,
    redaction_values,
};
use crate::native_v2_contract::{NodeInvocation, NodeRuntimeBinding};
use crate::native_v2_runner::{
    AgentResponse, AgentResponseState, DriverControl, DriverInvocation, NodeDriver,
    NodeRunnerError, NodeSession, ResolvedEnvironment, SessionFactory,
};

use super::{AgyAdapter, AgyAttempt, AgyTurn, AgyTurnAdvance, prompt};

const MISSING_REUSABLE_SESSION: &str =
    "agy output did not provide a conversation identifier for reusable session";

pub(super) struct AgySession {
    pub(super) core: ProviderSessionCore,
    pub(super) resume_id: Mutex<Option<String>>,
}

impl AgySession {
    fn new() -> Self {
        Self {
            core: ProviderSessionCore::new(),
            resume_id: Mutex::new(None),
        }
    }
}

impl_provider_node_session!(AgySession);

#[async_trait]
impl SessionFactory for AgyAdapter {
    async fn open(
        &self,
        invocation: &NodeInvocation,
        _environment: &ResolvedEnvironment,
    ) -> Result<Arc<dyn NodeSession>, NodeRunnerError> {
        let NodeRuntimeBinding::Agent { .. } = &invocation.binding else {
            return Err(NodeRunnerError::SessionOpen);
        };
        Ok(Arc::new(AgySession::new()))
    }
}

#[async_trait]
impl NodeDriver for AgyAdapter {
    async fn run(
        &self,
        invocation: DriverInvocation,
        control: DriverControl,
    ) -> Result<WorkerOutcome, NodeRunnerError> {
        let session = invocation
            .session
            .as_any()
            .downcast_ref::<AgySession>()
            .ok_or(NodeRunnerError::Driver)?;
        let _turn = session.core.turn.lock().await;
        let turn = AgyTurn {
            invocation: &invocation,
            session,
            control: &control,
            deadline: Instant::now() + self.turn_timeout,
        };
        let mut state = AgyRunState::new(&invocation, session).await?;
        loop {
            if let Some(outcome) = self.advance_run(&turn, &mut state, &control).await? {
                retain_session(&invocation.node, session, state.resume_id.as_deref()).await?;
                return Ok(outcome);
            }
        }
    }
}

impl AgyAdapter {
    async fn advance_run(
        &self,
        turn: &AgyTurn<'_>,
        state: &mut AgyRunState,
        control: &DriverControl,
    ) -> Result<Option<WorkerOutcome>, NodeRunnerError> {
        match self
            .advance_turn(
                turn,
                &mut state.resume_id,
                state.response.prompt().to_owned(),
            )
            .await
        {
            Ok(AgyTurnAdvance::Response(response)) => {
                if requires_session(&turn.invocation.node) && state.resume_id.is_none() {
                    state
                        .retry_provider_failure(turn, false, MISSING_REUSABLE_SESSION)
                        .await?;
                }
                state.accept_response(control, response).await
            }
            Ok(AgyTurnAdvance::ProviderFailure {
                retryable,
                diagnostic,
            }) => {
                state
                    .retry_provider_failure(turn, retryable, &diagnostic)
                    .await?;
                Ok(None)
            }
            Err(error) => {
                state.emit_terminal_error(control, &error).await?;
                Err(error)
            }
        }
    }
}

struct AgyRunState {
    resume_id: Option<String>,
    response: AgentResponseState,
    retry: ProviderFailureRetry,
}

impl AgyRunState {
    async fn new(
        invocation: &DriverInvocation,
        session: &AgySession,
    ) -> Result<Self, NodeRunnerError> {
        let prompt = prompt(invocation)?;
        let redactions = redaction_values(invocation.environment.iter().map(|(_, value)| value));
        Ok(Self {
            resume_id: session.resume_id.lock().await.clone(),
            retry: ProviderFailureRetry::new("Agy", prompt.clone(), redactions),
            response: AgentResponseState::new(prompt),
        })
    }

    async fn accept_response(
        &mut self,
        control: &DriverControl,
        response: AgentResponse,
    ) -> Result<Option<WorkerOutcome>, NodeRunnerError> {
        self.response.accept("Agy", control, response).await
    }

    async fn retry_provider_failure(
        &mut self,
        turn: &AgyTurn<'_>,
        retryable: bool,
        detail: &str,
    ) -> Result<(), NodeRunnerError> {
        let prompt = self
            .retry
            .after_failure(
                turn.control,
                ProviderFailure {
                    detail: Some(detail),
                    retryable,
                    has_session: self.resume_id.is_some(),
                    deadline: turn.deadline,
                },
            )
            .await?;
        self.response.replace_prompt(prompt);
        Ok(())
    }

    async fn emit_terminal_error(
        &self,
        control: &DriverControl,
        error: &NodeRunnerError,
    ) -> Result<(), NodeRunnerError> {
        self.retry.report_terminal(control, error).await
    }
}

async fn retain_session(
    invocation: &NodeInvocation,
    session: &AgySession,
    observed: Option<&str>,
) -> Result<(), NodeRunnerError> {
    if !requires_session(invocation) {
        return Ok(());
    }
    let observed = observed.ok_or(NodeRunnerError::Driver)?;
    let mut retained = session.resume_id.lock().await;
    observe_session(&mut retained, Some(observed)).map_err(|_| NodeRunnerError::Driver)
}

fn requires_session(invocation: &NodeInvocation) -> bool {
    matches!(
        invocation.binding,
        NodeRuntimeBinding::Agent {
            session_scope: SessionScope::NodeInstance,
            ..
        }
    )
}

pub(super) fn attempt_session_id(attempt: &AgyAttempt) -> Option<&str> {
    match attempt {
        AgyAttempt::Complete(result) => result.session_id.as_deref(),
        AgyAttempt::Failed(failure) => failure.session_id.as_deref(),
    }
}

pub(super) fn observe_session(
    retained: &mut Option<String>,
    observed: Option<&str>,
) -> Result<(), &'static str> {
    let Some(observed) = observed else {
        return Ok(());
    };
    match retained.as_deref() {
        Some(existing) if existing != observed => {
            Err("agy output changed session identifier across turns")
        }
        Some(_) => Ok(()),
        None => {
            *retained = Some(observed.to_owned());
            Ok(())
        }
    }
}
