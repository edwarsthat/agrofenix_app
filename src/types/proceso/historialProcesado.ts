// src/types/proceso/historialProcesado.ts
import z from "zod"
import { lineaProcesoSchema, observacionesProgramacionSchema } from "./programacionProceso"
import { codigoIngresoSchema } from "../inventarios/materias_primas/ingresosMateriasPrimas"
import { nombreMateriaPrimaSchema } from "../catalogos/catalogoMateriasPrimas"
import { nombrePredioSchema } from "../proveedores/predios"
import { pesoConsumidoSchema } from "../inventarios/materias_primas/lotesInventario"

// Fila de `proceso:programacion_proceso:read`.
//
// Convención: las CLAVES replican el nombre del campo en el backend (snake_case).
//
// No es la fila de programación a secas: viene cruzada con su lote y con los
// nombres ya resueltos. Llegan abiertas y cerradas; la que está montada ahora
// sale de primera con `fin_en` y `cerrado_por_*` en null.
export const historialProcesadoSchema = z.object({
    id: z.uuidv4(),
    lote_id: z.uuidv4(),

    linea: lineaProcesoSchema,
    inicio_en: z.string(),
    fin_en: z.string().nullable(),

    observaciones: observacionesProgramacionSchema.nullable(),

    lote_codigo: codigoIngresoSchema,
    materia_prima_nombre: nombreMateriaPrimaSchema,
    predio_nombre: nombrePredioSchema,

    programado_por_nombre: z.string(),
    programado_por_apellido: z.string(),
    cerrado_por_nombre: z.string().nullable(),
    cerrado_por_apellido: z.string().nullable(),

    cantidad_pesajes: z.number().int().nonnegative(),
    // Lo que se pesó mientras la programación estuvo abierta.
    kg_pesados: pesoConsumidoSchema,
})

export type HistorialProcesado = z.infer<typeof historialProcesadoSchema>
