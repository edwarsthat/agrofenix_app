import { listen } from "@tauri-apps/api/event";
import useCargoStore from "../store/data/administracion/useCargoStore";

export function initSocketRouter() {
    listen("socket://message", (e) => {
        const msg = JSON.parse(e.payload as string)
        console.log("router", msg)

        switch (msg.event) {
            case "cargos":
                switch (msg.action){
                    case "add":
                        useCargoStore.getState().eventAddCargo(msg.data.data)
                        break
                    case "update":
                        useCargoStore.getState().eventUpdateCargo(msg.data.data)
                        break
                    case "delete":
                        useCargoStore.getState().eventDeleteCargo(msg.data.cargo_id)
                        break
                }
        }
    })

}