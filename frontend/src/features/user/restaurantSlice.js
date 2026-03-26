import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";


/* -------- CREATE RESTAURANT ------- */
export const createRestaurant = createAsyncThunk(
  "restaurant/create",
  async (data, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await apiClient.post("/api/resturant/create-restaurent", data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
         },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState: {
    restaurants: [],
    nearbyRestaurants: [],
    loading: false,
    error: null,
    createSuccess: false
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
    })


  }
})

export default restaurantSlice.reducer