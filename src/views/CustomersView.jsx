import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Printer,
  FileSpreadsheet,
  FileText,
  Users,
  X,
  ArrowLeft,
  Crown,
  History,
  Phone,
  Calendar,
  Receipt,
  Mail,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  UserX,
  UserCheck,
  Gift,
  Clock,
  Sparkles,
  MessageSquare,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';
import Modal from '../components/Modal';
import InvoiceModal from '../components/InvoiceModal';

export default function CustomersView() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    reactivateCustomer,
    markCustomerInactive,
    toggleCustomerStatus,
    customerViewTab,
    setCustomerViewTab,
    setActiveMenu,
    memberships,
    assignMembershipToCustomer,
    bills,
    inactiveDaysThreshold,
    setActiveSettingsTab,
    showToast
  } = useSaloon();

  // Navigation Menu Tab: 'all' | 'inactive'
  const [activeTab, setActiveTab] = useState(customerViewTab || 'all');

  useEffect(() => {
    if (customerViewTab) {
      setActiveTab(customerViewTab);
    }
  }, [customerViewTab]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('All Genders');
  const [dormancyFilter, setDormancyFilter] = useState('all'); // 'all' | '30plus' | '60plus' | 'novisits'

  // Pagination (10 items per page to match layout cleanly)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    status: 'active',
    inactiveReason: '',
    notes: ''
  });

  // History & Invoice Inspection View
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Re-engagement Offer Modal State
  const [offerModalCustomer, setOfferModalCustomer] = useState(null);
  const [selectedOfferTemplate, setSelectedOfferTemplate] = useState('20off');
  const [customOfferText, setCustomOfferText] = useState('');
  const [copied, setCopied] = useState(false);

  // Pre-crafted Win-Back Campaign Offer Templates
  const offerTemplates = useMemo(() => [
    {
      id: '20off',
      title: '🌟 20% Comeback Privilege',
      badge: 'High Conversion',
      getText: (cust) =>
        `Dear ${cust?.name || 'Valued Client'},\n\nWe miss pampering you at Phoenix Saloon & Spa! As our welcome-back gesture, enjoy an exclusive 20% OFF on any luxury haircut, styling, or revitalizing spa treatment this week.\n\nReserve your VIP slot: +91 98765 00456\nPhoenix Saloon & Spa`
    },
    {
      id: 'hairspa',
      title: '💆 Complimentary Herbal Hair Spa',
      badge: 'Client Favorite',
      getText: (cust) =>
        `Hello ${cust?.name || 'Valued Client'},\n\nTreat yourself to pure revitalization! Book any signature styling or facial therapy at Phoenix Saloon this week and receive a Complimentary Luxury Herbal Scalp & Hair Spa (Worth ₹1,200).\n\nCall +91 98765 00456 to claim your gift voucher.`
    },
    {
      id: 'vip',
      title: '👑 VIP Loyalty Welcome-Back',
      badge: 'VIP Special',
      getText: (cust) =>
        `Exclusive invitation for ${cust?.name || 'Valued Client'}:\n\nYour refined grooming experience awaits at Phoenix Saloon. Reconnect with us this month for an exclusive 25% privilege voucher across all master styling services.\n\nPhoenix Saloon — Luxury Salon & Spa`
    }
  ], []);

  const handleOpenOfferModal = (cust) => {
    setOfferModalCustomer(cust);
    setSelectedOfferTemplate('20off');
    const tmpl = offerTemplates.find(t => t.id === '20off');
    setCustomOfferText(tmpl ? tmpl.getText(cust) : '');
  };

  const handleSelectTemplate = (tmplId) => {
    setSelectedOfferTemplate(tmplId);
    const tmpl = offerTemplates.find(t => t.id === tmplId);
    if (tmpl && offerModalCustomer) {
      setCustomOfferText(tmpl.getText(offerModalCustomer));
    }
  };

  const handleSendWhatsApp = () => {
    if (!offerModalCustomer) return;
    const cleanPhone = offerModalCustomer.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone.slice(-10)}`;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(customOfferText)}`;
    window.open(url, '_blank');
  };

  const handleCopyOffer = () => {
    navigator.clipboard.writeText(customOfferText);
    setCopied(true);
    if (showToast) showToast('Offer message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to calculate days since last visit or registration
  const getDaysSinceLastVisit = (cust) => {
    const lastDate = cust.lastVisit || (cust.history && cust.history[0]?.date) || cust.registeredDate;
    if (!lastDate) return null;
    const diffTime = Math.abs(new Date('2026-10-21') - new Date(lastDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      gender: 'Male',
      status: activeTab === 'inactive' ? 'inactive' : 'active',
      inactiveReason: '',
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name || '',
      phone: cust.phone || '',
      email: cust.email || '',
      gender: cust.gender && cust.gender !== '-' ? cust.gender : 'Male',
      status: cust.status || 'active',
      inactiveReason: cust.inactiveReason || '',
      notes: cust.notes || ''
    });
    setIsAddModalOpen(true);
  };

  // Submit Add or Edit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        gender: formData.gender,
        status: formData.status,
        inactiveReason: formData.status === 'inactive' ? (formData.inactiveReason.trim() || 'Marked inactive') : '',
        notes: formData.notes.trim()
      });
    } else {
      addCustomer({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        gender: formData.gender,
        status: formData.status,
        inactiveReason: formData.status === 'inactive' ? (formData.inactiveReason.trim() || 'Marked inactive') : '',
        notes: formData.notes.trim()
      });
    }

    setIsAddModalOpen(false);
    setEditingCustomer(null);
  };

  // Delete Customer
  const confirmDeleteCustomer = () => {
    if (deletingCustomerId) {
      deleteCustomer(deletingCustomerId);
      setDeletingCustomerId(null);
    }
  };

  // Helper: Determine if customer is considered inactive (either manually marked or exceeds configured threshold days)
  const thresholdDays = inactiveDaysThreshold || 30;
  const isCustInactive = (c) => {
    if (c.status === 'inactive') return true;
    const days = getDaysSinceLastVisit(c);
    return days !== null && days >= thresholdDays;
  };

  // Counts
  const allCustomersCount = customers.length;
  const inactiveCustomersCount = customers.filter(isCustInactive).length;
  const activeCustomersCount = customers.filter(c => !isCustInactive(c)).length;
  const vipInactiveCount = customers.filter(c => isCustInactive(c) && c.membershipPlan).length;

  // Filtered customers list
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      // 1. Tab filter: Inactive tab only shows inactive customers
      if (activeTab === 'inactive' && !isCustInactive(cust)) {
        return false;
      }

      // 2. Search filter (name, phone, email)
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (cust.name && cust.name.toLowerCase().includes(q)) ||
        (cust.phone && cust.phone.includes(q)) ||
        (cust.email && cust.email.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // 3. Gender filter
      const matchesGender =
        selectedGender === 'All Genders' ||
        (selectedGender === 'Other'
          ? cust.gender === 'Other' || cust.gender === '-'
          : cust.gender === selectedGender);

      if (!matchesGender) return false;

      // 4. Dormancy filter (only when in inactive tab)
      if (activeTab === 'inactive') {
        if (dormancyFilter === 'novisits') {
          return !cust.history || cust.history.length === 0 || !cust.lastVisit;
        }
        const days = getDaysSinceLastVisit(cust);
        if (dormancyFilter === 'threshold') {
          return days !== null && days >= thresholdDays;
        }
        if (dormancyFilter === '30plus') {
          return days !== null && days >= 30;
        }
        if (dormancyFilter === '60plus') {
          return days !== null && days >= 60;
        }
      }

      return true;
    });
  }, [customers, activeTab, searchTerm, selectedGender, dormancyFilter, thresholdDays]);

  // Paginated customers
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  // Handle Export to Excel (CSV format)
  const handleExportExcel = () => {
    const isInactive = activeTab === 'inactive';
    const headers = isInactive
      ? ['Name', 'Phone', 'Email', 'Gender', 'Status', 'Inactivity Reason', 'Last Visit', 'Registered Date', 'Membership Plan']
      : ['Name', 'Phone', 'Email', 'Gender', 'Status', 'Registered Date', 'Membership Plan'];

    const rows = filteredCustomers.map((c) => {
      const base = [
        `"${c.name || ''}"`,
        `"${c.phone || ''}"`,
        `"${c.email || ''}"`,
        `"${c.gender || '-'}"`,
        `"${c.status || 'active'}"`
      ];
      if (isInactive) {
        base.push(
          `"${c.inactiveReason || 'No salon visit in 30+ days'}"`,
          `"${c.lastVisit || 'No visits recorded'}"`
        );
      }
      base.push(
        `"${c.registeredDate || ''}"`,
        `"${c.membershipPlan || 'None'}"`
      );
      return base;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${isInactive ? 'inactive_customers_report' : 'customers_directory'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Print / PDF
  const handlePrint = () => {
    window.print();
  };

  // Enroll Membership
  const handleEnrollMembership = (e) => {
    e.preventDefault();
    if (!selectedPlanId || !selectedCustomer) return;
    assignMembershipToCustomer(selectedCustomer.id, selectedPlanId);
    setIsEnrollModalOpen(false);
    const updated = customers.find(c => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);
  };

  // Open Invoice helper
  const handleOpenInvoice = (h, customer) => {
    const foundBill = bills?.find(b => b.id === h.billId);
    if (foundBill) {
      setSelectedBillForInvoice(foundBill);
      return;
    }

    const constructedBill = {
      id: h.billId || `INV-${Date.now().toString().slice(-4)}`,
      customerName: customer.name,
      customerPhone: customer.phone,
      date: h.date || '2026-10-17',
      time: '12:00 PM',
      employeeName: h.employeeName || 'Master Stylist',
      items: [
        ...(h.services || []).map(s => ({ name: s, type: 'service', price: Math.round(h.amount * 0.7), quantity: 1 })),
        ...(h.products || []).map(p => ({ name: p.name, type: 'product', price: p.price, quantity: p.quantity || 1 }))
      ],
      subtotal: h.amount,
      discount: 0,
      gst: Math.round(h.amount * 0.18),
      total: h.amount,
      paymentMethod: h.paymentMethod || 'Cash',
      upiRef: h.upiRef || ''
    };
    setSelectedBillForInvoice(constructedBill);
  };

  // -------------------------------------------------------------------------
  // FULL SCREEN VIEW: When a customer is selected to view history
  // -------------------------------------------------------------------------
  if (selectedCustomer) {
    const history = selectedCustomer.history || [];
    const totalSpent = history.reduce((sum, h) => sum + (h.amount || 0), 0);
    const totalVisits = history.length;
    const avgSpend = totalVisits > 0 ? Math.round(totalSpent / totalVisits) : 0;

    return (
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Top Full-Page Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-xs transition-all hover:-translate-x-0.5"
            >
              <ArrowLeft size={16} />
              <span>Back to Customers</span>
            </button>
            <div className="h-5 w-px bg-gray-200 hidden sm:block" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Customer Profile &amp; Service History</p>
              <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {selectedCustomer.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-[#D4AF37] text-[#9E7814] text-xs font-bold hover:bg-[#FAF6EA] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Crown size={15} />
              <span>{selectedCustomer.membershipPlan ? 'Change VIP Plan' : 'Enroll VIP Member'}</span>
            </button>
            <button
              onClick={() => setActiveMenu('billing')}
              className="bg-black hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Receipt size={15} />
              <span>New POS Bill</span>
            </button>
          </div>
        </div>

        {/* Customer Profile Banner Card */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-2xl font-mono shadow-md border-2 border-slate-700 shrink-0">
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
                  {selectedCustomer.name}
                </h3>
                {selectedCustomer.membershipPlan ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                    <Crown size={13} className="text-amber-600" />
                    <span>{selectedCustomer.membershipPlan}</span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                    Regular Client
                  </span>
                )}
                {selectedCustomer.gender && selectedCustomer.gender !== '-' && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {selectedCustomer.gender}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mt-2 font-mono">
                <span className="flex items-center gap-1.5 text-slate-900 font-medium">
                  <Phone size={14} className="text-slate-500" /> +91 {selectedCustomer.phone}
                </span>
                {selectedCustomer.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Mail size={14} className="text-slate-500" /> {selectedCustomer.email}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Calendar size={14} className="text-gray-400" /> Registered: {selectedCustomer.registeredDate}
                </span>
                {selectedCustomer.membershipExpiry && (
                  <>
                    <span>•</span>
                    <span className="text-amber-700 font-medium">
                      VIP Valid until {selectedCustomer.membershipExpiry}
                    </span>
                  </>
                )}
              </div>

              {selectedCustomer.notes && (
                <p className="text-xs text-amber-900 italic mt-2.5 bg-amber-50/60 px-3 py-1.5 rounded-lg border border-amber-200/60 inline-block">
                  Styling Notes: "{selectedCustomer.notes}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Financial & Visit KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-gray-200 text-center shadow-xs">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block">Total Lifetime Spent</span>
            <span className="font-mono font-bold text-2xl text-slate-900 mt-1 block">₹{totalSpent.toLocaleString()}</span>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-gray-200 text-center shadow-xs">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block">Total Completed Visits</span>
            <span className="font-mono font-bold text-2xl text-slate-900 mt-1 block">{totalVisits} Bills</span>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-gray-200 text-center shadow-xs">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500 block">Average Spend per Visit</span>
            <span className="font-mono font-bold text-2xl text-emerald-600 mt-1 block">₹{avgSpend.toLocaleString()}</span>
          </div>
        </div>

        {/* Visit & Purchase History Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <History size={18} className="text-slate-600" />
                <span>Salon Visit &amp; Purchase History ({history.length})</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Complete itemized record of services, assigned stylists, retail purchases, and receipts
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Receipt size={32} className="mx-auto text-gray-400 mb-2 opacity-60" />
              <p className="text-sm font-semibold text-slate-800">No Visit Records Found</p>
              <p className="text-xs text-gray-500 mt-1">This client has not completed any billed services yet.</p>
              <button
                onClick={() => setActiveMenu('billing')}
                className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold mt-4 inline-flex items-center gap-1.5 hover:bg-neutral-800"
              >
                <Receipt size={14} />
                <span>Create First Bill</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100/70 border-b border-gray-200 text-[11px] uppercase tracking-wider font-bold text-gray-600">
                    <th className="py-4 px-4">Date &amp; Bill ID</th>
                    <th className="py-4 px-4">Services Rendered</th>
                    <th className="py-4 px-4">Stylist / Staff</th>
                    <th className="py-4 px-4">Retail Products</th>
                    <th className="py-4 px-4">Payment</th>
                    <th className="py-4 px-4 text-right">Amount</th>
                    <th className="py-4 px-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-xs text-slate-900">{h.billId}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{h.date}</div>
                      </td>
                      <td className="py-4 px-4 min-w-[220px]">
                        <span className="font-medium text-xs text-slate-800 leading-relaxed block">
                          {h.services && h.services.length > 0 ? h.services.join(', ') : '—'}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-800 font-medium">
                        {h.employeeName || 'Staff Stylist'}
                      </td>
                      <td className="py-4 px-4 min-w-[220px] text-xs text-slate-800">
                        {h.products && h.products.length > 0 ? (
                          <div className="space-y-1">
                            {h.products.map((p, pIdx) => (
                              <div key={pIdx} className="leading-snug">
                                <span>{p.name}</span>
                                <span className="text-gray-500 font-medium ml-1">
                                  (₹{p.price}{p.quantity > 1 ? ` × ${p.quantity}` : ''})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-xs">
                        <span className="font-semibold text-slate-900 block">{h.paymentMethod}</span>
                        {h.upiRef && (
                          <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                            {h.upiRef}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-base text-slate-900">
                          ₹{h.amount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenInvoice(h, selectedCustomer)}
                          className="text-xs text-slate-700 hover:text-black font-semibold hover:underline inline-flex items-center gap-1 transition-colors"
                          title="View & Print Official Receipt"
                        >
                          <Printer size={13} />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Enroll Membership Modal */}
        <Modal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          title="Assign VIP Membership"
          subtitle={`Select membership tier for ${selectedCustomer?.name}`}
        >
          <form onSubmit={handleEnrollMembership} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Select Membership Tier
              </label>
              <div className="space-y-2">
                {memberships.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedPlanId === m.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="plan"
                        value={m.id}
                        checked={selectedPlanId === m.id}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        className="accent-black"
                      />
                      <div>
                        <p className="font-bold text-sm text-slate-900">{m.name}</p>
                        <p className="text-xs text-gray-500">
                          {m.durationMonths} Months • {m.discountPercentage}% discount on all services
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-900">₹{m.price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedPlanId}
                className="bg-black hover:bg-neutral-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50"
              >
                Confirm Enrollment
              </button>
            </div>
          </form>
        </Modal>

        {/* Invoice Modal for receipt preview */}
        {selectedBillForInvoice && (
          <InvoiceModal
            bill={selectedBillForInvoice}
            isOpen={Boolean(selectedBillForInvoice)}
            onClose={() => setSelectedBillForInvoice(null)}
          />
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // MAIN VIEW: Customers Manager (Matching Screenshot Exactly)
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 1. Header with Title and Add Customer Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customers Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage visitor directories, preferences, and dormant re-engagement campaigns.
          </p>
        </div>

        <div>
          <button
            id="btn-add-customer"
            onClick={handleOpenAddModal}
            className="bg-black hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs (Menu) */}
      <div className="flex items-center gap-8 border-b border-gray-200">
        <button
          id="tab-all-customers"
          onClick={() => {
            setActiveTab('all');
            setCustomerViewTab?.('all');
            setCurrentPage(1);
          }}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'all'
              ? 'text-slate-900 border-b-2 border-black'
              : 'text-gray-500 hover:text-slate-800 border-b-2 border-transparent'
          }`}
        >
          <span>All Customers</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {allCustomersCount}
          </span>
        </button>

        <button
          id="tab-inactive-customers"
          onClick={() => {
            setActiveTab('inactive');
            setCustomerViewTab?.('inactive');
            setCurrentPage(1);
          }}
          className={`pb-3 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'inactive'
              ? 'text-slate-900 border-b-2 border-black'
              : 'text-gray-500 hover:text-slate-800 border-b-2 border-transparent'
          }`}
        >
          <span>Inactive Customers</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'inactive' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {inactiveCustomersCount}
          </span>
        </button>
      </div>

      {/* Inactive Threshold Indicator Banner */}
      {activeTab === 'inactive' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50 via-[#FFFBEB] to-amber-50/80 border border-amber-200/90 rounded-2xl px-5 py-3 text-xs text-amber-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>
              Inactive Customer Rule: Clients with no visits for <strong className="font-extrabold text-amber-900 underline decoration-amber-400">{thresholdDays} Days</strong> are considered inactive.
            </span>
          </div>
          <button
            onClick={() => {
              if (setActiveSettingsTab) setActiveSettingsTab('customer-rules');
              setActiveMenu('settings');
            }}
            className="inline-flex items-center gap-1.5 font-bold text-amber-900 hover:text-black bg-amber-200/70 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer w-fit self-start sm:self-auto"
          >
            <span>Edit Inactive Days in Settings</span>
            <ExternalLink size={12} />
          </button>
        </div>
      )}

      {/* 3. Search and Action Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <input
            type="text"
            placeholder={
              activeTab === 'inactive'
                ? 'Search inactive by name, phone, or email...'
                : 'Search by name, phone, or email...'
            }
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-slate-400 text-slate-800 placeholder:text-gray-400 transition-all shadow-xs"
          />
        </div>

        {/* Right Controls: Gender Select, Inactivity Filter & Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dormancy Filter (Inactive tab only) */}
          {activeTab === 'inactive' && (
            <select
              value={dormancyFilter}
              onChange={(e) => {
                setDormancyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-xs"
            >
              <option value="all">All Inactive ({inactiveCustomersCount})</option>
              <option value="threshold">{thresholdDays}+ Days (Configured Threshold)</option>
              <option value="60plus">60+ Days Dormant</option>
              <option value="novisits">No Visits Recorded</option>
            </select>
          )}

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => {
              setSelectedGender(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer shadow-xs"
          >
            <option value="All Genders">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
            title={activeTab === 'inactive' ? 'Print Inactive Customers' : 'Print Customer Directory'}
          >
            <Printer size={16} className="text-gray-600" />
            <span>Print</span>
          </button>

          {/* Excel Export Button */}
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-300 rounded-xl text-sm font-medium text-emerald-700 flex items-center gap-1.5 shadow-xs transition-colors"
            title="Download Excel / CSV"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            <span>Excel</span>
          </button>

          {/* PDF Export Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-300 rounded-xl text-sm font-medium text-rose-700 flex items-center gap-1.5 shadow-xs transition-colors"
            title="Save as PDF"
          >
            <FileText size={16} className="text-rose-600" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* 4. Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1F3F5] border-b border-gray-200 text-[11px] uppercase tracking-wider font-bold text-gray-500">
                <th className="py-4 px-6 font-semibold">NAME</th>
                <th className="py-4 px-6 font-semibold">PHONE</th>
                <th className="py-4 px-6 font-semibold">EMAIL</th>
                {activeTab === 'inactive' ? (
                  <>
                    <th className="py-4 px-6 font-semibold">LAST VISIT</th>
                    <th className="py-4 px-6 font-semibold">INACTIVITY REASON</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-6 font-semibold">GENDER</th>
                    <th className="py-4 px-6 font-semibold">STATUS</th>
                  </>
                )}
                <th className="py-4 px-6 font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
                        {activeTab === 'inactive' ? <UserCheck size={28} className="text-emerald-500" /> : <Users size={28} />}
                      </div>
                      <p className="font-bold text-base text-slate-800">
                        {activeTab === 'inactive'
                          ? 'No inactive customers found!'
                          : 'No customers found matching your criteria.'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activeTab === 'inactive'
                          ? 'All registered clients are active or no dormant records match the current filters.'
                          : 'Try modifying your search keywords or filter settings.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => {
                  const isInactive = cust.status === 'inactive';
                  const daysDormant = getDaysSinceLastVisit(cust);

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* NAME */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedCustomer(cust)}
                              className="font-bold text-slate-900 hover:text-black hover:underline text-left block"
                            >
                              {cust.name}
                            </button>
                            {cust.membershipPlan && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 mt-0.5">
                                <Crown size={11} className="text-amber-500" />
                                <span>{cust.membershipPlan}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* PHONE */}
                      <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                        {cust.phone}
                      </td>

                      {/* EMAIL */}
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        {cust.email || '-'}
                      </td>

                      {/* TAB CONDITIONAL COLUMNS */}
                      {activeTab === 'inactive' ? (
                        <>
                          {/* LAST VISIT */}
                          <td className="py-4 px-6 whitespace-nowrap text-xs">
                            <span className="font-semibold text-slate-800 block">
                              {cust.lastVisit || 'No visits recorded'}
                            </span>
                            {daysDormant !== null ? (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100/70 text-amber-900 font-mono">
                                {daysDormant} days dormant
                              </span>
                            ) : (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600">
                                Never visited
                              </span>
                            )}
                          </td>

                          {/* INACTIVITY REASON */}
                          <td className="py-4 px-6 text-xs text-slate-700">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                                <UserX size={10} /> Inactive
                              </span>
                              <span className="text-gray-500 text-[11px] leading-tight">
                                {cust.inactiveReason || 'No salon visit in 30+ days'}
                              </span>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* GENDER */}
                          <td className="py-4 px-6 text-slate-700 text-xs">
                            {cust.gender || '-'}
                          </td>

                          {/* STATUS */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            {isInactive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Inactive</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Active</span>
                              </span>
                            )}
                          </td>
                        </>
                      )}

                      {/* ACTIONS: Edit & Delete */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEditModal(cust)}
                            className="text-sm font-medium text-slate-800 hover:text-black hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingCustomerId(cust.id)}
                            className="text-sm font-medium text-slate-800 hover:text-rose-600 hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
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

      {/* 5. Pagination Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
        >
          Previous
        </button>

        <span className="text-xs text-gray-500 font-medium">
          Showing {paginatedCustomers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length}{' '}
          {activeTab === 'inactive' ? 'dormant clients' : 'clients'}
        </span>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
        >
          Next
        </button>
      </div>

      {/* 6. Portaled Add / Edit Customer Modal */}
      {isAddModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all my-8">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingCustomer
                      ? 'Update client information and contact details'
                      : 'Register new client in the salon customer directory'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-slate-800 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vijay Chandrasekhar"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-slate-800 shadow-xs"
                  />
                </div>

                {/* Phone & Gender Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876500456"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-slate-800 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-slate-800 shadow-xs bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="-">- (Not specified)</option>
                    </select>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. vijay@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-slate-800 shadow-xs"
                  />
                </div>

                {/* Client Status & Inactivity Reason */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Client Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-slate-800 shadow-xs bg-white"
                    >
                      <option value="active">Active Client</option>
                      <option value="inactive">Inactive / Dormant</option>
                    </select>
                  </div>

                  {formData.status === 'inactive' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                        Inactivity Reason
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. No visit in 30+ days"
                        value={formData.inactiveReason}
                        onChange={(e) => setFormData(prev => ({ ...prev, inactiveReason: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-slate-800 shadow-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Styling Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Styling Notes / Preferences
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Likes fade cut, sensitive scalp, preferred tea"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-slate-800 shadow-xs"
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-black hover:bg-neutral-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all"
                  >
                    {editingCustomer ? 'Save Changes' : 'Save Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* 7. Delete Confirmation Modal */}
      {deletingCustomerId &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Customer?</h3>
              <p className="text-xs text-gray-500 mt-2">
                Are you sure you want to delete this customer record? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeletingCustomerId(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteCustomer}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}



      {/* Invoice Modal for receipt view if clicked */}
      {selectedBillForInvoice && (
        <InvoiceModal
          bill={selectedBillForInvoice}
          isOpen={Boolean(selectedBillForInvoice)}
          onClose={() => setSelectedBillForInvoice(null)}
        />
      )}
    </div>
  );
}
