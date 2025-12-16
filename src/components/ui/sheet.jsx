import React, { createContext, useContext, useState, useEffect } from "react";
import { X } from "lucide-react";

const SheetContext = createContext();

export const Sheet = ({ children, open, onOpenChange }) => {
  // Suporte para modo controlado (via props) ou não controlado (interno)
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  return (
    <SheetContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

export const SheetTrigger = ({ asChild, children, ...props }) => {
  const { setOpen } = useContext(SheetContext);
  
  // Clona o elemento filho (Botão) e adiciona o clique para abrir
  const child = asChild ? React.Children.only(children) : <button>{children}</button>;

  return React.cloneElement(child, {
    ...props,
    onClick: (e) => {
      if (child.props.onClick) child.props.onClick(e);
      setOpen(true);
    }
  });
};

export const SheetContent = ({ children, className }) => {
  const { open, setOpen } = useContext(SheetContext);
  
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Fundo escuro (Overlay) */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in" 
        onClick={() => setOpen(false)}
      />
      
      {/* Painel Lateral */}
      <div className={`
        relative z-50 w-full max-w-md h-full bg-white shadow-xl 
        border-l border-slate-200 p-6 overflow-y-auto 
        animate-in slide-in-from-right duration-300
        ${className}
      `}>
        {/* Botão Fechar no canto */}
        <button 
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
        
        {children}
      </div>
    </div>
  );
};

export const SheetHeader = ({ children }) => (
  <div className="flex flex-col space-y-2 text-left mb-6">
    {children}
  </div>
);

export const SheetTitle = ({ children }) => (
  <h2 className="text-lg font-semibold text-slate-900">
    {children}
  </h2>
);