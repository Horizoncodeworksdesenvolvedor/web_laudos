import React, { useRef, useState } from 'react';
import { Camera, Image, X, Loader2, Plus } from 'lucide-react';

export default function PhotoUpload({ photo, onPhotoChange, onRemove, isUploading, compact = false }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Função centralizada para processar múltiplos ficheiros
  const processFiles = async (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    try {
      // Comprime todas as imagens selecionadas em paralelo
      const compressedFiles = await Promise.all(
        validFiles.map(file => compressImage(file))
      );
      
      // Se for o modo compacto (dentro de uma galeria), envia o array completo
      // Se for um upload único, envia apenas a primeira foto
      if (compact) {
        onPhotoChange(compressedFiles);
      } else {
        onPhotoChange(compressedFiles[0]);
      }
    } catch (error) {
      console.error("Erro ao processar imagens:", error);
      alert("Ocorreu um erro ao processar as imagens.");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
      // Limpa o valor para permitir selecionar os mesmos ficheiros se necessário
      e.target.value = ''; 
    }
  };

  // Lógica de Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
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
        // Ativa seleção múltipla apenas quando compact (galeria) for true
        multiple={compact} 
        // capture="environment" foi removido para permitir escolha entre Câmera e Galeria no mobile
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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg flex flex-col items-center justify-center 
            transition-all bg-white
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50'}
            ${compact ? 'w-full h-full min-h-[100px]' : 'w-full h-48 gap-3'}
          `}
        >
          {compact ? (
            <>
                <Plus className={`w-6 h-6 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                <span className={`text-xs font-medium ${isDragging ? 'text-blue-600' : 'text-slate-400'}`}>
                    {isDragging ? 'Solte para adicionar' : 'Add Fotos'}
                </span>
            </>
          ) : (
            <>
                <div className="flex gap-4">
                    <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        <Camera className={`w-6 h-6 ${isDragging ? 'text-blue-600' : ''}`} />
                    </div>
                    <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        <Image className={`w-6 h-6 ${isDragging ? 'text-blue-600' : ''}`} />
                    </div>
                </div>
                <div className="text-center px-4">
                  <p className={`text-sm font-medium ${isDragging ? 'text-blue-600' : ''}`}>
                    {isDragging ? 'Solte as imagens aqui' : 'Tirar foto ou selecionar da galeria'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {compact ? 'Selecione uma ou várias fotos' : 'ou arraste e solte os ficheiros aqui'}
                  </p>
                </div>
            </>
          )}
        </button>
      )}
    </>
  );
}
