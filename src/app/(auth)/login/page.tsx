import { AuthForm } from '@/components/auth/AuthForm';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Login — CustomerPilot',
  description: 'Login to your CustomerPilot merchant dashboard.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-6">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-xl tracking-tight">
            Customer<span className="text-emerald-400">Pilot</span>
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-white">Welcome Back</h1>
            <p className="text-slate-400 text-sm mt-1">Login to your merchant dashboard</p>
          </div>

          {/* Wrap AuthForm in dark theme overrides */}
          <style>{`
            .auth-dark input {
              background: rgba(255,255,255,0.05) !important;
              border-color: rgba(255,255,255,0.15) !important;
              color: white !important;
            }
            .auth-dark input::placeholder { color: #64748b !important; }
            .auth-dark input:focus { border-color: rgba(52,211,153,0.6) !important; }
            .auth-dark label { color: #cbd5e1 !important; font-size: 12px; font-weight: 600; }
            .auth-dark button[type=submit] {
              background: linear-gradient(90deg, #10b981, #6366f1) !important;
              height: 48px !important;
              border-radius: 12px !important;
              font-weight: 700 !important;
            }
            .auth-dark a { color: #34d399 !important; }
          `}</style>
          <div className="auth-dark">
            <AuthForm mode="login" />
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          © 2026 CustomerPilot.in · Made with ❤️ in India 🇮🇳
        </p>
      </div>
    </div>
  );
}
