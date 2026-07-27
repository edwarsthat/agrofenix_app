import { useMemo } from "react"
import { buildLoginFormArr, loginFormSchema, LoginFormType, loginInitialValues } from "./validations"
import Form from "../../components/funcionalidad/form/Form"
import styles from "./ChangePassword.module.css"

type propsType = {
    onCancel: () => void
    handleSubmit: (values: LoginFormType) => Promise<void>
}

function LockIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
    )
}

export default function ChangePassword({ onCancel, handleSubmit }:propsType){

    const formArr = useMemo(() =>  buildLoginFormArr(), [])

    return (
        <div className={styles.wrapper}>
            <div className={styles.iconChip}>
                <LockIcon />
            </div>
            <Form
                formArr={formArr}
                initialState={loginInitialValues}
                schema={loginFormSchema}
                title="Actualiza tu contraseña"
                description="Por tu seguridad, debes definir una nueva contraseña antes de continuar."
                onSubmit={handleSubmit}
                onCancel={onCancel}
            />
        </div>
    )
}
