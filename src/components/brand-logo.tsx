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

  // Height sizing classes for cropped transparent cplogo_horizontal.png
  const heightClass =
    size === "sm"
      ? "h-10 sm:h-11"
      : size === "md"
      ? "h-12 sm:h-14"
      : size === "lg"
      ? "h-16 sm:h-20"
      : "h-20 sm:h-24"

  const animationClass = animateOnLoad && mounted ? "animate-logo-entrance" : ""

  return (
    <div className={`inline-flex items-center select-none relative group ${className}`}>
      <img
        src="/cplogo_horizontal.png"
        alt="CustomerPilot - Turns Every Walkins into LifeTime Customers"
        className={`${heightClass} w-auto max-w-full object-contain ${animationClass} transition-transform duration-300 group-hover:scale-105`}
      />
    </div>
  )
}
