import z from "zod";
import { FormType } from "../../components/funcionalidad/form/Form";

export type LoginFormType = {
    password: string
    new_password: string
    confirm_password: string
}

export const loginInitialValues: LoginFormType = {
    password:"",
    new_password: "",
    confirm_password: ""
}

export const loginFormSchema = z.object({
    password: z.string().min(6, "La contraseña no puede ser menor de 6 caracteres"),
    new_password: z.string().min(6, "La contraseña no puede ser menor de 6 caracteres"),
    confirm_password: z.string().min(1, "Confirma la contraseña"),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
})

export function buildLoginFormArr(): FormType<LoginFormType>["formArr"] {
    return [
        { label: "contraseña", type: "password", nombre: "password", placeholder: "******" },
        { label: "Nueva contraseña", type: "password", nombre: "new_password", placeholder: "******" },
        { label: "Confirmar contraseña", type: "password", nombre: "confirm_password", placeholder: "******" },
    ]
}