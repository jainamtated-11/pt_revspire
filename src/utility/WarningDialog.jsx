import React, { useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { LuLoaderCircle } from "react-icons/lu";
import { GlobalContext } from "../context/GlobalState.jsx";

const WarningDialog = ({
  title,
  content,
  onConfirm,
  onCancel,
  onEnter,
  modalRef,
  isLoading,
  confrimMessage = "Confirm",
}) => {
  const { isDarkMode } = useContext(GlobalContext);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && onEnter) {
        onEnter();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onEnter]);

  console.log("isLoading in Warning Dialog", isLoading);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-sky-700 dark:text-sky-400 mr-2"
            />
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{content}</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LuLoaderCircle className="animate-spin h-5 w-5 inline" />
              ) : (
                confrimMessage
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarningDialog;
