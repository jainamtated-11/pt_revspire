// Core imports
import React, { useRef, useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
// import PropTypes from "prop-types";
import LoadingSpinner from "../../../utility/LoadingSpinner.jsx";
import { FilterCleaner } from "../../../features/filter/fliterSlice.js";
import { SetSearchValue } from "../../../features/search/searchSlice.js";
// Icons and assets
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IoSearchOutline } from "react-icons/io5";
import { FaTags } from "react-icons/fa6";
import { TbTableColumn } from "react-icons/tb";
import { useCookies } from "react-cookie";
import { LuLoaderCircle } from "react-icons/lu";
import Logo from "../../../../src/assets/RevSpire-logo.svg";
import {
  faSignOutAlt,
  faUser,
  faHome,
  faGear,
  faArrowRightFromBracket,
  faSearch,
  faMagicWandSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
// Custom hooks and utilities
import { useDebounce } from "use-debounce";
import useDarkMode from "../../../hooks/useDarkMode.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import useCheckFrontendPermission from "../../../Services/checkFrontendPermission.jsx";
// import useContentHandler from "../ContentManager/ContentTable/useContentHandler.js";
import useCheckUserLicense from "../../../Services/checkUserLicense.jsx";
import { useClickOutside } from "../../../hooks/useClickOutside.jsx";
// Context and state management
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { AuthContext } from "../../../Authentication/AuthContext.jsx";
import ContentModal from "../ContentManager/ContentTable/ContentModal.jsx";
// Animation
import { AnimatePresence, motion } from "framer-motion";
// Utility functions

import Integrations from "../Integrations.jsx";
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
import { MdOpenInNew } from "react-icons/md";
import { MdOutlineEdit } from "react-icons/md";

const getIcon = (item, className) => {
  switch (
    item.source == "Youtube"
      ? "youtube"
      : item.source == "Vimeo"
      ? "vimeo"
      : item.mimetype || item.content_mimetype || item.source
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

    default:
      return (
        <FcFolder
          className="text-yellow-300 w-5 h-5 flex-shrink-0"
          style={{ width: "20px" }}
        />
      );
  }
};

const Header = () => {
  // Context and hooks
  const { handleLogout, baseURL } = useContext(AuthContext);
  const {
    dashboardState,
    setDashboardState,
    viewer_id,
    // setAddContentToTag,
    user_name,
    name,
    setViewContent,
    setContentModalOpen,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const checkFrontendPermission = useCheckFrontendPermission();
  const checkUserLicense = useCheckUserLicense();
  // State management
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchInput] = useDebounce(searchInput, 500);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [isAddingIntegration, setIsAddingIntegration] = useState(false);
  const [searchType, setSearchType] = useState("standard");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [cookies] = useCookies(["revspireToken"]);
  const [selectedContent, setSelectedContent] = useState({});
  const [contentModalLoading, setContentModalLoading] = useState(false);
  const token = cookies.revspireToken;
  // Refs
  const socketRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        // setAiData(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Permission check
  const hasPermissions =
    checkFrontendPermission(
      "View All Users;Create Users;Edit Users;Activate/Deactivate Users;View all Bulk User Uploads;Create Bulk User Upload;Download Bulk User Upload Log;View All Profiles;Create Profiles;Assign Profile to Users;Edit Profiles;Activate/Deactivate Profiles;View All Company Settings;Edit Company Settings;View All Pitch Layouts;Create Pitch layouts;Edit Pitch layouts;Activate/Deactivate Pitch layouts"
    ) == "1";
  // For show/hide the integration dialog
  const handleShowIntegrations = (state) => {
    setShowIntegrations(!showIntegrations);
  };
  // Add new function to handle WebSocket connection
  const connectWebSocket = () => {
    const wsBaseURL = baseURL.replace("https://", "wss://") + "/wss/";
    // Format the protocol header with "token=" prefix
    socketRef.current = new WebSocket(wsBaseURL, [token]);
    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
      // If there's existing search input, send it immediately after connection
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
  // Add function to disconnect WebSocket
  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      console.log("WebSocket disconnected");
    }
  };
  // Modify the search focus/blur handlers
  const handleSearchFocus = () => {
    setIsSearchOpen(true);
    if (searchType == "standard") {
      connectWebSocket();
    }
  };
  const handleSearchBlur = () => {
    setIsSearchOpen(false);
    setSearchResults([]);
    disconnectWebSocket();
  };
  // Update the click outside handler
  useClickOutside(searchContainerRef, searchButtonRef, () => {
    setIsSearchOpen(false);
    setSearchResults([]);
    disconnectWebSocket();
  });
  // Modify the search effect to use existing socket connection
  useEffect(() => {
    if (
      debouncedSearchInput &&
      socketRef.current?.readyState === WebSocket.OPEN
    ) {
      if (searchType == "standard") {
        setIsLoading(true);
      }
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
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  // Handler functions
  const handleWebSocketMessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "global_search_input") {
      setSearchResults(data.searchResults);
      setIsLoading(false);
    }
  };
  const handleLogoutClick = async () => {
    try {
      const response = await axiosInstance.post("/logout", { viewer_id });
      if (response.status === 200) {
        console.log(response.data.message);
        handleLogout();
      }
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };
  const handleDashboardToggle = () => {
    if (dashboardState === "setup") {
      navigate("/content/content-portal");
    } else if (dashboardState === "home" && hasPermissions) {
      navigate(`/user/user-management/all-users`);
    } else navigate("");
    setDashboardState((prev) =>
      prev === "home" && hasPermissions ? "setup" : "home"
    );
    dispatch(FilterCleaner());
    dispatch(SetSearchValue(""));
  };
  // Handle Content Click
  const handleContentClick = async (item) => {
    setSelectedContent(item);
    try {
      setContentModalLoading(true); // Set loading to true when initiating the action
      if (item?.mimetype) {
        if (
          item?.mimetype.includes("application/vnd") ||
          item?.mimetype.includes("application/msword") ||
          item?.mimetype.includes("video/")
        ) {
          // For Microsoft Office, and videos files, get the SAS URL
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item?.content || item?.id || item?.contentId,
              viewerId: viewer_id,
            },
            {
              withCredentials: true, // Include cookies in the request
            }
          );
          const sasURL = res.data.sasUrl;
          setViewContent(sasURL);
        } else if (item.mimetype.includes("application/url")) {
          setViewContent(item.content);
        } else {
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item?.content || item?.id || item?.contentId,
              viewerId: viewer_id,
            },
            {
              responseType: "blob",
              withCredentials: true,
            }
          );
          const contentBlob = new Blob([res.data], {
            type: `${item.mimetype}`,
          });
          setViewContent(contentBlob);
        }
        setContentModalOpen(true);
      } else {
        if (
          ["png", "jpg", "jpeg", "webp", "bmp", "gif", "svg"].some((format) =>
            item.name.includes(format)
          )
        ) {
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item?.content || item?.id || item?.contentId,
              viewerId: viewer_id,
            },
            {
              responseType: "blob",
              withCredentials: true,
            }
          );
          const contentBlob = new Blob([res.data], {
            type: `${res.data.type}`,
          });
          const url = URL.createObjectURL(contentBlob);
          setViewContent(url);
        } else if (item.name.includes(".mp4")) {
          const res = await axiosInstance.post(`/open-content`, {
            contentId: item?.content || item?.id || item?.contentId,
            viewerId: viewer_id,
          });
          if (res.data && res.data.sasUrl) {
            setViewContent(res.data.sasUrl);
          } else {
            console.error("sasURL not found in response:", res.data);
          }
        } else {
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item?.content || item?.id || item?.contentId,
              viewerId: viewer_id,
            },
            {
              responseType: "blob",
              withCredentials: true,
            }
          );
          const contentBlob = new Blob([res.data], {
            type: `application/pdf`,
          });
          const url = URL.createObjectURL(contentBlob);
          setViewContent(url);
        }
        setContentModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContentModalLoading(false); // Set loading to false when the action completes (whether successful or not)
    }
  };
  // Search result handling
  const fetchChildFolders = async (result) => {
    const { table, mimetype } = result;
    if (
      (table === "content" &&
        (mimetype === "application/url" ||
          mimetype.includes("image/") ||
          mimetype.includes("video/") ||
          mimetype === "application/pdf" ||
          mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          mimetype ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) ||
      mimetype ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      handleContentClick(result);
    }
  };
  const handleSearchResultClick = (result) => {
    console.log("RESULT HERE", result);
    setIsSearchOpen(false);
    try {
      if (result.table === "pitch") {
        return navigate(`/content/pitch-manager?pitch=${result.id}`);
      }
      if (result.table === "tag") {
        return navigate(`/content/tag-manager?tag=${result.id}`);
      }
      if (result.table === "content") {
        navigate(`/content/content-portal`);
        return fetchChildFolders(result);
      }
    } catch (error) {
      console.log(error);
    }
  };
  // Navigation menu configuration
  const menuItems = [
    {
      title: dashboardState === "home" && hasPermissions ? "Setup" : "Home",
      icon: dashboardState === "home" && hasPermissions ? faGear : faHome,
      onClick: handleDashboardToggle,
    },
    {
      title: "Sign out",
      icon: faSignOutAlt,
      onClick: handleLogoutClick,
    },
  ];
  // Theme toggle component
  const ThemeToggle = () => {
    const [darkTheme, setDarkTheme] = useDarkMode();
    return (
      <span onClick={() => setDarkTheme(!darkTheme)}>
        {/* <FontAwesomeIcon
          icon={darkTheme ? faSun : faMoon}
          className={`w-5 h-8 mr-3 ml-5 flex hover:text-gray-600 ${
            darkTheme ? "dark:text-gray-300 dark:hover:text-gray-400" : ""
          }`}
        /> */}
      </span>
    );
  };

  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/[^\w\s.,!?\-'"$]/g, "") // Remove special chars except basic punctuation
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .trim();
  };

  // Animation variants
  const animations = {
    searchBar: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0 },
    },
    results: {
      hidden: { opacity: 0, scaleY: 0.95 },
      visible: { opacity: 1, scaleY: 1 },
    },
  };

  // New function for AI search
  const handleAISearch = async (input) => {
    if (!input.trim()) return;

    console.log("AI Search initiated with input:", input);
    setIsLoading(true);
    setAiData(null);
    setStreamingText("");
    setIsStreaming(true);

    try {
      const response = await axiosInstance.post(
        `ai-search/search`,
        {
          query: cleanText(input),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Simulate streaming effect
      const text =
        response.data.naturalLanguageExplanation || "No explanation available";
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

      for (let i = 0; i < sentences.length; i++) {
        if (!isStreaming) break; // Stop if user closed results
        await new Promise((resolve) => setTimeout(resolve, 100)); // Faster streaming
        setStreamingText((prev) => prev + sentences[i]);
      }

      setAiData({
        ...response.data,
        naturalLanguageExplanation: cleanText(text),
      });
    } catch (error) {
      console.error("AI Search error:", error);
      setStreamingText(
        "Sorry, we couldn't process your request. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Function to handle search submission
  const handleSearchSubmit = () => {
    if (searchType === "standard") {
      console.log("Standard Search initiated with input:", searchInput);
    } else {
      handleAISearch(searchInput);
    }
  };
  // Function to toggle search type
  const toggleSearchType = (type) => {
    if (type === "standard") {
      setAiData(null);
    }
    setSearchType(type);
  };
  // Modify the dropdown toggle logic to conditionally render AI search option
  const toggleDropdown = () => {
    if (
      checkUserLicense("Revenue Enablement Elevate") == "1" ||
      checkUserLicense("Revenue Enablement Spark") == "1"
    ) {
      setIsDropdownOpen((prev) => !prev);
    }
  };
  // Function to handle dropdown close
  const closeDropdown = () => {
    setIsDropdownOpen(false);
    setAiData(null);
  };
  const handleResult = (result) => {
    const data = {
      id: result.id,
      name: result.name,
      mimetype: result.mimetype,
      folder: result.folder,
      table: "content",
    };
    navigate(`/content/content-portal`);
    fetchChildFolders(data);
    // Clear all states
    // setAiData(null);
    // setSearchInput("");
    // setIsSearchOpen(false);
    // setIsDropdownOpen(false);
    // setSearchResults([]);
    // setSearchType("standard"); // Reset to standard search
  };
  // Add a function to get best match
  const getBestMatch = (results) => {
    return results.reduce((best, current) => {
      return !best ||
        current["@search.rerankerScore"] > best["@search.rerankerScore"]
        ? current
        : best;
    }, null);
  };
  // Add a function to get other matches
  const getOtherMatches = (results) => {
    const bestMatch = getBestMatch(results);
    return results.filter((result) => result.id !== bestMatch.id);
  };
  // Modify the wrapFileNamesInClickable function
  const wrapFileNamesInClickable = (text) => {
    return text.replace(/"([^"]+)"/g, (match, fileName) => {
      // Remove .mp4 or any file extension from the search
      const cleanFileName = fileName.replace(/\.[^/.]+$/, "");
      // Find the matching file in search results
      const fileResult = aiData.searchResults.value.find(
        (r) => r.name.replace(/\.[^/.]+$/, "") === cleanFileName
      );
      if (fileResult) {
        return `<span class="text-primary hover:bg-transparent cursor-pointer hover:underline" onclick="window._handleFileClick('${fileResult.name}')">${match}</span>`;
      }
      return match;
    });
  };
  // Update the useEffect handler
  useEffect(() => {
    window._handleFileClick = (fileName) => {
      const fileResult = aiData.searchResults.value.find(
        (r) => r.name === fileName
      );
      if (fileResult) {
        handleResult(fileResult);
      }
    };
    return () => {
      delete window._handleFileClick;
    };
  }, [aiData, handleResult]);

  const encodedBaseURL = encodeURIComponent(baseURL);

  // First add this handler function near your other handlers
  const handleCloseAIResults = () => {
    setAiData(null);
    setSearchInput("");
    setIsSearchOpen(false);
    setIsDropdownOpen(false);
    setSearchResults([]);
  };
  return (
    <nav className="fixed inset-x-0 z-30">
      <div className="fixed inset-x-0 z-30">
        {contentModalLoading ? (
          <div className="fixed inset-0 flex items-center justify-center z-50 ">
            <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <ContentModal
              content={selectedContent}
              isOpen={setContentModalOpen}
              closeModal={() => setContentModalOpen(false)}
              setSelectedContent={setSelectedContent}
              isPitch={true}
            />
          </>
        )}
        <div className="w-full flex items-center h-[60px] border border-b-neutral-200 bg-white dark:bg-gray-900 dark:border-gray-700">
          {/* Left section: Logo - Adjusted to align with sidebar items */}
          <div className="flex items-center pl-3">
            <Link to="/content/content-portal">
              <img
                className="h-8 dark:bg-white rounded-md py-[2px]"
                src={Logo}
                alt="Revspire Logo"
              />
            </Link>
          </div>
          {/* Center section: Search bar */}
          <div className="flex items-center justify-center flex-grow px-4">
            <motion.div
              ref={searchContainerRef}
              className="relative flex flex-col md:w-[330px] xl:w-[600px]"
            >
              <div className="relative w-full flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="bg-white dark:bg-gray-800 w-full border border-neutral-300 dark:border-gray-600 text-neutral-800 dark:text-gray-200 sm:text-sm rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block h-10 pl-4 pr-10 outline-none transition-all duration-200"
                  placeholder={
                    searchType === "ai"
                      ? "Ask anything about your content..."
                      : "Search content, pitches, tags..."
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FontAwesomeIcon
                    icon={
                      searchType === "standard" ? faSearch : faMagicWandSparkles
                    }
                    className={`text-md ${
                      searchType === "ai"
                        ? "text-primary-500 dark:text-primary-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                </button>
              </div>
              {/* Dropdown for search options */}
              {isDropdownOpen && (
                <div className="absolute right-0 z-10 bg-white border border-neutral-200 rounded-md shadow-lg mt-10 ">
                  <button
                    onClick={() => {
                      toggleSearchType("standard");
                      closeDropdown();
                    }}
                    className="flex items-center p-2 hover:bg-neutral-100 w-full"
                  >
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="mr-2 text-sm text-gray-600"
                    />
                    <p className="text-sm text-gray-600">Standard Search</p>
                  </button>
                  {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                    checkUserLicense("Revenue Enablement Spark") == "1") && ( // Conditionally render AI Search option
                    <button
                      onClick={() => {
                        toggleSearchType("ai");
                        closeDropdown();
                      }}
                      className="flex items-center p-2 hover:bg-neutral-100 w-full"
                    >
                      <FontAwesomeIcon
                        icon={faMagicWandSparkles}
                        className="mr-2 text-sm text-gray-600"
                      />
                      <p className="text-sm text-gray-600">AI Search</p>
                    </button>
                  )}
                </div>
              )}
              {/* Search results dropdown */}
              {searchType === "standard" && (
                <AnimatePresence>
                  {isSearchOpen && searchInput !== "" && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={animations.results}
                      className="w-full absolute flex gap-1 p-3 flex-col max-h-[340px] bg-white dark:bg-gray-800 shadow-lg border-neutral-200 dark:border-gray-700 border rounded-md top-[37px]"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <LuLoaderCircle className="animate-spin text-neutral-600 dark:text-gray-400 text-lg" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="overflow-y-auto scrollbar-hide">
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              className="group w-full text-left flex items-center gap-2 px-3 py-0 hover:bg-neutral-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-default"
                            >
                              <p className="line-clamp-1 text-sm w-full flex items-center gap-2 dark:text-gray-200">
                                {result.table === "tag" ? (
                                  <FaTags className="text-sm text-neutral-600 dark:text-gray-400" />
                                ) : result.table === "pitch" ? (
                                  <TbTableColumn className="text-lg text-neutral-600 dark:text-gray-400" />
                                ) : (
                                  getIcon(result)
                                )}
                                <span className="flex-1 line-clamp-1 py-2">
                                  {result.name}
                                </span>
                              </p>

                              {/* Hover icons container */}
                              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {result.table === "pitch" && (
                                  <>
                                    <MdOutlineEdit
                                      className="mr-6 h-5 w-5 text-neutral-600 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `/content/pitch-manager?pitchId=${result.id}&routeToPitch=true`
                                        );
                                      }}
                                    />
                                    <MdOpenInNew
                                      className="mr-2 h-5 w-5 text-neutral-600 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(
                                          `/dsr/${result.id}?apiURL=${encodedBaseURL}`,
                                          "_blank"
                                        );
                                      }}
                                    />
                                  </>
                                )}

                                {result.table === "content" && (
                                  <MdOpenInNew
                                    className="mr-2 h-5 w-5 text-neutral-600 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/content/content-portal`);
                                      fetchChildFolders(result);
                                    }}
                                  />
                                )}

                                {result.table === "tag" && (
                                  <MdOutlineEdit
                                    className="mr-2 h-5 w-5 text-neutral-600 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(
                                        `/content/tag-manager?tag=${result.id}`
                                      );
                                    }}
                                  />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-neutral-500 dark:text-gray-400">
                          <IoSearchOutline className="w-8 h-8 mb-2" />
                          <p className="text-sm">No results found</p>
                          {searchInput && (
                            <p className="text-xs mt-1">
                              Try adjusting your search terms
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              {searchType === "ai" && (
                <AnimatePresence>
                  {isSearchOpen && searchInput !== "" && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={animations.results}
                      className="w-full absolute flex gap-1 p-0 flex-col max-h-[400px] bg-white dark:bg-gray-800 shadow-lg border-neutral-200 dark:border-gray-700 border rounded-md top-[42px] overflow-hidden"
                    >
                      {isLoading ? (
                        <div className="overflow-y-auto">
                          <div className="flex justify-between items-center p-3 border-b border-neutral-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <h3 className="font-medium text-gray-700 dark:text-gray-300">
                              AI Search Results
                            </h3>
                            <button
                              onClick={handleCloseAIResults}
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <FontAwesomeIcon
                                icon={faXmark}
                                className="w-4 h-4"
                              />
                            </button>
                          </div>
                          <div className="p-4">
                            {isStreaming && streamingText ? (
                              <div className="space-y-3">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {cleanText(streamingText)}
                                  <span className="inline-block w-2 h-4 ml-1 bg-primary-500 dark:bg-primary-400 animate-pulse" />
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <LuLoaderCircle className="animate-spin text-primary-500 dark:text-primary-400" />
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Analyzing your query...
                                  </p>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-3/4" />
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-1/2" />
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-5/6" />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : aiData ? (
                        <div className="overflow-y-auto">
                          <div className="flex justify-between items-center p-3 border-b border-neutral-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <h3 className="font-medium text-gray-700 dark:text-gray-300">
                              AI Search Results
                            </h3>
                            <button
                              onClick={handleCloseAIResults}
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <FontAwesomeIcon
                                icon={faXmark}
                                className="w-4 h-4"
                              />
                            </button>
                          </div>
                          <div className="p-4 space-y-4">
                            {/* AI Response section */}
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                                {cleanText(aiData.naturalLanguageExplanation)}
                              </p>
                            </div>

                            {/* Best Match section */}
                            {aiData.searchResults?.value?.length > 0 && (
                              <div>
                                <div className="mb-2">
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Best Match
                                  </h4>
                                  <div
                                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                    onClick={() =>
                                      handleResult(
                                        getBestMatch(aiData.searchResults.value)
                                      )
                                    }
                                  >
                                    {getIcon(
                                      getBestMatch(aiData.searchResults.value),
                                      "text-gray-500"
                                    )}
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                      {cleanText(
                                        getBestMatch(aiData.searchResults.value)
                                          .name
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {/* Other matches section */}
                                {getOtherMatches(aiData.searchResults.value)
                                  .length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                      Other Matches
                                    </h4>
                                    <div className="space-y-1">
                                      {getOtherMatches(
                                        aiData.searchResults.value
                                      ).map((match) => (
                                        <div
                                          key={match.id}
                                          className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                          onClick={() => handleResult(match)}
                                        >
                                          {getIcon(match, "text-gray-500")}
                                          <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {cleanText(match.name)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-neutral-500 dark:text-gray-400">
                          <FontAwesomeIcon
                            icon={faMagicWandSparkles}
                            className="w-8 h-8 mb-2 text-primary-500 dark:text-primary-400"
                          />
                          <p className="text-sm text-center">
                            Ask anything about your content
                            <br />
                            <span className="text-xs">
                              Press Enter to search
                            </span>
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          </div>
          {/* Right section: Integrations and user menu */}
          <div className="flex items-center gap-4 pr-6">
            <Integrations
              setShowIntegrations={setShowIntegrations}
              viewer_id={viewer_id}
              isAddingIntegration={isAddingIntegration}
              setIsAddingIntegration={setIsAddingIntegration}
              handleShowIntegrations={handleShowIntegrations}
              showIntegrations={showIntegrations}
            />
            <ThemeToggle />
            {/* User dropdown menu */}
            <div ref={dropdownRef} className="flex relative">
              <button
                onClick={() => {
                  setShowDropdown(!showDropdown);
                }}
                className="flex text-sm"
              >
                <FontAwesomeIcon
                  icon={faUser}
                  className="w-6 h-6 text-black dark:text-gray-300 rounded-lg hover:text-gray-600 dark:hover:text-gray-400"
                />
              </button>
              {/* Dropdown menu */}
              <div
                className={`
                absolute top-12 right-0 w-fit p-3 px-4 text-base 
                bg-neutral-100 dark:bg-gray-800 border border-neutral-300 dark:border-gray-700 
                divide-y divide-gray-100 dark:divide-gray-700
                rounded-lg z-[999999] transition-all duration-300 ease-in-out transform
                ${
                  showDropdown
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }
              `}
              >
                {/* User info section */}
                <div className="flex flex-col border-b border-b-neutral-300 dark:border-b-gray-700 pb-2 w-full">
                  <span className="text-neutral-800 dark:text-gray-200 font-semibold max-w-[20ch] whitespace-nowrap overflow-hidden text-ellipsis">
                    {name}
                  </span>
                  <span className="text-sm text-neutral-600 dark:text-gray-400 max-w-[20ch] whitespace-nowrap overflow-hidden text-ellipsis">
                    {user_name}
                  </span>
                </div>
                {/* Menu items */}
                <div>
                  <ul className="mt-2">
                    {(dashboardState !== "home" || hasPermissions) && (
                      <div>
                        <button
                          className="pl-[15px] flex justify-start w-full pr-[30px] items-center py-2 text-sm text-neutral-700 dark:text-gray-200 hover:bg-neutral-200 dark:hover:bg-gray-700 cursor-pointer border border-neutral-100 dark:border-gray-700 hover:border-neutral-300 dark:hover:border-gray-600 rounded-lg active:scale-95 transition-all"
                          onClick={() => {
                            setShowDropdown(false);
                            menuItems[0].onClick();
                          }}
                        >
                          <FontAwesomeIcon
                            icon={menuItems[0].icon}
                            className="mr-2"
                          />
                          {menuItems[0].title}
                        </button>
                      </div>
                    )}
                  </ul>
                </div>
                {/* Logout button */}
                <div className="flex items-center">
                  <button
                    className="px-4 mt-1 flex justify-start w-full items-center py-2 text-sm text-neutral-700 dark:text-gray-200 hover:bg-neutral-200 dark:hover:bg-gray-700 cursor-pointer border border-neutral-100 dark:border-gray-700 hover:border-neutral-300 dark:hover:border-gray-600 rounded-lg active:scale-95 transition-all"
                    onClick={() => {
                      setShowDropdown(false);
                      menuItems[1].onClick();
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faArrowRightFromBracket}
                      className="mr-2"
                    />
                    {menuItems[1].title}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Header;
