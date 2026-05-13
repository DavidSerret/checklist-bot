import { DefaultSession } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      discord_id: string
      username: string
      avatar_url: string | null
    }
  }
  interface Profile {
    id: string
    username: string
    global_name?: string
    avatar?: string
    discriminator?: string
    email?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    discord_id: string
    username: string
    avatar_url: string | null
  }
}
