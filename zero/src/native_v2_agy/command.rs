use std::collections::BTreeMap;

use crate::execution::WorkspaceAccessMode;
use crate::native_v2_capsule::provider_process::{effort_token, with_driver_detail};
use crate::native_v2_contract::AgyProvider;
use crate::native_v2_runner::{
    render_agent_prompt, DriverInvocation, NodeRole, NodeRunnerError, ResolvedEnvironment,
};
use crate::worker_catalog::ReasoningEffort;

#[allow(dead_code)]
pub(super) const GEMINI_API_KEY: &str = "GEMINI_API_KEY";
#[allow(dead_code)]
pub(super) const GOOGLE_APPLICATION_CREDENTIALS: &str = "GOOGLE_APPLICATION_CREDENTIALS";
#[allow(dead_code)]
pub(super) const GOOGLE_CLOUD_PROJECT: &str = "GOOGLE_CLOUD_PROJECT";
#[allow(dead_code)]
pub(super) const GOOGLE_CLOUD_REGION: &str = "GOOGLE_CLOUD_REGION";

pub(super) struct AgyTurnArguments<'a> {
    pub(super) model: &'a str,
    pub(super) effort: Option<ReasoningEffort>,
    pub(super) role: NodeRole,
    pub(super) resume_id: Option<&'a str>,
    pub(super) json_schema: Option<String>,
}

pub(super) fn agy_arguments(
    mut argv: Vec<String>,
    turn: AgyTurnArguments<'_>,
) -> Result<Vec<String>, NodeRunnerError> {
    argv.extend([
        "--input-format".to_owned(),
        "text".to_owned(),
        "--output-format".to_owned(),
        "stream-json".to_owned(),
        "--model".to_owned(),
        turn.model.to_owned(),
        "--print".to_owned(),
        "-".to_owned(),
    ]);
    if let Some(effort) = turn.effort {
        argv.extend(["--effort".to_owned(), effort_token(effort).to_owned()]);
    }
    match turn.role {
        NodeRole::Worker => argv.push("--dangerously-skip-permissions".to_owned()),
        NodeRole::Verifier => {
            argv.extend(["--mode".to_owned(), "plan".to_owned()]);
        }
        NodeRole::GitDelivery => return Err(NodeRunnerError::Driver),
    }
    if let Some(resume_id) = turn.resume_id {
        argv.extend(["--conversation".to_owned(), resume_id.to_owned()]);
    }
    if let Some(schema) = turn.json_schema {
        argv.extend(["--json-schema".to_owned(), schema]);
    }
    Ok(argv)
}

pub(super) fn workspace_access(role: NodeRole) -> Result<WorkspaceAccessMode, NodeRunnerError> {
    match role {
        NodeRole::Verifier => Ok(WorkspaceAccessMode::ReadOnly),
        NodeRole::Worker => Ok(WorkspaceAccessMode::Exclusive),
        NodeRole::GitDelivery => Err(NodeRunnerError::Driver),
    }
}

pub(super) fn extend_declared_environment(
    environment: &mut BTreeMap<String, String>,
    resolved: &ResolvedEnvironment,
) -> Result<(), NodeRunnerError> {
    for (name, value) in resolved.iter() {
        if value.contains('\0') || environment.contains_key(name.as_str()) {
            return Err(NodeRunnerError::Driver);
        }
        environment.insert(name.as_str().to_owned(), value.to_owned());
    }
    Ok(())
}

pub(super) fn reject_provider_controls(
    environment: &BTreeMap<String, String>,
) -> Result<(), NodeRunnerError> {
    const CONTROLS: [&str; 4] = [
        "AGY_CONFIG_DIR",
        "AGY_HOME",
        "AGY_LOG_FILE",
        "AGY_PORT",
    ];
    CONTROLS
        .iter()
        .all(|name| !environment.contains_key(*name))
        .then_some(())
        .ok_or(NodeRunnerError::Driver)
}

pub(super) fn configure_provider(
    provider: AgyProvider,
    _environment: &mut BTreeMap<String, String>,
) -> Result<(), NodeRunnerError> {
    match provider {
        AgyProvider::Gemini => Ok(()),
        AgyProvider::Vertex => Ok(()),
    }
}

pub(super) fn prompt(invocation: &DriverInvocation) -> Result<String, NodeRunnerError> {
    render_agent_prompt(
        invocation.agent_instructions()?,
        &invocation.node.input,
        &invocation.response,
    )
    .map_err(|error| with_driver_detail(error, "Agy prompt could not be serialized"))
}

