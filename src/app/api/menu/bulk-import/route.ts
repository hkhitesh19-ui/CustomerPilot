import { NextRequest } from "next/server"
import * as XLSX from "xlsx"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"
import { db } from "@/lib/db"

interface NormalizedItem {
  category: string
  name: string
  rawName?: string
  variation?: string
  price: number | string
  originalPrice?: number | string | null
  isVeg?: boolean | string
  isAvailable?: boolean | string
  description?: string | null
}

function cleanKey(k: string): string {
  return k.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function matchHeader(row: Record<string, any>, possibleKeys: string[]): any {
  const rowKeys = Object.keys(row)
  for (const p of possibleKeys) {
    const cleanP = cleanKey(p)
    const found = rowKeys.find(k => cleanKey(k) === cleanP)
    if (found !== undefined && row[found] !== undefined && row[found] !== "") {
      return row[found]
    }
  }
  return null
}

function parseWorkbookItems(workbook: XLSX.WorkBook): NormalizedItem[] {
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []

  const sheet = workbook.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" })
  const validItems: NormalizedItem[] = []

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i]
    const rawName = String(
      matchHeader(row, ["itemname", "name", "productname", "item", "product", "title"]) || ""
    ).trim()
    if (!rawName) continue

    const rawPrice = matchHeader(row, ["sellingprice", "price", "rate", "amount", "cost", "sp"])
    const numPrice = Number(String(rawPrice).replace(/[^0-9.]/g, ""))
    if (rawPrice === null || isNaN(numPrice) || numPrice < 0) continue

    const rawVariation = String(
      matchHeader(row, ["variation", "variationweight", "weight", "size", "variant", "unit", "qty", "portion"]) || ""
    ).trim()

    let formattedName = rawName
    if (rawVariation && !rawName.toLowerCase().includes(rawVariation.toLowerCase())) {
      formattedName = `${rawName} (${rawVariation})`
    }

    const rawCategory = String(
      matchHeader(row, ["category", "cat", "group", "section", "department"]) || "General"
    ).trim()

    const rawMrp = matchHeader(row, ["mrporiginalprice", "mrp", "originalprice", "original", "strikeprice"])
    const numMrp = rawMrp ? Number(String(rawMrp).replace(/[^0-9.]/g, "")) : null
    const validMrp = numMrp && !isNaN(numMrp) && numMrp > numPrice ? Math.round(numMrp) : null

    const rawVeg = String(
      matchHeader(row, ["foodtype", "foodtypevegnonveg", "veg", "type", "isveg", "diet"]) || "Veg"
    ).trim().toLowerCase()
    const isVeg = !(rawVeg.includes("non") || rawVeg === "egg" || rawVeg === "no" || rawVeg === "false")

    const rawAvail = String(
      matchHeader(row, ["available", "availableyesno", "isavailable", "status", "instock"]) || "YES"
    ).trim().toLowerCase()
    const isAvailable = !(rawAvail === "no" || rawAvail === "false" || rawAvail.includes("out") || rawAvail === "inactive")

    const description = String(matchHeader(row, ["description", "desc", "details"]) || "").trim() || null

    validItems.push({
      category: rawCategory || "General",
      name: formattedName,
      price: Math.round(numPrice),
      originalPrice: validMrp,
      isVeg,
      isAvailable,
      description,
    })
  }

  return validItems
}

export async function POST(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant()
    let merchantId = merchant?.id
    if (!merchantId) {
      const headerId = req.headers.get("x-merchant-id")
      if (headerId) {
        const found = await db.merchant.findUnique({ where: { id: headerId } })
        if (found) merchantId = found.id
      }
    }
    if (!merchantId) return err("Unauthorized", 401)

    const contentType = req.headers.get("content-type") || ""
    let itemsToImport: NormalizedItem[] = []
    let mode: "append" | "replace" = "append"

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File | null
      const rawMode = String(formData.get("mode") || "append")
      if (rawMode === "replace") mode = "replace"

      if (!file) {
        return err("No file uploaded. Please attach an Excel or CSV file.", 400)
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const workbook = XLSX.read(buffer, { type: "buffer" })
      itemsToImport = parseWorkbookItems(workbook)
    } else {
      const body = await req.json().catch(() => ({}))
      if (Array.isArray(body.items)) {
        itemsToImport = body.items
      }
      if (body.mode === "replace") mode = "replace"
    }

    if (!itemsToImport || itemsToImport.length === 0) {
      return err("No valid items to import. Please check your file content.", 400)
    }

    if (itemsToImport.length > 2000) {
      return err("Maximum 2000 items allowed per bulk import.", 400)
    }

    // Prepare Prisma records
    const records = itemsToImport.map((item, idx) => {
      const rawName = String(item.name || "").trim()
      const variation = item.variation ? String(item.variation).trim() : ""
      let formattedName = rawName
      if (variation && !rawName.toLowerCase().includes(variation.toLowerCase())) {
        formattedName = `${rawName} (${variation})`
      }

      const price = Math.round(Number(item.price) || 0)
      const numMrp = item.originalPrice ? Number(item.originalPrice) : null
      const orig = numMrp && numMrp > price ? Math.round(numMrp) : null

      return {
        merchantId: merchantId!,
        category: (item.category && String(item.category).trim()) || "General",
        name: formattedName,
        description: item.description ? String(item.description).trim() : null,
        price,
        originalPrice: orig,
        isVeg: item.isVeg !== undefined ? Boolean(item.isVeg) : true,
        isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
        sortOrder: idx,
      }
    }).filter(r => r.name.length > 0 && r.price >= 0)

    if (records.length === 0) {
      return err("No valid records could be processed. Please check item names and prices.", 400)
    }

    // Atomic execution
    if (mode === "replace") {
      await db.$transaction([
        db.menuItem.deleteMany({ where: { merchantId } }),
        db.menuItem.createMany({ data: records }),
      ])
    } else {
      await db.menuItem.createMany({ data: records })
    }

    // Audit log
    await db.auditLog.create({
      data: {
        merchantId,
        actorType: "OWNER",
        actorId: merchantId,
        action: "MENU_BULK_IMPORTED",
        entity: "MenuItem",
        entityId: merchantId,
        metadata: JSON.stringify({
          count: records.length,
          mode,
          sample: records.slice(0, 3).map(r => r.name),
        }),
      },
    }).catch(() => {})

    return ok({
      success: true,
      importedCount: records.length,
      mode,
      sampleItems: records.slice(0, 5).map(r => ({ name: r.name, price: r.price, category: r.category })),
    })
  } catch (error: any) {
    console.error("[Menu Bulk Import API] Execution Error:", error)
    return err(error.message || "Failed to bulk import menu items", 500)
  }
}
