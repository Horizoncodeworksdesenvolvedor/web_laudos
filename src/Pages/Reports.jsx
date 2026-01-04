import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft, 
  Building2, 
  Trash2, 
  ArrowRight,
  Plus,
  Search,
  ClipboardCheck, // Adicionado para consistência
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Reports() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.TechnicalReport.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TechnicalReport.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] })
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      {/* Header Fixo */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl('Home'))}
              className="shrink-0 -ml-2"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800">Meus Relatórios</h1>
              <p className="text-xs text-slate-500">{reports.length} documentos</p>
            </div>
          </div>
          <Link to={createPageUrl('NewReport')}>
            <Button className="bg-slate-800 hover:bg-slate-900 h-9 px-4 text-xs sm:text-sm">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Novo</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Área de Filtros */}
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-3">
        {/* Barra de Busca e Filtros em Coluna no Mobile / Linha no Desktop */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente, endereço ou REF..."
              className="pl-10 bg-white h-10 w-full"
            />
          </div>
          {/* Botões de Filtro (Scroll horizontal em telas muito pequenas se necessário) */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {['all', 'draft', 'completed'].map((status) => {
               const labels = { all: 'Todos', draft: 'Rascunhos', completed: 'Concluídos' };
               const isActive = filterStatus === status;
               return (
                <Button
                    key={status}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={`h-10 whitespace-nowrap ${isActive ? 'bg-slate-800' : 'bg-white text-slate-600'}`}
                >
                    {labels[status]}
                </Button>
               );
            })}
          </div>
        </div>
      </div>

      {/* Lista de Relatórios */}
      <div className="max-w-5xl mx-auto px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : filteredReports.length === 0 ? (
          <Card className="bg-white border-dashed border-2 border-slate-200 mt-4">
            <CardContent className="p-8 md:p-12 text-center">
              <p className="text-slate-500 text-sm">Nenhum relatório encontrado com estes filtros.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const isCompleted = report.status === 'completed';
              const isReinspection = report.is_reinspection;

              // Definição de Cores (Igual à Home)
              const iconBgClass = isCompleted ? 'bg-emerald-100' : 'bg-amber-100';
              const iconColorClass = isCompleted ? 'text-emerald-600' : 'text-amber-600';

              return (
                <Card key={report.id} className="bg-white shadow-sm border-0 hover:shadow-md transition-all overflow-hidden">
                  <CardContent className="p-0"> {/* Padding zero para controlar melhor internamente */}
                    <div className="flex items-stretch">
                      
                      {/* Área Clicável Principal (Leva para o relatório) */}
                      <Link 
                        to={createPageUrl(isCompleted ? `ViewReport?id=${report.id}` : `EditReport?id=${report.id}`)}
                        className="flex-1 flex items-center gap-3 p-4 min-w-0 hover:bg-slate-50 transition-colors"
                      >
                        {/* Ícone */}
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-xl shrink-0 ${iconBgClass}`}>
                           {isReinspection ? (
                               <ClipboardCheck className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColorClass}`} />
                           ) : (
                               <Building2 className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColorClass}`} />
                           )}
                        </div>

                        {/* Textos */}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate block w-full">
                            {report.client_name}
                          </h3>
                          
                          <div className="flex items-center gap-2 mt-0.5">
                            {isCompleted ? (
                                <span className="text-[10px] sm:text-xs text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 truncate">
                                    REF: {report.id?.substring(0,8).toUpperCase()}
                                </span>
                            ) : (
                                <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-md">
                                    {report.address || 'Sem endereço'}
                                </p>
                            )}
                            
                            {/* Badge de Revistoria */}
                            {isReinspection && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                    REV
                                </span>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Área de Ações (Fixo à direita) */}
                      <div className="flex items-center gap-2 pr-4 border-l border-slate-100 pl-3 bg-white">
                        
                        {/* Status Badge (Esconde texto em telas muito pequenas) */}
                        <Badge 
                          variant="secondary" 
                          className={`
                            hidden xs:flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide h-6 items-center
                            ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                          `}
                        >
                          {isCompleted ? 'Concluído' : 'Rascunho'}
                        </Badge>

                        {/* Bolinha de status para telas minúsculas */}
                        <div className={`xs:hidden w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                        {/* Data (Só desktop) */}
                        <span className="text-xs text-slate-400 hidden md:block w-20 text-right">
                          {format(new Date(report.created_date), 'dd/MM/yyyy')}
                        </span>

                        {/* Botão Deletar */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button 
                              type="button"
                              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors -mr-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="w-[90%] rounded-xl"> {/* Ajuste largura modal */}
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir relatório?</AlertDialogTitle>
                              <AlertDialogDescription>
                                O relatório de "{report.client_name}" será apagado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(report.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

}
