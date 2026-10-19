import React, { useState } from 'react';
import {
  Printer,
  Store,
  MessageSquare,
  Palette,
  FileText,
  Check,
  Eye,
  Sliders,
  Sparkles,
  Scissors,
  CheckCircle2,
  QrCode,
  Save,
  RotateCcw,
  Building2,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';

export default function SettingsView() {
  const {
    receiptSettings,
    updateReceiptSettings,
    showToast
  } = useSaloon();

  // Active settings sub-navigation tab
  // Default to 'receipt' as requested in screenshot!
  const [activeTab, setActiveTab] = useState('receipt');

  // Local draft state for Receipt Configurations
  const [formConfig, setFormConfig] = useState({
    templateStyle: receiptSettings?.templateStyle || 'classic',
    paperWidth: receiptSettings?.paperWidth || '80mm',
    showLogo: receiptSettings?.showLogo ?? true,
    showGstin: receiptSettings?.showGstin ?? true,
    showAddress: receiptSettings?.showAddress ?? true,
    showPhone: receiptSettings?.showPhone ?? true,
    showEmail: receiptSettings?.showEmail ?? true,
    showWebsite: receiptSettings?.showWebsite ?? true,
    showQrCode: receiptSettings?.showQrCode ?? false,
    autoPrintCheckout: receiptSettings?.autoPrintCheckout ?? false,
    parlourName: receiptSettings?.parlourName || 'PHOENIX SALOON',
    tagline: receiptSettings?.tagline || 'HAIR STUDIO & LUXURY SPA',
    address: receiptSettings?.address || '42 Royale Avenue, High Street Plaza',
    phone: receiptSettings?.phone || '+91 98450 11223',
    email: receiptSettings?.email || 'concierge@phoenixsaloon.com',
    website: receiptSettings?.website || 'www.phoenixsaloon.com',
    gstin: receiptSettings?.gstin || '33AAACR2938K1Z5',
    footerMessage: receiptSettings?.footerMessage || 'Thank you for visiting. Please visit again.'
  });

  // Handle toggle changes
  const handleToggle = (key) => {
    setFormConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save changes to SaloonContext & LocalStorage
  const handleSaveReceiptSettings = (e) => {
    if (e) e.preventDefault();
    updateReceiptSettings(formConfig);
  };

  // Test Print Thermal Receipt
  const handleTestPrint = () => {
    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) {
      window.print();
      return;
    }

    const is58mm = formConfig.paperWidth === '58mm';
    const paperWidthPx = is58mm ? '58mm' : '80mm';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thermal Receipt Test Print</title>
          <style>
            @page {
              size: ${paperWidthPx} auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: ${paperWidthPx};
              margin: 0 auto;
              padding: 8px;
              color: #000;
              background: #fff;
              font-size: ${is58mm ? '11px' : '12px'};
              line-height: 1.35;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .net-box { border: 1.5px solid #000; padding: 4px; margin: 6px 0; text-align: center; font-weight: bold; font-size: ${is58mm ? '13px' : '15px'}; }
          </style>
        </head>
        <body>
          <div class="text-center font-bold" style="font-size: ${is58mm ? '13px' : '15px'};">${formConfig.parlourName}</div>
          <div class="text-center font-bold">${formConfig.tagline}</div>
          ${formConfig.showAddress ? `<div class="text-center">${formConfig.address}</div>` : ''}
          ${formConfig.showPhone ? `<div class="text-center">Phone: ${formConfig.phone}</div>` : ''}
          ${formConfig.showGstin ? `<div class="text-center">GSTIN: ${formConfig.gstin}</div>` : ''}
          <div class="divider"></div>
          <div class="row"><span>Bill No:</span><span class="font-bold">INV-000042</span></div>
          <div class="row"><span>Date:</span><span>8/1/2026 07:38 PM</span></div>
          <div class="row"><span>Client:</span><span class="font-bold">Mahalakshmi S.</span></div>
          <div class="row"><span>Cashier:</span><span>Admin Stylist</span></div>
          <div class="divider"></div>
          <div class="row"><span>Signature Royal Cut</span><span>450.00</span></div>
          <div class="row"><span>Spa D-Tan Facial</span><span>1,450.00</span></div>
          <div class="row"><span>Argan Hair Serum</span><span>650.00</span></div>
          <div class="divider"></div>
          <div class="row"><span>Subtotal:</span><span>2,550.00</span></div>
          <div class="row"><span>Discount:</span><span>-250.00</span></div>
          <div class="row"><span>GST (18%):</span><span>+414.00</span></div>
          <div class="net-box">NET PAYABLE: ₹2,714.00</div>
          <div class="row"><span>Paid (UPI):</span><span>₹2,714.00</span></div>
          <div class="divider"></div>
          <div class="text-center font-bold">${formConfig.footerMessage}</div>
          <div class="text-center" style="font-size: 10px; margin-top: 4px;">POWERED BY PHOENIX SALOON</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Nav items on the left side
  const settingsNavItems = [
    { id: 'profile', label: 'Parlour Profile', icon: Building2 },
    { id: 'theme', label: 'System Theme Color', icon: Palette },
    { id: 'receipt', label: 'Receipt & Thermal Printing', icon: Printer, isHighlight: true },
    { id: 'taxes', label: 'Invoice & Taxes', icon: FileText }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Settings Grid Layout: Left Nav Column (1/4) and Right Main Content (3/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT COLUMN: SETTINGS NAVIGATION MENU
        ======================================================== */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#EFECE1] shadow-sm p-3 space-y-1">
          <div className="px-3 py-2.5 mb-1 border-b border-[#F0EBE0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9499A8]">
              Salon Settings
            </h3>
          </div>

          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`btn-settings-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#18191B] text-[#D4AF37] font-bold shadow-sm'
                    : 'text-[#646875] hover:text-[#18191B] hover:bg-[#FAF8F2]'
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${
                    isActive ? 'text-[#D4AF37]' : 'text-[#9499A8]'
                  }`}
                />
                <span className="truncate text-left leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            RIGHT COLUMN: ACTIVE SETTINGS VIEW
        ======================================================== */}
        <div className="lg:col-span-9 space-y-6">
          {/* ========================================================
              TAB: RECEIPT & THERMAL PRINTING (Centerpiece)
          ======================================================== */}
          {activeTab === 'receipt' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                    Thermal Receipt &amp; Printing Configurations
                  </h2>
                  <p className="text-xs sm:text-sm text-[#646875] mt-1">
                    Customize thermal paper templates, auto-print preferences, and toggle visible sections.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <span className="px-3 py-1.5 rounded-full bg-[#FAF6EA] text-[#B58D20] font-bold text-xs border border-[#D4AF37]/30 shadow-2xs flex items-center gap-1.5">
                    <Printer size={14} className="text-[#C59B27]" />
                    <span>58mm &amp; 80mm Compatible</span>
                  </span>

                  <button
                    onClick={handleSaveReceiptSettings}
                    className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Save Config</span>
                  </button>
                </div>
              </div>

              {/* Grid: Config Forms (Left) vs Live Thermal Receipt Preview (Right) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Configuration Edit Fields (7 Cols) */}
                <div className="xl:col-span-7 space-y-6">
                  {/* 1. Receipt Template Style Card */}
                  <div className="bg-white p-5 rounded-2xl border border-[#EFECE1] shadow-sm">
                    <h3 className="text-sm font-bold text-[#18191B] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                      Receipt Template Style
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'classic', title: 'Classic', desc: 'Clean monospaced dashed layout' },
                        { id: 'modern', title: 'Modern', desc: 'Accent header & bold highlights' },
                        { id: 'compact', title: 'Compact', desc: 'Tight line spacing for fast print' }
                      ].map((style) => {
                        const isSelected = formConfig.templateStyle === style.id;
                        return (
                          <div
                            key={style.id}
                            onClick={() => handleInputChange('templateStyle', style.id)}
                            className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#D4AF37] bg-[#FAF8F2] shadow-xs'
                                : 'border-[#EBE8DE] hover:border-[#D4AF37]/40 bg-white'
                            }`}
                          >
                            <h4 className="font-bold text-xs sm:text-sm text-[#18191B]">{style.title}</h4>
                            <p className="text-[11px] text-[#646875] mt-1 leading-snug">{style.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Thermal Printer Paper Width Card */}
                  <div className="bg-white p-5 rounded-2xl border border-[#EFECE1] shadow-sm">
                    <h3 className="text-sm font-bold text-[#18191B] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                      Thermal Printer Paper Width
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: '80mm', title: '80mm (3 Inch Standard)', desc: 'Full detailed receipt width (300px)' },
                        { id: '58mm', title: '58mm (2 Inch Compact)', desc: 'Ultra-compact mobile printer (220px)' }
                      ].map((width) => {
                        const isSelected = formConfig.paperWidth === width.id;
                        return (
                          <div
                            key={width.id}
                            onClick={() => handleInputChange('paperWidth', width.id)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#18191B] bg-[#FAF8F2] shadow-xs'
                                : 'border-[#EBE8DE] hover:border-[#18191B]/40 bg-white'
                            }`}
                          >
                            <h4 className="font-bold text-xs sm:text-sm text-[#18191B]">{width.title}</h4>
                            <p className="text-[11px] text-[#646875] mt-1 leading-snug">{width.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Visible Information Toggles Card */}
                  <div className="bg-white p-5 rounded-2xl border border-[#EFECE1] shadow-sm">
                    <h3 className="text-sm font-bold text-[#18191B] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                      Visible Information Toggles
                    </h3>
                    <div className="grid grid-cols-2 gap-3.5 text-xs sm:text-sm">
                      {[
                        { key: 'showLogo', label: 'Show Parlour Logo' },
                        { key: 'showGstin', label: 'Show GSTIN / Tax ID' },
                        { key: 'showAddress', label: 'Show Salon Address' },
                        { key: 'showPhone', label: 'Show Phone Number' },
                        { key: 'showEmail', label: 'Show Email Address' },
                        { key: 'showWebsite', label: 'Show Website URL' },
                        { key: 'showQrCode', label: 'Show Payment / Rating QR Code' },
                        { key: 'autoPrintCheckout', label: 'Auto-Print After POS Checkout' }
                      ].map((toggle) => (
                        <label
                          key={toggle.key}
                          className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-[#FAF9F5] transition-colors select-none"
                        >
                          <input
                            type="checkbox"
                            checked={formConfig[toggle.key]}
                            onChange={() => handleToggle(toggle.key)}
                            className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] border-[#D1CEBF] cursor-pointer"
                          />
                          <span className="font-medium text-[#18191B] text-xs">
                            {toggle.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 4. Edit Receipt Text & Branding Fields */}
                  <div className="bg-white p-5 rounded-2xl border border-[#EFECE1] shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                      Customize Receipt Text &amp; Branding
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#646875] mb-1">
                          Parlour / Brand Title
                        </label>
                        <input
                          type="text"
                          value={formConfig.parlourName}
                          onChange={(e) => handleInputChange('parlourName', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#646875] mb-1">
                          Tagline / Department
                        </label>
                        <input
                          type="text"
                          value={formConfig.tagline}
                          onChange={(e) => handleInputChange('tagline', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#646875] mb-1">
                          Salon Contact Phone
                        </label>
                        <input
                          type="text"
                          value={formConfig.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#646875] mb-1">
                          GSTIN / Registration No.
                        </label>
                        <input
                          type="text"
                          value={formConfig.gstin}
                          onChange={(e) => handleInputChange('gstin', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-[#EBE8DE] text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#646875] mb-1">
                        Physical Address
                      </label>
                      <input
                        type="text"
                        value={formConfig.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#646875] mb-1">
                        Custom Footer Greetings
                      </label>
                      <textarea
                        rows={2}
                        value={formConfig.footerMessage}
                        onChange={(e) => handleInputChange('footerMessage', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleSaveReceiptSettings}
                        className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Save size={15} />
                        <span>Save All Printing Preferences</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ========================================================
                    LIVE THERMAL RECEIPT PREVIEW (Right 5 Cols)
                ======================================================== */}
                <div className="xl:col-span-5 bg-white p-5 rounded-2xl border border-[#EFECE1] shadow-sm flex flex-col items-center">
                  <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-[#EFECE1]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#18191B]">
                      <Eye size={16} className="text-[#C59B27]" />
                      <span>Live Thermal Receipt Preview</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF6EA] text-[#B58D20] border border-[#D4AF37]/30">
                      {formConfig.paperWidth}
                    </span>
                  </div>

                  {/* Realistic Thermal Paper Container */}
                  <div
                    className={`bg-white border border-[#D5D1C4] shadow-md p-4 text-[#18191B] font-mono select-none transition-all duration-300 relative ${
                      formConfig.paperWidth === '58mm' ? 'w-[240px] text-[10px]' : 'w-[320px] text-[11px]'
                    }`}
                    style={{
                      boxShadow: '0 4px 18px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
                      lineHeight: '1.35'
                    }}
                  >
                    {/* Salon Header Branding */}
                    <div className="text-center pb-2">
                      {formConfig.showLogo && (
                        <div className="mx-auto w-7 h-7 rounded-full bg-[#18191B] text-[#D4AF37] flex items-center justify-center mb-1">
                          <Scissors size={14} />
                        </div>
                      )}
                      <h4 className="font-extrabold uppercase tracking-wide text-xs">
                        {formConfig.parlourName}
                      </h4>
                      <p className="text-[9px] font-semibold text-[#646875] tracking-wider uppercase">
                        {formConfig.tagline}
                      </p>
                      {formConfig.showAddress && (
                        <p className="text-[9px] text-[#646875] mt-0.5">{formConfig.address}</p>
                      )}
                      {formConfig.showPhone && (
                        <p className="text-[9px] text-[#646875]">Phone: {formConfig.phone}</p>
                      )}
                      {formConfig.showEmail && (
                        <p className="text-[9px] text-[#646875]">Email: {formConfig.email}</p>
                      )}
                      {formConfig.showWebsite && (
                        <p className="text-[9px] text-[#646875]">{formConfig.website}</p>
                      )}
                      {formConfig.showGstin && (
                        <p className="text-[9px] text-[#9499A8] mt-0.5">GSTIN: {formConfig.gstin}</p>
                      )}
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-t border-dashed border-[#18191B] my-2" />

                    {/* Bill Meta */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between">
                        <span>Bill No:</span>
                        <span className="font-bold">INV-000042</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>8/1/2026 07:38 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cashier:</span>
                        <span>Admin Stylist</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Client:</span>
                        <span className="font-bold">Mahalakshmi S.</span>
                      </div>
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-t border-dashed border-[#18191B] my-2" />

                    {/* Line Items */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹5,900.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-₹600.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Membership (VIP Gold):</span>
                        <span>-₹0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (Service):</span>
                        <span>+₹954.00</span>
                      </div>
                    </div>

                    {/* Net Payable Box */}
                    <div className="my-2.5 p-1.5 border-2 border-[#18191B] text-center font-black text-xs sm:text-sm">
                      NET PAYABLE: ₹6,254.00
                    </div>

                    {/* Payment Mode */}
                    <div className="space-y-0.5 text-[10px]">
                      <div className="font-bold">PAYMENT METHOD(S):</div>
                      <div className="flex justify-between">
                        <span>Paid (UPI):</span>
                        <span>₹4,000.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paid (Cash):</span>
                        <span>₹2,254.00</span>
                      </div>
                    </div>

                    {/* QR Code if toggled */}
                    {formConfig.showQrCode && (
                      <div className="my-2 flex flex-col items-center justify-center">
                        <QrCode size={40} className="text-[#18191B]" />
                        <span className="text-[8px] text-[#646875] mt-0.5">Scan to Pay / Rate Us</span>
                      </div>
                    )}

                    {/* Dashed Separator */}
                    <div className="border-t border-dashed border-[#18191B] my-2" />

                    {/* Footer Message */}
                    <div className="text-center font-bold text-[10px]">
                      {formConfig.footerMessage}
                    </div>
                    <div className="text-center text-[8px] text-[#9499A8] mt-1 tracking-wider uppercase">
                      POWERED BY PHOENIX SALOON
                    </div>

                    <div className="border-t border-dashed border-[#18191B] my-2" />

                    {/* Membership / Wallet info */}
                    <div className="grid grid-cols-3 text-center text-[8px] text-[#646875]">
                      <div>
                        <span>Wallet</span>
                        <div className="font-bold">₹0</div>
                      </div>
                      <div>
                        <span>Membership</span>
                        <div className="font-bold">VIP Gold</div>
                      </div>
                      <div>
                        <span>Balance Due</span>
                        <div className="font-bold">0.00</div>
                      </div>
                    </div>
                  </div>

                  {/* Test Print Button matching user screenshot */}
                  <div className="w-full mt-5">
                    <button
                      id="btn-test-print-thermal"
                      onClick={handleTestPrint}
                      className="w-full py-3 rounded-xl bg-[#18191B] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#383F4C] transition-all shadow-md cursor-pointer"
                    >
                      <Printer size={16} />
                      <span>Test Print Thermal Receipt ({formConfig.paperWidth})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              OTHER SETTINGS TABS (Parlour Profile, Taxes, etc.)
          ======================================================== */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm space-y-5">
              <div>
                <h3 className="text-xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Parlour Profile &amp; Contact
                </h3>
                <p className="text-xs text-[#646875] mt-0.5">
                  General salon information, operating timings, and branding
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#646875] uppercase mb-1">Salon Name</label>
                  <input
                    type="text"
                    defaultValue="Phoenix Saloon & Spa Suite"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE8DE]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#646875] uppercase mb-1">Primary Phone</label>
                  <input
                    type="text"
                    defaultValue="+91 98450 11223"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE8DE]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#646875] uppercase mb-1">Opening Hours</label>
                  <input
                    type="text"
                    defaultValue="09:00 AM - 09:30 PM (Mon - Sun)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE8DE]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#646875] uppercase mb-1">Support Email</label>
                  <input
                    type="text"
                    defaultValue="concierge@phoenixsaloon.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE8DE]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => showToast('Parlour profile saved!')}
                  className="gold-gradient-btn px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Save Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                System Theme &amp; Visual Palettes
              </h3>
              <p className="text-xs text-[#646875]">
                Luxury Obsidian Noir &amp; Royal Gold Accent Styling is active by default
              </p>
              <div className="flex gap-4">
                <div className="p-4 rounded-xl border-2 border-[#D4AF37] bg-[#FAF8F2] flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B58D20]" />
                  <div>
                    <h5 className="font-bold text-xs">Royal Gold &amp; Obsidian (Default)</h5>
                    <span className="text-[10px] text-[#10B981] font-bold">Active Theme</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'taxes' && (
            <div className="bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                Invoice &amp; Tax Parameters
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#646875] uppercase mb-1">Standard GST Rate (%)</label>
                  <input type="number" defaultValue="18" className="w-full px-3.5 py-2 rounded-xl border border-[#EBE8DE]" />
                </div>
                <div>
                  <label className="block font-bold text-[#646875] uppercase mb-1">Invoice Prefix</label>
                  <input type="text" defaultValue="INV-" className="w-full px-3.5 py-2 rounded-xl border border-[#EBE8DE]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
