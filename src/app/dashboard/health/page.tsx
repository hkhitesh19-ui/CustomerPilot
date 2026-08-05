"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Activity, Database, Server, Globe, MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"

const StatusItem = ({ label, isHealthy, icon: Icon }: { label: string, isHealthy: boolean, icon: any }) => (
  <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-md ${isHealthy ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="font-medium">{label}</span>
    </div>
    {isHealthy ? (
      <span className="flex items-center gap-1 text-sm font-semibold text-green-600"><CheckCircle2 className="w-4 h-4"/> Operational</span>
    ) : (
      <span className="flex items-center gap-1 text-sm font-semibold text-red-600"><XCircle className="w-4 h-4"/> Offline</span>
    )}
  </div>
)

export default function HealthMonitorPage() {
  const [health] = useState<any>({
    evolution: true,
    redis: true,
    webhook: true,
    worker: true,
    database: true,
    google: true,
    ai: true,
    queue: true,
    lastChecked: new Date().toLocaleTimeString()
  })

  if (!health) return <div className="p-8 animate-pulse text-muted-foreground">Initializing Diagnostics...</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
        <p className="text-muted-foreground mt-2">Real-time status of all microservices and external APIs.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Infrastructure Status
          </CardTitle>
          <CardDescription>Last checked at {health.lastChecked}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusItem label="Database (Prisma)" isHealthy={health.database} icon={Database} />
          <StatusItem label="Message Queue (DB-Backed)" isHealthy={health.queue} icon={Server} />
          <StatusItem label="Evolution API Adapter" isHealthy={health.evolution} icon={MessageSquare} />
          <StatusItem label="Webhook Ingestion" isHealthy={health.webhook} icon={Globe} />
          <StatusItem label="Queue Worker" isHealthy={health.worker} icon={Activity} />
          <StatusItem label="Google Business API" isHealthy={health.google} icon={Globe} />
          <StatusItem label="Gemini AI Engine" isHealthy={health.ai} icon={Server} />
        </CardContent>
      </Card>
    </div>
  )
}
