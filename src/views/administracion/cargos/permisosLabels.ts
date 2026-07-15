/* Traducciones SOLO visuales de los permisos.
   El valor real (name/id del permiso) NUNCA cambia: sigue viajando al server
   en su idioma original. Aquí solo se traduce lo que ve el usuario. */

/** Área (parte antes de ":", ej. "usuarios" en "usuarios:read"). */
const AREA_LABELS: Record<string, string> = {
    administracion: "Administración",
    usuarios: "Usuarios",
    cargos: "Cargos",
    roles: "Roles",
    permisos: "Permisos",
}

/** Acción (parte después de ":", ej. "read" en "usuarios:read"). */
const ACCION_LABELS: Record<string, string> = {
    add: "Agregar",
    read: "Ver",
    update: "Editar",
    delete: "Eliminar",
}

const capitalizar = (s: string): string =>
    s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s

/** Etiqueta visible del área. Si no está en el diccionario, la capitaliza. */
export const areaLabel = (area: string): string =>
    AREA_LABELS[area.toLowerCase()] ?? capitalizar(area)

/** Etiqueta visible de la acción de un permiso "area:accion". */
export const permisoAccionLabel = (name: string): string => {
    const accion = name.split(":").slice(1).join(":")
    if (!accion) return capitalizar(name)
    return ACCION_LABELS[accion.toLowerCase()] ?? capitalizar(accion)
}
