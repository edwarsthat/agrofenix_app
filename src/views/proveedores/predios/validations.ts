import z from "zod"
import { FormType } from "../../../components/funcionalidad/form/Form"
import type { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput"
import {
    latitudSchema,
    longitudSchema,
    nombrePredioSchema,
    observacionesPredioSchema,
    referenciaUbicacionSchema,
    responsableNombreSchema,
    veredaSchema,
} from "../../../types/proveedores/predios"
import {
    departamentoSchema,
    municipioSchema,
    telefonoProveedorSchema,
} from "../../../types/proveedores/proveedores"
import { documentoSchema } from "../../../types/talento_humano/personal"

// El `codigo` no está en el formulario: lo genera el backend al crear.
export type PredioFormType = {
    proveedor_id: string
    nombre: string

    departamento: string
    municipio: string
    vereda: string
    referencia_ubicacion: string

    latitud: string
    longitud: string

    responsable_nombre: string
    responsable_documento: string
    responsable_telefono: string

    observaciones: string
}

export const PredioInitialValues: PredioFormType = {
    proveedor_id: "",
    nombre: "",

    departamento: "",
    municipio: "",
    vereda: "",
    referencia_ubicacion: "",

    latitud: "",
    longitud: "",

    responsable_nombre: "",
    responsable_documento: "",
    responsable_telefono: "",

    observaciones: "",
}

// Las coordenadas viajan como texto en `PredioAddPayload` porque el driver no
// trae el tipo decimal habilitado, pero el input entrega un string libre: se
// valida el formato de NUMERIC(9,6) —hasta 6 decimales— y el rango WGS84 se
// delega en los schemas del predio, que son los mismos que valida el socket.
//
// Ambas revisiones van dentro de un solo superRefine, y no encadenadas con
// `.regex().pipe()`, por dos razones: un `transform` dentro del union con
// `z.literal("")` hace que zod reporte "Invalid input" en vez del mensaje real,
// y así un valor mal escrito deja un único error en el campo en vez de dos.
const coordenadaFormSchema = (rango: z.ZodNumber, campo: string) =>
    z
        .string()
        .trim()
        .superRefine((valor, ctx) => {
            if (!/^-?\d{1,3}(\.\d{1,6})?$/.test(valor)) {
                ctx.addIssue({
                    code: "custom",
                    message: `La ${campo} debe ser un número con hasta 6 decimales`,
                })
                return
            }
            const enRango = rango.safeParse(Number(valor))
            if (!enRango.success) {
                ctx.addIssue({ code: "custom", message: enRango.error.issues[0].message })
            }
        })

// Todo lo que en `PredioAddPayload` es Option llega como "" desde los inputs
// cuando el usuario no lo llena, así que se acepta vacío y `toPredioAddPayload`
// lo omite antes de enviar. `proveedor_id` es la excepción: allá es Option pero
// la tabla lo tiene NOT NULL, así que aquí se exige elegir uno.
export const predioFormSchema = z.object({
    proveedor_id: z.uuidv4("Selecciona un proveedor"),
    nombre: nombrePredioSchema,

    departamento: departamentoSchema,
    municipio: municipioSchema,
    vereda: z.literal("").or(veredaSchema),
    referencia_ubicacion: z.literal("").or(referenciaUbicacionSchema),

    latitud: z.literal("").or(coordenadaFormSchema(latitudSchema, "latitud")),
    longitud: z.literal("").or(coordenadaFormSchema(longitudSchema, "longitud")),

    responsable_nombre: z.literal("").or(responsableNombreSchema),
    responsable_documento: z.literal("").or(documentoSchema),
    responsable_telefono: z.literal("").or(telefonoProveedorSchema),

    observaciones: observacionesPredioSchema,
}).superRefine((f, ctx) => {
    // Una coordenada sola no ubica nada: o van las dos o no va ninguna.
    if (f.latitud !== "" && f.longitud === "") {
        ctx.addIssue({
            code: "custom",
            path: ["longitud"],
            message: "Falta la longitud",
        })
    }
    if (f.longitud !== "" && f.latitud === "") {
        ctx.addIssue({
            code: "custom",
            path: ["latitud"],
            message: "Falta la latitud",
        })
    }
})

export type PredioAddPayload = {
    proveedor_id?: string
    nombre: string

    departamento: string
    municipio: string
    vereda?: string
    referencia_ubicacion?: string

    latitud?: string
    longitud?: string

    responsable_nombre?: string
    responsable_documento?: string
    responsable_telefono?: string

    observaciones?: string
}

// Campos que el backend recibe como Option<String>. Se listan aparte para
// recortarlos y omitirlos en bloque: un Some("") entraría a la base como
// cadena vacía en vez de quedar en NULL.
const CAMPOS_OPCIONALES = [
    "vereda",
    "referencia_ubicacion",
    "latitud",
    "longitud",
    "responsable_nombre",
    "responsable_documento",
    "responsable_telefono",
    "observaciones",
] as const

export function toPredioAddPayload(form: PredioFormType): PredioAddPayload {
    const payload: PredioAddPayload = {
        proveedor_id: form.proveedor_id,
        nombre: form.nombre.trim(),
        departamento: form.departamento.trim(),
        municipio: form.municipio.trim(),
    }

    for (const campo of CAMPOS_OPCIONALES) {
        const valor = form[campo].trim()
        if (valor) payload[campo] = valor
    }

    return payload
}

export function buildPredioFormArr(
    proveedorOptions: FormSelectOption[]
): FormType<PredioFormType>["formArr"] {
    return [
        // El proveedor va a fila completa: la etiqueta es "codigo - nombre" y a
        // media fila se corta.
        {
            label: "Proveedor",
            type: "select",
            nombre: "proveedor_id",
            placeholder: "Selecciona un proveedor",
            options: proveedorOptions,
            width: "full",
        },
        {
            label: "Nombre",
            type: "text",
            nombre: "nombre",
            placeholder: "Ej: Finca La Esperanza",
            width: "full",
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
        {
            label: "Vereda",
            type: "text",
            nombre: "vereda",
            placeholder: "Ej: El Tablazo",
            width: "third",
        },
        {
            label: "Referencia de ubicación",
            type: "text",
            nombre: "referencia_ubicacion",
            placeholder: "Ej: Km 3 vía al aeropuerto, entrada blanca",
            width: "full",
        },

        {
            label: "Latitud",
            type: "text",
            nombre: "latitud",
            placeholder: "Ej: 6.155000",
            width: "half",
        },
        {
            label: "Longitud",
            type: "text",
            nombre: "longitud",
            placeholder: "Ej: -75.373600",
            width: "half",
        },

        {
            label: "Nombre del responsable",
            type: "text",
            nombre: "responsable_nombre",
            placeholder: "Ej: María Gómez",
            width: "third",
        },
        {
            label: "Documento del responsable",
            type: "text",
            nombre: "responsable_documento",
            placeholder: "Ej: 1098765432",
            width: "third",
        },
        {
            label: "Teléfono del responsable",
            type: "text",
            nombre: "responsable_telefono",
            placeholder: "Ej: 300 123 4567",
            width: "third",
        },

        {
            label: "Observaciones",
            type: "text",
            nombre: "observaciones",
            placeholder: "Notas internas sobre el predio",
            width: "full",
        },
    ]
}
