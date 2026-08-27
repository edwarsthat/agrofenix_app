import { ReactNode, useState } from "react"
import {
    Eye,
    EyeOff,
    IdCard,
    Landmark,
    MapPin,
    Phone,
    StickyNote,
    User,
} from "lucide-react"
import styles from "./ProveedorInfo.module.css"
import {
    Proveedor,
    TIPO_CUENTA_LABELS,
    TIPO_PERSONA_LABELS,
    TIPO_PROVEEDOR_LABELS,
} from "../../../types/proveedores/proveedores"
import { TIPO_DOCUMENTO_LABELS } from "../../../types/talento_humano/personal"

type propsType = {
    proveedor: Proveedor
}

// `creado_en` / `actualizado_en` llegan como ISO del backend; se muestran en
// horario local, igual que en el resto de vistas.
function formatearFecha(iso: string): string {
    const fecha = new Date(iso)
    if (Number.isNaN(fecha.getTime())) return "—"
    return fecha.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })
}

// Iniciales del avatar: las de las dos primeras palabras del nombre.
function iniciales(nombre: string): string {
    const palabras = nombre.trim().split(/\s+/).filter(Boolean)
    if (palabras.length === 0) return "?"
    return palabras.slice(0, 2).map((palabra) => palabra[0].toUpperCase()).join("")
}

// El número de cuenta se enmascara hasta que el usuario pida verlo: solo quedan
// visibles los cuatro últimos caracteres.
function enmascararCuenta(numero: string): string {
    const visible = numero.slice(-4)
    return "•".repeat(Math.max(numero.length - 4, 0)) + visible
}

type campoProps = {
    label: string
    valor?: string | null
    mono?: boolean
    email?: boolean
    wide?: boolean
}

// Un campo nullable sin dato no se oculta: se muestra en gris e itálica para
// que se note que el proveedor no lo tiene cargado.
function Campo({ label, valor, mono, email, wide }: campoProps) {
    const vacio = !valor || valor.trim() === ""

    const clases = [
        styles["pd-value"],
        mono && !vacio ? styles["pd-value-mono"] : "",
        email ? styles["pd-value-email"] : "",
        vacio ? styles["pd-value-empty"] : "",
    ].filter(Boolean).join(" ")

    return (
        <div className={`${styles["pd-field"]} ${wide ? styles["pd-field-wide"] : ""}`}>
            <div className={styles["pd-label"]}>{label}</div>
            <div className={clases}>{vacio ? "Sin registrar" : valor}</div>
        </div>
    )
}

function Seccion({ icono, titulo }: { icono: ReactNode; titulo: string }) {
    return (
        <div className={styles["pd-section-head"]}>
            {icono}
            <h3 className={styles["pd-section-title"]}>{titulo}</h3>
            <div className={styles["pd-section-rule"]} />
        </div>
    )
}

export default function ProveedorInfo({ proveedor }: propsType) {
    const [cuentaVisible, setCuentaVisible] = useState(false)

    // El NIT se muestra con su dígito de verificación pegado (900123456-7); los
    // demás documentos no tienen uno.
    const documento = proveedor.digito_verificacion
        ? `${proveedor.documento}-${proveedor.digito_verificacion}`
        : proveedor.documento

    return (
        <div className={styles["pd-detalle"]}>
            <header className={styles["pd-header"]}>
                <div className={styles["pd-avatar"]}>{iniciales(proveedor.nombre)}</div>

                <div className={styles["pd-header-main"]}>
                    <div className={styles["pd-title-row"]}>
                        <h2 className={styles["pd-title"]}>{proveedor.nombre}</h2>
                        <span className={`${styles["pd-badge"]} ${proveedor.activo ? styles["pd-badge-activo"] : styles["pd-badge-inactivo"]}`}>
                            {proveedor.activo ? "Activo" : "Inactivo"}
                        </span>
                    </div>

                    <div className={styles["pd-meta"]}>
                        <span className={styles["pd-codigo"]}>{proveedor.codigo}</span>
                        <span className={styles["pd-meta-sep"]}>•</span>
                        <span>{TIPO_PROVEEDOR_LABELS[proveedor.tipo_proveedor]}</span>
                        <span className={styles["pd-meta-sep"]}>•</span>
                        <span>{TIPO_PERSONA_LABELS[proveedor.tipo_persona]}</span>
                    </div>
                </div>
            </header>

            <Seccion icono={<IdCard />} titulo="Identificación" />
            <div className={styles["pd-grid"]}>
                <Campo label="Tipo de documento" valor={TIPO_DOCUMENTO_LABELS[proveedor.tipo_documento]} />
                <Campo label="Documento" valor={documento} mono />
                <Campo label="Razón social" valor={proveedor.razon_social} />
            </div>

            <Seccion icono={<Phone />} titulo="Contacto" />
            <div className={styles["pd-grid"]}>
                <Campo label="Teléfono" valor={proveedor.telefono} mono />
                <Campo label="Teléfono alterno" valor={proveedor.telefono_alterno} mono />
                <Campo label="Correo" valor={proveedor.email} email />
            </div>

            <Seccion icono={<MapPin />} titulo="Ubicación" />
            <div className={styles["pd-grid-ubicacion"]}>
                <Campo label="Dirección" valor={proveedor.direccion} />
                <Campo label="Departamento" valor={proveedor.departamento} />
                <Campo label="Municipio" valor={proveedor.municipio} />
            </div>

            <Seccion icono={<User />} titulo="Persona de contacto" />
            <div className={styles["pd-contacto"]}>
                <div className={styles["pd-contacto-icon"]}>
                    <User size={17} />
                </div>

                <div className={styles["pd-contacto-main"]}>
                    <div className={styles["pd-label"]}>Nombre</div>
                    <div className={`${styles["pd-value"]} ${proveedor.contacto_nombre ? "" : styles["pd-value-empty"]}`}>
                        {proveedor.contacto_nombre ?? "Sin registrar"}
                    </div>
                </div>

                <div className={styles["pd-contacto-tel"]}>
                    <div className={styles["pd-label"]}>Teléfono</div>
                    <div className={`${styles["pd-value"]} ${proveedor.contacto_telefono ? styles["pd-value-mono"] : styles["pd-value-empty"]}`}>
                        {proveedor.contacto_telefono ?? "Sin registrar"}
                    </div>
                </div>
            </div>

            <Seccion icono={<Landmark />} titulo="Información bancaria" />
            <div className={styles["pd-card"]}>
                <div className={styles["pd-grid"]}>
                    <Campo label="Banco" valor={proveedor.banco} />
                    <Campo
                        label="Tipo de cuenta"
                        valor={proveedor.tipo_cuenta ? TIPO_CUENTA_LABELS[proveedor.tipo_cuenta] : null}
                    />

                    <div className={styles["pd-field"]}>
                        <div className={styles["pd-label"]}>Número de cuenta</div>
                        {proveedor.numero_cuenta ? (
                            <div className={styles["pd-cuenta"]}>
                                <span className={`${styles["pd-value"]} ${styles["pd-value-mono"]}`}>
                                    {cuentaVisible
                                        ? proveedor.numero_cuenta
                                        : enmascararCuenta(proveedor.numero_cuenta)}
                                </span>
                                <button
                                    type="button"
                                    className={styles["pd-cuenta-toggle"]}
                                    onClick={() => setCuentaVisible((visible) => !visible)}
                                    title={cuentaVisible ? "Ocultar" : "Mostrar"}
                                    aria-label={cuentaVisible ? "Ocultar número de cuenta" : "Mostrar número de cuenta"}
                                >
                                    {cuentaVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        ) : (
                            <div className={`${styles["pd-value"]} ${styles["pd-value-empty"]}`}>
                                Sin registrar
                            </div>
                        )}
                    </div>

                    <Campo label="Titular" valor={proveedor.titular_cuenta} />
                    <Campo label="Documento del titular" valor={proveedor.titular_documento} mono />
                </div>
            </div>

            <Seccion icono={<StickyNote />} titulo="Observaciones" />
            {proveedor.observaciones ? (
                <p className={styles["pd-observaciones"]}>{proveedor.observaciones}</p>
            ) : (
                <div className={`${styles["pd-value"]} ${styles["pd-value-empty"]}`}>
                    Sin observaciones
                </div>
            )}

            <footer className={styles["pd-auditoria"]}>
                <span>Creado: <strong>{formatearFecha(proveedor.creado_en)}</strong></span>
                <span>Actualizado: <strong>{formatearFecha(proveedor.actualizado_en)}</strong></span>
                <span>Versión: <strong>{proveedor.version}</strong></span>
                <span className={styles["pd-auditoria-id"]}>{proveedor.id}</span>
            </footer>
        </div>
    )
}
