import styles from '../../modulos.module.css'
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { Plus } from "lucide-react"
import { useEffect } from 'react'
import { modal } from "../../../store/useModalStore"
import useProveedores from '../../../store/data/proveedores/useProveedoresStore'
import PrediosForms from './PrediosForms'
import { Predio } from '../../../types/proveedores/predios'
import { PredioFormType } from './validations'
import usePredioStore from '../../../store/data/proveedores/usePredioStore'

export default function Predios() {
    const { getProveedores } = useProveedores();
    const { addPredio } = usePredioStore();

    useEffect(() => {
        if (useProveedores.getState().proveedores.length === 0) getProveedores()
    }, [getProveedores])

    const abrirFormulario = (predio?: Predio) => {
        const esEdicion = Boolean(predio)

        const handleSubmit = async (values: PredioFormType) => {

            const creado = await addPredio(values)
            if (!creado) return

            modal.close()
        }

        modal.show({
            title: esEdicion ? "Editar predio" : "Crear predio",
            children: (
                <PrediosForms
                    esEdicion={esEdicion}
                    datosPredio={predio}
                    handleSubmit={handleSubmit}
                    onCancel={modal.close}
                />
            ),
        })
    }

    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Predios</h2>

                <div className={styles.toolbarActions}>

                    <button type="button" className={tableStyles.addButton} onClick={() => abrirFormulario()}>
                        <Plus size={16} />
                        Agregar Predio
                    </button>
                </div>
            </div>

        </div>
    )
}
