import { useMemo } from "react";
import Form from "../../../components/funcionalidad/form/Form";
import { buildLlaveNfcFormArr, LlaveNfcInventarioFormType, llaveNfcFormSchema, LlavesNfcFormInitialValues, toLlaveNfcFormValues } from "./validations";
import { LlaveNfc } from "../../../types/inventarios/llaves_nfc";

type propsType = {
    datosLlave?: LlaveNfc
    handleSubmit: (values: LlaveNfcInventarioFormType) => Promise<void>
    onCancel: () => void
}

export default function LlaveNfcForm({
    datosLlave,
    handleSubmit,
    onCancel,
}: propsType) {
    const formArr = useMemo(() => buildLlaveNfcFormArr(), [])

    const initialState: LlaveNfcInventarioFormType = datosLlave
        ? toLlaveNfcFormValues(datosLlave)
        : LlavesNfcFormInitialValues

    return (
        <Form
            formArr={formArr}
            initialState={initialState}
            schema={llaveNfcFormSchema}
            title="Editar llave NFC"
            // El UID y el código no se editan; se muestran para saber qué llave es.
            description={datosLlave && `${datosLlave.codigo} · ${datosLlave.uid}`}
            submitLabel="Guardar cambios"
            cancelLabel="Cancelar"
            onSubmit={handleSubmit}
            onCancel={onCancel}
        />
    )
}
