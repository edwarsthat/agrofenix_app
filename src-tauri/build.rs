use std::path::Path;

fn main() {
    let env_path = Path::new("../.env");

    if let Ok(iter) = dotenvy::from_path_iter(env_path) {
        for (clave, valor) in iter.flatten() {
            println!("cargo:rustc-env={clave}={valor}")
        }
    }

    println!("cargo:rerun-if-changed=../.env");
    tauri_build::build()
}
