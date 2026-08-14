use std::ffi::CStr;

use pcsc::{Card, Context, Protocols, Scope, MAX_ATR_SIZE};

use crate::nfc::{errors::NfcError, types::TarjetaLeida};

const APDU_GET_UID: [u8; 5] = [0xFF, 0xCA, 0x00, 0x00, 0x00];

pub fn leer_uid(card: &Card) -> Result<Vec<u8>, NfcError> {
    let mut buf = [0u8; 264];
    let resp = card.transmit(&APDU_GET_UID, &mut buf)?;

    if resp.len() < 2 {
        return Err(NfcError::Lectura("Respuesta truncada del lector".into()));
    }
    let (datos, sw) = resp.split_at(resp.len() - 2);

    if sw != [0x90, 0x00] {
        return Err(NfcError::Lectura(format!(
            "La tarjeta respondio SW={:02X}{:02X}",
            sw[0], sw[1]
        )));
    }

    Ok(datos.to_vec())
}

pub fn leer_tarjeta(ctx: &Context, lector: &CStr) -> Result<TarjetaLeida, NfcError> {
    let card = ctx.connect(lector, pcsc::ShareMode::Shared, Protocols::ANY)?;

    let mut nombres = [0u8; 256];
    let mut atr_buf = [0u8; MAX_ATR_SIZE];
    let atr = card.status2(&mut nombres, &mut atr_buf)?.atr().to_vec();

    let uid = leer_uid(&card)?;

    Ok(TarjetaLeida::desde_lector(
        &uid,
        &atr,
        lector.to_string_lossy(),
    ))
}

pub fn listar_lectores() -> Result<Vec<String>, NfcError> {
    let ctx = Context::establish(Scope::User)?;
    let mut buf = [0u8; 2048];

    Ok(ctx
        .list_readers(&mut buf)?
        .map(|n| n.to_string_lossy().into_owned())
        .collect())
}

pub fn leer_primera_disponible() -> Result<TarjetaLeida, NfcError> {
    let ctx = Context::establish(Scope::User)?;
    let mut buf = [0u8; 2048];

    let lector = ctx
        .list_readers(&mut buf)?
        .next()
        .ok_or(NfcError::SinLector)?;
    leer_tarjeta(&ctx, lector)
}
