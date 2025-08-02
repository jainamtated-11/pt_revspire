import React, { useContext, useEffect, useState, useRef } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  MessageSquare,
  MessageCircle,
} from "lucide-react";
import { fetchThreadsAsync } from "../../../features/thread/threadSlice.js";
import { formatDate } from "../../../constants.js";
import EmptyFolderComponent from "../ContentManager/ContentTable/EmptyFolderComponent.jsx";
import TableLoading from "../../MainDashboard/ContentManager/ContentTable/TableLoading";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import ThreadCrud from "../ThreadManager/ThreadCrud.jsx";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";
import HighlightText from "../../../utility/HighlightText.jsx";
import { useCookies } from "react-cookie";

const createHeaders = (headers) => {
  return headers.map((item) => ({
    header: item,
    accessorKey: item,
  }));
};

export default function ThreadTable({ group }) {
  const { viewer_id, baseURL, globalOrgId } = useContext(GlobalContext);

  const axiosInstance = useAxiosInstance();

  const threads = useSelector((state) => state.threads.threads);
  const loading = useSelector((state) => state.threads.loading);

  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  const [threadComments, setThreadComments] = useState([]);

  const [cookies] = useCookies(["userData", "revspireToken"]);
  const rawCookie = cookies?.userData;

  const dispatch = useDispatch();

  const [transformedPitchs, setTransformedPitchs] = useState([]);

  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    dispatch(
      fetchThreadsAsync({
        viewer_id: viewer_id,
        baseURL: baseURL,
        organisation_id: globalOrgId,
        group: group ? 1 : 0,
      })
    );
  }, [group]);

  useEffect(() => {
    if (searchApplied) {
      setTransformedPitchs(
        searchData.map((thread) => ({
          id: thread.pitch_id,
          title: thread.title,
          description: thread.description,
          created_by_name: thread.created_by_name,
          created_at: thread.pitch_created_at,
          updated_by_name: thread.updated_by_name,
          updated_at: thread.pitch_updated_at,
          threads: thread.threads,
          unread_thread_count: thread.unread_thread_count,
        }))
      );
    } else {
      setTransformedPitchs(
        threads.map((thread) => ({
          id: thread.pitch_id,
          title: thread.title,
          description: thread.description,
          created_by_name: thread.created_by_name,
          created_at: thread.pitch_created_at,
          updated_by_name: thread.updated_by_name,
          updated_at: thread.pitch_updated_at,
          threads: thread.threads,
          unread_thread_count: thread.unread_thread_count,
        }))
      );
    }
  }, [threads, searchApplied, searchData, searchValue]);

  useEffect(() => {
    dispatch(SetInitialData(threads));
    dispatch(SetSearchData(threads));
    dispatch(SetSearchTable("thread"));
    dispatch(SetSearchFields(["title", "description"]));
  }, [threads, dispatch, searchValue]);

  const [sortConfig, setSortConfig] = useState({
    key: "Updated At",
    direction: "desc",
  });
  const thRefs = useRef([]);
  const [resizing, setResizing] = useState(false);
  const [resizeIndex, setResizeIndex] = useState(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  const [expandedRow, setExpandedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  useEffect(() => {
    const sortedData = [...transformedPitchs].sort((a, b) => {
      const keyMap = {
        Title: "title",
        Description: "description",
        "Created By": "created_by_name",
        "Created At": "created_at",
        "Updated By": "updated_by_name",
        "Updated At": "updated_at",
      };

      const dataKey = keyMap[sortConfig.key];

      if (!dataKey) return 0;

      if (dataKey === "created_at" || dataKey === "updated_at") {
        const aValue = new Date(a[dataKey]);
        const bValue = new Date(b[dataKey]);
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      const aValue = (a[dataKey] || "").toString().toLowerCase();
      const bValue = (b[dataKey] || "").toString().toLowerCase();

      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    setTransformedPitchs(sortedData);
  }, [sortConfig]);

  const columnsHeading = [
    "Title",
    "Description",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
  ];
  const rowKeys = [
    "title",
    "description",
    "created_by_name",
    "created_at",
    "updated_by_name",
    "updated_at",
  ];

  const columns = createHeaders(columnsHeading);
  useEffect(() => {
    thRefs.current = thRefs.current.slice(0, columns.length);
  }, []);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-2 text-gray-500" />; // Default both arrows
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-2 text-gray-500" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-2 text-gray-500" />
    );
  };

  const handleResizeStart = (index, event) => {
    setResizing(true);
    setResizeIndex(index);
    setResizeStartX(event.pageX);
    setResizeStartWidth(thRefs.current[index]?.offsetWidth || 0);
  };

  const handleResizeMove = (event) => {
    if (!resizing || resizeIndex === null) return;

    const diff = event.pageX - resizeStartX;
    const newWidth = Math.max(resizeStartWidth + diff, 50);

    if (thRefs.current[resizeIndex]) {
      thRefs.current[resizeIndex].style.minWidth = `${newWidth}px`;
      thRefs.current[resizeIndex].style.width = `${newWidth}px`;
      thRefs.current[resizeIndex].style.maxWidth = `${newWidth}px`;
    }
  };

  const handleResizeEnd = (event) => {
    if (!resizing || resizeIndex === null) return;
    setResizing(false);
    setResizeIndex(null);
  };

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [resizing]);

  const handleRowClick = (row) => {
    const findThread = transformedPitchs.find((t) => t.id === row.id);
    if (findThread) {
      setExpandedRow(expandedRow?.id === findThread.id ? null : findThread);
    }
  };

  const fetchThreadComments = async (pitch_thread_id) => {
    try {
      setLoadingComments(true);
      const res = await axiosInstance.post(`/threads/get-thread-comments`, {
        pitch_thread_id: pitch_thread_id,
        organisation_id: globalOrgId,
        viewer_id: viewer_id,
      });

      if (!res.data) {
        throw new Error("No data received");
      }
      setThreadComments(res.data.comments);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoadingComments(false);
    }
  };

  const handleInnerRowClick = (threadItem, e) => {
    e.stopPropagation();
    setSelectedThreadId(threadItem.pitch_thread_id);
    fetchThreadComments(threadItem.pitch_thread_id);
    setIsModalOpen(true);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commented_by = JSON.stringify({
        name: rawCookie.user.first_name + " " + rawCookie.user.last_name,
        email: rawCookie.user.username,
        viewer_id: viewer_id,
      });

      const response = await axiosInstance.post("/respond-in-thread", {
        pitchThread: selectedThreadId,
        commentContent: newComment.trim(),
        commented_by,
        external_user: 0,
      });

      if (response.data) {
        await fetchThreadComments(selectedThreadId);
        setNewComment("");
        setSelectedThreadId(null);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setNewComment("");
      setSelectedThreadId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewComment("");
    setSelectedThreadId(null);
    setThreadComments([]);
  };

  const renderExpandedContent = (row) => {
    const threads = row.threads;
    if (!threads?.length) return null;

    return (
      <tr>
        <td colSpan={columnsHeading.length} className="bg-gray-200">
          <div className="pl-4 border-l-2 border-gray-300 my-1">
            {threads.map((threadItem) => (
              <div
                key={threadItem.pitch_thread_id}
                onClick={(e) => handleInnerRowClick(threadItem, e)}
                className={`grid grid-cols-[1fr,200px] items-center py-3 px-4 bg-gray-50 hover:bg-gray-100 
                           cursor-pointer border-b border-gray-200 transition-all duration-200 
                           mx-2 my-1 ${
                             threadItem.unread == 1 ? "font-semibold" : ""
                           }`}
              >
                <div className="min-w-0 flex items-center">
                  <p className="text-sm text-gray-700 line-clamp-1 px-2">
                    {threadItem.first_comment?.comment || "No comment"}
                  </p>
                  {threadItem.unread == 1 && (
                    <span className="text-sm text-theme-primary ml-2">
                      <MessageCircle className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 px-2">
                  {formatDate(threadItem.thread_created_at)}
                </div>
              </div>
            ))}
          </div>
        </td>
      </tr>
    );
  };

  const renderTableRow = (row, rowIndex) => (
    <tr
      className={`bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
        row.unread_thread_count == 1 ? "font-semibold" : ""
      }`}
      onClick={() => handleRowClick(row)}
    >
      {rowKeys?.map((column, index) => (
        <td
          key={`${row.id || rowIndex}-${column}`}
          className={`p-3 border-b ${index === 0 ? "flex items-center" : ""}`}
        >
          {index === 0 && (
            <svg
              className={`w-4 h-4 mr-2 transition-transform duration-200 ease-in-out text-gray-500 flex-shrink-0 ${
                expandedRow?.id === row.id ? "transform rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          <div className="truncate">
            {["created_at", "updated_at"].includes(column) ? (
              formatDate(row[column])
            ) : (
              <HighlightText text={row[column]} searchTerm={searchValue} />
            )}
          </div>
          {column === "title" && row.unread_thread_count == 1 && (
            <span className="ml-2 text-[#20a2b0DD]">
              <MessageSquare className="w-4 h-4" />
            </span>
          )}
        </td>
      ))}
    </tr>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 ml-auto py-2.5 pt-16">
        <TableLoading columns={columnsHeading.length} rows={7} />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 ml-auto py-2.5">
        <div className="flex justify-end">
          <ThreadCrud />
        </div>
        <div className="flex flex-col">
          <div className={`w-full relative border-2 rounded-md`}>
            <div className="overflow-auto max-h-[calc(100vh-200px)] scrollbar-thin">
              <table className="w-full table-fixed border-collapse relative">
                <thead className="sticky top-0 bg-gray-100 shadow-md z-10">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={column.accessorKey || index}
                        ref={(el) => (thRefs.current[index] = el)}
                        className="relative font-semibold text-left border-b overflow-hidden whitespace-nowrap hover:bg-gray-200 bg-gray-100"
                        style={{ width: "200px" }}
                      >
                        <div className="flex items-center justify-between overflow-hidden hover:bg-gray-200">
                          <button
                            onClick={() => handleSort(column.header)}
                            className="flex items-center justify-between w-full h-full p-3 text-left focus:outline-none transition-colors duration-200"
                          >
                            <span className="text-sm font-bold text-gray-700 capitalize truncate">
                              {column.header}
                            </span>
                            {getSortIcon(column.accessorKey)}
                          </button>
                        </div>
                        <div
                          className="absolute top-0 right-0 w-3 h-full cursor-col-resize group"
                          onMouseDown={(e) => handleResizeStart(index, e)}
                        >
                          <div
                            className={`absolute right-1 w-px h-full bg-gray-300 transition-all duration-200
                        ${
                          (resizing && resizeIndex === index) ||
                          "group-hover:bg-[#014d83] group-hover:w-1"
                        }
                        ${
                          resizing && resizeIndex === index
                            ? "bg-[#014d83] w-1.5"
                            : ""
                        }
                      `}
                          ></div>
                          <div className="absolute right-1 w-0.5 h-full bg-[#014d83] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-sans text-sm">
                  {transformedPitchs?.length === 0 ? (
                    <EmptyFolderComponent />
                  ) : (
                    transformedPitchs?.map((row, rowIndex) => (
                      <React.Fragment key={row.id || rowIndex}>
                        {console.log("Row", row)}
                        {renderTableRow(row, rowIndex)}
                        {expandedRow?.id === row.id &&
                          renderExpandedContent(row)}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-[500px] max-h-[80vh] flex flex-col dropdown-container">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Comments</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-[calc(100vh-350px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {loadingComments ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : threadComments.length === 0 ? (
                <div className="text-gray-500 text-xl font-bold tracking-wider text-center mt-8">
                  No comments found for this thread.
                </div>
              ) : (
                threadComments.map((comment) => {
                  let commentedBy;
                  try {
                    commentedBy = JSON.parse(comment.commented_by || "{}");
                  } catch (e) {
                    commentedBy = { name: "Unknown User", email: "" };
                  }

                  const userInitial = (commentedBy.name || "A")
                    .charAt(0)
                    .toUpperCase();

                  return (
                    <div
                      key={comment.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-[#20a2b0DD] flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {userInitial}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {commentedBy.name || "Unknown User"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {commentedBy.email || "No email provided"}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-400">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <div className="pl-11">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {comment.comment || "No comment content"}
                          </p>
                          {comment.external_user === 1 && (
                            <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              External User
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Form */}
            <div className="border-t border-gray-200 pt-4 mt-auto">
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 
                             focus:border-blue-500 resize-none text-sm placeholder-gray-400"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white 
                              bg-[#20a2b0DD] border border-transparent rounded-md shadow-sm 
                              hover:bg-[#1a8a96] focus:outline-none focus:ring-2 focus:ring-offset-2 
                              focus:ring-[#20a2b0DD] transition-colors duration-200 ease-in-out
                              ${
                                !newComment.trim()
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-[#1a8a96]"
                              }`}
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            </div>

            {/* Close button in header */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 
                       hover:text-gray-500 hover:bg-gray-100 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                       transition-colors duration-200 ease-in-out"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
