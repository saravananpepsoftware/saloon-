import React, { useState } from 'react';
import {
  UserPlus,
  Phone,
  Calendar,
  Scissors,
  Search,
  Filter
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';
import Modal from '../components/Modal';

export default function EmployeesView() {
  const {
    employees,
    addEmployee
  } = useSaloon();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Adding Employee
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: 'Hair Cut & Styling'
  });

  const departmentOptions = [
    'Hair Cut & Styling',
    'Facial & Skincare',
    'Hair Straightening & Coloring',
    'Beard Grooming & Shaving',
    'Spa, D-Tan & Massage'
  ];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    addEmployee(formData);
    setFormData({
      name: '',
      phone: '',
      department: 'Hair Cut & Styling'
    });
    setIsAddModalOpen(false);
  };

  const presentCount = employees.filter(e => e.presentToday).length;
  const absentCount = employees.length - presentCount;
  const attendanceRate = employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0;

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phone.includes(searchTerm);
    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header with title and Right Top Add Employee Button/Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
            Salon Stylists & Staff Hub
          </h2>
          <p className="text-xs text-[#646875] mt-1">
            Department assignments, daily Present/Absent attendance tracking, and serviced volume
          </p>
        </div>

        {/* Right Top Action: Add Employee Button/Icon */}
        <div className="flex items-center gap-3">
          <button
            id="btn-add-employee"
            onClick={() => setIsAddModalOpen(true)}
            className="gold-gradient-btn px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2"
          >
            <UserPlus size={18} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Attendance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="luxury-card p-5 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9499A8]">Total Stylists</span>
          <p className="text-2xl font-black text-[#18191B] font-mono mt-1">{employees.length}</p>
          <span className="text-xs text-[#646875] mt-1 block">Active on payroll</span>
        </div>

        <div className="luxury-card p-5 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">Present Today</span>
          <p className="text-2xl font-black text-[#10B981] font-mono mt-1">{presentCount}</p>
          <span className="text-xs text-[#10B981] font-semibold mt-1 block">On floor serving</span>
        </div>

        <div className="luxury-card p-5 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#EF4444]">Absent Today</span>
          <p className="text-2xl font-black text-[#EF4444] font-mono mt-1">{absentCount}</p>
          <span className="text-xs text-[#646875] mt-1 block">On leave</span>
        </div>

        <div className="luxury-card p-5 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B58D20]">Attendance Rate</span>
          <p className="text-2xl font-black text-[#B58D20] font-mono mt-1">{attendanceRate}%</p>
          <span className="text-xs text-[#646875] mt-1 block">Daily team presence</span>
        </div>
      </div>

      {/* Search and Department Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9499A8]" size={18} />
          <input
            type="text"
            placeholder="Search employee by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-xl border border-[#EFECE1] text-sm focus:outline-none focus:border-[#D4AF37] shadow-sm text-[#18191B]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#9499A8] shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full py-3 px-4 bg-white rounded-xl border border-[#EFECE1] text-sm focus:outline-none focus:border-[#D4AF37] shadow-sm text-[#18191B]"
          >
            <option value="all">All Departments</option>
            {departmentOptions.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table Format View */}
      <div className="bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#EFECE1] text-[11px] uppercase tracking-wider font-bold text-[#646875]">
                <th className="py-4 px-6">Employee</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Contact</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6 text-center">Days Present</th>
                <th className="py-4 px-6 text-center">Clients Served</th>
                <th className="py-4 px-6 text-right">Today's Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE0] text-sm">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9499A8] text-sm">
                    No employees found matching your search.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-[#FAF7ED] transition-colors group"
                    >
                      {/* Employee Name & Photo */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3.5">
                          <div className="relative shrink-0">
                            <img
                              src={emp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                              alt={emp.name}
                              className="w-10 h-10 rounded-xl object-cover border border-[#D4AF37]/40 shadow-xs"
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                emp.presentToday ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                              }`}
                            />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#18191B] block">
                              {emp.name}
                            </span>
                            <span className="text-[11px] text-[#9499A8] font-mono">
                              ID: {emp.id.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-xs text-[#4A4D57] font-medium flex items-center gap-1.5">
                          <Scissors size={13} className="text-[#C59B27] shrink-0" />
                          <span>{emp.department}</span>
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-mono text-xs text-[#18191B] flex items-center gap-1.5 font-medium">
                          <Phone size={12} className="text-[#C59B27] shrink-0" />
                          {emp.phone}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-xs text-[#646875] flex items-center gap-1.5 font-medium">
                          <Calendar size={12} className="text-[#9499A8]" />
                          {emp.joinedDate}
                        </span>
                      </td>

                      {/* Days Present */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="font-mono font-semibold text-xs text-[#18191B]">
                          {emp.totalPresentDays || 0} Days
                        </span>
                      </td>

                      {/* Clients Served */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="font-mono font-semibold text-xs text-[#18191B]">
                          {emp.totalServiced || 0}
                        </span>
                      </td>

                      {/* Today's Status: Just show Present or Absent (No update buttons) */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            emp.presentToday
                              ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                              : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              emp.presentToday ? 'bg-[#059669]' : 'bg-[#DC2626]'
                            }`}
                          />
                          <span>{emp.presentToday ? 'Present' : 'Absent'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        subtitle="Register new salon stylist, aesthetician or massage therapist"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Employee Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sameer Kapoor"
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
              placeholder="e.g. +91 98450 11990"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Department / Specialty *
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] bg-white"
            >
              {departmentOptions.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
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
              Register Employee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
