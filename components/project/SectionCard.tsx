"use client"

import { useState, useEffect } from "react"
import { Section, SubsectionNode, Task, computeSectionProgress, getProgressHex, collectAllSectionTasks } from "@/types"
import { TaskCard } from "./TaskCard"
import { SubsectionCard } from "./SubsectionCard"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Tooltip } from "@/components/ui/Tooltip"
import { CreateTaskModal } from "@/components/modals/CreateTaskModal"
import { CreateSubsectionModal } from "@/components/modals/CreateSubsectionModal"
import { ChevronDown, Plus, Trash2, Layers } from "lucide-react"
import { Subsection } from "@/types"

type SectionWithData = Section & {
  tasks: Task[]
  subsections: SubsectionNode[]
}

interface Props {
  section: SectionWithData
  onUpdated: () => void
  onDeleted: () => void
}

export function SectionCard({ section: initial, onUpdated, onDeleted }: Props) {
  const [section, setSection] = useState<SectionWithData>(initial)
  const [completionMap, setCompletionMap] = useState<Record<string, boolean>>({})
  const [collapsed, setCollapsed] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddSub, setShowAddSub] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState(section.name)

  useEffect(() => {
    setSection(initial)
    setCompletionMap({})
    setEditName(initial.name)
  }, [initial])

  async function saveName() {
    const trimmed = editName.trim()
    setEditingName(false)
    if (!trimmed || trimmed === section.name) { setEditName(section.name); return }
    setSection((prev) => ({ ...prev, name: trimmed }))
    await fetch(`/api/sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    })
  }

  const allTasks = collectAllSectionTasks(section.tasks, section.subsections).map((t) => ({
    ...t,
    completed: completionMap[t.id] ?? t.completed,
  }))
  const pct = computeSectionProgress(allTasks)
  const color = getProgressHex(pct)

  function handleTaskToggle(id: string, completed: boolean) {
    setCompletionMap((prev) => ({ ...prev, [id]: completed }))
    fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    })
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    onUpdated()
  }

  async function deleteSection() {
    if (!confirm(`Delete section "${section.name}"? All tasks will be lost.`)) return
    await fetch(`/api/sections/${section.id}`, { method: "DELETE" })
    onDeleted()
  }

  return (
    <div className="rounded-2xl border border-[#383A40] bg-[#313338]">
      <div className="flex items-center gap-2 p-4">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-lg p-1 text-[#B5BAC1] hover:text-white transition"
        >
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`}
          />
        </button>

        {editingName ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setEditingName(false); setEditName(section.name) } }}
            className="flex-1 rounded-lg border border-[#5865F2]/60 bg-[#2B2D31] px-2 py-0.5 text-base font-semibold text-white outline-none"
          />
        ) : (
          <Tooltip content={section.description}>
            <h3
              className="flex-1 font-semibold text-white cursor-default"
              onDoubleClick={() => { setEditingName(true); setEditName(section.name) }}
              title="Doble clic para renombrar"
            >
              {section.name}
            </h3>
          </Tooltip>
        )}

        <span className="rounded-md bg-[#5865F2]/20 px-2 py-0.5 text-xs font-medium text-[#5865F2]">
          {section.sprint}
        </span>

        <span className="min-w-[3rem] text-right text-sm font-semibold" style={{ color }}>
          {pct}%
        </span>

        <button
          onClick={() => setShowAddSub(true)}
          title="Add subsection"
          className="rounded-lg p-1.5 text-[#B5BAC1] hover:text-[#5865F2] transition"
        >
          <Layers className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowAddTask(true)}
          title="Add task"
          className="rounded-lg p-1.5 text-[#B5BAC1] hover:text-[#5865F2] transition"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={deleteSection}
          title="Delete section"
          className="rounded-lg p-1.5 text-[#B5BAC1] hover:text-[#ED4245] transition"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pb-3">
        <ProgressBar percent={pct} />
      </div>

      {!collapsed && (
        <div className="space-y-2 px-4 pb-4">
          {section.tasks.length === 0 && section.subsections.length === 0 && (
            <p className="text-sm text-[#B5BAC1] italic">No tasks yet.</p>
          )}
          {section.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={{ ...task, completed: completionMap[task.id] ?? task.completed }}
              onToggle={handleTaskToggle}
              onDelete={deleteTask}
            />
          ))}
          {section.subsections.map((node) => (
            <SubsectionCard
              key={node.id}
              node={node}
              sectionId={section.id}
              depth={0}
              completionMap={completionMap}
              onTaskToggle={handleTaskToggle}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}

      {showAddTask && (
        <CreateTaskModal
          sectionId={section.id}
          subsectionId={null}
          existingTasks={section.tasks}
          onClose={() => setShowAddTask(false)}
          onCreated={() => { setShowAddTask(false); onUpdated() }}
        />
      )}

      {showAddSub && (
        <CreateSubsectionModal
          sectionId={section.id}
          onClose={() => setShowAddSub(false)}
          onCreated={(_ss: Subsection) => { setShowAddSub(false); onUpdated() }}
        />
      )}
    </div>
  )
}
