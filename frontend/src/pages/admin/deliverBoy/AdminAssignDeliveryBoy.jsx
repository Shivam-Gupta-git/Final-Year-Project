import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAvailableDeliveryBoysThunk } from "../../../features/user/deliveryBoySlice";
import {
  assignDeliveryBoyThunk,
  getOrderByIdThunk,
} from "../../../features/user/foodSlice";
import { Navigation } from "lucide-react";

function AdminAssignDeliveryBoy() {
  const dispatch = useDispatch();
  const { id: orderId } = useParams();

  const { order, loading: orderLoading } = useSelector((state) => state.food);

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
    return <p className="text-gray-500 p-4 text-center">Loading order...</p>;
  }

  return (
    <div className="relative flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-black font-['DM_Sans',sans-serif]">
      {/* SUCCESS POPUP */}
      {showPopup && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-green-400">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
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
      <div className="flex-1 bg-linear-to-r from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl shadow-xl p-6 border-gray-700 border ">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 shadow-sm shadow-[#457b9d] px-3 py-5 rounded-2xl bg-linear-to-r from-gray-700 bg-gray-200 to-gray-800">
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center shadow-md">
            <Navigation className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-['Syne',sans-serif]">
              Assign Delivery Boy
            </h1>
            <p className="text-sm text-gray-400">
              Assign a delivery boy to the selected order
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-semibold text-gray-200">
            Order ID:
            <span className="ml-2 text-white">{order._id}</span>
          </p>

          <p className="text-sm text-gray-400">
            Customer:
            <span className="ml-2 font-medium text-white">
              {order.user?.userName || order.user?.email}
            </span>
          </p>

          <div className="pt-4">
            <label className="block mb-2 font-medium text-gray-200">
              Select Delivery Boy
            </label>

            <select
              value={selectedDeliveryBoy?._id || ""}
              onChange={(e) => handleSelectDeliveryBoy(e.target.value)}
              className="w-full rounded-xl border border-gray-600 bg-gray-700 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose Delivery Boy</option>

              {deliveryBoys.map((db) => (
                <option
                  key={db._id}
                  value={db._id}
                  className="bg-gray-700 text-white"
                >
                  {db.user?.userName || db.phone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      {showSidebar && selectedDeliveryBoy && (
        <div className="w-full lg:w-96 bg-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-gray-700">
          {/* Header */}
          <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-3">
            Delivery Boy Details
          </h3>

          <div className="space-y-2 text-sm text-gray-300">
            <p>
              <span className="font-semibold text-gray-200">Name:</span>{" "}
              {selectedDeliveryBoy.user?.userName}
            </p>

            <p>
              <span className="font-semibold text-gray-200">Email:</span>{" "}
              {selectedDeliveryBoy.user?.email}
            </p>

            <p>
              <span className="font-semibold text-gray-200">Phone:</span>{" "}
              {selectedDeliveryBoy.phone}
            </p>

            <p>
              <span className="font-semibold text-gray-200">Available:</span>{" "}
              <span
                className={
                  selectedDeliveryBoy.isAvailable
                    ? "text-green-500 font-medium"
                    : "text-red-500 font-medium"
                }
              >
                {selectedDeliveryBoy.isAvailable ? "Yes" : "No"}
              </span>
            </p>

            <p>
              <span className="font-semibold text-gray-200">Online:</span>{" "}
              <span
                className={
                  selectedDeliveryBoy.isOnline
                    ? "text-green-500 font-medium"
                    : "text-gray-500 font-medium"
                }
              >
                {selectedDeliveryBoy.isOnline ? "Yes" : "No"}
              </span>
            </p>

            <p>
              <span className="font-semibold text-gray-200">
                Total Delivered:
              </span>{" "}
              {selectedDeliveryBoy.totalDeliveredOrders}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-auto flex gap-3 pt-6">
            <button
              onClick={handleAssign}
              disabled={orderLoading || dbLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-md"
            >
              {orderLoading || dbLoading
                ? "Assigning..."
                : "Assign Delivery Boy"}
            </button>

            <button
              onClick={() => setShowSidebar(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition shadow-md"
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
