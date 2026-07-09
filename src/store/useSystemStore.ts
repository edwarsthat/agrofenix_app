import { create } from "zustand"

type Theme = "light" | "dark"

// Media query del SO: refleja si el sistema operativo está en modo oscuro.
// En Tauri el webview respeta el tema del SO, así que esto funciona igual que
// en un navegador.
const mql = window.matchMedia("(prefers-color-scheme: dark)")

// Aplica el tema al <html> escribiendo data-theme. Los tokens de colors.css
// hacen el resto (bloques [data-theme="light"] / [data-theme="dark"]).
const applyTheme = (theme: Theme): void => {
    document.documentElement.setAttribute("data-theme", theme)
}

interface SystemType {
    theme: Theme            // tema efectivo aplicado en la UI
    followSystem: boolean   // true = sigue al SO; false = override manual del usuario
    setTheme: (theme: Theme) => void   // fija un tema manual (deja de seguir al SO)
    useSystemTheme: () => void         // vuelve a seguir el tema del SO
}

const useSystemStore = create<SystemType>((set, get) => {
    // Estado inicial: seguir al sistema.
    const initial: Theme = mql.matches ? "dark" : "light"
    applyTheme(initial)

    // Reacciona a cambios del SO en vivo, pero solo si no hay override manual.
    mql.addEventListener("change", (e) => {
        if (!get().followSystem) return
        const theme: Theme = e.matches ? "dark" : "light"
        applyTheme(theme)
        set({ theme })
    })

    return {
        theme: initial,
        followSystem: true,
        setTheme: (theme) => {
            applyTheme(theme)
            set({ theme, followSystem: false })
        },
        useSystemTheme: () => {
            const theme: Theme = mql.matches ? "dark" : "light"
            applyTheme(theme)
            set({ theme, followSystem: true })
        },
    }
})

export default useSystemStore;
