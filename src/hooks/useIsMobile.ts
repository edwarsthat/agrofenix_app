import { useEffect, useState } from "react"

// Mismo breakpoint que usan los módulos CSS (Sidebar, Navbar): < 768px = móvil.
const QUERY = "(max-width: 767px)"

export default function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState<boolean>(() => window.matchMedia(QUERY).matches)

    useEffect(() => {
        const mql = window.matchMedia(QUERY)
        const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)

        setIsMobile(mql.matches)
        mql.addEventListener("change", onChange)
        return () => mql.removeEventListener("change", onChange)
    }, [])

    return isMobile
}
