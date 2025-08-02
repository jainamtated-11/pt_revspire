import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPitchStreams } from "./pitchStreamsApi.js";

const initialState = {
  pitchStreams: [],
  selectedPitchStreams: [],
  loading: true,
  selectedPitchStreamsActiveCount: 0,
  selectedPitchStreamsDeactiveCount: 0,
  sections: [],
  search: false,
  searchPitchStreams: [],
};

export const fetchPitchStreamsAsync = createAsyncThunk(
  "pitchStreams/fetchPitchStreams",
  async (data) => {
    const response = await fetchPitchStreams(data);
    return response.data;
  }
);

const pitchStreamsSlice = createSlice({
  name: "pitchStreams",
  initialState,
  reducers: {
    clearSelectedPitchStream: (state) => {
      state.selectedPitchStreams = [];
      state.selectedPitchStreamsActiveCount = 0;
      state.selectedPitchStreamsDeactiveCount = 0;
    },
    SelectPitchStream: (state, action) => {
      state.selectedPitchStreams.push(action.payload);
    },
    UnselectPitchStream: (state, action) => {
      state.selectedPitchStreams = state.selectedPitchStreams.filter(
        (selectPitchStream) => selectPitchStream.id !== action.payload.id
      );
    },
    SelectAllPitchStream: (state, action) => {
      state.selectedPitchStreams = action.payload;
    },
    UnSelectAllPitchStream: (state, action) => {
      state.selectedPitchStreams = [];
    },
    ActivePitchStreamCount: (state, action) => {
      state.selectedPitchStreamsActiveCount = action.payload;
    },
    DeactivePitchStreamCount: (state, action) => {
      state.selectedPitchStreamsDeactiveCount = action.payload;
    },
    AddSection: (state, action) => {
      state.sections.push(action.payload);
    },
    SortPitchStreamData: (state, action) => {
      state.pitchStreams = action.payload;
    },
    SetSearch: (state, action) => {
      state.search = true;
      state.searchPitchStreams = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPitchStreamsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPitchStreamsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.pitchStreams = action.payload.pitches;
      });
  },
});

export const {
  clearSelectedPitchStream,
  SelectPitchStream,
  UnselectPitchStream,
  ActivePitchStreamCount,
  DeactivePitchStreamCount,
  SelectAllPitchStream,
  UnSelectAllPitchStream,
  SortPitchStreamData,
} = pitchStreamsSlice.actions;
export default pitchStreamsSlice.reducer;
