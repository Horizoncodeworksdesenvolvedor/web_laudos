import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Importando as páginas
import Home from "./Pages/Home";
import NewReport from "./Pages/NewReport";
import EditReport from "./Pages/EditReport";
import ViewReport from "./Pages/ViewReport"; // <--- Importante: Adicionei este import
import Reports from "./Pages/Reports";

// Criando o cliente do React Query
const queryClient = new QueryClient();

function App() {
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