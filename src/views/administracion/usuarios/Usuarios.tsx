import { useEffect, useMemo } from "react";
import useUsuarioStore from "../../../store/data/administracion/useUsuariosStore"
import styles from "../../modulos.module.css"
import tableStyles from "../../../components/funcionalidad/tablas/Table.module.css"
import { Plus } from "lucide-react"
import Tabla, { TablaColumn } from "../../../components/funcionalidad/tablas/Tabla";
import { Usuario } from "../../../types/administracion/usuarios";
import useCargoStore from "../../../store/data/administracion/useCargoStore";
import { modal } from "../../../store/useModalStore";
import { UsuarioFormType } from "./validation";
import UsuarioForm from "./UsuarioForm";
import PasswordTemporal from "./PasswordTemporal";

export default function Usuarios() {
    const { getUsuarios, usuarios, addUsuario, updateUsuario } = useUsuarioStore();
    const { cargos, getCargos } = useCargoStore();

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
    ], [])

    const handleEliminar = async () => { }

    const abrirFormulario = (usuario?: Usuario) => {
        const esEdicion = Boolean(usuario)

        const handleSubmit = async (values: UsuarioFormType) => {
            if (esEdicion) {
                if(!usuario?.id) return
                
                const updated = await updateUsuario(usuario?.id, values)
                if(updated){

                } else {
                    return;
                }
            }

            const creado = await addUsuario(values)
            if (!creado) return

            modal.show({
                size: "sm",
                hideCloseButton: true,
                closeOnBackdropClick: false,
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

    return (
        <div>
            <div className={styles.toolbar}>
                <h2 className={styles.toolbarTitle}>Usuarios</h2>

                <button type="button" className={tableStyles.addButton} onClick={() => abrirFormulario()}>
                    <Plus size={16} />
                    Agregar Usuario
                </button>
            </div>

            <Tabla
                columns={columns}
                data={usuarios}
                rowKey={(cargo) => cargo.id}
                acciones={{ onEditar: abrirFormulario, onEliminar: handleEliminar }}
                emptyTitle="Sin cargos"
                emptyMessage="Todavía no hay cargos registrados."
            />
        </div>
    )
}