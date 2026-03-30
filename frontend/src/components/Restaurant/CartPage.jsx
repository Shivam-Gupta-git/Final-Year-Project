import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  removeFromCart,
  updateCartQty,
  selectCartTotal,
  clearCart,
} from "../../features/user/cartSlice";
import { createOrder } from "../../features/user/foodOrderSlice";


function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const items = useSelector((state) => state.cart.items);
  const total = useSelector(selectCartTotal);

  const { loading, error } = useSelector((state) => state.foodOrder);

  // 🚀 PLACE ORDER FUNCTION
  // const handlePlaceOrder = async () => {
  //   if (items.length === 0) return;

  //   // 🔐 Login check
  //   const token = localStorage.getItem("userToken");
  //   if (!token) {
  //     alert("Please login first 🔐");
  //     navigate("/login");
  //     return;
  //   }

  //   // 🚫 Single restaurant rule
  //   const restaurantIds = [...new Set(items.map((i) => i.restaurantId))];
  //   if (restaurantIds.length > 1) {
  //     alert("You can order from only one restaurant ❌");
  //     return;
  //   }

  //   // 📦 Prepare order data
  //   const orderData = {
  //     items: items.map((item) => ({
  //       restaurant: item.restaurantId,
  //       food: {
  //         id: item.foodId,
  //         name: item.name,
  //         price: item.price,
  //         quantity: item.qty,
  //       },
  //     })),
  //     totalAmount: total,
  //     paymentMethod: "cod",
  //     deliveryAddress: {
  //       name: "Shivam Gupta",
  //       street: "Delhi",
  //       city: "Delhi",
  //       pincode: "110001",
  //       location: {
  //         type: "Point",
  //         coordinates: [77.1025, 28.7041],
  //       },
  //     },
  //   };

  //   try {
  //     const res = await dispatch(createOrder(orderData));

  //     if (createOrder.fulfilled.match(res)) {
  //       if (res.payload?.isOffline) {
  //         alert("Order saved offline 📴");
  //       } else {
  //         alert("Order placed successfully ✅");
  //         navigate("/orders");
  //       }

  //       dispatch(clearCart());
  //     } else {
  //       alert(res.payload || "Order failed ❌");
  //     }
  //   } catch (err) {
  //     alert("Something went wrong ❌");
  //   }
  // };

  

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pb-16 dark:bg-gray-950"
    >
      {/* HEADER */}
      <div className="border-b border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your cart
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review items before checkout
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* EMPTY CART */}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-300">
              Your cart is empty
            </p>
            <Link
              to="/RestaurantLandingPage"
              className="mt-4 inline-block text-orange-600 hover:underline dark:text-orange-400"
            >
              Browse restaurants
            </Link>
          </div>
        ) : (
          <>
            {/* CART ITEMS */}
            <ul className="space-y-4">
              {items.map((line) => (
                <li
                  key={line.cartLineId}
                  className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <img
                    src={
                      line.image ||
                      "https://placehold.co/120/f3f4f6/9ca3af?text=+"
                    }
                    alt=""
                    className="h-20 w-20 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {line.name}
                    </p>

                    {line.restaurantName && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {line.restaurantName}
                      </p>
                    )}

                    <p className="mt-1 text-sm font-medium text-orange-600 dark:text-orange-400">
                      ₹{line.price} each
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() =>
                          dispatch(
                            updateCartQty({
                              cartLineId: line.cartLineId,
                              qty: line.qty - 1,
                            })
                          )
                        }
                        className="rounded-lg bg-gray-100 px-3 py-1 dark:bg-gray-800"
                      >
                        −
                      </button>

                      <span>{line.qty}</span>

                      <button
                        onClick={() =>
                          dispatch(
                            updateCartQty({
                              cartLineId: line.cartLineId,
                              qty: line.qty + 1,
                            })
                          )
                        }
                        className="rounded-lg bg-gray-100 px-3 py-1 dark:bg-gray-800"
                      >
                        +
                      </button>

                      <button
                        onClick={() =>
                          dispatch(removeFromCart(line.cartLineId))
                        }
                        className="ml-auto text-sm text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{(line.price * line.qty).toFixed(0)}
                  </div>
                </li>
              ))}
            </ul>

            {/* SUMMARY */}
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>

              {/* ERROR */}
              {error && (
                <p className="mt-3 text-sm text-red-500">{error}</p>
              )}
              <div className="w-full flex items-center justify-center">
              <Link to={"/CheckoutPage"}
                disabled={loading}
                className="mt-4 w-[50%] rounded-2xl bg-linear-to-r from-orange-500 to-rose-600 py-3.5 text-sm font-semibold text-white disabled:opacity-60 border text-center"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </Link>

              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default CartPage;