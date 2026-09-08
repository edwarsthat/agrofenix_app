import styles from '../../modulos.module.css'
import tabStyles from './ProgramacionProceso.module.css'
import { useEffect, useMemo, useState } from 'react';
import useIsMobile from '../../../hooks/useIsMobile';
import ProgramacionProcesoInventario from './ProgramacionProcesoInventario';
import ProgramacionProcesarLoteProcesando from './ProgramacionProcesarLoteProcesando';
import useProgramacionProcesoStore from '../../../store/data/proceso/useProgramacionProceso';
import useInventarioMateriasPrimasStore from "../../../store/data/inventarios/materias_primas/useInventarioMateriasPrimas"


type AreaProceso = "inventario" | "historial"

const AREAS: { id: AreaProceso; label: string }[] = [
    { id: "inventario", label: "Lotes en inventario" },
    { id: "historial", label: "Historial procesado" },
]

export default function ProgramacionProceso() {
    const isMobile = useIsMobile();
    const { getInventarioMateriaPrima, lotesActualMateriasPrimas } = useInventarioMateriasPrimasStore();
    const { getLotesProcesando, loteProcesando } = useProgramacionProcesoStore();
    const [area, setArea] = useState<AreaProceso>("inventario");

    useEffect(() => {
        getInventarioMateriaPrima()
        getLotesProcesando()
    }, [getInventarioMateriaPrima, getLotesProcesando])

    const lotesEnProceso = useMemo(() => (
        loteProcesando.map((programacion) => ({
            programacion,
            lote: lotesActualMateriasPrimas
                .find(l => l.lote_id === programacion.lote_id) ?? null,
        }))
    ), [lotesActualMateriasPrimas, loteProcesando])

    // Solo con una programación abierta se sabe cuál va a cerrar la nueva. Con
    // varias corriendo no hay forma de saberlo desde aquí, así que no se avisa
    // nada en vez de señalar una al azar.
    const codigoLoteEnProceso = lotesEnProceso.length === 1
        ? lotesEnProceso[0].lote?.codigo ?? null
        : null

    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Proceso de lote</h2>

                <div className={styles.toolbarActions}>

                </div>
            </div>

            {lotesEnProceso.length === 0 ? (
                <ProgramacionProcesarLoteProcesando programacion={null} />
            ) : (
                lotesEnProceso.map(({ programacion, lote }) => (
                    <ProgramacionProcesarLoteProcesando
                        key={programacion.id}
                        programacion={programacion}
                        lote={lote}
                    />
                ))
            )}

            <div className={tabStyles["pl-tabs"]} role="tablist" aria-label="Vistas de proceso">
                {AREAS.map((a) => (
                    <button
                        key={a.id}
                        type="button"
                        role="tab"
                        id={`tab-${a.id}`}
                        aria-selected={area === a.id}
                        aria-controls={area === a.id ? `panel-${a.id}` : undefined}
                        className={tabStyles["pl-tab"]}
                        onClick={() => setArea(a.id)}
                    >
                        {a.label}
                    </button>
                ))}
            </div>

            <div id={`panel-${area}`} role="tabpanel" aria-labelledby={`tab-${area}`}>
                {area === "inventario" &&
                    <ProgramacionProcesoInventario
                        isMobile={isMobile}
                        lotesEnProceso={loteProcesando}
                        lotesActualMateriasPrimas={lotesActualMateriasPrimas}
                        codigoLoteEnProceso={codigoLoteEnProceso}
                    />
                }
            </div>

        </div>
    )
}
