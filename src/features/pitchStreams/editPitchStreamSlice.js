import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPitchStreamsAsync } from "./pitchStreamsSlice";
import toast from "react-hot-toast";

const initialState = {
  pitchStreamData: {
    id: "",
    name: "",
    created_by: "",
    title: "",
    headline: "",
    description: "",
    pitch_layout: "",
    pitch_stream: 1,
  },
  layouts: {
    data: [],
    loading: false,
    selectedLayoutId: "",
    selectedLayoutName: "",
  },
  sections: [],
  selectedContent: {
    content: "",
    name: "",
    tagline: "",
    mimetype: "",
    source: "",
    content_link: "",
  },
  modalState: {
    isOpen: false,
    type: null, // 'section' | 'content'
    sectionIndex: null,
    contentIndex: null,
  },
  isModalOpen: false,
  contentModalLoading: false,
};

// Async thunks
export const fetchPitchLayouts = createAsyncThunk(
  "editPitchStream/fetchPitchLayouts",
  async ({ axiosInstance }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/all-pitch-layout-names`, {
        withCredentials: true,
      });
      return response.data.pitchLayoutNames;
    } catch (error) {
      toast.error("Failed to fetch Pitch Layouts");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPitchData = createAsyncThunk(
  "editPitchStream/fetchPitchData",
  async ({ axiosInstance, pitchId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/retrieve-pitch-sections-and-contents/${pitchId}`
      );
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch pitch data");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePitchStream = createAsyncThunk(
  "editPitchStream/updatePitchStream",
  async (
    { axiosInstance, data, viewer_id, baseURL, globalOrgId },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await axiosInstance.post(
        `/edit-pitch-with-sections-and-contents`,
        data
      );

      if (response.data.success) {
        await dispatch(
          fetchPitchStreamsAsync({
            sortColumn: "name",
            sortOrder: "ASC",
            viewer_id,
            baseURL,
            organisation_id: globalOrgId,
          })
        );
        toast.success("Pitch Stream updated successfully!");
      }

      return response.data;
    } catch (error) {
      toast.error("Failed to update pitch stream");
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const editPitchStreamSlice = createSlice({
  name: "editPitchStream",
  initialState,
  reducers: {
    setPitchStreamData: (state, action) => {
      state.pitchStreamData = { ...state.pitchStreamData, ...action.payload };
    },
    setLayouts: (state, action) => {
      state.layouts = { ...state.layouts, ...action.payload };
    },
    setSections: (state, action) => {
      state.sections = action.payload;
    },
    setSelectedContent: (state, action) => {
      state.selectedContent = { ...state.selectedContent, ...action.payload };
    },
    setModalState: (state, action) => {
      state.modalState = { ...state.modalState, ...action.payload };
    },
    setIsModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    },
    setContentModalLoading: (state, action) => {
      state.contentModalLoading = action.payload;
    },
    resetEditPitchStreamState: () => initialState,

    // Drag-and-drop actions
    reorderSections: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [removed] = state.sections.splice(sourceIndex, 1);
      state.sections.splice(destinationIndex, 0, removed);
    },
    reorderContentsWithinSection: (state, action) => {
      const { sectionIndex, sourceIndex, destinationIndex } = action.payload;
      const section = state.sections[sectionIndex];
      const [removed] = section.contents.splice(sourceIndex, 1);
      section.contents.splice(destinationIndex, 0, removed);
    },
    moveContentBetweenSections: (state, action) => {
      const {
        sourceSectionIndex,
        destinationSectionIndex,
        sourceIndex,
        destinationIndex,
      } = action.payload;

      const sourceSection = state.sections[sourceSectionIndex];
      const destinationSection = state.sections[destinationSectionIndex];
      const [removed] = sourceSection.contents.splice(sourceIndex, 1);
      destinationSection.contents.splice(destinationIndex, 0, removed);
    },

    // Content management
    updateContentTagline: (state, action) => {
      const { sectionIndex, contentIndex, tagline } = action.payload;
      state.sections[sectionIndex].contents[contentIndex].tagline = tagline;
    },
    updateSectionName: (state, action) => {
      const { sectionIndex, newName } = action.payload;
      state.sections[sectionIndex].name = newName;
    },
    addContentToSection: (state, action) => {
      const { sectionIndex, content } = action.payload;
      state.sections[sectionIndex].contents.push(content);
    },
    removeContentFromSection: (state, action) => {
      const { sectionIndex, contentIndex } = action.payload;
      state.sections[sectionIndex].contents.splice(contentIndex, 1);
    },
    addMultipleContentsToSection: (state, action) => {
      const { sectionIndex, contents } = action.payload;

      if (state.sections[sectionIndex]) {
        state.sections[sectionIndex].contents.push(...contents);
      } else {
        console.warn(`Section at index ${sectionIndex} does not exist.`);
      }
    },
    addNewSection: (state, action) => {
      state.sections = state.sections.filter(
        (section) => section.name || section.contents.length > 0
      );
      state.sections.push(action.payload.section);
    },
    removeSection: (state, action) => {
      state.sections.splice(action.payload, 1);
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchPitchLayouts
      .addCase(fetchPitchLayouts.pending, (state) => {
        state.layouts.loading = true;
      })
      .addCase(fetchPitchLayouts.fulfilled, (state, action) => {
        state.layouts.loading = false;
        state.layouts.data = action.payload;
      })
      .addCase(fetchPitchLayouts.rejected, (state) => {
        state.layouts.loading = false;
      })
      // Handle fetchPitchData
      .addCase(fetchPitchData.fulfilled, (state, action) => {
        console.log("I AM HEREERERE>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        const { pitch, pitchSections } = action.payload;
        state.pitchStreamData = {
          id: pitch.id,
          name: pitch.name,
          created_by: pitch.created_by,
          title: pitch.title,
          headline: pitch.headline,
          description: pitch.description,
          pitch_layout: pitch.pitch_layout,
          pitch_stream: pitch.pitch_stream,
        };
        console.log("PITCH SECTIONSS HEREEE", pitchSections);
        state.sections = pitchSections?.map((section) => ({
          ...section,
          contents: section.contents.map((content) => ({
            ...content,
            name: content.content_name,
            content: content.content_id,
            mimetype: content.content_mimetype,
            source: content.content_source,
          })),
        }));
      });
  },
});

export const {
  setPitchStreamData,
  setLayouts,
  setSections,
  setSelectedContent,
  setModalState,
  setIsModalOpen,
  setContentModalLoading,
  resetEditPitchStreamState,
  reorderSections,
  reorderContentsWithinSection,
  moveContentBetweenSections,
  updateContentTagline,
  updateSectionName,
  addContentToSection,
  removeContentFromSection,
  addMultipleContentsToSection,
  addNewSection,
  removeSection,
} = editPitchStreamSlice.actions;

export default editPitchStreamSlice.reducer;
