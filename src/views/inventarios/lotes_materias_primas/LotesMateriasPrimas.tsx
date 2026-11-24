import styles from '../../modulos.module.css'
import { useEffect, useMemo, useState } from 'react'
import { IngresoMateriaPrima } from '../../../types/inventarios/materias_primas/ingresosMateriasPrimas'
import { InventarioMateriaPrima } from '../../../types/inventarios/materias_primas/lotesInventario'
import { LoteMateriaPrimaFormType, nuevaClaveIdempotencia } from './validations'
import { modal } from '../../../store/useModalStore'
import useIngresoLoteMateriasPrimasStore from '../../../store/data/inventarios/materias_primas/useIngresoLoteMateriasPrimas'
import useInventarioMateriasPrimasStore from '../../../store/data/inventarios/materias_primas/useInventarioMateriasPrimas'
import useMateriaPrima from '../../../store/data/catalogos/useCatalogosStore'
import LotesMateriasPrimasForm from './LotesMateriasPrimasForm'
import InventarioHeader, { MateriaPrimaResumen, TotalesInventario } from './InventarioHeader'
import InventarioAllLotes from './InventarioAllLotes'
import useIsMobile from '../../../hooks/useIsMobile'

const sumarLotes = (lotes: InventarioMateriaPrima[]): TotalesInventario => ({
    lotes: lotes.length,
    ingresadoKg: lotes.reduce((total, l) => total + l.peso_ingreso, 0),
    disponibleKg: lotes.reduce((total, l) => total + l.saldo, 0),
})

export default function LotesMateriasPrimas() {
    const isMobile = useIsMobile();
    const { addLotesMateriasPrimas } = useIngresoLoteMateriasPrimasStore();
    const { getInventarioMateriaPrima, lotesActualMateriasPrimas } = useInventarioMateriasPrimasStore();
    const { getMateriaPrima, materiaPrima } = useMateriaPrima();
    const [materiaId, setMateriaId] = useState<string | null>(null);

    useEffect(() => {
        getInventarioMateriaPrima()
    }, [getInventarioMateriaPrima])

    useEffect(() => {
        if (useMateriaPrima.getState().materiaPrima.length === 0) getMateriaPrima()
    }, [getMateriaPrima])

    // Las materias salen del catálogo y no de los lotes, para que aparezcan
    // aunque no tengan nada en patio. Una inactiva solo se muestra si todavía le
    // quedan lotes: sin su chip no habría cómo filtrarlos.
    const materias: MateriaPrimaResumen[] = useMemo(() => (
        materiaPrima
            .map((m) => ({
                id: m.id,
                nombre: m.nombre,
                activo: m.activo,
                ...sumarLotes(lotesActualMateriasPrimas.filter(l => l.materia_prima_id === m.id)),
            }))
            .filter(m => m.activo || m.lotes > 0)
            .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    ), [materiaPrima, lotesActualMateriasPrimas])

    // Se suma sobre los lotes y no sobre `materias`: así el total no depende de
    // que el catálogo haya cargado.
    const totales = useMemo(() => sumarLotes(lotesActualMateriasPrimas), [lotesActualMateriasPrimas])

    const lotesFiltrados = useMemo(() => (
        materiaId === null
            ? lotesActualMateriasPrimas
            : lotesActualMateriasPrimas.filter(l => l.materia_prima_id === materiaId)
    ), [lotesActualMateriasPrimas, materiaId])

    const abrirFormulario = (lote?: IngresoMateriaPrima) => {
        const esEdicion = Boolean(lote)
        // Una clave por apertura: los reintentos desde este formulario la
        // comparten, y el siguiente camión estrena la suya.
        const clave = nuevaClaveIdempotencia()

        const handleSubmit = async (values: LoteMateriaPrimaFormType) => {
            if (esEdicion) {
                modal.close()
                return
            }

            // Si falla no se cierra: reintentar desde aquí conserva la clave.
            const ingreso = await addLotesMateriasPrimas(values, clave)
            if (!ingreso) return

            modal.close()
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
        <div className={styles.page}>
            <InventarioHeader
                materias={materias}
                totales={totales}
                materiaSeleccionada={materiaId}
                onMateriaChange={setMateriaId}
                onIngresarLote={() => abrirFormulario()}
            />

            <InventarioAllLotes isMobile={isMobile} lotes={lotesFiltrados} />
        </div>
    )
}