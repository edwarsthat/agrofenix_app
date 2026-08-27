import z from "zod";
import { ServerEvent } from "../../socketRouter";
import { proveedorSchema } from "../../../types/proveedores/proveedores";
import useProveedores from "../../../store/data/proveedores/useProveedoresStore";
import { avisarDesincronizado } from "../../../helpers/desincronizado";

const proveedorEventPayloadSchema = z.object({ data: proveedorSchema })

const proveedoresRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "add": {
            const parsed = proveedorEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                avisarDesincronizado("los proveedores", parsed.error)
                break
            }
            useProveedores.getState().eventAddProveedor(parsed.data.data)
            break
        }
        case "update": {
            const parsed = proveedorEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                avisarDesincronizado("los proveedores", parsed.error)
                break
            }
            useProveedores.getState().eventUpdateProveedor(parsed.data.data)
            break
        }
        case "delete": {
            const parsed = proveedorEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                avisarDesincronizado("los proveedores", parsed.error)
                break
            }
            useProveedores.getState().eventDeleteProveedor(parsed.data.data.id)
            break
        }
    }
}

export default proveedoresRouter;
