"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Project } from "@/types"

interface Props {
  guildId: string
  onClose: () => void
  onCreated: (project: Project) => void
}

export function CreateProjectModal({ guildId, onClose, onCreated }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null, guild_id: guildId }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Failed to create project")
      setLoading(false)
      return
    }
    onCreated(await res.json())
  }

  return (
    <Modal title="New Project" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#B5BAC1]">Name *</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My awesome project"
            className="w-full rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2.5 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#B5BAC1]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
            className="w-full resize-none rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2.5 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
          />
        </div>
        {error && <p className="text-xs text-[#ED4245]">{error}</p>}
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="w-full rounded-xl bg-[#5865F2] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4752C4] disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Project"}
        </button>
      </form>
    </Modal>
  )
}
