import React, { useEffect } from "react"; // Adicionado useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base44 } from "./api/base44Client"; // Adicionado para o "ping" no servidor

// Importando as páginas
import Home from "./Pages/Home";
import NewReport from "./Pages/NewReport";
import EditReport from "./Pages/EditReport";
import ViewReport from "./Pages/ViewReport"; // <--- Importante: Adicionei este import
import Reports from "./Pages/Reports";

// Criando o cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // Mantém os dados prontos por 5 min
      cacheTime: 1000 * 60 * 30,   // Guarda no cache por 30 min
      refetchOnWindowFocus: false, // Evita recargas ao trocar de janelas
    },
  },
});

function App() {
  // Efeito para "acordar" o servidor do Render assim que o app inicia
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await base44.entities.TechnicalReport.list();
      } catch (e) {
        // Apenas falha silenciosamente se o servidor ainda estiver ligando
      }
    };
    wakeUpServer();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Tela Inicial */}
          <Route path="/" element={<Home />} />
          
          {/* Criar Novo */}
          <Route path="/new" element={<NewReport />} />
          
          {/* Editar (Quando ainda é rascunho) */}
          <Route path="/edit/:id" element={<EditReport />} />
          
          {/* Visualizar (Quando está finalizado) - AQUI ESTAVA O ERRO */}
          <Route path="/view/:id" element={<ViewReport />} />
          
          {/* Lista de Relatórios */}
          <Route path="/reports" element={<Reports />} />
          
          {/* Qualquer outro endereço volta para Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
