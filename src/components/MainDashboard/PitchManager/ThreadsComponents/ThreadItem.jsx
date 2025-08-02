import React, { useContext, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { parseCommentedBy, sortComments } from "./utils/threadUtils";
import CommentItem from "./CommentItem";
import ReplyForm from "./ReplyForm";
import { GlobalContext } from "../../../../context/GlobalState";

/**
 * Thread item component for displaying a thread and its comments in a chat-like interface
 */
const ThreadItem = ({
  thread,
  contentData,
  pitchData,
  replyToCommentId,
  replyText,
  setReplyText,
  handleAddReply,
  showReplyDropdown,
  setShowReplyDropdown,
  selectedTagline,
  handleItemClick,
  handleContentClick,
  selectedContentId,
  isLoading,
}) => {
  console.log("THREAD", thread);
  const threadCreator = parseCommentedBy(thread.thread.commented_by);
  const sortedComments = sortComments(thread.comments);
  const { selectedPitchContent } = useContext(GlobalContext);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "UK";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get random color based on name
  const getAvatarColor = (name) => {
    if (!name) return "#012a4a";
    const colors = ["#4a5d79", "#1a67a5", "#457b9d", "#1d3557"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Collapsed chat preview view
  if (!isExpanded) {
    return (
      <div
        className="mb-2 p-3 border rounded-lg bg-white shadow-sm hover:bg-gray-50 cursor-pointer transition-colors duration-150 ease-in-out"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 "
            style={{ backgroundColor: getAvatarColor(threadCreator.name) }}
          >
            {getInitials(threadCreator.name)}
          </div>

          <div className="ml-3 flex-grow overflow-hidden">
            <div className="font-medium">{threadCreator.name}</div>
            <div className="text-sm text-gray-600 truncate">
              {sortedComments.length > 0
                ? sortedComments[0].comment
                : "No messages yet"}
            </div>
          </div>

          <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {sortedComments.length > 0 && (
              <div>
                {new Date(sortedComments[0].created_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Expanded chat view
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-3 flex items-center sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => {
            setIsExpanded(false);
            setReplyText("");
          }}
          className="p-2 rounded-full hover:bg-gray-100 mr-2"
        >
          <FaArrowLeft />
        </button>

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: getAvatarColor(threadCreator.name) }}
        >
          {getInitials(threadCreator.name)}
        </div>

        <div className="ml-3">
          <div className="font-medium">{threadCreator.name}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        {/* Initial message */}
        {sortedComments.length > 0 && (
          <div className="flex mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-1"
              style={{
                backgroundColor: getAvatarColor(
                  parseCommentedBy(sortedComments[0].commented_by).name
                ),
              }}
            >
              {getInitials(
                parseCommentedBy(sortedComments[0].commented_by).name
              )}
            </div>

            <div className="ml-2 max-w-[80%]">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="font-medium text-sm">
                  {parseCommentedBy(sortedComments[0].commented_by).name}
                </div>
                <div className="text-gray-800 break-words">
                  {sortedComments[0].comment}
                </div>

                {/* Display referenced content if available for the first comment */}
                {sortedComments[0].pitch_content &&
                  (() => {
                    const contentItem = contentData.find(
                      (item) => item.id === sortedComments[0].pitch_content
                    );
                    const foundContent = pitchData.pitchSections
                      .flatMap((section) => section.contents)
                      .find((content) => content.id === contentItem?.id);

                    return contentItem ? (
                      <div className="mt-2">
                        <CommentItem
                          contentItem={contentItem}
                          foundContent={foundContent}
                          handleContentClick={handleContentClick}
                          isLoading={isLoading}
                        />
                      </div>
                    ) : null;
                  })()}
              </div>

              <div className="text-xs text-gray-500 mt-1 ml-2">
                {new Date(sortedComments[0].created_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        {sortedComments.slice(1).map((comment) => {
          const commentUser = parseCommentedBy(comment.commented_by);
          const isCurrentUser = commentUser.name === threadCreator.name;

          return (
            <div
              key={comment.id}
              className={`flex mb-4 ${isCurrentUser ? "justify-end" : ""}`}
            >
              {!isCurrentUser && (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-1"
                  style={{ backgroundColor: getAvatarColor(commentUser.name) }}
                >
                  {getInitials(commentUser.name)}
                </div>
              )}

              <div
                className={`max-w-[90%] min-w-[10%] ${
                  isCurrentUser ? "" : "ml-2"
                } ${isCurrentUser ? "mr-2" : ""}`}
                style={{ width: "fit-content" }}
              >
                <div
                  className={`p-3 rounded-lg shadow-sm ${
                    isCurrentUser ? "bg-secondary text-white" : "bg-white"
                  }`}
                >
                  {!isCurrentUser && (
                    <div className="font-medium text-sm">
                      {commentUser.name}
                    </div>
                  )}
                  <div className="break-words">{comment.comment}</div>

                  {/* Display referenced content if available */}
                  {comment.pitch_content &&
                    (() => {
                      const contentItem = contentData.find(
                        (item) => item.id === comment.pitch_content
                      );
                      const foundContent = pitchData.pitchSections
                        .flatMap((section) => section.contents)
                        .find((content) => content.id === contentItem?.id);

                      return contentItem ? (
                        <div
                          className={`mt-2 ${
                            isCurrentUser
                              ? "bg-white p-2 rounded text-black"
                              : ""
                          }`}
                        >
                          <CommentItem
                            contentItem={contentItem}
                            foundContent={foundContent}
                            handleContentClick={handleContentClick}
                            isLoading={isLoading}
                          />
                        </div>
                      ) : null;
                    })()}
                </div>

                <div
                  className={`text-xs text-gray-500 mt-1 ${
                    isCurrentUser ? "text-right mr-2" : "ml-2"
                  }`}
                >
                  {new Date(comment.created_at).toLocaleString()}
                </div>
              </div>

              {isCurrentUser && (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-1"
                  style={{ backgroundColor: getAvatarColor(commentUser.name) }}
                >
                  {getInitials(commentUser.name)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reply input at bottom */}
      {!replyToCommentId && (
        <div className="p-3 border-t bg-white">
          <ReplyForm
            replyText={replyText}
            setReplyText={setReplyText}
            showReplyDropdown={showReplyDropdown}
            setShowReplyDropdown={setShowReplyDropdown}
            selectedTagline={selectedTagline}
            contentData={contentData}
            handleItemClick={handleItemClick}
            handleAddReply={() =>
              handleAddReply(thread.thread.id, selectedPitchContent)
            }
            handleContentClick={handleContentClick}
            selectedContentId={selectedContentId}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default ThreadItem;
