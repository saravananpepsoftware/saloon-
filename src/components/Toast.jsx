import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';

export default function Toast() {
  const { toastMessage } = useSaloon();

  if (!toastMessage) return null;

  const isWarning = toastMessage.type === 'warning';
  const isDanger = toastMessage.type === 'danger';

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-0 animate-fade-in border"
      style={{
        background: isDanger
          ? '#FEF2F2'
          : isWarning
          ? '#FFFBEB'
          : '#181A20',
        borderColor: isDanger
          ? '#FCA5A5'
          : isWarning
          ? '#FDE68A'
          : '#D4AF37',
        color: isDanger ? '#991B1B' : isWarning ? '#92400E' : '#FFFFFF',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.25), 0 0 15px rgba(212, 175, 55, 0.3)'
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: isDanger
            ? '#FEE2E2'
            : isWarning
            ? '#FEF3C7'
            : 'linear-gradient(135deg, #D4AF37 0%, #B58D20 100%)',
          color: isDanger ? '#EF4444' : isWarning ? '#D97706' : '#FFFFFF'
        }}
      >
        {isDanger ? (
          <AlertTriangle size={18} />
        ) : isWarning ? (
          <AlertTriangle size={18} />
        ) : (
          <Sparkles size={18} />
        )}
      </div>
      <div>
        <div className="text-sm font-semibold tracking-wide">
          {toastMessage.message}
        </div>
      </div>
    </div>
  );
}
