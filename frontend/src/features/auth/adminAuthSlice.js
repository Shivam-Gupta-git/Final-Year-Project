import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

/* ---------- Initial State ---------- */
const initialState = {
  adminToken: localStorage.getItem("adminToken") || null,
  admin: null,
  admins: [],
  isAuthenticated: false,
  role: null,

  loading: false,
  error: null,

  registerSuccess: false,
  verifySuccess: false,
  loginSuccess: false,
};

/* ---------- Admin Registration ---------- */
export const adminRegistration = createAsyncThunk(
  "admin/adminRegistration",
  async (data, thunkAPI) => {
    console.log(data);
    try {
      const response = await apiClient.post(
        "/api/admin/admin-registration",
        data
      );
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Admin registration failed" );
    }});

/* ---------- Get All Admins ---------- */
export const getAllAdmin = createAsyncThunk(
  "admin/getAllAdmin",
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get("/api/admin/getAllAdmins");
      return response.admins;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Get all admin failed" );
      }});

/* ---------- Update Admin Status ---------- */
export const updateAdminStatus = createAsyncThunk(
  "admin/updateAdminStatus",
  async ({ adminId, status }, thunkAPI) => {
    try {
      const response = await apiClient.patch(
        `/api/admin/approve-admin/${adminId}`,
        { status }
      );

      return {
        adminId,
        status,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Update admin status failed"
      );
    }
  }
);

/* ---------- Admin Login ---------- */
export const adminLogin = createAsyncThunk(
  "admin/adminLogin",
  async (data, thunkAPI) => {
    try {
      const response = await apiClient.post("/api/admin/admin-login", data);

      return {
        adminToken: response.accessToken,
        admin: response.data,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Admin login failed"
      );
    }
  }
);

/* ------- Logout Admin ---------- */
export const adminLogout = createAsyncThunk("admin/adminLogout", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("adminToken")
    const respone = await apiClient.delete("/api/admin/admin-logout", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    return respone
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Admin Logout Failed")
  }
})

/* ---------- Slice ---------- */
const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,

  reducers: {
    logout(state) {
      state.adminToken = null;
      state.admin = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem("adminToken");
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- Admin Registration ---------- */
      .addCase(adminRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
      })

      .addCase(adminRegistration.fulfilled, (state) => {
        state.loading = false;
        state.registerSuccess = true;
      })

      .addCase(adminRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Get All Admin ---------- */
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

      /* ---------- Update Admin Status ---------- */
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
      })

      /* ---------- Admin Login ---------- */
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginSuccess = false;
      })

      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.loginSuccess = true;
        state.isAuthenticated = true;
        state.role = "admin";

        state.adminToken = action.payload.adminToken;
        state.admin = action.payload;
        

        localStorage.setItem("adminToken", action.payload.adminToken);
      })

      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.adminToken = null;
        state.isAuthenticated = false;
      });

      /* ------- Logout Admin ---------- */
      builder
      .addCase(adminLogout.fulfilled, (state) => {
        state.token = null;
        state.superAdmin = null;
        state.isAuthenticated = false;
      
        localStorage.removeItem("adminToken");
      })

  },
});

export const { logout } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;