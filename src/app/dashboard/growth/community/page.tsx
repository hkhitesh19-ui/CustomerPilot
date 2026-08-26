"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, MessageCircle, ExternalLink } from "lucide-react"

export default function CommunityPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Users className="h-8 w-8 text-emerald-500" />
          Growth Community
        </h1>
        <p className="text-slate-400 mt-2">Connect with fellow merchants and share growth strategies.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/60 border-slate-800/60 md:col-span-2">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <MessageCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Local Business Growth Club</h2>
              <p className="text-slate-400 mt-2 max-w-md mx-auto">Join our exclusive WhatsApp community for CustomerPilot merchants. Get tips, ask questions, and grow together.</p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-6 h-auto">
              Join WhatsApp Community <ExternalLink className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/60">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <h4 className="font-medium text-slate-200">Google Review Growth Workshop</h4>
              <p className="text-sm text-slate-400 mt-1">Friday 4:00 PM</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <h4 className="font-medium text-slate-200">Loyalty Program Best Practices</h4>
              <p className="text-sm text-slate-400 mt-1">Next Monday 2:00 PM</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
