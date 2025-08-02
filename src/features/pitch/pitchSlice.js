import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPitches } from "./pitchApi";

const initialState = {
  pitches: [],
  selectedPitches: [],
  loading: true,
  selectedPitchesActiveCount: 0,
  selectedPitchesDeactiveCount: 0,
  sections: [],
  search: false,
  searchPitches: [],
};

export const fetchPitchesAsync = createAsyncThunk(
  "pitches/fetchPitches",
  async (data) => {
    const response = await fetchPitches(data);
    return response.data;
  }
);

const pitchSlice = createSlice({
  name: "pitches",
  initialState,
  reducers: {
    clearSelectedPitch: (state) => {
      state.selectedPitches = [];
      state.selectedPitchesActiveCount = 0;
      state.selectedPitchesDeactiveCount = 0;
    },
    SelectPitch: (state, action) => {
      state.selectedPitches.push(action.payload);
    },
    UnselectPitch: (state, action) => {
      state.selectedPitches = state.selectedPitches.filter(
        (selectPitch) => selectPitch.id !== action.payload.id
      );
    },
    SelectAllPitch: (state, action) => {
      state.selectedPitches = action.payload;
    },
    ActivePitchCount: (state, action) => {
      state.selectedPitchesActiveCount = action.payload;
    },
    DeactivePitchCount: (state, action) => {
      state.selectedPitchesDeactiveCount = action.payload;
    },
    AddSection: (state, action) => {
      state.sections.push(action.payload);
    },
    SortPitchData: (state, action) => {
      state.pitches = action.payload;
    },
    SetSearch: (state, action) => {
      state.search = true;
      state.searchPitches = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPitchesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPitchesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.pitches = action.payload.pitches;
      });
  },
});

export const {
  clearSelectedPitch,
  SelectPitch,
  UnselectPitch,
  ActivePitchCount,
  DeactivePitchCount,
  SelectAllPitch,
  SortPitchData,
} = pitchSlice.actions;
export default pitchSlice.reducer;
