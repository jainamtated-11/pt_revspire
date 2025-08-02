import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchTable: "",
  searchValue: "",
  searchApplied: false,
  searchData: [],
  initialData: [],
  searchFields: [],
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    SetSearchTable: (state, action) => {
      state.searchTable = action.payload;
    },
    SetSearchApplied: (state, action) => {
      state.searchApplied = action.payload;
    },
    SetSearchValue: (state, action) => {
      state.searchValue = action.payload;
    },
    SetSearchData: (state, action) => {
      state.searchData = action.payload;
    },
    SetInitialData: (state, action) => {
      state.initialData = action.payload;
    },
    SetSearchFields: (state, action) => {
      state.searchFields = action.payload;
    },
    SearchCleaner: (state) => {
      state.searchApplied = false;
    },
  },
});

export const {
  SetSearchTable,
  SetSearchApplied,
  SetSearchData,
  SetSearchFields,
  SetInitialData,
  SetSearchValue,
  SearchCleaner,
} = searchSlice.actions;

export default searchSlice.reducer;
