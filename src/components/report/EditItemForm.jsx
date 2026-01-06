import React, { useState } from 'react';
import { Loader2, Save, FileText, Type, Image as ImageIcon, Sparkles, PenTool, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import LocationChips from './LocationChips';
import RiskSelector from './RiskSelector';
import MultiPhotoUpload from './MultiPhotoUpload';

// Títulos mais frequentes extraídos do checklist do engenheiro
const commonTitles = [
  "Azulejo/Revestimento",
  "Esquadria de aluminio",
  "Flexíveis",
  "Forro de gesso",
  "Interruptores",
  "Pintura",
  "Pisos",
  "Ponto de luz",
  "Portas",
  "Ralos",
  "Registro",
  "Sifão",
  "Tampo da pia",
  "Tomadas",
  "Torneira",
  "Válvulas",
  "Vaso sanitário",
  "Vidros"
];

export default function EditItemForm({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    ...item,
    title: item.title || '',
    technical_description: item.technical_description || item.informal_description,
    photos: item.photos || []
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [useAI, setUseAI] = useState(false); // Por padrão na edição, iniciamos em manual

  // IA Resiliente (Mesma lógica do AddItemForm)
  const generateTechnicalText = async (informalText) => {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Atue como Perito em Engenharia Diagnóstica (Estilo Telegram). 
          Transforme a observação em um parágrafo técnico ULTRA-CONCISO.
          REGRAS RÍGIDAS:
          1. Máximo de 3 a 4 frases curtas.
          2. Formato: [Anomalia] + [Causa Provável] + [Método de Reparo].
          3. Proibido introduções, conclusões ou saudações.
          4. Use linguagem direta e seca. Sem "encher linguiça".
          5. Responda APENAS com o texto técnico final.
          TEXTO: "${informalText}"`
        });
        if (response?.technical_text) return response.technical_text;
      } catch (error) {
        if (attempt < 2) await new Promise(r => setTimeout(r, 500));
      }
    }
    return null;
  };

  const handleRefineWithAI = async () => {
    if (!formData.technical_description) return;
    setIsProcessingAI(true);
    const result = await generateTechnicalText(formData.technical_description);
    if (result) {
      setFormData({ ...formData, technical_description: result });
      setUseAI(false); // Volta para manual para o engenheiro revisar
    } else {
      alert("IA indisponível no momento. Tente novamente em instantes.");
    }
    setIsProcessingAI(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    let finalPhotoUrls = [];
    if (formData.photos && formData.photos.length > 0) {
      setIsUploading(true);
      for (const photo of formData.photos) {
        if (typeof photo !== 'string') {
          try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file: photo });
            finalPhotoUrls.push(file_url);
          } catch (error) {
            console.error("Erro no upload:", error);
          }
        } else {
          finalPhotoUrls.push(photo);
        }
      }
      setIsUploading(false);
    }

    onSave({ ...formData, photos: finalPhotoUrls });
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-1">
      
      {/* Local */}
      <div>
        <Label htmlFor="edit-location" className="text-slate-700 font-medium mb-3 block">Local</Label>
        <LocationChips 
            onSelect={(loc) => setFormData({...formData, location: loc})} 
            selectedLocation={formData.location} 
        />
        <Input
          id="edit-location"
          name="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="mt-3 bg-white"
        />
      </div>

      {/* Título com Chips Rápidos */}
      <div>
        <Label htmlFor="edit-title" className="text-slate-700 font-medium mb-2 block">Título do Apontamento</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonTitles.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setFormData({ ...formData, title: suggestion })}
              className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium border transition-all ${
                formData.title === suggestion 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="relative">
            <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white pl-10"
                placeholder="Título do item..."
            />
            <Type className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Risco */}
      <div>
        <Label className="text-slate-700 font-medium mb-3 block">Grau de Risco</Label>
        <RiskSelector 
            value={formData.risk_level} 
            onChange={(val) => setFormData({ ...formData, risk_level: val })} 
        />
      </div>

      {/* FOTOS */}
      <div>
        <Label className="text-slate-700 font-medium mb-3 block flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Fotos do Item
        </Label>
        <MultiPhotoUpload
            photos={formData.photos}
            onPhotosChange={(newPhotos) => setFormData({ ...formData, photos: newPhotos })}
            isUploading={isUploading}
        />
      </div>

      {/* Texto Técnico com Integração de IA para refinamento */}
      <div>
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <Label htmlFor="edit-description" className="text-slate-900 font-bold">Descrição Técnica</Label>
            </div>
            
            {/* Botão opcional para re-processar com IA se o engenheiro quiser mudar o texto */}
            <button 
              type="button"
              onClick={handleRefineWithAI}
              disabled={isProcessingAI}
              className="text-[10px] flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-100"
            >
              {isProcessingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Refinar com IA
            </button>
        </div>
        <Textarea
            id="edit-description"
            name="description"
            value={formData.technical_description}
            onChange={(e) => setFormData({ ...formData, technical_description: e.target.value })}
            className="min-h-[150px] bg-white text-base leading-relaxed p-3"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
        </Button>
        <Button type="submit" disabled={isSaving || isUploading || isProcessingAI} className="flex-1 bg-slate-900 hover:bg-slate-800">
            {isSaving ? (
                <span className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                    {isUploading ? 'Enviando fotos...' : 'Salvando...'}
                </span>
            ) : (
                <span className="flex items-center justify-center">
                    <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                </span>
            )}
        </Button>
      </div>
    </form>
  );
}

