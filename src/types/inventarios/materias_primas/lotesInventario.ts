// src/types/inventarios/materias_primas/lotesInventario.ts
import z from "zod"
import { nombreMateriaPrimaSchema } from "../../catalogos/catalogoMateriasPrimas"
import { nombrePredioSchema } from "../../proveedores/predios"
import { nombreProveedorSchema } from "../../proveedores/proveedores"
import { PESO_MAXIMO, codigoIngresoSchema } from "./ingresosMateriasPrimas"

// El saldo y el consumido salen del libro de movimientos, no de una columna que
// alguien escriba: son sumas que el backend ya resolvió en SQL sobre NUMERIC y
// castea a float8 porque el driver no trae el tipo decimal habilitado. Aquí
// llegan como number solo para mostrar y por eso se validan igual que los pesos
// del ingreso —mismo tope de columna— pero admitiendo el cero: un lote recién
// llegado tiene `consumido` en 0 y uno agotado tiene `saldo` en 0.
export const pesoConsumidoSchema = z
    .number()
    .nonnegative("El peso consumido no puede ser negativo")
    .max(PESO_MAXIMO, "El peso consumido supera el máximo permitido")

export const saldoLoteSchema = z
    .number()
    .nonnegative("El saldo no puede ser negativo")
    .max(PESO_MAXIMO, "El saldo supera el máximo permitido")

// Convención: las CLAVES de los schemas replican tal cual el nombre del campo en
// el backend (snake_case: `materia_prima_id`, `llegada_en`). Los identificadores
// de TypeScript —tipos, constantes y helpers— siguen la convención del front
// (camelCase / SCREAMING_SNAKE), aunque describan ese mismo campo.
//
// Esto no es la tabla de ingresos: es la vista de inventario que el backend
// arma cruzando el lote con su predio, su proveedor y el libro de movimientos.
// Por eso `predio`, `proveedor` y `materia_prima` vienen como el nombre ya
// resuelto —la lista los muestra, no los edita— y el único id que viaja además
// del lote es `materia_prima_id`, que es por donde se filtra y se agrupa el
// inventario.
export const inventarioMateriaPrimaSchema = z.object({
    // La clave es la del ingreso que originó el lote, no un id propio de la
    // vista: es la que se manda de vuelta cuando se descuenta o se consulta el
    // detalle del lote.
    lote_id: z.uuidv4(),
    codigo: codigoIngresoSchema,

    materia_prima_id: z.uuidv4(),
    materia_prima: nombreMateriaPrimaSchema,
    predio: nombrePredioSchema,
    proveedor: nombreProveedorSchema,

    llegada_en: z.string(),

    peso_ingreso: z
        .number()
        .positive("El peso de ingreso debe ser mayor a cero")
        .max(PESO_MAXIMO, "El peso de ingreso supera el máximo permitido"),
    consumido: pesoConsumidoSchema,
    saldo: saldoLoteSchema,
})

export type InventarioMateriaPrima = z.infer<typeof inventarioMateriaPrimaSchema>
