import React, { useRef, useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Loader2, CheckCircle, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

export default function ArtUploadSection({ report, onUpdate }) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // 2. ADICIONAR um estado local para o input
  const [localProtocol, setLocalProtocol] = useState(report.art_protocol || '');

  // 3. ADICIONAR este efeito para sincronizar o local com o banco (caso o laudo mude ou seja limpo)
  useEffect(() => {
    if (report.art_protocol !== localProtocol) {
      setLocalProtocol(report.art_protocol || '');
    }
  }, [report.art_protocol]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      // Salva URL e limpa protocolo para obrigar o preenchimento
      onUpdate({ art_url: file_url, art_protocol: '' });
    } catch (error) {
      console.error("Erro ao enviar ART:", error);
      alert("Erro ao enviar documento.");
    } finally {
      setIsUploading(false);
    }
  };

  const isPdf = report.art_url?.toLowerCase().endsWith('.pdf');
  
  // VERIFICA SE JÁ ESTÁ PREENCHIDO
  const hasProtocol = localProtocol && localProtocol.trim().length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 rounded-lg">
          <FileText className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Documentação (ART)</h3>
          <p className="text-sm text-slate-500">Anexe a ART (Aceita Imagem ou PDF).</p>
        </div>
      </div>

      {report.art_url ? (
        <div className="space-y-4">
            {/* ÁREA DE PREVIEW */}
            <div className="relative group">
                <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-[300px] flex items-center justify-center relative">
                    {isPdf ? (
                        <div className="flex flex-col items-center text-slate-500">
                            <FileType className="w-16 h-16 mb-2 text-slate-400" />
                            <span className="font-medium">Documento PDF Anexado</span>
                            <a href={report.art_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline mt-1 hover:text-blue-800">
                                Visualizar arquivo original
                            </a>
                        </div>
                    ) : (
                        <img 
                            src={report.art_url} 
                            alt="ART Anexada" 
                            className="w-full h-full object-contain" 
                        />
                    )}
                </div>
                
                <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            setLocalProtocol(''); // LIMPA o estado local também
                            onUpdate({ art_url: null, art_protocol: '' });
                        }}
                        className="shadow-md"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover
                    </Button>
                </div>
                
                <div className="mt-2 flex items-center text-emerald-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Arquivo anexado com sucesso
                </div>
            </div>

            {/* --- CAMPO DE PROTOCOLO (DINÂMICO) --- */}
            <div className={`p-4 rounded-lg border transition-all duration-500 ${
                hasProtocol 
                    ? 'bg-slate-50 border-slate-200'  // SE PREENCHIDO: Fica cinza suave (Normal)
                    : 'bg-amber-50 border-amber-200'  // SE VAZIO: Fica amarelo (Alerta)
            }`}>
                <Label className={`font-bold mb-2 block flex items-center gap-2 ${
                    hasProtocol ? 'text-slate-700' : 'text-amber-900'
                }`}>
                    Número do Protocolo / ART 
                    {!hasProtocol && <span className="text-red-600">*</span>}
                    {hasProtocol && <CheckCircle className="w-4 h-4 text-emerald-500 animate-in fade-in zoom-in" />}
                </Label>
                
                <Input 
                    value={localProtocol}
                    onChange={(e) => setLocalProtocol(e.target.value)}
                    onBlur={() => onUpdate({ art_protocol: localProtocol })}
                    placeholder="Digite o número da ART..."
                    className={`bg-white transition-colors ${
                        hasProtocol 
                            ? 'border-slate-300 focus:border-slate-500' 
                            : 'border-amber-300 focus:border-amber-500'
                    }`}
                />
                
                {!hasProtocol && (
                    <p className="text-xs text-amber-700 mt-1 animate-in fade-in">
                        Este número é obrigatório para a emissão do laudo.
                    </p>
                )}
            </div>
        </div>
      ) : (
        // ÁREA DE UPLOAD (Vazio)
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
        >
            <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*,application/pdf"
                className="hidden" 
                onChange={handleFileChange}
            />
            
            {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                    <span className="text-sm text-slate-500">Enviando...</span>
                </div>
            ) : (
                <>
                    <div className="p-4 bg-slate-100 rounded-full mb-3">
                        <Upload className="w-6 h-6 text-slate-600" />
                    </div>
                    <span className="font-medium text-slate-900 block">Clique para enviar a ART</span>
                    <span className="text-xs text-slate-500 mt-1">Formatos: PDF, JPG ou PNG</span>
                </>
            )}
        </div>
      )}
    </div>
  );

}
