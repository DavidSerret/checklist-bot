"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Project, Section, SubsectionNode, Task } from "@/types"
import { SectionCard } from "@/components/project/SectionCard"
import { CreateSectionModal } from "@/components/modals/CreateSectionModal"
import { SprintManager } from "@/components/project/SprintManager"
import { Sidebar } from "@/components/ui/Sidebar"
import { Plus, ChevronLeft, Settings2 } from "lucide-react"

type SectionWithData = Section & {
  tasks: Task[]
  subsections: SubsectionNode[]
}
type ProjectWithSections = Project & { sections: SectionWithData[] }

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [data, setData] = useState<ProjectWithSections | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showSprintMgr, setShowSprintMgr] = useState(false)
  const [sprint, setSprint] = useState("All Sprints")

  async function load() {
    const res = await fetch(`/api/projects/${id}`)
    if (res.ok) {
      const project = await res.json()
      // Ensure sprints array always exists (fallback for rows before migration)
      if (!project.sprints || project.sprints.length === 0) {
        project.sprints = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4"]
      }
      setData(project)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const sprints = data?.sprints ?? []
  const sections =
    sprint === "All Sprints"
      ? data?.sections ?? []
      : (data?.sections ?? []).filter((s) => s.sprint === sprint)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5865F2] border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#B5BAC1]">
        Project not found.
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Back */}
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-4 flex items-center gap-1 text-sm text-[#B5BAC1] hover:text-white transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </button>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{data.name}</h1>
              {data.description && (
                <p className="text-sm text-[#B5BAC1]">{data.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Sprint selector */}
              <select
                value={sprint}
                onChange={(e) => setSprint(e.target.value)}
                className="rounded-xl border border-[#383A40] bg-[#313338] px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-[#5865F2]/60"
              >
                <option value="All Sprints">All Sprints</option>
                {sprints.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Manage sprints */}
              <button
                onClick={() => setShowSprintMgr(true)}
                title="Manage sprints"
                className="rounded-xl border border-[#383A40] bg-[#313338] p-2 text-[#B5BAC1] hover:text-white transition"
              >
                <Settings2 className="h-4 w-4" />
              </button>

              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 rounded-xl bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4752C4] active:scale-95 transition"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </button>
            </div>
          </div>

          {/* Sections */}
          {sections.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#383A40] py-24 text-center">
              <p className="text-[#B5BAC1]">
                {data.sections.length === 0
                  ? "No sections yet. Add the first one!"
                  : `No sections in "${sprint}".`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onUpdated={load}
                  onDeleted={load}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateSectionModal
          projectId={id}
          availableSprints={sprints}
          onClose={() => setShowCreate(false)}
          onCreated={() => { load(); setShowCreate(false) }}
        />
      )}

      {showSprintMgr && (
        <SprintManager
          projectId={id}
          sprints={sprints}
          onClose={() => setShowSprintMgr(false)}
          onChanged={(updated) => {
            setData((prev) => prev ? { ...prev, sprints: updated } : prev)
            // If selected sprint was deleted, reset to All Sprints
            if (!updated.includes(sprint)) setSprint("All Sprints")
          }}
        />
      )}
    </div>
  )
}
