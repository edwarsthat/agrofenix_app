import { create } from "zustand";
import { MateriaPrima, materiaPrimaSchema } from "../../../types/catalogos/catalogoMateriasPrimas";
import { socketRequest } from "../../../lib/socket";
import z from "zod";
import { avisarDesincronizado } from "../../../helpers/desincronizado";
import type { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput";

interface MateriaPrimaStore {
    materiaPrima: MateriaPrima[],
    materiaPrimaOptions: FormSelectOption[],
    getMateriaPrima: () => Promise<void>
}

const toOptions = (materiaPrima: MateriaPrima[]): FormSelectOption[] =>
    materiaPrima
        .filter((mp) => mp.activo)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
        .map((mp) => ({ value: mp.id, label: `${mp.codigo} - ${mp.nombre}` }))

const useMateriaPrima = create<MateriaPrimaStore>((set) => ({
    materiaPrima: [],
    materiaPrimaOptions: [],
    getMateriaPrima: async () => {
        try {
            const request = {
                action: "catalogos:materias_primas:read",
            }
            const response = await socketRequest(request)
            if (response.status === 200) {
                const parsed = z.array(materiaPrimaSchema).safeParse(response.data ?? [])
                if (!parsed.success) {
                    avisarDesincronizado("las materias primas", parsed.error)
                    return
                }
                set({ materiaPrima: parsed.data, materiaPrimaOptions: toOptions(parsed.data) })
            }
        } catch (err) {
            console.error("[Materias primas] error:", err)
        }
    }
}))

export default useMateriaPrima;
