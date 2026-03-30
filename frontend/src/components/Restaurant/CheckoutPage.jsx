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

  // 📍 AUTO LOCATION (FIXED)
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
        } catch (err) {
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

  // 🚀 PLACE ORDER
  const handleOrder = async () => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      alert("Login required 🔐");
      navigate("/login");
      return;
    }

    // ✅ VALIDATION
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 🧾 HEADER */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Checkout
        </h1>

        {/* 🛒 ORDER ITEMS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow">
          <h2 className="font-semibold mb-4">Your Order</h2>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.cartLineId}
                className="flex justify-between border-b pb-2 text-sm"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-500 text-xs">
                    {item.qty} × ₹{item.price}
                  </p>
                </div>
                <p className="font-semibold">
                  ₹{item.qty * item.price}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4 font-bold text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        {/* 📍 ADDRESS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Delivery Address</h2>

            <button
              onClick={handleDetectLocation}
              className="flex items-center gap-1 text-sm text-orange-600"
            >
              <MapPinIcon className="w-4 h-4" />
              {geoLoading ? "Detecting..." : "Use my location"}
            </button>
          </div>

          <div className="space-y-2">
            <input
              placeholder="Receiver Name"
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setAddress({ ...address, name: e.target.value })
              }
            />

            <input
              placeholder="Street / Area"
              value={address.street}
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
            />

            <input
              placeholder="City"
              value={address.city}
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setAddress({ ...address, city: e.target.value })
              }
            />

            <input
              placeholder="Pincode"
              value={address.pincode}
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setAddress({ ...address, pincode: e.target.value })
              }
            />
          </div>
        </div>

        {/* 💳 PAYMENT */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow">
          <h2 className="font-semibold mb-3">Payment Method</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                value="online"
                checked={paymentMethod === "online"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Online Payment
            </label>
          </div>
        </div>

        {/* 🚀 PLACE ORDER */}
        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full bg-linear-to-r from-orange-500 to-rose-600 text-white py-3 rounded-2xl font-semibold shadow-lg"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>

      </div>
    </div>
  );
}

export default CheckoutPage;