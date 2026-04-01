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
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Active Deliveries
            </h1>
            <p className="mt-2 text-slate-500">
              View assigned orders, restaurant details and customer locations.
            </p>
          </div>

          <div className="max-w-xl rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Your Current Location
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {liveLocationName || "Detecting your current location..."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {orders.map((order) => {
            const deliveryAddress = `${order.deliveryAddress?.street || ""}, ${
              order.deliveryAddress?.city || ""
            }, ${order.deliveryAddress?.pincode || ""}`;

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white">
                  <div className="flex items-start justify-between gap-4 ">
                    <div className="w-[50%]">
                      <p className="text-xs uppercase tracking-[0.3em] text-blue-100">
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
                            ? "border border-amber-300/30 bg-amber-400/20 text-amber-100"
                            : order.status === "accepted_by_delivery_boy"
                            ? "border border-cyan-300/30 bg-cyan-400/20 text-cyan-100"
                            : "border border-emerald-300/30 bg-emerald-400/20 text-emerald-100"
                        }`}
                      >
                        {order.status.replaceAll("_", " ")}
                      </span>
                      <div>
                        {/* actions */}

                        {order.status === "assigned" && (
                          <button
                            onClick={() =>
                              dispatch(acceptOrderThunk(order._id))
                            }
                            disabled={order.status !== "assigned"}
                            className="rounded-xl bg-green-600 px-4 py-2 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
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
                            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Mark as Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="mb-4 text-lg font-bold text-slate-800">
                        Customer Details
                      </h3>

                      <div className="space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-800">
                            Name:
                          </span>{" "}
                          {order.deliveryAddress?.name}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">
                            Phone:
                          </span>{" "}
                          {order.user?.contactNumber}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">
                            Address:
                          </span>{" "}
                          {deliveryAddress}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="mb-4 text-lg font-bold text-slate-800">
                        Restaurant Details
                      </h3>

                      <div className="space-y-2 text-sm text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-800">
                            Restaurant:
                          </span>{" "}
                          {order.restaurantInfo?.name}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">
                            Address:
                          </span>{" "}
                          {order.restaurantInfo?.address}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">
                            Payment:
                          </span>{" "}
                          {order.paymentMethod}
                        </p>
                        <p>
                          <span className="font-semibold text-slate-800">
                            Amount:
                          </span>{" "}
                          ₹{order.totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">
                          Delivery Route
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Open navigation to reach the customer quickly.
                        </p>
                      </div>

                      {order.deliveryAddress?.location?.coordinates && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryAddress.location.coordinates[1]},${order.deliveryAddress.location.coordinates[0]}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Open in Google Maps
                        </a>
                      )}
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-800">
                          Current Location:
                        </span>{" "}
                        {liveLocationName ||
                          "Detecting your current location..."}
                      </p>

                      <p className="mt-3">
                        <span className="font-semibold text-slate-800">
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
