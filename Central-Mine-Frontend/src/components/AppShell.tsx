import type { ReactNode } from 'react'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd] w-full" dir="rtl">
      {children}
    </div>
  )
}
