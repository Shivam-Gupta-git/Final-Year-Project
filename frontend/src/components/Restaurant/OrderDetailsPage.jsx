import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { cancelOrder, getOrderById } from "../../features/user/foodOrderSlice";

function OrderDetailsPage() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { currentOrder, restaurantDetails, loading } = useSelector(
    (state) => state.foodOrder
  );

  console.log(currentOrder);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [dispatch, orderId]);

  if (loading) return <p className="p-6">Loading...</p>;

  if (!currentOrder) return <p className="p-6">Order not found</p>;

  const handleCancelOrder = async () => {
    try {
      await dispatch(
        cancelOrder({
          orderId: currentOrder._id,
          reason: cancelReason || "User cancelled",
        })
      ).unwrap();

      setShowCancelModal(false);
      setCancelReason("");

      dispatch(getOrderById(currentOrder._id));

      alert("Order cancelled successfully");
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 text-gray-900 dark:text-white">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order Details
          </h1>

          <span className="text-xs px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800">
            #{currentOrder._id.slice(-6)}
          </span>
        </div>

        {/* STATUS + TIMELINE */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow">
          <p className="text-sm text-gray-500 mb-2">Order Status</p>

          <p className="font-semibold text-lg capitalize mb-4">
            {currentOrder.status.replaceAll("_", " ")}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{
                width:
                  currentOrder.status === "pending"
                    ? "20%"
                    : currentOrder.status === "confirmed"
                    ? "40%"
                    : currentOrder.status === "preparing"
                    ? "60%"
                    : currentOrder.status === "out_for_delivery"
                    ? "85%"
                    : currentOrder.status === "delivered"
                    ? "100%"
                    : "10%",
              }}
            />
          </div>

          {/* Pending message */}
          {currentOrder.status === "pending" && (
            <p className="text-xs text-gray-500 mt-3">
              Waiting for restaurant to accept your order...
            </p>
          )}
        </div>

        {/* ITEMS */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow">
          <h2 className="font-semibold mb-3">Items</h2>

          {currentOrder.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/food/${item.food.id}`)}
                  className="cursor-pointer hover:shadow-sm shadow-gray-400 rounded-[9px] duration-300"
                >
                  <img
                    src={item.food.image || "https://placehold.co/80"}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                </button>

                <div>
                  <p className="text-sm font-medium">{item.food.name}</p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.food.quantity}
                  </p>
                </div>
              </div>

              <p className="text-sm font-semibold">
                ₹{item.food.price * item.food.quantity}
              </p>
            </div>
          ))}
        </div>

        {/* TOTAL + PAYMENT */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow space-y-2">
          <div className="flex justify-between text-sm">
            <span>Payment Method</span>
            <span className="capitalize">{currentOrder.paymentMethod}</span>
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{currentOrder.totalAmount}</span>
          </div>
        </div>

        {/* DELIVERY ADDRESS */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow">
          <h2 className="font-semibold mb-2">Delivery Address</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {currentOrder.deliveryAddress?.street || "Address not provided"}
          </p>
          <p className="text-xs text-gray-500">
            {currentOrder.deliveryAddress?.city} -{" "}
            {currentOrder.deliveryAddress?.pincode}
          </p>
        </div>

        {/* RESTAURANT DETAILS */}
        {currentOrder.status !== "pending" && currentOrder.restaurantInfo && (
          <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl shadow">
            <h2 className="font-semibold mb-2">Restaurant Details</h2>
            <p className="font-medium">{currentOrder.restaurantInfo.name}</p>
            <p className="text-sm">
              {currentOrder.restaurantInfo.phone || "N/A"}
            </p>
            <p className="text-xs text-gray-500">
              {currentOrder.restaurantInfo.address}
            </p>
          </div>
        )}

        {currentOrder.status === "pending" && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-2xl shadow">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Waiting for restaurant to accept your order...
            </p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          {/* CANCEL */}
          {["pending", "confirmed"].includes(currentOrder.status) && (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={!["pending", "confirmed"].includes(currentOrder.status)}
              className="mt-4 w-full py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            >
              Cancel Order
            </button>
          )}

          {/* TRACK */}
          {currentOrder.status === "out_for_delivery" && (
            <button
              className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600"
              onClick={() => {
                // navigate to tracking page
              }}
            >
              Track Order
            </button>
          )}

          {showCancelModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
                  Cancel Order
                </h2>

                <p className="text-sm text-gray-500 mb-4">
                  Please select or enter a reason
                </p>

                {/* SUGGESTED REASONS */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    "Ordered by mistake",
                    "Found cheaper elsewhere",
                    "Delivery time too long",
                    "Change of plans",
                  ].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setCancelReason(reason)}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        cancelReason === reason
                          ? "bg-red-500 text-white border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                {/* INPUT BOX */}
                <textarea
                  placeholder="Other reason..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full border rounded-xl p-3 text-sm dark:bg-gray-800 dark:border-gray-700"
                />

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 py-2 rounded-xl border"
                  >
                    Close
                  </button>

                  <button
                    onClick={handleCancelOrder}
                    className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold"
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
