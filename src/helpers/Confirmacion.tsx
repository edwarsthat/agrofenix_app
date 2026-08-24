import FenixButton from "../components/UI/Button/FenixButton"
import { modal, useModalStore } from "../store/useModalStore"

interface ConfirmOptions {
    title?: string
    mensaje: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
}

function ConfirmFooter({
    confirmText,
    cancelText,
    danger,
    onResolve
}: {
    confirmText: string
    cancelText: string
    danger: boolean
    onResolve: (value: boolean) => void
}) {
    return (
        <>
            <FenixButton variant="ghost" onClick={() => onResolve(false)}>
                {cancelText}
            </FenixButton>
            <FenixButton
                variant={danger ? "secondary" : "primary"}
                onClick={() => onResolve(true)} >
                {confirmText}
            </FenixButton>
        </>
    )
}

export function confirm({
    title = "Confirmar",
    mensaje,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    danger = false
}: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
        let resultado = false

        // show() va antes del subscribe: necesitamos el token para saber cuál
        // de los modales es el nuestro.
        const miToken = modal.show({
            title,
            children: <p>{mensaje}</p>,
            footer: (
                <ConfirmFooter
                    confirmText={confirmText}
                    cancelText={cancelText}
                    danger={danger}
                    onResolve={(value) => {
                        resultado = value;
                        modal.close();
                    }}
                />
            )
        })

        const unsubscribe = useModalStore.subscribe((state) => {
            // Este confirm deja la pantalla si el modal se cerró o si otro show()
            // ocupó su lugar. En ambos casos hay que resolver y soltar la suscripción.
            if (state.open && state.token === miToken) return
            unsubscribe()
            resolve(resultado)
        })
    })
}
