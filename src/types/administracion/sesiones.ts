// src/types/administracion/sesiones.ts
import z from "zod"

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `usuario_id`, `expira_en`). Los identificadores de
// TypeScript —tipos, constantes y helpers— siguen la convención del front
// (camelCase / SCREAMING_SNAKE), aunque describan ese mismo campo.
export const sesionSchema = z.object({
    usuario_id: z.uuidv4(),
    cargo_id: z.uuidv4(),
    expira_en: z.string(),
})

// El backend revoca por usuario: un `delete` cierra todas las sesiones de ese
// usuario, no una sola.
export const sesionDeletePayloadSchema = z.object({
    usuario_id: z.uuidv4(),
})

export type Sesion = z.infer<typeof sesionSchema>
