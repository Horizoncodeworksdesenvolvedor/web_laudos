// src/components/report/SignaturePad.jsx

import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button'; //
import { Card, CardContent } from '@/components/ui/card'; //
import { Undo, Trash2, CheckCircle2 } from 'lucide-react';

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

  // Limpa o canvas
  const clearSignature = () => {
    if (sigCanvas.current) {
        sigCanvas.current.clear();
        setIsEmpty(true);
    }
  };

  // Captura o desenho em Base64, TRIMA o espaço em branco e salva
  const saveSignature = () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;

    // 1. Usa getTrimmedCanvas para cortar o espaço em branco
    const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
    
    // 2. Exporta o desenho como data URL (Base64)
    const dataURL = trimmedCanvas.toDataURL('image/png');
    
    onSaveSignature(dataURL);
    setIsEmpty(false);
  };

  // MODO: Assinatura Salva
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
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => {
                // Ao apagar, salva NULL no banco de dados
                onSaveSignature(null); 
            }}
            className="mt-3"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Apagar e Refazer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // MODO: Desenho
  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        {/* Adicionado h-[180px] para a área de desenho */}
        <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
          <SignatureCanvas
            ref={sigCanvas}
            penColor='black'
            minWidth={1.5}
            maxWidth={2.5}
            backgroundColor="white"
            canvasProps={{ 
                // 🚨 CORREÇÃO DE LARGURA/ALTURA: Aumenta a altura para melhor desenho (h-40 -> h-[180px])
                className: 'sigCanvas w-full h-[180px] border-b border-slate-300',
                style: { touchAction: 'none' }
            }}
            onEnd={() => setIsEmpty(sigCanvas.current.isEmpty())}
          />
        </div>
        
        <div className="mt-3 flex justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearSignature}
            disabled={isEmpty}
          >
            <Undo className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          {/* 🚨 CORREÇÃO DO BOTÃO: Removido o 'size="sm"' para que o padding padrão do Button (px-4 py-2) funcione corretamente e o texto não seja cortado. */}
          <Button 
            onClick={saveSignature}
            disabled={isEmpty}
            className="bg-slate-800 hover:bg-slate-900"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Salvar Assinatura
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
