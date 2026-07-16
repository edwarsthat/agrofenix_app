import { FormEvent, useEffect, useMemo, useState } from "react"
import { Check, ChevronDown, ChevronRight, FolderCog, Search } from "lucide-react"
import useForm from "../../../hooks/useForm"
import FormInput from "../../../components/UI/FormInput/FormInput"
import FenixButton from "../../../components/UI/Button/FenixButton"
import { socketRequest } from "../../../lib/socket"
import { Cargo } from "../../../types/administracion/cargos"
import { CargosFormType, CargosInitialValues, cargosSchema } from "./validation"
import { areaLabel, permisoAccionLabel } from "./permisosLabels"
import styles from "./CargoForm.module.css"

interface CargoFormProps {
    areas: string[]
    permisosMap: Map<string, string>
    /** Id del cargo a editar (modo edición). undefined/null en modo crear. */
    cargoId?: string | null
    /** Nombre y descripción del cargo a editar (modo edición). null en modo crear. */
    datosCargo?: CargosFormType | null
    cargoPermisos?: string[] | null
    onSuccess: (cargo?: Cargo | null) => void
    onCancel: () => void
}

interface Permiso {
    name: string
    id: string
}

export default function CargoForm({ areas, permisosMap, cargoId, datosCargo, cargoPermisos, onSuccess, onCancel }: CargoFormProps) {
    const { formState, handleChange, formErrors, validateForm, fillForm } =
        useForm<CargosFormType>(CargosInitialValues)
    const [loading, setLoading] = useState(false)

    const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
    const [expandidas, setExpandidas] = useState<Set<string>>(new Set())
    const [busqueda, setBusqueda] = useState("")

    // Hay cargo => se está editando; si no, se está creando.
    const esEdicion = Boolean(datosCargo)

    // En modo edición precarga nombre y descripción del cargo en el form.
    useEffect(() => {
        if (datosCargo) fillForm(datosCargo)
    }, [datosCargo])

    // En modo edición precarga los permisos que ya tiene el cargo. Llega async
    // (null hasta que responde el server), por eso se sincroniza en un efecto.
    useEffect(() => {
        if (cargoPermisos) setSeleccionados(new Set(cargoPermisos))
    }, [cargoPermisos])

    // Agrupa los permisos por área usando `areas` (nombres únicos) + `permisosMap`.
    const gruposPorArea = useMemo(() => {
        const grupos = new Map<string, Permiso[]>()
        for (const area of new Set(areas)) grupos.set(area, [])
        for (const [name, id] of permisosMap.entries()) {
            const area = name.split(":")[0]
            if (!grupos.has(area)) grupos.set(area, [])
            grupos.get(area)!.push({ name, id })
        }
        return grupos
    }, [areas, permisosMap])

    // Aplica el filtro de búsqueda por nombre de área o de permiso.
    const areasVisibles = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        const resultado: { area: string; permisos: Permiso[] }[] = []
        const matchArea = (area: string): boolean =>
            area.toLowerCase().includes(q) || areaLabel(area).toLowerCase().includes(q)
        const matchPermiso = (p: Permiso): boolean =>
            p.name.toLowerCase().includes(q) ||
            permisoAccionLabel(p.name).toLowerCase().includes(q)
        for (const [area, permisos] of gruposPorArea.entries()) {
            if (!q || matchArea(area)) {
                resultado.push({ area, permisos })
                continue
            }
            const filtrados = permisos.filter(matchPermiso)
            if (filtrados.length) resultado.push({ area, permisos: filtrados })
        }
        return resultado
    }, [gruposPorArea, busqueda])

    const togglePermiso = (id: string): void => {
        setSeleccionados((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const toggleArea = (permisos: Permiso[]): void => {
        setSeleccionados((prev) => {
            const next = new Set(prev)
            const todos = permisos.every((p) => next.has(p.id))
            for (const p of permisos) todos ? next.delete(p.id) : next.add(p.id)
            return next
        })
    }

    const toggleExpandida = (area: string): void => {
        setExpandidas((prev) => {
            const next = new Set(prev)
            next.has(area) ? next.delete(area) : next.add(area)
            return next
        })
    }

    const expandirTodo = (): void =>
        setExpandidas(new Set(areasVisibles.map((a) => a.area)))
    const colapsarTodo = (): void => setExpandidas(new Set())

    const checkboxClass = (checked: boolean, sm = false): string =>
        [
            styles["checkbox-box"],
            sm ? styles["checkbox-box--sm"] : "",
            checked ? styles["checkbox-box--checked"] : "",
        ]
            .filter(Boolean)
            .join(" ")

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault()
        if (loading) return
        if (!validateForm(cargosSchema)) return

        setLoading(true)
        try {
            const request = {
                action: esEdicion ? "administracion:cargos:update" : "administracion:cargos:add",
                payload: esEdicion
                    ? { cargo_id: cargoId, ...formState, permisos: [...seleccionados] }
                    : { ...formState, permisos: [...seleccionados] },
                isSuccess: true,
            }
            // socketRequest lanza si el status es >= 400, así que llegar aquí ya
            // es éxito: redirigimos siempre, aunque el server no devuelva `data`.
            const response = await socketRequest<Cargo>(request)
            onSuccess(response.data)
        } catch (err) {
            // El toast de error ya lo pone socketRequest; aquí solo dejamos el form abierto.
            console.error(esEdicion ? "[cargos] editar cargo:" : "[cargos] crear cargo:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className={styles["role-form-page"]} onSubmit={handleSubmit} noValidate>
            <header className={styles["role-form-header"]}>
                <div>
                    <div className={styles["role-form-breadcrumb"]}>
                        Administración
                        <ChevronRight size={13} />
                        <strong>Cargos</strong>
                    </div>
                    <h1 className={styles["role-form-title"]}>
                        {esEdicion ? "Editar cargo" : "Crear cargo"}
                    </h1>
                    <p className={styles["role-form-subtitle"]}>
                        {esEdicion
                            ? "Modifica la información y los permisos del cargo."
                            : "Registra un nuevo cargo dentro de la organización."}
                    </p>
                </div>
            </header>

            <div className={styles["role-form-body"]}>
                <div className={styles["role-form-basics-card"]}>
                    <FormInput
                        name="nombre"
                        label="Nombre"
                        value={formState.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Coordinador de calidad"
                        error={formErrors.nombre}
                        disabled={loading}
                    />
                    <FormInput
                        name="descripcion"
                        label="Descripción"
                        value={formState.descripcion}
                        onChange={handleChange}
                        placeholder="Breve descripción del cargo (opcional)"
                        error={formErrors.descripcion}
                        disabled={loading}
                    />
                </div>

                <section className={styles["permissions-section"]}>
                    <div className={styles["permissions-toolbar"]}>
                        <div>
                            <h2 className={styles["permissions-heading"]}>Permisos</h2>
                            <p className={styles["permissions-summary"]}>
                                {seleccionados.size} permiso
                                {seleccionados.size === 1 ? "" : "s"} seleccionado
                                {seleccionados.size === 1 ? "" : "s"}
                            </p>
                        </div>

                        <div className={styles["permissions-toolbar-actions"]}>
                            <div className={styles["area-search"]}>
                                <Search size={15} />
                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    placeholder="Buscar permiso o área..."
                                />
                            </div>
                            <span
                                className={`${styles["link-action"]} ${styles["link-action--primary"]}`}
                                onClick={expandirTodo}
                            >
                                Expandir todo
                            </span>
                            <span
                                className={`${styles["link-action"]} ${styles["link-action--muted"]}`}
                                onClick={colapsarTodo}
                            >
                                Colapsar todo
                            </span>
                        </div>
                    </div>

                    {areasVisibles.length === 0 ? (
                        <div className={styles["no-results"]}>
                            No se encontraron permisos.
                        </div>
                    ) : (
                        areasVisibles.map(({ area, permisos }) => {
                            const expandida = expandidas.has(area)
                            const todosSeleccionados =
                                permisos.length > 0 &&
                                permisos.every((p) => seleccionados.has(p.id))

                            return (
                                <div className={styles["area-card"]} key={area}>
                                    <div
                                        className={styles["area-card-header"]}
                                        onClick={() => toggleExpandida(area)}
                                    >
                                        <div className={styles["area-icon"]}>
                                            <FolderCog size={18} />
                                        </div>
                                        <div className={styles["area-info"]}>
                                            <div className={styles["area-name"]}>{areaLabel(area)}</div>
                                            <div className={styles["area-count"]}>
                                                {permisos.length} permiso
                                                {permisos.length === 1 ? "" : "s"}
                                            </div>
                                        </div>
                                        <div
                                            className={styles["area-toggle-all"]}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                toggleArea(permisos)
                                            }}
                                        >
                                            <div className={checkboxClass(todosSeleccionados)}>
                                                {todosSeleccionados && <Check size={12} />}
                                            </div>
                                            Todos
                                        </div>
                                        <div className={styles["area-chevron"]}>
                                            {expandida ? (
                                                <ChevronDown size={18} />
                                            ) : (
                                                <ChevronRight size={18} />
                                            )}
                                        </div>
                                    </div>

                                    {expandida && (
                                        <div className={styles["permission-grid"]}>
                                            {permisos.map((p) => {
                                                const checked = seleccionados.has(p.id)
                                                return (
                                                    <div
                                                        className={styles["permission-item"]}
                                                        key={p.id}
                                                        onClick={() => togglePermiso(p.id)}
                                                    >
                                                        <div className={checkboxClass(checked, true)}>
                                                            {checked && <Check size={12} />}
                                                        </div>
                                                        <span className={styles["permission-label"]}>
                                                            {permisoAccionLabel(p.name)}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </section>
            </div>

            <div className={styles["role-form-footer"]}>
                <span className={styles["role-form-footer-summary"]}>
                    {seleccionados.size} permiso{seleccionados.size === 1 ? "" : "s"} asignado
                    {seleccionados.size === 1 ? "" : "s"}
                </span>
                <FenixButton
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </FenixButton>
                <FenixButton type="submit" variant="primary" loading={loading}>
                    {esEdicion ? "Guardar cambios" : "Crear cargo"}
                </FenixButton>
            </div>
        </form>
    )
}
