/**
 * Pure-JS PDF 1.4 Generator for Official Tax Invoices
 * Zero external binary dependencies, runs on Node/Edge/Linux/Windows in < 2ms.
 */

export interface InvoicePdfItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface InvoicePdfData {
  orderNo: string
  date: string
  merchantName: string
  merchantAddress?: string | null
  merchantPhone?: string | null
  gstin?: string | null
  upiId?: string | null
  customerName?: string | null
  customerPhone: string
  paymentMethod: string
  items: InvoicePdfItem[]
  subtotal: number
  discount: number
  discountType?: "flat" | "percent"
  taxableAmount: number
  gstRate: number
  gstType: "CGST_SGST" | "IGST"
  cgst: number
  sgst: number
  igst: number
  grandTotal: number
  terms?: string | null
}

export class SimplePdfWriter {
  private stream: string[] = []

  private escapeText(text?: string | null): string {
    if (!text) return ""
    return String(text)
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/₹/g, "Rs. ")
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, " ") // Clean non-ASCII for WinAnsi standard font
  }

  addText(font: "F1" | "F2", size: number, x: number, y: number, text: string) {
    const escaped = this.escapeText(text)
    this.stream.push(`BT /${font} ${size} Tf ${x} ${y} Td (${escaped}) Tj ET`)
  }

  addLine(x1: number, y1: number, x2: number, y2: number, lineWidth = 0.5) {
    this.stream.push(`${lineWidth} w ${x1} ${y1} m ${x2} ${y2} l S`)
  }

  addRect(x: number, y: number, w: number, h: number, fill = false, stroke = true, r = 0, g = 0, b = 0) {
    this.stream.push(`${r} ${g} ${b} ${fill ? "rg" : "RG"}`)
    this.stream.push(`${x} ${y} ${w} ${h} re ${fill && stroke ? "B" : fill ? "f" : "S"}`)
  }

  build(): Buffer {
    const contentStream = this.stream.join("\n")
    const streamLen = Buffer.byteLength(contentStream, "utf-8")

    const objs = [
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj",
      "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj",
      "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj",
      `6 0 obj\n<< /Length ${streamLen} >>\nstream\n${contentStream}\nendstream\nendobj`
    ]

    const header = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"
    let body = ""
    const offsets: number[] = []

    let currentOffset = Buffer.byteLength(header, "latin1")
    for (const obj of objs) {
      offsets.push(currentOffset)
      const objStr = obj + "\n"
      body += objStr
      currentOffset += Buffer.byteLength(objStr, "latin1")
    }

    const startXref = currentOffset
    let xref = "xref\n0 7\n0000000000 65535 f \n"
    for (const off of offsets) {
      xref += String(off).padStart(10, "0") + " 00000 n \n"
    }

    const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`
    return Buffer.from(header + body + xref + trailer, "latin1")
  }
}

export function generateInvoicePdf(data: InvoicePdfData): Buffer {
  const pdf = new SimplePdfWriter()

  // 1. Header Banner Box
  pdf.addRect(40, 740, 515, 65, true, true, 0.96, 0.97, 0.99)
  pdf.addText("F2", 18, 55, 782, data.merchantName.toUpperCase())
  
  if (data.merchantAddress) {
    pdf.addText("F1", 9, 55, 767, data.merchantAddress)
  }
  const contactParts: string[] = []
  if (data.merchantPhone) contactParts.push(`Ph: ${data.merchantPhone}`)
  if (data.upiId) contactParts.push(`UPI: ${data.upiId}`)
  if (contactParts.length > 0) {
    pdf.addText("F1", 9, 55, 752, contactParts.join(" | "))
  }

  // Invoice Pill on right
  pdf.addRect(410, 750, 135, 45, true, true, 0.90, 0.94, 0.99)
  pdf.addText("F2", 12, 420, 778, "TAX INVOICE")
  pdf.addText("F1", 10, 420, 764, `#${data.orderNo}`)

  // 2. Metadata / Billed To Section
  pdf.addRect(40, 680, 515, 50, true, false, 0.98, 0.98, 0.98)
  pdf.addLine(40, 730, 555, 730, 0.5)
  pdf.addLine(40, 680, 555, 680, 0.5)

  pdf.addText("F2", 9, 55, 715, "BILLED TO:")
  pdf.addText("F1", 9, 125, 715, `${data.customerName || "Customer"} (${data.customerPhone})`)

  pdf.addText("F2", 9, 360, 715, "DATE:")
  pdf.addText("F1", 9, 410, 715, data.date)

  if (data.gstin) {
    pdf.addText("F2", 9, 55, 695, "GSTIN:")
    pdf.addText("F1", 9, 125, 695, data.gstin)
  }
  pdf.addText("F2", 9, 360, 695, "PAYMENT:")
  pdf.addText("F1", 9, 410, 695, data.paymentMethod || "UPI")

  // 3. Itemized Table
  let currentY = 650
  // Header row
  pdf.addRect(40, currentY, 515, 20, true, false, 0.12, 0.16, 0.24)
  pdf.addText("F2", 9, 50, currentY + 6, "#")
  pdf.addText("F2", 9, 75, currentY + 6, "ITEM DESCRIPTION")
  pdf.addText("F2", 9, 340, currentY + 6, "QTY")
  pdf.addText("F2", 9, 410, currentY + 6, "UNIT PRICE")
  pdf.addText("F2", 9, 490, currentY + 6, "AMOUNT (Rs)")

  currentY -= 22
  data.items.forEach((item, index) => {
    pdf.addText("F1", 9, 50, currentY, String(index + 1))
    // Truncate overly long names
    const cleanName = item.name.length > 38 ? item.name.slice(0, 36) + ".." : item.name
    pdf.addText("F1", 9, 75, currentY, cleanName)
    pdf.addText("F1", 9, 345, currentY, String(item.quantity))
    pdf.addText("F1", 9, 410, currentY, `Rs. ${Number(item.unitPrice).toFixed(2)}`)
    pdf.addText("F1", 9, 490, currentY, `Rs. ${Number(item.totalPrice).toFixed(2)}`)
    
    pdf.addLine(40, currentY - 5, 555, currentY - 5, 0.3)
    currentY -= 18
  })

  // 4. Financial Calculations
  currentY -= 5
  pdf.addText("F1", 9, 360, currentY, "Subtotal:")
  pdf.addText("F1", 9, 490, currentY, `Rs. ${Number(data.subtotal).toFixed(2)}`)
  currentY -= 15

  if (data.discount > 0) {
    const discLabel = data.discountType === "percent" ? "Discount (Promo):" : "Discount (Flat):"
    pdf.addText("F1", 9, 360, currentY, discLabel)
    pdf.addText("F1", 9, 490, currentY, `-Rs. ${Number(data.discount).toFixed(2)}`)
    currentY -= 15
  }

  pdf.addText("F1", 9, 360, currentY, "Taxable Value:")
  pdf.addText("F1", 9, 490, currentY, `Rs. ${Number(data.taxableAmount).toFixed(2)}`)
  currentY -= 15

  if (data.gstRate > 0) {
    if (data.gstType === "IGST") {
      pdf.addText("F1", 9, 360, currentY, `IGST (${data.gstRate}%):`)
      pdf.addText("F1", 9, 490, currentY, `Rs. ${Number(data.igst).toFixed(2)}`)
      currentY -= 15
    } else {
      const halfRate = (data.gstRate / 2).toFixed(1)
      pdf.addText("F1", 9, 360, currentY, `CGST (${halfRate}%):`)
      pdf.addText("F1", 9, 490, currentY, `Rs. ${Number(data.cgst).toFixed(2)}`)
      currentY -= 15
      pdf.addText("F1", 9, 360, currentY, `SGST (${halfRate}%):`)
      pdf.addText("F1", 9, 490, currentY, `Rs. ${Number(data.sgst).toFixed(2)}`)
      currentY -= 15
    }
  } else {
    pdf.addText("F1", 9, 360, currentY, "GST (0% Exempt):")
    pdf.addText("F1", 9, 490, currentY, "Rs. 0.00")
    currentY -= 15
  }

  // Grand Total Box
  pdf.addLine(340, currentY + 4, 555, currentY + 4, 0.8)
  pdf.addRect(340, currentY - 18, 215, 22, true, false, 0.93, 0.97, 0.94)
  pdf.addText("F2", 12, 350, currentY - 8, "GRAND TOTAL:")
  pdf.addText("F2", 12, 480, currentY - 8, `Rs. ${Number(data.grandTotal).toFixed(2)}`)
  pdf.addLine(340, currentY - 20, 555, currentY - 20, 1.2)

  // 5. Terms & CustomerPilot Footer
  const footerY = Math.max(currentY - 60, 100)
  pdf.addLine(40, footerY + 25, 555, footerY + 25, 0.5)

  if (data.terms) {
    pdf.addText("F1", 8, 45, footerY + 12, `Terms: ${data.terms}`)
  }
  pdf.addText("F1", 8, 45, footerY, "This is a computer-generated tax invoice. No physical signature required.")
  pdf.addText("F2", 8, 45, footerY - 14, "Official CustomerPilot Digital GST Billing | customerpilot.in")

  return pdf.build()
}
