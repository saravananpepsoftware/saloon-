import React, { useState } from 'react';
import {
  Crown,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  ShieldCheck,
  Tag,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';
import Modal from '../components/Modal';

export default function MembershipsView() {
  const {
    memberships,
    addMembership,
    customers,
    assignMembershipToCustomer
  } = useSaloon();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedPlanForEnroll, setSelectedPlanForEnroll] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Form State for Adding Membership
  const [formData, setFormData] = useState({
    name: '',
    durationMonths: '3', // '3', '6', '12'
    price: '',
    discountPercentage: '10',
    perks: ''
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) return;

    addMembership({
      name: formData.name,
      durationMonths: Number(formData.durationMonths),
      price: Number(formData.price),
      discountPercentage: Number(formData.discountPercentage),
      perks: formData.perks
        ? formData.perks.split(',').map(p => p.trim())
        : [`${formData.discountPercentage}% discount on all services`, 'Priority booking']
    });

    setFormData({
      name: '',
      durationMonths: '3',
      price: '',
      discountPercentage: '10',
      perks: ''
    });
    setIsAddModalOpen(false);
  };

  const handleEnrollCustomer = (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedPlanForEnroll) return;
    assignMembershipToCustomer(selectedCustomerId, selectedPlanForEnroll.id);
    setIsEnrollModalOpen(false);
    setSelectedCustomerId('');
    setSelectedPlanForEnroll(null);
  };

  const activeMembers = customers.filter(c => c.membershipPlan);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header with title and Right Top Add Membership button/icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
            VIP Membership Management
          </h2>
          <p className="text-xs text-[#646875] mt-1">
            Configure 3-month, 6-month, and yearly subscription tiers with exclusive client privileges
          </p>
        </div>

        {/* Right Top Action: Add Membership button with icon */}
        <div className="flex items-center gap-3">
          <button
            id="btn-add-membership"
            onClick={() => setIsAddModalOpen(true)}
            className="gold-gradient-btn px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2"
          >
            <Crown size={18} />
            <span>Add Membership</span>
          </button>
        </div>
      </div>

      {/* Membership Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {memberships.map((plan) => {
          const enrolledCount = customers.filter(c => c.membershipPlan === plan.name).length;
          const isYearly = plan.durationMonths === 12;
          const isSixMonths = plan.durationMonths === 6;

          return (
            <div
              key={plan.id}
              className={`luxury-card p-6 rounded-2xl flex flex-col justify-between transition-all relative overflow-hidden ${
                isYearly
                  ? 'bg-gradient-to-b from-[#181A20] to-[#121418] text-white border border-[#D4AF37]/50 shadow-xl'
                  : isSixMonths
                  ? 'bg-white border-2 border-[#D4AF37]/60 shadow-lg'
                  : 'bg-white border border-[#EFECE1]'
              }`}
            >
              {/* Popular / VIP Tag */}
              {isSixMonths && (
                <div className="absolute top-0 right-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#B58D20] text-white rounded-bl-xl shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}
              {isYearly && (
                <div className="absolute top-0 right-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-gradient-to-r from-[#D4AF37] via-[#F9E79F] to-[#D4AF37] text-[#121418] rounded-bl-xl shadow-sm">
                    Ultimate VIP
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isYearly
                        ? 'bg-[#D4AF37] text-[#18191B]'
                        : 'bg-[#FAF6EA] text-[#C59B27] border border-[#D4AF37]/30'
                    }`}
                  >
                    <Crown size={20} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isYearly ? 'text-white' : 'text-[#18191B]'}`}>
                      {plan.name}
                    </h3>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isYearly ? 'text-[#F9E79F]' : 'text-[#9E7814]'
                      }`}
                    >
                      {plan.durationMonths === 12
                        ? 'Yearly Plan (12 Months)'
                        : `${plan.durationMonths} Months Duration`}
                    </span>
                  </div>
                </div>

                <div className="my-5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono font-black text-3xl">₹{plan.price}</span>
                    <span className={`text-xs ${isYearly ? 'text-gray-400' : 'text-[#9499A8]'}`}>
                      / {plan.durationMonths === 12 ? 'year' : `${plan.durationMonths} mos`}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 font-semibold ${isYearly ? 'text-[#10B981]' : 'text-[#10B981]'}`}>
                    ✨ {plan.discountPercentage}% Instant Flat Discount on Bills
                  </p>
                </div>

                {/* Perks Checklist */}
                <div className="space-y-2.5 pt-4 border-t border-dashed border-gray-200/30">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    isYearly ? 'text-gray-400' : 'text-[#9499A8]'
                  }`}>
                    Included Privileges:
                  </span>
                  {plan.perks?.map((perk, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2 text-xs">
                      <CheckCircle2
                        size={15}
                        className={`shrink-0 mt-0.5 ${isYearly ? 'text-[#D4AF37]' : 'text-[#C59B27]'}`}
                      />
                      <span className={isYearly ? 'text-gray-200' : 'text-[#4A4E5A]'}>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200/20 flex items-center justify-between">
                <span className={`text-xs font-semibold ${isYearly ? 'text-gray-300' : 'text-[#646875]'}`}>
                  <Users size={14} className="inline mr-1" /> {enrolledCount} Active Members
                </span>

                <button
                  onClick={() => {
                    setSelectedPlanForEnroll(plan);
                    setIsEnrollModalOpen(true);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isYearly
                      ? 'gold-gradient-btn'
                      : 'border border-[#D4AF37] text-[#9E7814] hover:bg-[#FAF6EA]'
                  }`}
                >
                  <UserPlus size={14} /> Enroll Client
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active VIP Members Section */}
      <div className="luxury-card bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE0]">
          <div>
            <h3 className="text-lg font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
              Active VIP Members Roster ({activeMembers.length})
            </h3>
            <p className="text-xs text-[#646875]">Clients with active 3-month, 6-month, or yearly subscriptions</p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#EFECE1] text-[#9499A8] uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-bold">Client Name & Phone</th>
                <th className="pb-3 font-bold">Membership Tier</th>
                <th className="pb-3 font-bold">Expiry Date</th>
                <th className="pb-3 font-bold">Total Salon Visits</th>
                <th className="pb-3 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F5F0]">
              {activeMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3.5">
                    <p className="font-bold text-sm text-[#18191B]">{member.name}</p>
                    <p className="text-[11px] text-[#646875] font-mono">+91 {member.phone}</p>
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF3DE] text-[#B58D20] font-bold border border-[#D4AF37]/30">
                      <Crown size={12} /> {member.membershipPlan}
                    </span>
                  </td>
                  <td className="py-3.5 text-[#646875] font-mono">
                    {member.membershipExpiry || 'Active'}
                  </td>
                  <td className="py-3.5 font-bold text-[#18191B]">
                    {member.history?.length || 0} Visits
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] font-bold uppercase tracking-wider text-[10px] border border-[#10B981]/20">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Membership Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Membership Plan"
        subtitle="Create 3-month, 6-month, or yearly membership for salon clients"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Plan Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Platinum Club"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Duration Period *
              </label>
              <select
                value={formData.durationMonths}
                onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] bg-white font-semibold"
              >
                <option value="3">3 Months Plan</option>
                <option value="6">6 Months Plan</option>
                <option value="12">Yearly (12 Months) Plan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Price (INR ₹) *
              </label>
              <input
                type="number"
                required
                min="100"
                placeholder="e.g. 2999"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Discount on Services (%) *
            </label>
            <input
              type="number"
              required
              min="1"
              max="100"
              placeholder="e.g. 15"
              value={formData.discountPercentage}
              onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Perks & Benefits (Comma-separated)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 2 Complimentary Haircuts, Free D-Tan therapy, Priority chair"
              value={formData.perks}
              onChange={(e) => setFormData(prev => ({ ...prev, perks: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md"
            >
              Create Membership
            </button>
          </div>
        </form>
      </Modal>

      {/* Enroll Client Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll Client into Membership"
        subtitle={`Enrolling into ${selectedPlanForEnroll?.name} (${selectedPlanForEnroll?.durationMonths} Months)`}
      >
        <form onSubmit={handleEnrollCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Select Customer *
            </label>
            <select
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] bg-white font-medium"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (+91 {c.phone}) {c.membershipPlan ? `[Currently: ${c.membershipPlan}]` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-[#646875]">Plan Fee:</span>
              <span className="font-bold text-[#18191B] font-mono">₹{selectedPlanForEnroll?.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#646875]">Discount Benefit:</span>
              <span className="font-bold text-[#10B981]">{selectedPlanForEnroll?.discountPercentage}% Off Services</span>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedCustomerId}
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md disabled:opacity-50"
            >
              Confirm Membership
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
