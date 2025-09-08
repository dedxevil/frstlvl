import React from "react"

export function Badge({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={`inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-800 ${props.className || ""}`}
    >
      {children}
    </span>
  )
}
