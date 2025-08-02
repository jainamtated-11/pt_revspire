import { useState } from "react";
import toast from "react-hot-toast";

/**
 * Custom hook to manage thread state and operations
 */
const useThreads = (
  threads,
  setThreads,
  pitchId,
  axiosInstance,
  refreshThreads,
  userName,
  userEmail,
  isExternalUser
) => {
  const [replyText, setReplyText] = useState(""); // State for reply text
  const [replyToCommentId, setReplyToCommentId] = useState(null); // State for the comment being replied to
  const [collapsedThreads, setCollapsedThreads] = useState({}); // State to track collapsed threads
  const [newCommentText, setNewCommentText] = useState(""); // State for new comment text
  const [isCreatingNewComment, setIsCreatingNewComment] = useState(false); // State to track if creating a new comment
  const [areAllThreadsCollapsed, setAreAllThreadsCollapsed] = useState(false); // State to track if all threads are collapsed
  const [newThreadId, setNewThreadId] = useState("");
  const [loading, setLoading] = useState(false);

  // Toggle collapse for a specific thread
  const toggleCollapse = (threadId) => {
    if (isCreatingNewComment) {
      toast.error("Comment can't be empty");
      return;
    }
    setCollapsedThreads((prev) => ({
      ...prev,
      [threadId]: !prev[threadId], // Toggle the collapsed state for the thread
    }));
  };

  // Toggle collapse for all threads
  const toggleAllCollapse = () => {
    setAreAllThreadsCollapsed((prev) => !prev);
    const newCollapsedState = {};
    threads.forEach((thread) => {
      newCollapsedState[thread.thread.id] = !areAllThreadsCollapsed; // Set all threads to the opposite of the current state
    });
    setCollapsedThreads(newCollapsedState);
  };

  // Collapse all threads
  const collapseAllThreads = () => {
    const newCollapsedState = {};
    threads.forEach((thread) => {
      newCollapsedState[thread.thread.id] = true; // Set all threads to collapsed
    });
    setCollapsedThreads(newCollapsedState); // Update the collapsed state
  };

  // Handle reply to a comment
  const handleReply = (commentId) => {
    if (isCreatingNewComment) {
      toast.error("You cannot reply while creating a new comment.");
      return;
    }
    setReplyToCommentId(commentId);
  };

  // Add a reply to a thread
  const handleAddReply = async (threadId, selectedPitchContent) => {
    if (replyText.trim() === "") {
      toast.error("Reply can't be empty");
      return;
    }

    const commentedByString = JSON.stringify({
      name: userName || "Demo User",
      email: userEmail || "demo@example.com",
    });

    const replyData = {
      pitchThread: threadId,
      commentContent: replyText,
      commented_by: commentedByString,
      external_user: isExternalUser ? 1 : 0,
      pitch_content: selectedPitchContent,
    };

    try {
      const response = await axiosInstance.post(
        "/respond-in-thread",
        replyData
      );

      // Create new reply with proper structure
      const newReply = {
        id: response.data.commentId || Date.now().toString(),
        comment: replyText,
        commented_by: commentedByString,
        external_user: isExternalUser ? 1 : 0,
        created_at: new Date().toISOString(),
        pitch_thread: threadId,
        pitch_content: selectedPitchContent,
      };

      // Update threads state with new reply
      setThreads((prevThreads) =>
        prevThreads.map((thread) => {
          if (thread.thread.id === threadId) {
            return {
              ...thread,
              comments: [...thread.comments, newReply],
            };
          }
          return thread;
        })
      );

      // toast.success('Reply added successfully!');

      // Optional: Refresh threads from backend to ensure consistency
      if (refreshThreads) {
        await refreshThreads();
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply. Please try again.");
    } finally {
      setReplyText(""); // Clear the reply text after adding
      setReplyToCommentId(null); // Reset the reply state
    }
  };

  // Create a new comment thread
  const handleNewComment = async (selectedContentId) => {
    if (newCommentText.trim() === "") {
      toast.error("Comment can't be empty");
      return;
    }

    const commentedByString = JSON.stringify({
      name: userName,
      email: userEmail,
    });

    const newThreadData = {
      pitch: pitchId,
      commentContent: newCommentText,
      commented_by: commentedByString,
      external_user: isExternalUser ? 1 : 0,
      pitch_content: selectedContentId,
    };

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/create-thread",
        newThreadData
      );

      const threadId = response.data.threadId;
      setNewThreadId(threadId);

      // Create new thread with proper structure matching backend format
      const newThread = {
        thread: {
          id: threadId,
          pitch: pitchId,
          commented_by: commentedByString,
          external_user: isExternalUser ? 1 : 0,
          created_at: new Date().toISOString(),
        },
        comments: [
          {
            id: response.data.commentId || Date.now().toString(), // Use backend ID if available
            comment: newCommentText,
            commented_by: commentedByString,
            external_user: isExternalUser ? 1 : 0,
            created_at: new Date().toISOString(),
            pitch_thread: threadId,
            pitch_content: selectedContentId,
          },
        ],
      };

      // Update threads state by adding new thread at the beginning
      setThreads((prevThreads) => {
        const updatedThreads = [newThread, ...prevThreads];
        return updatedThreads;
      });

      toast.success(`Thread created successfully`);
      setNewCommentText("");
      setIsCreatingNewComment(false);

      // Optional: Refresh threads from backend to ensure consistency
      if (refreshThreads) {
        await refreshThreads();
      }
    } catch (error) {
      console.error("Error creating thread:", error);
      toast.error("Failed to create thread. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    replyText,
    setReplyText,
    replyToCommentId,
    setReplyToCommentId,
    collapsedThreads,
    setCollapsedThreads,
    newCommentText,
    setNewCommentText,
    isCreatingNewComment,
    setIsCreatingNewComment,
    areAllThreadsCollapsed,
    setAreAllThreadsCollapsed,
    newThreadId,
    setNewThreadId,
    loading,
    setLoading,
    toggleCollapse,
    toggleAllCollapse,
    collapseAllThreads,
    handleReply,
    handleAddReply,
    handleNewComment,
  };
};

export default useThreads;
