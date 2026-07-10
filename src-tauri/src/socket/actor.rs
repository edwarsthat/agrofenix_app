use std::sync::Arc;

use futures_util::{SinkExt, Stream, StreamExt};
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;

use crate::socket::{
    events::SocketEvents, 
    pending::PendingRequest, 
    protocol::{extract_message_id}
};



pub async fn run_socket_loop<W, R, E>(
    mut write: W,
    mut read: R,
    mut rx: mpsc::UnboundedReceiver<String>,
    pending: Arc<PendingRequest>,
    events: &E,
) where 
    W: SinkExt<Message, Error = tokio_tungstenite::tungstenite::Error> + Unpin,
    R: Stream<Item = Result<Message, tokio_tungstenite::tungstenite::Error>> + Unpin,
    E: SocketEvents,
{
    loop {
        tokio::select! {
                // ── Mensajes salientes (desde el frontend vía el canal) ──
                maybe_msg = rx.recv() => {
                    match maybe_msg {
                        Some(msg) => {
                            if let Err(e) = write.send(Message::Text(msg)).await {
                                events.on_error(e.to_string());
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
                            let matched_id = extract_message_id(&text);

                            let mut resolved = false;
                            if let Some(id) = matched_id {
                                resolved = pending.resolve(&id, text.clone()).await;
                            }

                            if !resolved {
                                events.on_message(text);
                            }
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
                            events.on_error(e.to_string());
                            break;
                        }
                        None => break,
                    }
                }
        }
    }
}