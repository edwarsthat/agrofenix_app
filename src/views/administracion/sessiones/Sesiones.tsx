import { useEffect, useMemo } from "react";
import useSesionesStore from "../../../store/data/administracion/useSesionesStore"
import styles from "../../modulos.module.css"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla";
import useUsuarioStore from "../../../store/data/administracion/useUsuariosStore";
import useCargoStore from "../../../store/data/administracion/useCargoStore";
import { Sesion } from "../../../types/administracion/sesiones";
import MobileList from "../../../components/funcionalidad/listasMobile/MobileList";
import { CardColumn } from "../../../components/funcionalidad/listasMobile/CardRow";
import useIsMobile from "../../../hooks/useIsMobile";
import { Trash2 } from "lucide-react";
import { AccionFila } from "../../../components/funcionalidad/acciones";

// `expira_en` llega como ISO del backend; se muestra en horario local.
function formatearFecha(iso: string): string {
    const fecha = new Date(iso)
    if (Number.isNaN(fecha.getTime())) return "—"
    return fecha.toLocaleString("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
    })
}

export default function Sesiones() {
    const { sesiones, getSessiones, deleteSesiones } = useSesionesStore();
    const { usuarios, getUsuarios } = useUsuarioStore();
    const { cargos, getCargos } = useCargoStore();
    const isMobile = useIsMobile();

    useEffect(() => {
        getSessiones()
        if (usuarios.length === 0) getUsuarios()
        if (cargos.length === 0) getCargos()
    }, [])

    const nombrePorUsuario = useMemo(() => {
        const mapa = new Map<string, string>()
        usuarios.forEach((u) => mapa.set(u.id, u.usuario))
        return mapa
    }, [usuarios])

    const nombrePorCargo = useMemo(() => {
        const mapa = new Map<string, string>()
        cargos.forEach((c) => mapa.set(c.id, c.nombre))
        return mapa
    }, [cargos])

    const columns: TablaColumn<Sesion>[] = useMemo(() => [
        {
            key: "usuario_id",
            header: "Usuario",
            width: "1.5fr",
            render: (s) => nombrePorUsuario.get(s.usuario_id) ?? "—",
        },
        {
            key: "cargo_id",
            header: "Cargo",
            width: "1.5fr",
            render: (s) => nombrePorCargo.get(s.cargo_id) ?? "—",
        },
        {
            key: "expira_en",
            header: "Expira",
            width: "1fr",
            render: (s) => formatearFecha(s.expira_en),
        },
    ], [nombrePorUsuario, nombrePorCargo])

    // En móvil el usuario va en el título de la tarjeta y el cargo en el subtítulo.
    const columnsMobile: CardColumn<Sesion>[] = useMemo(() => [
        {
            key: "expira_en",
            header: "Expira",
            fullWidth: true,
            render: (s) => formatearFecha(s.expira_en),
        },
    ], [])

    const handleEliminar = async (sesion: Sesion) => {
        await deleteSesiones(sesion.usuario_id)
    }

    // Mismas acciones para escritorio (Tabla) y móvil (MobileList).
    const acciones: AccionFila<Sesion>[] = [
        { id: "eliminar", icono: Trash2, titulo: "Cerrar sesión", onClick: handleEliminar, variante: "danger" },
    ]
    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Sesiones</h2>
            </div>

            {isMobile ? (
                <MobileList
                    columns={columnsMobile}
                    data={sesiones}
                    rowKey={(sesion) => `${sesion.usuario_id}-${sesion.expira_en}`}
                    titulo={(s) => nombrePorUsuario.get(s.usuario_id) ?? "—"}
                    subtitulo={(s) => nombrePorCargo.get(s.cargo_id) ?? "—"}
                    emptyMessage="No hay sesiones activas en este momento."
                    acciones={acciones}
                />
            ) : (
                <Tabla
                    columns={columns}
                    data={sesiones}
                    rowKey={(sesion) => `${sesion.usuario_id}-${sesion.expira_en}`}
                    emptyTitle="Sin sesiones"
                    emptyMessage="No hay sesiones activas en este momento."
                    acciones={acciones}
                />
            )}
        </div>
    )
}
