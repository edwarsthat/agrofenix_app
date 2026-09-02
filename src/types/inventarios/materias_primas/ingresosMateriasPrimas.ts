// src/types/inventarios/materias_primas/ingresosMateriasPrimas.ts
import z from "zod"

export const codigoIngresoSchema = z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(30, "El código no puede superar los 30 caracteres")

// Placa del vehículo que trae el lote. Se acepta el formato colombiano de
// carro (ABC123), moto (ABC12D) y remolque con guion (R-12345), pero sin
// espacios: la placa se usa para buscar el camión en patio y un espacio de más
// hace que la misma placa se vea como dos vehículos distintos.
export const placaSchema = z
    .string()
    .trim()
    .min(5, "La placa debe tener al menos 5 caracteres")
    .max(10, "La placa no puede superar los 10 caracteres")
    .regex(/^[A-Za-z0-9-]+$/, "La placa solo admite letras, números y guion")

export const numeroRemisionSchema = z
    .string()
    .trim()
    .min(1, "El número de remisión no puede estar vacío")
    .max(40, "El número de remisión no puede superar los 40 caracteres")

export const numeroTiqueteBasculaSchema = z
    .string()
    .trim()
    .min(1, "El número de tiquete no puede estar vacío")
    .max(40, "El número de tiquete no puede superar los 40 caracteres")

// `fecha_ingreso` es DATE en la tabla, no TIMESTAMPTZ: es el día por el que se
// agrupan los reportes. Por eso viaja como "YYYY-MM-DD" pelado y no como ISO
// completo —la hora real de llegada va en `llegada_en`—, y por eso se valida
// distinto a los demás campos de fecha de este archivo.
export const fechaIngresoSchema = z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD")

// Los pesos son NUMERIC(12,2) en la tabla y el backend los castea a float8
// porque el driver no trae el tipo decimal habilitado, así que aquí llegan como
// number. El tope es el que cabe en la columna (10 dígitos enteros).
//
// Este number es para mostrar: cualquier cuenta que termine en plata se hace en
// SQL, donde el valor sigue siendo NUMERIC.
export const PESO_MAXIMO = 9999999999.99

export const pesoIngresoSchema = z
    .number()
    .positive("El peso de ingreso debe ser mayor a cero")
    .max(PESO_MAXIMO, "El peso de ingreso supera el máximo permitido")

export const pesoDevueltoSchema = z
    .number()
    .nonnegative("El peso devuelto no puede ser negativo")
    .max(PESO_MAXIMO, "El peso devuelto supera el máximo permitido")

export const observacionesIngresoSchema = z
    .string()
    .trim()
    .max(500, "Las observaciones no pueden superar los 500 caracteres")

export const motivoAnulacionSchema = z
    .string()
    .trim()
    .min(5, "El motivo de anulación debe tener al menos 5 caracteres")
    .max(300, "El motivo de anulación no puede superar los 300 caracteres")

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `predio_id`, `creado_en`). Los identificadores de
// TypeScript —tipos, constantes y helpers— siguen la convención del front
// (camelCase / SCREAMING_SNAKE), aunque describan ese mismo campo.
export const ingresoMateriaPrimaSchema = z.object({
    id: z.uuidv4(),
    codigo: codigoIngresoSchema,

    // La manda el cliente y es lo que hace idempotente el registro: si el de
    // báscula le da dos veces al botón, el segundo intento choca contra el
    // UNIQUE de la columna y el backend devuelve el lote que ya existe en vez
    // de crear un gemelo. Es UUID —no texto libre— para que dos terminales no
    // puedan mandar la misma clave por casualidad.
    clave_idempotencia: z.uuidv4(),

    predio_id: z.uuidv4(),
    materia_prima_id: z.uuidv4(),
    placa: placaSchema,
    numero_remision: numeroRemisionSchema.nullable(),
    numero_tiquete_bascula: numeroTiqueteBasculaSchema.nullable(),

    fecha_ingreso: fechaIngresoSchema,
    llegada_en: z.string(),
    inicio_descargue_en: z.string().nullable(),
    fin_descargue_en: z.string().nullable(),

    peso_ingreso: pesoIngresoSchema,
    peso_devuelto: pesoDevueltoSchema,
    // null = el lote todavía tiene saldo en patio. La pone el trigger del libro
    // de movimientos, no la aplicación.
    cerrado_en: z.string().nullable(),

    observaciones: observacionesIngresoSchema.nullable(),
    registrado_por: z.uuidv4(),

    anulado_en: z.string().nullable(),
    anulado_por: z.uuidv4().nullable(),
    motivo_anulacion: motivoAnulacionSchema.nullable(),

    version: z.number().int().nonnegative(),
    creado_en: z.string(),
    actualizado_en: z.string(),
})

// Un ingreso no se borra: se anula, y el backend exige el motivo que después
// queda en `motivo_anulacion`.
export const ingresoMateriaPrimaAnularPayloadSchema = z.object({
    ingreso_id: z.uuidv4(),
    motivo_anulacion: motivoAnulacionSchema,
})

export type IngresoMateriaPrima = z.infer<typeof ingresoMateriaPrimaSchema>
export type IngresoMateriaPrimaAnularPayload = z.infer<
    typeof ingresoMateriaPrimaAnularPayloadSchema
>
