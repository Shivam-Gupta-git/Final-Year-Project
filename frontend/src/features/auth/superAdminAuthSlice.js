import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

/* --------------- Initial State ------------- */
const initialState = {
  superAdminToken : localStorage.getItem("superAdminToken") || null,
  isAuthenticated: false,
  role: null,
  superAdmin: null,
  loading: false,
  error: null,
  registerSuccess: false,
  verifySuccess: false,
  loginSuccess: false
}

/* ---------- superAdminRegistration ------------ */

export const superAdminRegister = createAsyncThunk("auth/superAdminRegister", async (data, thunkAPI) => {
  try {
    const response = await apiClient.post("/api/admin/super-admin-registration", data,{
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })

    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "super Admin registration  failed")
  }
})

/* ---------- superAdminLogin ------------ */
export const superAdminLogin = createAsyncThunk(
  "auth/superAdminLogin",
  async (data, thunkAPI) => {
    try {
      const response = await apiClient.post(
        "/api/admin/super-admin-login",
        data
      );
      return {
        superAdminToken: response.accessToken,
        user: response.superAdmin,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Super admin login failed"
      );
    }
  }
);

/* -------- superAdminLogOut ---------- */
export const superAdminLogout = createAsyncThunk("auth/superAdminLogout", async (_, thunkAPI) => {
  try {
   const response = await apiClient.delete("/api/admin/super-admin-logout");
    return response
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Super Admin Logout Failed")
  }
})

/* ---------- Slice ------------- */
const superAdminAuthSlice = createSlice({
  name: "auth",
  initialState,

  reducers:{
    logout(state){
      state.superAdminToken = null;
      state.superAdmin = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem("superAdminToken");
    },
    clearAuthError(state){
      state.error = null
    }
  },


  extraReducers: (builder) => {

    /* -------- superAdminRegistration ---------- */

    builder
    .addCase(superAdminRegister.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.registerSuccess = false;
    })

    .addCase(superAdminRegister.fulfilled, (state) => {
      state.loading = false;
      state.registerSuccess = true;
    })

    .addCase(superAdminRegister.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.registerSuccess = false;
    })

    /* ---------- superAdminLogin ------------ */
    builder
    .addCase(superAdminLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.loginSuccess = false
    })

    .addCase(superAdminLogin.fulfilled, (state, action) => {
      state.loading = false;
      state.loginSuccess = true;
      state.isAuthenticated = true;
      state.role = "super_admin";
    
      state.superAdminToken = action.payload.token;
      state.superAdmin = action.payload.user;
    
      localStorage.setItem("superAdminToken", action.payload.superAdminToken);

    })

    .addCase(superAdminLogin.rejected, (state, action) => {
     state.loading = false,
     state.loginSuccess = false,
     state.error = action.payload
    })

    /* -------- superAdminLogOut ---------- */
    builder
    .addCase(superAdminLogout.fulfilled, (state) => {
      state.token = null;
      state.superAdmin = null;
      state.isAuthenticated = false;
    
      localStorage.removeItem("superAdminToken");
    })


  }
})
export const { clearAuthError } = superAdminAuthSlice.actions
export default superAdminAuthSlice.reducer
