"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  RotateCw,
  Send,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Search,
  MoreVertical,
  MousePointer2,
  Play,
  Pause
} from "lucide-react"

// Real ground-truth data matching reviewpilot.co.in dental showcase
export interface LiveDemoData {
  business: string
  area: string
  icon: string
  reviewer: string
  rating: number
  reviewDate: string
  replyDate: string
  reviewText: string
  replyText: string
}

const DEFAULT_DEMO_DATA: LiveDemoData = {
  business: "Smile Studio Dental",
  area: "Andheri West, Mumbai",
  icon: "🦷",
  reviewer: "Ritika",
  rating: 3,
  reviewDate: "9 Apr 2026",
  replyDate: "10 Apr 2026",
  reviewText: "Treatment itself was good, but I waited almost 40 minutes past my appointment time.",
  replyText: "Thank you for the honest feedback, Ritika. Forty minutes is longer than we aim for, and we moved to staggered slots this month to fix exactly that. Ask for Dr. Mehta's desk on your next visit and we will get you in on time."
}

// Timing constants (in ms)
const TIMINGS = {
  TYPE_PER_CHAR: 22,
  PAUSE_AFTER_TYPING: 700,
  CURSOR_MOVE: 1000,
  CLICK_DOWN: 220,
  TOAST_HOLD: 2800,
  RESET_GAP: 600
}

function GoogleLogoSvg({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.2v3.1C3.2 21.3 7.3 24 12 24z" />
      <path fill="#FBBC04" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.2C.4 8.2 0 10 0 12s.4 3.8 1.2 5.4l4.1-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.6l4.1 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  )
}

function StarRating({ rating = 3, size = "h-3.5 w-3.5" }: { rating?: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={
            star <= rating
              ? `${size} fill-amber-400 text-amber-400`
              : `${size} text-slate-200 fill-slate-100`
          }
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

function UserAvatar({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <div className={`flex ${className} shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.3 0-9 1.7-9 5v1h18v-1c0-3.3-5.7-5-9-5z" />
      </svg>
    </div>
  )
}

interface StepHeaderProps {
  number: number
  title: string
  children: React.ReactNode
}

function StepColumn({ number, title, children }: StepHeaderProps) {
  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center justify-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white shadow-sm shadow-indigo-500/30">
          {number}
        </span>
        <h3 className="text-sm font-semibold text-slate-800 sm:text-[15px]">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

interface AnimatedConnectorProps {
  label: string
  icon: React.ReactNode
  delay?: number
}

function AnimatedConnector({ label, icon, delay = 0 }: AnimatedConnectorProps) {
  const gradIdV = `flow-grad-v-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
  const gradIdH = `flow-grad-h-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`

  return (
    <div className="flex shrink-0 items-center justify-center py-2 lg:min-h-[300px] lg:py-0" aria-hidden="true">
      {/* Mobile Stacked Connector (Vertical) */}
      <div className="flex flex-col items-center gap-2 lg:hidden">
        <motion.span
          animate={{
            scale: [1, 1.12, 1],
            boxShadow: [
              "0 0 0 0 rgba(99,102,241,0)",
              "0 0 0 6px rgba(99,102,241,0.18)",
              "0 0 0 0 rgba(99,102,241,0)"
            ]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-300/60 bg-indigo-50/80 text-indigo-600"
        >
          {icon}
        </motion.span>
        <span className="text-[11px] font-medium text-indigo-600">{label}</span>
        <svg width="2" height="28" viewBox="0 0 2 28" className="overflow-visible">
          <line x1="1" y1="0" x2="1" y2="28" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
          <motion.line
            x1="1"
            y1="0"
            x2="1"
            y2="28"
            stroke={`url(#${gradIdV})`}
            strokeWidth="2"
            strokeDasharray="6 22"
            initial={{ strokeDashoffset: 28 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay }}
          />
          <defs>
            <linearGradient id={gradIdV} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Desktop Horizontal Connector */}
      <div className="hidden flex-col items-center gap-2 lg:flex lg:w-20 xl:w-24">
        <span className="text-[11px] font-medium text-indigo-600 whitespace-nowrap">{label}</span>
        <motion.span
          animate={{
            scale: [1, 1.12, 1],
            boxShadow: [
              "0 0 0 0 rgba(99,102,241,0)",
              "0 0 0 8px rgba(99,102,241,0.18)",
              "0 0 0 0 rgba(99,102,241,0)"
            ]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-300/60 bg-indigo-50/80 text-indigo-600 shadow-sm"
        >
          {icon}
        </motion.span>
        <svg width="100%" height="6" viewBox="0 0 100 6" preserveAspectRatio="none" className="overflow-visible">
          <line x1="0" y1="3" x2="100" y2="3" stroke="rgba(99,102,241,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
          <motion.line
            x1="0"
            y1="3"
            x2="100"
            y2="3"
            stroke={`url(#${gradIdH})`}
            strokeWidth="2"
            strokeDasharray="10 90"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay }}
          />
          <defs>
            <linearGradient id={gradIdH} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

export function LiveReviewReplyAnimation({
  demoData = DEFAULT_DEMO_DATA
}: {
  demoData?: Partial<LiveDemoData>
}) {
  const data: LiveDemoData = { ...DEFAULT_DEMO_DATA, ...demoData }
  const [mounted, setMounted] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const [stepState, setStepState] = useState<"typing" | "cursor" | "click" | "published" | "reset">("typing")
  const [isPaused, setIsPaused] = useState(false)
  const isPausedRef = useRef(false)
  isPausedRef.current = isPaused

  const replyText = data.replyText

  useEffect(() => {
    setMounted(true)
  }, [])

  const cycleIdRef = useRef(0)
  const runCycleRef = useRef<() => void>(() => {})

  // Complete Continuous Animation Loop
  useEffect(() => {
    if (!mounted) return

    let isCancelled = false

    function runCycle() {
      if (isCancelled) return
      const currentCycleId = ++cycleIdRef.current

      setStepState("typing")
      setCharCount(0)

      let currentChar = 0
      function typeNextChar() {
        if (isCancelled || currentCycleId !== cycleIdRef.current) return

        if (isPausedRef.current) {
          setTimeout(typeNextChar, 300)
          return
        }

        currentChar++
        setCharCount(currentChar)

        if (currentChar < replyText.length) {
          setTimeout(typeNextChar, TIMINGS.TYPE_PER_CHAR)
        } else {
          // Finished typing, pause then move cursor
          setTimeout(() => {
            if (isCancelled || currentCycleId !== cycleIdRef.current) return
            setStepState("cursor")

            // Cursor reaches button, trigger click
            setTimeout(() => {
              if (isCancelled || currentCycleId !== cycleIdRef.current) return
              setStepState("click")

              // Click action triggers published state
              setTimeout(() => {
                if (isCancelled || currentCycleId !== cycleIdRef.current) return
                setStepState("published")

                // Hold published state to let user review
                setTimeout(() => {
                  if (isCancelled || currentCycleId !== cycleIdRef.current) return
                  setStepState("reset")

                  // Reset gap before starting next cycle
                  setTimeout(() => {
                    if (isCancelled || currentCycleId !== cycleIdRef.current) return
                    runCycle()
                  }, TIMINGS.RESET_GAP)
                }, TIMINGS.TOAST_HOLD)
              }, TIMINGS.CLICK_DOWN)
            }, TIMINGS.CURSOR_MOVE)
          }, TIMINGS.PAUSE_AFTER_TYPING)
        }
      }

      setTimeout(typeNextChar, 100)
    }

    runCycleRef.current = runCycle
    runCycle()

    return () => {
      isCancelled = true
      cycleIdRef.current++
    }
  }, [mounted, replyText])

  // Interactive instant trigger on manual button click
  const handleManualApprove = () => {
    const manualCycleId = ++cycleIdRef.current
    setCharCount(replyText.length)
    setStepState("click")
    setTimeout(() => {
      if (manualCycleId !== cycleIdRef.current) return
      setStepState("published")
      setTimeout(() => {
        if (manualCycleId !== cycleIdRef.current) return
        setStepState("reset")
        setTimeout(() => {
          if (manualCycleId !== cycleIdRef.current) return
          // Seamlessly resume continuous loop via runCycleRef
          runCycleRef.current?.()
        }, TIMINGS.RESET_GAP)
      }, TIMINGS.TOAST_HOLD)
    }, 180)
  }

  const isPublished = stepState === "published"

  return (
    <div className="relative mx-auto mt-6 max-w-6xl w-full">
      {/* Soft Ambient Background Glow */}
      <div
        className="absolute -inset-x-8 -inset-y-8 rounded-[3rem] bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(217,70,239,0.12))] blur-3xl -z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Interactive Controls Strip */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: "6s" }} />
            <span>Live Automation Simulation</span>
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-500 font-medium">
            · Continuous real-time cycle
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs hover:bg-slate-50 transition"
          title={isPaused ? "Resume auto-simulation" : "Pause auto-simulation"}
        >
          {isPaused ? (
            <>
              <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3 text-amber-600 fill-amber-600" />
              <span>Pause</span>
            </>
          )}
        </button>
      </div>

      {/* Main 3-Column Interactive Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-start lg:gap-3">
        
        {/* ================= STEP 1: A REVIEW ARRIVES ================= */}
        <StepColumn number={1} title="A review arrives">
          <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-sm sm:p-5 transition-all">
            {/* Header: Google Business Profile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GoogleLogoSvg className="h-5 w-5" />
                <span className="text-sm font-semibold tracking-tight text-slate-900">
                  Google Business Profile
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Search className="h-3.5 w-3.5" />
                <MoreVertical className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Business Header */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-sky-200 text-lg shadow-2xs">
                <span aria-hidden="true">{demoData.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{demoData.business}</p>
                <p className="truncate text-[11px] text-slate-500 font-medium">{demoData.area}</p>
              </div>
            </div>

            {/* Review Block */}
            <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <UserAvatar className="h-7 w-7" />
                <span className="text-[12px] font-semibold text-slate-900">{demoData.reviewer}</span>
                <StarRating rating={demoData.rating} size="h-3.5 w-3.5" />
                <span className="ml-auto text-[10px] text-slate-500 font-medium">{demoData.reviewDate}</span>
              </div>
              <p className="text-[13px] leading-snug text-slate-800">
                {demoData.reviewText}
              </p>
            </div>

            {/* Review Actions Footer */}
            <div className="mt-3.5 flex items-center gap-2">
              <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
                Helpful
              </span>
              <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
                Share
              </span>
              <span className="ml-auto text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ● Awaiting Reply
              </span>
            </div>
          </div>
        </StepColumn>

        {/* ================= CONNECTOR 1: AUTO-FETCH ================= */}
        <AnimatedConnector
          label="Auto-fetch"
          icon={
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              className="inline-flex"
            >
              <RotateCw className="h-4 w-4" />
            </motion.span>
          }
          delay={0}
        />

        {/* ================= STEP 2: AI DRAFTS THE REPLY ================= */}
        <StepColumn number={2} title="AI drafts the reply">
          <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-sm sm:p-5 relative transition-all">
            <div className="relative">
              
              {/* Header: CustomerPilot Brand & Avatar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-xs">
                    CP
                  </div>
                  <span className="text-sm font-bold tracking-tight text-slate-900">
                    CustomerPilot AI
                  </span>
                </div>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[10px] font-bold text-white shadow-2xs">
                  AI
                </span>
              </div>

              {/* Fetched Review Summary Card */}
              <div className="mt-4">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Fetched Review
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center gap-2">
                    <UserAvatar className="h-6 w-6" />
                    <span className="text-[11px] font-semibold text-slate-900">{demoData.reviewer}</span>
                    <StarRating rating={demoData.rating} size="h-3 w-3" />
                    <span className="ml-auto text-[10px] text-slate-500 font-medium">{demoData.reviewDate}</span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-snug text-slate-700 truncate">
                    {demoData.reviewText}
                  </p>
                </div>
              </div>

              {/* AI Drafted Response Container */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-indigo-600">
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-flex"
                    >
                      <Sparkles className="h-3 w-3 text-indigo-600" />
                    </motion.span>
                    AI Drafted Response
                  </span>
                  <motion.span
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(99,102,241,0.0)",
                        "0 0 0 4px rgba(99,102,241,0.18)",
                        "0 0 0 0 rgba(99,102,241,0.0)"
                      ]
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-600"
                  >
                    Gemini Pro
                  </motion.span>
                </div>

                {/* Response Text Box with Live Typewriter */}
                <div className="relative overflow-hidden rounded-xl border border-indigo-200 bg-indigo-50/20 p-3 min-h-[140px] flex flex-col justify-between">
                  {/* Subtle Shimmer Ray */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-indigo-300/15 to-transparent"
                    animate={{ left: ["-33%", "133%"] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                  />

                  {/* Typewriter Output Paragraph */}
                  <p className="relative text-[12px] leading-snug text-slate-800" style={{ minHeight: "7.2em" }}>
                    {replyText.slice(0, charCount)}
                    {charCount < replyText.length && (
                      <motion.span
                        aria-hidden="true"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-indigo-600 align-baseline"
                      />
                    )}
                  </p>

                  {/* Tone Selector & Destination Pill */}
                  <div className="relative mt-2 flex items-center justify-between gap-2 border-t border-indigo-100/70 pt-2 text-[10px]">
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-semibold text-slate-700 shadow-2xs">
                      Tone: Empathetic &amp; Professional
                      <ChevronDown className="h-3 w-3 opacity-60" />
                    </span>
                    <span className="text-slate-500 font-medium">Google Business Profile</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Dynamic Morph between "Approve & publish" and "Reply Published" */}
              <div className="relative mt-4">
                <motion.button
                  type="button"
                  data-testid="action-approve-btn"
                  onClick={handleManualApprove}
                  animate={
                    stepState === "click"
                      ? { scale: 0.95 }
                      : isPublished
                      ? { scale: 1 }
                      : {
                          scale: [1, 1.015, 1],
                          boxShadow: [
                            "0 6px 18px -6px rgba(99,102,241,0.45)",
                            "0 10px 24px -4px rgba(217,70,239,0.55)",
                            "0 6px 18px -6px rgba(99,102,241,0.45)"
                          ]
                        }
                  }
                  transition={
                    stepState === "click"
                      ? { duration: 0.18, ease: "easeOut" }
                      : { duration: 2.4, repeat: isPublished ? 0 : Infinity, ease: "easeInOut" }
                  }
                  className={`flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] font-bold text-white shadow-md cursor-pointer transition-colors ${
                    isPublished
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:opacity-95"
                  }`}
                >
                  {isPublished ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                      <span>Reply Published · Live on Google Maps</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span className="truncate">Approve &amp; publish</span>
                      <Send className="h-3.5 w-3.5 shrink-0 ml-1" />
                    </>
                  )}
                </motion.button>

                {/* Simulated Mouse Cursor Animation */}
                <AnimatePresence>
                  {(stepState === "cursor" || stepState === "click") && (
                    <motion.div
                      key="demo-cursor"
                      initial={{ top: "40%", left: "85%", opacity: 0, scale: 0.8 }}
                      animate={
                        stepState === "cursor"
                          ? { top: "50%", left: "50%", opacity: 1, scale: 1 }
                          : { top: "50%", left: "50%", opacity: 1, scale: 0.85 }
                      }
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: stepState === "cursor" ? 0.9 : 0.15, ease: [0.4, 0, 0.2, 1] }}
                      className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
                    >
                      {/* Click Ripple Wave */}
                      {stepState === "click" && (
                        <motion.span
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-500"
                          initial={{ width: 0, height: 0, opacity: 0.8 }}
                          animate={{ width: 44, height: 44, opacity: 0 }}
                          transition={{ duration: 0.45, ease: "easeOut" }}
                        />
                      )}
                      <MousePointer2 className="h-5 w-5 rotate-12 fill-slate-900 text-white drop-shadow-lg" strokeWidth={1.5} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Published Toast Popup */}
                <AnimatePresence>
                  {isPublished && (
                    <motion.div
                      key="published-toast"
                      initial={{ opacity: 0, y: 14, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-x-0 -bottom-12 z-30 flex justify-center"
                    >
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 shadow-lg shadow-emerald-500/15">
                        <motion.span
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </motion.span>
                        <div className="text-left">
                          <p className="text-[11px] font-bold text-emerald-950 leading-tight">
                            Reply Published
                          </p>
                          <p className="text-[9px] text-emerald-700 leading-tight">
                            Live on Google Business Profile
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>
        </StepColumn>

        {/* ================= CONNECTOR 2: ONE-CLICK PUBLISH ================= */}
        <AnimatedConnector
          label="One-click publish"
          icon={<Send className="h-4 w-4" />}
          delay={1.2}
        />

        {/* ================= STEP 3: YOU APPROVE, IT PUBLISHES ================= */}
        <StepColumn number={3} title="You approve, it publishes">
          <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-sm sm:p-5 transition-all">
            {/* Header: Google Business Profile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GoogleLogoSvg className="h-5 w-5" />
                <span className="text-sm font-semibold tracking-tight text-slate-900">
                  Google Business Profile
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Search className="h-3.5 w-3.5" />
                <MoreVertical className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Business Header */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-sky-200 text-lg shadow-2xs">
                <span aria-hidden="true">{demoData.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{demoData.business}</p>
                <p className="truncate text-[11px] text-slate-500 font-medium">{demoData.area}</p>
              </div>
            </div>

            {/* Review Block */}
            <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <UserAvatar className="h-7 w-7" />
                <span className="text-[12px] font-semibold text-slate-900">{demoData.reviewer}</span>
                <StarRating rating={demoData.rating} size="h-3.5 w-3.5" />
                <span className="ml-auto text-[10px] text-slate-500 font-medium">{demoData.reviewDate}</span>
              </div>
              <p className="text-[13px] leading-snug text-slate-800">
                {demoData.reviewText}
              </p>
            </div>

            {/* Published Owner Response Subcard */}
            <AnimatePresence mode="wait">
              {isPublished ? (
                <motion.div
                  key="published-card"
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-3 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-fuchsia-50/40 p-3 shadow-2xs"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-slate-900">{demoData.business}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3 text-indigo-600 fill-indigo-600 text-white" />
                      Owner
                    </span>
                    <span className="ml-auto text-[10px] text-slate-500 font-medium">{demoData.replyDate}</span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-snug text-slate-800">
                    {demoData.replyText}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="pending-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center space-y-1"
                >
                  <div className="text-slate-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                    </motion.span>
                    <span>Waiting for Approval...</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Response will publish live here instantly upon 1-click approval.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </StepColumn>

      </div>

      {/* ================= BOTTOM AUTOMATION LOOP TRACK ================= */}
      <div className="mt-10 lg:col-span-5 relative flex items-center justify-center">
        {/* Horizontal Line with Center Gradient Flow */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"
        />

        {/* Center Pill */}
        <span className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-5 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="inline-flex"
          >
            <RotateCw className="h-3.5 w-3.5 text-indigo-600" />
          </motion.span>
          <span>Automation Loop Continues</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </span>
      </div>

    </div>
  )
}
