import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

const initialState = {
  city: null,
  cities: [],
  loading: false,
  error: null,
  createSuccess: false,
};

/* -------- Create City -------- */
export const createCity = createAsyncThunk(
  "city/createCity",
  async (data, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.post("/api/city/create-city", data, {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Create city failed"
      );
    }
  }
);

/* -------- approve City -------- */
export const approveCityById = createAsyncThunk(
  "city/approveCity",
  async (cityId, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.patch(
        `/api/admin/city/${cityId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        }
      );

      return { cityId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "City approval failed"
      );
    }
  }
);

/* -------- Rejected City -------- */
export const rejectCityById = createAsyncThunk(
  "city/rejectCity",
  async (cityId, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.patch(
        `/api/admin/city/${cityId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        }
      );
      return { cityId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "City rejection failed"
      );
    }
  }
);

/* -------- pending City -------- */
export const getPendingCities = createAsyncThunk(
  "city/getPendingCities",
  async (_, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");

      const response = await apiClient.get("/api/admin/cities/pending", {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch cities"
      );
    }
  }
);

/* -------- get All Cities -------- */
export const getAllCities = createAsyncThunk(
  "city/getAllCities",
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get("/api/city/get-allcities");

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch cities"
      );
    }
  }
);

/* -------- get All Active Cities -------- */
export const getActiveCities = createAsyncThunk(
  "city/getActiveCities",
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get("/api/city/activecity");
      return response.data; // array of active cities
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch active cities"
      );
    }
  }
);

/* ------ getCityById ------- */
export const getCityById = createAsyncThunk(
  "city/getCityById",
  async (cityId, thunkAPI) => {
    try {
      const response = await apiClient.get(`/api/city/getcity/${cityId}`);
      return response.data; // return city
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "City rejection failed"
      );
    }
  }
);

const citySlice = createSlice({
  name: "city",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    /* -------- Create City -------- */
    builder
      .addCase(createCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createCity.fulfilled, (state, action) => {
        state.loading = false;
        state.city = action.payload.data;
        state.createSuccess = true;
      })

      .addCase(createCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log("CITY ERROR:", action.payload);
      });

    /* -------- approve City -------- */
    builder
      .addCase(approveCityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveCityById.fulfilled, (state, action) => {
        state.loading = false;
        const city = state.cities.find((c) => c._id === action.payload.cityId);
        if (city) city.status = "active";
      })
      .addCase(approveCityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- Rejected City -------- */
    builder
      .addCase(rejectCityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectCityById.fulfilled, (state, action) => {
        state.loading = false;
        const city = state.cities.find((c) => c._id === action.payload.cityId);
        if (city) city.status = "rejected";
      })
      .addCase(rejectCityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- pending City -------- */
    builder
      .addCase(getPendingCities.pending, (state) => {
        state.loading = true;
      })

      .addCase(getPendingCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })

      .addCase(getPendingCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- get All Cities -------- */
    builder

      .addCase(getAllCities.pending, (state) => {
        state.loading = true;
      })

      .addCase(getAllCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })

      .addCase(getAllCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- get All Active Cities -------- */
    builder
    .addCase(getActiveCities.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getActiveCities.fulfilled, (state, action) => {
      state.loading = false;
      state.cities = action.payload;
    })
    .addCase(getActiveCities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });  

    /* ------ getCityById ------- */
    builder
      .addCase(getCityById.pending, (state) => {
        state.loading = true;
      })

      .addCase(getCityById.fulfilled, (state, action) => {
        state.loading = false;
        state.city = action.payload;
      })

      .addCase(getCityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default citySlice.reducer;
