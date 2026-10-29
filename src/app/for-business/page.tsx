import { Metadata } from "next"
import Link from "next/link"
import { CheckCircle, Star, MessageCircle, Gift } from "lucide-react"

export const metadata: Metadata = {
  title: "CustomerPilot - For Business",
  description: "Your customers could use this too. Start growing with CustomerPilot.",
}

export default function ForBusinessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white selection:bg-emerald-500/30">
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 text-transparent bg-clip-text mb-6">
            Your customers could use this too.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Turn every customer visit into a powerful growth engine. No app downloads required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-950">
            <div className="bg-indigo-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Gift className="text-indigo-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Loyalty Rewards</h3>
            <p className="text-slate-400">Keep customers coming back with digital stamp cards via WhatsApp.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-950">
            <div className="bg-emerald-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Star className="text-emerald-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Google Reviews</h3>
            <p className="text-slate-400">Automatically ask your happiest customers for 5-star Google Reviews.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-950">
            <div className="bg-amber-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="text-amber-400 w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI AutoReply</h3>
            <p className="text-slate-400">Let AI answer customer queries instantly, 24/7 on WhatsApp.</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Start Growing Today</h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>Works via WhatsApp</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>No app download needed</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span>₹3/day</span>
            </div>
          </div>

          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-full transition-all shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80"
          >
            Start Your Free Trial
          </Link>
        </div>
      </main>
    </div>
  )
}
