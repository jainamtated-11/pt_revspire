import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchObjects,
  fetchFields,
  fetchConditions,
  fetchValueTypes,
  fetchValues,
  fetchFilterData,
} from "./filterApi";

export const fetchFieldsAsync = createAsyncThunk(
  "filter/fetchFields",
  async (params) => {
    const { axiosInstance, ...requestData } = params;
    const response = await fetchFields(axiosInstance, requestData);
    return response.data;
  }
);

export const fetchAllFilterFieldsAsync = createAsyncThunk(
  "filter/fetchAllFields",
  async (params) => {
    const { axiosInstance, ...requestData } = params;
    const objectResponse = await fetchObjects(axiosInstance, requestData);
    const conditionResponse = await fetchConditions(axiosInstance, requestData);
    const valueResponse = await fetchValues(axiosInstance, requestData);
    const valueTypesResponse = await fetchValueTypes(
      axiosInstance,
      requestData
    );
    return {
      objects: objectResponse.data.data,
      conditions: conditionResponse.data,
      values: valueResponse.data,
      valueTypes: valueTypesResponse.data,
    };
  }
);

export const fetchFilterDataAsync = createAsyncThunk(
  "filter/fetchFilterData",
  async (params) => {
    const { axiosInstance, ...requestData } = params;
    const filterData = await fetchFilterData(axiosInstance, requestData);
    return filterData.data;
  }
);

const initialState = {
  loading: true,
  filterApplied: false,
  filterAppliedOn: "",
  objects: [],
  fields: [],
  condition_types: [],
  value_types: [],
  values: [],
  filterData: [],
  filterConditions: [],
  filterLogic: "",
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    SetFilterData: (state, action) => {
      state.filterData = action.payload;
    },
    SetFilterConditions: (state, action) => {
      state.filterConditions = action.payload;
    },
    SetFilterLogic: (state, action) => {
      state.filterLogic = action.payload;
    },
    SetFilterApplied: (state, action) => {
      state.filterApplied = action.payload;
    },
    SetFilterAppliedOn: (state, action) => {
      state.filterAppliedOn = action.payload;
    },
    SetFilterLoading: (state, action) => {
      state.loading = action.payload;
    },
    FilterCleaner: (state, action) => {
      state.filterData = [];
      state.filterConditions = [];
      state.filterLogic = "";
      state.filterApplied = false;
      state.filterAppliedOn = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilterFieldsAsync.fulfilled, (state, action) => {
        state.objects = action.payload.objects;
        state.condition_types = action.payload.conditions;
        state.value_types = action.payload.valueTypes;
        state.values = action.payload.values;
        state.loading = false;
      })
      .addCase(fetchAllFilterFieldsAsync.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(fetchFieldsAsync.fulfilled, (state, action) => {
        state.fields = action.payload;
      })
      .addCase(fetchFilterDataAsync.fulfilled, (state, action) => {
        state.filterData = action.payload;
        state.filterApplied = true;
        state.loadingTable = false;
      })
      .addCase(fetchFilterDataAsync.pending, (state, action) => {
        state.loadingTable = true;
      });
  },
});

export const {
  SetFilterData,
  SetFilterConditions,
  SetFilterLogic,
  SetFilterApplied,
  SetFilterAppliedOn,
  SetFilterLoading,
  FilterCleaner,
} = filterSlice.actions;

export default filterSlice.reducer;
