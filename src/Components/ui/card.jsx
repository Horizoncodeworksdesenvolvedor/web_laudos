import React from "react"
export const Card = ({ children, className }) => <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>
export const CardHeader = ({ children, className }) => <div className={`p-6 pb-2 ${className}`}>{children}</div>
export const CardTitle = ({ children, className }) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
export const CardContent = ({ children, className }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>