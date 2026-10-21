import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  FileText,
  Clock,
  Printer,
  History,
  ShoppingCart,
  Scissors,
  Package,
  X,
  ChevronDown,
  Layers,
  ArrowRight,
  Calendar,
  Edit2,
  CheckSquare,
  Square,
  Banknote,
  Building2,
  Wallet,
  RotateCcw,
  AlertCircle,
  Check,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSaloon, parseTransactionTimestamp } from '../context/SaloonContext';
import InvoiceModal from '../components/InvoiceModal';
import Modal from '../components/Modal';

// Multi-Payment channels list matching the settlement requirements
const PAYMENT_CHANNELS = [
  { id: 'cash', name: 'Cash', icon: Banknote },
  { id: 'credit_card', name: 'Credit Card', icon: CreditCard },
  { id: 'debit_card', name: 'Debit Card', icon: CreditCard },
  { id: 'upi_generic', name: 'UPI (Generic)', icon: Smartphone },
  { id: 'gpay', name: 'Google Pay', icon: Smartphone },
  { id: 'phonepe', name: 'PhonePe', icon: Smartphone },
  { id: 'paytm', name: 'Paytm', icon: Smartphone },
  { id: 'amazon_pay', name: 'Amazon Pay', icon: Smartphone },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2 },
  { id: 'salon_wallet', name: 'Salon Wallet', icon: Wallet }
];

export default function BillingView() {
  const {
    customers,
    services,
    products,
    employees,
    packages,
    memberships,
    assignMembershipToCustomer,
    bills,
    createBill,
    addCustomer,
    setActiveMenu
  } = useSaloon();

  // Top Tabs: 'pos' | 'history'
  const [activeTab, setActiveTab] = useState('pos');

  // ========================================================
  // STEP 1 & 2: CUSTOMER & GENDER SELECTION STATE
  // ========================================================
  const defaultWalkIn = {
    id: 'walk-in',
    name: 'Walk-in Customer',
    phone: '9999999999',
    isWalkIn: true,
    membershipPlan: null
  };

  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(defaultWalkIn);
  const [customerGender, setCustomerGender] = useState('Female');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isQuickAddCustomerOpen, setIsQuickAddCustomerOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: 'Female',
    dob: '',
    email: '',
    membershipPlan: ''
  });

  // Autocomplete customer results (shows all registered customers when empty, or filters on search)
  const searchResults = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase().trim();
    return customers.filter(
      c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customerSearch, customers]);

  // ========================================================
  // STEP 3 & 4: CATEGORY & SERVICE SELECTION STATE
  // ========================================================
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedModalProduct, setSelectedModalProduct] = useState(null);
  const [modalProductQty, setModalProductQty] = useState(1);

  const handleOpenAddProductModal = () => {
    setSelectedModalProduct(products[0] || null);
    setModalProductQty(1);
    setIsAddProductModalOpen(true);
  };

  // Derive unique categories from services + Combo Packages
  const categoriesList = useMemo(() => {
    const set = new Set();
    services.forEach(s => {
      if (s.department) set.add(s.department);
    });
    const list = Array.from(set);
    list.push('Combo Packages');
    return list;
  }, [services]);

  // Filter services or packages based on selectedCategory
  const filteredServices = useMemo(() => {
    if (!selectedCategory) return [];
    if (selectedCategory === 'Combo Packages') {
      return packages.map(pkg => ({
        id: pkg.id,
        name: `[Combo] ${pkg.name}`,
        price: pkg.packagePrice,
        isPackage: true
      }));
    }
    return services.filter(s => s.department === selectedCategory);
  }, [selectedCategory, services, packages]);

  // ========================================================
  // BILLING LINE ITEMS TABLE (SERVICES & PRODUCTS) STATE
  // ========================================================
  const [lineItems, setLineItems] = useState([]);

  // Stylist employee picker dropdown state per row
  const [openStylistPickerRow, setOpenStylistPickerRow] = useState(null);

  // Payment & Settlement State
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Cash' | 'Card'
  const [upiRef, setUpiRef] = useState('');
  const [notes, setNotes] = useState('');
  const [manualDiscount, setManualDiscount] = useState(0);

  // Modals
  const [isUpiQrModalOpen, setIsUpiQrModalOpen] = useState(false);
  const [generatedInvoiceBill, setGeneratedInvoiceBill] = useState(null);

  // Billing History Filter State
  const [historySearch, setHistorySearch] = useState('');
  const [historyPaymentFilter, setHistoryPaymentFilter] = useState('all');
  const [historyDate, setHistoryDate] = useState('');

  // Customer membership discount percent
  const customerDiscountPercent = useMemo(() => {
    if (!selectedCustomer?.membershipPlan) return 0;
    const memberObj = memberships.find(m => m.name === selectedCustomer.membershipPlan);
    return memberObj ? memberObj.discountPercentage : 10;
  }, [selectedCustomer, memberships]);

  // Handle select customer from search dropdown
  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setCustomerSearch(`${cust.name} (${cust.phone})`);
    if (cust.gender && (cust.gender === 'Male' || cust.gender === 'Female')) {
      setCustomerGender(cust.gender);
    }
    setShowCustomerDropdown(false);

    // If customer has membership discount, auto-update discount on service lines
    if (cust.membershipPlan) {
      const plan = memberships.find(m => m.name === cust.membershipPlan);
      const disc = plan ? plan.discountPercentage : 10;
      setLineItems(prev =>
        prev.map(item => (item.type === 'Service' && item.discountPercent === 0 ? { ...item, discountPercent: disc } : item))
      );
    }
  };

  // Select Walk-in Customer
  const handleSelectWalkIn = () => {
    setSelectedCustomer(defaultWalkIn);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  // Quick register new customer
  const handleQuickAddCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.firstName.trim() || !newCustomerForm.phone.trim()) return;

    const fullName = `${newCustomerForm.firstName.trim()} ${newCustomerForm.lastName.trim()}`.trim();

    const added = addCustomer({
      name: fullName,
      phone: newCustomerForm.phone.trim(),
      email: newCustomerForm.email.trim(),
      gender: newCustomerForm.gender || 'Female',
      notes: newCustomerForm.dob ? `DOB: ${newCustomerForm.dob}` : ''
    });

    // If membership plan was selected, assign it
    if (newCustomerForm.membershipPlan) {
      const planObj = memberships.find(m => m.name === newCustomerForm.membershipPlan);
      if (planObj && assignMembershipToCustomer) {
        assignMembershipToCustomer(added.id, planObj.id);
        added.membershipPlan = planObj.name;
        const disc = planObj.discountPercentage || 10;
        setLineItems(prev =>
          prev.map(item => (item.type === 'Service' && item.discountPercent === 0 ? { ...item, discountPercent: disc } : item))
        );
      }
    }

    setSelectedCustomer(added);
    setCustomerGender(newCustomerForm.gender || 'Female');
    setCustomerSearch(`${added.name} (${added.phone})`);
    setNewCustomerForm({
      firstName: '',
      lastName: '',
      phone: '',
      gender: 'Female',
      dob: '',
      email: '',
      membershipPlan: ''
    });
    setIsQuickAddCustomerOpen(false);
  };

  // Add selected Service to Table
  const handleAddServiceToTable = () => {
    if (!selectedServiceId) return;

    let targetItem = null;
    let isPkg = false;

    if (selectedCategory === 'Combo Packages') {
      const pkg = packages.find(p => p.id === selectedServiceId);
      if (pkg) {
        targetItem = {
          id: pkg.id,
          name: `[Combo] ${pkg.name}`,
          price: pkg.packagePrice
        };
        isPkg = true;
      }
    } else {
      targetItem = services.find(s => s.id === selectedServiceId);
    }

    if (!targetItem) return;

    const defaultStylist = employees[0] ? [employees[0].id] : [];
    const defaultStylistNames = employees[0] ? [employees[0].name] : ['Staff'];

    const newLine = {
      lineId: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemId: targetItem.id,
      type: 'Service',
      description: targetItem.name,
      mrp: targetItem.price,
      grossAmount: targetItem.price,
      qty: 1,
      discountPercent: customerDiscountPercent || 0,
      taxPercent: 5, // Default salon GST
      employeeIds: defaultStylist,
      employeeNames: defaultStylistNames,
      isPackage: isPkg
    };

    setLineItems(prev => [...prev, newLine]);
    setSelectedServiceId('');
  };

  // Add Product to Table
  const handleAddProductToTable = (product, quantity = 1) => {
    const existingIndex = lineItems.findIndex(i => i.type === 'Product' && i.itemId === product.id);

    if (existingIndex > -1) {
      // Increment quantity
      setLineItems(prev =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, qty: item.qty + quantity }
            : item
        )
      );
    } else {
      const defaultSeller = employees[0] ? [employees[0].id] : [];
      const defaultSellerNames = employees[0] ? [employees[0].name] : ['Staff'];

      const newLine = {
        lineId: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        itemId: product.id,
        type: 'Product',
        description: product.name,
        mrp: product.price,
        grossAmount: product.price,
        qty: quantity,
        discountPercent: customerDiscountPercent ? Math.min(customerDiscountPercent, 10) : 0,
        taxPercent: 12, // Default retail product GST
        employeeIds: defaultSeller,
        employeeNames: defaultSellerNames
      };

      setLineItems(prev => [...prev, newLine]);
    }

    setIsAddProductModalOpen(false);
  };

  // Update Line Item Field
  const updateLineItem = (lineId, updates) => {
    setLineItems(prev =>
      prev.map(item => (item.lineId === lineId ? { ...item, ...updates } : item))
    );
  };

  // Toggle Employee Assignment (Multi-Select)
  const toggleEmployeeAssignment = (lineId, emp) => {
    setLineItems(prev =>
      prev.map(item => {
        if (item.lineId !== lineId) return item;

        const currentIds = item.employeeIds || [];
        const currentNames = item.employeeNames || [];
        const exists = currentIds.includes(emp.id);

        let newIds;
        let newNames;

        if (exists) {
          // If already in list, remove unless it's the last one
          if (currentIds.length === 1) return item;
          newIds = currentIds.filter(id => id !== emp.id);
          newNames = currentNames.filter(n => n !== emp.name);
        } else {
          newIds = [...currentIds, emp.id];
          newNames = [...currentNames, emp.name];
        }

        return {
          ...item,
          employeeIds: newIds,
          employeeNames: newNames
        };
      })
    );
  };

  // Remove Line Item
  const handleRemoveLineItem = (lineId) => {
    setLineItems(prev => prev.filter(item => item.lineId !== lineId));
  };

  // ========================================================
  // LINE ITEMS CALCULATIONS
  // ========================================================
  const calculatedTable = useMemo(() => {
    return lineItems.map((item, index) => {
      const grossXQty = Number(item.grossAmount || 0) * Number(item.qty || 1);
      const discountAmount = Math.round((grossXQty * Number(item.discountPercent || 0)) / 100);
      const netAmount = Math.max(0, grossXQty - discountAmount);
      const taxAmount = Math.round((netAmount * Number(item.taxPercent || 0)) / 100);
      const lineTotal = netAmount + taxAmount;

      return {
        ...item,
        sNo: index + 1,
        grossXQty,
        discountAmount,
        netAmount,
        taxAmount,
        lineTotal
      };
    });
  }, [lineItems]);

  // Overall Totals
  const totalGross = useMemo(() => calculatedTable.reduce((acc, row) => acc + row.grossXQty, 0), [calculatedTable]);
  const totalItemDiscount = useMemo(() => calculatedTable.reduce((acc, row) => acc + row.discountAmount, 0), [calculatedTable]);
  const totalNet = useMemo(() => calculatedTable.reduce((acc, row) => acc + row.netAmount, 0), [calculatedTable]);
  const totalTax = useMemo(() => calculatedTable.reduce((acc, row) => acc + row.taxAmount, 0), [calculatedTable]);
  const totalDiscountAll = totalItemDiscount + Number(manualDiscount || 0);
  const grandTotal = Math.max(0, totalNet + totalTax - Number(manualDiscount || 0));

  // ========================================================
  // MULTI-PAYMENT ALLOCATION STATE & HELPERS
  // ========================================================
  const [isSplitPaymentModalOpen, setIsSplitPaymentModalOpen] = useState(false);
  const [selectedPaymentChannels, setSelectedPaymentChannels] = useState(['cash']);
  const [channelAmounts, setChannelAmounts] = useState({ cash: 0 });

  // Total Allocated across all checked channels
  const totalAllocated = useMemo(() => {
    return selectedPaymentChannels.reduce((sum, chId) => {
      const val = parseFloat(channelAmounts[chId]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [selectedPaymentChannels, channelAmounts]);

  const allocationDiff = useMemo(() => {
    return Math.round((grandTotal - totalAllocated) * 100) / 100;
  }, [grandTotal, totalAllocated]);

  const isAllocationMatching = useMemo(() => {
    return Math.abs(allocationDiff) < 0.01 && grandTotal > 0;
  }, [allocationDiff, grandTotal]);

  // Open Proceed to Payment modal
  const handleProceedToPayment = () => {
    if (calculatedTable.length === 0) {
      alert('Please add at least one Service or Product to the table before proceeding to payment.');
      return;
    }
    const defaultCh = paymentMethod === 'Card' ? 'credit_card' : paymentMethod === 'UPI' ? 'upi_generic' : 'cash';
    setSelectedPaymentChannels([defaultCh]);
    setChannelAmounts({ [defaultCh]: grandTotal });
    setIsSplitPaymentModalOpen(true);
  };

  // Toggle selection of a payment channel
  const handleTogglePaymentChannel = (channelId) => {
    if (selectedPaymentChannels.includes(channelId)) {
      if (selectedPaymentChannels.length === 1) return; // Keep at least one channel selected

      const nextSelected = selectedPaymentChannels.filter(id => id !== channelId);
      setSelectedPaymentChannels(nextSelected);

      const nextAmounts = { ...channelAmounts };
      delete nextAmounts[channelId];

      if (nextSelected.length === 1) {
        nextAmounts[nextSelected[0]] = grandTotal;
      }
      setChannelAmounts(nextAmounts);
    } else {
      const nextSelected = [...selectedPaymentChannels, channelId];
      setSelectedPaymentChannels(nextSelected);

      const currentAlloc = selectedPaymentChannels.reduce((sum, id) => {
        const val = parseFloat(channelAmounts[id]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      const remaining = Math.max(0, Math.round((grandTotal - currentAlloc) * 100) / 100);

      setChannelAmounts(prev => ({
        ...prev,
        [channelId]: remaining
      }));
    }
  };

  // Update specific channel amount
  const handleChannelAmountChange = (channelId, rawValue) => {
    if (rawValue === '') {
      setChannelAmounts(prev => ({ ...prev, [channelId]: '' }));
      return;
    }
    const parsed = Math.max(0, parseFloat(rawValue) || 0);
    setChannelAmounts(prev => ({ ...prev, [channelId]: parsed }));
  };

  // Allocate all remaining balance to a specific channel
  const handleSetFullChannelAmount = (channelId) => {
    const otherChannelsAlloc = selectedPaymentChannels
      .filter(id => id !== channelId)
      .reduce((sum, id) => {
        const val = parseFloat(channelAmounts[id]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
    const rem = Math.max(0, Math.round((grandTotal - otherChannelsAlloc) * 100) / 100);
    setChannelAmounts(prev => ({
      ...prev,
      [channelId]: rem
    }));
  };

  // Auto-allocate remaining to the first channel with 0 or to the last channel
  const handleAutoAllocateRemaining = () => {
    if (allocationDiff <= 0 || selectedPaymentChannels.length === 0) return;
    const targetChannel =
      selectedPaymentChannels.find(id => !channelAmounts[id] || Number(channelAmounts[id]) === 0) ||
      selectedPaymentChannels[selectedPaymentChannels.length - 1];

    setChannelAmounts(prev => {
      const current = parseFloat(prev[targetChannel]) || 0;
      return {
        ...prev,
        [targetChannel]: Math.round((current + allocationDiff) * 100) / 100
      };
    });
  };

  // ========================================================
  // SETTLE & GENERATE BILL
  // ========================================================
  const handleGenerateBill = (splitData = null) => {
    if (calculatedTable.length === 0) {
      alert('Please add at least one Service or Product to the table before settling.');
      return;
    }

    // Map into servicesSelected and productsSelected for system compatibility
    const servicesSelected = calculatedTable
      .filter(row => row.type === 'Service')
      .map(row => ({
        id: row.itemId,
        name: row.description,
        price: row.netAmount,
        employeeId: row.employeeIds?.[0] || employees[0]?.id || '',
        employeeName: row.employeeNames?.join(', ') || employees[0]?.name || 'Stylist',
        tax: row.taxAmount
      }));

    const productsSelected = calculatedTable
      .filter(row => row.type === 'Product')
      .map(row => ({
        id: row.itemId,
        name: row.description,
        price: row.netAmount,
        quantity: row.qty,
        tax: row.taxAmount
      }));

    const finalMethod = splitData?.methodName || paymentMethod;

    const billPayload = {
      customerId: selectedCustomer.id || 'walk-in',
      customerName: selectedCustomer.name || 'Walk-in Customer',
      customerPhone: selectedCustomer.phone || '9999999999',
      gender: customerGender,
      servicesSelected,
      productsSelected,
      subtotal: totalGross,
      membershipDiscount: totalDiscountAll,
      taxAmount: totalTax,
      totalAmount: grandTotal,
      paymentMethod: finalMethod,
      splitPayments: splitData?.splits || null,
      upiRef,
      notes: notes || `Gender: ${customerGender}`
    };

    const createdBill = createBill(billPayload);

    // Confetti celebration
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    setGeneratedInvoiceBill(createdBill);

    // Reset table for next transaction
    setLineItems([]);
    setSelectedCategory('');
    setSelectedServiceId('');
    setUpiRef('');
    setNotes('');
    setManualDiscount(0);
    setSelectedCustomer(defaultWalkIn);
    setCustomerSearch('');
  };

  // Confirm settlement from modal
  const handleConfirmSplitSettlement = () => {
    if (!isAllocationMatching) {
      if (allocationDiff > 0) {
        alert(`Cannot complete settlement: Remaining unallocated amount of ₹${allocationDiff.toFixed(2)}.`);
      } else {
        alert(`Cannot complete settlement: Over-allocated by ₹${Math.abs(allocationDiff).toFixed(2)}.`);
      }
      return;
    }

    const splits = selectedPaymentChannels.map(chId => {
      const ch = PAYMENT_CHANNELS.find(c => c.id === chId);
      return {
        id: chId,
        name: ch ? ch.name : chId,
        amount: Number(channelAmounts[chId] || 0)
      };
    }).filter(s => s.amount > 0);

    let methodName = 'Cash';
    if (splits.length === 1) {
      methodName = splits[0].name;
    } else if (splits.length > 1) {
      methodName = `Split (${splits.map(s => s.name).join(', ')})`;
    }

    setIsSplitPaymentModalOpen(false);
    handleGenerateBill({ methodName, splits });
  };

  // Filtered Billing History: Always list recent transactions first
  const filteredBills = useMemo(() => {
    return bills
      .filter(b => {
        // 1. Text search
        const matchSearch =
          historySearch.trim() === '' ||
          b.id.toLowerCase().includes(historySearch.toLowerCase()) ||
          b.customerName?.toLowerCase().includes(historySearch.toLowerCase()) ||
          b.customerPhone?.includes(historySearch);

        if (!matchSearch) return false;

        // 2. Payment mode filter
        const matchPayment =
          historyPaymentFilter === 'all' || b.paymentMethod === historyPaymentFilter;

        if (!matchPayment) return false;

        // 3. Particular Date Filter (Calendar)
        if (historyDate && b.date !== historyDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = parseTransactionTimestamp(a);
        const timeB = parseTransactionTimestamp(b);
        if (timeB !== timeA) {
          return timeB - timeA; // Descending: most recent transaction first
        }
        return (b.id || '').localeCompare(a.id || '', undefined, { numeric: true });
      });
  }, [bills, historySearch, historyPaymentFilter, historyDate]);

  // Total amount of filtered bills
  const filteredBillsTotal = useMemo(() => {
    return filteredBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  }, [filteredBills]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Tab Bar: Matching image tabs navigation */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('pos')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'pos'
              ? 'gold-gradient-btn text-white shadow-lg'
              : 'bg-white text-[#646875] border border-[#EBE8DE] hover:bg-[#FAF9F5]'
            }`}
        >
          <ShoppingCart size={16} />
          POS Billing & Service Invoicing
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'history'
              ? 'gold-gradient-btn text-white shadow-lg'
              : 'bg-white text-[#646875] border border-[#EBE8DE] hover:bg-[#FAF9F5]'
            }`}
        >
          <History size={16} />
          Billing History
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: POS BILLING & SERVICE INVOICING                   */}
      {/* ======================================================== */}
      {activeTab === 'pos' && (
        <div className="space-y-5">
          {/* ---------------------------------------------------- */}
          {/* CARD 1: STEP 1 & 2: CUSTOMER & GENDER SELECTION      */}
          {/* ---------------------------------------------------- */}
          <div className="luxury-card !overflow-visible bg-white p-5 sm:p-6 rounded-2xl border border-[#EFECE1] shadow-sm relative z-30">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F0EBE0]">
              <UserCheck size={18} className="text-[#C59B27]" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#9E7814]">
                STEP 1 & 2: CUSTOMER & GENDER SELECTION
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Type or Select Customer */}
              <div className="md:col-span-5 relative">
                <label className="block text-xs font-bold text-[#646875] mb-1.5">
                  Type or Select Customer *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Name or Phone..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full h-[44px] pl-3.5 pr-10 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white text-[#18191B] font-medium"
                  />
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9499A8]" size={16} />
                </div>

                {/* Dropdown Options */}
                {showCustomerDropdown && (
                  <>
                    {/* Backdrop to close on click outside */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowCustomerDropdown(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border-2 border-[#D4AF37]/50 shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-[#F6F5F0]">
                      {/* Walk-in option */}
                      <div
                        onClick={handleSelectWalkIn}
                        className="p-3 hover:bg-[#FAF8F2] cursor-pointer flex items-center justify-between text-xs font-bold text-[#B58D20]"
                      >
                        <span className="flex items-center gap-1.5">
                          <UserCheck size={14} /> Walk-in Customer (Default)
                        </span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[#FAF6EA] border border-[#D4AF37]/30">Instant</span>
                      </div>

                      {/* Header for Registered Customers */}
                      <div className="px-3 py-1.5 bg-[#FAF9F5] text-[10px] uppercase font-bold text-[#9499A8] tracking-wider flex items-center justify-between">
                        <span>Already Registered Customers ({searchResults.length})</span>
                      </div>

                      {/* Registered customers list */}
                      {searchResults.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#9499A8]">
                          No registered customer matching "{customerSearch}"
                        </div>
                      ) : (
                        searchResults.map(cust => (
                          <div
                            key={cust.id}
                            onClick={() => handleSelectCustomer(cust)}
                            className="p-3 hover:bg-[#FAF8F2] cursor-pointer flex items-center justify-between transition-colors text-xs group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                                {cust.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-sm text-[#18191B] group-hover:text-[#9E7814] transition-colors">{cust.name}</p>
                                <p className="text-[11px] text-[#646875] font-mono">
                                  +91 {cust.phone} {cust.gender && cust.gender !== '-' ? `• ${cust.gender}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {cust.membershipPlan ? (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF3DE] text-[#B58D20] border border-[#D4AF37]/30">
                                  {cust.membershipPlan}
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#8C7A4A] bg-[#F4F1E8] px-2 py-0.5 rounded-full border border-[#E8E2D5]">
                                  Regular
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}

                      {/* Quick Register link */}
                      <div
                        onClick={() => {
                          setShowCustomerDropdown(false);
                          setIsQuickAddCustomerOpen(true);
                        }}
                        className="p-3 bg-[#FCFCFA] hover:bg-[#FAF6EA] cursor-pointer text-xs font-bold text-[#C59B27] flex items-center gap-1.5 sticky bottom-0 border-t border-[#F0EBE0]"
                      >
                        <UserPlus size={14} /> + Register New Customer
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Gender Dropdown */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-[#646875] mb-1.5">
                  Gender *
                </label>
                <div className="relative">
                  <select
                    value={customerGender}
                    onChange={(e) => setCustomerGender(e.target.value)}
                    className="w-full h-[44px] appearance-none px-3.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-sm font-semibold text-[#18191B] focus:outline-none focus:border-[#D4AF37] focus:bg-white cursor-pointer pr-10"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Unisex">Unisex / Other</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9499A8] pointer-events-none" size={16} />
                </div>
              </div>

              {/* ACTIVE CLIENT Preview Card */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-[#646875] mb-1.5 select-none opacity-0 hidden md:block">
                  Active Client
                </label>
                <div className="h-[44px] px-3.5 rounded-xl border border-[#EBE8DE] bg-[#FAF9F5] flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2 min-w-0">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#9E7814] block leading-none mb-0.5">
                        ACTIVE CLIENT
                      </span>
                      <p className="font-extrabold text-xs sm:text-sm text-[#18191B] truncate max-w-[140px] leading-tight">
                        {selectedCustomer.name}
                      </p>
                    </div>
                    {selectedCustomer.membershipPlan && (
                      <span className="hidden sm:inline-flex text-[10px] font-bold text-[#10B981] items-center gap-0.5">
                        <Crown size={11} /> {customerDiscountPercent}% off
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-[#9E7814] border border-[#D4AF37]/50 shadow-xs">
                      {customerGender}
                    </span>
                    {!selectedCustomer.isWalkIn && (
                      <button
                        type="button"
                        onClick={handleSelectWalkIn}
                        className="text-[#9499A8] hover:text-red-500 p-0.5"
                        title="Reset to Walk-in"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* CARD 2: STEP 3 & 4: CATEGORY & SERVICE SELECTION     */}
          {/* ---------------------------------------------------- */}
          <div className="luxury-card !overflow-visible bg-white p-5 sm:p-6 rounded-2xl border border-[#EFECE1] shadow-sm relative z-20">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#F0EBE0]">
              <Scissors size={18} className="text-[#C59B27]" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#9E7814]">
                STEP 3 & 4: CATEGORY & SERVICE SELECTION
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* Category Dropdown */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-[#646875] mb-1.5">
                  Category *
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedServiceId('');
                    }}
                    className="w-full h-[44px] appearance-none px-3.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-sm font-medium text-[#18191B] focus:outline-none focus:border-[#D4AF37] focus:bg-white cursor-pointer pr-10"
                  >
                    <option value="">-- Select Category --</option>
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9499A8] pointer-events-none" size={16} />
                </div>
              </div>

              {/* Service Dropdown */}
              <div className="md:col-span-4">
                <label className="block text-xs font-bold text-[#646875] mb-1.5">
                  Service *
                </label>
                <div className="relative">
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    disabled={!selectedCategory}
                    className="w-full h-[44px] appearance-none px-3.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-sm font-medium text-[#18191B] focus:outline-none focus:border-[#D4AF37] focus:bg-white cursor-pointer pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Choose Service --</option>
                    {filteredServices.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (₹{s.price})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9499A8] pointer-events-none" size={16} />
                </div>
              </div>

              {/* Action Buttons: Add Service to Table & + Add Product */}
              <div className="md:col-span-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddServiceToTable}
                  disabled={!selectedServiceId}
                  className="flex-1 h-[44px] gold-gradient-btn px-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Plus size={15} /> Add Service to Table
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddProductModal}
                  className="h-[44px] px-4 rounded-xl text-xs font-bold bg-[#181A20] hover:bg-[#252830] text-white shadow-md flex items-center gap-1.5 transition-all shrink-0 border border-[#D4AF37]/30"
                >
                  <Package size={15} className="text-[#D4AF37]" /> + Add Product
                </button>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* CARD 3: BILLING LINE ITEMS TABLE                     */}
          {/* ---------------------------------------------------- */}
          <div className="luxury-card bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#F0EBE0] bg-[#FCFCFA]">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#C59B27]" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#9E7814]">
                  BILLING LINE ITEMS TABLE (SERVICES & PRODUCTS)
                </h3>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF6EA] text-[#B58D20] border border-[#D4AF37]/30">
                {calculatedTable.length} line item(s)
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F2] text-[#646875] border-b border-[#EBE8DE] text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3 px-3 text-center">S.No</th>
                    <th className="py-3 px-3 min-w-[200px]">Item Description (Service / Product)</th>
                    <th className="py-3 px-3 text-right">MRP</th>
                    <th className="py-3 px-3 text-right">Gross Amount</th>
                    <th className="py-3 px-3 text-center min-w-[90px]">Qty</th>
                    <th className="py-3 px-3 text-right">Gross x Qty</th>
                    <th className="py-3 px-3 text-center min-w-[80px]">Discount (%)</th>
                    <th className="py-3 px-3 text-right">Discount Amount</th>
                    <th className="py-3 px-3 text-right font-black">Net Amount</th>
                    <th className="py-3 px-3 text-center min-w-[85px]">Tax (%)</th>
                    <th className="py-3 px-3 min-w-[180px]">Employee (Stylist / Seller) Multi-Select *</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F0EBE0]">
                  {calculatedTable.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-[#9499A8]">
                        <p className="text-sm font-semibold">No line items in billing table</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Select a Category & Service above or click "+ Add Product" to begin building the invoice.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    calculatedTable.map((item) => (
                      <tr key={item.lineId} className="hover:bg-[#FAF9F5] transition-colors">
                        {/* 1. S.No */}
                        <td className="py-3 px-3 text-center font-bold text-[#646875]">
                          {item.sNo}
                        </td>

                        {/* 2. Item Description */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${item.type === 'Service'
                                  ? 'bg-[#FAF6EA] text-[#B58D20] border-[#D4AF37]/40'
                                  : 'bg-[#EFF6FF] text-[#2563EB] border-[#93C5FD]'
                                }`}
                            >
                              {item.type}
                            </span>
                            <span className="font-bold text-sm text-[#18191B]">{item.description}</span>
                          </div>
                        </td>

                        {/* 3. MRP */}
                        <td className="py-3 px-3 text-right font-mono font-medium text-[#646875]">
                          ₹{item.mrp.toLocaleString()}
                        </td>

                        {/* 4. Gross Amount */}
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#18191B]">
                          ₹{item.grossAmount.toLocaleString()}
                        </td>

                        {/* 5. Qty (stepper) */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center border border-[#EBE8DE] rounded-lg bg-white overflow-hidden shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateLineItem(item.lineId, { qty: Math.max(1, item.qty - 1) })}
                              className="px-2 py-0.5 text-xs font-bold hover:bg-[#FAF6EA] text-[#646875]"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateLineItem(item.lineId, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                              className="w-10 text-center font-mono font-bold text-xs focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateLineItem(item.lineId, { qty: item.qty + 1 })}
                              className="px-2 py-0.5 text-xs font-bold hover:bg-[#FAF6EA] text-[#646875]"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* 6. Gross x Qty */}
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#18191B]">
                          ₹{item.grossXQty.toLocaleString()}
                        </td>

                        {/* 7. Discount (%) Input */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={(e) =>
                                updateLineItem(item.lineId, {
                                  discountPercent: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                                })
                              }
                              className="w-14 px-2 py-1 text-center font-mono text-xs border border-[#EBE8DE] rounded-lg bg-white focus:outline-none focus:border-[#D4AF37]"
                            />
                            <span className="ml-1 text-[11px] text-[#9499A8]">%</span>
                          </div>
                        </td>

                        {/* 8. Discount Amount */}
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#EF4444]">
                          -₹{item.discountAmount.toLocaleString()}
                        </td>

                        {/* 9. Net Amount */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#18191B]">
                          ₹{item.netAmount.toLocaleString()}
                        </td>

                        {/* 10. Tax (%) Dropdown */}
                        <td className="py-3 px-3 text-center">
                          <select
                            value={item.taxPercent}
                            onChange={(e) =>
                              updateLineItem(item.lineId, { taxPercent: parseFloat(e.target.value) || 0 })
                            }
                            className="px-2 py-1 bg-white border border-[#EBE8DE] rounded-lg text-xs font-mono focus:border-[#D4AF37] cursor-pointer"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                          </select>
                        </td>

                        {/* 11. Employee (Stylist / Seller) Multi-Select * */}
                        <td className="py-3 px-3 relative">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.employeeNames?.map((name, eIdx) => (
                              <span
                                key={eIdx}
                                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FAF6EA] text-[#9E7814] border border-[#D4AF37]/30"
                              >
                                {name}
                                {item.employeeNames.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const emp = employees.find(e => e.name === name);
                                      if (emp) toggleEmployeeAssignment(item.lineId, emp);
                                    }}
                                    className="hover:text-red-500"
                                  >
                                    &times;
                                  </button>
                                )}
                              </span>
                            ))}

                            {/* Dropdown toggle to add more stylists */}
                            <button
                              type="button"
                              onClick={() =>
                                setOpenStylistPickerRow(openStylistPickerRow === item.lineId ? null : item.lineId)
                              }
                              className="px-2 py-0.5 rounded-md border border-dashed border-[#D4AF37] text-[10px] font-bold text-[#B58D20] hover:bg-[#FAF6EA] flex items-center gap-0.5"
                            >
                              <Plus size={10} /> Stylist
                            </button>
                          </div>

                          {/* Multi-Select Floating Dropdown */}
                          {openStylistPickerRow === item.lineId && (
                            <div className="absolute top-full left-3 mt-1 w-56 bg-white rounded-xl border border-[#D4AF37]/50 shadow-2xl z-50 p-2 divide-y divide-[#F6F5F0]">
                              <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#9499A8]">
                                Select Stylists (Multi-Select)
                              </div>
                              <div className="max-h-40 overflow-y-auto pt-1 space-y-1">
                                {employees.map(emp => {
                                  const isSelected = item.employeeIds?.includes(emp.id);
                                  return (
                                    <div
                                      key={emp.id}
                                      onClick={() => toggleEmployeeAssignment(item.lineId, emp)}
                                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-[#FAF6EA] text-[#9E7814]' : 'hover:bg-[#FAF9F5] text-[#18191B]'
                                        }`}
                                    >
                                      <span>{emp.name}</span>
                                      {isSelected && <CheckCircle2 size={13} className="text-[#C59B27]" />}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="pt-1 text-right">
                                <button
                                  type="button"
                                  onClick={() => setOpenStylistPickerRow(null)}
                                  className="text-[10px] font-bold text-[#C59B27] hover:underline"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* 12. Action */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.lineId)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Remove line item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SECTION 4: SETTLEMENT, TOTALS & PAYMENT PANEL        */}
          {/* ---------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Payment Mode & UPI Controls */}
            <div className="lg:col-span-7 luxury-card bg-white p-5 sm:p-6 rounded-2xl border border-[#EFECE1] shadow-sm space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-[#9E7814]">
                Payment Mode & Settle
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${paymentMethod === 'UPI'
                      ? 'border-[#D4AF37] bg-[#FAF6EA] text-[#B58D20] shadow-sm font-bold'
                      : 'border-[#EBE8DE] text-[#646875] hover:bg-[#FAF9F5]'
                    }`}
                >
                  <QrCode size={20} />
                  <span className="text-xs">UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${paymentMethod === 'Cash'
                      ? 'border-[#D4AF37] bg-[#FAF6EA] text-[#B58D20] shadow-sm font-bold'
                      : 'border-[#EBE8DE] text-[#646875] hover:bg-[#FAF9F5]'
                    }`}
                >
                  <Receipt size={20} />
                  <span className="text-xs">Cash Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${paymentMethod === 'Card'
                      ? 'border-[#D4AF37] bg-[#FAF6EA] text-[#B58D20] shadow-sm font-bold'
                      : 'border-[#EBE8DE] text-[#646875] hover:bg-[#FAF9F5]'
                    }`}
                >
                  <CreditCard size={20} />
                  <span className="text-xs">Debit / Credit Card</span>
                </button>
              </div>

              {/* UPI QR trigger & reference */}
              {paymentMethod === 'UPI' && (
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#646875]">Salon QR Scanner:</span>
                    <button
                      type="button"
                      onClick={() => setIsUpiQrModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg border border-[#D4AF37] bg-white text-xs font-bold text-[#9E7814] hover:bg-[#FAF6EA] flex items-center gap-1 shadow-xs"
                    >
                      <QrCode size={13} /> View QR Code
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter UPI Reference / UTR Number (Optional)"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-[#EBE8DE] text-xs font-mono"
                  />
                </div>
              )}

              {/* Bill Notes */}
              <div>
                <label className="block text-xs font-bold text-[#646875] uppercase tracking-wider mb-1.5">
                  Billing Remarks &amp; Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Special treatment notes or customer preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>
            </div>

            {/* Calculations Summary Box */}
            <div className="lg:col-span-5 luxury-card bg-white p-5 sm:p-6 rounded-2xl border-2 border-[#D4AF37]/50 shadow-xl space-y-3">
              <h4 className="font-bold text-sm uppercase tracking-wider text-[#9E7814] pb-2 border-b border-[#F0EBE0]">
                Invoice Summary
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#646875]">
                  <span>Total Gross (MRP x Qty)</span>
                  <span className="font-mono font-semibold text-[#18191B]">₹{totalGross.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-[#EF4444] font-semibold">
                  <span>Line Items Discount</span>
                  <span className="font-mono">- ₹{totalItemDiscount.toLocaleString()}</span>
                </div>

                {/* Additional Manual Discount input */}
                <div className="flex items-center justify-between pt-1 border-t border-[#F0EBE0]">
                  <span className="text-[#646875]">Additional Discount (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={manualDiscount}
                    onChange={(e) => setManualDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-20 px-2 py-1 text-right rounded border border-[#EBE8DE] text-xs font-mono"
                  />
                </div>

                <div className="flex justify-between text-[#646875]">
                  <span>Net Taxable Value</span>
                  <span className="font-mono font-semibold text-[#18191B]">₹{totalNet.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-[#10B981] font-semibold">
                  <span>Total GST / Tax</span>
                  <span className="font-mono">+ ₹{totalTax.toLocaleString()}</span>
                </div>

                {/* Grand Total */}
                <div className="pt-3 border-t-2 border-dashed border-[#D4AF37]/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#9499A8] block">Grand Total Payable</span>
                    <span className="text-xs text-[#10B981] font-bold">All Taxes Included</span>
                  </div>
                  <span className="font-mono font-black text-2xl text-[#B58D20]">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Reset & Proceed to Payment */}
              <div className="pt-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reset all items and start new bill?')) {
                        setLineItems([]);
                        setNotes('');
                        setManualDiscount(0);
                      }
                    }}
                    className="px-4 py-3.5 rounded-xl border border-[#EBE8DE] bg-white hover:bg-[#FAF9F5] text-[#646875] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <RotateCcw size={14} /> Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="flex-1 gold-gradient-btn py-3.5 rounded-xl text-sm font-bold text-white shadow-xl flex items-center justify-center gap-2 hover:shadow-2xl transition-all"
                  >
                    <CreditCard size={18} /> Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BILLING HISTORY                                   */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* History Header & Search Filter */}
          <div className="luxury-card bg-white p-5 rounded-2xl border border-[#EFECE1] shadow-sm space-y-3.5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search by Bill #, Customer Name, Phone */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9499A8]" size={16} />
                <input
                  type="text"
                  placeholder="Search by Bill #, Customer Name, Phone..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Filters Group: Calendar Date Filter & Payment Filter */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Calendar Date Filter (User Request: Admin chooses particular date) */}
                <div
                  onClick={(e) => {
                    if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                      const input = document.getElementById('billing-history-calendar-picker');
                      if (input && typeof input.showPicker === 'function') {
                        try {
                          input.showPicker();
                        } catch {
                          input.focus();
                        }
                      }
                    }
                  }}
                  className="flex items-center gap-2 bg-[#FCFCFA] border border-[#EBE8DE] hover:border-[#D4AF37] focus-within:border-[#D4AF37] transition-all rounded-xl px-3 py-2 shadow-2xs cursor-pointer"
                  title="Click to choose a particular date"
                >
                  <Calendar size={16} className="text-[#C59B27] shrink-0" />
                  <span className="text-xs font-bold text-[#646875]">Date:</span>
                  <input
                    id="billing-history-calendar-picker"
                    type="date"
                    value={historyDate}
                    onChange={(e) => setHistoryDate(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-[#18191B] focus:outline-none cursor-pointer"
                  />
                  {historyDate && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistoryDate('');
                      }}
                      title="Clear date (Show all)"
                      className="p-1 rounded-md text-[#8C909D] hover:text-[#18191B] hover:bg-[#EAE6D8] transition-colors ml-1"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Payment Filter */}
                <div className="flex items-center gap-1.5 bg-[#FCFCFA] border border-[#EBE8DE] rounded-xl px-3 py-2 shadow-2xs">
                  <span className="text-xs font-bold text-[#646875]">Payment:</span>
                  <select
                    value={historyPaymentFilter}
                    onChange={(e) => setHistoryPaymentFilter(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-[#18191B] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Modes</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Summary & Total Count / Revenue Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0EBE0] text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#646875] font-medium">Invoices:</span>
                <span className="font-bold text-[#18191B] bg-[#FAF8F2] border border-[#E8E4D5] px-2.5 py-0.5 rounded-lg">
                  {filteredBills.length} Bill{filteredBills.length === 1 ? '' : 's'}
                </span>

                {historyDate && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg font-bold bg-amber-50 text-amber-900 border border-amber-300">
                    <Calendar size={12} className="text-amber-700" />
                    <span>Date: {historyDate}</span>
                    <button
                      type="button"
                      onClick={() => setHistoryDate('')}
                      className="ml-0.5 hover:text-amber-950 p-0.5 rounded hover:bg-amber-200/50"
                      title="Clear date filter"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}

                {historyPaymentFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold bg-blue-50 text-blue-900 border border-blue-200">
                    <span>{historyPaymentFilter}</span>
                    <button
                      type="button"
                      onClick={() => setHistoryPaymentFilter('all')}
                      className="ml-1 hover:text-blue-950"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>

              {/* Total Filtered Revenue */}
              <div className="flex items-center gap-2">
                <span className="text-[#646875] font-medium">Filtered Total:</span>
                <span className="font-mono font-extrabold text-[#18191B] text-sm">
                  ₹{filteredBillsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Bills Table */}
          <div className="luxury-card bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F2] text-[#646875] border-b border-[#EBE8DE] text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Services / Products</th>
                    <th className="py-3 px-4">Stylist</th>
                    <th className="py-3 px-4 text-center">Payment</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F0EBE0]">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#9499A8]">
                        <Calendar size={28} className="mx-auto mb-2 text-[#C59B27]/40" />
                        <p className="font-medium text-sm text-[#484A54]">No billing records found</p>
                        <p className="text-xs text-[#9499A8] mt-1">
                          {historyDate ? `No bills found for ${historyDate}.` : 'No bills match your current filter criteria.'}
                        </p>
                        {(historyDate || historySearch || historyPaymentFilter !== 'all') && (
                          <button
                            type="button"
                            onClick={() => {
                              setHistoryDate('');
                              setHistorySearch('');
                              setHistoryPaymentFilter('all');
                            }}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF8F2] border border-[#D4AF37]/40 rounded-xl text-xs font-bold text-[#8A6D1B] hover:bg-[#F3EEDD] transition-colors"
                          >
                            Reset All Filters
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-[#FAF9F5] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#B58D20]">
                          {bill.id}
                        </td>
                        <td className="py-3.5 px-4 text-[#646875]">
                          <div>{bill.date}</div>
                          <div className="text-[10px] text-[#9499A8]">{bill.time || '12:00 PM'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-sm text-[#18191B]">{bill.customerName}</p>
                          <p className="text-[11px] text-[#646875] font-mono">+91 {bill.customerPhone}</p>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-medium text-[#18191B] truncate">
                            {bill.services?.map(s => s.name).join(', ') || 'Salon Services'}
                          </p>
                          {bill.products?.length > 0 && (
                            <p className="text-[10px] text-[#2563EB]">
                              + {bill.products.length} Retail Product(s)
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#646875]">
                          {bill.employeeName || bill.services?.[0]?.employeeName || 'Staff'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${bill.paymentMethod === 'UPI'
                                ? 'bg-[#EFF6FF] text-[#2563EB] border-[#93C5FD]'
                                : 'bg-[#FAF6EA] text-[#B58D20] border-[#D4AF37]/30'
                              }`}
                          >
                            {bill.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#18191B]">
                          ₹{bill.totalAmount?.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setGeneratedInvoiceBill(bill)}
                            className="px-3 py-1.5 rounded-lg border border-[#D4AF37] bg-white text-xs font-bold text-[#9E7814] hover:bg-[#FAF6EA] inline-flex items-center gap-1 shadow-xs"
                          >
                            <Printer size={13} /> View Invoice
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD SALON RETAIL PRODUCT TO BILL (Matching Screenshot) */}
      {/* ======================================================== */}
      {isAddProductModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all my-8 p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-emerald-600" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Add Salon Retail Product to Bill
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-slate-800 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Product *
                </label>

                {/* Selected Product Header Box */}
                <div className="px-3.5 py-2.5 rounded-xl border border-pink-100/90 bg-white flex items-center justify-between shadow-xs">
                  <span className="text-sm font-semibold text-slate-800">
                    {selectedModalProduct?.name || 'Select a Product...'}
                  </span>
                  <ChevronDown size={16} className="text-slate-400" />
                </div>

                {/* Product List without image, clean fields and features */}
                <div className="rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {products.map((prd) => {
                    const isSelected = selectedModalProduct?.id === prd.id;
                    return (
                      <div
                        key={prd.id}
                        onClick={() => setSelectedModalProduct(prd)}
                        className={`p-3 cursor-pointer flex items-center justify-between transition-colors text-xs ${
                          isSelected
                            ? 'bg-cyan-50/70'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {isSelected ? (
                            <CheckSquare size={16} className="text-cyan-600 shrink-0" />
                          ) : (
                            <Square size={16} className="text-gray-300 shrink-0" />
                          )}
                          <span className={`text-sm truncate ${isSelected ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {prd.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-right">
                          <span className="font-semibold text-slate-900">
                            Selling: ₹{Number(prd.price).toFixed(2)}
                          </span>
                          <span className="text-gray-400 text-[11px]">
                            (Stock: {prd.stock})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quantity Control */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-700">
                    Quantity:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalProductQty(prev => Math.max(prev - 1, 1))}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-slate-700 hover:bg-gray-100 transition-colors shadow-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-slate-900 font-mono">
                      {modalProductQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalProductQty(prev => Math.min(prev + 1, selectedModalProduct?.stock || 99))}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-slate-700 hover:bg-gray-100 transition-colors shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddProductModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedModalProduct || selectedModalProduct.stock <= 0}
                    onClick={() => {
                      if (selectedModalProduct) {
                        handleAddProductToTable(selectedModalProduct, modalProductQty);
                        setIsAddProductModalOpen(false);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Add to Bill
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* MODAL: QUICK ADD NEW CUSTOMER (Matching Screenshot)      */}
      {/* ======================================================== */}
      {isQuickAddCustomerOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all my-8">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus size={18} className="text-[#FF3377]" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Quick Add New Customer
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickAddCustomerOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-slate-800 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleQuickAddCustomer} className="p-6 space-y-4">
                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. kumara"
                      value={newCustomerForm.firstName}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-[#FF3377] focus:ring-2 focus:ring-[#FF3377]/20 shadow-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. samy"
                      value={newCustomerForm.lastName}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-[#FF3377] focus:ring-2 focus:ring-[#FF3377]/20 shadow-xs transition-all"
                    />
                  </div>
                </div>

                {/* Row 2: Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-[#FF3377] focus:ring-2 focus:ring-[#FF3377]/20 shadow-xs transition-all"
                  />
                </div>

                {/* Row 3: Gender & Date of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender *
                    </label>
                    <select
                      value={newCustomerForm.gender}
                      onChange={(e) => setNewCustomerForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-[#FF3377] bg-white shadow-xs cursor-pointer"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newCustomerForm.dob}
                        onChange={(e) => setNewCustomerForm(prev => ({ ...prev, dob: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-700 focus:outline-none focus:border-[#FF3377] bg-white shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 4: Email (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. jobsparke@gmail.com"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-900 focus:outline-none focus:border-[#FF3377] focus:ring-2 focus:ring-[#FF3377]/20 shadow-xs transition-all"
                  />
                </div>

                {/* Row 5: Add Membership Plan (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Add Membership Plan (Optional)
                  </label>
                  <select
                    value={newCustomerForm.membershipPlan}
                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, membershipPlan: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-slate-800 focus:outline-none focus:border-[#FF3377] bg-white shadow-xs cursor-pointer"
                  >
                    <option value="">-- No Membership / Normal Customer --</option>
                    {memberships.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.discountPercentage}% OFF - ₹{m.price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddCustomerOpen(false)}
                    className="px-6 py-2.5 rounded-2xl text-sm font-semibold text-slate-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#FF3377] hover:bg-[#E62865] text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Save &amp; Select Customer
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* MODAL: SPLIT MULTI-PAYMENT SETTLEMENT                   */}
      {/* ======================================================== */}
      {isSplitPaymentModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-white">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Split Multi-Payment Settlement
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select one or multiple payment channels &amp; enter amounts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSplitPaymentModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
                {/* Net Due & Total Allocated Box */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Net Payable Due:
                    </span>
                    <span className="text-2xl font-black font-mono text-slate-900 mt-0.5 block">
                      ₹ {grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Total Allocated:
                    </span>
                    <span
                      className={`text-2xl font-black font-mono mt-0.5 block ${
                        isAllocationMatching ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      ₹ {totalAllocated.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Allocation Status Indicator */}
                {!isAllocationMatching && (
                  <div
                    className={`px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      allocationDiff > 0
                        ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                        : 'bg-red-50/80 border-red-200 text-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>
                        {allocationDiff > 0 ? (
                          <>
                            Remaining amount to allocate: <strong>₹{allocationDiff.toFixed(2)}</strong>
                          </>
                        ) : (
                          <>
                            Over-allocated by: <strong>₹{Math.abs(allocationDiff).toFixed(2)}</strong>. Please adjust amounts.
                          </>
                        )}
                      </span>
                    </div>

                    {allocationDiff > 0 && selectedPaymentChannels.length > 0 && (
                      <button
                        type="button"
                        onClick={handleAutoAllocateRemaining}
                        className="text-[11px] font-bold underline hover:opacity-80 shrink-0 ml-2"
                      >
                        Allocate Remaining
                      </button>
                    )}
                  </div>
                )}

                {/* Select Payment Methods Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2.5">
                    Select Payment Methods:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PAYMENT_CHANNELS.map((channel) => {
                      const isSelected = selectedPaymentChannels.includes(channel.id);
                      const Icon = channel.icon;
                      return (
                        <div
                          key={channel.id}
                          onClick={() => handleTogglePaymentChannel(channel.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between select-none ${
                            isSelected
                              ? 'border-slate-800 bg-slate-50/80 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`p-1.5 rounded-lg ${
                                isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Icon size={16} />
                            </div>
                            <span
                              className={`text-xs font-semibold ${
                                isSelected ? 'text-slate-900 font-bold' : 'text-slate-700'
                              }`}
                            >
                              {channel.name}
                            </span>
                          </div>

                          <div className="text-slate-400">
                            {isSelected ? (
                              <CheckSquare size={18} className="text-slate-900" />
                            ) : (
                              <Square size={18} className="text-slate-300" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Enter Allocated Payment Amounts */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2.5">
                    Enter Allocated Payment Amounts:
                  </h4>
                  <div className="space-y-2.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                    {selectedPaymentChannels.map((chId) => {
                      const channel = PAYMENT_CHANNELS.find((c) => c.id === chId);
                      const Icon = channel?.icon || CreditCard;
                      const currentVal = channelAmounts[chId] !== undefined ? channelAmounts[chId] : '';

                      return (
                        <div
                          key={chId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={14} className="text-slate-500" />
                            <span className="text-xs font-semibold text-slate-700">
                              {channel?.name || chId} Amount (₹):
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative w-full sm:w-48">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                                ₹
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={currentVal}
                                onChange={(e) => handleChannelAmountChange(chId, e.target.value)}
                                className="w-full pl-7 pr-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-mono font-bold text-right text-slate-900 focus:outline-none focus:border-slate-800"
                                placeholder="0.00"
                              />
                            </div>

                            {selectedPaymentChannels.length > 1 && (
                              <button
                                type="button"
                                title="Allocate full balance to this method"
                                onClick={() => handleSetFullChannelAmount(chId)}
                                className="px-2 py-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 shrink-0"
                              >
                                Full
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSplitPaymentModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!isAllocationMatching || grandTotal <= 0}
                  onClick={handleConfirmSplitSettlement}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                    isAllocationMatching && grandTotal > 0
                      ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 size={15} />
                  Confirm Settlement &amp; Complete Bill
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* MODAL: UPI QR SCANNER                                    */}
      {/* ======================================================== */}
      <Modal
        isOpen={isUpiQrModalOpen}
        onClose={() => setIsUpiQrModalOpen(false)}
        title="Salon UPI QR Code"
        subtitle={`Scan to pay ₹${grandTotal.toLocaleString()}`}
        maxWidth="max-w-md"
      >
        <div className="text-center p-4">
          <div className="inline-block p-4 bg-white rounded-2xl border-2 border-[#D4AF37] shadow-xl">
            <div className="w-52 h-52 bg-[#FAF9F5] border border-[#EBE8DE] rounded-xl flex flex-col items-center justify-center p-3">
              <QrCode size={160} className="text-[#18191B]" />
            </div>
            <p className="mt-2 text-xs font-bold text-[#18191B]">UPI ID: phoenixsaloon@okhdfcbank</p>
            <p className="text-[11px] text-[#9E7814] font-semibold mt-0.5">Payable: ₹{grandTotal.toLocaleString()}</p>
          </div>
          <p className="text-xs text-[#646875] mt-4">
            Once customer scans with GPay/PhonePe/Paytm and completes payment, confirm below.
          </p>
          <button
            onClick={() => setIsUpiQrModalOpen(false)}
            className="mt-4 gold-gradient-btn px-6 py-2 rounded-xl text-xs font-bold"
          >
            Payment Confirmed
          </button>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: GENERATED INVOICE / PRINT RECEIPT                 */}
      {/* ======================================================== */}
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
