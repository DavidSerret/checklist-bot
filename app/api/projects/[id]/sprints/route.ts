import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

type Ctx = { params: Promise<{ id: string }> }

// PATCH /api/projects/[id]/sprints
// Body shapes:
//   { action: "set",    sprints: string[] }              — replace full list
//   { action: "rename", from: string, to: string }       — rename + update sections
//   { action: "delete", name: string, fallback: string } — remove + reassign sections
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const db = supabaseAdmin()

  if (body.action === "set") {
    const { data, error } = await db
      .from("projects")
      .update({ sprints: body.sprints })
      .eq("id", id)
      .select("sprints")
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (body.action === "rename") {
    const { from, to } = body as { from: string; to: string }
    if (!from || !to || from === to) {
      return NextResponse.json({ error: "from and to required" }, { status: 400 })
    }

    // Fetch current sprints
    const { data: project, error: pErr } = await db
      .from("projects")
      .select("sprints")
      .eq("id", id)
      .single()
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

    const newSprints = (project.sprints as string[]).map((s) => (s === from ? to : s))

    const [sprintRes, sectionsRes] = await Promise.all([
      db.from("projects").update({ sprints: newSprints }).eq("id", id).select("sprints").single(),
      db.from("sections").update({ sprint: to }).eq("project_id", id).eq("sprint", from),
    ])

    if (sprintRes.error) return NextResponse.json({ error: sprintRes.error.message }, { status: 500 })
    return NextResponse.json(sprintRes.data)
  }

  if (body.action === "delete") {
    const { name, fallback } = body as { name: string; fallback: string }
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

    const { data: project, error: pErr } = await db
      .from("projects")
      .select("sprints")
      .eq("id", id)
      .single()
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

    const newSprints = (project.sprints as string[]).filter((s) => s !== name)

    // Reassign sections to fallback sprint (first remaining) or the provided fallback
    const target = fallback ?? newSprints[0] ?? null
    await db.from("projects").update({ sprints: newSprints }).eq("id", id)
    if (target) {
      await db.from("sections").update({ sprint: target }).eq("project_id", id).eq("sprint", name)
    }
    return NextResponse.json({ sprints: newSprints })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
