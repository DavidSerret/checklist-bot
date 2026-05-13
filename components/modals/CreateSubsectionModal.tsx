"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Subsection } from "@/types"

interface Props {
  sectionId: string
  parentId?: string | null
  onClose: () => void
  onCreated: (subsection: Subsection) => void
}

export function CreateSubsectionModal({ sectionId, parentId, onClose, onCreated }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    const res = await fetch("/api/subsections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_id: sectionId,
        name: name.trim(),
        description: description.trim() || null,
        parent_id: parentId ?? null,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Failed to create subsection")
      setLoading(false)
      return
    }
    onCreated(await res.json())
  }

  return (
    <Modal title="New Subsection" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#B5BAC1]">Name *</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="OAuth setup"
            className="w-full rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2.5 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#B5BAC1]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={2}
            className="w-full resize-none rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2.5 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
          />
        </div>
        {error && <p className="text-xs text-[#ED4245]">{error}</p>}
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="w-full rounded-xl bg-[#5865F2] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4752C4] disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Subsection"}
        </button>
      </form>
    </Modal>
  )
}
