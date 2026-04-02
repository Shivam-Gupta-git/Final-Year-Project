import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

const initialState = {
  // Server state
  refNo: null,
  coupon: null, // { code, discountPct, discountAmt }
  finalAmount: null, // after coupon
  paymentData: null, // orderId + key from initiatePayment (for Razorpay modal)
  confirmed: false,

  // Async status
  loading: false,
  loadingMsg: "",
  error: null,
};

// 1. Save contact details → returns refNo
export const saveDetails = createAsyncThunk(
  "booking/saveDetails",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/booking/details", formData);
      return res; // ✅ NOT res.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to save details",
      );
    }
  },
);

// 2. Send OTP to registered email
export const sendOtp = createAsyncThunk(
  "booking/sendOtp",
  async ({ refNo }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/booking/send-otp", { refNo });
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send OTP",
      );
    }
  },
);

//3 . verify otp
export const verifyOtp = createAsyncThunk(
  "booking/verifyOtp",
  async ({ refNo, otp }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/booking/verify-otp", {
        refNo,
        otp,
      });
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to verify otp",
      );
    }
  },
);

//applyCoupon
export const applyCoupon = createAsyncThunk(
  "booking/applyCoupon",
  async ({ refNo, code }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/booking/apply-coupon", {
        refNo,
        code,
      });
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to apply coupon",
      );
    }
  },
);

//initiatePayment
export const initiatePayment = createAsyncThunk(
  "booking/initiatePayment",
  async ({ refNo, method }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/api/booking/initiate-payment", {
        refNo,
        method,
      });
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to initiate Payment",
      );
    }
  },
);

//confirmBooking
export const confirmBooking = createAsyncThunk(
  "booking/confirmBooking",
  async (
    { refNo, razorpayOrderId, razorpayPaymentId, razorpaySignature },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiClient.post("/api/booking/confirm", {
        refNo,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });
      return res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to confirm Booking",
      );
    }
  },
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,

  reducers: {
    // Call this when the user clicks "Make Another Booking"
    resetBooking: () => initialState,

    // Clear only the error (e.g. after user edits form)
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ── Helper to set loading / error states ─────────────────────────────
    const pending = (msg) => (state) => {
      state.loading = true;
      state.loadingMsg = msg;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    // ── saveDetails ───────────────────────────────────────────────────────
    builder
      .addCase(saveDetails.pending, pending("Saving your details..."))
      .addCase(saveDetails.rejected, rejected)
      .addCase(saveDetails.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.refNo = payload.refNo;
      });

    // ── sendOtp ───────────────────────────────────────────────────────────
    builder
      .addCase(sendOtp.pending, pending("Sending OTP..."))
      .addCase(sendOtp.rejected, rejected)
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
      });

    // ── verifyOtp ─────────────────────────────────────────────────────────
    builder
      .addCase(verifyOtp.pending, pending("Verifying OTP..."))
      .addCase(verifyOtp.rejected, rejected)
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
      });

    // ── applyCoupon ───────────────────────────────────────────────────────
    builder
      .addCase(applyCoupon.pending, pending("Applying coupon..."))
      .addCase(applyCoupon.rejected, rejected)
      .addCase(applyCoupon.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.coupon = payload.coupon;
        state.finalAmount = payload.finalAmount;
      });

    // ── initiatePayment ───────────────────────────────────────────────────
    builder
      .addCase(initiatePayment.pending, pending("Creating payment order..."))
      .addCase(initiatePayment.rejected, rejected)
      .addCase(initiatePayment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.paymentData = payload; // passed to Razorpay modal
        state.finalAmount = state.finalAmount ?? payload.amount;
      });

    // ── confirmBooking ────────────────────────────────────────────────────
    builder
      .addCase(confirmBooking.pending, pending("Confirming booking..."))
      .addCase(confirmBooking.rejected, rejected)
      .addCase(confirmBooking.fulfilled, (state) => {
        state.loading = false;
        state.confirmed = true;
      });
  },
});

export const { resetBooking, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectBooking = (state) => state.booking;
export const selectRefNo = (state) => state.booking.refNo;
export const selectCoupon = (state) => state.booking.coupon;
export const selectFinalAmount = (state) => state.booking.finalAmount;
export const selectLoading = (state) => state.booking.loading;
export const selectLoadingMsg = (state) => state.booking.loadingMsg;
export const selectError = (state) => state.booking.error;
export const selectConfirmed = (state) => state.booking.confirmed;
