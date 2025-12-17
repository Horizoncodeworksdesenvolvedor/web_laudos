// src/components/ui/button.jsx
import React from "react"

export const Button = ({ children, className, variant, ...props }) => {
    // Define se o botão é "outline" (borda) ou "ghost" (transparente) ou normal

    let baseColor = "bg-slate-900 text-white hover:bg-slate-800";

    // Adicione esta linha AQUI para o botão vermelho funcionar 👇
    if (variant === 'destructive') baseColor = "bg-red-600 text-white hover:bg-red-700 shadow-sm";

    // Variantes existentes
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
