import z from "zod"
import { FormType } from "../../../components/funcionalidad/form/Form"
import { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput"
import {
    nombreUsuarioSchema,
    apellidoUsuarioSchema,
    emailUsuarioSchema,
    usuarioLoginSchema,
} from "../../../types/administracion/usuarios"

export type UsuarioFormType = {
    nombre: string
    apellido: string
    email: string
    usuario: string
    cargo_id: string
}

export const UsuarioInitialValues: UsuarioFormType = {
    nombre: "",
    apellido: "",
    email: "",
    usuario: "",
    cargo_id: "",
}

export const usuarioFormSchema = z.object({
    nombre: nombreUsuarioSchema,
    apellido: apellidoUsuarioSchema,
    email: emailUsuarioSchema,
    usuario: usuarioLoginSchema,
    cargo_id: z.uuidv4("Selecciona un cargo"),
})

export function buildUsuarioFormArr(
    cargoOptions: FormSelectOption[]
): FormType<UsuarioFormType>["formArr"] {
    return [
        { label: "Nombre", type: "text", nombre: "nombre", placeholder: "Ej: Juan" },
        { label: "Apellido", type: "text", nombre: "apellido", placeholder: "Ej: Pérez" },
        { label: "Correo", type: "text", nombre: "email", placeholder: "correo@empresa.com" },
        { label: "Usuario", type: "text", nombre: "usuario", placeholder: "Nombre de usuario" },
        {
            label: "Cargo",
            type: "select",
            nombre: "cargo_id",
            options: cargoOptions,
            placeholder: "Selecciona un cargo",
        },
    ]
}
