// src/types/proceso/programacionProceso.ts
import z from "zod"
import { observacionesIngresoSchema } from "../inventarios/materias_primas/ingresosMateriasPrimas"

// `linea` es SMALLINT en la tabla, así que el tope no lo pone el negocio sino
// la columna: pasarse hace que el INSERT reviente en el backend, no aquí. Se
// valida entero y desde 1 porque no hay línea 0 en planta ni líneas negativas.
export const LINEA_MAXIMA = 32767

export const lineaProcesoSchema = z
    .number()
    .int("La línea debe ser un número entero")
    .min(1, "La línea debe ser mayor a cero")
    .max(LINEA_MAXIMA, "La línea supera el máximo permitido")

// Las observaciones son las mismas del ingreso —mismo TEXT con tope de 500 en
// la tabla—, así que se reusa el schema en vez de repetir el límite y arriesgar
// que uno de los dos se quede desactualizado.
export const observacionesProgramacionSchema = observacionesIngresoSchema

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `lote_id`, `inicio_en`). Los identificadores de
// TypeScript —tipos, constantes y helpers— siguen la convención del front
// (camelCase / SCREAMING_SNAKE), aunque describan ese mismo campo.
export const programacionProcesoSchema = z.object({
    id: z.uuidv4(),
    lote_id: z.uuidv4(),

    linea: lineaProcesoSchema,

    // El intervalo. `fin_en` en null es el caso normal, no el raro: es la
    // programación que está corriendo ahora, la que le da el lote a cada
    // pesada. `cerrado_por` viaja con él —los dos se llenan al cerrar—, así que
    // si uno es null el otro también debería serlo.
    inicio_en: z.string(),
    fin_en: z.string().nullable(),

    programado_por: z.uuidv4(),
    cerrado_por: z.uuidv4().nullable(),

    observaciones: observacionesProgramacionSchema.nullable(),

    version: z.number().int().nonnegative(),
    creado_en: z.string(),
    actualizado_en: z.string(),
})

export type ProgramacionProceso = z.infer<typeof programacionProcesoSchema>
