import React from 'react';
import { Beaker, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Lista de testes sugeridos
const SUGGESTED_TESTS = [
  'Inspeção Visual',
  'Ensaio de Percussão (Revestimentos)',
  'Teste de Vazão e Escoamento',
  'Teste Elétrico (Tomadas/Interruptores)',
  'Teste de Funcionamento (Esquadrias)',
  'Verificação de Nivelamento/Prumo',
  'Teste de Estanqueidade (Box/Janelas)',
  'Teste de Umidade (Higrômetro)'
];

export default function TestsSelectionSection({ report, onUpdate }) {
  const selectedTests = report.performed_tests || [];
  const [customTest, setCustomTest] = React.useState('');

  const toggleTest = (test) => {
    if (selectedTests.includes(test)) {
      // Remove se já existe
      onUpdate({ performed_tests: selectedTests.filter(t => t !== test) });
    } else {
      // Adiciona se não existe
      onUpdate({ performed_tests: [...selectedTests, test] });
    }
  };

  const addCustomTest = () => {
    if (customTest && !selectedTests.includes(customTest)) {
      onUpdate({ performed_tests: [...selectedTests, customTest] });
      setCustomTest('');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Beaker className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Ensaios e Testes Realizados</h3>
          <p className="text-sm text-slate-500">Selecione os procedimentos aplicados durante a vistoria.</p>
        </div>
      </div>

      {/* Grade de Botões */}
      <div className="flex flex-wrap gap-3 mb-4">
        {SUGGESTED_TESTS.map((test) => {
          const isSelected = selectedTests.includes(test);
          return (
            <button
              key={test}
              type="button"
              onClick={() => toggleTest(test)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                ${isSelected 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'}
              `}
            >
              {isSelected && <Check className="w-3.5 h-3.5" />}
              {test}
            </button>
          );
        })}
      </div>

      {/* Adicionar Teste Personalizado */}
      <div className="flex gap-2 items-center">
        <Input 
            placeholder="Outro teste específico..." 
            value={customTest}
            onChange={(e) => setCustomTest(e.target.value)}
            className="max-w-md bg-white"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTest())}
        />
        <Button 
            type="button" 
            variant="outline" 
            onClick={addCustomTest}
            disabled={!customTest}
        >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
        </Button>
      </div>

      {/* Lista de Personalizados (que não estão na lista padrão) */}
      <div className="flex flex-wrap gap-2 mt-3">
        {selectedTests.filter(t => !SUGGESTED_TESTS.includes(t)).map(test => (
            <button
              key={test}
              type="button"
              onClick={() => toggleTest(test)}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-red-100 hover:text-red-800 hover:border-red-200 transition-colors"
              title="Clique para remover"
            >
              <Check className="w-3 h-3" />
              {test}
            </button>
        ))}
      </div>
    </div>
  );
}