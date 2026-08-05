"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, XCircle, Rocket, RefreshCw, AlertTriangle } from "lucide-react"

const StatusItem = ({ label, passed }: { label: string, passed: boolean }) => (
  <div className="flex items-center justify-between p-3 border rounded-md">
    <span className="font-medium text-sm">{label}</span>
    {passed ? (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 className="w-4 h-4"/> PASS</span>
    ) : (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-600"><XCircle className="w-4 h-4"/> FAIL</span>
    )}
  </div>
)

export function GoLiveValidator({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleTest = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/merchant/go-live-test", {
        headers: { "x-merchant-id": merchantId }
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to validate")
      
      setResults(json)
      
      if (json.readyToGoLive) {
        toast({ title: "READY TO GO LIVE!", description: "All systems are operational and properly configured.", variant: "default" })
      } else {
        toast({ title: "Validation Failed", description: "Please complete all pending setup steps.", variant: "destructive" })
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-purple-500" />
          Commercial Go-Live Validator
        </CardTitle>
        <CardDescription>
          Run a complete system check against your WhatsApp, Google, Storage, and Queue engines before accepting live customers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {!results ? (
          <div className="flex justify-center p-6 border rounded-lg bg-muted/20 border-dashed">
            <Button size="lg" onClick={handleTest} disabled={loading} className="w-full md:w-auto">
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
              Run Live Test
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <StatusItem label="WhatsApp Verified" passed={results.health.whatsapp} />
              <StatusItem label="Google Place Connected" passed={results.health.google} />
              <StatusItem label="Branding Configured" passed={results.health.branding} />
              <StatusItem label="Reward Rules Configured" passed={results.health.rewardConfig} />
              <StatusItem label="QR Generator Active" passed={results.health.qrEngine} />
              <StatusItem label="Communication Queue Active" passed={results.health.queue} />
              <StatusItem label="Database Healthy" passed={results.health.database} />
              <StatusItem label="Workers Online" passed={results.health.workers} />
            </div>

            <div className={`p-6 text-center rounded-xl border-2 ${results.readyToGoLive ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'}`}>
              <h2 className={`text-2xl font-bold flex items-center justify-center gap-2 ${results.readyToGoLive ? 'text-green-600' : 'text-red-600'}`}>
                {results.readyToGoLive ? (
                  <><CheckCircle2 className="w-8 h-8" /> READY TO GO LIVE</>
                ) : (
                  <><AlertTriangle className="w-8 h-8" /> NOT READY</>
                )}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {results.readyToGoLive 
                  ? "Your CustomerPilot SaaS is fully configured and ready for commercial use." 
                  : "Please resolve the failed checks above before attempting to go live."}
              </p>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={handleTest} disabled={loading}>
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Run Test Again
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
