"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogOut } from "lucide-react"

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[#1E1F22] bg-[#2B2D31] md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-[#1E1F22] px-4 py-4">
        <span className="text-2xl">📋</span>
        <span className="font-bold text-white">Checklist Bot</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
            pathname === "/dashboard"
              ? "bg-[#5865F2]/20 text-[#5865F2]"
              : "text-[#B5BAC1] hover:bg-[#383A40] hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </nav>

      {/* User */}
      {session && (
        <div className="border-t border-[#1E1F22] p-3">
          <div className="flex items-center gap-2 rounded-xl px-2 py-2">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.username}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5865F2] text-xs font-bold text-white">
                {(session.user.username ?? "?")[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {session.user.username}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg p-1 text-[#B5BAC1] hover:text-white transition"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
