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

// Por qué se le quita la llave a un empleado. NO son los estados de arriba:
// el estado describe dónde queda la tarjeta y el motivo por qué se soltó, y el
// backend los guarda en columnas distintas. Estos valores replican tal cual el
// CHECK `asignaciones_llave_motivo_valido_check` de la base de datos —incluido
// `dannada` sin eñe—, así que cambiarlos aquí exige una migración allá.
export const MOTIVOS_DEVOLUCION_LLAVE = [
    "devolucion", "perdida", "dannada", "retiro", "reemplazo"
] as const

export const MOTIVO_DEVOLUCION_LLAVE_LABELS: Record<MotivoDevolucionLlave, string> = {
    devolucion: "Devuelta al inventario",
    perdida: "Perdida por el empleado",
    dannada: "Dañada",
    retiro: "Retiro del empleado",
    reemplazo: "Reemplazo por otra llave",
}

export const motivoDevolucionLlaveSchema = z.enum(MOTIVOS_DEVOLUCION_LLAVE, {
    error: "Selecciona un motivo válido",
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
    empleado_codigo: z.string().nullable(),
    creado_en: z.string(),
    actualizado_en: z.string(),
})

export const llaveNfcDeletePayloadSchema = z.object({
    llave_id: z.uuidv4(),
})

export type EstadoLlaveNfc = z.infer<typeof estadoLlaveNfcSchema>
export type MotivoDevolucionLlave = z.infer<typeof motivoDevolucionLlaveSchema>
export type LlaveNfc = z.infer<typeof llaveNfcSchema>
