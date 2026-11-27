"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  MessageSquareText,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AeHeader } from "./AeHeader";
import { AeFooter } from "./AeFooter";

export const AED_MONTHLY_PRICE = "AED [PRICE_TBD]/month";

interface AeFaqItem {
  question: string;
  answer: string;
}

export const AE_FAQS: AeFaqItem[] = [
  {
    question: "How does the Policy-Safe AI Google Review System work?",
    answer:
      "Every walk-in customer scans the same counter QR or link and receives the exact same direct Google Maps review link. There is zero rating filtering, zero sentiment gating, and zero conditional incentives, keeping your business profile aligned with Google Maps review policies.",
  },
  {
    question: "How do Instant Tailored AI Reply Drafts save my team time?",
    answer:
      "When a customer leaves feedback on Google Maps, CustomerPilot prepares an instant tailored AI reply draft matching your clinic, salon, cafe, gym, or studio tone. Your manager reviews, edits if needed, and publishes the response in seconds without starting from a blank screen.",
  },
  {
    question: "What is included in the Free 14-Day Live Pilot?",
    answer:
      "Your 14-day live pilot includes the policy-safe counter QR review flow, tailored customer review prompt assistance, and instant tailored AI reply drafts for your UAE location. There is no setup fee or card required to begin, and continuation afterward is optional.",
  },
  {
    question: "Does CustomerPilot filter negative reviews or offer a review shield?",
    answer:
      "No. CustomerPilot never blocks, hides, or diverts low ratings away from Google Maps. Every guest receives the identical public Google review link regardless of their experience, ensuring authentic customer feedback and full compliance with platform guidelines.",
  },
];

const UAE_EXAMPLES = [
  {
    sector: "Dental Clinic · Dubai",
    business: "Jumeirah Smile Dental Clinic",
    customerPrompt: "Visited for a routine hygiene cleaning and digital scan with Dr. Karim.",
    replyDraft:
      "Thank you for visiting Jumeirah Smile Dental Clinic, Layla. We are glad your hygiene appointment and digital scan felt smooth and comfortable. Our Dubai team looks forward to welcoming you at your next check-up.",
  },
  {
    sector: "Beauty Salon · Dubai",
    business: "Marina Glow Beauty Lounge",
    customerPrompt: "Booked a keratin blow-dry and manicure before an evening event.",
    replyDraft:
      "Thank you for choosing Marina Glow Beauty Lounge, Noor. We are delighted our stylists could prepare your hair and manicure right on schedule. See you again soon in Dubai Marina.",
  },
  {
    sector: "Specialty Cafe · Abu Dhabi",
    business: "Al Bateen Roastery & Cafe",
    customerPrompt: "Stopped by for a flat white and saffron pistachio croissant.",
    replyDraft:
      "Thank you for stopping by Al Bateen Roastery & Cafe, Omar. We appreciate your kind words about our flat white and freshly baked saffron pistachio croissant. Looking forward to your next morning visit in Abu Dhabi.",
  },
  {
    sector: "Auto Detailing · Abu Dhabi",
    business: "Yas Ceramic Auto Spa",
    customerPrompt: "Completed interior steam detailing and ceramic top-coat maintenance.",
    replyDraft:
      "Thank you for trusting Yas Ceramic Auto Spa with your vehicle, Tariq. Our Abu Dhabi detailing specialists appreciate your feedback on the interior finish and ceramic care. Drive safe and see you on your next service.",
  },
];

export function AeLandingClient() {
  const [leadRef, setLeadRef] = useState("direct");
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [city, setCity] = useState<"Dubai" | "Abu Dhabi" | "Other UAE">("Dubai");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRef = params.get("ref")?.trim();
      if (urlRef) {
        window.sessionStorage.setItem("ae_lead_ref", urlRef);
        setLeadRef(urlRef);
      } else {
        const storedRef = window.sessionStorage.getItem("ae_lead_ref")?.trim();
        if (storedRef) {
          setLeadRef(storedRef);
        }
      }
    } catch {
      // Ignore storage access errors in restricted environments
    }
  }, []);

  const scrollToForm = () => {
    const el = document.getElementById("pilot-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!businessName.trim() || !ownerName.trim() || !workEmail.trim()) {
      setErrorMsg("Please fill in Business Name, Owner/Manager Name, and Work Email.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/ae-pilot-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          ownerName: ownerName.trim(),
          workEmail: workEmail.trim(),
          googleMapsLink: googleMapsLink.trim() || undefined,
          city,
          lead_ref: leadRef,
          submitted_at: new Date().toISOString(),
        }),
      });

      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setErrorMsg(data?.error || "Could not submit your request. Please check your details and try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMsg("Network error while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AeHeader onStartPilot={scrollToForm} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-gradient-to-b from-white via-[#F8FAFC] to-[#EFF6FF] py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#1D4ED8] shadow-xs backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Built for Dubai &amp; Abu Dhabi Service Businesses</span>
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-5xl lg:text-[3.25rem] lg:leading-[1.12]">
                Policy-Safe Google Reviews &amp;{" "}
                <span className="text-[#2563EB]">Instant Tailored AI Reply Drafts</span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-[#475569] sm:text-xl">
                Turn everyday walk-ins at your dental clinic, salon, cafe, gym, or auto detailing studio into steady
                Google Maps visibility—with zero rating gating and instant manager-ready reply drafts.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-[#C2410C] px-7 py-4 text-base font-bold text-white shadow-md transition-colors duration-200 hover:bg-[#9A3412] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                >
                  <span>Start 14-Day Pilot</span>
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
                <p className="text-xs font-medium text-[#475569]">
                  Free 14-Day Live Pilot · No card required · Same Google review link for every customer
                </p>
              </div>
            </div>

            {/* Trust Pillars */}
            <div className="mt-14 grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#E2E8F0] bg-white/90 p-6 shadow-xs backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <QrCode className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-base font-bold text-[#0F172A]">100% Policy-Safe Flow</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  Every walk-in guest receives the exact same direct Google review link. Zero filtering, zero rating
                  gating, and zero review-shielding.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E2E8F0] bg-white/90 p-6 shadow-xs backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-base font-bold text-[#0F172A]">Instant Tailored AI Reply Drafts</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  Receive context-aware reply drafts tailored to your service and Emirate within seconds—ready for your
                  manager to review and publish.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E2E8F0] bg-white/90 p-6 shadow-xs backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <Clock className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-base font-bold text-[#0F172A]">Live in Under 10 Minutes</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  No POS integration or hardware needed. Print your counter QR, share your Google Maps link, and start
                  your 14-day pilot today.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-b border-[#E2E8F0] bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
                How the Policy-Safe UAE Flow Works
              </h2>
              <p className="mt-3 text-base text-[#475569]">
                Built to increase authentic Google reviews while protecting your Business Profile compliance.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold text-white">
                  1
                </span>
                <h3 className="mt-4 text-lg font-bold text-[#0F172A]">Every Guest Gets the Same Link</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  Customers scan your reception QR after their visit. Every single guest is routed to the identical
                  public Google Maps review link—with zero filtering or gating.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold text-white">
                  2
                </span>
                <h3 className="mt-4 text-lg font-bold text-[#0F172A]">Effortless Review Drafting</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  Optional AI prompt helpers help busy visitors describe the service they booked—in their own words—so
                  they finish posting in seconds instead of giving up.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-sm font-bold text-white">
                  3
                </span>
                <h3 className="mt-4 text-lg font-bold text-[#0F172A]">Instant Tailored AI Reply Drafts</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  For every incoming review, CustomerPilot prepares an Instant Tailored AI Reply Draft referencing the
                  customer&apos;s feedback so your team responds promptly and professionally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* UAE Industry Examples */}
        <section className="border-b border-[#E2E8F0] bg-[#F8FAFC] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>UAE Sector Examples</span>
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0F172A]">
                Tailored for Dubai &amp; Abu Dhabi Local Businesses
              </h2>
              <p className="mt-3 text-base text-[#475569]">
                Preview how Instant Tailored AI Reply Drafts adapt to clinics, salons, cafes, gyms, and auto studios.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {UAE_EXAMPLES.map((item) => (
                <article
                  key={item.business}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xs transition-shadow duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">
                      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.sector}
                    </span>
                    <span className="text-xs font-medium text-[#64748B]">{item.business}</span>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#F8FAFC] p-3.5 text-xs text-[#475569]">
                    <span className="font-semibold text-[#0F172A]">Customer Visit Context: </span>
                    {item.customerPrompt}
                  </div>

                  <div className="mt-3 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF]/60 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8]">
                      Instant Tailored AI Reply Draft
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#1E293B]">{item.replyDraft}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing + Single Pilot Offer */}
        <section className="border-b border-[#E2E8F0] bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-[#CBD5E1] bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] p-8 shadow-sm sm:p-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-lg">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#166534]">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Free 14-Day Live Pilot</span>
                  </span>
                  <h2 className="mt-4 text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
                    UAE Reputation &amp; AI Reply Pack
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                    Test the Policy-Safe AI Google Review System and Instant Tailored AI Reply Drafts live at your UAE
                    location for 14 days before deciding.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-sm text-[#1E293B]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
                      <span>Policy-Safe AI Google Review QR &amp; link workflow (zero gating)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
                      <span>Instant Tailored AI Reply Drafts for every review</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
                      <span>Dedicated UAE onboarding support for Dubai, Abu Dhabi &amp; all Emirates</span>
                    </li>
                  </ul>
                </div>

                <div className="shrink-0 rounded-2xl border border-[#E2E8F0] bg-white p-6 text-center shadow-xs md:w-64">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#475569]">After 14-Day Pilot</p>
                  <p className="mt-2 text-2xl font-extrabold text-[#0F172A]">{AED_MONTHLY_PRICE}</p>
                  <p className="mt-1 text-xs text-[#64748B]">Per UAE location · Cancel anytime</p>
                  <button
                    type="button"
                    onClick={scrollToForm}
                    className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-5 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#9A3412] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                  >
                    <span>Start 14-Day Pilot</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pilot Application Form */}
        <section id="pilot-form" className="border-b border-[#E2E8F0] bg-[#F8FAFC] py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-10">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-[#0F172A] sm:text-3xl">Request Your Free 14-Day Pilot</h2>
                <p className="mt-2 text-sm text-[#475569]">
                  Share your UAE business details below. Our team will set up your policy-safe review flow and send your
                  pilot access.
                </p>
              </div>

              {submitted ? (
                <div
                  role="status"
                  className="mt-8 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-6 text-center text-[#166534]"
                >
                  <CheckCircle2 className="mx-auto h-10 w-10 text-[#16A34A]" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-bold">Pilot Request Received</h3>
                  <p className="mt-1.5 text-sm">
                    Thank you, {ownerName}. We have logged your 14-day UAE pilot request for{" "}
                    <span className="font-semibold">{businessName}</span> ({city}) and will contact you at{" "}
                    <span className="font-semibold">{workEmail}</span>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                  <input type="hidden" name="lead_ref" value={leadRef} />

                  <div>
                    <label htmlFor="ae-business-name" className="block text-sm font-semibold text-[#0F172A]">
                      Business Name <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      id="ae-business-name"
                      name="businessName"
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g., Jumeirah Smile Dental Clinic"
                      className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="ae-owner-name" className="block text-sm font-semibold text-[#0F172A]">
                        Owner / Manager Name <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        id="ae-owner-name"
                        name="ownerName"
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="e.g., Dr. Layla Al Mansoori"
                        className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                    </div>

                    <div>
                      <label htmlFor="ae-work-email" className="block text-sm font-semibold text-[#0F172A]">
                        Work Email <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        id="ae-work-email"
                        name="workEmail"
                        type="email"
                        required
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        placeholder="manager@yourbusiness.ae"
                        className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="ae-city" className="block text-sm font-semibold text-[#0F172A]">
                        City <span className="text-[#DC2626]">*</span>
                      </label>
                      <select
                        id="ae-city"
                        name="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value as "Dubai" | "Abu Dhabi" | "Other UAE")}
                        className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      >
                        <option value="Dubai">Dubai</option>
                        <option value="Abu Dhabi">Abu Dhabi</option>
                        <option value="Other UAE">Other UAE</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="ae-maps-link" className="block text-sm font-semibold text-[#0F172A]">
                        Google Maps Link <span className="text-xs font-normal text-[#64748B]">(Optional)</span>
                      </label>
                      <input
                        id="ae-maps-link"
                        name="googleMapsLink"
                        type="url"
                        value={googleMapsLink}
                        onChange={(e) => setGoogleMapsLink(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="mt-1.5 w-full rounded-xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <p role="alert" className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#C2410C] px-6 py-4 text-base font-bold text-white shadow-sm transition-colors duration-200 hover:bg-[#9A3412] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                  >
                    <span>{submitting ? "Submitting Request..." : "Start 14-Day Pilot"}</span>
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-xs text-[#64748B]">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Your details are used strictly to provision your 14-day UAE pilot.</span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-extrabold text-[#0F172A] sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {AE_FAQS.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
                  <h3 className="text-base font-bold text-[#0F172A]">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#475569]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <AeFooter />
    </div>
  );
}
