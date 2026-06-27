"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function AdminProductsPage() {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Bulk Upload States
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkImporting, setBulkImporting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Alert State
  const [alert, setAlert] = useState(null);

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const loadData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const [productsRes, categoriesRes] = await Promise.allSettled([
        axios.get("/api/products?all=true", config),
        axios.get("/api/categories?all=true", config),
      ]);

      let productsData = [];
      let categoriesData = [];

      if (productsRes.status === "fulfilled" && productsRes.value.data.success) {
        productsData = productsRes.value.data.data;
      }
      if (categoriesRes.status === "fulfilled" && categoriesRes.value.data.success) {
        categoriesData = categoriesRes.value.data.data;
      }

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load products page data:", error);
      triggerAlert("error", "Failed to retrieve catalog data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Handle Create / Edit Open
  const handleOpenModal = (mode, product = null) => {
    setFormErrors({});
    setModalMode(mode);
    if (mode === "edit" && product) {
      setEditingId(product.id.toString());
      setName(product.name);
      setSku(product.sku);
      setPrice(product.price.toString());
      setGst(product.gst?.toString() || "0");
      setQuantity(product.quantity.toString());
      setCategoryId(product.category_id ? product.category_id.toString() : "");
      setShortDescription(product.short_description || "");
      setDescription(product.description || "");
      setThumbnailUrl(product.thumbnail_url || (product.images && product.images[0]?.image_url) || "");
      setIsActive(product.is_active);
    } else {
      setEditingId(null);
      setName("");
      // Generate standard random SKU for fun helper
      setSku(`Veda-${Math.floor(1000 + Math.random() * 9000)}`);
      setPrice("");
      setGst("0");
      setQuantity("");
      setCategoryId(categories[0]?.id?.toString() || "");
      setShortDescription("");
      setDescription("");
      setThumbnailUrl("https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600");
      setIsActive(true);
    }
    setModalOpen(true);
  };

  // Handle active toggle inline
  const handleToggleActive = async (product) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.patch(
        `/api/products/${product.id}`,
        {},
        config
      );
      loadData();
      triggerAlert("success", "Product status updated successfully");
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Failed to update product status");
    }
  };

  // Handle delete
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) {
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`/api/products/${productId}`, config);
      loadData();
      triggerAlert("success", "Product deleted successfully");
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Failed to delete product");
    }
  };

  // Form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Simple Client-side validation
    const errors = {};
    if (!name.trim()) errors.name = "Product name is required";
    if (!sku.trim()) errors.sku = "SKU code is required";
    if (!price || isNaN(Number(price)) || Number(price) < 0) errors.price = "Valid price is required";
    if (gst === "" || isNaN(Number(gst)) || Number(gst) < 0 || Number(gst) > 100) errors.gst = "GST must be between 0 and 100";
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0) errors.quantity = "Valid stock is required";
    if (!categoryId) errors.category_id = "Category selection is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    const payload = {
      name,
      sku,
      price: parseFloat(price),
      gst: parseFloat(gst),
      quantity: parseInt(quantity, 10),
      category_id: categoryId,
      short_description: shortDescription,
      description,
      thumbnail_url: thumbnailUrl,
      is_active: isActive,
    };

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (modalMode === "create") {
        await axios.post("/api/products", payload, config);
        triggerAlert("success", "Product created successfully");
      } else {
        await axios.put(`/api/products/${editingId}`, payload, config);
        triggerAlert("success", "Product updated successfully");
      }

      setModalOpen(false);
      loadData();
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Failed to submit product");
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk upload handler
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    setBulkImporting(true);

    try {
      let parsedData = null;
      if (bulkFile) {
        const text = await bulkFile.text();
        parsedData = JSON.parse(text);
      } else if (bulkJson.trim()) {
        parsedData = JSON.parse(bulkJson);
      } else {
        throw new Error("Please select a JSON file or paste product data.");
      }

      if (!Array.isArray(parsedData)) {
        throw new Error("Product data must be a JSON array of products.");
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.post("/api/products/bulk", parsedData, config);
      triggerAlert("success", res.data?.message || "Products imported successfully");
      setBulkModalOpen(false);
      setBulkJson("");
      setBulkFile(null);
      loadData();
    } catch (err) {
      console.error(err);
      triggerAlert("error", err.response?.data?.message || err.message || "Failed to import products");
    } finally {
      setBulkImporting(false);
    }
  };

  // Filtered lists
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || prod.category_id?.toString() === categoryFilter.toString();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && prod.is_active) ||
      (statusFilter === "inactive" && !prod.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Alert Notice */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-lg flex items-center gap-2.5 animate-slideIn ${
          alert.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          <span className="material-symbols-outlined text-lg">
            {alert.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="text-xs font-semibold">{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">
            Products Catalog
          </h1>
          <p className="text-xs text-on-surface-variant font-light mt-0.5">
            Add products, update inventory stock, and control visibility toggles.
          </p>
        </div>

        <div className="flex gap-2.5 self-start sm:self-auto">
          {user?.role === "SUPER_ADMIN" && (
            <button
              onClick={() => setBulkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline-variant/60 hover:bg-surface-container-low text-on-surface-variant rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">publish</span>
              Bulk Upload
            </button>
          )}

          <button
            onClick={() => handleOpenModal("create")}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Product
          </button>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white border border-outline-variant/30 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full sm:max-w-xs flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 border border-outline-variant/40 rounded-xl text-xs bg-white focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 border border-outline-variant/40 rounded-xl text-xs bg-white focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin mb-2">
              eco
            </span>
            <p className="text-xs text-on-surface-variant font-light">Loading catalog listings...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-[#c4c4c4] mb-2">
              shopping_bag
            </span>
            <p className="text-sm text-on-surface-variant font-light">No products match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF6F0] text-on-surface-variant border-b border-outline-variant/20">
                  <th className="p-4 font-semibold">Product info</th>
                  <th className="p-4 font-semibold">SKU</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">GST</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-surface-container-lowest/30 transition-colors">
                    {/* Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/25">
                          <img
                            src={prod.thumbnail_url || (prod.images && prod.images[0]?.image_url) || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=200"}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-on-surface text-xs leading-normal">{prod.name}</div>
                          <div className="text-[10px] text-on-surface-variant font-light line-clamp-1 mt-0.5">
                            {prod.short_description || "No description set"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="p-4 text-on-surface-variant font-mono font-semibold">
                      {prod.sku}
                    </td>

                    {/* Category */}
                    <td className="p-4 text-on-surface">
                      {prod.category?.name || "Uncategorized"}
                    </td>

                    {/* Price */}
                    <td className="p-4 font-bold text-on-surface">
                      ${parseFloat(prod.price).toFixed(2)}
                    </td>

                    {/* GST */}
                    <td className="p-4 font-semibold text-on-surface-variant">
                      {parseFloat(prod.gst || 0).toFixed(2)}%
                    </td>

                    {/* Quantity */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        prod.quantity === 0
                          ? "bg-rose-50 text-rose-700"
                          : prod.quantity <= 5
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {prod.quantity} items
                      </span>
                    </td>

                    {/* Status Toggles */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          prod.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                            : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${prod.is_active ? "bg-emerald-500" : "bg-[#8e918f]"}`} />
                        {prod.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal("edit", prod)}
                          className="p-1 rounded-md text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-outline-variant/30 rounded-2xl w-full max-w-xl shadow-xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="text-base font-headline font-bold text-on-surface">
                {modalMode === "create" ? "Add New Botanical Product" : "Edit Product Details"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-surface-container-low rounded-md"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Form scrollable */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Product Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product Name"
                  className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50"
                />
                {formErrors.name && <span className="text-[10px] text-rose-600 font-semibold">{formErrors.name}</span>}
              </div>

              {/* SKU & Category Select (Flex) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">SKU Code *</label>
                  <input
                     type="text"
                     required
                     value={sku}
                     onChange={(e) => setSku(e.target.value)}
                     placeholder="SKU Code"
                     className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50 font-mono font-semibold"
                  />
                  {formErrors.sku && <span className="text-[10px] text-rose-600 font-semibold">{formErrors.sku}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Category Select *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="px-3 py-2 border border-outline-variant/40 rounded-xl text-xs bg-white focus:outline-none focus:border-primary/50 cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category_id && <span className="text-[10px] text-rose-600 font-semibold">{formErrors.category_id}</span>}
                </div>
              </div>

              {/* Price, GST & Quantity Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Selling Price"
                    className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50"
                  />
                  {formErrors.price && <span className="text-[10px] text-rose-600 font-semibold">{formErrors.price}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">GST (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
                    placeholder="GST"
                    className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50"
                  />
                  {formErrors.gst && <span className="text-[10px] text-rose-600 font-semibold">{formErrors.gst}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Stock Quantity"
                    className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50"
                  />
                  {formErrors.quantity && <span className="text-[10px] text-rose-600 font-semibold">{formErrors.quantity}</span>}
                </div>
              </div>

              {/* Thumbnail URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Thumbnail Image URL</label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Thumbnail Image URL"
                  className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Short Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Short Summary Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Short Summary Description"
                  className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Full Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Full Product Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full Product Description"
                  className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50 resize-y"
                />
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-[#FAF6F0]/10 mt-1">
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Product Status</h4>
                  <p className="text-[10px] text-on-surface-variant font-light">Set product to Active or Inactive.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-on-surface-variant">
                    {isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                      isActive ? "bg-primary" : "bg-[#c4c4c4]"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        isActive ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="border-t border-outline-variant/20 pt-4 mt-4 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant/45 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : modalMode === "create" ? "Add Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-outline-variant/30 rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-headline font-bold text-on-surface">
                Bulk Import Products
              </h3>
              <button
                onClick={() => {
                  setBulkModalOpen(false);
                  setBulkFile(null);
                  setBulkJson("");
                }}
                className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-surface-container-low rounded-md"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBulkUpload} className="p-6 flex flex-col gap-4 overflow-y-auto">
              <p className="text-[10px] text-on-surface-variant font-light leading-normal">
                Import multiple products at once. You can upload a <b>JSON</b> file or paste a JSON array directly.
              </p>

              {/* File Upload Zone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Upload JSON File</label>
                <div className="relative border-2 border-dashed border-outline-variant/40 hover:border-primary/45 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#FAF6F0]/10 hover:bg-[#FAF6F0]/25">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="material-symbols-outlined text-3xl text-primary/70 mb-1.5">
                    upload_file
                  </span>
                  <p className="text-xs text-on-surface font-semibold">
                    {bulkFile ? bulkFile.name : "Select or Drop JSON file"}
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-light mt-0.5">
                    {bulkFile ? `${(bulkFile.size / 1024).toFixed(2)} KB` : "Supports standard .json formatted lists"}
                  </p>
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-outline-variant/15"></div>
                <span className="flex-shrink mx-3 text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">Or Paste JSON Array</span>
                <div className="flex-grow border-t border-outline-variant/15"></div>
              </div>

              {/* Paste Textarea */}
              <div className="flex flex-col gap-1.5">
                <textarea
                  rows="6"
                  value={bulkJson}
                  onChange={(e) => {
                    setBulkJson(e.target.value);
                    if (e.target.value) setBulkFile(null); // Clear file if text is entered
                  }}
                  disabled={!!bulkFile}
                  placeholder='[
  {
    "name": "Organic Honey Tonic",
    "sku": "HON-001",
    "price": 499.00,
    "gst": 18,
    "quantity": 100,
    "category_id": "20",
    "short_description": "Natural tonic...",
    "thumbnail_url": "https://images.unsplash.com/photo-..."
  }
]'
                  className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-[10px] bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50 resize-y font-mono disabled:opacity-50"
                />
              </div>

              {/* Footer Actions */}
              <div className="border-t border-outline-variant/20 pt-4 mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBulkModalOpen(false);
                    setBulkFile(null);
                    setBulkJson("");
                  }}
                  className="px-4 py-2 border border-outline-variant/45 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkImporting}
                  className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {bulkImporting ? "Importing..." : "Start Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
