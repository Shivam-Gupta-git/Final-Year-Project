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

/* -------- get all pending Hotel -------- */
export const getPendingHotels = createAsyncThunk(
  "hotel/getPendingCities",
  async (_, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");

      const response = await apiClient.get("/api/admin/hotels/pending", {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch cities"
      );
    }
  }
);

/* -------- approve Hotel -------- */
export const approveHotelById = createAsyncThunk("hotel/approveHotel", async (hotelId, thunkAPI) => {
  try {
     const superAdminToken = localStorage.getItem("superAdminToken");
    const response = await apiClient.patch(`/api/admin/hotel/${hotelId}/approve`, {}, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    })
    return { hotelId, message: response.data.message };
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || "City approval failed"
    );
  }
})

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

    /* -------- get all pending Hotel -------- */
    builder
    .addCase(getPendingHotels.pending, (state) => {
      state.loading = true;
    })

    .addCase(getPendingHotels.fulfilled, (state, action) => {
      state.loading = false;
      state.hotels = action.payload;
    })

    .addCase(getPendingHotels.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }); 
    
  /* -------- approve Hotel -------- */  
  builder
      .addCase(approveHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveHotelById.fulfilled, (state, action) => {
        state.loading = false;
        const hotel = state.hotels.find((c) => c._id === action.payload.hotelId);
        if (hotel) hotel.status = "active";
      })
      .addCase(approveHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


  },
}); 

export default hotelSlice.reducer;