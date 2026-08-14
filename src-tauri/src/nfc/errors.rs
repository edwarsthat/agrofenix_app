#[derive(Debug, thiserror::Error)]
pub enum NfcError {
    #[error("El servicio de tarjetas inteligentes de Windows no esta activo")]
    ServicioInactivo,

    #[error("No se detectó ningún lector NFC conectado")]
    SinLector,

    #[error("No hay ninguna tarjeta sobre el lector")]
    SinTarjeta,

    #[error("Error al leer la tarjeta: {0}")]
    Lectura(String),

    #[error("La lectura NFC por USB no está disponible en esta plataforma")]
    NoSoportado,
}

#[cfg(desktop)]
impl From<pcsc::Error> for NfcError {
    fn from(e: pcsc::Error) -> Self {
        match e {
            pcsc::Error::NoService | pcsc::Error::ServiceStopped => NfcError::ServicioInactivo,
            pcsc::Error::NoReadersAvailable | pcsc::Error::ReaderUnavailable => NfcError::SinLector,
            pcsc::Error::NoSmartcard | pcsc::Error::RemovedCard => NfcError::SinTarjeta,
            otro => NfcError::Lectura(otro.to_string()),
        }
    }
}
