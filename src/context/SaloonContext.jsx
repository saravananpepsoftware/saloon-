import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_EMPLOYEES,
  INITIAL_SERVICES,
  INITIAL_PRODUCTS,
  INITIAL_MEMBERSHIPS,
  INITIAL_PACKAGES,
  INITIAL_CUSTOMERS,
  INITIAL_BILLS,
  INITIAL_ATTENDANCE_LOGS
} from '../data/initialData';

const SaloonContext = createContext();

export function SaloonProvider({ children }) {
  // Load from localStorage or use initial data
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('saloon_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('saloon_services');
    if (!saved) return INITIAL_SERVICES;
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(s => {
        const init = INITIAL_SERVICES.find(is => is.id === s.id || is.name.toLowerCase() === s.name.toLowerCase());
        return {
          ...s,
          image: s.image || init?.image || '/images/haircut_action.jpg'
        };
      });
    } catch (e) {
      return INITIAL_SERVICES;
    }
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('saloon_products');
    if (!saved) return INITIAL_PRODUCTS;
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(p => {
        const init = INITIAL_PRODUCTS.find(ip => ip.id === p.id || ip.name.toLowerCase() === p.name.toLowerCase());
        return {
          ...p,
          image: p.image || init?.image || '/images/products/argan_hair_oil.jpg'
        };
      });
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [memberships, setMemberships] = useState(() => {
    const saved = localStorage.getItem('saloon_memberships');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERSHIPS;
  });

  const [packages, setPackages] = useState(() => {
    const saved = localStorage.getItem('saloon_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('saloon_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem('saloon_bills');
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    const saved = localStorage.getItem('saloon_attendance_logs');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_LOGS;
  });

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('saloon_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('saloon_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('saloon_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('saloon_memberships', JSON.stringify(memberships));
  }, [memberships]);

  useEffect(() => {
    localStorage.setItem('saloon_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('saloon_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('saloon_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('saloon_attendance_logs', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Customer Actions
  const addCustomer = ({ name, phone, notes = '' }) => {
    // Check if phone already exists
    const existing = customers.find(c => c.phone.trim() === phone.trim());
    if (existing) {
      showToast(`Customer with phone ${phone} already exists!`, 'warning');
      return existing;
    }

    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      registeredDate: new Date().toISOString().split('T')[0],
      membershipPlan: null,
      membershipExpiry: null,
      notes: notes.trim(),
      history: []
    };

    setCustomers(prev => [newCustomer, ...prev]);
    showToast(`Customer "${newCustomer.name}" registered successfully!`);
    return newCustomer;
  };

  // 2. Employee Actions
  const addEmployee = ({ name, phone, department }) => {
    const newEmp = {
      id: `emp-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      department: department.trim(),
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      presentToday: true,
      totalPresentDays: 1,
      totalServiced: 0
    };

    setEmployees(prev => [newEmp, ...prev]);
    
    // Add attendance entry for today
    const today = new Date().toISOString().split('T')[0];
    setAttendanceLogs(prev => [
      {
        id: `att-${Date.now()}`,
        date: today,
        employeeId: newEmp.id,
        employeeName: newEmp.name,
        status: 'Present'
      },
      ...prev
    ]);

    showToast(`Employee "${newEmp.name}" added to ${newEmp.department}!`);
    return newEmp;
  };

  // Toggle Attendance
  const toggleEmployeeAttendance = (employeeId) => {
    const today = new Date().toISOString().split('T')[0];
    
    setEmployees(prev =>
      prev.map(emp => {
        if (emp.id === employeeId) {
          const newStatus = !emp.presentToday;
          const delta = newStatus ? 1 : -1;
          const newTotal = Math.max(0, (emp.totalPresentDays || 0) + delta);
          return {
            ...emp,
            presentToday: newStatus,
            totalPresentDays: newTotal
          };
        }
        return emp;
      })
    );

    // Update log
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      const willBePresent = !emp.presentToday;
      setAttendanceLogs(prev => {
        const filtered = prev.filter(log => !(log.date === today && log.employeeId === employeeId));
        return [
          {
            id: `att-${Date.now()}`,
            date: today,
            employeeId,
            employeeName: emp.name,
            status: willBePresent ? 'Present' : 'Absent'
          },
          ...filtered
        ];
      });

      showToast(`${emp.name} marked ${!emp.presentToday ? 'PRESENT' : 'ABSENT'} for today.`);
    }
  };

  // 3. Service Actions
  const addService = ({ name, department, price, duration, description, image }) => {
    const newService = {
      id: `srv-${Date.now()}`,
      name: name.trim(),
      department: department.trim(),
      price: Number(price),
      duration: Number(duration) || 30,
      description: description.trim(),
      image: image || '/images/haircut_action.jpg'
    };
    setServices(prev => [newService, ...prev]);
    showToast(`Service "${newService.name}" added successfully!`);
    return newService;
  };

  // 4. Product Actions
  const addProduct = ({ name, category, price, stock, description, image }) => {
    const newProduct = {
      id: `prd-${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      stock: Number(stock) || 0,
      soldCount: 0,
      description: description.trim(),
      image: image || '/images/products/argan_hair_oil.jpg'
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" added to inventory!`);
    return newProduct;
  };

  // 5. Membership Actions
  const addMembership = ({ name, durationMonths, price, discountPercentage, perks }) => {
    const newMembership = {
      id: `mem-${Date.now()}`,
      name: name.trim(),
      durationMonths: Number(durationMonths),
      price: Number(price),
      discountPercentage: Number(discountPercentage),
      perks: Array.isArray(perks) ? perks : perks.split(',').map(p => p.trim()).filter(Boolean),
      color: durationMonths === 12 ? '#1A1D24' : durationMonths === 6 ? '#D4AF37' : '#9CA3AF'
    };
    setMemberships(prev => [...prev, newMembership]);
    showToast(`Membership Plan "${newMembership.name}" created!`);
    return newMembership;
  };

  const assignMembershipToCustomer = (customerId, membershipId) => {
    const memberPlan = memberships.find(m => m.id === membershipId);
    if (!memberPlan) return;

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + memberPlan.durationMonths);
    const expiryStr = expiryDate.toISOString().split('T')[0];

    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            membershipPlan: memberPlan.name,
            membershipExpiry: expiryStr
          };
        }
        return c;
      })
    );

    showToast(`Customer enrolled in ${memberPlan.name} (Valid until ${expiryStr})`);
  };

  // 6. Packages Actions
  const addPackage = ({ name, includedServices, originalPrice, packagePrice, duration, description, image }) => {
    const newPackage = {
      id: `pkg-${Date.now()}`,
      name: name.trim(),
      includedServices: Array.isArray(includedServices) ? includedServices : includedServices.split(',').map(s => s.trim()),
      originalPrice: Number(originalPrice),
      packagePrice: Number(packagePrice),
      duration: Number(duration) || 60,
      description: description.trim(),
      image: image || '/images/haircut_action.jpg'
    };
    setPackages(prev => [...prev, newPackage]);
    showToast(`Package "${newPackage.name}" added!`);
    return newPackage;
  };

  // 7. Billing POS Action
  const createBill = ({
    customerId,
    customerName,
    customerPhone,
    servicesSelected, // [{ name, price, employeeName, employeeId }]
    productsSelected, // [{ id, name, price, quantity }]
    packageApplied = null,
    subtotal,
    membershipDiscount = 0,
    totalAmount,
    paymentMethod, // 'UPI' or 'Cash'
    upiRef = '',
    notes = ''
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const billId = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBill = {
      id: billId,
      date: today,
      time,
      customerId,
      customerName,
      customerPhone,
      services: servicesSelected,
      products: productsSelected,
      packageApplied,
      subtotal,
      membershipDiscount,
      totalAmount,
      paymentMethod,
      upiRef: paymentMethod === 'UPI' ? (upiRef || `UPI/${Date.now().toString().slice(-6)}`) : '',
      status: 'Paid',
      notes
    };

    // 1. Add to bills list
    setBills(prev => [newBill, ...prev]);

    // 2. Update customer history & details
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId || c.phone === customerPhone) {
          const serviceNames = servicesSelected.map(s => s.name);
          const primaryStylist = servicesSelected[0]?.employeeName || 'Staff';
          const newHistoryEntry = {
            billId,
            date: today,
            services: serviceNames,
            employeeName: primaryStylist,
            products: productsSelected.map(p => ({ name: p.name, price: p.price, quantity: p.quantity })),
            amount: totalAmount,
            paymentMethod,
            upiRef: newBill.upiRef
          };
          return {
            ...c,
            history: [newHistoryEntry, ...(c.history || [])]
          };
        }
        return c;
      })
    );

    // 3. Update employee service counts
    const employeeCounts = {};
    servicesSelected.forEach(s => {
      if (s.employeeId) {
        employeeCounts[s.employeeId] = (employeeCounts[s.employeeId] || 0) + 1;
      }
    });

    setEmployees(prev =>
      prev.map(emp => {
        if (employeeCounts[emp.id]) {
          return {
            ...emp,
            totalServiced: (emp.totalServiced || 0) + employeeCounts[emp.id]
          };
        }
        return emp;
      })
    );

    // 4. Update products stock and soldCount
    if (productsSelected.length > 0) {
      setProducts(prev =>
        prev.map(prod => {
          const soldItem = productsSelected.find(p => p.id === prod.id);
          if (soldItem) {
            const qty = soldItem.quantity || 1;
            return {
              ...prod,
              stock: Math.max(0, prod.stock - qty),
              soldCount: (prod.soldCount || 0) + qty
            };
          }
          return prod;
        })
      );
    }

    showToast(`Bill #${billId} generated successfully! Paid via ${paymentMethod}`);
    return newBill;
  };

  return (
    <SaloonContext.Provider
      value={{
        employees,
        services,
        products,
        memberships,
        packages,
        customers,
        bills,
        attendanceLogs,
        activeMenu,
        setActiveMenu,
        toastMessage,
        showToast,
        addCustomer,
        addEmployee,
        toggleEmployeeAttendance,
        addService,
        addProduct,
        addMembership,
        assignMembershipToCustomer,
        addPackage,
        createBill
      }}
    >
      {children}
    </SaloonContext.Provider>
  );
}

export function useSaloon() {
  const context = useContext(SaloonContext);
  if (!context) {
    throw new Error('useSaloon must be used within a SaloonProvider');
  }
  return context;
}
