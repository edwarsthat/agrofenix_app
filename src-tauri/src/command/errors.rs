
use serde::{Serialize};

#[derive(Debug, thiserror::Error)]
pub enum SocketError {
    #[error("Falta la variable de entorno: {0}")]
    EnvVar(#[from] std::env::VarError),
    
    #[error("No se pudo conectar al socket: {0}")]
    Connection(#[from] tokio_tungstenite::tungstenite::Error),

    #[error("El socket no esta conectado")]
    NotConnected,

    #[error("Error al enviar el mensaje")]
    SendFailed,

    #[error("Header invalido: {0}")]
    InvalidHeader(#[from] tokio_tungstenite::tungstenite::http::header::InvalidHeaderValue)

}

impl Serialize for SocketError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer
    {
        serializer.serialize_str(&self.to_string())
    }
}