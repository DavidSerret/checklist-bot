"use client"

import { useState } from "react"
import { Task, DbUser } from "@/types"
import { Tooltip } from "@/components/ui/Tooltip"
import { AssigneePicker, AssigneeStack } from "@/components/ui/AssigneePicker"
import { Trash2, UserPlus } from "lucide-react"

interface Props {
  task: Task
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onToggle, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const [localTitle, setLocalTitle] = useState(task.title)
  const [localAssignees, setLocalAssignees] = useState<DbUser[]>(task.assignees ?? [])
  const [showPicker, setShowPicker] = useState(false)

  async function saveTitle() {
    const trimmed = editValue.trim()
    setEditing(false)
    if (!trimmed || trimmed === localTitle) { setEditValue(localTitle); return }
    setLocalTitle(trimmed)
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    })
  }

  async function handleAssigneesChange(users: DbUser[]) {
    setLocalAssignees(users)
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigned_to: users.map((u) => u.discord_id) }),
    })
    if (res.ok) {
      const data = await res.json()
      setLocalAssignees(data.assignees ?? [])
    }
  }

  return (
    <div className="group relative flex items-center gap-3 rounded-xl border border-transparent bg-[#383A40] px-3 py-2.5 transition hover:border-[#5865F2]/30">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
          task.completed
            ? "border-[#57F287] bg-[#57F287]"
            : "border-[#B5BAC1] hover:border-[#5865F2]"
        }`}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && (
          <svg className="h-3 w-3 text-black" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Title */}
      {editing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveTitle()
            if (e.key === "Escape") { setEditing(false); setEditValue(localTitle) }
          }}
          className="flex-1 rounded-lg border border-[#5865F2]/60 bg-[#2B2D31] px-2 py-0.5 text-sm text-white outline-none"
        />
      ) : (
        <Tooltip content={task.description}>
          <span
            className={`flex-1 text-sm ${task.completed ? "text-[#B5BAC1] line-through" : "text-white"} cursor-default`}
            onDoubleClick={() => { setEditing(true); setEditValue(localTitle) }}
            title="Doble clic para renombrar"
          >
            {localTitle}
          </span>
        </Tooltip>
      )}

      {/* Assignees */}
      <div className="relative shrink-0">
        {localAssignees.length > 0 ? (
          <button
            onClick={() => setShowPicker((p) => !p)}
            className="flex items-center"
            title="Edit assignees"
          >
            <AssigneeStack assignees={localAssignees} />
          </button>
        ) : (
          <button
            onClick={() => setShowPicker((p) => !p)}
            className="rounded-lg p-1 text-[#B5BAC1] opacity-0 transition hover:text-[#5865F2] group-hover:opacity-100"
            title="Assign"
          >
            <UserPlus className="h-3.5 w-3.5" />
          </button>
        )}

        {showPicker && (
          <div className="absolute right-0 top-7 z-50 w-56 rounded-xl border border-[#383A40] bg-[#313338] p-2 shadow-xl">
            <AssigneePicker
              selected={localAssignees}
              onChange={(users) => { handleAssigneesChange(users); setShowPicker(false) }}
              placeholder="Search users…"
            />
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 rounded-lg p-1 text-[#B5BAC1] opacity-0 transition hover:text-[#ED4245] group-hover:opacity-100"
        title="Delete task"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
