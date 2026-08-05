"use client"

import { Suspense } from "react"
import JoinPage from "@/app/join/page"

export default function QPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading Customer Loyalty...</div>}>
      <JoinPage />
    </Suspense>
  )
}
