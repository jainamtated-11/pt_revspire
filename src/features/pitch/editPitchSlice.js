import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchPitchLayouts,
  generateAIContent,
  fetchSalesforcePitchContentsRecommendation,
  fetchCrmContacts,
  fetchPitchSectionsAndContents,
  fetchCRMRecordName,
  fetchCrmConnections,
} from "./pitchApi";

const initialState = {
  pitchId: "",

  authUrl: "",
  contentGrouping: false,
  processOverVeiw: false,
  availableFieldTypes: [],
  customFields: [],
  fieldValues: [],
  actionPlan: false,
  eSigner: false,
  userMessage: false,
  htmlBlock: false,
  fileUploader: true,
  activePitchCheck: {
    exists: false,
    pitchId: null,
  },

  layoutCode: null, // To store the fetched layout JSX
  previewLoading: false,
  content_groups: [], // New state for storing groups

  pitchData: null,
  pitchDataLoading: false,
  // Pitch type (TOFU or not)
  isTofu: false,
  isOpen: false,

  // Pitch active
  isActivePitch: 0,

  // CRM selection and type
  crmType: "", // 'salesforce', 'zoho', 'hubspot', 'dynamics 365', 'pipedrive'
  entityType: "", // 'deal', 'account', 'opportunity', 'company'
  isAccountMode: false,
  entityId: "",
  entityName: "",
  entityNameLoading: false,
  entityModalOpen: false,
  entityFetchingFailed: false,

  //Crm Connections
  crmConnections: [],
  crmConnectionsLoading: false,
  selectedConnectionName: "",
  selectedConnectionId: "",

  // UI States
  isAddingSection: false,
  isTaglineFormOpen: false,

  // Pitch Layouts
  layouts: [],
  layoutsLoading: false,

  // Basic pitch info
  pitchName: "",
  pitchLayout: {
    id: "",
    name: "",
  },

  aiLoading: false,
  aiContent: "",

  // Content fields
  title: "",
  headline: "",
  description: "",

  // Internationalization
  languages: [],

  //pitch color and orgColor
  orgColor: "",
  orgColorLoading: "false",
  primaryColor: "",

  isEditingImages: false,

  // Images
  images: {
    background: {
      file: null,
      name: "",
      validated: false,
    },
    loginBackground: {
      file: null,
      name: "",
      validated: false,
    },
    clientLogo: {
      file: null,
      name: "",
      validated: false,
    },
  },

  highlightVideos: [],
  deleteHightlightVideoIds: [],
  selectedUsers: [],
  selectedGroups: [],

  sections: [],
  serviceCrmAndUserCrmMatch: true,

  contentRecommendations: [],
  contentRecommendationsLoading: false,

  pitchAccess: 0,
  disableOTP: false,
  businessEmailOnly: false,

  existingContacts: [],
  crmContacts: [],
  crmContactsLoading: false,
  pitchContacts: [],
  allContacts: [],
  selectedContacts: [],
  // Status flags
  isLoading: false,
  error: null,
};

export const fetchCrmConnectionsAsync = createAsyncThunk(
  "addPitch/fetchCrmConnections",
  async (params) => {
    const { axiosInstance, ...requestData } = params; // Extract axiosInstance
    const response = await fetchCrmConnections(axiosInstance, requestData);
    return response.connections;
  }
);

export const fetchPitchLayoutsAsync = createAsyncThunk(
  "editPitch/fetchPitchLayouts",
  async (params) => {
    const { axiosInstance, ...requestData } = params;
    const response = await fetchPitchLayouts(axiosInstance, requestData);
    return response.pitchLayoutNames;
  }
);

export const generateAIContentAsync = createAsyncThunk(
  "editPitch/generateAIContent",
  async (params, { rejectWithValue }) => {
    // Add rejectWithValue
    const { axiosInstance, ...requestData } = params;
    try {
      const response = await generateAIContent(axiosInstance, requestData);
      return response.data; // Match addPitch by returning .data
    } catch (error) {
      if (error.response?.status === 401) {
        const { protocol, host } = window.location;
        window.location.href = `${protocol}//${host}/login`;
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSalesforcePitchContentsRecommendationAsync = createAsyncThunk(
  "editPitch/fetchSalesforcePitchContentsRecommendation",
  async (params) => {
    const { axiosInstance, ...requestData } = params;
    const response = await fetchSalesforcePitchContentsRecommendation(
      axiosInstance,
      requestData
    );
    return response;
  }
);

export const fetchCrmContactsAsync = createAsyncThunk(
  "editPitch/fetchCrmContacts",
  async (params) => {
    const { axiosInstance, ...requestData } = params;
    const response = await fetchCrmContacts(axiosInstance, requestData);
    return response;
  }
);

export const fetchPitchSectionsAndContentsAsync = createAsyncThunk(
  "editPitch/fetchPitchSectionsAndContents",
  async (params, thunkAPI) => {
    try {
      const { axiosInstance, pitchId } = params;
      const response = await fetchPitchSectionsAndContents(
        axiosInstance,
        pitchId
      );
      return response; // Ensure this is the exact structure you expect
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const fetchRecordNameThunk = createAsyncThunk(
  "crm/fetchRecordName",
  async ({ axiosInstance, data }, { rejectWithValue }) => {
    try {
      const response = await fetchCRMRecordName(axiosInstance, data);
      // Return early if no response
      if (!response) return null;

      // Check for authUrl in the response data
      if (response?.data?.authUrl) {
        return { authUrl: response.data.authUrl };
      }
      return response;
    } catch (error) {
      console.error("Error fetching CRM record name:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add async thunk for fetching layout
export const fetchPitchLayoutCode = createAsyncThunk(
  "editPitch/fetchPitchLayoutCode",
  async ({ axiosInstance, layoutId, viewerId }) => {
    const response = await axiosInstance.post(`/pitch-preview-content`, {
      content_name: `${layoutId}_html_code`,
      viewerId,
    });
    return response.data;
  }
);

// Add async thunk for fetching layout
export const fetchPitchBackgroundImage = createAsyncThunk(
  "editPitch/fetchPitchBackgroundImage",
  async ({ axiosInstance, PitchId, viewerId }) => {
    const response = await axiosInstance.post(
      `/pitch-preview-content`,
      {
        content_name: `${PitchId}_background_image`,
        viewerId,
      },
      {
        responseType: "blob",
        withCredentials: true,
      }
    );
    return response.data;
  }
);

// Add this to your existing async thunks
export const checkActivePitchForCrmRecordAsync = createAsyncThunk(
  "editPitch/checkActivePitchForCrmRecord",
  async (params, { rejectWithValue }) => {
    const { axiosInstance, record_id } = params;
    try {
      const response = await axiosInstance.post(
        "/check-active-pitch-for-crm-record",
        {
          record_id,
          // organisation_id,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Rename and modify the function for edit pitch
const removeAsteriskLabelsEdit = (text) => {
  if (!text) {
    console.warn("removeAsteriskLabelsEdit received undefined/null input");
    return "";
  }

  try {
    const format1Pattern = /\*\*[^*]+:\*\*/g;
    const format2Pattern = /"[^"]+":/g;
    const format3Pattern = /[^":]+:/g;
    const simpleLabelPattern = /^[^\n]+:/;

    let cleanedText = String(text)
      .replace(format1Pattern, "")
      .replace(format2Pattern, "")
      .replace(format3Pattern, "")
      .replace(simpleLabelPattern, "");

    return cleanedText.trim();
  } catch (error) {
    console.error("Error in removeAsteriskLabelsEdit:", error);
    return String(text).trim();
  }
};

const languageOptions = [
  { value: "en-EN", label: "English" },
  { value: "fr-FR", label: "French" },
  { value: "es-ES", label: "Spanish" },
  { value: "it-IT", label: "Italian" },
  { value: "zh-CN", label: "Mandarin" },
  { value: "ja-JA", label: "Japanese" },
  { value: "de-DE", label: "German" },
  { value: "ru-RU", label: "Russian" },
  { value: "ar-AR", label: "Arabic" },
];

const pitchSlice = createSlice({
  name: "editPitch",
  initialState,
  reducers: {
    setPitchId: (state, action) => {
      state.pitchId = action.payload;
    },

    // Content Grouping Actions
    setContentGrouping: (state, action) => {
      state.contentGrouping = action.payload;
    },

    setProcessOverVeiw: (state, action) => {
      state.processOverVeiw = action.payload;
    },

    updateContentGroup: (state, action) => {
      const { groupId, newName } = action.payload;
      const group = state.content_groups.find((g) => g.id === groupId);
      if (group) {
        const oldName = group.name;
        group.name = newName;

        // Update group_name in all contents
        state.sections.forEach((section) => {
          section.contents.forEach((content) => {
            if (content.pitch_content_group === groupId) {
              content.pitch_content_group_name = newName;
            }
          });
        });
      }
    },

    // Update basic pitch info
    setPitchName: (state, action) => {
      state.pitchName = action.payload;
    },

    setPitchLayout: (state, action) => {
      state.pitchLayout = action.payload;
    },

    addContentGroup: (state, action) => {
      const { name } = action.payload;
      const newGroup = {
        name,
        // order: state.content_groups.length + 1,
      };
      state.content_groups.push(newGroup);
    },

    // Set entity details
    setEntityDetails: (state, action) => {
      state.entityId = action.payload.id;
      state.entityName = action.payload.name;
    },

    setActionPlan: (state, action) => {
      state.actionPlan = action.payload;
    },

    setUserMessage: (state, action) => {
      state.userMessage = action.payload;
    },

    setHtmlBlock: (state, action) => {
      state.htmlBlock = action.payload;
    },

    setFileUploader: (state, action) => {
      state.fileUploader = action.payload;
    },

    setEsigner: (state, action) => {
      state.eSigner = action.payload;
    },

    // Update content fields
    setTitle: (state, action) => {
      state.title = action.payload;
    },

    // Update content fields
    setAiLoading: (state, action) => {
      state.aiLoading = action.payload;
    },

    setHeadline: (state, action) => {
      state.headline = action.payload;
    },

    setDescription: (state, action) => {
      state.description = action.payload;
    },

    // Language management
    addLanguage: (state, action) => {
      state.languages = action.payload; // Just replace the whole array
    },

    removeLanguage: (state, action) => {
      state.languages = state.languages.filter(
        (lang) => lang !== action.payload
      );
    },
    setLayoutCode: (state, action) => {
      state.layoutCode = action.payload;
    },
    setPreviewLoading: (state, action) => {
      state.previewLoading = action.payload;
    },

    // Color management
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
    },

    setPitchContacts: (state, action) => {
      state.pitchContacts = action.payload;
    },

    // Image handling
    setBackgroundImage: (state, action) => {
      state.images.background = {
        file: action.payload.file,
        name: action.payload.name,
        validated: true,
      };
    },

    setLoginBackgroundImage: (state, action) => {
      state.images.loginBackground = {
        file: action.payload.file,
        name: action.payload.name,
        validated: true,
      };
    },

    setClientLogo: (state, action) => {
      state.images.clientLogo = {
        file: action.payload.file,
        name: action.payload.name,
        validated: true,
      };
    },

    toggleTofu: (state) => {
      state.isTofu = !state.isTofu;
      // Reset CRM-related fields when toggling TOFU (same as addPitchSlice)
      if (state.isTofu) {
        state.crmType = "";
        state.entityType = "";
        state.entityId = "";
        state.entityName = "";
      }
    },

    setIsOpen: (state, action) => {
      state.isOpen = action.payload;
      localStorage.removeItem("postLoginRedirect");
    },

    // add highlighVideo
    addHighlightVideo: (state, action) => {
      state.highlightVideos = [
        ...state.highlightVideos,
        {
          file: action.payload.file,
          tagline: action.payload.tagline,
          id: Date.now(), // simple unique ID
          url: action.payload.url,
        },
      ];
    },

    removeHighlightVideo: (state, action) => {
      // action.payload should be the index to remove
      state.highlightVideos.splice(action.payload, 1);
    },

    setDeleteHightlightVideoIds: (state, action) => {
      state.deleteHightlightVideoIds.push(action.payload);
    },

    updateHighlightVideoTagline: (state, action) => {
      // action.payload should be { index: number, tagline: string }
      const { index, tagline } = action.payload;
      if (state.highlightVideos[index]) {
        state.highlightVideos[index].tagline = tagline;
      }
    },

    addSelectedUsers: (state, action) => {
      state.selectedUsers = action.payload;
    },

    togglePitchAccess: (state, action) => {
      state.pitchAccess = action.payload;
    },

    toggleDisableOTP: (state, action) => {
      state.disableOTP = action.payload;
    },

    toggleEntityModal: (state, action) => {
      state.entityModalOpen = action.payload;
      if (action.payload == true) {
        state.crmType = "TOFU";
      }
    },
    // Set entity type (deal/account/opportunity/company)
    setEntityType: (state, action) => {
      state.entityType = action.payload;
      if (action.payload === "account" || action.payload === "company")
        state.isAccountMode = true;
      else state.isAccountMode = false;
    },

    //setSelectedCrm
    setSelectedCrm: (state, action) => {
      state.crmType = action.payload.crmType;
      state.selectedConnectionId = action.payload.selectedCrmId;
      state.selectedConnectionName = action.payload.selectedCrmName;
    },
    //Toggle Entity
    toggleEntityType: (state) => {
      if (state.crmType === "salesforce") {
        state.entityType =
          state.entityType === "opportunity" ? "account" : "opportunity";
      } else if (state.crmType === "zoho") {
        state.entityType = state.entityType === "deal" ? "account" : "deal";
      } else if (state.crmType === "hubspot") {
        state.entityType = state.entityType === "deal" ? "company" : "deal";
      } else if (state.crmType === "pipedrive") {
        state.entityType = state.entityType === "deal" ? "company" : "deal";
      } else if (state.crmType === "dynamics 365") {
        state.entityType =
          state.entityType === "opportunity" ? "account" : "opportunity";
      }
      // Reset ID and name when changing type
      state.entityId = "";
      state.entityName = "";
    },

    toggleBusinessEmailOnly: (state, action) => {
      state.businessEmailOnly = action.payload;
    },

    addSelectedGroups: (state, action) => {
      state.selectedGroups = action.payload;
    },

    toggleImageEditing: (state, action) => {
      state.isEditingImages = action.payload;
    },

    clearAuthUrl: (state, action) => {
      state.authUrl = action.payload;
    },

    addNewSection: (state, action) => {
      console.log("action.payload before sending ", action.payload);

      const sectionData = action.payload.section || {};
      const originalContents = sectionData.contents || [];

      const updatedContents = Array.isArray(originalContents)
        ? originalContents.map((content, index) => ({
          ...content,
          arrangement: index + 1,
        }))
        : [];

      const newSection = {
        ...sectionData,
        contents: updatedContents,
        arrangement: state.sections.length + 1,
      };

      state.sections.push(newSection);
    },

    addContentToSection: (state, action) => {
      console.log("ADDING FORM HERE");

      state.sections[action.payload.data.index].contents.push(
        action.payload.data.content
      );
    },

    insertContentsIntoSection: (state, action) => {
      const { sectionIndex, contentsToAdd } = action.payload;
      if (
        sectionIndex >= 0 &&
        sectionIndex < state.sections.length &&
        Array.isArray(contentsToAdd)
      ) {
        const section = state.sections[sectionIndex];
        const existingContents = section.contents || [];

        // Find the highest existing arrangement number (default to 0 if none)
        const lastArrangement =
          existingContents.reduce((max, content) => {
            return content.arrangement && content.arrangement > max
              ? content.arrangement
              : max;
          }, 0) || 0;

        // Assign arrangement to each new content
        const arrangedContentsToAdd = contentsToAdd.map((content, index) => ({
          ...content,
          arrangement: lastArrangement + index + 1,
        }));

        // Insert contents
        section.contents.push(...arrangedContentsToAdd);
      }
    },

    setAvailableFieldTypes: (state, action) => {
      state.availableFieldTypes = action.payload;
    },
    setCustomFields: (state, action) => {
      state.customFields = action.payload;
    },
    setFieldValues: (state, action) => {
      state.fieldValues = action.payload;
    },
    updateFieldValue: (state, action) => {
      const { id, fieldName, value } = action.payload;
      const updated = state.fieldValues.map((f) =>
        f.id === id
          ? { ...f, value, id } // include id here
          : f
      );
      state.fieldValues = updated;
    },

    reorderContentsWithinSection: (state, action) => {
      // payload should contain: sectionIndex, sourceIndex, destinationIndex
      const { sectionIndex, sourceIndex, destinationIndex } = action.payload;
      const section = state.sections[sectionIndex];
      const [removed] = section.contents.splice(sourceIndex, 1);
      section.contents.splice(destinationIndex, 0, removed);

      // Update arrangement numbers for all contents in section
      section.contents.forEach((content, index) => {
        content.arrangement = index + 1;
      });
    },

    moveContentBetweenSections: (state, action) => {
      // payload should contain: sourceSectionIndex, destinationSectionIndex, sourceIndex, destinationIndex
      const {
        sourceSectionIndex,
        destinationSectionIndex,
        sourceIndex,
        destinationIndex,
      } = action.payload;

      // Get the content to move
      const sourceSection = state.sections[sourceSectionIndex];
      const [removed] = sourceSection.contents.splice(sourceIndex, 1);

      // Add to the destination section
      const destinationSection = state.sections[destinationSectionIndex];
      destinationSection.contents.splice(destinationIndex, 0, removed);

      // Update arrangement numbers for both sections
      sourceSection.contents.forEach((content, index) => {
        content.arrangement = index + 1;
      });

      destinationSection.contents.forEach((content, index) => {
        content.arrangement = index + 1;
      });
    },

    reorderSections: (state, action) => {
      // payload should contain: sourceIndex, destinationIndex
      const { sourceIndex, destinationIndex } = action.payload;
      const [removed] = state.sections.splice(sourceIndex, 1);
      state.sections.splice(destinationIndex, 0, removed);

      // Update arrangement numbers for all sections
      state.sections.forEach((section, index) => {
        section.arrangement = index + 1;
      });
    },

    removeSection: (state, action) => {
      // action.payload should be the index of the section to remove
      state.sections.splice(action.payload, 1);

      // Update arrangement numbers for all remaining sections
      state.sections.forEach((section, index) => {
        section.arrangement = index + 1;
      });
    },

    updateSectionName: (state, action) => {
      const { sectionIndex, newName } = action.payload;
      if (state.sections[sectionIndex]) {
        state.sections[sectionIndex].name = newName;
      }
    },

    updateAllSections: (state, action) => {
      state.sections = action.payload;
    },

    assignContentToGroup: (state, action) => {
      const { sectionIndex, contentIndex, groupName } = action.payload;
      if (
        state.sections[sectionIndex] &&
        state.sections[sectionIndex].contents[contentIndex]
      ) {
        const contents = state.sections[sectionIndex].contents;

        // ✅ Step 1: Assign group_name
        if (groupName) {
          contents[contentIndex].group_name = groupName;
        } else {
          delete contents[contentIndex].group_name;
        }

        // ✅ Step 2: Group contents by group_name
        const groupedContents = {};
        contents.forEach((item) => {
          const g = item.group_name || "__ungrouped__";
          if (!groupedContents[g]) groupedContents[g] = [];
          groupedContents[g].push(item);
        });

        // ✅ Step 3: Rearrange grouped contents
        const updatedContents = [];
        const usedArrangements = new Set();

        Object.entries(groupedContents).forEach(([group, groupItems]) => {
          if (group === "__ungrouped__") return;

          // Sort by existing arrangement
          groupItems.sort((a, b) => a.arrangement - b.arrangement);

          // Get the minimum arrangement in the group
          const startArrangement = groupItems[0].arrangement;

          // Reassign sequentially from that min
          groupItems.forEach((item, index) => {
            item.arrangement = startArrangement + index;
            usedArrangements.add(item.arrangement);
            updatedContents.push(item);
          });
        });

        // ✅ Step 4: Fill remaining arrangements with ungrouped or skipped ones
        const allItemsSorted = contents
          .filter((c) => !c.group_name)
          .sort((a, b) => a.arrangement - b.arrangement);

        let nextArrangement = 1;
        allItemsSorted.forEach((item) => {
          // Skip already used arrangements
          while (usedArrangements.has(nextArrangement)) {
            nextArrangement++;
          }
          item.arrangement = nextArrangement;
          usedArrangements.add(nextArrangement);
          nextArrangement++;
          updatedContents.push(item);
        });

        // ✅ Step 5: Final sort by arrangement
        state.sections[sectionIndex].contents = updatedContents.sort(
          (a, b) => a.arrangement - b.arrangement
        );

        state.sections[sectionIndex].contents.forEach((item, index) => {
          item.arrangement = index + 1;
        });
      }
    },

    removeContentFromSection: (state, action) => {
      // action.payload should be { sectionIndex, contentIndex }
      const { sectionIndex, contentIndex } = action.payload;
      state.sections[sectionIndex].contents.splice(contentIndex, 1);

      // Update arrangement numbers for all remaining contents in the section
      state.sections[sectionIndex].contents.forEach((content, index) => {
        content.arrangement = index + 1;
      });
    },

    removeContentGroup: (state, action) => {
      const groupName = action.payload;
      // Remove the group
      state.content_groups = state.content_groups.filter(
        (group) => group.name !== groupName
      );
    },

    updateContentTagline: (state, action) => {
      // action.payload should contain: { sectionIndex, contentIndex, tagline }
      const { sectionIndex, contentIndex, tagline } = action.payload;
      state.sections[sectionIndex].contents[contentIndex].tagline = tagline;
    },

    // Reset entire form
    resetPitchForm: () => initialState,

    // Status management
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    setIsAddingSection: (state, action) => {
      state.isAddingSection = action.payload;
    },

    setIsTaglineFormOpen: (state, action) => {
      state.isTaglineFormOpen = action.payload;
    },
    setAllContacts: (state, action) => {
      state.allContacts = action.payload;
    },
    setSelectedContacts: (state, action) => {
      state.selectedContacts = action.payload;
    },
    addContact: (state, action) => {
      state.allContacts.unshift(action.payload);
    },
    removeContact: (state, action) => {
      state.allContacts = state.allContacts.filter(
        (contact) => contact.id !== action.payload
      );
    },
    toggleContactSelection: (state, action) => {
      const contact = action.payload;
      const index = state.selectedContacts.findIndex(
        (selected) => selected.id === contact.id
      );

      if (index >= 0) {
        state.selectedContacts.splice(index, 1);
      } else {
        state.selectedContacts.push(contact);
      }
    },

    setPitchActiveStatus: (state, action) => {
      state.isActivePitch = action.payload;
    },

    renameContentGroup: (state, action) => {
      const { oldName, newName } = action.payload;
      // Update content_groups
      state.content_groups.forEach((group) => {
        if (group.name === oldName) {
          group.name = newName;
        }
      });

      // Update sections' contents
      state.sections.forEach((section) => {
        section.contents.forEach((content) => {
          if (content.group_name === oldName) {
            content.group_name = newName;
          }
          if (content.pitch_content_group_name === oldName) {
            content.pitch_content_group_name = newName;
          }
        });
      });
    },

    onSignatureRevoke: (state, action) => {
      const { sectionIndex, contentId , editedData } = action.payload;
      // Find the section
      const sectionToUpdate = state.sections[sectionIndex];
      if (!sectionToUpdate) return;
      // Find the content to update
      const contentIndex = sectionToUpdate.contents.findIndex(
        (content) => content.content_id === contentId
      );

      if (contentIndex === -1) return;
      // Create updated content object
      const updatedContent = {
        ...sectionToUpdate.contents[contentIndex],
        content_link: JSON.stringify({
          state: editedData.status,
          status: editedData.status,
          content_id: editedData.content_id,
          Type: editedData.Type,
          sequential: editedData.sequential,
          public_access: editedData.public_access,
          signature: editedData.signature.map((signature) => ({
            ...signature // This copies all properties from the original signature
          })),
        }),
      };
      // Update the state immutably
      state.sections[sectionIndex].contents[contentIndex] = updatedContent;
    },

    updateFeatureInSection: (state, action) => {
      const { sectionIndex, contentId, editedData, type } = action.payload;

      // Find the section
      const sectionToUpdate = state.sections[sectionIndex];
      if (!sectionToUpdate) return;

      // Find the content to update
      const contentIndex = sectionToUpdate.contents.findIndex(
        (content) => content.content_id === contentId
      );

      if (contentIndex === -1) return;
      if (type === "action-plan") {
        const updatedContent = {
          ...sectionToUpdate.contents[contentIndex],
          name: editedData.name,
          tagline: editedData.name,
          content_link: JSON.stringify({
            Type: "ActionPlan",
            name: editedData.name,
            stages: editedData.stages.map((stage) => ({
              id: stage.id,
              stageName: stage.stageName,
              actions: stage.actions.map((action) => ({
                id: action.id,
                name: action.name,
                description: action.description,
                dueDate: action.dueDate,
                assignedTo: {
                  name: action.assignedTo.name,
                  email: action.assignedTo.email,
                },
                internal: action.internal,
                completed: action.completed,
              })),
            })),
          }),
        };

        // Update the state immutably
        state.sections[sectionIndex].contents[contentIndex] = updatedContent;
      } else if (type === "process-overview") {
        // Create updated content object
        const updatedContent = {
          ...sectionToUpdate.contents[contentIndex],
          name: editedData.name,
          tagline: editedData.name,
          description: editedData.description,
          content_link: JSON.stringify({
            Type: "ProcessOverview",
            Steps: editedData.steps.map((step) => ({
              Heading: step.Heading,
              Description: step.Description,
              Arrangement: step.Arrangement,
              CurrentStep: step.CurrentStep,
            })),
          }),
        };
        // Update the state immutably
        state.sections[sectionIndex].contents[contentIndex] = updatedContent;
      } else if (type === "user-message") {
        // Create updated content object
        const updatedContent = {
          ...sectionToUpdate.contents[contentIndex],
          name: editedData.title,
          tagline: editedData.title,
          content_link: JSON.stringify({
            Type: "UserMessage",
            message: editedData.message,
            userID: editedData.userID,
          }),
        };
        // // Update the state immutably
        state.sections[sectionIndex].contents[contentIndex] = updatedContent;
      } else if (type === "html-block") {
        // Create updated content object
        const updatedContent = {
          ...sectionToUpdate.contents[contentIndex],
          name: editedData.title,
          tagline: editedData.title,
          content_link: JSON.stringify({
            Type: "HtmlBlock",
            html: editedData.html,
          }),
        };
        // Update the state immutably
        state.sections[sectionIndex].contents[contentIndex] = updatedContent;
      } else if (type === "file-uploader") {
        // Create updated content object
        const updatedContent = {
          ...sectionToUpdate.contents[contentIndex],
          name: editedData.name,
          tagline: editedData.name,
          description: editedData.description,
          content_link: JSON.stringify({
            Type: "FileUploader",
            contents: editedData.parameters.contents,
          }),
        };
        // Update the state immutably
        state.sections[sectionIndex].contents[contentIndex] = updatedContent;
      }
      else if (type === "esigner") {
        // Create updated content object
        const updatedContent = {
          ...sectionToUpdate.contents[contentIndex],
          content_link: JSON.stringify({
            state: editedData.parameters.status,
            status: editedData.parameters.status,
            content_id: editedData.parameters.content_id,
            Type: editedData.parameters.Type,
            sequential: editedData.parameters.sequential,
            public_access: editedData.parameters.public_access,
            signature: editedData.parameters.signature.map((signature) => ({
              ...signature // This copies all properties from the original signature
            })),
          }),
        };
        // Update the state immutably
        state.sections[sectionIndex].contents[contentIndex] = updatedContent;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // CRM Connections
      .addCase(fetchCrmConnectionsAsync.pending, (state) => {
        state.crmConnectionsLoading = true;
      })
      .addCase(fetchCrmConnectionsAsync.fulfilled, (state, action) => {
        state.crmConnectionsLoading = false;
        state.crmConnections = action.payload;
      })
      .addCase(fetchCrmConnectionsAsync.rejected, (state) => {
        state.crmConnectionsLoading = false;
      })

      // Pitch Layouts
      .addCase(fetchPitchLayoutsAsync.pending, (state) => {
        state.layoutsLoading = true;
      })
      .addCase(fetchPitchLayoutsAsync.fulfilled, (state, action) => {
        state.layoutsLoading = false;
        if (action.payload.authUrl) {
          state.authUrl = action.payload.authUrl;
        }
        state.layouts = action.payload;
      })
      .addCase(fetchPitchLayoutsAsync.rejected, (state) => {
        state.layoutsLoading = false;
      })

      .addCase(generateAIContentAsync.pending, (state) => {
        state.aiLoading = true;
      })
      // Update the reducer to use the new function name
      .addCase(generateAIContentAsync.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.aiContent = action.payload.aiContent;

        // Use regex to extract each section
        const titleMatch = action.payload.aiContent.match(
          /\*\*Title\*\*:\s*(.*?)\s*(?=\*\*Headline\*\*|$)/s
        );
        const headlineMatch = action.payload.aiContent.match(
          /\*\*Headline\*\*:\s*(.*?)\s*(?=\*\*Description\*\*|$)/s
        );
        const descriptionMatch = action.payload.aiContent.match(
          /\*\*Description\*\*:\s*(.*)/s
        );

        state.title = removeAsteriskLabelsEdit(titleMatch?.[1]?.trim() || "");
        state.headline = removeAsteriskLabelsEdit(
          headlineMatch?.[1]?.trim() || ""
        );
        state.description = removeAsteriskLabelsEdit(
          descriptionMatch?.[1]?.trim() || ""
        );
      })
      .addCase(generateAIContentAsync.rejected, (state) => {
        state.aiLoading = false;
      })

      .addCase(
        fetchSalesforcePitchContentsRecommendationAsync.pending,
        (state) => {
          state.contentRecommendationsLoading = true;
        }
      )
      .addCase(
        fetchSalesforcePitchContentsRecommendationAsync.fulfilled,
        (state, action) => {
          state.contentRecommendationsLoading = false;
          state.contentRecommendations = action.payload;
          if (action.payload.authUrl) {
            state.authUrl = action.payload.authUrl;
          }
        }
      )
      .addCase(
        fetchSalesforcePitchContentsRecommendationAsync.rejected,
        (state) => {
          state.contentRecommendationsLoading = false;
        }
      )

      .addCase(fetchCrmContactsAsync.pending, (state) => {
        state.crmContactsLoading = true;
      })
      .addCase(fetchCrmContactsAsync.fulfilled, (state, action) => {
        state.crmContactsLoading = false;
        state.crmContacts = action.payload;
        if (action.payload.authUrl) {
          state.authUrl = action.payload.authUrl;
        }
      })
      .addCase(fetchCrmContactsAsync.rejected, (state) => {
        state.crmContactsLoading = false;
      })

      .addCase(fetchPitchSectionsAndContentsAsync.pending, (state) => {
        state.pitchDataLoading = true;
      })
      .addCase(
        fetchPitchSectionsAndContentsAsync.fulfilled,
        (state, action) => {
          state.isTofu = action.payload.pitch.crm_type == "TOFU" ? true : false;
          state.entityId =
            action.payload.pitch.account_id ||
            action.payload.pitch.opportunity_id;
          state.crmType =
            action.payload.pitch.crm_type.charAt(0).toLowerCase() +
            action.payload.pitch.crm_type.slice(1);
          state.isAccountMode = action.payload.pitch.account_id ? true : false;
          state.pitchName = action.payload.pitch.name;
          state.title = action.payload.pitch.title;
          state.headline = action.payload.pitch.headline;
          state.description = action.payload.pitch.description;
          state.pitchLayout.id = action.payload.pitch.pitch_layout;
          state.pitchLayout.name = action.payload.pitch_layout_name;
          state.primaryColor = action.payload.dsr_primary_color;
          state.highlightVideos = action.payload.dsrHighlightVideo;
          state.existingContacts = action.payload.pitchContacts;
          state.disableOTP =
            action.payload.pitch.disable_otp == 1 ? true : false;
          state.isActivePitch = action.payload.pitch.active;
          state.businessEmailOnly =
            action.payload.pitch.business_email_only == 1 ? true : false;
          state.pitchAccess = action.payload.pitch.public_access;
          state.userDetails = action.payload.userDetails[0];
          action.payload.pitchTeams.forEach((item) => {
            if (item.group !== null) {
              state.selectedGroups.push(item.group);
            } else if (item.user !== null) {
              state.selectedUsers.push(item.user);
            }
          });

          // Parse the pitch_translate string to array and set selected languages
          if (action.payload.pitch.pitch_translate) {
            const translatedLanguages = JSON.parse(
              action.payload.pitch.pitch_translate
            );
            const selectedOptions = languageOptions.filter((option) =>
              translatedLanguages.includes(option.value)
            );
            state.languages = selectedOptions;
          }

          if (
            (action.payload.pitch.opportunity_id ||
              action.payload.pitch.account_id) &&
            action.payload.crm_connection_details[0].crm_name !==
            action.payload.pitch.crm_type
          ) {
            state.serviceCrmAndUserCrmMatch = false;
          }

          state.pitchDataLoading = false;
          state.pitchData = action.payload;

          const transformedSections = action.payload.pitchSections.map(
            (section) => ({
              ...section,
              contents: section.contents.map((content) => ({
                ...content,
                mimetype: content.content_mimetype, // <-- attach mimetype at top level
                group_name: content.pitch_content_group_name,
              })),
            })
          );

          state.sections = transformedSections;

          // Parse and store content groups from the API response
          const groupsMap = new Map();
          let groupOrder = 1;

          // Extract unique groups from all contents
          action.payload.pitchSections.forEach((section) => {
            section.contents.forEach((content) => {
              if (
                content.pitch_content_group &&
                content.pitch_content_group_name
              ) {
                if (!groupsMap.has(content.pitch_content_group)) {
                  groupsMap.set(content.pitch_content_group, {
                    id: content.pitch_content_group,
                    name: content.pitch_content_group_name,
                    order: groupOrder++,
                  });
                }
              }
            });
          });

          // Convert map to array and store in state
          state.content_groups = Array.from(groupsMap.values());

          if (action.payload.authUrl) {
            state.authUrl = action.payload.authUrl;
          }
        }
      )
      .addCase(fetchPitchSectionsAndContentsAsync.rejected, (state, action) => {
        state.pitchDataLoading = false;
      })

      .addCase(fetchRecordNameThunk.pending, (state) => {
        state.entityNameLoading = true;
      })
      .addCase(fetchRecordNameThunk.fulfilled, (state, action) => {
        state.entityNameLoading = false;
        state.entityFetchingFailed = false;
        state.entityName = action.payload.name;
        state.entityId = action.payload.id;
        state.entityType = action.payload.type;
      })
      .addCase(fetchRecordNameThunk.rejected, (state) => {
        state.entityNameLoading = false;
        state.entityFetchingFailed = true;
      })

      .addCase(fetchPitchLayoutCode.pending, (state) => {
        state.previewLoading = true;
      })
      .addCase(fetchPitchLayoutCode.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.layoutCode = action.payload;
      })

      .addCase(fetchPitchLayoutCode.rejected, (state) => {
        state.previewLoading = false;
      })

      .addCase(fetchPitchBackgroundImage.pending, (state) => {
        state.previewLoading = true;
      })

      .addCase(fetchPitchBackgroundImage.fulfilled, (state, action) => {
        // state.previewLoading = false;
        const blob = action.payload;

        if (blob instanceof Blob) {
          const blobUrl = URL.createObjectURL(blob);
          state.images.background.file = blobUrl;
        } else {
          console.error("Payload is not a Blob", blob);
        }
      })

      .addCase(fetchPitchBackgroundImage.rejected, (state) => {
        state.previewLoading = false;
      })

      // Add this to your existing extraReducers
      .addCase(checkActivePitchForCrmRecordAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkActivePitchForCrmRecordAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // You might want to store this information in your state
        state.activePitchCheck = {
          exists: action.payload.exists,
          pitchId: action.payload.pitch_id || null,
        };
      })
      .addCase(checkActivePitchForCrmRecordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setPitchId,
  setAiLoading,
  setPitchName,
  setPitchLayout,
  setTitle,
  setHeadline,
  setDescription,
  addLanguage,
  removeLanguage,
  setPrimaryColor,
  setBackgroundImage,
  setLoginBackgroundImage,
  setClientLogo,
  addHighlightVideo,
  setDeleteHightlightVideoIds,
  addSelectedGroups,
  addSelectedUsers,
  removeHighlightVideo,
  updateHighlightVideoTagline,
  addNewSection,
  addContentToSection,
  reorderContentsWithinSection,
  moveContentBetweenSections,
  reorderSections,
  removeSection,
  removeContentFromSection,
  updateContentTagline,
  updateAllSections,
  togglePitchAccess,
  toggleDisableOTP,
  toggleBusinessEmailOnly,
  setPitchContacts,
  setIsAddingSection,
  toggleImageEditing,
  setIsTaglineFormOpen,
  setAvailableFieldTypes,
  setCustomFields,
  setFieldValues,
  updateFieldValue,
  resetPitchForm,
  setAllContacts,
  setSelectedContacts,
  insertContentsIntoSection,
  addContact,
  removeContact,
  toggleContactSelection,
  toggleEntityModal,
  setEntityType,
  setEntityDetails,
  setSelectedCrm,
  toggleEntityType,
  setLoading,
  setError,
  updateSectionName,
  clearAuthUrl,
  setContentGrouping,
  setProcessOverVeiw,
  updateContentGroup,
  assignContentToGroup,
  addContentGroup,
  renameContentGroup,
  removeContentGroup,
  toggleTofu,
  setIsOpen,
  updateFeatureInSection,
  setActionPlan,
  setEsigner,
  setPitchActiveStatus,
  setUserMessage,
  setHtmlBlock,
  setFileUploader,
  onSignatureRevoke
} = pitchSlice.actions;

// Export reducer
export default pitchSlice.reducer;
