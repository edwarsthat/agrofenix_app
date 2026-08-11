import { useEffect, useMemo } from "react";
import useSesionesStore from "../../../store/data/administracion/useSesionesStore"
import styles from "../../modulos.module.css"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla";
import useUsuarioStore from "../../../store/data/administracion/useUsuariosStore";
import useCargoStore from "../../../store/data/administracion/useCargoStore";
import { Sesion } from "../../../types/administracion/sesiones";

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

    const handleEliminar = async (sesion: Sesion) => {
        await deleteSesiones(sesion.usuario_id)
    }
    return (
        <div className={styles.page}>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Sesiones</h2>
            </div>

            <Tabla
                columns={columns}
                data={sesiones}
                rowKey={(sesion) => `${sesion.usuario_id}-${sesion.expira_en}`}
                emptyTitle="Sin sesiones"
                emptyMessage="No hay sesiones activas en este momento."
                acciones={{
                    onEliminar: handleEliminar
                }}
            />
        </div>
    )
}
