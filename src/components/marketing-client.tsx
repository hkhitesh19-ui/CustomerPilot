"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  Zap, QrCode, MessageSquare, Crown, Gift, Star, TrendingUp,
  ArrowRight, Play, Check, Calculator, Sparkles, Menu, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function MarketingClient() {
  const [showMenu, setShowMenu] = useState(false)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/cplogo.png" alt="CustomerPilot" className="h-10 w-auto object-contain transition-transform hover:scale-105" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm text-stone-600 hover:text-stone-900">How it works</a>
            <a href="#features" className="text-sm text-stone-600 hover:text-stone-900">Features</a>
            <a href="#roi" className="text-sm text-stone-600 hover:text-stone-900">ROI Calculator</a>
            <a href="/pricing" className="text-sm text-stone-600 hover:text-stone-900">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden md:flex">
              <a href="/login">Login</a>
            </Button>
            <Button size="sm" asChild className="bg-stone-900 text-white hover:bg-stone-800">
              <a href="/signup">Start Free Trial</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 border border-yellow-200 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-800">India's #1 Customer Retention Platform for Local Businesses</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-stone-900 leading-tight tracking-tight"
          >
            Turn Every Walk-in
            <br />
            Into a <span className="bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">Lifetime Customer</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-stone-600 max-w-2xl mx-auto"
          >
            Customer scans QR. You tap. Reward delivered in 5 seconds.
            No POS replacement. No GST software. Just pure customer love.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild className="bg-stone-900 text-white hover:bg-stone-800 px-8 h-14 text-base">
              <a href="/signup">
                Start 14-Day Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8 h-14 text-base border-stone-300">
              <a href="/pricing">
                <Play className="w-4 h-4 mr-2" />
                View Transparent Pricing
              </a>
            </Button>
          </motion.div>

          {/* Interactive Customer Journey Flow */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-16"
          >
            <CustomerJourneyFlow />
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "15,000+", label: "Businesses" },
              { value: "2.5M+", label: "Rewards Delivered" },
              { value: "980K+", label: "Google Reviews" },
              { value: "92%", label: "Repeat Rate" },
            ].map((stat, i) => (
              <AnimatedCounter key={i} {...stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-stone-900 mb-4">
            5 Seconds. That's It.
          </h2>
          <p className="text-center text-stone-500 mb-16 max-w-2xl mx-auto">
            The fastest customer retention flow in the world. No apps to download. No forms to fill.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: QrCode, title: "Customer Scans QR", desc: "At your counter. WhatsApp opens instantly.", color: "from-blue-400 to-blue-600" },
              { icon: MessageSquare, title: "Taps 'Claim Reward'", desc: "One tap. No typing. No password.", color: "from-emerald-400 to-emerald-600" },
              { icon: Zap, title: "You Tap Their Card", desc: "They appear in your Live Queue. You tap.", color: "from-yellow-400 to-amber-500" },
              { icon: Gift, title: "Reward Delivered", desc: "Stamps awarded. WhatsApp sent. Done.", color: "from-purple-400 to-purple-600" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-xs font-bold text-stone-400 mb-1">STEP {i + 1}</div>
                <h3 className="font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-sm text-stone-500">{step.desc}</p>
                {i < 3 && (
                  <ArrowRight className="hidden md:block w-5 h-5 text-stone-300 absolute top-6 -right-4" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Carousel */}
      <section className="py-24 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">Built for Every Local Business</h2>
          <p className="text-center text-stone-400 mb-16">Works with your existing billing. Cash, UPI, Card, or No Bill.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Bakery", link: "/bakery-loyalty", icon: "🎂" },
              { name: "Cafe", link: "/cafe-loyalty", icon: "☕" },
              { name: "Restaurant", link: "/restaurant-loyalty", icon: "🍽️" },
              { name: "Salon", link: "/salon-loyalty", icon: "💇" },
              { name: "Gym", link: "/signup", icon: "💪" },
              { name: "Florist", link: "/signup", icon: "🌸" },
              { name: "Clinic", link: "/signup", icon: "🏥" },
              { name: "Spa", link: "/salon-loyalty", icon: "💆" },
            ].map((ind, i) => (
              <a
                key={i}
                href={ind.link}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-colors text-center block"
              >
                <div className="text-3xl mb-2">{ind.icon}</div>
                <div className="font-medium">{ind.name}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-stone-900 mb-4">Everything You Need to Keep Them Coming Back</h2>
          <p className="text-center text-stone-500 mb-16">3 powerful engines working together automatically.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Retention Engine", desc: "Stamps, VIP Tiers, Win-back ladder, Birthday rewards. Never lose a customer silently.", color: "bg-yellow-100" },
              { icon: Star, title: "Reputation Engine", desc: "AI-drafted Google Reviews after every redemption. Photo bonuses. Reputation score tracking.", color: "bg-blue-100" },
              { icon: Sparkles, title: "AI Marketing", desc: "Smart campaigns, AI insights, personalized offers. Your automated marketing team.", color: "bg-purple-100" },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 rounded-xl ${feat.color} flex items-center justify-center mb-4`}>
                      <feat.icon className="w-6 h-6 text-stone-700" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2">{feat.title}</h3>
                    <p className="text-stone-500">{feat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <ROICalculator />

      {/* Pricing V2.0 Banner */}
      <section id="pricing" className="py-20 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-xs font-bold">
            ⚡ Transparent Customer-Capacity Pricing V2.0
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            One Product. All Features Included. <br />
            <span className="text-yellow-400">Zero Lock Frustration.</span>
          </h2>
          <p className="text-stone-300 text-sm md:text-base max-w-2xl mx-auto">
            Every merchant gets 100% of Loyalty Stamps, AI Google Review Engine & Auto-Reply. Pay strictly based on your VIP Club Member Capacity.
          </p>
          <div className="pt-2">
            <Button asChild size="lg" className="bg-yellow-400 text-stone-900 hover:bg-yellow-300 font-extrabold text-base px-8 h-14 shadow-xl">
              <a href="/pricing">
                View Full Pricing & 100 Founding Merchant Program ➔
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-stone-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Turn Walk-ins into Regulars?</h2>
          <p className="text-stone-400 mb-8">14 days free. No credit card. Setup in 2 minutes.</p>
          <Button size="lg" asChild className="bg-yellow-400 text-stone-900 hover:bg-yellow-300 px-8 h-14 text-base">
            <a href="/signup">
              Start Your Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-stone-950 text-stone-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                <Zap className="w-4 h-4 text-stone-900" />
              </div>
              <span className="font-bold text-white">CustomerPilot</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms" className="hover:text-white">Terms of Service</a>
              <a href="/security" className="hover:text-white">Security</a>
              <a href="/contact" className="hover:text-white">Contact Us</a>
            </div>
            <p className="text-sm">© 2026 CustomerPilot. Made in India. For India.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ============================================================
// Animated Customer Journey Flow
// ============================================================
function CustomerJourneyFlow() {
  const [step, setStep] = useState(0)
  const steps = [
    { icon: QrCode, label: "Customer Scans", color: "bg-blue-500" },
    { icon: MessageSquare, label: "WhatsApp Opens", color: "bg-emerald-500" },
    { icon: Zap, label: "Merchant Taps", color: "bg-yellow-500" },
    { icon: Gift, label: "Reward!", color: "bg-purple-500" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % (steps.length + 1))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2 md:gap-4">
          <motion.div
            animate={{
              scale: step === i ? 1.1 : 1,
              opacity: step >= i ? 1 : 0.3,
            }}
            className={`flex flex-col items-center gap-2`}
          >
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${s.color} flex items-center justify-center shadow-lg`}>
              <s.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <span className="text-xs text-stone-600 font-medium hidden md:block">{s.label}</span>
          </motion.div>
          {i < steps.length - 1 && (
            <ArrowRight className={`w-4 h-4 md:w-6 md:h-6 ${step > i ? "text-stone-400" : "text-stone-200"}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================
// Animated Counter
// ============================================================
function AnimatedCounter({ value, label, delay }: { value: string; label: string; delay: number }) {
  const [displayValue, setDisplayValue] = useState("0")
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const numeric = parseFloat(value.replace(/[^0-9.]/g, ""))
        const suffix = value.replace(/[0-9.]/g, "")
        let current = 0
        const duration = 1500
        const step = numeric / (duration / 16)
        const timer = setInterval(() => {
          current += step
          if (current >= numeric) {
            current = numeric
            clearInterval(timer)
          }
          if (numeric >= 1000000) {
            setDisplayValue((current / 1000000).toFixed(1) + "M" + suffix)
          } else if (numeric >= 1000) {
            setDisplayValue(Math.floor(current / 1000) + "K" + suffix)
          } else {
            setDisplayValue(Math.floor(current) + suffix)
          }
        }, 16)
      }
    }, { threshold: 0.5 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="text-3xl md:text-4xl font-bold text-stone-900">{displayValue}</div>
      <div className="text-sm text-stone-500 mt-1">{label}</div>
    </motion.div>
  )
}

// ============================================================
// ROI Calculator
// ============================================================
function ROICalculator() {
  const [customers, setCustomers] = useState("200")
  const [bill, setBill] = useState("350")
  const [repeat, setRepeat] = useState("30")

  const calc = () => {
    const c = parseInt(customers) || 0
    const b = parseInt(bill) || 0
    const r = parseInt(repeat) || 0
    const monthlyRevenue = c * b * (r / 100) * 2 // assume 2 visits per repeat customer
    const planCost = 2499
    const roi = monthlyRevenue > 0 ? ((monthlyRevenue - planCost) / planCost * 100).toFixed(0) : 0
    return { monthlyRevenue, roi }
  }

  const { monthlyRevenue, roi } = calc()

  return (
    <section id="roi" className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-stone-900 mb-4">Calculate Your ROI</h2>
        <p className="text-center text-stone-500 mb-12">See how much CustomerPilot can add to your monthly revenue.</p>
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-stone-700">Customers per month</label>
                  <Input type="number" value={customers} onChange={(e) => setCustomers(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Average bill amount (₹)</label>
                  <Input type="number" value={bill} onChange={(e) => setBill(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700">Current repeat rate (%)</label>
                  <Input type="number" value={repeat} onChange={(e) => setRepeat(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 flex flex-col justify-center">
                <div className="text-sm text-stone-600 mb-2">Potential Monthly Revenue Increase</div>
                <div className="text-4xl font-bold text-stone-900 mb-4">
                  ₹{monthlyRevenue.toLocaleString("en-IN")}
                </div>
                <div className="text-sm text-stone-600 mb-2">Expected ROI on CustomerPilot</div>
                <div className="text-3xl font-bold text-emerald-600">{roi}%</div>
                <div className="mt-4 flex items-center gap-2 text-xs text-stone-500">
                  <Calculator className="w-3 h-3" />
                  Based on 2x repeat rate increase with CustomerPilot
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
