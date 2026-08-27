// src/types/proveedores/predios.ts
import z from "zod"
import { documentoSchema } from "../talento_humano/personal"
import {
    departamentoSchema,
    municipioSchema,
    telefonoProveedorSchema,
} from "./proveedores"

export const codigoPredioSchema = z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(20, "El código no puede superar los 20 caracteres")

export const nombrePredioSchema = z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres")

export const veredaSchema = z
    .string()
    .trim()
    .min(2, "La vereda debe tener al menos 2 caracteres")
    .max(80, "La vereda no puede superar los 80 caracteres")

export const referenciaUbicacionSchema = z
    .string()
    .trim()
    .min(3, "La referencia debe tener al menos 3 caracteres")
    .max(200, "La referencia no puede superar los 200 caracteres")

// La tabla guarda las coordenadas como NUMERIC(9,6) pero el driver no trae el
// tipo decimal habilitado, así que el backend las castea a float8 y aquí llegan
// como number. Los rangos son los del sistema WGS84.
export const latitudSchema = z
    .number()
    .min(-90, "La latitud debe estar entre -90 y 90")
    .max(90, "La latitud debe estar entre -90 y 90")

export const longitudSchema = z
    .number()
    .min(-180, "La longitud debe estar entre -180 y 180")
    .max(180, "La longitud debe estar entre -180 y 180")

export const responsableNombreSchema = z
    .string()
    .trim()
    .min(2, "El nombre del responsable debe tener al menos 2 caracteres")
    .max(120, "El nombre del responsable no puede superar los 120 caracteres")

export const observacionesPredioSchema = z
    .string()
    .trim()
    .max(500, "Las observaciones no pueden superar los 500 caracteres")

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `proveedor_id`, `creado_en`). Los identificadores de
// TypeScript —tipos, constantes y helpers— siguen la convención del front
// (camelCase / SCREAMING_SNAKE), aunque describan ese mismo campo.
export const predioSchema = z.object({
    id: z.uuidv4(),
    codigo: codigoPredioSchema,
    proveedor_id: z.uuidv4(),
    nombre: nombrePredioSchema,

    departamento: departamentoSchema,
    municipio: municipioSchema,
    vereda: veredaSchema.nullable(),
    referencia_ubicacion: referenciaUbicacionSchema.nullable(),

    latitud: latitudSchema.nullable(),
    longitud: longitudSchema.nullable(),

    responsable_nombre: responsableNombreSchema.nullable(),
    responsable_documento: documentoSchema.nullable(),
    responsable_telefono: telefonoProveedorSchema.nullable(),

    observaciones: observacionesPredioSchema.nullable(),
    activo: z.boolean(),
    version: z.number().int().nonnegative(),
    creado_en: z.string(),
    actualizado_en: z.string(),
})

export const predioDeletePayloadSchema = z.object({
    predio_id: z.uuidv4(),
})

export type Predio = z.infer<typeof predioSchema>
