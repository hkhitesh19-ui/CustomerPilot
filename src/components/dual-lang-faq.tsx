"use client"

import React, { useState } from "react"
import { ChevronDown } from "lucide-react"

export interface DualLangFaqItem {
  id: number
  questionEn: string
  answerEn: string
  questionHi: string
  answerHi: string
}

interface DualLangFaqProps {
  items: DualLangFaqItem[]
  titleEn?: string
  titleHi?: string
  subtitleEn?: string
  subtitleHi?: string
  badgeEn?: string
  badgeHi?: string
  accentColor?: "emerald" | "cyan" | "blue" | "amber" | "indigo"
  theme?: "dark" | "light"
}

export function DualLangFaq({
  items = [],
  titleEn = "Frequently Asked Questions (FAQ)",
  titleHi = "Frequently Asked Questions (FAQ)",
  subtitleEn = "Everything you need to know about setting up and scaling with CustomerPilot",
  subtitleHi = "Vyaparion ke sabse zyada pooche jaane wale sawal aur unke detailed jawab",
  badgeEn = "Got Questions? We Have Answers",
  badgeHi = "Aapke Sawal, Hamare Jawab",
  accentColor = "emerald",
  theme = "light"
}: DualLangFaqProps) {
  // English (Indian English) is the DEFAULT language
  const [lang, setLang] = useState<"en" | "hinglish">("en")
  const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null)

  const isLight = theme === "light"
  const isEmerald = accentColor === "emerald"
  const isCyan = accentColor === "cyan"
  const isAmber = accentColor === "amber"
  const isIndigo = accentColor === "indigo"

  const activeBadgeBg = isLight
    ? isEmerald
      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
      : isCyan
      ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
      : isAmber
      ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
      : isIndigo
      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
      : "bg-slate-900 text-white shadow-md shadow-slate-900/20"
    : isEmerald
    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
    : isCyan
    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
    : isAmber
    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
    : isIndigo
    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
    : "bg-blue-500 text-white shadow-md shadow-blue-500/20"

  const questionColor = isLight
    ? isEmerald
      ? "text-slate-900 hover:text-emerald-700"
      : isCyan
      ? "text-slate-900 hover:text-cyan-700"
      : isAmber
      ? "text-slate-900 hover:text-amber-700"
      : isIndigo
      ? "text-slate-900 hover:text-indigo-700"
      : "text-slate-900 hover:text-blue-700"
    : isEmerald
    ? "text-emerald-400"
    : isCyan
    ? "text-cyan-400"
    : isAmber
    ? "text-amber-400"
    : isIndigo
    ? "text-indigo-400"
    : "text-blue-400"

  const badgeTextColor = isLight
    ? isEmerald
      ? "text-emerald-700 border-emerald-300 bg-emerald-50"
      : isCyan
      ? "text-cyan-700 border-cyan-300 bg-cyan-50"
      : isAmber
      ? "text-amber-800 border-amber-300 bg-amber-50"
      : isIndigo
      ? "text-indigo-700 border-indigo-300 bg-indigo-50"
      : "text-blue-700 border-blue-300 bg-blue-50"
    : isEmerald
    ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
    : isCyan
    ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/10"
    : isAmber
    ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
    : isIndigo
    ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/10"
    : "text-blue-400 border-blue-500/20 bg-blue-500/10"

  return (
    <section className="space-y-8" id="faq-section">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${badgeTextColor}`}>
          {lang === "en" ? badgeEn : badgeHi}
        </span>
        
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>
          {lang === "en" ? titleEn : titleHi}
        </h2>
        
        <p className={`text-xs sm:text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
          {lang === "en" ? subtitleEn : subtitleHi}
        </p>

        {/* TWO LANGUAGE OPTIONS SELECTION MODE */}
        <div className="pt-2">
          <div className={`inline-flex items-center p-1.5 rounded-2xl ${isLight ? "bg-slate-100 border border-slate-200 shadow-inner" : "bg-slate-900 border border-slate-700/80 shadow-inner"}`}>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                lang === "en"
                  ? activeBadgeBg
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🇮🇳 English (Indian English)
            </button>
            <button
              type="button"
              onClick={() => setLang("hinglish")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                lang === "hinglish"
                  ? activeBadgeBg
                  : isLight
                  ? "text-slate-600 hover:text-slate-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🗣️ Hinglish
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-3xl mx-auto">
        {items.map((item) => {
          const isOpen = openId === item.id
          const question = lang === "en" ? item.questionEn : item.questionHi
          const answer = lang === "en" ? item.answerEn : item.answerHi

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              className={`p-5 sm:p-6 rounded-2xl ${
                isLight
                  ? "bg-white border border-slate-200 hover:border-slate-300 shadow-xs focus:ring-2 focus:ring-emerald-500/20"
                  : "bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:ring-2 focus:ring-emerald-500/30"
              } transition-all space-y-2 cursor-pointer outline-hidden`}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setOpenId(isOpen ? null : item.id)
                }
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className={`font-bold text-base sm:text-lg ${questionColor}`}>
                  {question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 ${isLight ? "text-slate-500" : "text-slate-400"} flex-shrink-0 transition-transform duration-200 mt-1 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isOpen && (
                <p className={`text-xs sm:text-sm ${isLight ? "text-slate-600 border-slate-100" : "text-slate-300 border-slate-800/80"} leading-relaxed pt-1 border-t mt-2`}>
                  {answer}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
