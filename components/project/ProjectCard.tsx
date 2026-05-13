"use client"

import { Project } from "@/types"
import Link from "next/link"
import { Trash2, FolderKanban } from "lucide-react"

interface Props {
  project: Project
  onDeleted: () => void
}

export function ProjectCard({ project, onDeleted }: Props) {
  async function handleDelete() {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" })
    onDeleted()
  }

  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-[#383A40] bg-[#313338] p-5 transition hover:border-[#5865F2]/50 hover:shadow-lg hover:shadow-[#5865F2]/10">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/projects/${project.id}`} className="flex items-center gap-2 flex-1 min-w-0">
          <FolderKanban className="h-5 w-5 shrink-0 text-[#5865F2]" />
          <h3 className="truncate font-semibold text-white hover:text-[#5865F2] transition">
            {project.name}
          </h3>
        </Link>
        <button
          onClick={handleDelete}
          className="shrink-0 rounded-lg p-1.5 text-[#B5BAC1] opacity-0 transition hover:bg-[#ED4245]/10 hover:text-[#ED4245] group-hover:opacity-100"
          title="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      {project.description && (
        <p className="line-clamp-2 text-sm text-[#B5BAC1]">{project.description}</p>
      )}
      <p className="text-xs text-[#B5BAC1]">
        Created {new Date(project.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}
