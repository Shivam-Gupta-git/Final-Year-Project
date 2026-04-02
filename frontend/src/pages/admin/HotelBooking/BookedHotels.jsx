import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getBookingsByHotel,
  updateBookingStatus,
} from "../../../features/user/hotelBookingSlice";
import { useParams } from "react-router-dom";
import {
  Search,
  User,
  Clock3,
  CircleDollarSign,
  CheckCircle2,
  X,
  Package,
} from "lucide-react";

function BookedHotels() {
  const dispatch = useDispatch();
  const { hotelId } = useParams();
  const { hotelBookings = [], loading } = useSelector(
    (state) => state.hotelBooking
  );

  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (hotelId) {
      dispatch(getBookingsByHotel(hotelId));
    }
  }, [dispatch, hotelId]);

  // FILTER BOOKINGS
  const filteredBookings = useMemo(() => {
    return hotelBookings.filter((b) => {
      const query = search.toLowerCase();
      return (
        b.user?.name?.toLowerCase().includes(query) ||
        b.user?.email?.toLowerCase().includes(query)
      );
    });
  }, [hotelBookings, search]);

  // STATS
  const stats = {
    total: hotelBookings.length,
    pending: hotelBookings.filter((b) => b.bookingStatus === "pending").length,
    confirmed: hotelBookings.filter(
      (b) => b.bookingStatus === "confirmed"
    ).length,
    revenue: hotelBookings.reduce((a, b) => a + (b.totalPrice || 0), 0),
  };

  const statusStyles = {
    pending: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20",
    confirmed: "bg-sky-500/15 text-sky-300 border border-sky-500/20",
    cancelled: "bg-red-500/15 text-red-300 border border-red-500/20",
  };

  const handleStatusUpdate = (id, status) => {
    dispatch(updateBookingStatus({ bookingId: id, status }));
    setSelectedBooking(null);
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
              Hotel Bookings
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-400 text-sm md:text-base">
              Manage all room bookings, update status, and monitor revenue from one dashboard.
            </p>
          </div>

          <div className="w-full lg:w-85">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl transition focus-within:border-blue-500/40 focus-within:bg-white/10">
              <Search className="h-5 w-5 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user name or email..."
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Bookings", value: stats.total, icon: User, color: "from-blue-600/20 to-cyan-500/10" },
          { label: "Pending", value: stats.pending, icon: Clock3, color: "from-yellow-600/20 to-orange-500/10" },
          { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2, color: "from-purple-600/20 to-indigo-500/10" },
          { label: "Revenue", value: `₹${stats.revenue}`, icon: CircleDollarSign, color: "from-emerald-600/20 to-green-500/10" },
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
                  <h2 className="mt-3 text-3xl font-bold text-white">{card.value}</h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOOKINGS TABLE */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl max-h-[calc(100vh-250px)] overflow-y-auto ">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
            <p className="text-sm text-zinc-500">Showing {filteredBookings.length} bookings</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5">
            <thead>
              <tr className="border-b border-white/10 bg-white/3 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Rooms</th>
                <th className="px-6 py-4">Check-In</th>
                <th className="px-6 py-4">Check-Out</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking._id}
                  onClick={() => setSelectedBooking(booking)}
                  className="cursor-pointer border-b border-white/5 transition-all duration-300 hover:bg-white/4"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{booking.user?.name || "Guest"}</p>
                        <p className="text-sm text-zinc-500">{booking.user?.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">{booking.bookedRooms}</td>

                  <td className="px-6 py-5">{new Date(booking.checkIn).toLocaleDateString()}</td>

                  <td className="px-6 py-5">{new Date(booking.checkOut).toLocaleDateString()}</td>

                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[booking.bookingStatus]}`}>
                      {booking.bookingStatus}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                    >
                      View Booking
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SIDEBAR MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Booking Details</p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  {selectedBooking.user?.name || "Guest"}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/3 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">User</p>
                  <p className="mt-1 font-semibold text-white">{selectedBooking.user?.name}</p>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedBooking.bookingStatus]}`}>
                  {selectedBooking.bookingStatus}
                </span>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/3 p-5">
              <div className="mb-4 flex items-center gap-2 text-white font-semibold">
                <Package className="h-5 w-5 text-blue-400" />
                Booking Info
              </div>

              <div className="space-y-3">
                <p>Rooms Booked: {selectedBooking.bookedRooms}</p>
                <p>Check-In: {new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                <p>Check-Out: {new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                <p>Total Price: ₹{selectedBooking.totalPrice || 0}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedBooking.bookingStatus !== "confirmed" && (
                <button
                  onClick={() => handleStatusUpdate(selectedBooking._id, "confirmed")}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500"
                >
                  Confirm Booking
                </button>
              )}
              {selectedBooking.bookingStatus !== "pending" && (
                <button
                  onClick={() => handleStatusUpdate(selectedBooking._id, "pending")}
                  className="rounded-2xl bg-yellow-600 px-5 py-3 font-semibold text-white transition hover:bg-yellow-500"
                >
                  Mark Pending
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookedHotels;