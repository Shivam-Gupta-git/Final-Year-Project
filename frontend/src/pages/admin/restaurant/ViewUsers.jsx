import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrders } from "../../../features/user/foodSlice";
import { Search, Users, ShoppingBag, Mail, User2 } from "lucide-react";

function ViewUsers() {
  const dispatch = useDispatch();
  const { orders = [], loading } = useSelector((state) => state.food);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  const uniqueUsers = useMemo(() => {
    const usersMap = {};

    orders.forEach((order) => {
      const userId = order.user?._id;

      if (!userId) return;

      if (!usersMap[userId]) {
        usersMap[userId] = {
          id: userId,
          name: order.user?.name || "No Name",
          email: order.user?.email,
          ordersCount: 1,
          totalSpent: order.totalAmount || 0,
        };
      } else {
        usersMap[userId].ordersCount += 1;
        usersMap[userId].totalSpent += order.totalAmount || 0;
      }
    });

    return Object.values(usersMap).filter((user) => {
      const q = search.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
      );
    });
  }, [orders, search]);

  return (
    <div className="min-h-screen bg-black px-4 md:px-6 py-6 text-white">
      {/* HEADER */}
      <div className="mb-8 rounded-3xl border border-white/10 bg-linear-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.55)] overflow-hidden relative">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
              Admin Panel
            </p>

            <h1 className="text-3xl md:text-5xl font-black bg-linear-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
              Users Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-zinc-400 text-sm md:text-base">
              View all customers, monitor their activity, and track how many
              orders each user has placed.
            </p>
          </div>

          <div className="w-full lg:w-85">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl transition focus-within:border-blue-500/40 focus-within:bg-white/10">
              <Search className="h-5 w-5 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="rounded-3xl border border-white/10 bg-linear-to-br from-blue-600/15 to-cyan-500/10 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Users</p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                {uniqueUsers.length}
              </h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <Users className="h-6 w-6 text-blue-300" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-linear-to-br from-purple-600/15 to-indigo-500/10 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Total Orders</p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                {orders.length}
              </h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <ShoppingBag className="h-6 w-6 text-purple-300" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-linear-to-br from-emerald-600/15 to-green-500/10 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Active Customers</p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                {uniqueUsers.filter((u) => u.ordersCount > 1).length}
              </h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <User2 className="h-6 w-6 text-emerald-300" />
            </div>
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-white">Customer List</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {uniqueUsers.length} users found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-500 text-lg">
            Loading users...
          </div>
        ) : uniqueUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Users className="mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5">
              <thead>
                <tr className="border-b border-white/10 bg-white/3 text-left text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4 text-right">Spent</th>
                </tr>
              </thead>

              <tbody>
                {uniqueUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 transition-all duration-300 hover:bg-white/4"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
                          <User2 className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-zinc-500">
                            ID: {user.id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Mail className="h-4 w-4 text-zinc-500" />
                        {user.email}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 text-sm font-semibold text-blue-300">
                        {user.ordersCount} Orders
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right text-lg font-bold text-emerald-400">
                      ₹{user.totalSpent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewUsers;