"use client"

import React, { useState, useEffect } from "react"

interface BrandLogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "dark" | "light"
  showTagline?: boolean
  animateOnLoad?: boolean
}

export function BrandLogo({
  className = "",
  size = "md",
  animateOnLoad = true,
}: BrandLogoProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Responsive height sizing classes for cropped transparent cplogo_horizontal.png
  const heightClass =
    size === "sm"
      ? "h-8 sm:h-9"
      : size === "md"
      ? "h-9 sm:h-11"
      : size === "lg"
      ? "h-12 sm:h-14"
      : "h-16 sm:h-20"

  return (
    <div className={`inline-flex items-center select-none relative group ${className}`}>
      <img
        src="/cplogo_horizontal.png"
        alt="CustomerPilot - Turns Every Walkins into LifeTime Customers"
        className={`${heightClass} w-auto max-w-full object-contain transition-transform duration-200 group-hover:scale-102`}
      />
    </div>
  )
}
