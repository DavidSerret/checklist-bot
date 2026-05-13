import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers/Providers"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })

export const metadata: Metadata = {
  title: "Checklist Bot",
  description: "Discord-integrated project task manager",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-[#2B2D31] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
