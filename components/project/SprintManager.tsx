"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import { Plus, Pencil, Trash2, Check, X } from "lucide-react"

interface Props {
  projectId: string
  sprints: string[]
  onClose: () => void
  onChanged: (sprints: string[]) => void
}

export function SprintManager({ projectId, sprints, onClose, onChanged }: Props) {
  const [list, setList] = useState<string[]>(sprints)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function patch(body: Record<string, unknown>) {
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/projects/${projectId}/sprints`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? "Error")
      return null
    }
    return res.json()
  }

  async function startEdit(idx: number) {
    setEditingIdx(idx)
    setEditValue(list[idx])
  }

  async function confirmRename(idx: number) {
    const from = list[idx]
    const to = editValue.trim()
    if (!to || to === from) { setEditingIdx(null); return }
    if (list.some((s, i) => i !== idx && s === to)) {
      setError("A sprint with that name already exists.")
      return
    }
    const data = await patch({ action: "rename", from, to })
    if (!data) return
    const updated = list.map((s, i) => (i === idx ? to : s))
    setList(updated)
    onChanged(updated)
    setEditingIdx(null)
  }

  async function deleteSprint(idx: number) {
    if (list.length === 1) { setError("Cannot delete the last sprint."); return }
    const name = list[idx]
    const fallback = list[idx === 0 ? 1 : 0]
    const data = await patch({ action: "delete", name, fallback })
    if (!data) return
    const updated = list.filter((_, i) => i !== idx)
    setList(updated)
    onChanged(updated)
  }

  async function addSprint() {
    const name = newName.trim()
    if (!name) return
    if (list.includes(name)) { setError("Already exists."); return }
    const updated = [...list, name]
    const data = await patch({ action: "set", sprints: updated })
    if (!data) return
    setList(updated)
    onChanged(updated)
    setNewName("")
  }

  return (
    <Modal title="Manage Sprints" onClose={onClose}>
      <div className="space-y-2">
        {list.map((sprint, idx) => (
          <div key={sprint} className="flex items-center gap-2 rounded-xl bg-[#2B2D31] px-3 py-2">
            {editingIdx === idx ? (
              <>
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmRename(idx)
                    if (e.key === "Escape") setEditingIdx(null)
                  }}
                  className="flex-1 rounded-lg border border-[#383A40] bg-[#313338] px-2 py-1 text-sm text-white outline-none focus:ring-2 focus:ring-[#5865F2]/60"
                />
                <button
                  onClick={() => confirmRename(idx)}
                  disabled={saving}
                  className="rounded-lg p-1 text-[#57F287] hover:bg-[#57F287]/10 transition"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditingIdx(null)}
                  className="rounded-lg p-1 text-[#B5BAC1] hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-white">{sprint}</span>
                <button
                  onClick={() => startEdit(idx)}
                  className="rounded-lg p-1 text-[#B5BAC1] hover:text-white transition"
                  title="Rename"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteSprint(idx)}
                  disabled={saving}
                  className="rounded-lg p-1 text-[#B5BAC1] hover:text-[#ED4245] transition"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new sprint */}
      <div className="mt-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addSprint() }}
          placeholder="New sprint name…"
          className="flex-1 rounded-xl border border-[#383A40] bg-[#2B2D31] px-3 py-2 text-sm text-white placeholder-[#B5BAC1] outline-none focus:ring-2 focus:ring-[#5865F2]/60"
        />
        <button
          onClick={addSprint}
          disabled={!newName.trim() || saving}
          className="flex items-center gap-1.5 rounded-xl bg-[#5865F2] px-3 py-2 text-sm font-semibold text-white hover:bg-[#4752C4] disabled:opacity-50 transition"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-[#ED4245]">{error}</p>}
    </Modal>
  )
}
