import type { LucideIcon } from 'lucide-react'
import { Boxes, LayoutGrid, ShieldCheck, Truck, Users } from 'lucide-react'

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
            { label: 'Sesiones', path: '/administracion/sesiones', permiso: 'sesiones:read' },
            { label: 'Roles',    path: '/administracion/roles',    permiso: 'roles:read' },
        ],
    },
    {
        label: 'Talento Humano',
        permiso: 'talento_humano:ver',
        icon: Users,
        children: [
            { label: 'Personal',        path: '/talento_humano/personal',         permiso: 'personal:read' },
            { label: 'Cargos Personal', path: '/talento_humano/cargos-personal', permiso: 'cargos_personal:read' },
        ],
    },
    {
        label: 'Inventarios',
        permiso: 'inventarios:ver',
        icon: Boxes,
        children: [
            { label: 'Llaves NFC', path: '/inventarios/llaves-nfc', permiso: 'llaves_nfc:read' },
            { label: 'Inventario Materias Primas', path: '/inventarios/lotes-materias-primas', permiso: 'lotes_materias_primas:read' },
        ],
    },
    {
        label: 'Proveedores',
        permiso: 'proveedores:ver',
        icon: Truck,
        children: [
            { label: 'Proveedores', path: '/proveedores/proveedores', permiso: 'proveedores:read' },
            { label: 'Predios', path: '/proveedores/predios', permiso: 'predios:read' },
        ],
    },
]

