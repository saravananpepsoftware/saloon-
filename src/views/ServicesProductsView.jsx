import React, { useState, useMemo } from 'react';
import {
  Scissors,
  Package,
  Plus,
  Search,
  Printer,
  FileSpreadsheet,
  FileText,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  X,
  ChevronDown,
  Sparkles,
  Tag,
  FolderTree,
  Users,
  Database,
  ArrowUpRight,
  Phone,
  Mail,
  Truck,
  RotateCcw,
  Check
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';
import Modal from '../components/Modal';

export default function ServicesProductsView() {
  const {
    services,
    products,
    addService,
    updateService,
    deleteService,
    addProduct,
    updateProduct,
    restockProduct,
    deleteProduct,
    showToast
  } = useSaloon();

  // Top Tabs: 'services' | 'products'
  const [activeTab, setActiveTab] = useState('products');

  // ==========================================
  // SERVICES TAB STATE
  // ==========================================
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all');

  const [customCategories, setCustomCategories] = useState([
    'Grooming Services',
    'Makeup & Styling',
    'Skin Care',
    'Hair Care',
    'Hair Cut & Styling',
    'Facial & Skincare',
    'Hair Straightening & Coloring',
    'Beard Grooming & Shaving',
    'Spa, D-Tan & Massage'
  ]);

  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'Grooming Services',
    price: '',
    description: '',
    status: 'active'
  });

  // ==========================================
  // PRODUCTS TAB STATE
  // ==========================================
  // Sub-tabs under Products: 'inventory' | 'alerts' | 'suppliers'
  const [productSubTab, setProductSubTab] = useState('inventory');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals for Products
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [restockingProduct, setRestockingProduct] = useState(null);
  const [restockSupplierId, setRestockSupplierId] = useState('');
  const [restockUnits, setRestockUnits] = useState(30);
  const [restockPhone, setRestockPhone] = useState('');
  const [restockMessage, setRestockMessage] = useState('');

  // Procurement & Restock Transaction History Ledger
  const INITIAL_RESTOCK_LEDGER = [
    {
      id: 'led-1',
      date: 'Aug 1, 2026, 1:20 PM',
      productName: 'Cetaphil Gentle Skin Cleanser 250ml',
      supplier: 'jobsparke',
      qtyAdded: 30,
      costPrice: 250.00,
      totalOutlay: 7500.00,
      status: 'RECEIVED'
    },
    {
      id: 'led-2',
      date: 'Jul 28, 2026, 11:45 AM',
      productName: "L'Oreal Professional Shampoo 300ml",
      supplier: "L'Oreal Professional Distribution",
      qtyAdded: 20,
      costPrice: 450.00,
      totalOutlay: 9000.00,
      status: 'RECEIVED'
    },
    {
      id: 'led-3',
      date: 'Jul 24, 2026, 4:15 PM',
      productName: 'MAC Prep + Prime Fix+ 100ml',
      supplier: 'MAC Cosmetics Trade India',
      qtyAdded: 15,
      costPrice: 1400.00,
      totalOutlay: 21000.00,
      status: 'RECEIVED'
    }
  ];

  const [restockLedger, setRestockLedger] = useState(() => {
    try {
      const saved = localStorage.getItem('phoenix_restock_ledger');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading restock ledger', e);
    }
    return INITIAL_RESTOCK_LEDGER;
  });

  // Product Form state matching exact fields
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Skin Care',
    sku: '',
    barcode: '',
    purchasePrice: '',
    mrp: '0',
    sellingPrice: '',
    stock: 20,
    lowStockLimit: 5,
    supplierName: 'General Salon Distributor',
    description: '',
    status: 'active'
  });

  // Suppliers Directory Data
  const DEFAULT_SUPPLIERS = [
    {
      id: 'sup-1',
      name: 'jobsparke',
      contactName: 'Kumara samy',
      phone: '8754193625',
      email: 'gmadara93@gmail.com',
      address: 'no 17, moogambigai street, sedarapet, puducherry, India'
    },
    {
      id: 'sup-2',
      name: 'Cetaphil Wellness Distributors',
      contactName: 'Arun Kumar',
      phone: '+91 98401 22889',
      email: 'orders@cetaphilwellness.in',
      address: 'Mumbai Central Supply Hub, Maharashtra, India'
    },
    {
      id: 'sup-3',
      name: "L'Oreal Professional Distribution",
      contactName: 'Megha Singhania',
      phone: '+91 98112 55678',
      email: 'salonorders@lorealindia.com',
      address: 'Bengaluru Trade Center, Karnataka, India'
    },
    {
      id: 'sup-4',
      name: 'MAC Cosmetics Trade India',
      contactName: 'Rohan Varma',
      phone: '+91 97234 88123',
      email: 'protrade@maccosmetics.in',
      address: 'Delhi NCR Fulfillment Center, Delhi, India'
    },
    {
      id: 'sup-5',
      name: 'Moroccanoil Global Logistics',
      contactName: 'Sanjay Reddy',
      phone: '+91 99450 11998',
      email: 'supply@moroccanoil-in.com',
      address: 'Hyderabad Logistics Hub, Telangana, India'
    }
  ];

  const [suppliersList, setSuppliersList] = useState(() => {
    try {
      const saved = localStorage.getItem('phoenix_suppliers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading suppliers', e);
    }
    return DEFAULT_SUPPLIERS;
  });

  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: ''
  });

  // Derived Categories
  const allServiceCategories = useMemo(() => {
    const set = new Set(customCategories);
    services.forEach(s => {
      const cat = s.category || s.department;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [services, customCategories]);

  const allProductCategories = useMemo(() => {
    const set = new Set(['Skin Care', 'Hair Care', 'Makeup & Styling', 'Beard Care', 'Styling Wax', 'Skin Treatment']);
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const cat = s.category || s.department || '';
      const matchSearch =
        serviceSearch.trim() === '' ||
        s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(serviceSearch.toLowerCase()));

      const matchCategory =
        serviceCategoryFilter === 'all' || cat.toLowerCase() === serviceCategoryFilter.toLowerCase();

      return matchSearch && matchCategory;
    });
  }, [services, serviceSearch, serviceCategoryFilter]);

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = productSearch.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));

      const matchCategory =
        productCategoryFilter === 'all' || (p.category && p.category.toLowerCase() === productCategoryFilter.toLowerCase());

      const limit = p.lowStockLimit !== undefined ? p.lowStockLimit : 5;
      const isLow = (p.stock || 0) <= limit;
      const matchLowStock = !lowStockOnly || isLow;

      return matchSearch && matchCategory && matchLowStock;
    });
  }, [products, productSearch, productCategoryFilter, lowStockOnly]);

  // Count of items low on stock
  const lowStockCount = useMemo(() => {
    return products.filter(p => (p.stock || 0) <= (p.lowStockLimit !== undefined ? p.lowStockLimit : 5)).length;
  }, [products]);

  // ==========================================
  // SERVICE HANDLERS
  // ==========================================
  const handleOpenAddService = () => {
    setServiceForm({
      name: '',
      category: allServiceCategories[0] || 'Grooming Services',
      price: '',
      description: '',
      status: 'active'
    });
    setIsAddServiceModalOpen(true);
  };

  const handleSaveAddService = (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim() || !serviceForm.price) return;

    addService({
      name: serviceForm.name.trim(),
      department: serviceForm.category.trim(),
      price: parseFloat(serviceForm.price),
      duration: 30,
      description: serviceForm.description.trim(),
      status: serviceForm.status || 'active'
    });

    setIsAddServiceModalOpen(false);
  };

  const handleOpenEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      category: service.category || service.department || 'Grooming Services',
      price: service.price,
      description: service.description || '',
      status: service.status || 'active'
    });
  };

  const handleSaveEditService = (e) => {
    e.preventDefault();
    if (!editingService || !serviceForm.name.trim() || !serviceForm.price) return;

    updateService(editingService.id, {
      name: serviceForm.name.trim(),
      department: serviceForm.category.trim(),
      category: serviceForm.category.trim(),
      price: parseFloat(serviceForm.price),
      description: serviceForm.description.trim(),
      status: serviceForm.status || 'active'
    });

    setEditingService(null);
  };

  const handleConfirmDeleteService = () => {
    if (deletingService) {
      deleteService(deletingService.id);
      setDeletingService(null);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    const cat = newCategoryInput.trim();
    if (!customCategories.includes(cat)) {
      setCustomCategories(prev => [...prev, cat]);
      showToast(`Category "${cat}" added!`);
    }
    setNewCategoryInput('');
  };

  // ==========================================
  // PRODUCT HANDLERS
  // ==========================================
  const handleOpenAddProduct = () => {
    const randomCode = Math.floor(100 + Math.random() * 900);
    setProductForm({
      name: '',
      category: allProductCategories[0] || 'Skin Care',
      sku: `SK-${randomCode}`,
      barcode: `890${Date.now().toString().slice(-8)}`,
      purchasePrice: '',
      mrp: '0',
      sellingPrice: '',
      stock: 20,
      lowStockLimit: 5,
      supplierName: suppliersList[0]?.name || 'General Salon Distributor',
      description: '',
      status: 'active'
    });
    setIsAddProductModalOpen(true);
  };

  const handleSaveAddProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.sellingPrice) return;

    addProduct({
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      sku: (productForm.sku || `SK-${Date.now().toString().slice(-4)}`).trim(),
      barcode: (productForm.barcode || '').trim(),
      purchasePrice: parseFloat(productForm.purchasePrice) || 0,
      mrp: parseFloat(productForm.mrp) || 0,
      sellingPrice: parseFloat(productForm.sellingPrice),
      price: parseFloat(productForm.sellingPrice),
      stock: parseInt(productForm.stock) || 0,
      lowStockLimit: parseInt(productForm.lowStockLimit) || 5,
      supplierName: productForm.supplierName.trim(),
      description: productForm.description.trim(),
      status: productForm.status || 'active'
    });

    setIsAddProductModalOpen(false);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category || 'Skin Care',
      sku: product.sku || `SKU-${product.id}`,
      barcode: product.barcode || '',
      purchasePrice: product.purchasePrice !== undefined ? product.purchasePrice : Math.round((product.price || 400) * 0.65),
      mrp: product.mrp !== undefined ? product.mrp : 0,
      sellingPrice: product.sellingPrice || product.price || 390,
      stock: product.stock !== undefined ? product.stock : 20,
      lowStockLimit: product.lowStockLimit !== undefined ? product.lowStockLimit : 5,
      supplierName: product.supplierName || 'General Salon Distributor',
      description: product.description || '',
      status: product.status || 'active'
    });
  };

  const handleSaveEditProduct = (e) => {
    e.preventDefault();
    if (!editingProduct || !productForm.name.trim() || !productForm.sellingPrice) return;

    updateProduct(editingProduct.id, {
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      sku: (productForm.sku || editingProduct.sku || '').trim(),
      barcode: (productForm.barcode || editingProduct.barcode || '').trim(),
      purchasePrice: parseFloat(productForm.purchasePrice) || 0,
      mrp: parseFloat(productForm.mrp) || 0,
      sellingPrice: parseFloat(productForm.sellingPrice),
      price: parseFloat(productForm.sellingPrice),
      stock: parseInt(productForm.stock) || 0,
      lowStockLimit: parseInt(productForm.lowStockLimit) || 5,
      supplierName: productForm.supplierName.trim(),
      description: productForm.description.trim(),
      status: productForm.status || 'active'
    });

    setEditingProduct(null);
  };

  const formatPoMessage = (product, units) => {
    return `Hello Supplier,

We need to place a restock order for the following item:
- Product: ${product?.name || ''}
- SKU: ${product?.sku || `SC-${(product?.name || 'PRD').slice(0, 3).toUpperCase()}-250`}
- Current Stock: ${product?.stock || 0}
- Restock Order Quantity: ${units || 30} units

Please confirm availability and dispatch schedule.
Thank you!`;
  };

  const handleOpenRestock = (product) => {
    setRestockingProduct(product);
    const matchedSup =
      suppliersList.find(s => s.name === product.supplierName) ||
      suppliersList[0] ||
      { id: 'sup-1', name: 'jobsparke', phone: '8754193625' };

    const initialUnits = 30;
    setRestockSupplierId(matchedSup.id);
    setRestockUnits(initialUnits);
    setRestockPhone(matchedSup.phone || '8754193625');
    setRestockMessage(formatPoMessage(product, initialUnits));
  };

  const handleSupplierSelect = (supId) => {
    setRestockSupplierId(supId);
    const sup = suppliersList.find(s => s.id === supId);
    if (sup) {
      setRestockPhone(sup.phone || '');
    }
  };

  const handleRestockUnitsChange = (val) => {
    const qty = parseInt(val) || 0;
    setRestockUnits(qty);
    setRestockMessage(formatPoMessage(restockingProduct, qty));
  };

  const handleCopyNote = () => {
    if (!restockMessage) return;
    navigator.clipboard.writeText(restockMessage);
    showToast('Purchase order note copied to clipboard!');
  };

  const handleOrderOnWA = () => {
    if (!restockPhone) {
      showToast('Please enter a valid WhatsApp phone number!');
      return;
    }
    let cleanPhone = restockPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(restockMessage)}`;
    window.open(url, '_blank');
    showToast('Opening WhatsApp with purchase order...');
  };

  const handleConfirmRestock = (e) => {
    e?.preventDefault();
    if (!restockingProduct || restockUnits <= 0) return;

    const units = parseInt(restockUnits) || 1;
    const cost = Number(restockingProduct.purchasePrice) || Math.round((restockingProduct.price || 400) * 0.65);
    const total = units * cost;
    const sup =
      suppliersList.find(s => s.id === restockSupplierId)?.name ||
      restockingProduct.supplierName ||
      'jobsparke';

    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ', ' +
      now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const newEntry = {
      id: `led-${Date.now()}`,
      date: formattedDate,
      productName: restockingProduct.name,
      supplier: sup,
      qtyAdded: units,
      costPrice: cost,
      totalOutlay: total,
      status: 'RECEIVED'
    };

    const updatedLedger = [newEntry, ...restockLedger];
    setRestockLedger(updatedLedger);
    try {
      localStorage.setItem('phoenix_restock_ledger', JSON.stringify(updatedLedger));
    } catch (err) {}

    restockProduct(restockingProduct.id, units);
    showToast(`Restocked +${units} units of "${restockingProduct.name}" and logged in ledger!`);
    setRestockingProduct(null);
  };

  const handlePrintLedger = () => {
    window.print();
  };

  const handleExportLedgerCSV = () => {
    const headers = ['Date & Time', 'Product Details', 'Supplier', 'Qty Added', 'Cost Price (INR)', 'Total Outlay (INR)', 'Status'];
    const rows = restockLedger.map(item => [
      `"${item.date}"`,
      `"${(item.productName || '').replace(/"/g, '""')}"`,
      `"${(item.supplier || '').replace(/"/g, '""')}"`,
      item.qtyAdded,
      item.costPrice,
      item.totalOutlay,
      item.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restock_transaction_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Restock ledger exported to CSV/Excel successfully!');
  };

  const handleConfirmDeleteProduct = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  // ==========================================
  // SUPPLIER ACTIONS
  // ==========================================
  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: ''
    });
    setIsAddSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name || '',
      contactName: supplier.contactName || supplier.contactPerson || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || supplier.location || ''
    });
    setIsAddSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e) => {
    e?.preventDefault();
    if (!supplierForm.name.trim()) {
      showToast('Supplier Name is required!');
      return;
    }

    let updatedList;
    if (editingSupplier) {
      updatedList = suppliersList.map(s =>
        s.id === editingSupplier.id
          ? {
              ...s,
              name: supplierForm.name.trim(),
              contactName: supplierForm.contactName.trim(),
              phone: supplierForm.phone.trim(),
              email: supplierForm.email.trim(),
              address: supplierForm.address.trim()
            }
          : s
      );
      showToast('Supplier updated successfully!');
    } else {
      const newSupplier = {
        id: `sup-${Date.now()}`,
        name: supplierForm.name.trim(),
        contactName: supplierForm.contactName.trim(),
        phone: supplierForm.phone.trim(),
        email: supplierForm.email.trim(),
        address: supplierForm.address.trim()
      };
      updatedList = [newSupplier, ...suppliersList];
      showToast('Supplier added successfully!');
    }

    setSuppliersList(updatedList);
    try {
      localStorage.setItem('phoenix_suppliers', JSON.stringify(updatedList));
    } catch (err) {}
    setIsAddSupplierModalOpen(false);
    setEditingSupplier(null);
  };

  const handleConfirmDeleteSupplier = () => {
    if (!deletingSupplier) return;
    const updatedList = suppliersList.filter(s => s.id !== deletingSupplier.id);
    setSuppliersList(updatedList);
    try {
      localStorage.setItem('phoenix_suppliers', JSON.stringify(updatedList));
    } catch (err) {}
    showToast(`Supplier "${deletingSupplier.name}" deleted.`);
    setDeletingSupplier(null);
  };

  // ==========================================
  // EXPORT HANDLERS (PRINT, EXCEL / CSV, PDF)
  // ==========================================
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (activeTab === 'services') {
      const headers = ['Service Name', 'Category', 'Price (INR)', 'Status'];
      const rows = filteredServices.map(s => [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${(s.category || s.department || '').replace(/"/g, '""')}"`,
        s.price,
        s.status || 'active'
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `services_catalog_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Services exported to CSV/Excel successfully!');
    } else if (productSubTab === 'suppliers') {
      const headers = ['Supplier Name', 'Contact Name', 'Phone/WhatsApp', 'Email', 'Address'];
      const rows = suppliersList.map(s => [
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${(s.contactName || s.contactPerson || '').replace(/"/g, '""')}"`,
        `"${(s.phone || '').replace(/"/g, '""')}"`,
        `"${(s.email || '').replace(/"/g, '""')}"`,
        `"${(s.address || s.location || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `suppliers_directory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Suppliers exported to CSV/Excel successfully!');
    } else {
      const headers = ['Product Name', 'Category', 'Purchase Price', 'MRP', 'Selling Price', 'Stock Level', 'Limit', 'Supplier'];
      const rows = filteredProducts.map(p => [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        p.purchasePrice || 0,
        p.mrp || 0,
        p.sellingPrice || p.price || 0,
        p.stock || 0,
        p.lowStockLimit || 5,
        `"${(p.supplierName || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `products_inventory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Products exported to CSV/Excel successfully!');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Tab Bar: Services Catalog vs Products Inventory */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'services'
              ? 'gold-gradient-btn text-white shadow-md'
              : 'bg-white text-[#646875] border border-[#EBE8DE] hover:bg-[#FAF9F5]'
          }`}
        >
          <Scissors size={16} />
          Services Catalog
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'products'
              ? 'gold-gradient-btn text-white shadow-md'
              : 'bg-white text-[#646875] border border-[#EBE8DE] hover:bg-[#FAF9F5]'
          }`}
        >
          <Package size={16} />
          Products Inventory
        </button>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: SERVICES & TREATMENTS CATALOG                    */}
      {/* ======================================================== */}
      {activeTab === 'services' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                Services & Treatments Catalog
              </h2>
              <p className="text-xs text-[#646875] mt-0.5">
                Manage service offerings, category partitions, and pricing.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsManageCategoriesModalOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-[#EBE8DE] text-[#18191B] hover:border-[#D4AF37] hover:bg-[#FAF9F5] shadow-xs flex items-center gap-1.5 transition-all"
              >
                <FolderTree size={14} className="text-[#C59B27]" />
                Manage Categories
              </button>

              <button
                type="button"
                onClick={handleOpenAddService}
                className="gold-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus size={15} /> + Add Service
              </button>
            </div>
          </div>

          {/* Search, Filter & Export Action Bar */}
          <div className="luxury-card bg-white p-4 rounded-2xl border border-[#EFECE1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9499A8]" size={16} />
              <input
                type="text"
                placeholder="Search services by name or description..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[170px]">
                <select
                  value={serviceCategoryFilter}
                  onChange={(e) => setServiceCategoryFilter(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs font-semibold text-[#18191B] focus:outline-none focus:border-[#D4AF37] cursor-pointer pr-9"
                >
                  <option value="all">All Categories</option>
                  {allServiceCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9499A8] pointer-events-none" size={15} />
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2.5 rounded-xl border border-[#EBE8DE] bg-white hover:bg-[#FAF9F5] text-xs font-bold text-[#646875] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer size={14} /> Print
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2.5 rounded-xl border border-[#EBE8DE] bg-white hover:bg-[#FAF9F5] text-xs font-bold text-[#059669] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileSpreadsheet size={14} /> Excel
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                className="px-3.5 py-2.5 rounded-xl border border-[#EBE8DE] bg-white hover:bg-[#FAF9F5] text-xs font-bold text-[#DC2626] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileText size={14} /> PDF
              </button>
            </div>
          </div>

          {/* Services Table */}
          <div className="luxury-card bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F2] text-[#646875] border-b border-[#EBE8DE] text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-5">SERVICE NAME</th>
                    <th className="py-3.5 px-5">CATEGORY</th>
                    <th className="py-3.5 px-5">PRICE</th>
                    <th className="py-3.5 px-5">STATUS</th>
                    <th className="py-3.5 px-5 text-center">ACTIONS</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#F0EBE0]">
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#9499A8]">
                        <p className="text-sm font-semibold">No services found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((service) => (
                      <tr key={service.id} className="hover:bg-[#FAF9F5] transition-colors">
                        <td className="py-3.5 px-5">
                          <p className="font-extrabold text-sm text-[#18191B]">{service.name}</p>
                          {service.description && (
                            <p className="text-[11px] text-[#646875] line-clamp-1 max-w-sm mt-0.5">
                              {service.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-[#646875] font-medium">
                          {service.category || service.department || 'General Services'}
                        </td>
                        <td className="py-3.5 px-5 font-mono font-bold text-sm text-[#18191B]">
                          ₹{Number(service.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold lowercase border ${
                              (service.status || 'active') === 'active'
                                ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                                : 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]'
                            }`}
                          >
                            {service.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenEditService(service)}
                              className="font-bold text-xs text-[#059669] hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingService(service)}
                              className="font-bold text-xs text-[#DC2626] hover:underline"
                            >
                              Delete
                            </button>
                          </div>
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
      {/* VIEW 2: PRODUCTS INVENTORY & SUPPLIER MODULE             */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-5">
          {/* Header Row: Exact match from screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
                Inventory & Supplier Module
              </h2>
              <p className="text-xs text-[#646875] mt-0.5">
                Track retail stock levels, purchase history ledger, and coordinate supplier order transactions.
              </p>
            </div>

            {productSubTab === 'suppliers' ? (
              <button
                type="button"
                onClick={handleOpenAddSupplier}
                className="gold-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={15} /> + Add Supplier
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddProduct}
                className="gold-gradient-btn px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={15} /> + Add Product
              </button>
            )}
          </div>

          {/* Sub-Tabs: Inventory Catalog | Stock Alerts & Reorders | Supplier Directory */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FAF9F5] border border-[#EBE8DE] rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => {
                setProductSubTab('inventory');
                setLowStockOnly(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                productSubTab === 'inventory'
                  ? 'bg-white text-[#9E7814] shadow-sm border border-[#D4AF37]/40'
                  : 'text-[#646875] hover:text-[#18191B]'
              }`}
            >
              <Database size={14} className="text-[#C59B27]" />
              Inventory Catalog
            </button>

            <button
              type="button"
              onClick={() => {
                setProductSubTab('alerts');
                setLowStockOnly(true);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                productSubTab === 'alerts'
                  ? 'bg-white text-[#9E7814] shadow-sm border border-[#D4AF37]/40'
                  : 'text-[#646875] hover:text-[#18191B]'
              }`}
            >
              <AlertTriangle size={14} className="text-amber-500" />
              Stock Alerts & Reorders
              {lowStockCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-600 font-bold">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setProductSubTab('suppliers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                productSubTab === 'suppliers'
                  ? 'bg-white text-[#9E7814] shadow-sm border border-[#D4AF37]/40'
                  : 'text-[#646875] hover:text-[#18191B]'
              }`}
            >
              <Users size={14} className="text-[#C59B27]" />
              Supplier Directory
            </button>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SUB-TABS 1 & 2: INVENTORY & STOCK ALERTS CATALOG     */}
          {/* ---------------------------------------------------- */}
          {(productSubTab === 'inventory' || productSubTab === 'alerts') && (
            <div className="space-y-4">
              {/* Search, Filter Bar with Low Stock Checkbox & Exports */}
              <div className="luxury-card bg-white p-4 rounded-2xl border border-[#EFECE1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9499A8]" size={16} />
                  <input
                    type="text"
                    placeholder="Search products by name or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[150px]">
                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs font-semibold text-[#18191B] focus:outline-none focus:border-[#D4AF37] cursor-pointer pr-9"
                    >
                      <option value="all">All Categories</option>
                      {allProductCategories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9499A8] pointer-events-none" size={15} />
                  </div>

                  {/* Low Stock Checkbox Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setLowStockOnly(!lowStockOnly)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                      lowStockOnly
                        ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs'
                        : 'bg-white text-[#646875] border-[#EBE8DE] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={lowStockOnly}
                      onChange={() => {}}
                      className="rounded pointer-events-none text-[#C59B27] focus:ring-0"
                    />
                    <AlertTriangle size={13} className={lowStockOnly ? 'text-amber-600' : 'text-[#9499A8]'} />
                    Low Stock Only
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-2 rounded-xl border border-[#EBE8DE] bg-white hover:bg-[#FAF9F5] text-xs font-bold text-[#646875] flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Printer size={14} /> Print
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3 py-2 rounded-xl border border-[#EBE8DE] bg-white hover:bg-[#FAF9F5] text-xs font-bold text-[#059669] flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FileSpreadsheet size={14} /> Excel
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="px-3 py-2 rounded-xl border border-[#EBE8DE] bg-white hover:bg-[#FAF9F5] text-xs font-bold text-[#DC2626] flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FileText size={14} /> PDF
                  </button>
                </div>
              </div>

              {/* Exact Table Columns from Screenshot */}
              <div className="luxury-card bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF8F2] text-[#646875] border-b border-[#EBE8DE] text-[11px] uppercase tracking-wider font-bold">
                        <th className="py-3.5 px-4 min-w-[220px]">PRODUCT DETAILS</th>
                        <th className="py-3.5 px-4 text-right">PURCHASE PRICE</th>
                        <th className="py-3.5 px-4 text-right font-black">MRP</th>
                        <th className="py-3.5 px-4 text-right">SELLING PRICE</th>
                        <th className="py-3.5 px-4 text-center min-w-[120px]">STOCK LEVEL</th>
                        <th className="py-3.5 px-4 text-center min-w-[160px]">ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#F0EBE0]">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-[#9499A8]">
                            <p className="text-sm font-semibold">No products found</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Try clearing filters or search queries.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => {
                          const limit = product.lowStockLimit !== undefined ? product.lowStockLimit : 5;
                          const isLow = (product.stock || 0) <= limit;
                          const purchasePrice = product.purchasePrice !== undefined ? product.purchasePrice : Math.round((product.price || 400) * 0.65);
                          const mrp = product.mrp !== undefined ? product.mrp : 0;
                          const sellingPrice = product.sellingPrice || product.price || 390;

                          return (
                            <tr key={product.id} className="hover:bg-[#FAF9F5] transition-colors">
                              {/* 1. PRODUCT DETAILS */}
                              <td className="py-3.5 px-4">
                                <p className="font-extrabold text-sm text-[#18191B]">{product.name}</p>
                                <p className="text-[11px] text-[#646875] mt-0.5">{product.category || 'Skin Care'}</p>
                              </td>

                              {/* 2. PURCHASE PRICE */}
                              <td className="py-3.5 px-4 text-right font-mono text-sm text-[#646875]">
                                ₹{Number(purchasePrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* 4. MRP */}
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#18191B]">
                                ₹{Number(mrp).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* 5. SELLING PRICE */}
                              <td className="py-3.5 px-4 text-right font-mono text-sm text-[#18191B]">
                                ₹{Number(sellingPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* 6. STOCK LEVEL */}
                              <td className="py-3.5 px-4 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className={`font-mono font-bold text-sm ${isLow ? 'text-red-500' : 'text-[#18191B]'}`}>
                                    {product.stock || 0} units
                                  </span>
                                  <span className="text-[10px] text-[#9499A8]">
                                    Limit: {limit}
                                  </span>
                                  {isLow && (
                                    <span className="mt-1 px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-red-100 text-red-600 border border-red-200">
                                      Low Stock
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 7. ACTIONS (Restock, Edit, Delete) */}
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRestock(product)}
                                    className="px-2.5 py-1 rounded-lg bg-[#FAF6EA] border border-[#D4AF37]/50 text-[#9E7814] hover:bg-[#F5EAC4] font-bold text-xs inline-flex items-center gap-1 shadow-xs transition-colors"
                                  >
                                    <Check size={12} /> Restock
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditProduct(product)}
                                    className="font-bold text-xs text-[#059669] hover:underline"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setDeletingProduct(product)}
                                    className="font-bold text-xs text-[#DC2626] hover:underline"
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
              </div>

              {/* Pagination bar matching screenshot */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-xl border border-[#EBE8DE] text-xs font-semibold text-[#9499A8] bg-[#FAF9F5] cursor-not-allowed opacity-60"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded-xl border border-[#EBE8DE] text-xs font-semibold text-[#9499A8] bg-[#FAF9F5] cursor-not-allowed opacity-60"
                >
                  Next
                </button>
              </div>

              {/* Procurement & Restock Transaction History Ledger */}
              {productSubTab === 'alerts' && (
                <div className="luxury-card bg-white rounded-2xl border border-[#EFECE1] shadow-xs overflow-hidden mt-6">
                  {/* Ledger Header */}
                  <div className="px-5 py-4 border-b border-[#F0EBE0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FCFCFA]">
                    <div>
                      <h3 className="text-sm font-bold text-[#18191B] tracking-wide">
                        Procurement & Restock Transaction History Ledger
                      </h3>
                      <p className="text-xs text-[#646875] mt-0.5">
                        Audit history logs of stock entries, WhatsApp purchase orders, and warehouse shipments.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrintLedger}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EBE8DE] text-xs font-bold text-[#646875] hover:text-[#18191B] hover:border-[#D4AF37] flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Printer size={13} className="text-[#646875]" />
                        Print Ledger
                      </button>
                      <button
                        type="button"
                        onClick={handleExportLedgerCSV}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EBE8DE] text-xs font-bold text-[#059669] hover:border-[#059669] flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <FileSpreadsheet size={13} className="text-[#059669]" />
                        Excel Ledger
                      </button>
                    </div>
                  </div>

                  {/* Ledger Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FAF8F2] text-[#646875] border-b border-[#EBE8DE] text-[11px] uppercase tracking-wider font-bold">
                          <th className="py-3 px-5 min-w-[150px]">DATE & TIME</th>
                          <th className="py-3 px-5 min-w-[220px]">PRODUCT DETAILS</th>
                          <th className="py-3 px-5 min-w-[140px]">SUPPLIER</th>
                          <th className="py-3 px-5 text-center min-w-[100px]">QTY ADDED</th>
                          <th className="py-3 px-5 text-right min-w-[110px]">COST PRICE</th>
                          <th className="py-3 px-5 text-right min-w-[120px]">TOTAL OUTLAY</th>
                          <th className="py-3 px-5 text-center min-w-[100px]">STATUS</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#F0EBE0]">
                        {restockLedger.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-[#9499A8]">
                              <p className="text-xs font-semibold">No restock transactions logged yet.</p>
                            </td>
                          </tr>
                        ) : (
                          restockLedger.map((row) => (
                            <tr key={row.id} className="hover:bg-[#FAF9F5] transition-colors">
                              <td className="py-3.5 px-5 font-mono text-xs text-[#646875]">
                                {row.date}
                              </td>
                              <td className="py-3.5 px-5 font-bold text-xs text-[#18191B]">
                                {row.productName}
                              </td>
                              <td className="py-3.5 px-5">
                                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F5F2EB] text-[#646875] border border-[#E8E2D4]">
                                  {row.supplier}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-center font-mono font-bold text-sm text-[#059669]">
                                +{row.qtyAdded}
                              </td>
                              <td className="py-3.5 px-5 text-right font-mono text-xs text-[#646875]">
                                ₹{Number(row.costPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3.5 px-5 text-right font-mono font-bold text-xs text-[#18191B]">
                                ₹{Number(row.totalOutlay).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="py-3.5 px-5 text-center">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                                  {row.status || 'RECEIVED'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SUB-TAB 3: SUPPLIER DIRECTORY                        */}
          {/* ---------------------------------------------------- */}
          {productSubTab === 'suppliers' && (
            <div className="space-y-4">
              <div className="luxury-card bg-white rounded-2xl border border-[#EFECE1] shadow-xs overflow-hidden">
                {/* Header Toolbar matching screenshot */}
                <div className="px-5 py-3.5 border-b border-[#F0EBE0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FCFCFA]">
                  <h3 className="text-sm font-bold text-[#18191B]">
                    Suppliers List ({suppliersList.length})
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EBE8DE] text-xs font-bold text-[#646875] hover:text-[#18191B] hover:border-[#D4AF37] flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Printer size={13} className="text-[#646875]" />
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EBE8DE] text-xs font-bold text-[#646875] hover:text-[#18191B] hover:border-[#D4AF37] flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <FileSpreadsheet size={13} className="text-[#646875]" />
                      Excel
                    </button>
                    <button
                      type="button"
                      onClick={handleExportPDF}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EBE8DE] text-xs font-bold text-[#646875] hover:text-[#18191B] hover:border-[#D4AF37] flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <FileText size={13} className="text-[#646875]" />
                      PDF
                    </button>
                  </div>
                </div>

                {/* Suppliers Table matching exact columns */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF8F2] text-[#646875] border-b border-[#EBE8DE] text-[11px] uppercase tracking-wider font-bold">
                        <th className="py-3.5 px-5 min-w-[170px]">SUPPLIER NAME</th>
                        <th className="py-3.5 px-5 min-w-[150px]">CONTACT NAME</th>
                        <th className="py-3.5 px-5 min-w-[140px]">PHONE/WHATSAPP</th>
                        <th className="py-3.5 px-5 min-w-[190px]">EMAIL</th>
                        <th className="py-3.5 px-5 min-w-[280px]">ADDRESS</th>
                        <th className="py-3.5 px-5 text-right min-w-[100px]">ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#F0EBE0]">
                      {suppliersList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-[#9499A8]">
                            <p className="text-sm font-semibold">No suppliers found</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Click "+ Add Supplier" to register your vendor contacts.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        suppliersList.map((sup) => (
                          <tr key={sup.id} className="hover:bg-[#FAF9F5] transition-colors">
                            <td className="py-3.5 px-5 font-bold text-sm text-[#18191B]">
                              {sup.name}
                            </td>
                            <td className="py-3.5 px-5 text-xs text-[#646875]">
                              {sup.contactName || sup.contactPerson || '-'}
                            </td>
                            <td className="py-3.5 px-5 font-mono text-xs text-[#646875]">
                              {sup.phone || '-'}
                            </td>
                            <td className="py-3.5 px-5 text-xs text-[#646875]">
                              {sup.email || '-'}
                            </td>
                            <td className="py-3.5 px-5 text-xs text-[#646875]">
                              <p className="truncate max-w-[260px]" title={sup.address || sup.location}>
                                {sup.address || sup.location || '-'}
                              </p>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditSupplier(sup)}
                                  className="p-1.5 text-[#C59B27] hover:bg-[#FAF6EA] rounded-lg transition-colors"
                                  title="Edit Supplier"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingSupplier(sup)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Supplier"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
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
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT SERVICE                                */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAddServiceModalOpen || Boolean(editingService)}
        onClose={() => {
          setIsAddServiceModalOpen(false);
          setEditingService(null);
        }}
        title={editingService ? 'Edit Service' : 'Add New Service Offering'}
        subtitle="Configure service title, department category, and price"
      >
        <form onSubmit={editingService ? handleSaveEditService : handleSaveAddService} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Service Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Signature Beard Styling & Trim"
              value={serviceForm.name}
              onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Category *
              </label>
              <select
                value={serviceForm.category}
                onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                {allServiceCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                placeholder="e.g. 450"
                value={serviceForm.price}
                onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Status
            </label>
            <select
              value={serviceForm.status}
              onChange={(e) => setServiceForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Service Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Precision scissor cut with gold serum styling."
              value={serviceForm.description}
              onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => {
                setIsAddServiceModalOpen(false);
                setEditingService(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md"
            >
              {editingService ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT                                */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAddProductModalOpen || Boolean(editingProduct)}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Inventory Product' : 'Add New Inventory Product'}
        subtitle="Manage product details, pricing, stock levels, and preferred supplier"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={editingProduct ? handleSaveEditProduct : handleSaveAddProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cetaphil Gentle Skin Cleanser 250ml"
              value={productForm.name}
              onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Category *
              </label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                {allProductCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Preferred Supplier
              </label>
              <select
                value={productForm.supplierName}
                onChange={(e) => setProductForm(prev => ({ ...prev, supplierName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
              >
                {suppliersList.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Purchase Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="e.g. 250.00"
                value={productForm.purchasePrice}
                onChange={(e) => setProductForm(prev => ({ ...prev, purchasePrice: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                MRP (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 0.00"
                value={productForm.mrp}
                onChange={(e) => setProductForm(prev => ({ ...prev, mrp: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="e.g. 390.00"
                value={productForm.sellingPrice}
                onChange={(e) => setProductForm(prev => ({ ...prev, sellingPrice: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Initial Stock Level (Units) *
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="e.g. 62"
                value={productForm.stock}
                onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Low Stock Alert Limit *
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 5"
                value={productForm.lowStockLimit}
                onChange={(e) => setProductForm(prev => ({ ...prev, lowStockLimit: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Dermatologist recommended gentle face cleanser."
              value={productForm.description}
              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-[#EBE8DE] text-xs focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => {
                setIsAddProductModalOpen(false);
                setEditingProduct(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md"
            >
              {editingProduct ? 'Save Changes' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: PROCUREMENT PURCHASE ORDER (RESTOCK)              */}
      {/* ======================================================== */}
      {restockingProduct && (
        <Modal
          isOpen={Boolean(restockingProduct)}
          onClose={() => setRestockingProduct(null)}
          title={
            <span className="flex items-center gap-2 text-lg font-bold text-[#18191B]">
              <AlertTriangle size={20} className="text-amber-500 shrink-0" />
              Procurement Purchase Order
            </span>
          }
          maxWidth="max-w-md"
        >
          <div className="space-y-4 p-1">
            {/* Top Amber Highlight Box matching screenshot */}
            <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#F3E5B5] text-xs space-y-1">
              <p className="font-extrabold text-[#784606] text-sm">
                Product: <span className="font-bold text-[#18191B]">{restockingProduct.name}</span>
              </p>
              <p className="text-[#9E7814] font-mono text-[11px]">
                SKU Code: <span className="text-[#18191B] font-semibold">{restockingProduct.sku || `SC-${(restockingProduct.name || 'PRD').slice(0, 3).toUpperCase()}-250`}</span>
              </p>
              <p className="text-[#784606] text-xs">
                Current Stock:{' '}
                <span className="font-bold text-red-600 font-mono text-sm">
                  {restockingProduct.stock || 0}
                </span>{' '}
                <span className="text-[#646875]">(Threshold: {restockingProduct.lowStockLimit !== undefined ? restockingProduct.lowStockLimit : 5})</span>
              </p>
            </div>

            {/* Field 1: Select Supplier from Directory */}
            <div>
              <label className="block text-xs font-bold text-[#646875] mb-1.5">
                Select Supplier from Directory
              </label>
              <div className="relative">
                <select
                  value={restockSupplierId}
                  onChange={(e) => handleSupplierSelect(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-sm font-semibold text-[#18191B] focus:outline-none focus:border-[#D4AF37] cursor-pointer pr-9"
                >
                  {suppliersList.map(sup => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.phone})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9499A8] pointer-events-none" size={15} />
              </div>
            </div>

            {/* Field 2: Restock Order Quantity */}
            <div>
              <label className="block text-xs font-bold text-[#646875] mb-1.5">
                Restock Order Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={restockUnits}
                onChange={(e) => handleRestockUnitsChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-sm font-mono font-bold focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
              />
            </div>

            {/* Field 3: WhatsApp / Phone Number */}
            <div>
              <label className="block text-xs font-bold text-[#646875] mb-1.5">
                WhatsApp / Phone Number
              </label>
              <input
                type="text"
                value={restockPhone}
                onChange={(e) => setRestockPhone(e.target.value)}
                placeholder="e.g. 8754193625"
                className="w-full px-3.5 py-2.5 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-sm font-mono focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
              />
            </div>

            {/* Field 4: Purchase Order Message Preview */}
            <div>
              <label className="block text-xs font-bold text-[#646875] mb-1.5">
                Purchase Order Message Preview
              </label>
              <textarea
                rows={7}
                value={restockMessage}
                onChange={(e) => setRestockMessage(e.target.value)}
                className="w-full p-3 bg-[#FCFCFA] rounded-xl border border-[#EBE8DE] text-xs font-mono text-[#18191B] leading-relaxed focus:outline-none focus:border-[#D4AF37] resize-y"
              />
            </div>

            {/* Action Buttons: 3 buttons side-by-side matching screenshot */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 border-t border-[#F0EBE0]">
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="w-full sm:flex-1 gold-gradient-btn px-3 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                Confirm Restock (Save Entry)
              </button>

              <button
                type="button"
                onClick={handleCopyNote}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#18191B] hover:bg-black text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap"
              >
                Copy Note
              </button>

              <button
                type="button"
                onClick={handleOrderOnWA}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
              >
                Order on WA
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: MANAGE CATEGORIES                                 */}
      {/* ======================================================== */}
      <Modal
        isOpen={isManageCategoriesModalOpen}
        onClose={() => setIsManageCategoriesModalOpen(false)}
        title="Manage Service Categories"
        subtitle="Add, remove, or organize your salon service category partitions"
      >
        <div className="space-y-4">
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="New category name (e.g. Bridal & Pre-Bridal)"
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold shadow-md"
            >
              + Add
            </button>
          </form>

          <div className="max-h-64 overflow-y-auto divide-y divide-[#F0EBE0] border border-[#EBE8DE] rounded-xl">
            {allServiceCategories.map(cat => {
              const count = services.filter(s => (s.category || s.department) === cat).length;
              return (
                <div key={cat} className="p-3 flex items-center justify-between hover:bg-[#FAF9F5]">
                  <div>
                    <span className="font-bold text-sm text-[#18191B]">{cat}</span>
                    <span className="text-xs text-[#9499A8] block">{count} service(s) configured</span>
                  </div>

                  {count === 0 && (
                    <button
                      type="button"
                      onClick={() => setCustomCategories(prev => prev.filter(c => c !== cat))}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={() => setIsManageCategoriesModalOpen(false)}
              className="gold-gradient-btn px-6 py-2 rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION                               */}
      {/* ======================================================== */}
      {(deletingService || deletingProduct) && (
        <Modal
          isOpen={Boolean(deletingService || deletingProduct)}
          onClose={() => {
            setDeletingService(null);
            setDeletingProduct(null);
          }}
          title={deletingService ? 'Delete Service' : 'Delete Product'}
          subtitle="Are you sure you want to delete this item? This action cannot be undone."
          maxWidth="max-w-md"
        >
          <div className="space-y-4 p-2">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              <span className="font-bold block mb-1">Warning:</span>
              You are about to remove{' '}
              <span className="font-bold font-mono">
                {deletingService?.name || deletingProduct?.name}
              </span>
              .
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingService(null);
                  setDeletingProduct(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deletingService ? handleConfirmDeleteService : handleConfirmDeleteProduct}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT SUPPLIER                               */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAddSupplierModalOpen}
        onClose={() => {
          setIsAddSupplierModalOpen(false);
          setEditingSupplier(null);
        }}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        subtitle="Manage vendor contact info, communication channel, and delivery address"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4 p-1">
          <div>
            <label className="block text-xs font-bold text-[#18191B] uppercase tracking-wider mb-1">
              Supplier / Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. jobsparke, L'Oreal Distribution"
              value={supplierForm.name}
              onChange={(e) => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#18191B] uppercase tracking-wider mb-1">
                Contact Name
              </label>
              <input
                type="text"
                placeholder="e.g. Kumara samy"
                value={supplierForm.contactName}
                onChange={(e) => setSupplierForm(prev => ({ ...prev, contactName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18191B] uppercase tracking-wider mb-1">
                Phone / WhatsApp
              </label>
              <input
                type="text"
                placeholder="e.g. 8754193625"
                value={supplierForm.phone}
                onChange={(e) => setSupplierForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE8DE] text-sm font-mono focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18191B] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. gmadara93@gmail.com"
              value={supplierForm.email}
              onChange={(e) => setSupplierForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#18191B] uppercase tracking-wider mb-1">
              Address / Warehouse Location
            </label>
            <textarea
              rows={3}
              placeholder="e.g. no 17, moogambigai street, sedarapet, puducherry, India"
              value={supplierForm.address}
              onChange={(e) => setSupplierForm(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] text-[#18191B]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => {
                setIsAddSupplierModalOpen(false);
                setEditingSupplier(null);
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875] hover:bg-[#FAF9F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-bold shadow-md"
            >
              {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: DELETE SUPPLIER                                   */}
      {/* ======================================================== */}
      {deletingSupplier && (
        <Modal
          isOpen={Boolean(deletingSupplier)}
          onClose={() => setDeletingSupplier(null)}
          title="Delete Supplier"
          subtitle="Are you sure you want to remove this vendor from your directory?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 p-2">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              <span className="font-bold block mb-1">Warning:</span>
              You are about to remove <span className="font-bold font-mono">{deletingSupplier.name}</span>.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSupplier(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSupplier}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
