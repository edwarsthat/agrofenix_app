import React, { useId } from "react"

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

    return (
        <div className="form-group">
            <label htmlFor={name} className="form-label">
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
                className={`form-input ${error ? "input-error" : ""}`}
                aria-invalid={!!error}
                aria-describedby={error ? `${name}-error` : undefined}
            />
            {error && <p id={errorId} className="form-error" role="alert">{error}</p>}
        </div>
    )
}
