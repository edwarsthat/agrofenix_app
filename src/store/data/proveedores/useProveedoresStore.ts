import { create } from "zustand";
import z from "zod";
import { Proveedor, proveedorSchema } from "../../../types/proveedores/proveedores";
import {
    ProveedorFormType,
    ProveedorReadPayload,
    toProveedorAddPayload,
} from "../../../views/proveedores/proveedores/validations";
import { socketRequest } from "../../../lib/socket";
import { avisarDesincronizado } from "../../../helpers/desincronizado";
import { confirm } from "../../../helpers/Confirmacion";

interface ProveedoresStore {
    proveedores: Proveedor[],
    eliminados: string[],
    addProveedor: (form: ProveedorFormType) => Promise<Proveedor | null>
    getProveedores: (filtros?: ProveedorReadPayload) => Promise<void>
    updateProveedor: (proveedor_id: string, version: number, form: ProveedorFormType) => Promise<boolean>
    deleteProveedor: (proveedor_id: string) => Promise<void>
    activarProveedor: (proveedor_id: string) => Promise<boolean>
}

// Reemplaza el proveedor en la lista, o lo agrega arriba si no estaba.
const upsert = (proveedores: Proveedor[], proveedor: Proveedor): Proveedor[] => {
    const index = proveedores.findIndex((p) => p.id === proveedor.id)
    if (index === -1) return [proveedor, ...proveedores]

    const copia = [...proveedores]
    copia[index] = proveedor
    return copia
}

const useProveedores = create<ProveedoresStore>((set, get) => ({
    proveedores: [],
    eliminados: [],
    addProveedor: async (form: ProveedorFormType) => {
        try {
            const request = {
                action: "proveedores:proveedores:add",
                payload: toProveedorAddPayload(form),
                isSuccess: true,
            }
            const response = await socketRequest<Proveedor>(request)

            const parsed = proveedorSchema.safeParse(response.data)
            if (!parsed.success) {
                avisarDesincronizado("los proveedores", parsed.error)
                return null
            }

            set((state) => ({ proveedores: upsert(state.proveedores, parsed.data) }))
            return parsed.data
        } catch (err) {
            console.error("[proveedores] error:", err)
            return null
        }
    },
    getProveedores: async (filtros?: ProveedorReadPayload) => {
        try {
            const request = {
                action: "proveedores:proveedores:read",
                payload: filtros
            }
            const response = await socketRequest(request)

            if (response.status === 200) {
                const parsed = z.array(proveedorSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    avisarDesincronizado("los proveedores", parsed.error)
                    return
                }
                set({ proveedores: parsed.data })
            }
        } catch (err) {
            console.error("[proveedores] error:", err)
        }
    },
    updateProveedor: async (proveedor_id: string, version: number, form: ProveedorFormType) => {
        try {
            const request = {
                action: "proveedores:proveedores:update",
                payload: { proveedor_id, version, ...toProveedorAddPayload(form) },
                isSuccess: true,
            }
            const response = await socketRequest<Proveedor>(request)

            // El `version` que devuelve el update es el que necesita la siguiente
            // edición, así que si no se puede parsear hay que releer la lista.
            const parsed = proveedorSchema.safeParse(response.data)
            if (!parsed.success) {
                avisarDesincronizado(
                    "los proveedores",
                    parsed.error,
                    "El proveedor se guardó, pero no se pudo refrescar la lista. Vuelve a buscar."
                )
                return true
            }

            set((state) => ({ proveedores: upsert(state.proveedores, parsed.data) }))
            return true
        } catch (err) {
            console.error("[proveedores] error:", err)
            return false
        }
    },
    deleteProveedor: async (proveedor_id: string) => {
        if (get().eliminados.includes(proveedor_id)) return
        set((state) => ({ eliminados: [...state.eliminados, proveedor_id] }))

        try {
            if (!(await confirm({ mensaje: "¿Eliminar el proveedor?", danger: true }))) return

            const request = {
                action: "proveedores:proveedores:delete",
                payload: { proveedor_id },
                isSuccess: true,
            }
            await socketRequest(request)
            set((state) => ({
                proveedores: state.proveedores.map((p) =>
                    p.id === proveedor_id ? { ...p, activo: false } : p
                ),
            }))
        } catch (err) {
            console.error("[proveedores] error:", err)
        } finally {
            set((state) => ({ eliminados: state.eliminados.filter((id) => id !== proveedor_id) }))
        }
    },
    activarProveedor: async (proveedor_id: string) => {
        if (!(await confirm({ mensaje: "¿Activar el proveedor?", danger: true }))) return false

        try {
            const request = {
                action: "proveedores:proveedores:reactivar",
                payload: { proveedor_id },
                isSuccess: true,
            }
            await socketRequest(request)
            set((state) => ({
                proveedores: state.proveedores.map((p) =>
                    p.id === proveedor_id ? { ...p, activo: true } : p
                ),
            }))
            return true
        } catch (err) {
            console.error("[proveedores] error:", err)
            return false
        }
    },
}))

export default useProveedores;
