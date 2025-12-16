import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Loader2, Sparkles, Plus, Camera, X, Type, PenTool, Bot 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import LocationChips from './LocationChips';
import RiskSelector from './RiskSelector';
import VoiceInput from './VoiceInput';

export default function AddItemForm({ onAddItem }) {
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState('regular');
  const [photos, setPhotos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ESTADO PARA CONTROLAR O MODO (IA ou MANUAL)
  const [useAI, setUseAI] = useState(true);

  // Cronometro de 1m de espera para IA
  const [cooldownTimer, setCooldownTimer] = useState(0);
  React.useEffect(() => {
    if (cooldownTimer > 0) {
      const timer = setTimeout(() => setCooldownTimer(time => time - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTimer]);
  
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: base44.integrations.Core.UploadFile,
    onSuccess: (data) => {
      setPhotos(prev => [...prev, data.file_url]);
    }
  });

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      uploadMutation.mutate({ file });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // --- AQUI ESTAVA O PROBLEMA DO ERRO 500 ---
  // Agora chama corretamente a base44.integrations.Core.InvokeLLM
  const generateTechnicalText = async (informalText) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Transforme esta observação informal de campo em texto técnico formal para um Laudo de Vistoria Predial: "${informalText}". Responda apenas com o texto técnico.` 
      });
      return response.technical_text;
    } catch (error) {
      console.error("Erro na IA:", error);
      return null; 
    }
  };

  const handleVoiceTranscript = (transcript) => {
    setDescription((prev) => prev ? `${prev} ${transcript}` : transcript);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location || !description || !title) return;

    setIsProcessing(true);

    if (useAI) {
        const technicalText = await generateTechnicalText(description);
        
        if (technicalText) {
            setDescription(technicalText);
            setUseAI(false); // Sucesso: Vai para modo manual
        } else {
            setCooldownTimer(60); 
        }
        
        setIsProcessing(false);
        return; 
    }

    const newItem = {
      id: crypto.randomUUID(),
      location,
      title,
      informal_description: '', 
      technical_description: description,
      risk_level: riskLevel,
      photos: photos
    };

    onAddItem(newItem);

    setLocation('');
    setTitle('');
    setDescription('');
    setRiskLevel('regular');
    setPhotos([]);
    setUseAI(true);
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Local */}
        <div>
            <Label className="text-slate-700 font-medium mb-3 block">Cômodo / Local</Label>
            <LocationChips onSelect={setLocation} selectedLocation={location} />
            <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ou digite um local personalizado..."
                className="mt-3 bg-white"
            />
        </div>

        {/* Título */}
        <div>
            <Label className="text-slate-700 font-medium mb-2 block">Título do Apontamento</Label>
            <div className="relative">
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Infiltração no Teto, Piso Quebrado..."
                    className="bg-white pl-10"
                />
                <Type className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
        </div>

        {/* Descrição e IA */}
        <div>
            <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-700 font-medium block">Descrição do Problema</Label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button type="button" onClick={() => setUseAI(true)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${useAI ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <Sparkles className="w-3.5 h-3.5" /> Com IA
                    </button>
                    <button type="button" onClick={() => setUseAI(false)} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!useAI ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <PenTool className="w-3.5 h-3.5" /> Manual
                    </button>
                </div>
            </div>

            <div className={`border rounded-lg p-1 ${useAI ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-200 bg-white'}`}>
                <div className="flex gap-2">
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={useAI ? "Descreva o que você viu... A IA vai transformar em texto técnico." : "Digite a descrição técnica final."}
                        className="min-h-[120px] flex-1 bg-transparent border-0 focus:ring-0 resize-none"
                    />
                    {useAI && (
                        <div className="pt-2 pr-2">
                            <VoiceInput onTranscript={handleVoiceTranscript} disabled={isProcessing} />
                        </div>
                    )}
                </div>
                <div className="px-3 pb-2 pt-1 flex items-center gap-2 text-xs border-t border-dashed border-slate-200/50 mt-1">
                    {useAI ? (
                        <> <Bot className="w-3.5 h-3.5 text-indigo-500" /> <span className="text-indigo-600 font-medium">Modo Inteligente</span> </>
                    ) : (
                        <> <PenTool className="w-3.5 h-3.5 text-slate-500" /> <span className="text-slate-700 font-medium">Modo Manual</span> </>
                    )}
                </div>
            </div>
        </div>

        {/* Risco */}
        <div>
            <Label className="text-slate-700 font-medium mb-3 block">Grau de Risco</Label>
            <RiskSelector value={riskLevel} onChange={setRiskLevel} />
        </div>

        {/* Fotos */}
        <div>
            <Label className="text-slate-700 font-medium mb-3 block">Fotos</Label>
            <div className="space-y-4">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={uploadMutation.isPending} />
                <div className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-3 ${dragActive ? 'border-slate-500 bg-slate-50' : 'border-slate-300 hover:border-slate-400'} ${uploadMutation.isPending ? 'opacity-50' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                    {uploadMutation.isPending ? <Loader2 className="w-8 h-8 text-slate-400 animate-spin" /> : <div className="p-3 bg-slate-100 rounded-full"><Camera className="w-6 h-6 text-slate-600" /></div>}
                    <div><span className="font-medium text-slate-900 block">Tirar foto ou selecionar</span></div>
                </div>
                {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200 bg-slate-100">
                                <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isProcessing || !location || !description || !title || (useAI && cooldownTimer > 0)}
        className={`w-full h-12 text-base font-medium mt-6 transition-all ${
            (useAI && cooldownTimer > 0) ? 'bg-slate-100 text-slate-500 border border-slate-200' :
            useAI ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
        }`}
      >
        {isProcessing ? (
          // --- VACINA CONTRA TELA BRANCA (key="loading") ---
          <span key="loading" className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {useAI ? 'Gerando texto...' : 'Salvando...'}
          </span>
        ) : (
            (useAI && cooldownTimer > 0) ? (
                <span key="cooldown" className="flex items-center justify-center font-mono">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-amber-500" />
                    Aguarde {cooldownTimer}s...
                </span>
            ) : useAI ? (
                // --- VACINA (key="generate") ---
                <span key="generate" className="flex items-center justify-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Texto para Revisão
                </span>
            ) : (
                // --- VACINA (key="add") ---
                <span key="add" className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item ao Laudo
                </span>
            )
        )}
      </Button>
    </form>
  );
}