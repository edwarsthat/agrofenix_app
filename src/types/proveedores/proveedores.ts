// src/types/proveedores/proveedores.ts
import z from "zod"
import { documentoSchema, tipoDocumentoSchema } from "../talento_humano/personal"

export const codigoProveedorSchema = z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(20, "El código no puede superar los 20 caracteres")

// Estos valores replican tal cual el CHECK `TIPOS_PROVEEDOR` del backend, así
// que cambiarlos aquí exige una migración allá.
export const TIPOS_PROVEEDOR = ["materia_prima", "insumo", "servicio"] as const

export const TIPO_PROVEEDOR_LABELS: Record<TipoProveedor, string> = {
    materia_prima: "Materia prima",
    insumo: "Insumo",
    servicio: "Servicio",
}

export const tipoProveedorSchema = z.enum(TIPOS_PROVEEDOR, {
    error: "Selecciona un tipo de proveedor válido",
})

export const TIPOS_PERSONA = ["natural", "juridica"] as const

export const TIPO_PERSONA_LABELS: Record<TipoPersona, string> = {
    natural: "Persona natural",
    juridica: "Persona jurídica",
}

export const tipoPersonaSchema = z.enum(TIPOS_PERSONA, {
    error: "Selecciona un tipo de persona válido",
})

// Dígito de verificación del NIT: un solo dígito calculado por la DIAN.
export const digitoVerificacionSchema = z
    .string()
    .trim()
    .regex(/^[0-9]$/, "El dígito de verificación debe ser un número del 0 al 9")

export const nombreProveedorSchema = z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar los 120 caracteres")

export const razonSocialSchema = z
    .string()
    .trim()
    .min(2, "La razón social debe tener al menos 2 caracteres")
    .max(160, "La razón social no puede superar los 160 caracteres")

export const telefonoProveedorSchema = z
    .string()
    .trim()
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .max(20, "El teléfono no puede superar los 20 caracteres")
    .regex(/^[0-9+()\s-]+$/, "El teléfono solo admite números, espacios y los signos + ( ) -")

export const emailProveedorSchema = z
    .email("El correo no es válido")
    .trim()
    .max(120, "El correo no puede superar los 120 caracteres")

export const direccionProveedorSchema = z
    .string()
    .trim()
    .min(3, "La dirección debe tener al menos 3 caracteres")
    .max(160, "La dirección no puede superar los 160 caracteres")

export const departamentoSchema = z
    .string()
    .trim()
    .min(3, "El departamento debe tener al menos 3 caracteres")
    .max(80, "El departamento no puede superar los 80 caracteres")

export const municipioSchema = z
    .string()
    .trim()
    .min(3, "El municipio debe tener al menos 3 caracteres")
    .max(80, "El municipio no puede superar los 80 caracteres")

export const contactoNombreSchema = z
    .string()
    .trim()
    .min(2, "El nombre del contacto debe tener al menos 2 caracteres")
    .max(120, "El nombre del contacto no puede superar los 120 caracteres")

export const bancoSchema = z
    .string()
    .trim()
    .min(2, "El banco debe tener al menos 2 caracteres")
    .max(80, "El banco no puede superar los 80 caracteres")

export const TIPOS_CUENTA = ["ahorros", "corriente"] as const

export const TIPO_CUENTA_LABELS: Record<TipoCuenta, string> = {
    ahorros: "Cuenta de ahorros",
    corriente: "Cuenta corriente",
}

export const tipoCuentaSchema = z.enum(TIPOS_CUENTA, {
    error: "Selecciona un tipo de cuenta válido",
})

export const numeroCuentaSchema = z
    .string()
    .trim()
    .min(5, "El número de cuenta debe tener al menos 5 caracteres")
    .max(30, "El número de cuenta no puede superar los 30 caracteres")
    .regex(/^[0-9-]+$/, "El número de cuenta solo admite números y guiones")

export const titularCuentaSchema = z
    .string()
    .trim()
    .min(2, "El titular debe tener al menos 2 caracteres")
    .max(120, "El titular no puede superar los 120 caracteres")

export const observacionesProveedorSchema = z
    .string()
    .trim()
    .max(500, "Las observaciones no pueden superar los 500 caracteres")

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `tipo_proveedor`, `creado_en`). Los identificadores de
// TypeScript —tipos, constantes y helpers— siguen la convención del front
// (camelCase / SCREAMING_SNAKE), aunque describan ese mismo campo.
export const proveedorSchema = z.object({
    id: z.uuidv4(),
    codigo: codigoProveedorSchema,
    tipo_proveedor: tipoProveedorSchema,

    tipo_persona: tipoPersonaSchema,
    tipo_documento: tipoDocumentoSchema,
    documento: documentoSchema,
    digito_verificacion: digitoVerificacionSchema.nullable(),

    nombre: nombreProveedorSchema,
    razon_social: razonSocialSchema.nullable(),

    telefono: telefonoProveedorSchema.nullable(),
    telefono_alterno: telefonoProveedorSchema.nullable(),
    email: emailProveedorSchema.nullable(),
    direccion: direccionProveedorSchema.nullable(),
    departamento: departamentoSchema.nullable(),
    municipio: municipioSchema.nullable(),
    contacto_nombre: contactoNombreSchema.nullable(),
    contacto_telefono: telefonoProveedorSchema.nullable(),

    banco: bancoSchema.nullable(),
    tipo_cuenta: tipoCuentaSchema.nullable(),
    numero_cuenta: numeroCuentaSchema.nullable(),
    titular_cuenta: titularCuentaSchema.nullable(),
    titular_documento: documentoSchema.nullable(),

    observaciones: observacionesProveedorSchema.nullable(),
    activo: z.boolean(),
    version: z.number().int().nonnegative(),
    creado_en: z.string(),
    actualizado_en: z.string(),
})

export const proveedorDeletePayloadSchema = z.object({
    proveedor_id: z.uuidv4(),
})

export type TipoProveedor = z.infer<typeof tipoProveedorSchema>
export type TipoPersona = z.infer<typeof tipoPersonaSchema>
export type TipoCuenta = z.infer<typeof tipoCuentaSchema>
export type Proveedor = z.infer<typeof proveedorSchema>
