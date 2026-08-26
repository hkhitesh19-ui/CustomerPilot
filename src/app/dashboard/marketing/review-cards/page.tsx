"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, Star, Download, Share2 } from "lucide-react"
import { useDashboardState } from "@/hooks/use-dashboard-state"

export default function ReviewCardsPage() {
  const { data, isLoading } = useDashboardState()
  
  // Fake reviews for preview if none exist
  const reviews = [
    { id: 1, author: "Aman S.", text: "Best cafe in town! The loyalty program is amazing.", stars: 5 },
    { id: 2, author: "Priya M.", text: "Great service and ambiance. Highly recommended.", stars: 5 }
  ]

  if (isLoading) {
    return <div className="p-8 text-slate-400 animate-pulse">Loading Reviews...</div>
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <ImageIcon className="h-8 w-8 text-blue-400" />
          Review Share Cards
        </h1>
        <p className="text-slate-400 mt-2">Turn your 5-star Google reviews into beautiful social media posts.</p>
      </div>

      {reviews.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-slate-900/60 border-slate-800/60 flex flex-col">
              <CardContent className="p-6 flex-grow">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(review.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-200 italic mb-4">"{review.text}"</p>
                <div className="text-sm font-semibold text-slate-400">- {review.author}</div>
              </CardContent>
              <CardFooter className="bg-slate-900/40 border-t border-slate-800/60 p-4 gap-2 flex-wrap">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex-1 min-w-[120px]">
                  Create Share Card
                </Button>
                <Button variant="outline" size="icon" className="border-slate-700 text-slate-300">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-slate-700 text-slate-300">
                  <Share2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-900/60 border-slate-800/60 text-center py-16">
          <CardContent>
            <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-200 mb-2">No 5-star reviews yet</h3>
            <p className="text-slate-400">Keep providing great service! When you get 5-star reviews, they will appear here to turn into social media cards.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
