function StandardLayout({
  Document,
  Page,
  pdfjs,

  backgroundImageData,
  pitchSections,
  highlightVideosData,
  blobs,
  pitch,
  showDescription,
  handleShowDescription,
  IoIosArrowDown,
  IoIosArrowUp,
  sortedPitchSections,
  FaAngleLeft,
  FaAngleRight,
  motion,
  AnimatePresence,
  nextVideo,
  prevVideo,
  timeAgo,
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
}) {
  const CalendarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-calendar-icon lucide-calendar h-6 w-6 md:mb-0 mb-2 md:flex-shrink-0"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );

  const customButtons = useMemo(
    () => [
      {
        text: "Schedule Meet",
        logo: CalendarIcon,
        href: userDetails.calendarLink,
        target: "_blank",
      },
    ],
    [userDetails.calendarLink]
  );

  useEffect(() => {
    if (pitch.title) {
      sendDataToParent(pitch.title); // Send inputValue to the parent
    }
  }, [pitch.title]); // This will run every time inputValue changes

  useEffect(() => {
    if (customButtons) {
      handleCustomButtons(customButtons);
    }
  }, [customButtons]);

  const profilePhotoHandler = (userDetails) => {
    if (userDetails?.profilePhoto?.data) {
      const logoData = userDetails.profilePhoto.data;
      const mimeType = userDetails.profilePhoto.mimetype || "image/png";

      // Convert the array of numbers to a Uint8Array
      const uint8Array = new Uint8Array(logoData);

      // Convert to base64 in chunks to prevent stack overflow
      const chunkSize = 8192;
      let base64String = "";

      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        base64String += String.fromCharCode.apply(null, chunk);
      }

      // Create the data URL
      const dataUrl = `data:${mimeType};base64,${btoa(base64String)}`;
      return dataUrl;
    }
    return null;
  };

  const renderContent = (content, blobUrl) => {
    // Helper function to safely extract video IDs
    const getVideoId = (url, platform) => {
      try {
        if (platform === "youtube") {
          // Handle different YouTube URL formats
          const patterns = [
            /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=))([^\/&\?]{10,12})/,
            /^([^\/&\?]{10,12})$/, // Direct video ID
          ];

          for (let pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
          }
        } else if (platform === "vimeo") {
          // Handle different Vimeo URL formats
          const patterns = [
            /(?:vimeo\.com\/)([0-9]+)/,
            /(?:player\.vimeo\.com\/video\/)([0-9]+)/,
            /^([0-9]+)$/, // Direct video ID
          ];

          for (let pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
          }
        }
        return null;
      } catch (error) {
        console.warn(`Error extracting ${platform} ID:`, error);
        return null;
      }
    };

    // Handle YouTube content
    if (content.content_source?.toLowerCase() === "youtube") {
      const videoId = getVideoId(content.content_link, "youtube");
      const thumbnailUrl = videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : "path/to/fallback-video-thumbnail.jpg"; // Add a fallback thumbnail

      return (
        <div className="relative w-full h-[240px] overflow-hidden bg-black">
          <img
            src={thumbnailUrl}
            alt={content.tagline}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              // Fallback to medium quality thumbnail if maxresdefault fails
              if (videoId && e.target.src.includes("maxresdefault")) {
                e.target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
              }
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
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

    // Handle Vimeo content
    if (content.content_source?.toLowerCase() === "vimeo") {
      const videoId = getVideoId(content.content_link, "vimeo");

      return (
        <div className="relative w-full h-[240px] overflow-hidden bg-black">
          {videoId ? (
            <>
              <img
                src={`https://vumbnail.com/${videoId}.jpg`}
                alt={content.tagline}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "path/to/fallback-video-thumbnail.jpg"; // Add a fallback thumbnail
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-12 bg-[#00adef] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            // Fallback content if video ID extraction fails
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center p-4">
                <div className="w-16 h-12 bg-[#00adef] rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">Video Preview</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Handle Public URLs with preview
    if (content.content_source?.toLowerCase() === "public url") {
      return (
        <div className="relative w-full h-[240px] overflow-hidden bg-gray-50">
          <iframe
            src={content.content_link}
            className="absolute top-0 left-0 w-full h-full"
            title={content.tagline}
            frameBorder="0"
            sandbox="allow-same-origin allow-scripts"
            style={{
              transform: "scale(1)",
              transformOrigin: "top left",
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-12 bg-gray-400 opacity-35 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    // Handle Canva Links
    if (content.content_source?.toLowerCase() === "canva link") {
      return (
        <div className="relative w-full h-[240px] overflow-hidden bg-gray-50">
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
          />
        </div>
      );
    }

    // Handle Microsoft Stream Links
    if (content.content_source?.toLowerCase() === "microsoft stream") {
      return (
        <div className="relative w-full h-[240px] overflow-hidden bg-gray-50">
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
          />
        </div>
      );
    }

    // Handle existing content types
    switch (content.content_mimetype) {
      case "video/mp4":
        return (
          <div className="relative pb-2/3 overflow-hidden w-full h-[240px] object-cover">
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
          <div className="relative w-full h-[240px] overflow-hidden flex items-start justify-center bg-neutral-100">
            <Document
              file={blobUrl}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-full text-red-500">
                  Failed to load PDF.
                </div>
              }
            >
              <div className="flex items-start justify-center w-full h-full">
                <Page
                  pageNumber={1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="pdf-page"
                  width={280}
                  height={240}
                  scale={1.5}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    transform: "scale(1.2)",
                    transformOrigin: "top center",
                  }}
                />
              </div>
            </Document>
          </div>
        );
      case "image/jpeg":
      case "image/jpg":
      case "image/png":
      case "image/webp":
      case "image/gif":
        return (
          <div className="relative pb-2/3 overflow-hidden w-full h-[240px] object-cover">
            <img
              src={blobUrl}
              alt={content.tagline}
              className="w-full h-full object-cover object-top"
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
            onClick={() => {
              handlePauseVideo("");
              onClickContentHandler(
                content,
                blobUrl,
                content.content_mimetype,
                content.tagline
              );
            }}
            className="relative pb-2/3 overflow-hidden w-full h-[240px] object-cover"
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            {<MemoizedDocViewer blobUrl={blobUrl} />}
          </div>
        );
      default:
        return (
          <div className="relative pb-2/3 overflow-hidden w-full h-[240px] object-cover">
            <p>Unsupported content type: {content.content_mimetype}</p>
          </div>
        );
    }
  };

  return (
    <>
      {/* Hero Section with Background */}
      <div
        className="relative h-[360px] sm:h-[300px] md:h-[360px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImageData && backgroundImageData})`,
        }}
      ></div>

      {/* Content Section */}
      <div className="flex flex-col">
        {/* Header Section */}
        <div
          className="flex flex-col lg:flex-row justify-between px-4 py-4 sm:px-6 "
          style={{ backgroundColor: `${orgHex.orgHex}1A` }}
        >
          <p className="bg-white rounded-md inline text-xl font-semibold mb-1 pl-2 md:hidden w-full">
            {pitch?.name}
          </p>

          {/* Left Side - Title & Description */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white py-1 px-2  rounded-md inline-block">
              <p className="text-base sm:text-lg">{pitch?.headline}</p>
              <button
                onClick={handleShowDescription}
                style={{ color: orgHex.orgHex }}
                className="ml-2 transition-colors duration-200 inline-flex items-center"
              >
                {showDescription
                  ? uiStrings.hideDetails
                  : uiStrings.showDetails}
                {showDescription ? (
                  <IoIosArrowUp className="ml-1" />
                ) : (
                  <IoIosArrowDown className="ml-1" />
                )}
              </button>
            </div>

            {/* Description Section */}
            {showDescription && (
              <div className="py-4 px-4 border-b border-b-neutral-200">
                <div className="max-w-5xl">
                  <h2 className="text-xl font-semibold mb-1">
                    {uiStrings.description}
                  </h2>
                  <p className="text-gray-700 font-light mb-4 text-lg">
                    {pitch?.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Profile & Video */}
          <div className="flex flex-col lg:flex-row gap-4  ml-2">
            {/* Profile Card */}
            <div className="bg-white text-neutral-800 rounded-xl p-4 flex items-start gap-4 lg:w-[300px] h-[115px]">
              <div className="w-[84px] h-[84px] flex-shrink-0">
                {userDetails.profilePhoto ? (
                  <img
                    className="w-full h-full border border-neutral-300 rounded-full object-cover"
                    src={profilePhotoHandler(userDetails) ?? companyLogoUrl}
                    alt="Profile"
                  />
                ) : (
                  <div
                    className="w-full h-full text-2xl sm:text-4xl font-semibold text-white flex items-center justify-center rounded-full"
                    style={{ backgroundColor: orgHex.orgHex }}
                  >
                    {userDetails.firstName.charAt(0).toUpperCase() +
                      " " +
                      userDetails.lastName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-light">{uiStrings.sharedBy}</div>
                <p className="text-neutral-900">
                  {userDetails.firstName + " " + userDetails.lastName}
                </p>
                {userDetails.jobTitle && (
                  <p className="text-sm font-light italic text-neutral-800">
                    {userDetails.jobTitle}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <a
                    href={`mailto:${
                      pitch?.user?.email
                    }?subject=Regarding your pitch: ${pitch?.title || ""}`}
                    className="hover:text-gray-900"
                  >
                    {pitch?.user?.email}
                  </a>
                </p>
              </div>
            </div>

            {/* Highlight Videos Section */}
            {highlightVideosData?.length > 0 && (
              <div className="relative h-[230px] lg:w-[300px]">
                <div className="absolute p-1 inset-0 flex items-center justify-between z-20 pointer-events-none">
                  <button
                    className="text-xl bg-neutral-400/50 rounded-full p-1 transition-all flex justify-center items-center text-neutral-900 border border-neutral-500 active:scale-95 hover:text-neutral-800 pointer-events-auto"
                    onClick={prevVideo}
                  >
                    <FaAngleLeft />
                  </button>
                  <button
                    className="text-xl bg-neutral-400/50 rounded-full p-1 transition-all flex justify-center items-center text-neutral-900 border border-neutral-500 active:scale-95 hover:text-neutral-800 pointer-events-auto"
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
                    className="h-full w-full"
                  >
                    <video
                      src={highlightVideosData[currentIndex].sasUrl}
                      controls
                      className="w-full h-full rounded-lg object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-[2px] bg-black/50 border border-neutral-700 rounded">
                      <h3 className="text-neutral-300 text-sm">
                        {highlightVideosData[currentIndex].tagline}
                      </h3>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          {pitchSections?.map((section, index) => (
            <div
              key={section.id}
              className={`pb-11 ${
                index === pitchSections.length - 1
                  ? ""
                  : "border-b border-b-neutral-300"
              }`}
            >
              <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neutral-600 to-neutral-900">
                {section.name}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {section.contents.map((content) => {
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
                      id={content.id + "analytics"}
                      onClick={() => {
                        onClickContentHandler(
                          content,
                          blobUrl,
                          content.content_mimetype,
                          content.tagline
                        );
                      }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer group h-[280px] flex flex-col"
                    >
                      <div className="flex-1 relative overflow-hidden">
                        {renderContent(content, blobUrl)}
                      </div>
                      <div className="py-2 px-4">
                        <h3 className="font-medium text-gray-700 dark:text-gray-200 text-md line-clamp-1">
                          {content.tagline}
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show "Load More" button for contents if available */}
              {section.hasMoreContents && (
                <div className="mt-6 text-center flex flex-row">
                  <button
                    onClick={() => onLoadMoreContents(section.id)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex flex-row"
                  >
                    {uiStrings.loadMoreContent}
                    <svg
                      className="w-5 h-5 ml-2"
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
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Show "Load More Sections" button if available */}
          {hasMoreSections && (
            <div className="mt-4 text-center">
              <button
                onClick={onLoadMoreSections}
                disabled={isLoadingMore}
                style={{
                  backgroundColor: orgHex.orgHex,
                  borderColor: `${orgHex.orgHex}33`, // Adding 33 for opacity
                  "--hover-bg": `${orgHex.orgHex}DD`, // Slightly darker for hover
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
        </main>
      </div>
    </>
  );
}
