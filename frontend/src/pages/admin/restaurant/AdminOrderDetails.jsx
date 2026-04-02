import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrderDetails } from "../../../features/user/foodSlice";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  CreditCard,
  MapPin,
  Package,
  Calendar,
} from "lucide-react";

function AdminOrderDetails() {
  const dispatch = useDispatch();
  const { orderId } = useParams();

  const { orderDetails, loading, error } = useSelector(
    (state) => state.food
  );

  useEffect(() => {
    dispatch(fetchAdminOrderDetails(orderId));
  }, [dispatch, orderId]);

  const statusColor = {
    pending:
      "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20",
    confirmed:
      "bg-blue-500/15 text-blue-300 border border-blue-500/20",
    preparing:
      "bg-purple-500/15 text-purple-300 border border-purple-500/20",
    out_for_delivery:
      "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20",
    delivered:
      "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
    failed: "bg-red-500/15 text-red-300 border border-red-500/20",
    cancelled:
      "bg-red-500/15 text-red-300 border border-red-500/20",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400 text-lg">
        Loading order details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-400 text-lg">
        {error}
      </div>
    );
  }

  if (!orderDetails) return null;

  return (
    <div className="min-h-screen bg-black px-4 md:px-6 py-6 text-white">
      {/* HEADER */}
      <div className="mb-8 rounded-3xl border border-white/10 bg-linear-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.55)] overflow-hidden relative">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <Link
              to="/admin/orders"
              className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>

            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
              Order Details
            </p>

            <h1 className="text-3xl md:text-5xl font-black bg-linear-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
              #{orderDetails.orderId.slice(-6)}
            </h1>

            <p className="mt-3 flex items-center gap-2 text-zinc-400 text-sm">
              <Calendar className="h-4 w-4" />
              {new Date(orderDetails.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <span
              className={`inline-flex rounded-full px-5 py-3 text-sm font-semibold capitalize ${statusColor[orderDetails.status]}`}
            >
              {orderDetails.status.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Customer Info</h2>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-semibold text-white">
              {orderDetails.user?.name}
            </p>
            <p className="text-zinc-400">{orderDetails.user?.email}</p>
            <p className="text-zinc-500">{orderDetails.user?.phone}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Payment Info</h2>
          </div>

          <div className="space-y-3 text-zinc-300">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-zinc-500">Method</span>
              <span className="font-medium uppercase">
                {orderDetails.paymentMethod}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-zinc-500">Items</span>
              <span>{orderDetails.items.length}</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-zinc-500">Total</span>
              <span className="text-2xl font-bold text-emerald-400">
                ₹{orderDetails.totalAmount}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-purple-500/15 p-3 text-purple-300">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Delivery Address</h2>
          </div>

          <div className="space-y-2 text-zinc-300 leading-7">
            <p className="font-semibold text-white">
              {orderDetails.deliveryAddress?.name}
            </p>
            <p>{orderDetails.deliveryAddress?.street}</p>
            <p>
              {orderDetails.deliveryAddress?.city} -
              {orderDetails.deliveryAddress?.pincode}
            </p>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl mb-8">
        <div className="border-b border-white/10 px-6 py-5 flex items-center gap-3">
          <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Ordered Items</h2>
            <p className="text-sm text-zinc-500 mt-1">
              {orderDetails.items.length} items in this order
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="bg-white/3 border-b border-white/10 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Total</th>
              </tr>
            </thead>

            <tbody>
              {orderDetails.items.map((item) => (
                <tr
                  key={item.foodId}
                  className="border-b border-white/5 transition hover:bg-white/3"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded-2xl object-cover border border-white/10"
                        />
                      )}

                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-zinc-500">
                          Food ID: {item.foodId?.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-zinc-300">
                    {item.restaurant?.name}
                  </td>

                  <td className="px-6 py-5 text-zinc-400">₹{item.price}</td>

                  <td className="px-6 py-5 text-white font-medium">
                    {item.quantity}
                  </td>

                  <td className="px-6 py-5 text-lg font-bold text-emerald-400">
                    ₹{item.price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANCEL CARD */}
      {orderDetails.cancelReason && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 shadow-[0_10px_30px_rgba(239,68,68,0.15)]">
          <h3 className="mb-2 text-lg font-bold text-red-300">
            Order Cancelled
          </h3>
          <p className="text-red-200/90">{orderDetails.cancelReason}</p>
        </div>
      )}
    </div>
  );
}

export default AdminOrderDetails;