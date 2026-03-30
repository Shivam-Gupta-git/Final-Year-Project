import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders } from "../../features/user/foodOrderSlice";
import { Link } from "react-router-dom";

function MyOrdersPage() {
  const dispatch = useDispatch();

  const { orders, loading } = useSelector((state) => state.foodOrder);

  const [status, setStatus] = useState("");

  useEffect(() => {
    dispatch(getMyOrders({ status }));
  }, [dispatch, status]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          My Orders
        </h1>

        {/* FILTER BUTTONS */}
        <div className="flex gap-3 mb-6">
          {["", "pending", "delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                status === s
                  ? "bg-orange-500 text-white"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              {s === "" ? "All" : s}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && <p>Loading orders...</p>}

        {/* EMPTY */}
        {!loading && orders.length === 0 && (
          <p className="text-gray-500">No orders found</p>
        )}

        {/* ORDER LIST */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow"
            >
              <div className="flex justify-between mb-2">
                <p className="font-semibold">₹{order.totalAmount}</p>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* ITEMS */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {order.items.map((item, i) => (
                  <p key={i}>
                    {item.food.name} × {item.food.quantity}
                  </p>
                ))}
              </div>

              {/* DATE */}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(order.createdAt).toLocaleString()}
              </p>
              {/* detail button */}
              <div className="mt-3">
                <Link
                  to={`/OrderDetailsPage/${order._id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyOrdersPage;
