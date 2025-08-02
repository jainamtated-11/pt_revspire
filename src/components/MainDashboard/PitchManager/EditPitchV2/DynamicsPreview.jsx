import React, { useEffect, useState, useRef, useMemo } from "react";
import { profilePhotoHandler } from "../../../../utils/mediaUtils.js";
import { getFileType, getVideoId } from "../../../../utils/mediaUtils.js";
import { useQuery } from "react-query";
import * as Babel from "@babel/standalone";
import PdfViewer from "../../../../utility/PdfViewer.jsx";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import {
  faExpand,
  faFileExcel,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import { TbLayout2 } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { FaRegFilePdf, FaX } from "react-icons/fa6";
import { MdOutlineImage } from "react-icons/md";
import { GrDocumentText } from "react-icons/gr";
import { BiSolidVideos } from "react-icons/bi";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { useContext } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { Document, Page, pdfjs } from "react-pdf";
import {
  fetchPitchLayoutCode,
  setContentGrouping,
  setProcessOverVeiw,
  fetchPitchBackgroundImage,
  setActionPlan,
  setPitchActiveStatus,
  setEsigner,
  setUserMessage,
  setHtmlBlock,
  setFileUploader,
} from "../../../../features/pitch/editPitchSlice";
import backgroundPlaceholderImage from "../../../../assets/BackgoundPlaceholder.jpeg";
//FONTS
import "@fontsource/montserrat"; // Default weight (400)
import "@fontsource/montserrat/500.css"; // Semi-bold
import "@fontsource/montserrat/600.css"; // Semi-bold
import "@fontsource/montserrat/700.css"; // Bold
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import ContentModal from "../../ContentManager/ContentTable/ContentModal";
import LoadingSpinner from "../../../../utility/LoadingSpinner.jsx";
import { ChevronLeft, ChevronRight, Check, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import ESignerPreview from "../PitchContentFeatures/Esigner/ESignPreview.jsx";
import ProcessOverviewPreview from "../PitchContentFeatures/ProcessOverview/ProcessOverviewPreview.jsx";
import ActionPlanPreview from "../PitchContentFeatures/ActionPlan/ActionPlanPreview.jsx";
import UserMessagePreview from "../PitchContentFeatures/UserMessage/UserMessagePreview.jsx";
import HTMLBlockPreview from "../PitchContentFeatures/HTMLBlock/HTMLBlockPreview.jsx";
import FileUploadPreview from "../PitchContentFeatures/FileUploader/FileUploadPreview.jsx";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DynamicsPreview = ({ setLoadingState }) => {
  const dispatch = useDispatch();
  const { viewer_id } = useContext(GlobalContext);
  const [layout, setLayout] = useState(null);
  const handleSetTimerStart = () => {
    console.log("I AM HERER");
  };
  const sendDataToParent = () => {
    console.log("I AM HERER");
  };
  const handleCustomButtons = () => {
    console.log("I AM HERER");
  };
  const parent = () => {
    console.log("I AM HERER");
  };
  // Add this state to track fetched content IDs
  const [fetchedContentIds, setFetchedContentIds] = useState(new Set());
  const [cachedBlobs, setCachedBlobs] = useState([]);
  const pitchState = useSelector((state) => state.editPitchSlice);
  const [autoUpdate, setAutoUpdate] = useState(true); // Default to true for real-time updates
  const [backgroundImageData, setBackgroundImageData] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [DSRconfig, setDSRconfig] = useState({
    visibleSectionsCount: 3,
    initialContentCounts: 4,
    addSectionCount: 3,
    addContentCount: 4,
    currentPopupStyle: "default",
    contentGrouping: false,
    processOverVeiw: false,
    actionPlan: false,
    eSigner: false,
    userMessage: false,
    htmlBlock: false,
    fileUploader: false,
  });

  // Added state to store a static copy of data when autoUpdate is false
  const [staticData, setStaticData] = useState(null);
  // Track if there are pending changes when autoUpdate is off
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  // Add a reference to store the latest live data when autoUpdate is off

  //states for content modal
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentModalLoading, setContentModalLoading] = useState(false);
  const { setViewContent, setContentModalOpen } = useContext(GlobalContext);

  const latestLiveDataRef = useRef(null);
  const handleToggle = () => {
    const newAutoUpdate = !autoUpdate;
    setAutoUpdate(newAutoUpdate);

    // If turning off auto-update, create a deep copy of current data
    if (!newAutoUpdate) {
      createStaticDataCopy();
      setHasPendingChanges(false);
    }
    // If turning on auto-update, set staticData to null to use live data
    else {
      setStaticData(null);
      setHasPendingChanges(false);
    }
  };

  //Sets local states in edit Pitch Slice to show or not show extra features like group and process overview
  useEffect(() => {
    dispatch(setContentGrouping(DSRconfig.contentGrouping));
    dispatch(setProcessOverVeiw(DSRconfig.processOverVeiw));
    dispatch(setActionPlan(DSRconfig.actionPlan));
    dispatch(setEsigner(DSRconfig.eSigner));
    dispatch(setUserMessage(DSRconfig.userMessage));
    dispatch(setHtmlBlock(DSRconfig.htmlBlock));
    dispatch(setFileUploader(DSRconfig.fileUploader));
  }, [DSRconfig.contentGrouping, layout]);

  // Function to create a deep copy of all relevant state
  const createStaticDataCopy = async () => {
    // Ensure all blobs are loaded before creating the static copy
    const currentBlobs =
      blobs ||
      (await fetchContentBlobs(
        pitchState.sections.flatMap((section) => section.contents || [])
      ));

    const newStaticData = {
      backgroundImageData,
      pitchState: JSON.parse(JSON.stringify(pitchState)),
      highlightVideosWithSasUrls: highlightVideosWithSasUrls
        ? JSON.parse(JSON.stringify(highlightVideosWithSasUrls))
        : [],
      blobs: currentBlobs ? JSON.parse(JSON.stringify(currentBlobs)) : [],
      currentSection,
      showDescription,
      showSections,
      showViews,
      selectedSections: [...selectedSections],
      currentIndex,
    };

    setStaticData(newStaticData);
    latestLiveDataRef.current = newStaticData;
    setHasPendingChanges(false);

    // Force a re-render by updating a dummy state
    setRefreshKey((prev) => prev + 1);
  };

  // Function to refresh the preview without changing toggle state
  const handleRefreshPreview = async () => {
    if (!autoUpdate) {
      await createStaticDataCopy();
    }
  };

  // Ref to store the placeholder blob URL
  const placeholderBlobRef = useRef(null);
  // Function to convert image to blob URL
  const convertImageToBlobUrl = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error converting image to blob:", error);
      return null;
    }
  };
  // Set up placeholder blob URL on mount
  useEffect(() => {
    const setupPlaceholder = async () => {
      const blobUrl = await convertImageToBlobUrl(backgroundPlaceholderImage);
      if (blobUrl) {
        placeholderBlobRef.current = blobUrl;
        // If no background image is set, use the placeholder
        if (!pitchState.images?.background?.file) {
          setBackgroundImageData(blobUrl);
        }
      }
    };
    setupPlaceholder();
    // Cleanup function
    return () => {
      if (placeholderBlobRef.current) {
        URL.revokeObjectURL(placeholderBlobRef.current);
      }
      if (backgroundImageData && backgroundImageData.startsWith("blob:")) {
        URL.revokeObjectURL(backgroundImageData);
      }
    };
  }, []);
  // Handle background image changes
  useEffect(() => {
    // Only update if autoUpdate is true or staticData is null
    if (autoUpdate || !staticData) {
      const backgroundImageFile = pitchState.images?.background?.file;
      const updateBackgroundImage = async () => {
        if (backgroundImageFile instanceof File) {
          const newUrl = URL.createObjectURL(backgroundImageFile);
          setBackgroundImageData(newUrl);
        } else if (backgroundImageFile) {
          setBackgroundImageData(backgroundImageFile);
        } else {
          // Use placeholder if no background image is set
          setBackgroundImageData(placeholderBlobRef.current || "");
        }
      };
      updateBackgroundImage();
      // Cleanup function
      return () => {
        if (backgroundImageData && backgroundImageData.startsWith("blob:")) {
          URL.revokeObjectURL(backgroundImageData);
        }
      };
    }
  }, [pitchState.images?.background?.file, autoUpdate]);

  const normalizeHighlightVideos = (highlightVideos) => {
    return highlightVideos.map((video) => {
      // For videos from backend (already have id)
      if (video.id && typeof video.id === "string") {
        try {
          const token = getCookieValue("revspireToken");
          const response = axiosInstance.post(
            `/pitch-preview-content`,
            {
              viewerId: viewer_id,
              content_name: `${video.id}`,
              manual_token: token,
            },
            { responseType: "json", withCredentials: true }
          );
          return {
            ...video,
            sasUrl: response.data.sasUrl,
          };
        } catch (error) {
          console.error(`Error fetching SAS URL for video ${video.id}:`, error);
          return { ...video, sasUrl: null };
        }
      }
      // For local videos (not yet in database)
      else if (video.url && video.url.startsWith("blob:")) {
        return {
          ...video,
          sasUrl: video.url, // Rename url to sasUrl for consistency
          id: video.id || Date.now().toString(), // Generate temp ID if needed
          mimetype: video.mimetype || "video/mp4", // Default mimetype
        };
      }
      return video;
    });
  };
  const fetchHighlightVideoSasUrls = async (highlightVideos) => {
    // First normalize all videos to use sasUrl consistently
    const normalizedVideos = normalizeHighlightVideos(highlightVideos);
    // Only fetch SAS URLs for videos that need them (have id but no sasUrl)
    const videosNeedingSas = normalizedVideos.filter(
      (video) => video.id && typeof video.id === "string" && !video.sasUrl
    );
    const videosWithSas = await Promise.all(
      videosNeedingSas.map(async (video) => {
        try {
          const token = getCookieValue("revspireToken");
          const response = await axiosInstance.post(
            `/pitch-preview-content`,
            {
              viewerId: viewer_id,
              content_name: `${video.id}`,
              manual_token: token,
            },
            { responseType: "json", withCredentials: true }
          );
          return {
            ...video,
            sasUrl: response.data.sasUrl,
          };
        } catch (error) {
          console.error(`Error fetching SAS URL for video ${video.id}:`, error);
          return { ...video, sasUrl: null };
        }
      })
    );
    // Merge results - keep local blob videos and add fetched SAS URLs
    return normalizedVideos.map((video) => {
      if (video.sasUrl) return video; // Already has URL (either blob or previously fetched)
      const fetchedVideo = videosWithSas.find((v) => v.id === video.id);
      return fetchedVideo || video;
    });
  };
  // Usage in the component
  const {
    data: highlightVideosWithSasUrls,
    isLoading: isHighlightVideoLoading,
  } = useQuery(
    ["highlightVideoSasUrls", pitchState.highlightVideos],
    () => fetchHighlightVideoSasUrls(pitchState.highlightVideos || []),
    {
      enabled:
        !!pitchState.highlightVideos && pitchState.highlightVideos.length > 0,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  // Funciton to activate a deactivated pitch
  const handleActivatePitch = async () => {
    try {
      const response = await axiosInstance.post("/activate-pitch", {
        pitchIds: [pitchState.pitchId],
        updated_by: viewer_id,
      });

      // Dispatch action to update the active status in Redux store
      dispatch(setPitchActiveStatus(1));
      toast.success("Pitch Activated Succesfully");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Error activating pitch:", error);
    }
  };

  // Create data object based on whether we're using live or static data
  const getLiveData = () => ({
    backgroundImageData,
    pitch: {
      description: pitchState.description || "Your Description Here",
      headline: pitchState.headline || "Your Headline here",
      owner: viewer_id,
      pitch_layout: pitchState.pitchLayout.id || "",
      primary_color: (
        pitchState.primaryColor ||
        pitchState.orgColor ||
        ""
      ).startsWith("#")
        ? pitchState.primaryColor || pitchState.orgColor
        : `#${pitchState.primaryColor || pitchState.orgColor}`,
      title: pitchState.title || "Your Test title here",
    },
    pitchSections: pitchState.sections || [],
    highlightVideosData: highlightVideosWithSasUrls || [],
    userDetails: pitchState.userDetails,
    demoProfilePic: "/src/assets/profile_avatar.png",
    hasMoreSections: false,
    isLoadingMore: false,
  });

  // Create data object that will be used for rendering
  const data = useMemo(() => {
    // If autoUpdate is false and we have static data, use it
    if (!autoUpdate && staticData) {
      return {
        backgroundImageData: staticData.backgroundImageData,
        pitch: {
          description:
            staticData.pitchState.description || "Your Description Here",
          headline: staticData.pitchState.headline || "Your Headline here",
          owner: viewer_id,
          pitch_layout: staticData.pitchState.pitchLayout.id || "",
          primary_color: (
            staticData.pitchState.primaryColor ||
            staticData.pitchState.orgColor ||
            ""
          ).startsWith("#")
            ? staticData.pitchState.primaryColor ||
              staticData.pitchState.orgColor
            : `#${
                staticData.pitchState.primaryColor ||
                staticData.pitchState.orgColor
              }`,
          title: staticData.pitchState.title || "Your Test title here",
        },
        pitchSections: staticData.pitchState.sections || [],
        highlightVideosData: staticData.highlightVideosWithSasUrls || [],
        userDetails: staticData.pitchState.userDetails,
        demoProfilePic: "/src/assets/profile_avatar.png",
        hasMoreSections: false,
        isLoadingMore: false,
      };
    }
    // Otherwise use live data
    const liveData = getLiveData();

    // If autoUpdate is off, check for pending changes
    if (!autoUpdate && latestLiveDataRef.current) {
      // Deep comparison to detect changes
      const hasChanges =
        JSON.stringify(liveData.pitch) !==
          JSON.stringify(latestLiveDataRef.current.pitchState) ||
        JSON.stringify(liveData.highlightVideosData) !==
          JSON.stringify(
            latestLiveDataRef.current.highlightVideosWithSasUrls
          ) ||
        liveData.backgroundImageData !==
          latestLiveDataRef.current.backgroundImageData;

      setHasPendingChanges(hasChanges);
    }

    return liveData;
  }, [
    autoUpdate,
    staticData,
    backgroundImageData,
    pitchState,
    highlightVideosWithSasUrls,
  ]);

  const orgHex = data.pitch.primary_color || "#F95D6A";
  const layoutId = data.pitch.pitch_layout;

  // Enhanced layout fetching with error tracking
  useEffect(() => {
    if (layoutId) {
      dispatch(
        fetchPitchLayoutCode({
          axiosInstance,
          layoutId: layoutId,
          viewerId: viewer_id,
        })
      );
    }
    if (pitchState.pitchId) {
      dispatch(
        fetchPitchBackgroundImage({
          axiosInstance,
          PitchId: pitchState.pitchId,
          viewerId: viewer_id,
        })
      );
    }
  }, [layoutId]);

  useEffect(() => {
    if (pitchState.layoutCode) {
      setLayout(pitchState.layoutCode);
    }
  }, [pitchState.layoutCode]);

  const featureMap = {
    ProcessOverview: ProcessOverviewPreview,
    ActionPlan: ActionPlanPreview,
    ESign: ESignerPreview,
    UserMessage: UserMessagePreview,
    HtmlBlock: HTMLBlockPreview,
    FileUploader: FileUploadPreview
    // B: ComponentB,
  };

  const [Component, setComponent] = useState(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [showDescription, setShowDescription] = useState(true);
  const handleShowDescription = () => setShowDescription(!showDescription);
  const [showSections, setShowSections] = useState(false);
  const [showViews, setShowViews] = useState(false);
  const [selectedSections, setSelectedSections] = useState([]);
  // const [selectedContent, setSelectedContent] = useState(
  //   data.pitchSections[0] ?? null
  // );
  const [currentIndex, setCurrentIndex] = useState(0);
  const axiosInstance = useAxiosInstance();

  const nextVideo = () => {
    if (!autoUpdate && staticData) return; // Prevent updates when autoUpdate is false
    setCurrentIndex(
      (prevIndex) => (prevIndex + 1) % data.highlightVideosData.length
    );
  };

  const prevVideo = () => {
    if (!autoUpdate && staticData) return; // Prevent updates when autoUpdate is false
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + data.highlightVideosData.length) %
        data.highlightVideosData.length
    );
  };

  const filteredData =
    selectedSections.length > 0
      ? data.pitchSections.filter((item) =>
          selectedSections.includes(item.name)
        )
      : data.pitchSections;

  const handleShowViews = () => {
    if (!autoUpdate && staticData) return; // Prevent updates when autoUpdate is false
    setShowViews(true);
  };

  const handleHideViews = () => {
    if (!autoUpdate && staticData) return; // Prevent updates when autoUpdate is false
    setShowViews(false);
  };

  const handleShowSections = () => {
    if (!autoUpdate && staticData) return; // Prevent updates when autoUpdate is false
    setShowSections(!showSections);
  };

  const toggleSection = (sectionName) => {
    if (!autoUpdate && staticData) return; // Prevent updates when autoUpdate is false
    setSelectedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  // const pitchId = pitchData?.pitch?.id;
  const MemoizedDocViewer = React.memo(
    ({ blobUrl }) => (
      <DocViewer
        documents={[{ uri: blobUrl }]}
        pluginRenderers={DocViewerRenderers}
        config={{
          header: {
            disableHeader: true,
            disableFileName: true,
            retainURLParams: true,
          },
        }}
        theme={{
          primary: "#5296d8",
          secondary: "#ffffff",
          tertiary: "#5296d899",
          text_primary: "#ffffff",
          text_secondary: "#5296d8",
          text_tertiary: "#00000099",
          disableThemeScrollbar: false,
        }}
      />
    ),
    (prevProps, nextProps) => prevProps.blobUrl === nextProps.blobUrl
  );
  MemoizedDocViewer.displayName = "MemoizedDocViewer";

  // Just toggle this to true/false to switch between local and remote layouts
  const useLocalLayout = false;

  // Paste your layout function here

  useEffect(() => {
    try {
      if (useLocalLayout) {
        console.log("Using local layout:", StandardLayout); // Debug log
        setComponent(() => StandardLayout);
        return;
      }
      // Existing remote layout code
      const compiledCode = Babel.transform(layout, {
        presets: ["react"],
      }).code;
      const Component = new Function(
        "React",
        "FontAwesomeIcon",
        "useMemo",
        "useRef",
        "profilePhotoHandler",
        "getFileType",
        "getVideoId",
        "sendDataToParent",
        "handleCustomButtons",
        "faFileExcel",
        "useEffect",
        "useState",
        "faExpand",
        "PdfViewer",
        "DocViewer",
        "DocViewerRenderers",
        "data",
        "motion",
        "AnimatePresence",
        "MemoizedDocViewer",
        "Document",
        "Page",
        "pdfjs",
        "setDSRconfig",
        `return ${compiledCode}`
      )(
        React,
        FontAwesomeIcon,
        useMemo,
        useRef,
        profilePhotoHandler,
        getFileType,
        getVideoId,
        sendDataToParent,
        handleCustomButtons,
        faFileExcel,
        useEffect,
        useState,
        faExpand,
        PdfViewer,
        DocViewer,
        DocViewerRenderers,
        data,
        motion,
        AnimatePresence,
        MemoizedDocViewer,
        Document,
        Page,
        pdfjs,
        setDSRconfig
      );
      setComponent(() => Component);
    } catch (error) {
      console.error("Error compiling or rendering component:", error);
    }
  }, [layout]);

  const handler = (index) => {
    if (!autoUpdate && staticData) return; // Prevent updates when autoUpdate is false
    setCurrentSection(index + 1);
  };

  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const fetchBlobData = async (contentId, contentMimeType) => {
    try {
      const token = getCookieValue("revspireToken");
      const isPDF = contentMimeType === "application/pdf";
      const isPublicURL = contentMimeType === "application/url";
      const isBlob =
        contentMimeType.startsWith("image/") ||
        contentMimeType.startsWith("video/");

      const requestData = {
        viewerId: viewer_id,
        contentId: contentId,
        manual_token: token,
        ...(isPDF && { pageNumber: 1 }),
      };

      if (isPublicURL) {
        return { isPublicURL: true };
      }

      const response = await axiosInstance.post(`/open-content`, requestData, {
        responseType: isBlob ? "blob" : "json",
        withCredentials: true,
      });

      if (isBlob) {
        if (response.data instanceof Blob) {
          return {
            blobUrl: URL.createObjectURL(response.data),
            isBlob: true,
          };
        } else {
          throw new Error("Expected Blob for image/video");
        }
      }

      if (isPDF && response.data.pdfContent) {
        const { pdfContent, totalPages, contentType } = response.data;
        const byteCharacters = atob(pdfContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });

        return {
          blobUrl: URL.createObjectURL(blob),
          totalPages: totalPages || 1,
          isPdfPreview: true,
        };
      }

      if (response.data.sasUrl) {
        return { blobUrl: response.data.sasUrl, isSasUrl: true };
      } else if (response.data.content) {
        return { blobUrl: response.data.content, isPublicURL: true };
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error fetching blob data:", error);
      return null;
    }
  };

  const fetchContentBlobs = async (contents) => {
    const promises = contents.map(async (content) => {
      if (
        content.content_source?.toLowerCase() === "youtube" ||
        content.content_source?.toLowerCase() === "vimeo"
      ) {
        return {
          ...content,
          blobUrl: content.content_link,
          isExternal: true,
        };
      }

      const blobData = await fetchBlobData(
        content.content_id || content.id || content.content,
        content.content_mimetype
      );

      if (!blobData) return null;

      return {
        ...content,
        ...blobData,
        blobUrl: blobData.blobUrl || content.content_link,
      };
    });

    const blobs = await Promise.all(promises);
    return blobs.filter((blob) => blob !== null && blob.blobUrl !== null);
  };

  // Only fetch blobs when autoUpdate is true or we don't have staticData yet
  const { data: blobs, isLoading: isBlobLoading } = useQuery(
    ["fetchContentBlobs", data.pitchSections, autoUpdate],
    () => {
      const allContents = data.pitchSections.flatMap(
        (section) => section.contents || []
      );
      return fetchContentBlobs(allContents);
    },
    {
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      // Only fetch when autoUpdate is true or we don't have staticData
      enabled: autoUpdate || !staticData,
    }
  );

  const sortedPitchSections = data?.pitchSections
    ? [...data.pitchSections].sort((a, b) => {
        if (a.order === null && b.order === null) {
          return 0;
        }
        if (a.order === null) {
          return 1;
        }
        if (b.order === null) {
          return -1;
        }
        return a.order - b.order;
      })
    : [];

  // Add new state for translated strings
  const uiStrings = {
    scheduleMeet: "Schedule a Meet",
    hideDetails: "Hide details",
    showDetails: "Show details",
    sharedBy: "Shared by :",
    description: "Description",
    loadMoreContent: "Load More Content",
    loadMoreSections: "Load More Sections",
    loadingMoreSections: "Loading more sections...",
  };

  useEffect(() => {
    if (parent != "PitchVersion") {
      handleSetTimerStart(isBlobLoading); // Send isBlobLoading to the parent
    }
  }, [isBlobLoading]);

  // Function to determine which values to use based on autoUpdate
  const getCurrentStateValues = () => {
    if (!autoUpdate && staticData) {
      return {
        currentSection: staticData.currentSection,
        showDescription: staticData.showDescription,
        showSections: staticData.showSections,
        showViews: staticData.showViews,
        selectedSections: staticData.selectedSections,
        currentIndex: staticData.currentIndex,
        blobs: staticData.blobs,
      };
    }
    return {
      currentSection,
      showDescription,
      showSections,
      showViews,
      selectedSections,
      currentIndex,
      blobs: blobs || [],
    };
  };
  const handleOnClickContent = async (content, blobUrl, mimeType, tagline) => {
    // if (content.content_mimetype === "/pitchfeature") return;
    setSelectedContent(content);
    try {
      setContentModalLoading(true); // Set loading to true when initiating the action

      if (content?.content_mimetype) {
        if (
          content.content_mimetype?.includes("application/vnd") ||
          content.content_mimetype?.includes("application/msword") ||
          content.content_mimetype?.includes("video/")
        ) {
          // For Microsoft Office, and videos files, get the SAS URL
          const res = await axiosInstance.post(`/open-content`, {
            contentId: content?.content || content?.id || content?.contentId,
            viewerId: viewer_id,
          });
          if (res.data && res.data.sasUrl) {
            setViewContent(res.data.sasUrl);
          } else {
            console.warn("sasURL not found in response. Falling back to blob.");
            const blobRes = await axiosInstance.post(
              `/open-content`,
              {
                contentId:
                  content?.content || content?.id || content?.contentId,
                viewerId: viewer_id,
              },
              {
                responseType: "blob",
              }
            );
            const contentBlob = new Blob([blobRes.data], {
              type: content.content_mimetype || "application/octet-stream", // Fallback MIME type
            });
            setViewContent(contentBlob);
          }
        } else if (content.content_mimetype?.includes("application/url")) {
          setViewContent(content.content);
        } else {
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: content?.content || content?.id || content?.contentId,
              viewerId: viewer_id,
            },
            {
              responseType: "blob",
            }
          );

          const contentBlob = new Blob([res.data], {
            type: `${content.content_mimetype}`,
          });
          setViewContent(contentBlob);
        }

        setContentModalOpen(true);
      } else {
        if (
          ["png", "jpg", "jpeg", "webp", "bmp", "gif", "svg"].some((format) =>
            content.name.toLowerCase().includes(format)
          )
        ) {
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: content?.content || content?.id || content?.contentId,
              viewerId: viewer_id,
            },
            {
              responseType: "blob",
              withCredentials: true,
            }
          );
          const contentBlob = new Blob([res.data], {
            type: `${res.data.type}`,
          });
          const url = URL.createObjectURL(contentBlob);
          setViewContent(url);
        } else if (content.name.toLowerCase().includes(".mp4")) {
          const res = await axiosInstance.post(`/open-content`, {
            contentId: content?.content || content?.id || content?.contentId,
            viewerId: viewer_id,
          });
          if (res.data && res.data.sasUrl) {
            setViewContent(res.data.sasUrl);
          } else {
            console.error("sasURL not found in response:", res.data);
          }
        } else {
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: content?.content || content?.id || content?.contentId,
              viewerId: viewer_id,
            },
            {
              responseType: "blob",
            }
          );
          const contentBlob = new Blob([res.data], {
            type: `application/pdf`, // Default to PDF for unknown types
          });
          const url = URL.createObjectURL(contentBlob);

          setViewContent(url);
        }
        setContentModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContentModalLoading(false); // Set loading to false when the action completes (whether successful or not)
    }
  };

  useEffect(() => {
    if (!autoUpdate && latestLiveDataRef.current) {
      const liveData = getLiveData();

      const hasChanges =
        JSON.stringify(liveData.backgroundImageData) !==
          JSON.stringify(latestLiveDataRef.current.backgroundImageData) ||
        JSON.stringify(liveData.pitch) !==
          JSON.stringify(latestLiveDataRef.current.pitchState) ||
        JSON.stringify(liveData.highlightVideosData) !==
          JSON.stringify(
            latestLiveDataRef.current.highlightVideosWithSasUrls
          ) ||
        JSON.stringify(liveData.pitchSections) !==
          JSON.stringify(latestLiveDataRef.current.pitchState.sections) ||
        currentSection !== latestLiveDataRef.current.currentSection ||
        showDescription !== latestLiveDataRef.current.showDescription ||
        showSections !== latestLiveDataRef.current.showSections ||
        showViews !== latestLiveDataRef.current.showViews ||
        JSON.stringify(selectedSections) !==
          JSON.stringify(latestLiveDataRef.current.selectedSections) ||
        currentIndex !== latestLiveDataRef.current.currentIndex;

      setHasPendingChanges(hasChanges);
    }
  }, [
    autoUpdate,
    backgroundImageData,
    pitchState,
    highlightVideosWithSasUrls,
    blobs,
    currentSection,
    showDescription,
    showSections,
    showViews,
    selectedSections,
    currentIndex,
  ]);
  // Get current values based on autoUpdate state
  const currentStateValues = getCurrentStateValues();

  const newData = {
    ...data,
    handler,
    currentSection: currentStateValues.currentSection,
    blobs: currentStateValues.blobs,
    showDescription: currentStateValues.showDescription,
    handleShowDescription,
    IoIosArrowDown,
    IoIosArrowUp,
    handleShowViews,
    handleHideViews,
    TbLayout2,
    handleShowSections,
    motion,
    AnimatePresence,
    showSections: currentStateValues.showSections,
    toggleSection,
    selectedSections: currentStateValues.selectedSections,
    FaAngleUp,
    FaAngleDown,
    ChevronLeft,
    ChevronRight,
    Check,
    MapPin,
    filteredData,
    showViews: currentStateValues.showViews,
    MdOutlineKeyboardBackspace,
    FaRegFilePdf,
    GrDocumentText,
    MdOutlineImage,
    BiSolidVideos,
    sortedPitchSections,
    FaAngleRight,
    FaAngleLeft,
    FaX,
    // timeAgo,
    nextVideo,
    prevVideo,
    currentIndex: currentStateValues.currentIndex,
    // pdfUrl: selectedContent?.contentUrl,
    orgHex: { orgHex },
    hasMoreSections: data.hasMoreSections,
    isLoadingMore: data.isLoadingMore,
    onLoadMoreSections: data.onLoadMoreSections,
    onLoadMoreContents: data.onLoadMoreContents,
    onClickContentHandler: handleOnClickContent,
    uiStrings, // Add the translated strings to the props
    Document: Document,
    Page: Page,
    pdfjs: pdfjs,
    setDSRconfig,
    featureMap,
  };

  // Update loading state when Component is loading/loaded
  useEffect(() => {
    // Set loading to true initially
    if (setLoadingState) setLoadingState(true);

    // When component loads, set loading to false
    return () => {
      if (setLoadingState) setLoadingState(false);
    };
  }, [setLoadingState]);

  // Also update when the Component is actually loaded
  useEffect(() => {
    if (Component && setLoadingState) {
      setLoadingState(false);
    }
  }, [Component, setLoadingState]);

  // This is the modified part of the code to fix the loading state
  if (!Component)
    return (
      <div className="flex flex-col h-full justify-center items-center  ">
        <LuLoaderCircle
          className="animate-spin size-[28px] "
          style={{ color: orgHex }}
        />
        <p className=" text-sm font-medium mt-2" style={{ color: orgHex }}>
          Processing Layout
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Header */}
      <div className="h-8 border-y-2 border-gray-300 bg-gray-100 px-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          {!autoUpdate && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                Preview paused - toggle to see updates
              </span>
              {hasPendingChanges && (
                <button
                  onClick={handleRefreshPreview}
                  className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  <FontAwesomeIcon icon={faRotate} className="text-blue-700" />
                  Refresh
                </button>
              )}
            </div>
          )}
          {/* Pitch Inactive Message */}
          {pitchState.isActivePitch === 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-red-700 bg-red-100 px-4 py-1 rounded">
                This Pitch Is Deactivated
              </span>
              <button
                onClick={handleActivatePitch}
                className="text-xs font-medium text-blue-700 hover:underline"
              >
                Activate
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Refresh Preview Automatically
          </span>
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:bg-secondary transition-all duration-300"></div>
            <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-300 peer-checked:translate-x-full"></div>
          </label>
        </div>
      </div>

      {/* Scrollable content area with overlay */}
      <div className="flex-1 overflow-y-auto">
        {contentModalLoading ? (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
            <LoadingSpinner />
          </div>
        ) : (
          <ContentModal
            content={selectedContent}
            isOpen={isContentModalOpen}
            closeModal={() => setIsContentModalOpen(false)}
            setSelectedContent={setSelectedContent}
            isPitch={true}
          />
        )}
        <div className="relative">
          <Component key={`${layoutId}-${refreshKey}`} {...newData} />
          {!autoUpdate && (
            <div className="absolute inset-0 bg-gray-800/30 z-10 pointer-events-none" />
          )}
          {pitchState.previewLoading && (
            <div className="flex h-full w-full justify-center items-center absolute inset-0 bg-gray-800/30 z-10 pointer-events-none">
              <LuLoaderCircle className="animate-spin size-[28px] text-gray-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(DynamicsPreview);
