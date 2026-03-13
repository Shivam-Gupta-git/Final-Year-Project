import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

const initialState = {
  hotels: [],
  loading: false,
  error: null,
  createSuccess: false
};

/* -------- Create Hotel -------- */
export const createHotel = createAsyncThunk(
  "hotel/createHotel",
  async (data, thunkAPI) => {
    try {
      const response = await apiClient.post("/api/hotel/create-hotel", data);
      return response.hotel;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Create hotel failed"
      );
    }
  }
);

const hotelSlice = createSlice({
  name: "hotel",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(createHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = true;
        state.hotels.push(action.payload);
      })

      .addCase(createHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


  },
}); 

export default hotelSlice.reducer;