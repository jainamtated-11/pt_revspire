import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchRoles } from "./roleApi";

const initialState = {
  roles: [],
  selectedRoles: [],
  loading: true,
  search: false,
  searchRoles: [],
};

export const fetchRolesAsync = createAsyncThunk(
  "roles/fetchRoles",
  async (data) => {
    const response = await fetchRoles(data);
    return response.data;
  }
);

const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRoles = [];
    },
    SelectRole: (state, action) => {
      state.selectedRoles.push(action.payload);
    },
    UnselectRole: (state, action) => {
      state.selectedRoles = state.selectedRoles.filter(
        (selectRole) => selectRole.id !== action.payload.id
      );
    },
    UnselectAllRole: (state) => {
      state.selectedRoles = [];
    },
    SelectAllRole: (state, action) => {
      state.selectedRoles = action.payload;
    },
    SetSearch: (state, action) => {
      state.search = true;
      state.searchRoles = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRolesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.data;
      })
  },
});

export const {
  clearSelectedRole,
  SelectRole,
  UnselectRole,
  UnselectAllRole,
  SelectAllRole,
  SetSearch,
} = roleSlice.actions;
export default roleSlice.reducer; 