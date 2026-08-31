import { create } from "zustand";
import z from "zod";
import { Predio, predioSchema } from "../../../types/proveedores/predios";
import {
    PredioFormType,
    PrediosReadPayload,
    toPredioAddPayload,
} from "../../../views/proveedores/predios/validations";
import { socketRequest } from "../../../lib/socket";
import { avisarDesincronizado } from "../../../helpers/desincronizado";
import { confirm } from "../../../helpers/Confirmacion";

interface PredioStore {
    predios: Predio[],
    eliminados: string[],
    addPredio: (form: PredioFormType) => Promise<Predio | null>
    getPredios: (filtros?: PrediosReadPayload) => Promise<void>
    updatePredios: (predio_id: string, version: number, form: PredioFormType) => Promise<boolean>
    deletePredio: (predio_id: string) => Promise<void>
    activarPredio: (predio_id: string) => Promise<boolean>
    eventAddPredios: (predio: Predio) => void
    eventUpdatePredios: (predio: Predio) => void
    eventDeletePredios: (predio_id: string) => void
}

// Reemplaza el predio en la lista, o lo agrega arriba si no estaba.
const upsert = (predios: Predio[], predio: Predio): Predio[] => {
    const index = predios.findIndex((p) => p.id === predio.id)
    if (index === -1) return [predio, ...predios]

    const copia = [...predios]
    copia[index] = predio
    return copia
}

const usePredioStore = create<PredioStore>((set, get) => ({
    predios: [],
    eliminados: [],
    addPredio: async (form: PredioFormType) => {
        try {
            const request = {
                action: "proveedores:predios:add",
                payload: form,
                isSuccess: true,
            }
            const response = await socketRequest<Predio>(request)

            const parsed = predioSchema.safeParse(response.data)
            if (!parsed.success) {
                avisarDesincronizado("los predios", parsed.error)
                return null
            }

            set((state) => ({ predios: upsert(state.predios, parsed.data) }))
            return parsed.data
        } catch (err) {
            console.error("[predios] error:", err)
            return null
        }
    },
    getPredios: async (filtros?: PrediosReadPayload) => {
        try {
            const request = {
                action: "proveedores:predios:read",
                payload: filtros
            }
            const response = await socketRequest(request)

            if (response.status === 200) {
                const parsed = z.array(predioSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    avisarDesincronizado("los predios", parsed.error)
                    return
                }
                set({ predios: parsed.data })
            }
        } catch (err) {
            console.error("[predios] error:", err)
        }
    },
    updatePredios: async (predio_id: string, version: number, form: PredioFormType) => {
        try {
            const request = {
                action: "proveedores:predios:update",
                payload: { predio_id, version, ...toPredioAddPayload(form) },
                isSuccess: true,
            }
            const response = await socketRequest<Predio>(request)

            // El `version` que devuelve el update es el que necesita la siguiente
            // edición, así que si no se puede parsear hay que releer la lista.
            const parsed = predioSchema.safeParse(response.data)
            if (!parsed.success) {
                avisarDesincronizado(
                    "los predios",
                    parsed.error,
                    "El predio se guardó, pero no se pudo refrescar la lista. Vuelve a buscar."
                )
                return true
            }

            set((state) => ({ predios: upsert(state.predios, parsed.data) }))
            return true
        } catch (err) {
            console.error("[predios] error:", err)
            return false
        }
    },
    deletePredio: async (predio_id: string) => {
        if (get().eliminados.includes(predio_id)) return
        set((state) => ({ eliminados: [...state.eliminados, predio_id] }))

        try {
            if (!(await confirm({ mensaje: "¿Eliminar el predio?", danger: true }))) return

            const request = {
                action: "proveedores:predios:delete",
                payload: { predio_id },
                isSuccess: true,
            }
            await socketRequest(request)
            set((state) => ({
                predios: state.predios.map((p) =>
                    p.id === predio_id ? { ...p, activo: false } : p
                ),
            }))
        } catch (err) {
            console.error("[predios] error:", err)
        } finally {
            set((state) => ({ eliminados: state.eliminados.filter((id) => id !== predio_id) }))
        }
    },
    activarPredio: async (predio_id: string) => {
        if (!(await confirm({ mensaje: "¿Activar el predio?", danger: true }))) return false

        try {
            const request = {
                action: "proveedores:predios:reactivar",
                payload: { predio_id },
                isSuccess: true,
            }
            await socketRequest(request)
            set((state) => ({
                predios: state.predios.map((p) =>
                    p.id === predio_id ? { ...p, activo: true } : p
                ),
            }))
            return true
        } catch (err) {
            console.error("[predios] error:", err)
            return false
        }
    },
    eventAddPredios: (predio: Predio) => {
        set((state) =>
            state.predios.some((p) => p.id === predio.id)
                ? state
                : { predios: [predio, ...state.predios] }
        )
    },
    // Va por `upsert` y no por un reemplazo a secas: el predio puede no estar en
    // la lista local si los filtros actuales lo dejaban fuera, y quien lo editó
    // pudo cambiar justo el campo que ahora lo hace entrar.
    eventUpdatePredios: (predio: Predio) => {
        set((state) => ({ predios: upsert(state.predios, predio) }))
    },

    eventDeletePredios: (predio_id: string) => {
        set((state) => ({
            predios: state.predios.map((p) =>
                p.id === predio_id ? { ...p, activo: false } : p
            ),
        }))
    },
}))

export default usePredioStore;
