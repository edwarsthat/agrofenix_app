use std::{ffi::CString, time::Duration};

use pcsc::{Context, ReaderState, Scope, State, PNP_NOTIFICATION};
use tauri::{App, AppHandle};

use crate::{
    nfc::{errors::NfcError, reader::leer_tarjeta},
    socket::events::NfcEvents,
};

const REINTENTO: Duration = Duration::from_secs(3);

pub fn iniciar_vigilante(app: AppHandle) {
    std::thread::spawn(move || loop {
        if let Err(e) = ciclo(&app) {
            eprintln!("[nfc] {e} — reintentando en {}s", REINTENTO.as_secs());
            app.on_nfc_error(e.to_string());
            std::thread::sleep(REINTENTO);
        }
    });
}

fn ciclo(app: &AppHandle) -> Result<(), NfcError> {
    let ctx = Context::establish(Scope::User)?;
    let mut buf = [0u8; 2048];

    let mut estados = vec![ReaderState::new(PNP_NOTIFICATION(), State::UNAWARE)];

    loop {
        estados.retain(|st| !st.event_state().intersects(State::UNKNOWN | State::IGNORE));

        let nombres: Vec<CString> = ctx.list_readers(&mut buf)?.map(|n| n.to_owned()).collect();
        for nombre in nombres {
            if !estados.iter().any(|st| st.name() == nombre.as_c_str()) {
                app.on_lector(nombre.to_string_lossy().into_owned());
                estados.push(ReaderState::new(nombre.as_c_str(), State::UNAWARE));
            }
        }

        for st in &mut estados {
            st.sync_current_state();
        }
        ctx.get_status_change(None, &mut estados)?;

        for st in &estados {
            if st.name() == PNP_NOTIFICATION() {
                continue;
            }

            let antes = st.current_state().contains(State::PRESENT);
            let ahora = st.event_state().contains(State::PRESENT);

            if ahora && !antes {
                match leer_tarjeta(&ctx, &st.name()) {
                    Ok(tarjeta) if tarjeta.uid_valido() => app.on_tag(tarjeta),
                    Ok(t) => app.on_nfc_error(format!("UID de longitud invalida {}", t.uid)),
                    Err(e) => app.on_nfc_error(e.to_string()),
                }
            }
        }
    }
}
