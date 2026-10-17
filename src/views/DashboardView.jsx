import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  UserCheck,
  TrendingUp,
  Receipt,
  Crown,
  Scissors,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  Package,
  Layers,
  Clock
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';
import InvoiceModal from '../components/InvoiceModal';

export default function DashboardView() {
  const {
    bills,
    customers,
    employees,
    services,
    memberships,
    packages,
    setActiveMenu
  } = useSaloon();

  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(b => b.date === todayStr);
  const todayRevenue = todayBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const upiToday = todayBills.filter(b => b.paymentMethod === 'UPI').reduce((acc, b) => acc + b.totalAmount, 0);
  const cashToday = todayBills.filter(b => b.paymentMethod === 'Cash').reduce((acc, b) => acc + b.totalAmount, 0);

  const presentEmployees = employees.filter(e => e.presentToday);
  const activeMembershipsCount = customers.filter(c => c.membershipPlan).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Salon Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/30 min-h-[360px] flex items-center">
        {/* Background Image */}
        <img
          src="/images/salon_hero.jpg"
          alt="Luxury Salon Interior"
          className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
        />
        {/* Gradient Overlay for high text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0F12]/95 via-[#181A20]/80 to-transparent" />

        <div className="relative z-10 p-6 sm:p-12 max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F9E79F] text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
            <Sparkles size={14} className="text-[#D4AF37]" />
            Aura Luxe Signature Studio
          </div>
          <h1
            className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-wide"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Elegance In Every Cut,{' '}
            <span className="gold-gradient-text block">Luxury In Every Touch</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-300 font-light leading-relaxed">
            Welcome to the master control hub. Manage client appointments, precision hair styling services, employee attendance, retail products, VIP memberships, and instant billing.
          </p>

          {/* Quick Hero Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveMenu('billing')}
              className="gold-gradient-btn px-6 py-3 rounded-xl text-sm font-bold shadow-xl flex items-center gap-2"
            >
              <Receipt size={18} />
              Open POS Checkout
            </button>
            <button
              onClick={() => setActiveMenu('packages')}
              className="px-5 py-3 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
            >
              <Layers size={18} />
              Explore Combo Packages
            </button>
          </div>
        </div>

        {/* Floating Floor Status Pill on the top right */}
        <div className="hidden lg:flex absolute top-6 right-6 flex-col items-end gap-2 z-10">
          <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-[#D4AF37]/40 shadow-xl bg-white/95">
            <div className="w-3 h-3 rounded-full bg-[#10B981] animate-ping" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#9E7814] tracking-wider">Floor Status</p>
              <p className="text-xs font-extrabold text-[#18191B]">{presentEmployees.length} of {employees.length} Stylists Present</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Today's Revenue */}
        <div className="luxury-card p-6 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#646875]">Today's Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF6EA] text-[#C59B27] flex items-center justify-center border border-[#D4AF37]/30">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#18191B] font-mono">
              ₹{todayRevenue.toLocaleString()}
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs text-[#646875] pt-2 border-t border-[#F0EBE0]">
              <span className="text-[#10B981] font-semibold">UPI: ₹{upiToday.toLocaleString()}</span>
              <span className="text-[#B58D20] font-semibold">Cash: ₹{cashToday.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Customers Served */}
        <div className="luxury-card p-6 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#646875]">Customers Serviced</span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF6EA] text-[#C59B27] flex items-center justify-center border border-[#D4AF37]/30">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#18191B] font-mono">
              {todayBills.length}{' '}
              <span className="text-xs font-normal text-[#9499A8]">today</span>
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs text-[#646875] pt-2 border-t border-[#F0EBE0]">
              <span>Total in Database</span>
              <span className="font-bold text-[#18191B]">{customers.length} Clients</span>
            </div>
          </div>
        </div>

        {/* Card 3: Employees on Duty */}
        <div className="luxury-card p-6 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#646875]">Stylists Attendance</span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF6EA] text-[#C59B27] flex items-center justify-center border border-[#D4AF37]/30">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#10B981] font-mono">
              {presentEmployees.length}{' '}
              <span className="text-xs font-medium text-[#646875]">/ {employees.length} Present</span>
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs text-[#646875] pt-2 border-t border-[#F0EBE0]">
              <span className="text-[#EF4444] font-semibold">{employees.length - presentEmployees.length} Absent</span>
              <button
                onClick={() => setActiveMenu('employees')}
                className="text-[#C59B27] hover:underline font-semibold"
              >
                Mark Daily &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: VIP Memberships */}
        <div className="luxury-card p-6 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#646875]">Active Memberships</span>
            <div className="w-10 h-10 rounded-xl bg-[#FAF6EA] text-[#C59B27] flex items-center justify-center border border-[#D4AF37]/30">
              <Crown size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#18191B] font-mono">
              {activeMembershipsCount}{' '}
              <span className="text-xs font-normal text-[#9499A8]">Members</span>
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs text-[#646875] pt-2 border-t border-[#F0EBE0]">
              <span>Plans Active</span>
              <span className="font-bold text-[#18191B]">{memberships.length} Tiers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Salon Haircut & Grooming Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
              Studio Hair & Grooming Highlights
            </h2>
            <p className="text-xs text-[#646875]">Handcrafted haircuts, beard sculpts, and therapeutic facials</p>
          </div>
          <button
            onClick={() => setActiveMenu('services-products')}
            className="text-xs font-bold text-[#C59B27] hover:text-[#9E7814] flex items-center gap-1"
          >
            View All Services ({services.length}) &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Precision Haircut */}
          <div className="group rounded-2xl overflow-hidden border border-[#D4AF37]/25 shadow-md bg-white hover:shadow-xl transition-all">
            <div className="relative h-48 overflow-hidden">
              <img
                src="/images/haircut_action.jpg"
                alt="Precision Scissor Haircut"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                Haircut & Styling
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#D4AF37] text-white text-xs font-black shadow-md font-mono">
                From ₹450
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-[#18191B] text-base group-hover:text-[#C59B27] transition-colors">
                Royal Precision Haircuts
              </h4>
              <p className="text-xs text-[#646875] mt-1 line-clamp-2">
                Scissor & clipper artistry personalized to your face profile, scalp texture, and modern lifestyle.
              </p>
              <div className="mt-3 pt-3 border-t border-[#F0EBE0] flex items-center justify-between text-xs">
                <span className="text-[#9499A8] flex items-center gap-1">
                  <Clock size={12} /> 35 Mins
                </span>
                <button
                  onClick={() => setActiveMenu('billing')}
                  className="font-bold text-[#C59B27] hover:underline"
                >
                  Book / Bill &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Beard Sculpting */}
          <div className="group rounded-2xl overflow-hidden border border-[#D4AF37]/25 shadow-md bg-white hover:shadow-xl transition-all">
            <div className="relative h-48 overflow-hidden">
              <img
                src="/images/beard_grooming.jpg"
                alt="Gentleman Beard Sculpting"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                Beard & Shaving
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#D4AF37] text-white text-xs font-black shadow-md font-mono">
                From ₹300
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-[#18191B] text-base group-hover:text-[#C59B27] transition-colors">
                Luxury Beard Shaping & Shave
              </h4>
              <p className="text-xs text-[#646875] mt-1 line-clamp-2">
                Hot towel lather, straight-edge blade precision, organic cedarwood oils, and soothing botanicals.
              </p>
              <div className="mt-3 pt-3 border-t border-[#F0EBE0] flex items-center justify-between text-xs">
                <span className="text-[#9499A8] flex items-center gap-1">
                  <Clock size={12} /> 25 Mins
                </span>
                <button
                  onClick={() => setActiveMenu('billing')}
                  className="font-bold text-[#C59B27] hover:underline"
                >
                  Book / Bill &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: 24K Gold Facial */}
          <div className="group rounded-2xl overflow-hidden border border-[#D4AF37]/25 shadow-md bg-white hover:shadow-xl transition-all">
            <div className="relative h-48 overflow-hidden">
              <img
                src="/images/facial_spa.jpg"
                alt="24K Gold Facial Therapy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                Facial & D-Tan Spa
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#D4AF37] text-white text-xs font-black shadow-md font-mono">
                From ₹650
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-[#18191B] text-base group-hover:text-[#C59B27] transition-colors">
                24K Gold Radiance & D-Tan
              </h4>
              <p className="text-xs text-[#646875] mt-1 line-clamp-2">
                Deep cleansing, micro-exfoliation, pure gold foil infusion, and tan extraction for immediate radiance.
              </p>
              <div className="mt-3 pt-3 border-t border-[#F0EBE0] flex items-center justify-between text-xs">
                <span className="text-[#9499A8] flex items-center gap-1">
                  <Clock size={12} /> 50 Mins
                </span>
                <button
                  onClick={() => setActiveMenu('billing')}
                  className="font-bold text-[#C59B27] hover:underline"
                >
                  Book / Bill &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Bills Feed & Active Stylists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Recent Invoices */}
        <div className="lg:col-span-2 luxury-card p-6 bg-white">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE0]">
            <div>
              <h3 className="font-bold text-lg text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                Recent Salon Transactions
              </h3>
              <p className="text-xs text-[#646875]">Live billing counter and customer checkouts</p>
            </div>
            <button
              onClick={() => setActiveMenu('reports')}
              className="text-xs font-bold text-[#C59B27] hover:underline"
            >
              All Reports &rarr;
            </button>
          </div>

          <div className="divide-y divide-[#F6F5F0] mt-3">
            {bills.slice(0, 5).map((bill) => (
              <div key={bill.id} className="py-3.5 flex items-center justify-between hover:bg-[#FAF8F2] px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF6EA] border border-[#D4AF37]/30 text-[#C59B27] flex items-center justify-center font-mono font-bold text-xs">
                    {bill.paymentMethod === 'UPI' ? 'UPI' : 'CASH'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-[#18191B]">{bill.customerName}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] font-semibold border border-[#10B981]/20">
                        Paid
                      </span>
                    </div>
                    <p className="text-xs text-[#646875] mt-0.5">
                      {bill.services?.map(s => s.name).join(', ') || 'Salon Services'}
                      {bill.products?.length > 0 && ` + ${bill.products.length} product(s)`}
                    </p>
                    <p className="text-[11px] text-[#9499A8] mt-0.5">
                      {bill.date} • Stylist: {bill.employeeName || bill.services?.[0]?.employeeName || 'Staff'}
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-mono font-bold text-base text-[#18191B]">₹{bill.totalAmount}</p>
                    <p className="text-[10px] text-[#9499A8]">{bill.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedBillForInvoice(bill)}
                    className="p-2 rounded-xl bg-[#FAF8F2] hover:bg-[#F3EFE3] text-[#646875] hover:text-[#18191B] transition-colors border border-[#EBE6D5]"
                    title="View Receipt"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Today's Floor Stylists */}
        <div className="luxury-card p-6 bg-white">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE0]">
            <div>
              <h3 className="font-bold text-lg text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                Staff on Duty
              </h3>
              <p className="text-xs text-[#646875]">Stylists & technicians floor status</p>
            </div>
            <button
              onClick={() => setActiveMenu('employees')}
              className="text-xs font-bold text-[#C59B27] hover:underline"
            >
              Manage &rarr;
            </button>
          </div>

          <div className="space-y-3.5 mt-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#F0EBE0] bg-[#FCFCFA] hover:border-[#D4AF37]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/30"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        emp.presentToday ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                      }`}
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#18191B]">{emp.name}</h5>
                    <p className="text-[11px] text-[#646875]">{emp.department}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      emp.presentToday
                        ? 'bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20'
                        : 'bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20'
                    }`}
                  >
                    {emp.presentToday ? 'Present' : 'Absent'}
                  </span>
                  <p className="text-[10px] text-[#9499A8] mt-1 font-mono">
                    {emp.totalServiced || 0} Clients
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
