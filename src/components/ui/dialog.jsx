import React from "react"
export const Dialog = ({ children, open, onOpenChange }) => <>{open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => onOpenChange(false)}><div className="z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg" onClick={e => e.stopPropagation()}>{children}</div></div>}</>
export const DialogTrigger = ({ asChild, children, ...props }) => asChild ? React.cloneElement(children, props) : <button {...props}>{children}</button>
export const DialogContent = ({ children, className }) => <div className={className}>{children}</div>
export const DialogHeader = ({ children }) => <div className="mb-4">{children}</div>
export const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>