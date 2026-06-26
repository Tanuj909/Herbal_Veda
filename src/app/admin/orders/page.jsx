"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // Detail Modal
  const [updatingId, setUpdatingId] = useState(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("");

  // Alert State
  const [alert, setAlert] = useState(null);

  const triggerAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const MOCK_ORDERS = [
    {
      id: "demo-101",
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      total_amount: 54.0,
      status: "PROCESSING",
      payment_status: "SUCCESS",
      payment_method: "Credit Card",
      user: { name: "Ananya Sharma", email: "ananya@example.com", phone: "9876543211" },
      address: {
        full_name: "Ananya Sharma",
        phone: "9876543211",
        address_line1: "Apt 4B, Forest Heights",
        city: "Mumbai",
        state: "Maharashtra",
        postal_code: "400001",
        country: "India",
      },
      items: [
        {
          id: "item-1",
          quantity: 2,
          price: 27.0,
          product: { name: "Restorative Sage Oil", sku: "OILS-SAGE-01" },
        },
      ],
    },
    {
      id: "demo-102",
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      total_amount: 118.0,
      status: "CONFIRMED",
      payment_status: "SUCCESS",
      payment_method: "UPI",
      user: { name: "Vikram Malhotra", email: "vikram@example.com", phone: "9876543212" },
      address: {
        full_name: "Vikram Malhotra",
        phone: "9876543212",
        address_line1: "12, Green Glen Layout",
        city: "Bengaluru",
        state: "Karnataka",
        postal_code: "560103",
        country: "India",
      },
      items: [
        {
          id: "item-2",
          quantity: 1,
          price: 118.0,
          product: { name: "Hydrating Botanical Serum", sku: "SKIN-SERUM-03" },
        },
      ],
    },
    {
      id: "demo-103",
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      total_amount: 32.0,
      status: "DELIVERED",
      payment_status: "SUCCESS",
      payment_method: "Debit Card",
      user: { name: "Sneha Patel", email: "sneha@example.com", phone: "9876543213" },
      address: {
        full_name: "Sneha Patel",
        phone: "9876543213",
        address_line1: "Flat 201, Palm Groves",
        city: "Pune",
        state: "Maharashtra",
        postal_code: "411001",
        country: "India",
      },
      items: [
        {
          id: "item-3",
          quantity: 1,
          price: 32.0,
          product: { name: "Clay Cleansing Mask", sku: "SKIN-CLAY-04" },
        },
      ],
    },
  ];

  const loadOrders = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get("/api/orders", config);
      if (response.data && response.data.success && response.data.data.length > 0) {
        setOrders(response.data.data);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch (error) {
      console.error("Failed to load orders data:", error);
      setOrders(MOCK_ORDERS); // Fallback to mock on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [token]);

  // Handle status update
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);

    // Mock update
    if (orderId.toString().startsWith("demo-")) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      setUpdatingId(null);
      triggerAlert("success", `Mock order status updated to ${newStatus}`);
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.put(`/api/orders/${orderId}`, { status: newStatus }, config);
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      triggerAlert("success", "Order status updated successfully");
    } catch (error) {
      triggerAlert("error", error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "CONFIRMED":
      case "PROCESSING":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "PENDING":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-surface-container-low text-on-surface border-outline-variant/30";
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "SUCCESS":
        return "bg-emerald-50 text-emerald-800 border-emerald-100";
      case "PENDING":
        return "bg-amber-50 text-amber-800 border-amber-100";
      case "FAILED":
      case "REFUNDED":
        return "bg-rose-50 text-rose-800 border-rose-100";
      default:
        return "bg-surface-container-low text-on-surface border-outline-variant/30";
    }
  };

  const filteredOrders = orders.filter((o) => !statusFilter || o.status === statusFilter);

  const orderStatuses = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];

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
      <div>
        <h1 className="text-2xl font-headline font-bold text-on-surface">
          Orders Ledger
        </h1>
        <p className="text-xs text-on-surface-variant font-light mt-0.5">
          Process payments, manage delivery transitions, and review invoice details.
        </p>
      </div>

      {/* Filters Area */}
      <div className="bg-white border border-outline-variant/30 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <h3 className="text-xs font-bold text-on-surface-variant">Filter by Order Status</h3>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 border border-outline-variant/40 rounded-xl text-xs bg-white focus:outline-none focus:border-primary/50 cursor-pointer"
        >
          <option value="">All Orders</option>
          {orderStatuses.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin mb-2">
              eco
            </span>
            <p className="text-xs text-on-surface-variant font-light">Loading orders data...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-[#c4c4c4] mb-2">
              receipt_long
            </span>
            <p className="text-sm text-on-surface-variant font-light font-headline">No matching orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-body">
              <thead>
                <tr className="bg-[#FAF6F0] text-on-surface-variant border-b border-outline-variant/20">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Buyer Name</th>
                  <th className="p-4 font-semibold">Order Date</th>
                  <th className="p-4 font-semibold">Total Invoice</th>
                  <th className="p-4 font-semibold text-center">Payment</th>
                  <th className="p-4 font-semibold">Order Status</th>
                  <th className="p-4 font-semibold text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-surface-container-lowest/30 transition-colors">
                    {/* ID */}
                    <td className="p-4 font-mono font-bold text-on-surface-variant">
                      #{ord.id.toString().substring(0, 8)}
                    </td>

                    {/* Customer Info */}
                    <td className="p-4">
                      <div className="font-semibold text-on-surface">{ord.user?.name || "Guest Checkout"}</div>
                      <div className="text-[10px] text-on-surface-variant font-light mt-0.5">{ord.user?.phone}</div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-on-surface-variant font-light">
                      {new Date(ord.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>

                    {/* Total Amount */}
                    <td className="p-4 font-bold text-on-surface">
                      ${parseFloat(ord.total_amount || 0).toFixed(2)}
                    </td>

                    {/* Payment Pill */}
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getPaymentStatusStyle(ord.payment_status)}`}>
                        {ord.payment_status}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        disabled={updatingId === ord.id}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer focus:outline-none transition-colors ${getStatusStyle(ord.status)}`}
                      >
                        {orderStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="inline-flex items-center gap-1 px-3 py-1 border border-outline-variant/35 hover:border-primary rounded-lg font-bold text-xs text-primary hover:bg-surface-container-low transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-outline-variant/30 rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h3 className="text-base font-headline font-bold text-on-surface">
                  Order Details
                </h3>
                <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">Order ID: #{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 hover:bg-surface-container-low rounded-md"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {/* Customer / Shipping Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Buyer Profile</h4>
                  <p className="text-xs font-bold text-on-surface">{selectedOrder.user?.name || "Guest"}</p>
                  <p className="text-xs text-on-surface-variant font-light mt-0.5">{selectedOrder.user?.email}</p>
                  <p className="text-xs text-on-surface-variant font-light mt-0.5">Phone: {selectedOrder.user?.phone}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Shipping Destination</h4>
                  <p className="text-xs font-semibold text-on-surface">{selectedOrder.address?.full_name}</p>
                  <p className="text-xs text-on-surface-variant font-light mt-0.5">{selectedOrder.address?.address_line1}</p>
                  <p className="text-xs text-on-surface-variant font-light mt-0.5">
                    {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.postal_code}
                  </p>
                  <p className="text-xs text-on-surface-variant font-light mt-0.5">{selectedOrder.address?.country}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Ordered Catalog Items</h4>
                <div className="border border-outline-variant/30 rounded-xl overflow-hidden divide-y divide-outline-variant/20 bg-[#FAF6F0]/20">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs gap-3">
                      <div>
                        <p className="font-semibold text-on-surface">{item.product?.name || "Botanical Product"}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono font-light mt-0.5">SKU: {item.product?.sku}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-on-surface-variant font-light">{item.quantity} x </span>
                        <span className="font-bold text-on-surface">${parseFloat(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="p-4 rounded-xl border border-outline-variant/30 bg-[#FAF6F0]/30 flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant font-light">Payment Method:</span>
                  <span className="font-semibold text-on-surface">{selectedOrder.payment_method}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant font-light">Payment Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPaymentStatusStyle(selectedOrder.payment_status)}`}>
                    {selectedOrder.payment_status}
                  </span>
                </div>
                <div className="h-px bg-outline-variant/20 my-1" />
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant font-light">GST:</span>
                  <span className="font-semibold text-on-surface">${parseFloat(selectedOrder.gst || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-on-surface">Grand Total:</span>
                  <span className="font-bold text-primary">${parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Transition Controls inside details */}
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Process Delivery Transition</h4>
                <div className="flex gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none transition-colors ${getStatusStyle(selectedOrder.status)}`}
                  >
                    {orderStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-outline-variant/20 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
