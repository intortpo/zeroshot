pub mod github_delivery;
pub mod google_dwd;
pub mod hardware;
pub mod mesh;

use github_delivery::{submit_delivery_gate, submit_goal};
use google_dwd::{dispatch_workspace_use_case, get_google_dwd_status, load_google_dwd_credentials};
use hardware::detect_hardware;
use mesh::get_mesh_peers;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            detect_hardware,
            get_mesh_peers,
            submit_goal,
            submit_delivery_gate,
            load_google_dwd_credentials,
            get_google_dwd_status,
            dispatch_workspace_use_case,
        ])
        .run(tauri::generate_context!())
        .expect("error while running openengine mesh application");
}
