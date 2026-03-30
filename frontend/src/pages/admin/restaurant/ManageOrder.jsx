import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptOrderThunk,
  fetchAdminOrders,
  rejectOrderThunk,
  updateStatusThunk,
} from "../../../features/user/foodSlice";
import { Link } from "react-router-dom";

function OrdersDashboard() {
  const dispatch = useDispatch();

  const { orders = [], loading } = useSelector((state) => state.food);

  // 🔥 MODAL STATES
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    out_for_delivery: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-red-100 text-red-700",
  };

  useEffect(() => {
    dispatch(fetchAdminOrders());
  }, [dispatch]);

  useEffect(() => {

  }, [orders])



  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-600 dark:text-gray-300">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Orders Dashboard
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">User</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="p-4 font-medium">#{order._id.slice(-6)}</td>
                  <td className="p-4">{order.user?.email}</td>
                  <td className="p-4 font-semibold">₹{order.totalAmount}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColor[order.status]
                      }`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td
                    className="p-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔥 ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 p-6 overflow-y-auto">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="mb-4 text-sm text-gray-500"
            >
              ← Back
            </button>

            {/* HEADER */}
            <h2 className="text-xl font-bold mb-4">
              Order #{selectedOrder._id.slice(-6)}
            </h2>

            {/* STATUS */}
            <div className="mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  statusColor[selectedOrder.status]
                }`}
              >
                {selectedOrder.status.replace("_", " ")}
              </span>
            </div>

            {/* USER */}
            <p className="text-sm mb-2">👤 {selectedOrder.user?.email}</p>

            {/* ITEMS */}
            <div className="border-t pt-3 mt-3">
              <h3 className="font-semibold mb-2">Items</h3>
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm mb-1">
                  <p>
                    {item.food.name} × {item.food.quantity}
                  </p>
                  <p>₹{item.food.price * item.food.quantity}</p>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="mt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>₹{selectedOrder.totalAmount}</span>
            </div>

            {/* DELIVERY ADDRESS */}
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-sm">
              <p className="font-medium">📍 Address</p>
              <p>{selectedOrder.deliveryAddress?.name}</p>
              <p className="text-xs">
                {selectedOrder.deliveryAddress?.street},{" "}
                {selectedOrder.deliveryAddress?.city} -{" "}
                {selectedOrder.deliveryAddress?.pincode}
              </p>
            </div>

            {/* CANCEL INFO */}
            {(selectedOrder.status === "cancelled" ||
              selectedOrder.status === "failed") && (
              <div className="mt-4 bg-red-50 p-3 rounded-xl text-sm">
                <p className="text-red-600 font-medium">Cancelled</p>
                <p>Reason: {selectedOrder.cancelReason}</p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {selectedOrder.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      dispatch(acceptOrderThunk(selectedOrder._id))
                    }
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => {
                      setShowCancelModal(true);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Reject
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
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Start Preparing
                </button>
              )}

              {selectedOrder.status === "preparing" && (
                <button
                  onClick={() =>
                    dispatch(
                      updateStatusThunk({
                        orderId: selectedOrder._id,
                        status: "out_for_delivery",
                      
                      })
                      )
                    }
                  className="bg-purple-500 text-white px-4 py-2 rounded"
                >
                  Out for Delivery
                </button>
              )}

              <Link
                to={`/admin/AdminOrderDetails/${selectedOrder._id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 CANCEL MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              Cancel Order
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Select reason or write your own
            </p>

            {/* SUGGESTIONS */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                "Item not available",
                "Restaurant closed",
                "Out of stock",
                "Too busy",
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    cancelReason === reason
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* INPUT */}
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Write custom reason..."
              className="w-full border rounded-lg p-2 text-sm dark:bg-gray-800 dark:border-gray-700"
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                Close
              </button>

              <button
                disabled={!cancelReason.trim()}
                onClick={() => {
                  dispatch(
                    rejectOrderThunk({
                      orderId: selectedOrder._id,
                      reason: cancelReason,
                    })
                  );
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className={`px-4 py-2 text-sm rounded-lg text-white ${
                  cancelReason ? "bg-red-500" : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersDashboard;
