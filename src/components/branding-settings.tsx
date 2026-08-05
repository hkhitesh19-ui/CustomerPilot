"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Image as ImageIcon, UploadCloud, RefreshCw } from "lucide-react"
import { useDashboardState } from "@/hooks/use-dashboard-state"
import Image from "next/image"

export function BrandingSettings({ merchantId }: { merchantId: string }) {
  const { data, refetch } = useDashboardState()
  const { toast } = useToast()
  
  const [loadingLogo, setLoadingLogo] = useState(false)
  const [loadingCover, setLoadingCover] = useState(false)

  const merchant = data?.merchant

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "cover") => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 5MB", variant: "destructive" })
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    if (type === "logo") {
      setLoadingLogo(true)
    } else {
      setLoadingCover(true)
    }
    
    try {
      const res = await fetch("/api/merchant/upload-brand", {
        method: "POST",
        headers: {
          "x-merchant-id": merchantId
        },
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Upload failed")
      
      toast({ title: "Uploaded", description: json.message })
      refetch()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      if (type === "logo") {
        setLoadingLogo(false)
      } else {
        setLoadingCover(false)
      }
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-500" />
          Brand Assets (Optional)
        </CardTitle>
        <CardDescription>
          Upload your store logo. This will be securely stored and displayed on your Customer QR portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-md">
        
        {/* Logo Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30 flex flex-col items-center text-center">
          <h4 className="font-semibold">Store Logo</h4>
          <div className="relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-background">
            {merchant?.logoUrl ? (
              <img src={merchant.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
            )}
          </div>
          <div>
            <input 
              type="file" 
              id="upload-logo" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleUpload(e, "logo")}
            />
            <label htmlFor="upload-logo">
              <Button asChild variant="outline" disabled={loadingLogo} className="cursor-pointer">
                <span>
                  {loadingLogo ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                  {merchant?.logoUrl ? "Change Logo" : "Upload Logo"}
                </span>
              </Button>
            </label>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
