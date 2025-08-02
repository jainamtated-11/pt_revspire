import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const ContentPlaceHolderModal = ({ isOpen, onClose, contentPlaceHolders }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (contentPlaceHolders.length > 0) {
      setCurrentIndex(0);
    }
  }, [contentPlaceHolders]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentIndex < contentPlaceHolders.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const { contentName, placeholders } = contentPlaceHolders[currentIndex] || {};

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            Document Placeholders
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {contentPlaceHolders.length > 0 ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Placeholders for:
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p 
                    className="text-gray-800 font-medium truncate"
                    title={contentName}
                  >
                    {contentName}
                  </p>
                </div>
              </div>

              <div className="h-64 overflow-y-auto rounded-lg border border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {placeholders.map((placeholder, index) => (
                    <li 
                      key={index} 
                      className="p-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700">{placeholder}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Navigation */}
              {contentPlaceHolders.length > 1 && (
                <div className="flex justify-between pt-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      currentIndex === 0 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    Previous
                  </button>
                  <div className="text-xs text-gray-500 self-center">
                    {currentIndex + 1} of {contentPlaceHolders.length}
                  </div>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === contentPlaceHolders.length - 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      currentIndex === contentPlaceHolders.length - 1 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    Next
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No placeholders available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentPlaceHolderModal;