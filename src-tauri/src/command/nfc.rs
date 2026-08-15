use tauri::AppHandle;

use crate::nfc::{errors::NfcError, events::NfcEvents, types::TarjetaLeida};


#[tauri::command]
pub fn listar_lectores() -> Result<Vec<String>, NfcError> {

    #[cfg(desktop)]
    {
        crate::nfc::reader::listar_lectores()
    }
    #[cfg(mobile)]
    {
        Err(NfcError::NoSoportado)
    }
}

/// Lectura puntual bajo demanda. El flujo normal en escritorio va por el
/// watcher, que empuja el evento `nfc://tag` solo.
#[tauri::command]
pub fn leer_tarjeta_ahora() -> Result<TarjetaLeida, NfcError> {
    #[cfg(desktop)]
    {
        crate::nfc::reader::leer_primera_disponible()
    }
    #[cfg(mobile)]
    {
        Err(NfcError::NoSoportado)
    }
}

#[tauri::command]
pub fn registrar_tarjeta_movil(app: AppHandle, uid: Vec<u8>) -> Result<TarjetaLeida, NfcError> {
    let tarjeta = TarjetaLeida::desde_telefono(&uid);

   if !tarjeta.uid_valido() {
        return Err(NfcError::Lectura(format!(
            "UID de longitud inválida: {}",
            tarjeta.uid
        )));
    }

    app.on_tag(tarjeta.clone());
    Ok(tarjeta)
}