import React, { useEffect, useId, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import styles from "./styles/FenixSelect.module.css"

export type FormSelectOption = {
    value: string
    label: string
    disabled?: boolean
}

type FormSelectInputProps = {
    name: string
    label: string
    options: FormSelectOption[]
    value: string
    onChange: (value: string) => void
    error?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
}

export default function FormSelectInput({
    name,
    label,
    options,
    value,
    onChange,
    error,
    placeholder = "Seleccione una opción",
    disabled = false,
    required = false
}: FormSelectInputProps): React.JSX.Element {
    const id = useId()
    const errorId = `${id}-error`
    const listboxId = `${id}-listbox`

    const [isOpen, setIsOpen] = useState(false)
    const rootRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    const selectedOption = options.find(option => option.value === value)

    useEffect(() => {
        if (!isOpen) return

        function handleClickOutside(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    function handleSelect(option: FormSelectOption) {
        if (option.disabled) return
        onChange(option.value)
        setIsOpen(false)
        triggerRef.current?.focus()
    }

    function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setIsOpen(true)
        } else if (e.key === "Escape") {
            setIsOpen(false)
        }
    }

    const fieldClassName = [
        styles.field,
        disabled ? styles.isDisabled : "",
        error ? styles.isError : ""
    ].filter(Boolean).join(" ")

    const triggerClassName = [
        styles.trigger,
        !selectedOption ? styles.isPlaceholder : "",
        isOpen ? styles.isOpen : ""
    ].filter(Boolean).join(" ")

    return (
        <div className={fieldClassName} ref={rootRef}>
            <label htmlFor={name} className={styles.label}>
                {label}
                {required && <span className={styles.required}>*</span>}
            </label>
            <button
                id={name}
                type="button"
                ref={triggerRef}
                className={triggerClassName}
                onClick={() => setIsOpen(open => !open)}
                onKeyDown={handleTriggerKeyDown}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
            >
                <span className={styles.triggerLabel}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className={[styles.chevron, isOpen ? styles.isOpen : ""].filter(Boolean).join(" ")}>
                    <ChevronDown size={18} />
                </span>
            </button>
            {isOpen && (
                <ul id={listboxId} role="listbox" className={styles.listbox} aria-labelledby={name}>
                    {options.map(option => {
                        const isSelected = option.value === value
                        const optionClassName = [
                            styles.option,
                            isSelected ? styles.isSelected : "",
                            option.disabled ? styles.isDisabled : ""
                        ].filter(Boolean).join(" ")

                        return (
                            <li
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                aria-disabled={option.disabled}
                                className={optionClassName}
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                                {isSelected && (
                                    <span className={styles.checkIcon}>
                                        <Check size={16} />
                                    </span>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
            {error && <p id={errorId} className={styles.help} role="alert">{error}</p>}
        </div>
    )
}
