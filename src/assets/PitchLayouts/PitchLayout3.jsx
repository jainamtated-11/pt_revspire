function StandardLayout({
  backgroundImageData,
  pitchSections,
  highlightVideosData,
  blobs,
  pitch,
  FaAngleLeft,
  FaAngleRight,
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  motion,
  AnimatePresence,
  nextVideo,
  prevVideo,
  currentIndex,
  handlePauseVideo,
  handlePlayVideo,
  userDetails,
  companyLogoUrl,
  onClickContentHandler,
  orgHex,
  hasMoreSections,
  isLoadingMore,
  onLoadMoreSections,
  onLoadMoreContents,
  uiStrings,
  Document,
  Page,
  setDSRconfig,
  featureMap,
  pitchEngagementId
}) {
  useEffect(() => {
    setDSRconfig((prevConfig) => ({
      ...prevConfig,
      visibleSectionsCount: 99,
      initialContentCounts: 99,
      currentPopupStyle: "fullScreenpOUP",
      contentGrouping: true,
      processOverVeiw: true,
      actionPlan: true,
      eSigner: true,
      userMessage: true,
      htmlBlock: true,
      fileUploader: true,
    }));
  }, []);
  const tabsContainerRef = useRef(null);

  // State for active tab
  const [activeTab, setActiveTab] = useState("introduction");
  // State for sidebar navigation
  const [activeSections, setActiveSections] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const sectionRefs = useRef({});
  const mainContentRef = useRef(null);
  const [loadingPublicUrls, setLoadingPublicUrls] = useState({});

  const handlePublicUrlLoad = (contentId) => {
    setLoadingPublicUrls((prev) => ({ ...prev, [contentId]: true }));
    setTimeout(() => {
      setLoadingPublicUrls((prev) => ({ ...prev, [contentId]: false }));
    }, 2000);
  };

  // Function to group contents by pitch_content_group
  const groupContentsByGroup = (contents) => {
    // First sort contents by arrangement to ensure correct order
    const sortedContents = [...contents].sort(
      (a, b) => a.arrangement - b.arrangement
    );

    const result = [];
    let currentGroup = null;

    for (const content of sortedContents) {
      if (content.pitch_content_group && content.pitch_content_group_name) {
        // If this content belongs to a group
        if (!currentGroup || currentGroup.id !== content.pitch_content_group) {
          // Start a new group
          if (currentGroup) {
            result.push(currentGroup);
          }
          currentGroup = {
            id: content.pitch_content_group,
            name: content.pitch_content_group_name,
            contents: [content],
            isGroup: true,
          };
        } else {
          // Add to current group
          currentGroup.contents.push(content);
        }
      } else {
        // If this is an individual content
        if (currentGroup) {
          // Push the current group before adding individual content
          result.push(currentGroup);
          currentGroup = null;
        }
        result.push({
          ...content,
          isGroup: false,
        });
      }
    }

    // Push any remaining group
    if (currentGroup) {
      result.push(currentGroup);
    }

    return result;
  };

  // Function to get grid layout for grouped contents
  const getGroupGridLayout = (contentCount) => {
    switch (contentCount) {
      case 1:
        return "grid-cols-1 grid-rows-1";
      case 2:
        return "grid-cols-2 grid-rows-1";
      case 3:
        return "grid-cols-2 grid-rows-2";
      case 4:
        return "grid-cols-2 grid-rows-2";
      default:
        return "grid-cols-2 grid-rows-2";
    }
  };

  // Function to get content height for grouped items
  const getGroupedContentHeight = (contentCount) => {
    switch (contentCount) {
      case 1:
        return "h-[200px] sm:h-[250px] md:h-[300px]"; // Reduced height for single content
      case 2:
        return "h-[140px] sm:h-[190px] md:h-[240px]";
      case 3:
      case 4:
        return "h-[140px] sm:h-[190px] md:h-[240px]";
      default:
        return "h-[140px] sm:h-[190px] md:h-[240px]";
    }
  };

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeTabElement = tabsContainerRef.current.querySelector(
        `[data-tab-id="${activeTab}"]`
      );

      if (activeTabElement) {
        const containerRect = tabsContainerRef.current.getBoundingClientRect();
        const tabRect = activeTabElement.getBoundingClientRect();

        if (
          tabRect.left < containerRect.left ||
          tabRect.right > containerRect.right
        ) {
          tabsContainerRef.current.scrollLeft =
            tabsContainerRef.current.scrollLeft +
            (tabRect.left - containerRect.left) -
            containerRect.width / 2 +
            tabRect.width / 2;
        }
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "introduction" || activeSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let found = false;
        entries.forEach((entry) => {
          if (entry.isIntersecting && !found) {
            setActiveSection(entry.target.id);
            found = true;
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-100px 0px -50% 0px",
      }
    );

    activeSections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    });

    // --- Fix: Highlight last sidebar item when scrolled to bottom ---
    const handleScroll = () => {
      const scrollContainer = document.querySelector(".main-content-container");
      const isWindow = !scrollContainer;
      let atBottom = false;

      if (isWindow) {
        atBottom =
          window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
      } else {
        atBottom =
          scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 2;
      }

      if (atBottom) {
        setActiveSection(activeSections[activeSections.length - 1].id);
      }
    };

    if (document.querySelector(".main-content-container")) {
      document
        .querySelector(".main-content-container")
        .addEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      observer.disconnect();
      if (document.querySelector(".main-content-container")) {
        document
          .querySelector(".main-content-container")
          .removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [activeTab, activeSections]);

  // Reset scroll and active section on tab change
  useEffect(() => {
    const scrollContainer = document.querySelector(".main-content-container");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "auto" });
    }

    window.scrollTo(0, 0);

    if (activeTab !== "introduction" && activeSections.length > 0) {
      setActiveSection(activeSections[0].id);
    }
  }, [activeTab, activeSections]);

  // Modified tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    requestAnimationFrame(() => {
      const scrollContainer = document.querySelector(".main-content-container");
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: "auto" });
      }
      window.scrollTo(0, 0);
    });
  };

  // Define helper function outside component or inside useCallback
  const isUserMessageType = (contentLink) => {
    try {
      const parsed = JSON.parse(contentLink || "{}");
      return parsed.Type === "UserMessage";
    } catch {
      return false;
    }
  };

  // Memoize the renderContent function if you're experiencing performance issues
  const renderContent = React.useCallback(
    (content, blobUrl, isGrouped = false) => {
      if (!blobUrl) {
        return <DotLoader />;
      }

      const contentHeight = isGrouped ? "h-full" : "h-full";
      const needsOverlay =
        content.content_mimetype?.includes("application/vnd") ||
        content.content_mimetype?.includes("application/msword") ||
        content.content_mimetype?.includes("application/url") ||
        content.content_source?.toLowerCase() === "public url";

      if (content.content_source?.toLowerCase() === "youtube") {
        const videoId = getVideoId(content.content_link, "youtube");
        const thumbnailUrl = videoId
          ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          : `https://img.youtube.com/vi/${videoId}/default.jpg`;
        return (
          <div
            className={`relative w-full ${contentHeight} overflow-hidden bg-black`}
          >
            {thumbnailUrl && (
              <img
                src={thumbnailUrl || "/placeholder.svg"}
                alt={content.tagline}
                className="absolute inset-0 w-full h-full object-cover object-top"
                onError={(e) => {
                  if (videoId && e.target.src.includes("maxresdefault")) {
                    e.target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                  }
                }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`${
                  isGrouped ? "w-8 h-6" : "w-16 h-12"
                } bg-red-600 rounded-lg flex items-center justify-center`}
              >
                <svg
                  className={`${isGrouped ? "w-4 h-4" : "w-8 h-8"} text-white`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        );
      }

      if (content.content_source?.toLowerCase() === "vimeo") {
        const videoId = getVideoId(content.content_link, "vimeo");

        return (
          <div
            className={`relative w-full ${contentHeight} overflow-hidden bg-black`}
          >
            {videoId ? (
              <>
                <img
                  src={`https://vumbnail.com/${videoId}.jpg`}
                  alt={content.tagline}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.target.src = "path/to/fallback-video-thumbnail.jpg";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`${
                      isGrouped ? "w-8 h-6" : "w-16 h-12"
                    } bg-[#00adef] rounded-lg flex items-center justify-center`}
                  >
                    <svg
                      className={`${
                        isGrouped ? "w-4 h-4" : "w-8 h-8"
                      } text-white`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center p-4">
                  <div
                    className={`${
                      isGrouped ? "w-8 h-6" : "w-16 h-12"
                    } bg-[#00adef] rounded-lg flex items-center justify-center mx-auto mb-2`}
                  >
                    <svg
                      className={`${
                        isGrouped ? "w-4 h-4" : "w-8 h-8"
                      } text-white`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  {!isGrouped && (
                    <p className="text-sm text-gray-600">Video Preview</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }

      if (content.content_source?.toLowerCase() === "public url") {
        if (loadingPublicUrls[content.id] === undefined) {
          handlePublicUrlLoad(content.id);
        }

        return (
          <div
            className={`relative w-full ${contentHeight} overflow-hidden bg-gray-50`}
          >
            {loadingPublicUrls[content.id] ? (
              <div className="absolute inset-0 flex items-center justify-center">
                {DotLoader()}
              </div>
            ) : (
              <iframe
                src={content.content_link}
                className="absolute top-0 left-0 w-full h-full"
                title={content.tagline}
                sandbox="allow-same-origin allow-scripts"
                style={{
                  transform: "scale(1)",
                  transformOrigin: "top left",
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            )}
          </div>
        );
      }

      if (content.content_source?.toLowerCase() === "canva link") {
        return (
          <div
            className={`relative w-full ${contentHeight} overflow-hidden bg-gray-50`}
          >
            <iframe
              src={content.content_link}
              className="absolute top-0 left-0 w-full h-full"
              title={content.tagline}
              sandbox="allow-scripts allow-same-origin allow-popups"
              allowFullScreen
              style={{
                transform: "scale(1)",
                transformOrigin: "top left",
              }}
              onLoad={() => handlePublicUrlLoad(content.id)}
            />
          </div>
        );
      }

      // Handle Microsoft Stream Links
      else if (content.content_source?.toLowerCase() === "microsoft stream") {
        return (
          <div
            className={`relative w-full ${contentHeight} overflow-hidden bg-gray-50`}
          >
            <iframe
              src={content.content_link}
              className="absolute top-0 left-0 w-full h-full"
              title={content.tagline}
              sandbox="allow-scripts allow-same-origin allow-popups"
              allowFullScreen
              style={{
                transform: "scale(1)",
                transformOrigin: "top left",
              }}
              onLoad={() => handlePublicUrlLoad(content.id)}
            />
          </div>
        );
      }

      // Handle existing content types
      switch (content.content_mimetype) {
        case "video/mp4":
          return (
            <div className={`relative overflow-hidden w-full ${contentHeight}`}>
              <div className="absolute flex justify-center items-center bg-transparent bg-opacity-20 w-full inset-x-0 h-[calc(100%-70px)] z-10"></div>
              <video
                id={content.id}
                src={blobUrl}
                controls
                className="w-full h-full object-cover object-top"
                onPlay={() => handlePlayVideo(content.id, content)}
                onPause={() => handlePauseVideo(content.id, content)}
              />
            </div>
          );
        case "application/pdf":
          return (
            <div
              className={`w-full ${contentHeight} bg-white flex items-start justify-center overflow-hidden`}
            >
              <Document
                file={blobUrl}
                loading={<DotLoader />}
                error={
                  <div className="flex items-center justify-center h-full text-red-500">
                    Failed to load PDF.
                  </div>
                }
              >
                <Page
                  pageNumber={1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="pdf-page"
                  width={
                    isGrouped
                      ? window.innerWidth * 0.3
                      : window.innerWidth * 0.6
                  }
                  height={
                    isGrouped
                      ? window.innerHeight * 0.3
                      : window.innerHeight * 0.6
                  }
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start", // Changed from "center" to "flex-start"
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "top", // Anchor to top
                  }}
                />
              </Document>
            </div>
          );

        case "image/jpg":
        case "image/jpeg":
        case "image/png":
        case "image/webp":
        case "image/gif":
          return (
            <div className={`relative overflow-hidden w-full ${contentHeight}`}>
              <img
                src={blobUrl || "/placeholder.svg"}
                alt={content.tagline}
                className="w-full h-full object-cover object-top" // Changed to object-top
              />
            </div>
          );
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        case "application/msword":
        case "application/vnd.ms-excel":
        case "application/vnd.ms-powerpoint":
          return (
            <div
              className={`relative overflow-hidden w-full ${contentHeight}`}
              style={{
                display: "flex",
                alignItems: "flex-start", // Anchor content to top
                justifyContent: "center",
              }}
            >
              <MemoizedDocViewer blobUrl={blobUrl} />
              {isGrouped && (
                <div className="absolute inset-0 bg-transparent cursor-pointer z-10" />
              )}
            </div>
          );
        case "/pitchfeature": {
          try {
            const contentLinkJSON =
              typeof content.content_link === "string"
                ? JSON.parse(content.content_link)
                : content.content_link;

            const Component = featureMap[contentLinkJSON?.Type]; // Safely access Type

            if (Component) {
              return (
                <div className="w-full h-full overflow-auto ">
                  <Component
                    data={content.content_link}
                    hexColor={orgHex.orgHex}
                    description={content.content_description}
                    contentId={content.content} // Make sure to pass contentId
                    content={content}
                    onClickContentHandler={onClickContentHandler}
                    pitchEngagementId={pitchEngagementId}
                  />
                </div>
              );
            }
          } catch (error) {
            console.error("Error parsing pitch feature:", error);
            return <div>Error loading feature</div>;
          }
          return <div>Unsupported feature type</div>;
        }

        default:
          return (
            <div
              className={`relative overflow-hidden w-full ${contentHeight} flex items-start justify-center`}
            >
              <p className={`${isGrouped ? "text-xs" : "text-sm"} mt-4`}>
                Unsupported content type: {content.content_mimetype}
              </p>
            </div>
          );
      }
      // ... existing implementation ...
    },
    [loadingPublicUrls, orgHex]
  );

  // Render grouped content container
  const renderGroupedContent = (group) => {
    const gridLayout = getGroupGridLayout(group.contents.length);
    const groupId = `group-${group.id}`;

    // Dynamic height based on content count
    const containerHeight =
      group.contents.length === 2 || group.contents.length === 1
        ? "h-[280px] sm:h-[350px] md:h-[420px]"
        : "h-[300px] sm:h-[400px] md:h-[500px]";

    return (
      <div
        key={groupId}
        ref={(el) => (sectionRefs.current[groupId] = el)}
        id={groupId}
        className="border p-1 w-[100%] bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
      >
        <div className={`${containerHeight} w-full flex flex-col p-3`}>
          {/* Group Title */}
          <h3 className="text-lg sm:text-xl font-[Montserrat] font-bold text-gray-800 line-clamp-1 mb-3">
            {group.name}
          </h3>

          {/* Grouped Contents Grid */}
          <div
            className={`flex-1 grid ${gridLayout} gap-3 font-[Montserrat] relative overflow-hidden bg-gray-50 border border-gray-200 rounded-lg p-3`}
          >
            {group.contents.map((content, index) => {
              if (!blobs || !blobs.length) {
                return null;
              }
              const blobInfo = blobs.find(
                (blob) => blob.content_id === content.content_id
              );

              if (!blobInfo) {
                return (
                  <div
                    key={content.id}
                    className={`${getGroupedContentHeight(
                      group.contents.length
                    )} bg-gray-100 rounded flex items-center justify-center`}
                  >
                    {DotLoader()}
                  </div>
                );
              }

              return (
                <div
                  key={content.id}
                  className={`bg-white rounded border border-gray-200 overflow-hidden relative group flex flex-col`}
                  onClick={() => {
                    onClickContentHandler(
                      content,
                      blobInfo.blobUrl,
                      content.content_mimetype,
                      content.tagline
                    );
                  }}
                >
                  {/* Content Preview */}
                  <div
                    className={`${getGroupedContentHeight(
                      group.contents.length
                    )} relative overflow-hidden cursor-pointer flex items-start`}
                    style={{
                      alignItems: "flex-start", // Ensure content starts from top
                    }}
                  >
                    {renderContent(content, blobInfo.blobUrl, true)}

                    {/* Transparent overlay for interactive content */}
                    {(content.content_mimetype?.includes("application/vnd") ||
                      content.content_mimetype?.includes(
                        "application/msword"
                      ) ||
                      content.content_mimetype?.includes("application/url") ||
                      content.content_source?.toLowerCase() ===
                        "public url") && (
                      <div className="absolute inset-0 bg-transparent cursor-pointer z-10" />
                    )}
                  </div>

                  {/* Content Title */}
                  <div className="p-2 bg-white border-t border-gray-100">
                    <p className="text-xs font-medium text-red-800 truncate mb-1">
                      {content.tagline}
                    </p>

                    <p className="text-xs text-gray-500">
                      {content?.content_mimetype === "application/url" ? (
                        content?.content_source
                      ) : (
                        <>
                          {getFileType(content?.content_mimetype)} |{" "}
                          {(content?.content_size / 1024).toFixed(1)} MB
                          {blobInfo?.totalPages ? (
                            <>
                              {" "}
                              | {blobInfo.totalPages}{" "}
                              {blobInfo.totalPages === 1 ? "Page" : "Pages"}
                            </>
                          ) : null}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Group Info */}
          <div className="pt-3">
            <h5
              className="text-sm text-gray-600"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 400,
                fontSize: "12px",
              }}
            >
              Group • {group.contents.length} items
            </h5>
          </div>
        </div>
      </div>
    );
  };

  // Render individual content
  const renderIndividualContent = (content) => {
    if (!blobs || !blobs.length) {
      return null;
    }
    const blobInfo = blobs.find(
      (blob) => blob.content_id === content.content_id
    );

    if (!blobInfo) {
      return null;
    }

    const blobUrl = blobInfo.blobUrl;

    return (
      <div
        key={content.id}
        ref={(el) => (sectionRefs.current[content.id] = el)}
        id={content.id}
        className={`border  p-1 w-[100%] bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg ${
          content?.content_mimetype !== "/pitchfeature" ? "cursor-pointer" : ""
        }  transform hover:-translate-y-1 transition-all duration-300 ease-in-out`}
      >
        <div
          id={content.id + "analytics"}
          onClick={() => {
            if (content.content_mimetype === "/pitchfeature") return;
            onClickContentHandler(
              content,
              blobUrl,
              content.content_mimetype,
              content.tagline
            );
          }}
          className=" h-[300px] sm:h-[400px] md:h-[500px] w-full flex flex-col p-3"
        >
          {/* Checking if content_link.Type is UserMessage is then don't allow to open in modal */}
          <h3
            className={`text-lg sm:text-xl font-[Montserrat]  font-bold text-gray-800 line-clamp-1 mb-3 ${
              (!isUserMessageType(content.content_link) && content.content_mimetype == "/pitchfeature" )&& "cursor-pointer"
            }`}
            onClick={
              (!isUserMessageType(content.content_link) && content.content_mimetype == "/pitchfeature" )
                ? () =>
                    onClickContentHandler(
                      content,
                      blobUrl,
                      content.content_mimetype,
                      content.tagline
                    )
                : undefined
            }
          >
            {content.tagline}
          </h3>

          <div
            className={`flex-1 font-[Montserrat] relative overflow-hidden bg-gray-50 ${
              content?.content_mimetype !== "/pitchfeature"
                ? "border border-gray-200"
                : ""
            }   rounded-lg`}
            style={{
              display: "flex",
              alignItems: "flex-start", // Anchor content to top
              justifyContent: "center",
            }}
          >
            {blobInfo ? (
              renderContent(content, blobInfo.blobUrl, false)
            ) : (
              <DotLoader />
            )}
          </div>
          <div className="pt-3">
            <h5
              className="text-sm text-gray-600"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 400,
                fontSize: "12px",
              }}
            >
              {content?.content_mimetype ===
              "/pitchfeature" ? null : content?.content_mimetype ===
                "application/url" ? (
                content?.content_source
              ) : (
                <>
                  {getFileType(content?.content_mimetype)} |{" "}
                  {(content?.content_size / 1024).toFixed(1)} MB
                  {blobInfo?.totalPages && (
                    <>
                      {" "}
                      | {blobInfo.totalPages}{" "}
                      {blobInfo.totalPages === 1 ? "Page" : "Pages"}
                    </>
                  )}
                </>
              )}
            </h5>
          </div>
        </div>
      </div>
    );
  };

  // Create tabs from pitch sections and add Introduction tab
  const tabs = [
    { id: "introduction", name: "Introduction" },
    ...(pitchSections || []).map((section) => ({
      id: section.id,
      name: section.name,
    })),
  ];

  // Update sidebar sections based on active tab
  useEffect(() => {
    if (activeTab === "introduction") {
      setActiveSections([]);
      setActiveSection("");
    } else {
      const activeTabData = pitchSections.find(
        (section) => section.id === activeTab
      );
      if (activeTabData) {
        const orderedContents = groupContentsByGroup(activeTabData.contents);

        const contentSections = orderedContents.map((item) =>
          item.isGroup
            ? { id: `group-${item.id}`, title: item.name }
            : { id: item.id, title: item.tagline }
        );

        setActiveSections(contentSections);
        if (contentSections.length > 0) {
          setActiveSection(contentSections[0].id);
        }
      }
    }
  }, [activeTab, pitchSections]);

  // Update your handleSidebarLinkClick
  const handleSidebarLinkClick = (e, sectionId) => {
    e.preventDefault();
    const el = sectionRefs.current[sectionId];
    if (el) {
      const headerHeight = 100;
      window.scrollTo({
        top: el.offsetTop - headerHeight,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
    }
  };

  // Utility function to calculate color luminance and determine text color
  function getContrastYIQ(hexcolor) {
    hexcolor = hexcolor.replace("#", "");

    const r = Number.parseInt(hexcolor.substr(0, 2), 16);
    const g = Number.parseInt(hexcolor.substr(2, 2), 16);
    const b = Number.parseInt(hexcolor.substr(4, 2), 16);

    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    return yiq >= 128 ? "black" : "white";
  }

  const textColor = getContrastYIQ(orgHex.orgHex);

  const DotLoader = () => (
    <div className="flex items-center justify-center h-full space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-current animate-pulse"
          style={{
            animationDelay: `${i * 0.2}s`,
            backgroundColor: orgHex.orgHex,
            opacity: 0.6 + i * 0.2,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col relative">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 bg-white py-1 sm:py-2 px-3 md:px-6 sticky top-0 z-20 rounded-xl shadow-md m-4 mx-3 sm:mx-6">
        <div
          ref={tabsContainerRef}
          className="flex overflow-x-auto scrollbar-hide snap-x hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                    whitespace-nowrap
                    px-4 py-3
                    text-sm font-medium
                    flex-shrink-0
                    transition-all duration-200
                    snap-start
                    relative
                    focus:outline-none
                    mx-1
                    ${activeTab === tab.id ? "font-semibold" : "font-medium"}
                  `}
              style={{
                color: activeTab === tab.id ? orgHex.orgHex : "#6B7280",
              }}
            >
              {tab.name}
              {activeTab === tab.id && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ backgroundColor: orgHex.orgHex }}
                ></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area with Sidebar */}
      <div className="flex relative">
        {/* Main Content */}
        {/* Introduction Tab Content */}
        {activeTab === "introduction" && (
          <div className="flex-1 min-h-[calc(100vh-120px)] ref={mainContentRef}">
            {/* Hero Section */}
            <div
              className="px-3 sm:px-6 py-3 sm:py-6"
              ref={(el) => (sectionRefs.current["welcome"] = el)}
              id="welcome"
            >
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: backgroundImageData
                      ? `url("${backgroundImageData}")`
                      : "none",
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30" />

                <div className="relative h-full flex flex-col justify-between pl-3 pr-3 pt-12 sm:p-6">
                  <div className="max-w-3xl font-[Montserrat] z-10 flex flex-col gap-3">
                    <h1 className="font-semibold text-xl sm:text-3xl bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg inline-block w-fit">
                      {pitch?.title}
                    </h1>
                    <div className="bg-black font-[Montserrat] bg-opacity-50 text-white py-2 px-3 rounded-lg inline-block w-fit">
                      <p className="text-sm sm:text-lg">{pitch?.headline}</p>
                    </div>

                    <a
                      style={{
                        backgroundColor: orgHex.orgHex,
                        borderColor: `${orgHex.orgHex}33`,
                        "--hover-bg": `${orgHex.orgHex}DD`,
                      }}
                      className="text-sm sm:text-base font-[Montserrat] hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out transform hover:shadow-lg border px-3 sm:px-4 rounded-md py-2 text-white w-fit cursor-pointer mt-2"
                      href={userDetails.calendarLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {uiStrings?.scheduleMeet}
                    </a>
                  </div>
                  <div className="bg-white text-gray-800 rounded-lg p-2 sm:p-3 shadow-md flex items-start gap-3 self-end my-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16">
                      {userDetails.profilePhoto ? (
                        <img
                          className="w-full h-full border border-gray-300 rounded-full object-cover"
                          src={
                            profilePhotoHandler(userDetails) ?? companyLogoUrl
                          }
                          alt="Profile Photo"
                        />
                      ) : (
                        <div
                          className="font-[Montserrat] w-full h-full text-xl font-semibold text-white flex items-center justify-center rounded-full"
                          style={{ backgroundColor: orgHex.orgHex }}
                        >
                          <div>
                            {userDetails.firstName?.charAt(0).toUpperCase() +
                              " " +
                              userDetails.lastName?.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-700 font-[Montserrat]">
                      <div className="text-sm font-light">
                        {uiStrings?.sharedBy}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-900">
                        {userDetails.firstName + " " + userDetails.lastName}
                      </p>
                      {userDetails.jobTitle && (
                        <p className="text-xs sm:text-sm font-light italic text-gray-800">
                          {userDetails.jobTitle}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-gray-800 font-light">
                        <a
                          href={`mailto:${
                            userDetails.email
                          }?subject=${encodeURIComponent(
                            `Regarding your pitch: ${pitch?.title || ""}`
                          )}`}
                          className="hover:underline"
                        >
                          {userDetails.email}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div
              style={{
                backgroundColor: `${orgHex.orgHex}1A`,
              }}
              className="mx-3 sm:mx-6 mb-6 p-3 sm:p-6 rounded-xl shadow-md"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold font-[Montserrat] mb-2">
                    {uiStrings.description}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 font-light font-[Montserrat] mb-4">
                    {pitch?.description}
                  </p>
                </div>

                {highlightVideosData?.length > 0 && (
                  <div className="w-full md:w-80 h-[230px] relative">
                    <div className="absolute p-1 inset-0 flex items-center justify-between z-20 pointer-events-none">
                      <button
                        className="text-xl bg-gray-400 rounded-full p-1 transition-all flex justify-center items-center text-gray-900 border border-gray-500 bg-opacity-50 active:scale-95 hover:text-gray-800 pointer-events-auto"
                        onClick={prevVideo}
                      >
                        <FaAngleLeft />
                      </button>
                      <button
                        className="text-xl bg-gray-400 rounded-full p-1 transition-all flex justify-center items-center text-gray-900 border border-gray-500 bg-opacity-50 active:scale-95 hover:text-gray-800 pointer-events-auto"
                        onClick={nextVideo}
                      >
                        <FaAngleRight />
                      </button>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={highlightVideosData[currentIndex].id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="h-full"
                      >
                        <video
                          src={highlightVideosData[currentIndex].sasUrl}
                          controls
                          className="w-full h-full rounded-lg object-cover"
                        />
                        <div className="absolute top-2 px-2 py-[2px] bg-black bg-opacity-50 border border-gray-700 rounded left-2">
                          <h3 className="text-gray-300 flex text-sm items-center gap-1">
                            {highlightVideosData[currentIndex].tagline}
                          </h3>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs Content */}
        {activeTab !== "introduction" && (
          <div
            className="w-full md:w-[70%] lg:w-[75%] xl:w-[70%] flex justify-end min-h-[calc(100vh-120px)]"
            ref={mainContentRef}
          >
            <div className="w-full md:w-[95%] lg:w-[95%] xl:w-[90%] 2xl:w-[85%] px-3 sm:px-6 py-4 sm:py-8">
              {pitchSections
                .filter((section) => section.id === activeTab)
                .map((section) => {
                  const orderedContents = groupContentsByGroup(
                    section.contents
                  );

                  return (
                    <div key={section.id} className="pb-10">
                      <div className="grid grid-cols-1 gap-6">
                        {orderedContents.map((item, index) => {
                          if (item.isGroup) {
                            return (
                              <div key={`group-${item.id}-${index}`}>
                                {renderGroupedContent(item)}
                              </div>
                            );
                          } else {
                            return (
                              <div key={`content-${item.id}-${index}`}>
                                {renderIndividualContent(item)}
                              </div>
                            );
                          }
                        })}

                        {/* Show "Load More" button for contents if available */}
                        {section.hasMoreContents && (
                          <div className="mt-6 text-center flex flex-row items-center justify-center mr-4">
                            <p
                              style={{
                                fontFamily: "Montserrat, sans-serif",
                                fontWeight: 700,
                                fontSize: "16px",
                                textAlign: "right",
                                color: orgHex.orgHex,
                              }}
                              className="text-gray-500 mr-3"
                            >
                              Load More
                              <br />
                              Contents
                            </p>
                            <button
                              onClick={() => onLoadMoreContents(section.id)}
                              className="px-4 py-4 text-sm font-medium text-white bg-[#3c3c3c44] rounded-[50%] hover:bg-[#2c2c2c44] flex items-center justify-center shadow-md border-gray-300"
                              style={{
                                backgroundColor: orgHex.orgHex,
                              }}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M19 9l-7 7-7-7"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {/* Show "Load More Sections" button if available */}
              {hasMoreSections && activeTab !== "introduction" && (
                <div className="mt-4 text-center">
                  <button
                    onClick={onLoadMoreSections}
                    disabled={isLoadingMore}
                    style={{
                      backgroundColor: orgHex.orgHex,
                      borderColor: `${orgHex.orgHex}33`,
                      "--hover-bg": `${orgHex.orgHex}DD`,
                    }}
                    className="px-4 py-2 text-base font-medium text-white rounded-lg
                            border transition-all duration-300 ease-in-out transform
                            hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50
                            disabled:cursor-not-allowed disabled:hover:scale-100
                            hover:bg-[var(--hover-bg)]"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center justify-center gap-2">
                        <span>{uiStrings.loadingMoreSections}</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>{uiStrings.loadMoreSections}</span>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sidebar Navigation */}
        {activeTab !== "introduction" && (
          <div className="hidden md:block md:w-[30%] lg:w-[25%] xl:w-[30%] pl-2 pr-4 py-8">
            <div className="md:w-[95%] lg:w-[80%] xl:w-[75%] shadow-md border-l border-gray-200 p-3 rounded-lg bg-white sticky top-20 self-start h-[calc(100vh-280px)] overflow-y-auto hidden md:block">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                Page Contents
              </div>
              <ul className="space-y-1">
                {activeSections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => handleSidebarLinkClick(e, section.id)}
                      className={`block py-1 px-2 rounded text-sm transition-all duration-100 ${
                        activeSection === section.id
                          ? "font-medium"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      style={{
                        color:
                          activeSection === section.id
                            ? orgHex.orgHex
                            : undefined,
                        backgroundColor:
                          activeSection === section.id
                            ? `${orgHex.orgHex}15`
                            : "transparent",
                        borderLeft:
                          activeSection === section.id
                            ? `3px solid ${orgHex.orgHex}`
                            : "3px solid transparent",
                      }}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
