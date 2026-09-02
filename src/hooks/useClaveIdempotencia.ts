
// src/hooks/useClaveIdempotencia.ts
import { useRef } from "react"

// La clave que hace idempotente un registro: se genera al montar el formulario
// y se renueva SOLO cuando el backend confirmó. Todo lo que pase en medio
// —reintento por señal caída, doble clic en Guardar, un peso corregido— es el
// mismo registro y tiene que viajar con la misma clave, o el backend crea el
// gemelo que la clave existe para evitar.
//
// Va en un ref y no en un `useMemo`: React puede descartar un memo cuando
// quiera, y aquí la identidad del valor ES la corrección.
export default function useClaveIdempotencia() {
    const clave = useRef(crypto.randomUUID())

    return {
        clave: clave.current,
        // Llamar únicamente después de un guardado confirmado.
        rotar: () => { clave.current = crypto.randomUUID() },
    }
}
