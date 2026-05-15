import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

/* ────────────────────────────────────────────────────────
   Async thunk — smart search
──────────────────────────────────────────────────────── */
export const smartSearch = createAsyncThunk(
  "search/smartSearch",
  async (query, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/api/user/smart-Search`, {
        params: { q: query },
        headers: { "Cache-Control": "no-cache" },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ?? "Search failed. Please try again.",
      );
    }
  },
);

/* ────────────────────────────────────────────────────────
   Initial state
──────────────────────────────────────────────────────── */
const initialState = {
  /* server data */
  city: null,
  hotels: [],
  places: [],
  restaurants: [],
  travels: [],

  /* UI state */
  loading: false,
  error: null,
  lastQuery: "",

  /* Map modal */
  mapOpen: false,
  selectedHotel: null,   // hotel._id currently highlighted on map

  /* Active filters — kept in Redux so they survive view switches */
  filters: {
    price: [],   // e.g. ["0-2500", "2500-5000"]
    stars: [],   // e.g. [4, 5]
    suggested: [],   // e.g. ["breakfast", "wifi"]
  },
};

/* ────────────────────────────────────────────────────────
   Slice
──────────────────────────────────────────────────────── */
const searchSlice = createSlice({
  name: "search",
  initialState,

  reducers: {
    /* open / close the map modal */
    openMap: (state) => { state.mapOpen = true; },
    closeMap: (state) => { state.mapOpen = false; state.selectedHotel = null; },

    /* select a hotel on the map */
    selectHotel: (state, action) => {
      state.selectedHotel = action.payload; // hotel._id or null
    },

    /* toggle a single filter value */
    toggleFilter: (state, action) => {
      const { type, value } = action.payload; // type: "price"|"stars"|"suggested"
      const list = state.filters[type];
      const idx = list.indexOf(value);
      if (idx === -1) {
        list.push(value);
      } else {
        list.splice(idx, 1);
      }
    },

    /* replace an entire filter category */
    setFilter: (state, action) => {
      const { type, values } = action.payload;
      state.filters[type] = values;
    },

    /* clear all filters */
    clearFilters: (state) => {
      state.filters = { price: [], stars: [], suggested: [] };
    },

    /* clear search results */
    clearSearch: (state) => {
      state.city = null;
      state.hotels = [];
      state.places = [];
      state.restaurants = [];
      state.travels = [];
      state.filters = { price: [], stars: [], suggested: [] };
      state.selectedHotel = null;
      state.error = null;
      state.lastQuery = "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(smartSearch.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastQuery = action.meta.arg;
      })

      .addCase(smartSearch.fulfilled, (state, action) => {
        const payload = action.payload;
        if (!payload) return;

        state.loading = false;
        state.city = payload.city ?? null;
        state.hotels = payload.hotels ?? [];
        state.places = payload.places ?? [];
        state.restaurants = payload.restaurants ?? [];
        state.travels = payload.travels ?? [];

        // Reset filters when a new city result arrives
        state.filters = { price: [], stars: [], suggested: [] };
        state.selectedHotel = null;
      })

      .addCase(smartSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export const {
  openMap,
  closeMap,
  selectHotel,
  toggleFilter,
  setFilter,
  clearFilters,
  clearSearch,
} = searchSlice.actions;

/* ────────────────────────────────────────────────────────
   Selectors — memoised filtering happens in the component
   via useMemo (keeps the store normalised)
──────────────────────────────────────────────────────── */
export const selectSearchState = (state) => state.search;
export const selectHotels = (state) => state.search.hotels;
export const selectFilters = (state) => state.search.filters;
export const selectMapOpen = (state) => state.search.mapOpen;
export const selectSelectedHotel = (state) => state.search.selectedHotel;
export const selectCity = (state) => state.search.city;

export default searchSlice.reducer;