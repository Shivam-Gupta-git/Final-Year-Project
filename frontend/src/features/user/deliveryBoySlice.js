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
      const response = await apiClient.put(`/api/deliveryBoy/status/${id}`, { isOnline, isAvailable },{
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



const initialState = {
  deliveryBoys: [],
  profile: null,
  loading: false,
  error: null,
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
    
  },
});

export default deliveryBoySlice.reducer;