use edm_tactical_engine::{TacticalEngineState, TacticalEvaluationRequest, WeightUpdateRequest};
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let state = Arc::new(TacticalEngineState::default());
    let addr = "127.0.0.1:8088";
    let listener = TcpListener::bind(addr).await?;
    println!(
        "[layer-2:rust-tactical] Tactical Engine active on http://{}",
        addr
    );

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

    let mut req_data = Vec::with_capacity(16384);
    req_data.extend_from_slice(&buffer[..bytes_read]);

    // Check if we have complete headers
    let header_end = loop {
        if let Some(idx) = req_data.windows(4).position(|w| w == b"\r\n\r\n") {
            break idx;
        }
        let mut chunk = [0u8; 8192];
        let n = stream.read(&mut chunk).await?;
        if n == 0 {
            break 0;
        }
        req_data.extend_from_slice(&chunk[..n]);
    };

    let (method, path, content_length) = {
        let header_str = String::from_utf8_lossy(&req_data[..header_end]);
        let mut lines = header_str.lines();
        let request_line = lines.next().unwrap_or("");
        let parts: Vec<&str> = request_line.split_whitespace().collect();

        if parts.len() < 2 {
            send_response(
                &mut stream,
                (400, "Bad Request"),
                "text/plain",
                b"Malformed request",
            )
            .await?;
            return Ok(());
        }

        let method = parts[0].to_string();
        let path = parts[1].to_string();

        let mut cl: usize = 0;
        for line in lines {
            if let Some((key, val)) = line.split_once(':') {
                if key.trim().eq_ignore_ascii_case("content-length") {
                    cl = val.trim().parse().unwrap_or(0);
                }
            }
        }
        (method, path, cl)
    };

    let body_start = header_end + 4;
    while req_data.len() < body_start + content_length {
        let mut chunk = [0u8; 8192];
        let n = stream.read(&mut chunk).await?;
        if n == 0 {
            break;
        }
        req_data.extend_from_slice(&chunk[..n]);
    }

    let body = if req_data.len() >= body_start {
        String::from_utf8_lossy(&req_data[body_start..body_start + content_length]).into_owned()
    } else {
        String::new()
    };

    match (method.as_str(), path.as_str()) {
        ("GET", "/health") => {
            let json = serde_json::json!({
                "status": "ok",
                "tier": "Layer 2: Tactical Engine (Rust)",
                "dina_skills_count": 4,
                "version": "0.1.0"
            });
            let payload = serde_json::to_vec(&json)?;
            send_response(&mut stream, (200, "OK"), "application/json", &payload).await?;
        }
        ("POST", "/tactical/evaluate") => {
            match serde_json::from_str::<TacticalEvaluationRequest>(&body) {
                Ok(req) => {
                    let result = state.evaluate_student(&req);
                    let payload = serde_json::to_vec(&result)?;
                    send_response(&mut stream, (200, "OK"), "application/json", &payload).await?;
                }
                Err(err) => {
                    let err_json = serde_json::json!({ "error": "Invalid request body", "details": err.to_string() });
                    let payload = serde_json::to_vec(&err_json)?;
                    send_response(
                        &mut stream,
                        (400, "Bad Request"),
                        "application/json",
                        &payload,
                    )
                    .await?;
                }
            }
        }
        ("POST", "/tactical/evaluate/batch") => {
            match serde_json::from_str::<Vec<TacticalEvaluationRequest>>(&body) {
                Ok(reqs) => {
                    let results = state.evaluate_batch(&reqs);
                    let payload = serde_json::to_vec(&results)?;
                    send_response(&mut stream, (200, "OK"), "application/json", &payload).await?;
                }
                Err(err) => {
                    let err_json = serde_json::json!({ "error": "Invalid batch request body", "details": err.to_string() });
                    let payload = serde_json::to_vec(&err_json)?;
                    send_response(
                        &mut stream,
                        (400, "Bad Request"),
                        "application/json",
                        &payload,
                    )
                    .await?;
                }
            }
        }
        ("POST", "/tactical/weights/update") => {
            match serde_json::from_str::<WeightUpdateRequest>(&body) {
                Ok(req) => {
                    let result = state.update_weights(&req);
                    println!(
                        "[layer-2:rust-tactical] Injected quantum weights! Source: '{}'",
                        result.active_hyperplane.source
                    );
                    let payload = serde_json::to_vec(&result)?;
                    send_response(&mut stream, (200, "OK"), "application/json", &payload).await?;
                }
                Err(err) => {
                    let err_json = serde_json::json!({ "error": "Invalid weight update body", "details": err.to_string() });
                    let payload = serde_json::to_vec(&err_json)?;
                    send_response(
                        &mut stream,
                        (400, "Bad Request"),
                        "application/json",
                        &payload,
                    )
                    .await?;
                }
            }
        }
        _ => {
            send_response(
                &mut stream,
                (404, "Not Found"),
                "text/plain",
                b"Endpoint not found",
            )
            .await?;
        }
    }

    Ok(())
}

async fn send_response(
    stream: &mut TcpStream,
    status: (u16, &str),
    content_type: &str,
    body: &[u8],
) -> Result<(), Box<dyn std::error::Error>> {
    let (status_code, status_text) = status;
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
