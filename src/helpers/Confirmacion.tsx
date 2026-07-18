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

        const unsubscribe = useModalStore.subscribe((state, prevState) => {
            if(prevState.open && !state.open){
                unsubscribe()
                resolve(resultado)
            }
        })

        modal.show({
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
    })


}
