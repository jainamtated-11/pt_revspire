import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchThreads } from "./threadApi";

export const fetchThreadsAsync = createAsyncThunk(
  "thread/fetchThreads",
  async (data) => {
    const response = await fetchThreads(data);
    return response.data;
  }
);

const initialState = {
  loading: true,
  threads: [],
  selectedThreads: [],
  selectedThread: null,
};

const threadSlice = createSlice({
  name: "thread",
  initialState,
  reducers: {
    ThreadCleaner: (state, action) => {
      state.threads = [];
      state.selectedThreads = [];
      state.selectedThread = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchThreadsAsync.fulfilled, (state, action) => {
        state.threads = action.payload.pitches;
        state.loading = false;
      })

      .addCase(fetchThreadsAsync.pending, (state, action) => {
        state.loading = true;
      });
  },
});

export const { ThreadCleaner } = threadSlice.actions;

export default threadSlice.reducer;
