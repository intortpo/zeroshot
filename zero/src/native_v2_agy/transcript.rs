use openengine_cluster_protocol::TokenCount;
use serde_json::Value;

use crate::native_v2_capsule::provider_json_lines::{ProviderJsonLine, ProviderJsonLines};
use crate::native_v2_capsule::provider_process::safe_provider_text;
use crate::native_v2_contract::TokenUsageDelta;
use crate::native_v2_runner::{LiveOutputStream, NodeRunnerError};

pub(super) struct AgyResult {
    pub(super) session_id: Option<String>,
    pub(super) message: String,
}

pub(super) struct AgyFailure {
    pub(super) session_id: Option<String>,
    pub(super) retryable: bool,
    pub(super) diagnostic: String,
}

pub(super) enum AgyAttempt {
    Complete(AgyResult),
    Failed(AgyFailure),
}

impl AgyAttempt {
    pub(super) fn process_failure(diagnostic: impl Into<String>) -> Self {
        Self::Failed(AgyFailure {
            session_id: None,
            retryable: false,
            diagnostic: diagnostic.into(),
        })
    }
}

#[derive(Debug, Eq, PartialEq)]
pub(super) struct AgyEmission {
    pub(super) stream: LiveOutputStream,
    pub(super) text: String,
}

enum AgyTerminal {
    Complete(Value),
    Failed(String),
}

pub(super) struct AgyTranscript {
    lines: ProviderJsonLines,
    session_id: Option<String>,
    session_failure: Option<String>,
    terminal: Option<AgyTerminal>,
    retryable_failure_seen: bool,
    terminal_usage: Option<TokenUsageDelta>,
    malformed_records: usize,
    oversized_records: usize,
    redactions: Vec<String>,
}

impl AgyTranscript {
    pub(super) fn new(mut redactions: Vec<String>) -> Self {
        redactions.retain(|value| !value.is_empty());
        redactions.sort_by(|left, right| right.len().cmp(&left.len()).then_with(|| left.cmp(right)));
        redactions.dedup();
        Self {
            lines: ProviderJsonLines::new(),
            session_id: None,
            session_failure: None,
            terminal: None,
            retryable_failure_seen: false,
            terminal_usage: None,
            malformed_records: 0,
            oversized_records: 0,
            redactions,
        }
    }

    pub(super) fn push(&mut self, chunk: &[u8]) -> Vec<AgyEmission> {
        if self.terminal.is_some() {
            self.lines.discard();
            return Vec::new();
        }
        let records = self.lines.push(chunk);
        self.accept_records(records)
    }

    pub(super) fn finish_stream(&mut self) -> Vec<AgyEmission> {
        if self.terminal.is_some() {
            self.lines.discard();
            return Vec::new();
        }
        self.lines
            .finish()
            .map_or_else(Vec::new, |record| self.accept_records([record]))
    }

    pub(super) fn token_usage(&self) -> Option<TokenUsageDelta> {
        self.terminal_usage
    }

    pub(super) fn finish(
        mut self,
        process_failure: Option<&str>,
    ) -> Result<AgyAttempt, NodeRunnerError> {
        let process_failure = process_failure.filter(|detail| !detail.trim().is_empty());
        let terminal = self.terminal.take().unwrap_or_else(|| {
            AgyTerminal::Failed("agy process finished without terminal result".to_owned())
        });
        match terminal {
            AgyTerminal::Complete(result) => self.finish_complete(result, process_failure),
            AgyTerminal::Failed(diagnostic) => {
                Ok(self.finish_failed(diagnostic, process_failure))
            }
        }
    }

    fn finish_complete(
        self,
        result: Value,
        process_failure: Option<&str>,
    ) -> Result<AgyAttempt, NodeRunnerError> {
        if let Some(session_failure) = self.session_failure.as_deref() {
            return Ok(AgyAttempt::Failed(AgyFailure {
                session_id: self.session_id,
                retryable: self.retryable_failure_seen,
                diagnostic: combine_detail(session_failure, process_failure),
            }));
        }
        if let Some(process_failure) = process_failure {
            return Ok(AgyAttempt::Failed(AgyFailure {
                session_id: self.session_id,
                retryable: self.retryable_failure_seen,
                diagnostic: process_failure.trim().to_owned(),
            }));
        }
        let message = match result {
            Value::String(message) => message,
            structured => serde_json::to_string(&structured).map_err(|_| NodeRunnerError::Driver)?,
        };
        Ok(AgyAttempt::Complete(AgyResult {
            session_id: self.session_id,
            message,
        }))
    }

    fn finish_failed(self, diagnostic: String, process_failure: Option<&str>) -> AgyAttempt {
        let diagnostic = match self.session_failure {
            Some(session_failure) => combine_detail(&session_failure, Some(&diagnostic)),
            None => diagnostic,
        };
        AgyAttempt::Failed(AgyFailure {
            session_id: self.session_id,
            retryable: self.retryable_failure_seen,
            diagnostic: combine_detail(&diagnostic, process_failure),
        })
    }

    fn accept_records(
        &mut self,
        records: impl IntoIterator<Item = ProviderJsonLine>,
    ) -> Vec<AgyEmission> {
        let mut emissions = Vec::new();
        for record in records {
            if self.terminal.is_some() {
                self.lines.discard();
                break;
            }
            self.accept_record(record, &mut emissions);
        }
        emissions
    }

    fn accept_record(&mut self, record: ProviderJsonLine, emissions: &mut Vec<AgyEmission>) {
        let ProviderJsonLine::Record(line) = record else {
            self.oversized_records = self.oversized_records.saturating_add(1);
            return;
        };
        if line.iter().all(u8::is_ascii_whitespace) {
            return;
        }
        let Ok(event) = serde_json::from_slice::<Value>(&line) else {
            self.malformed_records = self.malformed_records.saturating_add(1);
            return;
        };
        let Some(object) = event.as_object() else {
            self.malformed_records = self.malformed_records.saturating_add(1);
            return;
        };

        if let Some(conversation_id) = object.get("conversation_id").and_then(Value::as_str) {
            if self.session_id.is_none() && !conversation_id.is_empty() {
                self.session_id = Some(conversation_id.to_owned());
            }
        }

        let Some(event_type) = object.get("event").and_then(Value::as_str) else {
            self.malformed_records = self.malformed_records.saturating_add(1);
            return;
        };

        match event_type {
            "init" => {
                if let Some(init) = object.get("init").and_then(Value::as_object) {
                    if let Some(model) = init.get("model").and_then(Value::as_str) {
                        emissions.push(AgyEmission {
                            stream: LiveOutputStream::System,
                            text: format!("Selected model: {model}\n"),
                        });
                    }
                }
            }
            "step_update" => {
                if let Some(step) = object.get("step_update").and_then(Value::as_object) {
                    if let Some(delta) = step.get("text_delta").and_then(Value::as_str) {
                        let text = safe_provider_text(delta, &self.redactions);
                        if !text.is_empty() {
                            emissions.push(AgyEmission {
                                stream: LiveOutputStream::Output,
                                text,
                            });
                        }
                    }
                    if let Some(usage_val) = step.get("usage") {
                        if let Some(delta) = parse_usage(usage_val) {
                            self.terminal_usage = Some(delta);
                        }
                    }
                }
            }
            "result" => {
                if let Some(result) = object.get("result").and_then(Value::as_object) {
                    if let Some(usage_val) = result.get("usage") {
                        if let Some(delta) = parse_usage(usage_val) {
                            self.terminal_usage = Some(delta);
                        }
                    }
                    let status = result.get("status").and_then(Value::as_str).unwrap_or("");
                    if status == "SUCCESS" {
                        let response = result.get("response").cloned().unwrap_or(Value::String(String::new()));
                        self.terminal = Some(AgyTerminal::Complete(response));
                    } else {
                        let error_msg = result
                            .get("error")
                            .and_then(Value::as_str)
                            .unwrap_or("agy turn completed with error status")
                            .to_owned();
                        self.terminal = Some(AgyTerminal::Failed(error_msg));
                    }
                }
            }
            _ => {}
        }
    }
}

fn parse_usage(val: &Value) -> Option<TokenUsageDelta> {
    let input = val.get("input_tokens")?.as_u64()?;
    let output = val.get("output_tokens")?.as_u64()?;
    let cache_read = val.get("cache_read_tokens").and_then(Value::as_u64);
    Some(TokenUsageDelta {
        input_tokens: TokenCount::new(input).ok()?,
        output_tokens: TokenCount::new(output).ok()?,
        cache_read_input_tokens: cache_read.and_then(|v| TokenCount::new(v).ok()),
        cache_creation_input_tokens: None,
    })
}

fn combine_detail(first: &str, second: Option<&str>) -> String {
    match second {
        Some(second) if !second.trim().is_empty() => format!("{first}: {second}"),
        _ => first.to_owned(),
    }
}
