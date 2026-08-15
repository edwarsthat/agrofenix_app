import { useMemo } from "react";
import Form from "../../../components/funcionalidad/form/Form";
import { buildCargoPersonalFormArr, CargoPersonalForm, cargoPersonalFormSchema, CargoPersonalInitialValues } from "./validations";
import { CargoPersonal } from "../../../types/talento_humano/cargoPersonal"

type propsType = {
    datosCargoPersonal?: CargoPersonal
    onSubmit: (values: CargoPersonalForm) => Promise<void>
    onCancel: () => void
}

export default function CargosPersonalForm({ datosCargoPersonal, onSubmit, onCancel }: propsType) {

    const formArr = useMemo(() => buildCargoPersonalFormArr(), [])

    // Se arma campo por campo: CargoPersonal trae `id`, que el formulario no maneja.
    const initialState: CargoPersonalForm = useMemo(() => (
        datosCargoPersonal
            ? {
                nombre: datosCargoPersonal.nombre,
                tipo_contrato: datosCargoPersonal.tipo_contrato,
            }
            : CargoPersonalInitialValues
    ), [datosCargoPersonal])

    return (
        <Form
            formArr={formArr}
            initialState={initialState}
            schema={cargoPersonalFormSchema}
            submitLabel={datosCargoPersonal ? "Guardar cambios" : "Crear"}
            cancelLabel="Cancelar"
            onSubmit={onSubmit}
            onCancel={onCancel}
        />
    )
}