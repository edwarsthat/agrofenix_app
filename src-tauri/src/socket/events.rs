use tauri::{AppHandle, Emitter};


pub trait SocketEvents: Send + Sync + 'static {
    fn on_message(&self, text: String);
    fn on_error(&self, err: String);
    fn on_closed(&self);
}

impl SocketEvents for AppHandle {
    fn on_message(&self, text: String) { let _ = self.emit("socket://message", text); }
    fn on_error(&self, err: String)    { let _ = self.emit("socket://error", err); }
    fn on_closed(&self)                { let _ = self.emit("socket://closed", ()); }
}