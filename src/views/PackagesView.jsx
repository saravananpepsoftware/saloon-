import React, { useState } from 'react';
import {
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Receipt,
  Scissors,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';
import Modal from '../components/Modal';

export default function PackagesView() {
  const {
    packages,
    addPackage,
    services,
    setActiveMenu
  } = useSaloon();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Adding Package
  const [formData, setFormData] = useState({
    name: '',
    includedServices: '',
    originalPrice: '',
    packagePrice: '',
    duration: 60,
    description: ''
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.packagePrice) return;

    addPackage({
      ...formData,
      originalPrice: Number(formData.originalPrice) || Number(formData.packagePrice) * 1.25,
      packagePrice: Number(formData.packagePrice),
      duration: Number(formData.duration)
    });

    setFormData({
      name: '',
      includedServices: '',
      originalPrice: '',
      packagePrice: '',
      duration: 60,
      description: ''
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header with title and Right Top Add Package button/icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
            Salon Combo Packages
          </h2>
          <p className="text-xs text-[#646875] mt-1">
            Curated value combos: Haircut, Haircut + Shaving, Trimming, and Deluxe Haircut + Facial + D-Tan
          </p>
        </div>

        {/* Right Top Action: Add Package */}
        <div className="flex items-center gap-3">
          <button
            id="btn-add-package"
            onClick={() => setIsAddModalOpen(true)}
            className="gold-gradient-btn px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Package</span>
          </button>
        </div>
      </div>

      {/* Packages Grid - Clean luxury cards without images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => {
          const discountAmt = (pkg.originalPrice || pkg.packagePrice) - pkg.packagePrice;
          const discountPercent = pkg.originalPrice
            ? Math.round((discountAmt / pkg.originalPrice) * 100)
            : 15;

          return (
            <div
              key={pkg.id}
              className="luxury-card bg-white border border-[#EFECE1] rounded-2xl shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group"
            >
              <div>
                {/* Header: Badges & Tags */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-[#FAF6EA] text-[#B58D20] font-bold text-xs border border-[#D4AF37]/30 flex items-center gap-1.5 shadow-2xs">
                    <Sparkles size={13} className="text-[#C59B27]" /> Combo Special
                  </span>

                  {discountPercent > 0 && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B58D20] text-white font-black text-xs shadow-2xs">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>

                {/* Package Name & Duration */}
                <div className="mb-3">
                  <h3
                    className="text-xl font-bold text-[#18191B] group-hover:text-[#B58D20] transition-colors"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[#646875] flex items-center gap-1.5 mt-1.5 font-medium">
                    <Clock size={13} className="text-[#C59B27]" /> Total Time: ~{pkg.duration} Mins
                  </p>
                </div>

                {/* Description */}
                {pkg.description && (
                  <p className="text-xs text-[#646875] leading-relaxed mb-4">
                    {pkg.description}
                  </p>
                )}

                {/* Included Services List */}
                <div className="pt-4 border-t border-[#F0EBE0] space-y-2 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9499A8] block">
                    Services Included in this Package:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pkg.includedServices?.map((serviceName, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-2 text-xs font-semibold text-[#18191B] bg-[#FAF9F5] px-3 py-2 rounded-xl border border-[#EFECE1]/70"
                      >
                        <CheckCircle2 size={15} className="text-[#10B981] shrink-0" />
                        <span className="truncate">{serviceName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & POS Action */}
              <div className="pt-4 border-t border-[#F0EBE0]">
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-black text-2xl text-[#18191B]">₹{pkg.packagePrice}</span>
                      {pkg.originalPrice > pkg.packagePrice && (
                        <span className="font-mono text-sm text-[#9499A8] line-through">
                          ₹{pkg.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#10B981] font-semibold block mt-0.5">
                      You save ₹{discountAmt} on combo
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveMenu('billing')}
                    className="gold-gradient-btn px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Receipt size={16} />
                    <span>Bill Package</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Package Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Combo Package"
        subtitle="Create combo like Haircut + Shaving or Haircut + Facial + D-Tan"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Package Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Glow: Haircut + Facial + D-Tan"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Included Services (Comma-separated) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Haircut, Facial Glow, D-Tan Pack"
              value={formData.includedServices}
              onChange={(e) => setFormData(prev => ({ ...prev, includedServices: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Regular Combined Price (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 2500"
                value={formData.originalPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Combo Offer Price (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 1950"
                value={formData.packagePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, packagePrice: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Estimated Duration (Mins)
            </label>
            <input
              type="number"
              min="15"
              step="15"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Complete rejuvenation combo package for special occasions."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer"
            >
              Publish Package
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
