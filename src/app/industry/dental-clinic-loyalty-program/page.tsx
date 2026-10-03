import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"
import { CheckCircle2, ArrowRight, Star, Bell } from "lucide-react"

export const metadata: Metadata = {
  title: "Patient Retention Program for Dental Clinics | CustomerPilot",
  description:
    "CustomerPilot's WhatsApp-based patient retention system for dental clinics. Automated appointment reminders, digital loyalty rewards for regular checkups, and Google review collection. Boost dental clinic reputation and patient recall rate.",
  keywords: [
    "dental clinic patient retention",
    "WhatsApp appointment reminder dental",
    "dental loyalty program India",
    "patient recall system dental clinic",
    "Google reviews for dental clinic",
    "dental practice retention software",
    "dental appointment reminder WhatsApp India",
    "patient follow-up system dental"
  ],
  alternates: { canonical: "https://customerpilot.in/industry/dental-clinic-loyalty-program" },
  openGraph: {
    title: "Patient Retention Program for Dental Clinics | CustomerPilot",
    description: "Automated WhatsApp appointment reminders, patient recall, and Google review collection for dental clinics. Start free.",
    url: "https://customerpilot.in/industry/dental-clinic-loyalty-program"
  }
}

const SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "CustomerPilot Dental Clinic Patient Retention",
      "operatingSystem": "All (WhatsApp-based)",
      "applicationCategory": "BusinessApplication",
      "description": "WhatsApp-based patient retention and recall system for dental clinics. Sends automated 6-month checkup reminders, treatment follow-up messages, and Google review collection to boost clinic reputation.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does CustomerPilot help dental clinics retain patients?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CustomerPilot sends automated WhatsApp reminders for 6-month checkups, post-treatment follow-up messages, and medication reminders. When a patient completes a visit, they receive a prompt to leave a Google review — the AI drafts the review text automatically. This combination drives 40% higher patient recall rates and 3x more 5-star Google reviews for dental clinics."
          }
        },
        {
          "@type": "Question",
          "name": "Dental clinic ke liye patient retention system kaise kaam karta hai?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "CustomerPilot dental clinic ke patients ko automatically WhatsApp par 6-month checkup reminder, treatment follow-up message, aur medication reminder bhejta hai. Jab patient apna appointment complete karta hai, use automatically Google review likhne ka prompt aata hai jisme AI pehle se review text draft kar deta hai — patient sirf 1 tap mein Google Maps par submit kar sakta hai."
          }
        }
      ]
    }
  ]
}

export default function DentalClinicLoyaltyProgramPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <BreadcrumbJsonLd items={[
        { name: "Home", url: "https://customerpilot.in" },
        { name: "Industries", url: "https://customerpilot.in/industry" },
        { name: "Dental Clinic Patient Retention", url: "https://customerpilot.in/industry/dental-clinic-loyalty-program" }
      ]} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-black text-lg text-slate-900">CustomerPilot</Link>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">← Home</Link>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl">
                <Link href="/signup">Start Free Trial →</Link>
              </Button>
            </div>
          </div>
        </header>
        <main>
          <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200/80 bg-gradient-to-b from-blue-50/60 to-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <span className="inline-flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200">
                🦷 Dental Clinic Patient Retention Program
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                Bring Dental Patients Back for Follow-Up with <span className="text-blue-600">WhatsApp Reminders & Loyalty</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Stop losing dental patients after their first visit. CustomerPilot sends automated 6-month checkup reminders, post-treatment follow-ups, and Google review prompts — all via WhatsApp. Build a loyal patient base that returns regularly and refers friends and family to your clinic.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-8 py-4 rounded-xl shadow-lg">
                  <Link href="/signup">Start Free 3-Day Trial <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-800 font-bold text-sm px-6 py-4 rounded-xl">
                  <Link href="/whatsapp-digital-loyalty-card">See How It Works</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-black text-slate-900 text-center mb-10">Why Dental Clinics Choose CustomerPilot</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-slate-900">Automated 6-Month Checkup Reminders</h3>
                <p className="text-xs text-slate-600 leading-relaxed">CustomerPilot automatically sends WhatsApp reminders 6 months after every patient visit: &quot;Hi [Name], it&apos;s time for your routine dental checkup at [Clinic Name]. Book your appointment this week and get a free dental polishing session.&quot; This single automation increases patient recall rates by 40%.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <Star className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-slate-900">Auto-Collect 5-Star Google Reviews</h3>
                <p className="text-xs text-slate-600 leading-relaxed">After each appointment, satisfied patients receive a WhatsApp prompt with an AI-drafted Google review mentioning painless treatment, professional staff, and clinic hygiene. One tap publishes to Google Maps — boosting your clinic in local dental searches and bringing in new patients organically.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Post-Treatment Follow-Up & Care</h3>
                <p className="text-xs text-slate-600 leading-relaxed">After root canals, extractions, or braces adjustments, CustomerPilot sends automated WhatsApp care instructions and 24-hour follow-up messages. &quot;How are you feeling after yesterday&apos;s procedure? Remember to avoid hard foods for 48 hours. Call us if you have any discomfort.&quot; This builds patient trust and loyalty.</p>
              </div>
            </div>
          </section>

          <section className="py-12 bg-slate-50/70 border-t border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <h2 className="text-2xl font-black text-slate-900 text-center mb-10">How Dental Patient Retention Works in 3 Steps</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                {[
                  { step: 1, title: "Patient Visits, Profile Created", desc: "After a patient's first visit, your reception team adds them to CustomerPilot via a simple QR scan or phone number entry. The patient receives a welcome WhatsApp message confirming their appointment and clinic details. Their 6-month checkup reminder is automatically scheduled." },
                  { step: 2, title: "Automated Reminders & Follow-Ups Run", desc: "CustomerPilot runs on autopilot: 6-month checkup reminders fire automatically, post-treatment care instructions are sent within hours, and loyalty reward stamps (e.g., 5 visits = free checkup) accumulate in the patient's WhatsApp — all without manual work from your reception staff." },
                  { step: 3, title: "Reviews Collected, Reputation Grows", desc: "After each satisfied visit, patients receive an AI-drafted Google review prompt. As 5-star reviews accumulate, your clinic rises in Google Maps local search results. New patients searching 'dentist near me' find your clinic with a 4.8+ rating and book appointments confidently." }
                ].map(({ step, title, desc }) => (
                  <div key={step} className="space-y-3 p-6 bg-white rounded-2xl border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black text-lg flex items-center justify-center mx-auto">{step}</div>
                    <h3 className="font-bold text-slate-900">{title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "How does CustomerPilot help dental clinics retain patients?", a: "CustomerPilot sends automated WhatsApp reminders for 6-month checkups, post-treatment follow-up messages, and medication reminders. When a patient completes a visit, they receive a prompt to leave a Google review — the AI drafts the review text automatically. This drives 40% higher patient recall rates and 3x more 5-star Google reviews." },
                { q: "Dental clinic ke liye patient retention system kaise kaam karta hai?", a: "CustomerPilot dental clinic ke patients ko automatically WhatsApp par 6-month checkup reminder, treatment follow-up message, aur medication reminder bhejta hai. Jab patient apna appointment complete karta hai, use automatically Google review likhne ka prompt aata hai jisme AI pehle se review text draft kar deta hai — patient sirf 1 tap mein Google Maps par submit kar sakta hai." },
                { q: "Does CustomerPilot comply with patient privacy regulations for dental clinics?", a: "Yes. CustomerPilot does not store medical records or treatment data. It only uses names, phone numbers (for WhatsApp contact), and appointment dates for sending reminder messages. All patient communication flows through official WhatsApp Business API channels with full opt-out support, complying with India's PDPB (Personal Data Protection Bill) guidelines." },
              ].map((faq, i) => (
                <details key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <summary className="font-bold text-slate-900 cursor-pointer">{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="py-16 bg-gradient-to-b from-white to-blue-50/40 border-t border-slate-200">
            <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Ready to Build a Loyal Patient Base for Your Dental Clinic?</h2>
              <p className="text-slate-600 text-sm">Join Indian dental clinics using CustomerPilot for automated WhatsApp patient retention, checkup reminders, and Google review collection. 3-day free trial, no credit card required.</p>
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl">
                <Link href="/signup">Start Free Trial — No Credit Card <ArrowRight className="w-5 h-5 ml-2" /></Link>
              </Button>
            </div>
          </section>
        </main>
        <footer className="border-t border-slate-200 bg-slate-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} CustomerPilot. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/whatsapp-digital-loyalty-card" className="hover:text-slate-900">WhatsApp Loyalty</Link>
              <Link href="/smart-ai-google-review" className="hover:text-slate-900">AI Google Review</Link>
              <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
