import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const runtime = "nodejs"

// 🔥 ESTA ES LA CLAVE REAL
export const dynamic = "force-dynamic"

export default async function RootPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}
