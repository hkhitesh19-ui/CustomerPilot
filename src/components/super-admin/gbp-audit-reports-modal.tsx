"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GbpAuditReportsTab } from "@/components/gbp-audit-reports-tab"
import { Camera } from "lucide-react"

interface GbpAuditReportsModalProps {
  merchantId: string | null
  merchantName: string
  open: boolean
  onClose: () => void
}

export function GbpAuditReportsModal({
  merchantId,
  merchantName,
  open,
  onClose,
}: GbpAuditReportsModalProps) {
  if (!merchantId) return null

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white border-slate-200 text-slate-900 p-6 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" />
            Google Business Profile Performance &amp; Reports — {merchantName}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <GbpAuditReportsTab merchantId={merchantId} merchantName={merchantName} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
