"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function SplashScreen() {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // Lock body scrolling while splash screen is active
    document.body.style.overflow = "hidden"

    // 2-second splash screen timer for testing
    const timer = setTimeout(() => {
      setIsVisible(false)
      document.body.style.overflow = "auto"
    }, 2000)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = "auto"
    }
  }, [])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999999] bg-white flex flex-col items-center justify-center select-none overflow-hidden"
          suppressHydrationWarning
        >
          {/* Ambient Glowing Emerald & Cyan Aurora Background */}
          <div className="absolute w-[700px] h-[700px] bg-gradient-to-tr from-emerald-200/60 via-cyan-100/50 to-indigo-200/50 rounded-full blur-[140px] pointer-events-none animate-pulse" />

          {/* Centered Animated Brand Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 15 }}
            animate={{ opacity: 1, scale: [0.75, 1.08, 1], y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <img
              src="/cplogo_horizontal.png"
              alt="CustomerPilot"
              className="h-20 sm:h-28 w-auto object-contain drop-shadow-[0_12px_30px_rgba(16,185,129,0.35)]"
            />

            {/* Glowing Accent Shimmer Line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "220px" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full shadow-md shadow-emerald-500/40"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
