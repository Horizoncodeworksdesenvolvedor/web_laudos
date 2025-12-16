import React, { createContext, useContext, useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

const SelectContext = createContext();

export const Select = ({ children, value, onValueChange }) => {
  const [open, setOpen] = useState(false);
  const [labels, setLabels] = useState({}); // Guarda o texto de cada opção (ex: critical -> Crítico)

  // Função para os itens se registrarem
  const registerLabel = (val, label) => {
    setLabels(prev => ({ ...prev, [val]: label }));
  };

  return (
    <SelectContext.Provider value={{ open, setOpen, value, onValueChange, labels, registerLabel }}>
      <div className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, className }) => {
  const { open, setOpen } = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex h-12 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue = ({ placeholder }) => {
  const { value, labels } = useContext(SelectContext);
  // Mostra o texto registrado (ex: "Crítico") ou o valor bruto ou o placeholder
  return (
    <span className="block truncate text-slate-900">
      {labels[value] || value || <span className="text-slate-500">{placeholder}</span>}
    </span>
  );
};

export const SelectContent = ({ children }) => {
  const { open, setOpen } = useContext(SelectContext);
  
  if (!open) return null;
  
  return (
    <>
      {/* Fundo invisível para fechar ao clicar fora */}
      <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
      
      {/* Menu Dropdown */}
      <div className="absolute z-50 min-w-[8rem] w-full mt-1 overflow-hidden rounded-md border border-slate-200 bg-white text-slate-950 shadow-md animate-in fade-in-80 zoom-in-95">
        <div className="p-1">
          {children}
        </div>
      </div>
    </>
  );
};

export const SelectItem = ({ value, children, className }) => {
  const { setOpen, onValueChange, value: selectedValue, registerLabel } = useContext(SelectContext);
  
  // Registra o rótulo deste item ao montar (para o SelectValue saber o que mostrar)
  useEffect(() => {
    if (children) registerLabel(value, children);
  }, [value, children]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onValueChange(value);
        setOpen(false);
      }}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 ${className}`}
    >
      {selectedValue === value && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4 text-slate-900" />
        </span>
      )}
      <span className="text-slate-900 font-medium">{children}</span>
    </div>
  );
};