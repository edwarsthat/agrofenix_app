import { useMemo } from "react";
import Form from "../../../components/funcionalidad/form/Form";
import { buildProveedorFormArr, ProveedorFormType, proveedorFormSchema, ProveedorInitialValues } from "./validations";
import { Proveedor } from "../../../types/proveedores/proveedores";

type propsType = {
    esEdicion: boolean
    datosProveedor?: Proveedor
    handleSubmit: (values: ProveedorFormType) => Promise<void>
    onCancel: () => void
}

export default function FormProveedores({
    esEdicion,
    datosProveedor,
    handleSubmit,
    onCancel,
}: propsType) {
    // Los campos son fijos: ninguno depende de datos de otro store.
    const formArr = useMemo(() => buildProveedorFormArr(), [])

    // Lo que en el proveedor es null viaja al formulario como "": los inputs no
    // manejan null y `toProveedorAddPayload` vuelve a omitir los vacíos al enviar.
    const initialState: ProveedorFormType = datosProveedor
        ? {
            tipo_proveedor: datosProveedor.tipo_proveedor,
            tipo_persona: datosProveedor.tipo_persona,
            tipo_documento: datosProveedor.tipo_documento,
            documento: datosProveedor.documento,
            digito_verificacion: datosProveedor.digito_verificacion ?? "",

            nombre: datosProveedor.nombre,
            razon_social: datosProveedor.razon_social ?? "",

            telefono: datosProveedor.telefono ?? "",
            telefono_alterno: datosProveedor.telefono_alterno ?? "",
            email: datosProveedor.email ?? "",
            direccion: datosProveedor.direccion ?? "",
            departamento: datosProveedor.departamento ?? "",
            municipio: datosProveedor.municipio ?? "",
            contacto_nombre: datosProveedor.contacto_nombre ?? "",
            contacto_telefono: datosProveedor.contacto_telefono ?? "",

            banco: datosProveedor.banco ?? "",
            tipo_cuenta: datosProveedor.tipo_cuenta ?? "",
            numero_cuenta: datosProveedor.numero_cuenta ?? "",
            titular_cuenta: datosProveedor.titular_cuenta ?? "",
            titular_documento: datosProveedor.titular_documento ?? "",

            observaciones: datosProveedor.observaciones ?? "",
        }
        : ProveedorInitialValues

    return (
        <Form
            formArr={formArr}
            initialState={initialState}
            schema={proveedorFormSchema}
            title={esEdicion ? "Editar Proveedor" : "Crear Proveedor"}
            submitLabel={esEdicion ? "Guardar cambios" : "Crear"}
            cancelLabel="Cancelar"
            onSubmit={handleSubmit}
            onCancel={onCancel}
        />
    )
}
