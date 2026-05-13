"use client"

import { useState } from "react"
import { Task } from "@/types"
import { Tooltip } from "@/components/ui/Tooltip"
import { Trash2 } from "lucide-react"

interface Props {
  task: Task
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

export function TaskCard({ task, onToggle, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)
  const [localTitle, setLocalTitle] = useState(task.title)

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

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-transparent bg-[#383A40] px-3 py-2.5 transition hover:border-[#5865F2]/30">
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
          onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") { setEditing(false); setEditValue(localTitle) } }}
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

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center gap-1.5 shrink-0">
          {task.assignee.avatar_url ? (
            <img
              src={task.assignee.avatar_url}
              alt={task.assignee.username}
              className="h-5 w-5 rounded-full"
              title={task.assignee.username}
            />
          ) : (
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5865F2] text-[10px] font-bold text-white"
              title={task.assignee.username}
            >
              {task.assignee.username[0].toUpperCase()}
            </div>
          )}
          <span className="hidden text-xs text-[#B5BAC1] sm:block">{task.assignee.username}</span>
        </div>
      )}

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
