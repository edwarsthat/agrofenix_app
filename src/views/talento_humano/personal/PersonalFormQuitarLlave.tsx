import { useMemo } from "react";
import Form from "../../../components/funcionalidad/form/Form";
import {
    buildQuitarLlaveFormArr,
    QuitarLlaveFormType,
    quitarLlaveFormSchema,
    QuitarLlaveInitialValues,
} from "./validations";

type propsType = {
    handleSubmit: (values: QuitarLlaveFormType) => Promise<void>
    onCancel: () => void
}

// Solo el motivo. Qué empleado y qué llave son los pone el modal que lo abre,
// en su título y su descripción, así no salen dos encabezados apilados.
export default function PersonalFormQuitarLlave({
    handleSubmit,
    onCancel,
}: propsType) {
    const formArr = useMemo(() => buildQuitarLlaveFormArr(), [])

    return (
        <Form
            formArr={formArr}
            initialState={QuitarLlaveInitialValues}
            schema={quitarLlaveFormSchema}
            submitLabel="Quitar llave"
            cancelLabel="Cancelar"
            onSubmit={handleSubmit}
            onCancel={onCancel}
        />
    )
}
