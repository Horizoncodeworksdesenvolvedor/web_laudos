import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Trash2, MapPin, Pencil, ChevronDown } from 'lucide-react';

const riskConfig = {
  critical: { icon: AlertTriangle, label: 'Crítico', border: 'border-l-red-500', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', text: 'text-red-700' },
  regular: { icon: AlertCircle, label: 'Regular', border: 'border-l-amber-500', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700', text: 'text-amber-700' },
  minimal: { icon: CheckCircle, label: 'Mínimo', border: 'border-l-emerald-500', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700' }
};

export default function InspectionItemCard({ item, onDelete, onEdit, isOpen, onToggle }) {
  const risk = riskConfig[item.risk_level] || riskConfig.regular;
  const RiskIcon = risk.icon;

  // Mantém a compatibilidade caso isOpen não seja enviado
  const isExpanded = isOpen === undefined ? true : isOpen;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${risk.border} overflow-hidden group hover:shadow-md transition-all duration-300`}>
      
      {/* --- CABEÇALHO --- */}
      <div 
        onClick={onToggle}
        className="p-4 flex items-center justify-between cursor-pointer bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4 overflow-hidden min-w-0 flex-1">
            {/* Ícone de Risco */}
            <div className={`p-2 rounded-full shrink-0 ${risk.bg} ${risk.text}`}>
                <RiskIcon className="w-5 h-5" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-bold tracking-wider mb-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.location}</span>
                </div>
                {/* O truncate aqui impede que o título empurre os botões para fora */}
                <h4 className="text-base font-bold text-slate-900 truncate pr-4">
                    {item.title || 'Apontamento sem título'}
                </h4>
            </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
            {/* Botões de Ação */}
            <div className="flex items-center border-r border-slate-200 pr-3 mr-1 gap-1">
                <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Editar"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Excluir"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
        </div>
      </div>

      {/* --- CONTEÚDO (GAVETA) --- */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col md:flex-row p-5 gap-6">
                
                {/* Fotos */}
                {item.photos && item.photos.length > 0 && (
                <div className="md:w-64 shrink-0 grid gap-2 h-fit" style={{ gridTemplateColumns: item.photos.length === 1 ? '1fr' : 'repeat(2, 1fr)' }}>
                    {item.photos.map((photo, photoIndex) => (
                    <img key={photoIndex} src={photo} alt="Foto" className="w-full h-32 object-cover rounded-lg border border-slate-200 shadow-sm" />
                    ))}
                </div>
                )}
                
                {/* Texto Técnico - Onde o erro costuma acontecer */}
                <div className="flex-1 min-w-0"> 
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${risk.badge}`}>
                            Risco {risk.label}
                        </span>
                    </div>
                    {/* CORREÇÃO AQUI: 
                      - break-words: quebra palavras gigantes (como links)
                      - whitespace-pre-wrap: respeita quebras de linha mas dobra o texto se não couber
                    */}
                    <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed text-sm text-justify break-words whitespace-pre-wrap">
                        {item.technical_description}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
