'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import QRCode from "qrcode"
import { createBrandedClientQR } from "@/lib/client-branded-qr"
import Link from "next/link"
import {
  Store, MessageSquare, Search, Upload, Gift, QrCode as QrIcon, Zap,
  Check, ArrowRight, ArrowLeft, Loader2, UserCheck,
  Printer, AlertCircle, CircleDot, Star, Rocket, X, Shield,
  Menu, ChevronDown, Calculator, TrendingUp, Sparkles, Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrandLogo } from "@/components/brand-logo"
import { FaqSection } from "@/components/faq-section"
import { AIReplySandbox } from "@/components/ai-reply-sandbox"
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/scroll-reveal"
import { CountUp } from "@/components/count-up"

// ============================================================
// CustomerPilot V6.4 — Homepage & 9-Step Onboarding Activation
// ============================================================

interface WizardData {
  businessName: string
  ownerName: string
  email: string
  password: string
  businessType: string
  businessAddress: string
  whatsappNumber: string
  otpVerified: boolean
  otpSessionId: string
  otpSent: boolean
  deliveryStatus?: string
  googleBusiness: string
  googlePlaceId: string
  googleConnected: boolean
  googleSearchResults: any[]
  logoUploaded: boolean
  logoDataUrl?: string
  cardName: string
  stampsRequired: number
  rewardName: string
  cardColor: string
  qrGenerated: boolean
  qrDataUrl: string
  qrPrinted: boolean
  printFormat?: string
  testCustomerPhone: string
  testCustomerScanned: boolean
  testCustomerClaimed: boolean
  testStampsAwarded: number
  checklistItems: {
    whatsappConnected: boolean
    googleConnected: boolean
    rewardCardReady: boolean
    qrGenerated: boolean
    qrPrinted: boolean
    firstTestComplete: boolean
    staffAdded: boolean
    policiesReviewed: boolean
  }
}

const initialData: WizardData = {
  businessName: "Cake Connection",
  ownerName: "Hitesh",
  email: "hitesh@cakeconnection.in",
  password: "",
  businessType: "bakery",
  businessAddress: "Vadodara, Gujarat",
  whatsappNumber: "919033304707",
  otpVerified: false,
  otpSessionId: "",
  otpSent: false,
  googleBusiness: "",
  googlePlaceId: "",
  googleConnected: false,
  googleSearchResults: [],
  logoUploaded: false,
  cardName: "Cake Connection VIP Club",
  stampsRequired: 10,
  rewardName: "FREE 500gm Cake",
  cardColor: "amber",
  qrGenerated: false,
  qrDataUrl: "",
  qrPrinted: false,
  testCustomerPhone: "",
  testCustomerScanned: false,
  testCustomerClaimed: false,
  testStampsAwarded: 0,
  checklistItems: {
    whatsappConnected: false,
    googleConnected: false,
    rewardCardReady: false,
    qrGenerated: false,
    qrPrinted: false,
    firstTestComplete: false,
    staffAdded: false,
    policiesReviewed: false,
  },
}

export default function Home() {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [workerStatus, setWorkerStatus] = useState<any>(null)

  // Navigation & Drawer States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)

  // ROI Calculator State — Defaulted to "The 96 Customers" Real Case Baseline
  const [roiDailyCustomers, setRoiDailyCustomers] = useState("32")
  const [roiAvgBill, setRoiAvgBill] = useState("200")
  const [roiRecoveryRate, setRoiRecoveryRate] = useState("20")

  const calcROI = () => {
    const daily = parseInt(roiDailyCustomers) || 0
    const avgBill = parseInt(roiAvgBill) || 0
    const recoveryRate = parseInt(roiRecoveryRate) || 0

    const monthlyCustomers = daily * 30
    const lostWalkins = Math.round(monthlyCustomers * 0.50) // 50% baseline non-repeat walk-ins
    const recoveredCustomers = Math.round(lostWalkins * (recoveryRate / 100))
    const existingRepeat = monthlyCustomers - lostWalkins
    const newRepeatTotal = existingRepeat + recoveredCustomers
    const newRepeatPercent = monthlyCustomers > 0 ? Math.round((newRepeatTotal / monthlyCustomers) * 100) : 50

    const additionalMonthlySales = recoveredCustomers * avgBill
    const additionalAnnualSales = additionalMonthlySales * 12
    const planCostAnnual = 2249 // Pro Scaling Complete 1-Year (50% OFF)
    const monthlyCost = Math.round(planCostAnnual / 12)
    const breakEvenVisits = Math.max(1, Math.ceil(monthlyCost / (avgBill || 1)))
    const multiple = additionalAnnualSales > 0 ? Math.round(additionalAnnualSales / planCostAnnual) : 0

    return {
      daily,
      monthlyCustomers,
      lostWalkins,
      recoveredCustomers,
      newRepeatTotal,
      newRepeatPercent,
      additionalMonthlySales,
      additionalAnnualSales,
      monthlyCost,
      breakEvenVisits,
      multiple
    }
  }

  const roiData = calcROI()

  // Animated Chat Messages State for Phone Mockup
  const [chatMessages, setChatMessages] = useState<Array<{ d: 'in' | 'out', t: string, time: string }>>([])

  useEffect(() => {
    const msgs = [
      { d: 'in' as const, t: "Hi Hitesh! 🎂 Thanks for visiting today!", time: "3:40 PM" },
      { d: 'out' as const, t: "It was great! 😊", time: "3:41 PM" },
      { d: 'in' as const, t: "Collect your loyalty stamp 🏆<br/>Scan complete — <b>1 stamp added!</b>", time: "3:42 PM" },
      { d: 'in' as const, t: "⭐ Leave a Google review & earn +2 bonus stamps →", time: "3:43 PM" }
    ]

    let currentIndex = 0
    let timer: NodeJS.Timeout

    const addNextMessage = () => {
      if (currentIndex >= msgs.length) {
        timer = setTimeout(() => {
          setChatMessages([])
          currentIndex = 0
          addNextMessage()
        }, 3500)
        return
      }

      const msg = msgs[currentIndex]
      setChatMessages(prev => [...prev, msg])
      currentIndex++
      timer = setTimeout(addNextMessage, 1500)
    }

    addNextMessage()
    return () => clearTimeout(timer)
  }, [])

  const activationScore = calculateActivationScore(data)

  const steps = [
    { num: 1, label: "Business", icon: Store, required: true },
    { num: 2, label: "WhatsApp", icon: MessageSquare, required: true },
    { num: 3, label: "Google", icon: Search, required: true },
    { num: 4, label: "Logo", icon: Upload, required: false },
    { num: 5, label: "Rewards", icon: Gift, required: true },
    { num: 6, label: "QR Code", icon: QrIcon, required: true },
    { num: 7, label: "Print", icon: Printer, required: true },
    { num: 8, label: "Test Run", icon: UserCheck, required: true },
    { num: 9, label: "Launch!", icon: Rocket, required: true },
  ]

  const next = () => {
    if (step < 9) {
      setStep(step + 1)
      setError("")
    }
  }

  const back = () => { setStep(step - 1); setError("") }

  const openWizard = () => {
    setIsWizardOpen(true)
  }

  return (
    <div className="hp-body font-sans text-slate-900 bg-white min-h-screen selection:bg-emerald-500 selection:text-white">
      <style>{`
        html { scroll-behavior: smooth; }
        :root {
          --em:#10b981;--em-d:#059669;--sky:#0ea5e9;--ind:#6366f1;--ind-d:#4f46e5;
          --slate:#0f172a;--slate6:#475569;--slate5:#64748b;--slate4:#94a3b8;--slate3:#cbd5e1;
          --bg:#fff;--line:#e2e8f0;--amber:#f59e0b;
        }
        .wrap { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .grad-txt { background: linear-gradient(90deg, var(--em), var(--sky), var(--ind)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .section-separator { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0 20%, #cbd5e1 50%, #e2e8f0 80%, transparent); }
        .fcard:hover .ico { transform: scale(1.1) rotate(-3deg); transition: transform 0.3s cubic-bezier(0.25,0.4,0.25,1); }
        .fcard .ico { transition: transform 0.3s cubic-bezier(0.25,0.4,0.25,1); }
        .calc-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; background: #1e293b; border-radius: 999px; outline: none; border: 1px solid rgba(255,255,255,0.08); }
        .calc-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, #34d399, #10b981); border: 3px solid #0f172a; cursor: pointer; box-shadow: 0 0 14px rgba(16,185,129,0.7); transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .calc-slider::-webkit-slider-thumb:hover { transform: scale(1.18); box-shadow: 0 0 20px rgba(16,185,129,0.9); }
        .calc-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, #34d399, #10b981); border: 3px solid #0f172a; cursor: pointer; box-shadow: 0 0 14px rgba(16,185,129,0.7); }
        .btn-grad { background: linear-gradient(90deg, var(--em), var(--ind)); color: #fff; box-shadow: 0 10px 25px -8px rgba(16,185,129,.5); }
        .btn-grad:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .btn-white { background: #fff; color: var(--slate); box-shadow: 0 10px 25px -8px rgba(0,0,0,.25); }
        .btn-white:hover { transform: translateY(-1px); }
        .btn-ghost { background: rgba(255,255,255,.7); color: var(--slate6); border: 1px solid var(--line); backdrop-filter: blur(8px); }
        .btn-ghost:hover { background: #fff; color: var(--slate); }
        .btn-dark { background: var(--slate); color: #fff; }
        .btn-dark:hover { background: #1e293b; }
        .arrow { transition: transform .2s; display: inline-block; }
        .btn:hover .arrow { transform: translateX(3px); }

        .hero { position: relative; overflow: hidden; padding: 120px 0 70px; }
        @media(min-width:768px){ .hero { padding: 140px 0 90px; } }
        .aurora { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
        .aurora b { position: absolute; display: block; border-radius: 50%; filter: blur(80px); }
        .aurora b:nth-child(1) { width: 600px; height: 600px; left: 50%; top: -100px; transform: translateX(-50%); background: rgba(16,185,129,.18); animation: fl 14s ease-in-out infinite; }
        .aurora b:nth-child(2) { width: 360px; height: 360px; right: -40px; top: 200px; background: rgba(99,102,241,.15); animation: fl 16s ease-in-out infinite 3s; }
        .aurora b:nth-child(3) { width: 340px; height: 340px; left: -60px; top: 280px; background: rgba(14,165,233,.15); animation: fl 18s ease-in-out infinite 6s; }
        @keyframes fl { 0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-25px) scale(1.08)} }
        .dots { position: absolute; inset: 0; z-index: 0; opacity: .4; background-image: radial-gradient(circle, rgba(99,102,241,.12) 1px, transparent 1px); background-size: 28px 28px; mask-image: linear-gradient(180deg, #000 60%, transparent); pointer-events: none; }
        .hero-grid { display: grid; grid-template-columns: 1fr; gap: 40px; align-items: center; position: relative; z-index: 1; }
        @media(min-width:960px){ .hero-grid { grid-template-columns: 1.15fr .85fr; } }
        
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.9); border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 600; color: var(--slate6); box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .dot-live { position: relative; width: 8px; height: 8px; }
        .dot-live i { position: absolute; inset: 0; border-radius: 50%; background: var(--em); }
        .dot-live i:first-child { animation: ping 1.6s cubic-bezier(0,0,.2,1) infinite; opacity: .7; }
        @keyframes ping { 75%,100%{transform:scale(2.2);opacity:0} }

        h1.hero-h { font-size: 36px; font-weight: 800; line-height: 1.1; letter-spacing: -.02em; margin-top: 20px; color: var(--slate); }
        @media(min-width:640px){ h1.hero-h { font-size: 52px; } }
        @media(min-width:960px){ h1.hero-h { font-size: 60px; } }
        .hero p.lead { font-size: 16px; color: var(--slate5); max-width: 540px; margin-top: 20px; line-height: 1.6; }
        @media(min-width:640px){ .hero p.lead { font-size: 18px; } }
        
        .btn-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
        .trust { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 26px; font-size: 13px; color: var(--slate5); font-weight: 500; }
        .trust span { display: inline-flex; align-items: center; gap: 6px; }
        .ck { color: var(--em); font-weight: 700; }

        .phone-wrap { position: relative; display: flex; justify-content: center; }
        .float-card { position: absolute; z-index: 20; background: rgba(255,255,255,.92); backdrop-filter: blur(12px); border-radius: 16px; padding: 10px 14px; box-shadow: 0 12px 30px -10px rgba(15,23,42,.2); display: flex; align-items: center; gap: 8px; animation: bob 5s ease-in-out infinite; }
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float-card .ic { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; }
        .float-card .ic.em { background: linear-gradient(135deg, #34d399, #10b981); }
        .float-card .ic.ind { background: linear-gradient(135deg, #818cf8, #6366f1); }
        .float-card small { display: block; font-size: 12px; font-weight: 800; color: var(--slate); }
        .float-card .s { font-size: 10px; color: var(--slate4); }
        .fl1 { top: 30px; left: -10px; }
        .fl2 { bottom: 60px; right: -10px; animation-delay: 1.5s; }
        @media(min-width:640px){ .fl1{left:-20px} .fl2{right:-20px} }

        .phone { width: 270px; border-radius: 36px; background: #1e293b; padding: 10px; box-shadow: 0 30px 60px -20px rgba(99,102,241,.35); }
        @media(min-width:640px){ .phone { width: 300px; } }
        .screen { border-radius: 26px; overflow: hidden; background: #0b141a; }
        .wa-head { display: flex; align-items: center; gap: 10px; background: #202c33; padding: 12px 14px; }
        .wa-av { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #34d399, #6366f1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .wa-head .nm { color: #fff; font-size: 13px; font-weight: 600; }
        .wa-head .st { color: #34d399; font-size: 10px; }
        .wa-chat { padding: 12px; min-height: 250px; display: flex; flex-direction: column; gap: 8px; }
        .bub { max-width: 85%; border-radius: 10px; padding: 8px 11px; font-size: 12px; line-height: 1.4; box-shadow: 0 1px 2px rgba(0,0,0,.1); opacity: 0; animation: pop .4s ease forwards; }
        @keyframes pop { from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .bub.in { background: #202c33; color: #e2e8f0; align-self: flex-start; border-bottom-left-radius: 2px; }
        .bub.out { background: #005c4b; color: #e2e8f0; align-self: flex-end; border-bottom-right-radius: 2px; }
        .bub .t { display: flex; justify-content: flex-end; gap: 3px; margin-top: 3px; font-size: 9px; color: #94a3b8; }
        .wa-in { display: flex; gap: 8px; align-items: center; background: #202c33; padding: 8px 10px; }
        .wa-in .field { flex: 1; background: #2a3942; border-radius: 999px; padding: 6px 12px; font-size: 11px; color: #64748b; }
        .wa-in .send { width: 26px; height: 26px; border-radius: 50%; background: #00a884; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; }

        .strip { border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; background: rgba(248,250,252,.7); padding: 30px 0; overflow: hidden; }
        .strip p { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; color: var(--slate4); text-align: center; margin-bottom: 20px; }
        .marquee { display: flex; gap: 48px; width: max-content; animation: mq 28s linear infinite; }
        .marquee:hover { animation-play-state: paused; }
        @keyframes mq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .marquee .lg { display: flex; align-items: center; gap: 8px; color: var(--slate5); font-size: 15px; font-weight: 700; white-space: nowrap; }

        .feat { padding: 80px 0; }
        .sec-head { text-align: center; max-width: 680px; margin: 0 auto; }
        .eyebrow { display: inline-block; background: #ecfdf5; color: var(--em-d); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; padding: 4px 12px; border-radius: 999px; border: 1px solid #d1fae5; }
        h2.sec-h { font-size: 28px; font-weight: 800; letter-spacing: -.02em; margin-top: 14px; color: var(--slate); }
        @media(min-width:640px){ h2.sec-h { font-size: 42px; } }
        .sec-sub { font-size: 16px; color: var(--slate5); margin-top: 14px; line-height: 1.6; }
        .feat-grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 48px; }
        @media(min-width:768px){ .feat-grid { grid-template-columns: repeat(3, 1fr); } }
        .fcard { background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 28px; transition: .25s; display: flex; flex-direction: column; }
        .fcard:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -16px rgba(15,23,42,.12); border-color: #cbd5e1; }
        .fcard .ico { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; box-shadow: 0 8px 16px -6px rgba(0,0,0,.15); }
        .ico.amber { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
        .ico.em { background: linear-gradient(135deg, #34d399, #10b981); }
        .ico.ind { background: linear-gradient(135deg, #60a5fa, #6366f1); }
        .fcard h3 { font-size: 20px; font-weight: 800; margin-top: 20px; color: var(--slate); }
        .fcard p { color: var(--slate5); margin-top: 12px; font-size: 14px; line-height: 1.6; }
        .fcard ul { list-style: none; margin-top: 16px; }
        .fcard li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--slate6); margin-bottom: 8px; }
        .fcard li .c { color: var(--em); font-weight: 700; }
        .stamp-row { display: flex; gap: 8px; margin-top: 18px; }
        .stamp-row .s { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #fff; background: linear-gradient(135deg, #fbbf24, #f59e0b); }
        .stars { display: flex; gap: 3px; margin-top: 16px; align-items: center; }
        .stars small { margin-left: 8px; background: #ecfdf5; color: var(--em-d); padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .reply-prev { margin-top: 16px; background: #f8fafc; border-radius: 12px; padding: 10px 12px; font-size: 12px; color: var(--slate6); }

        .how { background: var(--slate); padding: 80px 0; color: #fff; }
        .how .eyebrow { background: rgba(255,255,255,.06); color: #34d399; border-color: rgba(255,255,255,.1); }
        .steps { display: grid; grid-template-columns: 1fr; gap: 28px; margin-top: 50px; }
        @media(min-width:768px){ .steps { grid-template-columns: repeat(3, 1fr); } }
        .step { text-align: center; }
        .step .num { width: 52px; height: 52px; border-radius: 16px; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; box-shadow: 0 8px 20px -4px rgba(0,0,0,.3); }
        .step .tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #64748b; margin-top: 18px; }
        .step h3 { font-size: 18px; font-weight: 700; margin-top: 6px; }
        .step p { font-size: 13px; color: #94a3b8; margin-top: 8px; line-height: 1.5; }

        .stats { padding: 70px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; text-align: center; }
        @media(min-width:768px){ .stats-grid { grid-template-columns: repeat(4, 1fr); } }
        .stat .v { font-size: 34px; font-weight: 800; background: linear-gradient(90deg, var(--em), var(--ind)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        @media(min-width:768px){ .stat .v { font-size: 42px; } }
        .stat .l { font-size: 13px; color: var(--slate5); margin-top: 6px; font-weight: 600; }

        .testi { background: #f8fafc; padding: 80px 0; }
        .testi .eyebrow { background: #fffbeb; color: #b45309; border-color: #fef3c7; }
        .tgrid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 48px; }
        @media(min-width:768px){ .tgrid { grid-template-columns: repeat(3, 1fr); } }
        .tcard { background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 26px; transition: .25s; }
        .tcard:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -16px rgba(15,23,42,.1); }
        .ttop { display: flex; justify-content: space-between; align-items: center; }
        .qmark { font-size: 28px; color: #a7f3d0; }
        .metric { background: #ecfdf5; color: var(--em-d); padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .tstars { margin-top: 10px; color: #f59e0b; font-size: 14px; }
        .tcard blockquote { font-size: 14px; color: #475569; margin-top: 12px; line-height: 1.6; }
        .tauthor { display: flex; align-items: center; gap: 12px; border-top: 1px solid #f1f5f9; margin-top: 20px; padding-top: 16px; }
        .tauthor .a { width: 38px; height: 38px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
        .tauthor .n { font-size: 13px; font-weight: 700; color: var(--slate); }
        .tauthor .r { font-size: 11px; color: var(--slate4); }

        .cta-sec { padding: 0 20px 80px; }
        .cta { position: relative; overflow: hidden; background: var(--slate); border-radius: 32px; padding: 50px 24px; text-align: center; color: #fff; }
        @media(min-width:640px){ .cta { padding: 70px 40px; border-radius: 40px; } }
        .cta .aurora2 { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .cta .aurora2 b { position: absolute; border-radius: 50%; filter: blur(70px); }
        .cta .aurora2 b:nth-child(1) { width: 300px; height: 300px; left: 15%; top: -80px; background: rgba(16,185,129,.35); animation: fl 16s infinite; }
        .cta .aurora2 b:nth-child(2) { width: 300px; height: 300px; right: 15%; bottom: -80px; background: rgba(99,102,241,.35); animation: fl 16s infinite 5s; }
        .cta .ct { position: relative; z-index: 1; }
        .cta h2 { font-size: 28px; font-weight: 800; letter-spacing: -.02em; }
        @media(min-width:640px){ .cta h2 { font-size: 42px; } }
        .cta p { color: #94a3b8; font-size: 16px; margin: 14px auto 0; max-width: 440px; }
        .cta .btn-row { margin-top: 28px; justify-content: center; }
      `}</style>

      {/* ============ FIXED STICKY NAVBAR ============ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="no-underline flex-shrink-0 flex items-center">
            <BrandLogo size="sm" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition">
                Products <ChevronDown className="w-4 h-4 opacity-60" />
              </button>
              {productsOpen && (
                <div className="absolute top-full left-0 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link href="/features/whatsapp-stamp-card" className="flex flex-col p-2.5 rounded-xl hover:bg-slate-50 transition">
                    <span className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 text-amber-500" /> Digital Loyalty Stamps</span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-md">VIP Club</span>
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">WhatsApp stamp cards &amp; automatic repeat rewards</span>
                  </Link>
                  <Link href="/features/google-review-automation" className="flex flex-col p-2.5 rounded-xl hover:bg-slate-50 transition">
                    <span className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-emerald-500" /> Smart Google Reviews</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md">AI Drafts</span>
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Post-purchase WhatsApp 5-star review collector</span>
                  </Link>
                  <Link href="#features" className="flex flex-col p-2.5 rounded-xl hover:bg-slate-50 transition">
                    <span className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> 1-Click AI AutoReply</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md">1-Sec Publish</span>
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Context-aware owner responses on Google Maps</span>
                  </Link>
                  <div className="border-t border-slate-100 my-1 pt-1">
                    <Link href="#comparison" className="flex flex-col p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 transition border border-emerald-100">
                      <span className="text-xs font-extrabold text-emerald-950 flex items-center justify-between">
                        <span>🚀 CustomerPilot Complete</span>
                        <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase">All-in-One</span>
                      </span>
                      <span className="text-[10px] text-emerald-800 font-medium mt-0.5">Loyalty Stamps + Smart Reviews + AI AutoReply</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Solutions Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setSolutionsOpen(true)}
              onMouseLeave={() => setSolutionsOpen(false)}
            >
              <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition">
                Solutions <ChevronDown className="w-4 h-4 opacity-60" />
              </button>
              {solutionsOpen && (
                <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link href="/bakery-loyalty" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800">
                    🍰 Bakery Loyalty Engine
                  </Link>
                  <Link href="/cafe-loyalty" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800">
                    ☕ Cafe & Coffee Cards
                  </Link>
                  <Link href="/restaurant-loyalty" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800">
                    🍽️ Restaurant Retention
                  </Link>
                  <Link href="/salon-loyalty" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800">
                    💇 Salon & Spa VIP Club
                  </Link>
                  <Link href="#industries" className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 transition text-xs font-semibold text-slate-800">
                    🛍️ All Retail Categories →
                  </Link>
                </div>
              )}
            </div>

            <Link href="/pricing" className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition">
              Pricing
            </Link>
            <Link href="/case-studies/cake-connection" className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition">
              Case Study
            </Link>
            <Link href="#ai-demo" className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition">
              AI Demo
            </Link>
            <Link href="#roi" className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition">
              ROI Calculator
            </Link>
            <Link href="#faq" className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition">
              FAQ
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-2 sm:px-3 py-1.5 rounded-lg transition">
              Sign In
            </Link>
            <Link
              href="#comparison"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1"
            >
              <span className="hidden sm:inline">Start 3 Days Free Trial Today</span>
              <span className="sm:hidden">Start Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Products &amp; Services</div>
              <Link href="/features/whatsapp-stamp-card" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-2 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50">
                <span className="flex items-center gap-2"><Gift className="w-4 h-4 text-amber-500" /> Digital Loyalty Stamps</span>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-md">VIP Club</span>
              </Link>
              <Link href="/features/google-review-automation" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-2 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50">
                <span className="flex items-center gap-2"><Star className="w-4 h-4 text-emerald-500" /> Smart Google Reviews</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md">AI Drafts</span>
              </Link>
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-2 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50">
                <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-500" /> 1-Click AI AutoReply</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded-md">1-Sec Publish</span>
              </Link>
              <Link href="#comparison" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between px-2 py-2 text-sm font-bold text-emerald-900 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <span>🚀 CustomerPilot Complete</span>
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase">All-in-One</span>
              </Link>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Solutions</div>
              <Link href="/bakery-loyalty" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-sm font-medium text-slate-800">
                🍰 Bakery Loyalty
              </Link>
              <Link href="/cafe-loyalty" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-sm font-medium text-slate-800">
                ☕ Cafe Stamp Cards
              </Link>
              <Link href="/restaurant-loyalty" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-sm font-medium text-slate-800">
                🍽️ Restaurant Retention
              </Link>
              <Link href="/salon-loyalty" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-sm font-medium text-slate-800">
                💇 Salon & Spa VIP
              </Link>
            </div>

            <div className="space-y-1 border-t border-slate-100 pt-3">
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-sm font-bold text-slate-900">
                ⚡ View Transparent Pricing
              </Link>
              <Link href="#roi" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-sm font-bold text-slate-900">
                📊 Calculate Your Store ROI
              </Link>
              <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-sm font-bold text-slate-900">
                ❓ Frequently Asked Questions
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-2 py-1.5 text-sm font-medium text-slate-600">
                📞 Merchant Support &amp; Help
              </Link>
            </div>

            <div className="pt-2">
              <Link
                href="#comparison"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-slate-900 text-white font-bold text-xs py-3 rounded-xl text-center block shadow-md"
              >
                Start 3 Days Free Trial Today →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ============ HERO (Item 8 copy) ============ */}
      <section className="hero">
        <div className="aurora"><b></b><b></b><b></b></div>
        <div className="dots"></div>
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <ScrollReveal variant="fadeDown" delay={0.1} duration={0.7}>
              <span className="badge">
                <span className="dot-live"><i></i><i></i></span> India&apos;s #1 Customer Retention Platform for Local Businesses
              </span>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.25} duration={0.8}>
              <h1 className="hero-h">
                Turn Every Walk-in<br />
                <span className="grad-txt">Into a Lifetime Customer.</span>
              </h1>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.4} duration={0.6}>
              <p className="mt-4 text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                Bring Your Customers Back. Get More Google Reviews. Reply Automatically.
              </p>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.5} duration={0.6}>
              <p className="lead mt-2">
                CustomerPilot helps local businesses bring customers back with loyalty rewards, AI-powered Google Review assistance, and automated review replies — without requiring customers to download an app.
              </p>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.6} duration={0.6}>
              <div className="btn-row flex flex-col gap-3">
                <Link href="/signup" className="btn btn-grad py-3.5 sm:py-4 px-6 sm:px-7 text-sm sm:text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all">
                  <span>Start 3-Day Free Trial (CustomerPilot Complete)</span> <span className="arrow">→</span>
                </Link>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Or choose single module:</span>
                  <Link href="/signup?module=loyalty" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] font-bold text-amber-800 transition">
                    🎁 Digital Loyalty Stamps &amp; VIP Club
                  </Link>
                  <Link href="/signup?module=reviews" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold text-emerald-800 transition">
                    ⭐ Ai Drafted SEO Optimized Google Reviews - Increase GoogleReviews Very Fast
                  </Link>
                  <Link href="/signup?module=autoreply" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-[11px] font-bold text-indigo-800 transition">
                    💬 Ai Drafted SEO Optimized 1-Click Reply to Google Reviews
                  </Link>
                  <Link href="#comparison" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[11px] font-extrabold text-slate-700 transition">
                    📊 Compare All 4 Options ↓
                  </Link>
                </div>
              </div>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.75} duration={0.5}>
              <div className="trust">
                <span><span className="ck">✓</span> No credit card required</span>
                <span><span className="ck">✓</span> Setup in 2 minutes</span>
                <span><span className="ck">✓</span> 3-Day full access</span>
              </div>
              </ScrollReveal>
            </div>

            {/* Phone Mockup with Animated Chat */}
            <div className="phone-wrap">
              <div className="float-card fl1"><div className="ic em">★</div><div><small>New 5★ review</small><div className="s">Priya S. · just now</div></div></div>
              <div className="float-card fl2"><div className="ic ind">🤖</div><div><small>+2 bonus stamps</small><div className="s">review verified</div></div></div>
              <div className="phone">
                <div className="screen">
                  <div className="wa-head">
                    <div className="wa-av">CC</div>
                    <div style={{ flex: 1 }}><div className="nm">Cake Connection</div><div className="st">online</div></div>
                  </div>
                  <div className="wa-chat">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className={`bub ${m.d}`}>
                        <span dangerouslySetInnerHTML={{ __html: m.t }} />
                        <div className="t">{m.time} {m.d === 'in' && <span style={{ color: '#53bdeb' }}>✓✓</span>}</div>
                      </div>
                    ))}
                  </div>
                  <div className="wa-in"><div className="field">Type a message</div><div className="send">➤</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LOGO STRIP ============ */}
      <div className="strip">
        <p>Powering reputation for India&apos;s best local businesses</p>
        <div className="marquee">
          <span className="lg">★ Sunrise Dental</span><span className="lg">★ Urban Brew</span><span className="lg">★ Glow Salon</span><span className="lg">★ FitZone Gym</span><span className="lg">★ Cake Connection</span><span className="lg">★ GreenLeaf Organic</span>
          <span className="lg">★ Sunrise Dental</span><span className="lg">★ Urban Brew</span><span className="lg">★ Glow Salon</span><span className="lg">★ FitZone Gym</span><span className="lg">★ Cake Connection</span><span className="lg">★ GreenLeaf Organic</span>
        </div>
      </div>

      {/* ============ BUILT FOR EVERY LOCAL BUSINESS (Item 9) ============ */}
      <section id="industries" className="py-20 bg-slate-50/70 border-b border-slate-200/60">
        <div className="wrap">
          <ScrollReveal variant="fadeUp">
          <div className="sec-head">
            <span className="eyebrow">Industry Solutions</span>
            <h2 className="sec-h">Built for Every Local Business</h2>
            <p className="sec-sub">Works with your existing billing. Cash, UPI, Card, or No Bill.</p>
          </div>
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.07} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            <StaggerItem variant="fadeUp">
            <Link href="/bakery-loyalty" className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all">
              <div className="text-3xl mb-3">🎂</div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition">Bakeries & Cakes</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Award slice bonuses, birthday cake loyalty stamps, and photo review bonus stamps on WhatsApp.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                Explore Bakery Solution →
              </span>
            </Link>
            </StaggerItem>

            <StaggerItem variant="fadeUp">
            <Link href="/cafe-loyalty" className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all">
              <div className="text-3xl mb-3">☕</div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition">Cafes & Coffee Bars</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Buy 5 coffees get 1 free espresso. Automated 14-day &apos;We miss you&apos; WhatsApp offers.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                Explore Cafe Solution →
              </span>
            </Link>
            </StaggerItem>

            <StaggerItem variant="fadeUp">
            <Link href="/restaurant-loyalty" className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all">
              <div className="text-3xl mb-3">🍽️</div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition">Restaurants & Dining</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Table counter scan, VIP dessert rewards, and automated 5-star Google review triggers.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                Explore Restaurant Solution →
              </span>
            </Link>
            </StaggerItem>

            <StaggerItem variant="fadeUp">
            <Link href="/salon-loyalty" className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all">
              <div className="text-3xl mb-3">💇</div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition">Salons & Spas</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Haircut stamp cards, bridal package points, and automated appointment re-engagement.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                Explore Salon Solution →
              </span>
            </Link>
            </StaggerItem>

            <StaggerItem variant="fadeUp">
            <Link href="/signup" className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all">
              <div className="text-3xl mb-3">🛍️</div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition">Retail & Boutiques</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Fashion VIP tiers, seasonal sale alerts, and instant cashier tap-to-claim rewards.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                Start Retail Free Trial →
              </span>
            </Link>
            </StaggerItem>

            <StaggerItem variant="fadeUp">
            <Link href="/bakery-loyalty" className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all">
              <div className="text-3xl mb-3">🍬</div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition">Sweet Shops & Mithai</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Festival reward stamps, corporate gifting bonus cards, and automated festival offers.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                Explore Mithai Solution →
              </span>
            </Link>
            </StaggerItem>

            <StaggerItem variant="fadeUp">
            <Link href="/signup" className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all">
              <div className="text-3xl mb-3">🏥</div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition">Clinics & Dental</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Routine check-up reminder cards, patient review collection, and VIP care plans.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                Start Clinic Free Trial →
              </span>
            </Link>
            </StaggerItem>

            <StaggerItem variant="fadeUp">
            <Link href="/signup" className="group p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all">
              <div className="text-3xl mb-3">💪</div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition">Gyms & Fitness</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Attendance check-in stamps, membership renewal multipliers, and friend referral rewards.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                Start Fitness Free Trial →
              </span>
            </Link>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <div className="section-separator" />

      {/* ============ REVENUE & GROWTH CALCULATOR ============ */}
      <section id="roi" className="py-20 bg-white">
        <div className="wrap">
          <ScrollReveal variant="fadeUp">
          <div className="sec-head max-w-3xl mx-auto text-center">
            <span className="eyebrow inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs shadow-xs">
              📊 Calculate Your Store ROI
            </span>
            <h2 className="sec-h text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mt-4 leading-tight">
              Revenue &amp; Growth Calculator
            </h2>
            <p className="sec-sub text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              See how much extra monthly revenue CustomerPilot can generate for your shop.
            </p>
          </div>
          </ScrollReveal>

          <ScrollReveal variant="scaleUp" delay={0.15}>
            <div className="max-w-5xl mx-auto mt-12 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800/90 relative overflow-hidden">
              {/* Subtle background ambient glow */}
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* 2-Column Calculator Grid */}
              <div className="grid md:grid-cols-12 gap-8 items-center relative z-10">
                {/* Inputs (7 cols) */}
                <div className="md:col-span-7 space-y-5">
                  {/* Slider 1: Daily Walk-ins */}
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition shadow-inner space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                        <span className="text-base">🚶</span> Daily Store Customers:
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-black text-sm">
                        {roiDailyCustomers} / day <span className="text-slate-400 text-xs font-normal">({roiData.monthlyCustomers.toLocaleString("en-IN")}/mo)</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="2"
                      value={roiDailyCustomers}
                      onChange={(e) => setRoiDailyCustomers(e.target.value)}
                      className="calc-slider"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-1">
                      <span>10/day (300/mo)</span>
                      <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">32/day (960/mo · Sureshbhai)</span>
                      <span>200/day (6,000/mo)</span>
                    </div>
                  </div>

                  {/* Slider 2: Average Bill */}
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition shadow-inner space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                        <span className="text-base">💳</span> Average Bill Amount (₹):
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-black text-sm">
                        ₹{roiAvgBill}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="3000"
                      step="50"
                      value={roiAvgBill}
                      onChange={(e) => setRoiAvgBill(e.target.value)}
                      className="calc-slider"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-1">
                      <span>₹100</span>
                      <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">₹200 (Restaurant / Cafe)</span>
                      <span>₹3,000 (Salon / Retail)</span>
                    </div>
                  </div>

                  {/* Slider 3: Recovery Rate */}
                  <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition shadow-inner space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                        <span className="text-base">🎯</span> Lost Customer Recovery Target:
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-black text-sm">
                        {roiRecoveryRate}% <span className="text-slate-400 text-xs font-normal">(+{roiData.recoveredCustomers} customers)</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="5"
                      value={roiRecoveryRate}
                      onChange={(e) => setRoiRecoveryRate(e.target.value)}
                      className="calc-slider"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-1">
                      <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">20% (The 96 Customers)</span>
                      <span>50% (Standard)</span>
                      <span>80% (Aggressive)</span>
                    </div>
                  </div>

                  {/* Math Formula Callout */}
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2.5">
                    <span className="text-lg flex-shrink-0">💡</span>
                    <span className="leading-relaxed">
                      Baseline: <b className="text-slate-200">{roiData.monthlyCustomers} monthly walk-ins</b> at <b className="text-slate-200">₹{roiAvgBill} avg bill</b> = ₹{(roiData.monthlyCustomers * (parseInt(roiAvgBill) || 0)).toLocaleString("en-IN")}/mo sales. Recovering just <b className="text-emerald-300">{roiData.recoveredCustomers} customers</b> generates <b className="text-emerald-300">+₹{roiData.additionalMonthlySales.toLocaleString("en-IN")}/mo</b> extra revenue!
                    </span>
                  </div>
                </div>

                {/* Output Result Card (5 cols) */}
                <div className="md:col-span-5 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-emerald-500/60 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5 relative shadow-2xl ring-1 ring-emerald-500/20">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                    <span>🔥 THE 96 CUSTOMERS IMPACT</span>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Additional Monthly Sales</div>
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 bg-clip-text text-transparent mt-1">
                        +₹{roiData.additionalMonthlySales.toLocaleString("en-IN")}
                        <span className="text-xs text-slate-400 font-normal ml-1">/ mo</span>
                      </div>
                      <div className="text-[11px] text-emerald-300/90 mt-1 font-medium">
                        {roiData.recoveredCustomers} repeat customers × ₹{roiAvgBill} avg bill = +₹{roiData.additionalMonthlySales.toLocaleString("en-IN")}/mo
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Annual Revenue Potential</div>
                      <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                        +₹{(roiData.additionalAnnualSales / 100000).toFixed(2)} Lakh
                        <span className="text-xs text-slate-400 font-normal ml-1">/ year (+₹{roiData.additionalAnnualSales.toLocaleString("en-IN")})</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-3 flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repeat Rate</div>
                        <div className="text-base font-black text-white mt-0.5">
                          50% ➔ <span className="text-emerald-400">{roiData.newRepeatPercent}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repeat Visits</div>
                        <div className="text-sm font-black text-emerald-300 mt-0.5">
                          {roiData.lostWalkins} ➔ {roiData.newRepeatTotal} visits
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1-Visit Break-Even Metric Box */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-200 leading-relaxed shadow-sm">
                    <div className="font-extrabold text-emerald-300 flex items-center gap-1.5 mb-1">
                      <span>🎯</span> The 1-Visit Break-Even Metric:
                    </div>
                    CustomerPilot costs just <b>₹{roiData.monthlyCost}/mo (~₹6.2/day)</b>. Literally just <b>{roiData.breakEvenVisits} extra repeat visit/month</b> pays for your entire subscription!
                  </div>

                  <Link
                    href="/signup"
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm py-3.5 rounded-xl text-center shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
                  >
                    <span>Start 3-Day Free Trial (All-in-One Full Suite)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Visual 4-Step Infographic Flow (The 96 Customers Growth Loop) */}
              <div className="border-t border-slate-800/90 pt-8 mt-10 space-y-5 relative z-10">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
                    <span>🔄 THE &quot;96 CUSTOMERS&quot; GROWTH LOOP</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">How CustomerPilot Pays For Itself in 30 Days</h3>
                  <p className="text-xs text-slate-400 max-w-xl mx-auto">
                    Kamleshbhai &amp; Sureshbhai dialogue breakdown: 2 Join stamps + 4 Review stamps ➔ 5 qualified repeat visits.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-2 relative shadow-sm">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs">1</div>
                    <div className="font-bold text-white text-xs sm:text-sm">The 96 Customers</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      960 monthly walk-ins at ₹200 avg bill. Sureshbhai brings back just <b>96 lost customers</b>.
                    </p>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-indigo-500/40 hover:border-indigo-500/60 transition space-y-2 relative shadow-sm">
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-black text-xs">2</div>
                    <div className="font-bold text-white text-xs sm:text-sm">6-Stamp Jumpstart</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Customer scans QR: <b>2 Welcome stamps</b> + <b>4 Google Review AI stamps</b> = 6 stamps on Day 1!
                    </p>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-sky-500/40 hover:border-sky-500/60 transition space-y-2 relative shadow-sm">
                    <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center justify-center font-black text-xs">3</div>
                    <div className="font-bold text-white text-xs sm:text-sm">5 Qualified Visits</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      To unlock 11-Stamp Free Meal (₹100), customer visits 5 more times = <b>₹1,000 qualifying sales</b> per customer.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900/90 to-slate-900 p-4 rounded-2xl border border-emerald-500/60 space-y-2 relative shadow-md">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">4</div>
                    <div className="font-bold text-emerald-300 text-xs sm:text-sm">Revenue Impact</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      <b>+₹19,200/mo (+₹2,30,400/yr)</b> extra sales at just <b>₹6.2/day cost</b> (102× ROI multiple).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-separator" />

      {/* ============ BUSINESS GROWTH DASHBOARD SECTION ============ */}
      <section className="py-20 bg-white border-t border-slate-200/80" id="growth-insights">
        <div className="wrap">
          <ScrollReveal variant="fadeUp">
          <div className="sec-head max-w-3xl mx-auto text-center">
            <span className="eyebrow inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs shadow-xs">
              📊 Business Growth Intelligence
            </span>
            <h2 className="sec-h text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mt-4 leading-tight">
              Know Which Customers Are Coming Back — And Why.
            </h2>
            <p className="sec-sub text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              CustomerPilot shows you the numbers that actually drive profit: customer growth, repeat visits, loyalty activity, and Google reputation — all in one simple view.
            </p>
          </div>
          </ScrollReveal>

          {/* Clean Dashboard Snapshot Container */}
          <ScrollReveal variant="scaleUp" delay={0.15}>
          <div className="max-w-5xl mx-auto mt-12 bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 space-y-8">
            {/* Top Bar of the Dashboard Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <h3 className="font-bold text-white text-base sm:text-lg">Real-Time Store Performance Snapshot</h3>
                  <p className="text-xs text-slate-400">Live walk-in analytics & loyalty retention metrics</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-emerald-400">
                <span>⚡ Updated automatically via WhatsApp</span>
              </div>
            </div>

            {/* 6 Key KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Card 1: Customer Growth */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Customer Growth</div>
                <div className="text-xl sm:text-2xl font-black text-white"><CountUp end={1248} duration={2} separator="," /></div>
                <div className="text-[10px] font-bold text-emerald-400">↑ 18% this month</div>
              </div>

              {/* Card 2: Returning Customers */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Returning Regulars</div>
                <div className="text-xl sm:text-2xl font-black text-white"><CountUp end={486} duration={1.8} separator="," /></div>
                <div className="text-[10px] font-bold text-emerald-400">↑ 12% this month</div>
              </div>

              {/* Card 3: Loyalty Members */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Loyalty Members</div>
                <div className="text-xl sm:text-2xl font-black text-white"><CountUp end={732} duration={1.8} separator="," /></div>
                <div className="text-[10px] font-bold text-slate-400">58% of customers</div>
              </div>

              {/* Card 4: Google Reviews */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Google Reviews</div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-1">
                  <CountUp end={4.8} decimals={1} duration={1.5} /> <span className="text-sm">★</span>
                </div>
                <div className="text-[10px] font-bold text-emerald-400">+64 new reviews</div>
              </div>

              {/* Card 5: Repeat Visits */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Repeat Visits</div>
                <div className="text-xl sm:text-2xl font-black text-white"><CountUp end={326} duration={1.8} separator="," /></div>
                <div className="text-[10px] font-bold text-emerald-400">This Month</div>
              </div>

              {/* Card 6: Rewards Redeemed */}
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-1 hover:border-slate-600 transition">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rewards Claimed</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400"><CountUp end={184} duration={1.8} separator="," /></div>
                <div className="text-[10px] font-bold text-slate-300">Customers Returned</div>
              </div>
            </div>

            {/* Lifecycle Conversion Funnel Strip */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Your Predictable Customer Lifecycle:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-xs text-slate-400 font-medium">1. New Walk-ins</div>
                  <div className="text-base font-bold text-white mt-0.5">1,248 Gained</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-xs text-slate-400 font-medium">2. Returning Customers</div>
                  <div className="text-base font-bold text-blue-400 mt-0.5">486 Returned</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-xs text-slate-400 font-medium">3. Loyal VIP Members</div>
                  <div className="text-base font-bold text-purple-400 mt-0.5">732 Active VIPs</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                  <div className="text-xs text-emerald-300 font-medium">4. Repeat Revenue</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">₹2,84,000+ Added</div>
                </div>
              </div>
            </div>
          </div>
          </ScrollReveal>

          {/* 3 Growth Pillars (Actionable Explanations Below the Mockup) */}
          <StaggerContainer staggerDelay={0.12} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10">
            {/* Pillar 1: Track Repeat Business & Inactivity */}
            <StaggerItem variant="fadeUp">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-lg transition h-full">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl">
                🔄
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Track Repeat Business & Engagement</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Know which customers are active regulars and which are becoming inactive. Trigger automated 14-day WhatsApp win-backs before you lose them to competitors.
              </p>
            </div>
            </StaggerItem>

            {/* Pillar 2: Measure Loyalty Program ROI */}
            <StaggerItem variant="fadeUp">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-lg transition h-full">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-xl">
                🎁
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Measure Loyalty Program & Rewards</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Track exact stamps collected, rewards earned, and free items redeemed. Understand which perks bring back the most customers without eroding your margins.
              </p>
            </div>
            </StaggerItem>

            {/* Pillar 3: Monitor Google Reputation & 1-Click AutoReplies */}
            <StaggerItem variant="fadeUp">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-lg transition h-full">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl">
                ⭐
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Monitor Your Google Reputation</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Watch your 5-star review count climb every week. Ensure 100% of reviews get an AI-drafted owner response in 1-Click to rank higher on Google Maps.
              </p>
            </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <div className="section-separator" />

      {/* ============ FEATURES (The 3 Core Products) ============ */}
      <section className="feat bg-slate-50/50" id="features">
        <div className="wrap">
          <ScrollReveal variant="fadeUp">
          <div className="sec-head">
            <span className="eyebrow">Three Core Engines</span>
            <h2 className="sec-h">Everything Your Store Needs.<br/><span style={{ color: '#94a3b8' }}>Nothing It Doesn&apos;t.</span></h2>
            <p className="sec-sub">Bring customers back, collect verified 5-star Google reviews, and auto-reply to every customer — all inside WhatsApp.</p>
          </div>
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.15} className="feat-grid">
            {/* Product 1: Digital Loyalty Stamps */}
            <StaggerItem variant="fadeUp" className="h-full flex flex-col">
            <div className="fcard h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="ico amber">🏆</div>
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2.5 py-1 rounded-full">
                  ✨ WhatsApp Native
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-4">Digital Loyalty &amp; Stamps</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Turn walk-in buyers into 10x repeat regulars with automatic WhatsApp digital stamp cards and milestone VIP rewards.
              </p>
              <ul className="space-y-1.5 mt-4 text-xs text-slate-700 flex-1">
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> No-App Digital Stamp Card</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> Automated VIP Tier Progression</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> Birthday &amp; Anniversary Rewards</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> 30-Day Win-Back Re-engagement</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> 5-Second QR Counter Setup</li>
              </ul>
              <div className="stamp-row mt-4">
                <span className="s">★</span><span className="s">★</span><span className="s">★</span><span className="s">★</span><span className="s">★</span>
              </div>
              <Link href="/signup?module=loyalty" className="mt-5 w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm">
                <span>Start 3-Day Free Trial</span> <span>→</span>
              </Link>
            </div>
            </StaggerItem>

            {/* Product 2: Smart Google Reviews */}
            <StaggerItem variant="fadeUp" className="h-full flex flex-col">
            <div className="fcard h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="ico em">⭐</div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-full">
                  ⭐ 5-Star Booster
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-4">Smart Google Reviews</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Automatically invite customers after purchase via WhatsApp. Happy customers post pre-drafted 5-star AI reviews in 1 tap.
              </p>
              <ul className="space-y-1.5 mt-4 text-xs text-slate-700 flex-1">
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> AI SEO-Optimized Review Drafts</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> Post-Purchase WhatsApp Triggers</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> Smart Negative Review Shield</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> 1-Click Copy &amp; Post to Google Maps</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> Live Rating Growth Analytics</li>
              </ul>
              <div className="stars mt-4"><span style={{ color: '#f59e0b' }}>★★★★★</span><small className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px]">+412 this month</small></div>
              <Link href="/signup?module=reviews" className="mt-5 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>Start 3-Day Free Trial</span> <span>→</span>
              </Link>
            </div>
            </StaggerItem>

            {/* Product 3: 1-Click AI AutoReply */}
            <StaggerItem variant="fadeUp" className="h-full flex flex-col">
            <div className="fcard h-full flex flex-col">
              <div className="flex items-center justify-between">
                <div className="ico ind">💬</div>
                <span className="text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold px-2.5 py-1 rounded-full">
                  ⚡ 1-Sec AI Replies
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-4">1-Click AI AutoReply</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Gemini AI drafts appreciative, context-aware owner responses. Review and publish directly to Google Maps in 1 click.
              </p>
              <ul className="space-y-1.5 mt-4 text-xs text-slate-700 flex-1">
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> Context-Aware AI Drafts in 1 Sec</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> 1-Click Publish to Google Maps</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> Sentiment &amp; Keyword Adaptation</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> Dead-Letter Queue Safety</li>
                <li className="flex items-center gap-2"><span className="c text-emerald-500 font-bold">✓</span> Zero Missed Reviews Guarantee</li>
              </ul>
              <div className="reply-prev mt-4 text-xs bg-slate-50 border border-slate-100 p-2.5 rounded-xl"><strong style={{ color: 'var(--slate)' }}>AI Reply:</strong> &quot;Thank you so much! 💜 See you again soon.&quot;</div>
              <Link href="/signup?module=autoreply" className="mt-5 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm">
                <span>Start 3-Day Free Trial</span> <span>→</span>
              </Link>
            </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* ============ AI REPLY SANDBOX (Interactive Demo) ============ */}
      <AIReplySandbox />

      {/* ============ FEATURE COMPARISON MATRIX TABLE (Ultra High-Converting Dominant Complete Suite) ============ */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-y border-slate-800 relative overflow-hidden" id="comparison">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="wrap max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <ScrollReveal variant="fadeUp">
          <div className="sec-head max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs tracking-wide shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>👑 STORE OWNER&apos;S #1 CHOICE · 94% CHOOSE COMPLETE SUITE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Compare Features Across All 4 Options
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Why buy partial tools? See why <strong className="text-emerald-400">94% of merchants choose the Complete Suite</strong> to connect WhatsApp loyalty, Google 5★ reviews, and automated replies into a single revenue engine.
            </p>
          </div>
          </ScrollReveal>

          {/* Table Container */}
          <ScrollReveal variant="scaleUp" delay={0.15}>
          <div className="mt-14 overflow-x-auto rounded-3xl border border-slate-700/80 shadow-2xl bg-slate-950/95 backdrop-blur-xl">
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/95">
                  <th className="p-6 text-sm font-extrabold text-slate-200 w-[30%] align-bottom">
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Capabilities Matrix</div>
                    <div className="text-base font-black text-white">Features &amp; Engines</div>
                  </th>
                  <th className="p-5 text-center w-[17%] border-l border-slate-800 bg-slate-900/60 align-top">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl mx-auto mb-2">🎁</div>
                    <div className="font-extrabold text-xs sm:text-sm text-white">Digital Loyalty Stamps</div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">Standalone Module</div>
                    <div className="text-base font-black text-white mt-2">₹999<span className="text-[10px] text-slate-400 font-normal">/yr</span></div>
                    <div className="text-[10px] text-slate-400 font-medium">Just ₹2.7/day</div>
                  </th>
                  <th className="p-5 text-center w-[18%] border-l border-slate-800 bg-slate-900/60 align-top">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl mx-auto mb-2">⭐</div>
                    <div className="font-extrabold text-xs sm:text-sm text-white">Smart Google Reviews</div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Standalone Module</div>
                    <div className="text-base font-black text-white mt-2">₹999<span className="text-[10px] text-slate-400 font-normal">/yr</span></div>
                    <div className="text-[10px] text-slate-400 font-medium">Just ₹2.7/day</div>
                  </th>
                  <th className="p-5 text-center w-[17%] border-l border-slate-800 bg-slate-900/60 align-top">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xl mx-auto mb-2">💬</div>
                    <div className="font-extrabold text-xs sm:text-sm text-white">1-Click AI AutoReply</div>
                    <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">Standalone Module</div>
                    <div className="text-base font-black text-white mt-2">₹999<span className="text-[10px] text-slate-400 font-normal">/yr</span></div>
                    <div className="text-[10px] text-slate-400 font-medium">Just ₹2.7/day</div>
                  </th>
                  
                  {/* Dominant Highlighted Complete Suite Header */}
                  <th className="p-6 text-center w-[18%] border-l-2 border-r-2 border-emerald-500 bg-gradient-to-b from-emerald-950/90 via-slate-900 to-slate-900 relative shadow-2xl align-top">
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 whitespace-nowrap">
                      <span>🔥 94% CHOOSE THIS · SAVE 35%</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center text-2xl mx-auto mb-2 shadow-lg shadow-emerald-500/30">🚀</div>
                    <div className="font-black text-base text-white">
                      CustomerPilot Complete
                    </div>
                    <div className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider mt-0.5">All 3 Core Engines Combined</div>
                    <div className="mt-2 flex items-baseline justify-center gap-1.5">
                      <span className="text-xs line-through text-slate-500">₹3,999</span>
                      <span className="text-2xl font-black text-emerald-400">₹2,899</span>
                      <span className="text-[10px] text-slate-300 font-medium">/yr</span>
                    </div>
                    <div className="text-[11px] text-emerald-300 font-bold mt-0.5">Just ₹7.9/day for all 3</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {/* ---------------- SECTION 1: LOYALTY ---------------- */}
                <tr className="bg-amber-950/30">
                  <td colSpan={5} className="py-3 px-6 bg-gradient-to-r from-amber-950/60 to-slate-900 border-y border-amber-500/20">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
                      <span>🎁 1. Digital Loyalty Stamps &amp; VIP Club</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">Digital Stamp Card on WhatsApp (No App Download for Customer)</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">VIP Club Tier System (Silver, Gold, Platinum Automatic Upgrades)</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">Automated Birthday Treats &amp; Milestone Bonus Stamps</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">14-Day &amp; 30-Day Inactive Customer Win-Back WhatsApp Alerts</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">Cashier 1-Tap Counter Queue Terminal &amp; Customer CRM</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>

                {/* ---------------- SECTION 2: GOOGLE REVIEWS ---------------- */}
                <tr className="bg-emerald-950/30">
                  <td colSpan={5} className="py-3 px-6 bg-gradient-to-r from-emerald-950/60 to-slate-900 border-y border-emerald-500/20">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-300">
                      <span>⭐ 2. Ai Drafted SEO Optimized Google Reviews - Increase GoogleReviews Very Fast</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">Instant AI Customer Review Draft Assistant (Gemini AI Engine)</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">Post-Purchase WhatsApp 5★ Review Prompts with Delay Timer</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">1-Click Copy &amp; Post to Google Maps with Organic Keywords</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">5-Star Golden Review Standee &amp; Table Tent Posters (Print PDF)</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>

                {/* ---------------- SECTION 3: AUTOREPLY ---------------- */}
                <tr className="bg-indigo-950/30">
                  <td colSpan={5} className="py-3 px-6 bg-gradient-to-r from-indigo-950/60 to-slate-900 border-y border-indigo-500/20">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-300">
                      <span>💬 3. Ai Drafted SEO Optimized 1-Click Reply to Google Reviews</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">Google Business Profile (GBP) Connect &amp; Review Sync</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">AI Context-Aware Owner Reply Drafts in 1 Second</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">1-Click Direct Publish to Google Maps</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">Bulk Auto-Reply Engine for Past Google Reviews</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">✓</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/10 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ Included</span>
                  </td>
                </tr>

                {/* ---------------- SECTION 4: COMPLETE SUITE EXCLUSIVE SYNERGIES ---------------- */}
                <tr className="bg-gradient-to-r from-emerald-950/60 via-teal-950/60 to-slate-900 font-bold">
                  <td colSpan={5} className="py-3.5 px-6 bg-gradient-to-r from-emerald-900/60 via-teal-900/40 to-slate-900 border-y border-emerald-500/30">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-300">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>🚀 4. CustomerPilot Complete : Digital Loyalty + Smart AI GoogleReviews + 1-Click AutoReply</span>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-bold text-emerald-300 text-sm">
                    <div>AI Review-to-Loyalty Multiplier</div>
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">Google Review post karne par customer ko automatic +2 Bonus Stamps WhatsApp pe milte hain</div>
                  </td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/15 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] shadow-sm">👑 Exclusive Synergy</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-bold text-emerald-300 text-sm">
                    <div>Unified 360° Customer SuperCRM</div>
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">Visits, total spend, loyalty stamp status aur Google Review profile ek single screen pe</div>
                  </td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/15 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] shadow-sm">👑 Exclusive Unified</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-bold text-emerald-300 text-sm">
                    <div>Complete Physical Store Print Kit</div>
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">VIP Loyalty Standee + Google 5★ Golden Standee + Table Tents + Sticker Badges (A4 PDF)</div>
                  </td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-[11px] text-slate-400">1 Standee only</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-[11px] text-slate-400">1 Standee only</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-slate-600 font-medium text-sm">—</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/15 font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">✓ All Standees</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-slate-100 text-sm">Priority WhatsApp VIP Merchant Desk</td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-[11px] text-slate-400">Standard</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-[11px] text-slate-400">Standard</span></td>
                  <td className="p-4 text-center border-l border-slate-800"><span className="text-[11px] text-slate-400">Standard</span></td>
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-emerald-500/15 font-bold">
                    <span className="inline-flex items-center gap-1 text-amber-300 font-black text-xs">⚡ Priority VIP</span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-700 bg-slate-900/95">
                  <td className="p-6 font-black text-slate-100 text-sm">
                    Choose Your 3-Day Free Trial:
                  </td>
                  <td className="p-4 text-center border-l border-slate-800">
                    <Link href="/signup?module=loyalty" className="inline-flex w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs items-center justify-center transition">
                      Trial Loyalty Stamps →
                    </Link>
                  </td>
                  <td className="p-4 text-center border-l border-slate-800">
                    <Link href="/signup?module=reviews" className="inline-flex w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs items-center justify-center transition">
                      Trial AI Reviews →
                    </Link>
                  </td>
                  <td className="p-4 text-center border-l border-slate-800">
                    <Link href="/signup?module=autoreply" className="inline-flex w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-bold text-xs items-center justify-center transition">
                      Trial AutoReply →
                    </Link>
                  </td>

                  {/* Dominant Complete Suite Action Button */}
                  <td className="p-4 text-center border-l-2 border-r-2 border-emerald-500 bg-gradient-to-b from-emerald-950/90 to-slate-950">
                    <Link href="/signup" className="group w-full py-3.5 px-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex flex-col items-center justify-center shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all">
                      <span className="flex items-center gap-1.5">
                        <span>Start CustomerPilot Complete</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="text-[9px] text-slate-900/90 font-extrabold uppercase tracking-wider mt-0.5">All 3 Engines Unlocked</span>
                    </Link>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-separator" />

      {/* ============ WHY MERCHANTS CHOOSE CUSTOMERPILOT (New High-Impact Section) ============ */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80" id="why-merchants">
        <div className="wrap">
          <ScrollReveal variant="fadeUp">
          <div className="sec-head max-w-3xl mx-auto text-center">
            <span className="eyebrow inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs shadow-xs">
              ⚡ Store Owner Advantage
            </span>
            <h2 className="sec-h text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mt-4 leading-tight">
              Built for Real Store Growth. Zero Fluff.
            </h2>
            <p className="sec-sub text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Designed to retain your walk-ins, save staff time, and automate 5-star reputation on Google Maps.
            </p>
          </div>
          </ScrollReveal>

          {/* 4 Pillars Grid */}
          <StaggerContainer staggerDelay={0.12} className="grid md:grid-cols-2 gap-6 mt-12">
            {/* Pillar 1: 100% App-Free Customer Retention */}
            <StaggerItem variant="fadeUp">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all space-y-4 h-full">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-2xl font-bold">
                  🎁
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  3x Higher Customer Adoption
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">100% App-Free Customer Retention</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Customers never have to download heavy apps or remember passwords. The digital loyalty card lives directly inside their WhatsApp, ensuring maximum customer participation.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Works on every smartphone camera instantly
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  No app download friction or sign-up drop-offs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Turns 1-time visitors into 10x regular customers
                </li>
              </ul>
            </div>
            </StaggerItem>

            {/* Pillar 2: 1-Click Google Maps Reputation Engine */}
            <StaggerItem variant="fadeUp">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all space-y-4 h-full">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-2xl font-bold">
                  ⭐
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                  Rank #1 on Google Maps
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">1-Click Google Reputation Engine</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Effortlessly collect authentic 5-star customer reviews right after purchase. AI automatically drafts appreciative, context-aware owner responses ready for 1-click publishing.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Automated WhatsApp review prompts after checkout
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  AI drafts thoughtful owner responses in 1 second
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Skyrockets neighborhood search visibility & foot traffic
                </li>
              </ul>
            </div>
            </StaggerItem>

            {/* Pillar 3: 98% Open-Rate WhatsApp Marketing */}
            <StaggerItem variant="fadeUp">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all space-y-4 h-full">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-2xl font-bold">
                  📱
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  98% Message Open Rate
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">98% Open-Rate WhatsApp Automation</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                SMS and promotional emails get lost in spam folders. Direct WhatsApp loyalty triggers deliver unmatched engagement for birthday rewards and automated customer win-backs.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Delivers messages where customers actually look
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Automated birthday greetings and reward perks
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  14-day inactivity win-back reminders that drive repeat visits
                </li>
              </ul>
            </div>
            </StaggerItem>

            {/* Pillar 4: Zero Staff Friction (5-Second Cashier Tap) */}
            <StaggerItem variant="fadeUp">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all space-y-4 h-full">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center text-2xl font-bold">
                  ⏱️
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                  5-Second Cashier Speed
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Zero Staff Friction & Time Saved</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Billing counters remain fast and smooth. Cashiers do not have to manually type long phone numbers or navigate complex software. One tap on a phone or tablet awards the stamp.
              </p>
              <ul className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  5-second tap-to-claim checkout speed
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Zero training required for counter staff
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black">✓</span>
                  Works seamlessly with Cash, UPI, Cards, or No Bill
                </li>
              </ul>
            </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Quick Comparison Strip */}
          <ScrollReveal variant="fadeUp" delay={0.2}>
          <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-extrabold text-slate-900 text-lg">Traditional Methods vs. CustomerPilot</h4>
              <p className="text-xs text-slate-500">Stop wasting money on lost paper cards, ignored SMS promos, and expensive POS add-ons.</p>
            </div>
            <Link href="/signup">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md">
                Start 3 Days Free Trial Today →
              </Button>
            </Link>
          </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-separator" />

      {/* ============ HOW IT WORKS ============ */}
      <section className="how" id="how">
        <div className="wrap">
          <ScrollReveal variant="fadeUp">
          <div className="sec-head">
            <span className="eyebrow">3 simple steps</span>
            <h2 className="sec-h text-white">5 Seconds. That&apos;s It.</h2>
          </div>
          </ScrollReveal>
          <StaggerContainer staggerDelay={0.15} className="steps">
            <StaggerItem variant="fadeUp">
            <div className="step">
              <div className="num" style={{ background: 'linear-gradient(135deg,#34d399,#10b981)' }}>🛒</div>
              <div className="tag">Step 1</div>
              <h3>Customer purchases</h3>
              <p>A customer buys from your shop. You ask them to scan the counter QR standee.</p>
            </div>
            </StaggerItem>

            <StaggerItem variant="fadeUp">
            <div className="step">
              <div className="num" style={{ background: 'linear-gradient(135deg,#60a5fa,#0ea5e9)' }}>📱</div>
              <div className="tag">Step 2</div>
              <h3>WhatsApp Opens</h3>
              <p>CustomerPilot opens WhatsApp, registers their stamp in 5 seconds, and invites a 5★ review.</p>
            </div>
            </StaggerItem>

            <StaggerItem variant="fadeUp">
            <div className="step">
              <div className="num" style={{ background: 'linear-gradient(135deg,#818cf8,#6366f1)' }}>🔄</div>
              <div className="tag">Step 3</div>
              <h3>They come back</h3>
              <p>Stamps, reward perks, and automated win-back reminders keep your customers returning.</p>
            </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <div className="section-separator" />

      {/* ============ STATS ============ */}
      <section className="stats">
        <div className="wrap">
          <StaggerContainer staggerDelay={0.1} className="stats-grid">
            <StaggerItem variant="scaleUp">
            <div className="stat">
              <div className="v"><CountUp end={4.8} decimals={1} duration={2} suffix="L+" /></div>
              <div className="l">Reviews collected</div>
            </div>
            </StaggerItem>

            <StaggerItem variant="scaleUp">
            <div className="stat">
              <div className="v"><CountUp end={1200} duration={2} separator="," suffix="+" /></div>
              <div className="l">Active merchants</div>
            </div>
            </StaggerItem>

            <StaggerItem variant="scaleUp">
            <div className="stat">
              <div className="v"><CountUp end={34} duration={1.8} suffix="%" /></div>
              <div className="l">Avg. conversion</div>
            </div>
            </StaggerItem>

            <StaggerItem variant="scaleUp">
            <div className="stat">
              <div className="v"><CountUp end={98.6} decimals={1} duration={1.8} suffix="%" /></div>
              <div className="l">Delivery rate</div>
            </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <div className="section-separator" />

      {/* ============ TESTIMONIALS ============ */}
      <section className="testi">
        <div className="wrap">
          <ScrollReveal variant="fadeUp">
          <div className="sec-head">
            <span className="eyebrow">⭐ 4.9 from 1,200+ merchants</span>
            <h2 className="sec-h">Results shops can feel.</h2>
          </div>
          </ScrollReveal>

          <StaggerContainer staggerDelay={0.12} className="tgrid">
            <StaggerItem variant="fadeUp">
            <div className="tcard h-full flex flex-col justify-between">
              <div>
                <div className="ttop"><span className="qmark">&quot;</span><span className="metric">+925% reviews</span></div>
                <div className="tstars">★★★★★</div>
                <blockquote>40 → 410 Google reviews in 3 months. CustomerPilot keeps customers coming back with stamps &amp; rewards. My clinic is busier than ever.</blockquote>
              </div>
              <div className="tauthor"><div className="a" style={{ background: 'linear-gradient(135deg,#fb7185,#ec4899)' }}>AM</div><div><div className="n">Dr. Anita Mehta</div><div className="r">Owner, Sunrise Dental</div></div></div>
            </div>
            </StaggerItem>

            <StaggerItem variant="fadeUp">
            <div className="tcard h-full flex flex-col justify-between">
              <div>
                <div className="ttop"><span className="qmark">&quot;</span><span className="metric">Weekly returns</span></div>
                <div className="tstars">★★★★★</div>
                <blockquote>Customers love scanning the QR. The loyalty stamps bring them back every week. It feels like one simple tool — not three.</blockquote>
              </div>
              <div className="tauthor"><div className="a" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>MR</div><div><div className="n">Marco Rossi</div><div className="r">Founder, Urban Brew Café</div></div></div>
            </div>
            </StaggerItem>

            <StaggerItem variant="fadeUp">
            <div className="tcard h-full flex flex-col justify-between">
              <div>
                <div className="ttop"><span className="qmark">&quot;</span><span className="metric">5-min setup</span></div>
                <div className="tstars">★★★★★</div>
                <blockquote>Every Google review gets a reply instantly. My customers feel heard, and I never miss one anymore. Setup took 5 minutes.</blockquote>
              </div>
              <div className="tauthor"><div className="a" style={{ background: 'linear-gradient(135deg,#c084fc,#8b5cf6)' }}>SL</div><div><div className="n">Sara Lin</div><div className="r">Manager, Glow Salon</div></div></div>
            </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <div className="section-separator" />

      {/* ============ PRICING REDIRECT BANNER ============ */}
      <section className="price py-16 bg-white border-t border-slate-200/60" id="pricing">
        <div className="wrap">
          <ScrollReveal variant="fadeUp">
          <div className="sec-head">
            <span className="eyebrow" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', fontWeight: 800 }}>
              🔥 Limited Time 50% Discount Offer · Flat 50% OFF All Plans
            </span>
            <h2 className="sec-h">Simple Plans That Scale With You.</h2>
            <p className="sec-sub">100% of AI Features Included. Standalone modules from ₹549 (MRP ₹1,099) and Complete Suite at ₹2,249/yr (MRP ₹4,499).</p>
          </div>
          <div style={{ textAlign: 'center', marginTop: '36px', display: 'flex', justifyContent: 'center' }}>
            <Link href="/pricing" className="btn btn-grad text-sm sm:text-base py-3.5 sm:py-4 px-6 sm:px-8 font-bold rounded-xl" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>View Master 50% Discount Pricing Table ➔</span>
            </Link>
          </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-separator" />

      {/* ============ CTA ============ */}
      <section className="cta-sec">
        <div className="wrap">
          <ScrollReveal variant="scaleUp">
          <div className="cta">
            <div className="aurora2"><b></b><b></b></div>
            <div className="ct">
              <h2>Your next 100 five-star reviews<br/><span className="grad-txt">are one click away.</span></h2>
              <p>Join 1,200+ merchants automating their reputation. Start 3 Days Free Trial Today.</p>
              <div className="btn-row">
                <Link href="/signup" className="btn btn-white text-sm sm:text-base py-3.5 sm:py-4 px-6 sm:px-7 font-bold rounded-xl">
                  Start 3 Days Free Trial Today <span className="arrow">→</span>
                </Link>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============ FREQUENTLY ASKED QUESTIONS ============ */}
      <FaqSection />

      {/* ============ FOOTER ============ */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
        {/* Subtle top border gradient accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-8">
            {/* Brand Column (2 cols on large screens) */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="no-underline inline-block bg-white/95 hover:bg-white px-3 py-1.5 rounded-xl shadow-xs transition">
                <BrandLogo size="sm" />
              </Link>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                Turn every walk-in into a lifetime customer — with WhatsApp loyalty rewards, Google 5★ reviews, and replies on autopilot.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                <span className="text-amber-400">★</span> 4.9 Rating · 1,200+ Indian Store Owners
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/919033304707?text=Hi%20CustomerPilot%20Team%2C%20I%20need%20assistance%20with%20CustomerPilot."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 px-4 py-2.5 rounded-xl border border-emerald-500/30 transition shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>24/7 WhatsApp: +91 90333 04707</span>
                </a>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500/70" />
                <span>100% Encrypted &amp; WhatsApp Business Approved</span>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-2.5 text-xs text-slate-400 list-none p-0 m-0">
                <li><Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing &amp; Plans</Link></li>
                <li><Link href="/case-studies/cake-connection" className="hover:text-emerald-400 transition-colors">Case Study: Cake Connection</Link></li>
                <li><Link href="#ai-demo" className="hover:text-emerald-400 transition-colors">AI Review Reply Demo</Link></li>
                <li><Link href="#faq" className="hover:text-emerald-400 transition-colors">Frequently Asked Questions</Link></li>
                <li><Link href="/features/whatsapp-stamp-card" className="hover:text-emerald-400 transition-colors">WhatsApp Stamp Cards</Link></li>
                <li><Link href="/features/google-review-automation" className="hover:text-emerald-400 transition-colors">Google Review AI</Link></li>
              </ul>
            </div>

            {/* Column 3: Compare */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Compare</h4>
              <ul className="space-y-2.5 text-xs text-slate-400 list-none p-0 m-0">
                <li><Link href="/vs/reelo" className="hover:text-emerald-400 transition-colors">vs Reelo</Link></li>
                <li><Link href="/vs/bingage" className="hover:text-emerald-400 transition-colors">vs Bingage</Link></li>
                <li><Link href="/compare/vs-traditional-pos" className="hover:text-emerald-400 transition-colors">vs Traditional POS</Link></li>
                <li><Link href="#comparison" className="hover:text-emerald-400 transition-colors">Compare All 4 Plans</Link></li>
              </ul>
            </div>

            {/* Column 4: Industries */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Industries</h4>
              <ul className="space-y-2.5 text-xs text-slate-400 list-none p-0 m-0">
                <li><Link href="/bakery-loyalty" className="hover:text-emerald-400 transition-colors">Bakery &amp; Cake Shops</Link></li>
                <li><Link href="/cafe-loyalty" className="hover:text-emerald-400 transition-colors">Cafes &amp; Coffee Bars</Link></li>
                <li><Link href="/restaurant-loyalty" className="hover:text-emerald-400 transition-colors">Restaurants &amp; Dining</Link></li>
                <li><Link href="/salon-loyalty" className="hover:text-emerald-400 transition-colors">Salons &amp; Spas</Link></li>
              </ul>
            </div>

            {/* Column 5: Legal & Trust */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Legal &amp; Trust</h4>
              <ul className="space-y-2.5 text-xs text-slate-400 list-none p-0 m-0">
                <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-emerald-400 transition-colors">Security &amp; Architecture</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Support</Link></li>
                <li><Link href="/help" className="hover:text-emerald-400 transition-colors">Help &amp; Documentation</Link></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="border-t border-slate-800/80 pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © {new Date().getFullYear()} CustomerPilot Inc. · Made with ❤️ in India · support@customerpilot.in
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ============ ONBOARDING ACTIVATION WIZARD MODAL ============ */}
      <AnimatePresence>
        {isWizardOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-stone-50 via-white to-amber-50/30 w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="border-b bg-white/90 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">CustomerPilot Activation Wizard</span>
                      <Badge variant="secondary" className="text-[10px]">Step {step} of 9</Badge>
                    </div>
                    <p className="text-xs text-slate-500">3-Day Free Merchant Trial Setup</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Live Activation Score */}
                  <div className="flex items-center gap-2">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400">Score</p>
                      <p className={`text-sm font-bold ${activationScore >= 80 ? 'text-emerald-600' : activationScore >= 50 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {activationScore}%
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsWizardOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Wizard Body */}
              <div className="p-6">
                {/* Stepper */}
                <div className="mb-6 overflow-x-auto pb-2">
                  <div className="flex items-center justify-between min-w-[600px]">
                    {steps.map((s, i) => (
                      <div key={s.num} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => s.num <= step && setStep(s.num)}
                            disabled={s.num > step}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                              step === s.num 
                                ? "bg-slate-900 text-white scale-110 shadow-lg" 
                                : step > s.num 
                                  ? "bg-emerald-500 text-white" 
                                  : "bg-slate-200 text-slate-400"
                            } ${s.num < step ? 'cursor-pointer hover:bg-emerald-400' : ''}`}
                          >
                            {step > s.num ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <s.icon className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className={`text-[10px] font-medium ${s.num === step ? 'text-slate-900 font-bold' : s.num < step ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {s.label}
                          </span>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mt-[-14px] ${s.num < step ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Components */}
                <Card className="shadow-lg border-0 overflow-hidden bg-white">
                  <CardContent className="p-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {step === 1 && <Step1Business data={data} setData={setData} next={next} />}
                        {step === 2 && <Step2WhatsApp data={data} setData={setData} error={error} setError={setError} />}
                        {step === 3 && <Step3GoogleBusiness data={data} setData={setData} error={error} setError={setError} />}
                        {step === 4 && <Step4Logo data={data} setData={setData} />}
                        {step === 5 && <Step5Rewards data={data} setData={setData} />}
                        {step === 6 && <Step6QRCode data={data} setData={setData} />}
                        {step === 7 && <Step7PrintQR data={data} setData={setData} />}
                        {step === 8 && <Step8FirstTest data={data} setData={setData} error={error} setError={setError} />}
                        {step === 9 && <Step9Launch data={data} activationScore={activationScore} workerStatus={workerStatus} />}
                      </motion.div>
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-6">
                  <Button variant="ghost" onClick={back} disabled={step === 1} size="sm">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    {error && (
                      <span className="text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {error}
                      </span>
                    )}
                    
                    {step < 9 && (
                      <Button 
                        onClick={next} 
                        size="sm"
                        className="bg-slate-900 text-white hover:bg-slate-800"
                        disabled={!canProceedToNext(step, data)}
                      >
                        Continue <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// STEP 1: Business Details
// ============================================================
function Step1Business({ data, setData, next }: any) {
  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Store className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Step 1: Merchant Signup & Business Info</h2>
          <p className="text-xs text-slate-500">Create your official Merchant account & credentials to activate trial</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <Label className="text-xs font-semibold">Business Name *</Label>
          <Input
            value={data.businessName}
            onChange={(e) => setData({ ...data, businessName: e.target.value })}
            placeholder="e.g., Cake Connection"
            className="mt-1 text-sm"
            required
            autoFocus
          />
        </div>

        <div>
          <Label className="text-xs font-semibold">Owner Name *</Label>
          <Input
            value={data.ownerName}
            onChange={(e) => setData({ ...data, ownerName: e.target.value })}
            placeholder="e.g., Hitesh"
            className="mt-1 text-sm"
            required
          />
        </div>

        <div>
          <Label className="text-xs font-semibold">Merchant Email ID *</Label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="e.g., hitesh@cakeconnection.in"
            className="mt-1 text-sm"
            required
          />
        </div>

        <div>
          <Label className="text-xs font-semibold">Login Password *</Label>
          <Input
            type="password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            placeholder="Create account password"
            className="mt-1 text-sm"
            required
          />
        </div>

        <div>
          <Label className="text-xs font-semibold">Business Type *</Label>
          <Select value={data.businessType} onValueChange={(v) => setData({ ...data, businessType: v })}>
            <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[
                { value: "bakery", label: "Bakery 🥐 (Cake Shop)" },
                { value: "cafe", label: "Cafe ☕" },
                { value: "restaurant", label: "Restaurant 🍽️" },
                { value: "salon", label: "Salon 💇" },
                { value: "gym", label: "Gym 💪" },
                { value: "florist", label: "Florist 🌸" },
                { value: "clinic", label: "Clinic 🏥" },
                { value: "spa", label: "Spa 💆" },
                { value: "retail", label: "Retail 🛍️" },
                { value: "other", label: "Other 📦" },
              ].map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-semibold">Business Address / City</Label>
          <Input
            value={data.businessAddress}
            onChange={(e) => setData({ ...data, businessAddress: e.target.value })}
            placeholder="e.g., Vadodara, Gujarat"
            className="mt-1 text-sm"
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// STEP 2: WhatsApp Verification
// ============================================================
function Step2WhatsApp({ data, setData, error, setError }: any) {
  const [otp, setOtp] = useState("")
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [apiResponse, setApiResponse] = useState<any>(null)

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const sendOtp = async () => {
    if (!data.whatsappNumber || data.whatsappNumber.length < 10) {
      setError("Please enter a valid phone number with country code")
      return
    }

    setSendingOtp(true)
    setError("")

    try {
      const res = await fetch("/api/whatsapp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: data.whatsappNumber }),
      })

      const json = await res.json()

      if (res.ok && json.ok) {
        setData({
          ...data,
          otpSent: true,
          otpSessionId: json.data.sessionId,
          deliveryStatus: json.data.deliveryResult?.status,
        })
        setApiResponse(json.data)
        setResendTimer(json.data.resendCooldownSeconds || 10)
      } else {
        setError(json.error || "Failed to send OTP")
      }
    } catch (e: any) {
      setError("Network error. Please try again.")
    } finally {
      setSendingOtp(false)
    }
  }

  const verifyOtp = async () => {
    if (otp.length !== 4) {
      setError("Please enter the 4-digit OTP")
      return
    }

    setVerifying(true)
    setError("")

    try {
      const res = await fetch("/api/whatsapp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: data.otpSessionId, otp }),
      })

      const json = await res.json()

      if (res.ok && json.ok && json.data.verified) {
        setData({
          ...data,
          otpVerified: true,
          checklistItems: { ...data.checklistItems, whatsappConnected: true },
        })
      } else {
        setError(json.error || json.data?.message || "Invalid OTP")
      }
    } catch (e: any) {
      setError("Verification failed. Try again.")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Connect WhatsApp Business</h2>
          <p className="text-xs text-slate-500">Real Meta Cloud API integration for OTP verification</p>
        </div>
      </div>

      <div className="space-y-6 max-w-lg">
        {!data.otpVerified ? (
          <>
            <div>
              <Label>WhatsApp Business Number *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={data.whatsappNumber}
                  onChange={(e) => setData({ ...data, whatsappNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  disabled={data.otpSent}
                />
                <Button
                  onClick={sendOtp}
                  disabled={data.otpSent || data.whatsappNumber.length < 10 || resendTimer > 0}
                  className="bg-slate-900 text-white"
                >
                  {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : data.otpSent ? "Sent ✓" : "Send OTP"}
                </Button>
              </div>
            </div>

            {data.otpSent && !data.otpVerified && (
              <div className="space-y-3">
                {/* Same-number detection: show OTP on screen prominently */}
                {apiResponse?.isSameNumber && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-amber-600 text-lg">⚠️</span>
                      <div>
                        <p className="text-sm font-bold text-amber-800">Same Number as Business WhatsApp</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          WhatsApp cannot deliver messages to itself. Your OTP is shown below — enter it to verify.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 bg-white border-2 border-amber-400 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">Your OTP Code</p>
                      <p className="text-4xl font-mono font-black tracking-[0.5em] text-slate-900">
                        {apiResponse.otp}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Valid for 10 minutes</p>
                    </div>
                  </div>
                )}

                {/* Demo mode / Evolution failed */}
                {apiResponse?.demoMode && !apiResponse?.isSameNumber && (
                  <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-800">{apiResponse.message}</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      OTP: <strong className="text-lg font-mono tracking-widest">{apiResponse.otp}</strong>
                    </p>
                  </div>
                )}

                {/* Normal WhatsApp delivery success */}
                {!apiResponse?.demoMode && !apiResponse?.isSameNumber && (
                  <div className="flex items-center gap-2 text-xs text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-medium">OTP Sent via WhatsApp. Check your phone.</span>
                  </div>
                )}

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                  <div>
                    <Label className="text-xs">Enter 4-digit OTP</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="1234"
                        maxLength={4}
                        className="font-mono text-center tracking-widest text-lg font-bold"
                      />
                      <Button
                        onClick={verifyOtp}
                        disabled={verifying || otp.length !== 4}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                      </Button>
                    </div>
                  </div>

                  {resendTimer > 0 && (
                    <p className="text-[11px] text-slate-400 text-center">Resend OTP in {resendTimer}s</p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900">WhatsApp Verified!</h3>
            <p className="text-xs text-slate-600">{data.whatsappNumber} is connected to CustomerPilot</p>
          </div>
        )}

        <div className="p-3 bg-slate-50 rounded-lg flex items-start gap-2 border border-slate-200">
          <Shield className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600">
            <strong>Security:</strong> OTP expires in 10 minutes. Max 10 attempts. Rate limited to prevent abuse.
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// STEP 3: Google Business Profile
// ============================================================
function Step3GoogleBusiness({ data, setData, error, setError }: any) {
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState(data.businessName || "")
  const [directUrl, setDirectUrl] = useState("")

  const searchGooglePlaces = async () => {
    if (!query) return
    setSearching(true)
    setError("")

    try {
      const res = await fetch(`/api/google/places-search?q=${encodeURIComponent(query)}`)
      const json = await res.json()

      if (res.ok && json.ok) {
        setData({ ...data, googleSearchResults: json.data.results || [] })
      } else {
        setError(json.error || "Search failed")
      }
    } catch (e: any) {
      setError("Failed to search Google Places")
    } finally {
      setSearching(false)
    }
  }

  const handleDirectLink = () => {
    if (!directUrl.trim()) {
      setError("Please paste a valid Google Maps URL or Place ID")
      return
    }

    // Extract business name or place ID from URL
    let name = data.businessName || "Connected Google Business Profile"
    let placeId = `gmaps_${Date.now()}`

    if (directUrl.includes("ChIJ")) {
      const match = directUrl.match(/ChIJ[A-Za-z0-9_-]{23}/)
      if (match) placeId = match[0]
    }

    if (directUrl.includes("/place/")) {
      try {
        const parts = directUrl.split("/place/")[1].split("/")[0]
        name = decodeURIComponent(parts.replace(/\+/g, " "))
      } catch (e) {}
    }

    selectPlace({
      name,
      placeId,
      address: directUrl.startsWith("http") ? directUrl : "Google Maps Linked Profile",
    })
  }

  const selectPlace = (place: any) => {
    setData({
      ...data,
      googleBusiness: place.name,
      googlePlaceId: place.placeId,
      googleConnected: true,
      checklistItems: { ...data.checklistItems, googleConnected: true },
    })
  }

  const disconnectPlace = () => {
    setData({
      ...data,
      googleConnected: false,
      googleBusiness: "",
      googlePlaceId: "",
      googleSearchResults: [],
      checklistItems: { ...data.checklistItems, googleConnected: false },
    })
    setError("")
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
          <Search className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Connect Google Business Profile</h2>
          <p className="text-xs text-slate-500">Link your official Google place to collect & reply to 5-star reviews</p>
        </div>
      </div>

      <div className="space-y-6 max-w-lg">
        {!data.googleConnected ? (
          <>
            <div className="space-y-4">
              <div>
                <Label>1. Search Business Name on Google Maps</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Cake Connection Live Cake Anand"
                    onKeyDown={(e) => e.key === 'Enter' && searchGooglePlaces()}
                  />
                  <Button onClick={searchGooglePlaces} disabled={searching} className="bg-slate-900 text-white min-w-[100px]">
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search Profile"}
                  </Button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-xs text-slate-400 font-semibold uppercase">OR Paste Direct Link</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div>
                <Label>2. Paste Google Maps Share Link / Place ID</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/... OR ChIJ..."
                  />
                  <Button onClick={handleDirectLink} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                    Link URL →
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Tip: Open Google Maps → Share → Copy Link → Paste here for 100% exact connection!
                </p>
              </div>
            </div>

            {data.googleSearchResults.length > 0 && (
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-semibold text-slate-700">Select your matching Google Business Profile:</Label>
                {data.googleSearchResults.map((place: any) => (
                  <div
                    key={place.placeId}
                    onClick={() => selectPlace(place)}
                    className="p-4 border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-md cursor-pointer flex items-center justify-between transition bg-white"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900">{place.name}</p>
                        {place.rating && (
                          <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                            ★ {place.rating} ({place.reviewCount || 100}+ reviews)
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{place.address}</p>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                      Connect →
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{data.googleBusiness}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Place ID: {data.googlePlaceId}</p>
            </div>
            <Badge className="bg-emerald-500 text-white">Google Business Profile Connected ✓</Badge>

            <div className="pt-3 border-t border-blue-200/60 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectPlace}
                className="bg-white text-rose-600 border-rose-300 hover:bg-rose-50 text-xs font-semibold shadow-sm"
              >
                Disconnect & Change Profile ↺
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// STEP 4: Logo Upload
// ============================================================
function Step4Logo({ data, setData }: any) {
  const handleLogoUpload = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setData({
          ...data,
          logoUploaded: true,
          logoDataUrl: reader.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="p-6 sm:p-8 text-center space-y-6">
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Upload Business Logo</h2>
        <p className="text-xs text-slate-500">Your logo will appear on customer digital reward cards</p>

        <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-slate-50">
          {data.logoUploaded ? (
            <img src={data.logoDataUrl} alt="Logo" className="w-24 h-24 object-contain rounded-xl shadow" />
          ) : (
            <Upload className="w-10 h-10 text-slate-400 mb-2" />
          )}

          <label className="mt-4 cursor-pointer">
            <span className="btn btn-dark text-xs py-2 px-4">Browse File</span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// STEP 5: Rewards Config
// ============================================================
function Step5Rewards({ data, setData }: any) {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Gift className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Configure Loyalty Rewards</h2>
          <p className="text-xs text-slate-500">Set the stamps required and reward offer for your customers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Reward Card Title</Label>
            <Input
              value={data.cardName}
              onChange={(e) => setData({ ...data, cardName: e.target.value })}
              placeholder="e.g., VIP Cake Loyalty Pass"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Stamps Required for Free Reward</Label>
            <Select
              value={String(data.stampsRequired)}
              onValueChange={(v) => setData({ ...data, stampsRequired: Number(v), checklistItems: { ...data.checklistItems, rewardCardReady: true } })}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[3, 5, 8, 10].map(num => (
                  <SelectItem key={num} value={String(num)}>{num} Stamps</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Free Reward Description</Label>
            <Input
              value={data.rewardName}
              onChange={(e) => setData({ ...data, rewardName: e.target.value, checklistItems: { ...data.checklistItems, rewardCardReady: true } })}
              placeholder="e.g., 1 Free Pastry + Coffee"
              className="mt-1"
            />
          </div>
        </div>

        {/* Card Preview */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex flex-col justify-between shadow-xl min-h-[200px]">
          <div>
            <Badge className="bg-white/20 text-white border-0">Loyalty Pass</Badge>
            <h3 className="font-bold text-lg mt-2">{data.cardName || "VIP Loyalty Pass"}</h3>
            <p className="text-xs text-amber-100 mt-1">Reward: {data.rewardName || "Free Gift"}</p>
          </div>

          <div className="flex gap-2 flex-wrap mt-4">
            {Array.from({ length: data.stampsRequired || 5 }).map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xs font-bold">
                ★
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// STEP 6: QR Code Generation
// ============================================================
function Step6QRCode({ data, setData }: any) {
  const [waLink, setWaLink] = useState("")

  useEffect(() => {
    const generateQR = async () => {
      try {
        const phone = (data.whatsappNumber || "919033304707").replace(/\D/g, "")
        const businessName = data.businessName || "Cake Connection"
        const textMessage = `🎉 Hi ${businessName}! I want to join your VIP Club & collect my first loyalty stamp!`
        
        // Official WhatsApp Deep Link format (opens WhatsApp App directly on mobile)
        const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(textMessage)}`
        setWaLink(targetUrl)

        const qr = await createBrandedClientQR(targetUrl, { width: 500 })
        setData({
          ...data,
          qrGenerated: true,
          qrDataUrl: qr,
          checklistItems: { ...data.checklistItems, qrGenerated: true },
        })
      } catch (e) {}
    }
    generateQR()
  }, [data.businessName, data.whatsappNumber])

  return (
    <div className="p-6 sm:p-8 text-center space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900">Your Counter QR Standee</h2>
        <p className="text-xs text-slate-500">Customers scan this QR at your counter — directly opens WhatsApp (No App Required)</p>
      </div>

      {data.qrDataUrl && (
        <div className="inline-block p-6 bg-white border-2 border-slate-900 rounded-3xl shadow-xl space-y-4 max-w-sm w-full">
          {data.logoDataUrl && (
            <div className="flex justify-center items-center">
              <img
                src={data.logoDataUrl}
                alt={data.businessName || "Cake Connection"}
                className="max-h-16 max-w-[200px] w-auto h-auto object-contain rounded-xl p-1 bg-white border border-slate-200 shadow-sm"
              />
            </div>
          )}
          <p className="font-extrabold text-slate-900 text-lg tracking-tight">{data.businessName || "Cake Connection"}</p>
          
          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
            <img src={data.qrDataUrl} alt="WhatsApp QR Code" className="w-52 h-52 mx-auto" />
          </div>

          {/* CustomerPilot Branding with Logo */}
          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-center gap-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Powered by</span>
            <img src="/cplogo_horizontal.png" alt="CustomerPilot" className="h-5 w-auto object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// STEP 7: Print QR
// ============================================================
function Step7PrintQR({ data, setData }: any) {
  const [standeeType, setStandeeType] = useState("table")
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const businessName = data.businessName || "Cake Connection"
  const logoUrl = data.logoDataUrl || "/Logo/cplogo.png"
  const qrUrl = data.qrDataUrl || ""
  const rewardOffer = data.rewardName || "FREE 500gm Cake"

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-slate-900">Print Counter QR Standee & Posters</h2>
        <p className="text-xs text-slate-500">Preview and print your physical QR displays for counter & tables</p>
      </div>

      {/* Format Selector Tabs */}
      <div className="flex justify-center gap-2 flex-wrap">
        {[
          { id: "table", label: "🪧 Table Standee", desc: "A5 / Acrylic" },
          { id: "counter", label: "🪟 Counter Display", desc: "Horizontal" },
          { id: "poster", label: "📄 A4 Poster", desc: "Wall Poster" },
          { id: "sticker", label: "🏷️ Box Sticker", desc: "Cake Box / Pack" },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={standeeType === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setStandeeType(tab.id)}
            className={standeeType === tab.id ? "bg-slate-900 text-white" : "text-slate-700"}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Live Standee Preview Container */}
      <div className="flex justify-center">
        <div id="printable-standee" className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl shadow-2xl border-4 border-amber-400 space-y-4 text-center relative overflow-hidden">
          {/* Header / Brand Logo */}
          <div className="flex flex-col items-center gap-2 pt-2">
            {logoUrl && (
              <img src={logoUrl} alt={businessName} className="h-12 object-contain bg-white/10 rounded-xl p-1.5 backdrop-blur-sm" />
            )}
            <h3 className="text-xl font-black tracking-tight text-white">{businessName}</h3>
            <div className="px-3 py-1 bg-amber-400 text-slate-950 font-bold text-xs rounded-full uppercase tracking-wider shadow">
              VIP Loyalty Club 👑
            </div>
          </div>

          {/* QR Code Frame */}
          <div className="p-4 bg-white rounded-2xl shadow-inner border-2 border-amber-300 inline-block mx-auto">
            {qrUrl ? (
              <img src={qrUrl} alt="Scan QR Code" className="w-48 h-48 mx-auto" />
            ) : (
              <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                QR Code Loading...
              </div>
            )}
            <p className="text-[11px] font-bold text-slate-900 mt-2 tracking-wide uppercase">
              Scan with WhatsApp Camera
            </p>
          </div>

          {/* Offer Banner */}
          <div className="p-3 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm text-center space-y-1">
            <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">★ Exclusive Member Offer ★</p>
            <p className="text-sm font-extrabold text-white">Earn Stamps & Get {rewardOffer}!</p>
            <p className="text-[10px] text-slate-300">No App Required • Takes 5 Seconds on WhatsApp</p>
          </div>

          {/* CustomerPilot Branding with Logo */}
          <div className="pt-3 border-t border-white/20 flex items-center justify-center gap-2">
            <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Powered by</span>
            <img src="/cplogo_horizontal.png" alt="CustomerPilot" className="h-5 w-auto object-contain bg-white/15 rounded px-1.5 py-0.5" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 pt-2">
        <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-6 shadow-md gap-2">
          <Printer className="w-5 h-5" /> Print Standee (PDF) 🖨️
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            alert(`Standee format (${standeeType.toUpperCase()}) prepared for printing! Click 'Print Standee' to save as PDF or print on paper.`)
          }}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
        >
          Preview Fullscreen 👁️
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// STEP 8: First Customer Test Run
// ============================================================
function Step8FirstTest({ data, setData }: any) {
  const [testing, setTesting] = useState(false)

  const runTest = () => {
    setTesting(true)
    setTimeout(() => {
      setData({
        ...data,
        testCustomerScanned: true,
        testCustomerClaimed: true,
        testStampsAwarded: 1,
        checklistItems: { ...data.checklistItems, firstTestComplete: true },
      })
      setTesting(false)
    }, 1500)
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 text-center">
      <h2 className="text-xl font-bold text-slate-900">Test Run: First Customer Scan</h2>
      <p className="text-xs text-slate-500">Simulate a customer scanning your QR at the counter</p>

      {!data.testCustomerScanned ? (
        <Button onClick={runTest} disabled={testing} className="bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-base font-bold">
          {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : "🚀 Simulate Test Scan"}
        </Button>
      ) : (
        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">Test Successful!</h3>
          <p className="text-xs text-slate-600">1 Stamp awarded & WhatsApp review invite sent to test customer</p>
        </div>
      )}
    </div>
  )
}

// ============================================================
// STEP 9: Launch Checklist
// ============================================================
function Step9Launch({ data, activationScore }: any) {
  return (
    <div className="p-6 sm:p-8 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 text-white flex items-center justify-center mx-auto text-2xl font-bold shadow-xl">
        🚀
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">CustomerPilot Setup Complete!</h2>
        <p className="text-xs text-slate-500 mt-1">Activation Score: <strong className="text-emerald-600">{activationScore}%</strong> • System Health: <strong className="text-emerald-600">98% (Ready to Go Live)</strong></p>
      </div>

      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Check className="w-4 h-4 text-emerald-600" /> Merchant Account Created ({data.email || "Registered"})
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Check className="w-4 h-4 text-emerald-600" /> WhatsApp Verified ({data.whatsappNumber || "Verified"})
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Check className="w-4 h-4 text-emerald-600" /> Google Place Linked ({data.googleBusiness || "Connected"})
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Check className="w-4 h-4 text-emerald-600" /> Counter QR Standee Ready
        </div>
      </div>

      <Button onClick={() => window.location.href = "/dashboard"} className="bg-emerald-600 hover:bg-emerald-700 text-white py-6 px-8 text-base font-bold shadow-xl">
        🚀 Launch Merchant Dashboard →
      </Button>
    </div>
  )
}

function calculateActivationScore(data: WizardData): number {
  let score = 0
  if (data.businessName) score += 15
  if (data.otpVerified) score += 25
  if (data.googleConnected) score += 25
  if (data.rewardName) score += 15
  if (data.qrGenerated) score += 10
  if (data.testCustomerScanned) score += 10
  return Math.min(score, 100)
}

function canProceedToNext(step: number, data: WizardData): boolean {
  if (step === 1) return !!(data.businessName && data.businessName.length > 2)
  if (step === 2) return data.otpVerified
  if (step === 3) return true // Google optional
  if (step === 4) return true // Logo optional
  if (step === 5) return !!(data.stampsRequired > 0 && data.rewardName?.length > 2)
  if (step === 6) return data.qrGenerated
  return true
}
