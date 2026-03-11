import { describe, it, expect } from "vitest"
import { BlockSchema, BlockDataSchema, ValidatedBlockSchema } from "../block"
import { PageSchema } from "../page"

/* ── Fixtures ── */

const validBlock = {
  id: "block-1",
  blockType: "BlobBlock" as const,
  data: { title: "Mon titre", layout: "stack" as const },
  innerBlocks: [],
}

const validPage = {
  version: "1",
  slug: "ma-page",
  title: "Ma page",
  blocks: [validBlock],
}

/* ── BlockSchema ── */

describe("BlockSchema", () => {
  it("valide un bloc correct", () => {
    expect(() => BlockSchema.parse(validBlock)).not.toThrow()
  })

  it("valide un bloc avec innerBlocks imbriqués", () => {
    const nestedBlock = {
      id: "parent",
      blockType: "BlobSection" as const,
      data: {},
      innerBlocks: [validBlock],
    }
    expect(() => BlockSchema.parse(nestedBlock)).not.toThrow()
  })

  it("rejette un bloc sans id", () => {
    const { id: _id, ...rest } = validBlock
    expect(() => BlockSchema.parse(rest)).toThrow()
  })

  it("rejette un bloc avec id vide", () => {
    expect(() => BlockSchema.parse({ ...validBlock, id: "" })).toThrow()
  })

  it("rejette un blockType invalide", () => {
    expect(() => BlockSchema.parse({ ...validBlock, blockType: "InvalidType" })).toThrow()
  })

  it("rejette un bloc sans innerBlocks", () => {
    const { innerBlocks: _innerBlocks, ...rest } = validBlock
    expect(() => BlockSchema.parse(rest)).toThrow()
  })

  it("accepte les champs data supplémentaires (passthrough)", () => {
    const block = { ...validBlock, data: { title: "Test", champInconnu: "valeur" } }
    expect(() => BlockSchema.parse(block)).not.toThrow()
  })
})

/* ── BlockDataSchema ── */

describe("BlockDataSchema", () => {
  it("accepte un layout valide", () => {
    expect(() => BlockDataSchema.parse({ layout: "stack" })).not.toThrow()
    expect(() => BlockDataSchema.parse({ layout: "bar" })).not.toThrow()
    expect(() => BlockDataSchema.parse({ layout: "row" })).not.toThrow()
  })

  it("rejette un layout invalide", () => {
    expect(() => BlockDataSchema.parse({ layout: "invalid" })).toThrow()
  })

  it("accepte un size valide", () => {
    expect(() => BlockDataSchema.parse({ size: "xl" })).not.toThrow()
    expect(() => BlockDataSchema.parse({ size: "10xl" })).not.toThrow()
  })

  it("rejette un size invalide", () => {
    expect(() => BlockDataSchema.parse({ size: "xxxl" })).toThrow()
  })

  it("accepte un align valide", () => {
    expect(() => BlockDataSchema.parse({ align: "center" })).not.toThrow()
  })

  it("rejette un align invalide", () => {
    expect(() => BlockDataSchema.parse({ align: "justify" })).toThrow()
  })

  it("accepte un figureWidth valide", () => {
    expect(() => BlockDataSchema.parse({ figureWidth: "1/2" })).not.toThrow()
  })

  it("accepte des buttons correctement structurés", () => {
    const data = {
      buttons: [{ label: "CTA", href: "/page", variant: "primary" }],
    }
    expect(() => BlockDataSchema.parse(data)).not.toThrow()
  })
})

/* ── ValidatedBlockSchema (contraintes croisées) ── */

describe("ValidatedBlockSchema — contraintes croisées", () => {
  it("rejette layout=bar + actions=after", () => {
    const block = {
      ...validBlock,
      data: { layout: "bar", actions: "after" },
    }
    expect(() => ValidatedBlockSchema.parse(block)).toThrow()
  })

  it("rejette layout=bar + marker=right", () => {
    const block = {
      ...validBlock,
      data: { layout: "bar", marker: "right" },
    }
    expect(() => ValidatedBlockSchema.parse(block)).toThrow()
  })

  it("rejette layout=row + marker=left", () => {
    const block = {
      ...validBlock,
      data: { layout: "row", marker: "left" },
    }
    expect(() => ValidatedBlockSchema.parse(block)).toThrow()
  })

  it("accepte layout=stack + marker=left + actions=after", () => {
    const block = {
      ...validBlock,
      data: { layout: "stack", marker: "left", actions: "after" },
    }
    expect(() => ValidatedBlockSchema.parse(block)).not.toThrow()
  })

  it("accepte layout=bar + marker=left + actions=before", () => {
    const block = {
      ...validBlock,
      data: { layout: "bar", marker: "left", actions: "before" },
    }
    expect(() => ValidatedBlockSchema.parse(block)).not.toThrow()
  })
})

/* ── PageSchema ── */

describe("PageSchema", () => {
  it("valide une page correcte", () => {
    expect(() => PageSchema.parse(validPage)).not.toThrow()
  })

  it("rejette un slug avec des majuscules", () => {
    expect(() => PageSchema.parse({ ...validPage, slug: "Ma-Page" })).toThrow()
  })

  it("rejette un slug avec des espaces", () => {
    expect(() => PageSchema.parse({ ...validPage, slug: "ma page" })).toThrow()
  })

  it("accepte un slug avec tirets et chiffres", () => {
    expect(() => PageSchema.parse({ ...validPage, slug: "ma-page-123" })).not.toThrow()
  })

  it("rejette une page sans titre", () => {
    expect(() => PageSchema.parse({ ...validPage, title: "" })).toThrow()
  })

  it("rejette une page sans version", () => {
    const { version: _version, ...rest } = validPage
    expect(() => PageSchema.parse(rest)).toThrow()
  })

  it("valide une page avec métadonnées", () => {
    const page = {
      ...validPage,
      meta: { createdAt: "2026-03-03T00:00:00.000Z", author: "test" },
    }
    expect(() => PageSchema.parse(page)).not.toThrow()
  })

  it("valide une page sans blocs", () => {
    expect(() => PageSchema.parse({ ...validPage, blocks: [] })).not.toThrow()
  })
})
