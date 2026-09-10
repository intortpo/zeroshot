use std::process::Command;

#[tauri::command]
pub async fn select_folder() -> Result<Option<String>, String> {
    #[cfg(target_os = "linux")]
    {
        if let Ok(output) = Command::new("zenity")
            .arg("--file-selection")
            .arg("--directory")
            .arg("--title=Select Workspace Root Directory")
            .output()
        {
            if output.status.success() {
                let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if !path.is_empty() {
                    return Ok(Some(path));
                }
            }
        }
    }
    Ok(None)
}
