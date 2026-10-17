import React, { useState } from 'react';
import {
  Receipt,
  Search,
  UserPlus,
  Plus,
  Trash2,
  Sparkles,
  CreditCard,
  QrCode,
  CheckCircle2,
  Crown,
  UserCheck,
  ShoppingBag,
  Layers,
  Phone,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSaloon } from '../context/SaloonContext';
import InvoiceModal from '../components/InvoiceModal';
import Modal from '../components/Modal';

export default function BillingView() {
  const {
    customers,
    services,
    products,
    employees,
    packages,
    memberships,
    createBill,
    addCustomer
  } = useSaloon();

  // Search & Customer State
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isQuickAddCustomerOpen, setIsQuickAddCustomerOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '' });

  // Bill Items State
  // Selected services: [{ id, name, price, employeeId, employeeName }]
  const [billServices, setBillServices] = useState([
    {
      id: 'srv-1',
      name: 'Signature Royal Haircut & Styling',
      price: 450,
      employeeId: employees[0]?.id || '',
      employeeName: employees[0]?.name || 'Stylist'
    }
  ]);

  // Selected products: [{ id, name, price, quantity }]
  const [billProducts, setBillProducts] = useState([]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' or 'Cash'
  const [upiRef, setUpiRef] = useState('');
  const [manualDiscount, setManualDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Modals
  const [isUpiQrModalOpen, setIsUpiQrModalOpen] = useState(false);
  const [generatedInvoiceBill, setGeneratedInvoiceBill] = useState(null);

  // Search existing customer by name or phone
  const searchResults = customerSearch.trim() === ''
    ? []
    : customers.filter(
        c =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.phone.includes(customerSearch)
      );

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(`${customer.name} (${customer.phone})`);
    setShowCustomerDropdown(false);
  };

  const handleQuickAddCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim() || !newCustomerForm.phone.trim()) return;
    const added = addCustomer(newCustomerForm);
    setSelectedCustomer(added);
    setCustomerSearch(`${added.name} (${added.phone})`);
    setNewCustomerForm({ name: '', phone: '' });
    setIsQuickAddCustomerOpen(false);
  };

  // Add Service to Bill
  const handleAddServiceRow = (serviceId) => {
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;

    setBillServices(prev => [
      ...prev,
      {
        id: srv.id,
        name: srv.name,
        price: srv.price,
        employeeId: employees[0]?.id || '',
        employeeName: employees[0]?.name || 'Stylist'
      }
    ]);
  };

  // Add Package Services to Bill
  const handleAddPackageServices = (pkg) => {
    const packageRow = {
      id: pkg.id,
      name: `[Combo] ${pkg.name}`,
      price: pkg.packagePrice,
      employeeId: employees[0]?.id || '',
      employeeName: employees[0]?.name || 'Stylist'
    };
    setBillServices(prev => [...prev, packageRow]);
  };

  // Remove Service
  const handleRemoveServiceRow = (index) => {
    setBillServices(prev => prev.filter((_, idx) => idx !== index));
  };

  // Change Stylist assigned to service
  const handleServiceEmployeeChange = (index, empId) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    setBillServices(prev =>
      prev.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            employeeId: emp.id,
            employeeName: emp.name
          };
        }
        return item;
      })
    );
  };

  // Add Product to Bill
  const handleAddProductRow = (productId) => {
    const prd = products.find(p => p.id === productId);
    if (!prd) return;

    const existing = billProducts.find(p => p.id === productId);
    if (existing) {
      setBillProducts(prev =>
        prev.map(p =>
          p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setBillProducts(prev => [
        ...prev,
        {
          id: prd.id,
          name: prd.name,
          price: prd.price,
          quantity: 1,
          image: prd.image || '/images/products/argan_hair_oil.jpg'
        }
      ]);
    }
  };

  // Remove Product
  const handleRemoveProductRow = (productId) => {
    setBillProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Update Product Qty
  const handleUpdateProductQty = (productId, delta) => {
    setBillProducts(prev =>
      prev
        .map(p => {
          if (p.id === productId) {
            const newQty = p.quantity + delta;
            return newQty > 0 ? { ...p, quantity: newQty } : null;
          }
          return p;
        })
        .filter(Boolean)
    );
  };

  // Price calculations
  const servicesTotal = billServices.reduce((sum, s) => sum + Number(s.price || 0), 0);
  const productsTotal = billProducts.reduce(
    (sum, p) => sum + Number(p.price || 0) * (p.quantity || 1),
    0
  );
  const subtotal = servicesTotal + productsTotal;

  // Membership discount calculation
  let membershipDiscountPercent = 0;
  if (selectedCustomer?.membershipPlan) {
    const memberObj = memberships.find(m => m.name === selectedCustomer.membershipPlan);
    membershipDiscountPercent = memberObj ? memberObj.discountPercentage : 10;
  }

  const membershipDiscountAmount = Math.round(
    (servicesTotal * membershipDiscountPercent) / 100
  );
  const totalDiscount = membershipDiscountAmount + Number(manualDiscount || 0);
  const grandTotal = Math.max(0, subtotal - totalDiscount);

  // Submit and Create Bill
  const handleGenerateBill = () => {
    if (!selectedCustomer) {
      alert('Please search or register a customer before generating the bill.');
      return;
    }
    if (billServices.length === 0 && billProducts.length === 0) {
      alert('Please add at least one service or product to the bill.');
      return;
    }

    const createdBill = createBill({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      servicesSelected: billServices,
      productsSelected: billProducts,
      subtotal,
      membershipDiscount: totalDiscount,
      totalAmount: grandTotal,
      paymentMethod,
      upiRef,
      notes
    });

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    setGeneratedInvoiceBill(createdBill);

    // Reset bill form
    setBillServices([]);
    setBillProducts([]);
    setUpiRef('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
            Salon POS & Service Billing Counter
          </h2>
          <p className="text-xs text-[#646875] mt-1">
            Search customer by name or phone, assign stylists, add products, and collect payment via UPI or Cash
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#FAF6EA] text-[#B58D20] border border-[#D4AF37]/30 flex items-center gap-1.5">
            <Sparkles size={14} /> POS Counter Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Customer Selection + Services & Products Entry */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Customer Search / Selection */}
          <div className="luxury-card bg-white p-6 rounded-2xl border border-[#EFECE1]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE0] mb-4">
              <h3 className="font-bold text-base text-[#18191B] flex items-center gap-2">
                <User size={18} className="text-[#C59B27]" />
                Customer Identification
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickAddCustomerOpen(true)}
                className="text-xs font-bold text-[#C59B27] hover:underline flex items-center gap-1"
              >
                <UserPlus size={14} /> + New Customer
              </button>
            </div>

            {/* Search Input with Autocomplete dropdown */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9499A8]" size={18} />
              <input
                type="text"
                placeholder="Search existing customer by name or phone number..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                  if (selectedCustomer && e.target.value !== selectedCustomer.name) {
                    setSelectedCustomer(null);
                  }
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full pl-11 pr-4 py-3 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white text-[#18191B] font-medium"
              />

              {/* Autocomplete Dropdown List */}
              {showCustomerDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#D4AF37]/40 shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-[#F6F5F0]">
                  {searchResults.map((cust) => (
                    <div
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className="p-3.5 hover:bg-[#FAF8F2] cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="font-bold text-sm text-[#18191B]">{cust.name}</p>
                        <p className="text-xs text-[#646875] font-mono">+91 {cust.phone}</p>
                      </div>
                      <div className="text-right">
                        {cust.membershipPlan ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3DE] text-[#B58D20] border border-[#D4AF37]/30">
                            {cust.membershipPlan}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#9499A8]">Regular</span>
                        )}
                        <p className="text-[10px] text-[#9499A8] mt-0.5">{cust.history?.length || 0} visits</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Customer Card Preview */}
            {selectedCustomer && (
              <div className="mt-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] flex flex-wrap items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#181A20] text-white flex items-center justify-center font-bold text-base font-mono">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[#18191B]">{selectedCustomer.name}</p>
                      {selectedCustomer.membershipPlan && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3DE] text-[#B58D20] border border-[#D4AF37]/30">
                          <Crown size={11} /> {selectedCustomer.membershipPlan}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#646875] font-mono">+91 {selectedCustomer.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  {selectedCustomer.membershipPlan && (
                    <div className="text-xs font-semibold text-[#10B981]">
                      🎉 {membershipDiscountPercent}% VIP Discount Applied
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch('');
                    }}
                    className="text-xs text-[#EF4444] hover:underline font-semibold"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Services Done Entry (With Stylist Assignment) */}
          <div className="luxury-card bg-white p-6 rounded-2xl border border-[#EFECE1]">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#F0EBE0] mb-4 gap-2">
              <div>
                <h3 className="font-bold text-base text-[#18191B] flex items-center gap-2">
                  <Sparkles size={18} className="text-[#C59B27]" />
                  Services Performed & Stylist Assigned
                </h3>
                <p className="text-xs text-[#646875]">Assign which employee serviced the customer for each service</p>
              </div>

              {/* Quick Select Service dropdown */}
              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddServiceRow(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#D4AF37] text-xs font-bold text-[#9E7814] bg-[#FAF8F2] focus:outline-none cursor-pointer"
                >
                  <option value="">+ Add Service to Bill</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - ₹{s.price}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Packages Shortcuts */}
            <div className="mb-4 p-3 rounded-xl bg-[#FAF9F5] border border-[#EFECE1]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9499A8] block mb-2">
                Quick Combo Packages:
              </span>
              <div className="flex flex-wrap gap-2">
                {packages.map(pkg => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handleAddPackageServices(pkg)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#EBE8DE] text-xs font-semibold text-[#18191B] hover:border-[#D4AF37] hover:bg-[#FAF6EA] transition-colors"
                  >
                    + {pkg.name} (₹{pkg.packagePrice})
                  </button>
                ))}
              </div>
            </div>

            {/* Services Table List */}
            {billServices.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                No services added to this bill yet. Choose a service or combo package above.
              </p>
            ) : (
              <div className="space-y-3">
                {billServices.map((row, idx) => (
                  <div
                    key={`srv-row-${idx}`}
                    className="p-3.5 rounded-xl bg-[#FCFCFA] border border-[#EFECE1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-sm text-[#18191B]">{row.name}</p>
                      <p className="text-[11px] text-[#646875]">Salon styling service</p>
                    </div>

                    {/* Stylist Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[#9499A8] font-bold text-[10px] uppercase">Stylist:</span>
                      <select
                        value={row.employeeId}
                        onChange={(e) => handleServiceEmployeeChange(idx, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#EBE8DE] bg-white font-medium text-xs text-[#18191B] focus:border-[#D4AF37]"
                      >
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} ({emp.presentToday ? 'Present' : 'Absent'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price and Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="font-mono font-bold text-sm text-[#18191B]">₹{row.price}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveServiceRow(idx)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove service"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Retail Products Purchase */}
          <div className="luxury-card bg-white p-6 rounded-2xl border border-[#EFECE1]">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#F0EBE0] mb-4 gap-2">
              <div>
                <h3 className="font-bold text-base text-[#18191B] flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#C59B27]" />
                  Retail Products Purchased
                </h3>
                <p className="text-xs text-[#646875]">Oils, pomades, balms, shampoos and masks</p>
              </div>

              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddProductRow(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-[#D4AF37] text-xs font-bold text-[#9E7814] bg-[#FAF8F2] focus:outline-none cursor-pointer"
              >
                <option value="">+ Add Product to Bill</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.name} - ₹{p.price} ({p.stock} in stock)
                  </option>
                ))}
              </select>
            </div>

            {billProducts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No retail products added. (Optional)
              </p>
            ) : (
              <div className="space-y-3">
                {billProducts.map((prd) => (
                  <div
                    key={prd.id}
                    className="p-3.5 rounded-xl bg-[#FCFCFA] border border-[#EFECE1] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prd.image || '/images/products/argan_hair_oil.jpg'}
                        alt={prd.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#D4AF37]/30 shadow-sm shrink-0"
                      />
                      <div>
                        <p className="font-bold text-sm text-[#18191B]">{prd.name}</p>
                        <p className="text-[11px] text-[#646875]">₹{prd.price} each</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Qty Controls */}
                      <div className="flex items-center border border-[#EBE8DE] rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() => handleUpdateProductQty(prd.id, -1)}
                          className="px-2.5 py-1 text-xs hover:bg-[#F4F1E8] font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono font-bold">{prd.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateProductQty(prd.id, 1)}
                          className="px-2.5 py-1 text-xs hover:bg-[#F4F1E8] font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-mono font-bold text-sm text-[#18191B] w-16 text-right">
                        ₹{(prd.price * prd.quantity)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveProductRow(prd.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Bill Breakdown & Payment Mode Entry */}
        <div className="space-y-6">
          <div className="luxury-card bg-white p-6 rounded-2xl border-2 border-[#D4AF37]/50 shadow-xl sticky top-28">
            <h3 className="font-bold text-lg text-[#18191B] pb-3 border-b border-[#F0EBE0]" style={{ fontFamily: 'var(--font-heading)' }}>
              Checkout & Payment
            </h3>

            {/* Calculations Breakdown */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-[#646875]">
                <span>Services Subtotal ({billServices.length})</span>
                <span className="font-mono font-semibold text-[#18191B]">₹{servicesTotal}</span>
              </div>

              <div className="flex justify-between text-[#646875]">
                <span>Products Subtotal ({billProducts.length})</span>
                <span className="font-mono font-semibold text-[#18191B]">₹{productsTotal}</span>
              </div>

              {membershipDiscountAmount > 0 && (
                <div className="flex justify-between text-[#10B981] font-semibold">
                  <span className="flex items-center gap-1">
                    <Crown size={12} /> VIP Discount ({membershipDiscountPercent}%)
                  </span>
                  <span className="font-mono">- ₹{membershipDiscountAmount}</span>
                </div>
              )}

              {/* Manual Discount Override input */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F0EBE0]">
                <span className="text-[#646875]">Manual Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={manualDiscount}
                  onChange={(e) => setManualDiscount(Math.max(0, Number(e.target.value)))}
                  className="w-20 px-2 py-1 text-right rounded border border-[#EBE8DE] text-xs font-mono"
                />
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-dashed border-[#D4AF37]/50 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-[#9499A8] block">Total Payable</span>
                  <span className="text-xs text-[#10B981] font-semibold">Includes Taxes</span>
                </div>
                <span className="font-mono font-black text-2xl text-[#B58D20]">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            {/* Payment Method Selector (Cash or UPI) as specified */}
            <div className="mt-4 pt-4 border-t border-[#F0EBE0] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9499A8] block">
                Select Payment Mode *
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-[#D4AF37] bg-[#FAF6EA] text-[#B58D20] shadow-sm font-bold'
                      : 'border-[#EBE8DE] text-[#646875] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <QrCode size={20} />
                  <span className="text-xs">UPI Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'Cash'
                      ? 'border-[#D4AF37] bg-[#FAF6EA] text-[#B58D20] shadow-sm font-bold'
                      : 'border-[#EBE8DE] text-[#646875] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <CreditCard size={20} />
                  <span className="text-xs">Cash Payment</span>
                </button>
              </div>

              {/* UPI QR Demo Button */}
              {paymentMethod === 'UPI' && (
                <div className="space-y-2 pt-1 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => setIsUpiQrModalOpen(true)}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-[#D4AF37] text-xs font-semibold text-[#9E7814] bg-[#FAF9F5] hover:bg-[#FAF6EA] flex items-center justify-center gap-2"
                  >
                    <QrCode size={15} /> Show Salon UPI QR Code
                  </button>

                  <input
                    type="text"
                    placeholder="UPI Reference / UTR Number (Optional)"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EBE8DE] text-xs font-mono text-[#18191B]"
                  />
                </div>
              )}
            </div>

            {/* Complete & Bill Button */}
            <div className="mt-6 pt-2">
              <button
                type="button"
                onClick={handleGenerateBill}
                className="w-full gold-gradient-btn py-3.5 rounded-xl text-sm font-bold text-white shadow-xl flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                Generate & Settle Bill
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      <Modal
        isOpen={isQuickAddCustomerOpen}
        onClose={() => setIsQuickAddCustomerOpen(false)}
        title="Quick Register Customer"
        subtitle="Add customer name and phone to salon directory immediately"
      >
        <form onSubmit={handleQuickAddCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Karthik Nathan"
              value={newCustomerForm.name}
              onChange={(e) => setNewCustomerForm(prev => ({ ...prev, name: e.target.value }))}
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
              placeholder="e.g. 9845099887"
              value={newCustomerForm.phone}
              onChange={(e) => setNewCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => setIsQuickAddCustomerOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md"
            >
              Save & Select
            </button>
          </div>
        </form>
      </Modal>

      {/* Salon UPI QR Code Modal */}
      <Modal
        isOpen={isUpiQrModalOpen}
        onClose={() => setIsUpiQrModalOpen(false)}
        title="Scan Salon UPI QR Code"
        subtitle={`Scan with GPay, PhonePe, Paytm to pay ₹${grandTotal}`}
        maxWidth="max-w-md"
      >
        <div className="text-center p-4">
          <div className="inline-block p-4 bg-white rounded-2xl border-2 border-[#D4AF37] shadow-xl">
            {/* Dynamic Dummy QR Graphic */}
            <div className="w-52 h-52 bg-[#FAF9F5] border border-[#EBE8DE] rounded-xl flex flex-col items-center justify-center p-3">
              <QrCode size={160} className="text-[#18191B]" />
            </div>
            <p className="mt-2 text-xs font-bold text-[#18191B]">UPI ID: auraluxe.salon@okhdfcbank</p>
            <p className="text-[11px] text-[#9E7814] font-semibold mt-0.5">Amount: ₹{grandTotal}</p>
          </div>
          <p className="text-xs text-[#646875] mt-4">
            Once customer scans and completes the payment, enter the reference code or confirm below.
          </p>
          <button
            onClick={() => setIsUpiQrModalOpen(false)}
            className="mt-4 gold-gradient-btn px-6 py-2 rounded-xl text-xs font-bold"
          >
            Payment Received
          </button>
        </div>
      </Modal>

      {/* Generated Receipt Modal */}
      {generatedInvoiceBill && (
        <InvoiceModal
          bill={generatedInvoiceBill}
          isOpen={Boolean(generatedInvoiceBill)}
          onClose={() => setGeneratedInvoiceBill(null)}
        />
      )}
    </div>
  );
}
