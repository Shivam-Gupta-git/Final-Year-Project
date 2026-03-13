import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

/* -------- Initial State -------- */
const initialState = {
  loading: false,
  admin: null,
  error: null,
  message: null,
  profileUpdate: false,
  passwordChange: false
};

/* ------- getAdminData -------- */
export const getAdminData = createAsyncThunk(
  "admin/getAdminProfile",
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get("/api/admin/admin-profile");
      return response.admin; // return admin data
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Get Admin Data Failed"
      );
    }
  }
);

/* ------- updateAdminProfile -------- */
export const updateAdminProfile = createAsyncThunk(
  "admin/updateAdminProfile",
  async (data, thunkAPI) => {
    try {
      const response = await apiClient.put(
        "/api/admin/update-admin-profile",
        data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
      console.log("FULL AXIOS RESPONSE:", response);
      console.log("AXIOS DATA:", response?.data);

      return response;

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || " admin Profile update failed"
      );
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      /* ------- getAdminData -------- */
      .addCase(getAdminData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAdminData.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload; // store admin
      })

      .addCase(getAdminData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

      /* ------- updateAdminProfile -------- */
      builder
    .addCase(updateAdminProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.profileUpdate = false;
    })

    .addCase(updateAdminProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.profileUpdate = true;
    
      const updatedUser =
        action.payload?.admin || action.payload?.updateAdmin;
    
      if (updatedUser) {
        state.admin = updatedUser;
      }
    })

    .addCase(updateAdminProfile.rejected, (state, action) => {
      state.loading = false,
      state.error = action.payload,
      state.profileUpdate = false
    })
  },
});

export default adminSlice.reducer;