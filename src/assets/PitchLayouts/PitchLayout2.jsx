function StandardLayout({
  backgroundImageData,
  pitchSections,
  highlightVideosData,
  blobs,
  pitch,
  showDescription,
  handleShowDescription,
  IoIosArrowDown,
  IoIosArrowUp,
  FaAngleLeft,
  FaAngleRight,
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
}) {
  const renderContent = (content, blobUrl) => {
    if (content.content_source?.toLowerCase() === "youtube") {
      const videoId = getVideoId(content.content_link, "youtube");
      const thumbnailUrl = videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : "path/to/fallback-video-thumbnail.jpg";
      return (
        <div className="relative w-full h-full overflow-hidden bg-black">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={content.tagline}
              className="absolute inset-0 w-full h-full object-cover object-top"
              onError={(e) => {
                if (videoId && e.target.src.includes("maxresdefault")) {
                  e.target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                }
              }}
            />
          )}
          {/* Play button overlay */}
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
                className="absolute inset-0 w-full h-full object-cover object-top"
                onError={(e) => {
                  e.target.src = "path/to/fallback-video-thumbnail.jpg";
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
        <div className="relative w-full h-full overflow-hidden bg-gray-50">
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
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90" />
        </div>
      );
    }

    // Handle Canva Links
    if (content.content_source?.toLowerCase() === "canva link") {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gray-50">
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
        <div className="relative w-full h-full overflow-hidden bg-gray-50">
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
          <div className="relative pb-2/3 overflow-hidden w-full h-full object-cover">
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
          <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full h-full">
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
            </div>
          </div>
        );
      case "image/jpeg":
      case "image/jpg":
      case "image/png":
      case "image/webp":
      case "image/gif":
        return (
          <div className="relative pb-2/3 overflow-hidden w-full h-full object-cover">
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
            className="relative pb-2/3 overflow-hidden w-full h-full object-cover"
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
          <div className="relative pb-2/3 overflow-hidden w-full h-full object-cover">
            <p>Unsupported content type: {content.content_mimetype}</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="p-6">
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

          <div className="relative h-full flex flex-col justify-between p-6">
            <div className="max-w-3xl font-[Montserrat] z-10 flex flex-col gap-3">
              <h1 className="font-semibold text-3xl bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg inline-block w-fit">
                {pitch?.title}
              </h1>
              <div className="bg-black font-[Montserrat] bg-opacity-50 text-white py-2 px-3 rounded-lg inline-block w-fit">
                <p className="text-lg">{pitch?.headline}</p>
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

              <a
                style={{
                  backgroundColor: orgHex.orgHex,
                  borderColor: `${orgHex.orgHex}33`,
                  "--hover-bg": `${orgHex.orgHex}DD`,
                }}
                className="text-base font-[Montserrat] hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out transform hover:shadow-lg border px-4 rounded-md py-2 text-white w-fit cursor-pointer mt-2"
                href={userDetails.calendarLink}
                target="_blank"
                rel="noreferrer"
              >
                {uiStrings?.scheduleMeet}
              </a>
            </div>
            <div className="bg-white text-gray-800 rounded-lg p-3 shadow-md flex items-start gap-3 self-end">
              <div className="w-16 h-16">
                {userDetails.profilePhoto ? (
                  <img
                    className="w-full h-full border border-gray-300 rounded-full object-cover"
                    src={profilePhotoHandler(userDetails) ?? companyLogoUrl}
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
                <div className="text-sm font-light">{uiStrings?.sharedBy}</div>
                <p className="text-gray-900">
                  {userDetails.firstName + " " + userDetails.lastName}
                </p>
                {userDetails.jobTitle && (
                  <p className="text-sm font-light italic text-gray-800">
                    {userDetails.jobTitle}
                  </p>
                )}
                <p className="text-sm text-gray-800 font-light">
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

      {/*  Description Here */}
      {showDescription && (
        <div
          style={{
            backgroundColor: `${orgHex.orgHex}1A`,
          }}
          className="mx-6 mb-6 p-6 rounded-xl shadow-md"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold font-[Montserrat] mb-2">
                {uiStrings.description}
              </h2>
              <p className="text-gray-700 font-light font-[Montserrat]mb-4">
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
      )}

      <div className="px-6 pb-12">
        {pitchSections?.map((section, sectionIndex) => (
          <div
            key={section.id}
            className={`pb-10 ${
              sectionIndex === pitchSections.length - 1
                ? ""
                : "mb-10 border-b border-gray-200"
            }`}
          >
            <h2 className="text-2xl mb-6 p-4 bg-clip-text font-[Montserrat] font-medium">
              {section.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
                  >
                    <div
                      id={content.id + "analytics"}
                      onClick={() => {
                        onClickContentHandler(
                          content,
                          blobUrl,
                          content.content_mimetype,
                          content.tagline
                        );
                      }}
                      className=" h-[300px] flex flex-col p-3"
                    >
                      <div className="flex-1 font-[Montserrat] relative overflow-hidden bg-black border border-gray-200 rounded-lg">
                        {renderContent(content, blobUrl)}{" "}
                      </div>
                      <div className="pt-3">
                        <h3 className="text-base font-[Montserrat] font-medium text-gray-800 line-clamp-1">
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
                          {content?.content_mimetype == "application/url" ? (
                            content?.content_source
                          ) : (
                            <>
                              {getFileType(content?.content_mimetype)} |{" "}
                              {(content?.content_size / 1024).toFixed(1)} MB
                            </>
                          )}
                        </h5>
                      </div>
                    </div>
                  </div>
                );
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
                    className="px-4 py-4 text-sm font-medium text-white bg-[#3c3c3c44]  rounded-[50%] hover:bg-[#2c2c2c44] flex items-center justify-center shadow-md  border-gray-300"
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
                        d="M12 4V20M20 12H4"
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
      </div>
    </>
  );
}
