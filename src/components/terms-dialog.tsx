"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, ShieldCheck } from "lucide-react"

export function TermsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch("/api/legal/terms")
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.data?.content) {
            setContent(data.data.content)
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader className="p-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
            <DialogTitle className="text-xl font-bold text-white">Merchant Terms & Conditions</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            CustomerPilot SaaS Agreement & Merchant Operating Guidelines
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-300 leading-relaxed font-sans select-text">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
          ) : (
            <div className="whitespace-pre-line prose prose-invert max-w-none text-xs text-slate-300">
              {content}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            Close Agreement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
