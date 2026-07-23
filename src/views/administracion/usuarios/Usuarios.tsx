import { useEffect, useMemo } from "react";
import useUsuarioStore from "../../../store/data/administracion/useUsuariosStore"
import styles from "../../modulos.module.css"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla";
import { Usuario } from "../../../types/administracion/usuarios";
import useCargoStore from "../../../store/data/administracion/useCargoStore";

export default function Usuarios() {
    const { getUsuarios, usuarios } = useUsuarioStore();
    const { cargos, getCargos } = useCargoStore();

    useEffect(() => {
        if (usuarios.length === 0 ) getUsuarios()
        if (cargos.length === 0) getCargos()
    }, [])

    const nombrePorCargo = useMemo(() => {
        const mapa = new Map<string, string>()
        cargos.forEach((c) => mapa.set(c.id, c.nombre))
        return mapa
    }, [cargos])

    const columns: TablaColumn<Usuario>[] = useMemo(() => [
        {
            key: "nombre",
            header: "Nombre",
            width: "1.4fr",
            render: (u) => `${u.nombre} ${u.apellido}`,
        },
        { key: "usuario", header: "Usuario", width: "1fr" },
        { key: "email", header: "Correo", width: "1.6fr" },
        {
            key: "cargo_id",
            header: "Cargo",
            width: "1fr",
           render: (u) => nombrePorCargo.get(u.cargo_id) ?? "—",
        },
        { key: "activo", header: "Activo", width: "90px", type: "boolean" },
    ], [])

    const handleEditar = () => { }
    const handleEliminar = () => { }

    return (
        <div>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Usuarios</h2>

            </div>

            <Tabla
                columns={columns}
                data={usuarios}
                rowKey={(cargo) => cargo.id}
                acciones={{ onEditar: handleEditar, onEliminar: handleEliminar }}
                emptyTitle="Sin cargos"
                emptyMessage="Todavía no hay cargos registrados."
            />
        </div>
    )
}