import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const guildId = req.nextUrl.searchParams.get("guild_id")
  const db = supabaseAdmin()
  let query = db.from("projects").select("*").order("created_at", { ascending: false })
  if (guildId) query = query.eq("guild_id", guildId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, description, guild_id } = body
  if (!name || !guild_id) {
    return NextResponse.json({ error: "name and guild_id required" }, { status: 400 })
  }

  const db = supabaseAdmin()

  // Ensure user exists before the FK constraint fires
  await db.from("users").upsert(
    {
      discord_id: session.user.discord_id,
      username: session.user.username,
      avatar_url: session.user.avatar_url ?? session.user.image ?? null,
    },
    { onConflict: "discord_id" }
  )

  const { data, error } = await db
    .from("projects")
    .insert({ name, description, guild_id, created_by: session.user.discord_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
