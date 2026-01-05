import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, Printer, Loader2, ClipboardCheck, CheckCircle, FileStack 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReportPreview from '@/components/report/ReportPreview';

export default function ViewReport() {
  const navigate = useNavigate();
  const [isCreatingReinspection, setIsCreatingReinspection] = useState(false);
  
  const params = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const reportId = params.id || urlParams.get('id');

  // 1. Busca TODOS os relatórios
  const { data: allReports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.TechnicalReport.list(),
  });

  // 2. Lógica da cadeia de relatórios (Histórico)
  const reportChain = useMemo(() => {
    if (!allReports.length || !reportId) return [];

    const current = allReports.find(r => r.id === reportId);
    if (!current) return [];

    let root = current;
    while (root.parent_report_id) {
        const parent = allReports.find(r => r.id === root.parent_report_id);
        if (parent) root = parent;
        else break; 
    }

    let chain = [root];
    let foundNew = true;
    
    while(foundNew) {
        foundNew = false;
        const children = allReports.filter(r => 
            chain.some(c => c.id === r.parent_report_id) && 
            !chain.some(c => c.id === r.id)
        );
        if (children.length > 0) {
            chain = [...chain, ...children];
            foundNew = true;
        }
    }

    return chain.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [allReports, reportId]);

  const latestReport = reportChain[reportChain.length - 1];
  
  const hasPendingItems = latestReport?.items?.some(item => 
    !item.correction_status || 
    ['pending', 'not_corrected', 'partially_corrected'].includes(item.correction_status)
  );

  const handlePrint = () => {
    const originalTitle = document.title;
    if (latestReport) document.title = `Laudo - ${latestReport.client_name}`;
    window.print();
    document.title = originalTitle;
  };

  const handleCreateReinspection = async () => {
    if (!latestReport) return;
    
    const nextRevNumber = reportChain.length; 
    
    
    if (!window.confirm(`Gerar documento de Revistoria (Sequência ${nextRevNumber})?`)) return;

    setIsCreatingReinspection(true);

    try {
        const checkListItems = (latestReport.items || []).map(item => ({
            ...item,
            correction_status: item.correction_status === 'corrected' ? 'corrected' : 'pending',
            correction_photos: item.correction_photos || [],
            correction_notes: item.correction_notes || ''
        }));

        const newReinspection = {
            ...latestReport, 
            id: undefined, 
            items: checkListItems, 
            is_reinspection: true,
            parent_report_id: latestReport.id, 
            status: 'draft',
            created_date: new Date().toISOString(),
            inspection_date: new Date().toLocaleDateString('en-CA')
        };

        const created = await base44.entities.TechnicalReport.create(newReinspection);
        if (created?.id) navigate(createPageUrl(`EditReport?id=${created.id}`));

    } catch (error) {
        console.error("Erro", error);
        alert("Erro ao criar revistoria.");
    } finally {
        setIsCreatingReinspection(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;
  if (reportChain.length === 0) return null;

  return (
    <div className="min-h-screen bg-slate-900 print:bg-white">
      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 0mm; }
          body { margin: 0px; }
          .break-before-page { page-break-before: always; }
        `}
      </style>

      {/* Header Responsivo */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 shadow-md print:hidden">
        {/* CORREÇÃO AQUI: Mudança para flex-col no mobile e md:flex-row no desktop */}
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Título e Botão Voltar */}
            <div className="flex items-center gap-3 text-white w-full md:w-auto">
                <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Home'))} className="shrink-0 -ml-2 text-slate-300 hover:text-white hover:bg-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="min-w-0 flex-1"> {/* min-w-0 evita que texto longo quebre o layout */}
                    <h1 className="font-bold flex items-center gap-2 text-sm sm:text-base md:text-lg truncate">
                        <span className="truncate">{latestReport.client_name}</span>
                        <span className="text-[10px] sm:text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-normal shrink-0">
                            {reportChain.length} Doc(s)
                        </span>
                    </h1>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                        <FileStack className="w-3 h-3" />
                        Histórico Completo
                    </p>
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 w-full md:w-auto">
                {hasPendingItems && (
                    <Button 
                        onClick={handleCreateReinspection} 
                        disabled={isCreatingReinspection} 
                        // No mobile, botão ocupa 50% ou 100% da largura dependendo do gosto. Aqui deixei flex-1 para dividir espaço igual.
                        className="bg-emerald-600 hover:bg-emerald-700 border-emerald-500 flex-1 md:flex-none text-xs sm:text-sm h-10"
                    >
                        {isCreatingReinspection ? <Loader2 className="animate-spin w-4 h-4 mr-2"/> : <ClipboardCheck className="w-4 h-4 mr-2"/>}
                        <span className="truncate">Nova Revistoria</span>
                    </Button>
                )}
                
                {!hasPendingItems && latestReport.is_reinspection && (
                    <div className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-xs font-medium">
                        <CheckCircle className="w-3 h-3 mr-2" />
                        Concluído
                    </div>
                )}

                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 flex-1 md:flex-none text-xs sm:text-sm h-10">
                    <Printer className="w-4 h-4 mr-2" /> 
                    <span className="truncate">Imprimir / PDF</span>
                </Button>
            </div>
        </div>
      </div>

      {/* ÁREA DE IMPRESSÃO */}
      {/* CORREÇÃO AQUI: Padding reduzido no mobile (p-2 ou p-4) para dar espaço ao papel */}
      <div className="max-w-5xl mx-auto p-2 sm:px-4 sm:py-8 print:p-0 print:m-0 print:max-w-none print:w-full">
        <div className="flex flex-col items-center print:block space-y-4 sm:space-y-8 print:space-y-0">
            
            {reportChain.map((doc, index) => (
                <div key={doc.id} className="w-full flex justify-center print:block">
                    {/* O container branco agora é w-full no mobile, mas mantém max-w-[21cm] para não esticar demais em tablets */}
                    <div className="bg-white shadow-2xl w-full max-w-[21cm] print:shadow-none print:max-w-none print:w-full">
                        <ReportPreview 
                            report={doc} 
                            fullHistory={reportChain.slice(0, index + 1)} 
                        />
                    </div>
                    
                    {index < reportChain.length - 1 && (
                        <div className="break-before-page"></div>
                    )}
                </div>
            ))}

        </div>
      </div>
    </div>
  );
}
