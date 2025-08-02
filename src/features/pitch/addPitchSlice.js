import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchCrmConnections,
  fetchPitchLayouts,
  generateAIContent,
  fetchOrgColor,
  fetchSalesforcePitchContentsRecommendation,
  fetchCrmContacts,
} from "./pitchApi";

const initialState = {
  // Pitch type (TOFU or not)
  isTofu: false,

  layoutCode: null, // To store the fetched layout JSX
  previewLoading: false,

  userDetails: {},
  userDetailsLoading: false,

  // Content features
  contentGrouping: false,
  processOverVeiw: false,
  actionPlan: false,
  eSigner: false,
  userMessage: false,
  htmlBlock: false,
  fileUploader: true,
  content_groups: [], // New state for storing groups

  activePitchCheck: {
    exists: false,
    pitchId: null,
  },

  availableFieldTypes: [],
  customFields: [],
  fieldValues: [],

  // UI States
  isAddingSection: false,
  isTaglineFormOpen: false,

  // CRM selection and type
  crmType: "", // 'salesforce', 'zoho', 'hubspot', 'dynamics 365', 'pipedrive'
  entityType: "", // 'deal', 'account', 'opportunity', 'company'
  entityId: "",
  entityName: "",

  //Crm Connections
  crmConnections: [],
  crmConnectionsLoading: false,
  selectedConnectionName: "",
  selectedConnectionId: "",

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
  selectedUsers: [],
  selectedGroups: [],

  sections: [],

  contentRecommendations: [],
  contentRecommendationsLoading: false,
  pitchAccess: 1,
  disableOTP: false,
  businessEmailOnly: false,

  //Pitch Contacts
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
  "addPitch/fetchPitchLayouts",
  async (params) => {
    const { axiosInstance, ...requestData } = params;
    const response = await fetchPitchLayouts(axiosInstance, requestData);
    return response.pitchLayoutNames;
  }
);

export const generateAIContentAsync = createAsyncThunk(
  "addPitch/generateAIContent",
  async (params, { rejectWithValue }) => {
    // Add rejectWithValue
    const { axiosInstance, ...requestData } = params;
    try {
      const response = await generateAIContent(axiosInstance, requestData);
      return response.data; // Return just the data, not the full response
    } catch (error) {
      if (error.response?.status === 401) {
        const { protocol, host } = window.location;
        window.location.href = `${protocol}//${host}/login`;
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrgColorAsync = createAsyncThunk(
  "addPitch/fetchOrgColor",
  async (params) => {
    const { axiosInstance } = params;
    const response = await fetchOrgColor(axiosInstance);
    return response;
  }
);

export const fetchSalesforcePitchContentsRecommendationAsync = createAsyncThunk(
  "addPitch/fetchSalesforcePitchContentsRecommendation",
  async (params) => {
    const { axiosInstance, ...requestData } = params;
    const response = await fetchSalesforcePitchContentsRecommendation(
      axiosInstance,
      requestData
    );
    console.log("RESPONSE ", response);
    return response;
  }
);

export const fetchCrmContactsAsync = createAsyncThunk(
  "addPitch/fetchCrmContacts",
  async (params) => {
    const { axiosInstance, ...requestData } = params;
    console.log("getting here 3", requestData);
    const response = await fetchCrmContacts(axiosInstance, requestData);
    console.log("RESPONSE ", response);
    return response;
  }
);

// Add async thunk for fetching layout
export const fetchPitchLayoutCode = createAsyncThunk(
  "addPitch/fetchPitchLayoutCode",
  async ({ axiosInstance, layoutId, viewerId }) => {
    const response = await axiosInstance.post(`/pitch-preview-content`, {
      content_name: `${layoutId}_html_code`,
      viewerId,
    });
    return response.data;
  }
);

// Async thunk for fetching profile data
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async ({ axiosInstance, viewer_id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/view-user/${viewer_id}`,
        { viewer_id },
        { withCredentials: true }
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for fetching background image
export const fetchBackgroundImage = createAsyncThunk(
  "pitch/fetchBackgroundImage", // Updated action name
  async ({ axiosInstance, viewer_id, layoutId }, { rejectWithValue }) => {
    try {
      // Create both requests at once
      const requests = [
        // Main background image
        axiosInstance.post(
          `/pitch-preview-content`,
          {
            viewerId: viewer_id,
            content_name: `${layoutId}_background_image`,
          },
          {
            responseType: "blob",
            withCredentials: true,
          }
        ),
        // Login background image
        axiosInstance.post(
          `/pitch-preview-content`,
          {
            viewerId: viewer_id,
            content_name: `${layoutId}_background_login_image`,
          },
          {
            responseType: "blob",
            withCredentials: true,
          }
        ),
      ];

      // Execute both requests in parallel
      const [response1, response2] = await Promise.all(requests);

      // Process responses
      return {
        BgBlobUrl: URL.createObjectURL(response1.data),
        loginBgBlobUrl: URL.createObjectURL(response2.data),
      };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to fetch background images",
        error: error.response?.data || error.message,
        layoutId,
      });
    }
  }
);

// Add this to your existing async thunks
export const checkActivePitchForCrmRecordAsync = createAsyncThunk(
  "addPitch/checkActivePitchForCrmRecord",
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

// Rename and modify the function for add pitch
const removeAsteriskLabelsAdd = (text) => {
  if (!text) {
    console.warn("removeAsteriskLabelsAdd received undefined/null input");
    return "";
  }

  console.log("STR (Add Pitch)", text);

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
    console.error("Error in removeAsteriskLabelsAdd:", error);
    return String(text).trim();
  }
};

const pitchSlice = createSlice({
  name: "addPitch",
  initialState,
  reducers: {
    // Toggle between TOFU and regular pitch
    toggleTofu: (state) => {
      state.isTofu = !state.isTofu;
      // Reset CRM-related fields when toggling TOFU
      if (state.isTofu) {
        state.crmType = "";
        state.entityType = "";
        state.entityId = "";
        state.entityName = "";
      }
    },

    setLayoutCode: (state, action) => {
      state.layoutCode = action.payload;
    },
    setPreviewLoading: (state, action) => {
      state.previewLoading = action.payload;
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

    //setSelectedCrm
    setSelectedCrm: (state, action) => {
      state.crmType = action.payload.crmType;
      state.selectedConnectionId = action.payload.selectedCrmId;
      state.selectedConnectionName = action.payload.selectedCrmName;
    },

    // Set entity type (deal/account/opportunity/company)
    setEntityType: (state, action) => {
      state.entityType = action.payload;
    },

    // Set entity setSelectedCrm
    setEntityDetails: (state, action) => {
      state.entityId = action.payload.id;
      state.entityName = action.payload.name;
    },

    // Update basic pitch info
    setPitchName: (state, action) => {
      state.pitchName = action.payload;
    },

    setPitchLayout: (state, action) => {
      state.pitchLayout = action.payload;
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

    // Color management
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
    },

    setPitchContacts: (state, action) => {
      console.log("Reducer received:", action.payload); // Add this
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

    setProcessOverVeiw: (state, action) => {
      state.processOverVeiw = action.payload;
    },

    setActionPlan: (state, action) => {
      state.actionPlan = action.payload;
    },

    setEsigner: (state, action) => {
      state.eSigner = action.payload;
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
    updateSectionName: (state, action) => {
      const { sectionIndex, newName } = action.payload;
      if (state.sections[sectionIndex]) {
        state.sections[sectionIndex].name = newName;
      }
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
          id:
            content.id ||
            `temp-content-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 5)}`,
        }));

        // Insert contents
        section.contents.push(...arrangedContentsToAdd);
      }
    },

    removeHighlightVideo: (state, action) => {
      // action.payload should be the index to remove
      state.highlightVideos.splice(action.payload, 1);
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

    toggleBusinessEmailOnly: (state, action) => {
      state.businessEmailOnly = action.payload;
    },

    addSelectedGroups: (state, action) => {
      state.selectedGroups = action.payload;
    },

    addNewSection: (state, action) => {
      const sectionData = action.payload.section || {};
      const originalContents = sectionData.contents || [];

      const updatedContents = Array.isArray(originalContents)
        ? originalContents.map((content, index) => ({
            ...content,
            arrangement: index + 1, // Keep content arrangement logic
            id:
              content.id ||
              `temp-content-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 5)}`,
          }))
        : [];

      const newSection = {
        ...sectionData,
        contents: updatedContents,
        arrangement: state.sections.length + 1, // Section arrangement
        // Add a unique dummy ID ONLY to the section (not contents)
        id:
          sectionData.id ||
          `temp-section-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 5)}`,
      };

      state.sections.push(newSection);
    },

    // addContentToSection: (state, action) => {
    //   state.sections[action.payload.data.index].contents.push(
    //     action.payload.data.content
    //   );
    // },

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
      const { id, value } = action.payload;

      // Check if field exists in fieldValues
      const fieldIndex = state.fieldValues.findIndex((f) => f.id === id);

      if (fieldIndex >= 0) {
        // Update existing field
        state.fieldValues[fieldIndex].value = value;
      } else {
        // Add new field (fallback - shouldn't happen with proper initialization)
        const matchingField = state.customFields.find((f) => f.id === id);
        if (matchingField) {
          state.fieldValues.push({
            id,
            field_name: matchingField.name,
            value,
            mandatory: matchingField.mandatory,
          });
        }
      }
    },

    setAllContacts: (state, action) => {
      state.allContacts = action.payload;
    },
    setSelectedContacts: (state, action) => {
      state.selectedContacts = action.payload;
    },
    addContact: (state, action) => {
      state.allContacts.push(action.payload);
    },
    deleteContact: (state, action) => {
      state.allContacts = state.allContacts.filter(
        (contact) => contact.id !== action.payload
      );
      state.selectedContacts = state.selectedContacts.filter(
        (contact) => contact.id !== action.payload
      );
    },
    toggleContactSelection: (state, action) => {
      const contact = state.allContacts.find((c) => c.id === action.payload);
      const isSelected = state.selectedContacts.some(
        (c) => c.id === action.payload
      );

      if (isSelected) {
        state.selectedContacts = state.selectedContacts.filter(
          (c) => c.id !== action.payload
        );
      } else if (contact) {
        state.selectedContacts.push(contact);
      }
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

    updateAllSections: (state, action) => {
      console.log("another console.log the dslfjdaskl ", action.payload);

      const sectionsWithTempIds = action.payload.map((section) => ({
        ...section,
        id:
          section.id ||
          `temp-section-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 5)}`,
        contents: Array.isArray(section.contents)
          ? section.contents.map((content) => ({
              ...content,
              id:
                content.id ||
                `temp-content-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 5)}`,
            }))
          : [],
      }));

      state.sections = sectionsWithTempIds;
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

    // Content Grouping Actions
    setContentGrouping: (state, action) => {
      state.contentGrouping = action.payload;
    },

    addContentGroup: (state, action) => {
      const { name } = action.payload;
      const newGroup = {
        name,
        // order: state.content_groups.length + 1,
      };
      state.content_groups.push(newGroup);
    },

    renameContentGroup: (state, action) => {
      const { oldName, newName } = action.payload;
      console.log("REACHED HERE ", oldName, newName);
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

    removeContentGroup: (state, action) => {
      const groupName = action.payload;
      // Remove the group
      state.content_groups = state.content_groups.filter(
        (group) => group.name !== groupName
      );

      // Remove group_name from all contents that belonged to this group
      state.sections.forEach((section) => {
        section.contents.forEach((content) => {
          if (content.group_name === groupName) {
            delete content.group_name;
          }
        });
      });

      // Update order for remaining groups
      state.content_groups.forEach((group, index) => {
        group.order = index + 1;
      });
    },

    updateContentGroup: (state, action) => {
      const { oldName, newName } = action.payload;
      const group = state.content_groups.find((g) => g.name === oldName);
      if (group) {
        group.name = newName;

        // Update group_name in all contents
        state.sections.forEach((section) => {
          section.contents.forEach((content) => {
            if (content.group_name === oldName) {
              content.group_name = newName;
            }
          });
        });
      }
    },

    assignContentToGroup: (state, action) => {
      const { sectionIndex, contentIndex, groupName } = action.payload;
      console.log("assignContentToGroup", action.payload);
      if (
        state.sections[sectionIndex] &&
        state.sections[sectionIndex].contents[contentIndex]
      ) {
        console.log("state.sections", state.sections[sectionIndex]);

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

    // Modified existing actions to handle group_name
    addContentToSection: (state, action) => {
      const content = action.payload.data.content;
      // Preserve group_name if it exists
      state.sections[action.payload.data.index].contents.push(content);
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

    // Add this to your pitchFeaturesSlice reducers
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
        console.log("edited data", editedData);
        console.log("PitchState", state.sections);
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
        console.log("prev content",state.sections[sectionIndex].contents[contentIndex] )
        console.log("Data recieved", editedData)
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

  setActivePitchCheck: (state, action) => {
    state.activePitchCheck = action.payload;
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

        state.title = removeAsteriskLabelsAdd(titleMatch?.[1]?.trim() || "");
        state.headline = removeAsteriskLabelsAdd(
          headlineMatch?.[1]?.trim() || ""
        );
        state.description = removeAsteriskLabelsAdd(
          descriptionMatch?.[1]?.trim() || ""
        );
      })

      .addCase(generateAIContentAsync.rejected, (state) => {
        state.aiLoading = false;
      })

      .addCase(fetchOrgColorAsync.pending, (state) => {
        state.orgColorLoading = true;
      })
      .addCase(fetchOrgColorAsync.fulfilled, (state, action) => {
        state.orgColorLoading = false;
        state.orgColor = action.payload.OrganisationColor;
      })
      .addCase(fetchOrgColorAsync.rejected, (state) => {
        state.orgColorLoading = false;
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
      })
      .addCase(fetchCrmContactsAsync.rejected, (state) => {
        state.crmContactsLoading = false;
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

      .addCase(fetchUserProfile.pending, (state) => {
        state.userDetailsLoading = true;
      })

      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        const userDetails = {
          organisation: action.payload.organisation,
          profilePhoto: action.payload.profile_photo,
          jobTitle: action.payload.job_title,
          firstName: action.payload.first_name,
          lastName: action.payload.last_name,
          calendarLink: action.payload.calendar_link,
          email: action.payload.email,
          microsoft_clarity_project_id:
            action.payload.microsoft_clarity_project_id,
        };
        state.userDetails = userDetails;
        state.userDetailsLoading = false;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.userDetailsLoading = false;
      })

      // .addCase(fetchBackgroundImage.pending, (state) => {
      //   // state.userDetailsLoading = true;
      // })

      .addCase(fetchBackgroundImage.fulfilled, (state, action) => {
        state.images.background.file = action.payload.BgBlobUrl;
        state.images.background.name = "Default from Layout";
        state.images.loginBackground.file = action.payload.loginBgBlobUrl;
        state.images.loginBackground.name = "Default from Layout";
      })
      // .addCase(fetchBackgroundImage.rejected, (state) => {
      //   state.userDetailsLoading = false;
      // });

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
  toggleTofu,
  toggleEntityType,
  setSelectedCrm,
  setAiLoading,
  setEntityType,
  setEntityDetails,
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
  setIsTaglineFormOpen,
  setAvailableFieldTypes,
  setCustomFields,
  setFieldValues,
  updateFieldValue,
  insertContentsIntoSection,
  setAllContacts,
  setSelectedContacts,
  addContact,
  deleteContact,
  toggleContactSelection,
  setProcessOverVeiw,
  setActionPlan,
  setEsigner,
  updateSectionName,
  resetPitchForm,
  setLoading,
  setError,
  setContentGrouping,
  addContentGroup,
  removeContentGroup,
  updateContentGroup,
  assignContentToGroup,
  renameContentGroup,
  updateFeatureInSection,
  setActivePitchCheck,
  setUserMessage,
  setHtmlBlock,
  setFileUploader,
  onSignatureRevoke
} = pitchSlice.actions;

// Export reducer
export default pitchSlice.reducer;
