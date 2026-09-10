use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RcloneRemoteInfo {
    pub name: String,
    pub remote_type: String,
    pub is_configured: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RcloneSyncRequest {
    pub source: String,
    pub destination: String,
    pub dry_run: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RcloneSyncResponse {
    pub success: bool,
    pub exit_code: i32,
    pub stdout: String,
    pub stderr: String,
    pub dry_run: bool,
    pub files_transferred: usize,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RcloneStatus {
    pub is_available: bool,
    pub version: String,
    pub remotes: Vec<RcloneRemoteInfo>,
}

#[tauri::command]
pub fn get_rclone_status() -> RcloneStatus {
    let version_output = Command::new("rclone").arg("--version").output();
    let (is_available, version) = match version_output {
        Ok(out) if out.status.success() => {
            let s = String::from_utf8_lossy(&out.stdout);
            let first_line = s.lines().next().unwrap_or("rclone").to_string();
            (true, first_line)
        }
        _ => (false, "rclone not installed or unavailable".to_string()),
    };

    let remotes = if is_available {
        list_remotes_inner()
    } else {
        vec![]
    };

    RcloneStatus {
        is_available,
        version,
        remotes,
    }
}

fn list_remotes_inner() -> Vec<RcloneRemoteInfo> {
    if let Ok(out) = Command::new("rclone").arg("listremotes").output() {
        if out.status.success() {
            let s = String::from_utf8_lossy(&out.stdout);
            return s
                .lines()
                .map(|line| line.trim())
                .filter(|line| !line.is_empty())
                .map(|raw_name| {
                    let name = raw_name.trim_end_matches(':').to_string();
                    let remote_type = if name == "intort" {
                        "drive".to_string()
                    } else {
                        "generic".to_string()
                    };
                    RcloneRemoteInfo {
                        name,
                        remote_type,
                        is_configured: true,
                    }
                })
                .collect();
        }
    }
    vec![]
}

#[tauri::command]
pub fn list_rclone_remotes() -> Vec<RcloneRemoteInfo> {
    list_remotes_inner()
}

#[tauri::command]
pub fn execute_rclone_sync(req: RcloneSyncRequest) -> RcloneSyncResponse {
    let mut cmd = Command::new("rclone");
    cmd.arg("sync").arg(&req.source).arg(&req.destination);

    if req.dry_run {
        cmd.arg("--dry-run");
    }

    cmd.arg("-v");

    match cmd.output() {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout).to_string();
            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
            let success = out.status.success();
            let exit_code = out.status.code().unwrap_or(-1);

            let message = if success {
                if req.dry_run {
                    format!("Dry run sync completed successfully between {} and {}", req.source, req.destination)
                } else {
                    format!("Successfully synchronized {} to {}", req.source, req.destination)
                }
            } else {
                format!("Rclone sync exited with code {}: {}", exit_code, stderr)
            };

            let files_transferred = stderr
                .lines()
                .filter(|l| l.contains("Copied") || l.contains("Transferred") || l.contains("Updated"))
                .count();

            RcloneSyncResponse {
                success,
                exit_code,
                stdout,
                stderr,
                dry_run: req.dry_run,
                files_transferred,
                message,
            }
        }
        Err(e) => RcloneSyncResponse {
            success: false,
            exit_code: -1,
            stdout: String::new(),
            stderr: e.to_string(),
            dry_run: req.dry_run,
            files_transferred: 0,
            message: format!("Failed to execute rclone binary: {}", e),
        },
    }
}
