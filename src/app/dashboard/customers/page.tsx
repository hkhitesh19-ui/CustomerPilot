"use client"

import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Search, Star, MessageCircle } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function CustomersPage() {
  const { data, isLoading } = useDashboardState()
  const [search, setSearch] = useState("")

  if (isLoading) {
    return <div className="p-8 text-slate-400 animate-pulse">Loading Customers CRM...</div>
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load CRM data.</p>
        <Link href="/login" className="text-sm text-indigo-400 underline">Login again</Link>
      </div>
    )
  }

  const customers = data.customers || []
  
  const filteredCustomers = customers.filter((c: any) => 
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Customers CRM</h1>
        <p className="text-slate-400 mt-2">View and manage your loyal customer base.</p>
      </div>

      <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardHeader className="bg-slate-900/40 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <Users className="h-5 w-5" /> 
            {customers.length} Total Customers
          </CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Total Visits</th>
                    <th className="px-6 py-4 font-semibold">Lifetime Spend</th>
                    <th className="px-6 py-4 font-semibold">Joined Date</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer: any) => (
                      <tr key={customer.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-200">{customer.name || "Guest"}</div>
                          <div className="text-[10px] text-emerald-500 mt-1">{customer.whatsappOptIn ? "WhatsApp Opted-In" : ""}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-400">{customer.phone}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-indigo-500/20 text-indigo-400 py-1 px-3 rounded-full font-bold text-xs">
                            {customer.totalVisits}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-300">₹{(customer.lifetimeSpend || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-400">{new Date(customer.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/q/wallet/${customer.id}`} target="_blank">
                            <button className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded transition-colors">
                              View Wallet
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No customers found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-800/60">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer: any) => (
                  <div key={customer.id} className="p-4 flex flex-col gap-3 hover:bg-slate-800/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-200 text-base">{customer.name || "Guest"}</div>
                        <div className="font-mono text-slate-400 text-xs mt-0.5">{customer.phone}</div>
                      </div>
                      {customer.whatsappOptIn && (
                        <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          WhatsApp
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                      <div>
                        <div className="text-slate-500 text-xs">Total Visits</div>
                        <div className="font-bold text-indigo-400 mt-0.5">{customer.totalVisits}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-xs">Lifetime Spend</div>
                        <div className="font-medium text-slate-300 mt-0.5">₹{(customer.lifetimeSpend || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs text-slate-500">
                        Joined: {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                      <Link href={`/q/wallet/${customer.id}`} target="_blank">
                        <button className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-lg transition-colors w-full text-center">
                          View Wallet
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500 text-sm">
                  No customers found matching your search.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
