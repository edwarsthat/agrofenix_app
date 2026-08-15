// src/types/talento_humano/personal.ts
import z from "zod"

export const codigoEmpleadoSchema = z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(20, "El código no puede superar los 20 caracteres")

export const TIPOS_DOCUMENTO = [
    "CC",
    "CE",
    "TI",
    "RC",
    "PA",
    "NIT",
    "PEP",
    "PPT",
] as const

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
    CC: "Cédula de ciudadanía",
    CE: "Cédula de extranjería",
    TI: "Tarjeta de identidad",
    RC: "Registro civil",
    PA: "Pasaporte",
    NIT: "NIT",
    PEP: "Permiso especial de permanencia (PEP)",
    PPT: "Permiso por protección temporal (PPT)",
}

export const tipoDocumentoSchema = z.enum(TIPOS_DOCUMENTO, {
    error: "Selecciona un tipo de documento válido",
})

export const documentoSchema = z
    .string()
    .trim()
    .min(5, "El documento debe tener al menos 5 caracteres")
    .max(20, "El documento no puede superar los 20 caracteres")
    .regex(/^[0-9A-Za-z-]+$/, "El documento solo admite letras, números y guiones")

export const nombreEmpleadoSchema = z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres")

export const apellidoEmpleadoSchema = z
    .string()
    .trim()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(80, "El apellido no puede superar los 80 caracteres")

export const telefonoEmpleadoSchema = z
    .string()
    .trim()
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .max(20, "El teléfono no puede superar los 20 caracteres")
    .regex(/^[0-9+()\s-]+$/, "El teléfono solo admite números, espacios y los signos + ( ) -")

// `NaiveDate` del backend viaja como "YYYY-MM-DD"
export const fechaEmpleadoSchema = z.iso.date("La fecha no es válida")

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `tipo_documento`, `fecha_ingreso`). Los identificadores
// de TypeScript —tipos, constantes y helpers— siguen la convención del front
// (camelCase / SCREAMING_SNAKE), aunque describan ese mismo campo.
export const empleadoSchema = z.object({
    id: z.uuidv4(),
    codigo: codigoEmpleadoSchema,
    tipo_documento: tipoDocumentoSchema,
    documento: documentoSchema,
    nombre: nombreEmpleadoSchema,
    apellido: apellidoEmpleadoSchema,
    fecha_nacimiento: fechaEmpleadoSchema.nullable(),
    telefono: telefonoEmpleadoSchema.nullable(),
    cargo_id: z.uuidv4(),
    fecha_ingreso: fechaEmpleadoSchema,
    fecha_retiro: fechaEmpleadoSchema.nullable(),
    activo: z.boolean(),
    creado_en: z.string(),
    actualizado_en: z.string(),
    version: z.number().int().nonnegative(),
})

export const empleadoDeletePayloadSchema = z.object({
    empleado_id: z.uuidv4(),
})

export type TipoDocumento = z.infer<typeof tipoDocumentoSchema>
export type Empleado = z.infer<typeof empleadoSchema>
