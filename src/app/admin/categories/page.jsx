"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'

  // Form / Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Alert State
  const [alert, setAlert] = useState(null);

  // Prefill mock fallback templates if database starts empty
  const MOCK_CATEGORIES = [
    { id: "mock-1", name: "Essential Oils", slug: "essential-oils", parent_id: null, is_active: true },
    { id: "mock-2", name: "Herbal Teas", slug: "herbal-teas", parent_id: null, is_active: true },
    { id: "mock-3", name: "Organic Skincare", slug: "organic-skincare", parent_id: null, is_active: true },
    { id: "mock-4", name: "Wellness Elixirs", slug: "wellness-elixirs", parent_id: null, is_active: true },
  ];

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const loadData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // Fetch categories flat structure
      const res = await axios.get("/api/categories?all=true&structure=flat", config);

      let flatData = [];
      if (res.data && res.data.success) {
        flatData = res.data.data;
      }

      // Fallback to mock if empty
      if (flatData.length === 0) {
        setCategories(MOCK_CATEGORIES);
      } else {
        setCategories(flatData);
      }
    } catch (error) {
      console.error("Failed to load categories page data:", error);
      triggerAlert("error", "Failed to retrieve category list");
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Handle open form
  const handleOpenModal = (mode, category = null) => {
    setFormErrors({});
    setModalMode(mode);
    if (mode === "edit" && category) {
      setEditingId(category.id.toString());
      setName(category.name);
      setSlug(category.slug);
      setIsActive(category.is_active);
    } else {
      setEditingId(null);
      setName("");
      setSlug("");
      setIsActive(true);
    }
    setModalOpen(false);
    setTimeout(() => setModalOpen(true), 50);
  };

  // Toggle active status inline
  const handleToggleActive = async (category) => {
    if (category.id.toString().startsWith("mock-")) {
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, is_active: !c.is_active } : c))
      );
      triggerAlert("success", "Mock category status toggled successfully");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.put(
        `/api/categories/${category.id}`,
        { is_active: !category.is_active },
        config
      );
      loadData();
      triggerAlert("success", "Category visibility updated successfully");
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Failed to update category status");
    }
  };

  // Handle delete
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? Products inside it may be affected.")) {
      return;
    }

    if (categoryId.toString().startsWith("mock-")) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      triggerAlert("success", "Mock category deleted");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`/api/categories/${categoryId}`, config);
      loadData();
      triggerAlert("success", "Category deleted successfully");
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Failed to delete category");
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!name.trim()) errors.name = "Category name is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    const formattedSlug = slug.trim()
      ? slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-")
      : undefined;

    const payload = {
      name,
      slug: formattedSlug,
      parent_id: null,
      is_active: isActive,
    };

    // If mock sandbox mode, update state locally
    if (editingId && editingId.startsWith("mock-")) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c))
      );
      setModalOpen(false);
      setSubmitting(false);
      triggerAlert("success", "Mock category updated successfully");
      return;
    } else if (!editingId && categories[0]?.id?.toString().startsWith("mock-")) {
      const newMockCat = {
        id: `mock-${Date.now()}`,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        parent_id: null,
        is_active: isActive,
      };
      setCategories((prev) => [...prev, newMockCat]);
      setModalOpen(false);
      setSubmitting(false);
      triggerAlert("success", "Mock category created successfully");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (modalMode === "create") {
        await axios.post("/api/categories", payload, config);
        triggerAlert("success", "Category created successfully");
      } else {
        await axios.put(`/api/categories/${editingId}`, payload, config);
        triggerAlert("success", "Category updated successfully");
      }

      setModalOpen(false);
      loadData();
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter categories client-side
  const filteredCategories = categories.filter((cat) => {
    const nameMatch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      cat.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === "all" ||
                        (statusFilter === "active" && cat.is_active) ||
                        (statusFilter === "inactive" && !cat.is_active);

    return nameMatch && statusMatch;
  });

  const renderCategoryRow = (category) => {
    return (
      <tr key={category.id} className="hover:bg-surface-container-lowest/30 transition-colors">
        <td className="p-4">
          <div className="flex items-center gap-2">
            {/* <span className="font-mono text-[10px] text-on-surface-variant font-medium bg-surface-container-low px-1.5 py-0.5 rounded border border-outline-variant/15 select-all">
              {category.id}
            </span> */}
            <div>
              <span className="font-semibold text-on-surface text-xs">{category.name}</span>
              <span className="text-[10px] text-on-surface-variant font-mono font-light ml-2 bg-surface-container-low px-1.5 py-0.5 rounded border border-outline-variant/15">
                /{category.slug}
              </span>
            </div>
          </div>
        </td>
        <td className="p-4 text-center">
          <button
            onClick={() => handleToggleActive(category)}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
              category.is_active
                ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${category.is_active ? "bg-emerald-500" : "bg-[#8e918f]"}`} />
            {category.is_active ? "Active" : "Inactive"}
          </button>
        </td>
        <td className="p-4 text-center">
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => handleOpenModal("edit", category)}
              className="p-1 rounded-md text-primary hover:bg-primary/10 transition-colors cursor-pointer"
              title="Edit Details"
            >
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </td>
      </tr>
    );
  };

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
            Categories Directory
          </h1>
        </div>

        <button
          onClick={() => handleOpenModal("create")}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Create Category
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white border border-outline-variant/30 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full sm:max-w-xs flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
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

      {/* Categories Table Card */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin mb-2">
              eco
            </span>
            <p className="text-xs text-on-surface-variant font-light">Retrieving categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-[#c4c4c4] mb-2">
              category
            </span>
            <p className="text-sm text-on-surface-variant font-light font-headline">No categories match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-body">
              <thead>
                <tr className="bg-[#FAF6F0] text-on-surface-variant border-b border-outline-variant/20">
                  <th className="p-4 font-semibold">Category Details</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredCategories.map((cat) => renderCategoryRow(cat))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-outline-variant/30 rounded-2xl w-full max-w-md shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-headline font-bold text-on-surface animate-fadeIn">
                {modalMode === "create" ? "Create Category" : "Modify Category Details"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-surface-container-low rounded-md"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {/* Category Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Essential Oils"
                  className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50"
                />
                {formErrors.name && <span className="text-[10px] text-rose-600 font-semibold">{formErrors.name}</span>}
              </div>

              {/* Custom Slug URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Custom Slug (optional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    const cleaned = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^\w\-]+/g, "")
                      .replace(/\-\-+/g, "-");
                    setSlug(cleaned);
                  }}
                  placeholder="e.g. organic-skincare"
                  className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50 font-mono"
                />
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-[#FAF6F0]/10 mt-1">
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Category Status</h4>
                  <p className="text-[10px] text-on-surface-variant font-light">Set category to Active or Inactive.</p>
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

              {/* Footer Actions */}
              <div className="border-t border-outline-variant/20 pt-4 mt-4 flex items-center justify-end gap-3">
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
                  {submitting ? "Saving..." : modalMode === "create" ? "Create Category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
