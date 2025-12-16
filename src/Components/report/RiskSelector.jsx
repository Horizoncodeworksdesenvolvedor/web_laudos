import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const RISK_LEVELS = [
  { 
    value: 'critical', 
    label: 'Crítico', 
    icon: AlertTriangle, 
    color: 'bg-red-50 border-red-300 text-red-700',
    activeColor: 'bg-red-500 border-red-500 text-white'
  },
  { 
    value: 'regular', 
    label: 'Regular', 
    icon: AlertCircle, 
    color: 'bg-amber-50 border-amber-300 text-amber-700',
    activeColor: 'bg-amber-500 border-amber-500 text-white'
  },
  { 
    value: 'minimal', 
    label: 'Mínimo', 
    icon: CheckCircle, 
    color: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    activeColor: 'bg-emerald-500 border-emerald-500 text-white'
  }
];

export default function RiskSelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {RISK_LEVELS.map((risk) => {
        const Icon = risk.icon;
        const isSelected = value === risk.value;
        return (
          <button
            key={risk.value}
            type="button"
            onClick={() => onChange(risk.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all duration-200 font-medium ${
              isSelected ? risk.activeColor : risk.color
            }`}
          >
            <Icon className="w-4 h-4" />
            {risk.label}
          </button>
        );
      })}
    </div>
  );
}