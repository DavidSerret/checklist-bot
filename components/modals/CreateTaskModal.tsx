"use client"

import { useState, useEffect, useRef } from "react"
import { Modal } from "@/components/ui/Modal"
import { Task, DbUser } from "@/types"

interface Props {
  sectionId: string
  subsectionId: string | null
  existingTasks: Task[]
  onClose: () => void
  onCreated: () => void
}

export function CreateTaskModal({ sectionId, subsectionId, existingTasks, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState<DbUser | null>(null)
  const [userQuery, setUserQuery] = useState("")
  const [userResults, setUserResults] = useState<DbUser[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    clearTimeout(searchRef.current)
    if (!userQuery.trim()) { setUserResults([]); return }
    searchRef.current = setTimeout(async () => {
      const res = await fetch(`/api/users?q=${encodeURIComponent(userQuery)}`)
      if (res.ok) setUserResults(await res.json())
    }, 250)
  }, [userQuery])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_id: sectionId,
        subsection_id: subsectionId,
        title: title.trim(),
        description: description.trim() || null,
        assigned_to: assignedTo?.discord_id ?? null,
      }),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Failed to create task")
      setLoading(false)
      return
    }
    onCreated()
  }

  return (
    <Modal title="New Task" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#B5BAC1]">Title *</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Implement login flow"
            className="w-full rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2.5 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#B5BAC1]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details…"
            rows={2}
            className="w-full resize-none rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2.5 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
          />
        </div>

        <div className="relative">
          <label className="mb-1.5 block text-xs font-medium text-[#B5BAC1]">Assign to</label>
          {assignedTo ? (
            <div className="flex items-center gap-2 rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2">
              {assignedTo.avatar_url && (
                <img src={assignedTo.avatar_url} alt="" className="h-5 w-5 rounded-full" />
              )}
              <span className="flex-1 text-sm text-white">{assignedTo.username}</span>
              <button
                type="button"
                onClick={() => { setAssignedTo(null); setUserQuery("") }}
                className="text-xs text-[#B5BAC1] hover:text-white"
              >
                ✕
              </button>
            </div>
          ) : (
            <input
              value={userQuery}
              onChange={(e) => { setUserQuery(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="Search by username…"
              className="w-full rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2.5 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
            />
          )}
          {showDropdown && userResults.length > 0 && !assignedTo && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-[#383A40] bg-[#313338] shadow-xl overflow-hidden">
              {userResults.map((u) => (
                <button
                  key={u.discord_id}
                  type="button"
                  onClick={() => { setAssignedTo(u); setShowDropdown(false) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#383A40] transition text-left"
                >
                  {u.avatar_url && <img src={u.avatar_url} alt="" className="h-5 w-5 rounded-full" />}
                  {u.username}
                </button>
              ))}
            </div>
          )}
        </div>

        {existingTasks.length > 0 && (
          <p className="text-xs text-[#B5BAC1]">
            Weights will be redistributed equally across {existingTasks.length + 1} tasks.
          </p>
        )}

        {error && <p className="text-xs text-[#ED4245]">{error}</p>}

        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="w-full rounded-xl bg-[#5865F2] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4752C4] disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Task"}
        </button>
      </form>
    </Modal>
  )
}
