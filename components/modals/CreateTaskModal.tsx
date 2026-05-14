"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Task, DbUser } from "@/types"
import { AssigneePicker } from "@/components/ui/AssigneePicker"

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
  const [assignees, setAssignees] = useState<DbUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        assigned_to: assignees.length ? assignees.map((u) => u.discord_id) : null,
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

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#B5BAC1]">Assign to</label>
          <AssigneePicker selected={assignees} onChange={setAssignees} />
        </div>

        {existingTasks.length > 0 && (
          <p className="text-xs text-[#B5BAC1]">
            {existingTasks.length + 1} tasks total — equal weight for progress.
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
