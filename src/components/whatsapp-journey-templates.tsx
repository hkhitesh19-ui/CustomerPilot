"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  MessageSquare, RefreshCw, ChevronDown, ChevronUp,
  RotateCcw, Save, Pencil, Sparkles, X
} from "lucide-react"

interface Template {
  templateKey: string
  templateName: string
  triggerEvent: string
  category: string
  messageBody: string
  language: string
  variables: string[] | string
  isCustomized: boolean
  defaultBody: string
  enabled?: boolean
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  MARKETING:      { label: "Marketing",     color: "bg-purple-500/10 text-purple-400 border-purple-500/20", emoji: "📣" },
  TRANSACTIONAL:  { label: "Transactional", color: "bg-blue-500/10 text-blue-400 border-blue-500/20",   emoji: "✅" },
  ENGAGEMENT:     { label: "Engagement",    color: "bg-amber-500/10 text-amber-400 border-amber-500/20", emoji: "💬" },
  SYSTEM:         { label: "System",        color: "bg-slate-500/10 text-slate-400 border-slate-500/20", emoji: "⚙️" },
  AUTHENTICATION: { label: "Auth",          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", emoji: "🔐" },
}

const GROUP_ORDER = ["TRANSACTIONAL", "MARKETING", "ENGAGEMENT", "SYSTEM", "AUTHENTICATION"]

const GROUP_LABELS: Record<string, string> = {
  TRANSACTIONAL: "🧾 Transactional — Sent automatically on loyalty actions",
  MARKETING: "📣 Marketing — Sent for reviews, rewards & referrals",
  ENGAGEMENT: "💬 Engagement — Win-back, reminders & nudges",
  SYSTEM: "⚙️ System — Internal reports & admin messages",
  AUTHENTICATION: "🔐 Authentication",
}

function highlightVariables(text: string) {
  const parts = text.split(/({{[^}]+}})/g)
  return parts.map((part, i) =>
    /^{{.+}}$/.test(part)
      ? <span key={i} className="bg-emerald-500/20 text-emerald-300 rounded px-1 font-mono text-xs">{part}</span>
      : <span key={i}>{part}</span>
  )
}

function TemplateCard({ template, merchantId }: { template: Template; merchantId: string }) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(template.messageBody)
  const [currentBody, setCurrentBody] = useState(template.messageBody)
  const [isCustomized, setIsCustomized] = useState(template.isCustomized)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  const cat = CATEGORY_CONFIG[template.category] || CATEGORY_CONFIG["MARKETING"]
  const vars: string[] = Array.isArray(template.variables)
    ? template.variables
    : (() => { try { return JSON.parse(template.variables as string) } catch { return [] } })()

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/templates/${template.templateKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-merchant-id": merchantId },
        body: JSON.stringify({ messageBody: draft }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || "Save failed")
      setCurrentBody(draft)
      setIsCustomized(true)
      setEditing(false)
      toast({ title: "✅ Saved!", description: "Template updated successfully." })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      const res = await fetch(`/api/templates/${template.templateKey}`, {
        method: "DELETE",
        headers: { "x-merchant-id": merchantId },
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || "Reset failed")
      setCurrentBody(template.defaultBody)
      setDraft(template.defaultBody)
      setIsCustomized(false)
      setEditing(false)
      toast({ title: "↩️ Reset", description: "Template restored to system default." })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className={`border rounded-xl transition-all duration-200 ${expanded ? "border-slate-600 bg-slate-900/80" : "border-slate-800 bg-slate-900/40 hover:border-slate-700"}`}>
      <button
        onClick={() => { setExpanded(e => !e); setEditing(false); setDraft(currentBody) }}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-slate-200 text-sm">{template.templateName}</span>
            <Badge variant="outline" className={`text-[10px] px-2 py-0 border ${cat.color}`}>
              {cat.emoji} {cat.label}
            </Badge>
            {isCustomized && (
              <Badge variant="outline" className="text-[10px] px-2 py-0 border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                ✏️ Customized
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">{template.triggerEvent}</p>
        </div>
        <div className="flex-shrink-0 mt-0.5 text-slate-500">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3">
          {vars.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-slate-500 font-medium">Variables:</span>
              {vars.map((v: string) => (
                <span key={v} className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono border border-emerald-500/20">
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          )}

          {!editing ? (
            <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
              {highlightVariables(currentBody)}
            </div>
          ) : (
            <textarea
              className="w-full bg-slate-950/80 border border-indigo-500/40 rounded-lg p-3 text-xs text-slate-200 font-mono leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
              rows={10}
              value={draft}
              onChange={e => setDraft(e.target.value)}
            />
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {!editing ? (
              <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700 text-slate-300 hover:border-indigo-500/60 hover:text-indigo-300"
                onClick={() => { setEditing(true); setDraft(currentBody) }}>
                <Pencil className="w-3 h-3 mr-1" /> Edit Message
              </Button>
            ) : (
              <>
                <Button size="sm" disabled={saving} onClick={handleSave}
                  className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white">
                  {saving ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                  Save
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700 text-slate-400"
                  onClick={() => { setEditing(false); setDraft(currentBody) }}>
                  <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
              </>
            )}
            {isCustomized && !editing && (
              <Button size="sm" variant="outline" disabled={resetting}
                className="h-7 text-xs border-slate-700 text-amber-400 hover:border-amber-500/50"
                onClick={handleReset}>
                {resetting ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <RotateCcw className="w-3 h-3 mr-1" />}
                Reset to Default
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function WhatsAppJourneyTemplates({ merchantId }: { merchantId: string }) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!merchantId) return
    setLoading(true)
    fetch("/api/templates", { headers: { "x-merchant-id": merchantId } })
      .then(r => r.json())
      .then(d => {
        if (d?.data?.templates) setTemplates(d.data.templates)
        else throw new Error("Failed to load templates")
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [merchantId])

  if (loading) {
    return (
      <Card className="border-slate-800">
        <CardContent className="p-6 flex items-center justify-center gap-3 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading WhatsApp Journey Templates...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="p-6 text-center text-red-400 text-sm">{error}</CardContent>
      </Card>
    )
  }

  const grouped: Record<string, Template[]> = {}
  for (const t of templates) {
    const cat = t.category || "MARKETING"
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(t)
  }

  const customizedCount = templates.filter(t => t.isCustomized).length

  return (
    <Card className="border-slate-800 bg-slate-900/30">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-200">
              <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </div>
              WhatsApp Journey Templates
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xl">
              These are the WhatsApp messages automatically sent to customers at each stage of their loyalty journey. Customize them to match your brand voice.
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <span className="text-xs text-slate-500">{templates.length} Templates</span>
            {customizedCount > 0 && (
              <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-2 py-0.5">
                ✏️ {customizedCount} Customized
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {GROUP_ORDER.filter(g => grouped[g]?.length).map(groupKey => (
          <div key={groupKey} className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800/60">
              <span className="text-xs font-semibold text-slate-400">{GROUP_LABELS[groupKey]}</span>
              <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full ml-auto">
                {grouped[groupKey].length}
              </span>
            </div>
            <div className="space-y-2">
              {grouped[groupKey].map(t => (
                <TemplateCard key={t.templateKey} template={t} merchantId={merchantId} />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-slate-950/40 rounded-lg border border-slate-800 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-400">Tip:</span> Use{" "}
            <code className="bg-emerald-500/10 text-emerald-400 px-1 rounded text-[10px]">{"{{variable}}"}</code>{" "}
            placeholders exactly as shown. They are auto-filled by the system when messages are sent. Editing a template creates a version history so you can always reset to the original.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
