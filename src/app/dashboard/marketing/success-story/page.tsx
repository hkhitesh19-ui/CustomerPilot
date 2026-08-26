"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Sparkles, CheckCircle2 } from "lucide-react"

export default function SuccessStoryPage() {
  const [story, setStory] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateStory = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setStory("Since launching CustomerPilot, Central Cafe has transformed its customer relationships. With over 150 loyal members joining in the first month, they've seen a 30% increase in repeat visits. Their innovative approach to loyalty has earned them 25 new 5-star Google Reviews, establishing them as a community favorite.")
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <FileText className="h-8 w-8 text-purple-400" />
          Your Success Story
        </h1>
        <p className="text-slate-400 mt-2">Generate an AI-powered case study about your business's growth to share with the world.</p>
      </div>

      <Card className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          {!story ? (
            <>
              <h2 className="text-2xl font-bold text-white">Your business has a story.</h2>
              <p className="text-slate-300 max-w-lg mx-auto">Let AI analyze your loyalty data and generate a compelling success story that you can use for marketing or PR.</p>
              <Button 
                onClick={generateStory} 
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-500 text-white text-lg px-8 py-6 h-auto"
              >
                {isGenerating ? "Analyzing your data..." : (
                  <><Sparkles className="w-5 h-5 mr-2" /> Generate Success Story</>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4 text-left">
              <h3 className="text-xl font-semibold text-slate-200">Generated Story</h3>
              <Textarea 
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="min-h-[200px] bg-slate-900/80 border-slate-700 text-slate-200 text-base"
              />
              <div className="flex justify-end gap-4">
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  Regenerate
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Share
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
