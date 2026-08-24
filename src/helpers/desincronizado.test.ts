import { describe, it, expect, beforeEach, vi } from "vitest"
import { avisarDesincronizado } from "./desincronizado"
import { useToastStore } from "../store/useTosterStore"

describe("avisarDesincronizado", () => {
    beforeEach(() => {
        useToastStore.setState({ toasts: [] })
        vi.spyOn(console, "error").mockImplementation(() => { })
    })

    it("muestra un toast de warning con el contexto", () => {
        avisarDesincronizado("los cargos " + Math.random(), new Error("x"))
        const [t] = useToastStore.getState().toasts
        expect(t.variant).toBe("warning")
        expect(t.description).toContain("los cargos")
    })

    it("usa el mensaje personalizado cuando se pasa", () => {
        avisarDesincronizado("ctx " + Math.random(), new Error("x"), "mensaje propio")
        expect(useToastStore.getState().toasts[0].description).toBe("mensaje propio")
    })

    it("agrupa una ráfaga del mismo contexto en un solo toast", () => {
        const ctx = "ráfaga " + Math.random()
        for (let i = 0; i < 20; i++) avisarDesincronizado(ctx, new Error("x"))
        expect(useToastStore.getState().toasts).toHaveLength(1)
    })

    it("no agrupa contextos distintos", () => {
        const n = Math.random()
        avisarDesincronizado("a" + n, new Error("x"))
        avisarDesincronizado("b" + n, new Error("x"))
        expect(useToastStore.getState().toasts).toHaveLength(2)
    })

    it("siempre deja rastro en consola, aunque agrupe el toast", () => {
        const ctx = "consola " + Math.random()
        avisarDesincronizado(ctx, new Error("x"))
        avisarDesincronizado(ctx, new Error("x"))
        expect(console.error).toHaveBeenCalledTimes(2)
        expect(useToastStore.getState().toasts).toHaveLength(1)
    })
})
