import z from "zod";
import { FormType } from "../../../components/funcionalidad/form/Form";
import { nombreCargoSchema, descripcionCargoSchema } from "../../../types/administracion/cargos";

export type CargosFormType = {
    nombre: string
    descripcion: string
}

export const CargosInitialValues: CargosFormType = {
    nombre: "",
    descripcion: ""
}

export const formArr: FormType<CargosFormType> = {
    formArr: [
        {
            label: "Nombre",
            type: "text",
            nombre: "nombre",
            placeholder: "Ej: Coordinador de calidad",
        },
        {
            label: "Descripción",
            type: "text",
            nombre: "descripcion",
            placeholder: "Breve descripción del cargo (opcional)",
        }
    ],
    initialState: CargosInitialValues
}

export const cargosSchema = z.object({
    nombre: nombreCargoSchema,
    descripcion: descripcionCargoSchema,
})
