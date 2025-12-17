// src/components/report/SignaturePad.jsx

import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

    // Usa getTrimmedCanvas para cortar o espaço em branco (Melhoria de qualidade)
    const trimmedCanvas = sigCanvas.current.getTrimmedCanvas();
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
            className="mt-3 px-4"
            onClick={() => {
                onSaveSignature(null); 
            }}
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
        <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
          <SignatureCanvas
            ref={sigCanvas}
            penColor='black'
            minWidth={1.5}
            maxWidth={2.5}
            backgroundColor="white"
            canvasProps={{ 
                // Aumentado para 200px de altura
                className: 'sigCanvas w-full h-[200px] border-b border-slate-300',
                style: { touchAction: 'none' }
            }}
            onEnd={() => setIsEmpty(sigCanvas.current.isEmpty())}
          />
        </div>
        
        {/* CONTAINER DOS BOTÕES COM LAYOUT 50/50 E ADAPTAÇÃO DE TEXTO */}
        <div className="mt-3 flex gap-2">
          
          <Button 
            variant="outline" 
            className="flex-1 justify-center" // Ocupe 50% e centralize o conteúdo
            onClick={clearSignature}
            disabled={isEmpty}
          >
            <Undo className="w-4 h-4 mr-1 sm:mr-2" />
            {/* Adaptação: Mostra só "Limpar" em telas pequenas/médias */}
            <span className="hidden sm:inline">Limpar</span>
            <span className="sm:hidden">Apagar</span> 
          </Button>
          
          <Button 
            className="bg-slate-800 hover:bg-slate-900 flex-1 justify-center" // Ocupe 50% e centralize o conteúdo
            onClick={saveSignature}
            disabled={isEmpty}
          >
            <CheckCircle2 className="w-4 h-4 mr-1 sm:mr-2" />
            {/* Adaptação: Mostra "Salvar Assinatura" em telas maiores, e só "Salvar" em telas pequenas */}
            <span className="hidden sm:inline">Salvar Assinatura</span>
            <span className="inline sm:hidden">Salvar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
