"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Server, AlertTriangle, Clock } from "lucide-react"

export function CommunicationStatusCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between text-muted-foreground">
          Communication Engine
          <MessageSquare className="w-4 h-4" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Evolution Status</span>
            <span className="text-sm font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 rounded-full">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-1"><Server className="w-3 h-3"/> Queue Running</span>
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-1"><Clock className="w-3 h-3"/> Avg Delivery</span>
            <span className="text-sm font-medium">1.2s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-1 text-red-500"><AlertTriangle className="w-3 h-3"/> Failed / Retry</span>
            <span className="text-sm font-medium text-red-500">0 / 0</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
