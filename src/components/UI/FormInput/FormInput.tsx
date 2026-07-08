import React, { useId } from "react"
import styles from "./styles/FormInput.module.css"

type FormInputProps = {
    name: string
    label: string
    type?: string
    value: string | number
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: string
    placeholder?: string
    disabled?: boolean
}

export default function FormInput({
    name,
    label,
    type = "text",
    value,
    onChange,
    error,
    placeholder,
    disabled = false
}: FormInputProps): React.JSX.Element {
    const id = useId()
    const errorId = `${id}-error`

    const fieldClassName = [
        styles["fx-field"],
        disabled ? styles["is-disabled"] : "",
        error ? styles["is-error"] : ""
    ].filter(Boolean).join(" ")

    return (
        <div className={fieldClassName}>
            <label htmlFor={name} className={styles["fx-label"]}>
                {label}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={styles["fx-input"]}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
            />
            {error && <p id={errorId} className={styles["fx-help"]} role="alert">{error}</p>}
        </div>
    )
}
