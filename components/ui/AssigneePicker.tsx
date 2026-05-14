"use client"

import { useState, useEffect, useRef } from "react"
import { DbUser } from "@/types"
import { X } from "lucide-react"

interface PickerProps {
  selected: DbUser[]
  onChange: (users: DbUser[]) => void
  placeholder?: string
}

export function AssigneePicker({ selected, onChange, placeholder = "Search users…" }: PickerProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<DbUser[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    clearTimeout(timer.current)
    if (!query.trim()) { setResults([]); return }
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data: DbUser[] = await res.json()
        setResults(data.filter((u) => !selected.some((s) => s.discord_id === u.discord_id)))
      }
    }, 250)
  }, [query, selected])

  function add(user: DbUser) {
    onChange([...selected, user])
    setQuery("")
    setResults([])
    setShowDropdown(false)
  }

  function remove(id: string) {
    onChange(selected.filter((u) => u.discord_id !== id))
  }

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((u) => (
            <div
              key={u.discord_id}
              className="flex items-center gap-1 rounded-full bg-[#5865F2]/20 px-2 py-0.5 text-xs text-white"
            >
              {u.avatar_url && (
                <img src={u.avatar_url} alt="" className="h-4 w-4 rounded-full" />
              )}
              <span>{u.username}</span>
              <button
                type="button"
                onClick={() => remove(u.discord_id)}
                className="text-[#B5BAC1] hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true) }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
        />
        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[#383A40] bg-[#313338] shadow-xl">
            {results.map((u) => (
              <button
                key={u.discord_id}
                type="button"
                onClick={() => add(u)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white transition hover:bg-[#383A40]"
              >
                {u.avatar_url && <img src={u.avatar_url} alt="" className="h-5 w-5 rounded-full" />}
                {u.username}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface StackProps {
  assignees: DbUser[]
  max?: number
  size?: "sm" | "md"
}

function Avatar({ user, size }: { user: DbUser; size: "sm" | "md" }) {
  const cls = size === "sm" ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-xs"
  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.username}
        title={user.username}
        className={`${cls} rounded-full ring-2 ring-[#313338]`}
      />
    )
  }
  return (
    <div
      className={`${cls} flex items-center justify-center rounded-full bg-[#5865F2] font-bold text-white ring-2 ring-[#313338]`}
      title={user.username}
    >
      {user.username[0].toUpperCase()}
    </div>
  )
}

export function AssigneeStack({ assignees, max = 3, size = "sm" }: StackProps) {
  if (!assignees.length) return null
  const visible = assignees.slice(0, max)
  const extra = assignees.length - max
  const cls = size === "sm" ? "h-5 w-5 text-[10px]" : "h-6 w-6 text-xs"
  return (
    <div className="flex items-center">
      {visible.map((u, i) => (
        <div key={u.discord_id} style={{ marginLeft: i > 0 ? "-6px" : 0 }}>
          <Avatar user={u} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className={`${cls} -ml-1.5 flex items-center justify-center rounded-full bg-[#383A40] font-medium text-[#B5BAC1] ring-2 ring-[#313338]`}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
