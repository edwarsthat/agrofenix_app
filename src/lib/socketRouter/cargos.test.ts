import { vi, describe, it, expect } from "vitest"
import cargoRouter from "./cargos"
import useCargoStore from "../../store/data/administracion/useCargoStore"

vi.mock("../../store/data/administracion/useCargoStore")

const cargoValido = { id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", nombre: "Coordinador", descripcion: null, creado_en: "x", activo: true }

describe("cargoRouter - add", () => {
    it("llama eventAddCargo cuando el payload es válido", () => {
        const eventAddCargo = vi.fn()
        vi.mocked(useCargoStore.getState).mockReturnValue({ eventAddCargo } as never)

        cargoRouter({ event: "cargos", action: "add", data: { data: cargoValido } })

        expect(eventAddCargo).toHaveBeenCalledWith(cargoValido)
    })

    it("NO llama eventAddCargo si el payload no matchea el schema", () => {
        const eventAddCargo = vi.fn()
        vi.mocked(useCargoStore.getState).mockReturnValue({ eventAddCargo } as never)

        cargoRouter({ event: "cargos", action: "add", data: { data: { id: "no-es-uuid" } } })

        expect(eventAddCargo).not.toHaveBeenCalled()
    })
})

describe("cargoRouter - delete", () => {
    it("llama eventDeleteCargo con el cargo_id correcto", () => {
        const eventDeleteCargo = vi.fn()
        vi.mocked(useCargoStore.getState).mockReturnValue({ eventDeleteCargo } as never)

        cargoRouter({ event: "cargos", action: "delete", data: { cargo_id: cargoValido.id } })

        expect(eventDeleteCargo).toHaveBeenCalledWith(cargoValido.id)
    })

    it("NO llama eventDeleteCargo si el payload no trae cargo_id", () => {
        const eventDeleteCargo = vi.fn()
        vi.mocked(useCargoStore.getState).mockReturnValue({ eventDeleteCargo } as never)

        cargoRouter({ event: "cargos", action: "delete", data: {} })

        expect(eventDeleteCargo).not.toHaveBeenCalled()
    })
    
})

describe("cargoRouter - update", () => {
    it("llama eventUpdateCargo cuando el payload es válido", () => {
        const eventUpdateCargo = vi.fn()
        vi.mocked(useCargoStore.getState).mockReturnValue({ eventUpdateCargo } as never)

        cargoRouter({ event: "cargos", action: "update", data: { data: cargoValido } })

        expect(eventUpdateCargo).toHaveBeenCalledWith(cargoValido)
    })

    it("NO llama eventUpdateCargo si el payload no matchea el schema", () => {
        const eventUpdateCargo = vi.fn()
        vi.mocked(useCargoStore.getState).mockReturnValue({ eventUpdateCargo } as never)

        cargoRouter({ event: "cargos", action: "update", data: { data: { id: "no-es-uuid" } } })

        expect(eventUpdateCargo).not.toHaveBeenCalled()
    })
})

