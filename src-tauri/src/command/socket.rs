use std::sync::atomic::Ordering;
use futures_util::StreamExt;
use tauri::{AppHandle, State};
use tokio::sync::mpsc;
use tokio_tungstenite::connect_async;

use crate::command::errors::SocketError;
use crate::socket::actor::run_socket_loop;
use crate::socket::state::SocketHandles;
use crate::socket::{
    protocol::{build_envelop, build_request, build_ws_url},
};

const REQUEST_TIMEOUT: std::time::Duration = std::time::Duration::from_secs(15);


#[tauri::command]
pub async fn connect_socket(
    app: AppHandle,
    state: State<'_, SocketHandles>,
    token: String,
) -> Result<(), SocketError> {
    let base = std::env::var("VITE_API_URL")?;
    let url = build_ws_url(&base);
    println!("[socket] intentando conectar a {url}");

    // Auth por header en vez de query string: no se filtra en logs ni proxies.
    let request = build_request(&url, &token)?;

    *state.session_token.lock().await = Some(token.clone());
    let (ws_stream, _) = match connect_async(request).await {
        Ok(stream) => {
            println!("[socket] conexión establecida");
            stream
        }
        Err(e) => {
            eprintln!("[socket] fallo al conectar: {e}");
            return Err(e.into());
        }
    };
    let (write, read) = ws_stream.split();

    let (tx, rx) = mpsc::unbounded_channel::<String>();
    let handles = (*state).clone();
    let my_id = handles.registrer_connection(tx).await;

    let pending_state = state.pending.clone();

    tokio::spawn(async move {
        run_socket_loop(write, read, rx, pending_state, &app).await;
        handles.disconnect_if_currennt(my_id, &app).await;
    });

    Ok(())
}

#[tauri::command]
pub async fn send_socket_message(
    state: State<'_, SocketHandles>,
    info: serde_json::Value,
) -> Result<serde_json::Value, SocketError> {
    let token = state
        .session_token
        .lock()
        .await
        .clone()
        .ok_or(SocketError::NotConnected)?;
    let id = state
        .next_request_id
        .fetch_add(1, Ordering::SeqCst)
        .to_string();

    let envelope = build_envelop(&id, &token, &info);

    let resp_rx = state.pending.register(id.clone()).await;
    let tx_guard = state.tx.lock().await;
    let tx = tx_guard.as_ref().ok_or(SocketError::NotConnected)?;

    if tx.send(envelope.to_string()).is_err() {
        state.pending.cancel(&id).await;
        return Err(SocketError::SendFailed);
    }
    drop(tx_guard);

    match tokio::time::timeout(REQUEST_TIMEOUT, resp_rx).await {
        Ok(Ok(text)) => serde_json::from_str(&text).map_err(SocketError::from),
        Ok(Err(_)) => Err(SocketError::SendFailed),
        Err(_) => {
            state.pending.cancel(&id).await;
            Err(SocketError::TimeOut)
        }
    }
}
