use edm_tactical_engine::{
    TacticalEngineState, TacticalEvaluationRequest, WeightUpdateRequest,
};
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let state = Arc::new(TacticalEngineState::default());
    let addr = "127.0.0.1:8088";
    let listener = TcpListener::bind(addr).await?;
    println!("[layer-2:rust-tactical] Tactical Engine active on http://{}", addr);

    loop {
        let (stream, _) = listener.accept().await?;
        let state_clone = Arc::clone(&state);

        tokio::spawn(async move {
            if let Err(e) = handle_connection(stream, state_clone).await {
                eprintln!("[layer-2:rust-tactical] Connection error: {}", e);
            }
        });
    }
}

async fn handle_connection(
    mut stream: TcpStream,
    state: Arc<TacticalEngineState>,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut buffer = [0u8; 16384];
    let bytes_read = stream.read(&mut buffer).await?;
    if bytes_read == 0 {
        return Ok(());
    }

    let request_str = String::from_utf8_lossy(&buffer[..bytes_read]);
    let mut lines = request_str.lines();
    let request_line = lines.next().unwrap_or("");
    let parts: Vec<&str> = request_line.split_whitespace().collect();

    if parts.len() < 2 {
        send_response(&mut stream, 400, "Bad Request", "text/plain", b"Malformed request").await?;
        return Ok(());
    }

    let method = parts[0];
    let path = parts[1];

    // Find JSON body after double CRLF
    let body = if let Some(idx) = request_str.find("\r\n\r\n") {
        &request_str[idx + 4..]
    } else {
        ""
    };

    match (method, path) {
        ("GET", "/health") => {
            let json = serde_json::json!({
                "status": "ok",
                "tier": "Layer 2: Tactical Engine (Rust)",
                "dina_skills_count": 4,
                "version": "0.1.0"
            });
            let payload = serde_json::to_vec(&json)?;
            send_response(&mut stream, 200, "OK", "application/json", &payload).await?;
        }
        ("POST", "/tactical/evaluate") => {
            match serde_json::from_str::<TacticalEvaluationRequest>(body) {
                Ok(req) => {
                    let result = state.evaluate_student(&req);
                    let payload = serde_json::to_vec(&result)?;
                    send_response(&mut stream, 200, "OK", "application/json", &payload).await?;
                }
                Err(err) => {
                    let err_json = serde_json::json!({ "error": "Invalid request body", "details": err.to_string() });
                    let payload = serde_json::to_vec(&err_json)?;
                    send_response(&mut stream, 400, "Bad Request", "application/json", &payload).await?;
                }
            }
        }
        ("POST", "/tactical/weights/update") => {
            match serde_json::from_str::<WeightUpdateRequest>(body) {
                Ok(req) => {
                    let result = state.update_weights(&req);
                    println!(
                        "[layer-2:rust-tactical] Injected quantum weights! Source: '{}'",
                        result.active_hyperplane.source
                    );
                    let payload = serde_json::to_vec(&result)?;
                    send_response(&mut stream, 200, "OK", "application/json", &payload).await?;
                }
                Err(err) => {
                    let err_json = serde_json::json!({ "error": "Invalid weight update body", "details": err.to_string() });
                    let payload = serde_json::to_vec(&err_json)?;
                    send_response(&mut stream, 400, "Bad Request", "application/json", &payload).await?;
                }
            }
        }
        _ => {
            send_response(&mut stream, 404, "Not Found", "text/plain", b"Endpoint not found").await?;
        }
    }

    Ok(())
}

async fn send_response(
    stream: &mut TcpStream,
    status_code: u16,
    status_text: &str,
    content_type: &str,
    body: &[u8],
) -> Result<(), Box<dyn std::error::Error>> {
    let response = format!(
        "HTTP/1.1 {} {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nConnection: close\r\n\r\n",
        status_code,
        status_text,
        content_type,
        body.len()
    );

    stream.write_all(response.as_bytes()).await?;
    stream.write_all(body).await?;
    stream.flush().await?;
    Ok(())
}
