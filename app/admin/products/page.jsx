"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchProducts, deleteProduct, updateProduct, createProduct, uploadImage } from "@/utils/api";

const LoadingSpinner = ({ size = "w-4 h-4", color = "border-white" }) => (
  <div className={`${size} border-2 ${color} border-t-transparent rounded-full animate-spin`}></div>
);

const ProductRow = ({ product, onDelete, onToggleBestseller, isToggling }) => (
  <tr className="hover:bg-[#fcfbf9]/80 transition-all group border-b border-[#f2eee9]">
    <td className="p-8">
      <div className="flex items-center gap-6">
        <div className="relative group/img">
          <img 
            src={product.image || "/placeholder-product.jpg"} 
            alt={product.name}
            className="w-16 h-16 object-cover rounded-[20px] bg-gray-100 shadow-sm transition-all duration-700 group-hover/img:scale-110 group-hover/img:rotate-2"
          />
          <div className="absolute inset-0 bg-[#2b2622]/10 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-[20px]"></div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[#2b2622] truncate max-w-[240px] tracking-tight text-lg mb-1">{product.name}</span>
          <span className="text-[10px] uppercase font-black tracking-widest text-[#6f6a65]/40">{product.category || "General Ritual"}</span>
        </div>
      </div>
    </td>
    <td className="p-8">
      <div className="flex items-baseline gap-1">
        <span className="text-xs font-bold text-[#b89b5e]">₹</span>
        <span className="text-xl font-bold text-[#2b2622] tracking-tighter">{product.price}</span>
      </div>
    </td>
    <td className="p-8">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-1.5 h-1.5 rounded-full ${product.countInStock > 10 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-[10px] uppercase font-black tracking-widest text-[#6f6a65]/60">
            {product.countInStock > 0 ? 'Sacred Reserves' : 'None Remaining'}
          </span>
        </div>
        <span className="text-xl font-bold text-[#2b2622]">{product.countInStock}</span>
      </div>
    </td>
    <td className="p-8">
      <button
        onClick={() => onToggleBestseller(product._id, product.isBestSeller)}
        disabled={isToggling}
        className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all border flex items-center gap-2 ${
          product.isBestSeller 
          ? 'bg-[#b89b5e] text-white border-[#b89b5e] hover:bg-transparent hover:text-[#b89b5e] shadow-[0_10px_20px_rgba(184,155,94,0.2)]' 
          : 'bg-transparent text-[#6f6a65]/50 border-[#dcd4cb] hover:border-[#b89b5e] hover:text-[#b89b5e] hover:bg-[#b89b5e]/5'
        }`}
      >
        {isToggling ? <LoadingSpinner color={product.isBestSeller ? "border-white" : "border-[#b89b5e]"} /> : (product.isBestSeller ? 'Bestseller' : 'Standard')}
      </button>
    </td>
    <td className="p-8">
      <div className="flex items-center gap-8">
        <Link 
          href={`/admin/edit-product/${product._id}`}
          className="text-[#2b2622]/40 hover:text-[#b89b5e] font-black text-[10px] tracking-widest uppercase transition-all flex items-center gap-2 group/edit"
        >
          <span className="w-0 group-hover/edit:w-2 h-[1px] bg-[#b89b5e] transition-all overflow-hidden"></span>
          Modify
        </Link>
        <button 
          onClick={() => onDelete(product._id, product.name)}
          className="text-red-300 hover:text-red-500 font-black text-[10px] tracking-widest uppercase transition-all group/del"
        >
          Expel
          <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 italic ml-2">×</span>
        </button>
      </div>
    </td>
  </tr>
);

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBestseller, setFilterBestseller] = useState(false);
  const [notification, setNotification] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Modal State Hooks
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    images: "",
    category: "",
    countInStock: 0,
    isBestSeller: false,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    setCreateError("");

    try {
      const uploadPromises = files.map(async (file) => {
        const uploadData = new FormData();
        uploadData.append("image", file);
        const data = await uploadImage(uploadData);
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      
      setFormData((prev) => {
        const existingUrls = prev.images ? prev.images.split(",").map(u => u.trim()).filter(Boolean) : [];
        const newUrls = [...existingUrls, ...urls];
        return {
          ...prev,
          images: newUrls.join(", "),
        };
      });
      
      showNotification(`${urls.length} ritual images uploaded to sacred archives.`);
    } catch (err) {
      setCreateError(err.message || "Failed to upload one or more images");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (type === "number" ? Number(value) : value),
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");

    try {
      const imageUrls = formData.images.split(",").map((img) => img.trim()).filter((img) => img !== "");
      if (imageUrls.length === 0) {
        throw new Error("At least one product image is required.");
      }
      const dataToSubmit = {
        ...formData,
        images: imageUrls,
        image: imageUrls[0],
      };
      const result = await createProduct(dataToSubmit);
      
      const newProduct = result.product || result;
      setProducts([newProduct, ...products]);
      setIsCreateModalOpen(false);
      showNotification(`${formData.name} successfully manifested in stock.`);
      
      // Reset form data
      setFormData({
        name: "",
        price: 0,
        description: "",
        images: "",
        category: "",
        countInStock: 0,
        isBestSeller: false,
      });
    } catch (err) {
      setCreateError(err.message || "Failed to create product");
    } finally {
      setCreateLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to expel "${name}" from the temple?`)) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((p) => p._id !== id));
        showNotification(`${name} has been removed from sacred stock.`);
      } catch (err) {
        showNotification(err.message, "error");
      }
    }
  };

  const handleToggleBestseller = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      await updateProduct(id, { isBestSeller: !currentStatus });
      setProducts(products.map(p => p._id === id ? { ...p, isBestSeller: !currentStatus } : p));
      showNotification("Manifestation status updated.");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterBestseller ? p.isBestSeller : true;
      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, filterBestseller]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-6">
        <LoadingSpinner size="w-12 h-12" color="border-[#b89b5e]" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#b89b5e] animate-pulse">Illuminating Catalog...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Premium Toast Notification */}
      {notification && (
        <div className={`fixed bottom-12 right-12 z-[100] px-8 py-5 rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-all animate-in slide-in-from-right duration-500 flex items-center gap-4 ${
          notification.type === "success" ? "bg-[#2b2622] text-white border-l-4 border-[#b89b5e]" : "bg-red-600 text-white"
        }`}>
          <div className="w-2 h-2 bg-[#b89b5e] rounded-full animate-pulse"></div>
          <p className="text-xs font-bold uppercase tracking-widest">{notification.message}</p>
        </div>
      )}

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-20 px-4 sm:px-0">
        <div>
          <span className="text-[#b89b5e] font-black tracking-[0.5em] uppercase text-[10px] block mb-4">— Inventory Chamber —</span>
          <h1 className="text-7xl font-bold tracking-tighter text-[#2b2622] leading-none mb-4">Temple Catalog</h1>
          <p className="text-[#6f6a65] text-sm max-w-lg leading-relaxed opacity-60 italic">Refine your divine offerings. Every change here manifests across the entire ritual experience.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#2b2622] text-white px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#b89b5e] transition-all shadow-[0_20px_40px_rgba(43,38,34,0.15)] hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(184,155,94,0.25)] active:scale-95 group"
        >
          <span className="flex items-center gap-3">
            Add New Ritual <span className="text-xl group-hover:rotate-90 transition-transform inline-block">+</span>
          </span>
        </button>
      </div>

      {/* Modern Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10 px-4 sm:px-0">
        <div className="md:col-span-7 relative group">
          <input 
            type="text" 
            placeholder="Seek ritual by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#dcd4cb] rounded-[24px] px-8 py-5 text-sm font-bold outline-none focus:border-[#b89b5e] focus:shadow-[0_10px_30px_rgba(184,155,94,0.05)] transition-all group-hover:border-[#b89b5e]/40"
          />
          <span className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 text-xl group-hover:opacity-40 transition-opacity italic">Seeking</span>
        </div>
        <div className="md:col-span-3">
          <button 
            onClick={() => setFilterBestseller(!filterBestseller)}
            className={`w-full h-full px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest border transition-all ${
              filterBestseller 
              ? 'bg-[#b89b5e] text-white border-[#b89b5e] shadow-[0_10px_30px_rgba(184,155,94,0.1)]' 
              : 'bg-white text-[#6f6a65]/60 border-[#dcd4cb] hover:border-[#b89b5e] hover:text-[#b89b5e]'
            }`}
          >
            {filterBestseller ? 'Illuminated Path Only' : 'Show All Rituals'}
          </button>
        </div>
        <div className="md:col-span-2 bg-[#e2ddd5] rounded-[24px] px-6 py-5 flex items-center justify-center border border-[#dcd4cb]">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#2b2622]/40">
            {filteredProducts.length} Sacred Items
          </span>
        </div>
      </div>

      {/* Refined Products Table */}
      <div className="bg-white rounded-[48px] border border-[#dcd4cb] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.03)] mx-4 sm:mx-0 mb-10">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="bg-[#fcfbf9] border-b border-[#f2eee9]">
                <th className="p-10 font-black text-[#6f6a65]/40 text-[10px] uppercase tracking-[0.3em]">Ritual Manifestation</th>
                <th className="p-10 font-black text-[#6f6a65]/40 text-[10px] uppercase tracking-[0.3em]">Value</th>
                <th className="p-10 font-black text-[#6f6a65]/40 text-[10px] uppercase tracking-[0.3em]">Reserve</th>
                <th className="p-10 font-black text-[#6f6a65]/40 text-[10px] uppercase tracking-[0.3em]">Stature</th>
                <th className="p-10 font-black text-[#6f6a65]/40 text-[10px] uppercase tracking-[0.3em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#fcfbf9]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-32 text-center flex-col items-center">
                    <div className="text-8xl mb-8 opacity-10">🕯️</div>
                    <p className="text-[#6f6a65] font-bold text-xl tracking-tighter italic">The archives are echoingly silent.</p>
                    <p className="text-[#6f6a65]/40 text-xs mt-2 uppercase tracking-widest">Adjust your seeking criteria or add a new manifestation.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <ProductRow 
                    key={product._id} 
                    product={product} 
                    onDelete={handleDelete}
                    onToggleBestseller={handleToggleBestseller}
                    isToggling={togglingId === product._id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Ritual Creation Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-[#e8e1d9] w-full max-w-2xl rounded-[32px] border border-[#dcd4cb] shadow-[0_30px_70px_rgba(0,0,0,0.25)] overflow-hidden transition-all transform animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-[#c8beaf] flex items-center justify-between bg-[#fcfbf9]/30">
              <h2 className="text-xl font-bold tracking-tight text-[#2b2622] uppercase tracking-[0.1em]">Manifest New Ritual</h2>
              <button 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateError("");
                }}
                className="w-8 h-8 rounded-full bg-white/60 border border-[#c8beaf] flex items-center justify-center text-[#2b2622] hover:bg-[#2b2622] hover:text-white transition-all cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-8 max-h-[75vh] overflow-y-auto">
              <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[9px] uppercase font-black tracking-widest text-[#6f6a65] mb-2 ml-1">Ritual Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Amber & Sandalwood Incense"
                    className="w-full p-3.5 rounded-xl border border-[#c8beaf] bg-[#fcfbf9] focus:ring-1 focus:ring-[#b89b5e] focus:border-[#b89b5e] outline-none text-xs transition-all text-[#2b2622] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-black tracking-widest text-[#6f6a65] mb-2 ml-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-3.5 rounded-xl border border-[#c8beaf] bg-[#fcfbf9] focus:ring-1 focus:ring-[#b89b5e] focus:border-[#b89b5e] outline-none text-xs transition-all text-[#2b2622] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-black tracking-widest text-[#6f6a65] mb-2 ml-1">Sacred reserves (stock)</label>
                  <input
                    type="number"
                    name="countInStock"
                    value={formData.countInStock}
                    onChange={handleFormChange}
                    required
                    min="0"
                    className="w-full p-3.5 rounded-xl border border-[#c8beaf] bg-[#fcfbf9] focus:ring-1 focus:ring-[#b89b5e] focus:border-[#b89b5e] outline-none text-xs transition-all text-[#2b2622] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-black tracking-widest text-[#6f6a65] mb-2 ml-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. Incense, Sacred Clay"
                    className="w-full p-3.5 rounded-xl border border-[#c8beaf] bg-[#fcfbf9] focus:ring-1 focus:ring-[#b89b5e] focus:border-[#b89b5e] outline-none text-xs transition-all text-[#2b2622] font-semibold"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[9px] uppercase font-black tracking-widest text-[#6f6a65] mb-2 ml-1">Ritual Images</label>
                  <div className="flex flex-col gap-4">
                    {/* File Upload Dropzone */}
                    <div className="relative group/upload h-[80px] border border-dashed border-[#c8beaf] rounded-xl bg-[#fcfbf9] flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-[#e8e1d9]/30 hover:border-[#b89b5e]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        disabled={uploadingImage}
                        multiple
                      />
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <LoadingSpinner size="w-4 h-4" color="border-[#b89b5e]" />
                          <span className="text-[7px] uppercase font-black tracking-widest text-[#b89b5e] animate-pulse">Uploading to Temple Cloud...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5 text-center px-4">
                          <svg className="w-4 h-4 text-[#b89b5e] mb-0.5 group-hover/upload:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          <span className="text-[8px] uppercase font-black tracking-widest text-[#2b2622]">Upload Image</span>
                          <span className="text-[6.5px] font-bold text-[#6f6a65]/40 uppercase tracking-wider">JPG, PNG up to 5MB</span>
                        </div>
                      )}
                    </div>

                    {/* Image Preview List */}
                    {formData.images && (
                      <div className="flex gap-2 items-center flex-wrap px-1">
                        {formData.images.split(',').filter(Boolean).map((imgUrl, index) => (
                          <div key={index} className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#c8beaf] group/thumb">
                            <img src={imgUrl.trim()} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const remaining = formData.images.split(',')
                                  .map(url => url.trim())
                                  .filter((_, idx) => idx !== index)
                                  .join(', ');
                                setFormData(prev => ({ ...prev, images: remaining }));
                              }}
                              className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white text-[10px] opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer font-black"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[9px] uppercase font-black tracking-widest text-[#6f6a65] mb-2 ml-1">Sacred Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                    rows="3"
                    placeholder="Write a few lines about this manifestation..."
                    className="w-full p-3.5 rounded-xl border border-[#c8beaf] bg-[#fcfbf9] focus:ring-1 focus:ring-[#b89b5e] focus:border-[#b89b5e] outline-none text-xs transition-all resize-none text-[#2b2622] font-semibold"
                  ></textarea>
                </div>

                <div className="md:col-span-2 flex items-center gap-3 bg-[#fcfbf9] p-3.5 rounded-xl border border-[#c8beaf]">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={formData.isBestSeller}
                    onChange={handleFormChange}
                    id="isBestSeller"
                    className="w-4.5 h-4.5 accent-[#b89b5e] cursor-pointer"
                  />
                  <label htmlFor="isBestSeller" className="text-[10px] font-black uppercase tracking-widest text-[#2b2622] cursor-pointer">Mark as Bestseller</label>
                </div>

                {createError && (
                  <div className="md:col-span-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
                    <p className="text-xs font-bold uppercase tracking-wider">{createError}</p>
                  </div>
                )}

                <div className="md:col-span-2 pt-3">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-md cursor-pointer ${createLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2b2622] hover:bg-[#b89b5e]'}`}
                  >
                    {createLoading ? "Manifesting..." : "Manifest Ritual"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
