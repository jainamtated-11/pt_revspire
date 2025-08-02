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
  fetchBackgroundImage,
  setProcessOverVeiw,
  setActionPlan,
  setEsigner,
  setUserMessage,
  setHtmlBlock,
  setFileUploader,
} from "../../../../features/pitch/addPitchSlice";
import SelectOptions from "../../../../assets/Select-Option.png";
import ContentModal from "../../ContentManager/ContentTable/ContentModal.jsx";
import LoadingSpinner from "../../../../utility/LoadingSpinner.jsx";
import { setContentGrouping } from "../../../../features/pitch/addPitchSlice";
import { ChevronLeft, ChevronRight, Check, MapPin } from "lucide-react";
import ProcessOverviewPreview from "../PitchContentFeatures/ProcessOverview/ProcessOverviewPreview.jsx";
import ActionPlanPreview from "../PitchContentFeatures/ActionPlan/ActionPlanPreview.jsx";
import ESignerPreview from "../PitchContentFeatures/Esigner/ESignPreview.jsx";
import UserMessagePreview from "../PitchContentFeatures/UserMessage/UserMessagePreview.jsx";
import HtmlBlockPreview from "../PitchContentFeatures/HTMLBlock/HTMLBlockPreview.jsx";
import FileUploadPreview from "../PitchContentFeatures/FileUploader/FileUploadPreview.jsx";
//FONTS
import "@fontsource/montserrat"; // Default weight (400)
import "@fontsource/montserrat/500.css"; // Semi-bold
import "@fontsource/montserrat/600.css"; // Semi-bold
import "@fontsource/montserrat/700.css"; // Bold
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

// Configure the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DynamicsPreview = () => {
  const { viewer_id, setContentModalOpen, setViewContent } =
    useContext(GlobalContext);
  const dispatch = useDispatch();
  const [layout, setLayout] = useState(null);
  const pitchState = useSelector((state) => state.addPitchSlice);
  const axiosInstance = useAxiosInstance();

  // Auto-update control state
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [staticData, setStaticData] = useState(null);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const latestLiveDataRef = useRef(null);

  // Media state
  const placeholderBlobRef = useRef(null);
  const [backgroundImageData, setBackgroundImageData] = useState("");
  const [fetchedContentIds, setFetchedContentIds] = useState(new Set());
  const [cachedBlobs, setCachedBlobs] = useState([]);

  // UI state
  const [Component, setComponent] = useState(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [showDescription, setShowDescription] = useState(true);
  const [showSections, setShowSections] = useState(false);
  const [showViews, setShowViews] = useState(false);
  const [selectedSections, setSelectedSections] = useState([]);
  // const [selectedContent, setSelectedContent] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  //Content Modal States
  const [contentModalLoading, setContentModalLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState({
    name: "",
    tagline: "",
    content: "",
    mimetype: "",
    source: "",
    content_link: "",
  });

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

  // Auto-update control handlers
  const handleToggle = () => {
    const newAutoUpdate = !autoUpdate;
    setAutoUpdate(newAutoUpdate);

    if (!newAutoUpdate) {
      createStaticDataCopy();
      setHasPendingChanges(false);
    } else {
      setStaticData(null);
      setHasPendingChanges(false);
    }
  };

  const handleRefreshPreview = async () => {
    if (!autoUpdate) {
      await createStaticDataCopy();
    }
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

  useEffect(() => {
    dispatch(setContentGrouping(DSRconfig.contentGrouping));
    dispatch(setProcessOverVeiw(DSRconfig.processOverVeiw));
    dispatch(setActionPlan(DSRconfig.actionPlan));
    dispatch(setEsigner(DSRconfig.eSigner));
    dispatch(setUserMessage(DSRconfig.userMessage));
    dispatch(setHtmlBlock(DSRconfig.htmlBlock));
    dispatch(setFileUploader(DSRconfig.fileUploader));
  }, [DSRconfig.contentGrouping, layout]);

  const createStaticDataCopy = async () => {
    const currentBlobs = await fetchContentBlobs(
      pitchState.sections.flatMap((section) => section.contents || [])
    );

    const newStaticData = {
      backgroundImageData,
      pitchState: JSON.parse(JSON.stringify(pitchState)),
      highlightVideosData: pitchState.highlightVideos
        ? pitchState.highlightVideos.map(({ url, ...rest }) => ({
            ...rest,
            sasUrl: url,
          }))
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
    setRefreshKey((prev) => prev + 1);
  };
  const featureMap = {
    ProcessOverview: ProcessOverviewPreview,
    ActionPlan: ActionPlanPreview,
    ESign: ESignerPreview,
    UserMessage: UserMessagePreview,
    HtmlBlock: HtmlBlockPreview,
    FileUploader: FileUploadPreview,
    // A: ComponentA,
    // B: ComponentB,
  };

  useEffect(() => {
    if (autoUpdate || !staticData) {
      const backgroundImageFile = pitchState.images?.background?.file;
      const updateBackgroundImage = async () => {
        if (backgroundImageFile instanceof File) {
          const newUrl = URL.createObjectURL(backgroundImageFile);
          setBackgroundImageData(newUrl);
        } else if (backgroundImageFile) {
          setBackgroundImageData(backgroundImageFile);
        }
      };
      updateBackgroundImage();

      return () => {
        if (backgroundImageData && backgroundImageData.startsWith("blob:")) {
          URL.revokeObjectURL(backgroundImageData);
        }
      };
    }
  }, [pitchState.images?.background?.file, autoUpdate]);

  // Data preparation
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
    highlightVideosData: pitchState.highlightVideos
      ? pitchState.highlightVideos.map(({ url, ...rest }) => ({
          ...rest,
          sasUrl: url,
        }))
      : [],
    userDetails: pitchState.userDetails,
    demoProfilePic: "/src/assets/profile_avatar.png",
    hasMoreSections: false,
    isLoadingMore: false,
  });

  const data = useMemo(() => {
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
        highlightVideosData: staticData.highlightVideosData || [],
        userDetails: staticData.pitchState.userDetails,
        demoProfilePic: "/src/assets/profile_avatar.png",
        hasMoreSections: false,
        isLoadingMore: false,
      };
    }

    const liveData = getLiveData();

    if (!autoUpdate && latestLiveDataRef.current) {
      const hasChanges =
        JSON.stringify(liveData.pitch) !==
          JSON.stringify(latestLiveDataRef.current.pitchState) ||
        JSON.stringify(liveData.highlightVideosData) !==
          JSON.stringify(latestLiveDataRef.current.highlightVideosData) ||
        liveData.backgroundImageData !==
          latestLiveDataRef.current.backgroundImageData;

      setHasPendingChanges(hasChanges);
    }

    return liveData;
  }, [autoUpdate, staticData, backgroundImageData, pitchState, refreshKey]);

  const orgHex = data.pitch.primary_color || "#F95D6A";
  const layoutId = data.pitch.pitch_layout;

  // Layout fetching
  useEffect(() => {
    if (layoutId) {
      dispatch(
        fetchPitchLayoutCode({
          axiosInstance,
          layoutId: layoutId,
          viewerId: viewer_id,
        })
      );
      dispatch(
        fetchBackgroundImage({
          axiosInstance,
          viewer_id: viewer_id, // <-- Change to match thunk parameter
          layoutId: layoutId,
        })
      );
    }
  }, [layoutId]);

  useEffect(() => {
    if (pitchState.layoutCode) {
      setLayout(pitchState.layoutCode);
    }
  }, [pitchState.layoutCode]);

  // Component compilation
  useEffect(() => {
    try {
      if (!layout) return;

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

  // Content blob handling
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
      const isImage = contentMimeType?.startsWith("image/");
      const isVideo = contentMimeType?.startsWith("video/");
      const isOfficeDoc =
        contentMimeType?.includes("application/vnd") ||
        contentMimeType?.includes("application/msword");

      console.log(`Fetching content ${contentId} with type ${contentMimeType}`);

      const requestData = {
        viewerId: viewer_id,
        contentId: contentId,
        manual_token: token,
        ...(isPDF && { pageNumber: 1 }),
      };

      if (isPublicURL) {
        return { isPublicURL: true, blobUrl: null };
      }

      // Determine response type based on content
      let responseType = "json";
      if (isImage || isVideo) {
        responseType = "blob";
      } else if (isPDF) {
        responseType = "json"; // PDFs need special handling
      }

      const response = await axiosInstance.post(`/open-content`, requestData, {
        responseType,
        withCredentials: true,
      });

      console.log("Received response:", response);

      // Handle Blob responses (images/videos)
      if (response.data instanceof Blob) {
        return {
          blobUrl: URL.createObjectURL(response.data),
          isBlob: true,
          contentType: response.data.type || contentMimeType,
        };
      }

      // Handle JSON responses
      if (typeof response.data === "object") {
        // PDF with base64 content
        if (isPDF && response.data.pdfContent) {
          const { pdfContent, totalPages, contentType } = response.data;
          const byteCharacters = atob(pdfContent);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: contentType || "application/pdf",
          });

          return {
            blobUrl: URL.createObjectURL(blob),
            totalPages: totalPages || 1,
            isPdfPreview: true,
            contentType: contentType || "application/pdf",
          };
        }

        // SAS URL response
        if (response.data.sasUrl) {
          return {
            blobUrl: response.data.sasUrl,
            isSasUrl: true,
            contentType: contentMimeType,
          };
        }

        // Direct content URL
        if (response.data.content) {
          return {
            blobUrl: response.data.content,
            isPublicURL: true,
            contentType: contentMimeType,
          };
        }
      }

      // Handle string responses (legacy format)
      if (typeof response.data === "string") {
        try {
          const parsed = JSON.parse(response.data);
          if (parsed.sasUrl) {
            return {
              blobUrl: parsed.sasUrl,
              isSasUrl: true,
              contentType: contentMimeType,
            };
          }
        } catch (e) {
          // If not JSON, treat as direct URL
          return {
            blobUrl: response.data,
            isPublicURL: true,
            contentType: contentMimeType,
          };
        }
      }

      console.error("Unhandled response format:", response);
      throw new Error(`Unexpected response format for ${contentMimeType}`);
    } catch (error) {
      console.error(
        `Error fetching blob data for ${contentId} (${contentMimeType}):`,
        error
      );
      return null;
    }
  };

  const fetchContentBlobs = async (contents) => {
    const newContents = contents.filter(
      (content) => !fetchedContentIds.has(content.content_id || content.id)
    );

    if (newContents.length === 0) {
      return cachedBlobs;
    }

    const promises = newContents.map(async (content) => {
      const externalSources = [
        "youtube",
        "vimeo",
        "canva link",
        "microsoft stream",
      ].map((s) => s.toLowerCase());

      if (externalSources.includes(content.content_source?.toLowerCase())) {
        return {
          ...content,
          blobUrl: content.content_link,
          isExternal: true,
        };
      }

      if (content.content_mimetype === "application/url") {
        return {
          ...content,
          blobUrl: content.content_link,
          isPublicURL: true,
        };
      }

      const blobData = await fetchBlobData(
        content.content || content.content_id || content.id,
        content.content_mimetype || content.mimetype
      );

      if (!blobData) return null;

      const result = {
        ...content,
        blobUrl: blobData.blobUrl || content.content_link,
        ...(blobData.isPublicURL && { isPublicURL: true }),
        ...(blobData.isSasUrl && { isSasUrl: true }),
        ...(blobData.isBlob && { isBlob: true }),
        ...((content.content_mimetype === "application/pdf" ||
          content.mimetype === "application/pdf") && {
          totalPages: blobData.totalPages,
        }),
      };

      return result;
    });

    const newBlobs = (await Promise.all(promises)).filter(
      (blob) => blob !== null && blob.blobUrl !== null
    );

    setFetchedContentIds((prev) => {
      const newSet = new Set(prev);
      newContents.forEach((content) =>
        newSet.add(content.content_id || content.id)
      );
      return newSet;
    });

    const mergedBlobs = [...cachedBlobs, ...newBlobs];
    setCachedBlobs(mergedBlobs);
    return mergedBlobs;
  };

  const { data: blobs } = useQuery(
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
      enabled: autoUpdate || !staticData,
    }
  );

  // State management
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

  const currentStateValues = getCurrentStateValues();

  const handleOnClickContent = async (content) => {
    if (content.content_mimetype === "/pitchfeature") return;
    try {
      setContentModalLoading(true);

      // First set the selected content with basic info
      setSelectedContent({
        name: content.name || "",
        tagline: content.tagline || "",
        content: content.content || content.id || content.contentId || "",
        mimetype: content.mimetype || "",
        source: content.source || "",
        content_link: content.content_link || content.content || "",
        content_id: content.content_id || content.id || "",
        content_mimetype: content.mimetype || "",
        content_source: content.source || "",
      });

      // Then fetch the actual content data
      if (content?.mimetype) {
        if (
          content?.mimetype.includes("application/vnd") ||
          content?.mimetype.includes("application/msword") ||
          content?.mimetype.includes("video/")
        ) {
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: content?.content || content?.id || content?.contentId,
              viewerId: viewer_id,
            },
            {
              withCredentials: true,
            }
          );
          const sasURL = res.data.sasUrl;
          setViewContent(sasURL);
        } else if (content.mimetype.includes("application/url")) {
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
              withCredentials: true,
            }
          );
          const contentBlob = new Blob([res.data], {
            type: `${content.mimetype}`,
          });
          setViewContent(contentBlob);
        }
        setContentModalOpen(true);
      } else {
        // Handle other content types...
        setContentModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContentModalLoading(false);
    }
  };

  // UI handlers (modified to respect autoUpdate)
  const handleShowDescription = () => {
    if (!autoUpdate && staticData) return;
    setShowDescription(!showDescription);
  };

  const nextVideo = () => {
    if (!autoUpdate && staticData) return;
    setCurrentIndex(
      (prevIndex) => (prevIndex + 1) % data.highlightVideosData.length
    );
  };

  const prevVideo = () => {
    if (!autoUpdate && staticData) return;
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + data.highlightVideosData.length) %
        data.highlightVideosData.length
    );
  };

  const toggleSection = (sectionName) => {
    if (!autoUpdate && staticData) return;
    setSelectedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  const handler = (index) => {
    if (!autoUpdate && staticData) return;
    setCurrentSection(index + 1);
  };

  const handleShowViews = () => {
    if (!autoUpdate && staticData) return;
    setShowViews(true);
  };

  const handleHideViews = () => {
    if (!autoUpdate && staticData) return;
    setShowViews(false);
  };

  const handleShowSections = () => {
    if (!autoUpdate && staticData) return;
    setShowSections(!showSections);
  };

  // Memoized DocViewer
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

  // Add this useEffect to track all state changes
  useEffect(() => {
    if (!autoUpdate && latestLiveDataRef.current) {
      const hasChanges =
        JSON.stringify(pitchState) !==
          JSON.stringify(latestLiveDataRef.current.pitchState) ||
        backgroundImageData !== latestLiveDataRef.current.backgroundImageData ||
        currentSection !== latestLiveDataRef.current.currentSection ||
        showDescription !== latestLiveDataRef.current.showDescription ||
        showSections !== latestLiveDataRef.current.showSections ||
        showViews !== latestLiveDataRef.current.showViews ||
        JSON.stringify(selectedSections) !==
          JSON.stringify(latestLiveDataRef.current.selectedSections) ||
        currentIndex !== latestLiveDataRef.current.currentIndex ||
        JSON.stringify(blobs || []) !==
          JSON.stringify(latestLiveDataRef.current.blobs || []);

      setHasPendingChanges(hasChanges);
    }
  }, [
    pitchState,
    backgroundImageData,
    currentSection,
    showDescription,
    showSections,
    showViews,
    selectedSections,
    currentIndex,
    blobs,
    autoUpdate,
  ]);

  MemoizedDocViewer.displayName = "MemoizedDocViewer";

  // Prepare data for component
  const sortedPitchSections = data?.pitchSections
    ? [...data.pitchSections].sort((a, b) => {
        if (a.order === null && b.order === null) return 0;
        if (a.order === null) return 1;
        if (b.order === null) return -1;
        return a.order - b.order;
      })
    : [];

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
    filteredData:
      selectedSections.length > 0
        ? data.pitchSections.filter((item) =>
            selectedSections.includes(item.name)
          )
        : data.pitchSections,
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
    nextVideo,
    prevVideo,
    onClickContentHandler: handleOnClickContent,
    currentIndex: currentStateValues.currentIndex,
    pdfUrl: selectedContent?.contentUrl,
    orgHex: { orgHex },
    hasMoreSections: data.hasMoreSections,
    isLoadingMore: data.isLoadingMore,
    uiStrings,
    Document,
    Page,
    pdfjs,
    setDSRconfig,
    featureMap,
  };

  // Render states
  if (!pitchState.pitchLayout.id) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-screen">
        <img src={SelectOptions} className="h-[40%]" />
        <p className="text-secondary font-semibold text-xl mt-4 mb-10">
          Select a Pitch Layout for Preview
        </p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-screen ">
        <LuLoaderCircle
          className="animate-spin size-[28px] "
          style={{ color: orgHex }}
        />
        <p className=" text-sm font-medium mt-2" style={{ color: orgHex }}>
          Processing Layout
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Control Header */}
      <div className="h-8 border-y-2 border-gray-300 bg-gray-100 px-4 flex items-center justify-between sticky top-0 z-20">
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
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Update Preview Automatically
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

      {/* Main Content with overlay */}
      <div className="flex-1 overflow-y-auto">
        {contentModalLoading ? (
          <div className="fixed inset-0 flex items-center justify-center z-50 ">
            <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <ContentModal
              content={selectedContent}
              isOpen={setContentModalOpen}
              closeModal={() => setContentModalOpen(false)}
              setSelectedContent={setSelectedContent}
              isPitch={true}
            />
          </>
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
