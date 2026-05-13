import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { section_id, name, description, order, parent_id } = body
  if (!section_id || !name) {
    return NextResponse.json({ error: "section_id and name required" }, { status: 400 })
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from("subsections")
    .insert({
      section_id,
      name,
      description: description ?? null,
      order: order ?? 0,
      parent_id: parent_id ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
