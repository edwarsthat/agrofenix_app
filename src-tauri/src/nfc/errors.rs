use serde::{ser::SerializeStruct, Serialize};


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


impl Serialize for NfcError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let kind = match self {
            NfcError::ServicioInactivo => "ServicioInactivo",
            NfcError::SinLector => "SinLector",
            NfcError::SinTarjeta => "SinTarjeta",
            NfcError::Lectura(_) => "Lectura",
            NfcError::NoSoportado => "NoSoportado",
        };

        let mut s = serializer.serialize_struct("NfcError", 2)?;
        s.serialize_field("kind", kind)?;
        s.serialize_field("message", &self.to_string())?;
        s.end()
    }
}
