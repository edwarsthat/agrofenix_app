import useForm from "../../../hooks/useForm"
import FormInput from "../../UI/FormInput/FormInput"

interface ItemFormType<T> {
    label: string
    type: "text"
    nombre: keyof T & string
}

interface FormType<T extends Record<string, string | number>> {
    formArr: ItemFormType<T>[]
    initialState: T
}

export default function Form<T extends Record<string, string | number>>({ formArr, initialState }: FormType<T>) {
    const { formState, handleChange, formErrors } = useForm<T>(initialState)

    return (
        <div>
            <form>
                {formArr.map(item => {
                    if (item.type === "text") {
                        return (
                            <FormInput
                                key={item.nombre}
                                name={item.nombre}
                                label={item.label}
                                value={formState[item.nombre]}
                                onChange={handleChange}
                                placeholder={item.label}
                                error={formErrors[item.nombre]}
                            />
                        )
                    }
                    return null
                })}
            </form>
        </div>
    )
}