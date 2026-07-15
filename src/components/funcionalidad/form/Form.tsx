import { FormEvent } from "react"
import { ZodType } from "zod"
import useForm from "../../../hooks/useForm"
import FormInput from "../../UI/FormInput/FormInput"
import FenixButton from "../../UI/Button/FenixButton"
import styles from "./Form.module.css"

type FieldWidth = "full" | "half" | "third" | "twoThirds" | "quarter"

interface ItemFormType<T> {
    label: string
    type: "text"
    nombre: keyof T & string
    /** Ancho del campo dentro de la grilla de 12 columnas. Por defecto "full". */
    width?: FieldWidth
    placeholder?: string
}

export interface FormType<T extends Record<string, string | number>> {
    formArr: ItemFormType<T>[]
    initialState: T
    /** Título opcional mostrado en la cabecera del formulario. */
    title?: string
    /** Descripción opcional bajo el título. */
    description?: string
    /** Texto del botón de envío. Por defecto "Guardar". */
    submitLabel?: string
    /** Texto del botón secundario. Si se omite, no se muestra. */
    cancelLabel?: string
    onSubmit?: (values: T) => void
    onCancel?: () => void
    /** Esquema zod. Si se pasa, el formulario se valida antes de enviar y los
     *  errores se muestran bajo cada campo. */
    schema?: ZodType<unknown>
    /** Deshabilita e indica estado de carga en el botón de envío. */
    loading?: boolean
    disabled?: boolean
}

const widthClass: Record<FieldWidth, string> = {
    full: styles["field--full"],
    half: styles["field--half"],
    third: styles["field--third"],
    twoThirds: styles["field--twoThirds"],
    quarter: styles["field--quarter"],
}

export default function Form<T extends Record<string, string | number>>({
    formArr,
    initialState,
    title,
    description,
    submitLabel = "Guardar",
    cancelLabel,
    onSubmit,
    onCancel,
    schema,
    loading = false,
    disabled = false,
}: FormType<T>) {
    const { formState, handleChange, formErrors, validateForm } = useForm<T>(initialState)

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault()
        if (loading || disabled) return
        if (schema && !validateForm(schema)) return
        onSubmit?.(formState)
    }

    const formClassName = [styles.form, disabled ? styles.isDisabled : ""]
        .filter(Boolean)
        .join(" ")

    return (
        <form className={formClassName} onSubmit={handleSubmit} noValidate>
            {(title || description) && (
                <header className={styles.sectionHeader}>
                    {title && <h2 className={styles.sectionTitle}>{title}</h2>}
                    {description && (
                        <p className={styles.sectionDescription}>{description}</p>
                    )}
                </header>
            )}

            <div className={styles.grid}>
                {formArr.map(item => {
                    if (item.type === "text") {
                        const cellClass = [
                            styles.field,
                            widthClass[item.width ?? "full"],
                        ]
                            .filter(Boolean)
                            .join(" ")

                        return (
                            <div key={item.nombre} className={cellClass}>
                                <FormInput
                                    name={item.nombre}
                                    label={item.label}
                                    value={formState[item.nombre]}
                                    onChange={handleChange}
                                    placeholder={item.placeholder ?? item.label}
                                    error={formErrors[item.nombre]}
                                    disabled={disabled}
                                />
                            </div>
                        )
                    }
                    return null
                })}
            </div>

            {(onSubmit || onCancel) && (
                <div className={`${styles.actions} ${styles["actions--end"]}`}>
                    {cancelLabel && onCancel && (
                        <FenixButton
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            {cancelLabel}
                        </FenixButton>
                    )}
                    {onSubmit && (
                        <FenixButton type="submit" variant="primary" loading={loading}>
                            {submitLabel}
                        </FenixButton>
                    )}
                </div>
            )}
        </form>
    )
}
