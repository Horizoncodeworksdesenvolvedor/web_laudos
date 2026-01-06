import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl, maskDocument, maskRG, isValidCPF, isValidCNPJ } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query'; // Importação adicionada
import { 
  ArrowLeft, ArrowRight, Building2, MapPin, Calendar, 
  Loader2, User, Save, Home, Building, ClipboardList 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function NewReport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Inicialização do cliente de cache
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId'); 
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_document: '',
    address: '', 
    inspection_date: new Date().toLocaleDateString('en-CA'),
    engineer_name: '',
    engineer_document: '',
    engineer_crea: '',
    diligence_text: ''
  });

  const [addressDetails, setAddressDetails] = useState({
    condominium: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const [propertyType, setPropertyType] = useState('house');
  const [apartmentDetails, setApartmentDetails] = useState({ block: '', floor: '', unit: '' });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false); 
  
  const [errors, setErrors] = useState({
    client_document: '',
    engineer_document: ''
  });

  useEffect(() => {
    if (editId) {
        const loadReport = async () => {
            setIsLoadingData(true);
            try {
                const results = await base44.entities.TechnicalReport.filter({ id: editId });
                if (results && results.length > 0) {
                    const report = results[0];
                    setFormData({
                        client_name: report.client_name || '',
                        client_document: report.client_document || '',
                        address: report.address || '',
                        inspection_date: report.inspection_date ? report.inspection_date.split('T')[0] : '',
                        engineer_name: report.engineer_name || '',
                        engineer_document: report.engineer_document || '',
                        engineer_crea: report.engineer_crea || '',
                        diligence_text: report.diligence_text || ''
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar relatório", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadReport();
    }
  }, [editId]);

  useEffect(() => {
    if (editId) return; 

    const { condominium, street, number, neighborhood, city, state, cep } = addressDetails;
    const { block, floor, unit } = apartmentDetails;

    const parts = [];
    if (condominium) parts.push(condominium);
    if (street) parts.push(street);
    if (number) parts.push(number);
    
    if (propertyType === 'apartment') {
      if (block) parts.push(`Bloco ${block}`);
      if (floor) parts.push(`${floor}º Andar`);
      if (unit) parts.push(`Apto ${unit}`);
    }

    let suffix = '';
    if (neighborhood) suffix += ` - ${neighborhood}`;
    if (city) suffix += `, ${city}`;
    if (state) suffix += ` - ${state}`;
    if (cep) suffix += ` (CEP: ${cep})`;

    const fullAddress = parts.join(', ') + suffix;
    
    if (fullAddress.length > 5) {
        setFormData(prev => ({ ...prev, address: fullAddress }));
    }
  }, [addressDetails, apartmentDetails, propertyType, editId]);

  const handleCepChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setAddressDetails(prev => ({ ...prev, cep: value }));

    if (value.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${value}`);
        
        if (!response.ok) throw new Error("CEP não encontrado");
        
        const data = await response.json();
        
        setAddressDetails(prev => ({
          ...prev,
          cep: value,
          street: data.street || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || ''
        }));

        setTimeout(() => {
          document.getElementById('address-number')?.focus();
        }, 100);

      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const validateClientDocument = () => {
    const doc = formData.client_document.replace(/\D/g, '');
    if (!doc) return; 

    let isValid = false;
    if (doc.length > 11) isValid = isValidCNPJ(doc);
    else if (doc.length === 11) isValid = isValidCPF(doc);
    else {
        setErrors(prev => ({...prev, client_document: 'Documento incompleto'}));
        return;
    }

    setErrors(prev => ({
        ...prev,
        client_document: isValid ? '' : 'Documento inválido'
    }));
  };

  const validateEngineerDocument = () => {
    const doc = formData.engineer_document.replace(/\D/g, '');
    if (!doc) {
        setErrors(prev => ({ ...prev, engineer_document: '' }));
        return;
    }

    if (doc.length < 5) {
        setErrors(prev => ({ ...prev, engineer_document: 'Documento muito curto' }));
    } 
    else if (doc.length === 11) {
        const isValid = isValidCPF(doc);
        setErrors(prev => ({
            ...prev,
            engineer_document: isValid ? '' : 'CPF inválido'
        }));
    } 
    else if (doc.length === 9) {
        setErrors(prev => ({ ...prev, engineer_document: '' }));
    }
    else {
        setErrors(prev => ({ ...prev, engineer_document: 'Verifique a quantidade de dígitos' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (errors.client_document || errors.engineer_document) {
        alert("Corrija os erros nos documentos antes de continuar.");
        return;
    }

    if (!formData.client_name || !formData.engineer_name) return;

    try {
      setIsProcessing(true);
      
      if (editId) {
          await base44.entities.TechnicalReport.update(editId, formData);
          
          // VACINA: Invalida o cache para forçar o recarregamento dos novos dados
          queryClient.invalidateQueries({ queryKey: ['report', editId] });
          queryClient.invalidateQueries({ queryKey: ['reports'] });

          navigate(createPageUrl(`EditReport?id=${editId}`)); 
      } else {
          const report = await base44.entities.TechnicalReport.create({
            ...formData,
            items: [],
            status: 'draft'
          });

          if (report && report.id) {
            navigate(createPageUrl(`EditReport?id=${report.id}`));
          } else {
            alert("Erro ao criar relatório.");
          }
      }
    } catch (error) {
      console.error("Erro ao processar:", error);
      alert("Erro ao processar dados.");
    } finally {
        setIsProcessing(false);
    }
  };

  if (isLoadingData) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-slate-400"/></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editId ? navigate(createPageUrl(`EditReport?id=${editId}`)) : navigate(createPageUrl('Home'))}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">{editId ? 'Editar Dados Iniciais' : 'Nova Vistoria'}</h1>
            <p className="text-sm text-slate-500">{editId ? 'Corrija as informações do laudo' : 'Preencha os dados iniciais'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Dados do Cliente
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">Nome do Cliente</Label>
                    <Input
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      placeholder="Ex: João da Silva ou Empresa X"
                      className="h-12 text-base text-slate-900"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium mb-2 block">CPF ou CNPJ</Label>
                    <Input
                      value={formData.client_document}
                      onChange={(e) => {
                          const masked = maskDocument(e.target.value);
                          setFormData({ ...formData, client_document: masked });
                          if(errors.client_document) setErrors({...errors, client_document: ''});
                      }}
                      onBlur={validateClientDocument}
                      placeholder="000.000.000-00"
                      className={`h-12 text-base text-slate-900 ${errors.client_document ? 'border-red-500 bg-red-50' : ''}`}
                    />
                    {errors.client_document && <p className="text-xs text-red-500 mt-1">{errors.client_document}</p>}
                  </div>
                  
                  <div className="space-y-4">
                    {editId ? (
                        <div key="edit-address-view" className="animate-in fade-in">
                            <Label className="text-slate-700 font-medium mb-2 block">Endereço Completo</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="h-12 text-base text-slate-900 bg-white"
                            />
                            <p className="text-xs text-slate-500 mt-1">Edite o texto do endereço conforme necessário.</p>
                        </div>
                    ) : (
                        <div key="create-address-view" className="space-y-4 animate-in fade-in">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium block">Tipo de Imóvel</Label>
                                <div className="grid grid-cols-2 gap-3">
                                <div 
                                    onClick={() => setPropertyType('house')}
                                    className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                                    propertyType === 'house' 
                                        ? 'border-slate-800 bg-slate-50 text-slate-900' 
                                        : 'border-slate-200 hover:border-slate-300 text-slate-500'
                                    }`}
                                >
                                    <Home className="w-6 h-6" />
                                    <span className="font-semibold text-sm">Casa / Comercial</span>
                                </div>
                                <div 
                                    onClick={() => setPropertyType('apartment')}
                                    className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                                    propertyType === 'apartment' 
                                        ? 'border-slate-800 bg-slate-50 text-slate-900' 
                                        : 'border-slate-200 hover:border-slate-300 text-slate-500'
                                    }`}
                                >
                                    <Building className="w-6 h-6" />
                                    <span className="font-semibold text-sm">Apartamento</span>
                                </div>
                                </div>
                            </div>

                            {propertyType === 'apartment' && (
                                <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <Label className="text-xs text-slate-500 font-semibold uppercase mb-1 block">Bloco / Torre</Label>
                                    <Input value={apartmentDetails.block} onChange={(e) => setApartmentDetails({...apartmentDetails, block: e.target.value})} placeholder="Ex: A" className="h-10 bg-white" />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500 font-semibold uppercase mb-1 block">Andar</Label>
                                    <Input value={apartmentDetails.floor} onChange={(e) => setApartmentDetails({...apartmentDetails, floor: e.target.value})} placeholder="Ex: 12" className="h-10 bg-white" />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500 font-semibold uppercase mb-1 block">Apto / Unid</Label>
                                    <Input value={apartmentDetails.unit} onChange={(e) => setApartmentDetails({...apartmentDetails, unit: e.target.value})} placeholder="Ex: 124" className="h-10 bg-white" />
                                </div>
                                </div>
                            )}

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
                                <Label className="text-slate-700 font-bold flex items-center gap-2"><MapPin className="w-4 h-4"/> Localização</Label>
                                <div>
                                    <Label className="text-xs text-slate-500 font-semibold uppercase mb-1 block">Condomínio (Opcional)</Label>
                                    <Input value={addressDetails.condominium} onChange={(e) => setAddressDetails({...addressDetails, condominium: e.target.value})} className="h-10 bg-white" />
                                </div>
                                <div className="relative">
                                    <Label className="text-xs text-slate-500 font-semibold uppercase mb-1 block">CEP</Label>
                                    <Input value={addressDetails.cep} onChange={handleCepChange} maxLength={9} className="h-10 bg-white" />
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="col-span-3"><Label className="text-xs">Logradouro</Label><Input value={addressDetails.street} onChange={(e)=>setAddressDetails({...addressDetails, street:e.target.value})} className="h-10 bg-white"/></div>
                                    <div className="col-span-1"><Label className="text-xs">Número</Label><Input id="address-number" value={addressDetails.number} onChange={(e)=>setAddressDetails({...addressDetails, number:e.target.value})} className="h-10 bg-white"/></div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="col-span-2"><Label className="text-xs">Bairro</Label><Input value={addressDetails.neighborhood} onChange={(e)=>setAddressDetails({...addressDetails, neighborhood:e.target.value})} className="h-10 bg-white"/></div>
                                    <div className="col-span-1"><Label className="text-xs">Cidade</Label><Input value={addressDetails.city} onChange={(e)=>setAddressDetails({...addressDetails, city:e.target.value})} className="h-10 bg-white"/></div>
                                    <div className="col-span-1"><Label className="text-xs">UF</Label><Input value={addressDetails.state} onChange={(e)=>setAddressDetails({...addressDetails, state:e.target.value})} maxLength={2} className="h-10 bg-white uppercase"/></div>
                                </div>
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados do Engenheiro
                </h3>
                <div className="space-y-4">
                  <Input
                      value={formData.engineer_name}
                      onChange={(e) => setFormData({ ...formData, engineer_name: e.target.value })}
                      placeholder="Nome completo"
                      className="h-12 text-base text-slate-900"
                      required
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        value={formData.engineer_document}
                        onChange={(e) => {
                            const val = e.target.value;
                            const clean = val.replace(/\D/g, '');
                            let masked = val;
                            if (clean.length > 9) masked = maskDocument(val); 
                            else masked = maskRG(val); 
                            setFormData({ ...formData, engineer_document: masked });
                            if(errors.engineer_document) setErrors({...errors, engineer_document: ''});
                        }}
                        onBlur={validateEngineerDocument}
                        placeholder="CPF ou RG"
                        className={`h-12 text-base text-slate-900 ${errors.engineer_document ? 'border-red-500 bg-red-50' : ''}`}
                    />
                    <Input
                        value={formData.engineer_crea}
                        onChange={(e) => setFormData({ ...formData, engineer_crea: e.target.value })}
                        placeholder="CREA"
                        className="h-12 text-base text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Detalhes da Vistoria
                </h3>
                
                <div>
                    <Label className="text-slate-700 font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Data da Vistoria
                    </Label>
                    <Input
                    type="date"
                    value={formData.inspection_date}
                    onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                    className="h-12 text-base text-slate-900"
                    />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isProcessing || !formData.client_name || !formData.engineer_name}
                  className="w-full bg-slate-800 hover:bg-slate-900 h-14 text-base font-semibold"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {editId ? 'Salvando Alterações...' : 'Criando...'}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {editId ? 'Salvar e Voltar para Itens' : 'Continuar para Vistoria'}
                      {editId ? <Save className="w-5 h-5 ml-2" /> : <ArrowRight className="w-5 h-5 ml-2" />}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
