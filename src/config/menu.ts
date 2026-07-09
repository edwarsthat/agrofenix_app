import type { LucideIcon } from 'lucide-react'
import { LayoutGrid, ShieldCheck } from 'lucide-react'

export interface MenuNode {
    label: string
    permiso: string
    path?: string          // hoja navegable (no lo llevan las ramas)
    icon?: LucideIcon
    children?: MenuNode[]   // rama que agrupa; si existe, no se usa path
}

export const menu: MenuNode[] = [
    { label: 'Inicio', path: '/', permiso: 'inicio:ver', icon: LayoutGrid },
    {
        label: 'Administración',
        permiso: 'administracion:ver',
        icon: ShieldCheck,
        children: [
            { label: 'Usuarios', path: '/administracion/usuarios', permiso: 'usuarios:read' },
            { label: 'Cargos',   path: '/administracion/cargos',   permiso: 'cargos:read' },
            { label: 'Roles',    path: '/administracion/roles',    permiso: 'roles:read' },
        ],
    },
]

