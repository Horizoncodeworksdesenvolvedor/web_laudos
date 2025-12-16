import React from "react"

export const Badge = ({ children, className }) => {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-slate-100 text-slate-900 ${className}`}>
      {children}
    </span>
  )
}