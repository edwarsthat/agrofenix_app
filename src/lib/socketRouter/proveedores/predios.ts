import z from "zod";
import { predioSchema } from "../../../types/proveedores/predios";
import { ServerEvent } from "../../socketRouter";
import { avisarDesincronizado } from "../../../helpers/desincronizado";
import usePredioStore from "../../../store/data/proveedores/usePredioStore";

const predioEventPayloadSchema = z.object({ data: predioSchema })

const prediosRouter = (msg: ServerEvent) => {
    switch (msg.action) {
        case "add": {
            const parsed = predioEventPayloadSchema.safeParse(msg.data)
            if(!parsed.success){
                avisarDesincronizado("los predios", parsed.error)
                break;
            }
            usePredioStore.getState().eventAddPredios(parsed.data.data)
            break
        }
    }
}

export default prediosRouter;