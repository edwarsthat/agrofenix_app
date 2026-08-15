import z from "zod"
import { FormType } from "../../../components/funcionalidad/form/Form"
import type { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput"
import {
    nombreEmpleadoSchema,
    apellidoEmpleadoSchema,
    documentoSchema,
    telefonoEmpleadoSchema,
    fechaEmpleadoSchema,
    tipoDocumentoSchema,
    TIPOS_DOCUMENTO,
    TIPO_DOCUMENTO_LABELS,
} from "../../../types/talento_humano/personal"
import type { TipoDocumento } from "../../../types/talento_humano/personal"


export type PersonalFormType = {
    nombre: string
    apellido: string
    tipo_documento: TipoDocumento
    documento: string
    fecha_nacimiento: string
    telefono: string
    cargo_id: string
    fecha_ingreso: string
}

export const PersonalInitialValues: PersonalFormType = {
    nombre: "",
    apellido: "",
    tipo_documento: "CC",
    documento: "",
    fecha_nacimiento: "",
    telefono: "",
    cargo_id: "",
    fecha_ingreso: "",
}

export const tipoDocumentoOptions: FormSelectOption[] = TIPOS_DOCUMENTO.map(tipo => ({
    value: tipo,
    label: TIPO_DOCUMENTO_LABELS[tipo],
}))

// `fecha_nacimiento` y `telefono` son opcionales en el backend: el input tipo
// date/text entrega "" cuando el usuario no los llena, así que se aceptan vacíos.
export const personalFormSchema = z.object({
    nombre: nombreEmpleadoSchema,
    apellido: apellidoEmpleadoSchema,
    tipo_documento: tipoDocumentoSchema,
    documento: documentoSchema,
    fecha_nacimiento: z.literal("").or(fechaEmpleadoSchema),
    telefono: z.literal("").or(telefonoEmpleadoSchema),
    cargo_id: z.uuidv4("Selecciona un cargo"),
    fecha_ingreso: fechaEmpleadoSchema,
})

export function buildPersonalFormArr(
    cargoOptions: FormSelectOption[]
): FormType<PersonalFormType>["formArr"] {
    return [
        {
            label: "Nombre",
            type: "text",
            nombre: "nombre",
            placeholder: "Ej: Juan",
            width: "half",
        },
        {
            label: "Apellido",
            type: "text",
            nombre: "apellido",
            placeholder: "Ej: Pérez",
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
            width: "twoThirds",
        },
        {
            label: "Fecha de nacimiento",
            type: "date",
            nombre: "fecha_nacimiento",
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
            label: "Cargo",
            type: "select",
            nombre: "cargo_id",
            placeholder: "Selecciona un cargo",
            options: cargoOptions,
            width: "half",
        },
        {
            label: "Fecha de ingreso",
            type: "date",
            nombre: "fecha_ingreso",
            width: "half",
        },
    ]
}

/* ------------------------------------------------------------------ */
/* Filtros: el filtrado de personal lo resuelve el servidor            */
/* (`talento_humano:personal:read`), no un useMemo sobre la lista.     */
/* ------------------------------------------------------------------ */

// El formulario trabaja plano porque <Form> exige Record<string, string | number>;
// el anidado de `fecha` lo arma toPersonalReadPayload.
export type PersonalFiltrosType = {
    busqueda: string
    cargo_id: string
    activo: string
    tipo_fecha: string
    fecha_desde: string
    fecha_hasta: string
}

// `activo` arranca en "true": el backend siempre filtra por uno u otro, nunca
// devuelve activos e inactivos juntos.
export const PersonalFiltrosInitialValues: PersonalFiltrosType = {
    busqueda: "",
    cargo_id: "",
    activo: "true",
    tipo_fecha: "ingreso",
    fecha_desde: "",
    fecha_hasta: "",
}

export const activoOptions: FormSelectOption[] = [
    { value: "true", label: "Activos" },
    { value: "false", label: "Inactivos" },
]

export const tipoFechaOptions: FormSelectOption[] = [
    { value: "ingreso", label: "Fecha de ingreso" },
    { value: "retiro", label: "Fecha de retiro" },
]

export const personalFiltrosSchema = z.object({
    busqueda: z.string(),
    cargo_id: z.literal("").or(z.uuidv4("Selecciona un cargo válido")),
    activo: z.enum(["true", "false"]),
    tipo_fecha: z.enum(["ingreso", "retiro"]),
    fecha_desde: z.literal("").or(fechaEmpleadoSchema),
    fecha_hasta: z.literal("").or(fechaEmpleadoSchema),
}).superRefine((f, ctx) => {
    // Mismas reglas que devuelven 400 en el backend, atajadas antes de la request.
    if (f.fecha_desde && f.fecha_hasta && f.fecha_desde > f.fecha_hasta) {
        ctx.addIssue({
            code: "custom",
            path: ["fecha_hasta"],
            message: "La fecha final no puede ser anterior a la inicial",
        })
    }
    // Quien está activo no tiene fecha_retiro, así que la combinación devuelve
    // siempre vacío en vez de un error.
    if (f.tipo_fecha === "retiro" && f.activo === "true") {
        ctx.addIssue({
            code: "custom",
            path: ["activo"],
            message: "Para filtrar por retiro selecciona \"Inactivos\"",
        })
    }
})

export type PersonalReadPayload = {
    activo: boolean
    busqueda?: string
    cargo_id?: string
    tipo_fecha?: "ingreso" | "retiro"
    fecha?: { desde?: string; hasta?: string }
}

// Los campos vacíos se omiten: el backend solo aplica los que llegan.
export function toPersonalReadPayload(filtros: PersonalFiltrosType): PersonalReadPayload {
    const payload: PersonalReadPayload = { activo: filtros.activo === "true" }

    const busqueda = filtros.busqueda.trim()
    if (busqueda) payload.busqueda = busqueda
    if (filtros.cargo_id) payload.cargo_id = filtros.cargo_id

    const desde = filtros.fecha_desde || undefined
    const hasta = filtros.fecha_hasta || undefined
    if (desde || hasta) {
        payload.fecha = { ...(desde && { desde }), ...(hasta && { hasta }) }
        // Sin rango de fechas `tipo_fecha` no hace nada, así que no se envía.
        payload.tipo_fecha = filtros.tipo_fecha as "ingreso" | "retiro"
    }

    return payload
}

export function buildPersonalFiltrosArr(
    cargoOptions: FormSelectOption[]
): FormType<PersonalFiltrosType>["formArr"] {
    return [
        {
            label: "Búsqueda",
            type: "text",
            nombre: "busqueda",
            placeholder: "Nombre, apellido o documento",
            width: "third",
        },
        {
            label: "Estado",
            type: "select",
            nombre: "activo",
            options: activoOptions,
            width: "third",
        },
        {
            label: "Cargo",
            type: "select",
            nombre: "cargo_id",
            placeholder: "Todos los cargos",
            // "" = no se envía cargo_id, o sea todos.
            options: [{ value: "", label: "Todos los cargos" }, ...cargoOptions],
            width: "third",
        },
        {
            label: "Filtrar por",
            type: "select",
            nombre: "tipo_fecha",
            options: tipoFechaOptions,
            width: "third",
        },
        {
            label: "Desde",
            type: "date",
            nombre: "fecha_desde",
            width: "third",
        },
        {
            label: "Hasta",
            type: "date",
            nombre: "fecha_hasta",
            width: "third",
        },
    ]
}
