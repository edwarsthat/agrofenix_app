import z from "zod"
import {
    nombreCargoPersonalSchema,
    tipoContratoSchema,
    TIPOS_CONTRATO,
    TIPO_CONTRATO_LABELS,
} from "../../../types/administracion/cargoPersonal"
import type { TipoContrato } from "../../../types/administracion/cargoPersonal"
import { FormType } from "../../../components/funcionalidad/form/Form"
import type { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput"

export type CargoPersonalForm = {
    nombre: string
    tipo_contrato: TipoContrato | ""
}

export const CargoPersonalInitialValues: CargoPersonalForm = {
    nombre: "",
    tipo_contrato: "",
}

export const tipoContratoOptions: FormSelectOption[] = TIPOS_CONTRATO.map(tipo => ({
    value: tipo,
    label: TIPO_CONTRATO_LABELS[tipo],
}))

export const cargoPersonalFormSchema = z.object({
    nombre: nombreCargoPersonalSchema,
    tipo_contrato: tipoContratoSchema,
})

export function buildCargoPersonalFormArr(): FormType<CargoPersonalForm>["formArr"] {
    return [
        {
            label: "Nombre",
            type: "text",
            nombre: "nombre",
            placeholder: "Ej: Gerente de Producción",
        },
        {
            label: "Tipo de contrato",
            type: "select",
            nombre: "tipo_contrato",
            placeholder: "Selecciona un tipo de contrato",
            options: tipoContratoOptions,
        },
    ]
}
