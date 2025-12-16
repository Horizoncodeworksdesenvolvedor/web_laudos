import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Trash2, MapPin, Edit3, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const riskConfig = {
  critical: { 
    icon: AlertTriangle, 
    label: 'Crítico',
    border: 'border-l-red-500',
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700'
  },
  regular: { 
    icon: AlertCircle, 
    label: 'Regular',
    border: 'border-l-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700'
  },
  minimal: { 
    icon: CheckCircle, 
    label: 'Mínimo',
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700'
  }
};

const correctionStatusConfig = {
  corrected: { label: 'Corrigido', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
  partially_corrected: { label: 'Parcial', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
  not_corrected: { label: 'Não Corrigido', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  pending: { label: 'Pendente', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: AlertCircle }
};

export default function ReinspectionItemCard({ item, index, onEdit, onDelete, isOpen, onToggle }) {
  const risk = riskConfig[item.risk_level] || riskConfig.regular;
  const RiskIcon = risk.icon;
  
  const statusKey = item.correction_status || 'pending';
  const correctionStatus = correctionStatusConfig[statusKey];
  const StatusIcon = correctionStatus.icon;

  // Garante que funciona mesmo se as props novas não forem passadas (fallback)
  const isExpanded = isOpen === undefined ? true : isOpen;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${risk.border} overflow-hidden group hover:shadow-md transition-all duration-300`}>
      
      {/* --- CABEÇALHO (CLICÁVEL) --- */}
      <div 
        onClick={onToggle}
        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4 overflow-hidden">
             {/* Índice e Ícone de Risco */}
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    #{String(index + 1).padStart(2, '0')}
                </span>
                <div className={`p-1.5 rounded-full ${risk.bg} ${risk.text}`}>
                    <RiskIcon className="w-4 h-4" />
                </div>
            </div>

            <div className="min-w-0">
                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-bold tracking-wider mb-0.5">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{item.location}</span>
                </div>
                {/* Mostra o título ou um resumo da descrição se não tiver título */}
                <h4 className="text-sm font-bold text-slate-900 truncate pr-2">
                   {item.technical_description?.substring(0, 50) || 'Item sem descrição'}...
                </h4>
            </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 mt-2 sm:mt-0">
            {/* Status da Correção (Badge visível mesmo fechado) */}
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${correctionStatus.color}`}>
              <StatusIcon className="w-3 h-3" />
              {correctionStatus.label}
            </span>

            <div className="flex items-center border-l border-slate-200 pl-3 gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Avaliar Correção"
                >
                    <Edit3 className="w-4 h-4" />
                </Button>
                
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                    title="Excluir"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Seta de Expandir */}
            <div className={`transition-transform duration-300 ml-1 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
        </div>
      </div>

      {/* --- CORPO DA GAVETA (CONTEÚDO DETALHADO) --- */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-5 animate-in slide-in-from-top-2 duration-200">
            
            {/* Seção 1: O Problema Original */}
            <div className="mb-6 pb-6 border-b border-slate-200">
                <h5 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Situação Original
                </h5>
                <div className="flex flex-col md:flex-row gap-4">
                    {item.photos && item.photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {item.photos.map((photo, idx) => (
                            <img
                                key={idx}
                                src={photo}
                                alt={`Original ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border border-slate-200 bg-white"
                            />
                            ))}
                        </div>
                    )}
                    <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded border border-slate-200 flex-1">
                        {item.technical_description}
                    </p>
                </div>
            </div>

            {/* Seção 2: A Correção */}
            <div>
                <h5 className="text-xs font-bold text-emerald-600 uppercase mb-3 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" /> Avaliação da Correção
                </h5>
                
                <div className="bg-white rounded-lg border border-emerald-100 p-4">
                     {/* Fotos da Correção */}
                    {item.correction_photos && item.correction_photos.length > 0 ? (
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            {item.correction_photos.map((photo, idx) => (
                            <div key={idx} className="relative aspect-square">
                                <img
                                    src={photo}
                                    alt={`Correção ${idx + 1}`}
                                    className="w-full h-full object-cover rounded-lg border-2 border-emerald-100"
                                />
                                <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-[10px] px-1.5 rounded font-bold">NOVA</span>
                            </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic mb-3">Nenhuma foto da correção anexada.</p>
                    )}

                    {/* Notas */}
                    {item.correction_notes ? (
                        <div className="text-sm text-slate-700 bg-emerald-50/50 p-3 rounded border border-emerald-100">
                            <span className="font-bold text-emerald-700 block text-xs uppercase mb-1">Nota do Engenheiro:</span>
                            {item.correction_notes}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">Sem observações adicionais.</p>
                    )}
                </div>
                
                {/* Botão Grande de Avaliar (Opcional, já tem no header, mas bom manter aqui também para contexto) */}
                <Button
                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                    variant="outline"
                    className="w-full mt-4 border-slate-300 hover:bg-slate-100 text-slate-600"
                >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar Avaliação
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}