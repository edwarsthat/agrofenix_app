// src/types/inventarios/llaves_nfc.ts
import z from "zod"

// El UID viaja como hexadecimal sin separadores; las tarjetas MIFARE usan
// 4, 7 o 10 bytes (8, 14 o 20 caracteres).
export const uidLlaveNfcSchema = z
    .string()
    .trim()
    .min(8, "El UID debe tener al menos 8 caracteres")
    .max(20, "El UID no puede superar los 20 caracteres")
    .regex(/^[0-9A-Fa-f]+$/, "El UID solo admite caracteres hexadecimales")

export const codigoLlaveNfcSchema = z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(20, "El código no puede superar los 20 caracteres")

export const descripcionLlaveNfcSchema = z
    .string()
    .trim()
    .max(255, "La descripción no puede superar los 255 caracteres")

export const ESTADOS_LLAVE_NFC = [
    "inventario", "perdida", "dañada", "baja"
] as const

export const ESTADO_LLAVE_NFC_LABELS: Record<EstadoLlaveNfc, string> = {
    inventario: "En inventario",
    perdida: "Perdida",
    dañada: "Dañada",
    baja: "Dada de baja",
}

export const estadoLlaveNfcSchema = z.enum(ESTADOS_LLAVE_NFC, {
    error: "Selecciona un estado válido",
})

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `creado_en`, `actualizado_en`). Los identificadores de
// TypeScript —tipos, constantes y helpers— siguen la convención del front
// (camelCase / SCREAMING_SNAKE), aunque describan ese mismo campo.
export const llaveNfcSchema = z.object({
    id: z.uuidv4(),
    uid: uidLlaveNfcSchema,
    codigo: codigoLlaveNfcSchema,
    estado: estadoLlaveNfcSchema,
    descripcion: descripcionLlaveNfcSchema.nullable(),
    version: z.number().int().nonnegative(),
    creado_en: z.string(),
    actualizado_en: z.string(),
})

export const llaveNfcDeletePayloadSchema = z.object({
    llave_id: z.uuidv4(),
})

export type EstadoLlaveNfc = z.infer<typeof estadoLlaveNfcSchema>
export type LlaveNfc = z.infer<typeof llaveNfcSchema>
