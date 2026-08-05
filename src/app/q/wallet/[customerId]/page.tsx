import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Star, Gift, Crown, ExternalLink } from "lucide-react"

export const dynamic = "force-dynamic"

export default function WalletPage({ params }: { params: { customerId: string } }) {
  // Use React Server Components data fetching
  return <WalletDataFetcher customerId={params.customerId} />
}

async function WalletDataFetcher({ customerId }: { customerId: string }) {
  // Fetch customer along with merchant and stamp cards
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      merchant: {
        include: {
          merchantGoogleConnections: true
        }
      },
      stampCards: {
        include: {
          stampCard: true
        }
      }
    }
  })

  if (!customer) return notFound()

  const googleConn = customer.merchant.merchantGoogleConnections?.[0]
  const googleReviewUrl = googleConn?.placeId ? `https://search.google.com/local/writereview?placeid=${googleConn.placeId}` : "#"

  // Find the active stamp card rule for this merchant
  const activeStampCardRule = await db.stampCard.findFirst({
    where: { merchantId: customer.merchantId, active: true }
  })

  if (!activeStampCardRule) return notFound()

  // Find the customer's current progress on this active rule
  const customerCard = customer.stampCards.find(c => c.stampCardId === activeStampCardRule.id && !c.completed)
  
  const stampsCollected = customerCard ? customerCard.stampsCollected : 0
  const stampsRequired = activeStampCardRule.stampsRequired || 10

  // Ensure an array of slots for visual representation
  const stampSlots = Array.from({ length: stampsRequired }, (_, i) => i < stampsCollected)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center p-6 sm:p-10 font-sans selection:bg-emerald-500/30">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-full mb-4">
            <Crown className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Hi, {customer.name} <span className="inline-block animate-bounce origin-bottom">❤️</span></h1>
          <p className="text-slate-400 text-sm">
            Welcome to the <strong className="text-slate-200">{customer.merchant.name}</strong> VIP Club.
          </p>
        </div>

        {/* Card Section */}
        <div className="relative group perspective-1000 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                Your Stamps
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                {stampsCollected} / {stampsRequired}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-3 mb-8">
              {stampSlots.map((isFilled, index) => (
                <div key={index} className="flex flex-col items-center gap-1.5 relative">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner transition-all duration-500
                    ${isFilled 
                      ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500/50 scale-110" 
                      : "bg-slate-800 text-slate-600 border border-slate-700 border-dashed"
                    }`}
                  >
                    {isFilled ? '⭐' : index + 1}
                  </div>
                  {index === stampsRequired - 1 && (
                    <div className="absolute -bottom-6 w-max text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Goal
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 flex items-start gap-4 mt-8">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <Gift className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Next Reward</p>
                <p className="font-semibold text-slate-200">{activeStampCardRule.rewardName || 'FREE Gift'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bonus Actions */}
        <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300 fill-mode-both">
          <a 
            href={googleReviewUrl} 
            target="_blank"
            rel="noreferrer"
            className="block w-full"
          >
            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between hover:bg-blue-900/60 transition-colors cursor-pointer group">
              <div>
                <h3 className="font-semibold text-blue-200 text-sm mb-0.5">Google Review Bonus Available</h3>
                <p className="text-xs text-blue-300/70">Leave a review for +{activeStampCardRule.googleReviewBonus || 1} Bonus Stamp</p>
              </div>
              <div className="bg-blue-500/20 p-2 rounded-full group-hover:bg-blue-500/40 transition-colors">
                <ExternalLink className="w-4 h-4 text-blue-300" />
              </div>
            </div>
          </a>
        </div>

      </div>
    </div>
  )
}
