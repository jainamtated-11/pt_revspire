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
  const [activeTab, setActiveTab] = useState("introduction");
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
    const sortedContents = [...contents].sort(
      (a, b) => a.arrangement - b.arrangement
    );

    const result = [];
    let currentGroup = null;

    for (const content of sortedContents) {
      if (content.pitch_content_group && content.pitch_content_group_name) {
        if (!currentGroup || currentGroup.id !== content.pitch_content_group) {
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
          currentGroup.contents.push(content);
        }
      } else {
        if (currentGroup) {
          result.push(currentGroup);
          currentGroup = null;
        }
        result.push({
          ...content,
          isGroup: false,
        });
      }
    }

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
        return "h-[200px] sm:h-[250px] md:h-[300px]";
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

  // Memoize the renderContent function
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
              {console.log("BLOBBBBB URL PDF", blobUrl)}
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
        className="border p-2 w-[100%] bg-white shadow-md overflow-hidden hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-md"
      >
        <div className={`${containerHeight} w-full flex flex-col p-3`}>
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
                    <p className="text-xs font-medium text-gray-800 truncate mb-1">
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
          <div className="p-3">
            {/* Group Title */}
            <h3 className="text-lg sm:text-xl font-[Montserrat] font-bold text-gray-800 line-clamp-1">
              {group.name}
            </h3>
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
        className={`border p-2 w-[100%] bg-white shadow-md overflow-hidden hover:shadow-lg ${
          content?.content_mimetype !== "/pitchfeature" ? "cursor-pointer" : ""
        }  transform hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-md`}
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
          className="h-[300px] sm:h-[400px] md:h-[500px] w-full flex flex-col"
        >
          <div
            className={`flex-1 font-[Montserrat] relative overflow-hidden ${
              content?.content_mimetype !== "/pitchfeature"
                ? "border border-gray-200"
                : ""
            }  bg-gray-50  rounded-md`}
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
          <div className="p-3 flex justify-between items-center">
            <h3
              className={`text-lg sm:text-xl font-[Montserrat] font-bold text-gray-800 line-clamp-1  ${
                (!isUserMessageType(content.content_link) && content.content_mimetype == "/pitchfeature" )&& "cursor-pointer w-full"
              }`}
              onClick={
               ( !isUserMessageType(content.content_link, content.content_mimetype) && content.content_mimetype == "/pitchfeature"  )
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
                  {blobInfo?.totalPages ? (
                    <>
                      {" "}
                      | {blobInfo.totalPages}{" "}
                      {blobInfo.totalPages === 1 ? "Page" : "Pages"}
                    </>
                  ) : null}
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
    { id: "introduction", name: "Welcome 👋" },
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

  const [isAtTop, setIsAtTop] = useState(true);
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 20) {
      setIsAtTop(false);
    } else {
      setIsAtTop(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div
        className={`sticky top-0 z-20 border-y border-gray-200 transition-all duration-300 ${
          isAtTop ? "bg-white/80 backdrop-blur-sm" : "bg-gray-200"
        }`}
      >
        <div
          ref={tabsContainerRef}
          className="relative flex overflow-x-auto no-scrollbar gap-1 pl-6 pr-10 py-3 max-w-7xl mx-auto"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => {
                if (el && activeTab === tab.id) {
                  // Calculate underline position
                  const container = tabsContainerRef.current;
                  if (container) {
                    const underline = container.querySelector(".tab-underline");
                    if (underline) {
                      const tabRect = el.getBoundingClientRect();
                      const containerRect = container.getBoundingClientRect();
                      const left = tabRect.left - containerRect.left;
                      const width = tabRect.width;

                      underline.style.transform = `translateX(${left}px)`;
                      underline.style.width = `${width}px`;
                    }
                  }
                }
              }}
              onClick={() => handleTabChange(tab.id)}
              className={`relative px-5 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap
                ${index !== tabs.length - 1 ? "border-r-2 border-gray-300" : ""}
                ${
                  activeTab === tab.id
                    ? "text-current"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              style={{
                color: activeTab === tab.id ? orgHex.orgHex : undefined,
                borderRightWidth: index !== tabs.length - 1 ? "2px" : "0px", // Explicit thickness
                borderRightColor:
                  index !== tabs.length - 1 ? "#d1d5db" : "transparent", // Explicit color
              }}
            >
              {tab.name}
            </button>
          ))}

          {/* Animated underline */}
          <div
            className="tab-underline absolute bottom-0 left-0 h-0.5 transition-all duration-300 ease-out"
            style={{
              backgroundColor: orgHex.orgHex,
              width: "0px",
              transform: "translateX(0px)",
            }}
          />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar Navigation */}
        {activeTab !== "introduction" && (
          <div className="hidden lg:block w-64">
            <div className="sticky top-20 p-4 h-fit">
              <div className="bg-white border border-gray-200 rounded-md shadow-lg h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Navigation
                  </h3>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="p-4 space-y-1">
                    {activeSections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={(e) => handleSidebarLinkClick(e, section.id)}
                        className={`
                            block px-4 py-3 rounded-lg text-sm transition-all duration-200 truncate
                            ${
                              activeSection === section.id
                                ? "font-medium border-l-4"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }
                          `}
                        style={
                          activeSection === section.id
                            ? {
                                backgroundColor: orgHex.orgHex + "10",
                                color: orgHex.orgHex,
                                borderColor: orgHex.orgHex,
                              }
                            : {}
                        }
                      >
                        {section.title}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Footer (optional) */}
                <div className="p-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 text-center">
                    {activeSections.length} contents
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Introduction Tab Content */}
          {activeTab === "introduction" && (
            <div className="max-w-7xl mx-auto">
              {/* Hero Section */}
              <div
                ref={(el) => (sectionRefs.current["welcome"] = el)}
                id="welcome"
              >
                {/* Background Image */}
                <div
                  className="px-3 sm:px-6 py-3 sm:py-6"
                  ref={(el) => (sectionRefs.current["welcome"] = el)}
                  id="welcome"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden shadow-xl bg-white rounded-md">
                    {/* Left side - Rounded Background Image */}
                    <div className="relative h-64 lg:h-full min-h-[400px] overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center rounded-md"
                        style={{
                          backgroundImage: backgroundImageData
                            ? `url("${backgroundImageData}")`
                            : "none",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20 rounded-md" />

                      {/* Profile card overlay */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-white/80 backdrop-blur-sm p-4 shadow-lg rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12">
                              {userDetails.profilePhoto ? (
                                <img
                                  className="w-full h-full border-2 border-white rounded-full object-cover shadow-md"
                                  src={
                                    profilePhotoHandler(userDetails) ??
                                    companyLogoUrl
                                  }
                                  alt="Profile Photo"
                                />
                              ) : (
                                <div
                                  className="font-[Montserrat] w-full h-full text-sm font-semibold text-white flex items-center justify-center rounded-full shadow-md"
                                  style={{ backgroundColor: orgHex.orgHex }}
                                >
                                  {userDetails.firstName
                                    ?.charAt(0)
                                    .toUpperCase() +
                                    " " +
                                    userDetails.lastName
                                      ?.charAt(0)
                                      .toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="text-gray-700 font-[Montserrat]">
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {uiStrings?.sharedBy}
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                {userDetails.firstName +
                                  " " +
                                  userDetails.lastName}
                              </p>
                              {userDetails.jobTitle && (
                                <p className="text-xs font-light italic text-gray-600">
                                  {userDetails.jobTitle}
                                </p>
                              )}
                              <div className="text-sm text-gray-500 font-[Montserrat]">
                                <a
                                  href={`mailto:${
                                    userDetails.email
                                  }?subject=${encodeURIComponent(
                                    `Regarding your pitch: ${
                                      pitch?.title || ""
                                    }`
                                  )}`}
                                  className="hover:underline hover:text-gray-700 transition-colors"
                                >
                                  {userDetails.email}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Content */}
                    <div className="flex flex-col justify-center p-6 lg:p-8">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h1 className="font-[Montserrat] font-bold text-2xl lg:text-4xl text-gray-900 leading-tight">
                            {pitch?.title}
                          </h1>
                          <p className="font-[Montserrat] text-lg text-gray-600 leading-relaxed">
                            {pitch?.headline}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <a
                            style={{
                              backgroundColor: orgHex.orgHex,
                              "--hover-bg": `${orgHex.orgHex}DD`,
                            }}
                            className="inline-flex items-center font-[Montserrat] font-semibold hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out transform hover:shadow-lg px-6 py-3 text-white cursor-pointer rounded-md"
                            href={userDetails.calendarLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {uiStrings?.scheduleMeet}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Section - Version 1 */}
                <div className="mx-3 sm:mx-6 mb-6">
                  <div className="bg-white shadow-xl overflow-hidden rounded-md">
                    <div
                      className={`grid grid-cols-1 ${
                        highlightVideosData?.length > 0 ? "lg:grid-cols-3" : ""
                      } gap-0`}
                    >
                      {/* Description */}
                      <div
                        className={`${
                          highlightVideosData?.length > 0 ? "lg:col-span-2" : ""
                        } p-6 lg:p-8`}
                      >
                        <div
                          className="h-2 w-20 rounded-full mb-6"
                          style={{ backgroundColor: orgHex.orgHex }}
                        />
                        <h2 className="text-2xl font-bold font-[Montserrat] mb-4 text-gray-900">
                          {uiStrings.description}
                        </h2>
                        <div className="text-gray-600 font-[Montserrat] text-lg leading-relaxed">
                          {pitch?.description}
                        </div>
                      </div>

                      {/* Video Section */}
                      {highlightVideosData?.length > 0 && (
                        <div className="lg:col-span-1 p-6 lg:p-8 bg-gray-50 border-l border-gray-200">
                          <div className="h-full flex flex-col">
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={highlightVideosData[currentIndex].id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                                className="flex-1 flex flex-col"
                              >
                                {/* Video Frame */}
                                <div className="relative flex-1 w-full">
                                  <video
                                    src={
                                      highlightVideosData[currentIndex].sasUrl
                                    }
                                    controls
                                    className="w-full h-full rounded-xl object-cover shadow-lg"
                                  />
                                </div>

                                {/* Tagline */}
                                <div className="mt-3 flex items-center justify-center gap-3">
                                  <button
                                    className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 hover:bg-white"
                                    onClick={prevVideo}
                                  >
                                    <FaAngleLeft className="text-gray-700" />
                                  </button>
                                  <h3 className="px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm font-medium font-[Montserrat] text-center">
                                    {highlightVideosData[currentIndex].tagline}
                                  </h3>
                                  <button
                                    className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 hover:bg-white"
                                    onClick={nextVideo}
                                  >
                                    <FaAngleRight className="text-gray-700" />
                                  </button>
                                </div>
                              </motion.div>
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Tabs Content */}
          {activeTab !== "introduction" && (
            <div className="max-w-7xl mx-auto p-4 pl-0" ref={mainContentRef}>
              {pitchSections
                .filter((section) => section.id === activeTab)
                .map((section) => {
                  const orderedContents = groupContentsByGroup(
                    section.contents
                  );

                  return (
                    <div key={section.id} className="space-y-8">
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

                      {/* Load More Contents Button */}
                      {section.hasMoreContents && (
                        <div className="text-center">
                          <button
                            onClick={() => onLoadMoreContents(section.id)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Load More Contents
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Load More Sections Button */}
              {hasMoreSections && activeTab !== "introduction" && (
                <div className="mt-8 text-center">
                  <button
                    onClick={onLoadMoreSections}
                    disabled={isLoadingMore}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center justify-center gap-2">
                        <span>{uiStrings.loadingMoreSections}</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>{uiStrings.loadMoreSections}</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}