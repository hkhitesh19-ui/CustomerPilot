"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { MessageSquareReply, Sparkles, AlertCircle, PlayCircle, Loader2 } from "lucide-react"

interface BulkReplyModalProps {
  merchantId: string
}

export function BulkReplyModal({ merchantId }: BulkReplyModalProps) {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("Ready to scan unreplied reviews")
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [jobStats, setJobStats] = useState({ processed: 0, total: 0 })

  const pollChunk = async (jobId: string, currentProcessed: number, totalItems: number) => {
    try {
      const res = await fetch("/api/google-business/bulk-reply", {
        method: "POST",
        headers: { "x-merchant-id": merchantId, "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === "Upgrade Required") {
          setShowUpgrade(true)
          throw new Error("Subscription expired mid-job")
        }
        throw new Error(data.error || "Failed to process chunk")
      }

      const newProcessed = data.processed || 0
      setJobStats({ processed: newProcessed, total: totalItems })
      
      const percentage = Math.min(Math.round((newProcessed / totalItems) * 100), 100)
      setProgress(percentage)
      setStatusText(`Generating AI replies... (${newProcessed}/${totalItems})`)

      if (data.status === "completed" || newProcessed >= totalItems) {
        setProgress(100)
        setStatusText(`Successfully cleared ${newProcessed} reviews!`)
        toast({ title: "Bulk Reply Complete", description: "All historical reviews have been replied to." })
        
        setTimeout(() => {
          setIsRunning(false)
          setProgress(0)
          setStatusText("Ready to scan unreplied reviews")
        }, 5000)
        return
      }

      // Respect rate limits, wait 2 seconds before next chunk
      setTimeout(() => pollChunk(jobId, newProcessed, totalItems), 2000)

    } catch (err: any) {
      if (err.message !== "Subscription expired mid-job") {
        setStatusText("Error occurred during execution")
        toast({ title: "Execution Stopped", description: err.message, variant: "destructive" })
      }
      setIsRunning(false)
    }
  }

  const handleStartBulkReply = async () => {
    setIsRunning(true)
    setProgress(2)
    setStatusText("Initializing job & fetching historical reviews...")

    try {
      // Step 1: Initialize Job
      const res = await fetch("/api/google-business/bulk-reply/start", {
        method: "POST",
        headers: { "x-merchant-id": merchantId, "Content-Type": "application/json" }
      })
      
      const data = await res.json()

      if (!res.ok) {
        if (data.code === "TRIAL_USER_RESTRICTION") {
          setShowUpgrade(true)
          throw new Error("Upgrade required for this feature")
        }
        throw new Error(data.error || "Failed to start bulk reply")
      }

      if (data.totalItems === 0) {
        setProgress(100)
        setStatusText("Everything is up to date!")
        setTimeout(() => {
          setIsRunning(false)
          setProgress(0)
          setStatusText("Ready to scan unreplied reviews")
        }, 3000)
        return
      }

      // Step 2: Start polling chunks
      setJobStats({ processed: data.processed, total: data.totalItems })
      setStatusText(`Job started. Found ${data.totalItems} reviews...`)
      
      pollChunk(data.jobId, data.processed, data.totalItems)

    } catch (err: any) {
      setProgress(0)
      if (err.message !== "Upgrade required for this feature") {
        setStatusText("Error occurred during initialization")
        toast({ title: "Initialization Failed", description: err.message, variant: "destructive" })
      }
      setIsRunning(false)
    }
  }

  if (showUpgrade) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
        <CardHeader>
          <CardTitle className="text-amber-700 dark:text-amber-500 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Premium Feature
          </CardTitle>
          <CardDescription className="text-amber-600/80 dark:text-amber-400/80">
            Bulk Historical Review Cleaner is available on Paid Plans only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mb-4">
            Upgrade your plan to instantly reply to hundreds of past Google Reviews with SEO-optimized AI responses.
          </p>
          <Button onClick={() => setShowUpgrade(false)} variant="outline" className="w-full bg-white dark:bg-black">
            Close
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-md">
          <MessageSquareReply className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            Bulk Historical Review Cleaner
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white uppercase tracking-wider">
              AI Powered
            </span>
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Automatically find and reply to past unreplied Google reviews using the AI Review Engine.
          </p>
        </div>
      </div>

      <div className="bg-background border rounded-md p-3 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-amber-500" />}
            {statusText}
          </span>
          {progress > 0 && <span className="font-medium text-purple-600">{progress}%</span>}
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <Button 
          onClick={handleStartBulkReply} 
          disabled={isRunning}
          className="w-full sm:w-auto mt-2" 
          variant="secondary"
          size="sm"
        >
          {isRunning ? "Processing..." : (
            <>
              <PlayCircle className="w-4 h-4 mr-2" />
              Reply to Previous Reviews
            </>
          )}
        </Button>

        {isRunning && (
          <p className="text-[10px] text-muted-foreground mt-2">
            * Please keep this tab open until the job is completed.
          </p>
        )}
      </div>
    </div>
  )
}
