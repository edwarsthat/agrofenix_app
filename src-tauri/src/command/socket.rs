use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

use futures_util::StreamExt;
use tauri::{AppHandle, Emitter, State};
use tokio::sync::{mpsc, Mutex};
use tokio_tungstenite::connect_async;

use crate::command::errors::SocketError;
use crate::socket::actor::run_socket_loop;
use crate::socket::{
    protocol::{build_envelop, build_request, build_ws_url},
    pending::PendingRequest,
};

const REQUEST_TIMEOUT: std::time::Duration = std::time::Duration::from_secs(15);


pub struct SocketState {
    tx: Arc<Mutex<Option<mpsc::UnboundedSender<String>>>>,
    current_id: Arc<AtomicU64>,
    next_request_id: Arc<AtomicU64>,
    pending: Arc<PendingRequest>,
    session_token: Arc<Mutex<Option<String>>>,
}

impl SocketState {
    pub fn new() -> Self {
        Self {
            tx: Arc::new(Mutex::new(None)),
            current_id: Arc::new(AtomicU64::new(0)),
            next_request_id: Arc::new(AtomicU64::new(0)),
            pending: Arc::new(PendingRequest::new()),
            session_token: Arc::new(Mutex::new(None)),
        }
    }
}

#[tauri::command]
pub async fn connect_socket(
    app: AppHandle,
    state: State<'_, SocketState>,
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
    let my_id = state.current_id.fetch_add(1, Ordering::SeqCst) + 1;
    *state.tx.lock().await = Some(tx);

    let tx_state = state.tx.clone();
    let id_state = state.current_id.clone();
    let pending_state = state.pending.clone();
    let token_state = state.session_token.clone();

    tokio::spawn(async move {
        run_socket_loop(write, read, rx, pending_state.clone(), &app).await;
        // Limpieza solo si seguimos siendo la conexión vigente. Si otra conexión
        // ya nos reemplazó (current_id != my_id), no tocamos su estado ni
        // emitimos un "closed" espurio que confunda al frontend.
        if id_state.load(Ordering::SeqCst) == my_id {
            *tx_state.lock().await = None;
            pending_state.clear().await;
            *token_state.lock().await = None;
            let _ = app.emit("socket://closed", ());
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn send_socket_message(
    state: State<'_, SocketState>,
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
