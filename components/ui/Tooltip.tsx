"use client"

import { useState } from "react"

interface Props {
  content: string | null | undefined
  children: React.ReactNode
}

export function Tooltip({ content, children }: Props) {
  const [visible, setVisible] = useState(false)

  if (!content) return <>{children}</>

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-pre-wrap rounded-lg border border-[#383A40] bg-[#1E1F22] px-3 py-2 text-xs text-[#B5BAC1] shadow-xl max-w-xs">
          {content}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1E1F22]" />
        </div>
      )}
    </div>
  )
}
