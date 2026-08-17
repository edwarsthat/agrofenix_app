import { create } from "zustand";
import { descripcionLlaveNfcSchema, LlaveNfc, llaveNfcSchema, uidLlaveNfcSchema } from "../../../types/inventarios/llaves_nfc";
import { socketRequest } from "../../../lib/socket";
import z from "zod";
import { toast } from "../../useTosterStore";
import { LlaveNfcInventarioFormType, LlaveNfcReadPayload } from "../../../views/inventarios/llaves_nfc/validations";

// El backend genera `codigo` y `estado`; desde el formulario solo viajan el UID
// leído por el lector/teléfono y la descripción elegida.
const llaveNfcFormSchema = z.object({
    uid: uidLlaveNfcSchema,
    descripcion: descripcionLlaveNfcSchema,
})

type LlaveNfcForm = z.infer<typeof llaveNfcFormSchema>

interface LlavesNfcStore {
    llavesNfc: LlaveNfc[],
    eliminados: string[],
    addLlaveNfc: (form: LlaveNfcForm) => Promise<LlaveNfc | null>
    getLlavesNfc: (filtros?: LlaveNfcReadPayload) => Promise<void>
    // Al editar no se toca el UID (es la tarjeta física): solo estado y descripción.
    updateLlavesNfc: (llave_nfc_id: string, version: number, form: LlaveNfcInventarioFormType) => Promise<boolean>

    eventAddLlaveNfc: (llave_nfc: LlaveNfc) => void
}

const useLlaveNfcStore = create<LlavesNfcStore>((set) => ({
    llavesNfc: [],
    eliminados: [],
    addLlaveNfc: async (form: LlaveNfcForm) => {
        // El UID llega de la lectura NFC, no de un input validado: si el lector
        // devolvió basura conviene cortar aquí y no gastar la ida al servidor.
        const validado = llaveNfcFormSchema.safeParse(form)
        if (!validado.success) {
            const mensaje = validado.error.issues[0]?.message ?? "Datos de la llave inválidos"
            console.error("[Llaves NFC] formulario inválido:", validado.error)
            toast.error("Error", mensaje)
            return null
        }

        try {
            const request = {
                action: "inventarios:llaves_nfc:add",
                payload: { ...validado.data },
                isSuccess: true,
            }
            const response = await socketRequest<LlaveNfc>(request)

            const parsed = llaveNfcSchema.safeParse(response.data)
            if (!parsed.success) {
                console.error("[Llaves NFC] respuesta inválida:", parsed.error)
                return null
            }
            return parsed.data
        } catch (err) {
            console.error("[Llaves NFC] error:", err)
            return null
        }
    },
    getLlavesNfc: async (filtros?: LlaveNfcReadPayload) => {
        try {
            const request = {
                action: "inventarios:llaves_nfc:read",
                payload: filtros
            }
            const response = await socketRequest(request)
            if (response.status === 200) {
                const parsed = z.array(llaveNfcSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    console.error("[Llaves NFC] respuesta inválida:", parsed.error)
                    return
                }
                set({ llavesNfc: parsed.data })
            }
        } catch (err) {
            console.error("[Llaves NFC] error:", err)
        }
    },
    updateLlavesNfc: async (llave_nfc_id: string, version: number, form: LlaveNfcInventarioFormType) => {
        try {
            const request = {
                action: "inventarios:llaves_nfc:update",
                payload: { llave_nfc_id: llave_nfc_id, version, ...form },
                isSuccess: true,
            }
            await socketRequest<LlaveNfc>(request)
            return true
        } catch (err) {
            console.error("[Llaves NFC] error:", err)
            return false
        }
    },
    eventAddLlaveNfc: (llave_nfc: LlaveNfc) => {
        set((state) =>
            state.llavesNfc.some((c) => c.id === llave_nfc.id)
                ? state
                : { llavesNfc: [llave_nfc, ...state.llavesNfc] }
        )
    },
}))

export default useLlaveNfcStore;