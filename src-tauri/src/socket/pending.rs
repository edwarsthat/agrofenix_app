use std::collections::HashMap;

use tokio::sync::{Mutex, oneshot};

pub struct PendingRequest {
    inner: Mutex<HashMap<String, oneshot::Sender<String>>>,
}

impl PendingRequest {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(HashMap::new()),
        }
    }

    pub async fn register(&self, id: String) -> oneshot::Receiver<String> {
        let (tx, rx) = oneshot::channel();
        self.inner.lock().await.insert(id, tx);
        rx
    }

    pub async fn resolve(&self, id: &str, payload: String) -> bool {
        match self.inner.lock().await.remove(id) {
            Some(sender) => sender.send(payload).is_ok(),
            None => false,
        }
    }

    pub async fn cancel(&self, id: &str) {
        self.inner.lock().await.remove(id);
    }

    pub async fn clear(&self) {
        self.inner.lock().await.clear();
    }
}
