import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

// ADMIN - CREATE RESTAURANT
export const createRestaurant = createAsyncThunk(
  "restaurant/create",
  async (data, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.post(
        "/api/resturant/create-restaurent",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ADMIN - GET ACTIVE ADMIN'S RESTAURANT
export const getAllActiveRestaurant = createAsyncThunk(
  "restaurant/getAllActiveRestaurant",
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get("/api/resturant/activeRestaurant");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch active cities"
      );
    }
  }
);

// ADMIN - INACTIVE RESTAURANT BY ADMIN
export const inactiveRestaurantByAdmin = createAsyncThunk(
  "restaurant/inactiveRestaurant",
  async (restaurantId, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.patch(
        `/api/resturant/${restaurantId}/inactiveByAdmin`,
        {}, // 👈 empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { restaurantId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Restaurant inactive failed"
      );
    }
  }
);

// ADMIN  - GET RESTAURANT STATUS
export const getRestaurantStatus = createAsyncThunk(
  "restaurant/getRestaurantStatus",
  async (status, thunkAPI) => {
    console.log("status:", status);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.get(
        `/api/resturant/get-restaurant-status?status=${status}`,
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
        error.response?.data?.message || "Failed to inactive hotel"
      );
    }
  }
);

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState: {
    restaurants: [],
    nearbyRestaurants: [],
    restaurant: null,
    loading: false,
    error: null,
    createSuccess: false,
    success: false,
  },
  reducers: {},

  extraReducers: (builder) => {
    /* -------- CREATE RESTAURANT ------- */
    builder
      .addCase(createRestaurant.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants.push(action.payload);
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- GET ALL ACTIVE RESTAURANT ------- */
    builder
      .addCase(getAllActiveRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllActiveRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
      })
      .addCase(getAllActiveRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ADMIN - INACTIVE RESTAURANT BY ADMIN
    builder
      .addCase(inactiveRestaurantByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(inactiveRestaurantByAdmin.fulfilled, (state, action) => {
        state.success = true;
        state.restaurants = state.restaurants.filter(
          (r) => r._id !== action.payload.restaurantId
        );
      })
      .addCase(inactiveRestaurantByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // ADMIN  - GET RESTAURANT STATUS
    builder
      .addCase(getRestaurantStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getRestaurantStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload; // hotels array
      })

      .addCase(getRestaurantStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default restaurantSlice.reducer;
