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
    // In production, reads from Tailscale peer table or local discovery cache
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
}
