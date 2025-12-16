import React from 'react';

const COMMON_LOCATIONS = [
  'Hall de Entrada',
  'Cozinha',
  'Banheiro Social',
  'Banheiro Suíte',
  'Sala de Estar',
  'Quarto 1',
  'Quarto 2',
  'Área de Serviço',
  'Garagem',
  'Varanda',
  'Corredor',
  'Fachada',
  'Cobertura',
  'Piscina',
  'Salão de Festas'
];

export default function LocationChips({ onSelect, selectedLocation }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COMMON_LOCATIONS.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => onSelect(loc)}
          className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 ${
            selectedLocation === loc
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}