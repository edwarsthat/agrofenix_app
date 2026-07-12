use serde::{ser::SerializeStruct, Serialize};

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
    InvalidHeader(#[from] tokio_tungstenite::tungstenite::http::header::InvalidHeaderValue),

    #[error("El pauload debe ser un objeto JSON")]
    InvalidPayload,

    #[error("Respuesta invalida del servidor: {0}")]
    InvalidResponse(#[from] serde_json::Error),

    #[error("El servidor no respondio a tiempo")]
    TimeOut,
}

impl Serialize for SocketError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let kind = match self {
            SocketError::EnvVar(_) => "EnvVar",
            SocketError::Connection(_) => "Connection",
            SocketError::NotConnected => "NotConnected",
            SocketError::SendFailed => "SendFailed",
            SocketError::InvalidHeader(_) => "InvalidHeader",
            SocketError::InvalidPayload => "InvalidPayload",
            SocketError::InvalidResponse(_) => "InvalidResponse",
            SocketError::TimeOut => "TimeOut",
        };

        let mut s = serializer.serialize_struct("SocketErro", 2)?;
        s.serialize_field("kind", kind)?;
        s.serialize_field("message", &self.to_string())?;
        s.end()
    }
}
