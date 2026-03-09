import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const searchHotels = createAsyncThunk(
  "search/searchHotels",
  async (query) => {
    console.log("🔎 Searching for:", query);
    console.log("📡 Sending request to backend...");

    return new Promise((resolve) => {
      setTimeout(() => {
        const fakeResults = [
          { name: "Paris Hotel" },
          { name: "Dubai Resort" },
          { name: "New York Palace" },
        ];

        console.log("✅ Backend response received");
        console.log("📦 Results:", fakeResults);

        resolve(fakeResults);
      }, 1000);
    });
  }
);

const savedHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

const searchSlice = createSlice({
  name: "search",
  initialState: {
    query: "",
    history: savedHistory,
    results: [],
    loading: false,
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },

    addHistory: (state, action) => {
      const search = action.payload;

      const newHistory = [
        search,
        ...state.history.filter((h) => h !== search),
      ].slice(0, 5);

      state.history = newHistory;

      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(searchHotels.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      });
  },
});

export const { setQuery, addHistory } = searchSlice.actions;

export default searchSlice.reducer;