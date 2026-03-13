import { createAsyncThunk, createSlice, nanoid } from "@reduxjs/toolkit";
// import authApi from "./authApi";
import apiClient from "../../pages/services/apiClient";
import axios from "axios";

/* -------------- Initial State ---------------- */
const initialState = {
    token: localStorage.getItem("userToken") || null,
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
    const response = await apiClient.post("/api/user/user-registration", data, {
      headers:{
        "Content-Type": "multipart/form-data"
      }
    })
    return response.data;
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
  "/api/user/user-login",
  async (userData, thunkAPI) => {
    try {
      const response = await apiClient.post("/api/user/user-login", userData);

      localStorage.setItem("userToken", response.accessToken);

      return response;

    } catch (error) {
      console.log("LOGIN ERROR:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login Failed"
      );

    }
  }
);

/* ----------------- userLogout --------------------- */
export const userLogout = createAsyncThunk("auth/userLogout", async (_, thunkAPI) => {
  try {
    await apiClient.delete("/api/user/user-logout")
    localStorage.removeItem("userToken" )
    return true
  } catch (error) {
    console.log("LOGOUT ERROR:", error.response);
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Logout failed")
  }
})

/* ----------------- ForgotPassword --------------------- */
export const forgotPassword = createAsyncThunk("auth/forgot-user-password", async (email, thunkAPI) => {
try {
  const response = await apiClient.post("/api/user/forgot-user-password", {email})
  return response
} catch (error) {
  return thunkAPI.rejectWithValue(error.response?.data?.message || "forgotpassword failed")
}
})

/* ----------------- verify otp --------------------- */
export const verifyOtp = createAsyncThunk("auth/verify-user-otp", async ({email, otp}, thunkAPI) => {
  try {
    const response = await apiClient.post(`/api/user/verify-user-otp/${email}`, {otp})
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "otp verification failed")
  }
})

 /* ----------------- change password --------------------- */
 export const changePassword = createAsyncThunk("auth/change-password", async ({email, newPassword, confirmPassword}, thunkAPI) => {
  try {
    const response = await apiClient.post(`/api/user/change-password/${email}`, {newPassword, confirmPassword})

    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "chane password failed")
  }
 })

/* ------------- Slice -------------- */
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers:{
    logout(state){
      state.token = null,
      state.isAuthenticated = false,
      state.role = null,
      localStorage.removeItem("userToken")
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
      state.loading = false;
      state.loginSuccess = true;
      state.error = null;
      state.isAuthenticated = true;   // 🔥 important
      state.token = action.payload.accessToken;
    })
  
    .addCase(userLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.loginSuccess = false;
    });

    /* ---------------- userLogout ------------------- */
    builder
    .addCase(userLogout.fulfilled, (state) => {
      state.token = null;
      state.isAuthenticated = false;
    })

    /* ----------------- ForgotPassword --------------------- */
    builder.addCase(forgotPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    });
    
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    /* ----------------- verify otp --------------------- */
    builder.addCase(verifyOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.otpVerified = true;
      state.message = action.payload.message;
    });
    
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    /* ----------------- change password --------------------- */
    builder.addCase(changePassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    builder.addCase(changePassword.fulfilled, (state, action) => {
      state.loading = false;
      state.passwordChanged = true;
      state.message = action.payload.message;
    });
    
    builder.addCase(changePassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    
  }
})

export default authSlice.reducer

