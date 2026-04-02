"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { fetchProductById, updateProduct } from "@/utils/api";
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
      const dataToSubmit = {
        ...formData,
        images: formData.images.split(",").map((img) => img.trim()).filter((img) => img !== ""),
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

          <div>
            <label className="block text-sm font-bold text-[#2b2622] uppercase tracking-wider mb-2">Image URLs (comma separated)</label>
            <input
              type="text"
              name="images"
              value={formData.images}
              onChange={handleChange}
              required
              className="w-full p-4 rounded-xl border border-[#c8beaf] bg-[#f7f6f1] focus:ring-2 focus:ring-[#b89b5e] outline-none transition-all"
            />
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
