import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

/* ------- get Room Availability ------- */
export const getRoomAvailability = createAsyncThunk(
  "booking/getAvailability",
  async ({ hotelId, checkIn, checkOut }, thunkAPI) => {
    try {
      const response = await apiClient.get(
        `/api/hotelBooking/availability/${hotelId}?checkIn=${checkIn}&checkOut=${checkOut}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed");
    }
  }
);

/* ------- book room ------- */
export const bookRoom = createAsyncThunk(
  "booking/bookRoom",
  async (bookingData, thunkAPI) => {
    try {
      const token = localStorage.getItem("userToken"); // or adminToken if admin
      const response = await apiClient.post("/api/hotelBooking/bookRoom", bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // { message, booking }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Booking failed");
    }
  }
);

const hotelBookingSlice = createSlice({
  name: "booking",
  initialState: {
    availability: [],
    loading: false,
    error: null,
    lastBooking: null,
    success: false,
  },
  reducers: {
    resetBookingState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.lastBooking = null;
    },
  },

  /* ------- get Room Availability ------- */
  extraReducers: (builder) => {
    builder
      .addCase(getRoomAvailability.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRoomAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
      })
      .addCase(getRoomAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    /* ------- book room ------- */
    builder
      .addCase(bookRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(bookRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastBooking = action.payload.booking;
        state.bookings.push(action.payload.booking);
      })
      .addCase(bookRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });  


  },
})

export const { resetBookingState } = hotelBookingSlice.actions;
export default hotelBookingSlice.reducer