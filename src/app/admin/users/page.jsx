"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function AdminUsersPage() {
  const { token, user: loggedInUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form / Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form Fields (For creating new ADMIN accounts)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Alert State
  const [alert, setAlert] = useState(null);

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const MOCK_USERS = [
    {
      id: "demo-u1",
      name: "Super Admin",
      email: "superadmin@theherbalveda.com",
      phone: "9876543210",
      role: "SUPER_ADMIN",
      is_active: true,
    },
    {
      id: "demo-u2",
      name: "Tanya Sen",
      email: "tanya.admin@theherbalveda.com",
      phone: "9876543220",
      role: "ADMIN",
      is_active: true,
    },
    {
      id: "demo-u3",
      name: "Aarav Kapoor",
      email: "aarav@example.com",
      phone: "9876543230",
      role: "CUSTOMER",
      is_active: true,
    },
    {
      id: "demo-u4",
      name: "Ishita Roy",
      email: "ishita@example.com",
      phone: "9876543240",
      role: "CUSTOMER",
      is_active: false,
    },
  ];

  const loadUsers = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get("/api/admin/users", config);
      if (response.data && response.data.success && response.data.data.length > 0) {
        setUsers(response.data.data);
      } else {
        setUsers(MOCK_USERS);
      }
    } catch (error) {
      console.error("Failed to load admin users data:", error);
      setUsers(MOCK_USERS); // Fallback to mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is SUPER_ADMIN
    if (loggedInUser?.role === "SUPER_ADMIN") {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [token, loggedInUser]);

  // Toggle active / inactive status
  const handleToggleStatus = async (userToToggle) => {
    // Basic protection against self-deactivation
    if (userToToggle.id.toString() === loggedInUser.id.toString()) {
      triggerAlert("error", "You cannot deactivate your own account");
      return;
    }

    // Mock toggle
    if (userToToggle.id.toString().startsWith("demo-")) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userToToggle.id ? { ...u, is_active: !u.is_active } : u))
      );
      triggerAlert("success", "Mock user account status toggled");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.patch(
        `/api/admin/users/${userToToggle.id}`,
        { is_active: !userToToggle.is_active },
        config
      );

      loadUsers();
      triggerAlert("success", "User status updated successfully");
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Failed to update user status");
    }
  };

  // Submit Admin creation form
  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!name.trim()) errors.name = "Full Name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = "Valid Email is required";
    if (!phone.trim() || phone.length < 10) errors.phone = "Valid Phone number is required";
    if (!password.trim() || password.length < 6) errors.password = "Password must be at least 6 characters";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    const payload = {
      name,
      email,
      phone,
      password,
    };

    // Mock mode
    if (users[0]?.id?.toString().startsWith("demo-")) {
      setUsers((prev) => [
        {
          id: `demo-${Date.now()}`,
          name,
          email,
          phone,
          role: "ADMIN",
          is_active: true,
        },
        ...prev,
      ]);
      setModalOpen(false);
      setSubmitting(false);
      triggerAlert("success", "Mock Admin user registered successfully");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.post("/api/admin/users/create", payload, config);
      triggerAlert("success", "New store admin created successfully!");
      setModalOpen(false);
      loadUsers();

      // Reset fields
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Failed to create Admin user");
    } finally {
      setSubmitting(false);
    }
  };

  // Check role authorization guard for UI page content rendering
  if (loggedInUser?.role !== "SUPER_ADMIN") {
    return (
      <div className="p-8 text-center bg-white border border-outline-variant/30 rounded-2xl flex flex-col items-center max-w-md mx-auto my-12 shadow-xs">
        <span className="material-symbols-outlined text-4xl text-rose-600 mb-2">
          gpp_bad
        </span>
        <h3 className="text-base font-headline font-bold text-on-surface">Access Denied</h3>
        <p className="text-xs text-on-surface-variant font-light mt-1">
          This panel is restricted exclusively to Super Administrators.
        </p>
      </div>
    );
  }

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
            Admin Accounts Manager
          </h1>
          <p className="text-xs text-on-surface-variant font-light mt-0.5">
            Register new store admins, toggle account activation statuses, and track system users.
          </p>
        </div>

        <button
          onClick={() => {
            setFormErrors({});
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E2E24] hover:bg-[#25392D] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto border border-[#3E5244]/20"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          Create Store Admin
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin mb-2">
              eco
            </span>
            <p className="text-xs text-on-surface-variant font-light">Loading user registry...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-[#c4c4c4] mb-2">
              group
            </span>
            <p className="text-sm text-on-surface-variant font-light font-headline">No users registered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-body">
              <thead>
                <tr className="bg-[#FAF6F0] text-on-surface-variant border-b border-outline-variant/20">
                  <th className="p-4 font-semibold">User Details</th>
                  <th className="p-4 font-semibold">Phone Contact</th>
                  <th className="p-4 font-semibold">Account Role</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-surface-container-lowest/30 transition-colors">
                    {/* User Info */}
                    <td className="p-4">
                      <div className="font-semibold text-on-surface">{usr.name}</div>
                      <div className="text-[10px] text-on-surface-variant font-light mt-0.5">{usr.email}</div>
                    </td>

                    {/* Phone */}
                    <td className="p-4 text-on-surface-variant font-mono font-medium">
                      {usr.phone || "Not set"}
                    </td>

                    {/* Role Tag */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        usr.role === "SUPER_ADMIN"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : usr.role === "ADMIN"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-surface-container-low text-on-surface border-outline-variant/20"
                      }`}>
                        {usr.role === "SUPER_ADMIN"
                          ? "Super Admin"
                          : usr.role === "ADMIN"
                          ? "Store Admin"
                          : "Customer"}
                      </span>
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(usr)}
                        disabled={usr.id.toString() === loggedInUser.id.toString()}
                        className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          usr.id.toString() === loggedInUser.id.toString()
                            ? "opacity-50 cursor-not-allowed bg-emerald-50 text-emerald-700 border-emerald-100"
                            : usr.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 cursor-pointer"
                            : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100 cursor-pointer"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${usr.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {usr.is_active ? "Active" : "Banned"}
                      </button>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-center">
                      {usr.id.toString() === loggedInUser.id.toString() ? (
                        <span className="text-[10px] text-on-surface-variant font-light italic">Your Session</span>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(usr)}
                          className="text-xs font-bold text-primary hover:text-primary-container transition-colors cursor-pointer border-b border-primary"
                        >
                          {usr.is_active ? "Deactivate Account" : "Activate Account"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admin Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-outline-variant/30 rounded-2xl w-full max-w-sm shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-headline font-bold text-on-surface">
                Create Store Admin
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-surface-container-low rounded-md"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitAdmin} className="p-6 flex flex-col gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tanya Sen"
                  className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50"
                />
                {formErrors.name && <span className="text-[10px] text-rose-600 font-semibold">{formErrors.name}</span>}
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. tanya@theherbalveda.com"
                  className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50"
                />
                {formErrors.email && <span className="text-[10px] text-rose-600 font-semibold">{formErrors.email}</span>}
              </div>

              {/* Phone Contact */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Phone Contact *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543220"
                  className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50"
                />
                {formErrors.phone && <span className="text-[10px] text-rose-600 font-semibold">{formErrors.phone}</span>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">Account Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="px-3.5 py-2 border border-outline-variant/40 rounded-xl text-xs bg-[#FAF6F0]/20 focus:bg-white focus:outline-none focus:border-primary/50"
                />
                {formErrors.password && <span className="text-[10px] text-rose-600 font-semibold">{formErrors.password}</span>}
              </div>

              {/* Warning label */}
              <p className="text-[9px] text-[#8e918f] font-light leading-normal bg-[#FAF6F0] p-2.5 rounded-lg border border-outline-variant/20 mt-1">
                Notice: Store Administrators have privileges to create/edit products, manage categories, and fulfill orders. They cannot register other admins.
              </p>

              {/* Footer Actions */}
              <div className="border-t border-outline-variant/20 pt-4 mt-2 flex items-center justify-end gap-3">
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
                  {submitting ? "Creating..." : "Register Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
