import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Search,
  Printer,
  FileSpreadsheet,
  FileText,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';

export default function EmployeesView() {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    showToast
  } = useSaloon();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  // Esc key and body overflow handling for modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isModalOpen]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const initialFormState = {
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
    specialization: '',
    salary: '',
    commissionRate: '',
    status: 'active',
    joiningDate: '2026-08-01'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Open modal for Adding new employee
  const handleOpenAddModal = () => {
    setEditingEmployeeId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // Open modal for Editing an employee
  const handleOpenEditModal = (emp) => {
    setEditingEmployeeId(emp.id);

    let fName = emp.firstName || '';
    let lName = emp.lastName || '';
    if (!fName && emp.name) {
      const parts = emp.name.trim().split(' ');
      fName = parts[0] || '';
      lName = parts.slice(1).join(' ') || '';
    }

    setFormData({
      firstName: fName,
      lastName: lName,
      phone: emp.phone || '',
      role: emp.role || emp.department || '',
      specialization: emp.specialization || emp.department || '',
      salary: emp.salary || '',
      commissionRate: emp.commissionRate !== undefined ? emp.commissionRate : 8,
      status: emp.status || (emp.presentToday ? 'active' : 'inactive'),
      joiningDate: emp.joinedDate || '2026-08-01'
    });
    setIsModalOpen(true);
  };

  // Form Submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.phone.trim()) {
      showToast('First Name and Phone Number are required.');
      return;
    }

    if (editingEmployeeId) {
      updateEmployee(editingEmployeeId, formData);
    } else {
      addEmployee(formData);
    }

    setIsModalOpen(false);
  };

  // Delete Confirmation
  const handleDeleteEmployee = (emp) => {
    if (window.confirm(`Are you sure you want to remove ${emp.name}?`)) {
      deleteEmployee(emp.id);
    }
  };

  // Filtering employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.name?.toLowerCase().includes(q) ||
        emp.phone?.toLowerCase().includes(q) ||
        emp.role?.toLowerCase().includes(q);

      const empStatus = emp.status || (emp.presentToday ? 'active' : 'inactive');
      const matchesStatus =
        statusFilter === 'all' ||
        empStatus.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, statusFilter]);

  // Paginated list
  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage]);

  // Export handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExcelExport = () => {
    const headers = ['NAME,PHONE,ROLE / JOB TITLE,COMMISSION %,STATUS,JOINING DATE'];
    const rows = filteredEmployees.map(emp => {
      const status = emp.status || (emp.presentToday ? 'active' : 'inactive');
      const commission = emp.commissionRate !== undefined ? emp.commissionRate : 8;
      const role = emp.role || emp.department || 'Stylist';
      return `"${emp.name}","${emp.phone}","${role}","${commission}%","${status}","${emp.joinedDate || ''}"`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported employee register to Excel (CSV) successfully!');
  };

  const handlePDFExport = () => {
    showToast('Preparing employee register. Choose "Save as PDF" in your print window.');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Right Top Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-bold text-[#18191B]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Staff & Employee Register
          </h2>
          <p className="text-xs text-[#646875] mt-1">
            Configure commissions, salaries, staff profiles, and service delivery performance.
          </p>
        </div>

        {/* Right Top + Add Employee Button (Matching screenshot) */}
        <div>
          <button
            id="btn-add-employee"
            onClick={handleOpenAddModal}
            className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filter and Export Bar (Matching screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Search input and Status dropdown */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
            <input
              type="text"
              placeholder="Search by name, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[#E5E7EB] text-sm text-[#18191B] placeholder-[#9CA3AF] focus:outline-none focus:border-black shadow-xs"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-2.5 px-4 bg-white rounded-xl border border-[#E5E7EB] text-sm text-[#18191B] focus:outline-none focus:border-black shadow-xs cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Right: Print, Excel, PDF Export Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer size={15} className="text-[#6B7280]" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleExcelExport}
            className="px-3.5 py-2 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs font-semibold text-[#065F46] hover:bg-[#D1FAE5] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileSpreadsheet size={15} className="text-[#059669]" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={handlePDFExport}
            className="px-3.5 py-2 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs font-semibold text-[#991B1B] hover:bg-[#FEE2E2] flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileText size={15} className="text-[#DC2626]" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Employees Register Table Card (Matching screenshot) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                <th className="py-3.5 px-6">NAME</th>
                <th className="py-3.5 px-6">ROLE / JOB TITLE</th>
                <th className="py-3.5 px-6 text-center">COMMISSION %</th>
                <th className="py-3.5 px-6 text-center">STATUS</th>
                <th className="py-3.5 px-6 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-sm">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#9CA3AF] text-sm">
                    No employees found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const empStatus = emp.status || (emp.presentToday ? 'active' : 'inactive');
                  const commission = emp.commissionRate !== undefined ? emp.commissionRate : 8;
                  const role = emp.role || emp.department || 'Stylist';

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-[#F9FAFB] transition-colors"
                    >
                      {/* Name */}
                      <td className="py-4 px-6 font-semibold text-[#111827] whitespace-nowrap">
                        {emp.name}
                      </td>

                      {/* Role / Job Title */}
                      <td className="py-4 px-6 text-[#4B5563] whitespace-nowrap">
                        {role}
                      </td>

                      {/* Commission % */}
                      <td className="py-4 px-6 text-center font-mono text-[#374151] whitespace-nowrap">
                        {commission}%
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="text-xs text-[#374151] font-medium lowercase">
                          {empStatus}
                        </span>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-3 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(emp)}
                            className="text-[#374151] hover:text-black transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEmployee(emp)}
                            className="text-[#DC2626] hover:text-[#991B1B] transition-colors"
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

        {/* Pagination Footer (Matching screenshot: Previous & Next) */}
        <div className="px-6 py-4 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#6B7280]">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className={`font-semibold transition-colors ${
              currentPage <= 1 ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#374151] hover:text-black'
            }`}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className={`font-semibold transition-colors ${
              currentPage >= totalPages ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#374151] hover:text-black'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add / Edit Employee Modal - Portaled to document.body to cover full viewport */}
      {isModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.25)] border border-neutral-100 overflow-hidden my-auto transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-7 pt-6 pb-4 flex items-center justify-between border-b border-neutral-100 bg-white">
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                {editingEmployeeId ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-7 space-y-4 bg-white">
                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/40 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/40 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Row 2: Phone Number & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/40 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Role / Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stylist, Therapist"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/40 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Row 3: Specialization */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Haircut, Skincare"
                    value={formData.specialization}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/40 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs"
                  />
                </div>

                {/* Row 4: Salary, Commission %, Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Salary (Monthly)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={formData.salary}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/40 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Commission %
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 8"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/40 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/40 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all cursor-pointer shadow-2xs"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Joining Date */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/40 text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all cursor-pointer shadow-2xs"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-7 py-4 flex items-center justify-end gap-3 border-t border-neutral-100 bg-neutral-50/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 bg-white hover:bg-neutral-100 hover:text-neutral-900 transition-colors shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-black transition-all shadow-sm active:scale-[0.98]"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
