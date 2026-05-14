import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getMyOrders } from "../../features/user/foodOrderSlice";

function MyOrdersPage() {
  const dispatch = useDispatch();

  const { orders, loading } = useSelector((state) => state.foodOrder);

  const [status, setStatus] = useState("");

  useEffect(() => {
    dispatch(getMyOrders({ status }));
  }, [dispatch, status]);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f4f7fb] via-[#e9f0f8] to-[#dfe9f5] p-4 text-[#2d1f16]">
      <div className="ui-container max-w-4xl">
        {/* HEADER */}
        <h1 className="text-3xl font-black mb-8 text-[#2d1f16] tracking-tight">
          Your Orders
        </h1>

        {/* FILTER BUTTONS */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {["", "pending", "delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`ui-btn-secondary rounded-2xl! px-6! py-3! text-sm! whitespace-nowrap ${status === s
                  ? "bg-[#2d1f16] text-white! border-[#2d1f16] shadow-lg shadow-[#2d1f16]/20"
                  : "bg-white/80 border-[#eadccf] text-[#6f5a4b]"
                }`}
            >
              {s === "" ? "All Orders" : s.charAt(0).toUpperCase() + s.slice(1)}
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
          {orders.map((order, index) => (
            <div
              key={order?._id || index}
              className="ui-card p-5"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xl font-black text-[#c67c4e]">₹{order?.totalAmount}</p>
                  <p className="text-[10px] font-bold text-[#a07d63] uppercase tracking-wider mt-1">Total Amount</p>
                </div>
                <span
                  className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-full border tracking-widest ${order?.status === "delivered"
                      ? "bg-emerald-50/50 border-emerald-200 text-emerald-600"
                      : "bg-amber-50/50 border-amber-200 text-amber-600"
                    }`}
                >
                  {order?.status}
                </span>
              </div>

              {/* ITEMS */}
              <div className="bg-[#fffdfb]/50 rounded-2xl p-4 border border-[#eadccf]/50">
                {order?.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-1 group">
                    <p className="text-sm font-bold text-[#6f5a4b] group-hover:text-[#2d1f16] transition-colors line-clamp-1">
                      {item.food.name}
                    </p>
                    <p className="text-xs font-black text-[#a07d63]">
                      × {item.food.quantity}
                    </p>
                  </div>
                ))}
              </div>

              {/* DATE */}
              <p className="text-[10px] font-bold text-[#a07d63] mt-4 uppercase tracking-tighter">
                Ordered on {new Date(order?.createdAt).toLocaleString()}
              </p>

              <div className="mt-5">
                <Link
                  to={`/OrderDetailsPage/${order?._id}`}
                  className="ui-btn-primary rounded-2xl! px-6! py-3! text-xs! w-full sm:w-auto"
                >
                  View Order Details
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
