// src/features/dataEnrichment/dataEnrichmentSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchProviders,
  createProvider,
  activateProvider,
  deactivateProvider,
  makePrimaryProvider,
} from "./dataEnrichmentApi";

const initialState = {
  providers: [],
  selectedProviders: [],
  loading: false,
  error: null,
search: false,
  searchProviders: [],
};

export const fetchProvidersAsync = createAsyncThunk(
  "dataEnrichment/fetchProviders",
  async ({ baseURL, viewer_id, organisation_id }, { rejectWithValue }) => {
    try {
      return await fetchProviders({ baseURL, viewer_id, organisation_id });
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createProviderAsync = createAsyncThunk(
  "dataEnrichment/createProvider",
  async ({ baseURL, viewer_id, organisation_id, providerData }, { rejectWithValue }) => {
    try {
      return await createProvider({ baseURL, viewer_id, organisation_id, ...providerData });
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const activateProviderAsync = createAsyncThunk(
  "dataEnrichment/activateProvider",
  async ({ baseURL, viewer_id, organisation_id, id }, { rejectWithValue }) => {
    try {
      return await activateProvider({ baseURL, viewer_id, organisation_id, id });
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deactivateProviderAsync = createAsyncThunk(
  "dataEnrichment/deactivateProvider",
  async ({ baseURL, viewer_id, organisation_id, id }, { rejectWithValue }) => {
    try {
      return await deactivateProvider({ baseURL, viewer_id, organisation_id, id });
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const makePrimaryProviderAsync = createAsyncThunk(
  "dataEnrichment/makePrimaryProvider",
  async ({ baseURL, viewer_id, organisation_id, id }, { rejectWithValue }) => {
    try {
      return await makePrimaryProvider({ baseURL, viewer_id, organisation_id, id });
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const dataEnrichmentSlice = createSlice({
  name: "dataEnrichment",
  initialState,
  reducers: {
    clearSelectedProviders: (state) => {
      state.selectedProviders = [];
    },
    selectProvider: (state, action) => {
      state.selectedProviders.push(action.payload);
    },
    unselectProvider: (state, action) => {
      state.selectedProviders = state.selectedProviders.filter(
        (p) => p.id !== action.payload.id
      );
    },
    selectAllProviders: (state, action) => {
      state.selectedProviders = action.payload;
    },
    setSearch: (state, action) => {
      state.search = true;
      state.searchProviders = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProvidersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProvidersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.providers = action.payload;
      })
      .addCase(fetchProvidersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add/Activate/Deactivate/Primary can all just refetch providers on success
      .addCase(createProviderAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(activateProviderAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deactivateProviderAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(makePrimaryProviderAsync.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const {
  clearSelectedProviders,
  selectProvider,
  unselectProvider,
  selectAllProviders,
  setSearch,
  clearError,
} = dataEnrichmentSlice.actions;

export default dataEnrichmentSlice.reducer;