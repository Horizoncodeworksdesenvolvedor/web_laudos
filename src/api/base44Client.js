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
      
      // AQUI ESTÁ A MÁGICA: Chamada direta ao Gemini (Bypassing Render)
      InvokeLLM: async ({ prompt }) => {
        if (!GEMINI_KEY) {
          console.error("VITE_GEMINI_API_KEY não encontrada!");
          return { technical_text: "Erro: Chave do Gemini não configurada no Vercel." };
        }

        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

        // Instrução para o Gemini se comportar como engenheiro
        const systemInstruction = "Você é um assistente especialista em engenharia civil e vistoria predial. Sua tarefa é transformar relatos informais de vistorias em textos técnicos formais, precisos e adequados para laudos de engenharia. Mantenha a impessoalidade e use terminologia técnica correta.";
        
        const payload = {
          contents: [{
            parts: [{ text: `${systemInstruction}\n\nTexto informal para converter: "${prompt}"\n\nTexto Técnico:` }]
          }]
        };

        try {
          const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          
          if (data.error) {
             throw new Error(data.error.message);
          }

          // O Gemini retorna o texto dentro de candidates[0].content.parts[0].text
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao gerar texto.";
          
          return { technical_text: generatedText };

        } catch (error) {
          console.error("Erro no Gemini:", error);
          return { technical_text: "Erro ao conectar com a IA. Verifique sua chave." };
        }
      }
    }
  }
};