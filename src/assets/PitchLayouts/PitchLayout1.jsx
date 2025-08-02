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

  const getFileType = (mimeType) => {
    const mimeMap = {
      "application/pdf": "PDF",
      "video/mp4": "Video",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "PPT",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "Docx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "Excel",
      "image/png": "PNG",
      "image/jpeg": "JPEG",
      "text/plain": "TXT",
      "application/zip": "ZIP",
      "application/json": "JSON",
      "audio/mpeg": "MP3",
      // Add more mappings as needed
    };

    return mimeMap[mimeType] || "Unknown"; // Default to "Unknown" if not found
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
    // Handle YouTube content
    if (content.content_source?.toLowerCase() === "youtube") {
      const videoId = getVideoId(content.content_link, "youtube");
      const [thumbnailUrl, setThumbnailUrl] = useState("");
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(false);

      useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(false);

        const checkThumbnail = async () => {
          if (!videoId) {
            if (isMounted) {
              setThumbnailUrl("/default-video-thumbnail.jpg");
              setLoading(false);
            }
            return;
          }

          // Try maxresdefault first (highest quality)
          const url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

          try {
            // First check if the image exists
            const response = await fetch(url, { method: "HEAD" });

            if (response.ok) {
              if (isMounted) {
                setThumbnailUrl(url);
                setLoading(false);
              }
            } else {
              // If maxresdefault fails, try mqdefault (always available)
              if (isMounted) {
                setThumbnailUrl(
                  `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                );
                setLoading(false);
              }
            }
          } catch (err) {
            console.log("Error checking thumbnail:", err);
            if (isMounted) {
              setThumbnailUrl(
                `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
              );
              setLoading(false);
            }
          }
        };

        checkThumbnail();

        return () => {
          isMounted = false;
        };
      }, [videoId]);

      const handleImageError = (e) => {
        console.log("Image load failed:", e.target.src);
        if (!error) {
          setError(true);
          setThumbnailUrl("/default-video-thumbnail.jpg");
        }
      };

      return (
        <div className="relative w-full h-[240px] overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}

          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={content.tagline}
              className={`absolute inset-0 w-full h-full object-cover ${
                loading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setLoading(false)}
              onError={handleImageError}
              crossOrigin="anonymous"
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
      <div
        className="relative h-[400px] sm:h-[360px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImageData && backgroundImageData})`,
        }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-15"></div>

        <div className="relative gap-4 px-4 sm:px-10 pt-4 flex flex-col justify-between">
          <div className="max-w-3xl z-10 pt-12 sm:pt-16 flex flex-col gap-2 ml-0 sm:ml-8">
            <h1
              className="font-[Montserrat] text-xl sm:text-3xl font-normal bg-black bg-opacity-50 text-white px-2 py-1 rounded inline-block w-fit"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                // fontSize: "14px",
              }}
            >
              {pitch?.title}
            </h1>
            <div
              className="bg-black bg-opacity-50 text-white py-1 px-2 rounded inline-block w-fit "
              style={{ textAlign: "left" }}
            >
              <p className="font-[Montserrat] text-sm sm:text-base sm:text-lg">
                {pitch?.headline}
              </p>
              <button
                onClick={handleShowDescription}
                style={{ color: orgHex.orgHex }}
                className=" transition-colors duration-200 inline-flex items-center"
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
          </div>
          <a
            style={{
              backgroundColor: orgHex.orgHex,
              borderColor: `${orgHex.orgHex}33`, // Adding 33 for opacity creates lighter shade
              "--hover-bg": `${orgHex.orgHex}DD`, // Slightly darker for hover (DD = 87% opacity)
            }}
            className="text-sm sm:text-base font-[Montserrat] hover:scale-110 active:scale-95 transition-all duration-300 ease-in-out transform hover:shadow-lg border px-3  rounded-md py-2 text-neutral-100 w-fit cursor-pointer ml-0 sm:ml-8"
            href={userDetails.calendarLink}
            target="_blank"
          >
            {uiStrings.scheduleMeet}
          </a>
        </div>

        <div className="absolute bg-white text-neutral-800  rounded-md px-4 py-2 right-5 bottom-5 flex items-start gap-2 mr-0 sm:mr-8 ">
          <div className="size-[65px] sm:size-[84px] overflow-hidden">
            {userDetails.profilePhoto ? (
              <img
                className="w-full h-full border border-neutral-300 rounded-full  object-cover"
                src={profilePhotoHandler(userDetails) ?? companyLogoUrl}
                alt="Profile Photo"
              />
            ) : (
              <div
                className="font-[Montserrat] min-w-full min-h-full sm:text-4xl font-semibold text-white flex items-center justify-center rounded-full"
                style={{ backgroundColor: orgHex.orgHex }}
              >
                <div>
                  {" "}
                  {userDetails.firstName.charAt(0).toUpperCase() +
                    " " +
                    userDetails.lastName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
          <div className="font-[Montserrat] text-neutral-700 p-0 sm:p-2 ">
            <div className="text-sm  font-light">{uiStrings.sharedBy}</div>
            <p className="text-neutral-900">
              {userDetails.firstName + " " + userDetails.lastName}
            </p>

            {userDetails.jobTitle && (
              <p className="text-sm  font-light italic text-neutral-800">
                {userDetails.jobTitle}
              </p>
            )}
            <p className="text-sm text-neutral-800 font-light">
              <a
                href={`mailto:${userDetails.email}?subject=${encodeURIComponent(
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

      {showDescription && (
        <section
          style={{
            backgroundColor: `${orgHex.orgHex}1A`, // 1A is hex for 10% opacity
          }}
          className="py-4 px-4 sm:px-10 border-b border-b-neutral-200 flex justify-between gap-3 "
        >
          <div className="max-w-4xl ml-0 sm:ml-8">
            <h2 className="font-[Montserrat] text-xl font-semibold mb-1">
              {uiStrings.description}
            </h2>
            <p className="font-[Montserrat] text-gray-700 font-light mb-4 text-sm sm:text-lg ">
              {pitch?.description}
            </p>
          </div>

          {highlightVideosData?.length > 0 && (
            <div className="h-[230px] relative mr-0 sm:mr-8">
              <div className="absolute p-1 inset-0 flex items-center justify-between z-20 pointer-events-none">
                <button
                  className="text-xl bg-neutral-400 rounded-full p-1 transition-all flex justify-center items-center text-neutral-900 border border-neutral-500 bg-opacity-50 active:scale-95 hover:text-neutral-800 pointer-events-auto"
                  onClick={prevVideo}
                >
                  <FaAngleLeft />
                </button>
                <button
                  className="text-xl bg-neutral-400 rounded-full p-1 transition-all flex justify-center items-center text-neutral-900 border border-neutral-500 bg-opacity-50 active:scale-95 hover:text-neutral-800 pointer-events-auto"
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
                    className="max-w-[300px] h-full rounded-lg object-cover"
                  />
                  <div className="absolute top-2 px-2 py-[2px] bg-black bg-opacity-50 border border-neutral-700 rounded left-2">
                    <h3 className="text-neutral-300 flex text-sm items-center gap-1">
                      {highlightVideosData[currentIndex].tagline}
                    </h3>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </section>
      )}

      <div>
        <main className="py-8 flex flex-col gap-10 px-0 sm:px-10">
          {pitchSections?.map((section, index) => (
            <div
              key={section.id}
              className={`pb-11 ${
                index === pitchSections.length - 1
                  ? ""
                  : "border-b border-b-neutral-300"
              }`}
            >
              <h2
                className=" text-2xl sm:text-2xl d mb-4 text-transparent bg-clip-text bg-gradient-to-r from-neutral-600 to-neutral-900 px-4 sm:px-8"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 500,
                }}
              >
                {section.name}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-8">
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
                    <div className="bg-white shadow-md overflow-hidden hover:shadow-lg  cursor-pointer transform hover:-translate-y-2 transition-transform duration-300 ease-in-out">
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
                        className="bg-white dark:bg-gray-800 group h-[240px] flex flex-col mx-3 my-3"
                      >
                        <div className="font-[Montserrat] font-medium flex-1 relative overflow-hidden bg-black border border-gray-200">
                          {renderContent(content, blobUrl)}
                        </div>
                        <div className="pt-1">
                          <h3
                            className="text-base text-gray-800 dark:text-gray-200 text-md line-clamp-1"
                            style={{
                              fontFamily: "Montserrat, sans-serif",
                              fontWeight: 500,
                            }}
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
        </main>
      </div>
    </>
  );
}
