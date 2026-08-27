import { useMemo } from "react";
import Form from "../../../components/funcionalidad/form/Form";
import { buildPredioFormArr, PredioFormType, predioFormSchema, PredioInitialValues } from "./validations";
import useProveedores from "../../../store/data/proveedores/useProveedoresStore";
import { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput";
import { Predio } from "../../../types/proveedores/predios";

type propsType = {
    esEdicion: boolean
    datosPredio?: Predio
    handleSubmit: (values: PredioFormType) => Promise<void>
    onCancel: () => void
}

export default function PrediosForms({
    esEdicion,
    datosPredio,
    handleSubmit,
    onCancel,
}: propsType) {
    const { proveedores } = useProveedores();

    // Solo se ofrecen proveedores activos: a uno inactivo no debe poder
    // asignársele un predio nuevo.
    const proveedorOptions = useMemo<FormSelectOption[]>(
        () => proveedores
            .filter(p => p.activo)
            .map(p => ({ value: p.id, label: `${p.codigo} - ${p.nombre}` })),
        [proveedores]
    )

    const formArr = useMemo(() => buildPredioFormArr(proveedorOptions), [proveedorOptions])

    // Lo que en el predio es null viaja al formulario como "": los inputs no
    // manejan null y `toPredioAddPayload` vuelve a omitir los vacíos al enviar.
    // Las coordenadas llegan como number y se muestran con los 6 decimales de
    // la columna NUMERIC(9,6), que es el formato que valida el schema.
    const initialState: PredioFormType = datosPredio
        ? {
            proveedor_id: datosPredio.proveedor_id,
            nombre: datosPredio.nombre,

            departamento: datosPredio.departamento,
            municipio: datosPredio.municipio,
            vereda: datosPredio.vereda ?? "",
            referencia_ubicacion: datosPredio.referencia_ubicacion ?? "",

            latitud: datosPredio.latitud?.toFixed(6) ?? "",
            longitud: datosPredio.longitud?.toFixed(6) ?? "",

            responsable_nombre: datosPredio.responsable_nombre ?? "",
            responsable_documento: datosPredio.responsable_documento ?? "",
            responsable_telefono: datosPredio.responsable_telefono ?? "",

            observaciones: datosPredio.observaciones ?? "",
        }
        : PredioInitialValues

    return (
        <Form
            formArr={formArr}
            initialState={initialState}
            schema={predioFormSchema}
            title={esEdicion ? "Editar Predio" : "Crear Predio"}
            submitLabel={esEdicion ? "Guardar cambios" : "Crear"}
            cancelLabel="Cancelar"
            onSubmit={handleSubmit}
            onCancel={onCancel}
        />
    )
}
