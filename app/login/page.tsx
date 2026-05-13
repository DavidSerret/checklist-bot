"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.replace("/dashboard")
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5865F2] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      {/* Logo / branding */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#5865F2] text-4xl shadow-lg shadow-[#5865F2]/30">
          📋
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Checklist Bot</h1>
        <p className="text-center text-sm text-[#B5BAC1]">
          Project task manager for your Discord server
        </p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm rounded-2xl border border-[#1E1F22] bg-[#313338] p-8 shadow-xl">
        <h2 className="mb-1 text-center text-xl font-semibold text-white">Sign in</h2>
        <p className="mb-6 text-center text-sm text-[#B5BAC1]">
          Connect with your Discord account to continue
        </p>

        <button
          onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-5 py-3 font-semibold text-white transition-all hover:bg-[#4752C4] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#5865F2]/60"
        >
          {/* Discord icon */}
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.13 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
          </svg>
          Continue with Discord
        </button>
      </div>
    </div>
  )
}
