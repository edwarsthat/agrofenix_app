use std::{sync::Arc, time::Duration};

use futures_util::{SinkExt, Stream, StreamExt};
use tokio::{
    sync::mpsc,
    time::{interval, MissedTickBehavior},
};
use tokio_tungstenite::tungstenite::Message;

use crate::socket::{events::SocketEvents, pending::PendingRequest, protocol::extract_message_id};

/// Cada cuanto probamos que el otro lado sigue vivo.
const HEARTBEAT: Duration = Duration::from_secs(20);

#[derive(Debug, PartialEq, Eq)]
pub enum DisconnectReason {
    LocalShutdown,
    ConnectionLost,
}

pub async fn run_socket_loop<W, R, E>(
    write: W,
    read: R,
    rx: mpsc::UnboundedReceiver<String>,
    pending: Arc<PendingRequest>,
    events: &E,
) -> DisconnectReason
where
    W: SinkExt<Message, Error = tokio_tungstenite::tungstenite::Error> + Unpin,
    R: Stream<Item = Result<Message, tokio_tungstenite::tungstenite::Error>> + Unpin,
    E: SocketEvents,
{
    // El intervalo se inyecta para que los tests no esperen 20s de verdad.
    run_socket_loop_with(write, read, rx, pending, events, HEARTBEAT).await
}

pub async fn run_socket_loop_with<W, R, E>(
    mut write: W,
    mut read: R,
    mut rx: mpsc::UnboundedReceiver<String>,
    pending: Arc<PendingRequest>,
    events: &E,
    heartbeat: Duration,
) -> DisconnectReason
where
    W: SinkExt<Message, Error = tokio_tungstenite::tungstenite::Error> + Unpin,
    R: Stream<Item = Result<Message, tokio_tungstenite::tungstenite::Error>> + Unpin,
    E: SocketEvents,
{
    let mut latido = interval(heartbeat);
    // El primer tick de `interval` es inmediato: lo gastamos para no pinguear al conectar.
    latido.tick().await;
    // Si el portátil se suspende, no queremos una ráfaga de pings atrasados al despertar.
    latido.set_missed_tick_behavior(MissedTickBehavior::Delay);

    // true = mandamos un Ping y seguimos sin ver nada de vuelta.
    let mut esperando_pong = false;

    loop {
        tokio::select! {
            // ── Mensajes salientes (desde el frontend vía el canal) ──
            maybe_msg = rx.recv() => {
                match maybe_msg {
                    Some(msg) => {
                        if let Err(e) = write.send(Message::Text(msg)).await {
                            events.on_error(e.to_string());
                            return DisconnectReason::ConnectionLost;
                        }
                    }
                    // Nadie más tiene el sender: fue `disconect_socket`, no una caída.
                    None => return DisconnectReason::LocalShutdown,
                }
            }

            // ── Latido: prueba activamente que el otro lado sigue vivo ──
            _ = latido.tick() => {
                if esperando_pong {
                    // El Ping anterior nunca volvió: conexión medio-muerta.
                    events.on_error("sin respuesta al ping: conexión caída".to_string());
                    return DisconnectReason::ConnectionLost;
                }
                if write.send(Message::Ping(Vec::new())).await.is_err() {
                    return DisconnectReason::ConnectionLost;
                }
                esperando_pong = true;
            }

            // ── Mensajes entrantes (desde el servidor) ──
            maybe_frame = read.next() => {
                // Cualquier frame prueba que la conexión vive, no solo el Pong.
                esperando_pong = false;

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
                            return DisconnectReason::ConnectionLost;
                        }
                    }
                    Some(Ok(Message::Close(_))) => return DisconnectReason::ConnectionLost,
                    Some(Ok(_)) => {} // Pong incluido: la bandera ya se limpió arriba
                    Some(Err(e)) => {
                        events.on_error(e.to_string());
                        return DisconnectReason::ConnectionLost;
                    }
                    None => return DisconnectReason::ConnectionLost,
                }
            }
        }
    }
}
