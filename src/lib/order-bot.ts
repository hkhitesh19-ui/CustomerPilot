import { db } from "@/lib/db"
import { sendCentralWhatsAppMessage } from "@/lib/whatsapp-service"

export interface ParsedOrderItem {
  name: string
  quantity: number
  price?: number
  notes?: string
}

export interface ParsedOrder {
  items: ParsedOrderItem[]
  customerName?: string
  deliveryType: "pickup" | "delivery"
  deliveryAddress?: string
  totalAmount: number
  notes?: string
}

/**
 * Checks whether an incoming WhatsApp message represents an order submission or inquiry.
 */
export function isOrderTriggerMessage(text: string): boolean {
  if (!text) return false
  const t = text.trim()
  return (
    t.includes("#ORDER") ||
    /🛒.*(?:NEW ORDER|order)/i.test(t) ||
    /I want to place an order/i.test(t) ||
    /Mera order/i.test(t) ||
    /Placing my order/i.test(t)
  )
}

export function isOrderStatusInquiry(text: string): boolean {
  if (!text) return false
  const t = text.trim().toLowerCase()
  return (
    t === "order status" ||
    t === "mera order" ||
    t === "status" ||
    t === "where is my order" ||
    t.includes("order status") ||
    t.includes("kaha pahucha")
  )
}

/**
 * Generate a clean sequential or timestamp-based human-friendly order number.
 * e.g., "CC-4821"
 */
export async function generateOrderNumber(merchantId: string, merchantName?: string): Promise<string> {
  const prefix = (merchantName || "ORD")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase() || "CP"

  const count = await db.order.count({ where: { merchantId } })
  const sequence = (count + 1).toString().padStart(4, "0")
  return `${prefix}-${sequence}`
}

/**
 * Parses structured WhatsApp text into items, totals, delivery type, and notes.
 */
export function parseWhatsAppOrderText(text: string): ParsedOrder {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
  const items: ParsedOrderItem[] = []
  let customerName: string | undefined
  let deliveryType: "pickup" | "delivery" = "pickup"
  let deliveryAddress: string | undefined
  let totalAmount = 0
  let notes: string | undefined

  for (const line of lines) {
    // Detect Name
    const nameMatch = line.match(/(?:👤\s*Name:|👤|Name:|Customer:)\s*([^\n\r]+)/i)
    if (nameMatch && nameMatch[1]) {
      customerName = nameMatch[1].trim()
    }

    // Detect Delivery Type
    if (/delivery/i.test(line) && !/pickup/i.test(line)) {
      deliveryType = "delivery"
    } else if (/pickup|self pickup/i.test(line)) {
      deliveryType = "pickup"
    }

    // Detect Address
    const addrMatch = line.match(/(?:📍\s*Address:|📍|Address:)\s*([^\n\r]+)/i)
    if (addrMatch && addrMatch[1]) {
      deliveryAddress = addrMatch[1].trim()
    }

    // Detect Notes
    const noteMatch = line.match(/(?:📝\s*Notes?:?|Notes?:?|Special Instructions?:?)\s*[:\-]?\s*([^\n\r]+)/i)
    if (noteMatch && noteMatch[1]) {
      notes = noteMatch[1].trim()
    }

    // Detect Total Amount: e.g. "💰 Total: ₹1,248" or "Total: 1248"
    const totalMatch = line.match(/(?:💰\s*Total:|💰|Total:|Amount:)\s*₹?\s*([\d,]+)/i)
    if (totalMatch && totalMatch[1]) {
      const parsedTotal = parseInt(totalMatch[1].replace(/,/g, ""), 10)
      if (!isNaN(parsedTotal) && parsedTotal > 0) {
        totalAmount = parsedTotal
      }
    }

    // Detect Item lines:
    // e.g., "1. Chocolate Truffle Cake x 1 (₹649)"
    // or "• Strawberry Cake x2 — ₹1198"
    // or "1. Belgian Truffle Cake - Qty: 1 - ₹649"
    const itemMatch = line.match(/^(?:\d+[\.\)]|•|\*|-)\s*([^xX\(\—\-]+?)\s*(?:[xX×]\s*(\d+)|\(Qty:\s*(\d+)\))?(?:\s*[\(—\-]\s*₹?\s*([\d,]+)\)?)?$/i)
    if (itemMatch) {
      const itemName = itemMatch[1].trim()
      const qty = parseInt(itemMatch[2] || itemMatch[3] || "1", 10) || 1
      const priceStr = itemMatch[4]?.replace(/,/g, "")
      const price = priceStr ? parseInt(priceStr, 10) : undefined

      if (itemName && !/total|type|pickup|delivery|name|note/i.test(itemName)) {
        items.push({
          name: itemName,
          quantity: qty,
          price: price,
        })
      }
    }
  }

  return {
    items,
    customerName,
    deliveryType,
    deliveryAddress,
    totalAmount,
    notes,
  }
}

/**
 * Handles incoming order WhatsApp text, creates Order & OrderItems in DB, and dispatches acknowledgement.
 */
export async function processIncomingWhatsAppOrder(params: {
  merchantId: string
  phone: string
  text: string
  waMessageId?: string
  pushName?: string
}) {
  const { merchantId, phone, text, waMessageId, pushName } = params

  const merchant = await db.merchant.findUnique({
    where: { id: merchantId },
    select: { id: true, name: true, whatsappPhone: true, address: true },
  })
  if (!merchant) throw new Error("Merchant not found")

  const parsed = parseWhatsAppOrderText(text)
  const customerName = parsed.customerName || pushName || "Customer"

  // Fetch or create customer record
  let customer = await db.customer.findFirst({
    where: { merchantId, phone },
  })

  if (!customer) {
    customer = await db.customer.create({
      data: {
        merchantId,
        phone,
        name: customerName,
        acquisitionChan: "whatsapp_order",
        whatsappOptIn: true,
      },
    })
  } else if (parsed.customerName && customer.name.startsWith("Customer ")) {
    await db.customer.update({
      where: { id: customer.id },
      data: { name: parsed.customerName },
    })
  }

  // Lookup menu items for this merchant to verify real prices & IDs
  const allMenuItems = await db.menuItem.findMany({
    where: { merchantId },
  })

  const orderNo = await generateOrderNumber(merchantId, merchant.name)

  // Match items with real menu items or fallback to auto-created items
  let calculatedTotal = 0
  const orderItemsData: { menuItemId: string; quantity: number; unitPrice: number; totalPrice: number; notes?: string }[] = []

  for (const item of parsed.items) {
    const matched = allMenuItems.find(
      m => m.name.toLowerCase() === item.name.toLowerCase() ||
           m.name.toLowerCase().includes(item.name.toLowerCase()) ||
           item.name.toLowerCase().includes(m.name.toLowerCase())
    )

    let menuItemId: string
    let unitPrice: number

    if (matched) {
      menuItemId = matched.id
      unitPrice = matched.price
    } else {
      // Create dynamically in menu if absent
      const fallbackPrice = item.price || 100
      const createdItem = await db.menuItem.create({
        data: {
          merchantId,
          category: "Special Orders",
          name: item.name,
          price: fallbackPrice,
          isVeg: true,
          isAvailable: true,
        },
      })
      allMenuItems.push(createdItem)
      menuItemId = createdItem.id
      unitPrice = fallbackPrice
    }

    const itemTotal = unitPrice * item.quantity
    calculatedTotal += itemTotal
    orderItemsData.push({
      menuItemId,
      quantity: item.quantity,
      unitPrice,
      totalPrice: itemTotal,
      notes: item.notes,
    })
  }

  // If parsed total was explicitly provided and valid, honor it; otherwise use calculated total
  const finalTotal = parsed.totalAmount > 0 ? parsed.totalAmount : (calculatedTotal > 0 ? calculatedTotal : 100)

  // Create Order in DB
  const order = await db.order.create({
    data: {
      merchantId,
      customerId: customer.id,
      customerPhone: phone,
      customerName,
      orderNo,
      status: "PENDING",
      deliveryType: parsed.deliveryType,
      deliveryAddress: parsed.deliveryAddress,
      totalAmount: finalTotal,
      notes: parsed.notes,
      waMessageId,
      items: {
        create: orderItemsData.map(oi => ({
          menuItemId: oi.menuItemId,
          quantity: oi.quantity,
          unitPrice: oi.unitPrice,
          totalPrice: oi.totalPrice,
          notes: oi.notes,
        })),
      },
    },
    include: {
      items: { include: { menuItem: true } },
    },
  })

  // Format summary for WhatsApp message
  const itemsSummary = order.items.length > 0
    ? order.items.map((i, idx) => `${idx + 1}. ${i.menuItem.name} × ${i.quantity} (₹${i.totalPrice})`).join("\n")
    : (parsed.items.length > 0
        ? parsed.items.map((i, idx) => `${idx + 1}. ${i.name} × ${i.quantity}`).join("\n")
        : "• Custom Order")

  const ackText =
    `🛒 *Order Received! #${order.orderNo}*\n\n` +
    `Hi ${customerName}! Aapka order *${merchant.name}* ko receive ho gaya hai! 🎂\n\n` +
    `📋 *Order Summary:*\n${itemsSummary}\n\n` +
    `💰 *Total:* ₹${finalTotal}\n` +
    `📦 *Order Type:* ${order.deliveryType === "delivery" ? "Home Delivery" : "Self Pickup"}\n` +
    (parsed.notes ? `📝 *Note:* ${parsed.notes}\n` : "") +
    `\n⏱ Store 5-10 minute me verify karke confirm karega.\n` +
    `Koi sawaal ya changes ho to isi chat me reply karein! ❤️`

  await sendCentralWhatsAppMessage({
    merchantId,
    toPhone: phone,
    text: ackText,
    template: "ORDER_RECEIVED",
    customerId: customer.id,
  }).catch(e => console.error("[OrderBot] Send ACK Error:", e))

  await db.auditLog.create({
    data: {
      merchantId,
      actorType: "CUSTOMER",
      actorId: customer.id,
      action: "ORDER_PLACED",
      entity: "Order",
      entityId: order.id,
      metadata: JSON.stringify({ orderNo: order.orderNo, total: finalTotal, count: order.items.length }),
    },
  })

  return order
}

/**
 * Merchant Confirms an Order. Sends confirmation WhatsApp to customer.
 */
export async function confirmOrder(params: {
  orderId: string
  merchantId: string
  etaMinutes?: number
  staffId?: string
}) {
  const { orderId, merchantId, etaMinutes = 30, staffId } = params

  const order = await db.order.findFirst({
    where: { id: orderId, merchantId },
    include: {
      merchant: true,
      items: { include: { menuItem: true } },
    },
  })
  if (!order) throw new Error("Order not found")

  const updated = await db.order.update({
    where: { id: orderId },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
    },
  })

  const pickupLocation = order.merchant.address || "Store Counter"
  const itemsList = order.items.map(i => `• ${i.menuItem.name} × ${i.quantity}`).join("\n")

  const confirmMsg =
    `✅ *Order #${order.orderNo} Confirmed!* 🎉\n\n` +
    `${order.customerName || "Customer"} ji, aapka order confirm ho gaya hai!\n\n` +
    `⏱ *Estimated Time:* ${etaMinutes} Minutes me ready hoga\n` +
    (order.deliveryType === "pickup"
      ? `📍 *Pickup Location:* ${pickupLocation}\n`
      : `🛵 *Delivery:* ${order.deliveryAddress || "Aapke address par deliver hoga"}\n`) +
    `💰 *Total Amount:* ₹${order.totalAmount}\n\n` +
    `📋 *Items:*\n${itemsList}\n\n` +
    `Ready hote hi aapko live notification milega! 🎂\n` +
    `— *${order.merchant.name}*`

  await sendCentralWhatsAppMessage({
    merchantId,
    toPhone: order.customerPhone,
    text: confirmMsg,
    template: "ORDER_CONFIRMED",
    customerId: order.customerId || undefined,
  }).catch(e => console.error("[OrderBot] Confirm WA Error:", e))

  await db.auditLog.create({
    data: {
      merchantId,
      actorType: "STAFF",
      actorId: staffId || "merchant",
      action: "ORDER_CONFIRMED",
      entity: "Order",
      entityId: order.id,
      metadata: JSON.stringify({ orderNo: order.orderNo, etaMinutes }),
    },
  })

  return updated
}

/**
 * Merchant Cancels/Rejects an Order with reason. Sends notification to customer.
 */
export async function cancelOrder(params: {
  orderId: string
  merchantId: string
  reason: string
  staffId?: string
}) {
  const { orderId, merchantId, reason, staffId } = params

  const order = await db.order.findFirst({
    where: { id: orderId, merchantId },
    include: { merchant: true },
  })
  if (!order) throw new Error("Order not found")

  const updated = await db.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelReason: reason,
    },
  })

  const cancelMsg =
    `❌ *Order #${order.orderNo} Update*\n\n` +
    `${order.customerName || "Customer"} ji, unfortunately aapka order accept nahi ho paya:\n` +
    `⚠️ *Reason:* ${reason}\n\n` +
    `Asuvidha ke liye khed hai! Dobara menu dekhne ya order karne ke liye:\n` +
    `👉 https://customerpilot.in/c/cake-connection\n\n` +
    `— *${order.merchant.name}*`

  await sendCentralWhatsAppMessage({
    merchantId,
    toPhone: order.customerPhone,
    text: cancelMsg,
    template: "ORDER_CANCELLED",
    customerId: order.customerId || undefined,
  }).catch(e => console.error("[OrderBot] Cancel WA Error:", e))

  await db.auditLog.create({
    data: {
      merchantId,
      actorType: "STAFF",
      actorId: staffId || "merchant",
      action: "ORDER_CANCELLED",
      entity: "Order",
      entityId: order.id,
      metadata: JSON.stringify({ orderNo: order.orderNo, reason }),
    },
  })

  return updated
}

/**
 * Updates status of an order: PREPARING | READY | DELIVERED
 */
export async function updateOrderStatus(params: {
  orderId: string
  merchantId: string
  status: "PREPARING" | "READY" | "DELIVERED"
  staffId?: string
}) {
  const { orderId, merchantId, status, staffId } = params

  const order = await db.order.findFirst({
    where: { id: orderId, merchantId },
    include: { merchant: true },
  })
  if (!order) throw new Error("Order not found")

  const updated = await db.order.update({
    where: { id: orderId },
    data: { status },
  })

  let msgText = ""
  if (status === "READY") {
    msgText =
      `🎁 *Order #${order.orderNo} Ready Hai!* 🎂\n\n` +
      `${order.customerName || "Customer"} ji, aapka order bilkul fresh ready hai!\n` +
      (order.deliveryType === "pickup"
        ? `📍 Aap *${order.merchant.name}* ke counter se collect kar sakte hain.`
        : `🛵 Delivery partner aapki taraf nikal chuka hai!`) +
      `\n\nThank you! ❤️`
  } else if (status === "DELIVERED") {
    msgText =
      `🎉 *Order #${order.orderNo} Complete!*\n\n` +
      `${order.customerName || "Customer"} ji, hope you enjoy your delicious treat from *${order.merchant.name}*! 🍰✨\n\n` +
      `Agar aapko pasand aaya to hume Google par 5-Star review zaroor dein:\n` +
      `👉 https://customerpilot.in/review?m=${order.merchantId}\n\n` +
      `Have a wonderful day! ❤️`
  }

  if (msgText) {
    await sendCentralWhatsAppMessage({
      merchantId,
      toPhone: order.customerPhone,
      text: msgText,
      template: `ORDER_${status}`,
      customerId: order.customerId || undefined,
    }).catch(e => console.error(`[OrderBot] ${status} WA Error:`, e))
  }

  await db.auditLog.create({
    data: {
      merchantId,
      actorType: "STAFF",
      actorId: staffId || "merchant",
      action: `ORDER_${status}`,
      entity: "Order",
      entityId: order.id,
      metadata: JSON.stringify({ orderNo: order.orderNo, newStatus: status }),
    },
  })

  return updated
}
