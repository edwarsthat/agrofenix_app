import { listen } from "@tauri-apps/api/event";
import cargoRouter from "./socketRouter/administracion/cargos";
import usuarioRouter from "./socketRouter/administracion/usuarios";
import sesionRouter from "./socketRouter/administracion/sesiones";
import cargoPersonalRouter from "./socketRouter/talento_humano/cargoPersonal";
import personalRouter from "./socketRouter/talento_humano/personal";
import llavesNfcRouter from "./socketRouter/inventarios/llaves_nfc";
import proveedoresRouter from "./socketRouter/proveedores/proveedores";
import prediosRouter from "./socketRouter/proveedores/predios";

export interface ServerEvent {
    event: string
    action: string
    data: unknown
}

export function initSocketRouter() {
    listen("socket://message", (e) => {
        const msg: ServerEvent = JSON.parse(e.payload as string)
        switch (msg.event) {
            case "cargos":
                cargoRouter(msg)
                break;
            case "usuarios":
                usuarioRouter(msg)
                break;
            case "cargos_personal":
                cargoPersonalRouter(msg)
                break;
            case "personal":
                personalRouter(msg)
                break;
            case "sesiones":
                sesionRouter(msg)
                break;
            case "llaves_nfc":
                llavesNfcRouter(msg)
                break;
            case "proveedores":
                proveedoresRouter(msg)
                break;
            case "predios":
                prediosRouter(msg)
                break;
        }
    })

}