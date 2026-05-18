"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { fetchProductById, updateProduct, uploadImage } from "@/utils/api";
import Link from "next/link";

export default function EditProductPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    images: "",
    category: "",
    countInStock: 0,
    isBestSeller: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    setError("");

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
    } catch (err) {
      setError(err.message || "Failed to upload one or more images");
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const product = await fetchProductById(id);
        setFormData({
          name: product.name || "",
          price: product.price || 0,
          description: product.description || "",
          images: product.images ? product.images.join(", ") : (product.image || ""),
          category: product.category || "",
          countInStock: product.countInStock || 0,
          isBestSeller: product.isBestSeller || false,
        });
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load product");
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (type === "number" ? Number(value) : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");

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
      await updateProduct(id, dataToSubmit);
      alert("Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      setError(err.message || "Failed to update product");
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b89b5e]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="text-[#6f6a65] hover:text-[#2b2622] font-semibold tracking-widest uppercase text-xs">← Back to List</Link>
        <h1 className="text-3xl font-bold text-[#2b2622]">Edit Product</h1>
      </div>

      <div className="bg-[#e8e1d9] p-8 rounded-3xl shadow-sm">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-[#2b2622] uppercase tracking-wider mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl border border-[#c8beaf] bg-[#f7f6f1] focus:ring-2 focus:ring-[#b89b5e] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2b2622] uppercase tracking-wider mb-2">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-4 rounded-xl border border-[#c8beaf] bg-[#f7f6f1] focus:ring-2 focus:ring-[#b89b5e] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2b2622] uppercase tracking-wider mb-2">Quantity in Stock</label>
            <input
              type="number"
              name="countInStock"
              value={formData.countInStock}
              onChange={handleChange}
              required
              min="0"
              className="w-full p-4 rounded-xl border border-[#c8beaf] bg-[#f7f6f1] focus:ring-2 focus:ring-[#b89b5e] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#2b2622] uppercase tracking-wider mb-2">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl border border-[#c8beaf] bg-[#f7f6f1] focus:ring-2 focus:ring-[#b89b5e] outline-none transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-[#2b2622] uppercase tracking-wider mb-2">Product Images</label>
            <div className="flex flex-col gap-4 bg-[#f7f6f1] p-6 rounded-2xl border border-[#c8beaf]">
              {/* File Upload Dropzone */}
              <div className="relative group/upload h-[100px] border border-dashed border-[#c8beaf] rounded-xl bg-white flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-[#e8e1d9]/30 hover:border-[#b89b5e]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  disabled={uploadingImage}
                  multiple
                />
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#b89b5e]"></div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#b89b5e]">Uploading to Temple Cloud...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center px-4">
                    <svg className="w-5 h-5 text-[#b89b5e] mb-1 group-hover/upload:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#2b2622]">Upload Image</span>
                    <span className="text-[8px] font-bold text-[#6f6a65]/40 uppercase tracking-wider">JPG, PNG up to 5MB</span>
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
                        className="absolute inset-0 bg-rose-600/80 flex items-center justify-center text-white text-xs opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer font-bold"
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
            <label className="block text-sm font-bold text-[#2b2622] uppercase tracking-wider mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full p-4 rounded-xl border border-[#c8beaf] bg-[#f7f6f1] focus:ring-2 focus:ring-[#b89b5e] outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div className="md:col-span-2 flex items-center gap-3 bg-[#f7f6f1] p-4 rounded-xl border border-[#c8beaf]">
            <input
              type="checkbox"
              name="isBestSeller"
              checked={formData.isBestSeller}
              onChange={handleChange}
              id="isBestSeller"
              className="w-5 h-5 accent-[#b89b5e] cursor-pointer"
            />
            <label htmlFor="isBestSeller" className="text-sm font-bold text-[#2b2622] cursor-pointer uppercase tracking-wider">Mark as Bestseller</label>
          </div>

          {error && (
            <div className="md:col-span-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={submitLoading}
              className={`w-full py-4 rounded-xl text-white font-bold uppercase tracking-widest text-sm transition-all shadow-lg ${submitLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2b2622] hover:bg-[#b89b5e]'}`}
            >
              {submitLoading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
