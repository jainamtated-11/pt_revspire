/**
 * Utility functions for the DSR component
 */

/**
 * Convert a buffer to a data URL
 * @param {Array} buffer - The buffer to convert
 * @param {string} type - The MIME type of the buffer
 * @returns {string} - The data URL
 */
export const bufferToDataUrl = (buffer, type = "image/png") => {
    const chunkSize = 8192;
    let base64String = "";
  
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      base64String += String.fromCharCode.apply(null, chunk);
    }
  
    return `data:${type};base64,${btoa(base64String)}`;
  };
  
  /**
   * Lighten a color by a given percentage
   * @param {string} hex - The hex color to lighten
   * @param {number} percent - The percentage to lighten by (0-100)
   * @returns {string} - The lightened color
   */
  export const lightenColor = (hex, percent) => {
    percent = Math.min(100, Math.max(0, percent));
    const num = parseInt(hex.replace("#", ""), 16);
    const R = (num >> 16) + Math.round((255 - (num >> 16)) * (percent / 100));
    const G =
      ((num >> 8) & 0x00ff) +
      Math.round((255 - ((num >> 8) & 0x00ff)) * (percent / 100));
    const B =
      (num & 0x0000ff) + Math.round((255 - (num & 0x0000ff)) * (percent / 100));
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  };
  
  /**
   * Set a meta tag in the document head
   * @param {string} attribute - The attribute to set (e.g., "name")
   * @param {string} key - The key to set (e.g., "description")
   * @param {string} content - The content to set
   */
  export const setMetaTag = (attribute, key, content) => {
    if (content) {
      let element = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    }
  };
  
  /**
   * Apply styles to video elements
   */
  export const applyStylesToWidget = () => {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.pause();
    });
  };
  