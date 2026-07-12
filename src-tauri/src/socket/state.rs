use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};

use crate::socket::events::SocketEvents;
use crate::socket::pending::PendingRequest;


#[derive(Clone)]
pub struct SocketHandles {
    pub tx: Arc<Mutex<Option<mpsc::UnboundedSender<String>>>>,
    pub current_id: Arc<AtomicU64>,
    pub pending: Arc<PendingRequest>,
    pub session_token: Arc<Mutex<Option<String>>>,
    pub next_request_id: Arc<AtomicU64>,
}

impl SocketHandles {

    pub fn new() -> Self {
        Self {
            tx: Arc::new(Mutex::new(None)),
            current_id: Arc::new(AtomicU64::new(0)),
            next_request_id: Arc::new(AtomicU64::new(0)),
            pending: Arc::new(PendingRequest::new()),
            session_token: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn registrer_connection(&self, tx: mpsc::UnboundedSender<String>) -> u64 {
        let my_id = self.current_id.fetch_add(1, Ordering::SeqCst) + 1;
        *self.tx.lock().await = Some(tx);
        my_id
    }

    pub async fn disconnect_if_currennt<E: SocketEvents>(&self, my_id: u64, events: &E) {
        if self.current_id.load(Ordering::SeqCst) != my_id {
            return;
        };
        *self.tx.lock().await = None;
        self.pending.clear().await;
        *self.session_token.lock().await = None;
        events.on_closed();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::AtomicUsize;

    #[derive(Default)]
    struct FakeEvents {
        closed: AtomicUsize,
    }

    impl FakeEvents {
        fn closed_count(&self) -> usize {
            self.closed.load(Ordering::SeqCst)
        }
    }

    impl SocketEvents for FakeEvents {
        fn on_message(&self, _text: String) {}
        fn on_error(&self, _err: String) {}
        fn on_closed(&self) {
            self.closed.fetch_add(1, Ordering::SeqCst);
        }
    }

    /// Handles de una conexión viva: canal abierto, token guardado y generación `current_id`.
    fn connected_handles(current_id: u64) -> (SocketHandles, mpsc::UnboundedReceiver<String>) {
        let (tx, rx) = mpsc::unbounded_channel();
        let handles = SocketHandles {
            tx: Arc::new(Mutex::new(Some(tx))),
            current_id: Arc::new(AtomicU64::new(current_id)),
            pending: Arc::new(PendingRequest::new()),
            session_token: Arc::new(Mutex::new(Some("my-token".to_string()))),
            next_request_id: Arc::new(AtomicU64::new(0)),
        };
        (handles, rx)
    }

    #[tokio::test]
    async fn clears_tx_and_token_when_id_is_current() {
        let (handles, _rx) = connected_handles(3);
        let events = FakeEvents::default();

        handles.disconnect_if_currennt(3, &events).await;

        assert!(handles.tx.lock().await.is_none());
        assert!(handles.session_token.lock().await.is_none());
    }

    #[tokio::test]
    async fn emits_closed_when_id_is_current() {
        let (handles, _rx) = connected_handles(3);
        let events = FakeEvents::default();

        handles.disconnect_if_currennt(3, &events).await;

        assert_eq!(events.closed_count(), 1);
    }

    #[tokio::test]
    async fn drops_pending_requests_when_id_is_current() {
        let (handles, _rx) = connected_handles(1);
        let events = FakeEvents::default();
        let resp_rx = handles.pending.register("req-1".to_string()).await;

        handles.disconnect_if_currennt(1, &events).await;

        // El sender se soltó al limpiar: quien esperaba la respuesta recibe error, no cuelga.
        assert!(resp_rx.await.is_err());
        assert!(!handles.pending.resolve("req-1", "late".to_string()).await);
    }

    #[tokio::test]
    async fn keeps_state_when_id_is_stale() {
        // La conexión ya fue reemplazada por una nueva (current_id = 2).
        let (handles, _rx) = connected_handles(2);
        let events = FakeEvents::default();
        let resp_rx = handles.pending.register("req-1".to_string()).await;

        handles.disconnect_if_currennt(1, &events).await;

        assert!(handles.tx.lock().await.is_some());
        assert!(handles.session_token.lock().await.is_some());
        assert!(handles.pending.resolve("req-1", "payload".to_string()).await);
        assert_eq!(resp_rx.await.unwrap(), "payload");
        assert_eq!(events.closed_count(), 0);
    }

    #[tokio::test]
    async fn stale_disconnect_does_not_close_the_live_channel() {
        let (handles, mut rx) = connected_handles(2);
        let events = FakeEvents::default();

        handles.disconnect_if_currennt(1, &events).await;

        let tx = handles.tx.lock().await.clone().expect("tx sigue disponible");
        tx.send("ping".to_string()).expect("el canal sigue abierto");
        assert_eq!(rx.recv().await, Some("ping".to_string()));
    }

    #[tokio::test]
    async fn is_idempotent_when_called_twice() {
        let (handles, _rx) = connected_handles(1);
        let events = FakeEvents::default();

        handles.disconnect_if_currennt(1, &events).await;
        handles.disconnect_if_currennt(1, &events).await;

        assert!(handles.tx.lock().await.is_none());
        assert!(handles.session_token.lock().await.is_none());
        assert_eq!(events.closed_count(), 2);
    }

    #[tokio::test]
    async fn clones_share_the_same_state() {
        let (handles, _rx) = connected_handles(1);
        let clone = handles.clone();
        let events = FakeEvents::default();

        clone.disconnect_if_currennt(1, &events).await;

        assert!(handles.tx.lock().await.is_none());
        assert!(handles.session_token.lock().await.is_none());
    }
}
