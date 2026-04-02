// PendingOrders.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptOrderThunk,
  deliverOrderThunk,
  getPendingOrdersThunk,
  pickupOrderThunk,
} from "../../../features/user/deliveryBoySlice";

function PendingOrders() {
  const dispatch = useDispatch();
  const {
    orders = [],
    loading,
    error,
  } = useSelector((state) => state.deliveryBoy);

  const [liveLocationName, setLiveLocationName] = useState("");

  useEffect(() => {
    dispatch(getPendingOrdersThunk());
  }, [dispatch]);

  useEffect(() => {
    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            const data = await response.json();

            setLiveLocationName(
              data?.display_name || "Unable to detect your location"
            );
          } catch (err) {
            console.error("Reverse geocoding error:", err);
            setLiveLocationName("Unable to detect your location");
          }
        },
        (err) => {
          console.error("Location Error:", err);
          setLiveLocationName("Location permission denied");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 10000,
        }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-xl">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <span className="font-medium text-slate-700">
            Loading your active orders...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-red-600">
            Failed to load orders
          </h2>
          <p className="mt-3 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
            📦
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-800">
            No Active Deliveries
          </h2>
          <p className="mt-2 text-slate-500">
            You do not have any assigned orders right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 text-gray-200 font-['DM_Sans',sans-serif]">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Title Card */}
          <div className="flex-1 rounded-2xl bg-gray-800 border border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-200">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Active Deliveries
            </h1>
            <p className="mt-2 text-gray-400">
              View assigned orders, restaurant details and customer locations.
            </p>
          </div>

          {/* Location Card */}
          <div className="mt-4 lg:mt-0 max-w-xl rounded-2xl border border-gray-500 bg-linear-to-r from-gray-700 bg-gray-200 to-gray-800 px-5 py-4 shadow-lg hover:shadow-xl transition-all duration-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Your Current Location
            </p>
            <p className="mt-2 text-sm leading-6 text-white">
              {liveLocationName || "Detecting your current location..."}
            </p>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {orders.map((order) => {
            const deliveryAddress = `${order.deliveryAddress?.street || ""}, ${
              order.deliveryAddress?.city || ""
            }, ${order.deliveryAddress?.pincode || ""}`;
            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Order Header */}
                <div className="bg-linear-to-r from-gray-700 bg-gray-200 to-gray-800 p-6 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-[50%]">
                      <p className="text-xs uppercase tracking-[0.3em] text-blue-200">
                        Order ID
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">
                        #{order._id.slice(-6).toUpperCase()}
                      </h2>
                    </div>
                    <div className="w-[50%] flex flex-col items-end justify-end gap-3">
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                          order.status === "assigned"
                            ? "border border-amber-300/30 bg-amber-500/20 text-amber-100"
                            : order.status === "accepted_by_delivery_boy"
                            ? "border border-cyan-300/30 bg-cyan-500/20 text-cyan-100"
                            : "border border-emerald-300/30 bg-emerald-500/20 text-emerald-100"
                        }`}
                      >
                        {order.status.replaceAll("_", " ")}
                      </span>
                      <div>
                        {order.status === "assigned" && (
                          <button
                            onClick={() =>
                              dispatch(acceptOrderThunk(order._id))
                            }
                            disabled={order.status !== "assigned"}
                            className="rounded-xl bg-blue-400 px-4 py-2 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                          >
                            Accept Order
                          </button>
                        )}

                        {order.status === "accepted_by_delivery_boy" && (
                          <button
                            onClick={() =>
                              dispatch(pickupOrderThunk(order._id))
                            }
                            disabled={
                              order.status !== "accepted_by_delivery_boy"
                            }
                            className="rounded-xl bg-orange-600 px-4 py-2 text-white font-semibold hover:bg-orange-700 disabled:opacity-50"
                          >
                            Pickup Order
                          </button>
                        )}

                        {order.status === "out_for_delivery" && (
                          <button
                            onClick={() =>
                              dispatch(deliverOrderThunk(order._id))
                            }
                            disabled={loading}
                            className="rounded-2xl bg-[#3e5c76] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1d2d44] hover:border-[#748cab] hover:border disabled:opacity-50"
                          >
                            Mark as Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-6 p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Customer Card */}
                    <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
                      <h3 className="mb-4 text-lg font-bold text-white">
                        Customer Details
                      </h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p>
                          <span className="font-semibold text-white">
                            Name:
                          </span>{" "}
                          {order.deliveryAddress?.name}
                        </p>
                        <p>
                          <span className="font-semibold text-white">
                            Phone:
                          </span>{" "}
                          {order.user?.contactNumber}
                        </p>
                        <p>
                          <span className="font-semibold text-white">
                            Address:
                          </span>{" "}
                          {deliveryAddress}
                        </p>
                      </div>
                    </div>

                    {/* Restaurant Card */}
                    <div className="rounded-2xl border border-gray-700 bg-gray-800 p-5">
                      <h3 className="mb-4 text-lg font-bold text-white">
                        Restaurant Details
                      </h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p>
                          <span className="font-semibold text-white">
                            Restaurant:
                          </span>{" "}
                          {order.restaurantInfo?.name}
                        </p>
                        <p>
                          <span className="font-semibold text-white">
                            Address:
                          </span>{" "}
                          {order.restaurantInfo?.address}
                        </p>
                        <p>
                          <span className="font-semibold text-white">
                            Payment:
                          </span>{" "}
                          {order.paymentMethod}
                        </p>
                        <p>
                          <span className="font-semibold text-white">
                            Amount:
                          </span>{" "}
                          ₹{order.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Route Card */}
                  <div className="rounded-2xl border border-[#748cab] bg-gray-800 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Delivery Route
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Open navigation to reach the customer quickly.
                        </p>
                      </div>

                      {order.deliveryAddress?.location?.coordinates && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryAddress.location.coordinates[1]},${order.deliveryAddress.location.coordinates[0]}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-2xl bg-[#457b9d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3e5c76] transition"
                        >
                          Open in Google Maps
                        </a>
                      )}
                    </div>

                    <div className="mt-4 rounded-2xl border border-gray-700 bg-gray-900 p-4 text-sm text-gray-300">
                      <p>
                        <span className="font-semibold text-white">
                          Current Location:
                        </span>{" "}
                        {liveLocationName ||
                          "Detecting your current location..."}
                      </p>
                      <p className="mt-3">
                        <span className="font-semibold text-white">
                          Delivery Destination:
                        </span>{" "}
                        {deliveryAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PendingOrders;
