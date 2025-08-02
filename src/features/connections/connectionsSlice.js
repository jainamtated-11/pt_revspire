import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchConnections } from "./connectionsApi";

const initialState = {
  connections: [],
  selectedConnections: [],
  search: false,
  searchConnections: [],
  loading: true,
};

export const fetchConnectionsAsync = createAsyncThunk(
  "connections/fetchConnections",
  async (data) => {
    const response = await fetchConnections(data);
    return response;
  }
);

const connectionsSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    SetSearch: (state, action) => {
      state.search = true;
      state.searchConnections = action.payload;
    },
    ClearSearch: (state) => {
      state.search = false;
      state.searchConnections = [];
    },
    CearchContent: (state, action) => {
      state.searchConnections = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnectionsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConnectionsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.connections = action.payload;
      });
  },
});

export const { setSearch, clearSearch, searchContent } =
  connectionsSlice.actions;

export default connectionsSlice.reducer;
