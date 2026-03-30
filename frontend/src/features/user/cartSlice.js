import { createSlice } from "@reduxjs/toolkit";

// ✅ Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const data = localStorage.getItem("cartItems");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading cart:", error);
    return [];
  }
};

// ✅ Save cart to localStorage
const saveCartToStorage = (items) => {
  try {
    localStorage.setItem("cartItems", JSON.stringify(items));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
};

const initialState = {
  items: loadCartFromStorage(), // 🔥 persist after refresh
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // ✅ ADD TO CART
    addToCart: (state, action) => {
      const {
        foodId,
        name,
        price,
        image,
        restaurantId,
        restaurantName,
        qty = 1,
      } = action.payload;

      if (!foodId) return;

      const existing = state.items.find((i) => i.foodId === foodId);

      if (existing) {
        existing.qty += qty;
      } else {
        state.items.push({
          cartLineId: `${foodId}-${Date.now()}`,
          foodId,
          name,
          price: Number(price) || 0,
          image: image || "",
          restaurantId: restaurantId || "",
          restaurantName: restaurantName || "",
          qty,
        });
      }

      // ✅ persist
      saveCartToStorage(state.items);
    },

    // ✅ REMOVE ITEM
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.cartLineId !== action.payload);

      saveCartToStorage(state.items);
    },

    // ✅ UPDATE QTY
    updateCartQty: (state, action) => {
      const { cartLineId, qty } = action.payload;

      const item = state.items.find((i) => i.cartLineId === cartLineId);

      if (!item) return;

      if (qty <= 0) {
        state.items = state.items.filter((i) => i.cartLineId !== cartLineId);
      } else {
        item.qty = qty;
      }

      saveCartToStorage(state.items);
    },

    // ✅ CLEAR CART
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("cartItems");
    },
  },
});

// ✅ ACTIONS
export const { addToCart, removeFromCart, updateCartQty, clearCart } =
  cartSlice.actions;

// ✅ SELECTORS
export const selectCartItemCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.qty, 0);

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);

export default cartSlice.reducer;
