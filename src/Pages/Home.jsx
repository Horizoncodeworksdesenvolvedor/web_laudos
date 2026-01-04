import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Building2,
  ClipboardList,
  ClipboardCheck // Importado para revistoria
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.TechnicalReport.list('-created_date', 10),
  });

  const draftReports = reports.filter(r => r.status === 'draft');
  const completedReports = reports.filter(r => r.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur">
              <ClipboardList className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <span className="text-slate-400 font-medium text-sm md:text-base">Gerador de Relatórios</span>
          </div>
          {/* Ajuste de Texto: text-3xl para mobile para não quebrar feio */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Relatórios Técnicos<br />
            <span className="text-slate-400">em minutos.</span>
          </h1>
          <p className="text-base md:text-lg text-slate-400 mb-8 max-w-xl">
            Transforme suas anotações de campo em laudos técnicos profissionais com IA.
          </p>
          <Link to={createPageUrl('NewReport')}>
            <Button
              className="w-full sm:w-auto h-12 px-6 text-base font-semibold text-slate-900 hover:bg-slate-800 hover:text-white shadow-lg shadow-slate-900/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              Iniciar Nova Vistoria
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - CORREÇÃO DE RESPONSIVIDADE AQUI */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        {/* Mudança: grid-cols-1 para celular (um embaixo do outro), sm:grid-cols-2, md:grid-cols-3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl shrink-0">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-slate-800">{draftReports.length}</p>
                <p className="text-slate-500 text-sm">Em andamento</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-slate-800">{completedReports.length}</p>
                <p className="text-slate-500 text-sm">Concluídos</p>
              </div>
            </CardContent>
          </Card>

          {/* Ocupa 2 colunas no tablet (sm), volta para 1 no desktop (md) ou mobile */}
          <Card className="bg-white shadow-lg border-0 sm:col-span-2 md:col-span-1">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-xl shrink-0">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-slate-800">{reports.length}</p>
                <p className="text-slate-500 text-sm">Total de laudos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-slate-800">Relatórios Recentes</h2>
          <Link to={createPageUrl('Reports')} className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center gap-1">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card className="bg-white border-dashed border-2 border-slate-200">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhum relatório ainda</h3>
              <p className="text-slate-500 mb-6 text-sm">Comece criando sua primeira vistoria técnica.</p>
              <Link to={createPageUrl('NewReport')}>
                <Button className="bg-slate-800 text-white hover:bg-slate-700 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Iniciar Nova Vistoria
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {reports.slice(0, 5).map((report) => {
              const isCompleted = report.status === 'completed';
              const isReinspection = report.is_reinspection;

              // Cores dinâmicas para o ícone
              const iconBgClass = isCompleted ? 'bg-emerald-100' : 'bg-amber-100';
              const iconColorClass = isCompleted ? 'text-emerald-600' : 'text-amber-600';

              return (
                <Link 
                  key={report.id} 
                  to={createPageUrl(isCompleted ? `ViewReport?id=${report.id}` : `EditReport?id=${report.id}`)}
                >
                  <Card className="bg-white hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm">
                    {/* Padding p-4 funciona bem para mobile e desktop */}
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        
                        {/* Ícone (Fixo, não encolhe) */}
                        <div className={`h-12 w-12 flex items-center justify-center rounded-xl shrink-0 ${iconBgClass}`}>
                            {isReinspection ? (
                                <ClipboardCheck className={`w-6 h-6 ${iconColorClass}`} />
                            ) : (
                                <Building2 className={`w-6 h-6 ${iconColorClass}`} />
                            )}
                        </div>
                        
                        {/* Conteúdo Central (Flex-1 para ocupar espaço e truncar texto) */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate leading-tight">
                            {report.client_name}
                          </h3>
                          
                          {/* Linha de baixo (Endereço ou REF) */}
                          <div className="mt-1 flex items-center gap-2 min-w-0 w-full">
                             {isCompleted ? (
                                <span className="text-[10px] sm:text-xs text-slate-500 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 truncate">
                                    REF: {report.id?.substring(0,8).toUpperCase()}
                                </span>
                             ) : (
                                <p className="text-xs text-slate-500 truncate flex-1">
                                    {report.address || 'Sem endereço'}
                                </p>
                             )}

                             {/* Badge de Revistoria (Azul) */}
                             {isReinspection && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">
                                    Revistoria
                                </span>
                             )}
                          </div>
                        </div>

                        {/* Coluna da Direita (Status + Seta) */}
                        <div className="flex items-center gap-2 shrink-0 pl-1">
                           {/* Em mobile muito pequeno, escondemos o texto do badge se necessário, ou usamos um ícone. 
                               Aqui mantive o badge mas com fonte pequena */}
                           <Badge 
                            variant="secondary" 
                            className={`
                              hidden xs:flex px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide
                              ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                            `}
                          >
                            {isCompleted ? 'Concluído' : 'Rascunho'}
                          </Badge>
                          
                          {/* Em telas muito pequenas (<350px), mostramos só a bolinha de cor se preferir, 
                              mas o hidden xs:flex acima já ajuda. Abaixo um fallback visual simples */}
                          <div className={`xs:hidden w-3 h-3 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                          <ArrowRight className="w-4 h-4 text-slate-300" />
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

}
