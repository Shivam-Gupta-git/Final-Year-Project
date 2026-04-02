import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptOrderThunk,
  fetchAdminOrders,
  rejectOrderThunk,
  updateStatusThunk,
} from "../../../features/user/foodSlice";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Clock3,
  CircleDollarSign,
  User,
  X,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";

function OrdersDashboard() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { orders = [], loading } = useSelector((state) => state.food);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch, location.pathname]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = search.toLowerCase();
      return (
        order._id?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query) ||
        order.deliveryAddress?.name?.toLowerCase().includes(query)
      );
    });
  }, [orders, search]);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    revenue: orders
      .filter((o) => ["confirmed", "delivered"].includes(o.status))
      .reduce((a, b) => a + b.totalAmount, 0),
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const statusStyles = {
    pending:
      "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20",
    confirmed:
      "bg-sky-500/15 text-sky-300 border border-sky-500/20",
    preparing:
      "bg-purple-500/15 text-purple-300 border border-purple-500/20",
    out_for_delivery:
      "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20",
    delivered:
      "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
    failed:
      "bg-red-500/15 text-red-300 border border-red-500/20",
    cancelled:
      "bg-red-500/15 text-red-300 border border-red-500/20",
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-6 py-6">
      {/* HEADER */}
      <div className="mb-8 rounded-3xl border border-white/10 bg-linear-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.55)] relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
              Admin Panel
            </p>
            <h1 className="text-3xl md:text-5xl font-black bg-linear-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
              Orders Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-400 text-sm md:text-base">
              Manage customer orders, update statuses, assign delivery partners,
              and monitor real-time activity from one place.
            </p>
          </div>

          <div className="w-full lg:w-85">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl transition focus-within:border-blue-500/40 focus-within:bg-white/10">
              <Search className="h-5 w-5 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, customer, ID..."
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {[
          {
            label: "Total Orders",
            value: stats.total,
            icon: ShoppingBag,
            color: "from-blue-600/20 to-cyan-500/10",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock3,
            color: "from-yellow-600/20 to-orange-500/10",
          },
          {
            label: "Revenue",
            value: `₹${stats.revenue}`,
            icon: CircleDollarSign,
            color: "from-emerald-600/20 to-green-500/10",
          },
          {
            label: "Delivered",
            value: stats.delivered,
            icon: CheckCircle2,
            color: "from-purple-600/20 to-indigo-500/10",
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`rounded-3xl border border-white/10 bg-linear-to-br ${card.color} p-5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-zinc-400">{card.label}</p>
                  <h2 className="mt-3 text-3xl font-bold text-white">
                    {card.value}
                  </h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Showing {filteredOrders.length} orders
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5">
            <thead>
              <tr className="border-b border-white/10 bg-white/3 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className="cursor-pointer border-b border-white/5 transition-all duration-300 hover:bg-white/4"
                >
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-semibold text-white">
                        #{order._id.slice(-6)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-200">
                          {order.deliveryAddress?.name}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {order.user?.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-lg font-bold text-emerald-400">
                    ₹{order.totalAmount}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[order.status]}`}
                    >
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </td>

                  <td
                    className="px-6 py-5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                    >
                      View Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SIDEBAR MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Order Details</p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  #{selectedOrder._id.slice(-6)}
                </h2>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/3 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Customer</p>
                  <p className="mt-1 font-semibold text-white">
                    {selectedOrder.user?.email}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedOrder.status]}`}
                >
                  {selectedOrder.status.replaceAll("_", " ")}
                </span>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/3 p-5">
              <div className="mb-4 flex items-center gap-2 text-white font-semibold">
                <Package className="h-5 w-5 text-blue-400" />
                Ordered Items
              </div>

              <div className="space-y-3">
                {selectedOrder.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/3 p-4"
                  >
                    <div>
                      <p className="font-medium text-white">{item.food.name}</p>
                      <p className="text-sm text-zinc-500">
                        Qty: {item.food.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-emerald-400">
                      ₹{item.food.price * item.food.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-lg font-bold text-white">
                <span>Total</span>
                <span className="text-emerald-400">
                  ₹{selectedOrder.totalAmount}
                </span>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/3 p-5">
              <p className="mb-2 font-semibold text-white">Delivery Address</p>
              <p className="text-zinc-300">{selectedOrder.deliveryAddress?.name}</p>
              <p className="mt-2 text-sm text-zinc-500 leading-6">
                {selectedOrder.deliveryAddress?.street},
                {selectedOrder.deliveryAddress?.city},
                {selectedOrder.deliveryAddress?.pincode}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedOrder.status === "pending" && (
                <>
                  <button
                    onClick={() => dispatch(acceptOrderThunk(selectedOrder._id))}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500"
                  >
                    Accept Order
                  </button>

                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="rounded-2xl bg-red-600/90 px-5 py-3 font-semibold text-white transition hover:bg-red-500"
                  >
                    Reject Order
                  </button>
                </>
              )}

              {selectedOrder.status === "confirmed" && (
                <button
                  onClick={() =>
                    dispatch(
                      updateStatusThunk({
                        orderId: selectedOrder._id,
                        status: "preparing",
                      })
                    )
                  }
                  className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
                >
                  Start Preparing
                </button>
              )}

              {selectedOrder.status === "preparing" && (
                <Link
                  to={`/admin/AdminAssignDeliveryBoy/${selectedOrder._id}`}
                  className="rounded-2xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-500"
                >
                  Assign Delivery Boy
                </Link>
              )}

              <Link
                to={`/admin/AdminOrderDetails/${selectedOrder._id}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Full Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersDashboard;