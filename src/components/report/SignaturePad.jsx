// src/components/report/SignaturePad.jsx

import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
// Removidos os imports Button e Undo
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Trash2 } from 'lucide-react'; // Mantidos apenas os ícones de status

export default function SignaturePad({ existingSignatureUrl, onSaveSignature }) {
  const sigCanvas = useRef({});
  const [isEmpty, setIsEmpty] = useState(true);
  
  // Efeito para determinar se a assinatura já existe ao carregar
  useEffect(() => {
    if (existingSignatureUrl) {
        setIsEmpty(false);
    } else {
        setIsEmpty(true);
    }
  }, [existingSignatureUrl]);

  // As funções de ação foram mantidas no código, mas não estão mais ligadas a botões
  const clearSignature = () => {
    if (sigCanvas.current) {
        sigCanvas.current.clear();
        setIsEmpty(true);
    }
  };

  const saveSignature = () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;
    const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
    const dataURL = trimmedCanvas.toDataURL('image/png');
    setIsEmpty(false);
  };

  // MODO: Assinatura Salva (Botão "Apagar e Refazer" Removido)
  if (existingSignatureUrl && isEmpty === false) {
    return (
      <Card className="shadow-lg border-2 border-emerald-400 bg-emerald-50">
        <CardContent className="p-4 flex flex-col items-center">
          <p className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Assinatura Salva!
          </p>
          <div className="w-full h-24 flex items-center justify-center bg-white rounded border border-slate-200 p-2">
             <img 
               src={existingSignatureUrl} 
               alt="Assinatura Salva" 
               className="h-full w-auto object-contain"
             />
          </div>
          <p className="mt-2 text-xs text-slate-500">Botões de ação removidos para teste de layout.</p>
        </CardContent>
      </Card>
    );
  }

  // MODO: Desenho (Botões "Limpar" e "Salvar Assinatura" Removidos)
  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
          <SignatureCanvas
            ref={sigCanvas}
            penColor='black'
            minWidth={1.5}
            maxWidth={2.5}
            backgroundColor="white"
            canvasProps={{ 
                // Mantido em 200px de altura para seu teste de espaço
                className: 'sigCanvas w-full h-[200px] border-b border-slate-300',
                style: { touchAction: 'none' }
            }}
            onEnd={() => setIsEmpty(sigCanvas.current.isEmpty())}
          />
        </div>
        
        {/* Esta é a área onde os botões ficavam. */}
        <p className="mt-3 text-sm text-slate-500 text-center">Área de botões desativada para teste.</p>
      </CardContent>
    </Card>
  );
}
