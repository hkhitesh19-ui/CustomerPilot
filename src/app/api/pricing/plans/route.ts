import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const plans = await db.plan.findMany({
      where: { 
        active: true,
        planKey: { not: null }
      },
      orderBy: { days: "asc" }
    })

    const parsedPlans = plans.map(p => {
      let parsedFeatures = []
      try {
        parsedFeatures = typeof p.features === "string" ? JSON.parse(p.features) : (p.features || [])
      } catch {
        parsedFeatures = typeof p.features === "string" ? p.features.split(",").map(s => s.trim()) : []
      }
      return {
        ...p,
        features: Array.isArray(parsedFeatures) ? parsedFeatures : []
      }
    })

    return ok({ plans: parsedPlans })
  } catch (error: any) {
    console.error("[Pricing Plans GET Error]:", error)
    return err(error.message || "Failed to fetch pricing plans", 500)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { plans } = body

    if (!Array.isArray(plans)) {
      return err("Expected plans array", 400)
    }

    for (const p of plans) {
      if (!p.id && !p.planKey) continue
      
      const updateData: any = {}
      if (p.price !== undefined) updateData.price = Number(p.price)
      if (p.originalPrice !== undefined) updateData.originalPrice = Number(p.originalPrice)
      if (p.discountPercent !== undefined) updateData.discountPercent = Number(p.discountPercent)
      if (p.name !== undefined) updateData.name = p.name
      if (p.description !== undefined) updateData.description = p.description
      if (p.badge !== undefined) updateData.badge = p.badge
      if (p.popular !== undefined) updateData.popular = Boolean(p.popular)
      if (p.features !== undefined) {
        updateData.features = Array.isArray(p.features) ? JSON.stringify(p.features) : p.features
      }
      if (p.active !== undefined) updateData.active = Boolean(p.active)

      if (p.id) {
        await db.plan.update({
          where: { id: p.id },
          data: updateData
        })
      } else if (p.planKey) {
        await db.plan.update({
          where: { planKey: p.planKey },
          data: updateData
        })
      }
    }

    return ok({ message: "Pricing plans updated successfully" })
  } catch (error: any) {
    return err(error.message || "Failed to update pricing plans", 500)
  }
}
