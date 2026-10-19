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
  UserPlus,
  Award,
  Package,
  Printer,
  FileSpreadsheet,
  FileText,
  Search,
  Eye,
  RefreshCw,
  XCircle,
  X,
  Phone,
  User,
  Clock,
  Check
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';
import Modal from '../components/Modal';

export default function MembershipsView() {
  const {
    memberships,
    addMembership,
    customers,
    assignMembershipToCustomer,
    renewCustomerMembership,
    cancelCustomerMembership,
    showToast
  } = useSaloon();

  // Active top tab: 'subscriptions' (matches screenshot) or 'tiers'
  const [activeTab, setActiveTab] = useState('subscriptions');

  // Customer Subscriptions search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Customer Subscriptions
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [renewCustomer, setRenewCustomer] = useState(null);
  const [cancelCustomer, setCancelCustomer] = useState(null);

  // Form state for Assigning Membership
  const [assignForm, setAssignForm] = useState({
    customerId: '',
    planId: '',
    expiryDate: ''
  });

  // Form state for Renewing Membership
  const [renewExpiryDate, setRenewExpiryDate] = useState('');

  // Modals and state for Membership Tiers tab
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedPlanForEnroll, setSelectedPlanForEnroll] = useState(null);
  const [selectedCustomerIdForEnroll, setSelectedCustomerIdForEnroll] = useState('');

  // Form State for Adding Membership Plan
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    durationMonths: '12',
    price: '',
    discountPercentage: '15',
    perks: ''
  });

  // Filter customers that have assigned membership
  const assignedCustomers = customers.filter(c => c.membershipPlan);

  // Filter by search query (customer name, phone, or plan name)
  const filteredSubscriptions = assignedCustomers.filter(c => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = c.name?.toLowerCase().includes(query);
    const phoneMatch = c.phone?.toLowerCase().includes(query);
    const planMatch = c.membershipPlan?.toLowerCase().includes(query);
    return nameMatch || phoneMatch || planMatch;
  });

  // Calculate default expiry when plan selected in Assign Modal
  const handleAssignPlanChange = (planId) => {
    const plan = memberships.find(m => m.id === planId);
    const duration = plan ? plan.durationMonths : 12;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + duration);
    const formatted = `${expiry.getMonth() + 1}/${expiry.getDate()}/${expiry.getFullYear()}`;
    setAssignForm(prev => ({
      ...prev,
      planId,
      expiryDate: formatted
    }));
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignForm.customerId || !assignForm.planId) {
      showToast('Please select both a customer and a membership plan');
      return;
    }
    assignMembershipToCustomer(assignForm.customerId, assignForm.planId, assignForm.expiryDate);
    setIsAssignModalOpen(false);
    setAssignForm({ customerId: '', planId: '', expiryDate: '' });
  };

  const openRenewModal = (customer) => {
    setRenewCustomer(customer);
    // Default +1 year from today or from current expiry
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const formatted = `${futureDate.getMonth() + 1}/${futureDate.getDate()}/${futureDate.getFullYear()}`;
    setRenewExpiryDate(formatted);
  };

  const handleRenewSubmit = (e) => {
    e.preventDefault();
    if (!renewCustomer || !renewExpiryDate) return;
    renewCustomerMembership(renewCustomer.id, renewExpiryDate);
    setRenewCustomer(null);
  };

  const handleCancelSubmit = () => {
    if (!cancelCustomer) return;
    cancelCustomerMembership(cancelCustomer.id);
    setCancelCustomer(null);
  };

  // Export handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (filteredSubscriptions.length === 0) {
      showToast('No customer subscriptions to export');
      return;
    }
    const headers = ['CUSTOMER,MOBILE,MEMBERSHIP PLAN,STATUS,EXPIRY DATE'];
    const rows = filteredSubscriptions.map(c =>
      `"${c.name}","${c.phone}","${c.membershipPlan}","${c.membershipStatus || 'active'}","${c.membershipExpiry || 'N/A'}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_memberships_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Customer memberships exported to CSV successfully!');
  };

  const handleExportPDF = () => {
    showToast('Generating printable PDF preview. Choose "Save as PDF" in your print window.');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  // Add plan submission
  const handleAddPlanSubmit = (e) => {
    e.preventDefault();
    if (!newPlanForm.name.trim() || !newPlanForm.price) return;

    addMembership({
      name: newPlanForm.name,
      durationMonths: Number(newPlanForm.durationMonths),
      price: Number(newPlanForm.price),
      discountPercentage: Number(newPlanForm.discountPercentage),
      perks: newPlanForm.perks
        ? newPlanForm.perks.split(',').map(p => p.trim())
        : [`${newPlanForm.discountPercentage}% discount on all services`, 'Priority chair booking']
    });

    setNewPlanForm({
      name: '',
      durationMonths: '12',
      price: '',
      discountPercentage: '15',
      perks: ''
    });
    setIsAddPlanModalOpen(false);
  };

  const handleEnrollCustomer = (e) => {
    e.preventDefault();
    if (!selectedCustomerIdForEnroll || !selectedPlanForEnroll) return;
    assignMembershipToCustomer(selectedCustomerIdForEnroll, selectedPlanForEnroll.id);
    setIsEnrollModalOpen(false);
    setSelectedCustomerIdForEnroll('');
    setSelectedPlanForEnroll(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Menu Tabs matching user screenshot */}
      <div className="bg-white p-3 rounded-2xl border border-[#EFECE1] shadow-sm flex flex-wrap items-center gap-3">
        <button
          id="tab-membership-tiers"
          onClick={() => setActiveTab('tiers')}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
            activeTab === 'tiers'
              ? 'bg-[#18191B] text-[#D4AF37] shadow-md border border-[#D4AF37]/30'
              : 'text-[#646875] hover:text-[#18191B] hover:bg-[#FAF8F2] border border-transparent'
          }`}
        >
          <Award size={18} className={activeTab === 'tiers' ? 'text-[#D4AF37]' : 'text-[#646875]'} />
          <span>Membership Tiers & Plans</span>
        </button>

        <button
          id="tab-customer-subscriptions"
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
            activeTab === 'subscriptions'
              ? 'bg-[#18191B] text-[#D4AF37] shadow-md border border-[#D4AF37]/30'
              : 'text-[#646875] hover:text-[#18191B] hover:bg-[#FAF8F2] border border-transparent'
          }`}
        >
          <Package size={18} className={activeTab === 'subscriptions' ? 'text-[#D4AF37]' : 'text-[#646875]'} />
          <span>Customer Subscriptions & Packages</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: CUSTOMER SUBSCRIPTIONS & PACKAGES (DEFAULT)
      ======================================================== */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Header Row: Title, Subtitle, and right-top "+ Assign Membership" button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                Customer Subscriptions & Packages
              </h2>
              <p className="text-xs sm:text-sm text-[#646875] mt-1">
                Assign membership packages, manage benefit balances, renewals, and upgrades.
              </p>
            </div>

            <button
              id="btn-assign-membership"
              onClick={() => {
                if (memberships.length > 0) {
                  handleAssignPlanChange(memberships[0].id);
                }
                setIsAssignModalOpen(true);
              }}
              className="gold-gradient-btn px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Plus size={18} />
              <span>Assign Membership</span>
            </button>
          </div>

          {/* Search Filter Card: "Select Customer to View Active Packages" */}
          <div className="bg-white p-5 rounded-2xl border border-[#EFECE1] shadow-sm">
            <label className="block text-xs font-semibold text-[#646875] mb-2">
              Select Customer to View Active Packages
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9499A8]" size={18} />
              <input
                id="search-customer-subscriptions"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type customer name or phone number..."
                className="w-full pl-11 pr-10 py-3 rounded-xl border border-[#EBE8DE] text-sm text-[#18191B] placeholder-[#9499A8] focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all bg-[#FAF9F5]/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9499A8] hover:text-[#18191B] p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Table Card: "All Assigned Customer Memberships" with Print, Excel, PDF buttons */}
          <div className="bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden">
            {/* Table Header Bar */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFECE1] bg-white">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#18191B] text-base" style={{ fontFamily: 'var(--font-heading)' }}>
                  All Assigned Customer Memberships
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF6EA] text-[#C59B27] font-bold border border-[#D4AF37]/30">
                  {filteredSubscriptions.length} {filteredSubscriptions.length === 1 ? 'Record' : 'Records'}
                </span>
              </div>

              {/* Export Buttons: Print, Excel, PDF */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-print-memberships"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E0DCCE] text-xs font-semibold text-[#18191B] hover:bg-[#FAF8F2] hover:border-[#C59B27] transition-all cursor-pointer shadow-2xs"
                  title="Print active customer subscriptions"
                >
                  <Printer size={15} className="text-[#646875]" />
                  <span>Print</span>
                </button>

                <button
                  id="btn-excel-memberships"
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#D1E7DD] bg-[#F2FBF6] text-xs font-semibold text-[#0F5132] hover:bg-[#E2F7EB] hover:border-[#198754] transition-all cursor-pointer shadow-2xs"
                  title="Export to Excel / CSV"
                >
                  <FileSpreadsheet size={15} className="text-[#198754]" />
                  <span>Excel</span>
                </button>

                <button
                  id="btn-pdf-memberships"
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#F8D7DA] bg-[#FDF2F2] text-xs font-semibold text-[#842029] hover:bg-[#FBE4E6] hover:border-[#DC3545] transition-all cursor-pointer shadow-2xs"
                  title="Export or Print PDF"
                >
                  <FileText size={15} className="text-[#DC3545]" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EFECE1] bg-[#FAF8F2]/70 text-[11px] font-bold uppercase tracking-wider text-[#646875]">
                    <th className="py-3.5 px-5">CUSTOMER</th>
                    <th className="py-3.5 px-5">MOBILE</th>
                    <th className="py-3.5 px-5">MEMBERSHIP PLAN</th>
                    <th className="py-3.5 px-5">STATUS</th>
                    <th className="py-3.5 px-5">EXPIRY DATE</th>
                    <th className="py-3.5 px-5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE1] text-xs sm:text-sm">
                  {filteredSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#646875]">
                        <Package size={36} className="mx-auto mb-2 text-[#D1CEBF]" />
                        <p className="font-semibold text-[#18191B]">No assigned memberships found</p>
                        <p className="text-xs text-[#9499A8] mt-1">
                          {searchQuery ? `No records match "${searchQuery}"` : 'Click "+ Assign Membership" to enroll a customer.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSubscriptions.map((c) => {
                      const isActive = (c.membershipStatus || 'active').toLowerCase() === 'active';
                      return (
                        <tr key={c.id} className="hover:bg-[#FCFBF8] transition-colors">
                          {/* CUSTOMER */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#FAF6EA] border border-[#D4AF37]/30 text-[#B58D20] font-bold text-xs flex items-center justify-center">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-[#18191B]">{c.name}</span>
                            </div>
                          </td>

                          {/* MOBILE */}
                          <td className="py-4 px-5 text-[#646875] font-mono font-medium">
                            {c.phone}
                          </td>

                          {/* MEMBERSHIP PLAN */}
                          <td className="py-4 px-5">
                            <span className="font-semibold text-[#18191B] flex items-center gap-1.5">
                              <Crown size={14} className="text-[#C59B27]" />
                              {c.membershipPlan}
                            </span>
                          </td>

                          {/* STATUS */}
                          <td className="py-4 px-5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
                                isActive
                                  ? 'bg-[#ECFDF5] text-[#10B981] border-[#10B981]/20'
                                  : 'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]/20'
                              }`}
                            >
                              {c.membershipStatus || 'active'}
                            </span>
                          </td>

                          {/* EXPIRY DATE */}
                          <td className="py-4 px-5 text-[#646875] font-mono">
                            {c.membershipExpiry || 'N/A'}
                          </td>

                          {/* ACTIONS: View, Renew, Cancel */}
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-3 font-semibold text-xs">
                              <button
                                onClick={() => setViewCustomer(c)}
                                className="text-[#0284C7] hover:text-[#0369A1] hover:underline cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                onClick={() => openRenewModal(c)}
                                className="text-[#059669] hover:text-[#047857] hover:underline cursor-pointer"
                              >
                                Renew
                              </button>
                              {isActive && (
                                <button
                                  onClick={() => setCancelCustomer(c)}
                                  className="text-[#DC2626] hover:text-[#B91C1C] hover:underline cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: MEMBERSHIP TIERS & PLANS
      ======================================================== */}
      {activeTab === 'tiers' && (
        <div className="space-y-6">
          {/* Header Row for Tiers */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                Membership Tiers & Plans
              </h2>
              <p className="text-xs sm:text-sm text-[#646875] mt-1">
                Configure 3-month, 6-month, and yearly subscription tiers with exclusive client privileges
              </p>
            </div>

            <button
              id="btn-add-membership-plan"
              onClick={() => setIsAddPlanModalOpen(true)}
              className="gold-gradient-btn px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown size={18} />
              <span>+ Add Membership Plan</span>
            </button>
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
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isYearly ? 'text-[#F9E79F]' : 'text-[#C59B27]'}`}>
                          {plan.durationMonths} Months Duration
                        </span>
                      </div>
                    </div>

                    <div className="my-5">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-extrabold ${isYearly ? 'text-white' : 'text-[#18191B]'}`}>
                          ₹{plan.price.toLocaleString()}
                        </span>
                        <span className={`text-xs ${isYearly ? 'text-white/60' : 'text-[#646875]'}`}>
                          / {plan.durationMonths === 12 ? 'year' : `${plan.durationMonths} mos`}
                        </span>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25">
                        <Tag size={12} />
                        <span>{plan.discountPercentage}% Flat Off All Services</span>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-[#EFECE1]/50">
                      <p className={`text-xs font-bold uppercase tracking-wider ${isYearly ? 'text-white/60' : 'text-[#646875]'}`}>
                        Included VIP Perks:
                      </p>
                      <ul className="space-y-2">
                        {plan.perks?.map((perk, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 size={15} className={`mt-0.5 shrink-0 ${isYearly ? 'text-[#D4AF37]' : 'text-[#C59B27]'}`} />
                            <span className={isYearly ? 'text-white/90' : 'text-[#383F4C]'}>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#EFECE1]/50 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isYearly ? 'text-white/70' : 'text-[#646875]'}`}>
                      {enrolledCount} Active Clients
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPlanForEnroll(plan);
                        setIsEnrollModalOpen(true);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isYearly
                          ? 'bg-[#D4AF37] text-[#18191B] hover:bg-[#F9E79F]'
                          : 'bg-[#18191B] text-white hover:bg-[#383F4C]'
                      }`}
                    >
                      <span>Enroll Client</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ASSIGN MEMBERSHIP TO CUSTOMER
      ======================================================== */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Membership Package"
        subtitle="Select client and enroll into a salon VIP membership plan"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Select Customer *
            </label>
            <select
              required
              value={assignForm.customerId}
              onChange={(e) => setAssignForm(prev => ({ ...prev, customerId: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] bg-white font-medium"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (+91 {c.phone}) {c.membershipPlan ? `[Current: ${c.membershipPlan}]` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Membership Plan *
            </label>
            <select
              required
              value={assignForm.planId}
              onChange={(e) => handleAssignPlanChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] bg-white font-semibold"
            >
              <option value="">-- Choose Plan --</option>
              {memberships.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.durationMonths} Mos) — ₹{m.price} ({m.discountPercentage}% Off)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Expiry Date (M/D/YYYY) *
            </label>
            <input
              type="text"
              required
              value={assignForm.expiryDate}
              onChange={(e) => setAssignForm(prev => ({ ...prev, expiryDate: e.target.value }))}
              placeholder="e.g. 8/1/2027"
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm font-mono focus:outline-none focus:border-[#D4AF37]"
            />
            <p className="text-[11px] text-[#9499A8] mt-1">
              Auto-calculated based on plan duration. You may adjust if needed.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!assignForm.customerId || !assignForm.planId}
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md disabled:opacity-50 cursor-pointer"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================
          MODAL: VIEW CUSTOMER MEMBERSHIP DETAILS
      ======================================================== */}
      {viewCustomer && (
        <Modal
          isOpen={!!viewCustomer}
          onClose={() => setViewCustomer(null)}
          title="Customer Membership Details"
          subtitle={`Active VIP subscription for ${viewCustomer.name}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFECE1]">
                <div>
                  <h4 className="font-bold text-base text-[#18191B]">{viewCustomer.name}</h4>
                  <p className="text-xs text-[#646875] font-mono mt-0.5">+91 {viewCustomer.phone}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20">
                  {viewCustomer.membershipStatus || 'active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#9499A8] block">Membership Plan:</span>
                  <span className="font-bold text-[#18191B] flex items-center gap-1 mt-0.5">
                    <Crown size={14} className="text-[#C59B27]" />
                    {viewCustomer.membershipPlan}
                  </span>
                </div>
                <div>
                  <span className="text-[#9499A8] block">Expiry Date:</span>
                  <span className="font-bold text-[#18191B] font-mono mt-0.5 block">
                    {viewCustomer.membershipExpiry || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[#9499A8] block">Member Since:</span>
                  <span className="font-medium text-[#18191B] font-mono mt-0.5 block">
                    {viewCustomer.registeredDate || '2026-01-01'}
                  </span>
                </div>
                <div>
                  <span className="text-[#9499A8] block">Completed Visits:</span>
                  <span className="font-bold text-[#18191B] mt-0.5 block">
                    {viewCustomer.history?.length || 0} Salon Visits
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Perks Breakdown */}
            {(() => {
              const matchedPlan = memberships.find(
                m => m.name.toLowerCase() === (viewCustomer.membershipPlan || '').toLowerCase()
              );
              if (!matchedPlan) return null;
              return (
                <div className="p-4 rounded-xl bg-white border border-[#EFECE1] space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#646875]">
                    Plan Benefits & Privileges
                  </h5>
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-[#FAF6EA] text-[#B58D20] text-xs font-bold border border-[#D4AF37]/30">
                    {matchedPlan.discountPercentage}% Discount on all bills
                  </div>
                  <ul className="space-y-1.5 mt-2">
                    {matchedPlan.perks?.map((perk, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#383F4C]">
                        <Check size={14} className="text-[#10B981]" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            <div className="pt-3 flex justify-end border-t border-[#F0EBE0]">
              <button
                type="button"
                onClick={() => setViewCustomer(null)}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#18191B] text-white hover:bg-[#383F4C] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL: RENEW MEMBERSHIP
      ======================================================== */}
      {renewCustomer && (
        <Modal
          isOpen={!!renewCustomer}
          onClose={() => setRenewCustomer(null)}
          title="Renew Membership Subscription"
          subtitle={`Extend membership for ${renewCustomer.name} (${renewCustomer.membershipPlan})`}
        >
          <form onSubmit={handleRenewSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#646875]">Customer:</span>
                <span className="font-bold text-[#18191B]">{renewCustomer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646875]">Current Plan:</span>
                <span className="font-bold text-[#18191B]">{renewCustomer.membershipPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#646875]">Current Expiry:</span>
                <span className="font-bold text-[#18191B] font-mono">{renewCustomer.membershipExpiry}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Quick Extend Period
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '+6 Months', months: 6 },
                  { label: '+1 Year', months: 12 },
                  { label: '+2 Years', months: 24 }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + item.months);
                      setRenewExpiryDate(`${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`);
                    }}
                    className="py-2 px-3 rounded-lg border border-[#E0DCCE] text-xs font-bold hover:border-[#D4AF37] hover:bg-[#FAF6EA] transition-all cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                New Expiry Date (M/D/YYYY) *
              </label>
              <input
                type="text"
                required
                value={renewExpiryDate}
                onChange={(e) => setRenewExpiryDate(e.target.value)}
                placeholder="e.g. 8/1/2028"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
              <button
                type="button"
                onClick={() => setRenewCustomer(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer"
              >
                Confirm Renewal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================
          MODAL: CANCEL MEMBERSHIP CONFIRMATION
      ======================================================== */}
      {cancelCustomer && (
        <Modal
          isOpen={!!cancelCustomer}
          onClose={() => setCancelCustomer(null)}
          title="Cancel Membership"
          subtitle="Are you sure you want to deactivate this membership?"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5]/30 text-xs text-[#991B1B] space-y-1">
              <p className="font-bold text-sm">Deactivating Subscription for {cancelCustomer.name}</p>
              <p>Plan: {cancelCustomer.membershipPlan} (Expiry: {cancelCustomer.membershipExpiry})</p>
              <p className="pt-1 text-[11px] text-[#B91C1C]">
                The customer will lose membership privileges and service discounts upon cancellation.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
              <button
                type="button"
                onClick={() => setCancelCustomer(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875] cursor-pointer"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-all shadow-md cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL: ADD MEMBERSHIP PLAN (TIER)
      ======================================================== */}
      <Modal
        isOpen={isAddPlanModalOpen}
        onClose={() => setIsAddPlanModalOpen(false)}
        title="Add New Membership Plan"
        subtitle="Create 3-month, 6-month, or yearly membership for salon clients"
      >
        <form onSubmit={handleAddPlanSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Plan Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Platinum Club"
              value={newPlanForm.name}
              onChange={(e) => setNewPlanForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Duration Period *
              </label>
              <select
                value={newPlanForm.durationMonths}
                onChange={(e) => setNewPlanForm(prev => ({ ...prev, durationMonths: e.target.value }))}
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
                value={newPlanForm.price}
                onChange={(e) => setNewPlanForm(prev => ({ ...prev, price: e.target.value }))}
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
              value={newPlanForm.discountPercentage}
              onChange={(e) => setNewPlanForm(prev => ({ ...prev, discountPercentage: e.target.value }))}
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
              value={newPlanForm.perks}
              onChange={(e) => setNewPlanForm(prev => ({ ...prev, perks: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => setIsAddPlanModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer"
            >
              Create Membership
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================
          MODAL: ENROLL CLIENT INTO PLAN (FROM TIERS TAB)
      ======================================================== */}
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
              value={selectedCustomerIdForEnroll}
              onChange={(e) => setSelectedCustomerIdForEnroll(e.target.value)}
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
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedCustomerIdForEnroll}
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md disabled:opacity-50 cursor-pointer"
            >
              Confirm Membership
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
