import { getIcon } from "./utils/contentUtils";
import { useState } from "react";

/**
 * Content item displayed in comments
 */
const CommentItem = ({
  contentItem,
  foundContent,
  handleContentClick,
  isLoading: globalIsLoading,
}) => {
  const [localLoading, setLocalLoading] = useState(false);

  // Either component is loading if global loading state is true OR local loading is true
  const isLoading = globalIsLoading || localLoading;

  const handleViewContent = () => {
    if (!isLoading && handleContentClick) {
      setLocalLoading(true); // Set local loading state to true when clicked

      // Call the handler and handle the promise
      Promise.resolve(handleContentClick(contentItem.content))
        .catch((error) => console.error("Error viewing content:", error))
        .finally(() => {
          // Only reset local loading state, not global
          setLocalLoading(false);
        });
    }
  };

  return (
    <div
      className={`flex items-center bg-white border text-black rounded-md px-3 py-1 mt-2 w-max ${
        isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
      onClick={isLoading ? undefined : handleViewContent}
    >
      <div className="mr-2">{getIcon(foundContent)}</div>
      <span>{contentItem.tagline}</span>
    </div>
  );
};

export default CommentItem;
