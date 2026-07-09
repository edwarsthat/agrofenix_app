import { create } from "zustand"

type Theme = "light" | "dark"


const mql = window.matchMedia("(prefers-color-scheme: dark)")


const applyTheme = (theme: Theme): void => {
    document.documentElement.setAttribute("data-theme", theme)
}

interface SystemType {
    theme: Theme          
    followSystem: boolean  
    setTheme: (theme: Theme) => void   
    useSystemTheme: () => void      
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
