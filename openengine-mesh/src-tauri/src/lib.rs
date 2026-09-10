pub mod agy;
pub mod ecc;
pub mod github_delivery;
pub mod google_dwd;
pub mod hardware;
pub mod mesh;

use github_delivery::{submit_delivery_gate, submit_goal};
use google_dwd::{dispatch_workspace_use_case, get_google_dwd_status, load_google_dwd_credentials};
use hardware::detect_hardware;
use mesh::get_mesh_peers;
use ecc::{run_ecc_command, save_ecc_memory_entry, query_ecc_memory_vault, run_ecc_memory_doctor};
use agy::{check_agy_status, get_agy_models, run_agy_prompt, test_provider_connection};

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
            run_ecc_command,
            save_ecc_memory_entry,
            query_ecc_memory_vault,
            run_ecc_memory_doctor,
            check_agy_status,
            get_agy_models,
            run_agy_prompt,
            test_provider_connection,
        ])
        .run(tauri::generate_context!())
        .expect("error while running petri application");
}
