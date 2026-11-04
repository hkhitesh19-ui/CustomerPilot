import { NextRequest } from "next/server"
import * as XLSX from "xlsx"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"
import { db } from "@/lib/db"

interface NormalizedItem {
  category: string
  name: string
  rawName: string
  variation: string
  price: number
  originalPrice: number | null
  isVeg: boolean
  isAvailable: boolean
  description: string | null
}

interface InvalidRow {
  rowNumber: number
  name: string
  reason: string
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

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return err("No file uploaded. Please select an Excel (.xlsx, .xls) or CSV file.", 400)
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let workbook: XLSX.WorkBook
    try {
      workbook = XLSX.read(buffer, { type: "buffer" })
    } catch (parseErr: any) {
      return err("Failed to parse file. Please upload a valid .xlsx, .xls, or .csv document.", 400)
    }

    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return err("The uploaded workbook has no sheets.", 400)
    }

    const sheet = workbook.Sheets[sheetName]
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" })

    if (rawRows.length === 0) {
      return err("Uploaded sheet is empty. Please add items before uploading.", 400)
    }

    if (rawRows.length > 2000) {
      return err("Maximum 2000 items allowed per file. Please split larger catalogs into batches.", 400)
    }

    const validItems: NormalizedItem[] = []
    const invalidRows: InvalidRow[] = []

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i]
      const rowNum = i + 2 // 1-based index accounting for header row

      const rawName = String(
        matchHeader(row, ["itemname", "name", "productname", "item", "product", "title"]) || ""
      ).trim()

      if (!rawName) {
        // Skip completely empty rows
        const hasAnyVal = Object.values(row).some(v => v !== "" && v !== null && v !== undefined)
        if (hasAnyVal) {
          invalidRows.push({ rowNumber: rowNum, name: "Empty", reason: "Missing item name" })
        }
        continue
      }

      const rawPrice = matchHeader(row, ["sellingprice", "price", "rate", "amount", "cost", "sp"])
      const numPrice = Number(String(rawPrice).replace(/[^0-9.]/g, ""))

      if (rawPrice === null || isNaN(numPrice) || numPrice < 0) {
        invalidRows.push({ rowNumber: rowNum, name: rawName, reason: "Invalid or missing selling price" })
        continue
      }

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
        rawName,
        variation: rawVariation,
        price: Math.round(numPrice),
        originalPrice: validMrp,
        isVeg,
        isAvailable,
        description,
      })
    }

    return ok({
      totalRows: rawRows.length,
      validCount: validItems.length,
      invalidCount: invalidRows.length,
      preview: validItems.slice(0, 8),
      validItems,
      invalidRows: invalidRows.slice(0, 5),
    })
  } catch (error: any) {
    console.error("[Menu Bulk Preview API] Error:", error)
    return err(error.message || "Failed to preview file", 500)
  }
}
