import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

export const getHotelReviews = createAsyncThunk(
  "review/getHotelReviews",
  async (hotelId, thunkAPI) => {
    try {
      const response = await apiClient.get(`/api/review/hotel/${hotelId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch reviews"
      );
    }
  }
);

export const addHotelReview = createAsyncThunk(
  "review/addHotelReview",
  async ({ hotelId, rating, comment }, thunkAPI) => {
    try {
      const response = await apiClient.post("/api/review", {
        targetType: "hotel",  
        targetId: hotelId,
        rating,
        comment,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to submit review"
      );
    }
  }
);


const reviewSlice = createSlice({
  name: "review",
  initialState: {
    hotelReviews: [],
    loading: false,
    submitLoading: false,
    submitSuccess: false,
    error: null,
    submitError: null,
  },
  reducers: {
    resetReviewState: (state) => {
      state.submitSuccess = false;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {

    /* getHotelReviews */
    builder
      .addCase(getHotelReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHotelReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.hotelReviews = action.payload ?? [];
      })
      .addCase(getHotelReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* addHotelReview */
    builder
      .addCase(addHotelReview.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(addHotelReview.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submitSuccess = true;
        // Note: review dikhega nahi kyunki approval pending hoga
      })
      .addCase(addHotelReview.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      });
  },
});

export const { resetReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;