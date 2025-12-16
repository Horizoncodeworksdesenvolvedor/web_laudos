import React, { useState, useEffect } from 'react';
import { ClipboardList, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function DiligenceEditSection({ report, onUpdate }) {
  const [text, setText] = useState(report.diligence_text || '');
  const [isSaving, setIsSaving] = useState(false);

  // Atualiza o estado se o relatório mudar externamente
  useEffect(() => {
    setText(report.diligence_text || '');
  }, [report.diligence_text]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simula um pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 500));
    onUpdate({ diligence_text: text });
    setIsSaving(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 rounded-lg">
          <ClipboardList className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Diligências e Caracterização</h3>
          <p className="text-sm text-slate-500">Descreva o local, clima e condições gerais.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
            <Label className="text-slate-700 font-medium mb-2 block">Descrição da Vistoria</Label>
            <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                placeholder="Ex: Vistoria realizada em dia de sol, sem chuvas recentes. Trata-se de um apartamento de 3 quartos, sala ampla, cozinha e 2 banheiros, totalizando aprox. 85m²..."
            />
        </div>

        <div className="flex justify-end">
            <Button 
                onClick={handleSave} 
                disabled={isSaving || text === report.diligence_text}
                className="bg-slate-900 hover:bg-slate-800 text-white"
            >
                {isSaving ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                    </>
                )}
            </Button>
        </div>
      </div>
    </div>
  );
}