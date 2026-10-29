// src/types/inventarios/materias_primas/pesajesBascula.ts
import z from "zod"
import { pesoMovimientoSchema } from "./movimientoMateriaPrima"

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `medido_en`, `lote_codigo`). Los identificadores de
// TypeScript —tipos, constantes y helpers— siguen la convención del front
// (camelCase / SCREAMING_SNAKE), aunque describan ese mismo campo.
//
// Esto no es la fila del libro de movimientos: es el listado que arma el
// backend cruzando el pesaje con el operario, la llave, la báscula y el lote.
// Por eso los códigos y nombres vienen ya resueltos. El servidor manda más
// campos que estos; z.object los descarta y aquí solo quedan los que se usan.
export const pesajeBasculaSchema = z.object({
    id: z.uuidv4(),
    peso: pesoMovimientoSchema,
    // Hora del reloj del ESP32, no la de llegada al servidor.
    medido_en: z.string(),
    operario_codigo: z.string(),
    llave_codigo: z.string(),
    bascula_codigo: z.string(),
    lote_codigo: z.string(),
    materia_prima_nombre: z.string(),
    // true = otro movimiento lo corrigió: se muestra, pero ya no cuenta igual.
    corregido: z.boolean(),
})

// El cursor se devuelve tal cual llegó: el backend pagina por (medido_en, id)
// y exige que la siguiente llamada lo traiga idéntico.
export const cursorPesajesSchema = z.object({
    medido_en: z.string(),
    id: z.uuidv4(),
})

export const totalPesajesOperarioSchema = z.object({
    operario_id: z.uuidv4(),
    operario_codigo: z.string(),
    cantidad: z.number().int().nonnegative(),
    kg: z.number().nonnegative(),
    cantidad_corregidos: z.number().int().nonnegative(),
})

export const pesajesBasculaRespuestaSchema = z.object({
    pesajes: z.array(pesajeBasculaSchema),
    siguiente_cursor: cursorPesajesSchema.nullable(),
    totales: z.array(totalPesajesOperarioSchema),
})

// Filtros del read. `medido_en` es el único obligatorio: instantes UTC, `hasta`
// no se incluye y el rango no puede pasar de 31 días. Un día de Colombia va de
// las 05:00Z de ese día a las 05:00Z del siguiente. El resto se puede omitir.
// `limite` vale 500 si no se manda y el backend no acepta más de 1000.
export const LIMITE_PESAJES_MAXIMO = 1000

export const filtrosPesajesBasculaSchema = z.object({
    medido_en: z.object({
        desde: z.string(),
        hasta: z.string(),
    }),
    operario_id: z.uuidv4().nullable().optional(),
    llave_id: z.uuidv4().nullable().optional(),
    lote_id: z.uuidv4().nullable().optional(),
    programacion_id: z.uuidv4().nullable().optional(),
    bascula_id: z.uuidv4().nullable().optional(),
    uid: z.string().nullable().optional(),
    corregido: z.boolean().nullable().optional(),
    limite: z.number().int().min(1).max(LIMITE_PESAJES_MAXIMO).optional(),
})

export type PesajeBascula = z.infer<typeof pesajeBasculaSchema>
export type CursorPesajes = z.infer<typeof cursorPesajesSchema>
export type TotalPesajesOperario = z.infer<typeof totalPesajesOperarioSchema>
export type PesajesBasculaRespuesta = z.infer<typeof pesajesBasculaRespuestaSchema>
export type FiltrosPesajesBascula = z.infer<typeof filtrosPesajesBasculaSchema>
