import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminOrderDetails } from "../../../features/user/foodSlice";
import { useParams, Link } from "react-router-dom";

function AdminOrderDetails() {
  const dispatch = useDispatch();
  const { orderId } = useParams();
  const { orderDetails, loading, error } = useSelector((state) => state.food);

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-purple-100 text-purple-800",
    out_for_delivery: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-red-100 text-red-800",
  };

  useEffect(() => {
    dispatch(fetchAdminOrderDetails(orderId));
    return () => {
      // dispatch(clearOrderDetails());
    };
  }, [dispatch, orderId]);

  if (loading) return <p className="text-gray-500 p-6">Loading order details...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;
  if (!orderDetails) return null;

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Order #{orderDetails.orderId.slice(-6)}
        </h1>
        <span
          className={`px-4 py-2 rounded-full font-semibold text-sm ${statusColor[orderDetails.status]}`}
        >
          {orderDetails.status.replace("_", " ")}
        </span>
      </div>

      {/* CUSTOMER & PAYMENT INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Customer Info</h2>
          <p className="font-medium text-gray-800 dark:text-white">{orderDetails.user?.name}</p>
          <p className="text-sm text-gray-500">{orderDetails.user?.email}</p>
          <p className="text-sm text-gray-500">{orderDetails.user?.phone}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Payment Info</h2>
          <p className="text-sm text-gray-500">Method: {orderDetails.paymentMethod.toUpperCase()}</p>
          <p className="text-sm text-gray-500">
            Placed on: {new Date(orderDetails.createdAt).toLocaleString()}
          </p>
          <p className="font-semibold text-gray-800 dark:text-white text-lg mt-2">
            Total: ₹{orderDetails.totalAmount}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Delivery Address</h2>
          <p className="font-medium text-gray-800 dark:text-white">{orderDetails.deliveryAddress?.name}</p>
          <p className="text-sm text-gray-500">
            {orderDetails.deliveryAddress?.street}, {orderDetails.deliveryAddress?.city} -{" "}
            {orderDetails.deliveryAddress?.pincode}
          </p>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 mb-6">
        <h2 className="font-semibold mb-4 text-gray-700 dark:text-gray-200">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Item</th>
                <th className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Restaurant</th>
                <th className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Price</th>
                <th className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Quantity</th>
                <th className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.items.map((item) => (
                <tr key={item.foodId} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 flex items-center gap-2">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 object-cover rounded-md"
                      />
                    )}
                    <span className="text-gray-800 dark:text-white">{item.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.restaurant?.name}</td>
                  <td className="px-4 py-3 text-gray-500">₹{item.price}</td>
                  <td className="px-4 py-3 text-gray-500">{item.quantity}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">
                    ₹{item.price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANCEL INFO */}
      {orderDetails.cancelReason && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-6">
          <p className="font-semibold text-red-600">❌ Order Cancelled</p>
          <p className="text-sm text-red-700 dark:text-red-300">Reason: {orderDetails.cancelReason}</p>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/admin/orders"
          className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
        >
          Back to Orders
        </Link>
      </div>
    </div>
  );
}

export default AdminOrderDetails;