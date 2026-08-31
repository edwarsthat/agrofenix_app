import { ReactNode } from "react"
import { Compass, IdCard, MapPin, StickyNote, User } from "lucide-react"
import styles from "./PredioInfo.module.css"
import { Predio } from "../../../types/proveedores/predios"

type propsType = {
    predio: Predio
    // El predio solo trae `proveedor_id`; el nombre lo resuelve la vista contra
    // la lista de proveedores y lo pasa ya armado.
    proveedor?: string
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

type campoProps = {
    label: string
    valor?: string | null
    mono?: boolean
    wide?: boolean
}

// Un campo nullable sin dato no se oculta: se muestra en gris e itálica para
// que se note que el predio no lo tiene cargado.
function Campo({ label, valor, mono, wide }: campoProps) {
    const vacio = !valor || valor.trim() === ""

    const clases = [
        styles["pd-value"],
        mono && !vacio ? styles["pd-value-mono"] : "",
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

export default function PredioInfo({ predio, proveedor }: propsType) {
    // Las coordenadas o van las dos o no va ninguna, así que basta revisar una
    // para decidir si la tarjeta muestra campos o el aviso de "sin registrar".
    const tieneCoordenadas = predio.latitud !== null && predio.longitud !== null

    return (
        <div className={styles["pd-detalle"]}>
            <header className={styles["pd-header"]}>
                <div className={styles["pd-avatar"]}>{iniciales(predio.nombre)}</div>

                <div className={styles["pd-header-main"]}>
                    <div className={styles["pd-title-row"]}>
                        <h2 className={styles["pd-title"]}>{predio.nombre}</h2>
                        <span className={`${styles["pd-badge"]} ${predio.activo ? styles["pd-badge-activo"] : styles["pd-badge-inactivo"]}`}>
                            {predio.activo ? "Activo" : "Inactivo"}
                        </span>
                    </div>

                    <div className={styles["pd-meta"]}>
                        <span className={styles["pd-codigo"]}>{predio.codigo}</span>
                        <span className={styles["pd-meta-sep"]}>•</span>
                        <span>{predio.municipio}, {predio.departamento}</span>
                    </div>
                </div>
            </header>

            <Seccion icono={<IdCard />} titulo="Identificación" />
            <div className={styles["pd-grid"]}>
                <Campo label="Código" valor={predio.codigo} mono />
                <Campo label="Proveedor" valor={proveedor} wide />
            </div>

            <Seccion icono={<MapPin />} titulo="Ubicación" />
            <div className={styles["pd-grid-ubicacion"]}>
                <Campo label="Departamento" valor={predio.departamento} />
                <Campo label="Municipio" valor={predio.municipio} />
                <Campo label="Vereda" valor={predio.vereda} />
                <Campo label="Referencia" valor={predio.referencia_ubicacion} wide />
            </div>

            <Seccion icono={<Compass />} titulo="Coordenadas" />
            <div className={`${styles["pd-card"]} ${tieneCoordenadas ? "" : styles["pd-card-vacia"]}`}>
                {tieneCoordenadas ? (
                    <div className={styles["pd-grid"]}>
                        <Campo label="Latitud" valor={predio.latitud!.toFixed(6)} mono />
                        <Campo label="Longitud" valor={predio.longitud!.toFixed(6)} mono />
                    </div>
                ) : (
                    <div className={`${styles["pd-value"]} ${styles["pd-value-empty"]}`}>
                        Sin coordenadas registradas
                    </div>
                )}
            </div>

            <Seccion icono={<User />} titulo="Responsable" />
            <div className={styles["pd-contacto"]}>
                <div className={styles["pd-contacto-icon"]}>
                    <User size={17} />
                </div>

                <div className={styles["pd-contacto-main"]}>
                    <div className={styles["pd-label"]}>Nombre</div>
                    <div className={`${styles["pd-value"]} ${predio.responsable_nombre ? "" : styles["pd-value-empty"]}`}>
                        {predio.responsable_nombre ?? "Sin registrar"}
                    </div>
                </div>

                <div className={styles["pd-contacto-dato"]}>
                    <div className={styles["pd-label"]}>Documento</div>
                    <div className={`${styles["pd-value"]} ${predio.responsable_documento ? styles["pd-value-mono"] : styles["pd-value-empty"]}`}>
                        {predio.responsable_documento ?? "Sin registrar"}
                    </div>
                </div>

                <div className={styles["pd-contacto-dato"]}>
                    <div className={styles["pd-label"]}>Teléfono</div>
                    <div className={`${styles["pd-value"]} ${predio.responsable_telefono ? styles["pd-value-mono"] : styles["pd-value-empty"]}`}>
                        {predio.responsable_telefono ?? "Sin registrar"}
                    </div>
                </div>
            </div>

            <Seccion icono={<StickyNote />} titulo="Observaciones" />
            {predio.observaciones ? (
                <p className={styles["pd-observaciones"]}>{predio.observaciones}</p>
            ) : (
                <div className={`${styles["pd-value"]} ${styles["pd-value-empty"]}`}>
                    Sin observaciones
                </div>
            )}

            <footer className={styles["pd-auditoria"]}>
                <span>Creado: <strong>{formatearFecha(predio.creado_en)}</strong></span>
                <span>Actualizado: <strong>{formatearFecha(predio.actualizado_en)}</strong></span>
                <span>Versión: <strong>{predio.version}</strong></span>
                <span className={styles["pd-auditoria-id"]}>{predio.id}</span>
            </footer>
        </div>
    )
}
