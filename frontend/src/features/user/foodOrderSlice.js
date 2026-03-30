import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

// USER - CREATE ORDER
export const createOrder = createAsyncThunk(
  "order/create",
  async (orderData, thunkAPI) => {
    try {
      // ✅ OFFLINE CHECK HERE
      if (!navigator.onLine) {
        const offlineOrders =
          JSON.parse(localStorage.getItem("offlineOrders")) || [];

        offlineOrders.push(orderData);

        localStorage.setItem("offlineOrders", JSON.stringify(offlineOrders));

        // return fake success (so UI still works)
        return { ...orderData, isOffline: true };
      }

      const token = localStorage.getItem("userToken");

      const response = await apiClient.post(
        "/api/foodOrder/foodOrder",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create order"
      );
    }
  }
);

// USER - My ORDERS
export const getMyOrders = createAsyncThunk(
  "order/getMyOrders",
  async ({ page = 1, status = "" } = {}, thunkAPI) => {
    try {
      const token = localStorage.getItem("userToken");

      const res = await apiClient.get(
        `/api/foodOrder/My-orders?page=${page}&status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.orders;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

// USER - GET SINGLE ORDER DETAILS
export const getOrderById = createAsyncThunk(
  "order/getById",
  async (orderId, thunkAPI) => {
    try {
      const token = localStorage.getItem("userToken");

      const res = await apiClient.get(
        `/api/foodOrder/My-order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch order"
      );
    }
  }
);

// USER - CANCEL ORDER
export const cancelOrder = createAsyncThunk(
  "order/cancel",
  async ({ orderId, reason }, thunkAPI) => {
    try {
      const token = localStorage.getItem("userToken");

      const res = await apiClient.put(
        `/api/foodOrder/cancel-order/${orderId}`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.order;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Cancel failed"
      );
    }
  }
);


const initialState = {
  orders: [],
  currentOrder: null,
  restaurantDetails: null,
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,
};

const foodOrderSlice = createSlice({
  name: "foodOrder",
  initialState,

  reducers: {
    clearOrderState: (state) => {
      state.loading = false;
      state.error = null;
    },

    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ✅ CREATE ORDER
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })

      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

      // USER - My ORDERS
      builder
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.page = action.payload;
        state.totalPages = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

      // USER - GET SINGLE ORDER DETAILS
      builder
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload || null;
        state.restaurantDetails = action.payload?.restaurantInfo || null; // ✅ SAFE
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

      // USER - CANCEL ORDER
      builder

      // CANCEL ORDER
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
  
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
  
        state.currentOrder = action.payload;
  
        const index = state.orders.findIndex(
          (o) => o._id === action.payload._id
        );
  
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
  
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

  },
});

export const { clearOrderState, clearCurrentOrder } = foodOrderSlice.actions;
export default foodOrderSlice.reducer;
