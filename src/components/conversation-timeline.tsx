"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Award, Star, Activity, UserPlus, Gift } from "lucide-react"

export function ConversationTimeline({ customerId }: { customerId: string }) {
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await fetch(`/api/customers/${customerId}/timeline`)
        const data = await res.json()
        if (data.timeline) setTimeline(data.timeline)
      } catch (e) {
        console.error("Failed to load timeline", e)
      } finally {
        setLoading(false)
      }
    }
    fetchTimeline()
  }, [customerId])

  const getIcon = (type: string, action?: string) => {
    if (type === "message") return <MessageSquare className="w-4 h-4 text-blue-500" />
    if (type === "transaction") return <Award className="w-4 h-4 text-green-500" />
    if (action?.toLowerCase().includes("vip")) return <Star className="w-4 h-4 text-yellow-500" />
    if (action?.toLowerCase().includes("reward")) return <Gift className="w-4 h-4 text-purple-500" />
    if (action?.toLowerCase().includes("join")) return <UserPlus className="w-4 h-4 text-indigo-500" />
    return <Activity className="w-4 h-4 text-gray-500" />
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">Conversation & Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted rounded-md" />)}
          </div>
        ) : timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">No interactions found for this customer.</p>
        ) : (
          <div className="relative border-l border-muted-foreground/20 ml-3 pl-4 space-y-6">
            {timeline.map((event: any, i: number) => (
              <div key={`${event.id}-${i}`} className="relative">
                <div className="absolute -left-6 top-1 bg-background rounded-full p-1 border">
                  {getIcon(event.type, event.action || event.template)}
                </div>
                <div className="text-sm">
                  <div className="font-medium">
                    {event.type === "message" && `WhatsApp: ${event.template}`}
                    {event.type === "event" && event.action}
                    {event.type === "transaction" && `Purchase: ₹${event.amount} (+${event.stampsAwarded} Stamps)`}
                  </div>
                  {event.body && <p className="text-muted-foreground mt-1 text-xs bg-muted p-2 rounded-md">{event.body}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
