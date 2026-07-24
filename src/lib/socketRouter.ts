import { listen } from "@tauri-apps/api/event";
import cargoRouter from "./socketRouter/cargos";
import usuarioRouter from "./socketRouter/usuarios";

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
        }
    })

}