"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Project } from "@/types"
import { ProjectCard } from "@/components/project/ProjectCard"
import { CreateProjectModal } from "@/components/modals/CreateProjectModal"
import { Plus } from "lucide-react"

const GUILD_ID = process.env.NEXT_PUBLIC_GUILD_ID ?? "default"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  async function loadProjects() {
    const res = await fetch(`/api/projects?guild_id=${GUILD_ID}`)
    if (res.ok) setProjects(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadProjects() }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-[#B5BAC1]">
            Welcome back, <span className="text-white">{session?.user?.username}</span>
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4752C4] active:scale-95"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Project grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5865F2] border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#383A40] py-24 text-center">
          <div className="text-5xl">📋</div>
          <p className="text-[#B5BAC1]">No projects yet. Create your first one!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4752C4]"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onDeleted={() => setProjects((prev) => prev.filter((x) => x.id !== p.id))}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          guildId={GUILD_ID}
          onClose={() => setShowCreate(false)}
          onCreated={(p) => {
            setProjects((prev) => [p, ...prev])
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}
