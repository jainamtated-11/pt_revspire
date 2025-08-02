import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchContents,
  fetchModalContents,
} from "./contentApi";

const initialState = {
  loading: true,
  folder_id: "",
  contents: [],
  breadcrumbs: [{ id: "", name: "Home" }],
  selectedContents: [],
  selectedFolders: [],
  selectedItems: [],
  modalLoading: true,
  modalContents: [],
  modalBreadCrumbs: [{ id: "", name: "Home" }],
  modalSelectedItems: [],
  modalSelectedContents: [],
  modalSelectedFolders: [],
  search:false,
  searchContents:[],
};

export const fetchContentsAsync = createAsyncThunk(
  "contents/fetchContents",
  async (data) => {
    const response = await fetchContents(data);
    return response.data;
  }
);

export const fetchModalContentsAsync = createAsyncThunk(
  "contents/fetchModalContents",
  async (data) => {
    const response = await fetchModalContents(data);
    return response.data;
  }
);


const contentSlice = createSlice({
  name: "contents",
  initialState,
  reducers: {
    Loader: (state) => {
      state.loading = true;
    },

    SetSelectedItems:(state,action) =>{
      state.selectedItems = action.payload; 
    },

    SetSearch:(state,action) =>{
      state.search = true;
      state.searchContents = action.payload; 
    },
    ClearSearch:(state,action) =>{
      state.search = false;
      state.searchContents = [];
    },
    SearchContent: (state, action) => {
      state.modalContents = action.payload;
    },

    FolderIdHandler: (state, action) => {
      state.folder_id = action.payload;
    },

    navigateToFolder: (state, action) => {
      const { folderId, folderName } = action.payload;
      if (
        folderId !== state.folder_id ||
        (folderName && !state.breadcrumbs.find((b) => b.id === folderId))
      ) {
        try {
          if (folderName) {
            state.breadcrumbs.push({ id: folderId, name: folderName });
          }
          state.folder_id = folderId;
          state.selectedItems = [];
          state.selectedContents = [];
          state.selectedFolders = [];
        } catch (err) {
          console.log(err);
        }
      }
    },

    UpdateBreadCrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },

    SelectAllItems: (state, action) => {
      state.selectedItems = action.payload;
    },

    UnSelectAllItems: (state) => {
      state.selectedItems = [];
      state.selectedContents = [];
      state.selectedFolders = [];
    },

    SelectItem: (state, action) => {
      state.selectedItems.push(action.payload);
      if (action.payload.id[0] == "W") {
        state.selectedFolders.push(action.payload);
      } else {
        state.selectedContents.push(action.payload);
      }
    },

    UnSelectItem: (state, action) => {
      state.selectedItems = state.selectedItems.filter(
        (item) => item.id != action.payload.id
      );
      if (action.payload.id[0] == "W") {
        state.selectedFolders = state.selectedFolders.filter(
          (item) => item.id != action.payload.id
        );
      } else {
        state.selectedContents = state.selectedContents.filter(
          (item) => item.id != action.payload.id
        );
      }
    },

    ModalSelectItem: (state, action) => {
      state.modalSelectedItems.push(action.payload);
      if (action.payload.id[0] == "W") {
        state.modalSelectedFolders.push(action.payload);
      } else {
        state.modalSelectedContents.push(action.payload);
      }
    },

    ModalUnSelectItem: (state, action) => {
      state.modalSelectedItems = state.modalSelectedItems.filter(
        (item) => item.id != action.payload.id
      );
      if (action.payload.id[0] == "W") {
        state.modalSelectedFolders = state.modalSelectedFolders.filter(
          (item) => item.id != action.payload.id
        );
      } else {
        state.modalSelectedContents = state.modalSelectedContents.filter(
          (item) => item.id != action.payload.id
        );
      }
    },

    ModalUnSelectAllItem: (state) => {
      state.modalSelectedContents = [];
      state.modalSelectedFolders = [];
      state.modalSelectedItems = [];
    },

    ModalNavigateToFolder: (state, action) => {
      const folderId = action.payload.folderId;
      const folderName = action.payload.folderName;
      if (
        !state.modalBreadCrumbs.find((breadcrumb) => breadcrumb.id === folderId)
      ) {
        try {
          if (folderName) {
            state.modalBreadCrumbs.push({ id: folderId, name: folderName });
          
            state.folder_id = folderId;
            state.folderName = folderName;
          }
        } catch (err) {
          console.error(err);
        }
      }
    },

    UpdateModalBreadcrumbs: (state, action) => {
      state.modalBreadCrumbs = action.payload;
    },

    ContentResetToBase: (state) => {
      state.folder_id = "";
      state.breadcrumbs = [{ id: "", name: "Home" }];
      state.selectedContents = [];
      state.selectedFolders = [];
      state.selectedItems = [];
      state.modalLoading = true;
      state.modalContents = [];
      state.modalBreadCrumbs = [{ id: "", name: "Home" }];
      state.modalSelectedItems = [];
      state.modalSelectedContents = [];
      state.modalSelectedFolders = [];
    },

    breadcrumbSetter: (state, action) => {
      state.breadcrumbs = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContentsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContentsAsync.fulfilled, (state, action) => {
        state.contents = action.payload.items;
        if (state.breadcrumbs.length === 1) {
          state.folder_id = action.payload.root_folder_id;
          state.breadcrumbs[0].id = action.payload.root_folder_id;
        }
        state.loading = false;
      })
      .addCase(fetchModalContentsAsync.pending, (state) => {
        state.modalLoading = true;
      })
      .addCase(fetchModalContentsAsync.fulfilled, (state, action) => {
        state.modalContents = action.payload.items;
        state.modalLoading = false;
        if (state.modalBreadCrumbs.length === 1) {
          state.modalBreadCrumbs[0].id = action.payload.root_folder_id;
        }
      });
  },
});

export const {
  Loader,
  SetSelectedItems,
  SearchContent,
  FolderIdHandler,
  navigateToFolder,
  UpdateBreadCrumbs,
  SelectFolder,
  UnSelectFolder,
  SelectAllItems,
  UnSelectAllItems,
  SelectItem,
  UnSelectItem,
  ModalSelectItem,
  ModalUnSelectItem,
  ModalUnSelectAllItem,
  ModalNavigateToFolder,
  UpdateModalBreadcrumbs,
  ContentResetToBase,
  breadcrumbSetter,
  SetSearch,
  ClearSearch,
} = contentSlice.actions;

export default contentSlice.reducer;
