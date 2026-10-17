import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`w-full ${maxWidth} max-h-[88vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#D4AF37]/30 overflow-hidden transform transition-all animate-fade-in relative my-auto`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 20px 50px rgba(18, 20, 24, 0.25), 0 0 30px rgba(212, 175, 55, 0.15)'
        }}
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D4AF37] via-[#F9E79F] to-[#B58D20] shrink-0" />

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#F0EBE0] bg-[#FCFCFA] shrink-0">
          <div>
            <h3 className="text-xl font-bold text-[#18191B] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#646875] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full hover:bg-[#F3EFE3] text-[#646875] hover:text-[#18191B] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
