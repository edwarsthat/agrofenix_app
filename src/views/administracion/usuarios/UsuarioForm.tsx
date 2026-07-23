import { useMemo } from "react"
import useCargoStore from "../../../store/data/administracion/useCargoStore"
import { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput"
import { buildUsuarioFormArr, usuarioFormSchema, UsuarioFormType, UsuarioInitialValues } from "./validation"
import Form from "../../../components/funcionalidad/form/Form"

interface propsType {
    esEdicion: boolean
    datosUsuario?: UsuarioFormType
    handleSubmit: (values: UsuarioFormType) => Promise<void>
    onCancel: () => void
}

export default function UsuarioForm({
    esEdicion,
    datosUsuario,
    handleSubmit,
    onCancel
}: propsType ) {

    const { cargos } = useCargoStore()

    const cargoOptions = useMemo<FormSelectOption[]>(
        () => cargos.map(c => ({ value: c.id, label: c.nombre })),
        [cargos]
    )

    const formArr = useMemo(() => buildUsuarioFormArr(cargoOptions), [cargoOptions])

    

    return (
        <Form
            formArr={formArr}
            initialState={datosUsuario ?? UsuarioInitialValues}
            schema={usuarioFormSchema}
            title={esEdicion ? "Editar usuario" : "Crear usuario"}
            onSubmit={handleSubmit}
            onCancel={onCancel}
        />
    )
}