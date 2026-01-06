import React from 'react';
import { X } from 'lucide-react';
import PhotoUpload from './PhotoUpload';

export default function MultiPhotoUpload({ photos, onPhotosChange, isUploading }) {
  
  const handleAddPhoto = (newPhotos) => {
    // CORREÇÃO: Verifica se recebemos um array (várias fotos) ou apenas uma.
    // Usamos o "spread operator" (...) para adicionar todas as novas fotos individualmente na lista.
    const photosToAdd = Array.isArray(newPhotos) ? newPhotos : [newPhotos];
    onPhotosChange([...photos, ...photosToAdd]);
  };

  const handleRemovePhoto = (indexToRemove) => {
    onPhotosChange(photos.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4 mb-6">
      
      {/* Grade de Fotos Existentes + Botão de Adicionar */}
      <div className="grid grid-cols-3 gap-3">
        
        {/* Lista as fotos já adicionadas */}
        {photos.map((photo, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover rounded-lg border border-slate-200 shadow-sm"
            />
            <button
              type="button"
              onClick={() => handleRemovePhoto(index)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
              title="Remover foto"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Botão para Adicionar Nova Foto */}
        <div className="aspect-square">
            <PhotoUpload 
                photo={null} 
                onPhotoChange={handleAddPhoto} 
                isUploading={isUploading}
                compact={true} 
            />
        </div>
      </div>
      
      {/* Texto de ajuda discreto */}
      {photos.length > 0 && (
          <p className="text-xs text-slate-400 text-right">
              {photos.length} foto(s) anexada(s)
          </p>
      )}
    </div>
  );
}
