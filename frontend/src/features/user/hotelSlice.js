import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

const initialState = {
  hotels: [],
  loading: false,
  error: null,
  createSuccess: false,
  hotel: null,
};

/* -------- Create Hotel -------- */
export const createHotel = createAsyncThunk(
  "hotel/createHotel",
  async (data, thunkAPI) => {
    try {
      const response = await apiClient.post("/api/hotel/create-hotel", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.hotel;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Create hotel failed",
      );
    }
  },
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
        error.response?.data?.message || "Failed to fetch cities",
      );
    }
  },
);

/* -------- approve Hotel -------- */
export const approveHotelById = createAsyncThunk(
  "hotel/approveHotel",
  async (hotelId, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.patch(
        `/api/admin/hotel/${hotelId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        },
      );
      return { hotelId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "City approval failed",
      );
    }
  },
);

/* -------- Rejected Hotel -------- */
export const rejectHotelById = createAsyncThunk(
  "city/rejectHotel",
  async (hotelId, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.patch(
        `/api/admin/hotel/${hotelId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        },
      );
      return { hotelId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "City rejection failed",
      );
    }
  },
);

/* -------- get All Hotels -------- */
export const getAllHotels = createAsyncThunk(
  "city/getAllCities",
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get("/api/hotel/get-all-hotels");

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch hotels",
      );
    }
  },
);

/* -------- get All Active Hotels -------- */
export const getAllActiveHotels = createAsyncThunk(
  "hotel/getAllActiveHotels",
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get("/api/hotel/activehotel");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch active cities",
      );
    }
  },
);

/* -------- inactive Hotel -------- */
export const inactiveHotel = createAsyncThunk(
  "hotel/inactiveHotel",
  async (hotelId, thunkAPI) => {
    try {
      const response = await apiClient.patch(

        `/api/admin/hotel/${hotelId}/inactive`,
        {},
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        },

        `/api/admin/hotel/${hotelId}/inactive`

      );
      return { hotelId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(

        error.response?.data?.message || "Hotel Inactive failed",

        error.response?.data?.message || "Hotel inactive failed"

      );
    }
  },
);

/* -------- get All Inactive Hotels -------- */
export const getAllInactiveHotels = createAsyncThunk(
  "hotel/getAllInactiveHotels",
  async (_, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.get(
        "/api/hotel/get-all-Inactive-hotels",
        {
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
          },
        },
      );
      return response.data; // return inactive hotels data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

/* -------- get All Rejected Hotels -------- */
export const getAllRejectedHotels = createAsyncThunk(
  "hotel/getAllRejectedHotel",
  async (_, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");

      const response = await apiClient.get("/api/admin/hotels/rejected", {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

/* ------ delete Hotel ------- */
export const deleteHotel = createAsyncThunk(
  "hotel/deleteHotel",
  async (id, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.delete(`/api/hotel/delete-hotel/${id}`, {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });
      console.log("RESPONSE: ", response);
      return { id, ...response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "hotel delete failde",
      );
    }
  },
);

/* ------ update Hotel ------- */
export const updateHotel = createAsyncThunk(
  "/hotel/updateHotel",
  async ({ hotelId, data }, thunkAPI) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await apiClient.put(
        `/api/hotel/updateHotel/${hotelId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "hotel update failed",
      );
    }
  },
);

/* -------- get All Active Public Hotels -------- */
export const getPublicActiveHotels = createAsyncThunk(
  "hotel/getPublicAvtiveHotel",
  async (params = {}, thunkAPI) => {
    try {
      const response = await apiClient.get("/api/hotel/public/hotels", {
        params,   // ← sends ?city=Delhi&checkIn=...&checkOut=...&guests=...
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch public active hotels",
      );
    }
  },
);

/* ------ get hotel by ID ------- */
export const getHotelById = createAsyncThunk(
  "hotel/getHotelById",
  async (id, thunkAPI) => {
    try {
      const adminToken = localStorage.getItem("adminToken");

      const response = await apiClient.get(`/api/hotel/get-hotel-by-id/${id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      return response.data; // IMPORTANT
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch hotel",
      );
    }
  },
);

/* ------ inactive Hotel by admin ------- */
export const inactiveHotelByAdmin = createAsyncThunk(
  "hotel/inactiveHotelByAdmin",
  async (hotelId, thunkAPI) => {
    try {
      const adminToken = localStorage.getItem("adminToken");

      const response = await apiClient.patch(
        `/api/admin/adminhotel/${hotelId}/inactive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      return { hotelId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to inactive hotel"
      );
    }
  }
);

/* ------  getHotelsByStatus ------- */
export const getHotelsStatus = createAsyncThunk(
  "hotel/getHotelsStatus",
  async (status, thunkAPI) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await apiClient.get(
        `/api/hotel/get-hotel-status?status=${status}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
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
        const hotel = state.hotels.find(
          (c) => c._id === action.payload.hotelId,
        );
        if (hotel) hotel.status = "active";
      })
      .addCase(approveHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- Rejected Hotel -------- */
    builder
      .addCase(rejectHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectHotelById.fulfilled, (state, action) => {
        state.loading = false;
        const hotel = state.hotels.find(
          (c) => c._id === action.payload.hotelId,
        );
        if (hotel) hotel.status = "rejected";
      })
      .addCase(rejectHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    /* -------- get All Hotels -------- */
    builder

      .addCase(getAllHotels.pending, (state) => {
        state.loading = true;
      })

      .addCase(getAllHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })

      .addCase(getAllHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- get All Active Hotels -------- */
    builder
      .addCase(getAllActiveHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllActiveHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })
      .addCase(getAllActiveHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- Inactive Hotel (Soft Delete) -------- */
    builder
      .addCase(inactiveHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(inactiveHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const hotel = state.hotels.find(
          (c) => c._id === action.payload.hotelId,
        );
        if (hotel) hotel.status = "inactive";
      })
      .addCase(inactiveHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    /* -------- get All Inactive Hotels -------- */
    builder
      .addCase(getAllInactiveHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllInactiveHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })
      .addCase(getAllInactiveHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- get All Rejected Hotels -------- */
    builder
      .addCase(getAllRejectedHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRejectedHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })
      .addCase(getAllRejectedHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------ delete city ------- */
    builder
      .addCase(deleteHotel.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.loading = false;

        const hotel = state.hotels.find((c) => c._id === action.payload.id);

        if (hotel) {
          hotel.status = "inactive"; // ⭐ IMPORTANT
        }
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------ update hotel ------- */
    builder
      .addCase(updateHotel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        const index = state.hotels.findIndex(
          (h) => h._id === action.payload._id,
        );

        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    builder

      // GET HOTEL BY ID
      .addCase(getHotelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getHotelById.fulfilled, (state, action) => {
        state.loading = false;
        state.hotel = action.payload.data;
      })

      .addCase(getHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- get All Active Public Hotels -------- */
    builder
      .addCase(getPublicActiveHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicActiveHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })
      .addCase(getPublicActiveHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------ inactive Hotel by admin ------- */

    builder
      .addCase(inactiveHotelByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(inactiveHotelByAdmin.fulfilled, (state, action) => {
        state.loading = false;

        const id = action.payload.hotelId;

        // ⭐ remove from active list
        state.hotels = state.hotels.filter((h) => h._id !== id);
      })

      .addCase(inactiveHotelByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------  getHotelsByStatus ------- */

    builder
      .addCase(getHotelsStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getHotelsStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload; // hotels array
      })

      .addCase(getHotelsStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default hotelSlice.reducer;
