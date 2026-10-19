import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_EMPLOYEES,
  INITIAL_SERVICES,
  INITIAL_PRODUCTS,
  INITIAL_MEMBERSHIPS,
  INITIAL_PACKAGES,
  INITIAL_CUSTOMERS,
  INITIAL_BILLS,
  INITIAL_ATTENDANCE_LOGS,
  INITIAL_NOTIFICATIONS
} from '../data/initialData';

const SaloonContext = createContext();

export function SaloonProvider({ children }) {
  // Load from localStorage or use initial data
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('saloon_employees');
    if (!saved) return INITIAL_EMPLOYEES;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const hasAnanya = parsed.some(e => e.name?.toLowerCase().includes('ananya sen'));
        if (!hasAnanya) return INITIAL_EMPLOYEES;
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EMPLOYEES;
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
      if (Array.isArray(parsed) && !parsed.some(p => p.name && p.name.includes('O3+'))) {
        const o3 = INITIAL_PRODUCTS.find(p => p.name && p.name.includes('O3+'));
        if (o3) parsed.push(o3);
      }
      return parsed.map(p => {
        const init = INITIAL_PRODUCTS.find(ip => ip.id === p.id || ip.name.toLowerCase() === p.name.toLowerCase());
        const sellingPrice = p.sellingPrice || p.price || init?.sellingPrice || 390;
        return {
          ...init,
          ...p,
          sku: p.sku || init?.sku || `SKU-${p.id.toUpperCase()}`,
          barcode: p.barcode || init?.barcode || '3490720002501',
          purchasePrice: p.purchasePrice !== undefined ? p.purchasePrice : (init?.purchasePrice || Math.round(sellingPrice * 0.65)),
          mrp: p.mrp !== undefined ? p.mrp : (init?.mrp || 0),
          sellingPrice: sellingPrice,
          price: sellingPrice,
          lowStockLimit: p.lowStockLimit || init?.lowStockLimit || 5,
          supplierName: p.supplierName || init?.supplierName || 'General Salon Distributor',
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
    let list = saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    if (!list.some(c => c.phone === '9876500456')) {
      const initial5 = INITIAL_CUSTOMERS.slice(0, 5);
      list = [...initial5, ...list.filter(c => !initial5.some(i => i.phone === c.phone))];
    } else {
      // Ensure email & gender exist
      list = list.map(c => {
        const match = INITIAL_CUSTOMERS.find(i => i.phone === c.phone || i.name === c.name);
        return {
          ...c,
          email: c.email || match?.email || '',
          gender: c.gender || match?.gender || '-'
        };
      });
    }
    return list;
  });

  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem('saloon_bills');
    let list = saved ? JSON.parse(saved) : INITIAL_BILLS;
    if (!list.some(b => b.id === 'INV-1-000006')) {
      const initialInv = INITIAL_BILLS.filter(b => b.id.startsWith('INV-1-'));
      list = [...initialInv, ...list.filter(b => !b.id.startsWith('INV-1-'))];
    }
    return list;
  });

  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    const saved = localStorage.getItem('saloon_attendance_logs');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE_LOGS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('saloon_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [receiptSettings, setReceiptSettings] = useState(() => {
    const defaultSettings = {
      templateStyle: 'classic',
      paperWidth: '80mm',
      showLogo: true,
      showAddress: true,
      showPhone: true,
      showEmail: true,
      showWebsite: true,
      showGstin: true,
      showQrCode: false,
      autoPrintCheckout: false,
      parlourName: 'PHOENIX SALOON',
      tagline: 'HAIR STUDIO & LUXURY SPA',
      address: '42 Royale Avenue, High Street Plaza',
      phone: '+91 98450 11223',
      email: 'concierge@phoenixsaloon.com',
      website: 'www.phoenixsaloon.com',
      gstin: '33AAACR2938K1Z5',
      footerMessage: 'Thank you for visiting. Please visit again.'
    };
    const saved = localStorage.getItem('saloon_receipt_settings');
    let parsed = {};
    try {
      parsed = saved ? JSON.parse(saved) : {};
      if (parsed.parlourName && (parsed.parlourName.toUpperCase().includes('AURA') || parsed.parlourName.toUpperCase().includes('SMARTGONEXT'))) {
        parsed.parlourName = 'PHOENIX SALOON';
      }
      if (parsed.email && parsed.email.toLowerCase().includes('aura')) {
        parsed.email = 'concierge@phoenixsaloon.com';
      }
      if (parsed.website && parsed.website.toLowerCase().includes('aura')) {
        parsed.website = 'www.phoenixsaloon.com';
      }
    } catch (e) {
      parsed = {};
    }
    return { ...defaultSettings, ...parsed, parlourName: parsed.parlourName || 'PHOENIX SALOON' };
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

  useEffect(() => {
    localStorage.setItem('saloon_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('saloon_receipt_settings', JSON.stringify(receiptSettings));
  }, [receiptSettings]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Customer Actions
  const addCustomer = ({ name, phone, email = '', gender = '-', notes = '' }) => {
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
      email: email ? email.trim() : '',
      gender: gender || '-',
      registeredDate: new Date().toISOString().split('T')[0],
      membershipPlan: null,
      membershipExpiry: null,
      notes: notes ? notes.trim() : '',
      history: []
    };

    setCustomers(prev => [newCustomer, ...prev]);
    showToast(`Customer "${newCustomer.name}" registered successfully!`);
    return newCustomer;
  };

  const updateCustomer = (id, updatedData) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updatedData } : c))
    );
    showToast(`Customer updated successfully!`);
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    showToast(`Customer removed from directory.`);
  };

  // 2. Employee Actions
  const addEmployee = ({
    name,
    firstName,
    lastName,
    phone,
    role,
    department,
    specialization,
    salary,
    commissionRate,
    status = 'active',
    joiningDate
  }) => {
    const fullName = name
      ? name.trim()
      : `${firstName || ''} ${lastName || ''}`.trim();
    const newEmp = {
      id: `emp-${Date.now()}`,
      name: fullName || 'Staff Member',
      firstName: firstName || '',
      lastName: lastName || '',
      phone: (phone || '').trim(),
      role: (role || '').trim() || (department || 'Stylist'),
      department: department || specialization || role || 'Hair Cut & Styling',
      specialization: (specialization || '').trim(),
      salary: salary ? Number(salary) : 0,
      commissionRate: commissionRate !== undefined && commissionRate !== '' ? Number(commissionRate) : 8,
      status: status || 'active',
      joinedDate: joiningDate || new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      presentToday: status === 'active',
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
        status: status === 'active' ? 'Present' : 'Absent'
      },
      ...prev
    ]);

    showToast(`Employee "${newEmp.name}" saved successfully!`);
    return newEmp;
  };

  const updateEmployee = (id, updatedData) => {
    setEmployees(prev =>
      prev.map(emp => {
        if (emp.id === id) {
          const fullName = updatedData.name
            ? updatedData.name.trim()
            : `${updatedData.firstName || ''} ${updatedData.lastName || ''}`.trim() || emp.name;
          return {
            ...emp,
            ...updatedData,
            name: fullName
          };
        }
        return emp;
      })
    );
    showToast(`Employee updated successfully!`);
  };

  const deleteEmployee = (id) => {
    const emp = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    showToast(`Employee "${emp?.name || ''}" removed.`);
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
  const addService = ({ name, department, price, duration, description, image, status = 'active' }) => {
    const newService = {
      id: `srv-${Date.now()}`,
      name: name.trim(),
      department: department.trim(),
      price: Number(price),
      duration: Number(duration) || 30,
      description: description ? description.trim() : '',
      image: image || '/images/haircut_action.jpg',
      status: status || 'active'
    };
    setServices(prev => [newService, ...prev]);
    showToast(`Service "${newService.name}" added successfully!`);
    return newService;
  };

  const updateService = (id, updatedFields) => {
    setServices(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    showToast(`Service updated successfully!`);
  };

  const deleteService = (id) => {
    setServices(prev => prev.filter(s => s.id !== id));
    showToast(`Service removed.`);
  };

  // 4. Product Actions
  const addProduct = ({
    name,
    category,
    sku,
    barcode,
    purchasePrice,
    mrp = 0,
    sellingPrice,
    price,
    stock,
    lowStockLimit = 5,
    supplierName,
    description,
    image,
    status = 'active'
  }) => {
    const finalSellingPrice = Number(sellingPrice || price || 0);
    const newProduct = {
      id: `prd-${Date.now()}`,
      name: name.trim(),
      category: category ? category.trim() : 'Hair Care',
      sku: sku ? sku.trim() : `SKU-${Date.now().toString().slice(-4)}`,
      barcode: barcode ? barcode.trim() : `890${Date.now().toString().slice(-8)}`,
      purchasePrice: Number(purchasePrice !== undefined ? purchasePrice : Math.round(finalSellingPrice * 0.65)),
      mrp: Number(mrp || 0),
      sellingPrice: finalSellingPrice,
      price: finalSellingPrice,
      stock: Number(stock) || 0,
      lowStockLimit: Number(lowStockLimit) || 5,
      supplierName: supplierName ? supplierName.trim() : 'General Salon Distributor',
      soldCount: 0,
      description: description ? description.trim() : '',
      image: image || '/images/products/argan_hair_oil.jpg',
      status: status || 'active'
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" added to inventory!`);
    return newProduct;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const merged = { ...p, ...updatedFields };
        if (updatedFields.sellingPrice !== undefined) {
          merged.price = Number(updatedFields.sellingPrice);
          merged.sellingPrice = Number(updatedFields.sellingPrice);
        } else if (updatedFields.price !== undefined) {
          merged.price = Number(updatedFields.price);
          merged.sellingPrice = Number(updatedFields.price);
        }
        return merged;
      })
    );
    showToast(`Product updated successfully!`);
  };

  const restockProduct = (id, quantityToAdd, newPurchasePrice) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, stock: (p.stock || 0) + Number(quantityToAdd) };
        if (newPurchasePrice) updated.purchasePrice = Number(newPurchasePrice);
        return updated;
      })
    );
    showToast(`Added ${quantityToAdd} units to stock!`);
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(`Product removed from inventory.`);
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

  const assignMembershipToCustomer = (customerId, planIdOrName, customExpiry) => {
    const memberPlan = memberships.find(m => m.id === planIdOrName || m.name.toLowerCase() === (planIdOrName || '').toLowerCase());
    const planName = memberPlan ? memberPlan.name : planIdOrName;

    let expiryStr = customExpiry;
    if (!expiryStr) {
      const durationMonths = memberPlan?.durationMonths || 12;
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
      expiryStr = `${expiryDate.getMonth() + 1}/${expiryDate.getDate()}/${expiryDate.getFullYear()}`;
    }

    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            membershipPlan: planName,
            membershipExpiry: expiryStr,
            membershipStatus: 'active'
          };
        }
        return c;
      })
    );

    const cust = customers.find(c => c.id === customerId);
    showToast(`Assigned ${planName} to ${cust?.name || 'Customer'} (Valid until ${expiryStr})`);
  };

  const renewCustomerMembership = (customerId, newExpiryDate) => {
    let custName = 'Customer';
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          custName = c.name;
          return {
            ...c,
            membershipExpiry: newExpiryDate,
            membershipStatus: 'active'
          };
        }
        return c;
      })
    );
    showToast(`Membership renewed for ${custName} until ${newExpiryDate}`);
  };

  const cancelCustomerMembership = (customerId) => {
    let custName = 'Customer';
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          custName = c.name;
          return {
            ...c,
            membershipStatus: 'cancelled'
          };
        }
        return c;
      })
    );
    showToast(`Membership cancelled for ${custName}`);
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
    taxAmount = 0,
    totalAmount,
    paymentMethod, // 'UPI' or 'Cash'
    splitPayments = null,
    upiRef = '',
    notes = '',
    ...rest
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const billCount = (bills.length + 1).toString().padStart(6, '0');
    const billId = `INV-1-${billCount}`;

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
      taxAmount,
      totalAmount,
      paymentMethod,
      splitPayments: splitPayments || rest.splitPayments || null,
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

  // 8. Notifications Actions
  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('All notifications marked as read');
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('Notification dismissed');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('All notifications cleared');
  };

  const refreshNotifications = () => {
    const alerts = [];

    // 1. Low stock products
    products.filter(p => (p.stock || 0) <= (p.lowStockLimit || 5)).forEach(p => {
      alerts.push({
        id: `notif-stock-${p.id}`,
        category: 'system',
        title: `Low Stock Alert: ${p.name}`,
        message: `${p.name} currently has ${p.stock} units remaining (Threshold: ${p.lowStockLimit || 5}). Restock recommended.`,
        time: 'Just now',
        type: 'danger',
        isRead: false,
        actionTarget: 'services-products',
        actionLabel: 'Restock Product'
      });
    });

    // 2. Active memberships
    customers.filter(c => c.membershipPlan).forEach(c => {
      alerts.push({
        id: `notif-mem-${c.id}`,
        category: 'membership',
        title: `Membership Alert: ${c.name}`,
        message: `${c.name} is enrolled in ${c.membershipPlan}. Expiry: ${c.membershipExpiry || 'Active'}.`,
        time: '15 mins ago',
        type: 'warning',
        isRead: false,
        actionTarget: 'memberships',
        actionLabel: 'View Memberships'
      });
    });

    // 3. Inactive / recent customers
    customers.filter(c => !c.history || c.history.length === 0).slice(0, 2).forEach(c => {
      alerts.push({
        id: `notif-inactive-${c.id}`,
        category: 'inactive',
        title: `Client Follow-up: ${c.name}`,
        message: `${c.name} (+91 ${c.phone}) has no recent appointments recorded. Consider sending a welcome salon promotion.`,
        time: '1 hour ago',
        type: 'info',
        isRead: false,
        actionTarget: 'customers',
        actionLabel: 'View Customer'
      });
    });

    // 4. Today's billing summary
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBills = bills.filter(b => b.date === todayStr);
    if (todayBills.length > 0) {
      alerts.push({
        id: `notif-bills-${todayStr}`,
        category: 'billing',
        title: `Today's Billing Activity`,
        message: `${todayBills.length} POS bills generated today. Total collected: ₹${todayBills.reduce((acc, b) => acc + (b.totalAmount || 0), 0).toLocaleString()}.`,
        time: 'Just now',
        type: 'success',
        isRead: false,
        actionTarget: 'billing',
        actionLabel: 'View POS Counter'
      });
    }

    setNotifications(alerts.length > 0 ? alerts : INITIAL_NOTIFICATIONS);
    showToast('Notification center refreshed');
  };

  const updateReceiptSettings = (newSettings) => {
    setReceiptSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Receipt printing configurations saved successfully!');
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

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
        notifications,
        unreadNotificationsCount,
        receiptSettings,
        updateReceiptSettings,
        activeMenu,
        setActiveMenu,
        toastMessage,
        showToast,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        toggleEmployeeAttendance,
        addService,
        updateService,
        deleteService,
        addProduct,
        updateProduct,
        restockProduct,
        deleteProduct,
        addMembership,
        assignMembershipToCustomer,
        renewCustomerMembership,
        cancelCustomerMembership,
        addPackage,
        createBill,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        refreshNotifications
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
