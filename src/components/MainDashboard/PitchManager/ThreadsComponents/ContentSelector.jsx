import React from "react";
import { FaPlus } from "react-icons/fa";
import MainButton from "../../../../ui/MainButton";

/**
 * Content selector component for selecting content from a dropdown
 */
const ContentSelector = ({
  isDropdownVisible,
  setIsDropdownVisible,
  selectedTagline,
  handleItemClick,
  contentData,
  handleAddContentClick,
  loading,
  isReply = false,
}) => {
  return (
    <div className="relative mt-2">
      {/* Button to toggle dropdown */}
      {isDropdownVisible && (
        <button
          onClick={() => setIsDropdownVisible(!isDropdownVisible)}
          className="bg-gray-100 text-black font-semibold w-full py-2 px-4 rounded-md flex items-center justify-between"
        >
          {selectedTagline || "Select Content"}{" "}
          <span className="ml-2">{isDropdownVisible ? "▲" : "▼"}</span>
        </button>
      )}

      {/* Dropdown menu */}
      {isDropdownVisible && (
        <div className="relative bg-white border rounded shadow-lg mt-1 w-full z-10">
          <ul>
            {contentData.map((item) => (
              <li
                key={item.id}
                onClick={() => handleItemClick(item, isReply)}
                className="cursor-pointer hover:bg-gray-200 p-2"
                value={item.tagline}
              >
                {item.tagline}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Content Button */}
      <div className="flex justify-start mt-2">
        <MainButton
          onClick={() => handleAddContentClick(isReply)}
          variant="textBlue"
          disabled={loading}
          leftIcon={FaPlus}
        >
          Add Content
        </MainButton>
      </div>
    </div>
  );
};

export default ContentSelector;
