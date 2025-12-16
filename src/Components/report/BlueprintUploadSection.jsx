import React, { useRef, useState } from 'react';
import { FileText, Upload, Trash2, Loader2, CheckCircle, FileType, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

const DOC_TYPES = [
  { value: 'floor_plan', label: 'Planta Baixa' },
  { value: 'electrical_plan', label: 'Planta Elétrica' },
  { value: 'hydraulic_plan', label: 'Planta Hidráulica' },
  { value: 'owners_manual', label: 'Manual do Proprietário' },
  { value: 'other', label: 'Outro Documento' }
];

export default function BlueprintUploadSection({ report, onUpdate }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // A lista de documentos fica salva em report.blueprints (array)
  const documents = report.blueprints || [];

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Adiciona o novo doc à lista com tipo padrão 'floor_plan'
      const newDoc = {
        id: crypto.randomUUID(),
        url: file_url,
        type: 'floor_plan', // Tipo padrão inicial
        name: file.name
      };

      onUpdate({ blueprints: [...documents, newDoc] });
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar documento.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (id) => {
    const filtered = documents.filter(doc => doc.id !== id);
    onUpdate({ blueprints: filtered });
  };

  const handleTypeChange = (id, newType) => {
    const updated = documents.map(doc => 
      doc.id === id ? { ...doc, type: newType } : doc
    );
    onUpdate({ blueprints: updated });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 rounded-lg">
          <FileText className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Plantas e Manuais</h3>
          <p className="text-sm text-slate-500">Adicione plantas ou manuais disponíveis.</p>
        </div>
      </div>

      {/* Lista de Documentos Adicionados */}
      <div className="space-y-4 mb-4">
        {documents.map((doc) => {
            const isPdf = doc.url.toLowerCase().endsWith('.pdf');
            return (
                <div key={doc.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50 items-start sm:items-center">
                    {/* Preview */}
                    <div className="w-20 h-20 shrink-0 bg-white border rounded flex items-center justify-center overflow-hidden">
                        {isPdf ? (
                            <FileType className="w-8 h-8 text-slate-400" />
                        ) : (
                            <img src={doc.url} alt="Doc" className="w-full h-full object-cover" />
                        )}
                    </div>

                    {/* Controles */}
                    <div className="flex-1 w-full space-y-2">
                        <div className="flex justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase">Tipo do Documento</span>
                            {isPdf && <span className="text-[10px] bg-slate-200 px-1 rounded text-slate-600">PDF</span>}
                        </div>
                        <Select 
                            value={doc.type} 
                            onValueChange={(val) => handleTypeChange(doc.id, val)}
                        >
                            <SelectTrigger className="h-9 bg-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DOC_TYPES.map(t => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(doc.id)}
                        className="text-slate-400 hover:text-red-500 shrink-0 mt-4 sm:mt-0"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            );
        })}
      </div>

      {/* Botão de Adicionar */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*,application/pdf"
            className="hidden" 
            onChange={handleFileChange}
        />
        
        {isUploading ? (
            <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enviando...</span>
            </div>
        ) : (
            <div className="flex items-center gap-2 text-slate-600 font-medium">
                <Plus className="w-5 h-5" />
                <span>Adicionar Planta ou Manual</span>
            </div>
        )}
      </div>
      
      {documents.length === 0 && (
          <p className="text-xs text-amber-600 mt-3 bg-amber-50 p-2 rounded border border-amber-100">
            Aviso: Se nenhum documento for adicionado, o laudo exibirá automaticamente a nota de ausência de projetos.
          </p>
      )}
    </div>
  );
}