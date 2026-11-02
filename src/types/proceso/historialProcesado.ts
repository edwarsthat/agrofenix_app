// src/types/proceso/historialProcesado.ts
import z from "zod"
import { lineaProcesoSchema, observacionesProgramacionSchema } from "./programacionProceso"
import { codigoIngresoSchema, PESO_MAXIMO } from "../inventarios/materias_primas/ingresosMateriasPrimas"
import { nombreMateriaPrimaSchema } from "../catalogos/catalogoMateriasPrimas"
import { nombreProveedorSchema } from "../proveedores/proveedores"
import { nombrePredioSchema } from "../proveedores/predios"
import { pesoConsumidoSchema } from "../inventarios/materias_primas/lotesInventario"

// PENDIENTE: el backend todavía no tiene la lectura del historial. Estos campos
// son los que la pestaña necesita para pintar; cuando exista el contrato, se
// ajustan los nombres a lo que mande el servidor.
//
// Convención: las CLAVES replican el nombre del campo en el backend (snake_case).
//
// No es la fila de programación a secas: es la programación ya cerrada cruzada
// con su lote, por eso trae los nombres resueltos y `fin_en` nunca es null.
export const historialProcesadoSchema = z.object({
    id: z.uuidv4(),
    lote_id: z.uuidv4(),
    lote_codigo: codigoIngresoSchema,
    materia_prima: nombreMateriaPrimaSchema,
    predio: nombrePredioSchema,
    proveedor: nombreProveedorSchema,

    linea: lineaProcesoSchema,
    inicio_en: z.string(),
    fin_en: z.string(),

    peso_ingreso: z.number().positive().max(PESO_MAXIMO),
    // Lo que se pesó mientras la programación estuvo abierta.
    procesado: pesoConsumidoSchema,

    observaciones: observacionesProgramacionSchema.nullable(),
})

export type HistorialProcesado = z.infer<typeof historialProcesadoSchema>
