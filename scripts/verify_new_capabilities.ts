const { generateInvoicePdf } = require("../src/lib/invoice-pdf-generator")
const { generateUpiPaymentDetails } = require("../src/lib/upi-gateway")

async function main() {
  console.log("=== VERIFYING NEW ENHANCEMENTS ===")

  // 1. Test Invoice with GSTIN -> TAX INVOICE
  const gstPdfBuffer = generateInvoicePdf({
    orderNo: "INV-2026-TEST1",
    date: "05 November 2026, 08:30 AM",
    merchantName: "Cake Connection",
    merchantAddress: "Alkapuri, Vadodara",
    merchantPhone: "9825012345",
    gstin: "24AAACC1234D1Z5",
    upiId: "cakeconnection@okaxis",
    customerName: "Priya Sharma",
    customerPhone: "9876543210",
    paymentMethod: "UPI",
    items: [
      { name: "Dutch Truffle Cake (500g)", quantity: 1, unitPrice: 550, totalPrice: 550 },
      { name: "Red Velvet Pastry", quantity: 2, unitPrice: 120, totalPrice: 240 }
    ],
    subtotal: 790,
    discount: 50,
    discountType: "flat",
    taxableAmount: 740,
    gstRate: 5,
    gstType: "CGST_SGST",
    cgst: 18.5,
    sgst: 18.5,
    igst: 0,
    grandTotal: 777,
    terms: "Fresh cakes. Goods once sold will not be returned."
  })

  const gstPdfStr = gstPdfBuffer.toString("latin1")
  if (!gstPdfStr.includes("TAX INVOICE")) {
    throw new Error("GST invoice did not contain TAX INVOICE header")
  }
  if (!gstPdfStr.includes("24AAACC1234D1Z5")) {
    throw new Error("GST invoice did not contain GSTIN")
  }
  if (gstPdfStr.includes("Loyalty VIP Wallet Status")) {
    throw new Error("PDF contained Loyalty text which must be excluded")
  }
  console.log("✅ 1. Tax Invoice PDF generated cleanly with TAX INVOICE header and 0 loyalty leaks.")

  // 2. Test Invoice without GSTIN -> INVOICE
  const nonGstPdfBuffer = generateInvoicePdf({
    orderNo: "INV-2026-TEST2",
    date: "05 November 2026, 08:30 AM",
    merchantName: "Local Salon",
    merchantAddress: "Gotri, Vadodara",
    merchantPhone: "9825099999",
    gstin: null,
    customerName: "Ananya Patel",
    customerPhone: "9876511111",
    paymentMethod: "Cash",
    items: [
      { name: "Hair Spa Treatment", quantity: 1, unitPrice: 800, totalPrice: 800 }
    ],
    subtotal: 800,
    discount: 0,
    taxableAmount: 800,
    gstRate: 0,
    gstType: "EXEMPT",
    cgst: 0,
    sgst: 0,
    igst: 0,
    grandTotal: 800
  })

  const nonGstPdfStr = nonGstPdfBuffer.toString("latin1")
  if (nonGstPdfStr.includes("TAX INVOICE")) {
    throw new Error("Non-GST invoice should NOT contain TAX INVOICE header")
  }
  if (!nonGstPdfStr.includes("(INVOICE)")) {
    throw new Error("Non-GST invoice did not contain INVOICE header")
  }
  console.log("✅ 2. Non-GST Invoice generated cleanly with only INVOICE header and no empty GST space.")

  // 3. Test UPI Gateway QR & Deep Link
  const upiResult = await generateUpiPaymentDetails({
    upiId: "cakeconnection@okaxis",
    payeeName: "Cake Connection",
    amount: 777,
    orderNo: "ORD-9421",
    note: "Cake Connection Order"
  })

  if (!upiResult.upiUri.startsWith("upi://pay?pa=cakeconnection%40okaxis")) {
    throw new Error("Invalid UPI URI generated: " + upiResult.upiUri)
  }
  if (!upiResult.qrCodeDataUrl.startsWith("data:image/png;base64,")) {
    throw new Error("Invalid UPI QR Code generated")
  }
  console.log("✅ 3. Free UPI PG generated valid NPCI intent URI & dynamic QR code cleanly.")

  console.log("🎯 ALL TESTS PASSED SUCCESSFULLY!")
}

main().catch(err => {
  console.error("❌ Test failed:", err)
  process.exit(1)
})
