// src/types/administracion/cargos.test.ts
import { describe, it, expect } from "vitest"
import { cargoSchema, cargoDeletePayloadSchema } from "./cargos"

describe("cargoSchema", () => {
    it("acepta un cargo válido", () => {
        expect(cargoSchema.safeParse({
            id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
            nombre: "Coordinador",
            descripcion: null,
            creado_en: "2026-01-01",
            activo: true,
        }).success).toBe(true)
    })

    it("rechaza un id que no es uuid v4", () => {
        expect(cargoSchema.safeParse({
            id: "no-es-uuid",
            nombre: "Coordinador",
            descripcion: null,
            creado_en: "x",
            activo: true
        }).success).toBe(false)
    })

    it("rechaza nombre menor a 3 caracteres", () => {
        expect(cargoSchema.safeParse({ 
            id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", 
            nombre: "ab", 
            descripcion: null, 
            creado_en: "x", 
            activo: true 
        }).success).toBe(false)
    })
})

describe("cargoDeletePayloadSchema", () => {
    it("rechaza cargo_id faltante", () => {
        expect(cargoDeletePayloadSchema.safeParse({}).success).toBe(false)
    })
})
