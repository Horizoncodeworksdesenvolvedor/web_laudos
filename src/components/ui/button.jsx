import React from "react"

export const Button = ({ children, className, variant, ...props }) => {
    // Define se o botão é "outline" (borda) ou "ghost" (transparente) ou normal
    // Se você passar variant="ghost", ele remove o fundo escuro.

    let baseColor = "bg-slate-900 text-white hover:bg-slate-800";

    // Ajustes simples para variantes (se você usar no futuro)
    if (variant === 'outline') baseColor = "border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900";
    if (variant === 'ghost') baseColor = "bg-transparent hover:bg-slate-100 text-slate-700";

    return (
        <button
            className={`
        inline-flex items-center justify-center gap-2 
        px-4 py-2 rounded-lg font-medium 
        transition-all duration-200 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${baseColor}
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    )
}