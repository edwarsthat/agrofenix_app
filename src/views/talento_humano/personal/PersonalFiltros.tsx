import { useMemo, useState } from "react";
import Form from "../../../components/funcionalidad/form/Form";
import { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput";
import useCargoPersonalStore from "../../../store/data/talento_humano/useCargoPersonalStore";
import {
    buildPersonalFiltrosArr,
    personalFiltrosSchema,
    PersonalFiltrosInitialValues,
    PersonalFiltrosType,
    PersonalReadPayload,
    toPersonalReadPayload,
} from "./validations";

type propsType = {
    onBuscar: (payload: PersonalReadPayload) => void
    loading?: boolean
}

export default function PersonalFiltros({ onBuscar, loading = false }: propsType) {
    const { cargosPersonal } = useCargoPersonalStore();
    // useForm solo lee initialState en el primer render, así que para limpiar
    // hay que remontar el <Form> cambiándole la key.
    const [resetKey, setResetKey] = useState(0)

    const cargosOptions = useMemo<FormSelectOption[]>(
        () => cargosPersonal
            .filter(c => c.activo)
            .map(c => ({ value: c.id, label: c.nombre })),
        [cargosPersonal]
    )

    const formArr = useMemo(() => buildPersonalFiltrosArr(cargosOptions), [cargosOptions])

    const handleBuscar = (filtros: PersonalFiltrosType) => {
        onBuscar(toPersonalReadPayload(filtros))
    }

    const handleLimpiar = () => {
        setResetKey(key => key + 1)
        onBuscar(toPersonalReadPayload(PersonalFiltrosInitialValues))
    }

    return (
        <Form
            key={resetKey}
            formArr={formArr}
            initialState={PersonalFiltrosInitialValues}
            schema={personalFiltrosSchema}
            title="Filtros"
            submitLabel="Buscar"
            cancelLabel="Limpiar"
            onSubmit={handleBuscar}
            onCancel={handleLimpiar}
            loading={loading}
        />
    )
}
