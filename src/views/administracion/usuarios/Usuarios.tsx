import { useEffect, useMemo, useState } from "react";
import useUsuarioStore from "../../../store/data/administracion/useUsuariosStore"
import styles from "../../modulos.module.css"
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { KeyRound, Plus, Search } from "lucide-react"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla";
import { Usuario } from "../../../types/administracion/usuarios";
import useCargoStore from "../../../store/data/administracion/useCargoStore";
import { modal } from "../../../store/useModalStore";
import { UsuarioFormType } from "./validation";
import UsuarioForm from "./UsuarioForm";
import PasswordTemporal from "./PasswordTemporal";
import MobileList from "../../../components/funcionalidad/listasMobile/MobileList";
import { CardColumn } from "../../../components/funcionalidad/listasMobile/CardRow";
import useIsMobile from "../../../hooks/useIsMobile";
import { AccionFila, accionEditar, accionEliminar, accionReactivar } from "../../../components/funcionalidad/acciones";

export default function Usuarios() {
    const {
        getUsuarios,
        usuarios,
        addUsuario,
        updateUsuario,
        eliminarUsuario,
        newPassword,
        reActivarUsuario
    } = useUsuarioStore();
    const { cargos, getCargos } = useCargoStore();
    const [busqueda, setBusqueda] = useState("")
    const isMobile = useIsMobile()

    useEffect(() => {
        if (usuarios.length === 0) getUsuarios()
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
    ], [nombrePorCargo])

    // En móvil el nombre va en el título de la tarjeta, el usuario en el subtítulo
    // y el estado en la insignia, así que el grid de metadatos solo lleva el resto.
    const columnsMobile: CardColumn<Usuario>[] = useMemo(() => [
        { key: "email", header: "Correo", fullWidth: true },
        {
            key: "cargo_id",
            header: "Cargo",
            render: (u) => nombrePorCargo.get(u.cargo_id) ?? "—",
        },
    ], [nombrePorCargo])

    // Filtra por nombre, apellido, usuario o cargo (ignora mayúsculas y espacios sobrantes).
    const usuariosFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        if (!q) return usuarios
        return usuarios.filter((u) => {
            const cargo = nombrePorCargo.get(u.cargo_id) ?? ""
            return (
                `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
                u.usuario.toLowerCase().includes(q) ||
                cargo.toLowerCase().includes(q)
            )
        })
    }, [usuarios, busqueda, nombrePorCargo])

    const handleEliminar = async (usuario: Usuario) => {
        await eliminarUsuario(usuario.id)
    }
    const handleResetPassword = async (usuario: Usuario) => {
        const response = await newPassword(usuario.id)

        if (!response) return

        modal.show({
            size: "sm",
            hideCloseButton: true,
            closeOnEsc: false,
            children: (
                <PasswordTemporal
                    password={response.password_temporal}
                    usuario={usuario.usuario}
                    onClose={modal.close}
                />
            ),
        })

    }
    const handleReactivar = async (usuario: Usuario) => {
        const response = await reActivarUsuario(usuario.id)

        if (!response) return

        modal.show({
            size: "sm",
            hideCloseButton: true,
            closeOnEsc: false,
            children: (
                <PasswordTemporal
                    password={response.password_temporal}
                    usuario={usuario.usuario}
                    onClose={modal.close}
                />
            ),
        })
    }
    const abrirFormulario = (usuario?: Usuario) => {
        const esEdicion = Boolean(usuario)

        const handleSubmit = async (values: UsuarioFormType) => {
            if (esEdicion) {
                if (!usuario?.id) return

                const updated = await updateUsuario(usuario?.id, values)
                if (updated) {
                    modal.close()
                }
                return
            }

            const creado = await addUsuario(values)
            if (!creado) return

            modal.show({
                size: "sm",
                hideCloseButton: true,
                closeOnEsc: false,
                children: (
                    <PasswordTemporal
                        password={creado.password_temporal}
                        usuario={values.usuario}
                        onClose={modal.close}
                    />
                ),
            })
        }


        modal.show({
            title: esEdicion ? "Editar usuario" : "Crear usuario",
            children: (
                <UsuarioForm
                    esEdicion={esEdicion}
                    datosUsuario={usuario}
                    handleSubmit={handleSubmit}
                    onCancel={modal.close}
                />
            ),
        })
    }

    // Mismas acciones para escritorio (Tabla) y móvil (MobileList).
    const acciones: AccionFila<Usuario>[] = [
        accionEditar(abrirFormulario),
        { id: "password", icono: KeyRound, titulo: "Cambiar contraseña", onClick: handleResetPassword },
        accionEliminar(handleEliminar),
        accionReactivar(handleReactivar),
    ]

    return (
        <div>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Usuarios</h2>
                <label className={tableStyles.searchInput}>
                    <Search size={15} />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre o cargo..."
                    />
                </label>

                <button type="button" className={tableStyles.addButton} onClick={() => abrirFormulario()}>
                    <Plus size={16} />
                    Agregar Usuario
                </button>
            </div>

            {isMobile ? (
                <MobileList
                    columns={columnsMobile}
                    data={usuariosFiltrados}
                    rowKey={(usuario) => usuario.id}
                    titulo={(u) => `${u.nombre} ${u.apellido}`}
                    subtitulo={(u) => `@${u.usuario}`}
                    estaActivo={(u) => u.activo}
                    acciones={acciones}
                    emptyMessage="Todavía no hay usuarios registrados."
                />
            ) : (
                <Tabla
                    columns={columns}
                    data={usuariosFiltrados}
                    rowKey={(cargo) => cargo.id}
                    acciones={acciones}
                    emptyTitle="Sin cargos"
                    emptyMessage="Todavía no hay cargos registrados."
                />
            )}
        </div>
    )
}