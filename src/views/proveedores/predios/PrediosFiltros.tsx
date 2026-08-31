import { useMemo, useState } from "react"
import Form from "../../../components/funcionalidad/form/Form"
import type { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput"
import useProveedores from "../../../store/data/proveedores/useProveedoresStore"
import {
    buildPrediosFiltrosArr,
    PrediosFiltrosInitialValues,
    prediosFiltrosSchema,
    PrediosFiltrosType,
    PrediosReadPayload,
    toPrediosReadPayload,
} from "./validations"

type propsType = {
    onBuscar: (payload: PrediosReadPayload) => void
    loading?: boolean
}

export default function PrediosFiltros({ onBuscar, loading = false }: propsType) {
    // useForm solo lee initialState en el primer render, así que para limpiar
    // hay que remontar el <Form> cambiándole la key.
    const [resetKey, setResetKey] = useState(0)

    const { proveedores } = useProveedores();

    // A diferencia del formulario, aquí sí se listan los proveedores inactivos:
    // sus predios siguen existiendo y hay que poder consultarlos.
    const proveedorOptions = useMemo<FormSelectOption[]>(
        () => [
            { value: "", label: "Todos los proveedores" },
            ...proveedores.map(p => ({ value: p.id, label: `${p.codigo} - ${p.nombre}` })),
        ],
        [proveedores]
    )

    const formArr = useMemo(() => buildPrediosFiltrosArr(proveedorOptions), [proveedorOptions])

    const handleBuscar = (filtros: PrediosFiltrosType) => {
        onBuscar(toPrediosReadPayload(filtros))
    }

    const handleLimpiar = () => {
        setResetKey(key => key + 1)
        onBuscar(toPrediosReadPayload(PrediosFiltrosInitialValues))
    }

    return (
        <Form
            key={resetKey}
            formArr={formArr}
            initialState={PrediosFiltrosInitialValues}
            schema={prediosFiltrosSchema}
            title="Filtros"
            submitLabel="Buscar"
            cancelLabel="Limpiar"
            onSubmit={handleBuscar}
            onCancel={handleLimpiar}
            loading={loading}
        />
    )
}
