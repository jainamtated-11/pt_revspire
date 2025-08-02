import React, { useState, useRef, useEffect } from "react";
import { Document, Page } from "react-pdf";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faSearchPlus,
  faSearchMinus,
} from "@fortawesome/free-solid-svg-icons";
import VideoComponent from "../../../utils/VideoComponent";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import ProcessOverviewPreview from "./PitchContentFeatures/ProcessOverview/ProcessOverviewPreview.jsx";
import ActionPlanPreview from "./PitchContentFeatures/ActionPlan/ActionPlanPreview.jsx";
import ESignPreview from "./PitchContentFeatures/Esigner/ESignPreview.jsx";
import UserMessagePreview from "./PitchContentFeatures/UserMessage/UserMessagePreview.jsx";
import HTMLBlockPreview from "./PitchContentFeatures/HTMLBlock/HTMLBlockPreview.jsx";
import FileUploadPreview from "./PitchContentFeatures/FileUploader/FileUploadPreview.jsx";

const FullScreenPopup = ({
  fullscreenBlobUrl,
  fullscreenBlobName,
  fullscreenMimeType,
  selectedContent,
  onClose,
  currentPage,
  numPages,
  onPageChange,
  pdfProgress,
  publicLink,
  publicLinkLoading,
  isPdfLoading,
  viewedPercentageRef,
  videoRef,
  videoId,
  videoVewTimeRef,
  setIsActive,
  lastActivity,
  activeTime,
  scrollPositionRef,
  scrollContainerRef,
  handleScroll,
  setPdfProgress,
  handleDocumentLoadSuccess,
  handlePageChange,
  orgHex,
}) => {
  const isPitchFeature = selectedContent.content_mimetype === "/pitchfeature";
  const isVideo = fullscreenMimeType?.startsWith("video/");
  const isPDF = fullscreenMimeType === "application/pdf";
  const isImage = fullscreenMimeType?.startsWith("image");
  const isYoutubeOrVimeo = ["youtube", "vimeo"].includes(
    selectedContent?.content_source?.toLowerCase() || selectedContent?.source?.toLowerCase()
  );
  const isPublicUrl =
    selectedContent?.content_source?.toLowerCase() === "public url" || selectedContent?.source?.toLowerCase() === "public url";
  const isCanvaLink =
    selectedContent?.content_source?.toLowerCase() === "canva link" || selectedContent?.source?.toLowerCase() === "canva link"
  const isMicrosoftStream =
    selectedContent?.content_source?.toLowerCase() === "microsoft stream";
 console.log("SELECTED CONTENT", selectedContent)
  // Simplified zoom state (removed pan/drag states)
  const [scale, setScale] = useState(1);
  const contentRef = useRef(null);

  const handleZoom = (direction) => {
    setScale((prev) => {
      const newScale = direction === "in" ? prev + 0.25 : prev - 0.25;
      return Math.max(0.5, Math.min(newScale, 3));
    });
  };
  const featureMap = {
    ProcessOverview: ProcessOverviewPreview,
    ActionPlan: ActionPlanPreview,
    ESign: ESignPreview,
    UserMessage: UserMessagePreview,
    HtmlBlock: HTMLBlockPreview,
    FileUploader: FileUploadPreview,
    // B: ComponentB,
  };
  const handleReset = () => {
    setScale(1);
  };

  useEffect(() => {
    if (isPDF && numPages > 0) {
      const progress = Math.floor((currentPage / numPages) * 100);
      setPdfProgress(progress);
    }
  }, [currentPage, numPages, isPDF]);

  // Keyboard shortcuts (only for PDF and images)
  useEffect(() => {
    if (!isPDF && !isImage) return;

    const handleKeyDown = (e) => {
      if (e.key === "+" || e.key === "=") handleZoom("in");
      else if (e.key === "-" || e.key === "_") handleZoom("out");
      else if (e.key === "0") handleReset();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPDF, isImage, scale]);

  // Reset on content change (only for PDF and images)
  useEffect(() => {
    if (isPDF || isImage) {
      setScale(1);
    }
  }, [fullscreenBlobUrl]);

  // Simplified transform style
  const transformStyle = {
    transform: `scale(${scale})`,
    transformOrigin: "center",
    transition: "transform 0.1s ease-out",
  };

  // Zoom controls component
  const ZoomControls = () => (
    <div className="fixed bottom-10 right-10 flex items-center gap-2 bg-white rounded-lg shadow-lg p-1.5 border border-gray-200 z-50">
      <button
        onClick={() => handleZoom("out")}
        disabled={scale <= 0.5}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FontAwesomeIcon icon={faSearchMinus} />
      </button>
      <span className="text-xs font-medium w-10 text-center">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={() => handleZoom("in")}
        disabled={scale >= 3}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FontAwesomeIcon icon={faSearchPlus} />
      </button>
      <button
        onClick={handleReset}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-xs font-medium"
      >
        Reset
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/95 backdrop-blur-sm py-0">
      <div className="relative flex h-screen w-screen flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 bg-white border-2 border-b border-gray-300 shadow-sm">
          <div className="flex flex-col sm:flex-row items-left gap-0 sm:gap-3">
            <div className="text-xl md:text-2xl font-bold text-gray-800 ">
              {fullscreenBlobName}
            </div>
            {isPDF && (
              <div className="text-sm text-gray-600 flex items-center gap-2 ">
                <span>
                  Page {currentPage} of {numPages}
                </span>
                <div className="h-1 w-24 bg-gray-200 rounded-full overflow-hidden ">
                  <div
                    className="h-full bg-secondary rounded-full"
                    style={{ width: `${pdfProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isPDF && numPages > 1 && (
              <div className="flex items-center gap-2 mr-4">
                <button
                  onClick={() => {
                    onPageChange(Math.max(1, currentPage - 1));
                    handlePageChange(Math.max(1, currentPage - 1));
                  }}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent text-gray-700"
                >
                  <FaCaretLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    onPageChange(Math.min(numPages, currentPage + 1));
                    handlePageChange(Math.min(numPages, currentPage + 1));
                  }}
                  disabled={currentPage >= numPages}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent text-gray-700"
                >
                  <FaCaretRight className=" w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex text-gray-700 h-4 w-4 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-colors "
            >
              <FontAwesomeIcon className="text-xl sm:text-3xl" icon={faXmark} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-gray-50 relative">
          {isPitchFeature ? (
            (() => {
              try {
                const contentLinkJSON =
                  typeof selectedContent.content_link === "string"
                    ? JSON.parse(selectedContent.content_link)
                    : selectedContent.content_link;

                const Component = featureMap[contentLinkJSON?.Type];

                if (Component) {
                  return (
                    <div className="w-full h-[98%] px-[15%] mb-2 items-center content-center overflow-auto mt-6">
                      <Component
                        data={selectedContent.content_link}
                        hexColor={orgHex || "#28747d"}
                        description={selectedContent.content_description}
                        contentId={selectedContent.content}
                        content={selectedContent}
                        showUI = {true}
                        onClose = {onClose}
                      />
                    </div>
                  );
                }
                return <div>Unsupported feature type</div>;
              } catch (error) {
                console.error("Error rendering pitch feature:", error);
                return <div>Error loading feature</div>;
              }
            })()
          ) : isYoutubeOrVimeo ? (
            <div className="relative w-full h-full">
              <iframe
                src={selectedContent.content_link}
                className="absolute top-0 left-0 w-full h-full"
                title={fullscreenBlobName}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : isPublicUrl ? (
            <div className="w-full h-full">
              {publicLinkLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
                </div>
              ) : (
                <iframe
                  src={publicLink}
                  className="w-full h-full"
                  title={fullscreenBlobName}
                  frameBorder="0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              )}
            </div>
          ) : isCanvaLink ? (
            <div className="w-full h-full relative">
              <iframe
                src={selectedContent.content_link}
                className="w-full h-full"
                title="Canva Content"
                sandbox="allow-scripts allow-same-origin allow-popups"
                loading="eager"
              />
            </div>
          ) : isMicrosoftStream ? (
            <div className="w-full h-full relative">
              <iframe
                src={selectedContent.content_link}
                className="w-full h-full"
                title="Microsoft Stream Content"
                sandbox="allow-scripts allow-same-origin allow-popups"
                loading="eager"
              />
            </div>
          ) : isVideo ? (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <VideoComponent
                fullscreenBlobUrl={fullscreenBlobUrl}
                viewedPercentageRef={viewedPercentageRef}
                videoRef={videoRef}
                videoId={videoId}
                videoVewTimeRef={videoVewTimeRef}
                setIsActive={setIsActive}
                lastActivity={lastActivity}
                activeTime={activeTime}
              />
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center h-full bg-gray-100 relative">
              <ZoomControls />
              <div ref={contentRef} style={transformStyle}>
                <img
                  src={fullscreenBlobUrl}
                  alt={fullscreenBlobName}
                  className="max-h-[95vh] max-w-full object-contain select-none"
                />
              </div>
            </div>
          ) : isPDF ? (
            <div className="flex-1 flex flex-col items-center relative h-full w-full">
              <ZoomControls />
              <div className="h-full w-full overflow-auto">
                <div className="min-h-full flex items-center justify-center">
                  <div ref={contentRef} style={transformStyle}>
                    {isPdfLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Document
                          file={fullscreenBlobUrl}
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
                          onLoadError={(error) => {
                            console.error("PDF loading error:", error);
                            setPdfProgress(0);
                            scrollPositionRef.current = 0;
                          }}
                        >
                          {Array.from(new Array(numPages), (el, index) => (
                            <div
                              key={`page_${index + 1}`}
                              className={`my-4 ${
                                index + 1 === currentPage ? "block" : "hidden"
                              }`}
                            >
                              <Page
                                pageNumber={index + 1}
                                width={
                                  Math.min(window.innerWidth * 0.8, 800) * scale
                                }
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                              />
                            </div>
                          ))}
                        </Document>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full bg-gray-100 flex justify-center items-start overflow-auto">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="w-full h-full"
              >
                <DocViewer
                  documents={[{ uri: fullscreenBlobUrl }]}
                  pluginRenderers={DocViewerRenderers}
                  config={{
                    header: { disableHeader: true },
                    pdfVerticalScrollByDefault: true,
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullScreenPopup;
