// src/api/base44Client.js

// 1. Define a URL base para o banco de dados (PostgreSQL)
// Continua usando o Render para salvar os laudos, isso estava funcionando!
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const base44 = {
  entities: {
    TechnicalReport: {
      create: async (data) => {
        const newReport = { 
            ...data, 
            id: crypto.randomUUID(), 
            created_date: new Date().toISOString() 
        };
        
        await fetch(`${API_BASE_URL}/api/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newReport)
        });
        
        return newReport;
      },
      
      list: async () => {
        const response = await fetch(`${API_BASE_URL}/api/reports`);
        return await response.json();
      },
      
      filter: async ({ id }) => {
        const response = await fetch(`${API_BASE_URL}/api/reports/${id}`);
        if (!response.ok) return [];
        const report = await response.json();
        return [report]; 
      },
      
      update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/api/reports/${id}`);
        const current = await response.json();
        
        const updated = { ...current, ...data };
        
        await fetch(`${API_BASE_URL}/api/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        
        return updated;
      },
      
      delete: async (id) => {
        const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            console.error("Erro ao deletar no servidor");
            return false;
        }

        return true;
      }
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const cloudName = "dotped2kj"; 
        const uploadPreset = "laudos_app"; 

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("Erro no upload para o Cloudinary");
            const data = await response.json();
            return { file_url: data.secure_url }; 

        } catch (error) {
            console.error("Erro ao fazer upload:", error);
            throw error;
        }
      }, 

      UploadBase64: async ({ base64Data }) => {
        const cloudName = "dotped2kj"; 
        const uploadPreset = "laudos_app"; 

        const formData = new FormData();
        // Cloudinary aceita a Data URL (base64) diretamente no campo 'file'
        formData.append("file", base64Data); 
        formData.append("upload_preset", uploadPreset);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("Erro no upload para o Cloudinary");
            const data = await response.json();
            return { file_url: data.secure_url }; 

        } catch (error) {
            console.error("Erro ao fazer upload da assinatura:", error);
            throw error;
        }
      },
      
      // AQUI ESTÁ A MÁGICA: Chamada direta ao Gemini (Bypassing Render)
      InvokeLLM: async ({ prompt }) => {
        // Usa a mesma URL base que o CRUD (https://laudos-api-mae2.onrender.com)
        const url = `${API_BASE_URL}/api/generate-technical`; 

        // O payload esperado pelo seu Backend (server/index.js) é { informalText: ... }
        const payload = { informalText: prompt }; 

        try {
          // A CHAMADA AGORA VAI PARA O SEU BACKEND NO RENDER
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
             // O Backend retorna erro 500 se a IA falhar
             throw new Error(`Erro ${response.status} ao chamar o Backend da IA: ${await response.text()}`);
          }

          const data = await response.json();
          
          // O Backend retorna { technical_text: generatedText }
          return { technical_text: data.technical_text || "Erro ao gerar texto." };

        } catch (error) {
          console.error("Erro na comunicação com o Backend da IA:", error);
          // O cooldown de 60s será acionado no Frontend devido a este erro.
          return { technical_text: "Erro ao conectar com a IA. Verifique o servidor de Backend." };
        }
      }
    }
  }
};
