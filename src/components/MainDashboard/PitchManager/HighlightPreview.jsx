import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { TbEdit } from "react-icons/tb";

function HighlightPreview({
  highlightVideos,
  previewIndex,
  setShowPreview,
  onTaglineUpdate, // New prop to handle tagline updates
  previewUrl,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTagline, setEditedTagline] = useState(
    highlightVideos[previewIndex]?.tagline || ""
  );

  const handleSaveTagline = () => {
    if (
      editedTagline.trim() &&
      editedTagline !== highlightVideos[previewIndex].tagline
    ) {
      onTaglineUpdate(previewIndex, editedTagline);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTagline(highlightVideos[previewIndex].tagline);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setEditedTagline(highlightVideos[previewIndex].tagline);
    setIsEditing(true);
  };

  // Early return if no video to preview
  if (!highlightVideos[previewIndex]?.url && !previewUrl) {
    console.log("getting returend from here ", previewUrl);
    return null;
  }

  return (
    <div className="border-2 p-2 rounded-md mt-1">
      <div className="relative w-[400px] h-[400px] mt-[20px]">
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-gray-500 bg-opacity-50">
          {/* Modal Container */}
          <div className="bg-white rounded-xl w-[600px] overflow-hidden">
            {/* Header with close button */}
            <div className="flex justify-end p-2 border-b">
              <button
                className="mt-1.5 mr-1 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowPreview(false)}
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-gray-500 text-xl"
                />
              </button>
            </div>

            {/* Video Player */}
            <div className="p-4">
              <video
                src={highlightVideos[previewIndex].url || previewUrl}
                controls
                autoPlay
                loop
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: "400px" }}
              />
            </div>

            {/* Tagline Section */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between bg-gray-100 border border-gray-300 rounded-md">
                <div className="flex items-center space-x-2 flex-1 border-neutral-400">
                  <span className="ml-2 truncate text-sm font-medium text-gray-900">
                    Video Tagline:
                  </span>
                  {isEditing ? (
                    <div className="flex items-center flex-1 space-x-2">
                      <input
                        type="text"
                        value={editedTagline}
                        onChange={(e) => setEditedTagline(e.target.value)}
                        className="flex-1 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                        autoFocus
                      />
                      {/* Save and Cancel buttons */}
                      <button
                        onClick={handleSaveTagline}
                        className="p-1.5 text-cyan-800"
                        title="Save"
                      >
                        <FontAwesomeIcon icon={faCheck} className="text-lg" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 text-red-500"
                        title="Cancel"
                      >
                        <FontAwesomeIcon icon={faXmark} className="text-lg" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-gray-900 px-3">
                        {highlightVideos[previewIndex].tagline}
                      </span>
                      {/* Edit button */}
                      <button
                        onClick={handleStartEditing}
                        className="p-2 text-cyan-800 hover:bg-cyan-50 rounded-full transition-colors"
                        title="Edit tagline"
                      >
                        <TbEdit className="text-xl" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HighlightPreview;
