"use client"

import { useState, useEffect } from "react"
import { SubsectionNode, Task, DbUser, computeSectionProgress, getProgressHex, collectNodeTasks, Subsection } from "@/types"
import { TaskCard } from "./TaskCard"
import { Tooltip } from "@/components/ui/Tooltip"
import { AssigneePicker, AssigneeStack } from "@/components/ui/AssigneePicker"
import { CreateTaskModal } from "@/components/modals/CreateTaskModal"
import { CreateSubsectionModal } from "@/components/modals/CreateSubsectionModal"
import { ChevronDown, Plus, Trash2, Layers, UserPlus } from "lucide-react"
import { ProgressBar } from "@/components/ui/ProgressBar"

interface Props {
  node: SubsectionNode
  sectionId: string
  depth: number
  completionMap: Record<string, boolean>
  onTaskToggle: (id: string, completed: boolean) => void
  onUpdated: () => void
}

export function SubsectionCard({ node, sectionId, depth, completionMap, onTaskToggle, onUpdated }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddSub, setShowAddSub] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState(node.name)
  const [localName, setLocalName] = useState(node.name)
  const [localAssignees, setLocalAssignees] = useState<DbUser[]>(node.assignees ?? [])
  const [showAssigneePicker, setShowAssigneePicker] = useState(false)

  useEffect(() => {
    setLocalAssignees(node.assignees ?? [])
    setLocalName(node.name)
    setEditName(node.name)
  }, [node])

  async function saveName() {
    const trimmed = editName.trim()
    setEditingName(false)
    if (!trimmed || trimmed === localName) { setEditName(localName); return }
    setLocalName(trimmed)
    await fetch(`/api/subsections/${node.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    })
  }

  async function handleAssigneesChange(users: DbUser[]) {
    setLocalAssignees(users)
    setShowAssigneePicker(false)
    await fetch(`/api/subsections/${node.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigned_to: users.map((u) => u.discord_id) }),
    })
  }

  const allTasks = collectNodeTasks(node).map((t) => ({
    ...t,
    completed: completionMap[t.id] ?? t.completed,
  }))
  const pct = computeSectionProgress(allTasks)
  const color = getProgressHex(pct)

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    onUpdated()
  }

  async function deleteSubsection() {
    if (!confirm(`Delete "${node.name}" and all its contents?`)) return
    await fetch(`/api/subsections/${node.id}`, { method: "DELETE" })
    onUpdated()
  }

  const indent = depth > 0 ? "ml-4" : ""

  return (
    <div className={`rounded-xl border border-[#383A40] bg-[#2B2D31] ${indent}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded p-0.5 text-[#B5BAC1] hover:text-white transition"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`}
          />
        </button>

        {editingName ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setEditingName(false); setEditName(localName) } }}
            className="flex-1 rounded-lg border border-[#5865F2]/60 bg-[#313338] px-2 py-0.5 text-sm font-medium text-white outline-none"
          />
        ) : (
          <Tooltip content={node.description}>
            <span
              className="flex-1 text-sm font-medium text-white cursor-default"
              onDoubleClick={() => { setEditingName(true); setEditName(localName) }}
              title="Doble clic para renombrar"
            >
              {localName}
            </span>
          </Tooltip>
        )}

        <span className="text-xs font-medium" style={{ color }}>{pct}%</span>

        {/* Assignees */}
        <div className="relative">
          {localAssignees.length > 0 ? (
            <button onClick={() => setShowAssigneePicker((p) => !p)} title="Edit assignees">
              <AssigneeStack assignees={localAssignees} size="sm" />
            </button>
          ) : (
            <button
              onClick={() => setShowAssigneePicker((p) => !p)}
              className="rounded-lg p-1 text-[#B5BAC1] hover:text-[#5865F2] transition"
              title="Assign subsection"
            >
              <UserPlus className="h-3.5 w-3.5" />
            </button>
          )}
          {showAssigneePicker && (
            <div className="absolute right-0 top-7 z-50 w-56 rounded-xl border border-[#383A40] bg-[#313338] p-2 shadow-xl">
              <AssigneePicker selected={localAssignees} onChange={handleAssigneesChange} />
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAddSub(true)}
          className="rounded-lg p-1 text-[#B5BAC1] hover:text-[#5865F2] transition"
          title="Add nested subsection"
        >
          <Layers className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setShowAddTask(true)}
          className="rounded-lg p-1 text-[#B5BAC1] hover:text-[#5865F2] transition"
          title="Add task"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={deleteSubsection}
          className="rounded-lg p-1 text-[#B5BAC1] hover:text-[#ED4245] transition"
          title="Delete subsection"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-3 pb-1">
        <ProgressBar percent={pct} />
      </div>

      {!collapsed && (
        <div className="space-y-1 px-3 pb-3 pt-2">
          {node.tasks.length === 0 && node.children.length === 0 && (
            <p className="text-xs text-[#B5BAC1] italic">No tasks yet.</p>
          )}
          {node.tasks.map((task: Task) => (
            <TaskCard
              key={task.id}
              task={{ ...task, completed: completionMap[task.id] ?? task.completed }}
              onToggle={onTaskToggle}
              onDelete={deleteTask}
            />
          ))}
          {node.children.map((child) => (
            <SubsectionCard
              key={child.id}
              node={child}
              sectionId={sectionId}
              depth={depth + 1}
              completionMap={completionMap}
              onTaskToggle={onTaskToggle}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}

      {showAddTask && (
        <CreateTaskModal
          sectionId={sectionId}
          subsectionId={node.id}
          existingTasks={node.tasks}
          onClose={() => setShowAddTask(false)}
          onCreated={() => { setShowAddTask(false); onUpdated() }}
        />
      )}

      {showAddSub && (
        <CreateSubsectionModal
          sectionId={sectionId}
          parentId={node.id}
          onClose={() => setShowAddSub(false)}
          onCreated={(_ss: Subsection) => { setShowAddSub(false); onUpdated() }}
        />
      )}
    </div>
  )
}
