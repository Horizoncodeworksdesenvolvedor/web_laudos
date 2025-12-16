import React, { useState, createContext, useContext } from "react";

// Criamos um "controle remoto" para saber se a janela está aberta ou fechada
const AlertDialogContext = createContext();

export const AlertDialog = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

export const AlertDialogTrigger = ({ asChild, children }) => {
  const { setOpen } = useContext(AlertDialogContext);
  
  // Clonamos o botão filho para adicionar o clique que ABRE a janela
  const child = asChild ? React.Children.only(children) : <button>{children}</button>;
  
  return React.cloneElement(child, {
    onClick: (e) => {
       // Mantém o clique original do botão, se existir
       if (child.props.onClick) child.props.onClick(e);
       setOpen(true);
    }
  });
};

export const AlertDialogContent = ({ children }) => {
  const { open } = useContext(AlertDialogContext);
  if (!open) return null; // Se não estiver aberto, não mostra nada
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 mx-4">
         {children}
      </div>
    </div>
  );
};

export const AlertDialogHeader = ({ children }) => <div className="mb-4 text-left">{children}</div>;
export const AlertDialogTitle = ({ children }) => <h2 className="text-lg font-bold text-slate-900">{children}</h2>;
export const AlertDialogDescription = ({ children }) => <p className="text-sm text-slate-500 mt-2">{children}</p>;
export const AlertDialogFooter = ({ children }) => <div className="flex justify-end gap-3 mt-6">{children}</div>;

export const AlertDialogAction = ({ onClick, className, children }) => {
  const { setOpen } = useContext(AlertDialogContext);
  return (
    <button
      onClick={async (e) => {
         // Executa a ação de excluir
         if (onClick) await onClick(e);
         // E DEPOIS FECHA A JANELA
         setOpen(false);
      }}
      className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

export const AlertDialogCancel = ({ children }) => {
  const { setOpen } = useContext(AlertDialogContext);
  return (
    <button
      onClick={() => setOpen(false)} // Botão cancelar apenas fecha
      className="px-4 py-2 border border-slate-200 rounded hover:bg-slate-100 text-slate-700 font-medium transition-colors"
    >
      {children}
    </button>
  );
};