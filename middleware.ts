import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Rutas públicas (NO proteger)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api") || // muy importante
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // ✅ Leer cookie de sesión (compatible prod + dev)
  const sessionToken =
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value

  // ✅ Si NO hay sesión → redirigir
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname) // opcional pero top UX
    return NextResponse.redirect(loginUrl)
  }

  // ✅ Usuario autenticado → continuar
  return NextResponse.next()
}

// ✅ MUY IMPORTANTE: matcher correcto (evita romper NextAuth)
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
