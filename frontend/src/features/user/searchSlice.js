import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

export const smartSearch = createAsyncThunk(
  "search/smartSearch",
  async (query) => {
    const res = await apiClient.get(`/api/user/smart-Search?q=${query}`, {
      headers : {
        "Cache-Control": "no-cache",
      }
    });
    console.log("BACKEND RAW RESPONSE:", res.data);
    
    return res;
  },
);

const searchSlice = createSlice({
  name: "search",

  initialState: {
    city: null,
    hotels: [],
    places: [],
    loading: false,
  },

  extraReducers: (builder) => {
    builder
      .addCase(smartSearch.pending, (state) => {
        state.loading = true;
      })

      .addCase(smartSearch.fulfilled, (state, action) => {
        if (!action.payload) {
          console.log("Payload is undefined");
          return;
        }
        state.loading = false;
        state.city = action.payload.city;
        state.hotels = action.payload.hotels;
        state.places = action.payload.places;
      })

      .addCase(smartSearch.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default searchSlice.reducer;
