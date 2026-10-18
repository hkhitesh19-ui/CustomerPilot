"use client"

import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, ShieldAlert } from "lucide-react"

export default function CustomerReferralsPage() {
  const { data, isLoading } = useDashboardState()

  if (isLoading) {
    return <div className="p-8 text-slate-400 animate-pulse">Loading Referrals Data...</div>
  }

  // Assuming data.referrals exists or we fallback to empty
  const referrals = data?.referrals || []
  const approved = referrals.filter((r: any) => r.status === "APPROVED").length
  const pending = referrals.filter((r: any) => r.status === "PENDING").length
  const flagged = referrals.filter((r: any) => r.status === "FLAGGED").length

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <UserPlus className="h-8 w-8 text-amber-500" />
          Customer Referrals
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Manage customer-to-customer referrals and fraud protection.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500 dark:text-slate-400">Total Referrals</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{referrals.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500 dark:text-slate-400">Approved</div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{approved}</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500 dark:text-slate-400">Pending</div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm text-slate-500 dark:text-slate-400">Flagged</div>
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{flagged}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/60 md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-200">Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300">
                  <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Referrer</th>
                      <th className="px-6 py-4 font-semibold">Friend Phone</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {referrals.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{r.referrerName || "Customer"}</td>
                        <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">{r.friendPhone}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="border-indigo-500 text-indigo-600 dark:text-indigo-400">{r.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">No referrals recorded yet.</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/60 border-rose-200 dark:border-rose-900/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500 dark:text-rose-400" />
              Anti-Abuse
            </CardTitle>
          </CardHeader>
          <CardContent>
            {flagged > 0 ? (
              <div className="text-sm text-slate-800 dark:text-slate-300">
                You have {flagged} flagged referrals that look suspicious.
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                No suspicious activity detected.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
