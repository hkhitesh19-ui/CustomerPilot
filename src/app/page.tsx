'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import QRCode from "qrcode"
import Link from "next/link"
import {
  Store, MessageSquare, Search, Upload, Gift, QrCode as QrIcon, Zap,
  Check, ArrowRight, ArrowLeft, Loader2, UserCheck,
  Printer, AlertCircle, CircleDot, Star, Rocket, X, Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrandLogo } from "@/components/brand-logo"

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
  whatsappNumber: "917203824012",
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
    <div className="hp-body">
      <style>{`
        :root {
          --em:#10b981;--em-d:#059669;--sky:#0ea5e9;--ind:#6366f1;--ind-d:#4f46e5;
          --slate:#0f172a;--slate6:#475569;--slate5:#64748b;--slate4:#94a3b8;--slate3:#cbd5e1;
          --bg:#fff;--line:#e2e8f0;--amber:#f59e0b;
        }
        .hp-body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: var(--slate); background: var(--bg); line-height: 1.5; min-height: 100vh; }
        .wrap { max-width: 1150px; margin: 0 auto; padding: 0 20px; }
        .grad-txt { background: linear-gradient(90deg, var(--em), var(--sky), var(--ind)); -webkit-background-clip: text; background-clip: text; color: transparent; background-size: 200% auto; animation: gs 6s ease infinite; }
        @keyframes gs { 0%,100%{background-position:0 50%} 50%{background-position:100% 50%} }
        .btn-grad { background: linear-gradient(90deg, var(--em), var(--ind)); color: #fff; box-shadow: 0 10px 25px -8px rgba(16,185,129,.5); }
        .btn-grad:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .btn-white { background: #fff; color: var(--slate); box-shadow: 0 10px 25px -8px rgba(0,0,0,.25); }
        .btn-white:hover { transform: translateY(-1px); }
        .btn-ghost { background: rgba(255,255,255,.7); color: var(--slate6); border: 1px solid var(--line); backdrop-filter: blur(8px); }
        .btn-ghost:hover { background: #fff; }
        .btn-dark { background: var(--slate); color: #fff; }
        .btn-dark:hover { background: #1e293b; }
        .arrow { transition: transform .2s; display: inline-block; }
        .btn:hover .arrow { transform: translateX(3px); }

        nav.top { position: fixed; top: 0; left: 0; right: 0; z-index: 50; display: flex; justify-content: center; padding: 14px 20px; }
        .navbox { display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 980px; background: rgba(255,255,255,.92); backdrop-filter: blur(20px); border: 1px solid rgba(226,232,240,.9); border-radius: 20px; padding: 8px 20px; box-shadow: 0 10px 30px -10px rgba(15,23,42,.12); }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--slate); }
        .logo img { max-height: 60px; width: auto; object-fit: contain; }

        .hero { position: relative; overflow: hidden; padding: 130px 0 80px; }
        .aurora { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
        .aurora b { position: absolute; display: block; border-radius: 50%; filter: blur(70px); }
        .aurora b:nth-child(1) { width: 600px; height: 600px; left: 50%; top: -100px; transform: translateX(-50%); background: rgba(16,185,129,.22); animation: fl 14s ease-in-out infinite; }
        .aurora b:nth-child(2) { width: 360px; height: 360px; right: -40px; top: 200px; background: rgba(99,102,241,.2); animation: fl 16s ease-in-out infinite 3s; }
        .aurora b:nth-child(3) { width: 340px; height: 340px; left: -60px; top: 280px; background: rgba(14,165,233,.18); animation: fl 18s ease-in-out infinite 6s; }
        @keyframes fl { 0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-25px) scale(1.08)} }
        .dots { position: absolute; inset: 0; z-index: 0; opacity: .5; background-image: radial-gradient(circle, rgba(99,102,241,.12) 1px, transparent 1px); background-size: 28px 28px; mask-image: linear-gradient(180deg, #000 60%, transparent); pointer-events: none; }
        .hero-grid { display: grid; grid-template-columns: 1fr; gap: 50px; align-items: center; position: relative; z-index: 1; }
        @media(min-width:900px){ .hero-grid { grid-template-columns: 1.1fr .9fr; } }
        
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.8); border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; font-size: 14px; color: var(--slate6); box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .dot-live { position: relative; width: 8px; height: 8px; }
        .dot-live i { position: absolute; inset: 0; border-radius: 50%; background: var(--em); }
        .dot-live i:first-child { animation: ping 1.6s cubic-bezier(0,0,.2,1) infinite; opacity: .7; }
        @keyframes ping { 75%,100%{transform:scale(2.2);opacity:0} }

        h1.hero-h { font-size: 42px; font-weight: 800; line-height: 1.06; letter-spacing: -.02em; margin-top: 24px; color: var(--slate); }
        @media(min-width:640px){ h1.hero-h { font-size: 60px; } }
        @media(min-width:900px){ h1.hero-h { font-size: 68px; } }
        .hero p.lead { font-size: 18px; color: var(--slate5); max-width: 540px; margin-top: 24px; }
        
        .btn-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
        .trust { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 30px; font-size: 14px; color: var(--slate5); }
        .trust span { display: inline-flex; align-items: center; gap: 6px; }
        .ck { color: var(--em); font-weight: 700; }

        .phone-wrap { position: relative; display: flex; justify-content: center; }
        .float-card { position: absolute; z-index: 20; background: rgba(255,255,255,.85); backdrop-filter: blur(12px); border-radius: 16px; padding: 10px 14px; box-shadow: 0 12px 30px -10px rgba(15,23,42,.2); display: flex; align-items: center; gap: 8px; animation: bob 5s ease-in-out infinite; }
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float-card .ic { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; }
        .float-card .ic.em { background: linear-gradient(135deg, #34d399, #10b981); }
        .float-card .ic.ind { background: linear-gradient(135deg, #818cf8, #6366f1); }
        .float-card small { display: block; font-size: 12px; font-weight: 800; color: var(--slate); }
        .float-card .s { font-size: 10px; color: var(--slate4); }
        .fl1 { top: 40px; left: -10px; }
        .fl2 { bottom: 80px; right: -10px; animation-delay: 1.5s; }
        @media(min-width:640px){ .fl1{left:-30px} .fl2{right:-30px} }

        .phone { width: 280px; border-radius: 40px; background: #1e293b; padding: 10px; box-shadow: 0 30px 60px -20px rgba(99,102,241,.4); }
        @media(min-width:640px){ .phone { width: 300px; } }
        .screen { border-radius: 28px; overflow: hidden; background: #0b141a; }
        .wa-head { display: flex; align-items: center; gap: 10px; background: #202c33; padding: 12px 14px; }
        .wa-av { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #34d399, #6366f1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .wa-head .nm { color: #fff; font-size: 14px; font-weight: 600; }
        .wa-head .st { color: #34d399; font-size: 10px; }
        .wa-chat { padding: 12px; min-height: 260px; display: flex; flex-direction: column; gap: 8px; }
        .bub { max-width: 85%; border-radius: 10px; padding: 8px 11px; font-size: 12px; line-height: 1.4; box-shadow: 0 1px 2px rgba(0,0,0,.1); opacity: 0; animation: pop .4s ease forwards; }
        @keyframes pop { from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .bub.in { background: #202c33; color: #e2e8f0; align-self: flex-start; border-bottom-left-radius: 2px; }
        .bub.out { background: #005c4b; color: #e2e8f0; align-self: flex-end; border-bottom-right-radius: 2px; }
        .bub .t { display: flex; justify-content: flex-end; gap: 3px; margin-top: 3px; font-size: 9px; color: #94a3b8; }
        .wa-in { display: flex; gap: 8px; align-items: center; background: #202c33; padding: 8px 10px; }
        .wa-in .field { flex: 1; background: #2a3942; border-radius: 999px; padding: 6px 12px; font-size: 12px; color: #64748b; }
        .wa-in .send { width: 28px; height: 28px; border-radius: 50%; background: #00a884; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; }

        .strip { border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; background: rgba(248,250,252,.5); padding: 36px 0; overflow: hidden; }
        .strip p { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .1em; color: var(--slate4); text-align: center; margin-bottom: 24px; }
        .marquee { display: flex; gap: 48px; width: max-content; animation: mq 28s linear infinite; }
        .marquee:hover { animation-play-state: paused; }
        @keyframes mq { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .marquee .lg { display: flex; align-items: center; gap: 8px; color: var(--slate4); font-size: 16px; font-weight: 700; white-space: nowrap; }

        .feat { padding: 90px 0; }
        .sec-head { text-align: center; max-width: 640px; margin: 0 auto; }
        .eyebrow { display: inline-block; background: #ecfdf5; color: var(--em-d); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; padding: 5px 12px; border-radius: 999px; border: 1px solid #d1fae5; }
        h2.sec-h { font-size: 30px; font-weight: 800; letter-spacing: -.02em; margin-top: 16px; color: var(--slate); }
        @media(min-width:640px){ h2.sec-h { font-size: 46px; } }
        .sec-sub { font-size: 18px; color: var(--slate5); margin-top: 16px; }
        .feat-grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 56px; }
        @media(min-width:760px){ .feat-grid { grid-template-columns: repeat(3, 1fr); } }
        .fcard { background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 28px; transition: .25s; display: flex; flex-direction: column; }
        .fcard:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -16px rgba(15,23,42,.12); border-color: #cbd5e1; }
        .fcard .ico { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 26px; color: #fff; box-shadow: 0 8px 16px -6px rgba(0,0,0,.2); }
        .ico.amber { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
        .ico.em { background: linear-gradient(135deg, #34d399, #10b981); }
        .ico.ind { background: linear-gradient(135deg, #60a5fa, #6366f1); }
        .fcard h3 { font-size: 21px; font-weight: 800; margin-top: 20px; color: var(--slate); }
        .fcard p { color: var(--slate5); margin-top: 14px; font-size: 15px; }
        .fcard ul { list-style: none; margin-top: 16px; }
        .fcard li { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--slate6); margin-bottom: 8px; }
        .fcard li .c { color: var(--em); font-weight: 700; }
        .stamp-row { display: flex; gap: 8px; margin-top: 18px; }
        .stamp-row .s { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #fff; background: linear-gradient(135deg, #fbbf24, #f59e0b); }
        .stars { display: flex; gap: 3px; margin-top: 16px; align-items: center; }
        .stars small { margin-left: 8px; background: #ecfdf5; color: var(--em-d); padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .reply-prev { margin-top: 16px; background: #f8fafc; border-radius: 12px; padding: 10px 12px; font-size: 13px; color: var(--slate6); }

        .how { background: var(--slate); padding: 90px 0; color: #fff; }
        .how .eyebrow { background: rgba(255,255,255,.06); color: #34d399; border-color: rgba(255,255,255,.1); }
        .steps { display: grid; grid-template-columns: 1fr; gap: 32px; margin-top: 60px; }
        @media(min-width:760px){ .steps { grid-template-columns: repeat(3, 1fr); } }
        .step { text-align: center; }
        .step .num { width: 56px; height: 56px; border-radius: 18px; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; box-shadow: 0 8px 20px -4px rgba(0,0,0,.3); }
        .step .tag { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #64748b; margin-top: 20px; }
        .step h3 { font-size: 18px; font-weight: 700; margin-top: 6px; }
        .step p { font-size: 14px; color: #94a3b8; margin-top: 8px; }

        .stats { padding: 80px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; text-align: center; }
        @media(min-width:760px){ .stats-grid { grid-template-columns: repeat(4, 1fr); } }
        .stat .v { font-size: 38px; font-weight: 800; background: linear-gradient(90deg, var(--em), var(--ind)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        @media(min-width:760px){ .stat .v { font-size: 46px; } }
        .stat .l { font-size: 14px; color: var(--slate5); margin-top: 8px; }

        .testi { background: #f8fafc; padding: 90px 0; }
        .testi .eyebrow { background: #fffbeb; color: #b45309; border-color: #fef3c7; }
        .tgrid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 56px; }
        @media(min-width:760px){ .tgrid { grid-template-columns: repeat(3, 1fr); } }
        .tcard { background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 28px; transition: .25s; }
        .tcard:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -16px rgba(15,23,42,.1); }
        .ttop { display: flex; justify-content: space-between; align-items: center; }
        .qmark { font-size: 30px; color: #a7f3d0; }
        .metric { background: #ecfdf5; color: var(--em-d); padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .tstars { margin-top: 10px; color: #f59e0b; }
        .tcard blockquote { font-size: 15px; color: #475569; margin-top: 14px; line-height: 1.6; }
        .tauthor { display: flex; align-items: center; gap: 12px; border-top: 1px solid #f1f5f9; margin-top: 22px; padding-top: 18px; }
        .tauthor .a { width: 40px; height: 40px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; }
        .tauthor .n { font-size: 14px; font-weight: 700; }
        .tauthor .r { font-size: 12px; color: var(--slate4); }

        .price { padding: 90px 0; }
        .price .eyebrow { background: #f1f5f9; color: var(--slate6); }
        .pgrid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 56px; align-items: stretch; }
        @media(min-width:760px){ .pgrid { grid-template-columns: repeat(3, 1fr); } }
        .pcard { background: #fff; border: 1px solid var(--line); border-radius: 24px; padding: 32px; display: flex; flex-direction: column; position: relative; }
        .pcard.hl { background: var(--slate); color: #fff; border: none; box-shadow: 0 30px 60px -20px rgba(15,23,42,.4); }
        .pcard.hl .tag { color: #94a3b8; }
        .pbadge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: linear-gradient(90deg, var(--em), var(--ind)); color: #fff; padding: 5px 16px; border-radius: 999px; font-size: 12px; font-weight: 700; box-shadow: 0 8px 16px -4px rgba(99,102,241,.4); }
        .pcard h3 { font-size: 19px; font-weight: 800; }
        .pcard .tag { font-size: 14px; color: var(--slate5); margin-top: 4px; }
        .pp { display: flex; align-items: baseline; gap: 4px; margin-top: 22px; }
        .pp .amt { font-size: 40px; font-weight: 800; }
        .pp .per { color: var(--slate4); }
        .pcard .btn { width: 100%; margin-top: 22px; }
        .pfeat { list-style: none; margin-top: 26px; }
        .pfeat li { display: flex; gap: 10px; font-size: 14px; margin-bottom: 12px; }
        .pcard:not(.hl) .pfeat li { color: var(--slate6); }
        .pcard.hl .pfeat li { color: #cbd5e1; }
        .pfeat .c { color: var(--em); flex-shrink: 0; font-weight: 700; }

        .cta-sec { padding: 0 20px 90px; }
        .cta { position: relative; overflow: hidden; background: var(--slate); border-radius: 40px; padding: 60px 30px; text-align: center; color: #fff; }
        @media(min-width:640px){ .cta { padding: 80px 40px; } }
        .cta .aurora2 { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .cta .aurora2 b { position: absolute; border-radius: 50%; filter: blur(70px); }
        .cta .aurora2 b:nth-child(1) { width: 300px; height: 300px; left: 15%; top: -80px; background: rgba(16,185,129,.35); animation: fl 16s infinite; }
        .cta .aurora2 b:nth-child(2) { width: 300px; height: 300px; right: 15%; bottom: -80px; background: rgba(99,102,241,.35); animation: fl 16s infinite 5s; }
        .cta .ct { position: relative; z-index: 1; }
        .cta h2 { font-size: 32px; font-weight: 800; letter-spacing: -.02em; }
        @media(min-width:640px){ .cta h2 { font-size: 46px; } }
        .cta p { color: #94a3b8; font-size: 18px; margin: 16px auto 0; max-width: 420px; }
        .cta .btn-row { margin-top: 32px; justify-content: center; }

        footer { border-top: 1px solid var(--line); background: #f8fafc; padding: 56px 0 30px; }
        .fgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
        @media(min-width:760px){ .fgrid { grid-template-columns: 2fr 1fr 1fr 1fr; } }
        .fbrand p { color: var(--slate5); font-size: 14px; margin-top: 16px; max-width: 300px; }
        .frate { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 6px 12px; margin-top: 16px; font-size: 14px; font-weight: 600; color: var(--slate6); }
        footer h4 { font-size: 14px; font-weight: 800; color: var(--slate); }
        footer ul { list-style: none; margin-top: 12px; }
        footer ul li { margin-bottom: 8px; }
        footer ul a { font-size: 14px; color: var(--slate5); text-decoration: none; }
        footer ul a:hover { color: var(--em-d); }
        .fbottom { border-top: 1px solid var(--line); margin-top: 40px; padding-top: 24px; text-align: center; color: var(--slate4); font-size: 14px; }
      `}</style>

      {/* ============ NAVBAR ============ */}
      <nav className="top">
        <div className="navbox">
          <Link href="/" className="no-underline flex-shrink-0">
            <BrandLogo size="md" showTagline={true} />
          </Link>
          <div className="hidden sm:flex gap-1">
            <a href="#features" className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">Features</a>
            <a href="#how" className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">How it works</a>
            <a href="#pricing" className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">Pricing</a>
          </div>
          <div className="flex gap-2 items-center">
            <Link href="/login" className="btn btn-ghost text-xs sm:text-sm py-2 px-3">Sign in</Link>
            <Link href="/signup" className="btn btn-dark text-xs sm:text-sm py-2 px-4">Start free →</Link>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="aurora"><b></b><b></b><b></b></div>
        <div className="dots"></div>
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <span className="badge">
                <span className="dot-live"><i></i><i></i></span> Trusted by 1,200+ local shops across India · 5-day free trial
              </span>
              <h1 className="hero-h">Turn every walk-in<br/><span className="grad-txt">into a lifetime customer.</span></h1>
              <p className="lead">customerPilot brings your customers back with loyalty rewards, collects 5-star Google reviews, and replies to every review — all from one simple software. You run your shop. <strong style={{ color: 'var(--slate)' }}>We bring them back.</strong></p>
              <div className="btn-row">
                <Link href="/signup" className="btn btn-grad py-4 px-7 text-base font-bold">Start free — no card <span className="arrow">→</span></Link>
                <a href="#how" className="btn btn-ghost py-4 px-6 text-base font-bold">See how it works</a>
              </div>
              <div className="trust">
                <span><span className="ck">✓</span> No credit card required</span>
                <span><span className="ck">✓</span> Setup in 5 minutes</span>
                <span><span className="ck">✓</span> One simple software</span>
              </div>
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
        <p>Powering reputation for India's best local businesses</p>
        <div className="marquee">
          <span className="lg">★ Sunrise Dental</span><span className="lg">★ Urban Brew</span><span className="lg">★ Glow Salon</span><span className="lg">★ FitZone</span><span className="lg">★ Apex Auto</span><span className="lg">★ GreenLeaf</span>
          <span className="lg">★ Sunrise Dental</span><span className="lg">★ Urban Brew</span><span className="lg">★ Glow Salon</span><span className="lg">★ FitZone</span><span className="lg">★ Apex Auto</span><span className="lg">★ GreenLeaf</span>
        </div>
      </div>

      {/* ============ FEATURES ============ */}
      <section className="feat" id="features">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">One simple software</span>
            <h2 className="sec-h">Three things your shop needs.<br/><span style={{ color: '#cbd5e1' }}>That's it.</span></h2>
            <p className="sec-sub">No complicated setup. No technical work. Just bring customers back, collect reviews, and never miss a reply.</p>
          </div>
          <div className="feat-grid">
            <div className="fcard">
              <div className="ico amber">🏆</div>
              <h3>Loyalty Rewards</h3>
              <p>Turn every walk-in into a repeat customer. Customers scan a QR, collect stamps, and come back for their free reward.</p>
              <ul>
                <li><span className="c">✓</span> QR scan to collect stamps</li>
                <li><span className="c">✓</span> 5 stamps = free reward</li>
                <li><span className="c">✓</span> Customers return again & again</li>
              </ul>
              <div className="stamp-row">
                <span className="s">★</span><span className="s">★</span><span className="s">★</span><span className="s">★</span><span className="s">★</span>
              </div>
            </div>

            <div className="fcard">
              <div className="ico em">⭐</div>
              <h3>Google Reviews</h3>
              <p>After a purchase, your customer gets a gentle WhatsApp reminder to share their experience and earn bonus stamps.</p>
              <ul>
                <li><span className="c">✓</span> Automatic review request</li>
                <li><span className="c">✓</span> Photo upload encouraged</li>
                <li><span className="c">✓</span> +2 bonus stamps for reviews</li>
              </ul>
              <div className="stars"><span style={{ color: '#f59e0b' }}>★★★★★</span><small>+412 this month</small></div>
            </div>

            <div className="fcard">
              <div className="ico ind">💬</div>
              <h3>1-Click GoogleReview AutoReply</h3>
              <p>Gemini AI drafts personalized owner replies for every review. Store owners review & publish to Google Maps in 1-Click!</p>
              <ul>
                <li><span className="c">✓</span> Gemini AI drafts generated in 1 second</li>
                <li><span className="c">✓</span> 1-Click Copy & Post on Google Maps</li>
                <li><span className="c">✓</span> Dead-Letter Queue quota safety</li>
              </ul>
              <div className="reply-prev"><strong style={{ color: 'var(--slate)' }}>1-Click AutoReply:</strong> Thank you so much for your kind words! 💜 See you again soon.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="how" id="how">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">3 simple steps</span>
            <h2 className="sec-h">It's this simple.</h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="num" style={{ background: 'linear-gradient(135deg,#34d399,#10b981)' }}>🛒</div>
              <div className="tag">Step 1</div>
              <h3>Customer purchases</h3>
              <p>A customer buys from your shop. You ask them to scan the QR at the counter.</p>
            </div>
            <div className="step">
              <div className="num" style={{ background: 'linear-gradient(135deg,#60a5fa,#0ea5e9)' }}>📱</div>
              <div className="tag">Step 2</div>
              <h3>They scan the QR</h3>
              <p>customerPilot sends a friendly WhatsApp message, collects the stamp, and a review later.</p>
            </div>
            <div className="step">
              <div className="num" style={{ background: 'linear-gradient(135deg,#818cf8,#6366f1)' }}>🔄</div>
              <div className="tag">Step 3</div>
              <h3>They come back</h3>
              <p>Stamps, rewards, and reminders keep your customers returning — again and again.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="stats">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat"><div className="v">4.8L+</div><div className="l">Reviews collected</div></div>
            <div className="stat"><div className="v">1,200+</div><div className="l">Active merchants</div></div>
            <div className="stat"><div className="v">34%</div><div className="l">Avg. conversion</div></div>
            <div className="stat"><div className="v">98.6%</div><div className="l">Delivery rate</div></div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="testi">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">⭐ 4.9 from 1,200+ merchants</span>
            <h2 className="sec-h">Results shops can feel.</h2>
          </div>
          <div className="tgrid">
            <div className="tcard">
              <div className="ttop"><span className="qmark">"</span><span className="metric">+925% reviews</span></div>
              <div className="tstars">★★★★★</div>
              <blockquote>40 → 410 Google reviews in 3 months. customerPilot keeps customers coming back with stamps & rewards. My shop is busier than ever.</blockquote>
              <div className="tauthor"><div className="a" style={{ background: 'linear-gradient(135deg,#fb7185,#ec4899)' }}>AM</div><div><div className="n">Dr. Anita Mehta</div><div className="r">Owner, Sunrise Dental</div></div></div>
            </div>
            <div className="tcard">
              <div className="ttop"><span className="qmark">"</span><span className="metric">Weekly returns</span></div>
              <div className="tstars">★★★★★</div>
              <blockquote>Customers love scanning the QR. The loyalty stamps bring them back every week. It feels like one simple tool — not three.</blockquote>
              <div className="tauthor"><div className="a" style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>MR</div><div><div className="n">Marco Rossi</div><div className="r">Founder, Urban Brew Café</div></div></div>
            </div>
            <div className="tcard">
              <div className="ttop"><span className="qmark">"</span><span className="metric">5-min setup</span></div>
              <div className="tstars">★★★★★</div>
              <blockquote>Every Google review gets a reply instantly. My customers feel heard, and I never miss one anymore. Setup took 5 minutes.</blockquote>
              <div className="tauthor"><div className="a" style={{ background: 'linear-gradient(135deg,#c084fc,#8b5cf6)' }}>SL</div><div><div className="n">Sara Lin</div><div className="r">Manager, Glow Salon</div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING REDIRECT BANNER ============ */}
      <section className="price" id="pricing">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5' }}>
              ⚡ CustomerPilot Pricing & Plans
            </span>
            <h2 className="sec-h">Simple Plans That Scale With You.</h2>
            <p className="sec-sub">100% of AI Features Included. Pay strictly based on your VIP Member Capacity.</p>
          </div>
          <div style={{ textAlign: 'center', marginTop: '36px', display: 'flex', justifyContent: 'center' }}>
            <Link href="/pricing" className="btn btn-grad text-base py-4 px-8 font-bold" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span>View Full Pricing & 100 Founding Merchant Program ➔</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="cta-sec">
        <div className="wrap">
          <div className="cta">
            <div className="aurora2"><b></b><b></b></div>
            <div className="ct">
              <h2>Your next 100 five-star reviews<br/><span className="grad-txt">are one click away.</span></h2>
              <p>Join 1,200+ merchants automating their reputation. First 50 asks are free.</p>
              <div className="btn-row">
                <button onClick={openWizard} className="btn btn-white text-base py-4 px-7 font-bold">Start free — no card <span className="arrow">→</span></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="wrap">
          <div className="fgrid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="fbrand" style={{ gridColumn: 'span 2' }}>
              <Link href="/" className="no-underline block mb-3">
                <BrandLogo size="lg" showTagline={true} />
              </Link>
              <p>Turn every walk-in into a lifetime customer — with loyalty rewards, Google reviews, and replies on autopilot.</p>
              <div className="frate"><span style={{ color: '#f59e0b' }}>★</span> 4.9 · 1,200+ merchants</div>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><Link href="/pricing">Pricing & Plans</Link></li>
                <li><Link href="/features/whatsapp-stamp-card">WhatsApp Stamp Cards</Link></li>
                <li><Link href="/features/google-review-automation">Google Review AI</Link></li>
                <li><Link href="/compare/vs-traditional-pos">vs Traditional POS</Link></li>
                <li><Link href="/marketing">Platform Overview</Link></li>
              </ul>
            </div>
            <div>
              <h4>Industries</h4>
              <ul>
                <li><Link href="/bakery-loyalty">Bakery Loyalty</Link></li>
                <li><Link href="/cafe-loyalty">Cafe Stamp Cards</Link></li>
                <li><Link href="/restaurant-loyalty">Restaurant Retention</Link></li>
                <li><Link href="/salon-loyalty">Salon & Spa VIP</Link></li>
              </ul>
            </div>
            <div>
              <h4>Legal & Trust</h4>
              <ul>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/security">Security & Architecture</Link></li>
                <li><Link href="/contact">Contact Support</Link></li>
                <li><Link href="/help">Help & Documentation</Link></li>
              </ul>
            </div>
          </div>
          <div className="fbottom">© 2026 CustomerPilot · Made with care in India 🇮🇳</div>
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
                    <p className="text-xs text-slate-500">7-Day Free Merchant Trial Setup</p>
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
        const phone = (data.whatsappNumber || "917203824012").replace(/\D/g, "")
        const businessName = data.businessName || "Cake Connection"
        const textMessage = `🎉 Hi ${businessName}! I want to join your VIP Club & collect my first loyalty stamp!`
        
        // Official WhatsApp Deep Link format (opens WhatsApp App directly on mobile)
        const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(textMessage)}`
        setWaLink(targetUrl)

        const qr = await QRCode.toDataURL(targetUrl, { width: 350, margin: 2 })
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
          <p className="font-extrabold text-slate-900 text-lg">{data.businessName || "Cake Connection"}</p>
          
          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
            <img src={data.qrDataUrl} alt="WhatsApp QR Code" className="w-52 h-52 mx-auto" />
          </div>

          <Badge className="bg-emerald-600 text-white py-1 px-3 text-xs font-bold gap-1">
            💬 Opens WhatsApp App Directly ★
          </Badge>

          {/* Direct Link & Test Options */}
          <div className="pt-2 space-y-2 text-left">
            <p className="text-[11px] font-semibold text-slate-600">WhatsApp Deep Link (Instant Mobile Scan):</p>
            <div className="p-2 bg-slate-100 rounded-lg text-[11px] font-mono text-slate-700 break-all border border-slate-200">
              {waLink}
            </div>
            
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 font-semibold"
                onClick={() => window.open(waLink, "_blank")}
              >
                Open WhatsApp 💬
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5"
                onClick={() => {
                  navigator.clipboard.writeText(waLink)
                  alert("WhatsApp Link copied to clipboard!")
                }}
              >
                Copy Link 📋
              </Button>
            </div>
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

          {/* Footer Badge */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Powered by CustomerPilot • Official WhatsApp VIP Engine</span>
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
