import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  breadcrumbs: [{ id: "", name: "Home" }],
};

const breadcrumbsSlice = createSlice({
  name: "breadcrumbs",
  initialState,
  reducers:{
    // navigateToFolder:
  }
});

export default breadcrumbsSlice.reducer;
