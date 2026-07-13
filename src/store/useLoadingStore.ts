import { create } from "zustand"

interface LoadingState {
    /** Peticiones vivas en este momento. */
    pending: number
    loading: boolean
    label?: string
    start: (label?: string) => void
    stop: () => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
    pending: 0,
    loading: false,
    label: undefined,

    // Un contador y no un booleano: con dos peticiones en paralelo, la primera
    // en terminar apagaría el loading mientras la otra sigue viva.
    start: (label) => set((s) => ({
        pending: s.pending + 1,
        loading: true,
        label: label ?? s.label,
    })),

    stop: () => set((s) => {
        const pending = Math.max(0, s.pending - 1)
        return {
            pending,
            loading: pending > 0,
            label: pending > 0 ? s.label : undefined,
        }
    }),
}))

// Acceso sin hook, para usarlo fuera de React (socketRequest, etc.),
// igual que el helper `toast` de useTosterStore.
export const loading = {
    start: (label?: string) => useLoadingStore.getState().start(label),
    stop: () => useLoadingStore.getState().stop(),
}
