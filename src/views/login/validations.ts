import z from "zod";
import { FormType } from "../../components/funcionalidad/form/Form";

export type LoginFormType = {
    new_password: string
    confirm_password: string
}

export const loginInitialValues: LoginFormType = {
    new_password: "",
    confirm_password: ""
}

export const loginFormSchema = z.object({
    new_password: z.string().min(6, "La contraseña no puede ser menor de 6 caracteres"),
    confirm_password: z.string().min(1, "Confirma la contraseña"),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
})

export function buildLoginFormArr(): FormType<LoginFormType>["formArr"] {
    return [
        { label: "Nueva contraseña", type: "text", nombre: "new_password", placeholder: "******" },
        { label: "Confirmar contraseña", type: "text", nombre: "confirm_password", placeholder: "******" },
    ]
}