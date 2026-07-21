import z from "zod"

// src/types/administracion/cargos.ts
export const nombreCargoSchema = z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres")

export const descripcionCargoSchema = z
    .string()
    .trim()
    .max(255, "La descripción no puede superar los 255 caracteres")

export const cargoSchema = z.object({
    id: z.uuidv4(),
    nombre: nombreCargoSchema,
    descripcion: descripcionCargoSchema.nullable(),
    creado_en: z.string(),
    activo: z.boolean(),
})

export const cargoDeletePayloadSchema = z.object({
    cargo_id: z.uuidv4(),
})


export type Cargo = z.infer<typeof cargoSchema>