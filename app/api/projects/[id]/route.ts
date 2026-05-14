import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

type Ctx = { params: Promise<{ id: string }> }

type RawSubsection = { id: string; section_id: string; parent_id: string | null; [key: string]: unknown }
type RawTask = { id: string; subsection_id: string | null; [key: string]: unknown }

function buildSubsectionTree(
  allSubs: RawSubsection[],
  allTasks: RawTask[],
  sectionId: string,
  parentId: string | null,
  attachFn?: (item: RawSubsection) => unknown
): unknown[] {
  return allSubs
    .filter((ss) => ss.section_id === sectionId && (ss.parent_id ?? null) === parentId)
    .map((ss) => {
      const node = {
        ...ss,
        tasks: allTasks.filter((t) => t.subsection_id === ss.id),
        children: buildSubsectionTree(allSubs, allTasks, sectionId, ss.id, attachFn),
      }
      return attachFn ? attachFn(node as unknown as RawSubsection) : node
    })
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const db = supabaseAdmin()

  const { data: project, error: pErr } = await db
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 404 })

  const { data: sections } = await db
    .from("sections")
    .select("*")
    .eq("project_id", id)
    .order("order")

  const sectionIds = (sections ?? []).map((s) => s.id)

  const [{ data: subsections }, { data: tasks }] = await Promise.all([
    db
      .from("subsections")
      .select("*")
      .in("section_id", sectionIds.length ? sectionIds : [""])
      .order("order"),
    db
      .from("tasks")
      .select("*")
      .in("section_id", sectionIds.length ? sectionIds : [""]),
  ])

  const allSubs = (subsections ?? []) as RawSubsection[]
  const allTasks = (tasks ?? []) as RawTask[]

  // Collect all unique discord_ids across tasks, sections, subsections
  const discordIds = new Set<string>()
  allTasks.forEach((t) => ((t.assigned_to as string[] | null) ?? []).forEach((id) => discordIds.add(id)))
  ;(sections ?? []).forEach((s) => ((s.assigned_to as string[] | null) ?? []).forEach((id) => discordIds.add(id)))
  allSubs.forEach((ss) => ((ss.assigned_to as string[] | null) ?? []).forEach((id) => discordIds.add(id)))

  const userMap = new Map<string, Record<string, unknown>>()
  if (discordIds.size > 0) {
    const { data: users } = await db
      .from("users")
      .select("id, discord_id, username, avatar_url, created_at")
      .in("discord_id", [...discordIds])
    ;(users ?? []).forEach((u) => userMap.set(u.discord_id, u))
  }

  function attachAssignees(item: Record<string, unknown>): Record<string, unknown> {
    const ids = (item.assigned_to as string[] | null) ?? []
    return { ...item, assignees: ids.map((id) => userMap.get(id)).filter(Boolean) }
  }

  const tasksWithAssignees = allTasks.map((t) => attachAssignees(t as unknown as Record<string, unknown>))

  const sectionsWithData = (sections ?? []).map((section) => {
    const directTasks = tasksWithAssignees.filter(
      (t) => (t as RawTask).section_id === section.id && !(t as RawTask).subsection_id
    )
    const subsectionTree = buildSubsectionTree(
      allSubs,
      tasksWithAssignees as unknown as RawTask[],
      section.id,
      null,
      (item) => attachAssignees(item as unknown as Record<string, unknown>)
    )
    return attachAssignees({ ...section, tasks: directTasks, subsections: subsectionTree } as Record<string, unknown>)
  })

  return NextResponse.json({ ...project, sections: sectionsWithData })
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const db = supabaseAdmin()
  const { data, error } = await db
    .from("projects")
    .update({ name: body.name, description: body.description })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const db = supabaseAdmin()
  const { error } = await db.from("projects").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
