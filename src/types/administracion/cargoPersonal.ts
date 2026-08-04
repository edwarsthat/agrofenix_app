import z from "zod";

export const nombreCargoPersonalSchema = z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres")

export const TIPOS_CONTRATO = [
    "indefinido",
    "fijo",
    "obra_labor",
    "ocasional",
    "aprendizaje",
    "prestacion_servicios",
] as const

export const TIPO_CONTRATO_LABELS: Record<TipoContrato, string> = {
    indefinido: "Término indefinido",
    fijo: "Término fijo",
    obra_labor: "Obra o labor",
    ocasional: "Ocasional, accidental o transitorio",
    aprendizaje: "Contrato de aprendizaje (SENA)",
    prestacion_servicios: "Prestación de servicios",
}

export const tipoContratoSchema = z.enum(TIPOS_CONTRATO, {
    error: "Selecciona un tipo de contrato válido"
})

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `tipo_contrato`, `cargo_id`). Los identificadores de
// TypeScript —tipos, constantes y helpers— siguen la convención del front
// (camelCase / SCREAMING_SNAKE), aunque describan ese mismo campo.
export const cargoPersonalSchema = z.object({
    id: z.uuidv4(),
    nombre: nombreCargoPersonalSchema,
    tipo_contrato: tipoContratoSchema,
    activo: z.boolean(),
})

export const cargoPersonalDeletePayloadSchema = z.object({
    cargo_id: z.uuidv4(),
})

export type TipoContrato = z.infer<typeof tipoContratoSchema>
export type CargoPersonal = z.infer<typeof cargoPersonalSchema>
