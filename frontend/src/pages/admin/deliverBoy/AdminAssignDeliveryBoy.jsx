import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getAvailableDeliveryBoysThunk,
} from "../../../features/user/deliveryBoySlice";
import {
  assignDeliveryBoyThunk,
  getOrderByIdThunk,
} from "../../../features/user/foodSlice";

function AdminAssignDeliveryBoy() {
  const dispatch = useDispatch();
  const { id: orderId } = useParams();

  const { order, loading: orderLoading } = useSelector(
    (state) => state.food
  );

  const { deliveryBoys = [], loading: dbLoading } = useSelector(
    (state) => state.deliveryBoy
  );

  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // success popup state
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderByIdThunk(orderId));
      dispatch(getAvailableDeliveryBoysThunk());
    }
  }, [dispatch, orderId]);

  const handleSelectDeliveryBoy = (dbId) => {
    const db = deliveryBoys.find((d) => d._id === dbId);
    setSelectedDeliveryBoy(db || null);
    setShowSidebar(true);
  };

  const handleAssign = async () => {
    if (!selectedDeliveryBoy) {
      alert("Select a delivery boy!");
      return;
    }

    try {
      await dispatch(
        assignDeliveryBoyThunk({
          orderId: order._id,
          deliveryBoyId: selectedDeliveryBoy._id,
        })
      ).unwrap();

      // close sidebar
      setShowSidebar(false);

      // show popup
      setShowPopup(true);

      // auto close popup after 5 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    } catch (error) {
      alert(error || "Failed to assign delivery boy");
    }
  };

  if (!order) {
    return (
      <p className="text-gray-500 p-4 text-center">
        Loading order...
      </p>
    );
  }

  return (
    <div className="relative flex gap-6 p-6">
      {/* SUCCESS POPUP */}
      {showPopup && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-green-400">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              ✓
            </div>
            <div>
              <p className="font-semibold">Order Assigned Successfully</p>
              <p className="text-sm text-green-100">
                Delivery boy has been assigned to this order.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN SECTION */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold mb-5 text-gray-800">
          Assign Delivery Boy
        </h2>

        <div className="space-y-3">
          <p className="font-semibold text-gray-700">
            Order ID:
            <span className="ml-2 text-gray-900">{order._id}</span>
          </p>

          <p className="text-sm text-gray-600">
            Customer:
            <span className="ml-2 font-medium text-gray-800">
              {order.user?.userName || order.user?.email}
            </span>
          </p>

          <div className="pt-4">
            <label className="block mb-2 font-medium text-gray-700">
              Select Delivery Boy
            </label>

            <select
              value={selectedDeliveryBoy?._id || ""}
              onChange={(e) => handleSelectDeliveryBoy(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose Delivery Boy</option>

              {deliveryBoys.map((db) => (
                <option key={db._id} value={db._id}>
                  {db.user?.userName || db.phone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      {showSidebar && selectedDeliveryBoy && (
        <div className="w-96 bg-gray-50 rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-3">
            Delivery Boy Details
          </h3>

          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold text-gray-700">Name:</span>{" "}
              {selectedDeliveryBoy.user?.userName}
            </p>

            <p>
              <span className="font-semibold text-gray-700">Email:</span>{" "}
              {selectedDeliveryBoy.user?.email}
            </p>

            <p>
              <span className="font-semibold text-gray-700">Phone:</span>{" "}
              {selectedDeliveryBoy.phone}
            </p>

            <p>
              <span className="font-semibold text-gray-700">Available:</span>{" "}
              <span
                className={
                  selectedDeliveryBoy.isAvailable
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {selectedDeliveryBoy.isAvailable ? "Yes" : "No"}
              </span>
            </p>

            <p>
              <span className="font-semibold text-gray-700">Online:</span>{" "}
              <span
                className={
                  selectedDeliveryBoy.isOnline
                    ? "text-green-600 font-medium"
                    : "text-gray-500 font-medium"
                }
              >
                {selectedDeliveryBoy.isOnline ? "Yes" : "No"}
              </span>
            </p>

            <p>
              <span className="font-semibold text-gray-700">
                Total Delivered:
              </span>{" "}
              {selectedDeliveryBoy.totalDeliveredOrders}
            </p>
          </div>

          <div className="mt-auto flex gap-3 pt-6">
            <button
              onClick={handleAssign}
              disabled={orderLoading || dbLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
            >
              {orderLoading || dbLoading
                ? "Assigning..."
                : "Assign Delivery Boy"}
            </button>

            <button
              onClick={() => setShowSidebar(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAssignDeliveryBoy;