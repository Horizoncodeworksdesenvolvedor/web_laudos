import React, { useState } from 'react';
import { Loader2, Save, FileText, Type, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client'; // <--- IMPORTANTE PARA O UPLOAD
import LocationChips from './LocationChips';
import RiskSelector from './RiskSelector';
import MultiPhotoUpload from './MultiPhotoUpload'; // <--- IMPORTANTE

export default function EditItemForm({ item, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    ...item,
    title: item.title || '',
    technical_description: item.technical_description || item.informal_description,
    photos: item.photos || [] // Garante que é um array
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Estado para feedback de upload

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // --- LÓGICA DE UPLOAD (Novas Fotos) ---
    let finalPhotoUrls = [];
    
    // Se tiver fotos, verifica quais precisam subir
    if (formData.photos && formData.photos.length > 0) {
        setIsUploading(true); // Ativa spinner de upload se necessário
        
        for (const photo of formData.photos) {
            // Se for arquivo (Objeto File), faz upload
            if (typeof photo !== 'string') {
                try {
                    const { file_url } = await base44.integrations.Core.UploadFile({ file: photo });
                    finalPhotoUrls.push(file_url);
                } catch (error) {
                    console.error("Erro no upload da foto editada:", error);
                    alert("Erro ao salvar uma das fotos novas.");
                }
            } else {
                // Se já for string (URL antiga), mantém
                finalPhotoUrls.push(photo);
            }
        }
        setIsUploading(false);
    }
    // --------------------------------------

    // Salva com a lista atualizada de URLs
    onSave({ ...formData, photos: finalPhotoUrls });
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Local */}
      <div>
        <Label className="text-slate-700 font-medium mb-3 block">Local</Label>
        <LocationChips 
            onSelect={(loc) => setFormData({...formData, location: loc})} 
            selectedLocation={formData.location} 
        />
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="mt-3 bg-white"
        />
      </div>

      {/* Título */}
      <div>
        <Label className="text-slate-700 font-medium mb-2 block">Título do Apontamento</Label>
        <div className="relative">
            <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white pl-10"
                placeholder="Título curto..."
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

      {/* FOTOS (NOVA SEÇÃO DE EDIÇÃO) */}
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

      {/* Texto Técnico */}
      <div>
        <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <Label className="text-slate-900 font-bold">Descrição Técnica</Label>
        </div>
        <Textarea
            value={formData.technical_description}
            onChange={(e) => setFormData({ ...formData, technical_description: e.target.value })}
            className="min-h-[200px] bg-white text-base leading-relaxed p-4"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
        </Button>
        <Button type="submit" disabled={isSaving || isUploading} className="flex-1 bg-slate-900 hover:bg-slate-800">
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