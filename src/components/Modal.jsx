import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{
        backgroundColor: 'rgba(12, 14, 18, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#D4AF37]/35 overflow-hidden my-auto transform transition-all animate-fade-in relative`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.35), 0 0 35px rgba(212, 175, 55, 0.15)'
        }}
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#D4AF37] via-[#F9E79F] to-[#B58D20] shrink-0" />

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#F0EBE0] bg-[#FCFCFA] shrink-0">
          <div>
            <h3
              className="text-xl font-bold text-[#18191B] tracking-wide"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
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

  return createPortal(modalContent, document.body);
}

