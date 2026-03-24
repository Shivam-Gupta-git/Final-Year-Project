import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

/* ------- get Room Availability ------- */
export const getRoomAvailability = createAsyncThunk(
  "booking/getAvailability",
  async ({ hotelId, checkIn, checkOut }, thunkAPI) => {
    try {
      const response = await apiClient.get(
        `/api/hotelBooking/availability/${hotelId}?checkIn=${checkIn}&checkOut=${checkOut}`,
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed",
      );
    }
  },
);

/* ------- book room ------- */
export const bookRoom = createAsyncThunk(
  "booking/bookRoom",
  async (bookingData, thunkAPI) => {
    try {
      const token = localStorage.getItem("userToken"); // or adminToken if admin
      const response = await apiClient.post(
        "/api/hotelBooking/bookRoom",
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Booking failed",
      );
    }
  },
);

/* ------- getBookingsByHotel ------- */
export const getBookingsByHotel = createAsyncThunk(
  "booking/getBookingsByHotel",
  async (hotelId, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await apiClient.get(`/api/hotelBooking/admin/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

/* ------- updateBookingStatus ------- */
export const updateBookingStatus = createAsyncThunk(
  "booking/updateBookingStatus",
  async ({ bookingId, status }, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      console.log(bookingId, status);
      const res = await apiClient.put(
        `/api/hotelBooking/status/${bookingId}`,
        { bookingStatus: status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

/* ------- getMyBookings ------- */
export const getMyBookings = createAsyncThunk(
  "booking/getMyBookings",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("userToken");

      const res = await apiClient.get("/api/hotelBooking/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

/* ------- cancelBooking ------- */
export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async (bookingId, thunkAPI) => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await apiClient.put(
        `/api/hotelBooking/cancel/${bookingId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

const hotelBookingSlice = createSlice({
  name: "booking",
  initialState: {
    availability: [],
    hotelBookings: [],
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

        if (!action.payload || !action.payload.booking) {
          state.success = false;
          state.error = "Invalid booking response";
          return;
        }

        state.success = true;
        state.lastBooking = action.payload.booking;
        state.hotelBookings.push(action.payload.booking);
      })
      .addCase(bookRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------- getBookingsByHotel ------- */
    builder
      .addCase(getBookingsByHotel.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBookingsByHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.hotelBookings = action.payload;
      })
      .addCase(getBookingsByHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------- updateBookingStatus ------- */
    builder.addCase(updateBookingStatus.fulfilled, (state, action) => {
      const index = state.hotelBookings.findIndex(
        (b) => b._id === action.payload._id,
      );
      if (index !== -1) {
        state.hotelBookings[index] = action.payload;
      }
    });

    /* ------- getMyBookings ------- */
    builder
      .addCase(getMyBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.hotelBookings = action.payload;
      })
      .addCase(getMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------- cancelBooking ------- */
    builder.addCase(cancelBooking.fulfilled, (state, action) => {
      const index = state.bookings.findIndex(
        (b) => b._id === action.payload._id,
      );
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
    });
  },
});

export const { resetBookingState } = hotelBookingSlice.actions;
export default hotelBookingSlice.reducer;
