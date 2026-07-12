pub mod command;
pub mod socket;



// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenvy::dotenv().ok();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .manage(socket::state::SocketHandles::new())
        .invoke_handler(tauri::generate_handler![
            greet,
            command::socket::connect_socket,
            command::socket::send_socket_message
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
