import toast from "react-hot-toast";

/**
 * Service for handling thread-related API requests
 */
class ThreadApiService {
  /**
   * Create a new constructor to initialize the axios instance
   * @param {Object} axiosInstance - Axios instance for API calls
   */
  constructor(axiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  /**
   * Add a reply to a thread
   * @param {string} threadId - ID of the thread
   * @param {string} replyText - Content of the reply
   * @param {string} commentedBy - User info JSON string
   * @param {boolean} isExternalUser - Whether the user is external
   * @param {string|null} contentId - Optional content ID to reference
   * @returns {Promise<Object>} - Response data
   */
  async addReply(
    threadId,
    replyText,
    commentedBy,
    isExternalUser,
    contentId = null
  ) {
    if (replyText.trim() === "") {
      toast.error("Reply can't be empty");
      throw new Error("Reply can't be empty");
    }

    const replyData = {
      pitchThread: threadId,
      commentContent: replyText,
      commented_by: commentedBy,
      external_user: isExternalUser ? 1 : 0,
      pitch_content: contentId,
    };

    try {
      const response = await this.axiosInstance.post(
        "/respond-in-thread",
        replyData
      );
      // toast.success('Reply added successfully!');
      return response.data;
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply. Please try again.");
      throw error;
    }
  }

  /**
   * Create a new thread
   * @param {string} pitchId - ID of the pitch
   * @param {string} commentText - Content of the comment
   * @param {string} commentedBy - User info JSON string
   * @param {boolean} isExternalUser - Whether the user is external
   * @param {string|null} contentId - Optional content ID to reference
   * @returns {Promise<Object>} - Response data
   */
  async createThread(
    pitchId,
    commentText,
    commentedBy,
    isExternalUser,
    contentId = null
  ) {
    if (commentText.trim() === "") {
      toast.error("Comment can't be empty");
      throw new Error("Comment can't be empty");
    }

    const newThreadData = {
      pitch: pitchId,
      commentContent: commentText,
      commented_by: commentedBy,
      external_user: isExternalUser ? 1 : 0,
      pitch_content: contentId,
    };

    try {
      const response = await this.axiosInstance.post(
        "/create-thread",
        newThreadData
      );
      toast.success("Thread created successfully");
      return response.data;
    } catch (error) {
      console.error("Error creating thread:", error);
      toast.error("Failed to create thread. Please try again.");
      throw error;
    }
  }

  /**
   * Fetch blob data for a content item
   * @param {string} contentId - ID of the content
   * @param {string} contentMimeType - MIME type of the content
   * @param {string} viewerId - ID of the viewer
   * @returns {Promise<string>} - Blob URL
   */
  async fetchBlobData(contentId, contentMimeType, viewerId) {
    try {
      const token = this.getCookieValue("revspireToken");
      let responseType = "blob";
      if (
        contentMimeType.includes("application/vnd") ||
        contentMimeType.includes("application/msword") ||
        contentMimeType.includes("video/")
      ) {
        responseType = "JSON";
      }

      const response = await this.axiosInstance.post(
        "/open-content",
        {
          contentId: contentId,
          viewerId: viewerId,
          manual_token: token, // Include token if needed
        },
        {
          responseType: responseType,
          withCredentials: true,
        }
      );

      if (responseType === "JSON") {
        if (typeof response.data === "string") {
          const sasUrl = JSON.parse(response.data).sasUrl;
          console.log("Fetched Blob URL:", sasUrl);
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
  }

  /**
   * Get cookie value by name
   * @param {string} name - Name of the cookie
   * @returns {string|null} - Cookie value or null if not found
   */
  getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }
}

export default ThreadApiService;
