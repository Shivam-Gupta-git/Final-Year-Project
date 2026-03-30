import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

// ADMIN - CREATE RESTAURANT
export const createRestaurant = createAsyncThunk(
  "restaurant/create",
  async (data, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.post(
        "/api/resturant/create-restaurent",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ADMIN - GET ACTIVE ADMIN'S RESTAURANT
export const getAllActiveRestaurant = createAsyncThunk(
  "restaurant/getAllActiveRestaurant",
  async (_, thunkAPI) => {
    try {
      const response = await apiClient.get("/api/resturant/activeRestaurant");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch active cities"
      );
    }
  }
);

// ADMIN - INACTIVE RESTAURANT BY ADMIN
export const inactiveRestaurantByAdmin = createAsyncThunk(
  "restaurant/inactiveRestaurant",
  async (restaurantId, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.patch(
        `/api/resturant/${restaurantId}/inactiveByAdmin`,
        {}, // 👈 empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return { restaurantId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Restaurant inactive failed"
      );
    }
  }
);

// ADMIN  - GET RESTAURANT STATUS
export const getRestaurantStatus = createAsyncThunk(
  "restaurant/getRestaurantStatus",
  async (status, thunkAPI) => {
    console.log("status:", status);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.get(
        `/api/resturant/get-restaurant-status?status=${status}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to inactive hotel"
      );
    }
  }
);

// ADMIN || SUPERADMIN - GET RESTAURANT BYID
export const getRestaurantById = createAsyncThunk(
  "restaurant/getRestaurantById",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiClient.get(
        `/api/resturant/getresturant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log("API RESPONSE:", response.data);
      return response.data; // IMPORTANT
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch restaurant"
      );
    }
  }
);

// USER — public restaurant detail (no auth)
export const getRestaurantByIdPublic = createAsyncThunk(
  "restaurant/getRestaurantByIdPublic",
  async (id, thunkAPI) => {
    try {
      const response = await apiClient.get(`/api/resturant/getresturant/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch restaurant"
      );
    }
  }
);

// ADMIN - UPDATE RESTAURANT
export const updateRestaurant = createAsyncThunk(
  "restaurant/updateRestaurant",
  async ({ id, data }, thunkAPI) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await apiClient.put(
        `/api/resturant/updateresturant/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log("UPDATE RESPONSE:", response.data);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "restaurant update failed"
      );
    }
  }
);

// SUPERADMIN - GET ALL PENDING RESTAURANT
export const getPendingRestaurant = createAsyncThunk(
  "restaurant/getPendingRestaurant",
  async ({ page = 1, limit = 10, city = "" }, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");
      let url = `/api/admin/restaurant/pending?page=${page}&limit=${limit}`;

      if (city) {
        url += `&city=${city}`;
      }

      const response = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
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

// SUPERADMIN - APPROVE RESTAURANT
export const approveRestaurantById = createAsyncThunk(
  "restaurant/approveRestaurant",
  async (restaurantId, thunkAPI) => {
    console.log(restaurantId);
    try {
      const token = localStorage.getItem("superAdminToken");
      const response = await apiClient.patch(
        `/api/admin/resturant/${restaurantId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return { restaurantId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "restaurant approval failed"
      );
    }
  }
);

// SUPERADMIN - REJECT RESTAURANT
export const rejecteRestaurantById = createAsyncThunk(
  "restaurant/rejectRestaurant",
  async (restaurantId, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");
      const response = await apiClient.patch(
        `/api/admin/resturant/${restaurantId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { restaurantId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "restaurant rejection failed"
      );
    }
  }
);

// SUPERADMIN - GET ALL RESTAURANT CITY WISE
export const getRestaurantCityWise = createAsyncThunk(
  "restaurant/getCityWise",
  async ({ city = "", page = 1, limit = 10 }, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");

      let url = `/api/resturant/restaurant-cityWise?page=${page}&limit=${limit}`;

      if (city) {
        url += `&city=${city}`;
      }

      const response = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch restaurants"
      );
    }
  }
);

// SUPERADMIN - GET ALL ACTIVE RESTAURANT CITY WISE
export const getActiveRestaurantCityWise = createAsyncThunk(
  "restaurant/getCityWise",
  async ({ city = "", page = 1, limit = 10 }, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");

      let url = `/api/resturant/active-restaurant-cityWise?page=${page}&limit=${limit}`;

      if (city) {
        url += `&city=${city}`;
      }

      const response = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch restaurants"
      );
    }
  }
);

// SUPERADMIN - INACTIVE RESTAURANT 
export const inactiveRestaurant = createAsyncThunk(
  "restaurant/inactiveRestaurant",
  async (restaurantId, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");
      const response = await apiClient.patch(
        `/api/admin/restaurant/${restaurantId}/inactive`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { restaurantId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Place Inactive failed"
      );
    }
  }
);

// SUPERADMIN - GET ALL INACTIVE RESTAURANT CITY WISE
export const getInactiveRestaurantCityWise = createAsyncThunk(
  "restaurant/getInactiveRestaurantCityWise",
  async ({ city = "", page = 1, limit = 10 }, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");

      let url = `/api/resturant/inactive-restaurant-cityWise?page=${page}&limit=${limit}`;

      if (city) {
        url += `&city=${city}`;
      }

      const res = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch inactive restaurant"
      );
    }
  }
);

// SUPERADMIN - GET ALL REJECTED RESTAURANT CITY WISE
export const getAllRejectedRestaurantCityWise = createAsyncThunk(
  "restaurant/getRejectedRestaurantCityWise",
  async ({ city = "", page = 1, limit = 10 }, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");

      let url = `/api/resturant/rejected-restaurant-cityWise?page=${page}&limit=${limit}`;

      if (city) {
        url += `&city=${city}`;
      }

      const res = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch inactive restaurant"
      );
    }
  }
);

// SUPERADMIN - DELETE RESTAURANT
export const deleteRestaurant = createAsyncThunk(
  "restaurant/deleteRestaurant",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");
      const response = await apiClient.delete(`/api/resturant/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("RESPONSE: ", response);
      return { id, ...response.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "restaurant delete failde",
      );
    }
  },
);

// SUPERADMIN - GET ACTIVE RESTAURANT FOR A SPECIFIC ADMIN
export const getAdminRestaurant = createAsyncThunk(
  "restaurant/getAdminRestaurant",
  async (adminId, thunkAPI) => {
    try {
      const token = localStorage.getItem("superAdminToken");

      const response = await apiClient.get(
        `/api/resturant/admin/${adminId}/restaurant`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data; // returns restaurant array
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch restaurant",
      );
    }
  },
);

// USER - GET ALL ACTIVE RESTAURANT FOR USER
export const getAllRestaurantsForUser = createAsyncThunk(
  "restaurant/getAllForUser",
  async (params, thunkAPI) => {
    try {
      const query = new URLSearchParams(params).toString();
      console.log("Params",params);

      const res = await apiClient.get(`/api/resturant/restaurants?${query}`);

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// GET NEARBY RESTAURANTS
export const getNearbyRestaurants = createAsyncThunk(
  "restaurant/getNearby",
  async ({ lat, lng } = {}, thunkAPI) => {
    try {
      const qs =
        lat != null && lng != null
          ? `?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
          : "";
      const res = await apiClient.get(`/api/resturant/nearby${qs}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState: {
    restaurants: [],
    nearbyRestaurants: [],
    inactiveCityWiseRestaurant: [],
    restaurant: null,
    restaurantDetailLoading: false,
    loading: false,
    error: null,
    createSuccess: false,
    success: false,
    page: 1,
    totalPages: 1,
    total: 0,
  },

  reducers: {},

  extraReducers: (builder) => {
    /* -------- CREATE RESTAURANT ------- */
    builder
      .addCase(createRestaurant.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants.push(action.payload);
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- GET ALL ACTIVE RESTAURANT ------- */
    builder
      .addCase(getAllActiveRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllActiveRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
      })
      .addCase(getAllActiveRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ADMIN - INACTIVE RESTAURANT BY ADMIN
    builder
      .addCase(inactiveRestaurantByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(inactiveRestaurantByAdmin.fulfilled, (state, action) => {
        state.success = true;
        state.restaurants = state.restaurants.filter(
          (r) => r._id !== action.payload.restaurantId
        );
      })
      .addCase(inactiveRestaurantByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // ADMIN  - GET RESTAURANT STATUS
    builder
      .addCase(getRestaurantStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getRestaurantStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload; // restaurants array
      })

      .addCase(getRestaurantStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ADMIN || SUPERADMIN - GET RESTAURANT BYID
    builder
      .addCase(getRestaurantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getRestaurantById.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurant = action.payload;
      })

      .addCase(getRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // USER — public restaurant detail
    builder
      .addCase(getRestaurantByIdPublic.pending, (state) => {
        state.restaurantDetailLoading = true;
        state.error = null;
      })
      .addCase(getRestaurantByIdPublic.fulfilled, (state, action) => {
        state.restaurantDetailLoading = false;
        const p = action.payload;
        state.restaurant = p?.data ?? p ?? null;
      })
      .addCase(getRestaurantByIdPublic.rejected, (state, action) => {
        state.restaurantDetailLoading = false;
        state.error = action.payload;
        state.restaurant = null;
      });

    // ADMIN - UPDATE RESTAURANT
    builder
      .addCase(updateRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        // console.log("FULL PAYLOAD:", action.payload);
        state.loading = false;
        state.success = true;

        const updaterestaurant = action.payload?.data || action.payload;
        if (!updaterestaurant || !updaterestaurant._id) {
          console.error("Updated hotel invalid:", updatedHotel);
          return;
        }

        const index = state.restaurants.findIndex(
          (r) => r._id === updaterestaurant._id
        );

        if (index !== -1) {
          state.restaurants[index] = updaterestaurant;
        }

        state.restaurant = updaterestaurant; // ✅ update current hotel also
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // SUPERADMIN - GET ALL PENDING RESTAURANT
    builder
      .addCase(getPendingRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getPendingRestaurant.fulfilled, (state, action) => {
        state.loading = false;

        state.restaurants = action.payload;

        // ✅ pagination data
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.total = action.payload.total;
      })

      .addCase(getPendingRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // SUPERADMIN - APPROVE RESTAURANT
    builder
      .addCase(approveRestaurantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(approveRestaurantById.fulfilled, (state, action) => {
        state.loading = false;
        const restaurant = state.restaurants.find(
          (r) => r._id === action.payload.restaurantId
        );
        if (restaurant) restaurant.status = "active";
      })

      .addCase(approveRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // SUPERADMIN - REJECT RESTAURANT
    builder
      .addCase(rejecteRestaurantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejecteRestaurantById.fulfilled, (state, action) => {
        state.loading = false;
        const restaurant = state.restaurants.find(
          (r) => r._id === action.payload.restaurantId
        );
        if (restaurant) restaurant.status = "rejected";
      })
      .addCase(rejecteRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // SUPERADMIN - GET ALL RESTAURANT CITY WISE
    builder
      .addCase(getRestaurantCityWise.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getRestaurantCityWise.fulfilled, (state, action) => {
        state.loading = false;

        // ✅ main data
        state.restaurants = action.payload;

        // ✅ pagination
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.total = action.payload.total;
      })

      .addCase(getRestaurantCityWise.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // SUPERADMIN - GET ALL ACTIVE RESTAURANT CITY WISE
    // builder
    //   .addCase(getActiveRestaurantCityWise.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })

    //   .addCase(getActiveRestaurantCityWise.fulfilled, (state, action) => {
    //     state.loading = false;

    //     // ✅ main data
    //     state.restaurants = action.payload;

    //     // ✅ pagination
    //     state.page = action.payload.page;
    //     state.totalPages = action.payload.totalPages;
    //     state.total = action.payload.total;
    //   })

    //   .addCase(getActiveRestaurantCityWise.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload;
    //   });

  // SUPERADMIN - INACTIVE RESTAURANT 
  // builder
  // .addCase(inactiveRestaurant.pending, (state) => {
  //   state.loading = true;
  //   state.error = null;
  //   state.success = false;
  // })
  // .addCase(inactiveRestaurant.fulfilled, (state, action) => {
  //   state.loading = false;
  //   state.success = true;
  //   const restaurant = state.restaurants.find(
  //     (r) => r._id === action.payload.restaurantId
  //   );
  //   if (restaurant) place.status = "inactive";
  // })
  // .addCase(inactiveRestaurant.rejected, (state, action) => {
  //   state.loading = false;
  //   state.error = action.payload;
  //   state.success = false;
  // }); 

  // SUPERADMIN - GET ALL INACTIVE RESTAURANT CITY WISE
  builder
  .addCase(getInactiveRestaurantCityWise.pending, (state) => {
    state.loading = true;
  })
  .addCase(getInactiveRestaurantCityWise.fulfilled, (state, action) => {
    state.loading = false;
    state.restaurants = action.payload;
  })
  .addCase(getInactiveRestaurantCityWise.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });

  // SUPERADMIN - GET ALL REJECTED RESTAURANT CITY WISE
  builder
  .addCase(getAllRejectedRestaurantCityWise.pending, (state) => {
    state.loading = true;
  })
  .addCase(getAllRejectedRestaurantCityWise.fulfilled, (state, action) => {
    state.loading = false;
    state.restaurants = action.payload;
  })
  .addCase(getAllRejectedRestaurantCityWise.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });

  // SUPERADMIN - DELETE RESTAURANT
  builder
  .addCase(deleteRestaurant.pending, (state) => {
    state.loading = true;
  })
  .addCase(deleteRestaurant.fulfilled, (state, action) => {
    state.loading = false;

    const restaurant = state.restaurants.find((r) => r._id === action.payload.id);

    if (restaurant) {
      restaurant.status = "inactive";
    }
  })
  .addCase(deleteRestaurant.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });

  // SUPERADMIN - GET ACTIVE RESTAURANT FOR A SPECIFIC ADMIN
  builder
  .addCase(getAdminRestaurant.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  .addCase(getAdminRestaurant.fulfilled, (state, action) => {
    state.loading = false;
    state.restaurants = action.payload;
  })
  .addCase(getAdminRestaurant.rejected, (state, action) => {
    state.loading = false;  
    state.error = action.payload;
  });

  // USER - GET ALL ACTIVE RESTAURANT FOR USER
  builder
  .addCase(getAllRestaurantsForUser.pending, (state) => {
    state.loading = true;
  })
  .addCase(getAllRestaurantsForUser.fulfilled, (state, action) => {
    state.loading = false;
    const p = action.payload;
    state.restaurants = Array.isArray(p) ? p : (p?.data ?? []);
  })
  .addCase(getAllRestaurantsForUser.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
    state.restaurants = [];
  });

  // GET NEARBY RESTAURANTS
  builder
  .addCase(getNearbyRestaurants.pending, (state) => {
    state.loading = true;
    state.restaurants = [];
  })
  .addCase(getNearbyRestaurants.fulfilled, (state, action) => {
    state.loading = false;
    const p = action.payload;
    state.restaurants = Array.isArray(p) ? p : (p?.data ?? []);
  })
  .addCase(getNearbyRestaurants.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });

      
  },
});

export default restaurantSlice.reducer;
