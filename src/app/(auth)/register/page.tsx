import { AuthForm } from '@/components/auth/AuthForm';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-stone-200 text-center">
        <img src="/cplogo.png" alt="CustomerPilot Logo" className="h-14 w-auto object-contain mx-auto mb-4" />
        <h1 className="text-2xl font-extrabold text-stone-900 mb-1">Merchant Registration</h1>
        <p className="text-xs text-stone-500 mb-6">Create your CustomerPilot merchant account</p>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
