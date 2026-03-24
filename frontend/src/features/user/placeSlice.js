import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

const initialState = {
  places: [],
  cityWisePlaces: [],
  inactiveCityWisePlaces: [],
  place: null,
  loading: false,
  error: null,
  success: false,

//  AI STATE
  aiPlan: [],
  planHistory: [],
  aiLoading: false,
  aiError: null,
};

/* -------- Create Place -------- */
export const createPlace = createAsyncThunk(
  "place/createPlace",
  async (data, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");

      const response = await apiClient.post("/api/place/create-place", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.data; // ✅ important
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Place creation failed"
      );
    }
  }
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
        error.response?.data?.message || "Failed to fetch cities"
      );
    }
  }
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
        }
      );

      return { placeId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "City approval failed"
      );
    }
  }
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
        }
      );
      return { placeId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Place Inactive failed"
      );
    }
  }
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
        error.response?.data?.message || "Failed to fetch places"
      );
    }
  }
);

/* -------- get Active Place cityWise -------- */
export const getActivePlacesCityWise = createAsyncThunk(
  "place/getActivePlacesCityWise",
  async (_, thunkAPI) => {
    try {
      const res = await apiClient.get("/api/place/activePlace/city-wise");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed");
    }
  }
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
        error.response?.data?.message || "Failed to fetch inactive places"
      );
    }
  }
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
        error.response?.data?.message || "place delete failde"
      );
    }
  }
);

/* -------- get place ById -------- */
export const getPlaceById = createAsyncThunk(
  "city/getPlaceById",
  async (placeId, thunkAPI) => {
    try {
      const response = await apiClient.get(`/api/place/getplace/${placeId}`);
      return response.data; // return city
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Place rejection failed"
      );
    }
  }
);

/* ------ update place ------- */
export const updatePlace = createAsyncThunk(
  "city/updatePlace",
  async ({ id, data }, thunkAPI) => {
    try {
      const superAdminToken = localStorage.getItem("superAdminToken");
      const response = await apiClient.put(`/api/place/updatePlace/${id}`, data, {
        headers: { 
          Authorization: `Bearer ${superAdminToken}`,
          "Content-Type": "multipart/form-data" 
        },
      });
      return response.data; // updated city
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "place update failed"
      );
    }
  }
);

/* ------ generateTravelPlan ------- */
export const generatePlan = createAsyncThunk(
  "place/generatePlan",
  async (data, thunkAPI) => {
    try {
      const response = await apiClient.post("/api/place/generate-plan", data); 
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);


const placeSlice = createSlice({
  name: "place",
  initialState,
  reducers: {
        // save AI plan and history
        setAiPlan: (state, action) => {
          state.aiPlan = action.payload;
          // save in localStorage
          let history = JSON.parse(localStorage.getItem("planHistory")) || [];
          history.unshift({ id: Date.now(), plan: action.payload });
          history = history.slice(0, 10); // keep last 10
          localStorage.setItem("planHistory", JSON.stringify(history));
          state.planHistory = history;
          localStorage.setItem("lastAiPlan", JSON.stringify(action.payload));
        },
    
        // load history from localStorage
        loadPlanHistory: (state) => {
          const history = JSON.parse(localStorage.getItem("planHistory")) || [];
          state.planHistory = history;
        },
    
        // load a plan into aiPlan
        loadAiPlan: (state, action) => {
          state.aiPlan = action.payload;
        },
  },

  extraReducers: (builder) => {
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
          (p) => p._id === action.payload.placeId
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
          (p) => p._id === action.payload.placeId
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
          (p) => p._id === action.payload.placeId
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

    /* ------ getCityById ------- */
    builder
      .addCase(getPlaceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlaceById.fulfilled, (state, action) => {
        state.loading = false;
        state.place = action.payload;
      })
      .addCase(getPlaceById.rejected, (state, action) => {
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
      state.aiPlan = null;
    })
  
    .addCase(generatePlan.fulfilled, (state, action) => {
      state.aiLoading = false;
      state.aiPlan = action.payload; // ✅ store AI result

       // also save in localStorage using setAiPlan logic
       let history = JSON.parse(localStorage.getItem("planHistory")) || [];
       history.unshift({ id: Date.now(), plan: action.payload });
       history = history.slice(0, 10);
       localStorage.setItem("planHistory", JSON.stringify(history));
       state.planHistory = history;
       localStorage.setItem("lastAiPlan", JSON.stringify(action.payload));
    })
  
    .addCase(generatePlan.rejected, (state, action) => {
      state.aiLoading = false;
      state.aiError = action.payload;
    }); 
       
  },
});

export const { setAiPlan, loadPlanHistory, loadAiPlan } = placeSlice.actions;
export default placeSlice.reducer;
