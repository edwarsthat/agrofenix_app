import { create } from "zustand";
import { ToastItem, ToastVariant } from "../components/UI/Toast/FenixToast";

interface ToastState {
    toasts: ToastItem[]
    show: (
        variant: ToastVariant,
        title?: string,
        description?: string,
        duration?: number,
    ) => void
    dismiss: (id: number | string) => void
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    show: (variant, title, description, duration) =>
        set((s) => ({
            toasts: [...s.toasts, { id: Date.now() + Math.random(), variant, title, description, duration }],
        })),
    dismiss: (id) => set((s) => ({
        toasts: s.toasts.filter((t) => t.id !== id)
    }))
}))

export const toast = {
    success: (title?: string, description?: string) => useToastStore.getState().show('success', title, description),
    error: (title?: string, description?: string) => useToastStore.getState().show('error', title, description),
    warning: (title?: string, description?: string) => useToastStore.getState().show('warning', title, description),
    info: (title?: string, description?: string) => useToastStore.getState().show('info', title, description),
};