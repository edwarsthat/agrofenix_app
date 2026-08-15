import z from "zod";
import { usuarioDeletePayloadSchema, usuarioSchema } from "../../../types/administracion/usuarios";
import { ServerEvent } from "../../socketRouter";
import useUsuarioStore from "../../../store/data/administracion/useUsuariosStore";


const usuarioEventPayloadSchema = z.object({ data: usuarioSchema })

const usuarioRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "add": {
            const parsed = usuarioEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] usuarios:add payload inválido", parsed.error)
                break
            }
            useUsuarioStore.getState().eventAddUsuario(parsed.data.data)
            break
        }
        case "update": {
            const parsed = usuarioEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] usuarios:update payload inválido", parsed.error)
                break
            }
            useUsuarioStore.getState().eventUpdateUsuario(parsed.data.data)
            break
        }
        case "delete": {
            const parsed = usuarioDeletePayloadSchema.safeParse(msg.data)
            if(!parsed.success){
                console.error("[socketRouter] usuarios:delete payload inválido", parsed.error)
                break
            }
            useUsuarioStore.getState().eventDeleteUsuario(parsed.data.usuario_id)
        }
    }
}

export default usuarioRouter