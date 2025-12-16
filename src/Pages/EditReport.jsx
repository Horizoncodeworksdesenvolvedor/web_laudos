import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Plus, Eye, CheckCircle2, Loader2, X, Pencil // <--- Import Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'; 
import AddItemForm from '@/components/report/AddItemForm';
import EditItemForm from '@/components/report/EditItemForm'; 
import InspectionItemCard from '@/components/report/InspectionItemCard';
import ReinspectionItemCard from '@/components/report/ReinspectionItemCard';
import ReportPreview from '@/components/report/ReportPreview';
import ReinspectionItemForm from '@/components/report/ReinspectionItemForm';
import ArtUploadSection from '@/components/report/ArtUploadSection';
import BlueprintUploadSection from '@/components/report/BlueprintUploadSection';
import DiligenceEditSection from '@/components/report/DiligenceEditSection';
import TestsSelectionSection from '@/components/report/TestsSelectionSection';

export default function EditReport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openItemId, setOpenItemId] = useState(null);

  const params = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const reportId = params.id || urlParams.get('id');

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleToggleItem = (itemId) => {
    setOpenItemId(prevId => prevId === itemId ? null : itemId);
  };

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
        if (!reportId) return null;
        const results = await base44.entities.TechnicalReport.filter({ id: reportId });
        return results && results.length > 0 ? results[0] : null;
    },
    enabled: !!reportId
  });

  const updateMutation = useMutation({
    mutationFn: async (changes) => {
       const fullPayload = { ...report, ...changes };
       return await base44.entities.TechnicalReport.update(reportId, fullPayload);
    },
    onSuccess: (updatedData) => {
        queryClient.setQueryData(['report', reportId], updatedData);
        queryClient.invalidateQueries({ queryKey: ['report', reportId] });
    }
  });

  useEffect(() => {
    if (report && report.status === 'completed') {
      navigate(createPageUrl(`ViewReport?id=${reportId}`));
    }
  }, [report, navigate, reportId]);

  const handleAddItem = (newItem) => {
    const updatedItems = [...(report?.items || []), newItem];
    updateMutation.mutate({ items: updatedItems });
    setIsAddingItem(false);
  };

  const handleDeleteItem = (itemId) => {
    const updatedItems = (report?.items || []).filter(item => item.id !== itemId);
    updateMutation.mutate({ items: updatedItems });
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
  };

  const handleSaveEditItem = (updatedItem) => {
    const updatedItems = (report?.items || []).map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    updateMutation.mutate({ items: updatedItems });
    setEditingItem(null); 
  };

  const handleMarkComplete = async () => {
    if (report.art_url && !report.art_protocol) {
      alert("Atenção: Você anexou uma ART, mas não informou o Número do Protocolo. Por favor, preencha o campo obrigatório na seção de Documentação.");
      const artSection = document.getElementById('art-section');
      if (artSection) artSection.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    await updateMutation.mutateAsync({ status: 'completed' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!report) return null;
  if (report.status === 'completed') return null;

  const hasItems = report.items && report.items.length > 0;
  const items = report.items || [];
  
  const hasBlueprints = report.blueprints && report.blueprints.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl('Home'))}
                className="shrink-0 hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </Button>
              
              {/* --- CABEÇALHO DO RELATÓRIO COM NOME E BOTÃO EDITAR --- */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-slate-900 truncate">
                        {report.client_name}
                    </h1>
                    
                    {/* BOTÃO NOVO: Vai para a tela anterior (cadastro) em modo de edição */}
                    <button 
                        onClick={() => navigate(`/new?editId=${reportId}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center gap-1 bg-slate-50 border border-slate-200"
                        title="Editar Dados Iniciais (Voltar)"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase hidden sm:inline">Editar Dados</span>
                    </button>

                </div>
                <p className="text-sm text-slate-500 truncate max-w-[200px] sm:max-w-md">
                    {report.address || 'Sem endereço'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                 <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                    <ReportPreview report={report} onClose={() => setPreviewOpen(false)} />
                 </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {hasItems && report.status === 'draft' && (
          <div className="mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="font-bold text-emerald-900">Laudo em andamento</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Você já adicionou {items.length} itens. Quando terminar, finalize para gerar o PDF.
                </p>
              </div>
              
              <Button
                onClick={handleMarkComplete}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm w-full sm:w-auto"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <span key="loading" className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finalizar Laudo
                  </span>
                ) : (
                  <span key="default" className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Finalizar Laudo
                  </span>
                )}
              </Button>

            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            
            <DiligenceEditSection
                report={report}
                onUpdate={(changes) => updateMutation.mutate(changes)}
            />

            <TestsSelectionSection
                report={report}
                onUpdate={(changes) => updateMutation.mutate(changes)}
            />

            <div id="art-section">
                <ArtUploadSection 
                    report={report} 
                    onUpdate={(changes) => updateMutation.mutate(changes)} 
                />
            </div>

            <BlueprintUploadSection
                report={report}
                onUpdate={(changes) => updateMutation.mutate(changes)}
            />

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Itens da Vistoria ({items.length})
              </h2>
            </div>

            {!hasItems ? (
                <Card className="bg-white border-dashed border-2 border-slate-200 shadow-none p-8 text-center text-slate-500">
                  <p>Nenhum item adicionado ainda.</p>
                </Card>
            ) : (
              <div className="space-y-4">
                    {items.map((item, index) => (
                        report.is_reinspection ? 
                        <ReinspectionItemCard 
                            key={item.id || index} 
                            item={item} 
                            index={index} 
                            onEdit={handleEditItem} 
                            onDelete={handleDeleteItem}
                            isOpen={openItemId === item.id}
                            onToggle={() => handleToggleItem(item.id)}
                        /> : 
                        <InspectionItemCard 
                            key={item.id || index} 
                            item={item} 
                            index={index} 
                            onDelete={handleDeleteItem}
                            onEdit={handleEditItem}
                            isOpen={openItemId === item.id}
                            onToggle={() => handleToggleItem(item.id)}
                        />
                    ))}
                </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Total de itens</span>
                  <span className="font-bold text-slate-900 text-base">{items.length}</span>
                </div>
                
                <div className="h-px bg-slate-100 my-2"></div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">ART</span>
                  <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                      report.art_url 
                        ? (report.art_protocol ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700') 
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {report.art_url 
                        ? (report.art_protocol ? 'OK' : 'FALTA PROTOCOLO') 
                        : 'PENDENTE'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Plantas/Manuais</span>
                  <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                      hasBlueprints 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    {hasBlueprints ? 'OK' : 'PENDENTE'}
                  </span>
                </div>

                <div className="h-px bg-slate-100 my-2"></div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-slate-600">Críticos</span>
                    </div>
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-xs">
                        {items.filter(i => i.risk_level === 'critical').length}
                    </span>
                    </div>
                    
                    <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-slate-600">Regulares</span>
                    </div>
                    <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-xs">
                        {items.filter(i => i.risk_level === 'regular').length}
                    </span>
                    </div>

                    <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-slate-600">Mínimos</span>
                    </div>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">
                        {items.filter(i => i.risk_level === 'minimal').length}
                    </span>
                    </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Botões Flutuantes */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-row items-end gap-3">
        
        {/* Oculta o botão de olho se o formulário de adicionar estiver aberto */}
        {!isAddingItem && (
            <Button 
                onClick={() => setPreviewOpen(!previewOpen)}
                className={`
                  h-14 w-14 p-0 rounded-full shadow-lg transition-all hover:scale-105 flex items-center justify-center border border-slate-200
                  ${previewOpen ? 'bg-red-600 hover:bg-red-700 text-white z-[60]' : 'bg-black hover:bg-slate-800 text-white z-40'}
                `}
            >
                {previewOpen ? <X className="w-6 h-6" /> : <Eye className="w-5 h-5" />}
            </Button>
        )}

        {/* Botão Flutuante de Adicionar (Oculto se o preview estiver aberto) */}
        {!previewOpen && (
          <Sheet open={isAddingItem} onOpenChange={setIsAddingItem}>
              <SheetTrigger asChild>
                  <Button className="h-14 w-14 p-0 rounded-full bg-black text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 hover:shadow-2xl flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                  </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                      <SheetTitle>
                      {report.is_reinspection ? 'Novo Apontamento (Revistoria)' : 'Novo Item de Vistoria'}
                      </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                      <AddItemForm onAddItem={handleAddItem} />
                  </div>
              </SheetContent>
          </Sheet>
        )}
      </div>

      {editingItem && (
        <Sheet open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {report.is_reinspection ? 'Avaliar Correção' : 'Editar Item'}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {report.is_reinspection ? (
                <ReinspectionItemForm
                  item={editingItem}
                  onSave={handleSaveEditItem}
                  onCancel={() => setEditingItem(null)}
                />
              ) : (
                <EditItemForm
                  item={editingItem}
                  onSave={handleSaveEditItem}
                  onCancel={() => setEditingItem(null)}
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}