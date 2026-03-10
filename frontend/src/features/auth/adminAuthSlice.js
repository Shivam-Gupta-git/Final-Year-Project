import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

/* ----- Initial State -------- */
const initialState = {
  adminToken: localStorage.getItem("adminToken") || null, 
  isAuthenticated: false,
  role: null,
  admin: null,
  loading: false,
  error: null,
  registerSuccess: false,
  verifySuccess: false,
  loginSuccess: false
}

/* ----- adminRegistration ----- */
export const adminRegistration = createAsyncThunk("admin/adminRegisteration", async (data, thunkAPI) => {
  try {
    const response = await apiClient.post("/api/admin/admin-registration", data);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "admin registration failed")
  }
})

/* ------ getAllAdmin ------ */
export const getAllAdmin = createAsyncThunk("admin/getAllAdmin", async (_, thunkAPI) => {
  try {
    const response = await apiClient.get("/api/admin/getAllAdmins")
    return response.admins
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "get all admin data failed")
  }
})

/* ------ Update admin status ------- */
export const updateAdminStatus = createAsyncThunk(
  "admin/updateAdminStatus",
  async ({ adminId, status }, thunkAPI) => {
    try {
      const response = await apiClient.patch(`/api/admin/approve-admin/${adminId}`, {
        status,
      });
      return response; 
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Update admin status failed"
      );
    }
  }
);

/* -------- Slice -------- */
const adminAuthSlice = createSlice({
  name: "admin",
  initialState: {
    admins: [],
    loading: false,
    error: null,
  },

  reducers:{
    logout(state){
      state.adminToken = null;
      state.admins = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem("adminToken")
    }
  },

  extraReducers: (builder) => {
    /* ----- adminRegistration ----- */
    builder
    .addCase(adminRegistration.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.registerSuccess = false
    })

    .addCase(adminRegistration.fulfilled, (state) => {
      state.loading = false;
      state.registerSuccess = true
    })

    .addCase(adminRegistration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.registerSuccess = false
    })

   /* ------ getAllAdmin ------ */
    builder
    .addCase(getAllAdmin.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getAllAdmin.fulfilled, (state, action) => {
      state.loading = false;
      state.admins = action.payload;
    })
    .addCase(getAllAdmin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    /* ------ Update admin status ------- */
     builder
     .addCase(updateAdminStatus.fulfilled, (state, action) => {
      const { adminId, status } = action.payload;
      const admin = state.admins.find((a) => a._id === adminId);
      if (admin) {
        admin.status = status;
        if (status === "approved") admin.isVerified = true;
      }
    })
    .addCase(updateAdminStatus.rejected, (state, action) => {
      state.error = action.payload;
    });

  }
})

export default adminAuthSlice.reducer