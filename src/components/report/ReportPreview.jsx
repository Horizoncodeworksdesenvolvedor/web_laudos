import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  AlertTriangle, AlertCircle, CheckCircle, FileType, MapPin, 
  Calendar, User, Building2, BarChart3, History, CheckCheck, XCircle
} from 'lucide-react';

// Função para otimizar imagens do Cloudinary (Poco/Galaxy/iPhone)
const optimizeCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return url;
  
  // f_auto: formato automático / q_auto: qualidade balanceada / w_1200: largura ideal
  return url
    .replace('/upload/', '/upload/f_auto,q_auto,w_1200/')
    .replace(/\.(heic|heif|webp)$/i, '.jpg');
};

// Configurações mantidas
const riskConfig = {
  critical: { 
    icon: AlertTriangle, 
    label: 'CRÍTICO', 
    color: 'text-red-600', 
    borderColor: 'border-red-600', 
    bg: 'bg-red-50',
    description: "Situações que oferecem risco iminente à segurança estrutural, saúde ocupacional ou funcionalidade essencial, demandando intervenção imediata."
  },
  regular: { 
    icon: AlertCircle, 
    label: 'REGULAR', 
    color: 'text-amber-600', 
    borderColor: 'border-amber-600',
    bg: 'bg-amber-50',
    description: "Manifestações que requerem atenção e correção em prazo programado, sob risco de agravamento ou comprometimento da vida útil."
  },
  minimal: { 
    icon: CheckCircle, 
    label: 'MÍNIMO', 
    color: 'text-emerald-600', 
    borderColor: 'border-emerald-600',
    bg: 'bg-emerald-50',
    description: "Anomalias de baixa criticidade, de caráter estético ou manutenção preventiva, sem impacto imediato na funcionalidade."
  }
};

const correctionConfig = {
  corrected: { label: 'CORRIGIDO', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCheck },
  partially_corrected: { label: 'PARCIAL', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
  not_corrected: { label: 'NÃO CORRIGIDO', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  pending: { label: 'PENDENTE', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: AlertCircle }
};

// Medidas para impressão
const FOOTER_HEIGHT_MM = 10; 
const PAGE_MARGIN_MM = 15;
const FOOTER_CLEARANCE_MM = FOOTER_HEIGHT_MM + 5; 

// Função de estimativa de peso
const estimateItemWeight = (item) => {
    let weight = 0;
    weight += 100; 
    const charPerLine = 40;
    const weightPerLine = 8;
    if (item.technical_description) {
        weight += Math.ceil(item.technical_description.length / charPerLine) * weightPerLine; 
    }
    if (item.correction_notes) {
        weight += Math.ceil(item.correction_notes.length / charPerLine) * (weightPerLine * 0.8); 
    }
    const photoRowWeight = 150; 
    if (item.photos && item.photos.length > 0) {
        weight += Math.ceil(item.photos.length / 2) * photoRowWeight; 
    }
    if (item.correction_photos && item.correction_photos.length > 0) {
        weight += Math.ceil(item.correction_photos.length / 2) * photoRowWeight; 
    }
    return weight;
};

const getRiskOrder = (risk_level) => {
    if (risk_level === 'critical') return 3;
    if (risk_level === 'regular') return 2;
    if (risk_level === 'minimal') return 1;
    return 0;
};

export default function ReportPreview({ report, fullHistory = [] }) {
  if (!report) return null;

  const today = new Date();
  
  const contentPadding = "px-4 py-6 sm:px-12 sm:py-8 print:p-0"; 

  const displayItems = report.items || [];

  const riskStats = {
    critical: displayItems.filter(i => i.risk_level === 'critical').length,
    regular: displayItems.filter(i => i.risk_level === 'regular').length,
    minimal: displayItems.filter(i => i.risk_level === 'minimal').length,
    total: displayItems.length
  };

  const correctionStats = {
    corrected: displayItems.filter(i => i.correction_status === 'corrected').length,
    partial: displayItems.filter(i => i.correction_status === 'partially_corrected').length,
    pending: displayItems.filter(i => ['pending', 'not_corrected'].includes(i.correction_status || 'pending')).length,
    total: displayItems.length
  };
  
  const groupedItems = new Map();
  displayItems.forEach(item => {
    const loc = item.location || 'Outros';
    item.estimatedWeight = estimateItemWeight(item); 
    if (!groupedItems.has(loc)) groupedItems.set(loc, []);
    groupedItems.get(loc).push(item);
  });
  
  let orderedGroups = Array.from(groupedItems.entries());
  orderedGroups = orderedGroups.map(([locationName, items]) => {
      const sortedItems = [...items].sort((a, b) => {
          const riskA = getRiskOrder(a.risk_level);
          const riskB = getRiskOrder(b.risk_level);
          if (riskB !== riskA) return riskB - riskA;
          return b.estimatedWeight - a.estimatedWeight;
      });
      return [locationName, sortedItems];
  });

  const getPrintableArtUrl = (url) => {
    if (!url) return null;
    if (url.toLowerCase().endsWith('.pdf')) return url.replace('.pdf', '.jpg'); 
    return url;
  };

  const printableArt = getPrintableArtUrl(report.art_url);
  const hasBlueprints = report.blueprints && report.blueprints.length > 0;

  // Numeração
  let currentSectionNumber = 6;
  const dynamicSections = [];
  if (hasBlueprints) dynamicSections.push({ id: 'blueprints', title: 'DOCUMENTAÇÃO TÉCNICA E PROJETOS', number: currentSectionNumber++ });
  else dynamicSections.push({ id: 'blueprints', title: 'DOCUMENTAÇÃO TÉCNICA E PROJETOS', number: currentSectionNumber++ });
  dynamicSections.push({ id: 'conclusion', title: 'CONSIDERAÇÕES FINAIS', number: currentSectionNumber++ });
  if (printableArt) dynamicSections.push({ id: 'art', title: 'ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA', number: currentSectionNumber++ });
  dynamicSections.push({ id: 'signature', title: 'ASSINATURA E ENCERRAMENTO', number: currentSectionNumber++ });

  const summarySections = [
      { n: '1', t: 'IDENTIFICAÇÃO DAS PARTES', p: '03' },
      { n: '2', t: 'IDENTIFICAÇÃO DO IMÓVEL', p: '03' },
      { n: '3', t: 'OBJETO DA VISTORIA', p: '04' },
      { n: '4', 't': 'METODOLOGIA', p: '04' },
      { n: '5', t: 'CONSTATAÇÕES TÉCNICAS', p: '05' },
      ...dynamicSections.filter(s => s.id === 'blueprints').map(s => ({ n: s.number, t: s.title, p: '23' })),
      ...dynamicSections.filter(s => s.id === 'conclusion').map(s => ({ n: s.number, t: s.title, p: '24' })),
      ...dynamicSections.filter(s => s.id === 'art').map(s => ({ n: s.number, t: s.title, p: '25' })),
      ...dynamicSections.filter(s => s.id === 'signature').map(s => ({ n: s.number, t: s.title, p: '26' })),
  ];

  const revisionsList = fullHistory.length > 0 ? fullHistory : [report];

  return (
    <div className="w-full bg-white shadow-2xl rounded-lg overflow-hidden print:overflow-visible print:shadow-none print:rounded-none print:w-full" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      
      <style>{`
        @media print {
          @page { margin: ${PAGE_MARGIN_MM}mm !important; size: A4; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .art-container { page-break-inside: avoid !important; page-break-before: always !important; } 
          .avoid-break, .report-section-header, .content-block-avoid { page-break-inside: avoid !important; }
          .break-before { page-break-before: always !important; }
          .break-after { page-break-after: always !important; }
          .print-dark-text { color: #000 !important; } 
          .report-footer-fixed {
            position: fixed; bottom: 0; left: 0; right: 0;
            height: ${FOOTER_HEIGHT_MM}mm; border-top: 1px solid #cbd5e1;
            display: flex; align-items: center; justify-content: space-between;
            font-size: 9px; color: #64748b; background: white; z-index: 9999;
            padding: 0 ${PAGE_MARGIN_MM}mm; margin-top: 2mm; 
          }
          .content-section:last-child { padding-bottom: ${FOOTER_CLEARANCE_MM}mm !important; }
        }
      `}</style>

      {/* RODAPÉ FIXO */}
      <div className="hidden print:flex report-footer-fixed">
        <div>
            <span className="font-bold uppercase text-slate-700">{report.client_name}</span>
            <span className="mx-2">|</span>
            Ref: #{report.id?.substring(0,8).toUpperCase()}
        </div>
        <div>
            {format(today, "dd/MM/yyyy", { locale: ptBR })}
            <span className="mx-2">|</span>
            Eng. {report.engineer_name.split(' ')[0]}
        </div>
      </div>

      {/* 1. CAPA */}
      <div className={`${contentPadding} break-after min-h-[90vh] flex flex-col items-center text-center pt-8 sm:pt-10 relative print:pt-4 content-section`}>
        <div className="mb-8 sm:mb-12 print:mb-8">
            <img src="/Logo.png" alt="Logo" className="h-24 sm:h-32 w-auto object-contain mx-auto" />
        </div>
        <div className="mb-16 sm:mb-24 w-full max-w-2xl print:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold uppercase tracking-widest text-slate-900 mb-4 leading-tight">
                {report.is_reinspection ? 'RELATÓRIO TÉCNICO DE REVISTORIA' : 'RELATÓRIO TÉCNICO DE VISTORIA'}
            </h1>
            <div className="h-1 w-24 bg-slate-900 mx-auto mb-4"></div>
            <h2 className="text-sm sm:text-xl text-slate-600 uppercase tracking-[0.4em] font-medium">
                Laudo de Engenharia Diagnóstica
            </h2>
        </div>
        
        <div className="w-full max-w-xl space-y-6 sm:space-y-8 text-center print:space-y-6">
            <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">Responsável Técnico</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 uppercase mb-1">{report.engineer_name}</p>
                <p className="text-base sm:text-lg text-slate-600">Engenheiro Civil {report.engineer_crea ? `• CREA: ${report.engineer_crea}` : ''}</p>
            </div>
            
            <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-bold">Cliente</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 uppercase mb-1">{report.client_name}</p>
                <p className="text-base sm:text-lg text-slate-600 px-4 sm:px-8 leading-relaxed break-words">
                    {report.address}
                </p>
            </div>
        </div>

        <div className="mt-auto pb-8 sm:pb-12 print:pb-0">
            <p className="text-base sm:text-lg font-bold text-slate-800 uppercase tracking-wide">
                {/* Usamos a data da vistoria como base para a data da capa, travada ao meio-dia */}
                São Paulo, {report.inspection_date 
                    ? format(new Date(report.inspection_date + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
        </div>
      </div>

      {/* 2. ÍNDICE & CONTROLE */}
      <div className={`${contentPadding} break-after min-h-[50vh] flex flex-col content-section`}>
        <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 uppercase text-center mb-10 sm:mb-16 tracking-widest border-b-2 border-slate-900 pb-4">
                Sumário
            </h2>
            <ul className="text-lg sm:text-xl text-slate-800 space-y-6 sm:space-y-8 font-medium">
                {summarySections.map((item) => (
                    <li key={item.n} className="flex justify-between items-end border-b border-dotted border-slate-300 pb-2">
                        <span className="uppercase tracking-wide flex items-center gap-2 sm:gap-4 text-sm sm:text-xl">
                            <span className="font-bold text-slate-400 w-6 sm:w-8">{item.n}.</span> 
                            {item.t}
                        </span> 
                        <span className="font-bold text-slate-900 text-sm sm:text-xl">{item.p}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div className="mt-12 sm:mt-20 border-t-2 border-slate-900 pt-8 avoid-break">
            <h3 className="text-sm font-bold text-slate-600 uppercase mb-4 tracking-wider flex items-center gap-2">
                <History className="w-4 h-4" /> Histórico de Revisões
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse border border-slate-300 min-w-[500px]">
                    <thead className="bg-slate-100 uppercase text-xs font-bold text-slate-700">
                        <tr>
                            <th className="border border-slate-300 px-4 py-2 w-16 text-center">Rev.</th>
                            <th className="border border-slate-300 px-4 py-2">Descrição</th>
                            <th className="border border-slate-300 px-4 py-2 w-32 text-center">Data</th>
                            <th className="border border-slate-300 px-4 py-2 w-48">Elaboração</th>
                        </tr>
                    </thead>
                    <tbody>
                        {revisionsList.map((rev, index) => {
                            const revNumber = String(index).padStart(2, '0');
                            const isReinspection = index > 0;
                            return (
                                <tr key={rev.id || index}>
                                    <td className="border border-slate-300 px-4 py-3 text-center font-bold">{revNumber}</td>
                                    <td className="border border-slate-300 px-4 py-3">
                                        {isReinspection ? 'Emissão de Revistoria Técnica' : 'Emissão Inicial para Aprovação'}
                                    </td>
                                    <td className="border border-slate-300 px-4 py-3 text-center">
                                        {format(new Date(rev.created_date || today), "dd/MM/yyyy")}
                                    </td>
                                    <td className="border border-slate-300 px-4 py-3 font-medium uppercase text-xs">
                                        {rev.engineer_name?.split(' ').slice(0, 2).join(' ')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      <div className={contentPadding}>
        
        {/* 1. IDENTIFICAÇÃO DAS PARTES */}
        <div className="mb-6 avoid-break print:mb-4 print:mt-4 content-section"> 
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 sm:mb-8 uppercase border-b-2 border-slate-200 pb-2 inline-block print:border-black report-section-header">1. Identificação das Partes</h2>
            
            <div className="mb-8 sm:mb-10 pl-0 sm:pl-2">
                <h3 className="text-sm font-bold text-slate-600 uppercase mb-4 tracking-wider flex items-center gap-2 avoid-break"><User className="w-4 h-4" /> 1.1. Contratante</h3>
                <div className="bg-slate-50 p-4 sm:p-6 rounded-lg border border-slate-100">
                    <div className="flex flex-col sm:flex-row print:flex-row justify-between gap-4 sm:gap-8">
                        <div className="flex-1 min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Nome / Razão Social</span>
                            <p className="font-bold text-slate-900 text-base sm:text-lg uppercase leading-tight break-words">{report.client_name}</p>
                        </div>
                        <div className="w-full sm:w-1/3 min-w-[150px]">
                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">CPF / RG</span>
                            <p className="text-slate-900 text-base sm:text-lg font-mono leading-tight">{report.client_document || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mb-6 pl-0 sm:pl-2">
                <h3 className="text-sm font-bold text-slate-600 uppercase mb-4 tracking-wider flex items-center gap-2 avoid-break"><User className="w-4 h-4" /> 1.2. Responsável Técnico</h3>
                <div className="bg-slate-50 p-4 sm:p-6 rounded-lg border border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-12 print:grid-cols-12 gap-4">
                        <div className="sm:col-span-5 min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Engenheiro</span>
                            <p className="font-bold text-slate-900 text-base sm:text-lg uppercase leading-tight break-words">{report.engineer_name}</p>
                        </div>
                        <div className="sm:col-span-4 min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">CPF / RG</span>
                            <p className="text-slate-900 text-base sm:text-lg font-mono leading-tight">{report.engineer_document || '-'}</p>
                        </div>
                        <div className="sm:col-span-3 min-w-0">
                            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">CREA</span>
                            <p className="text-slate-900 text-base sm:text-lg font-mono leading-tight">{report.engineer_crea || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. IMÓVEL */}
        <div className="mb-6 avoid-break print:mb-4 print:mt-4 content-section">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 uppercase border-b-2 border-slate-200 pb-2 inline-block print:border-black report-section-header">2. Identificação do Imóvel</h2>
            <div className="pl-0 sm:pl-2">
                <div className="mb-4 avoid-break">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-2"><MapPin className="w-3 h-3" /> Endereço Completo</span>
                    <p className="text-slate-900 text-base sm:text-lg font-medium leading-relaxed border-l-4 border-slate-300 pl-4 py-1 break-words">
                        {report.address || 'Não informado'}
                    </p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 text-slate-700 avoid-break">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-xs uppercase font-bold tracking-widest">Data da Vistoria:</span>
                    </div>
                    <span className="font-bold text-base sm:text-lg">
                    {/* Adicionamos 'T12:00:00' para travar a interpretação da data ao meio-dia */}
                    {report.inspection_date ? format(new Date(report.inspection_date + 'T12:00:00'), "dd/MM/yyyy") : '--/--/----'}
                    </span>
                </div>
            </div>
            {report.diligence_text && (
                <div className="mt-8 pl-0 sm:pl-2 avoid-break"> 
                    <h3 className="text-sm font-bold text-slate-600 uppercase mb-2 tracking-wider border-b border-slate-100 inline-block pb-1">2.1. Diligências e Caracterização</h3>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-transparent print:border-slate-300">
                        <p className="text-justify text-base sm:text-lg text-slate-800 leading-relaxed whitespace-pre-wrap font-serif">
                            {report.diligence_text}
                        </p>
                    </div>
                </div>
            )}
        </div>

        {/* 3. OBJETO */}
        <div className="mb-6 avoid-break print:mb-4 print:mt-4 content-section">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 uppercase report-section-header">3. Objeto da Vistoria</h2>
            <p className="text-justify text-base sm:text-lg text-slate-800 leading-relaxed pl-0 sm:pl-2">
                {report.is_reinspection ? 
                    `O presente relatório tem por finalidade a verificação técnica do cumprimento das correções solicitadas no laudo anterior, bem como a identificação de eventuais novos vícios construtivos aparentes.` : 
                    "O presente trabalho tem por objetivo efetuar a vistoria técnica de engenharia no imóvel identificado, visando constatar as anomalias e falhas construtivas aparentes, classificando-as quanto ao grau de risco e orientando quanto às medidas corretivas necessárias, servindo como documento técnico oficial."
                }
            </p>
        </div>

        {/* 4. METODOLOGIA E ESTATÍSTICAS */}
        <div className="mb-6 avoid-break print:mb-4 print:mt-4 content-section">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 uppercase report-section-header">4. Metodologia</h2>
            <p className="text-justify text-base sm:text-lg text-slate-800 mb-6 leading-relaxed pl-0 sm:pl-2">
                A vistoria foi realizada mediante inspeção visual detalhada, registro fotográfico e análise técnica dos elementos construtivos. As constatações foram categorizadas segundo grau de criticidade.
            </p>
            
            {report.performed_tests && report.performed_tests.length > 0 && (
                <div className="mb-8 pl-4 border-l-4 border-slate-200 ml-2 avoid-break">
                    <h3 className="text-sm font-bold text-slate-600 uppercase mb-3 tracking-wider">4.1. Ensaios e Verificações Realizadas</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                        {report.performed_tests.map((test, idx) => (<li key={idx} className="flex items-start text-base sm:text-lg text-slate-800"><CheckCircle className="w-4 h-4 text-slate-400 mr-3 shrink-0 mt-1" />{test}</li>))}
                    </ul>
                </div>
            )}

            {riskStats.total > 0 && (
                <div className="mb-8 pl-4 border-l-4 border-slate-200 ml-2 avoid-break">
                    <h3 className="text-sm font-bold text-slate-600 uppercase mb-4 tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> 4.2. Resumo das Constatações
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {report.is_reinspection ? (
                             <>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-emerald-600 mb-1 print-dark-text">{correctionStats.corrected}</p>
                                    <p className="text-xs font-bold uppercase text-emerald-800 tracking-wider print-dark-text">Corrigidos</p>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-amber-600 mb-1 print-dark-text">{correctionStats.partial}</p>
                                    <p className="text-xs font-bold uppercase text-amber-800 tracking-wider print-dark-text">Parciais</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-red-600 mb-1 print-dark-text">{correctionStats.pending}</p>
                                    <p className="text-xs font-bold uppercase text-red-800 tracking-wider print-dark-text">Pendentes</p>
                                </div>
                             </>
                        ) : (
                             <>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-red-600 mb-1 print-dark-text">{riskStats.critical}</p>
                                    <p className="text-xs font-bold uppercase text-red-800 tracking-wider print-dark-text">Críticos</p>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-amber-600 mb-1 print-dark-text">{riskStats.regular}</p>
                                    <p className="text-xs font-bold uppercase text-amber-800 tracking-wider print-dark-text">Regulares</p>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                                    <p className="text-3xl font-bold text-emerald-600 mb-1 print-dark-text">{riskStats.minimal}</p>
                                    <p className="text-xs font-bold uppercase text-emerald-800 tracking-wider print-dark-text">Mínimos</p>
                                </div>
                             </>
                        )}
                    </div>
                    
                    <p className="text-right text-xs text-slate-400 mt-2 font-mono">
                        Total de itens inspecionados: {riskStats.total}
                    </p>
                </div>
            )}

            <div className="space-y-4 pl-4 avoid-break">
                {[riskConfig.critical, riskConfig.regular, riskConfig.minimal].map((risk) => {
                    const Icon = risk.icon;
                    return (
                        <div key={risk.label} className="flex items-start gap-3 avoid-break">
                            <div className={`mt-1 shrink-0 ${risk.color}`}><Icon className="w-5 h-5" /></div>
                            <div className="text-base sm:text-lg text-slate-700 text-justify leading-relaxed">
                                <span className={`font-bold uppercase mr-2 tracking-wide ${risk.color}`}>{risk.label}:</span>{risk.description}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* 5. CONSTATAÇÕES TÉCNICAS */}
        <div className="pt-8 sm:pt-10 print:pt-0 break-before content-section"> 
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-8 uppercase text-center py-3 bg-slate-100 print:bg-transparent border-y-2 border-slate-200 print:border-black">
                5. Constatações Técnicas
            </h2>
            
            <div className="space-y-8 print:space-y-6"> 
                {orderedGroups.map(([locationName, items], groupIndex) => (
                    <div key={groupIndex}>
                        <div className="avoid-break mb-6 border-l-4 border-slate-800 pl-4 py-2 bg-slate-50 print:bg-transparent rounded-r-lg report-section-header"> 
                            <div className="flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-slate-700" />
                                <span className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wide">
                                    5.{groupIndex + 1}. {locationName}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-8 print:space-y-6 pl-0 sm:pl-4"> 
                            {items.map((item, itemIndex) => {
                                const risk = riskConfig[item.risk_level] || riskConfig.regular;
                                const statusKey = item.correction_status || 'pending';
                                const statusCfg = correctionConfig[statusKey] || correctionConfig.pending;
                                const StatusIcon = statusCfg.icon;

                                return (
                                    <div key={itemIndex} className="border-t border-slate-200 pt-6 pb-2 first:border-t-0 print:pt-4 print:pb-2">
                                        <div className="content-block-avoid">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2 avoid-break">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight mb-1 break-words"> 
                                                        {item.title || 'Apontamento sem título'}
                                                    </h4>
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        Ref: {String(groupIndex + 1)}.{String(itemIndex + 1)}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 ml-0 sm:ml-4 flex-wrap"> 
                                                    <span className={`px-3 py-1 text-xs font-bold uppercase border rounded ${risk.color} ${risk.borderColor} ${risk.bg} print-dark-text`}>
                                                        {risk.label}
                                                    </span>
                                                    {report.is_reinspection && (
                                                        <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase border rounded ${statusCfg.color} print-dark-text`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {statusCfg.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="text-base sm:text-lg text-justify text-slate-800 leading-relaxed font-serif bg-slate-50/50 p-4 rounded-lg border border-slate-100 print:border print:border-slate-300 print:p-4 print:bg-transparent mb-4"> 
                                                <div className="whitespace-pre-wrap">{item.technical_description}</div>
                                                
                                                {report.is_reinspection && item.correction_notes && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200 text-slate-600 text-sm sm:text-base italic print:border-slate-300 avoid-break">
                                                        <strong>Nota da Revistoria:</strong> <span className="whitespace-pre-wrap">{item.correction_notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {item.photos && item.photos.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 avoid-break"> 
                                                {item.photos.map((photo, idx) => (
                                                    <div key={idx} className="relative h-48 sm:h-48 print:h-40 bg-slate-50 rounded-lg overflow-hidden border border-slate-300 shadow-sm print:shadow-none">
                                                        <img src={optimizeCloudinaryUrl(photo)} className="w-full h-full object-contain" alt="" />
                                                        {report.is_reinspection && <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm print:bg-black print-dark-text">ORIGINAL</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {report.is_reinspection && item.correction_photos && item.correction_photos.length > 0 && (
                                            <div className="mb-4 avoid-break">
                                                <p className="text-xs font-bold text-emerald-600 uppercase mb-2 pl-1 print-dark-text">Evidências da Correção</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {item.correction_photos.map((photo, idx) => (
                                                        <div key={idx} className="relative h-48 sm:h-48 print:h-40 bg-emerald-50 rounded-lg overflow-hidden border border-emerald-200 shadow-sm print:shadow-none">
                                                            <img src={optimizeCloudinaryUrl(photo)} className="w-full h-full object-contain" alt="" />
                                                            <span className="absolute top-2 left-2 bg-emerald-600/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm print:bg-black print-dark-text">APÓS CORREÇÃO</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* 6. DOCUMENTAÇÃO TÉCNICA */}
        {dynamicSections.filter(s => s.id === 'blueprints').map(s => (
            <div key={s.number} className="break-before pt-10 min-h-[500px] content-section"> 
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 uppercase border-b-2 border-slate-200 pb-2 inline-block print:border-black report-section-header">{s.number}. Documentação Técnica e Projetos</h2>
                {!hasBlueprints ? (
                    <div className="bg-slate-50 border border-slate-200 p-8 sm:p-12 rounded-lg text-center print:bg-transparent print:border-slate-300">
                        <p className="text-justify text-base sm:text-lg text-slate-800 leading-relaxed italic">"Devido ao morador não ter disponibilizado as plantas e manual do prédio por ser novo ou ainda estar em construção, não foi acrescentado documentos técnicos complementares neste laudo de vistoria."</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {report.blueprints.map((doc, idx) => (
                            <div key={idx} className="avoid-break border-t-2 border-slate-200 pt-6 first:border-t-0">
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 uppercase flex items-center gap-2 border-l-4 border-slate-900 pl-3">
                                    {doc.type === 'floor_plan' ? 'Planta Baixa' : 'Documento'}
                                </h3>
                                <div className="border border-slate-200 rounded-lg overflow-hidden flex justify-center bg-slate-50 p-4 print:border-slate-300">
                                    <img src={optimizeCloudinaryUrl(doc.url)} className="w-full h-auto max-h-[220mm] object-contain" alt="" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ))}

        {/* 7. CONSIDERAÇÕES FINAIS */}
        {dynamicSections.filter(s => s.id === 'conclusion').map(s => (
            <div key={s.number} className="break-before pt-10 min-h-[500px] print:min-h-[200mm] content-section">
                <div className="avoid-break">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 uppercase border-b-2 border-slate-200 pb-2 inline-block print:border-black report-section-header">
                        {s.number}. Considerações Finais
                    </h2>
                    <p className="text-justify text-base sm:text-lg text-slate-800 leading-relaxed pl-0 sm:pl-2">
                        Este laudo reflete a situação do imóvel na data da vistoria. Recomenda-se que as correções sejam realizadas por mão de obra qualificada. Este documento não substitui projetos complementares de engenharia.
                    </p>
                </div>
            </div>
        ))}


        {/* 8. ART */}
        {dynamicSections.filter(s => s.id === 'art').map(s => (
            <div key={s.number} className="art-container pt-10 pb-10 content-section"> 
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 uppercase border-b-2 border-slate-200 pb-2 inline-block print:border-black report-section-header">
                    {s.number}. Anotação de Responsabilidade Técnica
                </h2>
                
                <div className="content-block-avoid"> 
                    {report.art_protocol && (
                        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg inline-block print:bg-transparent print:border-slate-300 avoid-break">
                            <span className="font-bold text-slate-700 mr-2 uppercase tracking-wide">Protocolo / Nº da ART:</span>
                            <span className="font-mono text-slate-900 text-lg sm:text-xl font-bold">{report.art_protocol}</span>
                        </div>
                    )}

                    <div className="flex items-start justify-center pt-4 avoid-break"> 
                        <img 
                            src={printableArt} 
                            className="max-w-full max-h-[200mm] object-contain border border-slate-200 print:border-0" 
                            alt="ART Anexada" 
                        />
                    </div>
                </div>
            </div>
        ))}

        {/* 9. ASSINATURA */}
        {dynamicSections.filter(s => s.id === 'signature').map(s => (
            <div key={s.number} className="break-before pt-10 flex flex-col justify-between min-h-[500px] print:min-h-[200mm] content-section">
                <div className="avoid-break">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 uppercase border-b-2 border-slate-200 pb-2 inline-block print:border-black report-section-header">
                        {s.number}. Assinatura e Encerramento
                    </h2>
                </div>
                
                <div className="w-full mx-auto text-center print:pb-20 pt-32 avoid-break">
    
                    {/* NOVO BLOCO: Exibe a assinatura se o URL existir */}
                    {report.engineer_signature_url ? (
                        <div className="mb-6 mx-auto w-full max-w-[12cm] print:mb-4">
                        <img 
                            src={optimizeCloudinaryUrl(report.engineer_signature_url)} 
                            alt="Assinatura do Engenheiro"
                            // Adicionamos uma borda de baixo para simular a linha, mas é a imagem
                            className="w-full h-auto max-h-[50mm] object-contain border-b-2 border-slate-900 print:border-black pb-2"
                            />
                        </div>
                    ) : (
                        // Linha padrão se não houver assinatura digital (Fallback)
                        <div className="h-px bg-slate-900 w-[12cm] mx-auto mb-6 print:bg-black"></div>
                    )}
                    
                    <p className="font-bold text-slate-900 text-xl sm:text-2xl uppercase">{report.engineer_name}</p>
                    <p className="text-slate-700 text-base sm:text-lg">Engenheiro Civil</p>
                    {report.engineer_crea && <p className="text-slate-600 text-sm sm:text-base mt-1">CREA: {report.engineer_crea}</p>}
                </div>
            </div>
        ))}

      </div>
    </div>
  );
}

