import { describe, it, expect } from "vitest"
import { usuarioSchema, usuarioDeletePayloadSchema } from "./usuarios"

const usuarioValido = {
    id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    nombre: "Ana",
    apellido: "García",
    email: "ana.garcia@agrofenix.com",
    usuario: "anagarcia",
    cargo_id: "1c2deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    activo: true,
    creado_en: "2026-01-01",
    actualizado_en: "2026-01-01",
}

describe("usuarioSchema", () => {
    it("acepta un usuario válido", () => {
        expect(usuarioSchema.safeParse(usuarioValido).success).toBe(true)
    })

    it("rechaza un id que no es uuid v4", () => {
        expect(usuarioSchema.safeParse({ ...usuarioValido, id: "no-es-uuid" }).success).toBe(false)
    })

    it("rechaza un cargo_id que no es uuid v4", () => {
        expect(usuarioSchema.safeParse({ ...usuarioValido, cargo_id: "no-es-uuid" }).success).toBe(false)
    })

    it("rechaza un email con formato inválido", () => {
        expect(usuarioSchema.safeParse({ ...usuarioValido, email: "correo-malo" }).success).toBe(false)
    })

    it("rechaza nombre menor a 2 caracteres", () => {
        expect(usuarioSchema.safeParse({ ...usuarioValido, nombre: "a" }).success).toBe(false)
    })

    it("rechaza usuario menor a 3 caracteres", () => {
        expect(usuarioSchema.safeParse({ ...usuarioValido, usuario: "ab" }).success).toBe(false)
    })

    it("ignora password_hash si llega (no está en el schema)", () => {
        const parsed = usuarioSchema.safeParse({ ...usuarioValido, password_hash: "secreto" })
        expect(parsed.success).toBe(true)
        expect(parsed.success && "password_hash" in parsed.data).toBe(false)
    })
})

describe("usuarioDeletePayloadSchema", () => {
    it("acepta un usuario_id válido", () => {
        expect(usuarioDeletePayloadSchema.safeParse({
            usuario_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        }).success).toBe(true)
    })

    it("rechaza usuario_id faltante", () => {
        expect(usuarioDeletePayloadSchema.safeParse({}).success).toBe(false)
    })
})
