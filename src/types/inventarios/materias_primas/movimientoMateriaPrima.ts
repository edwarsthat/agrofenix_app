// src/types/inventarios/materias_primas/movimientoMateriaPrima.ts
import z from "zod"
import { PESO_MAXIMO, observacionesIngresoSchema } from "./ingresosMateriasPrimas"

// `peso` es la cantidad que se movió, siempre en positivo. `peso_efecto` es lo
// que ese movimiento le hace al saldo del lote —negativo en un consumo o una
// merma, positivo en un ajuste que suma—, por eso es el único peso que admite
// signo. Los dos son NUMERIC(12,2) casteados a float8, igual que en ingresos.
export const pesoMovimientoSchema = z
    .number()
    .positive("El peso del movimiento debe ser mayor a cero")
    .max(PESO_MAXIMO, "El peso del movimiento supera el máximo permitido")

export const pesoEfectoSchema = z
    .number()
    .min(-PESO_MAXIMO, "El efecto del movimiento supera el máximo permitido")
    .max(PESO_MAXIMO, "El efecto del movimiento supera el máximo permitido")

export const motivoMovimientoSchema = z
    .string()
    .trim()

// Las observaciones son el mismo TEXT con tope de 500 de ingresos: se reusa el
// schema para que los dos límites no se desfasen.
export const observacionesMovimientoSchema = observacionesIngresoSchema

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `lote_id`, `medido_en`). Los identificadores de
// TypeScript —tipos, constantes y helpers— siguen la convención del front
// (camelCase / SCREAMING_SNAKE), aunque describan ese mismo campo.
//
// Es la fila del libro de movimientos tal cual: el pesaje de báscula no tiene
// tabla propia, es un movimiento de tipo consumo con los campos de origen
// llenos.
export const movimientoMateriaPrimaSchema = z.object({
    id: z.uuidv4(),
    // Igual que en ingresos: la manda el cliente y el UNIQUE de la columna
    // evita que un reintento registre el mismo movimiento dos veces.
    clave_idempotencia: z.uuidv4(),

    lote_id: z.uuidv4(),
    // Solo el consumo la exige; merma, devolución y ajustes van sin ella.
    programacion_id: z.uuidv4().nullable(),

    // En el backend es String y no un enum, así que aquí tampoco se cierra la
    // lista: un tipo nuevo en el servidor no debe tumbar el parseo del front.
    tipo: z.string(),

    peso: pesoMovimientoSchema,
    peso_efecto: pesoEfectoSchema,

    operario_id: z.uuidv4().nullable(),
    registrado_por: z.uuidv4(),

    motivo: motivoMovimientoSchema.nullable(),
    observaciones: observacionesMovimientoSchema.nullable(),

    // Un movimiento no se edita: se corrige con otro que apunta a este.
    corrige_movimiento_id: z.uuidv4().nullable(),

    // Origen de báscula: los siete van todos o ninguno (CHECK de la tabla), y
    // solo en consumos que llegaron desde un concentrador. No se revalida aquí
    // porque la tabla ya lo garantiza.
    //
    // `medido_en` es la hora real del pesaje, del reloj del ESP32. En los
    // pesajes de báscula es esta la que se muestra y no `creado_en`, que es
    // cuándo llegó al servidor.
    medido_en: z.string().nullable(),
    recibido_concentrador_en: z.string().nullable(),
    concentrador_id: z.uuidv4().nullable(),
    bascula_id: z.uuidv4().nullable(),
    // i64 en el backend. Llegan como number de JSON, que es exacto hasta 2^53:
    // de sobra para un contador de arranques y de transacciones del ESP32.
    sesion_arranque: z.number().int().nullable(),
    transaccion: z.number().int().nullable(),
    uid_tarjeta: z.string().nullable(),

    version: z.number().int().nonnegative(),
    creado_en: z.string(),
    actualizado_en: z.string(),
})

export type MovimientoMateriaPrima = z.infer<typeof movimientoMateriaPrimaSchema>
