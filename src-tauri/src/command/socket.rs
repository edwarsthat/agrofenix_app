use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

use tauri::{AppHandle, Emitter, State};
use tokio::sync::{mpsc, Mutex};
use tokio_tungstenite::{
    connect_async,
    tungstenite::{client::IntoClientRequest, Message},
};
use futures_util::{SinkExt, StreamExt};

use crate::command::errors::SocketError;

pub struct SocketState {
    tx: Arc<Mutex<Option<mpsc::UnboundedSender<String>>>>,
    /// Id de la conexión vigente. Cada conexión nueva lo incrementa; la task
    /// vieja usa esto para saber si todavía "es la actual" antes de limpiar.
    current_id: Arc<AtomicU64>,
}

impl SocketState {
    pub fn new() -> Self {
        Self {
            tx: Arc::new(Mutex::new(None)),
            current_id: Arc::new(AtomicU64::new(0)),
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
    let ws_base = base
        .replace("http://", "ws://")
        .replace("https://", "wss://");
    let url = format!("{ws_base}/ws");
    println!("[socket] intentando conectar a {url}");

    // Auth por header en vez de query string: no se filtra en logs ni proxies.
    let mut request = url.into_client_request()?;
    request.headers_mut().insert(
        "Authorization",
        format!("Bearer {token}").parse()?,
    );

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
    let (mut write, mut read) = ws_stream.split();

    let (tx, mut rx) = mpsc::unbounded_channel::<String>();

    let my_id = state.current_id.fetch_add(1, Ordering::SeqCst) + 1;
    *state.tx.lock().await = Some(tx);

    let tx_state = state.tx.clone();
    let id_state = state.current_id.clone();

    tokio::spawn(async move {
        loop {
            tokio::select! {
                // ── Mensajes salientes (desde el frontend vía el canal) ──
                maybe_msg = rx.recv() => {
                    match maybe_msg {
                        Some(msg) => {
                            if let Err(e) = write.send(Message::Text(msg)).await {
                                let _ = app.emit("socket://error", e.to_string());
                                break;
                            }
                        }
                        None => break,
                    }
                }

                // ── Mensajes entrantes (desde el servidor) ──
                maybe_frame = read.next() => {
                    match maybe_frame {
                        Some(Ok(Message::Text(text))) => {
                            let _ = app.emit("socket://message", text);
                        }
                        // Stream split -> el pong NO sale solo, lo respondemos aquí.
                        Some(Ok(Message::Ping(payload))) => {
                            if write.send(Message::Pong(payload)).await.is_err() {
                                break;
                            }
                        }
                        Some(Ok(Message::Close(_))) => break,
                        Some(Ok(_)) => {}
                        Some(Err(e)) => {
                            let _ = app.emit("socket://error", e.to_string());
                            break;
                        }
                        None => break,
                    }
                }
            }
        }

        // Limpieza solo si seguimos siendo la conexión vigente. Si otra conexión
        // ya nos reemplazó (current_id != my_id), no tocamos su estado ni
        // emitimos un "closed" espurio que confunda al frontend.
        if id_state.load(Ordering::SeqCst) == my_id {
            *tx_state.lock().await = None;
            let _ = app.emit("socket://closed", ());
        }
    });

    Ok(())
}