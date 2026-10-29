"use client"

import React, { useState, useEffect } from "react"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Send,
  ShieldAlert,
  Smartphone,
  QrCode,
  WifiOff,
  Clock,
  ExternalLink
} from "lucide-react"

interface DiagnosisItem {
  merchantId: string
  merchantName: string
  merchantPhone: string
  instanceName: string | null
  status: "HEALTHY" | "ISSUE_DETECTED"
  issueType: string | null
  reasonDetail: string
  disconnectionCode: number | null
  disconnectionAt: string | null
  alertAction: string
  messageBody?: string
  lastAlertSentAt?: string | null
}

interface FleetReport {
  timestamp: string
  totalMerchants: number
  healthyCount: number
  issueCount: number
  alertsSentCount: number
  cooldownSkippedCount: number
  diagnoses: DiagnosisItem[]
}

export function WhatsAppFleetMonitor() {
  const [report, setReport] = useState<FleetReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [runningAlerts, setRunningAlerts] = useState(false)
  const [activeTab, setActiveTab] = useState<"ALL" | "ISSUES" | "HEALTHY">("ALL")
  const [selectedPreview, setSelectedPreview] = useState<DiagnosisItem | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setFeedback(null)
    try {
      const res = await fetch("/api/admin/whatsapp-monitor?dryRun=true")
      const json = await res.json()
      if (json.ok && json.report) {
        setReport(json.report)
      } else {
        setFeedback(json.error || "Failed to load WhatsApp fleet status")
      }
    } catch (e: any) {
      setFeedback(e.message || "Network error fetching monitor status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleRunAlerts = async (merchantId?: string, forceSend = false) => {
    setRunningAlerts(true)
    setFeedback(null)
    try {
      const res = await fetch("/api/admin/whatsapp-monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, forceSend, dryRun: false })
      })
      const json = await res.json()
      if (json.ok) {
        setFeedback(json.message || "Targeted alerts processed successfully!")
        if (json.report) setReport(json.report)
      } else {
        setFeedback(`Error: ${json.error || "Failed to dispatch alerts"}`)
      }
    } catch (e: any) {
      setFeedback(`Error: ${e.message}`)
    } finally {
      setRunningAlerts(false)
    }
  }

  const getIssueBadge = (type: string | null) => {
    switch (type) {
      case "SESSION_LOGGED_OUT_401":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" /> 401 Phone Unlinked
          </span>
        )
      case "QR_SCAN_PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <QrCode className="w-3 h-3 text-amber-600" /> QR Scan Pending
          </span>
        )
      case "PHONE_OFFLINE_OR_TIMEOUT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
            <WifiOff className="w-3 h-3 text-orange-600" /> Phone Offline
          </span>
        )
      case "ACCOUNT_RESTRICTED_403":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldAlert className="w-3 h-3 text-purple-600" /> 403 Restricted
          </span>
        )
      case "INSTANCE_NOT_CONFIGURED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            <Smartphone className="w-3 h-3 text-slate-500" /> Not Configured
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Online &amp; Healthy
          </span>
        )
    }
  }

  const filteredDiagnoses = (report?.diagnoses || []).filter(item => {
    if (activeTab === "ISSUES") return item.status === "ISSUE_DETECTED"
    if (activeTab === "HEALTHY") return item.status === "HEALTHY"
    return true
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 font-sans">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
              SuperAdmin Fleet Defense
            </span>
            <span className="text-xs text-slate-400">
              Sender: +91 9033304707
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            WhatsApp Disconnection &amp; Targeted Alert Engine
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Real-time Baileys gateway health monitoring. Automatically detects unlinked devices and sends personalized Hinglish alerts to affected stores only.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh State
          </button>
          <button
            onClick={() => handleRunAlerts(undefined, false)}
            disabled={runningAlerts}
            className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {runningAlerts ? "Scanning & Alerting..." : "Scan Fleet & Alert Disconnected"}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-xl flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-blue-500 hover:text-blue-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Merchants</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{report?.totalMerchants ?? "—"}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active &amp; Online
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{report?.healthyCount ?? "—"}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-200/80 shadow-2xs">
          <div className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-red-600" /> Issues Detected
          </div>
          <div className="text-2xl font-black text-red-700 mt-1">{report?.issueCount ?? "—"}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-indigo-200/80 shadow-2xs">
          <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-indigo-600" /> Cooldown Active
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{report?.cooldownSkippedCount ?? "0"}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 pt-4 border-b border-slate-100 flex items-center gap-2">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          All Stores ({report?.totalMerchants ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("ISSUES")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "ISSUES" ? "bg-red-600 text-white" : "text-red-700 hover:bg-red-50"
          }`}
        >
          Needs Attention ({report?.issueCount ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("HEALTHY")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === "HEALTHY" ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          Online ({report?.healthyCount ?? 0})
        </button>
      </div>

      {/* Merchants Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Store Name</th>
              <th className="px-6 py-3">Store WhatsApp</th>
              <th className="px-6 py-3">Live Status</th>
              <th className="px-6 py-3">Issue Diagnosis</th>
              <th className="px-6 py-3 text-right">Targeted Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDiagnoses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                  {loading ? "Checking WhatsApp fleet status..." : "No merchants found matching filter."}
                </td>
              </tr>
            ) : (
              filteredDiagnoses.map(item => (
                <tr key={item.merchantId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="font-bold text-slate-900 text-sm">{item.merchantName}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.instanceName || "No instance"}</div>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-700">
                    {item.merchantPhone ? `+${item.merchantPhone}` : <span className="text-slate-400 italic">Not provided</span>}
                  </td>
                  <td className="px-6 py-3.5">
                    {getIssueBadge(item.issueType)}
                  </td>
                  <td className="px-6 py-3.5 max-w-xs">
                    <div className="text-slate-700 font-medium truncate" title={item.reasonDetail}>
                      {item.reasonDetail}
                    </div>
                    {item.disconnectionAt && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Disconnected: {new Date(item.disconnectionAt).toLocaleString("en-IN")}
                      </div>
                    )}
                    {item.lastAlertSentAt && (
                      <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                        Last Alert: {new Date(item.lastAlertSentAt).toLocaleTimeString("en-IN")} (Cooldown active)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {item.messageBody && (
                        <button
                          onClick={() => setSelectedPreview(item)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-semibold"
                        >
                          Preview Message
                        </button>
                      )}
                      {item.status === "ISSUE_DETECTED" && (
                        <button
                          onClick={() => handleRunAlerts(item.merchantId, true)}
                          disabled={runningAlerts}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-2xs flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Send Alert
                        </button>
                      )}
                      {item.status === "HEALTHY" && (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> No Action Needed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Message Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Targeted WhatsApp Alert Preview</h3>
                <p className="text-xs text-slate-500">Recipient: {selectedPreview.merchantName} (+{selectedPreview.merchantPhone})</p>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-slate-800 text-xs whitespace-pre-wrap font-sans leading-relaxed">
              {selectedPreview.messageBody}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Dispatched from SuperAdmin: <strong>+91 9033304707</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPreview(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleRunAlerts(selectedPreview.merchantId, true)
                    setSelectedPreview(null)
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Send Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
