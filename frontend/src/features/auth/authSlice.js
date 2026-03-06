import { createAsyncThunk, createSlice, nanoid } from "@reduxjs/toolkit";
// import authApi from "./authApi";
import apiClient from "../../services/apiClient";
import axios from "axios";

/* -------------- Initial State ---------------- */
const initialState = {
    token: localStorage.getItem("token"),
    isAuthenticated: false,
    role: null,
    user: null,
    loading: false,
    error: null,
    registerSuccess: false,
    verifySuccess: false,
    loginSuccess: false

}

/* -------------- User Registration ------------------- */
export const register = createAsyncThunk("auth/register", async (data, thunkAPI) => {
  try {
    const response = await apiClient.post("/api/user/user-registration", data)
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Registration failed")
  }
})

/* --------------- verifyEmail ------------------- */
export const verifyEmail = createAsyncThunk("auth/verifyEmail", async (token, thunkAPI) => {
  try {
    const response = await axios.post("http://localhost:3000/api/user/user-verification", null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Verification failed")
  }
})

/* ------------------- userLogin ----------------------- */
export const userLogin = createAsyncThunk(
  "auth/userLogin",
  async (userData, thunkAPI) => {
    try {
      const response = await apiClient.post("/api/user/user-login", userData);

      console.log("FULL RESPONSE:", response); 

      return response;

    } catch (error) {
      console.log("LOGIN ERROR:", error);

      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login Failed"
      );
    }
  }
);

/* ------------- Slice -------------- */
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers:{
    logout(state){
      state.token = null,
      state.isAuthenticated = false,
      state.role = null,
      localStorage.removeItem("token")
    },
    clearAuthError(state){
      state.error = null
    }
  },

  extraReducers: (builder) => {
    /* ------------ userRegistration -------------- */
    builder.addCase(register.pending, (state) => {
      state.loading = true
      state.error = null
      state.registerSuccess = false
    })

    builder.addCase(register.fulfilled, (state) => {
      state.loading = false,
      state.registerSuccess = true
    })

    builder.addCase(register.rejected, (state, action) => {
      state.loading = false,
      state.error = action.payload
    })

    /* ----------------- verifyEmail ---------------- */
    builder.addCase(verifyEmail.pending, (state) => {
      state.loading = true
    })

    builder.addCase(verifyEmail.fulfilled, (state) => {
      state.loading = false,
      state.verifySuccess = true
    })

    builder.addCase(verifyEmail.rejected, (state, action) => {
      state.loading = false,
      state.error = action.payload
    })

    /* ------------------ userLogin ---------------- */
    builder
    .addCase(userLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.loginSuccess = false;
    })
  
    .addCase(userLogin.fulfilled, (state, action) => {
      state.loginSuccess = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

    })
  
    .addCase(userLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.loginSuccess = false;
    });


  }
})

export default authSlice.reducer

