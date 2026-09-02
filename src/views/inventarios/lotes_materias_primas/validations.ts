import z from "zod"
import { FormType } from "../../../components/funcionalidad/form/Form"
import type { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput"
import {
    fechaIngresoSchema,
    numeroRemisionSchema,
    numeroTiqueteBasculaSchema,
    observacionesIngresoSchema,
    pesoDevueltoSchema,
    pesoIngresoSchema,
    placaSchema,
} from "../../../types/inventarios/materias_primas/ingresosMateriasPrimas"

// Del `IngresoAddPayload` del backend no están aquí cuatro campos, y por
// razones distintas:
//
// - `clave_idempotencia` no se teclea: la genera el cliente y entra por
//   `toLoteMateriaPrimaAddPayload`.
// - `llegada_en` es el instante en que se registra el lote, no un dato del
//   operario; se pone al armar el payload.
// - `inicio_descargue_en` y `fin_descargue_en` se marcan después, cuando el
//   camión entra y sale del patio, con sus propios eventos. Al crear el lote
//   todavía no existen, y además <Form> no tiene input de hora.
//
// `codigo` tampoco está: lo genera el backend al crear, igual que en predios.
export type LoteMateriaPrimaFormType = {
    predio_id: string
    materia_prima_id: string

    placa: string
    numero_remision: string
    numero_tiquete_bascula: string

    fecha_ingreso: string

    peso_ingreso: string
    peso_devuelto: string

    observaciones: string
}

// Es función y no una constante como en los demás formularios porque
// `fecha_ingreso` arranca en el día de hoy: una app de báscula queda abierta
// toda la jornada, y una constante evaluada al cargar el módulo seguiría
// ofreciendo el día de ayer después de la medianoche.
//
// Se arma con la fecha local, no con `toISOString()`, que primero pasa a UTC y
// en Colombia (UTC-5) devuelve el día siguiente desde las 7 de la noche.
export function buildLoteMateriaPrimaInitialValues(): LoteMateriaPrimaFormType {
    const hoy = new Date()
    const mes = String(hoy.getMonth() + 1).padStart(2, "0")
    const dia = String(hoy.getDate()).padStart(2, "0")

    return {
        predio_id: "",
        materia_prima_id: "",

        placa: "",
        numero_remision: "",
        numero_tiquete_bascula: "",

        fecha_ingreso: `${hoy.getFullYear()}-${mes}-${dia}`,

        peso_ingreso: "",
        peso_devuelto: "",

        observaciones: "",
    }
}

// Los pesos son NUMERIC(12,2) en la tabla y viajan como f64, pero el input
// entrega un string libre. Se valida primero el formato —hasta 2 decimales, sin
// signo— y después el rango con el schema del ingreso, que es el mismo que
// valida el socket.
//
// Las dos revisiones van dentro de un solo superRefine, igual que las
// coordenadas del predio: así un valor mal escrito deja un único error en el
// campo en vez de dos.
const pesoFormSchema = (rango: z.ZodNumber, campo: string) =>
    z
        .string()
        .trim()
        .superRefine((valor, ctx) => {
            if (!/^\d{1,10}(\.\d{1,2})?$/.test(valor)) {
                ctx.addIssue({
                    code: "custom",
                    message: `El ${campo} debe ser un número positivo con hasta 2 decimales`,
                })
                return
            }
            const enRango = rango.safeParse(Number(valor))
            if (!enRango.success) {
                ctx.addIssue({ code: "custom", message: enRango.error.issues[0].message })
            }
        })

// `predio_id` y `materia_prima_id` son Option en el payload pero NOT NULL en la
// tabla, así que aquí se exige elegirlos. `peso_ingreso` es f64 pelado —sin
// Option— y por eso es el único peso obligatorio.
//
// Lo demás llega como "" cuando el operario no lo llena y
// `toLoteMateriaPrimaAddPayload` lo omite antes de enviar.
export const loteMateriaPrimaFormSchema = z.object({
    predio_id: z.uuidv4("Selecciona un predio"),
    materia_prima_id: z.uuidv4("Selecciona una materia prima"),

    placa: placaSchema,
    numero_remision: z.literal("").or(numeroRemisionSchema),
    numero_tiquete_bascula: z.literal("").or(numeroTiqueteBasculaSchema),

    fecha_ingreso: z.literal("").or(fechaIngresoSchema),

    peso_ingreso: pesoFormSchema(pesoIngresoSchema, "peso de ingreso"),
    peso_devuelto: z.literal("").or(pesoFormSchema(pesoDevueltoSchema, "peso devuelto")),

    observaciones: observacionesIngresoSchema,
}).superRefine((f, ctx) => {
    // No se puede devolver más de lo que entró: eso dejaría el lote con saldo
    // negativo en patio y la liquidación del proveedor en contra.
    if (f.peso_devuelto === "" || f.peso_ingreso === "") return

    const ingreso = Number(f.peso_ingreso)
    const devuelto = Number(f.peso_devuelto)
    if (Number.isNaN(ingreso) || Number.isNaN(devuelto)) return

    if (devuelto > ingreso) {
        ctx.addIssue({
            code: "custom",
            path: ["peso_devuelto"],
            message: "El peso devuelto no puede superar el peso de ingreso",
        })
    }
})

export type LoteMateriaPrimaAddPayload = {
    clave_idempotencia?: string
    predio_id?: string
    materia_prima_id?: string

    placa: string
    numero_remision?: string
    numero_tiquete_bascula?: string

    fecha_ingreso?: string
    llegada_en?: string

    peso_ingreso: number
    peso_devuelto?: number

    observaciones?: string
}

// La clave que hace idempotente el registro. Se genera UNA vez, al abrir el
// formulario, y se reusa en cada reintento del mismo lote: si se generara
// dentro de `toLoteMateriaPrimaAddPayload`, un reintento por señal caída
// mandaría una clave nueva y el backend crearía el lote gemelo que la clave
// existe para evitar.
export function nuevaClaveIdempotencia(): string {
    return crypto.randomUUID()
}

// Campos que el backend recibe como Option<String>. Se listan aparte para
// recortarlos y omitirlos en bloque: un Some("") entraría a la base como cadena
// vacía en vez de quedar en NULL.
const CAMPOS_OPCIONALES = [
    "numero_remision",
    "numero_tiquete_bascula",
    "fecha_ingreso",
    "observaciones",
] as const

export function toLoteMateriaPrimaAddPayload(
    form: LoteMateriaPrimaFormType,
    claveIdempotencia: string
): LoteMateriaPrimaAddPayload {
    const payload: LoteMateriaPrimaAddPayload = {
        clave_idempotencia: claveIdempotencia,
        predio_id: form.predio_id,
        materia_prima_id: form.materia_prima_id,
        placa: form.placa.trim().toUpperCase(),
        peso_ingreso: Number(form.peso_ingreso.trim()),
        // La hora real de llegada del camión, aparte de `fecha_ingreso`, que es
        // solo el día por el que se agrupan los reportes.
        llegada_en: new Date().toISOString(),
    }

    for (const campo of CAMPOS_OPCIONALES) {
        const valor = form[campo].trim()
        if (valor) payload[campo] = valor
    }

    const pesoDevuelto = form.peso_devuelto.trim()
    if (pesoDevuelto) payload.peso_devuelto = Number(pesoDevuelto)

    return payload
}

export function buildLoteMateriaPrimaFormArr(
    predioOptions: FormSelectOption[],
    materiaPrimaOptions: FormSelectOption[]
): FormType<LoteMateriaPrimaFormType>["formArr"] {
    return [
        // El predio va a fila completa: la etiqueta es "codigo - nombre" y a
        // media fila se corta.
        {
            label: "Predio",
            type: "select",
            nombre: "predio_id",
            placeholder: "Selecciona un predio",
            options: predioOptions,
            width: "full",
        },
        {
            label: "Materia prima",
            type: "select",
            nombre: "materia_prima_id",
            placeholder: "Selecciona una materia prima",
            options: materiaPrimaOptions,
            width: "half",
        },
        {
            label: "Placa",
            type: "text",
            nombre: "placa",
            placeholder: "Ej: ABC123",
            width: "half",
        },

        {
            label: "Fecha de ingreso",
            type: "date",
            nombre: "fecha_ingreso",
            width: "third",
        },
        {
            label: "Número de remisión",
            type: "text",
            nombre: "numero_remision",
            placeholder: "Ej: R-00214",
            width: "third",
        },
        {
            label: "Tiquete de báscula",
            type: "text",
            nombre: "numero_tiquete_bascula",
            placeholder: "Ej: 000984",
            width: "third",
        },

        {
            label: "Peso de ingreso (kg)",
            type: "text",
            nombre: "peso_ingreso",
            placeholder: "Ej: 12500.50",
            width: "half",
        },
        {
            label: "Peso devuelto (kg)",
            type: "text",
            nombre: "peso_devuelto",
            placeholder: "Ej: 0",
            width: "half",
        },

        {
            label: "Observaciones",
            type: "text",
            nombre: "observaciones",
            placeholder: "Notas del descargue",
            width: "full",
        },
    ]
}
