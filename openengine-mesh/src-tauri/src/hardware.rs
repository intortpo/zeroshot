use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct NodeSpec {
    pub node_id: String,
    pub role: String, // "rtx_host" or "thin_client"
    pub device_name: String,
    pub has_rtx: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vram_free_mb: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub memory_free_mb: Option<u64>,
    pub active_jobs: u32,
}

impl Default for NodeSpec {
    fn default() -> Self {
        Self {
            node_id: "local-node".to_string(),
            role: "thin_client".to_string(),
            device_name: "Generic Linux Client".to_string(),
            has_rtx: false,
            vram_free_mb: None,
            memory_free_mb: None,
            active_jobs: 0,
        }
    }
}

/// Detects local hardware capabilities.
/// Queries `nvidia-smi` for GPU name and free VRAM on Linux desktop/server.
/// Falls back safely on Android, macOS, or non-NVIDIA environments.
#[tauri::command]
pub fn detect_hardware() -> NodeSpec {
    detect_hardware_inner()
}

pub fn detect_hardware_inner() -> NodeSpec {
    #[cfg(target_os = "linux")]
    {
        if let Ok(output) = std::process::Command::new("nvidia-smi")
            .arg("--query-gpu=name,memory.free")
            .arg("--format=csv,noheader,nounits")
            .output()
        {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                if let Some((name, free_mb)) = parse_nvidia_smi_output(&stdout) {
                    let has_rtx = name.to_uppercase().contains("RTX");
                    let role = if has_rtx { "rtx_host" } else { "thin_client" };
                    return NodeSpec {
                        node_id: format!("host-{}", get_hostname()),
                        role: role.to_string(),
                        device_name: name,
                        has_rtx,
                        vram_free_mb: Some(free_mb),
                        memory_free_mb: None,
                        active_jobs: 0,
                    };
                }
            }
        }
    }

    NodeSpec {
        node_id: format!("client-{}", get_hostname()),
        role: "thin_client".to_string(),
        device_name: format!("Mobile/CPU Client ({})", std::env::consts::OS),
        has_rtx: false,
        vram_free_mb: None,
        memory_free_mb: None,
        active_jobs: 0,
    }
}

pub fn parse_nvidia_smi_output(output: &str) -> Option<(String, u64)> {
    let line = output.lines().next()?.trim();
    if line.is_empty() {
        return None;
    }
    let parts: Vec<&str> = line.split(',').collect();
    if parts.len() >= 2 {
        let name = parts[0].trim().to_string();
        let free_vram = parts[1].trim().parse::<u64>().unwrap_or(0);
        Some((name, free_vram))
    } else if !parts.is_empty() {
        Some((parts[0].trim().to_string(), 0))
    } else {
        None
    }
}

fn get_hostname() -> String {
    std::env::var("HOSTNAME")
        .or_else(|_| std::env::var("USER"))
        .unwrap_or_else(|_| "node".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_nvidia_smi_valid() {
        let sample = "NVIDIA GeForce RTX 4090, 22400\n";
        let res = parse_nvidia_smi_output(sample);
        assert!(res.is_some());
        let (name, vram) = res.unwrap();
        assert_eq!(name, "NVIDIA GeForce RTX 4090");
        assert_eq!(vram, 22400);
    }

    #[test]
    fn test_parse_nvidia_smi_empty() {
        let sample = "";
        assert_eq!(parse_nvidia_smi_output(sample), None);
    }

    #[test]
    fn test_detect_hardware_fallback() {
        let spec = detect_hardware_inner();
        assert!(!spec.node_id.is_empty());
        assert!(!spec.device_name.is_empty());
    }
}
