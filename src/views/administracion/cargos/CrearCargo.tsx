import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import CargoForm from "./CargoForm"
import { socketRequest } from "../../../lib/socket"
import { Permisos } from "../../../types/administracion/permisos"
import { Cargo } from "../../../types/administracion/cargos"
import { CargosFormType } from "./validation"

export default function CrearCargo() {
    const navigate = useNavigate()
    const volver = () => navigate("/administracion/cargos")

    // En modo edición la ruta es /editar/:id; en modo crear es undefined.
    const { id: cargoId } = useParams()

    // Cargos.tsx manda el cargo por el state al navegar a editar. Precarga
    // nombre/descripción al instante (los permisos llegan aparte por socket).
    const location = useLocation()
    const cargo = (location.state as { cargo?: Cargo } | null)?.cargo
    const datosCargo = useMemo<CargosFormType | null>(
        () => (cargo ? { nombre: cargo.nombre, descripcion: cargo.descripcion ?? "" } : null),
        [cargo]
    )

    const [permisos, setPermisos] = useState<Permisos[]>([])
    const [cargoPermisos, setCargoPermisos] = useState<string[] | null>(null)

    useEffect(() => {
        let cancelado = false
        const handleRequest = async (): Promise<void> => {
            try {
                // El loading global y el toast de error los pone socketRequest.
                const response = await socketRequest<Permisos[]>({ action: "administracion:permisos:read" })
                if (!cancelado) setPermisos(response.data ?? [])

                if (cargoId) {
                    const request = {
                        action: "administracion:cargos:permisos:read",
                        payload: { cargo_id: cargoId },
                    }
                    const response2 = await socketRequest<string[]>(request)
                    console.log("si es esta respuesta", response2)
                    if (!cancelado) setCargoPermisos(response2.data ?? [])
                }
            } catch (err) {
                console.error("[cargos] error:", err)
            }
        }
        handleRequest()

        return () => { cancelado = true }
    }, [cargoId])

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
            cargoId={cargoId}
            datosCargo={datosCargo}
            cargoPermisos={cargoPermisos}
            areas={areas}
            permisosMap={permisosMap}
            onSuccess={volver}
            onCancel={volver}
        />
    )
}
