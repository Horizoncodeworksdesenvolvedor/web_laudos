// src/api/base44Client.js

// 1. Define a URL base.
// Se estiver na web (Vercel), usa a variável de ambiente. Se estiver local, fica vazio.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const base44 = {
  entities: {
    TechnicalReport: {
      create: async (data) => {
        const newReport = { 
            ...data, 
            id: crypto.randomUUID(), 
            created_date: new Date().toISOString() 
        };
        
        // Adicionei ${API_BASE_URL} aqui
        await fetch(`${API_BASE_URL}/api/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newReport)
        });
        
        return newReport;
      },
      
      list: async () => {
        // Adicionei ${API_BASE_URL} aqui
        const response = await fetch(`${API_BASE_URL}/api/reports`);
        return await response.json();
      },
      
      filter: async ({ id }) => {
        // Adicionei ${API_BASE_URL} aqui
        const response = await fetch(`${API_BASE_URL}/api/reports/${id}`);
        if (!response.ok) return [];
        const report = await response.json();
        return [report]; 
      },
      
      update: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/api/reports/${id}`);
        const current = await response.json();
        
        const updated = { ...current, ...data };
        
        // Adicionei ${API_BASE_URL} aqui
        await fetch(`${API_BASE_URL}/api/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        
        return updated;
      },
      
      delete: async (id) => {
        // Adicionei ${API_BASE_URL} aqui
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
        // O Cloudinary é externo, então NÃO precisa do API_BASE_URL
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
      
      InvokeLLM: async ({ prompt }) => {
        // Adicionei ${API_BASE_URL} aqui para chamar seu backend
        const response = await fetch(`${API_BASE_URL}/api/generate-technical`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ informalText: prompt })
        });
        
        const data = await response.json();
        return { technical_text: data.technical_text };
      }
    }
  }
};