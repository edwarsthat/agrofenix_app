// src/types/administracion/usuarios.ts
import z from "zod"

export const nombreUsuarioSchema = z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres")

export const apellidoUsuarioSchema = z
    .string()
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(80, "El apellido no puede superar los 80 caracteres")

export const emailUsuarioSchema = z
    .email("El correo no es válido")
    .trim()
    .max(120, "El correo no puede superar los 120 caracteres")

export const usuarioLoginSchema = z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(40, "El usuario no puede superar los 40 caracteres")

export const usuarioSchema = z.object({
    id: z.uuidv4(),
    nombre: nombreUsuarioSchema,
    apellido: apellidoUsuarioSchema,
    email: emailUsuarioSchema,
    usuario: usuarioLoginSchema,
    cargo_id: z.uuidv4(),
    activo: z.boolean(),
    creado_en: z.string(),
    actualizado_en: z.string(),
})

export const usuarioDeletePayloadSchema = z.object({
    usuario_id: z.uuidv4(),
})

export type Usuario = z.infer<typeof usuarioSchema>
