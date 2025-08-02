import React, { useEffect, useState, useRef, useMemo } from "react";
import { profilePhotoHandler } from "../../../utils/mediaUtils";
import { getFileType, getVideoId } from "../../../utils/mediaUtils";
import { useQuery } from "react-query";
import * as Babel from "@babel/standalone";
import PdfViewer from "../../../utility/PdfViewer.jsx";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { faExpand, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { TbLayout2 } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { FaRegFilePdf, FaX } from "react-icons/fa6";
import { MdOutlineImage } from "react-icons/md";
import { GrDocumentText } from "react-icons/gr";
import { BiSolidVideos } from "react-icons/bi";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { useContext } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Check, MapPin } from "lucide-react";

//FONTS
import "@fontsource/montserrat"; // Default weight (400)
import "@fontsource/montserrat/500.css"; // Semi-bold
import "@fontsource/montserrat/600.css"; // Semi-bold
import "@fontsource/montserrat/700.css"; // Bold

// Configure the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DynamicLayout = ({
  pitchData,
  layout,
  data,
  orgHex,
  languageCode,
  sendDataToParent,
  handleCustomButtons,
  handleSetTimerStart,
  parent,
  setDSRconfig,
  featureMap,
  pitchEngagementId
}) => {
  const [Component, setComponent] = useState(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [showDescription, setShowDescription] = useState(true);
  const handleShowDescription = () => setShowDescription(!showDescription);
  const [showSections, setShowSections] = useState(false);
  const [showViews, setShowViews] = useState(false);
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedContent, setSelectedContent] = useState(
    data.pitchSections[0] ?? null
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const axiosInstance = useAxiosInstance();
  const { viewer_id } = useContext(GlobalContext);
  const [profilePhoto, setProfilePhoto] = useState(
    data.userDetails.profilePhoto
  );
  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  }

  const nextVideo = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex + 1) % data.highlightVideosData.length
    );
  };

  const prevVideo = () => {
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

  const handleShowViews = () => setShowViews(true);
  const handleHideViews = () => setShowViews(false);
  const handleShowSections = () => {
    setShowSections(!showSections);
  };

  const toggleSection = (sectionName) => {
    setSelectedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  const pitchId = pitchData?.pitch?.id;

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
        setComponent(() => StandardLayout);
        return;
      }

      // Existing remote layout code
      const compiledCode = Babel.transform(layout, { presets: ["react"] }).code;
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
        // "featureMap",
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
        // featureMap
      );

      setComponent(() => Component);
    } catch (error) {
      console.error("Error compiling or rendering component:", error);
    }
  }, [layout]);

  const handler = (index) => {
    setCurrentSection(index + 1);
  };

  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  // Updated: return both blobUrl and totalPages
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

      // PDFs should be treated like JSON (for page-by-page previews)
      const response = await axiosInstance.post(`/open-content`, requestData, {
        responseType: isBlob ? "blob" : "json",
        withCredentials: true,
      });

      // Handle image/video blob
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

      // Handle PDF preview (first page as base64)
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

      // Handle SAS URL or full content URLs
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
      // Skip API call for specific content sources
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

      // For public URLs, use content_link directly
      if (content.content_mimetype === "application/url") {
        return {
          ...content,
          blobUrl: content.content_link,
          isPublicURL: true,
        };
      }

      // For other content types, fetch the blob data
      const blobData = await fetchBlobData(
        content.content_id || content.id,
        content.content_mimetype
      );

      if (!blobData) return null;

      // Construct the result object
      const result = {
        ...content,
        blobUrl: blobData.blobUrl || content.content_link, // Fallback to content_link
        ...(blobData.isPublicURL && { isPublicURL: true }),
        ...(blobData.isSasUrl && { isSasUrl: true }),
        ...(content.content_mimetype === "application/pdf" && {
          totalPages: blobData.totalPages,
        }),
      };

      return result;
    });

    const blobs = await Promise.all(promises);
    return blobs.filter((blob) => blob !== null && blob.blobUrl !== null);
  };

  const { data: blobs, isLoading: isBlobLoading } = useQuery(
    ["fetchContentBlobs", pitchId, languageCode, pitchData],
    () =>
      fetchContentBlobs(
        pitchData?.pitchSections.flatMap((section) => section.contents)
      ),
    {
      enabled: !!pitchId && !!pitchData,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const sortedPitchSections = data.pitchSections.sort((a, b) => {
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
  });

  // Add new state for translated strings
  const [uiStrings, setUiStrings] = useState({
    scheduleMeet: "Schedule a Meet",
    hideDetails: "Hide details",
    showDetails: "Show details",
    sharedBy: "Shared by :",
    description: "Description",
    loadMoreContent: "Load More Content",
    loadMoreSections: "Load More Sections",
    loadingMoreSections: "Loading more sections...",
  });

  // Add new query to fetch translations
  const { data: translatedStrings } = useQuery(
    ["translateStrings", languageCode],
    async () => {
      if (languageCode === "default") return null;

      const response = await axiosInstance.post("/translate-string", {
        paragraphs: uiStrings,
        languageCode,
      });

      return response.data.translations;
    },
    {
      enabled: !!languageCode && languageCode !== "default",
      onSuccess: (data) => {
        if (data) {
          setUiStrings(data);
        }
      },
    }
  );

  useEffect(() => {
    if (parent != "PitchVersion") {
      handleSetTimerStart(isBlobLoading); // Send isBlobLoading to the parent
    }
  }, [isBlobLoading]);

  const newData = {
    ...data,
    handler,
    currentSection,
    blobs: blobs || [],
    showDescription,
    handleShowDescription,
    IoIosArrowDown,
    IoIosArrowUp,
    handleShowViews,
    handleHideViews,
    TbLayout2,
    handleShowSections,
    motion,
    AnimatePresence,
    showSections,
    toggleSection,
    selectedSections,
    FaAngleUp,
    ChevronLeft,
    ChevronRight,
    Check,
    MapPin,
    FaAngleDown,
    filteredData,
    showViews,
    MdOutlineKeyboardBackspace,
    FaRegFilePdf,
    GrDocumentText,
    MdOutlineImage,
    BiSolidVideos,
    sortedPitchSections,
    FaAngleRight,
    FaAngleLeft,
    FaX,
    timeAgo,
    nextVideo,
    prevVideo,
    currentIndex,
    pdfUrl: selectedContent?.contentUrl,
    orgHex: { orgHex },
    hasMoreSections: data.hasMoreSections,
    isLoadingMore: data.isLoadingMore,
    onLoadMoreSections: data.onLoadMoreSections,
    onLoadMoreContents: data.onLoadMoreContents,
    uiStrings, // Add the translated strings to the props
    Document: Document,
    Page: Page,
    pdfjs: pdfjs,
    setDSRconfig,
    featureMap,
    pitchEngagementId
  };

  if (!Component || isBlobLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <LuLoaderCircle
          className="animate-spin text-4xl text-cyan-600"
          style={{ color: orgHex }}
        />
      </div>
    );

  return <Component {...newData} />;
};

export default React.memo(DynamicLayout);
