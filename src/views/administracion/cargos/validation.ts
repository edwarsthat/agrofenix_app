import z from "zod";
import { FormType } from "../../../components/funcionalidad/form/Form";

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
    nombre: z
        .string()
        .trim()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(80, "El nombre no puede superar los 80 caracteres"),
    descripcion: z
        .string()
        .trim()
        .max(255, "La descripción no puede superar los 255 caracteres"),
})
