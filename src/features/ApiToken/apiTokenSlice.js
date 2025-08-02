import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchApiTokens
} from './apiTokenApi'

export const fetchApiTokensAsync = createAsyncThunk(
  "apiToken/fetchApiTokens",
  async (data) => {
    const response = await fetchApiTokens(data)
    console.log(response.data.tokens)
    return response.data.tokens;
  }
);


const initialState = {
  loading: true,
  apiTokens:[],
  selectedApiToken:[],
};

const apiTokenSlice = createSlice({
  name: "apiToken",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(fetchApiTokensAsync.fulfilled, (state, action) => {
        state.apiTokens = action.payload;
        state.loading = false;
      })
      .addCase(fetchApiTokensAsync.pending, (state, action) => {
        state.loading = true;
      })
  },
});

// export const {

// } = apiTokenSlice.actions;

export default apiTokenSlice.reducer;
