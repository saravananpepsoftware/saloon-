import React from 'react';
import { Printer, CheckCircle2, QrCode, Scissors, Sparkles, X } from 'lucide-react';
import Modal from './Modal';

export default function InvoiceModal({ bill, isOpen, onClose }) {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Salon Invoice & Receipt"
      subtitle={`Bill Reference #${bill.id}`}
      maxWidth="max-w-xl"
    >
      <div id="printable-receipt" className="bg-white rounded-xl p-6 text-[#18191B] border border-[#EBE8DE]">
        {/* Salon Branding Header */}
        <div className="text-center pb-5 border-b border-dashed border-[#D4AF37]/50">
          <div className="inline-flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B58D20] text-white flex items-center justify-center shadow-md">
              <Scissors size={18} />
            </div>
            <h2 className="text-2xl font-black tracking-wider text-[#121418]" style={{ fontFamily: 'var(--font-heading)' }}>
              AURA LUXE
            </h2>
          </div>
          <p className="text-xs tracking-widest text-[#B58D20] font-semibold uppercase">HAIR STUDIO & LUXURY SPA</p>
          <p className="text-xs text-[#646875] mt-1">42 Royale Avenue, High Street Plaza • Phone: +91 98450 11223</p>
          <p className="text-[11px] text-[#9499A8]">GSTIN: 33AAACR2938K1Z5 | Reg: SAL-2026-904</p>
        </div>

        {/* Bill Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-[#F0EBE0]">
          <div>
            <p className="text-[#9499A8] uppercase tracking-wider font-semibold text-[10px]">Customer Details</p>
            <p className="font-bold text-sm text-[#18191B] mt-0.5">{bill.customerName}</p>
            <p className="text-[#646875]">Ph: +91 {bill.customerPhone}</p>
          </div>
          <div className="text-right">
            <p className="text-[#9499A8] uppercase tracking-wider font-semibold text-[10px]">Invoice Meta</p>
            <p className="font-mono font-bold text-sm text-[#D4AF37] mt-0.5">{bill.id}</p>
            <p className="text-[#646875]">{bill.date} • {bill.time || '12:00 PM'}</p>
          </div>
        </div>

        {/* Itemized Services & Products */}
        <div className="py-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#EBE8DE] text-[#9499A8] uppercase text-[10px] tracking-wider text-left">
                <th className="pb-2">Description / Stylist</th>
                <th className="pb-2 text-center">Qty</th>
                <th className="pb-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F5F0]">
              {/* Services */}
              {bill.services && bill.services.map((srv, idx) => (
                <tr key={`srv-${idx}`} className="py-2.5">
                  <td className="py-2">
                    <p className="font-semibold text-[#18191B]">{srv.name}</p>
                    <p className="text-[11px] text-[#B58D20] flex items-center gap-1">
                      <Sparkles size={11} /> Stylist: {srv.employeeName || bill.employeeName || 'Staff'}
                    </p>
                  </td>
                  <td className="py-2 text-center text-[#646875]">1</td>
                  <td className="py-2 text-right font-medium text-[#18191B]">₹{srv.price}</td>
                </tr>
              ))}

              {/* Products */}
              {bill.products && bill.products.map((prd, idx) => (
                <tr key={`prd-${idx}`} className="py-2.5">
                  <td className="py-2">
                    <p className="font-semibold text-[#18191B]">{prd.name}</p>
                    <p className="text-[11px] text-[#646875]">Retail Product</p>
                  </td>
                  <td className="py-2 text-center text-[#646875]">{prd.quantity || 1}</td>
                  <td className="py-2 text-right font-medium text-[#18191B]">₹{(prd.price * (prd.quantity || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="pt-3 border-t border-dashed border-[#D4AF37]/50 space-y-2 text-xs">
          <div className="flex justify-between text-[#646875]">
            <span>Subtotal</span>
            <span>₹{bill.subtotal || bill.totalAmount}</span>
          </div>
          {bill.membershipDiscount > 0 && (
            <div className="flex justify-between text-[#10B981] font-medium">
              <span>Membership Discount</span>
              <span>- ₹{bill.membershipDiscount}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-[#EBE8DE] text-base font-bold">
            <span className="text-[#18191B]">Grand Total</span>
            <span className="text-[#B58D20] text-lg font-black font-mono">₹{bill.totalAmount}</span>
          </div>
        </div>

        {/* Payment Badge & UPI Details */}
        <div className="mt-5 p-3 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">
                Payment Mode: {bill.paymentMethod}
              </p>
              {bill.paymentMethod === 'UPI' && (
                <p className="text-[10px] text-[#646875] font-mono">{bill.upiRef || 'UPI/VERIFIED/2026'}</p>
              )}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#9E7814] uppercase tracking-wider border border-[#D4AF37]/30">
            Paid in Full
          </span>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-5 text-[11px] text-[#9499A8]">
          <p>Thank you for choosing Aura Luxe! Have a splendid hair day ✨</p>
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="mt-5 flex items-center justify-end gap-3 no-print">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875] hover:bg-[#F3EFE3] transition-colors"
        >
          Close
        </button>
        <button
          onClick={handlePrint}
          className="gold-gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 shadow-lg"
        >
          <Printer size={16} />
          Print / Save Receipt
        </button>
      </div>
    </Modal>
  );
}
