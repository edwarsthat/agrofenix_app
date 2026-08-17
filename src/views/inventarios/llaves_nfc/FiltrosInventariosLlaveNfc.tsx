import { useEffect, useMemo, useState } from "react"
import { buildLlavesNfcFiltrosArr, LlaveNfcReadPayload, LlavesNfcFiltrosInitialValues, llavesNfcFiltrosSchema, LlavesNfcFiltrosType, toLlavesNfcReadPayload } from "./validations"
import Form from "../../../components/funcionalidad/form/Form"

type propstType = {
    uid?: string
    onBuscar: (payload: LlaveNfcReadPayload) => void
    loading?: boolean
}

export default function FiltrosInventariosLlaveNfc({ 
    onBuscar, 
    loading = false,
    uid = ""
}: propstType) {
    const [resetKey, setResetKey] = useState(0);
    // Copia local del UID leído: así "Limpiar" puede vaciar el campo sin
    // depender de que el padre borre su state.
    const [uidFiltro, setUidFiltro] = useState(uid);

    // Cada lectura nueva sobrescribe lo que hubiera escrito en el campo.
    useEffect(() => { setUidFiltro(uid) }, [uid])

    const formArr = useMemo(() => buildLlavesNfcFiltrosArr(), [])

    // <Form> siembra su state una sola vez (useForm), por eso el UID entra como
    // valor inicial y el key fuerza el remonte cuando cambia.
    const initialState = useMemo(
        () => ({ ...LlavesNfcFiltrosInitialValues, uid: uidFiltro }),
        [uidFiltro]
    )

    const handleBuscar = (filstros: LlavesNfcFiltrosType) => {
        onBuscar(toLlavesNfcReadPayload(filstros))
    }
    const handleLimpiar = () => {
        setUidFiltro("")
        setResetKey(key => key + 1)
        onBuscar(toLlavesNfcReadPayload(LlavesNfcFiltrosInitialValues))
    }

    return (
        <Form
            key={`${resetKey}-${uidFiltro}`}
            formArr={formArr}
            initialState={initialState}
            schema={llavesNfcFiltrosSchema}
            title="Filtros"
            submitLabel="Buscar"
            cancelLabel="Limpiar"
            onSubmit={handleBuscar}
            onCancel={handleLimpiar}
            loading={loading}
        />
    )
}