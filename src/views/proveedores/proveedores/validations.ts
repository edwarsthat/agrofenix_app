import z from "zod"
import { FormType } from "../../../components/funcionalidad/form/Form"
import type { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput"
import {
    bancoSchema,
    contactoNombreSchema,
    departamentoSchema,
    digitoVerificacionSchema,
    direccionProveedorSchema,
    emailProveedorSchema,
    municipioSchema,
    nombreProveedorSchema,
    numeroCuentaSchema,
    observacionesProveedorSchema,
    razonSocialSchema,
    telefonoProveedorSchema,
    tipoCuentaSchema,
    TIPO_CUENTA_LABELS,
    TIPOS_CUENTA,
    tipoPersonaSchema,
    TIPO_PERSONA_LABELS,
    TIPOS_PERSONA,
    tipoProveedorSchema,
    TIPO_PROVEEDOR_LABELS,
    TIPOS_PROVEEDOR,
    titularCuentaSchema,
    type TipoCuenta,
    type TipoPersona,
    type TipoProveedor,
} from "../../../types/proveedores/proveedores"
import {
    documentoSchema,
    tipoDocumentoSchema,
    TIPO_DOCUMENTO_LABELS,
    TIPOS_DOCUMENTO,
    type TipoDocumento,
} from "../../../types/talento_humano/personal"

// El `codigo` no está en el formulario: lo genera el backend al crear.
export type ProveedorFormType = {
    tipo_proveedor: string
    tipo_persona: TipoPersona
    tipo_documento: TipoDocumento
    documento: string
    digito_verificacion: string

    nombre: string
    razon_social: string

    telefono: string
    telefono_alterno: string
    email: string
    direccion: string
    departamento: string
    municipio: string
    contacto_nombre: string
    contacto_telefono: string

    banco: string
    tipo_cuenta: string
    numero_cuenta: string
    titular_cuenta: string
    titular_documento: string

    observaciones: string
}

// `tipo_persona` y `tipo_documento` son Option en el payload, pero el proveedor
// guardado siempre los tiene, así que el formulario arranca con el caso común:
// persona natural con cédula. `tipo_proveedor` sí arranca vacío: es obligatorio
// y no hay un valor por defecto razonable, el usuario debe elegirlo.
export const ProveedorInitialValues: ProveedorFormType = {
    tipo_proveedor: "",
    tipo_persona: "natural",
    tipo_documento: "CC",
    documento: "",
    digito_verificacion: "",

    nombre: "",
    razon_social: "",

    telefono: "",
    telefono_alterno: "",
    email: "",
    direccion: "",
    departamento: "",
    municipio: "",
    contacto_nombre: "",
    contacto_telefono: "",

    banco: "",
    tipo_cuenta: "",
    numero_cuenta: "",
    titular_cuenta: "",
    titular_documento: "",

    observaciones: "",
}

export const tipoProveedorOptions: FormSelectOption[] = TIPOS_PROVEEDOR.map(tipo => ({
    value: tipo,
    label: TIPO_PROVEEDOR_LABELS[tipo],
}))

export const tipoPersonaOptions: FormSelectOption[] = TIPOS_PERSONA.map(tipo => ({
    value: tipo,
    label: TIPO_PERSONA_LABELS[tipo],
}))

export const tipoDocumentoOptions: FormSelectOption[] = TIPOS_DOCUMENTO.map(tipo => ({
    value: tipo,
    label: TIPO_DOCUMENTO_LABELS[tipo],
}))

// "" = no se envía tipo_cuenta; solo aplica si se llenan los datos bancarios.
export const tipoCuentaOptions: FormSelectOption[] = [
    { value: "", label: "Sin cuenta bancaria" },
    ...TIPOS_CUENTA.map(tipo => ({
        value: tipo,
        label: TIPO_CUENTA_LABELS[tipo],
    })),
]

// Todo lo que en `ProveedorAddPayload` es Option llega como "" desde los inputs
// cuando el usuario no lo llena, así que se acepta vacío y `toProveedorAddPayload`
// lo omite antes de enviar.
export const proveedorFormSchema = z.object({
    tipo_proveedor: tipoProveedorSchema,
    tipo_persona: tipoPersonaSchema,
    tipo_documento: tipoDocumentoSchema,
    documento: documentoSchema,
    digito_verificacion: z.literal("").or(digitoVerificacionSchema),

    nombre: nombreProveedorSchema,
    razon_social: z.literal("").or(razonSocialSchema),

    telefono: z.literal("").or(telefonoProveedorSchema),
    telefono_alterno: z.literal("").or(telefonoProveedorSchema),
    email: z.literal("").or(emailProveedorSchema),
    direccion: z.literal("").or(direccionProveedorSchema),
    departamento: z.literal("").or(departamentoSchema),
    municipio: z.literal("").or(municipioSchema),
    contacto_nombre: z.literal("").or(contactoNombreSchema),
    contacto_telefono: z.literal("").or(telefonoProveedorSchema),

    banco: z.literal("").or(bancoSchema),
    tipo_cuenta: z.literal("").or(tipoCuentaSchema),
    numero_cuenta: z.literal("").or(numeroCuentaSchema),
    titular_cuenta: z.literal("").or(titularCuentaSchema),
    titular_documento: z.literal("").or(documentoSchema),

    observaciones: observacionesProveedorSchema,
})

export type ProveedorAddPayload = {
    tipo_proveedor: TipoProveedor
    tipo_persona?: TipoPersona
    tipo_documento?: TipoDocumento
    documento: string
    digito_verificacion?: string

    nombre: string
    razon_social?: string

    telefono?: string
    telefono_alterno?: string
    email?: string
    direccion?: string
    departamento?: string
    municipio?: string
    contacto_nombre?: string
    contacto_telefono?: string

    banco?: string
    tipo_cuenta?: TipoCuenta
    numero_cuenta?: string
    titular_cuenta?: string
    titular_documento?: string

    observaciones?: string
}

// Campos que el backend recibe como Option<String>. Se listan aparte para
// recortarlos y omitirlos en bloque: un Some("") entraría a la base como
// cadena vacía en vez de quedar en NULL.
const CAMPOS_OPCIONALES = [
    "digito_verificacion",
    "razon_social",
    "telefono",
    "telefono_alterno",
    "email",
    "direccion",
    "departamento",
    "municipio",
    "contacto_nombre",
    "contacto_telefono",
    "banco",
    "numero_cuenta",
    "titular_cuenta",
    "titular_documento",
    "observaciones",
] as const

export function toProveedorAddPayload(form: ProveedorFormType): ProveedorAddPayload {
    const payload: ProveedorAddPayload = {
        // El select solo entrega valores de TIPOS_PROVEEDOR, y el "" inicial
        // ya lo rechazó `proveedorFormSchema` antes de llegar aquí.
        tipo_proveedor: form.tipo_proveedor as TipoProveedor,
        tipo_persona: form.tipo_persona,
        tipo_documento: form.tipo_documento,
        documento: form.documento.trim(),
        nombre: form.nombre.trim(),
    }

    for (const campo of CAMPOS_OPCIONALES) {
        const valor = form[campo].trim()
        if (valor) payload[campo] = valor
    }

    // `tipo_cuenta` va aparte porque es un enum, no un string libre.
    if (form.tipo_cuenta) payload.tipo_cuenta = form.tipo_cuenta as TipoCuenta

    return payload
}

export function buildProveedorFormArr(): FormType<ProveedorFormType>["formArr"] {
    return [
        {
            label: "Tipo de proveedor",
            type: "select",
            nombre: "tipo_proveedor",
            placeholder: "Selecciona un tipo de proveedor",
            options: tipoProveedorOptions,
            width: "half",
        },
        {
            label: "Tipo de persona",
            type: "select",
            nombre: "tipo_persona",
            options: tipoPersonaOptions,
            width: "half",
        },
        {
            label: "Tipo de documento",
            type: "select",
            nombre: "tipo_documento",
            placeholder: "Selecciona un tipo de documento",
            options: tipoDocumentoOptions,
            width: "third",
        },
        {
            label: "Documento",
            type: "text",
            nombre: "documento",
            placeholder: "Ej: 1098765432",
            width: "third",
        },
        {
            label: "Dígito de verificación",
            type: "text",
            nombre: "digito_verificacion",
            placeholder: "Solo para NIT",
            width: "third",
        },
        {
            label: "Nombre",
            type: "text",
            nombre: "nombre",
            placeholder: "Ej: Juan Pérez",
            width: "half",
        },
        {
            label: "Razón social",
            type: "text",
            nombre: "razon_social",
            placeholder: "Solo si es persona jurídica",
            width: "half",
        },

        {
            label: "Teléfono",
            type: "text",
            nombre: "telefono",
            placeholder: "Ej: 300 123 4567",
            width: "half",
        },
        {
            label: "Teléfono alterno",
            type: "text",
            nombre: "telefono_alterno",
            placeholder: "Ej: 604 123 4567",
            width: "half",
        },
        {
            label: "Correo",
            type: "text",
            nombre: "email",
            placeholder: "correo@empresa.com",
            width: "half",
        },
        {
            label: "Dirección",
            type: "text",
            nombre: "direccion",
            placeholder: "Ej: Calle 10 # 4-32",
            width: "half",
        },
        {
            label: "Departamento",
            type: "text",
            nombre: "departamento",
            placeholder: "Ej: Antioquia",
            width: "half",
        },
        {
            label: "Municipio",
            type: "text",
            nombre: "municipio",
            placeholder: "Ej: Rionegro",
            width: "half",
        },
        {
            label: "Nombre del contacto",
            type: "text",
            nombre: "contacto_nombre",
            placeholder: "Ej: María Gómez",
            width: "half",
        },
        {
            label: "Teléfono del contacto",
            type: "text",
            nombre: "contacto_telefono",
            placeholder: "Ej: 301 765 4321",
            width: "half",
        },

        {
            label: "Banco",
            type: "text",
            nombre: "banco",
            placeholder: "Ej: Bancolombia",
            width: "half",
        },
        {
            label: "Tipo de cuenta",
            type: "select",
            nombre: "tipo_cuenta",
            options: tipoCuentaOptions,
            width: "half",
        },
        {
            label: "Número de cuenta",
            type: "text",
            nombre: "numero_cuenta",
            placeholder: "Ej: 12345678901",
            width: "half",
        },
        {
            label: "Titular de la cuenta",
            type: "text",
            nombre: "titular_cuenta",
            placeholder: "Nombre de quien recibe el pago",
            width: "half",
        },
        {
            label: "Documento del titular",
            type: "text",
            nombre: "titular_documento",
            placeholder: "Ej: 1098765432",
            width: "half",
        },

        {
            label: "Observaciones",
            type: "text",
            nombre: "observaciones",
            placeholder: "Notas internas sobre el proveedor",
            width: "full",
        },
    ]
}


/* ------------------------------------------------------------------ */
/* Filtros: el filtrado lo resuelve el servidor                        */
/* (`proveedores:proveedores:read`), no un useMemo sobre la lista.     */
/* ------------------------------------------------------------------ */

// <Form> exige Record<string, string | number>, así que todo viaja plano y
// `toProveedoresReadPayload` se encarga de tipar y recortar antes de enviar.
export type ProveedoresFiltrosType = {
    busqueda: string
    activo: string
    tipo_proveedor: string
    tipo_persona: string
    departamento: string
    municipio: string
}

// `activo` arranca en "true": el backend siempre filtra por uno u otro, nunca
// devuelve activos e inactivos juntos. El resto arranca vacío = sin filtrar.
export const ProveedoresFiltrosInitialValues: ProveedoresFiltrosType = {
    busqueda: "",
    activo: "true",
    tipo_proveedor: "",
    tipo_persona: "",
    departamento: "",
    municipio: "",
}

export const activoProveedorOptions: FormSelectOption[] = [
    { value: "true", label: "Activos" },
    { value: "false", label: "Inactivos" },
]

// "" = no se envía el campo, o sea todos. Se reusan las options del formulario
// anteponiendo la opción vacía.
export const tipoProveedorFiltroOptions: FormSelectOption[] = [
    { value: "", label: "Todos los tipos" },
    ...tipoProveedorOptions,
]

export const tipoPersonaFiltroOptions: FormSelectOption[] = [
    { value: "", label: "Natural y jurídica" },
    ...tipoPersonaOptions,
]

// Departamento y municipio no reusan sus schemas del formulario: allá el mínimo
// de 3 caracteres tiene sentido porque se guarda el nombre completo, pero aquí
// son búsquedas parciales y escribir "An" para Antioquia es legítimo.
const textoFiltroSchema = (max: number, campo: string) =>
    z.string().trim().max(max, `El ${campo} no puede superar los ${max} caracteres`)

export const proveedoresFiltrosSchema = z.object({
    busqueda: textoFiltroSchema(120, "texto de búsqueda"),
    activo: z.enum(["true", "false"]),
    tipo_proveedor: z.literal("").or(tipoProveedorSchema),
    tipo_persona: z.literal("").or(tipoPersonaSchema),
    departamento: textoFiltroSchema(80, "departamento"),
    municipio: textoFiltroSchema(80, "municipio"),
})

export type ProveedorReadPayload = {
    activo: boolean
    busqueda?: string
    tipo_proveedor?: TipoProveedor
    tipo_persona?: TipoPersona
    departamento?: string
    municipio?: string
}

// Los campos vacíos se omiten: el backend solo aplica los que llegan.
export function toProveedoresReadPayload(filtros: ProveedoresFiltrosType): ProveedorReadPayload {
    const payload: ProveedorReadPayload = { activo: filtros.activo === "true" }

    const busqueda = filtros.busqueda.trim()
    if (busqueda) payload.busqueda = busqueda

    // Los selects solo entregan valores del enum o "", que el if descarta.
    if (filtros.tipo_proveedor) payload.tipo_proveedor = filtros.tipo_proveedor as TipoProveedor
    if (filtros.tipo_persona) payload.tipo_persona = filtros.tipo_persona as TipoPersona

    const departamento = filtros.departamento.trim()
    if (departamento) payload.departamento = departamento
    const municipio = filtros.municipio.trim()
    if (municipio) payload.municipio = municipio

    return payload
}

export function buildProveedoresFiltrosArr(): FormType<ProveedoresFiltrosType>["formArr"] {
    return [
        {
            label: "Búsqueda",
            type: "text",
            nombre: "busqueda",
            placeholder: "Código, nombre, razón social o documento",
            width: "third",
        },
        {
            label: "Estado",
            type: "select",
            nombre: "activo",
            options: activoProveedorOptions,
            width: "third",
        },
        {
            label: "Tipo de proveedor",
            type: "select",
            nombre: "tipo_proveedor",
            placeholder: "Todos los tipos",
            options: tipoProveedorFiltroOptions,
            width: "third",
        },
        {
            label: "Tipo de persona",
            type: "select",
            nombre: "tipo_persona",
            placeholder: "Natural y jurídica",
            options: tipoPersonaFiltroOptions,
            width: "third",
        },
        {
            label: "Departamento",
            type: "text",
            nombre: "departamento",
            placeholder: "Ej: Antioquia",
            width: "third",
        },
        {
            label: "Municipio",
            type: "text",
            nombre: "municipio",
            placeholder: "Ej: Rionegro",
            width: "third",
        },
    ]
}
