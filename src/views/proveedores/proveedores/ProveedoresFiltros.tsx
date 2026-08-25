import { useMemo, useState } from "react"
import Form from "../../../components/funcionalidad/form/Form"
import {
    buildProveedoresFiltrosArr,
    ProveedorReadPayload,
    ProveedoresFiltrosInitialValues,
    proveedoresFiltrosSchema,
    ProveedoresFiltrosType,
    toProveedoresReadPayload,
} from "./validations"

type propsType = {
    onBuscar: (payload: ProveedorReadPayload) => void
    loading?: boolean
}

export default function ProveedoresFiltros({ onBuscar, loading = false }: propsType) {
    // useForm solo lee initialState en el primer render, así que para limpiar
    // hay que remontar el <Form> cambiándole la key.
    const [resetKey, setResetKey] = useState(0)

    const formArr = useMemo(() => buildProveedoresFiltrosArr(), [])

    const handleBuscar = (filtros: ProveedoresFiltrosType) => {
        onBuscar(toProveedoresReadPayload(filtros))
    }

    const handleLimpiar = () => {
        setResetKey(key => key + 1)
        onBuscar(toProveedoresReadPayload(ProveedoresFiltrosInitialValues))
    }

    return (
        <Form
            key={resetKey}
            formArr={formArr}
            initialState={ProveedoresFiltrosInitialValues}
            schema={proveedoresFiltrosSchema}
            title="Filtros"
            submitLabel="Buscar"
            cancelLabel="Limpiar"
            onSubmit={handleBuscar}
            onCancel={handleLimpiar}
            loading={loading}
        />
    )
}
