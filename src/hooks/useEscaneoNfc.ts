import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import { scan } from '@tauri-apps/plugin-nfc'
import { useCallback, useEffect, useState } from "react"

export type EstadoEscaneo = "esperando" | "leida" | "error"

export const esMovilNativo = /Android|iPhone|iPad/i.test(navigator.userAgent)

export type OrigenLectura = "lector" | "telefono"

export interface TarjetaLeida {
    uid: string
    origen: OrigenLectura
    atr?: string
    lector?: string
}

export default function useEscaneoNfcc(activo: boolean) {
    const [estado, setEstado] = useState<EstadoEscaneo>("esperando");
    const [tarjeta, setTarjeta] = useState<TarjetaLeida | null>(null);
    const [error, setError] = useState<string | null>(null);

    const reiniciar = useCallback(() => {
        setTarjeta(null)
        setError(null)
        setEstado("esperando")
    }, [])

    useEffect(() => {
        if (!activo || esMovilNativo) return

        let vivo = true
        const desuscribir: Array<() => void> = []

        const suscribir = (un: () => void) => {
            if (vivo) desuscribir.push(un)
            else un()
        }

        listen<TarjetaLeida>("nfc://tag", (e) => {
            setTarjeta(e.payload)
            setError(null)
            setEstado("leida")
        }).then(suscribir)

        listen<string>("nfc://error", (e) => {
            setError(e.payload)
            setEstado("error")
        }).then(suscribir)

        // Por si la tarjeta ya estaba apoyada antes de abrir el modal: el
        // watcher solo dispara en el flanco de subida.
        invoke<TarjetaLeida>("leer_tarjeta_ahora")
            .then((t) => { if (vivo) { setTarjeta(t); setEstado("leida") } })
            .catch(() => { /* sin tarjeta puesta: es el caso normal */ })

        return () => {
            vivo = false
            desuscribir.forEach((un) => un())
        }
    }, [activo])

       // Móvil: el escaneo lo pide el usuario con un botón.
    const escanearMovil = useCallback(async () => {
        setEstado("esperando")
        setError(null)
        try {
            const tag = await scan({ type: "tag" }, { message: "Acerca la llave al teléfono" })

            // Android entrega el id como byte[] de Java (con signo): 0x86 llega
            // como -122. El & 0xff lo devuelve al rango 0..255 que espera el u8.
            const uid = Array.from(tag.id, (b) => b & 0xff)

            const leida = await invoke<TarjetaLeida>("registrar_tarjeta_movil", { uid })
            setTarjeta(leida)
            setEstado("leida")
        } catch (e) {
            setError(String(e))
            setEstado("error")
        }
    }, [])

    return { estado, tarjeta, error, reiniciar, escanearMovil }
}