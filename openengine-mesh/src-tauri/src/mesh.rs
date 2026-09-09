use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use crate::hardware::NodeSpec;

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct MeshHeartbeat {
    pub node_id: String,
    pub device_name: String,
    pub role: String,
    pub has_rtx: bool,
    pub vram_free_mb: Option<u64>,
    pub memory_free_mb: Option<u64>,
    pub active_jobs: u32,
    pub timestamp: u64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TaskLoad {
    Light,
    Heavy,
}

#[derive(Clone, Default)]
pub struct MeshRouter {
    peers: Arc<Mutex<HashMap<String, NodeSpec>>>,
}

impl MeshRouter {
    pub fn new() -> Self {
        Self {
            peers: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn record_heartbeat(&self, beat: MeshHeartbeat) {
        let mut guard = self.peers.lock().unwrap();
        guard.insert(
            beat.node_id.clone(),
            NodeSpec {
                node_id: beat.node_id,
                role: beat.role,
                device_name: beat.device_name,
                has_rtx: beat.has_rtx,
                vram_free_mb: beat.vram_free_mb,
                memory_free_mb: beat.memory_free_mb,
                active_jobs: beat.active_jobs,
            },
        );
    }

    pub fn list_peers(&self) -> Vec<NodeSpec> {
        let guard = self.peers.lock().unwrap();
        guard.values().cloned().collect()
    }

    /// Selects the optimal node for a task based on load characteristics.
    /// Heavy tasks route to the peer with RTX and greatest free VRAM.
    /// Light tasks route to the least loaded client or local node.
    pub fn route_task(&self, load: TaskLoad, local_spec: &NodeSpec) -> NodeSpec {
        let guard = self.peers.lock().unwrap();
        let peers: Vec<&NodeSpec> = guard.values().collect();

        match load {
            TaskLoad::Heavy => {
                // Find RTX host with highest free VRAM
                if let Some(best_rtx) = peers
                    .iter()
                    .filter(|p| p.has_rtx)
                    .max_by_key(|p| p.vram_free_mb.unwrap_or(0))
                {
                    if !local_spec.has_rtx
                        || local_spec.vram_free_mb.unwrap_or(0) < best_rtx.vram_free_mb.unwrap_or(0)
                    {
                        return (*best_rtx).clone();
                    }
                }
                local_spec.clone()
            }
            TaskLoad::Light => {
                // Prefer local unless local is overloaded
                if local_spec.active_jobs > 5 {
                    if let Some(idle_peer) = peers.iter().min_by_key(|p| p.active_jobs) {
                        return (*idle_peer).clone();
                    }
                }
                local_spec.clone()
            }
        }
    }
}

#[tauri::command]
pub fn get_mesh_peers() -> Vec<NodeSpec> {
    if let Ok(output) = std::process::Command::new("tailscale")
        .args(["status", "--json"])
        .output()
    {
        if output.status.success() {
            let json_str = String::from_utf8_lossy(&output.stdout);
            let peers = parse_tailscale_status(&json_str);
            if !peers.is_empty() {
                return peers;
            }
        }
    }

    // Default simulation peers if Tailscale has no active peer nodes
    vec![
        NodeSpec {
            node_id: "omarchy-rtx-host".to_string(),
            role: "rtx_host".to_string(),
            device_name: "RTX 4090 Workstation".to_string(),
            has_rtx: true,
            vram_free_mb: Some(22400),
            memory_free_mb: Some(61440),
            active_jobs: 1,
        },
        NodeSpec {
            node_id: "android-client".to_string(),
            role: "thin_client".to_string(),
            device_name: "Android Mobile Client".to_string(),
            has_rtx: false,
            vram_free_mb: None,
            memory_free_mb: None,
            active_jobs: 0,
        },
    ]
}

pub fn parse_tailscale_status(json_str: &str) -> Vec<NodeSpec> {
    let Ok(val) = serde_json::from_str::<serde_json::Value>(json_str) else {
        return Vec::new();
    };

    let mut result = Vec::new();

    if let Some(peer_map) = val.get("Peer").and_then(|p| p.as_object()) {
        for (_k, peer) in peer_map {
            // Skip non-active exit nodes
            if let Some(tags) = peer.get("Tags").and_then(|t| t.as_array()) {
                if tags.iter().any(|tag| tag.as_str().unwrap_or("").contains("exit-node")) {
                    continue;
                }
            }

            let host_name = peer
                .get("HostName")
                .and_then(|h| h.as_str())
                .unwrap_or("mesh-peer");
            let os = peer
                .get("OS")
                .and_then(|o| o.as_str())
                .unwrap_or("unknown");
            let online = peer
                .get("Online")
                .and_then(|o| o.as_bool())
                .unwrap_or(false);

            if online {
                let has_rtx = host_name.to_lowercase().contains("rtx") || host_name.to_lowercase().contains("gpu");
                let role = if has_rtx { "rtx_host" } else { "thin_client" };

                result.push(NodeSpec {
                    node_id: format!("node-{}", host_name),
                    role: role.to_string(),
                    device_name: format!("{} ({})", host_name, os),
                    has_rtx,
                    vram_free_mb: if has_rtx { Some(24576) } else { None },
                    memory_free_mb: None,
                    active_jobs: 0,
                });
            }
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_heartbeat_and_routing() {
        let router = MeshRouter::new();
        let local_thin = NodeSpec {
            node_id: "local-phone".to_string(),
            role: "thin_client".to_string(),
            device_name: "Pixel 9".to_string(),
            has_rtx: false,
            vram_free_mb: None,
            memory_free_mb: None,
            active_jobs: 0,
        };

        router.record_heartbeat(MeshHeartbeat {
            node_id: "rtx-omarchy".to_string(),
            device_name: "RTX 4090 Workstation".to_string(),
            role: "rtx_host".to_string(),
            has_rtx: true,
            vram_free_mb: Some(24000),
            memory_free_mb: Some(64000),
            active_jobs: 0,
            timestamp: 1000,
        });

        // Heavy task should route to RTX host
        let target_heavy = router.route_task(TaskLoad::Heavy, &local_thin);
        assert_eq!(target_heavy.node_id, "rtx-omarchy");
        assert!(target_heavy.has_rtx);

        // Light task stays on local thin client
        let target_light = router.route_task(TaskLoad::Light, &local_thin);
        assert_eq!(target_light.node_id, "local-phone");
    }

    #[test]
    fn test_parse_tailscale_status() {
        let json = r#"{
            "Peer": {
                "node1": {
                    "HostName": "omarchy-rtx",
                    "OS": "linux",
                    "Online": true,
                    "Tags": []
                },
                "node2": {
                    "HostName": "exit-mullvad",
                    "OS": "linux",
                    "Online": true,
                    "Tags": ["tag:mullvad-exit-node"]
                }
            }
        }"#;
        let peers = parse_tailscale_status(json);
        assert_eq!(peers.len(), 1);
        assert_eq!(peers[0].node_id, "node-omarchy-rtx");
        assert!(peers[0].has_rtx);
        assert_eq!(peers[0].role, "rtx_host");
    }
}
