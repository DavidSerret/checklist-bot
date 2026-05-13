"use client"

import { getProgressHex } from "@/types"

interface Props {
  percent: number
  className?: string
}

export function ProgressBar({ percent, className = "" }: Props) {
  const color = getProgressHex(percent)
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-[#1E1F22] ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${clamped}%`,
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}66`,
        }}
      />
    </div>
  )
}
