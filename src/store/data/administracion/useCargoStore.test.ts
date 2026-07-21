import { beforeEach, describe, it, expect } from "vitest"
import useCargoStore from "./useCargoStore"
import { vi } from "vitest"
import { confirm } from "../../../helpers/Confirmacion"
import { socketRequest } from "../../../lib/socket"

vi.mock("../../../helpers/Confirmacion", () => ({ confirm: vi.fn() }))
vi.mock("../../../lib/socket", () => ({ socketRequest: vi.fn() }))

const cargoBase = {
    id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    nombre: "Coordinador",
    descripcion: null,
    creado_en: "x",
    activo: true
}

beforeEach(() => {
    useCargoStore.setState({ cargos: [], eliminando: [] })
})

describe("eventAddCargo", () => {
    it("agrega un cargo nuevo", () => {
        useCargoStore.getState().eventAddCargo(cargoBase)
        expect(useCargoStore.getState().cargos).toHaveLength(1)
    })

    it("no duplica si el id ya existe", () => {
        useCargoStore.getState().eventAddCargo(cargoBase)
        useCargoStore.getState().eventAddCargo(cargoBase)
        expect(useCargoStore.getState().cargos).toHaveLength(1)
    })
})

describe("eventUpdateCargo", () => {
    it("reemplaza el cargo con el mismo id", () => {
        useCargoStore.setState({ cargos: [cargoBase], eliminando: [] })
        const actualizado = { ...cargoBase, nombre: "Nuevo nombre" }

        useCargoStore.getState().eventUpdateCargo(actualizado)

        expect(useCargoStore.getState().cargos[0].nombre).toBe("Nuevo nombre")
    })

    it("agrega el cargo si el id no existe en el store", () => {
        useCargoStore.setState({ cargos: [cargoBase], eliminando: [] })
        const otroCargo = { ...cargoBase, id: "11111111-1111-4111-8111-111111111111" }

        useCargoStore.getState().eventUpdateCargo(otroCargo)

        expect(useCargoStore.getState().cargos).toHaveLength(2)
    })
})

describe("eventDeleteCargo", () => {
    it("marca activo:false en el cargo correcto", () => {
        useCargoStore.setState({ cargos: [cargoBase], eliminando: [] })
        useCargoStore.getState().eventDeleteCargo(cargoBase.id)
        expect(useCargoStore.getState().cargos[0].activo).toBe(false)
    })
})


describe("eliminarCargo", () => {
    it("no hace nada si el usuario cancela la confirmación", async () => {
        vi.mocked(confirm).mockResolvedValue(false)
        useCargoStore.setState({ cargos: [cargoBase], eliminando: [] })

        await useCargoStore.getState().eliminarCargo(cargoBase.id)

        expect(socketRequest).not.toHaveBeenCalled()
        expect(useCargoStore.getState().cargos[0].activo).toBe(true)
    })

    it("marca activo:false tras confirmar y que el server responda bien", async () => {
        vi.mocked(confirm).mockResolvedValue(true)
        vi.mocked(socketRequest).mockResolvedValue({ status: 200, id: "1", message: "ok" })
        useCargoStore.setState({ cargos: [cargoBase], eliminando: [] })

        await useCargoStore.getState().eliminarCargo(cargoBase.id)

        expect(useCargoStore.getState().cargos[0].activo).toBe(false)
        expect(useCargoStore.getState().eliminando).toEqual([])
    })

    it("no dispara una segunda petición si ya se está eliminando ese id", async () => {
        vi.mocked(confirm).mockResolvedValue(true)
        useCargoStore.setState({ cargos: [cargoBase], eliminando: [cargoBase.id] })

        await useCargoStore.getState().eliminarCargo(cargoBase.id)

        expect(confirm).not.toHaveBeenCalled()
    })

    it("si el server falla, no cambia activo pero libera el guard para reintentar", async () => {
        vi.mocked(confirm).mockResolvedValue(true)
        vi.mocked(socketRequest).mockRejectedValue(new Error("fail"))
        useCargoStore.setState({ cargos: [cargoBase], eliminando: [] })

        await useCargoStore.getState().eliminarCargo(cargoBase.id)

        expect(useCargoStore.getState().cargos[0].activo).toBe(true)
        expect(useCargoStore.getState().eliminando).toEqual([])
    })

})

describe("getCargos", () => {
    it("guarda los cargos cuando la respuesta es válida", async () => {
        vi.mocked(socketRequest).mockResolvedValue({
            status: 200, id: "1", message: "ok", data: [cargoBase]
        })

        await useCargoStore.getState().getCargos()

        expect(useCargoStore.getState().cargos).toEqual([cargoBase])
    })

    it("no toca el store si algún cargo de la lista no matchea el schema", async () => {
        vi.mocked(socketRequest).mockResolvedValue({
            status: 200, id: "1", message: "ok", data: [{ id: "no-es-uuid" }]
        })

        await useCargoStore.getState().getCargos()

        expect(useCargoStore.getState().cargos).toEqual([])
    })
})

describe("addCargo", () => {
    it("retorna true si el server responde bien", async () => {
        vi.mocked(socketRequest).mockResolvedValue({
            status: 200, id: "1", message: "ok"
        })
        const ok = await useCargoStore.getState().addCargo({
            nombre: "Coordinador", descripcion: ""
        }, new Set())
        expect(ok).toBe(true)
    })

    it("retorna false si socketRequest falla", async () => {
        vi.mocked(socketRequest).mockRejectedValue(new Error("fail"))
        const ok = await useCargoStore.getState().addCargo({
            nombre: "Coordinador", descripcion: ""
        }, new Set())
        expect(ok).toBe(false)
    })

    it("manda el cargo_id correcto en el payload", async () => {
        vi.mocked(socketRequest).mockResolvedValue({ status: 200, id: "1", message: "ok" })

        await useCargoStore.getState().updateCargo("cargo-123",
            { nombre: "Coordinador", descripcion: "" }, new Set(["perm-1"]))

        expect(socketRequest).toHaveBeenCalledWith(
            expect.objectContaining({ payload: expect.objectContaining({ cargo_id: "cargo-123" }) })
        )
    })

})
