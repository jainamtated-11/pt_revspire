import { useContext, useState, useCallback, useEffect, useRef } from "react";
import { GlobalContext } from "../../../context/GlobalState";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import { formatDate } from "../../../constants";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { FcFolder } from "react-icons/fc";
import { FaRegFileExcel, FaRegFilePdf, FaRegFileWord } from "react-icons/fa";
import { BsFiletypePptx } from "react-icons/bs";
import { GrDocumentPpt } from "react-icons/gr";
import { LuFileSpreadsheet } from "react-icons/lu";
import { TbFileTypeDocx } from "react-icons/tb";
import { FiLink } from "react-icons/fi";
import { CiFileOn } from "react-icons/ci";
import TableLoading from "../ContentManager/ContentTable/TableLoading";
import EmptyFolderComponent from "../ContentManager/ContentTable/EmptyFolderComponent";
import toast from "react-hot-toast";
import useCheckUserLicense from "../../../Services/checkUserLicense.jsx";
import { IoImagesOutline } from "react-icons/io5";
import { useDebounce } from "use-debounce";
import { IoSearchOutline } from "react-icons/io5";
import { AiOutlineYoutube } from "react-icons/ai";
import { RiVimeoLine } from "react-icons/ri";
import { LuLoaderCircle } from "react-icons/lu";
import { useClickOutside } from "../../../hooks/useClickOutside.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faMagicWandSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useCookies } from "react-cookie";

const ContentTableModal = ({
  onClickHandler,
  onMultiSelectHandler,
  onCancel,
}) => {
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "", name: "Home" }]);
  const [folder_id, setFolder_id] = useState("");
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [popup, setPopup] = useState(true);
  const axiosInstance = useAxiosInstance();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [debouncedSearchInput] = useDebounce(searchInput, 500);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchButtonRef = useRef(null);
  const socketRef = useRef(null);
  const [searchType, setSearchType] = useState("standard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const checkUserLicense = useCheckUserLicense();
  const [selectedContents, setSelectedContents] = useState([]);
  const [contentsWithPlaceholders, setContentsWithPlaceholders] = useState([]);
  const [currentStep, setCurrentStep] = useState("select");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const [cookies] = useCookies(["revspireToken"]);

  const token = cookies.revspireToken;

  const fetchContentData = useCallback(
    async (id = "") => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.post(
          `/view-content-and-folders-sorted`,
          { viewer_id, folder_id: id },
          { withCredentials: true }
        );
        if (response.data) {
          setContents(response.data.items);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error.message);
        setIsLoading(false);
      }
    },
    [viewer_id, axiosInstance]
  );

  useEffect(() => {
    fetchContentData();
  }, []);

  const navigateToFolder = useCallback(
    async (folderId, folderName) => {
      if (
        folderId !== folder_id ||
        (folderName &&
          !breadcrumbs.find((breadcrumb) => breadcrumb.id === folderId))
      ) {
        try {
          if (folderName) {
            if (folderId === "") {
              setBreadcrumbs([{ id: "", name: "Home" }]);
            } else {
              let found = false;
              const updatedBreadCrumbs = [];
              for (let i = 0; i < breadcrumbs.length; i++) {
                updatedBreadCrumbs.push(breadcrumbs[i]);
                if (breadcrumbs[i].id === folderId) {
                  found = true;
                  break;
                }
              }
              if (found) {
                setBreadcrumbs(updatedBreadCrumbs);
              } else {
                setBreadcrumbs((prevBreadcrumbs) => [
                  ...prevBreadcrumbs,
                  { id: folderId, name: folderName },
                ]);
              }
            }
          }
          setFolder_id(folderId);
          fetchContentData(folderId);
        } catch (err) {
          console.error(err);
        }
      } else {
        setIsLoading(false);
      }
    },
    [folder_id, breadcrumbs, fetchContentData]
  );

  const handleCloseModal = () => {
    onClickHandler({ id: "-1" });
    onCancel();
    setPopup(false);
  };

  const handleContentClick = async (data) => {
    if (isUploading) {
      toast("Please wait until the upload is complete.");
      return;
    }

    if (data.table_identifier === "folder") {
      navigateToFolder(data.id, data.name);
    } else {
      setSelectedContents((prev) => {
        const isSelected = prev.some((item) => item.id === data.id);
        if (isSelected) {
          return prev.filter((item) => item.id !== data.id);
        } else {
          return [...prev, data];
        }
      });
    }
    setIsSearchOpen(false);
  };

  const getIcon = (content) => {
    if (content.source?.toLowerCase() === "youtube") {
      return <AiOutlineYoutube className="w-5 h-5 text-red-600" />;
    }
    if (content.source?.toLowerCase() === "vimeo") {
      return <RiVimeoLine className="w-5 h-5 text-secondary" />;
    }

    const iconMap = {
      folder: <FcFolder className="w-5 h-5" />,
      "application/pdf": <FaRegFilePdf className="w-5 h-5 text-gray-500" />,
      "image/jpeg": <IoImagesOutline className="w-5 h-5 text-gray-500" />,
      "image/png": <IoImagesOutline className="w-5 h-5 text-gray-500" />,
      "application/vnd.ms-excel": (
        <FaRegFileExcel className="w-5 h-5 text-gray-500" />
      ),
      "application/msword": <FaRegFileWord className="w-5 h-5 text-gray-500" />,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        <BsFiletypePptx className="w-5 h-5 text-gray-500" />,
      "application/vnd.ms-powerpoint": (
        <GrDocumentPpt className="w-5 h-5 text-gray-500" />
      ),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (
        <LuFileSpreadsheet className="w-5 h-5 text-gray-500" />
      ),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        <TbFileTypeDocx className="w-5 h-5 text-gray-500" />,
      "application/url": <FiLink className="w-5 h-5 text-gray-500" />,
      "application/octet-stream": (
        <CiFileOn className="w-5 h-5 text-gray-500" />
      ),
      "video/mp4": (
        <MdOutlineSlowMotionVideo className="w-5 h-5 text-gray-500" />
      ),
    };

    return (
      iconMap[
        content.table_identifier === "folder" ? "folder" : content.mimetype
      ] || <MdOutlineSlowMotionVideo className="w-5 h-5 text-gray-500" />
    );
  };

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${file.name}... 0%`);
    
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("created_by", viewer_id);
      formData.append("description", "Content");
      formData.append("direct_pitch_content", 1);

      const response = await axiosInstance.post(`/local-upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          toast.loading(`Uploading ${file.name}... ${percentCompleted}%`, { 
            id: toastId 
          });
        },
      });

      if (response.data && response.data.uploadedFiles) {
        const uploadedFile = {
          id: response.data.uploadedFiles[0].contentId,
          name: response.data.uploadedFiles[0].contentName,
          mimetype: response.data.uploadedFiles[0].mimetype,
        };

        setSelectedContents((prev) => [...prev, uploadedFile]);
        toast.success(`Successfully uploaded ${file.name}`, { id: toastId });
      }
    } catch (error) {
      console.error("Error in handleFileUpload:", error);
      toast.error(`Failed to upload ${file.name}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleAddContentClick = () => {
    fileInputRef.current.click();
  };

  // SEARCH FEATURE   // SEARCH FEATURE  // SEARCH FEATURE
  // SEARCH FEATURE  // SEARCH FEATURE  // SEARCH FEATURE
  const handleSearchFocus = () => {
    setIsSearchOpen(true);
    connectWebSocket();
  };

  const handleSearchBlur = () => {
    setIsSearchOpen(false);
    setSearchResults([]);
    disconnectWebSocket();
  };

  const connectWebSocket = () => {
    const wsBaseURL = baseURL.replace("https://", "wss://") + "/wss/";
    // Format the protocol header with "token=" prefix
    socketRef.current = new WebSocket(wsBaseURL, [token]);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
      if (debouncedSearchInput) {
        socketRef.current.send(
          JSON.stringify({
            type: "global_search_input",
            payload: {
              tables: ["content", "pitch", "tag"],
              search_input: debouncedSearchInput,
              viewer_id,
            },
          })
        );
      }
    };

    socketRef.current.onmessage = handleWebSocketMessage;
    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  const handleWebSocketMessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "global_search_input") {
      setSearchResults(data.searchResults);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      debouncedSearchInput &&
      socketRef.current?.readyState === WebSocket.OPEN
    ) {
      setIsLoading(true);
      socketRef.current.send(
        JSON.stringify({
          type: "global_search_input",
          payload: {
            tables: ["content", "pitch", "tag"],
            search_input: debouncedSearchInput,
            viewer_id,
          },
        })
      );
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchInput, viewer_id]);

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  useClickOutside(searchContainerRef, searchButtonRef, () => {
    setIsSearchOpen(false);
    setSearchResults([]);
    disconnectWebSocket();
  });

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const toggleSearchType = (type) => {
    setSearchType(type);
    setSearchInput("");
    setAiData(null);
    setStreamingText("");
  };

  const handleSearchSubmit = async () => {
    if (searchType === "ai") {
      await handleAISearch(searchInput);
    }
  };

  const handleAISearch = async (input) => {
    setIsLoading(true);
    setAiData(null);
    setStreamingText("");
    setIsStreaming(true);
    try {
      const response = await axiosInstance.post(
        `ai-search/search`,
        {
          query: input,
          viewer_id: viewer_id,
        },
        {
          onDownloadProgress: (progressEvent) => {
            const text = progressEvent.event.target.responseText;
            setStreamingText(text);
          },
        }
      );

      if (response.data) {
        setAiData(response.data);
      }
    } catch (error) {
      console.error("AI Search error:", error);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleCloseAIResults = () => {
    setAiData(null);
    setSearchInput("");
    setIsSearchOpen(false);
  };

  const getBestMatch = (searchResults) => {
    return searchResults?.[0] || null;
  };

  const getOtherMatches = (searchResults) => {
    return searchResults?.slice(1) || [];
  };

  // Proceed with next steps
  const handleNext = async () => {
    setIsProcessing(true);

    if (selectedContents.length > 1) {
      setCurrentStep("tagline");
    } else {
      onClickHandler(selectedContents[0]);
    }

    setIsProcessing(false);
  };

  const onFinalSaveHandler = () => {
    if (selectedContents.length == 1) {
      onClickHandler(selectedContents);
    } else {
      onMultiSelectHandler(selectedContents);
    }
  };

  console.log("selected CONTENTS :::::::::::", selectedContents);
  if (!popup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
      {currentStep === "select" && (
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in duration-300">
          <div className="flex justify-between items-center p-5 border-b">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Select Content
              {(selectedContents?.length || 0) +
                (contentsWithPlaceholders?.length || 0) >
                0 && (
                <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-secondary rounded-full">
                  {(selectedContents?.length || 0) +
                    (contentsWithPlaceholders?.length || 0)}{" "}
                  selected
                </span>
              )}
            </h3>

            <div className="flex space-x-4">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <button
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={handleAddContentClick}
                >
                  {isUploading ? (
                    <>
                      <LuLoaderCircle className="animate-spin w-4 h-4" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Upload Content
                    </>
                  )}
                </button>
              </div>
              <button
                className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
                onClick={handleCloseModal}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 mx-5 my-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2">
                {breadcrumbs.map((crumb, index) => (
                  <li key={crumb.id} className="inline-flex items-center">
                    {index > 0 && (
                      <svg
                        className="w-4 h-4 text-gray-400 mx-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    )}
                    <button
                      onClick={() => navigateToFolder(crumb.id, crumb.name)}
                      className={`text-sm font-medium hover:text-secondary/90 transition-colors ${
                        index === breadcrumbs.length - 1
                          ? "text-secondary"
                          : "text-gray-500"
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className="px-5 mb-4">
            <div ref={searchContainerRef} className="relative w-full">
              <div className="relative w-full flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {searchType === "standard" ? (
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="text-gray-400"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faMagicWandSparkles}
                      className="text-gray-400"
                    />
                  )}
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="bg-white w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-secondary focus:border-secondary block h-10 pl-10 pr-10 transition-all"
                  placeholder={
                    searchType === "ai"
                      ? "Ask anything..."
                      : "Search content..."
                  }
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={handleSearchFocus}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                />
                <button
                  onClick={toggleDropdown}
                  className="absolute right-2 p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon
                    icon={
                      searchType === "standard" ? faSearch : faMagicWandSparkles
                    }
                    className="text-gray-500"
                  />
                </button>
              </div>

              {/* Dropdown for search options */}
              {isDropdownOpen && (
                <div className="absolute right-0 z-[9999] bg-white rounded-lg shadow-lg border border-gray-200 mt-2 overflow-hidden w-48 animate-in fade-in slide-in-from-top-5 duration-200">
                  <button
                    onClick={() => {
                      toggleSearchType("standard");
                      closeDropdown();
                    }}
                    className="flex items-center p-3 hover:bg-gray-50 w-full transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="mr-3 text-gray-500"
                    />
                    <p className="text-sm text-gray-700">Standard Search</p>
                  </button>
                  {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                    checkUserLicense("Revenue Enablement Spark") == "1") && (
                    <button
                      onClick={() => {
                        toggleSearchType("ai");
                        closeDropdown();
                      }}
                      className="flex items-center p-3 hover:bg-gray-50 w-full transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={faMagicWandSparkles}
                        className="mr-3 text-gray-500"
                      />
                      <p className="text-sm text-gray-700">AI Search</p>
                    </button>
                  )}
                </div>
              )}

              {/* Standard Search Results */}
              {searchType === "standard" &&
                isSearchOpen &&
                searchInput !== "" && (
                  <div className="mt-1 absolute w-full z-50 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <LuLoaderCircle className="animate-spin text-secondary text-lg" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[340px] overflow-y-auto">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            onClick={() => handleContentClick(result)}
                          >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-gray-100">
                              {getIcon(result)}
                            </div>
                            <p className="line-clamp-1 text-sm text-gray-900">
                              {result.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <IoSearchOutline className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm font-medium">No results found</p>
                        {searchInput && (
                          <p className="text-xs mt-1">
                            Try adjusting your search terms
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* AI Search Results */}
              {searchType === "ai" && isSearchOpen && searchInput !== "" && (
                <div className="mt-1 absolute w-full z-50 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-700">
                      AI Search Results
                    </p>
                    <button
                      onClick={handleCloseAIResults}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="p-4">
                      {isStreaming && streamingText ? (
                        <div className="text-sm text-gray-600 space-y-2">
                          <p>{streamingText}</p>
                          <span className="inline-block w-2 h-4 ml-1 bg-secondary animate-pulse" />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                        </div>
                      )}
                    </div>
                  ) : aiData ? (
                    <div className="max-h-[340px] overflow-y-auto p-4">
                      {/* Natural Language Explanation */}
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          {aiData?.naturalLanguageExplanation}
                        </p>
                      </div>

                      {/* Best Match */}
                      {getBestMatch(aiData.searchResults?.value) && (
                        <div className="mb-4">
                          <p className="text-sm font-bold text-gray-700 mb-2">
                            Best Match:
                          </p>
                          <button
                            onClick={() =>
                              handleContentClick(
                                getBestMatch(aiData.searchResults.value)
                              )
                            }
                            className="w-full text-left flex items-center gap-3 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-white">
                              {getIcon(
                                getBestMatch(aiData.searchResults.value)
                              )}
                            </div>
                            <p className="text-sm font-medium text-secondary">
                              {getBestMatch(aiData.searchResults.value).name}
                            </p>
                          </button>
                        </div>
                      )}

                      {/* Other Matches */}
                      {getOtherMatches(aiData.searchResults.value).length >
                        0 && (
                        <div>
                          <p className="text-sm font-bold text-gray-700 mb-2">
                            Other relevant matches:
                          </p>
                          <div className="space-y-1">
                            {getOtherMatches(aiData.searchResults.value).map(
                              (match) => (
                                <button
                                  key={match.id}
                                  onClick={() => handleContentClick(match)}
                                  className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-gray-100">
                                    {getIcon(match)}
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    {match.name}
                                  </p>
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <FontAwesomeIcon
                        icon={faMagicWandSparkles}
                        className="w-8 h-8 mb-2 text-secondary"
                      />
                      <p className="text-sm font-medium">
                        Press Enter to search with AI
                      </p>
                      <p className="text-xs mt-1">
                        Ask a question about your content
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-5">
            <div className="overflow-y-auto border border-gray-200 rounded-lg h-96 shadow-sm">
              {isLoading ? (
                <TableLoading columns={3} rows={7} />
              ) : (
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                    <tr>
                      <th className="p-3 font-semibold text-left border-b w-[50px]">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedContents.length ===
                              contents.filter(
                                (c) => c.table_identifier !== "folder"
                              ).length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedContents(
                                  contents.filter(
                                    (c) => c.table_identifier !== "folder"
                                  )
                                );
                              } else {
                                setSelectedContents([]);
                              }
                            }}
                            className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-secondary checked:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                          />
                        </div>
                      </th>
                      <th className="p-3 font-semibold text-left border-b">
                        <div className="flex items-center justify-between pr-3">
                          <span className="text-sm font-bold text-gray-700">
                            Name
                          </span>
                        </div>
                      </th>
                      <th className="p-3 font-semibold text-left border-b">
                        <div className="flex items-center justify-between pr-3">
                          <span className="text-sm font-bold text-gray-700">
                            Created By
                          </span>
                        </div>
                      </th>
                      <th className="p-3 font-semibold text-left border-b">
                        <div className="flex items-center justify-between pr-3">
                          <span className="text-sm font-bold text-gray-700">
                            Created At
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-sans text-sm divide-y divide-gray-200">
                    {contents.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <EmptyFolderComponent />
                        </td>
                      </tr>
                    ) : (
                      contents.map((content) => (
                        <tr
                          key={content.id}
                          onClick={() => handleContentClick(content)}
                          className={`hover:bg-gray-50 transition-colors duration-150 ${
                            isUploading
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          } ${
                            selectedContents.some(
                              (item) => item.id === content.id
                            )
                              ? "bg-blue-50"
                              : "bg-white"
                          }`}
                          style={{
                            pointerEvents: isUploading ? "none" : "auto",
                          }}
                        >
                          <td
                            className="p-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {content.table_identifier !== "folder" && (
                              <input
                                type="checkbox"
                                checked={selectedContents.some(
                                  (item) => item.id === content.id
                                )}
                                onChange={() => handleContentClick(content)}
                                className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-secondary checked:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                              />
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-gray-100">
                                {getIcon(content)}
                              </div>
                              <span className="ml-3 font-medium text-gray-900 truncate max-w-xs">
                                {content.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-gray-500">
                            {content.created_by}
                          </td>
                          <td className="p-3 text-gray-500">
                            {formatDate(content.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="p-5 border-t flex justify-end space-x-3">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              disabled={selectedContents.length === 0 || isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <LuLoaderCircle className="animate-spin w-4 h-4" />
                  Processing...
                </>
              ) : (
                <>
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {currentStep === "tagline" && (
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in duration-300">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Add Taglines
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
              onClick={handleCloseModal}
            >
              <FontAwesomeIcon
                className="text-gray-500 text-xl"
                icon={faXmark}
              />
            </button>
          </div>

          <div className="p-5">
            <div className="overflow-y-auto border border-gray-200 rounded-lg h-96 shadow-sm divide-y divide-gray-200">
              {selectedContents.map((content, index) => (
                <div
                  key={content.id}
                  className="p-4 space-y-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 mr-3">
                      {getIcon(content)}
                    </div>
                    <div className="font-medium text-gray-800 truncate">
                      {content.name}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter tagline for this content"
                      value={content.tagline || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary transition-colors"
                      onChange={(e) => {
                        const updated = [...selectedContents];
                        const value = e.target.value; // Removed .trim() here
                        if (value) {
                          updated[index] = {
                            ...updated[index],
                            tagline: value,
                          };
                        } else {
                          const { tagline, ...rest } = updated[index];
                          updated[index] = rest;
                        }
                        setSelectedContents(updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 border-t flex justify-end space-x-3">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsProcessing(true);
                onFinalSaveHandler();
              }}
              disabled={
                isProcessing ||
                selectedContents.some(
                  (content) => !content.tagline || !content.tagline.trim()
                )
              }
              className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <LuLoaderCircle className="animate-spin w-4 h-4" />
                  Processing...
                </>
              ) : (
                <>
                  Save
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentTableModal;
