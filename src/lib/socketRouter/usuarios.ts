import z from "zod";
import { usuarioSchema } from "../../types/administracion/usuarios";
import { ServerEvent } from "../socketRouter";
import useUsuarioStore from "../../store/data/administracion/useUsuariosStore";


const usuarioEventPayloadSchema = z.object({ data: usuarioSchema })

const usuarioRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "add": {
            const parsed = usuarioEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] cargos:add payload inválido", parsed.error)
                break
            }
            useUsuarioStore.getState().eventAddUsuario(parsed.data.data)
            break
        }
    }
}

export default usuarioRouter