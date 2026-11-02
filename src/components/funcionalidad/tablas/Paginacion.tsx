import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Paginacion.module.css'

// Sin `totalPaginas` (paginación por cursor, donde el backend no dice cuántas
// hay) solo se pintan las flechas y "Página N"; los números y el "Mostrando
// X–Y de Z" aparecen cuando el total se conoce.
interface PaginacionProps {
    pagina: number            // base 1
    totalPaginas?: number
    totalItems?: number
    tamano?: number
    hayAnterior: boolean
    haySiguiente: boolean
    onAnterior: () => void
    onSiguiente: () => void
    onIrA?: (pagina: number) => void
}

type ItemPagina = number | 'elipsis-izq' | 'elipsis-der'

// Primera, última, la actual con una vecina a cada lado y una elipsis donde
// falten páginas. Siempre devuelve 7 posiciones para que la barra no salte de
// ancho al navegar.
function itemsPagina(pagina: number, totalPaginas: number): ItemPagina[] {
    const VECINAS = 1
    const posiciones = VECINAS * 2 + 5
    if (totalPaginas <= posiciones) return Array.from({ length: totalPaginas }, (_, i) => i + 1)

    const izq = Math.max(pagina - VECINAS, 1)
    const der = Math.min(pagina + VECINAS, totalPaginas)
    const puntosIzq = izq > 2
    const puntosDer = der < totalPaginas - 1
    const borde = 3 + VECINAS * 2

    if (!puntosIzq) {
        return [...Array.from({ length: borde }, (_, i) => i + 1), 'elipsis-der', totalPaginas]
    }
    if (!puntosDer) {
        return [1, 'elipsis-izq', ...Array.from({ length: borde }, (_, i) => totalPaginas - borde + i + 1)]
    }
    return [1, 'elipsis-izq', ...Array.from({ length: der - izq + 1 }, (_, i) => izq + i), 'elipsis-der', totalPaginas]
}

const formatearCantidad = (n: number) => n.toLocaleString('es-CO')

export default function Paginacion({
    pagina,
    totalPaginas,
    totalItems,
    tamano,
    hayAnterior,
    haySiguiente,
    onAnterior,
    onSiguiente,
    onIrA,
}: PaginacionProps) {
    // onIrA cambia de identidad en cada render; solo importa si viene o no.
    const conNumeros = Boolean(totalPaginas && onIrA)
    const items = useMemo(
        () => (conNumeros && totalPaginas ? itemsPagina(pagina, totalPaginas) : []),
        [pagina, totalPaginas, conNumeros]
    )

    const rango = totalItems !== undefined && tamano
        ? {
            desde: totalItems === 0 ? 0 : (pagina - 1) * tamano + 1,
            hasta: Math.min(pagina * tamano, totalItems),
        }
        : null

    return (
        <div className={styles.root}>
            {rango && totalItems !== undefined && (
                <p className={styles.info} aria-live="polite">
                    Mostrando <strong>{formatearCantidad(rango.desde)}–{formatearCantidad(rango.hasta)}</strong> de{' '}
                    <strong>{formatearCantidad(totalItems)}</strong>
                </p>
            )}

            <nav className={styles.nav} aria-label="Paginación">
                <button
                    type="button"
                    className={`${styles.btn} ${styles.arrow}`}
                    onClick={onAnterior}
                    disabled={!hayAnterior}
                    aria-label="Página anterior"
                >
                    <ChevronLeft size={16} className={styles.icon} aria-hidden="true" />
                    <span className={styles.label}>Anterior</span>
                </button>

                {items.length > 0 && (
                    <ul className={styles.list}>
                        {items.map((it) =>
                            typeof it === 'number' ? (
                                <li key={it}>
                                    <button
                                        type="button"
                                        className={styles.btn}
                                        onClick={() => it !== pagina && onIrA?.(it)}
                                        aria-current={it === pagina ? 'page' : undefined}
                                        aria-label={`Página ${it}`}
                                    >
                                        {it}
                                    </button>
                                </li>
                            ) : (
                                <li key={it} aria-hidden="true">
                                    <span className={styles.ellipsis}>…</span>
                                </li>
                            )
                        )}
                    </ul>
                )}

                {/* Sin números (cursor) se ve siempre; con números, solo en móvil. */}
                <p className={`${styles.estado} ${items.length > 0 ? styles.estadoMovil : ''}`}>
                    Página {pagina}{totalPaginas ? ` de ${totalPaginas}` : ''}
                </p>

                <button
                    type="button"
                    className={`${styles.btn} ${styles.arrow}`}
                    onClick={onSiguiente}
                    disabled={!haySiguiente}
                    aria-label="Página siguiente"
                >
                    <span className={styles.label}>Siguiente</span>
                    <ChevronRight size={16} className={styles.icon} aria-hidden="true" />
                </button>
            </nav>
        </div>
    )
}
