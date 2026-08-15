use tauri::{AppHandle, Emitter};
use crate::nfc::types::TarjetaLeida;


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
