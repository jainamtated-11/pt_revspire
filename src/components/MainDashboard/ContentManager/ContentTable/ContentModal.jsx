import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { LuLoaderCircle } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import { Document, Page } from "react-pdf";
import { FaCaretLeft } from "react-icons/fa6";
import { FaCaretRight } from "react-icons/fa6";
import { SiCanva } from "react-icons/si";
import { SiStreamrunners } from "react-icons/si";
import useContentHandler from "./useContentHandler.js";
import ContentModalAnalytics from "./ContentModalAnalytics.jsx";
import { CiFileOn } from "react-icons/ci";
import { TbFileTypeDocx } from "react-icons/tb";
import { LuFileSpreadsheet } from "react-icons/lu";
import { GrDocumentPpt } from "react-icons/gr";
import { BsFiletypePptx } from "react-icons/bs";
import { FaRegFileWord } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { FaRegFilePdf } from "react-icons/fa6";
import { IoImagesOutline } from "react-icons/io5";
import { AiOutlineYoutube } from "react-icons/ai";
import { RiVimeoLine } from "react-icons/ri";
import { FiLink } from "react-icons/fi";
import { TfiLayoutMediaOverlay } from "react-icons/tfi";
import { BsFileEarmarkText } from "react-icons/bs";
import { twMerge } from "tailwind-merge";
import { FcFolder } from "react-icons/fc";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import ProcessOverviewPreview from "../../PitchManager/PitchContentFeatures/ProcessOverview/ProcessOverviewPreview.jsx";
import ActionPlanPreview from "../../PitchManager/PitchContentFeatures/ActionPlan/ActionPlanPreview.jsx";
import { MdOutlineFeaturedPlayList } from "react-icons/md";

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const getIcon = (item, className) => {
  switch (
    item?.source == "Youtube"
      ? "youtube"
      : item?.source == "Vimeo"
      ? "vimeo"
      : item?.source == "Microsoft Stream"
      ? "microsoftStream"
      : item?.source == "Canva Link"
      ? "canvaLink"
      : item?.mimetype || item?.content_mimetype || item?.source
  ) {
    case "application/pdf":
      return (
        <FaRegFilePdf
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "image/jpeg":
    case "image/png":
    case "image/jpg":
    case "image/gif":
    case "image/webp":
      return (
        <IoImagesOutline
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.ms-excel":
      return (
        <FaRegFileExcel
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/msword":
      return (
        <FaRegFileWord
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return (
        <BsFiletypePptx
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.ms-powerpoint":
      return (
        <GrDocumentPpt
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return (
        <LuFileSpreadsheet
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return (
        <TbFileTypeDocx
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/url":
      return (
        <FiLink
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/octet-stream":
      return (
        <CiFileOn
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "video/mp4":
      return (
        <MdOutlineSlowMotionVideo
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    case "application/x-javascript":
      return (
        <TfiLayoutMediaOverlay
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.ms-visio.drawing":
      return (
        <BsFileEarmarkText
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    case "youtube":
      return (
        <AiOutlineYoutube
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    case "vimeo":
      return (
        <RiVimeoLine
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    case "microsoftStream":
      return (
        <SiStreamrunners
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    case "canvaLink":
      return (
        <SiCanva
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    case "/pitchfeature":
      return (
        <MdOutlineFeaturedPlayList
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    default:
      return (
        <FcFolder
          className="text-yellow-300 w-5 h-5 flex-shrink-0"
          style={{ width: "20px" }}
        />
      );
  }
};

const Docs = React.memo(({ docUri }) => {
  return (
    <div className="h-full w-full overflow-y-auto dark:bg-gray-800">
      <DocViewer
        key={docUri}
        documents={[{ uri: docUri }]}
        pluginRenderers={DocViewerRenderers}
        config={{
          header: { disableHeader: true },
          pdfVerticalScrollByDefault: true,
          pdfZoom: {
            defaultZoom: 1.1,
            zoomJump: 0.2,
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
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
});

Docs.displayName = "Docs";

const PDFViewer = React.memo(({ docUri }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [initialScale, setInitialScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const hasInitialScale = useRef(false);

  const calculateInitialScale = (pageWidth, pageHeight) => {
    if (!containerRef.current) return 1;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width * 0.8; // 5% margin
    const containerHeight = containerRect.height * 0.8;

    const widthRatio = containerWidth / pageWidth;
    const heightRatio = containerHeight / pageHeight;

    return Math.min(widthRatio, heightRatio, 0.8); // Don't scale up beyond 1x initially
  };

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePageLoadSuccess = (page) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageDimensions({
      width: viewport.width,
      height: viewport.height,
    });

    // Only set initial scale once when the document first loads
    if (!hasInitialScale.current) {
      const calculatedScale = calculateInitialScale(
        viewport.width,
        viewport.height
      );
      setInitialScale(calculatedScale);
      setScale(calculatedScale);
      hasInitialScale.current = true;
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleZoom = (direction) => {
    setScale((prev) => {
      const newScale = direction === "in" ? prev + 0.25 : prev - 0.25;
      return Math.max(0.5, Math.min(newScale, 3)); // Limit between 0.5x and 3x
    });
  };

  const handleMouseDown = (e) => {
    if (scale <= initialScale) return;
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= initialScale) return;

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const contentWidth = pageDimensions.width * scale;
    const contentHeight = pageDimensions.height * scale;

    let newX = e.clientX - startPos.x;
    let newY = e.clientY - startPos.y;

    // Calculate maximum allowed movement based on content and container dimensions
    const maxX = Math.max(0, (contentWidth - containerRect.width) / 2);
    const minX = -maxX;
    const maxY = Math.max(0, (contentHeight - containerRect.height) / 2);
    const minY = -maxY;

    newX = Math.min(maxX, Math.max(minX, newX));
    newY = Math.min(maxY, Math.max(minY, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (scale <= initialScale) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale, initialScale]);

  return (
    <div
      className="flex flex-col h-full relative"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: isDragging
          ? "grabbing"
          : scale > initialScale
          ? "grab"
          : "default",
      }}
    >
      <div className="flex-1 overflow-auto flex justify-center items-center md:items-center">
        <Document
          file={docUri}
          onLoadSuccess={handleDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-full text-red-500">
              Failed to load PDF
            </div>
          }
        >
          <div
            className="flex justify-center items-center w-full"
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            <Page
              pageNumber={currentPage}
              width={Math.min(window.innerWidth * 0.8, 800) * scale}
              onLoadSuccess={handlePageLoadSuccess}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </div>
        </Document>
      </div>

      {/* Floating zoom controls */}
      <div className="absolute bottom-16 right-4 flex items-center gap-2 bg-white/90 dark:bg-gray-700/90 rounded-lg shadow-lg p-1.5 border border-gray-200 dark:border-gray-600 z-10">
        <button
          onClick={() => handleZoom("out")}
          disabled={scale <= 0.5}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-lg font-medium">−</span>
        </button>
        <span className="text-xs font-medium w-10 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => handleZoom("in")}
          disabled={scale >= 3}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-lg font-medium">+</span>
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-medium"
        >
          Reset
        </button>
      </div>

      {numPages > 1 && (
        <div className="flex justify-center py-1 items-center gap-4 px-4 border-t bg-[#444444] text-white">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="hover:bg-gray-500 disabled:opacity-50"
          >
            <FaCaretLeft className="w-5 h-5" />
          </button>
          <span>
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() =>
              handlePageChange(Math.min(numPages, currentPage + 1))
            }
            disabled={currentPage >= numPages}
            className="hover:bg-gray-500 disabled:opacity-50"
          >
            <FaCaretRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
});

PDFViewer.displayName = "PDFViewer";

function ContentModal({
  content,
  setSelectedContent,
  publicLink,
  contents,
  isPitch,
}) {
  const featureMap = {
    ProcessOverview: ProcessOverviewPreview,
    ActionPlan: ActionPlanPreview,
    // B: ComponentB,
  };
  if (!content) return;

  const {
    viewContent,
    setViewContent,
    contentModalOpen,
    setContentModalOpen,
    viewer_id,
  } = useContext(GlobalContext);

  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { handleContentClick } = useContentHandler({ viewer_id });

  useEffect(() => {
    if (contents?.length && content) {
      const index = contents.findIndex((item) => item.id === content.id);
      setCurrentIndex(index);
    }
  }, [content, contents]);

  // Navigation handlers - only defined if contents array exists
  const handleNext = async () => {
    if (!contents?.length) return;

    if (currentIndex < contents.length - 1) {
      setIsLoading(true);
      setViewContent(null);
      setBlobUrl(null);

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedContent(contents[nextIndex]);

      try {
        await handleContentClick(contents[nextIndex], "modal");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrevious = async () => {
    if (!contents?.length) return;

    if (currentIndex > 0) {
      setIsLoading(true);
      setViewContent(null);
      setBlobUrl(null);

      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSelectedContent(contents[prevIndex]);

      try {
        await handleContentClick(contents[prevIndex], "modal");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Keyboard navigation - only add if contents array exists
  useEffect(() => {
    if (!contentModalOpen) return;
    if (!contents?.length) return;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrevious();
      } else if (event.key === "Escape") {
        setContentModalOpen(false);
        setViewContent(null);
        setSelectedContent(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext, handlePrevious, contents]);

  // Use useRef to store the previous viewContent value
  const prevViewContentRef = useRef(null);

  // Handle blob URL creation
  useEffect(() => {
    if (viewContent !== null && viewContent !== prevViewContentRef.current) {
      prevViewContentRef.current = viewContent;

      if (typeof viewContent === "string") {
        setBlobUrl(viewContent);
      } else if (viewContent instanceof Blob) {
        const url = window.URL.createObjectURL(viewContent);
        setBlobUrl(url);
        return () => {
          window.URL.revokeObjectURL(url);
        };
      }
    } else if (viewContent === null) {
      setBlobUrl(null);
      prevViewContentRef.current = null;
    }
  }, [viewContent]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setContentModalOpen(false);
        setViewContent(null);
        setSelectedContent(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [setContentModalOpen, setViewContent, setSelectedContent]);

  const handleIframeLoad = () => {
    setIsIframeLoading(false);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIsIframeLoading(false);
  };

  const renderContent = useCallback(() => {
    if (content.content_mimetype == "/pitchfeature") {
      const contentLinkJSON =
        typeof content.content_link === "string"
          ? JSON.parse(content.content_link)
          : content.content_link;

      const Component = featureMap[contentLinkJSON?.Type]; // Safely access Type

      if (Component) {
        return (
          <div className="w-full h-full items-center content-center overflow-auto">
            <Component
              data={content.content_link}
              hexColor={"#28747d"}
              description={content.content_description}
              contentId={content.content} // Make sure to pass contentId
            />
          </div>
        );
      }
    }

    // Handle Canva links
    if (
      content?.source?.toLowerCase() === "canva link" ||
      content?.content_source?.toLowerCase() === "canva link"
    ) {
      const canvaUrl = content?.content || content?.content_link;
      // Convert edit link to view link if needed
      const viewUrl = canvaUrl;

      return (
        <div className="w-full h-full relative">
          {isIframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <LuLoaderCircle className="text-xl animate-spin" />
            </div>
          )}
          <iframe
            src={viewUrl}
            className="w-full h-full"
            style={{
              border: "none",
              visibility: isIframeLoading ? "hidden" : "visible",
            }}
            title="Canva Content"
            sandbox="allow-scripts allow-same-origin allow-popups"
            loading="eager"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      );
    }

    // Handle Microsoft Stream links
    else if (
      content?.source?.toLowerCase() === "microsoft stream" ||
      content?.content_source?.toLowerCase() === "microsoft stream"
    ) {
      const streamUrl = content?.content || content?.content_link;

      return (
        <div className="w-full h-full relative">
          {isIframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <LuLoaderCircle className="text-xl animate-spin" />
            </div>
          )}
          <iframe
            src={streamUrl}
            className="w-full h-full"
            style={{
              border: "none",
              visibility: isIframeLoading ? "hidden" : "visible",
            }}
            title="Microsoft Stream Content"
            sandbox="allow-scripts allow-same-origin allow-popups"
            loading="eager"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      );
    } else if (
      content?.source?.toLowerCase() === "public url" ||
      content?.content_source?.toLowerCase() === "public url"
    ) {
      const iframeUrl = publicLink;

      return (
        <div className="w-full h-full relative">
          {/* Show loading state only briefly */}
          {isIframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <LuLoaderCircle className="text-xl animate-spin" />
            </div>
          )}

          {iframeError ? (
            <div className="text-center p-4">
              <div className="mb-2">
                This content cannot be displayed in an iframe.
              </div>
              <a
                href={iframeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Open in new tab
              </a>
            </div>
          ) : (
            <iframe
              src={iframeUrl}
              className="w-full h-full"
              style={{
                border: "none",
                visibility: isIframeLoading ? "hidden" : "visible", // Use visibility instead of display
              }}
              title="Public Content"
              sandbox="allow-scripts allow-same-origin allow-popups"
              loading="eager" // Change to eager loading for faster display
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )}
        </div>
      );
    } else if (
      content?.source?.toLowerCase() === "youtube" ||
      content?.source?.toLowerCase() === "vimeo" ||
      content?.content_source?.toLowerCase() === "youtube" ||
      content?.content_source?.toLowerCase() === "vimeo" ||
      content?.source?.toLowerCase() === "canva link" ||
      content?.source?.toLowerCase() === "microsoft stream" ||
      content?.content_source?.toLowerCase() === "canva link" ||
      content?.content_source?.toLowerCase() === "microsoft stream"
    ) {
      const embedUrl =
        content?.content_link?.trim() || content?.content?.trim();

      return (
        <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800">
          {isIframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LuLoaderCircle className="text-3xl animate-spin" />
            </div>
          )}
          <iframe
            key={embedUrl} // Add key to force re-render when URL changes
            src={embedUrl}
            className="w-full h-full"
            style={{
              border: "none",
              backgroundColor: "transparent",
            }}
            title="Video Content"
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
          {/* Fallback for errors */}
          {iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                Open video in new tab
              </a>
            </div>
          )}
        </div>
      );
    } else if (
      (content?.mimetype || content?.content_mimetype) === "application/url"
    ) {
      if (
        content?.content?.includes("pdf") ||
        content?.content_name?.includes("pdf")
      ) {
        return <PDFViewer docUri={blobUrl} />;
      } else if (
        content?.content?.includes("pptx") ||
        content?.content?.includes("xls") ||
        content?.content?.includes("xlsx") ||
        content?.content?.includes("ppt") ||
        content?.content?.includes("pptx") ||
        content?.content?.includes("doc") ||
        content?.content?.includes("docx") ||
        content?.content_mimetype?.includes("pptx") ||
        content?.content_mimetype?.includes("xls") ||
        content?.content_mimetype?.includes("xlxs") ||
        content?.content_mimetype?.includes("ppt") ||
        content?.content_mimetype?.includes("docx") ||
        content?.content_mimetype?.includes("doc")
        //content?.content_mimetype?.includes("pdf")
      ) {
        return (
          <div className="px-5 mt-5">
            <a
              className="hover:text-blue-600"
              href={content.content || content.content_link}
              target="_blank"
              rel="noreferrer"
            >
              {content?.content}
            </a>
            <h1>Sorry, content type is not supported</h1>
          </div>
        );
      } else {
        return (
          <>
            {isIframeLoading && <div className="text-center">Loading...</div>}
            {iframeError && (
              <div className="text-center">
                This content cannot be displayed in an iframe.
                <a
                  href={content?.content || content?.content_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  Open in new tab
                </a>
              </div>
            )}
            <iframe
              src={content?.content || content?.content_link}
              className="w-full h-full"
              style={{
                border: "none",
                display: isIframeLoading || iframeError ? "none" : "block",
              }}
              title="External Website"
              sandbox="allow-scripts allow-same-origin"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </>
        );
      }
    } else if (content?.mimetype || content?.content_mimetype) {
      if (
        content?.mimetype === "application/pdf" ||
        content?.content_mimetype === "application/pdf" ||
        content.name?.toLowerCase().endsWith(".pdf")
      ) {
        return <PDFViewer key={blobUrl} docUri={blobUrl} />;
      } else if (
        viewContent !== null &&
        (content?.mimetype || content?.content_mimetype) &&
        ((!content?.mimetype?.includes("image/") &&
          !content?.mimetype?.includes("video/")) ||
          (content?.content_mimetype?.includes("image/") &&
            content?.content_mimetype?.includes("video/")))
      ) {
        return <Docs key={blobUrl} docUri={blobUrl} />;
      } else if (
        (content?.mimetype || content?.content_mimetype) &&
        (content?.mimetype?.includes("video/") ||
          content?.content_mimetype?.includes("video/"))
      ) {
        return <Video docUri={blobUrl} />;
      } else {
        return <Image docUri={blobUrl} />;
      }
    } else {
      if (
        ["mp4", "avi", "mkv", "mov", "wmv"].some((ext) =>
          content?.name?.includes(ext)
        )
      ) {
        return <Video docUri={blobUrl} />;
      } else if (content?.name?.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return <Image docUri={blobUrl} />;
      } else if (content?.name?.includes("pdf")) {
        return <PDFViewer docUri={blobUrl} />;
      }
    }
  }, [
    content,
    isIframeLoading,
    iframeError,
    handleIframeLoad,
    handleIframeError,
  ]);

  useEffect(() => {
    return () => {
      if (blobUrl && blobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, []);

  return (
    <>
      {contentModalOpen && (
        <div className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center bg-black/50 backdrop-blur-sm py-6 dark:bg-gray-900/70">
          <div className="relative flex h-fit w-full max-w-5xl flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-700 dark:bg-gray-700">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                {getIcon(content, "text-sm dark:text-gray-300")}
                <span className="font-medium">
                  {content?.name || content?.content_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Analytics Button */}
                <button
                  className="flex mr-8 h-6 w-6 items-center justify-center transition-colors "
                  onClick={() => setShowAnalytics(!showAnalytics)}
                >
                  {/* <FiBarChart2 className="text-xl" /> */}
                  <FontAwesomeIcon
                    icon={faChartSimple}
                    className="h-6 w-6 text-sky-800"
                  />
                </button>
                {/* Close Button */}
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                  onClick={() => {
                    setContentModalOpen(false);
                    setViewContent(null);
                    setSelectedContent(null);
                  }}
                >
                  <RxCross2 className="text-sm" />
                </button>
              </div>
            </div>

            {/* Content with conditional navigation buttons */}
            <div className="relative h-[calc(100vh-12rem)] overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800 group">
              {/* Only render navigation buttons if contents array exists */}
              {contents?.length > 0 && (
                <>
                  {/* Left Navigation Button */}
                  {currentIndex > 0 && (
                    <button
                      className="absolute left-0 top-1/2 z-10 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-r-lg transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      onClick={handlePrevious}
                      disabled={isLoading}
                    >
                      <span className="text-2xl">&lt;</span>
                    </button>
                  )}

                  {/* Right Navigation Button */}
                  {currentIndex < contents?.length - 1 && (
                    <button
                      className="absolute right-0 top-1/2 z-10 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-l-lg transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      onClick={handleNext}
                      disabled={isLoading}
                    >
                      <span className="text-2xl">&gt;</span>
                    </button>
                  )}
                </>
              )}

              {/* Content */}
              <div className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                  </div>
                ) : (
                  renderContent()
                )}
              </div>
            </div>

            {/* Analytics Drawer */}
            <ContentModalAnalytics
              setShowAnalytics={setShowAnalytics}
              showAnalytics={showAnalytics}
              content={content}
              isPitch={isPitch}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(ContentModal);

const Video = ({ docUri }) => {
  return (
    <div className="flex h-full w-full items-center justify-center p-4 dark:bg-gray-800">
      <video src={docUri} controls className="h-full object-contain" />
    </div>
  );
};

const Image = ({ docUri }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const handleZoom = (direction) => {
    setScale((prev) => {
      const newScale = direction === "in" ? prev + 0.25 : prev - 0.25;
      return Math.max(0.5, Math.min(newScale, 3)); // Limit between 0.5x and 3x
    });
  };

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault(); // Prevent default drag behavior
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    document.body.style.cursor = "grabbing";
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault(); // Prevent default drag behavior

    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Calculate maximum allowed movement
    const maxX = (imgRect.width - containerRect.width) / 2;
    const maxY = (imgRect.height - containerRect.height) / 2;

    let newX = e.clientX - startPos.x;
    let newY = e.clientY - startPos.y;

    // Constrain movement to keep image within container
    newX = Math.min(maxX, Math.max(-maxX, newX));
    newY = Math.min(maxY, Math.max(-maxY, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = "";
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Prevent default drag behavior on the image
  const preventImageDrag = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (scale <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center rounded-lg overflow-hidden dark:bg-gray-800"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: scale > 1 ? "grab" : "default" }}
    >
      <img
        ref={imgRef}
        src={docUri}
        alt=""
        className="h-full max-w-none object-contain transition-transform duration-200 ease-in-out select-none"
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? "grabbing" : scale > 1 ? "grab" : "default",
          userSelect: "none",
        }}
        onDragStart={preventImageDrag}
        draggable="false"
      />

      {/* Floating zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-gray-700/90 rounded-lg shadow-lg p-1.5 border border-gray-200 dark:border-gray-600 z-10">
        <button
          onClick={() => handleZoom("out")}
          disabled={scale <= 0.5}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-lg font-medium">−</span>
        </button>
        <span className="text-xs font-medium w-10 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => handleZoom("in")}
          disabled={scale >= 3}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-lg font-medium">+</span>
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-xs font-medium"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
