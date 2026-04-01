// DeliveryBoyDashboard.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Bike,
  Clock,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Package,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  getDeliveryBoyProfileThunk,
  updateDeliveryBoyStatus,
} from "../../../features/user/deliveryBoySlice";
import { Link } from "react-router-dom";

function StatusPill({ active, activeLabel, inactiveLabel, activeColor }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
        active ? activeColor : "bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? "bg-current animate-pulse" : "bg-gray-400"
        }`}
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function DeliveryBoyDashboard() {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.deliveryBoy);

  //  console.log(profile);

  const handleToggle = (field) => {
    if (!profile?._id) return;
    dispatch(
      updateDeliveryBoyStatus({ id: profile._id, [field]: !profile[field] })
    );
  };

  useEffect(() => {
    dispatch(getDeliveryBoyProfileThunk());
  }, [dispatch]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#3B5BDB] border-t-transparent animate-spin" />
          <p className="text-[#3B5BDB] font-semibold tracking-wide text-sm">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC]">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <XCircle className="text-red-500 w-10 h-10" />
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DB";

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-['DM_Sans',sans-serif]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

      {/* Top Nav Strip */}
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3B5BDB] flex items-center justify-center">
            <Bike className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 text-sm tracking-tight font-['Syne',sans-serif]">
            FleetDash
          </span>
        </div>
        <div className="flex items-center gap-3">
          {profile.isOnline ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              Offline
            </span>
          )}
          <div className="w-8 h-8 rounded-full bg-[#3B5BDB] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero Header Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#1E2A4A] p-6 sm:p-8 text-white shadow-xl">
          {/* Background decoration */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-[#3B5BDB]/30" />
          <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-[#3B5BDB] to-[#7048E8]" />

          <div className="relative z-10">
            <p className="text-xs text-blue-300 font-semibold uppercase tracking-widest mb-1">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Syne',sans-serif] leading-tight">
              {profile.name
                ? `Hey, ${profile.name.split(" ")[0]} 👋`
                : "Delivery Dashboard"}
            </h1>
            <p className="mt-1 text-blue-200 text-sm">
              {profile.isOnline
                ? "You're live and accepting deliveries."
                : "You're currently offline."}
            </p>

            {/* Toggle Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => handleToggle("isOnline")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md ${
                  profile.isOnline
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                {profile.isOnline ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                {profile.isOnline ? "Online" : "Go Online"}
              </button>

              <button
                onClick={() => handleToggle("isAvailable")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md ${
                  profile.isAvailable
                    ? "bg-[#3B5BDB] hover:bg-[#3451C7] text-white"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                {profile.isAvailable ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {profile.isAvailable ? "Available" : "Set Available"}
              </button>
            </div>
          </div>
        </div>

        {/* Status Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Status",
              value: profile.isOnline ? "Online" : "Offline",
              color: profile.isOnline ? "text-emerald-600" : "text-gray-400",
              bg: profile.isOnline ? "bg-emerald-50" : "bg-gray-50",
            },
            {
              label: "Mode",
              value: profile.isAvailable ? "Available" : "Busy",
              color: profile.isAvailable ? "text-blue-600" : "text-amber-600",
              bg: profile.isAvailable ? "bg-blue-50" : "bg-amber-50",
            },
            {
              label: "Orders Today",
              value: profile.ordersToday ?? "—",
              color: "text-indigo-700",
              bg: "bg-indigo-50",
            },
            {
              label: "Rating",
              value: profile.rating ? `${profile.rating} ★` : "—",
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-xl px-4 py-3 flex flex-col gap-1`}
            >
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Availability Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Bike className="text-blue-600 w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-800 text-sm">
                  Availability
                </span>
              </div>
              <StatusPill
                active={profile.isAvailable}
                activeLabel="Available"
                inactiveLabel="Busy"
                activeColor="bg-green-100 text-green-700"
              />
            </div>
            <div className="h-px bg-slate-100 mb-4" />
            <p className="text-xs text-gray-400 leading-relaxed">
              {profile.isAvailable
                ? "You can receive new delivery assignments."
                : "You're marked as busy. Toggle to receive orders."}
            </p>
            <button
              onClick={() => handleToggle("isAvailable")}
              className="mt-4 w-full py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              {profile.isAvailable ? "Mark as Busy" : "Mark as Available"}
            </button>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <MapPin className="text-indigo-600 w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-800 text-sm">
                  Location
                </span>
              </div>
              {profile.location && (
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Tracked
                </span>
              )}
            </div>
            <div className="h-px bg-slate-100 mb-4" />
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
              {profile.fullAddress ||
                "Location not updated yet. Go to Live Location to start tracking."}
            </p>
            <Link
              to="/admin/livelocation-update"
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              View Live Map <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Current Order Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Package className="text-amber-600 w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-800 text-sm">
                  Active Order
                </span>
              </div>
              {profile.currentOrder && (
                <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full capitalize">
                  {profile.currentOrder.status}
                </span>
              )}
            </div>
            <div className="h-px bg-slate-100 mb-4" />
            {profile.currentOrder ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Customer</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {profile?.currentOrder?.deliveryAddress?.name || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Restaurant</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {profile?.currentOrder?.restaurantInfo?.name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-2 bg-amber-50 rounded-lg px-3 py-2 text-xs text-amber-700 font-medium">
                  {profile.currentOrder.status === "picked_up"
                    ? "🚀 En route to customer"
                    : "⏳ Awaiting pickup"}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-3 text-center">
                <Package className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No order assigned</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  You'll be notified when a new order arrives
                </p>
              </div>
            )}
          </div>
          <div>
            {/* Pending Orders Card */}
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Package className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Pending Orders
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {profile?.pendingOrdersCount ?? 0}
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/pending-orders"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  View Orders <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-xs text-gray-400">
                Review and accept your pending deliveries here.
              </p>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-400 pb-4">
          FleetDash · Auto-synced · {new Date().toLocaleTimeString("en-IN")}
        </p>
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;
