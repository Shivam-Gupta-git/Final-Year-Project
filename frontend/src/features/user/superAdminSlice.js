import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

const initialState = {
  loading: false,
  superAdmin: null,
  error: null,
  message: null,
  profileUpdate: false,
  passwordChange: false
}

/* ------- getSuperAdminData -------- */
export const getSuperAdminData = createAsyncThunk("auth/getSuperAdminData", async (_, thunkAPI) => {
  try {
    const response = await apiClient.get("/api/admin/superAdmin-profile")
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || " get Super Admin Data Failed")
  }
})

/* ---- updateSuperAdminProfile ---- */
export const updateSuperAdminProfile = createAsyncThunk(
  "superAdmin/updateSuperAdminProfile",
  async (data, thunkAPI) => {
    try {
      const response = await apiClient.put(
        "/api/admin/update-super-admin-profile",
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
        error.response?.data?.message || "super admin update failed"
      );
    }
  }
);

const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState,
  superAdmin: null,
  loading: false,
  reducers: {},

  extraReducers: (builder) => {

    /* ------- getSuperAdminData -------- */
    builder
    .addCase(getSuperAdminData.pending, (state) => {
      state.loading = true;
      state.error = null
    })

    .addCase(getSuperAdminData.fulfilled, (state, action) => {
      state.loading = false;
      state.superAdmin = action.payload?.superAdmin || null
    })

    .addCase(getSuperAdminData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload
    })

    /* ---- updateSuperAdminProfile ---- */
    builder
    .addCase(updateSuperAdminProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.profileUpdate = false;
    })

    .addCase(updateSuperAdminProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.profileUpdate = true;
    
      const updatedUser =
        action.payload?.superAdmin || action.payload?.updatedSuperAdmin;
    
      if (updatedUser) {
        state.superAdmin = updatedUser;
      }
    })

    .addCase(updateSuperAdminProfile.rejected, (state, action) => {
      state.loading = false,
      state.error = action.payload,
      state.profileUpdate = false
    })

  }
})

export default superAdminSlice.reducer

