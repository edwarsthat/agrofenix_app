import styles from '../../modulos.module.css'
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { Plus } from 'lucide-react'
import { IngresoMateriaPrima } from '../../../types/inventarios/materias_primas/ingresosMateriasPrimas'
import { LoteMateriaPrimaFormType } from './validations'
import { modal } from '../../../store/useModalStore'
import useIngresoLoteMateriasPrimasStore from '../../../store/data/inventarios/materias_primas/useIngresoLoteMateriasPrimas'
import useClaveIdempotencia from '../../../hooks/useClaveIdempotencia'
import LotesMateriasPrimasForm from './LotesMateriasPrimasForm'

export default function LotesMateriasPrimas() {
    const { addLotesMateriasPrimas } = useIngresoLoteMateriasPrimasStore();
    const { clave, rotar } = useClaveIdempotencia();
    const abrirFormulario = (lote?: IngresoMateriaPrima) => {
        const esEdicion = Boolean(lote)

        const handleSubmit = async (values: LoteMateriaPrimaFormType) => {
            if (esEdicion) {
                modal.close()
                return
            }

            const ingreso = await addLotesMateriasPrimas(values, clave);
            if (!ingreso) {
                modal.close
                return
            }

            rotar();
            modal.close();
            return
        }

        modal.show({
            title: "",
            children: (
                <LotesMateriasPrimasForm
                    esEdicion={esEdicion}
                    handleSubmit={handleSubmit}
                    onCancel={modal.close} />
            )
        })
    }

    return (
        <div className={styles.pages}>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Inventario Materias Primas</h2>

                <div className={styles.toolbarActions}>

                    <button type="button" className={tableStyles.addButton} onClick={() => abrirFormulario()}>
                        <Plus size={16} />
                        Ingresar Lote
                    </button>
                </div>
            </div>
        </div>
    )
}