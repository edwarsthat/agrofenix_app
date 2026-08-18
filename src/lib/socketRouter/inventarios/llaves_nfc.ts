import z from "zod";
import { ServerEvent } from "../../socketRouter";
import { llaveNfcSchema } from "../../../types/inventarios/llaves_nfc";
import useLlaveNfcStore from "../../../store/data/inventarios/useLlavesNfc";

const llaveNfcEventPayloadSchema = z.object({ data: llaveNfcSchema })

const personalRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "add": {
            const parsed = llaveNfcEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] personal:add payload inválido", parsed.error)
                break
            }
            useLlaveNfcStore.getState().eventAddLlaveNfc(parsed.data.data)
            break
        }
        case "update": {
            const parsed = llaveNfcEventPayloadSchema.safeParse(msg.data)
            if (!parsed.success) {
                console.error("[socketRouter] personal:update payload inválido", parsed.error)
                break
            }
            useLlaveNfcStore.getState().eventUpdateLlaveNfc(parsed.data.data)
            break
        }
    }
}

export default personalRouter;