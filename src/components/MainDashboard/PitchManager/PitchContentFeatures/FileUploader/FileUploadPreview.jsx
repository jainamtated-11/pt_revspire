import { useState, useContext, useEffect, useMemo } from "react";
import {
  FaEdit,
  FaDownload,
  FaTrash,
  FaPlus,
  FaYoutube,
  FaSpinner,
} from "react-icons/fa";
import { SiVimeo } from "react-icons/si";
import { FaLink } from "react-icons/fa";
import useAxiosInstance from "../../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../../context/GlobalState";
import { useCookies } from "react-cookie";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FaGripVertical } from "react-icons/fa6";
import axios from "axios";
import toast from "react-hot-toast";
import AddContentModal from "./AddContentModal";

function FileUploadPreview({ data, hexColor, contentId, content, onClickContentHandler }) {
  const { viewer_id, organisation_id, baseURL } = useContext(GlobalContext);
  const [cookies] = useCookies([
    "revspireClient",
    "userData",
    "publicPitchContact",
    "revspireToken"
  ]);
  const token = cookies.revspireToken;
  const [userInfo, setUserInfo] = useState({
    fullName: "Unknown User",
    email: "unknown@example.com",
    isInternal: 0,
  });
  useEffect(() => {
    if (!cookies.revspireClient) {
      setUserInfo({
        fullName:
          `${cookies.userData.user.first_name} ${cookies.userData.user.last_name}`.trim(),
        email: cookies.userData.user.username,
        isInternal: 1,
      });
    } else {
      setUserInfo({
        fullName: cookies.publicPitchContact.full_name,
        email: cookies.publicPitchContact.email,
        isInternal: 0,
      });
    }
  }, []);

  console.log("USER INFOR ", userInfo);

  const axiosInstance = useAxiosInstance();

  const [componentState, setComponentState] = useState({
    parameters: {
      Type: "FileUploader",
      contents: [],
    },
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // For inline editing
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  // Add new state for editing base and extension
  const [editingBase, setEditingBase] = useState("");
  const [editingExt, setEditingExt] = useState("");

  // Auto-save function that calls edit-feature endpoint
  const autoSave = async (updatedState) => {
    try {
      const payload = {
        parameters: updatedState.parameters,
        name: componentState.name,
        description: componentState.description,
        organisation_id: organisation_id,
        viewer_id: viewer_id,
        content_id: contentId,
      };

      await axiosInstance.post("/pitch-content-feature/edit-feature", payload);
      console.log("Auto-saved successfully");
    } catch (error) {
      console.error("Auto-save error:", error);
      toast.error("Failed to save changes");
    }
  };

  // Drag-and-drop reorder handler with auto-save
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const updated = Array.from(componentState.parameters.contents);
    const [removed] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, removed);

    const newState = {
      ...componentState,
      parameters: {
        ...componentState.parameters,
        contents: updated,
      },
    };

    setComponentState(newState);
    autoSave(newState);
  };

  const handleRowSelect = (contentId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(contentId)) {
      newSelected.delete(contentId);
    } else {
      newSelected.add(contentId);
    }
    setSelectedRows(newSelected);
    setSelectAll(
      newSelected.size === componentState.parameters.contents.length &&
      componentState.parameters.contents.length > 0
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(
        componentState.parameters.contents.map((content) => content.content_id)
      );
      setSelectedRows(allIds);
      setSelectAll(true);
    }
  };

  const getFileIcon = (fileName, source) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (source == "youtube") {
      return (
        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
          <FaYoutube className="w-4 h-4 text-red-500" />
        </div>
      );
    } else if (source == "vimeo") {
      return (
        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
          <SiVimeo className="w-4 h-4 text-blue-500" />
        </div>
      );
    }
    else if (source == "Public URL") {
      return (
        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
          <FaLink className="w-4 h-4 text-green-500" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
        {extension?.toUpperCase() || "FILE"}
      </div>
    );
  };

  // Handle inline editing with auto-save
  const handleInlineEdit = (contentId, newValue) => {
    const newState = {
      ...componentState,
      parameters: {
        ...componentState.parameters,
        contents: componentState.parameters.contents.map((c) =>
          c.content_id === contentId ? { ...c, file_name: newValue } : c
        ),
      },
    };

    setComponentState(newState);
    autoSave(newState);
    setEditingId(null);
  };

  // Handle individual file deletion with auto-save
  const handleIndividualDelete = (contentId) => {
    const newState = {
      ...componentState,
      parameters: {
        ...componentState.parameters,
        contents: componentState.parameters.contents.filter(
          (c) => c.content_id !== contentId
        ),
      },
    };

    setComponentState(newState);
    autoSave(newState);
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(contentId);
      return newSet;
    });
  };

  const safeHexColor =
    hexColor && !hexColor.startsWith("#") ? `#${hexColor}` : hexColor;

  // Parse data prop safely and only when it changes
  const parsedData = useMemo(() => {
    if (!data) return { Type: "FileUploader", contents: [] };
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return { Type: "FileUploader", contents: [] };
      }
    }
    return data;
  }, [data]);
  // Initialize component state from parsedData only when it changes
  useEffect(() => {
    setComponentState({
      description: content?.content_description,
      name: content?.tagline,
      parameters: {
        Type: parsedData.Type || "FileUploader",
        contents: parsedData.contents || [],
      },
    });
  }, [parsedData]);

  const [isContentLoading, setIsContentLoading] = useState(false);

  const onContentClick = async (originalContent) => {
    // Rename keys at the beginning
    const content = {
      ...originalContent,
      content_source: originalContent.source,
      content_link: originalContent.contentLink,
    };

    const publicSources = ["youtube", "vimeo", "canva link", "microsoft stream", "public url"];
    const source = (content.content_source || "").trim().toLowerCase();
    const isPublicSource = publicSources.includes(source);

    if (!isPublicSource) {
      const blobMimeTypes = [
        "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp",
        "video/mp4", "video/webm", "video/ogg",
        "application/pdf"
      ];
      let contentUrl = null;
      try {
        setIsContentLoading(true);
        const response = await axiosInstance.post(
          "/open-content",
          {
            viewerId: viewer_id,
            contentId: content.content_id,
            manual_token: token,
          },
          {
            responseType: blobMimeTypes.includes(content.mimetype) ? "blob" : "json",
            withCredentials: true,
          }
        );
        if (blobMimeTypes.includes(content.mimetype)) {
          contentUrl = URL.createObjectURL(response.data);
        } else {
          contentUrl = response.data.sasUrl;
        }
        onClickContentHandler(
          content,
          contentUrl,
          content.mimetype,
          content.file_name
        );
      } catch (error) {
        console.error("Error opening content:", error);
      } finally {
        setIsContentLoading(false);
      }
    } else {
      // For public sources, just use the content_link directly
      onClickContentHandler(
        content,
        content.content_link,
        content.mimetype,
        content.file_name
      );
    }
  };



  // Restore download logic
  const handleDownloadFiles = (contentIds, fileNames = []) => {
    if (!contentIds || contentIds.length === 0) return;

    const idsParameter = `contentIds=${contentIds.join(",")}&viewerId=${viewer_id}`;

    const promise = new Promise((resolve, reject) => {
      (async () => {
        try {
          const instance = axios.create();
          instance.interceptors.response.use((response) => {
            resolve("File downloaded successfully!");
            return response;
          });

          const response = await instance.get(
            `${baseURL}/download-files?${idsParameter}`,
            {
              responseType: "blob",
              withCredentials: true,
            }
          );

          const fileName =
            contentIds.length === 1 && fileNames.length === 1
              ? fileNames[0]
              : "downloaded_files";

          const contentType = response.headers["content-type"];
          let fileExtension = "";
          switch (contentType) {
            case "application/zip":
              fileExtension = ".zip";
              break;
            case "application/pdf":
              fileExtension = ".pdf";
              break;
          }

          const blob = response.data;
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = `${fileName}${fileExtension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error(error);
          reject("Download failed!");
        }
      })();
    });

    toast.promise(promise, {
      loading: "Downloading files...",
      success: (msg) => `${msg}`,
      error: (err) => `Failed: ${err}`,
    });
  };

  const handleDownload = () => {
    if (selectedRows.size === 0) return;

    const localContents = componentState.parameters.contents.filter(
      (c) =>
        selectedRows.has(c.content_id) && (c.source === "Local Drive")
    );

    const ids = localContents.map((c) => c.content_id);
    const names = localContents.map((c) => c.file_name);

    if (ids.length === 0) return;
    handleDownloadFiles(ids, names);
  };

  // Restore handleDelete function
  const handleDelete = () => {
    if (selectedRows.size === 0) return;

    const newState = {
      ...componentState,
      parameters: {
        ...componentState.parameters,
        contents: componentState.parameters.contents.filter(
          (content) => !selectedRows.has(content.content_id)
        ),
      },
    };

    setComponentState(newState);
    autoSave(newState);
    setSelectedRows(new Set());
    setSelectAll(false);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-full bg-white rounded-lg border border-gray-200 relative">
        {/* Loader Overlay */}
        {isContentLoading && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
            <FaSpinner className="animate-spin w-12 h-12 text-white" />
          </div>
        )}
        {/* Header - simplified without title editing */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={selectedRows.size === 0}
              className={`p-2 border border-gray-300 rounded transition-colors ${selectedRows.size === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <FaDownload className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={selectedRows.size === 0}
              className={`p-2 border border-gray-300 rounded transition-colors ${selectedRows.size === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-red-500"
                }`}
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 font-bold hover:underline"
            style={{ color: safeHexColor }}
          >
            <FaPlus className="w-4 h-4" style={{ color: safeHexColor }} />
            Add Files & Links
          </button>
        </div>

        {/* Desktop Table Container */}
        <div className="hidden sm:block overflow-auto">
          <div className="bg-gray-50 rounded-lg overflow-hidden m-4">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3 pt-1 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="ml-7 w-4 h-4 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                      style={{
                        color: safeHexColor,
                        backgroundColor: selectAll ? safeHexColor : 'white',
                        borderColor: selectAll ? safeHexColor : '#d1d5db', // gray-300
                        '--tw-ring-color': safeHexColor, // For focus ring
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 pt-1 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    NAME
                  </th>
                  <th className="px-4 py-3 pt-1 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    OWNER
                  </th>
                  <th className="px-4 py-3 pt-1 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    ADDED BY
                  </th>
                  <th className="w-32 px-4 py-3 pt-1"></th>
                </tr>
              </thead>
              <Droppable droppableId="fileuploader-preview-table">
                {(provided) => (
                  <tbody
                    className="bg-white divide-y divide-gray-200"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {componentState.parameters.contents.map(
                      (content, index) => (
                        <Draggable
                          key={content.content_id}
                          draggableId={content.content_id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.5 : 1,
                              }}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center">
                                  <span
                                    {...provided.dragHandleProps}
                                    className="cursor-grab align-middle"
                                  >
                                    <FaGripVertical className="inline-block text-gray-400" />
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={selectedRows.has(content.content_id)}
                                    onChange={() => handleRowSelect(content.content_id)}
                                    className="w-4 h-4 rounded-md border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer ml-3"
                                    style={{
                                      color: safeHexColor,
                                      backgroundColor: selectedRows.has(content.content_id) ? safeHexColor : 'white',
                                      borderColor: selectedRows.has(content.content_id) ? safeHexColor : '#d1d5db', // gray-300
                                      '--tw-ring-color': safeHexColor, // For focus ring
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-3">
                                  {getFileIcon(
                                    content.file_name,
                                    content.source
                                  )}
                                  {editingId === content.content_id ? (
                                    (() => {
                                      // Split filename into base and extension
                                      let base = editingBase;
                                      let ext = editingExt;
                                      if (editingId === content.content_id && editingBase === "" && editingExt === "") {
                                        const lastDot = content.file_name.lastIndexOf(".");
                                        if (lastDot !== -1) {
                                          base = content.file_name.slice(0, lastDot);
                                          ext = content.file_name.slice(lastDot);
                                        } else {
                                          base = content.file_name;
                                          ext = "";
                                        }
                                        setEditingBase(base);
                                        setEditingExt(ext);
                                      }
                                      return (
                                        <span className="flex items-center">
                                          <input
                                            className="text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                            value={editingBase}
                                            autoFocus
                                            onChange={(e) => setEditingBase(e.target.value)}
                                            onBlur={() => {
                                              handleInlineEdit(
                                                content.content_id,
                                                editingBase + editingExt
                                              );
                                              setEditingId(null);
                                              setEditingBase("");
                                              setEditingExt("");
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                handleInlineEdit(
                                                  content.content_id,
                                                  editingBase + editingExt
                                                );
                                                setEditingId(null);
                                                setEditingBase("");
                                                setEditingExt("");
                                              } else if (e.key === "Escape") {
                                                setEditingId(null);
                                                setEditingBase("");
                                                setEditingExt("");
                                              }
                                            }}
                                            style={{ minWidth: 120, maxWidth: 350, width: Math.max(120, editingBase.length * 10) }}
                                          />
                                          <span className="ml-1 text-gray-500 select-none">{editingExt}</span>
                                        </span>
                                      );
                                    })()
                                  ) : (
                                    <>
                                      <span className="text-sm text-gray-900 cusor-pointer" onClick={() => onContentClick(content)}>
                                        <p className="cursor-pointer">{content.file_name}</p>

                                      </span>
                                      <button
                                        className="ml-1 p-0.5 text-gray-400 hover:text-gray-600"
                                        onClick={() => {
                                          setEditingId(content.content_id);
                                          setEditingValue(content.file_name);
                                        }}
                                      >
                                        <FaEdit className="w-3 h-3" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                    title={content.created_by_name}>
                                    {content.created_by_name.charAt(0)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                <p className={`text-xs px-2 py-1 rounded-full hidden sm:inline-block ${content.internal === 1 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                                  {content.internal === 1 ? "Internal" : "External"}
                                </p>
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                    disabled={
                                      content.source !== "Local Drive"
                                    }
                                    onClick={() => {
                                      if (content.source === "Local Drive") {
                                        handleDownloadFiles(
                                          [content.content_id],
                                          [content.file_name]
                                        );
                                      }
                                    }}
                                  >
                                    <FaDownload className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="p-1 text-gray-400 hover:text-red-500"
                                    onClick={() =>
                                      handleIndividualDelete(content.content_id)
                                    }
                                  >
                                    <FaTrash className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      )
                    )}

                    {/* Add Files & Links Row */}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          {/* Mobile Header with Select All */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                style={{
                  color: safeHexColor,
                  backgroundColor: selectAll ? safeHexColor : 'white',
                  borderColor: selectAll ? safeHexColor : '#d1d5db',
                  '--tw-ring-color': safeHexColor,
                }}
              />
              <span className="text-sm font-medium text-gray-600">Select All</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                disabled={selectedRows.size === 0}
                className={`p-2 border border-gray-300 rounded transition-colors ${
                  selectedRows.size === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaDownload className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                disabled={selectedRows.size === 0}
                className={`p-2 border border-gray-300 rounded transition-colors ${
                  selectedRows.size === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:text-red-500"
                }`}
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Column Headers */}
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-4"></div> {/* Space for drag handle */}
              <div className="w-4"></div> {/* Space for checkbox */}
              <div className="w-8"></div> {/* Space for file icon */}
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">NAME</span>
            </div>
            <div className="flex items-center space-x-1 text-xs font-medium text-gray-600 uppercase tracking-wider">
              <span>ADDED BY</span>
              <span>OWNER</span>
              <div className="w-6"></div> {/* Space for actions */}
            </div>
          </div>

          {/* Mobile File List */}
          <Droppable droppableId="fileuploader-preview-mobile">
            {(provided) => (
              <div
                className="divide-y divide-gray-200"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {componentState.parameters.contents.map((content, index) => (
                  <Draggable
                    key={content.content_id}
                    draggableId={content.content_id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.5 : 1,
                        }}
                        className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                      >
                        {/* Left side: Drag handle, Checkbox, File icon, File name */}
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span
                            {...provided.dragHandleProps}
                            className="cursor-grab text-gray-400 flex-shrink-0"
                          >
                            <FaGripVertical className="w-4 h-4" />
                          </span>
                          <input
                            type="checkbox"
                            checked={selectedRows.has(content.content_id)}
                            onChange={() => handleRowSelect(content.content_id)}
                            className="w-4 h-4 rounded-md border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer flex-shrink-0"
                            style={{
                              color: safeHexColor,
                              backgroundColor: selectedRows.has(content.content_id)
                                ? safeHexColor
                                : 'white',
                              borderColor: selectedRows.has(content.content_id)
                                ? safeHexColor
                                : '#d1d5db',
                              '--tw-ring-color': safeHexColor,
                            }}
                          />
                          <div className="flex-shrink-0">
                            {getFileIcon(content.file_name, content.source)}
                          </div>
                          <div className="flex-1 min-w-0">
                            {editingId === content.content_id ? (
                              (() => {
                                let base = editingBase;
                                let ext = editingExt;
                                if (editingId === content.content_id && editingBase === "" && editingExt === "") {
                                  const lastDot = content.file_name.lastIndexOf(".");
                                  if (lastDot !== -1) {
                                    base = content.file_name.slice(0, lastDot);
                                    ext = content.file_name.slice(lastDot);
                                  } else {
                                    base = content.file_name;
                                    ext = "";
                                  }
                                  setEditingBase(base);
                                  setEditingExt(ext);
                                }
                                return (
                                  <span className="flex items-center">
                                    <input
                                      className="text-xs border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                                      value={editingBase}
                                      autoFocus
                                      onChange={(e) => setEditingBase(e.target.value)}
                                      onBlur={() => {
                                        handleInlineEdit(
                                          content.content_id,
                                          editingBase + editingExt
                                        );
                                        setEditingId(null);
                                        setEditingBase("");
                                        setEditingExt("");
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleInlineEdit(
                                            content.content_id,
                                            editingBase + editingExt
                                          );
                                          setEditingId(null);
                                          setEditingBase("");
                                          setEditingExt("");
                                        } else if (e.key === "Escape") {
                                          setEditingId(null);
                                          setEditingBase("");
                                          setEditingExt("");
                                        }
                                      }}
                                      style={{
                                        minWidth: 80,
                                        maxWidth: 200,
                                        width: Math.max(80, editingBase.length * 8),
                                      }}
                                    />
                                    <span className="ml-1 text-gray-500 select-none text-xs">
                                      {editingExt}
                                    </span>
                                  </span>
                                );
                              })()
                            ) : (
                              <div className="flex items-center space-x-1">
                                <span
                                  className="text-xs text-gray-900 cursor-pointer truncate"
                                  onClick={() => onContentClick(content)}
                                >
                                  {content.file_name}
                                </span>
                                <button
                                  className="p-0.5 text-gray-400 hover:text-gray-600 flex-shrink-0"
                                  onClick={() => {
                                    setEditingId(content.content_id);
                                    setEditingValue(content.file_name);
                                  }}
                                >
                                  <FaEdit className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right side: Internal/External badge, Owner avatar, Download, Delete */}
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {/* Internal/External Badge */}
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              content.internal === 1
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {content.internal === 1 ? "Internal" : "External"}
                          </span>

                          {/* Owner Avatar */}
                          <div
                            className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                            title={content.created_by_name}
                          >
                            {content.created_by_name.charAt(0)}
                          </div>

                          {/* Download Button */}
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={content.source !== "Local Drive"}
                            onClick={() => {
                              if (content.source === "Local Drive") {
                                handleDownloadFiles(
                                  [content.content_id],
                                  [content.file_name]
                                );
                              }
                            }}
                          >
                            <FaDownload className="w-3 h-3" />
                          </button>

                          {/* Delete Button */}
                          <button
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            onClick={() => handleIndividualDelete(content.content_id)}
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Add Content Modal */}
        <AddContentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          hexColor={safeHexColor}
          onLocalUpload={async (files) => {
            // Logic from handleLocalUpload
            if (!files || files.length === 0) {
              alert("Please select files to upload");
              return;
            }
            setIsLoading(true);
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
              formData.append("files", files[i]);
            }
            formData.append("created_by", viewer_id);
            formData.append("description", "Content");
            formData.append("folder", "");
            formData.append("viewer_id", viewer_id);
            formData.append("organisation_id", organisation_id);
            formData.append("direct_pitch_content", 1);
            try {
              const response = await axiosInstance.post("/local-upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
              });
              if (response.data && response.data.uploadedFiles) {
                const newContents = response.data.uploadedFiles.map((file) => ({
                  content_id: file.contentId,
                  file_name: file.contentName,
                  mimetype: file.mimetype,
                  source: file.source,
                  contentLink: file.contentLink,
                  created_by_name: userInfo.fullName,
                  description: file.contentDescription || "A LocalUpload content",
                  internal: userInfo.isInternal,
                  ...(userInfo.isInternal
                    ? { created_by_id: viewer_id }
                    : { created_by_email: userInfo.email }),
                }));
                const newState = {
                  ...componentState,
                  parameters: {
                    ...componentState.parameters,
                    contents: [...componentState.parameters.contents, ...newContents],
                  },
                };
                setComponentState(newState);
                autoSave(newState);
                setIsAddModalOpen(false);
              }
            } catch (error) {
              console.error("Upload failed:", error);
              alert("Upload failed. Please try again.");
            } finally {
              setIsLoading(false);
            }
          }}
          onPublicURLUpload={async (source, formData) => {
            console.log("Heyyyyyyyyyyyyyy", source, formData)
            // Logic from handlePublicURLUpload
            if (!formData.name || !formData.url) {
              alert("Please fill in all required fields");
              return;
            }
            setIsLoading(true);
            const payload = {
              publicURL: formData.url,
              url_name: formData.name,
              description: formData.description,
              created_by: viewer_id,
              source: source,
              viewer_id: viewer_id,
              organisation_id: organisation_id,
              direct_pitch_content: 1,
            };
            try {
              const response = await axiosInstance.post("/publicURL-upload", payload, {
                withCredentials: true,
              });
              if (response.data && response.data.success) {
                const newContent = {
                  content_id: response.data.id,
                  file_name: response.data.filename,
                  created_by_name: userInfo.fullName,
                  mimetype: response.data.mimeType,
                  source: response.data.source,
                  contentLink: response.data.contentLink,
                  description: response.data.contentDescription || "Youtube/Vimeo video or a PublicURL",
                  internal: userInfo.isInternal,
                  ...(userInfo.isInternal
                    ? { created_by_id: viewer_id }
                    : { created_by_email: userInfo.email }),
                };
                const newState = {
                  ...componentState,
                  parameters: {
                    ...componentState.parameters,
                    contents: [...componentState.parameters.contents, newContent],
                  },
                };
                setComponentState(newState);
                autoSave(newState);
                setIsAddModalOpen(false);
              }
            } catch (error) {
              console.error("Upload failed:", error);
            } finally {
              setIsLoading(false);
            }
          }}
        />
      </div>
    </DragDropContext>
  );
}

export default FileUploadPreview;
