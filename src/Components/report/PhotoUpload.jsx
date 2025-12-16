import React, { useRef } from 'react';
import { Camera, Image, X, Loader2, Plus } from 'lucide-react';

// Adicionei a prop 'compact'
export default function PhotoUpload({ photo, onPhotoChange, onRemove, isUploading, compact = false }) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressedFile = await compressImage(file);
    onPhotoChange(compressedFile);
    // Limpa o input para permitir selecionar a mesma foto se necessário
    e.target.value = ''; 
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {photo ? (
        <div className={`relative group ${compact ? 'w-full h-full' : ''}`}>
          <img
            src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
            alt="Foto"
            className={`object-cover rounded-lg border-2 border-slate-200 ${compact ? 'w-full h-full' : 'w-full h-48'}`}
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center 
            text-slate-500 hover:border-slate-400 hover:bg-slate-50 transition-all bg-white
            ${compact ? 'w-full h-full min-h-[100px]' : 'w-full h-48 gap-3'}
          `}
        >
          {compact ? (
            // Versão Compacta (para grade)
            <>
                <Plus className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-medium text-slate-400">Add Foto</span>
            </>
          ) : (
            // Versão Normal (Grande)
            <>
                <div className="flex gap-4">
                    <div className="p-3 bg-slate-100 rounded-full"><Camera className="w-6 h-6" /></div>
                    <div className="p-3 bg-slate-100 rounded-full"><Image className="w-6 h-6" /></div>
                </div>
                <span className="text-sm font-medium">Tirar foto ou selecionar</span>
            </>
          )}
        </button>
      )}
    </>
  );
}