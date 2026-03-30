import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

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

/* -------- inactive City -------- */
export const inactiveCity = createAsyncThunk(
  "city/inactiveCity",
  async (cityId, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.patch(
        `/api/admin/city/${cityId}/inactive`,
        {},
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        }
      );
      return { cityId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "City Inactive failed"
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

/* -------- get All Inactive Cities -------- */
export const getAllInactiveCities = createAsyncThunk(
  "city/getAllInactiveCities",
  async (_, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.get("/api/city/inactive-cities", {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });
      return response.data; // return inactive cities data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
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

/* ------ update city ------- */
export const updateCity = createAsyncThunk(
  "city/updateCity",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await apiClient.put(`/api/city/updatecity/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data; // updated city
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "city update failed"
      );
    }
  }
);

/* ------ delete city ------- */
export const deleteCity = createAsyncThunk(
  "city/deleteCity",
  async (id, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.delete(`/api/city/deletecity/${id}`,{
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });
      console.log("RESPONSE: ", response);
      return { id, ...response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "city delete failde"
      );
    }
  }
);

const citySlice = createSlice({
  name: "city",
  initialState,
  reducers: {
    clearCity: (state) => {
      state.city = null;
      state.error = null;
      state.success = false;
    },
  },

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

    /* -------- Inactive City (Soft Delete) -------- */
    builder
      .addCase(inactiveCity.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(inactiveCity.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const city = state.cities.find((c) => c._id === action.payload.cityId);
        if (city) city.status = "inactive";
      })
      .addCase(inactiveCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
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
        const p = action.payload;
        state.cities = Array.isArray(p) ? p : (p?.data ?? []);
      })
      .addCase(getActiveCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- get All Inactive Cities -------- */
    builder
      .addCase(getAllInactiveCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllInactiveCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(getAllInactiveCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------ getCityById ------- */
    builder
      .addCase(getCityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCityById.fulfilled, (state, action) => {
        state.loading = false;
        state.city = action.payload;
      })
      .addCase(getCityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------ update city ------- */
    builder
      .addCase(updateCity.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        state.loading = false;
        state.city = action.payload;
        state.success = true;
      })
      .addCase(updateCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    /* ------ delete city ------- */
    builder
    .addCase(deleteCity.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteCity.fulfilled, (state, action) => {
      state.loading = false;
  
      const city = state.cities.find(
        (c) => c._id === action.payload.id
      );
  
      if (city) {
        city.status = "inactive";   // ⭐ IMPORTANT
      }
    })
    .addCase(deleteCity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

  },
});

export const { clearCity } = citySlice.actions;
export default citySlice.reducer;
