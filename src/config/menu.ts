
export interface MenuNode {
    label: string
    permiso: string
    path?: string          // hoja navegable (no lo llevan las ramas)
    icon?: string
    children?: MenuNode[]   // rama que agrupa; si existe, no se usa path
}

export const menu: MenuNode[] = [
    { label: 'Inicio', path: '/', permiso: 'inicio:ver' },
    {
        label: 'Administración',
        permiso: 'administracion:ver',
        children: [
            { label: 'Usuarios', path: '/administracion/usuarios', permiso: 'usuarios:ver' },
            { label: 'Cargos',   path: '/administracion/cargos',   permiso: 'cargos:ver' },
            { label: 'Roles',    path: '/administracion/roles',    permiso: 'roles:ver' },
        ],
    },
]

