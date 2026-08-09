"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertCircle, XCircle, RefreshCw, QrCode } from "lucide-react"
import { useDashboardState } from "@/hooks/use-dashboard-state"
import Image from "next/image"

export function WhatsAppVerification({ merchantId }: { merchantId: string }) {
  const { data, refetch } = useDashboardState()
  const { toast } = useToast()

  const [phone, setPhone] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(false)

  const [qrCode, setQrCode] = useState("")
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    if (data?.merchant?.whatsappPhone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhone(data.merchant.whatsappPhone)
      setIsVerified(true)
    }
  }, [data?.merchant?.whatsappPhone])

  // Polling for QR Code status
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/whatsapp/status", {
          headers: { "x-merchant-id": merchantId }
        })
        if (res.ok) {
          const result = await res.json()
          if (result.connected) {
            clearInterval(interval)
            setIsPolling(false)
            setIsVerified(true)
            setQrCode("")
            if (result.whatsappPhone) {
              setPhone(result.whatsappPhone)
            }
            refetch()
            toast({ title: "Success", description: "WhatsApp number verified and connected!" })
          }
        }
      } catch (e: any) {
        if (e.name !== 'TypeError' && !e.message?.includes('Failed to fetch')) {
          console.error("Polling error", e)
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isPolling, merchantId, refetch, toast])

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/whatsapp/connect", {
        headers: { "x-merchant-id": merchantId }
      })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || "Failed to generate QR Code.")

      if (result.connected) {
        setIsVerified(true)
        if (result.whatsappPhone) setPhone(result.whatsappPhone)
        toast({ title: "Success", description: "WhatsApp number is already connected!" })
      } else if (result.qrCodeBase64) {
        setQrCode(result.qrCodeBase64)
        setIsPolling(true)
        toast({ title: "Scan QR Code", description: "Please scan the QR code using WhatsApp on your phone." })
      } else {
        throw new Error("No QR code received from server.")
      }
    } catch (e: any) {
      toast({ title: "Connection Failed", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      // Call the new disconnect API which deletes the Evolution API instance and clears the DB
      const res = await fetch("/api/whatsapp/disconnect", {
        method: "DELETE",
        headers: { "x-merchant-id": merchantId }
      })
      if (!res.ok) throw new Error("Failed to disconnect.")
      
      setPhone("")
      setIsVerified(false)
      setQrCode("")
      setIsPolling(false)
      refetch()
      toast({ title: "Disconnected", description: "WhatsApp number has been removed and instance deleted." })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                className="w-6 h-6 text-[#25D366]"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp Business Connection
            </CardTitle>
            <CardDescription>
              Connect your official WhatsApp number to send automated receipts, rewards, and campaigns.
            </CardDescription>
          </div>
          <div>
            {isVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                <AlertCircle className="w-3 h-3" /> Not Connected
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Official WhatsApp Number</Label>
            <div className="flex flex-wrap gap-3">
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Number will appear after scanning"
                disabled={true}
                className="max-w-md bg-muted"
              />
              {isVerified ? (
                <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20" onClick={handleDisconnect} disabled={loading}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <Button onClick={handleConnect} disabled={loading || isPolling}>
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
                  Generate QR Code
                </Button>
              )}
            </div>
            
            {qrCode && !isVerified && (
              <div className="mt-4 p-6 border rounded-xl bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-lg">Scan to Connect</h3>
                  <p className="text-sm text-muted-foreground">Open WhatsApp on your phone &gt; Settings &gt; Linked Devices &gt; Link a Device</p>
                </div>
                <div className="relative w-80 h-80 bg-white p-2 rounded-xl shadow-sm border flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Waiting for scan...</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setQrCode(""); setIsPolling(false); }}>Cancel</Button>
              </div>
            )}
          </div>
      </CardContent>
    </Card>
  )
}
