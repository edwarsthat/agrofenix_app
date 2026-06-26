use std::sync::Arc;
use tauri::{AppHandle, State};
use tokio::sync::{mpsc, Mutex};

use crate::command::errors::SocketError;

pub struct SocketState {
    tx: Arc<Mutex<Option<mpsc::UnboundedSender<String>>>>,
}

impl SocketState {
    pub fn new() -> Self {
        Self {
            tx: Arc::new(Mutex::new(None)),
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
    let url = format!("{ws_base}/ws?token={token}");
    
    Ok(())
}
