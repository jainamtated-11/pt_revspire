import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { GlobalContext } from "../../../../../context/GlobalState";
/**
 * Custom hook to handle content selection and management
 * @param {Function} axiosInstance - Axios instance for API calls
 * @param {string} viewerId - ID of the viewer
 * @param {Function} setFullscreenBlobUrl - Function to set the fullscreen blob URL
 * @param {Function} handleOnClickContent - Function to handle content click
 * @returns {Object} Content state and handlers
 */
const useContent = (
  axiosInstance,
  viewerId,
  setFullscreenBlobUrl,
  handleOnClickContent
) => {
  const [showNewThreadDropdown, setShowNewThreadDropdown] = useState(false); // show dropdown in add new thread
  const [showReplyDropdown, setShowReplyDropdown] = useState(false); // show dropdown in reply to comment
  const [isAddContentClicked, setIsAddContentClicked] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState(null); // State to track selected content ID
  const [selectedPitchContentId, setSelectedPitchContentId] = useState(null);
  const [selectedTagline, setSelectedTagline] = useState("");
  const [kbdId, setKbdId] = useState("");
  const [currentMimeType, setCurrentMimeType] = useState(null); // State to manage current MIME type
  const [selectedContent, setSelectedContent] = useState(null);
  const [blobUrl, setBlobUrl] = useState("");
  const [selectedMimeType, setSelectedMimeType] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const { setSelectedPitchContent } = useContext(GlobalContext);
  /**
   * Get cookie value by name
   * @param {string} name - Cookie name
   * @returns {string|null} Cookie value
   */
  const getCookieValue = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  /**
   * Fetch blob data for a content item
   * @param {string} contentId - ID of the content
   * @param {string} contentMimeType - MIME type of the content
   * @returns {Promise<string>} Blob URL
   */

  const fetchBlobData = async (contentId, contentMimeType) => {
    const token = getCookieValue("revspireToken");
    try {
      let responseType = "blob";
      if (
        contentMimeType.includes("application/vnd") ||
        contentMimeType.includes("application/msword") ||
        contentMimeType.includes("video/")
      ) {
        responseType = "JSON";
      }

      const response = await axiosInstance.post(
        "/open-content",
        {
          contentId: contentId,
          viewerId: viewerId,
          manual_token: token,
        },
        {
          responseType: responseType,
          withCredentials: true,
        }
      );

      if (responseType === "JSON") {
        if (typeof response.data === "string") {
          const sasUrl = JSON.parse(response.data).sasUrl;
          return sasUrl; // Directly return the SAS URL
        } else {
          throw new Error("Unexpected response data type");
        }
      } else {
        if (typeof response.data === "string") {
          return response.data; // Directly return the URL string
        } else if (response.data instanceof Blob) {
          const url = URL.createObjectURL(response.data);
          return url; // Return a URL representing the Blob JSON
        } else {
          throw new Error("Unexpected response data type");
        }
      }
    } catch (error) {
      toast.error("Error fetching blob URL: " + error.message);
      return null; // Return null in case of an error
    }
  };

  /**
   * Handle adding content (either for reply or new thread)
   * @param {boolean} isReply - Whether this is for a reply
   */
  const handleAddContentClick = (isReply = false) => {
    if (isReply) {
      setShowReplyDropdown(true); // Show dropdown for replies
    } else {
      setShowNewThreadDropdown(true); // Show dropdown for new thread
    }
    setIsAddContentClicked(true);
  };

  /**
   * Handle item selection from content dropdown
   * @param {Object} item - Selected content item
   * @param {boolean} isReply - Whether this is for a reply
   * @param {Object} pitchData - The pitch data object
   */
  const handleItemClick = (item, isReply = false, pitchData) => {
    if (item == null) {
      setSelectedContentId(null);
      setSelectedPitchContent(null);
      setSelectedTagline(null);
      return;
    }
    setSelectedContentId(item.content);
    setSelectedPitchContentId(item.id);
    setSelectedPitchContent(item.id);
    setSelectedTagline(item.tagline);
    if (isReply) {
      setShowReplyDropdown(false); // Close reply dropdown
    } else {
      setShowNewThreadDropdown(false); // close main dropdown
    }
    if (pitchData) {
      handleContentSelection(item.id, pitchData);
    }
    setKbdId(item.content);

    setSelectedTagline(item.tagline);
    if (isReply) {
      setShowReplyDropdown(false); // Close reply dropdown
    } else {
      setShowNewThreadDropdown(false); // close main dropdown
    }
    if (pitchData) {
      handleContentSelection(item.id, pitchData);
    }
    setKbdId(item.content);
  };

  /**
   * Handle content selection
   * @param {string} contentId - ID of the selected content
   * @param {Object} pitchData - The pitch data
   */
  const handleContentSelection = (contentId, pitchData) => {
    // Find the content in pitchData.pitchSections
    const foundContent = pitchData.pitchSections
      .flatMap((section) => section.contents)
      .find((content) => content.id === contentId); // Match by content ID
    if (foundContent) {
      setSelectedContent(foundContent);
      setSelectedMimeType(foundContent.content_mimetype);
    }
  };

  /**
   * Handle content click and open content viewer
   * @param {string} contentId - ID of the content
   * @param {Object} pitchData - The pitch data
   */
  const handleContentClick = async (contentId, pitchData) => {
    // Show a toast notification
    const loadingToastId = toast.loading("Opening Content");
    setIsLoading(true); // Set loading state to true

    try {
      // Find the content based on pitch_content ID
      const foundContent = pitchData.pitchSections
        .flatMap((section) => section.contents)
        .find(
          (content) =>
            content.content_id === contentId || content.id === contentId
        );

      if (!foundContent) {
        throw new Error("Content not found");
      }

      setCurrentMimeType(foundContent.content_mimetype);

      if (
        foundContent.content_source?.toLowerCase() === "youtube" ||
        foundContent.content_source?.toLowerCase() === "vimeo" ||
        foundContent.content_source?.toLowerCase() === "public url"
      ) {
        // Directly use the content_link for video URLs
        handleOnClickContent(
          foundContent,
          foundContent.content_link,
          "application/url",
          foundContent.tagline
        );
      } else {
        // Fetch the blob URL for other content types
        const blobUrl = await fetchBlobData(
          contentId,
          foundContent.content_mimetype
        );
        // Check if blobUrl is available
        if (blobUrl) {
          // Call handleOnClickContent with the correct parameters
          setFullscreenBlobUrl(blobUrl);
          setBlobUrl(blobUrl);
          handleOnClickContent(
            foundContent,
            blobUrl,
            foundContent.content_mimetype,
            foundContent.tagline
          );
        } else {
          console.error("Blob URL not available");
          toast.error("Failed to fetch content, Please try again!");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while opening content.");
    } finally {
      // Dismiss the loading toast
      toast.dismiss(loadingToastId);
      setBlobUrl("");
      setCurrentMimeType("");
      setIsLoading(false);
    }
  };

  // Reset content-related state
  const resetContentState = () => {
    setSelectedContent(null);
    setSelectedContentId(null);
    setSelectedPitchContentId(null);
    setSelectedTagline("");
    setIsAddContentClicked(false);
    setShowNewThreadDropdown(false);
    setShowReplyDropdown(false);
    setIsLoading(false);
  };

  return {
    showNewThreadDropdown,
    setShowNewThreadDropdown,
    showReplyDropdown,
    setShowReplyDropdown,
    isAddContentClicked,
    setIsAddContentClicked,
    selectedContentId,
    setSelectedContentId,
    selectedPitchContentId,
    setSelectedPitchContentId,
    selectedTagline,
    setSelectedTagline,
    kbdId,
    setKbdId,
    currentMimeType,
    setCurrentMimeType,
    selectedContent,
    setSelectedContent,
    blobUrl,
    setBlobUrl,
    selectedMimeType,
    setSelectedMimeType,
    isLoading,
    setIsLoading,
    getCookieValue,
    fetchBlobData,
    handleAddContentClick,
    handleItemClick,
    handleContentSelection,
    handleContentClick,
    resetContentState,
  };
};

export default useContent;
