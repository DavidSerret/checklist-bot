import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { project_id, name, description, sprint, order } = body
  if (!project_id || !name) {
    return NextResponse.json({ error: "project_id and name required" }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from("sections")
    .insert({ project_id, name, description, sprint: sprint ?? "Sprint 1", order: order ?? 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
