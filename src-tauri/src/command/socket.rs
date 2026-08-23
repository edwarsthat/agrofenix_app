use futures_util::StreamExt;
use std::sync::atomic::Ordering;
use std::time::Duration;
use tauri::{AppHandle, State};
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Error as WsError;
use tokio_tungstenite::{connect_async, MaybeTlsStream, WebSocketStream};

use crate::command::errors::SocketError;
use crate::socket::actor::{DisconnectReason, run_socket_loop};
use crate::socket::events::SocketEvents;
use crate::socket::protocol::{build_envelop, build_request, build_ws_url};
use crate::socket::state::SocketHandles;

type WsConn = WebSocketStream<MaybeTlsStream<tokio::net::TcpStream>>;

/// Escalera de espera entre reintentos, en segundos. Al agotarla nos rendimos
/// y ahí sí se cierra la sesión.
const BACKOFF: [u64; 6] = [1, 2, 4, 8, 15, 30];

const REQUEST_TIMEOUT: std::time::Duration = std::time::Duration::from_secs(15);

#[tauri::command]
pub async fn connect_socket(
    app: AppHandle,
    state: State<'_, SocketHandles>,
    token: String,
) -> Result<(), SocketError> {
    let base = std::env::var("VITE_API_URL")
        .ok()
        .or_else(|| option_env!("VITE_API_URL").map(str::to_owned))
        .ok_or(SocketError::EnvVar(std::env::VarError::NotPresent))?;

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
    let (mut write, mut read) = ws_stream.split();

    let (tx, mut rx) = mpsc::unbounded_channel::<String>();
    let handles = (*state).clone();
    let mut my_id = handles.registrer_connection(tx).await;

    tokio::spawn(async move {
        loop {
            // Vive aquí hasta que la conexión muera, sea como sea.
            let motivo = run_socket_loop(write, read, rx, handles.pending.clone(), &app).await;

            // ── Salida 1: el usuario hizo logout. No hay nada que reintentar.
            if motivo == DisconnectReason::LocalShutdown {
                break;
            }

            // ── Salida 2: mientras esta conexión agonizaba entró un login nuevo
            // que ya montó otra. Esta tarea es basura: que se muera callada, sin
            // tocar el estado compartido ni emitir un `closed` que mataría la
            // sesión buena. Por eso `return` y no `break`: nos saltamos la
            // limpieza del final.
            if !handles.is_current(my_id) {
                return;
            }

            // ── Aquí es donde ya NO cerramos la sesión. Reintentamos primero.
            let Some(stream) = reconectar(&base, &token, &app).await else {
                break; // backoff agotado (o token inválido): ahora sí se cae
            };

            // Conexión nueva -> canal nuevo, generación nueva, pendientes viejas
            // descartadas. `reattach` hace las dos últimas cosas de una.
            let (nuevo_tx, nuevo_rx) = mpsc::unbounded_channel::<String>();
            (write, read) = stream.split();
            rx = nuevo_rx;
            my_id = handles.reattach(nuevo_tx).await;

            app.on_reconnected();
            // Y vuelta a empezar: el loop llama otra vez a run_socket_loop,
            // ahora con el write/read/rx de la conexión nueva.
        }

        // Solo se llega aquí por logout o por backoff agotado. En ambos casos,
        // esto es lo que dispara `socket://closed` en el frontend.
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

#[tauri::command]
pub async fn disconect_socket(state: State<'_, SocketHandles>) -> Result<(), SocketError> {
    *state.tx.lock().await = None;
    Ok(())
}

async fn abrir(base: &str, token: &str) -> Result<WsConn, SocketError> {
    let request = build_request(&build_ws_url(base), token)?;
    let (stream, _) = connect_async(request).await?;
    Ok(stream)
}

async fn reconectar(base: &str, token: &str, events: &AppHandle) -> Option<WsConn> {
    for (i, espera) in BACKOFF.iter().enumerate() {
        events.on_reconnecting(i + 1, BACKOFF.len());
        tokio::time::sleep(Duration::from_secs(*espera)).await;

        match abrir(base, token).await {
            Ok(stream) => return Some(stream),
            // Token rechazado: reintentar no lo va a arreglar, corta ya.
            Err(SocketError::Connection(WsError::Http(r))) if r.status() == 401 => {
                eprintln!("[socket] token rechazado al reconectar");
                return None;
            }
            Err(e) => eprintln!("[socket] reintento {} fallido: {e}", i + 1),
        }
    }
    None
}
