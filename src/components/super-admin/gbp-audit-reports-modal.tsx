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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800 text-slate-100 p-6">
        <DialogHeader className="border-b border-slate-800 pb-3">
          <DialogTitle className="text-base font-extrabold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            GBP Audit &amp; 30-Day Calendar Reports — {merchantName}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <GbpAuditReportsTab merchantId={merchantId} merchantName={merchantName} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
