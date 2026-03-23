import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../pages/services/apiClient";

const initialState = {
  rooms: [],
  loading: false,
  error: null,
  createSuccess: false,
  room: null,
};

/* -------- Create room -------- */
export const createRoom = createAsyncThunk(
  "room/createRoom",
  async (data, thunkAPI) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await apiClient.post("/api/room/create-room", data, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Create room failed"
      );
    }
  }
);

/* -------- getAllRoomsByID -------- */
export const getAllRoomsByID = createAsyncThunk(
  "room/getAllRoomsBYID",
  async (hotelId, thunkAPI) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await apiClient.get(`/api/room/admin/rooms/${hotelId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      return response.data; // important
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch rooms"
      );
    }
  }
);

/* -------- get Single room room -------- */
export const getSingleRoom = createAsyncThunk(
  "room/getSingleRoom",
  async (roomId, thunkAPI) => {
    try {
      if (!roomId) throw new Error("roomId is required"); // safety check
      const adminToken = localStorage.getItem("adminToken");
      const response = await apiClient.get(`/api/room/single-room/${roomId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      return response.data; // { success, data }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/* -------- update room -------- */
export const updateRoom = createAsyncThunk(
  "room/updateRoom",
  async ({ roomId, formData }, thunkAPI) => {
    try {
      const adminToken = localStorage.getItem("adminToken");

      const response = await apiClient.put(
        `/api/room/update-room/${roomId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Update failed"
      );
    }
  }
);

/* -------- active room -------- */
export const activeRoomAction = createAsyncThunk(
  "room/activeRoom",
  async (roomId, thunkAPI) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await apiClient.patch(
        `/api/room/active-room/${roomId}`,
        {},
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to inactivate room"
      );
    }
  }
);

/* -------- Inactive room -------- */
export const inactiveRoomAction = createAsyncThunk(
  "room/inactiveRoom",
  async (roomId, thunkAPI) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await apiClient.patch(
        `/api/room/inactive-room/${roomId}`,
        {},
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to inactivate room"
      );
    }
  }
);

export const getPublicRooms = createAsyncThunk(
  "room/getPublicRooms",
  async (hotelId, thunkAPI) => {
    try {
      const response = await apiClient.get(`/api/room/public/${hotelId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch rooms"
      );
    }
  }
);

const roomSlice = createSlice({
  name: "room",
  initialState: {
    publicRooms: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    /* -------- Create room -------- */
    builder
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = true;
        state.rooms.push(action.payload.data);
      })

      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- getAllRoomsByID -------- */
    builder
      .addCase(getAllRoomsByID.pending, (state) => {
        state.loading = true;
      })

      .addCase(getAllRoomsByID.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })

      .addCase(getAllRoomsByID.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- update room -------- */
    builder
      .addCase(updateRoom.pending, (state) => {
        state.loading = true;
      })

      .addCase(updateRoom.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.rooms.findIndex(
          (r) => r._id === action.payload._id
        );

        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
      })

      .addCase(updateRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* -------- get Single room room -------- */
    builder
    .addCase(getSingleRoom.pending, (state) => {
      state.loading = true;
    })
    .addCase(getSingleRoom.fulfilled, (state, action) => {
      state.loading = false;
      state.room = action.payload; 
    })
    .addCase(getSingleRoom.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

  /* -------- active room -------- */
  builder
  .addCase(activeRoomAction.pending, (state) => {
    state.loading = true;
  })
  .addCase(activeRoomAction.fulfilled, (state, action) => {
    state.loading = false;
    const room = action.payload;
     console.log(room);
    if (!room) return; // prevent crash

    const index = state.rooms.findIndex(r => r._id === room._id);
    if (index !== -1) {
      state.rooms[index] = room;
    }
  })
  builder
  .addCase(activeRoomAction.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload || "Failed to activate room";
  });

  /* -------- Inactive room -------- */
  builder
  .addCase(inactiveRoomAction.pending, (state) => {
    state.loading = true;
  })
  .addCase(inactiveRoomAction.fulfilled, (state, action) => {
    state.loading = false;
    const room = action.payload;
    if (!room) return; // prevent crash

    const index = state.rooms.findIndex(r => r._id === room._id);
    if (index !== -1) {
      state.rooms[index] = room;
    }
  })
  builder
  .addCase(inactiveRoomAction.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload || "Failed to inactivate room";
  });
  
  //----------------- getPublicRooms -----------
  builder
      .addCase(getPublicRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicRooms.fulfilled, (state, action) => {
        state.loading = false;

        state.publicRooms = action.payload ?? [];

        state.publicRooms = action.payload.data ?? [];

      })
      .addCase(getPublicRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  
  },
});

export default roomSlice.reducer;
