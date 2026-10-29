"use client"

import React, { useRef, useState } from "react"
import { Star, Download, Share2, X } from "lucide-react"
import { PoweredByCustomerPilot } from "./powered-by-customerpilot"

interface ReviewShareCardProps {
  review: {
    rating: number
    comment: string
    authorName: string
    createdAt: string
  }
  merchantName: string
  onClose?: () => void
}

export function ReviewShareCard({ review, merchantName, onClose }: ReviewShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    
    try {
      setIsExporting(true)
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false
      })
      
      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `review-${merchantName.toLowerCase().replace(/\\s+/g, "-")}.png`
      link.click()
    } catch (error) {
      console.error("Failed to generate image:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleWhatsAppShare = () => {
    const text = `Check out our latest 5-star review for ${merchantName}! 🌟\n\n"${review.comment}" - ${review.authorName}`
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
        className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
          background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)'
        }}
      >
        <div className="p-1.5 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{merchantName}</h3>
              <div className="flex gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-5 h-5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} 
                  />
                ))}
              </div>
            </div>
            <div className="bg-slate-100 rounded-full px-3 py-1 text-xs font-medium text-slate-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <blockquote className="text-lg md:text-xl text-slate-700 italic font-medium leading-relaxed mb-6">
            &quot;{review.comment}&quot;
          </blockquote>
          
          <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
              {review.authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-slate-900">{review.authorName}</div>
              <div className="text-xs text-slate-500">Verified Customer</div>
            </div>
          </div>
          
          <PoweredByCustomerPilot showPoweredBy={true} ctaEnabled={false} className="mt-6 border-slate-200/50 text-slate-400" />
        </div>
      </div>

      {/* Action Buttons (Not captured) */}
      <div className="flex w-full gap-3 mt-2">
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Saving...' : 'Download Image'}
        </button>
        <button
          onClick={handleWhatsAppShare}
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-medium transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share to WhatsApp
        </button>
      </div>
    </div>
  )
}
