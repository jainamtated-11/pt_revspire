import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchTags, fetchFilterTags } from "./tagApi";

export const fetchTagsAsync = createAsyncThunk(
  "tags/fetchTags",
  async (data) => {
    const response = await fetchTags(data);
    return response.data.tags;
  }
);

export const fetchFilterTagsAsync = createAsyncThunk(
  "tags/fetchFilterTags",
  async () => {
    const response = await fetchFilterTags();
    return response;
  }
);

const initialState = {
  loading: true,
  tags: [],
  selectedTags: [],
  selectedTagsActiveCount: 0,
  selectedTagsDeactiveCount: 0,
  filterTags: {
    filterApplied: false,
    data: [],
  },
};

const tagSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    SelectTag: (state, action) => {
      state.selectedTags.push(action.payload);
    },
    UnSelectTag: (state, action) => {
      state.selectedTags = state.selectedTags.filter(
        (tag) => tag.id != action.payload.id
      );
    },
    SelectAll: (state, action) => {
      state.selectedTags = action.payload;
    },
    UnSelectAll: (state) => {
      state.selectedTags = [];
    },
    ActiveTagsCount: (state, action) => {
      state.selectedTagsActiveCount = action.payload;
    },
    DeactiveTagsCount: (state, action) => {
      state.selectedTagsDeactiveCount = action.payload;
    },
    SearchTags: (state, action) => {
      state.tags = action.payload;
    },
    SortTagsData: (state, action) => {
      state.tags = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTagsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTagsAsync.fulfilled, (state, action) => {
        state.tags = action.payload;
        state.loading = false;
      })
      .addCase(fetchFilterTagsAsync.fulfilled, (state, action) => {
        state.filterTags = action.payload;
      });
  },
});

export const {
  SelectTag,
  UnSelectTag,
  SelectAll,
  UnSelectAll,
  ActiveTagsCount,
  DeactiveTagsCount,
  SearchTags,
  SortTagsData,
} = tagSlice.actions;

export default tagSlice.reducer;