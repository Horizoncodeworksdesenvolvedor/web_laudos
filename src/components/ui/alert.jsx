import React from "react"

export const Alert = ({ children, className, ...props }) => {
  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-slate-900 [&>svg~*]:pl-7 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const AlertDescription = ({ children, className, ...props }) => (
  <div
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </div>
)