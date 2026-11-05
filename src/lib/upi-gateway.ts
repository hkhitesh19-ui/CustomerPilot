/**
 * Free UPI Payment Gateway Utility
 * Inspired by open-source Indian UPI PG specifications (Centre-for-Information-Technology-India/upi-pg).
 * Implements 100% zero-commission, direct bank-to-bank UPI deep linking and dynamic QR code generation.
 */

import QRCode from "qrcode"

export interface UpiPaymentParams {
  upiId: string           // Payee VPA / UPI ID (e.g. "cakeconnection@okaxis")
  payeeName: string       // Payee display name (e.g. "Cake Connection")
  amount: number          // Amount in INR (e.g. 777.00)
  orderNo: string         // Unique Order Number
  note?: string           // Transaction note (e.g. "Cake Connection Order #CC-102")
  merchantCode?: string   // Optional MCC code
}

export interface UpiPaymentDetails {
  upiUri: string          // Standard NPCI URI: "upi://pay?pa=...&pn=...&am=...&cu=INR&tn=..."
  qrCodeDataUrl: string   // Base64 PNG Data URL for direct <img src="..." /> rendering
  amount: number
  orderNo: string
  payeeUpiId: string
  payeeName: string
}

/**
 * Generates an NPCI-compliant UPI deep-link URI and dynamic QR code
 */
export async function generateUpiPaymentDetails(params: UpiPaymentParams): Promise<UpiPaymentDetails> {
  const cleanUpiId = (params.upiId || "customerpilot@upi").trim()
  const cleanPayee = (params.payeeName || "CustomerPilot Store").trim()
  const formattedAmount = Number(params.amount || 0).toFixed(2)
  const cleanNote = (params.note || `Order #${params.orderNo}`).replace(/[^a-zA-Z0-9\s_-]/g, "").slice(0, 50)

  // Standard NPCI UPI URI Specification
  // Ref: https://www.npci.org.in/what-we-do/upi/product-overview
  const upiUri = `upi://pay?pa=${encodeURIComponent(cleanUpiId)}&pn=${encodeURIComponent(cleanPayee)}&am=${encodeURIComponent(formattedAmount)}&cu=INR&tn=${encodeURIComponent(cleanNote)}&tr=${encodeURIComponent(params.orderNo)}`

  // Generate dynamic QR Code Data URL (High contrast, 280x280)
  let qrCodeDataUrl = ""
  try {
    qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 280,
      color: {
        dark: "#0f172a", // Slate 900
        light: "#ffffff",
      },
    })
  } catch (err) {
    console.warn("[UPI PG] Error generating QR code, using fallback:", err)
    qrCodeDataUrl = ""
  }

  return {
    upiUri,
    qrCodeDataUrl,
    amount: Number(formattedAmount),
    orderNo: params.orderNo,
    payeeUpiId: cleanUpiId,
    payeeName: cleanPayee,
  }
}
