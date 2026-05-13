import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

/** API may return `{ data: day[] }`, a raw array, or null — keep UI as a day array. */
export function normalizeAiPlan(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

const initialState = {
  // --- Explore flow (requested feature) ---
  places: [],
  nearbyPlaces: [],
  usingNearby: false,
  /** Nearby search ignored city filter (fallback when in-city radius returned nothing). */
  nearbyExpandedBeyondCity: false,
  distanceRadius: 20, // KM (5/20/50/100)
  selectedCity: null,
  userLocation: null, // { lat, lng }
  activeCategory: "",
  searchQuery: "",
  sortBy: "popularity",

  placeFilterCategories: [],
  loadingPlaceCategories: false,
  errorPlaceCategories: null,

  loadingPlaces: false,
  loadingNearby: false,
  errorPlaces: null,
  errorNearby: null,
  pagination: null,

  // --- Existing admin/AI features (kept for compatibility) ---
  cityWisePlaces: [],
  inactiveCityWisePlaces: [],
  place: null,
  loading: false,
  error: null,
  success: false,

  aiPlan: [],
  planHistory: [],
  aiLoading: false,
  aiError: null,
};

/* -------- Explore: get places by cityId -------- */
export const fetchPlacesByCity = createAsyncThunk(
  "place/fetchPlacesByCity",
  async (arg = {}, thunkAPI) => {
    const explore = thunkAPI.getState().place;
    const cityId = arg.cityId;
    if (!cityId) {
      return thunkAPI.rejectWithValue("cityId is required");
    }
    const category =
      arg.category !== undefined ? arg.category : explore.activeCategory;
    const q = arg.q !== undefined ? arg.q : explore.searchQuery;
    const sort = arg.sort !== undefined ? arg.sort : explore.sortBy;

    try {
      const params = new URLSearchParams();
      params.set("cityId", String(cityId));
      const cat = String(category || "").trim();
      if (cat) params.set("category", cat);
      const search = String(q || "").trim();
      if (search) params.set("q", search);
      const sortVal = String(sort || "popularity").trim();
      if (sortVal) params.set("sort", sortVal);

      const res = await apiClient.get(`/api/places?${params.toString()}`);
      const body = res?.data ?? res;
      const list = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
          ? body.data
          : [];
      return list;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch places",
      );
    }
  },
);

/* -------- Explore: get nearby places (distance KM) -------- */
export const fetchNearbyPlaces = createAsyncThunk(
  "place/fetchNearbyPlaces",
  async (arg, thunkAPI) => {
    const explore = thunkAPI.getState().place;
    const { lat, lng, distance, cityId, popular } = arg;
    const category =
      arg.category !== undefined ? arg.category : explore.activeCategory;
    const q = arg.q !== undefined ? arg.q : explore.searchQuery;
    const relaxCity =
      arg.relaxCity !== undefined
        ? Boolean(arg.relaxCity)
        : Boolean(explore.nearbyExpandedBeyondCity);

    try {
      const query = new URLSearchParams();
      query.set("lat", String(lat));
      query.set("lng", String(lng));
      query.set("distance", String(distance)); // KM
      if (cityId) query.set("cityId", String(cityId));
      if (relaxCity) query.set("relaxCity", "true");
      const cat = String(category || "").trim();
      if (cat) query.set("category", cat);
      const search = String(q || "").trim();
      if (search) query.set("q", search);
      if (popular === true) query.set("popular", "true");

      const res = await apiClient.get(`/api/places/nearby?${query.toString()}`);
      const body = res?.data ?? res;
      const list = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
          ? body.data
          : [];
      return { places: list, relaxCity };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch nearby places",
      );
    }
  },
);

/* -------- Explore: distinct place categories for a city (DB strings for filter chips) -------- */
export const fetchPlaceCategoriesByCity = createAsyncThunk(
  "place/fetchPlaceCategoriesByCity",
  async (cityId, thunkAPI) => {
    if (!cityId) {
      return thunkAPI.rejectWithValue("cityId is required");
    }
    try {
      const res = await apiClient.get(
        `/api/places/categories?cityId=${encodeURIComponent(String(cityId))}`,
      );
      const body = res?.data ?? res;
      const list = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
          ? body.data
          : [];
      return list;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Failed to load categories",
      );
    }
  },
);

/* -------- Explore: get single place -------- */
export const getPlaceById = createAsyncThunk(
  "place/getPlaceById",
  async (placeId, thunkAPI) => {
    try {
      const response = await apiClient.get(`/api/places/${placeId}`);
      return response?.data ?? response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch place",
      );
    }
  },
);

/* -------- Create Place -------- */
export const createPlace = createAsyncThunk(
  "place/createPlace",
  async (data, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");

      const response = await apiClient.post("/api/admin/place", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.data; // ✅ important
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Place creation failed",
      );
    }
  },
);

/* -------- get pending places -------- */
export const getPendingPlaces = createAsyncThunk(
  "place/getPendingPlaces",
  async (_, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");

      const response = await apiClient.get("/api/admin/places/pending", {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch cities",
      );
    }
  },
);

/* -------- approve Place -------- */
export const approvePlaceById = createAsyncThunk(
  "place/approvePleace",
  async (placeId, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.patch(
        `/api/admin/place/${placeId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        },
      );

      return { placeId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "City approval failed",
      );
    }
  },
);

/* -------- rejected Place -------- */
export const rejectePlaceById = createAsyncThunk(
  "place/rejectPlace",
  async (placeId, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.patch(
        `/api/admin/place/${placeId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        },
      );
      return { placeId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "City rejection failed",
      );
    }
  },
);

/* -------- Inactive Place -------- */
export const inactivePlace = createAsyncThunk(
  "city/inactivePlace",
  async (placeId, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.patch(
        `/api/admin/place/${placeId}/inactive`,
        {},
        {
          headers: { Authorization: `Bearer ${superAdminToken}` },
        },
      );
      return { placeId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Place Inactive failed",
      );
    }
  },
);

/* -------- get Place cityWise -------- */
export const getPlacesCityWise = createAsyncThunk(
  "place/getPlacesCityWise",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");

      const response = await apiClient.get("/api/place/city-wise", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch places",
      );
    }
  },
);

/* -------- get Active Place cityWise -------- */
export const getActivePlacesCityWise = createAsyncThunk(
  "place/getActivePlacesCityWise",
  async (_, thunkAPI) => {
    try {
      const res = await apiClient.get("/api/place/city-wise");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  },
);

/* -------- get Inactive Place cityWise -------- */
export const getInactivePlacesCityWise = createAsyncThunk(
  "place/getInactivePlacesCityWise",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");

      const res = await apiClient.get("/api/place/inactive/city-wise", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch inactive places",
      );
    }
  },
);

/* ------ delete Place ------- */
export const deletePlace = createAsyncThunk(
  "city/deletePlace",
  async (id, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.delete(`/api/place/deleteplace/${id}`, {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
        },
      });
      console.log("RESPONSE: ", response);
      return { id, ...response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "place delete failde",
      );
    }
  },
);

/* ------ update place ------- */
export const updatePlace = createAsyncThunk(
  "city/updatePlace",
  async ({ id, data }, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.put(`/api/admin/place/${id}`, data, {
        headers: {
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data; // updated city
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "place update failed",
      );
    }
  },
);

/* ------ generateTravelPlan ------- */
export const generatePlan = createAsyncThunk(
  "place/generatePlan",
  async (data, thunkAPI) => {
    try {
      const body = await apiClient.post("/api/place/generate-plan", data);
      const plan = normalizeAiPlan(body);
      if (!plan.length) {
        return thunkAPI.rejectWithValue(
          "No itinerary was returned. Try another city or budget.",
        );
      }
      return plan;
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Failed to generate plan";
      return thunkAPI.rejectWithValue(
        typeof msg === "string" ? msg : "Failed to generate plan",
      );
    }
  },
);

const placeSlice = createSlice({
  name: "place",
  initialState,
  reducers: {
    // --- Explore reducers ---
    setUsingNearby: (state, action) => {
      state.usingNearby = Boolean(action.payload);
    },
    setDistanceRadius: (state, action) => {
      state.distanceRadius = Number(action.payload);
    },
    setSelectedCity: (state, action) => {
      state.selectedCity = action.payload;
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    clearNearby: (state) => {
      state.nearbyPlaces = [];
      state.usingNearby = false;
      state.errorNearby = null;
      state.loadingNearby = false;
      state.userLocation = null;
      state.nearbyExpandedBeyondCity = false;
    },

    // save AI plan and history
    setAiPlan: (state, action) => {
      const plan = normalizeAiPlan(action.payload);
      state.aiPlan = plan;
      let history = JSON.parse(localStorage.getItem("planHistory")) || [];
      history.unshift({ id: Date.now(), plan });
      history = history.slice(0, 10);
      localStorage.setItem("planHistory", JSON.stringify(history));
      state.planHistory = history;
      localStorage.setItem("lastAiPlan", JSON.stringify(plan));
    },

    loadPlanHistory: (state) => {
      const history = JSON.parse(localStorage.getItem("planHistory")) || [];
      state.planHistory = history;
    },

    loadAiPlan: (state, action) => {
      state.aiPlan = normalizeAiPlan(action.payload);
    },

    clearAiError: (state) => {
      state.aiError = null;
    },
  },

  extraReducers: (builder) => {
    // --- Explore: category list for filters ---
    builder
      .addCase(fetchPlaceCategoriesByCity.pending, (state) => {
        state.loadingPlaceCategories = true;
        state.errorPlaceCategories = null;
        state.placeFilterCategories = [];
      })
      .addCase(fetchPlaceCategoriesByCity.fulfilled, (state, action) => {
        state.loadingPlaceCategories = false;
        state.placeFilterCategories = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchPlaceCategoriesByCity.rejected, (state, action) => {
        state.loadingPlaceCategories = false;
        state.errorPlaceCategories = action.payload;
        state.placeFilterCategories = [];
      });

    // --- Explore: fetch places by city ---
    builder
      .addCase(fetchPlacesByCity.pending, (state) => {
        state.loadingPlaces = true;
        state.errorPlaces = null;
      })
      .addCase(fetchPlacesByCity.fulfilled, (state, action) => {
        console.log("REDUCER HIT:", action.payload);
        state.loadingPlaces = false;
        state.places = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchPlacesByCity.rejected, (state, action) => {
        console.log("REDUCER HIT:", action.payload);
        state.loadingPlaces = false;
        state.errorPlaces = action.payload;
      });

    // --- Explore: fetch nearby places ---
    builder
      .addCase(fetchNearbyPlaces.pending, (state) => {
        state.loadingNearby = true;
        state.errorNearby = null;
      })
      .addCase(fetchNearbyPlaces.fulfilled, (state, action) => {
        state.loadingNearby = false;
        const p = action.payload;
        if (p && typeof p === "object" && "places" in p) {
          state.nearbyPlaces = Array.isArray(p.places) ? p.places : [];
          state.nearbyExpandedBeyondCity = Boolean(p.relaxCity);
        } else {
          state.nearbyPlaces = Array.isArray(p)
            ? p
            : Array.isArray(p?.data)
              ? p.data
              : [];
        }
      })
      .addCase(fetchNearbyPlaces.rejected, (state, action) => {
        state.loadingNearby = false;
        state.errorNearby = action.payload;
        state.nearbyPlaces = [];
        state.usingNearby = false;
        state.nearbyExpandedBeyondCity = false;
        state.userLocation = null;
      });

    // --- Explore: get place by id ---
    builder
      .addCase(getPlaceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlaceById.fulfilled, (state, action) => {
        state.loading = false;
        state.place = action.payload?.data || null;
      })
      .addCase(getPlaceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- Create Place -------- */
    builder
      .addCase(createPlace.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(createPlace.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // add new place in list
        state.places.push(action.payload);
      })

      .addCase(createPlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    /* -------- get pending places -------- */
    builder.addCase(getPendingPlaces.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(getPendingPlaces.fulfilled, (state, action) => {
      state.loading = false;
      state.places = action.payload;
    });

    builder.addCase(getPendingPlaces.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    /* -------- approve Place -------- */
    builder
      .addCase(approvePlaceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(approvePlaceById.fulfilled, (state, action) => {
        state.loading = false;
        const place = state.places.find(
          (p) => p._id === action.payload.placeId,
        );
        if (place) place.status = "active";
      })

      .addCase(approvePlaceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- rejected Place -------- */
    builder
      .addCase(rejectePlaceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectePlaceById.fulfilled, (state, action) => {
        state.loading = false;
        const place = state.places.find(
          (p) => p._id === action.payload.placeId,
        );
        if (place) place.status = "rejected";
      })
      .addCase(rejectePlaceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- get Place cityWise -------- */
    builder
      .addCase(getPlacesCityWise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlacesCityWise.fulfilled, (state, action) => {
        state.loading = false;
        state.cityWisePlaces = action.payload;
      })
      .addCase(getPlacesCityWise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- get Active Place cityWise -------- */
    builder
      .addCase(getActivePlacesCityWise.pending, (state) => {
        state.loading = true;
      })
      .addCase(getActivePlacesCityWise.fulfilled, (state, action) => {
        state.loading = false;
        state.cityWisePlaces = action.payload;
      })
      .addCase(getActivePlacesCityWise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- Inactive Place -------- */
    builder
      .addCase(inactivePlace.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(inactivePlace.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const place = state.places.find(
          (p) => p._id === action.payload.placeId,
        );
        if (place) place.status = "inactive";
      })
      .addCase(inactivePlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    /* -------- get Inactive Place cityWise -------- */
    builder
      .addCase(getInactivePlacesCityWise.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInactivePlacesCityWise.fulfilled, (state, action) => {
        state.loading = false;
        state.inactiveCityWisePlaces = action.payload;
      })
      .addCase(getInactivePlacesCityWise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------ delete city ------- */
    builder
      .addCase(deletePlace.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePlace.fulfilled, (state, action) => {
        state.loading = false;

        const place = state.places.find((p) => p._id === action.payload.id);

        if (place) {
          place.status = "inactive"; // ⭐ IMPORTANT
        }
      })
      .addCase(deletePlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* ------ update city ------- */
    builder
      .addCase(updatePlace.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updatePlace.fulfilled, (state, action) => {
        state.loading = false;
        state.place = action.payload;
        state.success = true;
      })
      .addCase(updatePlace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    /* ------ generateTravelPlan ------- */
    builder
      .addCase(generatePlan.pending, (state) => {
        state.aiLoading = true;
        state.aiError = null;
        state.aiPlan = [];
      })

      .addCase(generatePlan.fulfilled, (state, action) => {
        state.aiLoading = false;
        const plan = normalizeAiPlan(action.payload);
        state.aiPlan = plan;

        let history = JSON.parse(localStorage.getItem("planHistory")) || [];
        history.unshift({ id: Date.now(), plan });
        history = history.slice(0, 10);
        localStorage.setItem("planHistory", JSON.stringify(history));
        state.planHistory = history;
        localStorage.setItem("lastAiPlan", JSON.stringify(plan));
      })

      .addCase(generatePlan.rejected, (state, action) => {
        state.aiLoading = false;
        state.aiError = action.payload;
      });
  },
});

export const {
  setUsingNearby,
  setDistanceRadius,
  setSelectedCity,
  setUserLocation,
  setActiveCategory,
  setSearchQuery,
  setSortBy,
  clearNearby,
  setAiPlan,
  loadPlanHistory,
  loadAiPlan,
  clearAiError,
} = placeSlice.actions;

// --- Explore selectors (used by Place components) ---
export const selectPlaces = (state) => state.place.places;
export const selectNearbyPlaces = (state) => state.place.nearbyPlaces;
export const selectUsingNearby = (state) => state.place.usingNearby;
export const selectDistanceRadius = (state) => state.place.distanceRadius;
export const selectSelectedCity = (state) => state.place.selectedCity;
export const selectUserLocation = (state) => state.place.userLocation;
export const selectActiveCategory = (state) => state.place.activeCategory;
export const selectSearchQuery = (state) => state.place.searchQuery;
export const selectSortBy = (state) => state.place.sortBy;
export const selectPlacesLoading = (state) => state.place.loadingPlaces;
export const selectNearbyLoading = (state) => state.place.loadingNearby;
export const selectPlacesError = (state) => state.place.errorPlaces;
export const selectNearbyError = (state) => state.place.errorNearby;
export const selectNearbyExpandedBeyondCity = (state) =>
  state.place.nearbyExpandedBeyondCity;
export const selectPagination = (state) => state.place.pagination;

export const selectPlaceFilterCategories = (state) =>
  state.place.placeFilterCategories;
export const selectLoadingPlaceCategories = (state) =>
  state.place.loadingPlaceCategories;

export default placeSlice.reducer;
