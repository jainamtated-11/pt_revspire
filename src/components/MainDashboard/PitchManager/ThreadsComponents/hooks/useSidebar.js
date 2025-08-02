import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to manage sidebar animations and state
 * @param {boolean} isOpen - Whether the sidebar is open
 * @param {Function} onClose - Function to call when closing the sidebar
 * @returns {Object} Sidebar state and handlers
 */
const useSidebar = (isOpen, onClose) => {
  const sidebarRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Set up animation and body overflow when sidebar opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Add a small delay to ensure the animation starts properly
      const timer = setTimeout(() => {
        document.body.style.overflow = "hidden"; // Prevent scrolling when sidebar is open
      }, 10);
      return () => {
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = ""; // Re-enable scrolling when sidebar is closed
    }
  }, [isOpen]);

  // Handle closing the sidebar with animation
  const handleCloseWithAnimation = () => {
    setIsAnimating(false);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 300); // Match this with your CSS transition duration
  };

  // Set up click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check for all possible modal/popup elements
      const isModalElement =
        event.target.closest(".content-modal") ||
        event.target.closest(".content-viewer") ||
        event.target.closest(".dsr-popup") ||
        event.target.closest('[role="dialog"]') ||
        event.target.closest(".fixed.inset-0") ||
        // Check if the click is on a close button
        event.target.closest('button[type="button"]') ||
        event.target.closest(".bg-red-500"); // Close button class

      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !isModalElement
      ) {
        handleCloseWithAnimation();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return {
    sidebarRef,
    isAnimating,
    setIsAnimating,
    handleCloseWithAnimation,
  };
};

export default useSidebar;
