import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchLayouts } from "./layoutApi";

export const fetchLayoutsAsync = createAsyncThunk(
  "layout/fetchLayouts",
  async (data) => {
    const response = await fetchLayouts(data);
    return response.data.pitchLayoutNames;
  }
);

const initialState = {
  loading: true,
  layouts: [],
  selectedLayouts: [],
  selectedLayoutsActiveCount: 0,
  selectedLayoutsInactiveCount: 0,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    SelectLayout: (state, action) => {
      state.selectedLayouts = action.payload;
    },
    clearSelectedLayout: (state) => {
      state.selectedLayouts = [];
      state.selectedLayoutsActiveCount = 0;
      state.selectedLayoutsInactiveCount = 0;
    },
    UnselectLayout: (state, action) => {
      state.selectedLayouts = state.selectedLayouts.filter(
        (selectLayout) => selectLayout.id != action.payload.id
      );
    },
    SelectAllLayout: (state, action) => {
      state.selectedLayouts = action.payload;
    },
    ActiveLayoutCount: (state, action) => {
      state.selectedLayoutsActiveCount = action.payload;
    },
    InactiveLayoutCount: (state, action) => {
      state.selectedLayoutsInactiveCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLayoutsAsync.fulfilled, (state, action) => {
        state.layouts = action.payload;
        state.loading = false;
      })
      .addCase(fetchLayoutsAsync.pending, (state) => {
        state.loading = true;
      });
  },
});

export const {
  SelectLayout,
  UnselectLayout,
  clearSelectedLayout,
  SelectAllLayout,
  ActiveLayoutCount,
  InactiveLayoutCount,
} = layoutSlice.actions;

export default layoutSlice.reducer;
