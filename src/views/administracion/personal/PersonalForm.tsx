import { useMemo } from "react";
import Form from "../../../components/funcionalidad/form/Form";
import { buildPersonalFormArr, PersonalFormType, personalFormSchema, PersonalInitialValues } from "./validations";
import useCargoPersonalStore from "../../../store/data/administracion/useCargoPersonalStore";
import { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput";
import { Empleado } from "../../../types/administracion/personal";

type propsType = {
    esEdicion: boolean
    datosEmpleado?: Empleado
    handleSubmit: (values: PersonalFormType) => Promise<void>
    onCancel: () => void
}

export default function PersonalForm({
    esEdicion,
    datosEmpleado,
    handleSubmit,
    onCancel,
}: propsType) {
    const { cargosPersonal } = useCargoPersonalStore();

    // Solo se ofrecen cargos activos: uno inactivo no debe poder asignarse.
    const cargosOptions = useMemo<FormSelectOption[]>(
        () => cargosPersonal
            .filter(c => c.activo)
            .map(c => ({ value: c.id, label: c.nombre })),
        [cargosPersonal]
    )

    const formArr = useMemo(() => buildPersonalFormArr(cargosOptions), [cargosOptions])

    const initialState: PersonalFormType = datosEmpleado
        ? {
            nombre: datosEmpleado.nombre,
            apellido: datosEmpleado.apellido,
            tipo_documento: datosEmpleado.tipo_documento,
            documento: datosEmpleado.documento,
            fecha_nacimiento: datosEmpleado.fecha_nacimiento ?? "",
            telefono: datosEmpleado.telefono ?? "",
            cargo_id: datosEmpleado.cargo_id,
            fecha_ingreso: datosEmpleado.fecha_ingreso,
        }
        : PersonalInitialValues

    return (
        <Form
            formArr={formArr}
            initialState={initialState}
            schema={personalFormSchema}
            title={esEdicion ? "Editar Empleado" : "Crear Empleado"}
            submitLabel={esEdicion ? "Guardar cambios" : "Crear"}
            cancelLabel="Cancelar"
            onSubmit={handleSubmit}
            onCancel={onCancel}
        />
    )
}
