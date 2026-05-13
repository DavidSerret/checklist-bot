import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { section_id, subsection_id, title, description, assigned_to } = body
  if (!section_id || !title) {
    return NextResponse.json({ error: "section_id and title required" }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from("tasks")
    .insert({
      section_id,
      subsection_id: subsection_id ?? null,
      title,
      description: description ?? null,
      assigned_to: assigned_to ?? null,
      weight: 1,
    })
    .select("*, assignee:users!tasks_assigned_to_fkey(discord_id,username,avatar_url)")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
