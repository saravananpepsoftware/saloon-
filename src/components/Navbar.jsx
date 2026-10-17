import React from 'react';
import { Menu, Plus, Sparkles, Receipt, Calendar, Clock } from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';

export default function Navbar({ setMobileOpen }) {
  const { activeMenu, setActiveMenu, bills, employees } = useSaloon();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(b => b.date === todayStr);
  const todayRevenue = todayBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const presentEmployeesCount = employees.filter(e => e.presentToday).length;

  const getMenuTitle = () => {
    switch (activeMenu) {
      case 'dashboard': return 'Dashboard Overview';
      case 'customers': return 'Customer Directory & History';
      case 'employees': return 'Employee & Attendance Hub';
      case 'services-products': return 'Services & Retail Products';
      case 'memberships': return 'VIP Membership Management';
      case 'packages': return 'Salon Combo Packages';
      case 'billing': return 'Billing & POS Counter';
      case 'reports': return 'Analytics & Detailed Reports';
      default: return 'Aura Luxe Salon';
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#EFECE1] sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="p-2 rounded-xl text-[#18191B] hover:bg-[#F4F1E8] lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
            {getMenuTitle()}
          </h2>
          <div className="flex items-center gap-3 text-xs text-[#646875] mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-[#C59B27]" />
              {currentDateFormatted}
            </span>
            <span className="hidden sm:inline-block text-[#D1CEBF]">•</span>
            <span className="hidden sm:flex items-center gap-1 text-[#10B981] font-semibold">
              <Sparkles size={12} /> {presentEmployeesCount} Stylists On Floor
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Today's Live Sales Pill */}
        <div className="hidden md:flex flex-col items-end px-3.5 py-1.5 rounded-xl bg-[#FAF8F2] border border-[#EBE6D5]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#9E7814]">
            Today's Sales
          </span>
          <span className="text-sm font-black text-[#18191B] font-mono">
            ₹{todayRevenue.toLocaleString()}
          </span>
        </div>

        {/* Quick New Bill CTA */}
        {activeMenu !== 'billing' && (
          <button
            onClick={() => setActiveMenu('billing')}
            className="gold-gradient-btn px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2"
          >
            <Receipt size={16} />
            <span className="hidden sm:inline">New Billing (POS)</span>
            <span className="sm:hidden">Bill</span>
          </button>
        )}
      </div>
    </header>
  );
}
