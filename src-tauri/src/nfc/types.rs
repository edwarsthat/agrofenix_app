use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OrigenLectura {
    Lector,
    Telefono,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TarjetaLeida {
    pub uid: String,
    pub origen: OrigenLectura,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub atr: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub lector: Option<String>,
}

impl TarjetaLeida {
    pub fn desde_lector(uid: &[u8], atr: &[u8], lector: impl Into<String>) -> Self {
        Self {
            uid: uid_a_hex(uid),
            origen: OrigenLectura::Lector,
            atr: (!atr.is_empty()).then(|| uid_a_hex(atr)),
            lector: Some(lector.into()),
        }
    }

    pub fn desde_telefono(uid: &[u8]) -> Self {
        Self {
            uid: uid_a_hex(uid),
            origen: OrigenLectura::Telefono,
            atr: None,
            lector: None,
        }
    }

    pub fn uid_valido(&self) -> bool {
        matches!(self.uid.len(), 8 | 14 | 20)
    }
}

pub fn uid_a_hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02X}")).collect()
}
