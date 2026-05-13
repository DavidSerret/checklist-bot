"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Section } from "@/types"

interface Props {
  projectId: string
  availableSprints: string[]
  onClose: () => void
  onCreated: (section: Section) => void
}

export function CreateSectionModal({ projectId, availableSprints, onClose, onCreated }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sprint, setSprint] = useState(availableSprints[0] ?? "Sprint 1")
  const [customSprint, setCustomSprint] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveSprint = sprint === "__custom__" ? customSprint.trim() : sprint

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !effectiveSprint) return
    setLoading(true)
    setError(null)
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        name: name.trim(),
        description: description.trim() || null,
        sprint: effectiveSprint,
      }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Failed to create section")
      setLoading(false)
      return
    }
    onCreated(await res.json())
  }

  return (
    <Modal title="New Section" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#B5BAC1]">Name *</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Authentication"
            className="w-full rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2.5 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#B5BAC1]">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this section cover?"
            rows={2}
            className="w-full resize-none rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2.5 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#B5BAC1]">Sprint</label>
          <select
            value={sprint}
            onChange={(e) => setSprint(e.target.value)}
            className="w-full rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#5865F2]/60"
          >
            {availableSprints.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="__custom__">+ Custom sprint name…</option>
          </select>
          {sprint === "__custom__" && (
            <input
              autoFocus
              value={customSprint}
              onChange={(e) => setCustomSprint(e.target.value)}
              placeholder="e.g. Sprint 5"
              className="mt-2 w-full rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2.5 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
            />
          )}
        </div>
        {error && <p className="text-xs text-[#ED4245]">{error}</p>}
        <button
          type="submit"
          disabled={!name.trim() || !effectiveSprint || loading}
          className="w-full rounded-xl bg-[#5865F2] py-2.5 text-sm font-semibold text-white transition hover:bg-[#4752C4] disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Section"}
        </button>
      </form>
    </Modal>
  )
}
