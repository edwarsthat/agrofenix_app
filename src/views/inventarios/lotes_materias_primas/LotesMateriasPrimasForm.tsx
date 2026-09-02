import { useEffect, useMemo } from "react";
import Form from "../../../components/funcionalidad/form/Form";
import {
    buildLoteMateriaPrimaFormArr,
    buildLoteMateriaPrimaInitialValues,
    loteMateriaPrimaFormSchema,
    LoteMateriaPrimaFormType,
} from "./validations";
import type { FormSelectOption } from "../../../components/UI/FormInput/FormSelectInput";
import useMateriaPrima from "../../../store/data/catalogos/useCatalogosStore";
import usePredioStore from "../../../store/data/proveedores/usePredioStore";

type propsType = {
    esEdicion: boolean
    handleSubmit: (values: LoteMateriaPrimaFormType) => Promise<void>
    onCancel: () => void
}

export default function LotesMateriasPrimasForm({ 
    esEdicion,
    handleSubmit,
    onCancel
}:propsType) {
    const { getPredios, predios } = usePredioStore();
    const { getMateriaPrima, materiaPrimaOptions } = useMateriaPrima();
    useEffect(() => {
        getPredios();
        if(materiaPrimaOptions.length === 0) getMateriaPrima();
    },[])

    const prediosOptions = useMemo<FormSelectOption[]>(
        () => predios
            .filter(p => p.activo)
            .map(p => ({ value: p.id, label: `${p.codigo} - ${p.nombre}` })),
        [predios]
    )

    const formArr = useMemo(
        () => buildLoteMateriaPrimaFormArr(prediosOptions, materiaPrimaOptions),
        [prediosOptions, materiaPrimaOptions]
    )
    const initialState = useMemo(() => buildLoteMateriaPrimaInitialValues(),[])
    
    return (
        <Form
            formArr={formArr}
            initialState={initialState}
            schema={loteMateriaPrimaFormSchema}
            title={esEdicion ? "Editar Ingreso" : "Ingreso Lote"}
            cancelLabel="Cancelar"
            onSubmit={handleSubmit}
            onCancel={onCancel}
        />
    )
}