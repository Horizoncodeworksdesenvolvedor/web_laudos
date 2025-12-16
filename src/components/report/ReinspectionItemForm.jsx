import React, { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import MultiPhotoUpload from './MultiPhotoUpload';

const CORRECTION_STATUS = [
  { value: 'corrected', label: 'Corrigido', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'partially_corrected', label: 'Parcialmente Corrigido', color: 'bg-amber-100 text-amber-700' },
  { value: 'not_corrected', label: 'Não Corrigido', color: 'bg-red-100 text-red-700' },
  { value: 'pending', label: 'Pendente de Avaliação', color: 'bg-slate-100 text-slate-700' }
];

export default function ReinspectionItemForm({ item, onSave, onCancel }) {
  const [correctionStatus, setCorrectionStatus] = useState(item.correction_status || 'pending');
  const [correctionNotes, setCorrectionNotes] = useState(item.correction_notes || '');
  const [correctionPhotos, setCorrectionPhotos] = useState(item.correction_photos || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    let photoUrls = [];
    if (correctionPhotos.length > 0) {
      setIsUploading(true);
      for (const photo of correctionPhotos) {
        if (typeof photo !== 'string') {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: photo });
          photoUrls.push(file_url);
        } else {
          photoUrls.push(photo);
        }
      }
      setIsUploading(false);
    }

    const updatedItem = {
      ...item,
      correction_status: correctionStatus,
      correction_notes: correctionNotes,
      correction_photos: photoUrls
    };

    onSave(updatedItem);
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-slate-700 font-medium mb-3 block">Status da Correção</Label>
        <Select value={correctionStatus} onValueChange={setCorrectionStatus}>
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CORRECTION_STATUS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                <span className={`px-2 py-1 rounded text-sm ${status.color}`}>
                  {status.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-slate-700 font-medium mb-2 block">Observações sobre a Correção</Label>
        <Textarea
          value={correctionNotes}
          onChange={(e) => setCorrectionNotes(e.target.value)}
          placeholder="Descreva como foi feita a correção ou por que não foi corrigido..."
          className="min-h-[100px]"
        />
      </div>

      <div>
        <Label className="text-slate-700 font-medium mb-3 block">Fotos Após Correção</Label>
        <MultiPhotoUpload
          photos={correctionPhotos}
          onPhotosChange={setCorrectionPhotos}
          isUploading={isUploading}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isProcessing}
          className="flex-1 bg-slate-800 hover:bg-slate-900"
        >
          {isProcessing ? (
            // VACINA APLICADA AQUI
            <span key="saving" className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </span>
          ) : (
            // VACINA APLICADA AQUI
            <span key="default" className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Salvar Avaliação
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}