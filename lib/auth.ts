import { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { supabaseAdmin } from "./supabase"

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email" } },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "discord" || !profile) return false
      const db = supabaseAdmin()
      const avatarUrl = profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
        : user.image ?? null
      await db.from("users").upsert(
        {
          discord_id: profile.id,
          username: (profile.username as string) ?? user.name ?? "Unknown",
          avatar_url: avatarUrl,
        },
        { onConflict: "discord_id" }
      )
      return true
    },
    async jwt({ token, account, profile }) {
      if (profile && account?.provider === "discord") {
        token.discord_id = profile.id as string
        token.username = (profile.username as string) ?? token.name ?? "Unknown"
        token.avatar_url = profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : (token.picture ?? null)
      }
      return token
    },
    async session({ session, token }) {
      session.user.discord_id = token.discord_id
      session.user.username = token.username
      session.user.avatar_url = token.avatar_url
      return session
    },
  },
}
