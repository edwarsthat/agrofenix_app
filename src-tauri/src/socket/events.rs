use tauri::{AppHandle, Emitter};

pub trait SocketEvents: Send + Sync + 'static {
    fn on_message(&self, text: String);
    fn on_error(&self, err: String);
    fn on_closed(&self);
    fn on_reconnecting(&self, intento: usize, total: usize);
    fn on_reconnected(&self);
}

impl SocketEvents for AppHandle {
    fn on_message(&self, text: String) {
        let _ = self.emit("socket://message", text);
    }
    fn on_error(&self, err: String) {
        let _ = self.emit("socket://error", err);
    }
    fn on_closed(&self) {
        let _ = self.emit("socket://closed", ());
    }
    fn on_reconnecting(&self, intento: usize, total: usize) {
        let _ = self.emit(
            "socket://reconnecting",
            serde_json::json!({
                "intento": intento, "total": total
            }),
        );
    }
    fn on_reconnected(&self) {
        let _ = self.emit("socket://reconnected", ());
    }
}
