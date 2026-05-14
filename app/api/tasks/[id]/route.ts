import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const db = supabaseAdmin()

  const updates: Record<string, unknown> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.completed !== undefined) updates.completed = body.completed
  if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to

  const { data, error } = await db
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids: string[] = data.assigned_to ?? []
  let assignees: unknown[] = []
  if (ids.length) {
    const { data: users } = await db
      .from("users")
      .select("id, discord_id, username, avatar_url, created_at")
      .in("discord_id", ids)
    assignees = users ?? []
  }

  return NextResponse.json({ ...data, assignees })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const db = supabaseAdmin()
  const { error } = await db.from("tasks").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
