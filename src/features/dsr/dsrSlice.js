import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// Thunk to fetch viewerId from cookie
export const fetchViewerId = createAsyncThunk(
  "dsr/fetchViewerId",
  async (_, { rejectWithValue }) => {
    try {
      const userDataCookie = Cookies.get("userData");
      if (userDataCookie) {
        const userData = JSON.parse(userDataCookie);
        return userData?.user?.id || null;
      }
      return null;
    } catch (error) {
      console.error("Error parsing userData cookie:", error);
      return rejectWithValue(null);
    }
  }
);

// Async thunks for API calls
export const fetchPitchData = createAsyncThunk(
  "dsr/fetchPitchData",
  async (
    { pitchId, languageCode = null, axiosInstance },
    { rejectWithValue }
  ) => {
    try {
      const url = languageCode
        ? `/retrieve-pitch-sections-and-contents/${pitchId}?language_code=${languageCode}`
        : `/retrieve-pitch-sections-and-contents/${pitchId}`;
      const response = await axiosInstance.get(url, { withCredentials: true });

      // Process the data to extract contents from pitch sections
      const data = response.data;
      if (data && data.pitchSections) {
        // Extract contents from pitch sections
        const extractedContents = data.pitchSections.flatMap((section) =>
          section.contents.map((content) => ({
            id: content.id,
            content_id: content.content_id,
            content: content.content,
            tagline: content.tagline,
            content_name: content.content_name,
            content_mimetype: content.content_mimetype,
            content_link: content.content_link,
            section_id: section.id,
            section_name: section.name,
          }))
        );

        // Add the extracted contents to the data object
        data.extractedContents = extractedContents;
      }

      return data;
    } catch (error) {
      console.error("Error fetching pitch data:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchClientLogo = createAsyncThunk(
  "dsr/fetchClientLogo",
  async ({ pitchId, axiosInstance, viewerId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/pitch-preview-content`,
        { viewerId: viewerId, content_name: `${pitchId}_client_logo` },
        { responseType: "blob", withCredentials: true }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      return rejectWithValue("Failed to fetch client logo");
    }
  }
);

export const fetchBackgroundImage = createAsyncThunk(
  "dsr/fetchBackgroundImage",
  async (
    { pitchId, pitchLayoutId, axiosInstance, viewerId },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post(
        `/pitch-preview-content`,
        { viewerId: viewerId, content_name: `${pitchId}_background_image` },
        { responseType: "blob", withCredentials: true }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      try {
        const fallbackResponse = await axiosInstance.post(
          `/pitch-preview-content`,
          {
            viewerId,
            content_name: `${pitchLayoutId}_background_image`,
          },
          { responseType: "blob", withCredentials: true }
        );
        return URL.createObjectURL(fallbackResponse.data);
      } catch (fallbackError) {
        return rejectWithValue("Failed to fetch background image");
      }
    }
  }
);

export const fetchHtmlCode = createAsyncThunk(
  "dsr/fetchHtmlCode",
  async (
    { viewerId, pitchLayoutId, baseURL, axiosInstance },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(
        `${baseURL}/pitch-preview-content`,
        {
          viewerId,
          content_name: `${pitchLayoutId}_html_code`,
        },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching HTML code:", error);
      return rejectWithValue("Failed to fetch HTML code");
    }
  }
);

export const fetchEmails = createAsyncThunk(
  "dsr/fetchEmails",
  async ({ pitchId, axiosInstance }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/extract-emails`,
        {
          keyword: pitchId,
        },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching emails:", error);
      return rejectWithValue(error.res?.data || error.message);
    }
  }
);

export const generateEmailDraft = createAsyncThunk(
  "dsr/generateEmailDraft",
  async ({ user_input, email_content, axiosInstance }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/generate-dsr-email-draft",
        {
          user_input,
          email_content,
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to generate email draft"
      );
    }
  }
);

export const preloadContentBlobs = createAsyncThunk(
  "dsr/preloadContentBlobs",
  async ({ contentItems, viewer_id, axiosInstance }, { rejectWithValue }) => {
    try {
      console.log(
        "Starting preload of content blobs for",
        contentItems.length,
        "items"
      );

      // Create a map to store the blob URLs
      const blobsMap = {};

      // Process each content item in sequence to avoid overloading the server
      for (const contentItem of contentItems) {
        try {
          console.log(
            "Preloading content:",
            contentItem.id,
            contentItem.tagline
          );

          // Get the revspireToken cookie
          const token = Cookies.get("revspireToken") || null;

          // Use the correct content_id field from the extracted data
          const contentId = contentItem.content_id || contentItem.content;

          if (!contentId) {
            console.error("Missing content_id for item:", contentItem);
            continue;
          }

          // Make the API call to fetch the content blob
          const response = await axiosInstance.post(
            `/open-content`,
            {
              viewerId: viewer_id,
              contentId: contentId,
              manual_token: token,
            },
            {
              responseType: "blob",
              withCredentials: true,
            }
          );

          // Create a blob URL and store it in the map
          const blobUrl = URL.createObjectURL(response.data);
          blobsMap[contentItem.id] = {
            blobUrl,
            contentId: contentId,
            tagline: contentItem.tagline,
            contentData: contentItem,
            mimeType:
              contentItem.content_mimetype ||
              response.headers["content-type"] ||
              "application/octet-stream",
          };

          console.log(
            "Successfully preloaded content:",
            contentItem.id,
            contentItem.tagline
          );
        } catch (error) {
          console.error(
            "Failed to preload content item:",
            contentItem.id,
            error
          );
          // Continue with other items even if this one fails
        }
      }

      console.log(
        "Completed preloading content blobs. Total loaded:",
        Object.keys(blobsMap).length
      );
      return blobsMap;
    } catch (error) {
      console.error("Error in preloadContentBlobs:", error);
      return rejectWithValue(
        error.message || "Failed to preload content blobs"
      );
    }
  }
);

const initialState = {
  viewerId: null,
  pitchData: null,
  pitchLayoutId: null,
  userDetails: null,
  threads: [],
  pitchEngagements: [],
  isContentLoading: false,
  pitchVersionLoader: false,
  languageCode: "",
  orgHex: "#3D44FF",
  backgroundImageData: null,
  clientLogo: null,
  layout: null,
  contentData: [],
  blobsData: {}, // Object to store preloaded content blobs
  blobsLoading: false,
  isBackgroundImageLoading: false,
  isClientLogoLoading: false,
  isHtmlCodeLoading: false,
  htmlCode: null,
  htmlCodeError: null,
  backgroundImageError: null,
  allResourcesLoaded: false, // Flag to indicate if all crucial resources are loaded
  contentItemsLoaded: 0, // Track how many content items have been loaded
  contentItemsTotal: 0, // Total number of content items to load
  pitchAnalyticsOpen: false,
  analyticsMode: false,
  analyticsPopupVisible: false,
  analyticsDetails: null,
  pitchContentEngagements: [],
  isWarningDialogOpen: false,
  isThreadsDropdownOpen: false,
  emails: { groupedEmails: {}, summaries: {}, mailboxEmail: {} },
  emailsError: null,
  emailsLoading: false,
  emailDraft: null,
  emailDraftLoading: false,
  emailDraftError: null,
};

const dsrSlice = createSlice({
  name: "dsr",
  initialState,
  reducers: {
    setOrgHex: (state, action) => {
      state.orgHex = action.payload;
    },
    setClientLogo: (state, action) => {
      state.clientLogo = action.payload;
    },
    setLanguageCode: (state, action) => {
      state.languageCode = action.payload;
    },
    setAvailableLanguages: (state, action) => {
      state.availableLanguages = action.payload;
    },
    setPitchVersionLoader: (state, action) => {
      state.pitchVersionLoader = action.payload;
    },
    setAnalyticsMode: (state, action) => {
      state.analyticsMode = action.payload;
    },
    setPitchAnalyticsOpen: (state, action) => {
      state.pitchAnalyticsOpen = action.payload;
    },
    setClarityEnabled: (state, action) => {
      state.clarityEnabled = action.payload;
    },
    setAnalyticsPopupVisible: (state, action) => {
      state.analyticsPopupVisible = action.payload;
    },
    setAnalyticsDetails: (state, action) => {
      state.analyticsDetails = action.payload;
    },
    setPitchVersionModalOpen: (state, action) => {
      state.pitchVersionModalOpen = action.payload;
    },
    setTimerModalOpen: (state, action) => {
      state.timerModalOpen = action.payload;
    },
    setPitchContentEngagements: (state, action) => {
      state.pitchContentEngagements = action.payload;
    },
    setIsWarningDialogOpen: (state, action) => {
      state.isWarningDialogOpen = action.payload;
    },
    setBlobsLoading: (state, action) => {
      state.blobsLoading = action.payload;
    },
    setIsThreadsDropdownOpen: (state, action) => {
      state.isThreadsDropdownOpen = action.payload;
    },
    setIsClientLogoLoading: (state, action) => {
      state.isClientLogoLoading = action.payload;
    },
    setAllResourcesLoaded: (state, action) => {
      state.allResourcesLoaded = action.payload;
    },
    setContentLoadingProgress: (state, action) => {
      state.contentItemsLoaded = action.payload.loaded;
      state.contentItemsTotal = action.payload.total;
      // Update allResourcesLoaded if all content items are loaded
      if (
        action.payload.loaded >= action.payload.total &&
        action.payload.total > 0
      ) {
        state.allResourcesLoaded = true;
      }
    },
    setEmails: (state, action) => {
      state.emails = action.payload;
    },
    setEmailsError: (state, action) => {
      state.emailsError = action.payload;
    },
    setEmailsLoading: (state, action) => {
      state.emailsLoading = action.payload;
    },
    clearEmailDraft: (state) => {
      state.emailDraft = null;
      state.emailDraftError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchViewerId.fulfilled, (state, action) => {
        state.viewerId = action.payload;
      })
      // Handle fetchPitchData
      .addCase(fetchPitchData.pending, (state) => {
        state.isContentLoading = true;
        state.blobsLoading = true;
      })
      .addCase(fetchPitchData.fulfilled, (state, action) => {
        const data = action.payload;
        if (!data) {
          state.isContentLoading = false;
          return;
        }

        if (
          !data.success &&
          data.message === "The pitch has been deactivated."
        ) {
          state.isWarningDialogOpen = true;
        } else {
          state.contentData = data.extractedContents;
          state.pitchData = data;
          state.pitchLayoutId = data?.pitch?.pitch_layout;
          state.userDetails = data.userDetails[0];
          state.threads = data.threadsWithComments || [];
          state.pitchEngagements = data?.pitchEngagements || [];

          // Set orgHex
          if (data?.dsr_primary_color) {
            state.orgHex = `#${data.dsr_primary_color}`;
          }
        }
        state.isContentLoading = false;
      })
      .addCase(fetchPitchData.rejected, (state, action) => {
        state.isContentLoading = false;
        state.blobsLoading = false;
        console.error("Failed to fetch pitch data:", action.payload);
      })

      // Handle fetchClientLogo
      .addCase(fetchClientLogo.pending, (state) => {
        state.isClientLogoLoading = true;
      })
      .addCase(fetchClientLogo.fulfilled, (state, action) => {
        state.clientLogo = action.payload;
        state.isClientLogoLoading = false;
        console.log("Client logo successfully loaded", action.payload);
      })
      .addCase(fetchClientLogo.rejected, (state) => {
        state.isClientLogoLoading = false;
        console.log("Failed to fetch client logo", state);
      })

      // Handle fetchBackgroundImage
      .addCase(fetchBackgroundImage.pending, (state) => {
        state.isBackgroundImageLoading = true;
      })
      .addCase(fetchBackgroundImage.fulfilled, (state, action) => {
        state.backgroundImageData = action.payload;
        state.isBackgroundImageLoading = false;
      })
      .addCase(fetchBackgroundImage.rejected, (state, action) => {
        state.isBackgroundImageLoading = false;
        state.backgroundImageError = action.payload;
        console.error("Failed to fetch background image:", action.payload);
      })

      // Handle fetchHtmlCode
      .addCase(fetchHtmlCode.pending, (state) => {
        state.isHtmlCodeLoading = true;
      })
      .addCase(fetchHtmlCode.fulfilled, (state, action) => {
        state.htmlCode = action.payload;
        state.isHtmlCodeLoading = false;
      })
      .addCase(fetchHtmlCode.rejected, (state, action) => {
        state.isHtmlCodeLoading = false;
        state.htmlCodeError = action.payload;
        console.error("Failed to fetch HTML code:", action.payload);
      })

      // Handle preloadContentBlobs
      .addCase(preloadContentBlobs.pending, (state) => {
        state.blobsLoading = true;
      })
      .addCase(preloadContentBlobs.fulfilled, (state, action) => {
        state.blobsData = action.payload;
        state.blobsLoading = false;

        // Update loading progress
        const loadedCount = Object.keys(action.payload).length;
        state.contentItemsLoaded = loadedCount;
        // Check if all resources are loaded
        if (
          loadedCount >= state.contentItemsTotal &&
          state.contentItemsTotal > 0
        ) {
          state.allResourcesLoaded = true;
        }
      })
      .addCase(preloadContentBlobs.rejected, (state, action) => {
        state.blobsLoading = false;
        console.error("Failed to preload content blobs:", action.payload);
      })
      .addCase(fetchEmails.pending, (state) => {
        state.emailsLoading = true;
      })
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.emailsLoading = false;
        state.emails = {
          groupedEmails: action.payload.groupedEmails || {},
          summaries: action.payload.summaries || {},
          mailboxEmail: action.payload.mailboxEmail || {},
        };
      })
      .addCase(fetchEmails.rejected, (state, action) => {
        state.emailsLoading = false;
        state.emailsError = action.payload;
      })
      .addCase(generateEmailDraft.pending, (state) => {
        state.emailDraftLoading = true;
        state.emailDraftError = null;
      })
      .addCase(generateEmailDraft.fulfilled, (state, action) => {
        state.emailDraftLoading = false;
        state.emailDraft = action.payload;
      })
      .addCase(generateEmailDraft.rejected, (state, action) => {
        state.emailDraftLoading = false;
        state.emailDraftError =
          action.payload || "Failed to generate email draft";
      });
  },
});

export const {
  setOrgHex,
  setLanguageCode,
  setAvailableLanguages,
  setPitchVersionLoader,
  setAnalyticsMode,
  setPitchAnalyticsOpen,
  setClarityEnabled,
  setAnalyticsPopupVisible,
  setAnalyticsDetails,
  setPitchVersionModalOpen,
  setTimerModalOpen,
  setPitchContentEngagements,
  setIsWarningDialogOpen,
  setBlobsLoading,
  setIsThreadsDropdownOpen,
  setIsClientLogoLoading,
  setAllResourcesLoaded,
  setContentLoadingProgress,
  setClientLogo,
  setEmails,
  setEmailsError,
  setEmailsLoading,
  clearEmailDraft,
} = dsrSlice.actions;

export default dsrSlice.reducer;
