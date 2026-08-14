use tauri::{AppHandle, Emitter};

use crate::nfc::types::TarjetaLeida;

pub trait SocketEvents: Send + Sync + 'static {
    fn on_message(&self, text: String);
    fn on_error(&self, err: String);
    fn on_closed(&self);
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
}

pub trait NfcEvents: Send + Sync + 'static {
    fn on_tag(&self, tarjeta: TarjetaLeida);
    fn on_nfc_error(&self, err: String);
    fn on_lector(&self, nombre: String);
}

impl NfcEvents for AppHandle {
    fn on_tag(&self, tarjeta: TarjetaLeida) {
        let _ = self.emit("nfc://tag", tarjeta);
    }
    fn on_nfc_error(&self, err: String) {
        let _ = self.emit("nfc://error", err);
    }
    fn on_lector(&self, nombre: String) {
        let _ = self.emit("nfc://lector", nombre);
    }
}
