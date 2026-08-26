import { db } from "@/lib/db"
import Link from "next/link"
import { ShieldCheck, MessageCircle, Star, Repeat } from "lucide-react"

export default async function ReferralLandingPage({ params }: { params: { code: string } }) {
  const code = params.code

  const referral = await db.merchantReferral.findFirst({
    where: { referralCode: code },
    include: {
      referrerMerchant: {
        select: { name: true }
      }
    }
  })

  if (!referral) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-slate-100 mb-4">Invalid Referral Link</h1>
          <p className="text-slate-400 mb-6">This referral code is invalid or has expired.</p>
          <Link href="/" className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 mb-6 border border-indigo-500/20">
            <Star className="w-8 h-8 text-indigo-400 fill-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 tracking-tight mb-4">
            <span className="text-indigo-400">{referral.referrerMerchant.name}</span> recommended CustomerPilot
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto">
            Join thousands of local businesses growing their revenue with WhatsApp loyalty and automated Google reviews.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl mb-8">
          <h3 className="text-xl font-semibold text-slate-100 mb-6 text-center">Everything you need to grow</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Repeat className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-medium text-slate-200 mb-2">Bring customers back</h4>
              <p className="text-sm text-slate-400">Digital stamp cards on WhatsApp keep them coming back.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <h4 className="font-medium text-slate-200 mb-2">Get more Google Reviews</h4>
              <p className="text-sm text-slate-400">Automated requests turn happy customers into 5-star reviews.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="font-medium text-slate-200 mb-2">Reply automatically</h4>
              <p className="text-sm text-slate-400">AI replies to your Google reviews so you don't have to.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href={`/signup?ref=${code}`} className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-4 rounded-xl text-lg transition-all shadow-[0_0_20px_-3px_rgba(79,70,229,0.5)] hover:shadow-[0_0_25px_-3px_rgba(79,70,229,0.7)] hover:-translate-y-1">
            Start Free Trial
          </Link>
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>No credit card required. 7-day free trial.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
