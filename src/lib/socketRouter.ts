import { listen } from "@tauri-apps/api/event";
import cargoRouter from "./socketRouter/cargos";
import usuarioRouter from "./socketRouter/usuarios";
import cargoPersonalRouter from "./socketRouter/cargoPersonal";
import personalRouter from "./socketRouter/personal";
import sesionRouter from "./socketRouter/sesiones";

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
        }
    })

}