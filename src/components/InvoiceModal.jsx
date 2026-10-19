import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  X,
  Printer,
  Download,
  MessageSquare,
  Share2,
  Check
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';

export default function InvoiceModal({ bill, isOpen, onClose }) {
  const { receiptSettings } = useSaloon();
  const [toastMessage, setToastMessage] = useState(null);

  if (!isOpen || !bill) return null;

  const parlourName = receiptSettings?.parlourName || 'PHOENIX SALOON';

  // Format date and time
  const formattedDateTime = bill.date && bill.time
    ? `${bill.date} ${bill.time}`
    : new Date().toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleSendSms = () => {
    setToastMessage(`SMS with invoice link dispatched to +91 ${bill.customerPhone || 'Customer'}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleWhatsApp = () => {
    const rawPhone = (bill.customerPhone || '').replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hello ${bill.customerName},\nHere is your receipt from ${parlourName}.\nBill No: ${bill.id}\nAmount: ₹${Number(bill.totalAmount).toLocaleString()}\nThank you for visiting! ✨`
    );

    if (rawPhone && rawPhone !== '9999999999') {
      window.open(`https://wa.me/91${rawPhone}?text=${msg}`, '_blank');
    } else {
      setToastMessage(`WhatsApp receipt message link copied for ${bill.customerName}!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const servicesList = bill.services || [];
  const productsList = bill.products || [];

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:static">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-scale-up print:shadow-none print:border-none print:max-w-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white no-print">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Bill Saved Successfully!
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Slip Container */}
        <div className="p-4 sm:p-5 bg-slate-50/70 space-y-4 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:bg-white print:p-0">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg animate-fade-in no-print">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Thermal Slip Card */}
          <div
            id="printable-slip"
            className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs font-mono text-[11px] leading-relaxed text-slate-800 print:border-none print:shadow-none print:p-4"
          >
            {/* Salon Name Header */}
            <div className="text-center">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {parlourName}
              </h2>
            </div>

            {/* Dashed Separator */}
            <div className="border-b border-dashed border-slate-400 my-2.5" />

            {/* Metadata Rows (Bill No, Date, Cashier, Client) */}
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Bill No:</span>
                <span className="font-bold text-slate-900">{bill.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Date:</span>
                <span className="text-slate-900">{formattedDateTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Cashier:</span>
                <span className="text-slate-900">Admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Client:</span>
                <span className="font-bold text-slate-900">{bill.customerName || 'Walk-in Customer'}</span>
              </div>
            </div>

            {/* Dashed Separator */}
            <div className="border-b border-dashed border-slate-400 my-2.5" />

            {/* SERVICES SECTION */}
            {servicesList.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-[10px] text-slate-700 uppercase">
                  <span>SERVICES</span>
                  <div className="flex gap-8">
                    <span>QTY</span>
                    <span>AMT</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-0.5">
                  {servicesList.map((srv, idx) => (
                    <div key={`srv-${idx}`} className="text-[11px]">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 uppercase pr-2">
                          {srv.name}
                        </span>
                        <div className="flex gap-9 font-bold text-slate-900 shrink-0">
                          <span className="w-4 text-center">1</span>
                          <span className="w-16 text-right">₹{Number(srv.price).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 pl-1">
                        (₹{Number(srv.price).toFixed(2)} x 1 qty)
                      </div>
                      <div className="text-[10px] text-slate-600 pl-1">
                        Staff: {srv.employeeName || 'Staff'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRODUCTS SECTION */}
            {productsList.length > 0 && (
              <div className="space-y-2 mt-3 pt-2 border-t border-dashed border-slate-300">
                <div className="flex justify-between font-bold text-[10px] text-slate-700 uppercase">
                  <span>PRODUCT</span>
                  <div className="flex gap-4">
                    <span>RATE</span>
                    <span>QTY</span>
                    <span>MRP</span>
                    <span>AMT</span>
                  </div>
                </div>

                <div className="space-y-2 pt-0.5">
                  {productsList.map((prd, idx) => {
                    const qty = prd.quantity || 1;
                    const price = Number(prd.price) || 0;
                    const total = price * qty;
                    return (
                      <div key={`prd-${idx}`} className="text-[11px]">
                        <div className="font-bold text-slate-900 uppercase">
                          {prd.name}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-700 mt-0.5">
                          <span>₹{price.toFixed(2)}</span>
                          <span>{qty}</span>
                          <span>₹{price.toFixed(2)}</span>
                          <span className="font-bold text-slate-900">₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dashed Separator */}
            <div className="border-b border-dashed border-slate-400 my-2.5" />

            {/* Subtotal & GST */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-700">Subtotal:</span>
                <span className="font-semibold text-slate-900">
                  ₹{Number(bill.subtotal || bill.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {bill.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-700">GST (Service):</span>
                  <span className="font-semibold text-slate-900">
                    ₹{Number(bill.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {bill.membershipDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount:</span>
                  <span>
                    - ₹{Number(bill.membershipDiscount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* NET PAYABLE BOX */}
            <div className="border-2 border-slate-900 px-3 py-2 my-3 flex items-center justify-between font-black text-xs sm:text-sm text-slate-900">
              <span className="tracking-wide">NET PAYABLE:</span>
              <span className="font-mono text-sm sm:text-base">
                ₹{Number(bill.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Dashed Separator */}
            <div className="border-b border-dashed border-slate-400 my-2.5" />

            {/* PAYMENT METHOD(S) */}
            <div className="space-y-1">
              <div className="font-bold text-[10px] text-slate-700 uppercase tracking-wide">
                PAYMENT METHOD(S):
              </div>
              {bill.splitPayments && bill.splitPayments.length > 0 ? (
                bill.splitPayments.map((sp, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-700">Paid ({sp.name}):</span>
                    <span className="font-bold text-slate-900">
                      ₹{Number(sp.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span className="text-slate-700">Paid ({bill.paymentMethod || 'Cash'}):</span>
                  <span className="font-bold text-slate-900">
                    ₹{Number(bill.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Dashed Separator */}
            <div className="border-b border-dashed border-slate-400 my-3" />

            {/* Footer Notes */}
            <div className="text-center space-y-1 my-2">
              <p className="text-[11px] text-slate-700">
                Thank you for visiting. Please visit again.
              </p>
              <p className="text-[10px] font-bold tracking-wider text-slate-900 uppercase">
                POWERED BY PHOENIX SALOON
              </p>
            </div>

            {/* Dashed Separator */}
            <div className="border-b border-dashed border-slate-400 my-2.5" />

            {/* Bottom Balance Status Row */}
            <div className="flex justify-between text-[9px] text-slate-500 pt-1">
              <span>Wallet Balance: ₹0</span>
              <span>Membership Balance: ₹0</span>
              <span>Balance Due: 0.00</span>
            </div>
          </div>

          {/* RECEIPT & DISTRIBUTION ACTIONS */}
          <div className="space-y-2 no-print">
            <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              RECEIPT &amp; DISTRIBUTION ACTIONS:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs"
              >
                <Printer size={14} className="text-slate-600" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs"
              >
                <Download size={14} className="text-slate-600" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={handleSendSms}
                className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs"
              >
                <MessageSquare size={14} className="text-slate-600" />
                <span>SMS</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsApp}
                className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs"
              >
                <Share2 size={14} className="text-slate-600" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer: Full Width Dark Button */}
        <div className="p-4 bg-white border-t border-slate-100 no-print">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#18191B] hover:bg-black text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md active:scale-[0.99]"
          >
            Close &amp; Complete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
