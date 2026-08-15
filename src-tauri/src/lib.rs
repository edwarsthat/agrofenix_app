pub mod command;
pub mod nfc;
pub mod socket;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenvy::dotenv().ok();

    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init());

    #[cfg(mobile)]
    {
        builder = builder.plugin(tauri_plugin_nfc::init());
    }

    builder
        .manage(socket::state::SocketHandles::new())
        .invoke_handler(tauri::generate_handler![
            greet,
            command::socket::connect_socket,
            command::socket::send_socket_message,
            command::socket::disconect_socket,
            command::nfc::listar_lectores,
            command::nfc::leer_tarjeta_ahora,
            command::nfc::registrar_tarjeta_movil,
        ])
        .setup(|app| {
            // En escritorio arrancamos el vigilante del lector USB.
            // En móvil no hay nada que vigilar: el escaneo lo pide el usuario.
            #[cfg(desktop)]
            nfc::watcher::iniciar_vigilante(app.handle().clone());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
