import {
  FaTimes,
  FaSpinner,
  FaPaperPlane,
  FaPaperclip,
  FaEye,
} from "react-icons/fa";

/**
 * Form component for creating new threads
 */
const NewThreadForm = ({
  newCommentText,
  setNewCommentText,
  showNewThreadDropdown,
  setShowNewThreadDropdown,
  selectedTagline,
  setSelectedTagline,
  contentData,
  handleItemClick,
  handleNewComment,
  loading,
  handleContentClick,
  selectedContentId,
  isLoading,
}) => {

  const handleViewContent = () => {
    handleContentClick(selectedContentId);
  };

  const handleClearContent = () => {
    // Clear the selected tagline (content)
    setSelectedTagline("");
  };

  const handleSubmitThread = () => {
    handleNewComment();
    // Clear text and content after submission
    setNewCommentText("");
    setSelectedTagline("");
    // The form will be hidden by parent component after submission
  };

  return (
    <div className="mb-4 relative">
      <div className="relative border rounded-xl p-2 bg-white flex items-center">
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Type your reply here..."
          className="w-full p-2 border-none focus:outline-none resize-none"
          rows="2"
        />
        <div className="flex items-center space-x-2 ml-2">
          {/* Toggle content dropdown button */}
          <button
            onClick={() => setShowNewThreadDropdown(!showNewThreadDropdown)}
            className="text-secondary p-2 rounded-full hover:bg-gray-100"
            title="Add content"
          >
            <FaPaperclip />
          </button>

          {/* Submit button */}
          <button
            onClick={handleSubmitThread}
            disabled={loading}
            className="text-secondary p-2 rounded-full hover:bg-gray-100"
            title="Send reply"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>

      {/* Selected Content Display */}
      {selectedTagline && (
        <div className="flex items-center bg-gray-100 text-black rounded-md px-3 py-1 mt-2 w-max">
          <span>{selectedTagline}</span>
          <button
            onClick={handleViewContent}
            className={`ml-2 ${
              isLoading
                ? "text-gray-400 cursor-not-allowed"
                : "text-secondary hover:bg-white"
            }`}
            title="View content"
            disabled={isLoading}
          >
            {isLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaEye />
            )}
          </button>
          <button
            onClick={handleClearContent}
            className="ml-2 text-red-500 hover:text-red-700"
            title="Remove content"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Dropdown for pitch content selection directly below textarea */}
      {showNewThreadDropdown && (
        <div className="bg-white border rounded shadow-lg mt-1 w-full z-10 p-2">
          <ul>
            {contentData.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  handleItemClick(item, false);
                  setShowNewThreadDropdown(false);
                }}
                className="cursor-pointer hover:bg-gray-200 p-2"
              >
                {item.tagline}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NewThreadForm;
