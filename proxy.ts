import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ rutas públicas
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // ✅ cookies sesión
  const sessionToken =
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value

  // ✅ redirect si no logeado
  if (!sessionToken) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
