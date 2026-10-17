import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Plus,
  Clock,
  Tag,
  Scissors,
  Package,
  Layers,
  Search,
  CheckCircle2,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { useSaloon } from '../context/SaloonContext';
import Modal from '../components/Modal';

export default function ServicesProductsView() {
  const {
    services,
    products,
    addService,
    addProduct,
    setActiveMenu
  } = useSaloon();

  const [activeTab, setActiveTab] = useState('services'); // 'services' or 'products'
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // Form state for New Service
  const [serviceForm, setServiceForm] = useState({
    name: '',
    department: 'Hair Cut & Styling',
    price: '',
    duration: 30,
    description: ''
  });

  // Form state for New Product
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Hair Care',
    price: '',
    stock: 20,
    description: ''
  });

  const departmentList = [
    'Hair Cut & Styling',
    'Facial & Skincare',
    'Hair Straightening & Coloring',
    'Beard Grooming & Shaving',
    'Spa, D-Tan & Massage'
  ];

  const categoryList = [
    'Hair Care',
    'Beard Care',
    'Skin Treatment',
    'Styling Wax',
    'Organic Oils'
  ];

  const handleAddService = (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim() || !serviceForm.price) return;

    addService(serviceForm);
    setServiceForm({
      name: '',
      department: 'Hair Cut & Styling',
      price: '',
      duration: 30,
      description: ''
    });
    setIsAddServiceModalOpen(false);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) return;

    addProduct(productForm);
    setProductForm({
      name: '',
      category: 'Hair Care',
      price: '',
      stock: 20,
      description: ''
    });
    setIsAddProductModalOpen(false);
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header with title and Right Top Add Service & Add Product icons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EFECE1] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#18191B]" style={{ fontFamily: 'var(--font-heading)' }}>
            Services & Retail Products
          </h2>
          <p className="text-xs text-[#646875] mt-1">
            Manage salon service offerings, duration pricing, and retail inventory stock
          </p>
        </div>

        {/* Right Top Actions: Add Service & Add Product Buttons with Icons */}
        <div className="flex items-center gap-3">
          <button
            id="btn-add-service"
            onClick={() => setIsAddServiceModalOpen(true)}
            className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center gap-2"
          >
            <Sparkles size={16} />
            <span>Add Service</span>
          </button>

          <button
            id="btn-add-product"
            onClick={() => setIsAddProductModalOpen(true)}
            className="black-luxury-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2"
          >
            <ShoppingBag size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tab switch */}
        <div className="flex items-center p-1.5 rounded-2xl bg-[#F4F1E8] border border-[#EBE8DE] w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'services'
                ? 'bg-white text-[#18191B] shadow-sm'
                : 'text-[#646875] hover:text-[#18191B]'
            }`}
          >
            <Scissors size={16} className={activeTab === 'services' ? 'text-[#C59B27]' : ''} />
            Services ({services.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'products'
                ? 'bg-white text-[#18191B] shadow-sm'
                : 'text-[#646875] hover:text-[#18191B]'
            }`}
          >
            <Package size={16} className={activeTab === 'products' ? 'text-[#C59B27]' : ''} />
            Products ({products.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9499A8]" size={16} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[#EFECE1] text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] shadow-sm text-[#18191B]"
          />
        </div>
      </div>

      {/* Services List View */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="luxury-card bg-white border border-[#EFECE1] rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group p-6"
            >
              <div>
                {/* Header: Department & Duration Badges */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF6EA] text-[#B58D20] border border-[#D4AF37]/30 flex items-center gap-1.5">
                    <Scissors size={12} className="text-[#C59B27]" />
                    {srv.department}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F4F1E8] text-[#646875] border border-[#EBE8DE] flex items-center gap-1 font-mono">
                    <Clock size={12} className="text-[#9499A8]" />
                    {srv.duration} Mins
                  </span>
                </div>

                {/* Service Content */}
                <div>
                  <h3 className="font-bold text-base text-[#18191B] group-hover:text-[#C59B27] transition-colors leading-snug">
                    {srv.name}
                  </h3>
                  <p className="text-xs text-[#646875] mt-2 line-clamp-3 leading-relaxed">
                    {srv.description || 'Professional styling service with salon grade nourishment.'}
                  </p>
                </div>
              </div>

              {/* Card Footer: Price and Bill Action */}
              <div className="mt-5 pt-4 border-t border-[#F0EBE0] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#9499A8] block">Price</span>
                  <span className="font-mono font-black text-xl text-[#18191B]">₹{srv.price}</span>
                </div>

                <button
                  onClick={() => setActiveMenu('billing')}
                  className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                >
                  <Receipt size={14} /> Bill Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products List Table View */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-[#EFECE1] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#EFECE1] text-[11px] uppercase tracking-wider font-bold text-[#646875]">
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6 text-center">Stock Available</th>
                  <th className="py-4 px-6 text-center">Units Sold</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE0] text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#9499A8] text-sm">
                      No retail products found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prd) => (
                    <tr
                      key={prd.id}
                      className="hover:bg-[#FAF7ED] transition-colors group"
                    >
                      {/* Product Details: Icon + Name + Description */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1D24] to-[#252A34] text-[#D4AF37] flex items-center justify-center font-bold text-sm shadow-xs border border-[#D4AF37]/30 shrink-0">
                            <Package size={18} />
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#18191B] block group-hover:text-[#9E7814] transition-colors">
                              {prd.name}
                            </span>
                            <p className="text-xs text-[#9499A8] truncate max-w-sm mt-0.5">
                              {prd.description || 'Exclusive retail salon care product'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-xs text-[#4A4D57] font-medium flex items-center gap-1.5">
                          <Tag size={12} className="text-[#C59B27] shrink-0" />
                          <span>{prd.category}</span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-mono font-bold text-sm text-[#18191B]">
                          ₹{prd.price}
                        </span>
                      </td>

                      {/* Stock Available */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            prd.stock > 10
                              ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                              : prd.stock > 0
                              ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                              : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prd.stock > 10 ? 'bg-[#10B981]' : prd.stock > 0 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                            }`}
                          />
                          <span>{prd.stock > 0 ? `${prd.stock} in stock` : 'Out of Stock'}</span>
                        </span>
                      </td>

                      {/* Units Sold */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="font-mono font-semibold text-xs text-[#18191B]">
                          {prd.soldCount || 0} Sold
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setActiveMenu('billing')}
                          className="gold-gradient-btn px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                        >
                          <Receipt size={13} />
                          <span>Sell in Bill</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      <Modal
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
        title="Add New Salon Service"
        subtitle="Create a new haircut, facial, straightening or spa service"
      >
        <form onSubmit={handleAddService} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Service Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Keratin Smooth Therapy"
              value={serviceForm.name}
              onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Department *
              </label>
              <select
                value={serviceForm.department}
                onChange={(e) => setServiceForm(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] bg-white"
              >
                {departmentList.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="10"
                step="5"
                value={serviceForm.duration}
                onChange={(e) => setServiceForm(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Price (INR ₹) *
            </label>
            <input
              type="number"
              required
              min="50"
              placeholder="e.g. 850"
              value={serviceForm.price}
              onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Description & Highlights
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Includes hair wash, blow dry, serum finishing"
              value={serviceForm.description}
              onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => setIsAddServiceModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md"
            >
              Add Service
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        title="Add New Retail Product"
        subtitle="Add hair oils, beard balms, facial packs or pomades to store stock"
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aura Moroccan Argan Hair Oil (100ml)"
              value={productForm.name}
              onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Category *
              </label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37] bg-white"
              >
                {categoryList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
                Initial Stock Qty *
              </label>
              <input
                type="number"
                required
                min="1"
                value={productForm.stock}
                onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Retail Price (INR ₹) *
            </label>
            <input
              type="number"
              required
              min="10"
              placeholder="e.g. 499"
              value={productForm.price}
              onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#646875] mb-1.5">
              Product Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 100% organic cold pressed oils for root nourishment"
              value={productForm.description}
              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EBE8DE] text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#646875]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="black-luxury-btn px-6 py-2.5 rounded-xl text-sm font-bold shadow-md"
            >
              Add Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
