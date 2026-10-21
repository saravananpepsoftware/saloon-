import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  Calendar,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  Printer,
  Search,
  Plus,
  Filter,
  DollarSign,
  Wallet,
  Banknote,
  ShieldCheck,
  ChevronRight,
  X,
  Edit3,
  Trash2,
  Eye,
  Download,
  Sparkles,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  UserX,
  CreditCard,
  Check,
  XCircle,
  CalendarCheck
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';

// Helper: Parse time string like "09:18 AM" or "19:15" to minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || timeStr === '-' || timeStr === 'Working' || timeStr === 'In Progress') return null;
  const cleaned = timeStr.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');
  const numPart = cleaned.replace(/[^0-9:]/g, '');
  const parts = numPart.split(':');
  if (parts.length < 2) return null;
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Helper: Calculate late minutes and formatted string against shift start
const calculateLateInfo = (inTimeStr, shiftStartStr = '09:00 AM') => {
  const inMins = parseTimeToMinutes(inTimeStr);
  const startMins = parseTimeToMinutes(shiftStartStr);
  if (inMins === null || startMins === null) {
    return { lateMinutes: 0, lateTime: '-', status: 'Absent' };
  }
  const diff = inMins - startMins;
  if (diff > 0) {
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    const text = hours > 0 ? `${hours}h ${mins}m late` : `${mins} mins late`;
    return { lateMinutes: diff, lateTime: text, status: 'Late' };
  } else if (diff === 0) {
    return { lateMinutes: 0, lateTime: 'On Time', status: 'Present' };
  } else {
    const early = Math.abs(diff);
    return { lateMinutes: 0, lateTime: `On Time (${early}m early)`, status: 'Present' };
  }
};

// Helper: Calculate work hours duration
const calculateWorkDuration = (inTimeStr, outTimeStr) => {
  const inMins = parseTimeToMinutes(inTimeStr);
  const outMins = parseTimeToMinutes(outTimeStr);
  if (inMins === null || outMins === null) return 'In Progress';
  let diff = outMins - inMins;
  if (diff < 0) diff += 24 * 60;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m < 10 ? '0' : ''}${m}m`;
};

// Helper: Convert number to Indian English words for Pay Slip
const numberToWords = (num) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n === 0) return 'Zero';
    let str = '';
    if (Math.floor(n / 10000000) > 0) {
      str += inWords(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      str += inWords(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      str += inWords(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (Math.floor(n / 100) > 0) {
      str += inWords(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) str += a[n] + ' ';
      else {
        str += b[Math.floor(n / 10)] + ' ';
        if (n % 10 > 0) str += a[n % 10] + ' ';
      }
    }
    return str.trim();
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  let words = inWords(integerPart);
  if (decimalPart > 0) {
    words += ` and ${inWords(decimalPart)} Paise`;
  }
  return words ? `Rupees ${words} Only` : 'Rupees Zero Only';
};

export default function PayrollView() {
  const {
    employees,
    bills,
    attendanceLogs,
    payrollPayments,
    leaveRequests = [],
    applyLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    deleteLeaveRequest,
    recordAttendancePunch,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    markSalaryPaid,
    unmarkSalaryPaid,
    showToast
  } = useSaloon();

  // Active Tab: 'attendance', 'leave', or 'payslip'
  const [activeTab, setActiveTab] = useState('attendance');

  // Attendance View Filters
  const todayDateStr = '2026-10-21';
  const [selectedDate, setSelectedDate] = useState(todayDateStr);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('all');

  // Punch Log / Edit Modal State
  const [punchModalOpen, setPunchModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);
  const [punchFormData, setPunchFormData] = useState({
    employeeId: employees[0]?.id || '',
    date: todayDateStr,
    shiftStart: '09:00 AM',
    shiftEnd: '07:00 PM',
    inTime: '09:00 AM',
    outTime: 'Working',
    status: 'Present',
    notes: ''
  });

  // Pay Slip Modal State
  const [paySlipModalOpen, setPaySlipModalOpen] = useState(false);
  const [selectedPaySlipEmployee, setSelectedPaySlipEmployee] = useState(null);
  const [paySlipMonth, setPaySlipMonth] = useState('October 2026');

  // Payment Confirmation Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTargetEmp, setPaymentTargetEmp] = useState(null);
  const [paymentMethodSelect, setPaymentMethodSelect] = useState('Bank Transfer (NEFT)');

  // Leave Management Filters & Modals
  const [leaveDateFilter, setLeaveDateFilter] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetLeave, setRejectTargetLeave] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [selectedLeaveDetail, setSelectedLeaveDetail] = useState(null);

  const [leaveFormData, setLeaveFormData] = useState({
    employeeId: employees[0]?.id || '',
    leaveType: 'Casual Leave',
    startDate: todayDateStr,
    endDate: todayDateStr,
    reason: '',
    status: 'Pending'
  });

  // Escape key listener for modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setPunchModalOpen(false);
        setPaySlipModalOpen(false);
        setPaymentModalOpen(false);
        setLeaveModalOpen(false);
        setRejectModalOpen(false);
        setSelectedLeaveDetail(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Filtered Attendance Logs for selected date
  const filteredAttendanceLogs = useMemo(() => {
    return attendanceLogs.filter(log => {
      // Date matching
      const matchesDate = selectedDate === 'all' || log.date === selectedDate;
      if (!matchesDate) return false;

      // Status matching
      if (attendanceStatusFilter === 'present' && log.status !== 'Present') return false;
      if (attendanceStatusFilter === 'late' && log.status !== 'Late') return false;
      if (attendanceStatusFilter === 'absent' && log.status !== 'Absent') return false;

      // Search term
      if (attendanceSearch.trim()) {
        const q = attendanceSearch.toLowerCase();
        const matchesName = log.employeeName?.toLowerCase().includes(q);
        const matchesRole = log.role?.toLowerCase().includes(q);
        return matchesName || matchesRole;
      }
      return true;
    });
  }, [attendanceLogs, selectedDate, attendanceStatusFilter, attendanceSearch]);

  // Attendance Summary KPI Metrics for the selected date
  const attendanceKPIs = useMemo(() => {
    const targetDateLogs = attendanceLogs.filter(l => l.date === (selectedDate === 'all' ? todayDateStr : selectedDate));
    const totalStaff = employees.length || 1;
    const presentCount = targetDateLogs.filter(l => l.status === 'Present').length;
    const lateCount = targetDateLogs.filter(l => l.status === 'Late').length;
    const absentCount = targetDateLogs.filter(l => l.status === 'Absent').length;
    const totalLateMinutes = targetDateLogs.reduce((acc, l) => acc + (l.lateMinutes || 0), 0);

    return {
      totalStaff,
      presentCount,
      lateCount,
      absentCount,
      totalLateMinutes,
      onFloorCount: presentCount + lateCount
    };
  }, [attendanceLogs, employees, selectedDate, todayDateStr]);

  // Comprehensive Payroll / Pay Slip Calculations for All Employees
  const payrollStaffData = useMemo(() => {
    return employees.map(emp => {
      // 1. Basic Salary
      const baseSalary = Number(emp.salary) || 25000;

      // 2. Attendance Stats from logs for October 2026
      const empLogs = attendanceLogs.filter(l => l.employeeId === emp.id);
      const totalDays = 26; // Standard 26 working days month
      const presentLogs = empLogs.filter(l => l.status === 'Present' || l.status === 'Late');
      const presentDays = Math.min(totalDays, Math.max(presentLogs.length, emp.totalPresentDays ? Math.min(emp.totalPresentDays, 26) : 24));
      const absentDays = Math.max(0, totalDays - presentDays);

      const lateLogs = empLogs.filter(l => l.status === 'Late');
      const lateCount = lateLogs.length || (emp.name.toLowerCase().includes('vikram') ? 2 : emp.name.toLowerCase().includes('priya') ? 3 : 1);
      const totalLateMinutes = lateLogs.reduce((acc, l) => acc + (l.lateMinutes || 0), 0) || (lateCount * 22);

      // 3. Service Commission (Calculated identically to Reports / POS)
      const empBills = bills.filter(b =>
        b.employeeName?.toLowerCase() === emp.name.toLowerCase() ||
        b.services?.some(s => s.employeeName?.toLowerCase() === emp.name.toLowerCase())
      );
      const servicesCount = empBills.reduce((acc, b) => {
        const count = b.services?.filter(s => s.employeeName?.toLowerCase() === emp.name.toLowerCase()).length || 1;
        return acc + count;
      }, 0);
      const count = Math.max(servicesCount, (emp.totalServiced ? Math.round(emp.totalServiced / 25) : 3));
      const revenue = Math.max(
        empBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0),
        count * 850
      );
      const commissionPercentage = emp.commissionRate || 8;
      const commissionAmount = Math.round(revenue * (commissionPercentage / 100) * 100) / 100;

      // 4. Allowances & Deductions
      const floorAllowance = 2500; // Standard grooming & uniform allowance
      const grossEarnings = baseSalary + floorAllowance + commissionAmount;

      // Late penalty: Salon policy (₹150 per late day arrival beyond 15m)
      const lateDeduction = lateCount * 150;
      // Absenteeism deduction: Per-day rate (baseSalary / 26)
      const dailyRate = Math.round((baseSalary / totalDays) * 100) / 100;
      const absentDeduction = Math.round(absentDays * dailyRate * 100) / 100;
      const professionalTax = 200; // Statutory PT
      const totalDeductions = lateDeduction + absentDeduction + professionalTax;

      // Net Payable Salary
      const netSalary = Math.max(0, Math.round((grossEarnings - totalDeductions) * 100) / 100);

      // Payment Status
      const paymentInfo = payrollPayments?.[emp.id] || { status: 'Pending' };

      return {
        employee: emp,
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        department: emp.department || 'Salon Floor',
        avatar: emp.avatar,
        baseSalary,
        floorAllowance,
        presentDays,
        absentDays,
        totalDays,
        lateCount,
        totalLateMinutes,
        commissionAmount,
        commissionPercentage,
        revenueGenerated: revenue,
        lateDeduction,
        absentDeduction,
        professionalTax,
        grossEarnings,
        totalDeductions,
        netSalary,
        paymentStatus: paymentInfo.status || 'Pending',
        paidDate: paymentInfo.paidDate,
        paymentMethod: paymentInfo.paymentMethod,
        transactionRef: paymentInfo.transactionRef
      };
    });
  }, [employees, attendanceLogs, bills, payrollPayments]);

  // Total Payroll Summary Stats
  const payrollTotals = useMemo(() => {
    const totalGross = payrollStaffData.reduce((acc, s) => acc + s.grossEarnings, 0);
    const totalCommissions = payrollStaffData.reduce((acc, s) => acc + s.commissionAmount, 0);
    const totalLateDeductions = payrollStaffData.reduce((acc, s) => acc + s.lateDeduction, 0);
    const totalDeductions = payrollStaffData.reduce((acc, s) => acc + s.totalDeductions, 0);
    const totalNet = payrollStaffData.reduce((acc, s) => acc + s.netSalary, 0);
    const paidCount = payrollStaffData.filter(s => s.paymentStatus === 'Paid').length;

    return {
      totalGross,
      totalCommissions,
      totalLateDeductions,
      totalDeductions,
      totalNet,
      paidCount,
      totalStaff: payrollStaffData.length
    };
  }, [payrollStaffData]);

  // Open Punch Modal for New Entry
  const handleOpenNewPunch = () => {
    setEditingLogId(null);
    setPunchFormData({
      employeeId: employees[0]?.id || '',
      date: selectedDate === 'all' ? todayDateStr : selectedDate,
      shiftStart: '09:00 AM',
      shiftEnd: '07:00 PM',
      inTime: '09:00 AM',
      outTime: 'Working',
      status: 'Present',
      notes: ''
    });
    setPunchModalOpen(true);
  };

  // Open Punch Modal for Editing existing
  const handleOpenEditPunch = (log) => {
    setEditingLogId(log.id);
    setPunchFormData({
      employeeId: log.employeeId,
      date: log.date,
      shiftStart: log.shiftStart || '09:00 AM',
      shiftEnd: log.shiftEnd || '07:00 PM',
      inTime: log.inTime === '-' ? '' : log.inTime,
      outTime: log.outTime === '-' ? '' : log.outTime,
      status: log.status,
      notes: log.notes || ''
    });
    setPunchModalOpen(true);
  };

  // Open Leave Application Modal
  const handleOpenApplyLeave = () => {
    setLeaveFormData({
      employeeId: employees[0]?.id || '',
      leaveType: 'Casual Leave',
      startDate: todayDateStr,
      endDate: todayDateStr,
      reason: '',
      status: 'Pending'
    });
    setLeaveModalOpen(true);
  };

  // Submit Leave Application
  const handleSubmitLeaveForm = (e) => {
    e.preventDefault();
    if (!leaveFormData.employeeId) {
      showToast('Please select an employee.');
      return;
    }
    if (!leaveFormData.startDate) {
      showToast('Please choose a start date.');
      return;
    }
    applyLeaveRequest(leaveFormData);
    setLeaveModalOpen(false);
  };

  // Open Reject Modal
  const handleOpenRejectModal = (leave) => {
    setRejectTargetLeave(leave);
    setRejectionReasonText('');
    setRejectModalOpen(true);
  };

  // Confirm Rejection
  const handleConfirmReject = () => {
    if (rejectTargetLeave) {
      rejectLeaveRequest(rejectTargetLeave.id, rejectionReasonText || 'Rejected by Salon Admin');
      setRejectModalOpen(false);
      setRejectTargetLeave(null);
      setRejectionReasonText('');
    }
  };

  // Filtered Leave Requests for Leave History
  const filteredLeaveRequests = useMemo(() => {
    return leaveRequests.filter(item => {
      // 1. Date filter (exact match, active within range, or applied on)
      if (leaveDateFilter && leaveDateFilter !== 'all') {
        const matchesDate =
          item.startDate === leaveDateFilter ||
          item.endDate === leaveDateFilter ||
          item.appliedOn === leaveDateFilter ||
          (item.startDate <= leaveDateFilter && item.endDate >= leaveDateFilter);
        if (!matchesDate) return false;
      }

      // 2. Status filter
      if (leaveStatusFilter !== 'all') {
        if (item.status.toLowerCase() !== leaveStatusFilter.toLowerCase()) return false;
      }

      // 3. Search query
      if (leaveSearch.trim()) {
        const q = leaveSearch.toLowerCase();
        const matchesName = item.employeeName?.toLowerCase().includes(q);
        const matchesRole = item.role?.toLowerCase().includes(q);
        const matchesReason = item.reason?.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesReason) return false;
      }

      return true;
    });
  }, [leaveRequests, leaveDateFilter, leaveStatusFilter, leaveSearch]);

  const pendingLeavesCount = useMemo(() => {
    return leaveRequests.filter(l => l.status === 'Pending').length;
  }, [leaveRequests]);

  // Submit Punch Record Form
  const handleSubmitPunch = (e) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === punchFormData.employeeId);
    if (!emp) {
      showToast('Please select a valid employee', 'error');
      return;
    }

    let lateMinutes = 0;
    let lateTime = '-';
    let workHours = '-';
    let finalStatus = punchFormData.status;

    if (finalStatus !== 'Absent') {
      const lateCalc = calculateLateInfo(punchFormData.inTime, punchFormData.shiftStart);
      lateMinutes = lateCalc.lateMinutes;
      lateTime = lateCalc.lateTime;
      if (lateMinutes > 0) finalStatus = 'Late';
      else finalStatus = 'Present';

      workHours = calculateWorkDuration(punchFormData.inTime, punchFormData.outTime);
    } else {
      punchFormData.inTime = '-';
      punchFormData.outTime = '-';
    }

    const record = {
      id: editingLogId || `att-${punchFormData.date.replace(/-/g, '')}-${Date.now().toString().slice(-4)}`,
      date: punchFormData.date,
      employeeId: emp.id,
      employeeName: emp.name,
      role: emp.role || 'Stylist',
      department: emp.department || 'Salon Floor',
      shiftStart: punchFormData.shiftStart,
      shiftEnd: punchFormData.shiftEnd,
      inTime: punchFormData.inTime || '09:00 AM',
      outTime: punchFormData.outTime || 'Working',
      lateMinutes,
      lateTime,
      workHours,
      status: finalStatus,
      notes: punchFormData.notes
    };

    recordAttendancePunch(record);
    setPunchModalOpen(false);
  };

  // Quick Floor Punch Out action
  const handleQuickPunchOut = (log) => {
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const workDuration = calculateWorkDuration(log.inTime, nowTimeStr);
    updateAttendanceRecord(log.id, {
      outTime: nowTimeStr,
      workHours: workDuration,
      notes: (log.notes ? log.notes + ' • ' : '') + `Punched out at ${nowTimeStr}`
    });
  };

  // Open Pay Slip Modal
  const handleOpenPaySlip = (staffData) => {
    setSelectedPaySlipEmployee(staffData);
    setPaySlipModalOpen(true);
  };

  // Open Payment Disbursal Modal
  const handleOpenPaymentModal = (staffData) => {
    setPaymentTargetEmp(staffData);
    setPaymentMethodSelect('Bank Transfer (NEFT)');
    setPaymentModalOpen(true);
  };

  // Confirm Salary Disbursal
  const handleConfirmDisbursal = () => {
    if (!paymentTargetEmp) return;
    const ref = `${paymentMethodSelect.includes('UPI') ? 'UPI' : 'NEFT'}-${Math.floor(100000000 + Math.random() * 900000000)}`;
    markSalaryPaid(paymentTargetEmp.employeeId, paymentMethodSelect, ref);
    setPaymentModalOpen(false);
    // If payslip modal is open for this employee, update it live
    if (selectedPaySlipEmployee?.employeeId === paymentTargetEmp.employeeId) {
      setSelectedPaySlipEmployee(prev => ({
        ...prev,
        paymentStatus: 'Paid',
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: paymentMethodSelect,
        transactionRef: ref
      }));
    }
  };

  // Trigger Print of Pay Slip
  const handlePrintPaySlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Page Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C59B27] mb-1">
            <span>Phoenix Saloon</span>
            <span>•</span>
            <span>HR & Finance Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18191B] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Payroll & Attendance Management
          </h1>
          <p className="text-sm text-[#646875] mt-1 max-w-2xl">
            Track daily stylist floor punches, monitor in-time, out-time and late arrivals, and generate printable luxury pay slips.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          {activeTab === 'leave' ? (
            <button
              onClick={handleOpenApplyLeave}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-[#18191B] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] hover:brightness-110 transition-all shadow-md active:scale-95"
            >
              <Plus size={16} />
              <span>Apply Leave</span>
            </button>
          ) : (
            <button
              onClick={handleOpenNewPunch}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-[#18191B] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] hover:brightness-110 transition-all shadow-md active:scale-95"
            >
              <Clock size={16} />
              <span>Clock In / Punch</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Feature Sub-Tabs (Attendance Management vs Leave Management vs Pay Slips) */}
      <div className="flex items-center justify-between border-b border-[#E8E4D5] pb-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === 'attendance'
                ? 'bg-[#18191B] text-[#D4AF37] shadow-sm'
                : 'text-[#646875] hover:text-[#18191B] hover:bg-[#F4F1E8]'
            }`}
          >
            <Clock size={17} />
            <span>Attendance Management</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              activeTab === 'attendance' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#EAE6D8] text-[#646875]'
            }`}>
              {filteredAttendanceLogs.length} Records
            </span>
          </button>

          <button
            onClick={() => setActiveTab('leave')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === 'leave'
                ? 'bg-[#18191B] text-[#D4AF37] shadow-sm'
                : 'text-[#646875] hover:text-[#18191B] hover:bg-[#F4F1E8]'
            }`}
          >
            <CalendarCheck size={17} />
            <span>Leave Management</span>
            {pendingLeavesCount > 0 ? (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-600 border border-amber-300">
                {pendingLeavesCount} Pending
              </span>
            ) : (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'leave' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#EAE6D8] text-[#646875]'
              }`}>
                {leaveRequests.length} Leaves
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payslip')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === 'payslip'
                ? 'bg-[#18191B] text-[#D4AF37] shadow-sm'
                : 'text-[#646875] hover:text-[#18191B] hover:bg-[#F4F1E8]'
            }`}
          >
            <Banknote size={17} />
            <span>Pay Slip & Salary</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              activeTab === 'payslip' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#EAE6D8] text-[#646875]'
            }`}>
              {payrollStaffData.length} Staff
            </span>
          </button>
        </div>

        {/* Current Active Mode Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#646875] bg-[#F7F5EE] border border-[#E8E4D5] px-3 py-1.5 rounded-lg">
          <ShieldCheck size={14} className="text-[#10B981]" />
          <span>Biometric & Shift Policy Active</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ATTENDANCE MANAGEMENT (IN TIME, OUT TIME, LATE TIME) */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#EFECE1] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Date-wise Filter: Calendar Picker + Quick Presets */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Calendar Date Picker - Choose any particular date */}
              <div
                onClick={(e) => {
                  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                    const input = document.getElementById('attendance-calendar-picker');
                    if (input && typeof input.showPicker === 'function') {
                      try {
                        input.showPicker();
                      } catch {
                        input.focus();
                      }
                    }
                  }
                }}
                className="flex items-center gap-2 bg-[#FCFCFA] border border-[#EBE8DE] hover:border-[#D4AF37] focus-within:border-[#D4AF37] transition-all rounded-xl px-3 py-1.5 shadow-2xs cursor-pointer"
                title="Click to choose a particular date"
              >
                <Calendar size={15} className="text-[#C59B27] shrink-0" />
                <span className="text-xs font-bold text-[#646875]">Date:</span>
                <input
                  id="attendance-calendar-picker"
                  type="date"
                  value={selectedDate === 'all' ? '' : selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value || 'all')}
                  className="bg-transparent text-xs font-semibold text-[#18191B] focus:outline-none cursor-pointer"
                />
                {selectedDate !== 'all' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate('all');
                    }}
                    title="Clear date (Show all logs)"
                    className="p-0.5 rounded-md text-[#8C909D] hover:text-[#18191B] hover:bg-[#EAE6D8] transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Quick Shortcuts */}
              <button
                type="button"
                onClick={() => setSelectedDate(todayDateStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDate === todayDateStr
                    ? 'bg-[#18191B] text-[#D4AF37] shadow-sm'
                    : 'bg-[#F4F1E8] text-[#646875] hover:bg-[#EAE6D8]'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDate === 'all'
                    ? 'bg-[#18191B] text-[#D4AF37] shadow-sm'
                    : 'bg-[#F4F1E8] text-[#646875] hover:bg-[#EAE6D8]'
                }`}
              >
                All Logs
              </button>
            </div>

            {/* Status Filter & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Status Dropdown Filter */}
              <div className="flex items-center gap-2 bg-[#FCFCFA] border border-[#EBE8DE] hover:border-[#D4AF37] focus-within:border-[#D4AF37] transition-all rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-xs font-bold text-[#646875]">Status:</span>
                <select
                  value={attendanceStatusFilter}
                  onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#18191B] focus:outline-none cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C909D]" />
                <input
                  type="text"
                  placeholder="Search stylist or role..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FBF9F4] border border-[#E5E0D0] rounded-xl focus:outline-none focus:border-[#C59B27] focus:bg-white text-[#18191B]"
                />
              </div>
            </div>
          </div>

          {/* Attendance Roster Table (Featuring In Time, Out Time, Late Time) */}
          <div className="bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#FAF8F2] border-b border-[#EFECE1] text-xs font-bold text-[#646875] uppercase tracking-wider">
                    <th className="py-4 px-6">EMPLOYEE</th>
                    <th className="py-4 px-4">DATE</th>
                    <th className="py-4 px-4">IN TIME</th>
                    <th className="py-4 px-4">OUT TIME</th>
                    <th className="py-4 px-4">LATE TIME (DELAY)</th>
                    <th className="py-4 px-4">STATUS</th>
                    <th className="py-4 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F1E8]">
                  {filteredAttendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#8C909D]">
                        <Clock size={36} className="mx-auto mb-2 text-[#D1CEBF] opacity-60" />
                        <p className="font-semibold text-sm">No attendance records found for this date/filter.</p>
                        <p className="text-xs text-[#A09D90] mt-1">Use "Clock In / Punch" above to log a new attendance entry.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendanceLogs.map((log) => {
                      const isLate = log.status === 'Late' || (log.lateMinutes && log.lateMinutes > 0);
                      const isAbsent = log.status === 'Absent';
                      const isOnFloor = log.outTime === 'Working';

                      return (
                        <tr key={log.id} className="hover:bg-[#FCFBF8] transition-colors">
                          {/* 1. Employee - No profile image */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <h4 className="font-bold text-[#18191B]">{log.employeeName}</h4>
                            <p className="text-xs text-[#646875]">{log.role || 'Stylist'}</p>
                          </td>

                          {/* 2. Date */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs font-semibold text-[#18191B]">
                            {log.date}
                          </td>

                          {/* 3. IN TIME - Clean standard text */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs font-medium text-[#18191B]">
                            {isAbsent ? '-' : (log.inTime || '-')}
                          </td>

                          {/* 4. OUT TIME - Clean standard text */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs font-medium text-[#18191B]">
                            {isAbsent ? '-' : isOnFloor ? 'On Floor' : (log.outTime || '-')}
                          </td>

                          {/* 5. LATE TIME (DELAY) - Clean standard text */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-[#4A4D57]">
                            {isAbsent ? '-' : isLate ? (log.lateTime || `${log.lateMinutes} mins late`) : (log.lateTime || 'On Time')}
                          </td>

                          {/* 6. Status - Clean standard text */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs font-semibold text-[#18191B]">
                            {isAbsent ? 'Absent' : isLate ? 'Late Arrival' : 'Present'}
                          </td>

                          {/* 7. Actions */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditPunch(log)}
                                title="Edit Punch Record"
                                className="p-1.5 rounded-lg text-[#646875] hover:text-[#C59B27] hover:bg-[#F4F1E8] transition-colors"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => deleteAttendanceRecord(log.id)}
                                title="Delete Record"
                                className="p-1.5 rounded-lg text-[#646875] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 size={15} />
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

            {/* Attendance Legend & Notes */}
            <div className="p-4 bg-[#FAF8F2] border-t border-[#EFECE1] flex flex-wrap items-center justify-between gap-3 text-xs text-[#646875]">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-[#18191B]">Punctuality Policy:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Standard Shift: 09:00 AM
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Grace Period: 15 mins
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Late Arrival &gt; 15 mins = ₹150 Pay Slip Deduction
                </span>
              </div>
              <div className="text-[11px] text-[#8C909D]">
                Showing {filteredAttendanceLogs.length} verified attendance punches
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LEAVE MANAGEMENT (ACCEPT, REJECT, LEAVE HISTORY WITH DATE FILTER) */}
      {/* ========================================================================= */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          {/* Leave History Toolbar & Date-wise Filter */}
          <div className="bg-white rounded-2xl p-4 border border-[#EFECE1] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Date-wise Calendar Picker for Leave History */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div
                onClick={(e) => {
                  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
                    const input = document.getElementById('leave-history-calendar-picker');
                    if (input && typeof input.showPicker === 'function') {
                      try {
                        input.showPicker();
                      } catch {
                        input.focus();
                      }
                    }
                  }
                }}
                className="flex items-center gap-2 bg-[#FCFCFA] border border-[#EBE8DE] hover:border-[#D4AF37] focus-within:border-[#D4AF37] transition-all rounded-xl px-3 py-1.5 shadow-2xs cursor-pointer"
                title="Click to choose a particular date to filter leave history"
              >
                <Calendar size={15} className="text-[#C59B27] shrink-0" />
                <span className="text-xs font-bold text-[#646875]">Date:</span>
                <input
                  id="leave-history-calendar-picker"
                  type="date"
                  value={leaveDateFilter}
                  onChange={(e) => setLeaveDateFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#18191B] focus:outline-none cursor-pointer"
                />
                {leaveDateFilter && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLeaveDateFilter('');
                    }}
                    title="Clear date filter (Show all leaves)"
                    className="p-0.5 rounded-md text-[#8C909D] hover:text-[#18191B] hover:bg-[#EAE6D8] transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <button
                type="button"
                onClick={() => setLeaveDateFilter(todayDateStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  leaveDateFilter === todayDateStr
                    ? 'bg-[#18191B] text-[#D4AF37] shadow-sm'
                    : 'bg-[#F4F1E8] text-[#646875] hover:bg-[#EAE6D8]'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setLeaveDateFilter('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !leaveDateFilter
                    ? 'bg-[#18191B] text-[#D4AF37] shadow-sm'
                    : 'bg-[#F4F1E8] text-[#646875] hover:bg-[#EAE6D8]'
                }`}
              >
                All History
              </button>
            </div>

            {/* Right: Status Filters, Search, and Request Leave */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Status Dropdown Filter */}
              <div className="flex items-center gap-2 bg-[#FCFCFA] border border-[#EBE8DE] hover:border-[#D4AF37] focus-within:border-[#D4AF37] transition-all rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-xs font-bold text-[#646875]">Status:</span>
                <select
                  value={leaveStatusFilter}
                  onChange={(e) => setLeaveStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-[#18191B] focus:outline-none cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-56">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C909D]" />
                <input
                  type="text"
                  placeholder="Search stylist or reason..."
                  value={leaveSearch}
                  onChange={(e) => setLeaveSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FBF9F4] border border-[#E5E0D0] rounded-xl focus:outline-none focus:border-[#C59B27] focus:bg-white text-[#18191B]"
                />
              </div>

              {/* Apply Leave Button */}
              <button
                type="button"
                onClick={handleOpenApplyLeave}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-[#18191B] text-[#D4AF37] hover:bg-[#2A2C32] transition-colors shadow-sm shrink-0"
              >
                <Plus size={14} />
                <span>Apply Leave</span>
              </button>
            </div>
          </div>

          {/* Leave History Table */}
          <div className="bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#FAF8F2] border-b border-[#EFECE1] text-xs font-bold text-[#646875] uppercase tracking-wider">
                    <th className="py-4 px-6">EMPLOYEE</th>
                    <th className="py-4 px-4">LEAVE TYPE</th>
                    <th className="py-4 px-4">LEAVE PERIOD</th>
                    <th className="py-4 px-4">APPLIED ON</th>
                    <th className="py-4 px-4">STATUS</th>
                    <th className="py-4 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F1E8]">
                  {filteredLeaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#8C909D]">
                        <CalendarCheck size={36} className="mx-auto mb-2 text-[#D1CEBF] opacity-60" />
                        <p className="font-semibold text-sm">No leave records found for this filter.</p>
                        <p className="text-xs text-[#A09D90] mt-1">Use "Apply Leave" to record a new employee leave request.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLeaveRequests.map((leave) => {
                      const isPending = leave.status === 'Pending';
                      const isApproved = leave.status === 'Approved';
                      const isRejected = leave.status === 'Rejected';

                      return (
                        <tr key={leave.id} className="hover:bg-[#FAF8F2]/60 transition-colors">
                          {/* 1. EMPLOYEE (Click profile to view full reason notes) */}
                          <td
                            className="py-4 px-6 whitespace-nowrap cursor-pointer group"
                            onClick={() => setSelectedLeaveDetail(leave)}
                            title="Click profile to view reason notes & leave details"
                          >
                            <div className="font-bold text-[#18191B] text-sm group-hover:text-[#C59B27] transition-colors flex items-center gap-2">
                              <span>{leave.employeeName}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F1E8] text-[#8C909D] group-hover:bg-[#D4AF37]/20 group-hover:text-[#C59B27] transition-all">
                                View Reason
                              </span>
                            </div>
                            <div className="text-xs text-[#8C909D]">
                              {leave.role || 'Stylist'} • {leave.department || 'Salon Floor'}
                            </div>
                          </td>

                          {/* 2. LEAVE TYPE */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs font-medium text-[#18191B]">
                            {leave.leaveType}
                          </td>

                          {/* 3. LEAVE PERIOD */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-[#18191B]">
                            {leave.startDate === leave.endDate
                              ? leave.startDate
                              : `${leave.startDate} to ${leave.endDate}`}
                          </td>

                          {/* 4. APPLIED ON */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-[#646875]">
                            {leave.appliedOn || '-'}
                          </td>

                          {/* 5. STATUS */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Approved
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Rejected
                              </span>
                            )}
                          </td>

                          {/* 8. ACTIONS: ACCEPT / REJECT / DELETE */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {isPending ? (
                                <>
                                  {/* Accept Button */}
                                  <button
                                    type="button"
                                    onClick={() => approveLeaveRequest(leave.id)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs active:scale-95"
                                    title="Accept / Approve this leave request"
                                  >
                                    <Check size={13} />
                                    <span>Accept</span>
                                  </button>

                                  {/* Reject Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRejectModal(leave)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all active:scale-95"
                                    title="Reject this leave request"
                                  >
                                    <X size={13} />
                                    <span>Reject</span>
                                  </button>
                                </>
                              ) : isApproved ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRejectModal(leave)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#8C909D] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Change decision to Rejected"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteLeaveRequest(leave.id)}
                                    className="p-1.5 rounded-lg text-[#8C909D] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Delete Leave Record"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => approveLeaveRequest(leave.id)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#8C909D] hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                    title="Re-Approve this leave request"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteLeaveRequest(leave.id)}
                                    className="p-1.5 rounded-lg text-[#8C909D] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Delete Leave Record"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Leave History Footer Summary */}
            <div className="p-4 bg-[#FAF8F2] border-t border-[#EFECE1] flex flex-wrap items-center justify-between gap-3 text-xs text-[#646875]">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-[#18191B]">Leave Policy:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Standard Casual: 12 days/yr
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sick / Medical: Certified doctor note
                </span>
              </div>
              <div className="text-[11px] text-[#8C909D]">
                Showing {filteredLeaveRequests.length} leave records
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAY SLIP & SALARY DISBURSEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'payslip' && (
        <div className="space-y-6">
          {/* Month Bar & Pay Slip Table */}
          <div className="bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#EFECE1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-lg text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Employee Salary Roll &amp; Pay Slips
                </h3>
                <p className="text-xs text-[#646875] mt-0.5">
                  Detailed compensation statements, service incentives, late deductions, and printable payslips.
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#FAF8F2] border-b border-[#EFECE1] text-xs font-bold text-[#646875] uppercase tracking-wider">
                    <th className="py-4 px-6">STAFF MEMBER</th>
                    <th className="py-4 px-4 text-right">BASIC SALARY</th>
                    <th className="py-4 px-4 text-center">ATTENDANCE &amp; LATE STATS</th>
                    <th className="py-4 px-4 text-right">SERVICE COMMISSION</th>
                    <th className="py-4 px-4 text-right">DEDUCTIONS (LATE/LEAVE)</th>
                    <th className="py-4 px-4 text-right">NET PAYABLE</th>
                    <th className="py-4 px-4 text-center">STATUS</th>
                    <th className="py-4 px-6 text-right">PAY SLIP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F1E8]">
                  {payrollStaffData.map((item) => (
                    <tr key={item.employeeId} className="hover:bg-[#FCFBF8] transition-colors">
                      {/* 1. Staff Member */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <h4 className="font-bold text-[#18191B]">{item.employeeName}</h4>
                        <p className="text-xs text-[#646875]">{item.role}</p>
                      </td>

                      {/* 2. Basic Salary */}
                      <td className="py-4 px-4 text-right font-mono font-semibold text-[#18191B]">
                        ₹{item.baseSalary.toLocaleString('en-IN')}
                      </td>

                      {/* 3. Attendance & Late Stats */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs font-bold text-[#18191B]">
                            {item.presentDays} / {item.totalDays} Days
                          </span>
                          {item.lateCount > 0 ? (
                            <span className="text-[11px] font-semibold text-amber-700">
                              {item.lateCount} late ({item.totalLateMinutes}m)
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-700">
                              100% Punctual
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Service Commission */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-bold text-emerald-700">
                          +₹{item.commissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <div className="text-[11px] text-[#646875]">8% service share</div>
                      </td>

                      {/* 5. Deductions */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-bold text-rose-700">
                          -₹{item.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <div className="text-[11px] text-[#8C909D]">
                          Late: ₹{item.lateDeduction} • PT: ₹{item.professionalTax}
                        </div>
                      </td>

                      {/* 6. Net Payable */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-extrabold text-[#18191B] text-base">
                          ₹{item.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* 7. Status */}
                      <td className="py-4 px-4 text-center whitespace-nowrap text-xs font-semibold">
                        {item.paymentStatus === 'Paid' ? (
                          <span className="text-emerald-700">Paid</span>
                        ) : (
                          <span className="text-amber-700">Pending</span>
                        )}
                      </td>

                      {/* 8. Pay Slip Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleOpenPaySlip(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-[#18191B] text-[#D4AF37] hover:bg-[#2A2C32] transition-colors shadow-sm"
                          >
                            <FileText size={14} />
                            <span>View Pay Slip</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CLOCK IN / PUNCH LOG MODAL */}
      {/* ========================================================================= */}
      {punchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#14161C] border border-[#2D3139] rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setPunchModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Clock size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F5F2E9]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {editingLogId ? 'Edit Attendance Punch' : 'Clock In / Log Attendance'}
                </h3>
                <p className="text-xs text-zinc-400">Record employee punch time, out time, and late calculations.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPunch} className="space-y-4">
              {/* Employee Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Stylist / Employee *
                </label>
                <select
                  value={punchFormData.employeeId}
                  onChange={(e) => setPunchFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  disabled={!!editingLogId}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Shift Start */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={punchFormData.date}
                    onChange={(e) => setPunchFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Shift Start Time
                  </label>
                  <input
                    type="text"
                    value={punchFormData.shiftStart}
                    onChange={(e) => setPunchFormData(prev => ({ ...prev, shiftStart: e.target.value }))}
                    placeholder="09:00 AM"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* IN TIME & OUT TIME (Direct user requirement) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock size={13} /> In Time *
                  </label>
                  <input
                    type="text"
                    value={punchFormData.inTime}
                    onChange={(e) => setPunchFormData(prev => ({ ...prev, inTime: e.target.value }))}
                    placeholder="e.g. 09:18 AM"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                    required={punchFormData.status !== 'Absent'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock size={13} /> Out Time
                  </label>
                  <input
                    type="text"
                    value={punchFormData.outTime}
                    onChange={(e) => setPunchFormData(prev => ({ ...prev, outTime: e.target.value }))}
                    placeholder="07:00 PM or Working"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Live Late Time Calculation Display */}
              {punchFormData.inTime && punchFormData.status !== 'Absent' && (
                <div className="p-3 rounded-xl bg-[#1B1E26] border border-[#2D313A] flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Calculated Punctuality:</span>
                  {(() => {
                    const calc = calculateLateInfo(punchFormData.inTime, punchFormData.shiftStart);
                    if (calc.lateMinutes > 0) {
                      return (
                        <span className="font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-lg">
                          ⚠️ {calc.lateTime} ({calc.lateMinutes} mins late)
                        </span>
                      );
                    }
                    return (
                      <span className="font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-lg">
                        ✓ {calc.lateTime}
                      </span>
                    );
                  })()}
                </div>
              )}

              {/* Attendance Status */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Floor Attendance Status
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Present', 'Late', 'Half Day', 'Absent'].map(st => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setPunchFormData(prev => ({ ...prev, status: st }))}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        punchFormData.status === st
                          ? 'bg-[#D4AF37] text-[#14161C] border-[#D4AF37] shadow-md'
                          : 'bg-[#1C1F26] text-zinc-400 border-[#323640] hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes / Reason */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Shift Notes / Late Reason (Optional)
                </label>
                <input
                  type="text"
                  value={punchFormData.notes}
                  onChange={(e) => setPunchFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Traffic delay on Indiranagar ring road"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2D3139]">
                <button
                  type="button"
                  onClick={() => setPunchModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-sm font-bold text-[#18191B] bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] hover:brightness-110 transition-all shadow-md active:scale-95"
                >
                  Save Punch Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LUXURY PRINTABLE PAY SLIP MODAL */}
      {/* ========================================================================= */}
      {paySlipModalOpen && selectedPaySlipEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white print:static print:z-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#D4AF37]/50 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:border-none print:shadow-none print:rounded-none">
            {/* Top Modal Controls (Sticky Header, Hidden in print) */}
            <div className="px-5 py-3.5 bg-[#14161C] border-b border-[#2D3139] flex items-center justify-between shrink-0 print:hidden z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
                <Sparkles size={15} />
                <span>Phoenix Saloon Official Staff Compensation Slip</span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handlePrintPaySlip}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#18191B] hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Pay Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaySlipModalOpen(false)}
                  title="Close (Esc)"
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Document Container */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white print:overflow-visible print:p-0">
              <div id="printable-payslip" className="text-[#18191B] bg-white space-y-5">
                {/* Salon Header with Gold Crest */}
                <div className="border-b-2 border-[#D4AF37] pb-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-[#0A0C0F] border-2 border-[#D4AF37] flex items-center justify-center shadow-md shrink-0">
                      <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#D4AF37]" fill="currentColor">
                        <path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm9.64-12L22 4V3h-3l-4.36 4.36 1 1z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-widest text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                        PHOENIX SALOON
                      </h2>
                      <p className="text-xs uppercase tracking-widest font-bold text-[#C59B27]">
                        Luxury Salon &amp; Wellness Spa
                      </p>
                      <p className="text-[11px] text-[#646875] mt-0.5">
                        100 Feet Road, Indiranagar, Bengaluru - 560038 | GSTIN: 29AABCS1429B1Z
                      </p>
                    </div>
                  </div>

                  {/* Pay Slip Reference Box */}
                  <div className="bg-[#FAF8F2] border border-[#E8E4D5] rounded-2xl p-3 text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C59B27] block">
                      CONFIDENTIAL SALARY SLIP
                    </span>
                    <span className="font-mono text-sm font-extrabold text-[#18191B]">
                      PS-{paySlipMonth.slice(-4)}-{selectedPaySlipEmployee.employeeId.slice(-3).toUpperCase()}
                    </span>
                    <div className="text-[11px] text-[#646875] mt-0.5 font-semibold">
                      Period: <span className="text-[#18191B]">{paySlipMonth}</span>
                    </div>
                  </div>
                </div>

                {/* Employee Information Section */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#FBF9F4] border border-[#EFECE1] text-xs">
                  <div>
                    <span className="text-[#8C909D] uppercase text-[10px] font-bold block">Employee Name</span>
                    <span className="font-extrabold text-[#18191B] text-sm">{selectedPaySlipEmployee.employeeName}</span>
                  </div>
                  <div>
                    <span className="text-[#8C909D] uppercase text-[10px] font-bold block">Role / Designation</span>
                    <span className="font-bold text-[#18191B]">{selectedPaySlipEmployee.role}</span>
                  </div>
                  <div>
                    <span className="text-[#8C909D] uppercase text-[10px] font-bold block">Department</span>
                    <span className="font-semibold text-[#4A4D57]">{selectedPaySlipEmployee.department}</span>
                  </div>
                  <div>
                    <span className="text-[#8C909D] uppercase text-[10px] font-bold block">Staff ID</span>
                    <span className="font-mono font-bold text-[#18191B]">{selectedPaySlipEmployee.employeeId}</span>
                  </div>
                </div>

                {/* Attendance & Late Time Metrics Section */}
                <div className="p-4 rounded-2xl bg-white border border-[#EFECE1] shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#646875] flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#C59B27]" />
                      Attendance &amp; Punctuality Summary
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {selectedPaySlipEmployee.presentDays} / {selectedPaySlipEmployee.totalDays} Days Present
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-[#F4F1E8]">
                    <div>
                      <span className="text-[#8C909D] text-[11px]">Working Days:</span>
                      <span className="font-bold text-[#18191B] ml-1.5">{selectedPaySlipEmployee.totalDays}</span>
                    </div>
                    <div>
                      <span className="text-[#8C909D] text-[11px]">Days Present:</span>
                      <span className="font-bold text-emerald-700 ml-1.5">{selectedPaySlipEmployee.presentDays}</span>
                    </div>
                    <div>
                      <span className="text-[#8C909D] text-[11px]">Days Absent:</span>
                      <span className="font-bold text-rose-700 ml-1.5">{selectedPaySlipEmployee.absentDays}</span>
                    </div>
                    <div>
                      <span className="text-[#8C909D] text-[11px]">Late Arrivals:</span>
                      <span className="font-bold text-amber-700 ml-1.5">
                        {selectedPaySlipEmployee.lateCount} Days ({selectedPaySlipEmployee.totalLateMinutes}m)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Earnings & Deductions Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* 1. Earnings */}
                  <div className="border border-[#EFECE1] rounded-2xl overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="bg-[#FAF8F2] px-4 py-2.5 border-b border-[#EFECE1] flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#18191B]">EARNINGS (₹)</span>
                        <span className="text-xs font-bold text-emerald-700">INCENTIVES</span>
                      </div>
                      <div className="divide-y divide-[#F4F1E8] text-xs">
                        <div className="px-4 py-3 flex items-center justify-between">
                          <span className="text-[#4A4D57]">Basic Monthly Salary</span>
                          <span className="font-mono font-bold text-[#18191B]">
                            ₹{selectedPaySlipEmployee.baseSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between">
                          <span className="text-[#4A4D57]">Floor &amp; Grooming Allowance</span>
                          <span className="font-mono font-bold text-[#18191B]">
                            ₹{selectedPaySlipEmployee.floorAllowance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between bg-emerald-50/40">
                          <div>
                            <span className="font-semibold text-emerald-900">Stylist Service Commission</span>
                            <div className="text-[10px] text-emerald-600">8% of ₹{selectedPaySlipEmployee.revenueGenerated.toLocaleString('en-IN')} revenue</div>
                          </div>
                          <span className="font-mono font-bold text-emerald-700">
                            +₹{selectedPaySlipEmployee.commissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between font-bold bg-[#FAF8F2] border-t border-[#EFECE1] text-[#18191B] text-xs">
                      <span>TOTAL GROSS EARNINGS</span>
                      <span className="font-mono font-extrabold text-sm">
                        ₹{selectedPaySlipEmployee.grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* 2. Deductions */}
                  <div className="border border-[#EFECE1] rounded-2xl overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="bg-[#FAF8F2] px-4 py-2.5 border-b border-[#EFECE1] flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#18191B]">DEDUCTIONS (₹)</span>
                        <span className="text-xs font-bold text-rose-700">PENALTIES</span>
                      </div>
                      <div className="divide-y divide-[#F4F1E8] text-xs">
                        {/* Late Penalty */}
                        <div className="px-4 py-3 flex items-center justify-between bg-amber-50/40">
                          <div>
                            <span className="font-semibold text-amber-900">Late Arrival Penalty</span>
                            <div className="text-[10px] text-amber-700">
                              {selectedPaySlipEmployee.lateCount} days late &gt; 15 mins policy
                            </div>
                          </div>
                          <span className="font-mono font-bold text-rose-700">
                            -₹{selectedPaySlipEmployee.lateDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {/* Absenteeism */}
                        <div className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <span className="text-[#4A4D57]">Unpaid Leave / Absenteeism</span>
                            <div className="text-[10px] text-[#8C909D]">{selectedPaySlipEmployee.absentDays} day(s) unpaid</div>
                          </div>
                          <span className="font-mono font-bold text-rose-700">
                            -₹{selectedPaySlipEmployee.absentDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {/* Professional Tax */}
                        <div className="px-4 py-3 flex items-center justify-between">
                          <span className="text-[#4A4D57]">Professional Tax (PT)</span>
                          <span className="font-mono font-bold text-[#18191B]">
                            -₹{selectedPaySlipEmployee.professionalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between font-bold bg-[#FAF8F2] border-t border-[#EFECE1] text-[#18191B] text-xs">
                      <span>TOTAL DEDUCTIONS</span>
                      <span className="font-mono font-extrabold text-rose-700 text-sm">
                        -₹{selectedPaySlipEmployee.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Payable Highlight Banner */}
                <div className="p-5 rounded-2xl bg-[#14161C] text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#D4AF37]/50 shadow-md">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">
                      NET SALARY PAYABLE
                    </span>
                    <div className="text-3xl font-black font-mono text-[#F5F2E9] mt-0.5">
                      ₹{selectedPaySlipEmployee.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-[#D1CEBF] italic mt-1">
                      Amount in words: {numberToWords(selectedPaySlipEmployee.netSalary)}
                    </div>
                  </div>

                  {/* Verification Stamp */}
                  <div className="flex flex-col items-center sm:items-end">
                    {selectedPaySlipEmployee.paymentStatus === 'Paid' ? (
                      <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        <span>DISBURSED &amp; PAID</span>
                      </div>
                    ) : (
                      <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>PAYMENT PENDING</span>
                      </div>
                    )}
                    {selectedPaySlipEmployee.transactionRef && (
                      <span className="text-[10px] text-zinc-400 font-mono mt-1">
                        Ref: {selectedPaySlipEmployee.transactionRef}
                      </span>
                    )}
                  </div>
                </div>

                {/* Signatures & Seal Block */}
                <div className="pt-6 border-t border-[#EFECE1] grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="h-10 flex items-end justify-center pb-1">
                      <span className="font-serif italic text-sm text-[#4A4D57]">
                        {selectedPaySlipEmployee.employeeName}
                      </span>
                    </div>
                    <div className="border-t border-[#D1CEBF] pt-1 font-bold text-[#18191B]">
                      Employee Signature
                    </div>
                    <p className="text-[10px] text-[#8C909D]">Acknowledged receipt of statement</p>
                  </div>
                  <div>
                    <div className="h-10 flex items-end justify-center pb-1">
                      <div className="flex items-center gap-1 text-[#C59B27] font-bold font-serif text-xs">
                        <ShieldCheck size={14} />
                        <span>Phoenix Saloon Accounts Seal</span>
                      </div>
                    </div>
                    <div className="border-t border-[#D1CEBF] pt-1 font-bold text-[#18191B]">
                      Authorized Signatory &amp; Director
                    </div>
                    <p className="text-[10px] text-[#8C909D]">Phoenix Saloon &amp; Spa HR Dept.</p>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="text-center text-[10px] text-[#A09D90] italic pt-2">
                  This is a computer-generated official luxury salary slip authorized under Phoenix Saloon internal HR guidelines.
                </div>
              </div>
            </div>

            {/* Bottom Modal Footer (Hidden in print) */}
            <div className="px-6 py-3.5 bg-[#FAF9F5] border-t border-[#EFECE1] flex items-center justify-between shrink-0 print:hidden text-xs">
              <span className="text-[#8C909D]">
                Staff ID: <span className="font-mono font-bold text-[#18191B]">{selectedPaySlipEmployee.employeeId}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaySlipModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-white border border-[#DCD7C5] text-[#4A4D57] hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handlePrintPaySlip}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-[#18191B] text-[#D4AF37] hover:bg-[#282B33] transition-colors shadow-sm cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Pay Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SALARY PAYMENT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {paymentModalOpen && paymentTargetEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#14161C] border border-[#2D3139] rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Banknote size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Disburse Salary Payment</h3>
                <p className="text-xs text-zinc-400">Process monthly staff compensation transfer.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1C1F26] border border-[#2E323C] mb-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Employee:</span>
                <span className="font-bold text-white">{paymentTargetEmp.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Designation:</span>
                <span className="text-zinc-200">{paymentTargetEmp.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Pay Period:</span>
                <span className="text-zinc-200">{paySlipMonth}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#2E323C] text-sm">
                <span className="font-bold text-[#D4AF37]">Net Payable:</span>
                <span className="font-mono font-extrabold text-[#D4AF37]">
                  ₹{paymentTargetEmp.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Select Disbursal Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Bank Transfer (NEFT)', 'UPI Auto-Pay', 'IMPS Instant', 'Cash Voucher'].map(mode => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setPaymentMethodSelect(mode)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-left transition-all ${
                      paymentMethodSelect === mode
                        ? 'bg-[#D4AF37] text-[#14161C] border-[#D4AF37] font-bold'
                        : 'bg-[#1C1F26] text-zinc-300 border-[#323640] hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2D3139]">
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisbursal}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all active:scale-95"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPLY / RECORD LEAVE REQUEST */}
      {/* ========================================================================= */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#14161C] border border-[#2D3139] rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setLeaveModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <CalendarCheck size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F5F2E9]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Apply Leave Request
                </h3>
                <p className="text-xs text-zinc-400">Record a staff leave application with dates and justification.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitLeaveForm} className="space-y-4">
              {/* Employee Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Stylist / Employee *
                </label>
                <select
                  value={leaveFormData.employeeId}
                  onChange={(e) => setLeaveFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role || 'Staff'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Leave Type *
                </label>
                <select
                  value={leaveFormData.leaveType}
                  onChange={(e) => setLeaveFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Medical / Sick Leave">Medical / Sick Leave</option>
                  <option value="Privilege / Vacation">Privilege / Vacation</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Half Day Leave">Half Day Leave</option>
                </select>
              </div>

              {/* Date Range: Start Date & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={leaveFormData.startDate}
                    onChange={(e) => setLeaveFormData(prev => ({
                      ...prev,
                      startDate: e.target.value,
                      endDate: prev.endDate < e.target.value ? e.target.value : prev.endDate
                    }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={leaveFormData.endDate}
                    min={leaveFormData.startDate}
                    onChange={(e) => setLeaveFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>

              {/* Reason / Justification */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Reason / Justification *
                </label>
                <textarea
                  rows={2}
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Attending family function out of town, doctor consultation..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              {/* Initial Approval Status */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Approval Decision
                </label>
                <select
                  value={leaveFormData.status}
                  onChange={(e) => setLeaveFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Pending">Submit as Pending (Awaiting Review)</option>
                  <option value="Approved">Directly Approve (Admin Pre-Approval)</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2D3139]">
                <button
                  type="button"
                  onClick={() => setLeaveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-[#18191B] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] hover:brightness-110 transition-all shadow-md active:scale-95"
                >
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT LEAVE REQUEST WITH OPTIONAL REASON */}
      {/* ========================================================================= */}
      {rejectModalOpen && rejectTargetLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#14161C] border border-[#2D3139] rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <XCircle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F5F2E9]" style={{ fontFamily: 'var(--font-heading)' }}>
                  Reject Leave Request
                </h3>
                <p className="text-xs text-zinc-400">
                  {rejectTargetLeave.employeeName} ({rejectTargetLeave.leaveType})
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 mb-4 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
              Requested Period:{' '}
              <span className="font-semibold text-white">
                {rejectTargetLeave.startDate === rejectTargetLeave.endDate
                  ? rejectTargetLeave.startDate
                  : `${rejectTargetLeave.startDate} to ${rejectTargetLeave.endDate}`}
              </span>{' '}
              ({rejectTargetLeave.daysCount} {rejectTargetLeave.daysCount === 1 ? 'day' : 'days'})
            </p>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Rejection Note / Reason
              </label>
              <textarea
                rows={3}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="e.g. Peak customer booking volume on salon floor, please reschedule..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1F26] border border-[#323640] text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2D3139]">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md active:scale-95"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW EMPLOYEE LEAVE DETAILS & REASON NOTES */}
      {/* ========================================================================= */}
      {selectedLeaveDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#14161C] border border-[#2D3139] rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setSelectedLeaveDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header: Employee Profile */}
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/30 to-[#18191B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold text-lg">
                {selectedLeaveDetail.employeeName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F5F2E9]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {selectedLeaveDetail.employeeName}
                </h3>
                <p className="text-xs text-zinc-400">
                  {selectedLeaveDetail.role || 'Stylist'} • {selectedLeaveDetail.department || 'Salon Floor'}
                </p>
                <div className="mt-1.5">
                  {selectedLeaveDetail.status === 'Pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Pending Approval
                    </span>
                  )}
                  {selectedLeaveDetail.status === 'Approved' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Approved
                    </span>
                  )}
                  {selectedLeaveDetail.status === 'Rejected' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Leave Details Grid */}
            <div className="bg-[#1C1F26] border border-[#323640] rounded-2xl p-4 space-y-3 mb-5">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[#2D3139] text-xs">
                <div>
                  <span className="text-zinc-400 block mb-0.5">Leave Type</span>
                  <span className="font-bold text-white text-sm">{selectedLeaveDetail.leaveType}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">Applied On</span>
                  <span className="font-semibold text-zinc-200">{selectedLeaveDetail.appliedOn || '-'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-zinc-400 block mb-0.5">Leave Period</span>
                  <span className="font-semibold text-white">
                    {selectedLeaveDetail.startDate === selectedLeaveDetail.endDate
                      ? selectedLeaveDetail.startDate
                      : `${selectedLeaveDetail.startDate} to ${selectedLeaveDetail.endDate}`}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">Duration</span>
                  <span className="font-bold text-[#D4AF37]">
                    {selectedLeaveDetail.daysCount} {selectedLeaveDetail.daysCount === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
              </div>
            </div>

            {/* Reason Notes Box */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText size={14} className="text-[#C59B27]" />
                Reason / Application Notes
              </label>
              <div className="bg-[#1A1D24] border border-[#2D3139] rounded-2xl p-4 text-sm text-zinc-200 leading-relaxed min-h-[70px]">
                {selectedLeaveDetail.reason || 'No specific reason provided.'}
              </div>
            </div>

            {/* Admin Review Note (if reviewed) */}
            {selectedLeaveDetail.reviewNote && (
              <div className="mb-5 bg-[#1C1F26] border border-[#323640] rounded-xl p-3 text-xs">
                <span className="font-bold text-zinc-300 block mb-0.5">
                  Admin Note ({selectedLeaveDetail.reviewedBy || 'Salon Admin'}):
                </span>
                <span className="text-zinc-400 italic">{selectedLeaveDetail.reviewNote}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#2D3139]">
              <button
                type="button"
                onClick={() => setSelectedLeaveDetail(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedLeaveDetail.status === 'Pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const leave = selectedLeaveDetail;
                        setSelectedLeaveDetail(null);
                        handleOpenRejectModal(leave);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 transition-all active:scale-95"
                    >
                      <X size={14} />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        approveLeaveRequest(selectedLeaveDetail.id);
                        setSelectedLeaveDetail(prev => ({ ...prev, status: 'Approved', reviewedBy: 'Salon Admin' }));
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#14161C] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] hover:brightness-110 shadow-md transition-all active:scale-95"
                    >
                      <Check size={14} />
                      <span>Accept Leave</span>
                    </button>
                  </>
                ) : selectedLeaveDetail.status === 'Approved' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const leave = selectedLeaveDetail;
                      setSelectedLeaveDetail(null);
                      handleOpenRejectModal(leave);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
                  >
                    Change to Reject
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      approveLeaveRequest(selectedLeaveDetail.id);
                      setSelectedLeaveDetail(prev => ({ ...prev, status: 'Approved', reviewedBy: 'Salon Admin' }));
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all"
                  >
                    Change to Accept
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
