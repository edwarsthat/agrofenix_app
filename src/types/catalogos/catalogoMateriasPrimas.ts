// src/types/catalogos/catalogoMateriasPrimas.ts
import z from "zod"

export const codigoMateriaPrimaSchema = z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(20, "El código no puede superar los 20 caracteres")

export const nombreMateriaPrimaSchema = z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres")

// Cuánto puede esperar el lote en patio antes de que la materia prima se pase.
// Es i32 en el backend y aquí solo se exige entero positivo: la tabla no tiene
// CHECK de tope, así que poner uno en el schema haría fallar el parseo de un
// registro que el backend sí acepta. El tope de operación es el de abajo y se
// aplica al capturar, no al leer.
export const horasMaximasEsperaSchema = z
    .number()
    .int("Las horas máximas de espera deben ser un número entero")
    .positive("Las horas máximas de espera deben ser mayores a cero")

// Una semana. Es política del formulario —no de la base— y por eso va aparte
// del schema: un valor suelto en este campo hace que la alerta de espera nunca
// salte.
export const HORAS_MAXIMAS_ESPERA_TOPE = 168

// Los porcentajes son NUMERIC(5,2) en la tabla y viajan como f64 porque el
// driver no trae el tipo decimal habilitado; con dos decimales acotados a
// 0..100 no hay pérdida que importe. Este number es para mostrar: cualquier
// cuenta que termine en plata se hace en SQL, donde el valor sigue siendo
// NUMERIC.
export const rendimientoPctSchema = z
    .number()
    .min(0, "El rendimiento debe estar entre 0 y 100")
    .max(100, "El rendimiento debe estar entre 0 y 100")

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `horas_maximas_espera`, `creado_en`). Los
// identificadores de TypeScript —tipos, constantes y helpers— siguen la
// convención del front (camelCase / SCREAMING_SNAKE), aunque describan ese mismo
// campo.
//
// El schema va plano, igual que el de predios y proveedores: también parsea lo
// que llega del socket, y el cruce entre `rendimiento_min_pct`,
// `rendimiento_esperado_pct` y `rendimiento_max_pct` es del formulario, donde
// se puede señalar el campo mal escrito.
export const materiaPrimaSchema = z.object({
    id: z.uuidv4(),

    codigo: codigoMateriaPrimaSchema,
    nombre: nombreMateriaPrimaSchema,

    horas_maximas_espera: horasMaximasEsperaSchema.nullable(),

    rendimiento_esperado_pct: rendimientoPctSchema.nullable(),
    rendimiento_min_pct: rendimientoPctSchema.nullable(),
    rendimiento_max_pct: rendimientoPctSchema.nullable(),

    activo: z.boolean(),
    version: z.number().int().nonnegative(),
    creado_en: z.string(),
    actualizado_en: z.string(),
})

export const materiaPrimaDeletePayloadSchema = z.object({
    materia_prima_id: z.uuidv4(),
})

export type MateriaPrima = z.infer<typeof materiaPrimaSchema>
