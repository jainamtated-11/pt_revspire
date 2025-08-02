import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchGroups } from "./groupApi";


const initialState = {
  loading: true,
  groups: [],
  selectedGroups: [],
};


export const fetchGroupsAsync = createAsyncThunk(
  "groups/fetchGroups",
  async (data) => {
    const response = await fetchGroups(data);
    return response.data.groups;
  }
);

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    SelectGroup: (state, action) => {
      state.selectedGroups = [...state.selectedGroups, action.payload];
    },
    UnselectGroup: (state, action) => {
      state.selectedGroups = state.selectedGroups.filter(
        (selectGroup) => selectGroup.id != action.payload.id
      );
    },
    SelectAllGroup: (state, action) => {
      state.selectedGroups = action.payload;
    },
    UnselectAllGroup: (state) => {
      state.selectedGroups = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupsAsync.fulfilled, (state, action) => {
        state.groups = action.payload;
        state.loading = false;
      })
      .addCase(fetchGroupsAsync.pending, (state, action) => {
        state.loading = true;
      });
  },
});

export const {
  SelectGroup,
  UnselectGroup,
  SelectAllGroup,
  UnselectAllGroup,
} = groupSlice.actions;

export default groupSlice.reducer;
