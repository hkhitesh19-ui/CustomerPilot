import type { ReactNode } from "react";

export default function AeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1E293B] antialiased">
      {children}
    </div>
  );
}
