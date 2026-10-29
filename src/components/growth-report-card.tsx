"use client"

import React, { useRef, useState } from "react"
import { Download, Share2, X, TrendingUp, Users, Award, MessageCircle, RefreshCw } from "lucide-react"
import { PoweredByCustomerPilot } from "./powered-by-customerpilot"

interface GrowthReportCardProps {
  report: {
    reportMonth: string
    newCustomers: number
    stampsIssued: number
    rewardsRedeemed: number
    reviewsReceived: number
    repeatVisits: number
  }
  merchantName: string
  onClose?: () => void
}

export function GrowthReportCard({ report, merchantName, onClose }: GrowthReportCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    
    try {
      setIsExporting(true)
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#0f172a', // slate-900 to match background
        logging: false
      })
      
      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `growth-report-${merchantName.toLowerCase().replace(/\\s+/g, "-")}-${report.reportMonth.toLowerCase()}.png`
      link.click()
    } catch (error) {
      console.error("Failed to generate image:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleWhatsAppShare = () => {
    const text = `Our ${report.reportMonth} Growth Report at ${merchantName}! 🚀\n\n👥 ${report.newCustomers} New Customers\n⭐ ${report.reviewsReceived} New Reviews\n\nThank you for supporting us!`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {onClose && (
        <div className="w-full flex justify-end">
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Capture Area */}
      <div 
        ref={cardRef}
        className="w-full bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-2xl shadow-xl overflow-hidden border border-slate-800"
      >
        <div className="p-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500"></div>
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Growth Report</h2>
              <p className="text-emerald-400 font-medium">{report.reportMonth}</p>
            </div>
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-slate-300 font-medium">New Customers</span>
              </div>
              <span className="text-xl font-bold text-white">+{report.newCustomers}</span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-slate-300 font-medium">Stamps Issued</span>
              </div>
              <span className="text-xl font-bold text-white">{report.stampsIssued}</span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <span className="text-slate-300 font-medium">Rewards Redeemed</span>
              </div>
              <span className="text-xl font-bold text-white">{report.rewardsRedeemed}</span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-slate-300 font-medium">Reviews Received</span>
              </div>
              <span className="text-xl font-bold text-white">+{report.reviewsReceived}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-slate-800 rounded-full border border-slate-700 mb-6">
              <span className="text-slate-400 text-sm">Generated for </span>
              <span className="text-white font-semibold">{merchantName}</span>
            </div>
          </div>
          
          <PoweredByCustomerPilot showPoweredBy={true} ctaEnabled={false} className="mt-0 border-t-0" />
        </div>
      </div>

      {/* Action Buttons (Not captured) */}
      <div className="flex w-full gap-3 mt-2">
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50 border border-slate-700"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Saving...' : 'Save Report'}
        </button>
        <button
          onClick={handleWhatsAppShare}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-medium transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share Update
        </button>
      </div>
    </div>
  )
}
