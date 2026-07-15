import { useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import CargoForm from "./CargoForm"
import { socketRequest } from "../../../lib/socket"
import { Permisos } from "../../../types/administracion/permisos"

export default function CrearCargo() {
    const navigate = useNavigate()
    const volver = () => navigate("/administracion/cargos")

    const [permisos, setPermisos] = useState<Permisos[]>([])

    useEffect(() => {
        let cancelado = false
        const handleRequest = async (): Promise<void> => {
            try {
                // El loading global y el toast de error los pone socketRequest.
                const response = await socketRequest<Permisos[]>({ action: "administracion:permisos:read" })
                if (!cancelado) setPermisos(response.data ?? [])
            } catch (err) {
                console.error("[cargos] error:", err)
            }
        }
        handleRequest()

        return () => { cancelado = true }
    }, [])

    // Áreas únicas (parte antes de ":") en el orden en que aparecen.
    const areas = useMemo(
        () => [...new Set(permisos.map((p) => p.nombre.split(":")[0]))],
        [permisos]
    )

    // Mapa nombre-de-permiso -> id.
    const permisosMap = useMemo(() => {
        const map = new Map<string, string>()
        for (const p of permisos) map.set(p.nombre, p.id)
        return map
    }, [permisos])

    return (
        <CargoForm
            areas={areas}
            permisosMap={permisosMap}
            onSuccess={volver}
            onCancel={volver}
        />
    )
}
