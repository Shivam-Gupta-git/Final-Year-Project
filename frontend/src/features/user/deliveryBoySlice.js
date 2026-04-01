import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

// DELIVERY BOY - Get Delivery Boy Profile
export const getDeliveryBoyProfileThunk = createAsyncThunk(
  "deliveryBoy/getProfile",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await apiClient.get("/api/deliveryBoy/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.deliveryBoy;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load profile"
      );
    }
  }
);

// DELIVERY BOY - UPDATE DELIVERY BOY STATUS
export const updateDeliveryBoyStatus = createAsyncThunk(
  "deliveryBoy/updateStatus",
  async ({ id, isOnline, isAvailable }, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.put(
        `/api/deliveryBoy/status/${id}`,
        { isOnline, isAvailable },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.deliveryBoy;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load profile"
      );
    }
  }
);

// DELIVERY BOY - UPDATE LIVE LOCATION
export const updateLiveLocationThunk = createAsyncThunk(
  "deliveryBoy/updateLiveLocation",
  async ({ id, latitude, longitude }, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken"); // or delivery boy token

      const response = await apiClient.put(
        `/api/deliveryBoy/location/${id}`,
        { latitude, longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.deliveryBoy;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update location"
      );
    }
  }
);

// DELIVERY BOY - GET PENDING ORDERS
export const getPendingOrdersThunk = createAsyncThunk(
  "deliveryBoy/getPendingOrders",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await apiClient.get("/api/deliveryBoy/orders/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.orders;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

// ADMIN - GET AVAILABLE DELIVERY BOY
export const getAvailableDeliveryBoysThunk = createAsyncThunk(
  "deliveryBoy/getAvailable",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/api/deliveryBoy/available");
      return res.deliveryBoys;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// DELIVRY BOY - ACCEPT ORDER
export const acceptOrderThunk = createAsyncThunk(
  "deliveryBoy/acceptOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await apiClient.put(
        `/api/deliveryBoy/accept-order/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to accept order"
      );
    }
  }
);

// DELIVERY BOY - PICKUP ORDER
export const pickupOrderThunk = createAsyncThunk(
  "deliveryBoy/getAvailable",
  async (orderId, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await apiClient.put(
        `/api/deliveryBoy/pickup-order/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

// DELIVERY BOY - DELIVER ORDER
export const deliverOrderThunk = createAsyncThunk(
  "deliveryBoy/deliverOrder",
  async (orderId, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.put(
        `/api/deliveryBoy/deliver-order/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

const initialState = {
  deliveryBoys: [],
  profile: null,
  orders: [],
  loading: false,
  error: null,
  successMessage: "",
};

const deliveryBoySlice = createSlice({
  name: "deliveryBoy",
  initialState,
  reducers: {
    // optional: set delivery boys list
    setDeliveryBoys: (state, action) => {
      state.deliveryBoys = action.payload;
    },
  },
  extraReducers: (builder) => {
    // DELIVERY BOY - Get Delivery Boy Profile
    builder
      .addCase(getDeliveryBoyProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getDeliveryBoyProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })

      .addCase(getDeliveryBoyProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // DELIVERY BOY - UPDATE DELIVERY BOY STATUS
    builder
      .addCase(updateDeliveryBoyStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeliveryBoyStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload; // update profile with latest DeliveryBoy doc
      })
      .addCase(updateDeliveryBoyStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // DELIVERY BOY - UPDATE LIVE LOCATION
    builder
      .addCase(updateLiveLocationThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLiveLocationThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload; // update profile with latest location
      })
      .addCase(updateLiveLocationThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // DELIVERY BOY - GET PENDING ORDERS
    builder
      .addCase(getPendingOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getPendingOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(getAvailableDeliveryBoysThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableDeliveryBoysThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryBoys = action.payload;
      })
      .addCase(getAvailableDeliveryBoysThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch";
      });

    // DELIVRY BOY - ACCEPT ORDER
    builder
      .addCase(acceptOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;

        const updatedOrder = action.payload;

        state.orders = state.orders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        );
      })
      .addCase(acceptOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // DELIVERY BOY - PICKUP ORDER
    // builder
    // .addCase(pickupOrderThunk.pending, (state) => {
    //   state.loading = true;
    //   state.error = null;
    // })
    // .addCase(pickupOrderThunk.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.successMessage = action.payload.message;

    //   const pickupdOrder = action.payload.order;

    //   state.orders = state.orders.map((order) =>
    //     order._id === pickupdOrder._id ? pickupdOrder : order
    //   );
    // })
    // .addCase(pickupOrderThunk.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // });

    // DELIVERY BOY - DELIVER ORDER
    builder
    .addCase(deliverOrderThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
  
    .addCase(deliverOrderThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = action.payload.message;
  
      const updatedOrder = action.payload.order;
  
      state.orders = state.orders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      );
    })
  
    .addCase(deliverOrderThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default deliveryBoySlice.reducer;
