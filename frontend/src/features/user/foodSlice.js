import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

// ADMIN - CREATE FOOD
export const createFood = createAsyncThunk(
  "food/createFood",
  async (data, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await apiClient.post("/api/food/create-Food", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create food"
      );
    }
  }
);

// ADMIN - GET FOOD
export const getFoodByRestaurantId = createAsyncThunk(
  "food/getFoodByRestaurantId",
  async (restaurantId, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await apiClient.get(`/api/food/admin/foods/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data; // { success, count, data }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch foods"
      );
    }
  }
);

// ADMIN - UPDATE FOOD
export const updateFood = createAsyncThunk(
  "food/updateFood",
  async ({ foodId, data }, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await apiClient.put(
        `/api/food/admin/update-food/${foodId}`, // ✅ your route
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data; // { success, message, data }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to update food"
      );
    }
  }
);

// ADMIN - TOOGLE Availability
export const toggleFoodAvailability = createAsyncThunk(
  "food/toggleAvailability",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await apiClient.patch(
        `/api/food/admin/toggle-food/${id}`,
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
        error.response?.data?.message || "Failed"
      );
    }
  }
);

// ADMIN - DELETE FOOD
export const deleteFood = createAsyncThunk(
  "food/deleteFood",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      await apiClient.delete(`/api/food/admin/delete-food/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return id; // 👈 return deleted id
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Delete failed"
      );
    }
  }
);

// GET SINGLE FOOD BY ID
export const getFoodById = createAsyncThunk(
  "food/getFoodById",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await apiClient.get(`/api/food/admin/food/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed"
      );
    }
  }
);

// USER — GET SINGLE FOOD (public)
export const getFoodByIdForUser = createAsyncThunk(
  "food/getFoodByIdForUser",
  async (id, thunkAPI) => {
    try {
      const res = await apiClient.get(`/api/food/foods/${id}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to load food"
      );
    }
  }
);

// USER - GET ALL FOOD
export const getAllFoodForUser = createAsyncThunk(
  "food/getAllFoodForUser",
  async (
    { page = 1, limit = 10, restaurantId = "", category = "", isVeg = "" },
    thunkAPI
  ) => {
    try {
      let url = `/api/food/foods?page=${page}&limit=${limit}`;

      if (restaurantId) url += `&restaurantId=${restaurantId}`;
      if (category) url += `&category=${category}`;
      if (isVeg !== "") url += `&isVeg=${isVeg}`;

      const res = await apiClient.get(url);

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch foods"
      );
    }
  }
);

// ADMIN - GET ALL ORDERS
export const fetchAdminOrders = createAsyncThunk(
  "adminOrders/fetch",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await apiClient.get("/api/food/admin/My-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.orders;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// ADMIN -  GET SINGLE ORDER
export const fetchAdminOrderDetails = createAsyncThunk(
  "adminOrders/fetchOrderDetails",
  async (orderId, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      const response = await apiClient.get(
        `/api/food/admin/orderDetails/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response; // structured response from controller
    } catch (error) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ADMIN - ACCEPT ORDER 
export const acceptOrderThunk = createAsyncThunk(
  "adminOrders/acceptOrder",
  async (orderId, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await apiClient.patch(`/api/food/admin/acceptOrder/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.order; // return updated order
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to accept order");
    }
  }
);

// ADMIN - REJECT ORDER
export const rejectOrderThunk = createAsyncThunk(
  "food/rejectOrder",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.patch(`/api/food/admin/rejectOrder/${orderId}`, { reason },{}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.order;
    } catch (err) {
      return rejectWithValue(err.response.data.message || "Failed to reject order");
    }
  }
);

// ADMIN - UPDATE STATUS
export const updateStatusThunk = createAsyncThunk(
  "food/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.patch(`/api/food/admin/updateOrder/${orderId}`, { status }, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status");
    }
  }
);

const initialState = {
  foods: [],
  userFoodDetail: null,
  userFoodDetailLoading: false,
  loading: false,
  error: null,
  success: false,
  count: 0,
  successMessage: null,
  page: 1,
  total: 0,
  totalPages: 1,
  orders: [],
  orderDetails: null,
};

const foodSlice = createSlice({
  name: "food",
  initialState,
  reducers: {
    resetFoodState: (state) => {
      state.success = false;
      state.error = null;
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    // ADMIN - CREATE FOOD
    builder
      .addCase(createFood.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createFood.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.foods.push(action.payload.data);
      })

      .addCase(createFood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ADMIN - GET FOOD
    builder
      .addCase(getFoodByRestaurantId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getFoodByRestaurantId.fulfilled, (state, action) => {
        state.loading = false;
        state.foods = action.payload;
        state.count = action.payload;
      })

      .addCase(getFoodByRestaurantId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ADMIN - UPDATE FOOD
    builder
      .addCase(updateFood.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateFood.fulfilled, (state, action) => {
        state.loading = false;

        const updatedFood = action.payload.data;

        // ✅ update in list
        state.foods = state.foods.map((f) =>
          f._id === updatedFood._id ? updatedFood : f
        );

        state.successMessage = action.payload.message;
      })

      .addCase(updateFood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ADMIN - TOOGLE Availability
    builder
      .addCase(toggleFoodAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(toggleFoodAvailability.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ update only that food (NO refetch needed)
        state.foods = state.foods.map((food) =>
          food._id === action.payload._id ? action.payload : food
        );
      })

      .addCase(toggleFoodAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ADMIN - DELETE FOOD
    builder
      .addCase(deleteFood.pending, (state) => {
        state.loading = true;
      })

      .addCase(deleteFood.fulfilled, (state, action) => {
        state.loading = false;

        // remove from UI instantly
        state.foods = state.foods.filter((food) => food._id !== action.payload);
      })

      .addCase(deleteFood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // GET SINGLE FOOD BY ID
    builder
      .addCase(getFoodById.pending, (state) => {
        state.loading = true;
      })

      .addCase(getFoodById.fulfilled, (state, action) => {
        state.loading = false;

        // store single food
        state.singleFood = action.payload;
      })

      .addCase(getFoodById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // USER — GET SINGLE FOOD
    builder
      .addCase(getFoodByIdForUser.pending, (state) => {
        state.userFoodDetailLoading = true;
        state.error = null;
      })
      .addCase(getFoodByIdForUser.fulfilled, (state, action) => {
        state.userFoodDetailLoading = false;
        const p = action.payload;
        state.userFoodDetail = p?.data ?? p ?? null;
      })
      .addCase(getFoodByIdForUser.rejected, (state, action) => {
        state.userFoodDetailLoading = false;
        state.error = action.payload;
        state.userFoodDetail = null;
      });

    // USER - GET ALL FOOD
    builder
      .addCase(getAllFoodForUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAllFoodForUser.fulfilled, (state, action) => {
        state.loading = false;

        const p = action.payload;
        state.foods = p?.data ?? p ?? [];

        // pagination
        state.page = p?.page ?? 1;
        state.total = p?.total ?? 0;
        state.totalPages = p?.totalPages ?? 1;
      })

      .addCase(getAllFoodForUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ADMIN - GET ALL ORDERS
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ADMIN -  GET SINGLE ORDER
    builder
    .addCase(fetchAdminOrderDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.orderDetails = null; // clear old data
    })
    .addCase(fetchAdminOrderDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.orderDetails = action.payload; // data returned from controller
    })
    .addCase(fetchAdminOrderDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch order details";
    });

    // ADMIN - ACCEPT ORDER 
    builder
    .addCase(acceptOrderThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(acceptOrderThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.orderDetails = action.payload;
      // Optionally update orders list if needed
      const index = state.orders.findIndex((o) => o._id === action.payload._id);
      if (index !== -1) state.orders[index] = action.payload;
    })
    .addCase(acceptOrderThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder
    .addCase(rejectOrderThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(rejectOrderThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.orderDetails = action.payload;
    })
    .addCase(rejectOrderThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // ADMIN - . UPDATE STATUS
    builder
  .addCase(updateStatusThunk.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  .addCase(updateStatusThunk.fulfilled, (state, action) => {
    state.loading = false;
    state.orderDetails = action.payload; // update the order in detail view
  })
  .addCase(updateStatusThunk.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });

  },
});

export const { clearOrderDetails } = foodSlice.actions;
export const { resetFoodState } = foodSlice.actions;
export default foodSlice.reducer;
