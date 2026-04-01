import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import apiClient from "../../pages/services/apiClient"

// ASSISTANT CHAT
export const assistantChatThunk = createAsyncThunk(
  "assistant/chat",
  async (payload, thunkAPI) => {

    try {
      const token = localStorage.getItem("userToken")
      const response = await apiClient.post("/api/ai/aiChat", payload, {
       headers: {
        Authorization: `Bearer ${token}`
       }
      });
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Something went wrong" }
      );
    }
  }
);

const assistantSlice = createSlice({
  name: "assistant",
  initialState: {
    loading: false,
    messages: [],
    error: null,
  },

  reducers: {
    clearChat: (state) => {
      state.messages = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(assistantChatThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(assistantChatThunk.fulfilled, (state, action) => {
        state.loading = false;

        state.messages.push({
          type: "assistant",
          reply: action.payload.reply,
          data: action.payload.data,
          intent: action.payload.intent,
        });
      })

      .addCase(assistantChatThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed";
      });

  },
});


export default assistantSlice.reducer;