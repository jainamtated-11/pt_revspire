import { useContext } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { X } from "lucide-react";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../context/GlobalState";

// Custom hooks
import useSidebar from "./ThreadsComponents/hooks/useSidebar";
import useUserInfo from "./ThreadsComponents/hooks/useUserInfo";
import useThreads from "./ThreadsComponents/hooks/useThreads";
import useContent from "./ThreadsComponents/hooks/useContent";

// Components
import ThreadItem from "./ThreadsComponents/ThreadItem";
import NewThreadForm from "./ThreadsComponents/NewThreadForm";

// Utilities
import {
  filterThreads,
  sortThreads,
} from "./ThreadsComponents/utils/threadUtils";

const ThreadsDropdown = ({
  isOpen,
  onClose,
  threads,
  setThreads,
  refreshThreads,
  pitchId,
  pitchData,
  contentData,
  setFullscreenBlobUrl,
  handleOnClickContent,
}) => {
  const { viewer_id } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  // Use custom hooks
  const { sidebarRef, isAnimating, handleCloseWithAnimation } = useSidebar(
    isOpen,
    onClose
  );

  const { userName, userEmail, isExternalUser, getUserInfo } = useUserInfo();

  const {
    replyText,
    setReplyText,
    replyToCommentId,
    collapsedThreads,
    newCommentText,
    setNewCommentText,
    isCreatingNewComment,
    setIsCreatingNewComment,
    loading,
    toggleCollapse,
    collapseAllThreads,
    handleReply,
    handleAddReply,
    handleNewComment,
  } = useThreads(
    threads,
    setThreads,
    pitchId,
    axiosInstance,
    refreshThreads,
    userName,
    userEmail,
    isExternalUser
  );

  const {
    showNewThreadDropdown,
    setShowNewThreadDropdown,
    showReplyDropdown,
    setShowReplyDropdown,
    isAddContentClicked,
    selectedContentId,
    selectedPitchContentId,
    selectedTagline,
    setSelectedTagline,
    handleAddContentClick,
    handleItemClick,
    handleContentClick: handleContentClickInternal,
    resetContentState,
    isLoading,
  } = useContent(
    axiosInstance,
    viewer_id,
    setFullscreenBlobUrl,
    handleOnClickContent
  );

  if (!isOpen) return null;

  // Get user info and apply filtering/sorting
  const userInfo = getUserInfo();
  const filteredThreads = userInfo
    ? filterThreads(
        threads,
        userInfo.email,
        userInfo.isCompanyMail,
        isExternalUser
      )
    : threads;
  const sortedThreads = sortThreads(filteredThreads);

  /**
   * Handle content click to view content
   * @param {string} contentId - ID of the content to view
   */
  const handleContentClick = (contentId) => {
    handleContentClickInternal(contentId, pitchData);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isAnimating ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleCloseWithAnimation}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        } w-full md:w-[500px]`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl text-secondary font-semibold hover:bg-white cursor-default">
            Threads
          </h2>
          <button
            onClick={handleCloseWithAnimation}
            className="p-2 rounded-full hover:bg-gray-100 text-secondary"
          >
            <X size={24} />
          </button>
        </div>

        <div className="max-h-[calc(100vh-64px)] overflow-y-auto py-2 px-4">
          {/* New Comment Button */}
          <div className="flex items-center mb-4">
            <button
              onClick={() => {
                if (isCreatingNewComment) {
                  setIsCreatingNewComment(false);
                  setNewCommentText("");
                  resetContentState();
                } else {
                  setIsCreatingNewComment(true);
                  setNewCommentText("");
                  collapseAllThreads();
                  resetContentState();
                }
              }}
              className={`flex items-center rounded-md px-4 py-2 hover:bg-white ${
                isCreatingNewComment
                  ? "text-red-600 border-red-600"
                  : "text-secondary border-secondary"
              } border-2`}
            >
              {isCreatingNewComment ? (
                <FaTimes className="mr-2" />
              ) : (
                <FaPlus className="mr-2" />
              )}
              {isCreatingNewComment ? "Cancel" : "New Thread"}
            </button>
          </div>

          {/* New Comment Input */}
          {isCreatingNewComment && (
            <NewThreadForm
              newCommentText={newCommentText}
              setNewCommentText={setNewCommentText}
              showNewThreadDropdown={showNewThreadDropdown}
              setShowNewThreadDropdown={setShowNewThreadDropdown}
              selectedTagline={selectedTagline}
              setSelectedTagline={setSelectedTagline}
              contentData={contentData}
              handleItemClick={(item, isReply) =>
                handleItemClick(item, isReply, pitchData)
              }
              handleNewComment={() => handleNewComment(selectedPitchContentId)}
              loading={loading}
              handleContentClick={handleContentClick}
              selectedContentId={selectedContentId}
              isLoading={isLoading}
            />
          )}

          {/* Display threads */}
          {sortedThreads.length === 0 ? (
            <div className="text-gray-500 text-xl font-bold tracking-wider text-center mt-8">
              No threads available.
            </div>
          ) : (
            sortedThreads.map((thread) => (
              <ThreadItem
                key={thread.thread.id}
                thread={thread}
                contentData={contentData}
                pitchData={pitchData}
                handleReply={handleReply}
                replyToCommentId={replyToCommentId}
                replyText={replyText}
                setReplyText={setReplyText}
                handleAddReply={handleAddReply}
                isAddContentClicked={isAddContentClicked}
                showReplyDropdown={showReplyDropdown}
                setShowReplyDropdown={setShowReplyDropdown}
                selectedTagline={selectedTagline}
                handleItemClick={(item, isReply) =>
                  handleItemClick(item, isReply, pitchData)
                }
                handleAddContentClick={handleAddContentClick}
                handleContentClick={handleContentClick}
                collapsedThreads={collapsedThreads}
                toggleCollapse={toggleCollapse}
                selectedContentId={selectedContentId}
                isLoading={isLoading}
              />
            ))
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default ThreadsDropdown;
