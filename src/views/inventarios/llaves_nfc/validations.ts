import z from "zod";
import { descripcionLlaveNfcSchema, ESTADO_LLAVE_NFC_LABELS, EstadoLlaveNfc, estadoLlaveNfcSchema, ESTADOS_LLAVE_NFC, LlaveNfc } from "../../../types/inventarios/llaves_nfc";
import { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput";
import { FormType } from "../../../components/funcionalidad/form/Form";

export type LlavesNfcFiltrosType = {
    estado: EstadoLlaveNfc,
    busqueda: string,
    uid: string,
}

export const LlavesNfcFiltrosInitialValues: LlavesNfcFiltrosType = {
    estado: "inventario",
    busqueda: "",
    uid: "",
}

export const llavesNfcFiltrosSchema = z.object({
    estado: estadoLlaveNfcSchema,
    busqueda: z.string(),
    uid: z.literal("").or(
        z.string()
            .trim()
            .max(20, "El UID no puede superar los 20 caracteres")
            .regex(/^[0-9A-Fa-f]+$/, "El UID solo admite caracteres hexadecimales")
    )
})

export type LlaveNfcReadPayload = {
    estado?: EstadoLlaveNfc,
    busqueda?: string,
    uid?: string,
}

export const estadoLlaveNfcOptions: FormSelectOption[] = ESTADOS_LLAVE_NFC.map(estado => ({
    value: estado,
    label: ESTADO_LLAVE_NFC_LABELS[estado],
}))

export function toLlavesNfcReadPayload(filtros: LlavesNfcFiltrosType): LlaveNfcReadPayload {
    const payload: LlaveNfcReadPayload = { estado: filtros.estado }

    const busqueda = filtros.busqueda.trim()
    if (busqueda) payload.busqueda = busqueda
    const uid = filtros.uid.trim().toUpperCase()
    if (uid) payload.uid = uid

    return payload
}

export function buildLlavesNfcFiltrosArr(): FormType<LlavesNfcFiltrosType>["formArr"] {
    return [
        {
            label: "Búsqueda",
            type: "text",
            nombre: "busqueda",
            placeholder: "Código o descripción",
            width: "half",
        },
        {
            label: "Estado",
            type: "select",
            nombre: "estado",
            options: estadoLlaveNfcOptions,
            width: "third",
        },
        {
            label: "UID",
            type: "text",
            nombre: "uid",
            placeholder: "Ej: 04A2B3C1",
            width: "third",
        },
    ]
}


/* ------------------------------------------------------------------ */
/* Formulario de edición: el UID y el código los genera el backend, así */
/* que de una llave ya registrada solo se puede cambiar su estado y su  */
/* descripción.                                                         */
/* ------------------------------------------------------------------ */

export type LlaveNfcInventarioFormType = {
    estado: EstadoLlaveNfc,
    descripcion: string,
}

export const LlavesNfcFormInitialValues: LlaveNfcInventarioFormType = {
    estado: "inventario",
    descripcion: "",
}

// Mismo listado de usos que ofrece el escaneo al registrar la llave.
export const descripcionLlaveNfcOptions: FormSelectOption[] = [
    { value: "identificacion_pelador", label: "Identificación pelador" },
]

// La descripción es obligatoria: el select arranca vacío y "" no es un uso.
export const llaveNfcFormSchema = z.object({
    estado: estadoLlaveNfcSchema,
    descripcion: descripcionLlaveNfcSchema.min(1, "Selecciona un uso para la llave"),
})

// Precarga el formulario con lo que ya tiene la llave.
export function toLlaveNfcFormValues(llave: LlaveNfc): LlaveNfcInventarioFormType {
    return {
        estado: llave.estado,
        descripcion: llave.descripcion ?? "",
    }
}

export function buildLlaveNfcFormArr(): FormType<LlaveNfcInventarioFormType>["formArr"] {
    return [
        {
            label: "Estado",
            type: "select",
            nombre: "estado",
            options: estadoLlaveNfcOptions,
            width: "half",
        },
        {
            label: "Descripción",
            type: "select",
            nombre: "descripcion",
            placeholder: "Selecciona un uso",
            options: descripcionLlaveNfcOptions,
            width: "half",
        },
    ]
}