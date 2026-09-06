import styles from '../../modulos.module.css'
import tabStyles from './ProgramacionProceso.module.css'
import { useState } from 'react';
import useIsMobile from '../../../hooks/useIsMobile';
import ProgramacionProcesoInventario from './ProgramacionProcesoInventario';


type AreaProceso = "inventario" | "historial"

const AREAS: { id: AreaProceso; label: string }[] = [
    { id: "inventario", label: "Lotes en inventario" },
    { id: "historial", label: "Historial procesado" },
]

export default function ProgramacionProceso() {
    const isMobile = useIsMobile();
    
    const [area, setArea] = useState<AreaProceso>("inventario");
    
    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Proceso de lote</h2>

                <div className={styles.toolbarActions}>

                </div>
            </div>

            {/* role="tablist"/"tab" no es decoración: es lo que hace que el lector
                de pantalla las anuncie como pestañas y lo que engancha el estilo
                de la activa, que cuelga de aria-selected. */}
            <div className={tabStyles["pl-tabs"]} role="tablist" aria-label="Vistas de proceso">
                {AREAS.map((a) => (
                    <button
                        key={a.id}
                        type="button"
                        role="tab"
                        id={`tab-${a.id}`}
                        aria-selected={area === a.id}
                        // Solo la pestaña activa apunta al panel: el inactivo no
                        // se renderiza, y un aria-controls hacia un id que no
                        // existe deja al lector de pantalla anunciando contenido
                        // que no puede alcanzar.
                        aria-controls={area === a.id ? `panel-${a.id}` : undefined}
                        className={tabStyles["pl-tab"]}
                        onClick={() => setArea(a.id)}
                    >
                        {a.label}
                    </button>
                ))}
            </div>

            <div id={`panel-${area}`} role="tabpanel" aria-labelledby={`tab-${area}`}>
                {area === "inventario" && <ProgramacionProcesoInventario isMobile={isMobile} />}
            </div>

        </div>
    )
}
