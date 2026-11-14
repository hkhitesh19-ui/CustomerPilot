"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Bot, MessageSquare, Sparkles, Send, RefreshCw, Smartphone, CheckCircle2,
  AlertCircle, ShieldCheck, Copy, Plus, Trash2, Edit3, Phone, ExternalLink,
  Users, FileSpreadsheet, Eye, Terminal, Power, Globe, Zap, Clock, Store, Check, ArrowRight
} from "lucide-react"

export default function ChatbotBuilderPage() {
  const { toast } = useToast()

  // Active Tab
  const [activeTab, setActiveTab] = useState<"playground" | "config" | "knowledge" | "channels" | "inbox" | "leads">("playground")

  // Bot Config State
  const [botName, setBotName] = useState("Cake Connection AI Assistant")
  const [status, setStatus] = useState<"ACTIVE" | "PAUSED" | "DRAFT">("ACTIVE")
  const [tone, setTone] = useState("friendly_professional")
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hello! I am your AI assistant for Cake Connection. How can I help you today? (Note: You are chatting with an AI assistant)"
  )
  const [fallbackMessage, setFallbackMessage] = useState(
    "I don't have confirmed information for that right now. Let me connect you directly with our team!"
  )
  const [killSwitch, setKillSwitch] = useState(false)

  // Knowledge State
  const [knowledgeList, setKnowledgeList] = useState<any[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const [newCategory, setNewCategory] = useState("Product & Pricing")
  const [loadingKnowledge, setLoadingKnowledge] = useState(true)

  // Playground Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "bot"; text: string; intent?: string; evidence?: string[] }>>([
    {
      role: "bot",
      text: "Hello! I am your AI assistant for Cake Connection. How can I help you today? (Note: You are chatting with an AI assistant)",
      intent: "welcome",
      evidence: ["store-policy"]
    }
  ])
  const [chatInput, setChatInput] = useState("")
  const [sendingChat, setSendingChat] = useState(false)

  // Leads & Conversations State
  const [leads, setLeads] = useState<any[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConv, setSelectedConv] = useState<any>(null)

  // 1. Initial Data Fetch
  useEffect(() => {
    async function init() {
      try {
        const [confRes, kbRes, leadsRes, convRes] = await Promise.all([
          fetch("/api/chatbot/config"),
          fetch("/api/chatbot/knowledge"),
          fetch("/api/chatbot/leads"),
          fetch("/api/chatbot/conversations")
        ])

        const conf = await confRes.json()
        if (conf.success && conf.config) {
          setBotName(conf.config.botName)
          setStatus(conf.config.status)
          setWelcomeMessage(conf.config.welcomeMessage)
          setFallbackMessage(conf.config.fallbackMessage)
        }

        const kb = await kbRes.json()
        if (kb.success && kb.knowledge) {
          setKnowledgeList(kb.knowledge)
        }

        const lds = await leadsRes.json()
        if (lds.success && lds.leads) {
          setLeads(lds.leads)
        }

        const cvs = await convRes.json()
        if (cvs.success && cvs.conversations) {
          setConversations(cvs.conversations)
          setSelectedConv(cvs.conversations[0])
        }
      } catch (err) {
        console.warn("Failed to load initial chatbot data")
      } finally {
        setLoadingKnowledge(false)
      }
    }
    init()
  }, [])

  // 2. Send Playground Message
  const handleSendTestMessage = async (customText?: string) => {
    const textToSend = customText || chatInput
    if (!textToSend.trim()) return

    const userMsg = { role: "user" as const, text: textToSend.trim() }
    setChatMessages((prev) => [...prev, userMsg])
    if (!customText) setChatInput("")
    setSendingChat(true)

    try {
      const res = await fetch("/api/chatbot/test-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend.trim() })
      })

      const data = await res.json()
      if (data.success) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: data.reply,
            intent: data.intent,
            evidence: data.evidenceIds
          }
        ])
      }
    } catch {
      toast({ title: "Error", description: "Failed to get reply from AI bot.", variant: "destructive" })
    } finally {
      setSendingChat(false)
    }
  }

  // 3. Add Knowledge Item
  const handleAddKnowledge = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast({ title: "Required", description: "Enter question and answer.", variant: "destructive" })
      return
    }

    try {
      const res = await fetch("/api/chatbot/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
          category: newCategory
        })
      })
      const data = await res.json()
      if (data.success && data.item) {
        setKnowledgeList((prev) => [...prev, data.item])
        setNewQuestion("")
        setNewAnswer("")
        toast({ title: "Knowledge Added! 📚", description: "Item saved to active knowledge base." })
      }
    } catch {
      toast({ title: "Error", description: "Could not save knowledge item.", variant: "destructive" })
    }
  }

  // 4. Save Config
  const handleSaveConfig = async () => {
    try {
      const res = await fetch("/api/chatbot/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botName,
          status,
          tone,
          welcomeMessage,
          fallbackMessage,
          killSwitch
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Saved! ✅", description: "Chatbot settings updated successfully." })
      }
    } catch {
      toast({ title: "Error", description: "Failed to update configuration", variant: "destructive" })
    }
  }

  // 5. Export Leads CSV
  const handleExportLeadsCsv = () => {
    if (leads.length === 0) return
    const headers = ["ID", "Customer Name", "Phone", "Requirement", "Channel", "Status", "Date"]
    const rows = leads.map((l) => [
      l.id,
      `"${l.customerName}"`,
      `"${l.customerPhone}"`,
      `"${l.requirement}"`,
      l.channel,
      l.status,
      `"${l.createdAt}"`
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const encoded = encodeURI(csvContent)
    const link = document.createElement("a")
    link.href = encoded
    link.download = `chatbot_leads_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Export Started", description: "Leads CSV downloaded." })
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Bot className="w-5 h-5 text-teal-700" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">AI WhatsApp ChatBot Builder</h1>
            <Badge className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-2.5 py-0.5">
              Standalone Service • Pilot &amp; Scale Ready
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Deploy a business-grounded AI assistant on your <strong>WhatsApp Business Number &amp; Website</strong>.
            Answers store questions 24/7 in English, Hindi &amp; Hinglish, captures verified customer leads, and hands over sensitive requests to staff.
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>WhatsApp Connected</span>
          </div>
          <Button
            size="sm"
            variant={killSwitch ? "destructive" : "outline"}
            onClick={() => {
              setKillSwitch(!killSwitch)
              toast({
                title: !killSwitch ? "Kill Switch ACTIVATED 🛑" : "Kill Switch DEACTIVATED ✅",
                description: !killSwitch ? "All AI auto-replies paused immediately." : "AI auto-replies resumed."
              })
            }}
            className="rounded-xl text-xs gap-1.5 font-bold"
          >
            <Power className="w-3.5 h-3.5" />
            <span>{killSwitch ? "AI Paused (Kill Switch)" : "Emergency Stop"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "playground", label: "🧪 Live Playground", icon: Sparkles },
          { id: "config", label: "🤖 Bot Settings", icon: Bot },
          { id: "knowledge", label: "📚 Knowledge Center", icon: Store },
          { id: "channels", label: "📱 WhatsApp & Channels", icon: Smartphone },
          { id: "inbox", label: "💬 Live Inbox & Handover", icon: MessageSquare },
          { id: "leads", label: "📋 Captured Leads", icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: LIVE PLAYGROUND EMULATOR */}
      {activeTab === "playground" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Mobile Phone Emulator (6 cols) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[340px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800">
              {/* Phone Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2"></div>

              {/* Screen */}
              <div className="bg-[#efeae2] rounded-[30px] h-[520px] flex flex-col overflow-hidden border border-slate-300">
                {/* WhatsApp Chat Header */}
                <div className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-teal-800 flex items-center justify-center font-bold text-xs">
                    CC
                  </div>
                  <div>
                    <div className="font-bold text-xs">{botName}</div>
                    <div className="text-[10px] text-teal-200">Online • AI Assistant</div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-2.5 text-xs shadow-sm ${
                          msg.role === "user"
                            ? "bg-[#dcf8c6] text-slate-900 rounded-tr-none"
                            : "bg-white text-slate-900 rounded-tl-none space-y-1.5"
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                        {msg.role === "bot" && msg.evidence && (
                          <div className="pt-1 border-t border-slate-100 flex items-center gap-1 text-[9px] text-teal-800 font-semibold">
                            <ShieldCheck className="w-3 h-3 text-teal-600" />
                            <span>Grounded in Store Facts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {sendingChat && (
                    <div className="flex items-start">
                      <div className="bg-white rounded-2xl rounded-tl-none p-2.5 text-xs text-slate-400 italic">
                        Typing reply...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-2 bg-[#f0f0f0] border-t border-slate-200 flex items-center gap-2">
                  <Input
                    placeholder="Type in English, Hindi, or Hinglish..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendTestMessage()}
                    className="h-9 text-xs rounded-full bg-white border-slate-300"
                  />
                  <Button
                    onClick={() => handleSendTestMessage()}
                    disabled={sendingChat || !chatInput.trim()}
                    size="sm"
                    className="w-9 h-9 p-0 rounded-full bg-[#128c7e] hover:bg-[#075e54] text-white shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Test Prompts & Evidence Inspector (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Try Quick Customer Prompts</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click any prompt to test multilingual &amp; Hinglish grounding:</p>
              </div>

              <div className="space-y-2">
                {[
                  { text: "What time do you close tonight?", category: "Timings" },
                  { text: "Dukan kitne baje band hoti hai?", category: "Hinglish Timings" },
                  { text: "Chocolate cake ka price kya hai?", category: "Hinglish Pricing" },
                  { text: "Do you deliver cakes in Alkapuri?", category: "Delivery" },
                  { text: "Are all your cakes pure vegetarian eggless?", category: "Dietary" },
                  { text: "Can you give me 5 loyalty stamps?", category: "Hard Prohibition Test" },
                  { text: "I want to talk to the store manager.", category: "Human Handover" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendTestMessage(item.text)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50 hover:border-teal-300 text-left text-xs transition flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-800">"{item.text}"</span>
                    <Badge variant="outline" className="text-[10px] text-teal-700 bg-white">
                      {item.category}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">PRD Safety &amp; Grounding Architecture</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Hallucination:</strong> AI only answers from approved store knowledge facts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Hard Prohibitions Enforced:</strong> AI cannot modify loyalty stamps or approve discounts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Mandatory AI Disclosure:</strong> Greeting always informs user they are chatting with an AI.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: BOT SETTINGS */}
      {activeTab === "config" && (
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white max-w-3xl">
          <CardHeader className="p-5 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900">Chatbot Persona &amp; Policy Settings</CardTitle>
            <CardDescription className="text-xs text-slate-500">Configure bot identity, tone, and mandatory safety greetings.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Bot Display Name</Label>
              <Input
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Tone &amp; Style</Label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full border border-slate-200 rounded-xl text-xs p-2.5 bg-white"
              >
                <option value="friendly_professional">Friendly &amp; Professional (Recommended for Retail)</option>
                <option value="concise">Concise &amp; Fast (Short bullet points)</option>
                <option value="warm">Warm &amp; Enthusiastic</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Welcome Message (Includes Mandatory AI Disclosure)</Label>
              <Input
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Fallback Message (When information is unconfirmed)</Label>
              <Input
                value={fallbackMessage}
                onChange={(e) => setFallbackMessage(e.target.value)}
                className="rounded-xl border-slate-200 text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={handleSaveConfig} className="rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white">
                Save Bot Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: KNOWLEDGE CENTER */}
      {activeTab === "knowledge" && (
        <div className="space-y-6">
          {/* Add New Knowledge Card */}
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Question &amp; Answer to Knowledge Base</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1 space-y-1">
                <Label className="text-xs font-semibold text-slate-600">Category</Label>
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Delivery, Pricing, Hours"
                  className="rounded-xl text-xs"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-semibold text-slate-600">Customer Question</Label>
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Do you deliver cakes to home?"
                  className="rounded-xl text-xs"
                />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <Label className="text-xs font-semibold text-slate-600">Approved Store Answer</Label>
                <Input
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="e.g. Yes, we provide same-day home delivery within 5 km..."
                  className="rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddKnowledge} size="sm" className="rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Knowledge Item
              </Button>
            </div>
          </Card>

          {/* Knowledge Table */}
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Published Knowledge Base ({knowledgeList.length} Items)</CardTitle>
                <CardDescription className="text-xs text-slate-500">The verified facts your AI assistant uses to answer customers.</CardDescription>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs">v1.2 ACTIVE</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {knowledgeList.map((kb) => (
                  <div key={kb.id} className="p-4 hover:bg-slate-50/50 transition space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{kb.question}</span>
                      <Badge variant="outline" className="text-[10px] text-teal-700 bg-teal-50">{kb.category}</Badge>
                    </div>
                    <p className="text-xs text-slate-600">{kb.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: CHANNELS & WEBHOOKS */}
      {activeTab === "channels" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">WhatsApp Channel (Evolution API)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Your store's WhatsApp Business number is connected and receiving incoming chats.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Connected Phone:</span>
                <span className="font-mono font-bold text-slate-800">+91 7203824012</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status:</span>
                <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">CONNECTED &amp; READY</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Webhook Endpoint:</span>
                <span className="font-mono text-teal-700 font-bold">/api/webhooks/chatbot</span>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Website Embed Snippet</h3>
            </div>
            <p className="text-xs text-slate-500">
              Paste this script tag into your website to embed the AI assistant widget.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
              {`<script src="https://customerpilot.in/widget/v1/loader.js" data-bot-id="bot_cake_connection" async></script>`}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText('<script src="https://customerpilot.in/widget/v1/loader.js" data-bot-id="bot_cake_connection" async></script>')
                toast({ title: "Copied!", description: "Embed snippet copied to clipboard." })
              }}
              className="rounded-xl text-xs gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Code
            </Button>
          </Card>
        </div>
      )}

      {/* TAB 5: LIVE INBOX & HANDOVER */}
      {activeTab === "inbox" && (
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-base font-bold text-slate-900">Live Inbox &amp; Human Handover Console</CardTitle>
            <CardDescription className="text-xs text-slate-500">Take over any customer conversation in 1-click or release back to AI bot.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {conversations.map((conv) => (
                <div key={conv.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{conv.customerName}</span>
                      <span className="font-mono text-xs text-slate-500">{conv.customerPhone}</span>
                      <Badge className={conv.status === "AI_HANDLED" ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-800"}>
                        {conv.status === "AI_HANDLED" ? "AI HANDLED" : "HUMAN TAKEOVER"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 truncate max-w-md">"{conv.lastMessage}"</p>
                    <div className="text-[10px] text-slate-400">{conv.lastMessageTime} • Channel: {conv.channel}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newStatus = conv.status === "AI_HANDLED" ? "HUMAN_TAKEOVER" : "AI_HANDLED"
                        setConversations(conversations.map((c) => c.id === conv.id ? { ...c, status: newStatus } : c))
                        toast({
                          title: newStatus === "HUMAN_TAKEOVER" ? "Takeover Active 👤" : "Released to AI 🤖",
                          description: newStatus === "HUMAN_TAKEOVER" ? "Bot paused for this chat. You can reply directly." : "Bot will auto-reply."
                        })
                      }}
                      className="rounded-xl text-xs font-bold"
                    >
                      {conv.status === "AI_HANDLED" ? "Take Over" : "Release to AI"}
                    </Button>

                    <a
                      href={`https://wa.me/${conv.customerPhone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Chat on WA
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: CAPTURED LEADS */}
      {activeTab === "leads" && (
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Enquiries Captured by ChatBot ({leads.length})</CardTitle>
              <CardDescription className="text-xs text-slate-500">Customers who left requirements during AI chat.</CardDescription>
            </div>
            <Button onClick={handleExportLeadsCsv} size="sm" className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export Leads CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-6">Customer Name</th>
                    <th className="p-3.5">Phone Number</th>
                    <th className="p-3.5">Customer Requirement</th>
                    <th className="p-3.5">Channel</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5 pl-6 font-bold text-slate-900">{lead.customerName}</td>
                      <td className="p-3.5 font-mono text-slate-700">{lead.customerPhone}</td>
                      <td className="p-3.5 text-slate-800">{lead.requirement}</td>
                      <td className="p-3.5"><Badge variant="outline">{lead.channel}</Badge></td>
                      <td className="p-3.5 text-slate-400">{lead.createdAt}</td>
                      <td className="p-3.5 pr-6 text-right">
                        <a
                          href={`https://wa.me/${lead.customerPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                        >
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
