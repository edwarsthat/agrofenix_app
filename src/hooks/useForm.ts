/* eslint-disable prettier/prettier */

import { useState, useRef } from "react"
import { ZodError, ZodType } from "zod"

type OutType<T> = {
    formState: T
    formErrors: Partial<Record<keyof T | string, string>>
    handleChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void
    handleArrayChange: (e: { target: { name: string; value: string[] } }) => void
    handleArrayObjectChange: (e: { target: { name: string; value: object } }) => void
    handleBoolean: (e: { target: { name: string; checked: boolean } }) => void
    resetForm: () => void
    fillForm: (formData: T) => void
    validateForm: (schema: ZodType<unknown>) => boolean
    setFormState: React.Dispatch<React.SetStateAction<T>>
    getDirtyValues: () => Partial<T>
}

export default function useForm<T extends Record<string, number | string | string[] | boolean | object[]>>(initialState?: T): OutType<T> {
    const [formState, setFormState] = useState<T>(initialState ?? ({} as T))
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof T | string, string>>>({})
    const originalData = useRef<T | null>(null)
    const resetForm = (): void => {
        originalData.current = null
        setFormState(initialState ?? {} as T)
    }

    const fillForm = (formData: T): void => {
        originalData.current = formData
        setFormState(formData)
    }

    const isEqual = (a: unknown, b: unknown): boolean => {
        if (a === b) return true
        if (typeof a !== typeof b) return false
        if (a === null || b === null || typeof a !== "object") return false

        if (Array.isArray(a) || Array.isArray(b)) {
            if (!Array.isArray(a) || !Array.isArray(b)) return false
            if (a.length !== b.length) return false
            return a.every((item, i) => isEqual(item, b[i]))
        }

        const aObj = a as Record<string, unknown>
        const bObj = b as Record<string, unknown>
        const aKeys = Object.keys(aObj)
        const bKeys = Object.keys(bObj)
        if (aKeys.length !== bKeys.length) return false
        return aKeys.every(
            (key) => Object.prototype.hasOwnProperty.call(bObj, key) && isEqual(aObj[key], bObj[key])
        )
    }

    const getDirtyValues = (): Partial<T> => {
        if (!originalData.current) return formState

        return Object.fromEntries(
            Object.entries(formState).filter(
                ([key, value]) => !isEqual(value, originalData.current![key])
            )
        ) as Partial<T>
    }

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ): void => {
        const { name, value, type } = event.target
        let parsedValue: string | number | boolean = value;

        if (type === "number") {
            parsedValue = value === "" ? "" : Number(value);
        } else if (type === "checkbox" && event.target instanceof HTMLInputElement) {
            parsedValue = event.target.checked;
        }

        setFormState(prev => ({
            ...prev,
            [name]: parsedValue,
        }))

        clearFieldError(name)

    }

    // Función de cambio para campos array
    const handleArrayChange = (e: { target: { name: string; value: string[] } }): void => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));

        clearFieldError(name)

    };

    const handleArrayObjectChange = (e: { target: { name: string; value: object } }): void => {
        const { name, value } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: value
        }));

        clearFieldError(name)

    };

    const handleBoolean = (e: { target: { name: string; checked: boolean } }): void => {
        const { name, checked } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: checked
        }));

        clearFieldError(name)
    };

    const getErrorMessages = (zodError: ZodError): Partial<Record<keyof T | string, string>> => {
        const errors: Record<string, string> = {}
        zodError.issues.forEach(err => {
            const path = err.path.join(".")
            errors[path] = err.message
        })
        return errors as Partial<Record<keyof T | string, string>>
    }

    const validateForm = (schema: ZodType<unknown>): boolean => {
        const result = schema.safeParse(formState)
        if (!result.success) {
            setFormErrors(getErrorMessages(result.error))
            return false
        }
        setFormErrors({})
        return true
    }

    const clearFieldError = (name: string): void => {
        setFormErrors(prev => {
            if (!prev[name]) return prev
            const rest = { ...prev }
            delete rest[name]
            return rest
        })
    }


    return {
        formState,
        formErrors,
        handleChange,
        resetForm,
        fillForm,
        validateForm,
        setFormState,
        handleArrayChange,
        handleArrayObjectChange,
        handleBoolean,
        getDirtyValues
    }
}
