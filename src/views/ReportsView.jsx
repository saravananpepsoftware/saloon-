import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Package,
  UserCheck,
  Calendar,
  CreditCard,
  QrCode,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Download,
  ShoppingBag
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';
import Modal from '../components/Modal';
import InvoiceModal from '../components/InvoiceModal';

export default function ReportsView() {
  const {
    customers,
    products,
    employees,
    bills,
    attendanceLogs
  } = useSaloon();

  const [activeReportTab, setActiveReportTab] = useState('customers'); // 'customers' | 'products' | 'employees'

  // 1. Customer Report Filter State
  const [custSearchTerm, setCustSearchTerm] = useState('');
  const [custDateFilter, setCustDateFilter] = useState(''); // Specific date YYYY-MM-DD or '' for all
  const [custPaymentFilter, setCustPaymentFilter] = useState('all'); // 'all', 'UPI', 'Cash'
  const [selectedCustHistoryModal, setSelectedCustHistoryModal] = useState(null);

  // 2. Product Report State
  const [prodSearchTerm, setProdSearchTerm] = useState('');
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  // 3. Employee Report State
  const [empSearchTerm, setEmpSearchTerm] = useState('');
  const [empDateFilter, setEmpDateFilter] = useState(''); // Specific date filter

  // Invoice modal trigger
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState(null);

  // Today string
  const todayStr = new Date().toISOString().split('T')[0];

  // ==========================================
  // CUSTOMER REPORT LOGIC & FILTERING
  // ==========================================
  // Collect all customer history entries, filtering by date and payment mode
  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(custSearchTerm.toLowerCase()) ||
      c.phone.includes(custSearchTerm);
    return matchesSearch;
  });

  // Calculate customer report metrics
  let totalReportRevenue = 0;
  let totalUpiRevenue = 0;
  let totalCashRevenue = 0;

  bills.forEach(b => {
    const matchesDate = !custDateFilter || b.date === custDateFilter;
    const matchesPay = custPaymentFilter === 'all' || b.paymentMethod === custPaymentFilter;
    if (matchesDate && matchesPay) {
      totalReportRevenue += b.totalAmount || 0;
      if (b.paymentMethod === 'UPI') totalUpiRevenue += b.totalAmount || 0;
      if (b.paymentMethod === 'Cash') totalCashRevenue += b.totalAmount || 0;
    }
  });

  // ==========================================
  // PRODUCT REPORT LOGIC
  // ==========================================
  // For each product, extract every sale date, bill, qty and revenue from bills
  const productSaleStats = products.map(product => {
    let totalQtySold = 0;
    let totalRevenue = 0;
    const saleLogs = [];

    bills.forEach(bill => {
      bill.products?.forEach(p => {
        if (p.id === product.id || p.name === product.name) {
          const qty = p.quantity || 1;
          const rev = p.price * qty;
          totalQtySold += qty;
          totalRevenue += rev;
          saleLogs.push({
            billId: bill.id,
            date: bill.date,
            customerName: bill.customerName,
            customerPhone: bill.customerPhone,
            quantity: qty,
            price: p.price,
            total: rev,
            paymentMethod: bill.paymentMethod
          });
        }
      });
    });

    return {
      ...product,
      totalQtySold: Math.max(product.soldCount || 0, totalQtySold),
      totalRevenue: totalRevenue || (product.soldCount || 0) * product.price,
      saleLogs
    };
  });

  const filteredProducts = productSaleStats.filter(p =>
    p.name.toLowerCase().includes(prodSearchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(prodSearchTerm.toLowerCase())
  );

  // ==========================================
  // EMPLOYEE REPORT LOGIC & FILTERING
  // ==========================================
  const employeeReportStats = employees.map(emp => {
    // Attendance count
    const empLogs = attendanceLogs.filter(log => log.employeeId === emp.id);
    const presentLogs = empLogs.filter(log => log.status === 'Present');
    const totalPresentDays = emp.totalPresentDays || presentLogs.length || 1;

    // Daily attendance if date filter is set
    let isPresentOnFilteredDate = null;
    if (empDateFilter) {
      const log = empLogs.find(l => l.date === empDateFilter);
      isPresentOnFilteredDate = log ? log.status === 'Present' : false;
    }

    // Customer services performed by this employee
    const servicesServiced = [];
    bills.forEach(bill => {
      if (!empDateFilter || bill.date === empDateFilter) {
        bill.services?.forEach(s => {
          if (s.employeeId === emp.id || s.employeeName === emp.name || bill.employeeName === emp.name) {
            servicesServiced.push({
              billId: bill.id,
              date: bill.date,
              customerName: bill.customerName,
              serviceName: s.name,
              price: s.price,
              paymentMethod: bill.paymentMethod
            });
          }
        });
      }
    });

    return {
      ...emp,
      totalPresentDays,
      isPresentOnFilteredDate,
      servicesServiced,
      filteredServicedCount: servicesServiced.length
    };
  });

  const filteredEmployees = employeeReportStats.filter(emp =>
    emp.name.toLowerCase().includes(empSearchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(empSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
            Salon Analytics & Detailed Reports
          </h2>
          <p className="text-xs text-[#646875] mt-1">
            Comprehensive audit reports for Customers, Retail Products, and Employee Attendance & Services
          </p>
        </div>

        {/* 3 Report Tabs Switcher */}
        <div className="flex items-center p-1.5 rounded-2xl bg-[#F4F1E8] border border-[#EBE8DE]">
          <button
            onClick={() => setActiveReportTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeReportTab === 'customers'
                ? 'bg-white text-[#18191B] shadow-sm'
                : 'text-[#646875] hover:text-[#18191B]'
            }`}
          >
            <Users size={16} className={activeReportTab === 'customers' ? 'text-[#C59B27]' : ''} />
            Customer Report
          </button>

          <button
            onClick={() => setActiveReportTab('products')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeReportTab === 'products'
                ? 'bg-white text-[#18191B] shadow-sm'
                : 'text-[#646875] hover:text-[#18191B]'
            }`}
          >
            <Package size={16} className={activeReportTab === 'products' ? 'text-[#C59B27]' : ''} />
            Product Reports
          </button>

          <button
            onClick={() => setActiveReportTab('employees')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeReportTab === 'employees'
                ? 'bg-white text-[#18191B] shadow-sm'
                : 'text-[#646875] hover:text-[#18191B]'
            }`}
          >
            <UserCheck size={16} className={activeReportTab === 'employees' ? 'text-[#C59B27]' : ''} />
            Employee Reports
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. CUSTOMER REPORT VIEW */}
      {/* ========================================================= */}
      {activeReportTab === 'customers' && (
        <div className="space-y-6">
          {/* KPI Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="luxury-card p-5 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9499A8]">Total Report Sales</span>
              <p className="text-2xl font-black text-[#18191B] font-mono mt-1">₹{totalReportRevenue.toLocaleString()}</p>
              <span className="text-xs text-[#646875] mt-1 block">Based on selected filters</span>
            </div>

            <div className="luxury-card p-5 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">UPI Collections</span>
              <p className="text-2xl font-black text-[#2563EB] font-mono mt-1">₹{totalUpiRevenue.toLocaleString()}</p>
              <span className="text-xs text-[#646875] mt-1 block">Digital payments</span>
            </div>

            <div className="luxury-card p-5 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669]">Cash Collections</span>
              <p className="text-2xl font-black text-[#059669] font-mono mt-1">₹{totalCashRevenue.toLocaleString()}</p>
              <span className="text-xs text-[#646875] mt-1 block">Counter cash receipts</span>
            </div>
          </div>

          {/* Day-wise & UPI/Cash Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-[#EFECE1] shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search by Name/Phone */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9499A8]" size={16} />
              <input
                type="text"
                placeholder="Search client name/phone..."
                value={custSearchTerm}
                onChange={(e) => setCustSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
              />
            </div>

            {/* Day-wise Date Filter */}
            <div>
              <input
                type="date"
                value={custDateFilter}
                onChange={(e) => setCustDateFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37] text-[#18191B] font-medium"
              />
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setCustDateFilter(todayStr)}
                  className="text-[10px] text-[#C59B27] hover:underline font-bold"
                >
                  Today
                </button>
                <span className="text-[#D1CEBF]">•</span>
                <button
                  onClick={() => setCustDateFilter('')}
                  className="text-[10px] text-[#646875] hover:underline"
                >
                  All Dates
                </button>
              </div>
            </div>

            {/* UPI or Cash Filter */}
            <div>
              <select
                value={custPaymentFilter}
                onChange={(e) => setCustPaymentFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37] text-[#18191B] font-semibold"
              >
                <option value="all">All Payment Modes (UPI & Cash)</option>
                <option value="UPI">UPI Payments Only</option>
                <option value="Cash">Cash Payments Only</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  setCustSearchTerm('');
                  setCustDateFilter('');
                  setCustPaymentFilter('all');
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-[#EBE8DE] text-xs font-bold text-[#646875] hover:bg-[#FAF9F5] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Customer Report List */}
          <div className="space-y-4">
            {filteredCustomers.map((cust) => {
              // Filter visits for this customer by date and payment mode
              const matchingVisits = (cust.history || []).filter(h => {
                const matchesDate = !custDateFilter || h.date === custDateFilter;
                const matchesPay = custPaymentFilter === 'all' || h.paymentMethod === custPaymentFilter;
                return matchesDate && matchesPay;
              });

              // If date or pay filter is active and customer has no matching visits, skip unless searching by name
              if ((custDateFilter || custPaymentFilter !== 'all') && matchingVisits.length === 0) {
                return null;
              }

              return (
                <div
                  key={cust.id}
                  className="luxury-card bg-white p-5 rounded-2xl border border-[#EFECE1] shadow-sm"
                >
                  {/* Customer Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EBE0]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#181A20] text-white flex items-center justify-center font-bold font-mono">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-[#18191B]">{cust.name}</h4>
                          {cust.membershipPlan && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3DE] text-[#B58D20] border border-[#D4AF37]/30">
                              {cust.membershipPlan}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#646875] font-mono">+91 {cust.phone}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9499A8] block">
                        Matching Records
                      </span>
                      <span className="font-mono font-bold text-sm text-[#18191B]">
                        {matchingVisits.length} Visits
                      </span>
                    </div>
                  </div>

                  {/* History of Services, Stylist, Products, Payment Mode & Date */}
                  <div className="mt-3 space-y-2">
                    {matchingVisits.length === 0 ? (
                      <p className="text-xs text-[#9499A8] py-2">No visits matching current filter.</p>
                    ) : (
                      matchingVisits.map((visit, vIdx) => (
                        <div
                          key={`visit-${vIdx}`}
                          className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-[#18191B]">
                                {visit.services?.join(', ') || 'Salon Service'}
                              </span>
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#EBE8DE] text-[#646875]">
                                {visit.billId}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#646875]">
                              <span className="text-[#9E7814] font-semibold">
                                Stylist: {visit.employeeName || 'Staff'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono">
                                <Calendar size={12} /> {visit.date}
                              </span>
                              {visit.products?.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#18191B] font-medium">
                                    Products: {visit.products.map(p => `${p.name} (₹${p.price})`).join(', ')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                visit.paymentMethod === 'UPI'
                                  ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
                                  : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                              }`}
                            >
                              {visit.paymentMethod}
                            </span>
                            <span className="font-mono font-bold text-sm text-[#18191B]">
                              ₹{visit.amount}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PRODUCT REPORTS VIEW */}
      {/* ========================================================= */}
      {activeReportTab === 'products' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EFECE1]">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9499A8]" size={16} />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={prodSearchTerm}
                onChange={(e) => setProdSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
              />
            </div>
            <div className="text-xs text-[#646875]">
              Total Products: <span className="font-bold text-[#18191B]">{products.length}</span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="luxury-card bg-white border border-[#EFECE1] rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#FAF9F5] border-b border-[#EFECE1]">
                    <img
                      src={prod.image || '/images/products/argan_hair_oil.jpg'}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50" />

                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#18191B] border border-[#D4AF37]/40 shadow-sm">
                        {prod.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md border ${
                          prod.stock > 10
                            ? 'bg-[#10B981]/90 text-white border-[#10B981]/40'
                            : 'bg-[#EF4444]/90 text-white border-[#EF4444]/40'
                        }`}
                      >
                        Stock: {prod.stock}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 pb-0">
                    <h4 className="font-bold text-base text-[#18191B] group-hover:text-[#C59B27] transition-colors leading-snug">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-[#646875] mt-1 font-mono">Retail Price: ₹{prod.price}</p>
                  </div>

                  {/* Sales Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#F0EBE0] text-center">
                    <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EFECE1]">
                      <span className="text-[10px] uppercase font-bold text-[#9499A8] block">Units Sold</span>
                      <span className="font-mono font-bold text-lg text-[#18191B]">{prod.totalQtySold}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EFECE1]">
                      <span className="text-[10px] uppercase font-bold text-[#9499A8] block">Revenue</span>
                      <span className="font-mono font-bold text-lg text-[#B58D20]">
                        ₹{prod.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Details Button as requested by user */}
                <div className="mt-4 pt-3 border-t border-[#F0EBE0]">
                  <button
                    onClick={() => setSelectedProductDetails(prod)}
                    className="w-full py-2 rounded-xl border border-[#D4AF37] text-[#9E7814] hover:bg-[#FAF6EA] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} />
                    View Details & Sale Dates ({prod.saleLogs.length})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. EMPLOYEE REPORTS VIEW */}
      {/* ========================================================= */}
      {activeReportTab === 'employees' && (
        <div className="space-y-6">
          {/* Day-wise & Name-wise Filter Bar as requested */}
          <div className="bg-white p-5 rounded-2xl border border-[#EFECE1] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name filter */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9499A8]" size={16} />
              <input
                type="text"
                placeholder="Filter by employee name..."
                value={empSearchTerm}
                onChange={(e) => setEmpSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
              />
            </div>

            {/* Day-wise Date Filter */}
            <div>
              <input
                type="date"
                value={empDateFilter}
                onChange={(e) => setEmpDateFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37] text-[#18191B] font-medium"
              />
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setEmpDateFilter(todayStr)}
                  className="text-[10px] text-[#C59B27] hover:underline font-bold"
                >
                  Today
                </button>
                <span className="text-[#D1CEBF]">•</span>
                <button
                  onClick={() => setEmpDateFilter('')}
                  className="text-[10px] text-[#646875] hover:underline"
                >
                  All-time Attendance
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  setEmpSearchTerm('');
                  setEmpDateFilter('');
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-[#EBE8DE] text-xs font-bold text-[#646875] hover:bg-[#FAF9F5]"
              >
                Reset Employee Filters
              </button>
            </div>
          </div>

          {/* Employee Report Table & Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="luxury-card bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Top Profile info */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE0]">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-[#D4AF37]/30"
                      />
                      <div>
                        <h4 className="font-bold text-base text-[#18191B]">{emp.name}</h4>
                        <p className="text-xs text-[#B58D20] font-semibold">{emp.department}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {empDateFilter ? (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            emp.isPresentOnFilteredDate
                              ? 'bg-[#ECFDF5] text-[#10B981]'
                              : 'bg-[#FEF2F2] text-[#EF4444]'
                          }`}
                        >
                          {emp.isPresentOnFilteredDate ? 'Present' : 'Absent'} on Date
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            emp.presentToday
                              ? 'bg-[#ECFDF5] text-[#10B981]'
                              : 'bg-[#FEF2F2] text-[#EF4444]'
                          }`}
                        >
                          Today: {emp.presentToday ? 'Present' : 'Absent'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Attendance & Serviced Counts */}
                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] text-center">
                      <span className="text-[10px] uppercase font-bold text-[#9499A8] block">Days Present</span>
                      <span className="font-mono font-bold text-xl text-[#10B981]">
                        {emp.totalPresentDays} Days
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] text-center">
                      <span className="text-[10px] uppercase font-bold text-[#9499A8] block">Customers Serviced</span>
                      <span className="font-mono font-bold text-xl text-[#C59B27]">
                        {emp.servicesServiced.length || emp.totalServiced || 0}
                      </span>
                    </div>
                  </div>

                  {/* List of services performed */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] uppercase font-bold text-[#9499A8] block">
                      Recent Clients Serviced:
                    </span>
                    {emp.servicesServiced.length === 0 ? (
                      <p className="text-xs text-[#9499A8] italic">No services in this date range.</p>
                    ) : (
                      emp.servicesServiced.slice(0, 3).map((s, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#FCFCFA] border border-[#EFECE1] flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-[#18191B]">{s.serviceName}</p>
                            <p className="text-[10px] text-[#646875]">{s.customerName} • {s.date}</p>
                          </div>
                          <span className="font-mono font-bold text-[#18191B]">₹{s.price}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Product Sale Details Drawer */}
      {selectedProductDetails && (
        <Modal
          isOpen={Boolean(selectedProductDetails)}
          onClose={() => setSelectedProductDetails(null)}
          title={`Sales Log: ${selectedProductDetails.name}`}
          subtitle={`Total Sold: ${selectedProductDetails.totalQtySold} units • Total Revenue: ₹${selectedProductDetails.totalRevenue.toLocaleString()}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {/* Product Image & Meta Banner */}
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#FAF9F5] border border-[#EFECE1]">
              <img
                src={selectedProductDetails.image || '/images/products/argan_hair_oil.jpg'}
                alt={selectedProductDetails.name}
                className="w-16 h-16 rounded-xl object-cover border border-[#D4AF37]/30 shadow-sm shrink-0"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-[#EBE8DE] text-[#646875]">
                  {selectedProductDetails.category}
                </span>
                <h4 className="font-bold text-sm text-[#18191B] mt-1">{selectedProductDetails.name}</h4>
                <p className="text-xs text-[#B58D20] font-mono font-bold">₹{selectedProductDetails.price} Retail</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#FAF9F5] border border-[#EFECE1] text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#9499A8] block">Units Sold</span>
                <span className="font-mono font-bold text-lg text-[#18191B]">
                  {selectedProductDetails.totalQtySold}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#9499A8] block">Gross Revenue</span>
                <span className="font-mono font-bold text-lg text-[#B58D20]">
                  ₹{selectedProductDetails.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#9499A8] block">Current Stock</span>
                <span className="font-mono font-bold text-lg text-[#10B981]">
                  {selectedProductDetails.stock} units
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#EFECE1] text-[#9499A8] uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-bold">Date & Bill ID</th>
                    <th className="pb-3 font-bold">Customer Name</th>
                    <th className="pb-3 font-bold">Qty Sold</th>
                    <th className="pb-3 font-bold">Payment</th>
                    <th className="pb-3 font-bold text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6F5F0]">
                  {selectedProductDetails.saleLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400">
                        Initial inventory units sold prior to live POS logs.
                      </td>
                    </tr>
                  ) : (
                    selectedProductDetails.saleLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF9F5]">
                        <td className="py-3">
                          <p className="font-mono font-bold text-[#D4AF37]">{log.billId}</p>
                          <p className="text-[11px] text-[#646875]">{log.date}</p>
                        </td>
                        <td className="py-3">
                          <p className="font-bold text-[#18191B]">{log.customerName}</p>
                          <p className="text-[11px] text-[#646875] font-mono">+91 {log.customerPhone}</p>
                        </td>
                        <td className="py-3 font-mono font-bold">{log.quantity}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.paymentMethod === 'UPI'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {log.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-sm text-[#18191B]">
                          ₹{log.total}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Invoice Modal Preview */}
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
