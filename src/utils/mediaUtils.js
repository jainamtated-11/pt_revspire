/**
 * Utility functions for handling media and content in the Standard Layout
 */

/**
 * Extracts video ID from YouTube and Vimeo URLs
 * @param {string} url - The video URL
 * @param {string} platform - "youtube" or "vimeo"
 * @returns {string|null} The extracted video ID or null if not found
 */
export const getVideoId = (url, platform) => {
  try {
    if (platform === "youtube") {
      // Handle different YouTube URL formats
      const patterns = [
        /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=))([\w-]{10,12})/,
        /^([\w-]{10,12})$/, // Direct video ID pattern
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

/**
 * Maps mime types to human-readable file types
 * @param {string} mimeType - The MIME type of the file
 * @returns {string} Human-readable file type
 */
export const getFileType = (mimeType) => {
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
    "image/webp": "WEBP",
    "image/gif": "GIF",
    "image/jpeg": "JPEG",
    "text/plain": "TXT",
    "application/zip": "ZIP",
    "application/json": "JSON",
    "audio/mpeg": "MP3",
  };

  return mimeMap[mimeType] || "Unknown"; // Default to "Unknown" if not found
};

/**
 * Processes profile photo data to create a displayable URL
 * @param {Object} userDetails - User details containing profile photo data
 * @returns {string|null} URL for profile photo or null if not available
 */
export const profilePhotoHandler = (userDetails) => {
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
