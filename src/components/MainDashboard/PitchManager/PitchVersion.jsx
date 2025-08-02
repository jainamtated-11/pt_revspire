import React, { useContext, useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "react-query";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import MainLogo from "../../../../src/assets/RevSpire-logo.svg";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import toast from "react-hot-toast";
import DynamicLayout from "./DynamicLayout.jsx";

const PitchVersion = () => {
  const { pitchId, versionId } = useParams();
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const [fullscreenBlobUrl, setFullscreenBlobUrl] = useState(null);
  const [fullscreenBlobName, setFullscreenBlobName] = useState("");
  const [fullscreenMimeType, setFullscreenMimeType] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState(null);
  const [pitchVersionLoader, setPitchVersionLoader] = useState(false);
  const [titleFromLayout, setTitleFromLayout] = useState("");
  const [customButtons, setCustomButtons] = useState(null);
  const videoRef = useRef(null);
  const [orgHex, setOrgHex] = useState("#014d83");
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [backgroundImageData, setBackgroundImageData] = useState(null);
  const [isBackgroundImageLoading, setIsBackgroundImageLoading] =
    useState(false);

  const [clientLogoData, setClientLogoData] = useState(null);
  const [isClientLogoLoading, setIsClientLogoLoading] = useState(true);

  const [pitchData, setPitchData] = useState(null);
  const [layout, setLayout] = useState("");
  const [pitchLayoutId, setPitchLayoutId] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const fetchPitchVersionData = async () => {
    try {
      const token = getCookieValue("revspireToken");
      const response = await axiosInstance.post(
        `/view-pitch-version-details`,
        {
          viewer_id: viewer_id,
          pitchVersionId: versionId,
          manual_token: token,
        },
        { withCredentials: true }
      );
      const pitchSections = response.data.data.pitchSections.map((section) => {
        return {
          ...section,
          name: section.section.name || "N/A",
          order: section.section.order || 0,
          contents: section.contents,
        };
      });
      const pitchData = {
        pitch: response.data.data.pitch,
        pitchSections: pitchSections,
        pitchContacts: response.data.data.pitchContacts,
      };

      return pitchData;
    } catch (error) {
      console.error("Error fetching data ", error.message);
    }
  };

  useEffect(() => {
    const fetchPitchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/retrieve-pitch-sections-and-contents/${pitchId}`,
          {
            withCredentials: true,
          }
        );

        const data = response?.data;
        if (data) {
          setPitchLayoutId(data?.pitch?.pitch_layout);
          setUserDetails(data.userDetails[0]);

          if (data?.orgDetails?.[0]?.company_logo?.data) {
            const logoData = data.orgDetails[0].company_logo.data;
            const mimeType =
              data.orgDetails[0].company_logo.mimetype || "image/png";

            const uint8Array = new Uint8Array(logoData);
            const base64String = btoa(
              String.fromCharCode.apply(null, uint8Array)
            );

            setOrgHex(`#${data?.dsr_primary_color}`);

            const isSvgImage =
              mimeType === "image/svg+xml" ||
              String.fromCharCode.apply(null, uint8Array).includes("<svg") ||
              String.fromCharCode.apply(null, uint8Array).includes("<?xml");

            const dataUrl = isSvgImage
              ? `data:image/svg+xml;base64,${base64String}`
              : `data:${mimeType};base64,${base64String}`;

            const img = new Image();
            img.onload = () => {
              setCompanyLogoUrl(dataUrl);
              setIsLogoLoaded(true);
            };
            img.src = dataUrl;
          }
          const newPitchData = await fetchPitchVersionData();
          setPitchData(newPitchData);
        }
      } catch (error) {
        console.error("Error fetching pitch data:", error);
      }
    };
    fetchPitchData();
  }, []);

  useEffect(() => {
    if (fullscreenBlobUrl !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [fullscreenBlobUrl]);

  const applyStylesToWidget = () => {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.pause();
    });
  };

  const toggleFullscreen = (blobUrl, blobName, id, content) => {
    applyStylesToWidget();
    if (blobUrl) {
      setFullscreenBlobUrl(blobUrl);
      setFullscreenBlobName(blobName);
      setFullscreenMimeType(content?.content_mimetype);
    } else {
      setFullscreenBlobUrl(null);
      setFullscreenBlobName("");
      setFullscreenMimeType(null);
    }
  };
  const fetchBackgroundImage = async () => {
    setIsBackgroundImageLoading(true);
    try {
      const response = await axiosInstance.post(
        `/pitch-preview-content`,
        { viewerId: viewer_id, content_name: `${pitchId}_background_image` },
        { responseType: "blob", withCredentials: true }
      );
      return URL.createObjectURL(response.data);
    } catch (error) {
      try {
        const fallbackResponse = await axiosInstance.post(
          `/pitch-preview-content`,
          {
            viewerId: viewer_id,
            content_name: `${pitchLayoutId}_background_image`,
          },
          { responseType: "blob", withCredentials: true }
        );
        return URL.createObjectURL(fallbackResponse.data);
      } catch (fallbackError) {
        console.error(
          "Both attempts to fetch the background image failed",
          fallbackError
        );
      }
    } finally {
      setIsBackgroundImageLoading(false);
    }
  };

  const fetchClientLogo = async () => {
    setIsClientLogoLoading(true); // Set loading state
    try {
      const res = await axiosInstance.post(
        `/pitch-preview-content`,
        { viewerId: viewer_id, content_name: `${pitchId}_client_logo` },
        { responseType: "blob", withCredentials: true }
      );
      const logoUrl = URL.createObjectURL(res.data);
      setClientLogoData(logoUrl);
    } catch {
      const res = await axiosInstance.post(
        `/pitch-preview-content`,
        {
          viewerId: viewer_id,
          content_name: `${pitchLayoutId}_client_logo`,
        },
        { responseType: "blob", withCredentials: true }
      );
      const logoUrl = URL.createObjectURL(res.data);
      setClientLogoData(logoUrl);
    } finally {
      setIsClientLogoLoading(false); // Reset loading state
    }
  };

  useEffect(() => {
    const loadBackgroundImage = async () => {
      const imageData = await fetchBackgroundImage();
      if (imageData) {
        setBackgroundImageData(imageData);
      }
    };

    loadBackgroundImage();
    fetchClientLogo();
  }, [pitchId, pitchLayoutId, viewer_id]);

  const fetchHighlightVideo = async () => {
    try {
      const token = getCookieValue("revspireToken");

      const response = await axiosInstance.post(
        "/view-pitch-highlight-video",
        { viewer_id: viewer_id, pitch_id: pitchId, manual_token: token },
        { responseType: "json", withCredentials: true }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching highlight video:", error);
      throw error;
    }
  };

  const handleDataFromChild = (data) => {
    setTitleFromLayout(data); // Update the state with the data sent from the child
  };

  const handleCustomButtons = (customButtons) => {
    setCustomButtons(customButtons);
  };

  const fetchHighlightVideoSasUrls = async (highlightVideos) => {
    const sasUrls = await Promise.all(
      highlightVideos.map(async (video) => {
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
    return sasUrls;
  };

  const {
    data: highlightVideoData,
    isSuccess: isHighlightVideoFetched,
    isLoading: isHighlightVideoLoading,
  } = useQuery(["highlightVideo", viewer_id, pitchId], fetchHighlightVideo, {
    enabled: !!viewer_id && !!pitchId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const {
    data: highlightVideosWithSasUrls,
    isSuccess: isSasUrlsFetched,
    isLoading: isSasUrlsLoading,
  } = useQuery(
    ["highlightVideoSasUrls", highlightVideoData],
    () => fetchHighlightVideoSasUrls(highlightVideoData),
    {
      enabled: !!highlightVideoData,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  // Fetch blob URLs for each content item in parallel
  const fetchContentBlobs = async (contents) => {
    const promises = contents.map(async (content) => {
      // Skip API call for YouTube and Vimeo content
      if (
        content.content_source?.toLowerCase() === "youtube" ||
        content.content_source?.toLowerCase() === "vimeo"
      ) {
        return {
          ...content,
          blobUrl: content.content_link || content.content_content,
        };
      }

      const blobUrl = await fetchBlobData(
        content.content_id,
        content.content_mimetype
      );
      return { ...content, blobUrl };
    });

    const blobs = await Promise.all(promises);
    return blobs.filter((blob) => blob.blobUrl !== null);
  };

  const fetchBlobData = async (contentId, contentMimeType) => {
    try {
      const token = getCookieValue("revspireToken");
      let responseType = "blob";
      if (
        contentMimeType.includes("application/vnd") ||
        contentMimeType.includes("application/msword") ||
        contentMimeType.includes("video/")
      ) {
        responseType = "JSON";
      }

      const response = await axiosInstance.post(
        `/open-content`,
        { viewerId: viewer_id, contentId: contentId, manual_token: token },
        {
          responseType: responseType,
          withCredentials: true,
        }
      );

      if (responseType === "JSON") {
        if (typeof response.data === "string") {
          const sasUrl = JSON.parse(response.data).sasUrl;
          return sasUrl;
        } else {
          throw new Error("Unexpected response data type");
        }
      } else {
        if (typeof response.data === "string") {
          return response.data;
        } else if (response.data instanceof Blob) {
          const url = URL.createObjectURL(response.data);
          return url;
        } else {
          throw new Error("Unexpected response data type");
        }
      }
    } catch (error) {
      toast.error("Error fetching content:", error);
      return null;
    }
  };

  const { data: blobs, isLoading: isBlobLoading } = useQuery(
    ["fetchContentBlobs", pitchId],
    () =>
      fetchContentBlobs(
        pitchData?.pitchSections.flatMap((section) => section.contents)
      ),
    {
      enabled: !!pitchId && !!pitchData,
      dependencies: [pitchData],
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const fetchHtmlCode = async () => {
    if (pitchLayoutId) {
      try {
        const res = await axiosInstance.post(
          `${baseURL}/pitch-preview-content`,
          {
            viewerId: viewer_id,
            content_name: `${pitchLayoutId}_html_code`,
          }
        );
        if (res) {
          setLayout(res.data);
        }
      } catch (error) {
        console.log("Error in fetchinbg jsx code", error);
      }
    }
  };

  useEffect(() => {
    if (pitchLayoutId) {
      fetchHtmlCode();
    }
  }, [pitchLayoutId]);

  const isLoading =
    isBackgroundImageLoading ||
    isClientLogoLoading ||
    isBlobLoading ||
    isHighlightVideoLoading ||
    isSasUrlsLoading;

  // Combine all loading states into one
  const isPageLoading = isLoading || pitchVersionLoader;

  const MemoizedDocViewer = React.memo(
    ({ blobUrl }) => (
      <div className="flex justify-center w-full h-full overflow-auto">
        <DocViewer
          documents={[{ uri: blobUrl }]}
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
    ),
    (prevProps, nextProps) => prevProps.blobUrl === nextProps.blobUrl
  );

  MemoizedDocViewer.displayName = "MemoizedDocViewer";

  const handlePlayVideo = (id) => {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      if (video.id !== id) {
        video.pause();
      } else {
        video.play();
      }
    });
  };

  const handlePauseVideo = (id) => {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      if (video.id !== id) {
        video.pause();
      }
    });
  };

  const handleOnClickContent = (content, blobUrl, mimeType, tagline) => {
    setSelectedContent(content);

    if (
      content.content_source?.toLowerCase() === "youtube" ||
      content.content_source?.toLowerCase() === "vimeo" ||
      content.content_source?.toLowerCase() === "public url"
    ) {
      // For YouTube, Vimeo, and Public URLs, use content_link directly
      toggleFullscreen(
        content.content_link || content.content_content,
        tagline,
        "application/url",
        content
      );
    } else {
      toggleFullscreen(blobUrl, tagline, mimeType, content);
    }
  };

  // Add new state for lazy loading
  const [visibleSectionsCount, setVisibleSectionsCount] = useState(3);
  const [visibleContentCounts, setVisibleContentCounts] = useState({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Initialize visible content counts when pitch data loads
  useEffect(() => {
    if (pitchData?.pitchSections) {
      const initCounts = {};
      pitchData.pitchSections.forEach((section) => {
        initCounts[section.id] = 4; // Show initial 4 contents per section
      });
      setVisibleContentCounts(initCounts);
    }
  }, [pitchData]);

  // Create truncated sections data
  const truncatedSections = useMemo(() => {
    if (!pitchData?.pitchSections) return [];
    return pitchData.pitchSections
      .slice(0, visibleSectionsCount)
      .map((section) => ({
        ...section,
        contents: section.contents.slice(
          0,
          visibleContentCounts[section.id] || 4
        ),
        hasMoreContents:
          section.contents.length > (visibleContentCounts[section.id] || 4),
      }));
  }, [pitchData, visibleSectionsCount, visibleContentCounts]);

  // Handler for loading more sections
  const handleLoadMoreSections = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleSectionsCount((prev) => prev + 3);
      setIsLoadingMore(false);
    }, 800); // Simulate loading delay
  };

  // Handler for loading more contents in a section
  const handleLoadMoreContents = (sectionId) => {
    setVisibleContentCounts((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] || 4) + 4,
    }));
  };

  const popup = () => {
    const isVideo = fullscreenMimeType?.startsWith("video/");
    const isDocument = ["application/pdf"]?.includes(fullscreenMimeType);
    const isImage = fullscreenMimeType?.startsWith("image");
    const isYoutubeOrVimeo =
      selectedContent?.content_source?.toLowerCase() === "youtube" ||
      selectedContent?.content_source?.toLowerCase() === "vimeo";
    const isPublicUrl =
      selectedContent?.content_source?.toLowerCase() === "public url";

    return (
      <div
        id="popup"
        className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center bg-black/50 backdrop-blur-sm py-6 dark:bg-gray-900/70"
        style={{ zIndex: 1000 }}
      >
        <div className="relative flex h-[40vh] md:h-full w-[90vw] md:w-full max-w-5xl flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-700 dark:bg-gray-700">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              {fullscreenBlobName}
            </div>
            <button
              type="button"
              onClick={() => {
                setFullscreenBlobUrl(null);
                toggleFullscreen(null);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              <FontAwesomeIcon className="text-lg" icon={faXmark} />
            </button>
          </div>
          <div className="h-full overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800">
            {isYoutubeOrVimeo ? (
              <div className="relative w-full h-full">
                <iframe
                  src={
                    selectedContent.content_link ||
                    selectedContent.content_content
                  }
                  className="absolute top-0 left-0 w-full h-full"
                  title={fullscreenBlobName}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : isPublicUrl ? (
              <div className="w-full h-full">
                <iframe
                  src={
                    selectedContent.content_link ||
                    selectedContent.content_content
                  }
                  className="w-full h-full"
                  title={fullscreenBlobName}
                  frameBorder="0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            ) : isVideo ? (
              <VideoComponent
                fullscreenBlobUrl={fullscreenBlobUrl}
                // viewedPercentageRef={viewedPercentageRef}
                videoRef={videoRef}
                // videoId={videoId}
                // videoVewTimeRef={videoVewTimeRef}
                // setIsActive={setIsActive}
                // lastActivity={lastActivity}
                // activeTime={activeTime}
              />
            ) : isImage ? (
              <div className="flex items-center justify-center h-full w-full p-4">
                <div className="relative max-h-[100%] max-w-[100%] overflow-hidden">
                  <img
                    // id={imageId}
                    // ref={imageRef}
                    src={fullscreenBlobUrl}
                    className="object-contain w-auto h-auto"
                    alt="Full screen content"
                  />
                </div>
              </div>
            ) : (
              <MemoizedDocViewer
                blobUrl={fullscreenBlobUrl}
                // handleScroll={handleScroll}
                // scrollContainerRef={scrollContainerRef}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isPageLoading ? (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          {/* {isLogoLoaded && (
            <img
              src={companyLogoUrl}
              className="h-16 sm:h-24 animate-pulse"
              alt="Company Logo"
              onError={(e) => {
                e.target.src = MainLogo;
              }}
            />
          )} */}
        </div>
      ) : (
        <>
          {fullscreenBlobUrl && popup()}
          <div className="w-full min-h-screen bg-gray-100">
            <nav className="relative z-10 flex justify-between items-center h-16 bg-white bg-opacity-90 px-4 sm:px-10">
              <div className="flex items-center gap-3 text-3xl sm:text-4xl">
                <span className="border-r pr-3 border-r-neutral-400">
                  <img
                    src={companyLogoUrl || MainLogo}
                    className="mr-3 h-6 sm:h-9"
                    alt="Company Logo"
                  />
                </span>
                {clientLogoData && (
                  <img
                    src={clientLogoData}
                    className="mr-3 h-6 sm:h-9"
                    alt="Client Logo"
                  />
                )}
                {titleFromLayout && (
                  <>
                    <p className="hidden md:flex md:text-2xl md:font-semibold">
                      {titleFromLayout}
                    </p>
                  </>
                )}
              </div>
            </nav>

            {pitchData && (
              <>
                <DynamicLayout
                  pitchData={pitchData}
                  layout={layout}
                  data={{
                    backgroundImageData: backgroundImageData,
                    pitch: pitchData.pitch,
                    pitchSections: truncatedSections,
                    onClickContentHandler: handleOnClickContent,
                    highlightVideosData: highlightVideosWithSasUrls,
                    companyLogoUrl: companyLogoUrl,
                    userDetails: userDetails,
                    handlePlayVideo: handlePlayVideo,
                    handlePauseVideo: handlePauseVideo,

                    hasMoreSections:
                      pitchData?.pitchSections?.length > visibleSectionsCount,
                    isLoadingMore,
                    onLoadMoreSections: handleLoadMoreSections,
                    onLoadMoreContents: handleLoadMoreContents,
                  }}
                  sendDataToParent={handleDataFromChild}
                  handleCustomButtons={handleCustomButtons}
                  orgHex={orgHex}
                  parent={"PitchVersion"}
                />
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default PitchVersion;

const VideoComponent = ({ fullscreenBlobUrl, videoId, videoRef }) => {
  return (
    <div className="relative pb-2/3 overflow-hidden w-full h-full object-cover">
      <video
        src={fullscreenBlobUrl}
        controls
        className="w-full h-full object-cover"
      />
    </div>
  );
};
