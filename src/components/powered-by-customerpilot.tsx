"use client"

import React from "react"
import Link from "next/link"
import { Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

interface PoweredByProps {
  showPoweredBy?: boolean
  ctaEnabled?: boolean
  className?: string
}

export function PoweredByCustomerPilot({ showPoweredBy = true, ctaEnabled = true, className }: PoweredByProps) {
  if (!showPoweredBy) return null

  return (
    <div className={cn("mt-8 flex flex-col items-center justify-center pt-4 border-t border-slate-200/10", className)}>
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
        <span>Powered by CustomerPilot</span>
        <Rocket className="h-3 w-3" />
      </div>
      {ctaEnabled && (
        <Link href="/for-business" className="mt-1 text-[10px] text-emerald-500 hover:text-emerald-400 hover:underline">
          Want this for your business?
        </Link>
      )}
    </div>
  )
}
