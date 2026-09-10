pub mod agy;
pub mod devcontainer;
pub mod ecc;
pub mod github_delivery;
pub mod google_dwd;
pub mod hardware;
pub mod mesh;
pub mod petri_server;

use github_delivery::{submit_delivery_gate, submit_goal};
use google_dwd::{dispatch_workspace_use_case, get_google_dwd_status, load_google_dwd_credentials};
use hardware::detect_hardware;
use mesh::get_mesh_peers;
use ecc::{run_ecc_command, save_ecc_memory_entry, query_ecc_memory_vault, run_ecc_memory_doctor};
use agy::{check_agy_status, get_agy_models, run_agy_prompt, test_provider_connection};
use devcontainer::{check_devcontainer_status, start_devcontainer, stop_devcontainer, exec_in_devcontainer, get_devcontainer_logs};
use petri_server::{
    get_petri_server_status, list_petri_containers, manage_petri_container,
    get_petri_container_logs, get_petri_routes, save_petri_route,
    toggle_petri_smartshield, get_petri_market_apps, install_petri_market_app,
};

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
            check_devcontainer_status,
            start_devcontainer,
            stop_devcontainer,
            exec_in_devcontainer,
            get_devcontainer_logs,
            get_petri_server_status,
            list_petri_containers,
            manage_petri_container,
            get_petri_container_logs,
            get_petri_routes,
            save_petri_route,
            toggle_petri_smartshield,
            get_petri_market_apps,
            install_petri_market_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running petri application");
}
