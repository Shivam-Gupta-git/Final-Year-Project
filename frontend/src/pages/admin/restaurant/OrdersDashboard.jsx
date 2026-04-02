import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ClipboardList,
  IndianRupee,
  Clock3,
  Users,
  Plus,
  Package,
  UserRound,
} from "lucide-react";
import { fetchAdminOrders } from "../../../features/user/foodSlice";

function OrdersDashboard() {
  const dispatch = useDispatch();
  const { orders = [], loading } = useSelector((state) => state.food);

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  const revenue = orders
    .filter(
      (order) =>
        order.status === "confirmed" || order.status === "delivered"
    )
    .reduce((acc, order) => acc + order.totalAmount, 0);

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const uniqueUsers = [...new Set(orders.map((o) => o.user?._id))].length;

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: ClipboardList,
      color: "from-cyan-500 to-blue-600",
    },
    {
      title: "Revenue",
      value: `₹${revenue}`,
      icon: IndianRupee,
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock3,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Users",
      value: uniqueUsers,
      icon: Users,
      color: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] px-5 py-6 md:px-8 lg:px-10 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="rounded-4xl border border-white/10 bg-white/4 backdrop-blur-2xl p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-300 mb-4">
                <Package className="h-4 w-4" />
                Food Admin Dashboard
              </div>

              <h1 className="text-3xl md:text-5xl font-bold leading-tight bg-linear-to-r from-white via-cyan-100 to-slate-400 bg-clip-text text-transparent">
                Monitor orders, revenue
                <br className="hidden md:block" />
                and customer activity.
              </h1>

              <p className="mt-4 max-w-2xl text-slate-400 text-sm md:text-base leading-7">
                Get a complete overview of your platform with real-time order
                tracking, revenue insights, and quick access to food and user
                management.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/admin/create-food"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-6 py-4 font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition duration-300 hover:scale-[1.03]"
              >
                <Plus className="h-5 w-5 transition group-hover:rotate-90" />
                Add Food
              </Link>

              <Link
                to="/admin/manage-orders"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-slate-200 transition hover:bg-white/10"
              >
                View Orders
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group rounded-3xl border border-white/10 bg-white/4 p-5 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{item.title}</p>
                    <h2 className="mt-3 text-3xl font-bold text-white">
                      {item.value}
                    </h2>
                  </div>

                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${item.color} shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="mt-5 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full w-2/3 rounded-full bg-linear-to-r ${item.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
          {/* Recent Orders */}
          <div className="rounded-3xl border border-white/10 bg-white/4 backdrop-blur-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Recent Orders
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Latest customer orders on your platform
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                {orders.length} Total
              </div>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-white/8 bg-[#0d1525] p-5 transition hover:border-cyan-400/20 hover:bg-[#101b30]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        {order.deliveryAddress?.name || "Customer"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Order #{order._id.slice(-6)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 md:gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Amount
                      </p>
                      <p className="font-semibold text-emerald-400">
                        ₹{order.totalAmount}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${
                        order.status === "pending"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                          : order.status === "confirmed"
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                          : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/4 backdrop-blur-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-5">
                Quick Actions
              </h2>

              <div className="space-y-4">
                <Link
                  to="/admin/manage-orders"
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d1525] p-5 transition hover:border-cyan-400/30 hover:bg-cyan-500/10"
                >
                  <div>
                    <p className="font-semibold text-white">Manage Orders</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Update and track customer orders
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-cyan-300 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>

                <Link
                  to="/admin/create-food"
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d1525] p-5 transition hover:border-emerald-400/30 hover:bg-emerald-500/10"
                >
                  <div>
                    <p className="font-semibold text-white">Add Food Item</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Create a new dish for your menu
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-emerald-300 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>

                <Link
                  to="/admin/ViewUsers"
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d1525] p-5 transition hover:border-violet-400/30 hover:bg-violet-500/10"
                >
                  <div>
                    <p className="font-semibold text-white">View Users</p>
                    <p className="mt-1 text-sm text-slate-400">
                      See all registered platform users
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-violet-300 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-cyan-500/10 via-blue-500/10 to-violet-500/10 p-6 backdrop-blur-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Live Status
              </p>
              <h3 className="mt-3 text-2xl font-bold text-white">
                {loading ? "Loading dashboard..." : "Everything looks good"}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Your platform is active and all recent orders are being updated
                in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrdersDashboard;