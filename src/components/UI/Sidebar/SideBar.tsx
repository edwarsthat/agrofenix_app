import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { X, LogOut } from 'lucide-react'
import { menu, MenuNode } from '../../../config/menu'
import useSessionStore from '../../../store/useSessionStore'
import styles from './Sidebar.module.css'
import logo from '../../../assets/logo.png'

function tienePermiso(nodo: MenuNode, permisos: string[]): boolean {
    if (nodo.children) {
        return nodo.children.some(hijo => tienePermiso(hijo, permisos))
    }
    return permisos.includes(nodo.permiso)
}

function MenuItem({ nodo, permisos, nivel }: { nodo: MenuNode; permisos: string[]; nivel: number }) {
    const [abierto, setAbierto] = useState(false)

    if (!tienePermiso(nodo, permisos)) return null

    const Icono = nodo.icon
    const claseItem = nivel === 0 ? styles.item : styles.child

    if (nodo.children) {
        return (
            <div>
                <button className={claseItem} onClick={() => setAbierto(a => !a)}>
                    {Icono && <Icono className={styles.itemIcon} />}
                    <span>{nodo.label}</span>
                    <svg
                        className={abierto ? styles.chevronOpen : styles.chevron}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path d="M9 6l6 6-6 6" />
                    </svg>
                </button>
                {abierto && (
                    <div className={styles.children}>
                        {nodo.children.map(hijo => (
                            <MenuItem key={hijo.label} nodo={hijo} permisos={permisos} nivel={nivel + 1} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (nivel === 0) {
        return (
            <NavLink
                to={nodo.path ?? '/'}
                end={nodo.path === '/'}
                className={({ isActive }) => isActive ? styles.itemActive : styles.item}
            >
                {Icono && <Icono className={styles.itemIcon} />}
                <span>{nodo.label}</span>
            </NavLink>
        )
    }

    return (
        <NavLink
            to={nodo.path ?? '/'}
            className={({ isActive }) => isActive ? styles.childActive : styles.child}
        >
            <span className={styles.childDot} />
            <span>{nodo.label}</span>
        </NavLink>
    )
}

export interface SideBarProps {
    /** Controla el drawer en mobile (<768px). En desktop se ignora y el sidebar siempre se muestra. */
    isOpen: boolean
    onClose: () => void
}

export default function SideBar({ isOpen, onClose }: SideBarProps) {
    const permisos = useSessionStore((state) => state.permisos)
    const token = useSessionStore((state) => state.token)
    const logout = useSessionStore((state) => state.logout)
    const visibles = menu.filter(nodo => tienePermiso(nodo, permisos))
    const generales = visibles.filter(nodo => !nodo.children)
    const modulos = visibles.filter(nodo => !!nodo.children)

    return (
        <>
            <div
                className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <nav className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.brand}>
                    <img src={logo} alt="Agroalimentos Fénix" className={styles.brandLogo} />
                    <span className={styles.brandText}>Fénix</span>
                    <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar menú">
                        <X size={18} />
                    </button>
                </div>

                {generales.length > 0 && (
                    <>
                        <span className={styles.sectionLabel}>General</span>
                        {generales.map(nodo => (
                            <MenuItem key={nodo.label} nodo={nodo} permisos={permisos} nivel={0} />
                        ))}
                    </>
                )}

                {modulos.length > 0 && (
                    <>
                        <span className={styles.sectionLabel}>Módulos</span>
                        {modulos.map(nodo => (
                            <MenuItem key={nodo.label} nodo={nodo} permisos={permisos} nivel={0} />
                        ))}
                    </>
                )}

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.logoutBtn}
                        onClick={() => logout(token ?? '')}
                    >
                        <LogOut className={styles.itemIcon} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </nav>
        </>
    )
}
