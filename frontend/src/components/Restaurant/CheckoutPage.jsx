import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../../features/user/foodOrderSlice";
import { clearCart, selectCartTotal } from "../../features/user/cartSlice";
import { useNavigate } from "react-router-dom";
import { MapPinIcon } from "@heroicons/react/24/outline";

function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector((state) => state.cart.items);
  const total = useSelector(selectCartTotal);
  const { loading } = useSelector((state) => state.foodOrder);

  const [geoLoading, setGeoLoading] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    street: "",
    city: "",
    pincode: "",
    location: null,
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  // 📍 LOCATION
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported ❌");
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();

          setAddress((prev) => ({
            ...prev,
            street: data.address?.road || data.display_name || "",
            city:
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              "",
            pincode: data.address?.postcode || "",
            location: {
              type: "Point",
              coordinates: [lng, lat],
            },
          }));
        } catch {
          alert("Failed to fetch address ❌");
        }

        setGeoLoading(false);
      },
      () => {
        alert("Location permission denied ❌");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 🚀 ORDER
  const handleOrder = async () => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      alert("Login required 🔐");
      navigate("/login");
      return;
    }

    if (!address.name || !address.street || !address.city) {
      alert("Please fill address properly ❌");
      return;
    }

    if (!address.location) {
      alert("Please detect location 📍");
      return;
    }

    const orderData = {
      items: items.map((item) => ({
        restaurant: item.restaurantId,
        food: {
          id: item.foodId,
          name: item.name,
          price: item.price,
          quantity: item.qty,
          image: item.image,
        },
      })),
      totalAmount: total,
      paymentMethod,
      deliveryAddress: address,
    };

    const res = await dispatch(createOrder(orderData));

    if (createOrder.fulfilled.match(res)) {
      alert("Order placed successfully ✅");
      dispatch(clearCart());
      navigate("/My-Food-orders");
    } else {
      alert("Order failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f4f7fb] via-[#e9f0f8] to-[#dfe9f5] text-[#2d1f16]">
      
      {/* CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">

        {/* HEADER */}
        <div className="text-center px-2">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Complete Checkout
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#6f5a4b]">
            Finalize your order and enjoy premium delivery
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* LEFT */}
          <div className="lg:col-span-7 space-y-5">

            {/* ADDRESS */}
            <div className="ui-card p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                
                <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                  <span className="h-5 w-1 bg-[#c67c4e] rounded-full" />
                  Delivery Address
                </h2>

                <button
                  onClick={handleDetectLocation}
                  className="ui-btn-secondary flex items-center justify-center gap-2 text-[10px] sm:text-xs px-3 py-2 rounded-xl"
                >
                  <MapPinIcon className="w-4 h-4" />
                  {geoLoading ? "Detecting..." : "Detect Location"}
                </button>
              </div>

              <div className="space-y-4">

                <input
                  placeholder="Receiver Name"
                  className="ui-input w-full"
                  onChange={(e) =>
                    setAddress({ ...address, name: e.target.value })
                  }
                />

                <input
                  placeholder="Street / Area"
                  value={address.street}
                  className="ui-input w-full"
                  onChange={(e) =>
                    setAddress({ ...address, street: e.target.value })
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    placeholder="City"
                    value={address.city}
                    className="ui-input w-full"
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                  />

                  <input
                    placeholder="Pincode"
                    value={address.pincode}
                    className="ui-input w-full"
                    onChange={(e) =>
                      setAddress({ ...address, pincode: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT */}
            <div className="ui-card p-4 sm:p-6 lg:p-8">
              <h2 className="text-base sm:text-lg font-black mb-5 flex items-center gap-2">
                <span className="h-5 w-1 bg-[#c67c4e] rounded-full" />
                Payment Method
              </h2>

              <div className="space-y-3">

                {["cod", "online"].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-[#eadccf] cursor-pointer hover:bg-white"
                  >
                    <input
                      type="radio"
                      value={type}
                      checked={paymentMethod === type}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 accent-[#c67c4e]"
                    />

                    <div>
                      <p className="font-bold text-sm sm:text-base">
                        {type === "cod" ? "Cash on Delivery" : "Online Payment"}
                      </p>
                      <p className="text-xs text-[#a07d63]">
                        {type === "cod"
                          ? "Pay when food arrives"
                          : "Card / UPI"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-5">

            <div className="ui-card p-4 sm:p-6 lg:p-8 lg:sticky lg:top-24">

              <h2 className="text-base sm:text-lg font-black mb-6">
                Order Summary
              </h2>

              {/* ITEMS */}
              <div className="space-y-4 max-h-60 sm:max-h-72 overflow-y-auto pr-1">

                {items.map((item) => (
                  <div
                    key={item.cartLineId}
                    className="flex justify-between items-center border-b border-[#eadccf]/50 pb-3"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img
                        src={item.image}
                        alt=""
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-[#a07d63]">
                          Qty: {item.qty}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm font-bold text-[#c67c4e]">
                      ₹{item.qty * item.price}
                    </p>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="mt-6 pt-4 border-t border-dashed border-[#eadccf] space-y-2">

                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span className="text-emerald-600">FREE</span>
                </div>

                <div className="flex justify-between text-lg sm:text-xl font-black mt-3">
                  <span>Total</span>
                  <span className="text-[#c67c4e]">₹{total}</span>
                </div>
              </div>

              {/* BUTTON */}
              <button
                onClick={handleOrder}
                disabled={loading}
                className="w-full mt-6 py-3 sm:py-4 rounded-xl bg-[#c67c4e] text-white font-bold active:scale-95 transition"
              >
                {loading ? "Processing..." : "Confirm Order"}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;