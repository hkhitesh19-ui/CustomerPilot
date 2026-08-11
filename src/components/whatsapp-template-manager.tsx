"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  MessageSquare, Search, Sparkles, RefreshCw, CheckCircle2, RotateCcw,
  Clock, Shield, Tag, AlertCircle, Phone, Eye, Edit3, History, Copy, X
} from "lucide-react"
import { useDashboardState } from "@/hooks/use-dashboard-state"
import { VARIABLE_DICTIONARY, generateSamplePreview, validateTemplateVariables } from "@/lib/variable-engine"

export interface MessageTemplateItem {
  id: string
  merchantId: string | null
  templateKey: string
  templateName: string
  triggerEvent: string
  category: string
  messageBody: string
  defaultBody: string
  language: string
  variables: string
  enabled: boolean
  version: number
  isCustomized: boolean
  updatedAt: string
  history?: any[]
}

const CATEGORIES = [
  { id: "ALL", label: "All Templates" },
  { id: "AUTHENTICATION", label: "Authentication & OTP" },
  { id: "LOYALTY", label: "Loyalty & Stamps" },
  { id: "REWARDS", label: "Rewards & Coupons" },
  { id: "REVIEWS", label: "Reviews & Growth" },
  { id: "ENGAGEMENT", label: "Birthdays & Win-back" },
  { id: "REFERRALS", label: "Referral Program" },
]

export function WhatsAppTemplateManager({ merchantId }: { merchantId: string }) {
  const { data } = useDashboardState()
  const { toast } = useToast()

  const [templates, setTemplates] = useState<MessageTemplateItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  
  // Active editing state
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplateItem | null>(null)
  const [editBody, setEditBody] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [activeTab, setActiveTab] = useState<"editor" | "history">("editor")

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const effectiveMerchantId = merchantId || data?.merchant?.id || ""

  const fetchTemplates = async () => {
    if (!effectiveMerchantId) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/templates", {
        headers: { "x-merchant-id": effectiveMerchantId },
      })
      const result = await res.json().catch(() => null)
      if (result?.ok) {
        setTemplates(result.data?.templates || [])
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to load WhatsApp message templates.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (effectiveMerchantId) {
      fetchTemplates()
    }
  }, [effectiveMerchantId])

  const handleOpenEdit = async (template: MessageTemplateItem) => {
    setEditingTemplate(template)
    setEditBody(template.messageBody)
    setActiveTab("editor")

    // Fetch single template to get full version history
    try {
      const res = await fetch(`/api/templates/${template.templateKey}`, {
        headers: { "x-merchant-id": effectiveMerchantId },
      })
      const result = await res.json().catch(() => null)
      if (result?.ok && result.data?.history) {
        setEditingTemplate((prev) => (prev ? { ...prev, history: result.data.history } : prev))
      }
    } catch (e) {}
  }

  const handleInsertVariable = (varKey: string) => {
    const placeholder = `{{${varKey}}}`
    if (!textareaRef.current) {
      setEditBody((prev) => prev + " " + placeholder)
      return
    }

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const textBefore = editBody.substring(0, start)
    const textAfter = editBody.substring(end)

    const newText = `${textBefore}${placeholder}${textAfter}`
    setEditBody(newText)

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newPos = start + placeholder.length
        textareaRef.current.setSelectionRange(newPos, newPos)
      }
    }, 50)
  }

  const handleSave = async () => {
    if (!editingTemplate) return
    setIsSaving(true)

    try {
      const res = await fetch(`/api/templates/${editingTemplate.templateKey}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": effectiveMerchantId,
        },
        body: JSON.stringify({ messageBody: editBody }),
      })

      const result = await res.json().catch(() => null)
      if (!res.ok || !result?.ok) {
        throw new Error(result?.error || "Failed to save template")
      }

      toast({
        title: "Template Saved Successfully",
        description: `Updated "${editingTemplate.templateName}" template. Future messages will use this custom wording.`,
      })
      setEditingTemplate(null)
      fetchTemplates()
    } catch (err: any) {
      toast({
        title: "Validation Error",
        description: err.message || "Could not save template.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToDefault = async (templateKey: string) => {
    setIsResetting(true)
    try {
      const res = await fetch(`/api/templates/${templateKey}`, {
        method: "DELETE",
        headers: { "x-merchant-id": effectiveMerchantId },
      })
      const result = await res.json().catch(() => null)
      if (!res.ok || !result?.ok) throw new Error(result?.error || "Failed to reset")

      toast({
        title: "Template Reset to Default",
        description: "Reverted template back to CustomerPilot system default.",
      })
      if (editingTemplate?.templateKey === templateKey) {
        setEditingTemplate(null)
      }
      fetchTemplates()
    } catch (err: any) {
      toast({
        title: "Error Resetting Template",
        description: err.message || "Could not reset template.",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.templateKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.messageBody.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.triggerEvent.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "ALL" ||
      t.category.toUpperCase().includes(selectedCategory) ||
      (selectedCategory === "ENGAGEMENT" && ["BIRTHDAY_WISH", "WINBACK_CAMPAIGN", "INACTIVE_CUSTOMER_REMINDER", "FESTIVAL_GREETING", "WINBACK_30_DAY", "WINBACK_60_DAY", "WINBACK_90_DAY", "ALMOST_THERE_REMINDER", "EXPIRY_WARNING_7_DAY"].includes(t.templateKey)) ||
      (selectedCategory === "REWARDS" && ["REWARD_UNLOCKED", "REWARD_REMINDER", "REWARD_EXPIRY_REMINDER", "SPECIAL_OFFER"].includes(t.templateKey)) ||
      (selectedCategory === "LOYALTY" && ["FIRST_STAMP_EARNED", "STAMP_EARNED", "WELCOME_MSG", "REGISTRATION_SUCCESS"].includes(t.templateKey)) ||
      (selectedCategory === "REVIEWS" && ["REVIEW_REQUEST", "REVIEW_THANK_YOU", "VIP_UPGRADE"].includes(t.templateKey)) ||
      (selectedCategory === "REFERRALS" && t.templateKey.startsWith("REFERRAL"))

    return matchesSearch && matchesCategory
  })

  // Validation details for current editing text
  const validation = editingTemplate ? validateTemplateVariables(editBody) : { isValid: true, invalidVars: [], foundVars: [] }
  const livePreviewText = editingTemplate ? generateSamplePreview(editBody) : ""

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <CardHeader className="bg-slate-900/40 border-b border-slate-800/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  WhatsApp Journey Templates
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    Enterprise Engine
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Preview, edit, and personalize all automated customer WhatsApp messages across your loyalty journey.
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchTemplates}
              disabled={isLoading}
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Refresh Templates
            </Button>
          </div>

          {/* Search & Category Filter */}
          <div className="mt-6 flex flex-col gap-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by name, keyword (e.g. Birthday, Reward, Google)..."
                className="pl-9 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 h-10"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-2 max-w-full">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap text-xs h-9 ${
                    selectedCategory === cat.id
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 space-y-3 animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
              <div>Loading merchant message templates...</div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No matching journey templates found for "{searchQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((tmpl) => (
                <div
                  key={tmpl.templateKey}
                  className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          {tmpl.templateName}
                          {tmpl.isCustomized ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                              Customized (v{tmpl.version})
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-800/60 text-slate-400 border-slate-700 text-[10px]">
                              System Default
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">{tmpl.templateKey}</div>
                      </div>

                      <Badge variant="secondary" className="bg-slate-800/80 text-slate-300 text-[10px] uppercase">
                        {tmpl.category}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>Trigger: {tmpl.triggerEvent}</span>
                    </div>

                    {/* Template Message Preview */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap line-clamp-3 leading-relaxed">
                      {tmpl.messageBody}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/40 text-xs">
                    <div className="text-slate-500">
                      {tmpl.messageBody.length} chars • {tmpl.language.toUpperCase()}
                    </div>

                    <div className="flex items-center gap-2">
                      {tmpl.isCustomized && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetToDefault(tmpl.templateKey)}
                          disabled={isResetting}
                          className="h-8 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-2.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleOpenEdit(tmpl)}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 shadow-md shadow-emerald-950/20"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Template
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editor Modal / Drawer */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Edit3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    Edit: {editingTemplate.templateName}
                    {editingTemplate.isCustomized ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                        v{editingTemplate.version} Customized
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                        System Default
                      </Badge>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Trigger: {editingTemplate.triggerEvent} • Key: <span className="font-mono text-slate-300">{editingTemplate.templateKey}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingTemplate(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Nav Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
              <button
                onClick={() => setActiveTab("editor")}
                className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === "editor"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Edit3 className="w-4 h-4" /> Template Editor & Live Preview
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === "history"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <History className="w-4 h-4" /> Version Audit History ({editingTemplate.history?.length || 0})
              </button>
            </div>

            {/* Modal Body */}
            {activeTab === "editor" ? (
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
                {/* Left Column: Textarea & Variables Picker (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Interactive Variable Chips */}
                  <div>
                    <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Click variable to insert into message at cursor:
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">Auto-validated</span>
                    </Label>
                    <div className="flex flex-wrap gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 max-h-36 overflow-y-auto">
                      {Object.keys(VARIABLE_DICTIONARY).map((vKey) => {
                        const def = VARIABLE_DICTIONARY[vKey]
                        return (
                          <button
                            key={vKey}
                            type="button"
                            onClick={() => handleInsertVariable(vKey)}
                            title={`${def.label}: ${def.description} (e.g. "${def.mockValue}")`}
                            className="bg-slate-900 hover:bg-emerald-950/80 text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/50 rounded-lg px-2.5 py-1 text-xs font-mono transition-all flex items-center gap-1 group"
                          >
                            <span>{"{{" + vKey + "}}"}</span>
                            <span className="text-[10px] text-slate-500 group-hover:text-emerald-400/70">+</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Message Body Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-200">
                        Editable WhatsApp Message Text
                      </Label>
                      <span className="text-xs text-slate-400">
                        Formatting: <span className="font-mono text-emerald-400">*bold*</span>,{" "}
                        <span className="font-mono text-emerald-400">_italic_</span>
                      </span>
                    </div>

                    <Textarea
                      ref={textareaRef}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={8}
                      className="bg-slate-950 border-slate-800 text-slate-100 font-mono text-sm leading-relaxed focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      placeholder="Write your custom WhatsApp message here..."
                    />

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <div>
                        Character Count:{" "}
                        <span className={`font-mono font-semibold ${editBody.length > 500 ? "text-amber-400" : "text-emerald-400"}`}>
                          {editBody.length}
                        </span>{" "}
                        chars • Est. WhatsApp segments:{" "}
                        <span className="font-mono text-slate-200">{Math.ceil(editBody.length / 160) || 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Validation Error Alert */}
                  {!validation.isValid && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">Unknown Variable Syntax Detected:</div>
                        <div>
                          The following placeholders are invalid:{" "}
                          <span className="font-mono font-bold">{validation.invalidVars.map((v) => `{{${v}}}`).join(", ")}</span>. Please use only recognized variables from the chips above.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Live WhatsApp Device Preview Box (5 cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    Live WhatsApp Customer Preview (Sample Data)
                  </Label>

                  {/* Mock WhatsApp Device Screen */}
                  <div className="bg-slate-950 border-4 border-slate-800 rounded-3xl p-4 shadow-2xl relative overflow-hidden flex flex-col h-[400px]">
                    {/* Phone Status Header */}
                    <div className="bg-emerald-900/90 text-white px-3 py-2 rounded-t-xl flex items-center justify-between text-xs font-medium -mx-4 -mt-4 mb-3 border-b border-emerald-700/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-bold">{data?.merchant?.name || "CustomerPilot Store"}</span>
                      </div>
                      <span className="text-[10px] opacity-80">Official WhatsApp</span>
                    </div>

                    {/* Chat Bubble Area */}
                    <div className="flex-1 overflow-y-auto space-y-3 p-1">
                      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-2xl rounded-tl-none p-3 text-xs text-slate-100 font-sans leading-relaxed shadow-md max-w-[90%] relative">
                        <div className="whitespace-pre-wrap">
                          {livePreviewText || <span className="text-slate-500 italic">Type message text to see live preview...</span>}
                        </div>
                        <div className="text-[9px] text-emerald-400/70 text-right mt-1.5 font-mono">
                          10:45 AM • Sent via CustomerPilot
                        </div>
                      </div>
                    </div>

                    {/* Footer banner */}
                    <div className="text-[10px] text-center text-slate-500 border-t border-slate-800/80 pt-2 -mx-4 -mb-4 bg-slate-900/80 p-2">
                      🔒 Real-time variable interpolation preview
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Version History Audit Tab */
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {!editingTemplate.history || editingTemplate.history.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    No version history recorded yet. Edits made by the merchant will be logged here with version snapshots.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editingTemplate.history.map((ver: any) => (
                      <div key={ver.id || ver.version} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Version {ver.version}
                            </Badge>
                            <span className="text-slate-400">{ver.changedBy || "MERCHANT"}</span>
                          </div>
                          <span className="text-slate-500 font-mono">{new Date(ver.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded-lg border border-slate-800/60 whitespace-pre-wrap">
                          {ver.messageBody}
                        </div>
                        <div className="flex justify-end pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditBody(ver.messageBody)}
                            className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" /> Restore Version {ver.version} to Editor
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingTemplate.isCustomized && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetToDefault(editingTemplate.templateKey)}
                    disabled={isResetting || isSaving}
                    className="border-slate-800 bg-slate-900 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset to System Default
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTemplate(null)}
                  disabled={isSaving}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !validation.isValid || !editBody.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 shadow-lg shadow-emerald-950/20"
                >
                  {isSaving ? "Saving..." : "Save Template Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
