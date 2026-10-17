import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Calendar,
  Sparkles,
  ShoppingBag,
  CreditCard,
  UserCheck,
  Crown,
  History,
  Receipt,
  Eye,
  CheckCircle2,
  ChevronRight,
  Filter,
  ArrowLeft,
  Printer
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';
import Modal from '../components/Modal';
import InvoiceModal from '../components/InvoiceModal';

export default function CustomersView() {
  const {
    customers,
    addCustomer,
    setActiveMenu,
    memberships,
    assignMembershipToCustomer,
    bills
  } = useSaloon();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMembership, setFilterMembership] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Add Customer Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: ''
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    addCustomer(formData);
    setFormData({ name: '', phone: '', notes: '' });
    setIsAddModalOpen(false);
  };

  const handleEnrollMembership = (e) => {
    e.preventDefault();
    if (!selectedPlanId || !selectedCustomer) return;
    assignMembershipToCustomer(selectedCustomer.id, selectedPlanId);
    setIsEnrollModalOpen(false);
    // Refresh selectedCustomer view
    const updated = customers.find(c => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);
  };

  // Helper to open invoice for a visit
  const handleOpenInvoice = (h, customer) => {
    // Look up existing bill by id
    const foundBill = bills?.find(b => b.id === h.billId);
    if (foundBill) {
      setSelectedBillForInvoice(foundBill);
      return;
    }

    // Construct bill object for invoice preview
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

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    const matchesMem =
      filterMembership === 'all'
        ? true
        : filterMembership === 'members'
        ? Boolean(c.membershipPlan)
        : !c.membershipPlan;
    return matchesSearch && matchesMem;
  });

  // -------------------------------------------------------------------------
  // FULL SCREEN VIEW: When a customer is selected, show as a full page view
  // -------------------------------------------------------------------------
  if (selectedCustomer) {
    const history = selectedCustomer.history || [];
    const totalSpent = history.reduce((sum, h) => sum + (h.amount || 0), 0);
    const totalVisits = history.length;
    const avgSpend = totalVisits > 0 ? Math.round(totalSpent / totalVisits) : 0;

    return (
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Top Full-Page Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EFECE1] shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="px-4 py-2 rounded-xl border border-[#D4AF37]/50 bg-[#FAF9F5] hover:bg-[#FAF3DE] text-[#9E7814] text-xs font-bold flex items-center gap-2 shadow-xs transition-all hover:-translate-x-0.5"
            >
              <ArrowLeft size={16} />
              <span>Back to Customers</span>
            </button>
            <div className="h-5 w-px bg-[#EFECE1] hidden sm:block" />
            <div>
              <p className="text-xs text-[#9499A8] font-medium">Customer Profile &amp; Service History</p>
              <h2 className="text-xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                {selectedCustomer.name}
              </h2>
            </div>
          </div>

          {/* Action Shortcuts */}
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
              className="gold-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
            >
              <Receipt size={15} />
              <span>New POS Bill</span>
            </button>
          </div>
        </div>

        {/* Customer Profile Banner Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#EFECE1] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A1D24] to-[#252A34] text-white flex items-center justify-center font-bold text-2xl font-mono shadow-md border-2 border-[#D4AF37] shrink-0">
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {selectedCustomer.name}
                </h3>
                {selectedCustomer.membershipPlan ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#FAF3DE] text-[#B58D20] border border-[#D4AF37]/50 shadow-xs">
                    <Crown size={13} className="text-[#C59B27]" />
                    <span>{selectedCustomer.membershipPlan}</span>
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F4F1E8] text-[#8C7A4A] border border-[#E8E2D5]">
                    Regular Client
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#646875] mt-2 font-mono">
                <span className="flex items-center gap-1.5 text-[#18191B] font-medium">
                  <Phone size={14} className="text-[#C59B27]" /> +91 {selectedCustomer.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-[#646875]">
                  <Calendar size={14} className="text-[#9499A8]" /> Registered: {selectedCustomer.registeredDate}
                </span>
                {selectedCustomer.membershipExpiry && (
                  <>
                    <span>•</span>
                    <span className="text-[#B58D20] font-medium">
                      VIP Valid until {selectedCustomer.membershipExpiry}
                    </span>
                  </>
                )}
              </div>

              {selectedCustomer.notes && (
                <p className="text-xs text-[#9E7814] italic mt-2.5 bg-[#FAF9F5] px-3 py-1.5 rounded-lg border border-[#EFECE1] inline-block">
                  Styling Notes: "{selectedCustomer.notes}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Financial & Visit KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-[#EFECE1] text-center shadow-sm">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#9499A8] block">Total Lifetime Spent</span>
            <span className="font-mono font-bold text-2xl text-[#C59B27] mt-1 block">₹{totalSpent.toLocaleString()}</span>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-[#EFECE1] text-center shadow-sm">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#9499A8] block">Total Completed Visits</span>
            <span className="font-mono font-bold text-2xl text-[#18191B] mt-1 block">{totalVisits} Bills</span>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-[#EFECE1] text-center shadow-xs">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#9499A8] block">Average Spend per Visit</span>
            <span className="font-mono font-bold text-2xl text-[#10B981] mt-1 block">₹{avgSpend.toLocaleString()}</span>
          </div>
        </div>

        {/* Visit & Purchase History Section (TABLE FORMAT) */}
        <div className="bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F0EBE0]">
            <div>
              <h3 className="text-lg font-bold text-[#18191B] flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <History size={18} className="text-[#C59B27]" />
                <span>Salon Visit &amp; Purchase History ({history.length})</span>
              </h3>
              <p className="text-xs text-[#646875] mt-0.5">
                Complete itemized record of services, assigned stylists, retail purchases, and receipts
              </p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center bg-[#FAF9F5] rounded-xl border border-dashed border-[#E0DAC9]">
              <Receipt size={32} className="mx-auto text-[#C59B27] mb-2 opacity-60" />
              <p className="text-sm font-semibold text-[#18191B]">No Visit Records Found</p>
              <p className="text-xs text-[#646875] mt-1">This client has not completed any billed services yet.</p>
              <button
                onClick={() => setActiveMenu('billing')}
                className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold mt-4 inline-flex items-center gap-1.5"
              >
                <Receipt size={14} />
                <span>Create First Bill</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#EFECE1] text-[11px] uppercase tracking-wider font-bold text-[#646875]">
                    <th className="py-4 px-4">Date &amp; Bill ID</th>
                    <th className="py-4 px-4">Services Rendered</th>
                    <th className="py-4 px-4">Stylist / Staff</th>
                    <th className="py-4 px-4">Retail Products</th>
                    <th className="py-4 px-4">Payment</th>
                    <th className="py-4 px-4 text-right">Amount</th>
                    <th className="py-4 px-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE0]">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-[#FAF8F2] transition-colors">
                      {/* Date & Bill ID */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-xs text-[#B58D20]">{h.billId}</div>
                        <div className="text-xs text-[#646875] mt-0.5">{h.date}</div>
                      </td>

                      {/* Services Rendered */}
                      <td className="py-4 px-4 min-w-[220px]">
                        <span className="font-medium text-xs text-[#18191B] leading-relaxed block">
                          {h.services && h.services.length > 0 ? h.services.join(', ') : '—'}
                        </span>
                      </td>

                      {/* Stylist */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-[#18191B] font-medium">
                        {h.employeeName || 'Staff Stylist'}
                      </td>

                      {/* Retail Products */}
                      <td className="py-4 px-4 min-w-[220px] text-xs text-[#18191B]">
                        {h.products && h.products.length > 0 ? (
                          <div className="space-y-1">
                            {h.products.map((p, pIdx) => (
                              <div key={pIdx} className="leading-snug">
                                <span>{p.name}</span>
                                <span className="text-[#9E7814] font-medium ml-1">
                                  (₹{p.price}{p.quantity > 1 ? ` × ${p.quantity}` : ''})
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#9499A8]">—</span>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs">
                        <span className="font-semibold text-[#18191B] block">{h.paymentMethod}</span>
                        {h.upiRef && (
                          <span className="text-[10px] text-[#9499A8] font-mono block mt-0.5">
                            {h.upiRef}
                          </span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-base text-[#18191B]">
                          ₹{h.amount?.toLocaleString()}
                        </span>
                      </td>

                      {/* Invoice Action */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenInvoice(h, selectedCustomer)}
                          className="text-xs text-[#B58D20] hover:text-[#8C6B10] font-semibold hover:underline inline-flex items-center gap-1 transition-colors"
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

        {/* Enroll Membership Modal (Nested if needed) */}
        <Modal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          title="Assign VIP Membership"
          subtitle={`Select membership tier for ${selectedCustomer?.name}`}
        >
          <form onSubmit={handleEnrollMembership} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-2">
                Select Membership Tier
              </label>
              <div className="space-y-2">
                {memberships.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedPlanId === m.id
                        ? 'border-[#D4AF37] bg-[#FAF6EA]'
                        : 'border-[#EBE8DE] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="plan"
                        value={m.id}
                        checked={selectedPlanId === m.id}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        className="accent-[#D4AF37]"
                      />
                      <div>
                        <p className="font-bold text-sm text-[#18191B]">{m.name}</p>
                        <p className="text-xs text-[#646875]">
                          {m.durationMonths} Months • {m.discountPercentage}% discount on all services
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#B58D20]">₹{m.price}</span>
                  </label>
                ))}
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
                disabled={!selectedPlanId}
                className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md disabled:opacity-50"
              >
                Confirm Enrollment
              </button>
            </div>
          </form>
        </Modal>

        {/* Invoice Modal for printable receipt preview */}
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
  // DEFAULT VIEW: Customer Directory Table List
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header with title and Right Top Add Customer button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
            Customer Directory &amp; Service History
          </h2>
          <p className="text-xs text-[#646875] mt-1">
            Registered salon clients, stylists serviced, retail product purchases, and payment history
          </p>
        </div>

        {/* Right Top Action: Add Customer Button */}
        <div className="flex items-center gap-3">
          <button
            id="btn-add-customer"
            onClick={() => setIsAddModalOpen(true)}
            className="gold-gradient-btn px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <UserPlus size={18} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9499A8]" size={18} />
          <input
            type="text"
            placeholder="Search customer by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-[#EFECE1] text-sm focus:outline-none focus:border-[#D4AF37] shadow-sm transition-all text-[#18191B]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#9499A8] shrink-0" />
          <select
            value={filterMembership}
            onChange={(e) => setFilterMembership(e.target.value)}
            className="w-full py-3 px-4 bg-white rounded-xl border border-[#EFECE1] text-sm focus:outline-none focus:border-[#D4AF37] shadow-sm text-[#18191B]"
          >
            <option value="all">All Clients ({customers.length})</option>
            <option value="members">VIP Members Only</option>
            <option value="non-members">Standard Clients</option>
          </select>
        </div>
      </div>

      {/* Customer List in Table Format */}
      <div className="bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#EFECE1] text-[11px] uppercase tracking-wider font-bold text-[#646875]">
                <th className="py-4 px-6">Customer Name</th>
                <th className="py-4 px-6">Phone Number</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Membership Details</th>
                <th className="py-4 px-6 text-right">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE0] text-sm">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#9499A8] text-sm">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomer(cust)}
                      className="hover:bg-[#FAF7ED] transition-colors cursor-pointer group"
                      title="Click to view full customer details & history page"
                    >
                      {/* Customer Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1D24] to-[#252A34] text-white flex items-center justify-center font-bold text-sm font-mono shadow-sm border border-[#D4AF37]/30 shrink-0 group-hover:border-[#D4AF37] transition-colors">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-[#18191B] group-hover:text-[#9E7814] transition-colors text-sm block">
                              {cust.name}
                            </span>
                            {cust.notes && (
                              <p className="text-xs text-[#9499A8] truncate max-w-xs italic mt-0.5">
                                "{cust.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-[#18191B] flex items-center gap-1.5 font-medium">
                          <Phone size={13} className="text-[#C59B27] shrink-0" />
                          +91 {cust.phone}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6">
                        <span className="text-xs text-[#646875] flex items-center gap-1.5 font-medium">
                          <Calendar size={13} className="text-[#9499A8] shrink-0" />
                          {cust.registeredDate}
                        </span>
                      </td>

                      {/* Separate Column: Membership Details */}
                      <td className="py-4 px-6">
                        {cust.membershipPlan ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-[#FAF3DE] text-[#B58D20] border border-[#D4AF37]/40 w-fit">
                              <Crown size={12} className="text-[#C59B27]" />
                              <span>{cust.membershipPlan}</span>
                            </span>
                            {cust.membershipExpiry && (
                              <span className="text-[10px] text-[#9499A8] font-mono pl-1">
                                Exp: {cust.membershipExpiry}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[#8C7A4A] font-medium bg-[#F4F1E8] px-2.5 py-1 rounded-full border border-[#E8E2D5] inline-block">
                            Regular Client
                          </span>
                        )}
                      </td>

                      {/* Action: Click to open full page history */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(cust);
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-[#D4AF37] text-[#9E7814] hover:bg-[#FAF3DE] text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs"
                        >
                          <History size={13} />
                          <span>History</span>
                          <ChevronRight size={13} className="text-[#C59B27]" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
        subtitle="Register client name and phone number into salon directory"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Varma"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number, e.g. 9845012345"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Haircut / Styling Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Likes fade cut, sensitive scalp, preferred stylist Vikram"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875] hover:bg-[#F4F1E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md"
            >
              Register Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Modal for printable receipt preview */}
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
