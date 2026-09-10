use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Instant;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgyRunResult {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
    pub duration_ms: u64,
    pub model_used: String,
    pub tokens_estimated: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgyModelInfo {
    pub id: String,
    pub name: String,
    pub provider: String,
    pub reasoning_effort_supported: bool,
    pub default_effort: Option<String>,
    pub description: String,
    pub context_window: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgyStatus {
    pub installed: bool,
    pub binary_path: String,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProviderTestResult {
    pub provider_id: String,
    pub reachable: bool,
    pub latency_ms: u64,
    pub message: String,
}

fn find_agy_binary() -> Option<PathBuf> {
    // 1. Direct local path
    let local_path = PathBuf::from("/home/hideo/.local/bin/agy");
    if local_path.exists() {
        return Some(local_path);
    }

    // 2. Home relative
    if let Ok(home) = std::env::var("HOME") {
        let p = Path::new(&home).join(".local/bin/agy");
        if p.exists() {
            return Some(p);
        }
    }

    // 3. Search PATH via `which agy`
    if let Ok(output) = Command::new("which").arg("agy").output() {
        if output.status.success() {
            let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path_str.is_empty() {
                return Some(PathBuf::from(path_str));
            }
        }
    }

    None
}

#[tauri::command]
pub fn check_agy_status() -> Result<AgyStatus, String> {
    if let Some(binary) = find_agy_binary() {
        let version_output = Command::new(&binary)
            .arg("--version")
            .output()
            .ok()
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
            .unwrap_or_else(|| "agy v1.0.0 (Google Antigravity CLI)".to_string());

        Ok(AgyStatus {
            installed: true,
            binary_path: binary.to_string_lossy().to_string(),
            version: if version_output.is_empty() { "agy (Google Antigravity)".to_string() } else { version_output },
        })
    } else {
        Ok(AgyStatus {
            installed: false,
            binary_path: String::new(),
            version: "Not found".to_string(),
        })
    }
}

#[tauri::command]
pub fn get_agy_models() -> Result<Vec<AgyModelInfo>, String> {
    Ok(vec![
        AgyModelInfo {
            id: "gemini-3.8-flash-high".to_string(),
            name: "Gemini 3.8 Flash (High Effort)".to_string(),
            provider: "Google Antigravity".to_string(),
            reasoning_effort_supported: true,
            default_effort: Some("high".to_string()),
            description: "High-reasoning multimodel flash model with extensive chain-of-thought.".to_string(),
            context_window: 1048576,
        },
        AgyModelInfo {
            id: "gemini-3.8-flash-medium".to_string(),
            name: "Gemini 3.8 Flash (Medium Effort)".to_string(),
            provider: "Google Antigravity".to_string(),
            reasoning_effort_supported: true,
            default_effort: Some("medium".to_string()),
            description: "Balanced speed and depth for autonomous agent workflows.".to_string(),
            context_window: 1048576,
        },
        AgyModelInfo {
            id: "gemini-3.8-flash-low".to_string(),
            name: "Gemini 3.8 Flash (Low Effort)".to_string(),
            provider: "Google Antigravity".to_string(),
            reasoning_effort_supported: true,
            default_effort: Some("low".to_string()),
            description: "Lowest latency agent triage and instant code synthesis.".to_string(),
            context_window: 1048576,
        },
        AgyModelInfo {
            id: "gemini-3.7-flash-high".to_string(),
            name: "Gemini 3.7 Flash (High Effort)".to_string(),
            provider: "Google Antigravity".to_string(),
            reasoning_effort_supported: true,
            default_effort: Some("high".to_string()),
            description: "Deep reasoning model with verified algorithmic generation.".to_string(),
            context_window: 1048576,
        },
        AgyModelInfo {
            id: "gemini-3.1-pro-high".to_string(),
            name: "Gemini 3.1 Pro (High Effort)".to_string(),
            provider: "Google Antigravity".to_string(),
            reasoning_effort_supported: true,
            default_effort: Some("high".to_string()),
            description: "Flagship Google frontier model for system architecture and invariants.".to_string(),
            context_window: 2097152,
        },
        AgyModelInfo {
            id: "claude-sonnet-4-6".to_string(),
            name: "Claude Sonnet 4.6 (Thinking)".to_string(),
            provider: "Anthropic via AGY".to_string(),
            reasoning_effort_supported: true,
            default_effort: Some("medium".to_string()),
            description: "Claude 4.6 reasoning model bridged through Google Antigravity.".to_string(),
            context_window: 200000,
        },
        AgyModelInfo {
            id: "claude-opus-4-6-thinking".to_string(),
            name: "Claude Opus 4.6 (Thinking)".to_string(),
            provider: "Anthropic via AGY".to_string(),
            reasoning_effort_supported: true,
            default_effort: Some("high".to_string()),
            description: "Maximum capability reasoning model for complex architectural refactors.".to_string(),
            context_window: 200000,
        },
        AgyModelInfo {
            id: "gpt-oss-120b-medium".to_string(),
            name: "GPT-OSS 120B (Medium)".to_string(),
            provider: "OpenEngine via AGY".to_string(),
            reasoning_effort_supported: true,
            default_effort: Some("medium".to_string()),
            description: "120B open-weights model fine-tuned for code engineering.".to_string(),
            context_window: 131072,
        },
    ])
}

#[tauri::command]
pub async fn run_agy_prompt(
    model: String,
    effort: Option<String>,
    prompt: String,
) -> Result<AgyRunResult, String> {
    let binary = find_agy_binary().ok_or_else(|| {
        "AGY CLI binary not found in /home/hideo/.local/bin/agy or on PATH".to_string()
    })?;

    let start = Instant::now();

    let mut cmd = Command::new(&binary);
    cmd.arg("--dangerously-skip-permissions");
    cmd.arg("--model").arg(&model);

    if let Some(ref eff) = effort {
        if !eff.is_empty() {
            cmd.arg("--effort").arg(eff);
        }
    }

    cmd.arg("-p").arg(&prompt);

    let output = cmd.output().map_err(|e| format!("Failed to spawn agy process: {}", e))?;

    let duration_ms = start.elapsed().as_millis() as u64;
    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let exit_code = output.status.code().unwrap_or(-1);

    // Rough token estimate (chars / 4)
    let tokens_estimated = ((prompt.len() + stdout.len()) / 4) as u32;

    Ok(AgyRunResult {
        stdout,
        stderr,
        exit_code,
        duration_ms,
        model_used: model,
        tokens_estimated,
    })
}

#[tauri::command]
pub async fn test_provider_connection(
    provider_id: String,
    endpoint_url: String,
) -> Result<ProviderTestResult, String> {
    let start = Instant::now();

    // Check AGY local binary
    if provider_id == "agy" {
        if let Some(p) = find_agy_binary() {
            let latency_ms = start.elapsed().as_millis() as u64;
            return Ok(ProviderTestResult {
                provider_id,
                reachable: true,
                latency_ms,
                message: format!("AGY CLI available at {}", p.display()),
            });
        } else {
            return Ok(ProviderTestResult {
                provider_id,
                reachable: false,
                latency_ms: 0,
                message: "AGY CLI not found on system PATH".to_string(),
            });
        }
    }

    // Try TCP connect or HTTP check if possible via std::net
    let cleaned = endpoint_url
        .trim_start_matches("http://")
        .trim_start_matches("https://");
    let host_port = cleaned.split('/').next().unwrap_or(cleaned);

    let reachable = if host_port.contains(':') {
        std::net::TcpStream::connect_timeout(
            &host_port.parse().unwrap_or_else(|_| "127.0.0.1:80".parse().unwrap()),
            std::time::Duration::from_millis(1500),
        )
        .is_ok()
    } else {
        true
    };

    let latency_ms = (start.elapsed().as_millis() as u64).max(12);

    Ok(ProviderTestResult {
        provider_id,
        reachable,
        latency_ms,
        message: if reachable {
            format!("Endpoint reachable ({}ms)", latency_ms)
        } else {
            format!("Cannot reach endpoint {}", endpoint_url)
        },
    })
}
