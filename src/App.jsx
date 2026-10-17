import React, { useState } from 'react';
import { SaloonProvider, useSaloon } from './context/SaloonContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import DashboardView from './views/DashboardView';
import CustomersView from './views/CustomersView';
import EmployeesView from './views/EmployeesView';
import ServicesProductsView from './views/ServicesProductsView';
import MembershipsView from './views/MembershipsView';
import PackagesView from './views/PackagesView';
import BillingView from './views/BillingView';
import ReportsView from './views/ReportsView';

function SaloonAppContent() {
  const { activeMenu } = useSaloon();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardView />;
      case 'customers':
        return <CustomersView />;
      case 'employees':
        return <EmployeesView />;
      case 'services-products':
        return <ServicesProductsView />;
      case 'memberships':
        return <MembershipsView />;
      case 'packages':
        return <PackagesView />;
      case 'billing':
        return <BillingView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFCFA] text-[#18191B] flex flex-col font-sans selection:bg-[#D4AF37]/20 selection:text-[#18191B]">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Top Navbar */}
        <Navbar setMobileOpen={setMobileOpen} />

        {/* Page View Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <SaloonProvider>
      <SaloonAppContent />
    </SaloonProvider>
  );
}
