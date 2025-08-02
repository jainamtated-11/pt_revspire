import { useState, useRef, useContext, useEffect } from "react";
import {
  FaEdit,
  FaDownload,
  FaTrash,
  FaPlus,
  FaTimes,
  FaUpload,
  FaYoutube,
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

const FileUploader = ({
  isOpen,
  onClose,
  hexColor,
  onClickHandler,
  onActionEdit,
  contentWhileEditing,
}) => {
  const { viewer_id, organisation_id, baseURL } = useContext(GlobalContext);
  const [cookies] = useCookies(["revspireToken", "userData"]);

  const axiosInstance = useAxiosInstance();
  const [componentState, setComponentState] = useState({
    name: "File Sharing",
    description: "File Uploader where both user and clients can add files",
    parameters: {
      Type: "FileUploader",
      contents: [],
    },
  });
  console.log("componetgn statea",
    componentState
  )
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(componentState.name);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // For inline editing
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  // Add new state for editing base and extension
  const [editingBase, setEditingBase] = useState("");
  const [editingExt, setEditingExt] = useState("");

  // Drag-and-drop reorder handler
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(componentState.parameters.contents);
    const [removed] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, removed);
    setComponentState((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        contents: updated,
      },
    }));
  };


  const handleTitleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTitleEdit();
    }
    if (e.key === "Escape") {
      setTempTitle(componentState.name);
      setIsEditingTitle(false);
    }
  };

  // Restore handleTitleEdit function
  const handleTitleEdit = () => {
    if (isEditingTitle) {
      setComponentState((prev) => ({
        ...prev,
        name: tempTitle,
      }));
    } else {
      setTempTitle(componentState.name);
    }
    setIsEditingTitle(!isEditingTitle);
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

  // Download logic for one or more files
  const handleDownloadFiles = (contentIds, fileNames = []) => {
    if (!contentIds || contentIds.length === 0) return;
    const idsParameter = `contentIds=${contentIds.join(
      ","
    )}&viewerId=${viewer_id}`;

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
          // Determine file name
          let fileName =
            contentIds.length === 1 && fileNames.length === 1
              ? fileNames[0]
              : "downloaded_files";
          // Get the MIME type from the response headers
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
          // Download the file
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

  // Top download button handler (only for local uploads)
  const handleDownload = () => {
    if (selectedRows.size === 0) return;
    // Only include local uploads
    const localContents = componentState.parameters.contents.filter(
      (c) =>
        selectedRows.has(c.content_id) && (!c.source || c.source === "local")
    );
    const ids = localContents.map((c) => c.content_id);
    const names = localContents.map((c) => c.file_name);
    if (ids.length === 0) return;
    handleDownloadFiles(ids, names);
  };

  const handleDelete = () => {
    if (selectedRows.size === 0) return;

    setComponentState((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        contents: prev.parameters.contents.filter(
          (content) => !selectedRows.has(content.content_id)
        ),
      },
    }));

    setSelectedRows(new Set());
    setSelectAll(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
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

  const FormInput = ({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
  }) => {
    // Ensure hexColor always has a leading #
    const safeHexColor =
      hexColor && !hexColor.startsWith("#") ? `#${hexColor}` : hexColor;
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
          required={required}
          style={{
            borderColor: safeHexColor,
            boxShadow: isEditingTitle ? `0 0 0 2px ${safeHexColor}` : undefined,
          }}
        />
      </div>
    );
  };

  // Function to handle saving the action plan
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const payload = {
        name: componentState.name,
        description: componentState.description,
        parameters: componentState.parameters,
        organisation_id: organisation_id,
        viewer_id: viewer_id,
      };
      let response;
      if (contentWhileEditing?.content) {
        response = await axiosInstance.post(
          "/pitch-content-feature/edit-feature",
          {
            ...payload,
            content_id: contentWhileEditing.content_id,
          }
        );

        const editedData = componentState;
        const editedContentId = contentWhileEditing.content_id;
        // console.log("editedActionPlan", editedActionPlan, editedContentId);
        onActionEdit({ editedContentId, editedData });
        // dispatch(resetActionPlan());
        onClose();
        return;
      } else {
        // Create new feature
        response = await axiosInstance.post(
          "/pitch-content-feature/create-feature",
          payload
        );

        const contentWithTagline = {
          ...response.data.content,
          tagline: response.data.content.name,
        };
        // Wrap in array and pass to handler
        onClickHandler([contentWithTagline]);
        // dispatch(resetActionPlan());
        onClose();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Ensure hexColor always has a leading #
  const safeHexColor =
    hexColor && !hexColor.startsWith("#") ? `#${hexColor}` : hexColor;

  useEffect(() => {
    if (contentWhileEditing && contentWhileEditing.content_link) {
      let parsedLink;
      try {
        parsedLink = JSON.parse(contentWhileEditing.content_link);
      } catch (e) {
        parsedLink = { Type: "FileUploader", contents: [] };
      }
      setComponentState({
        name: contentWhileEditing.tagline || "File Sharing",
        description:
          contentWhileEditing.description ||
          "File Uploader where both user and clients can add files",
        parameters: {
          Type: parsedLink.Type || "FileUploader",
          contents: parsedLink.contents || [],
        },
      });
    }
  }, [contentWhileEditing]);

  if (!isOpen) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-5xl h-[70vh] overflow-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={handleTitleKeyPress}
                  onBlur={handleTitleEdit}
                  className="text-2xl font-semibold text-gray-800 bg-transparent border-b-2 focus:outline-none"
                  style={{ borderColor: safeHexColor, color: safeHexColor }}
                  autoFocus
                />
              ) : (
                <h1
                  className="text-2xl font-semibold"
                  style={{ color: safeHexColor }}
                >
                  {componentState.name}
                </h1>
              )}
              <button
                onClick={handleTitleEdit}
                className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <FaEdit className="w-4 h-4" />
              </button>
            </div>

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
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto py-6 px-4">
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    {/* <th className="w-12 px-4 py-3 text-left "> */}
                      <th className="w-12 px-4 py-2 pt-0 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="ml-7 w-4 h-4 rounded-md border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                          style={{
                            color: safeHexColor,
                            backgroundColor: selectAll ? safeHexColor : 'white',
                            borderColor: selectAll ? safeHexColor : '#d1d5db',
                            '--tw-ring-color': safeHexColor,
                          }}
                        />
                      </th>
                    {/* </th> */}
                    <th className="px-4 py-2 pt-0 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                      NAME
                    </th>
                    <th className="px-4 py-2 pt-0 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                      OWNER
                    </th>
                    <th className="px-4 py-2 pt-0 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                      ADDED By
                    </th>
                    <th className="w-32 px-4 pt-0 py-2"></th>
                  </tr>
                </thead>
                <Droppable droppableId="fileuploader-table">
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
                                      className="ml-3 w-4 h-4 rounded-md border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                                      style={{
                                        color: safeHexColor,
                                        backgroundColor: selectedRows.has(content.content_id) ? safeHexColor : 'white',
                                        borderColor: selectedRows.has(content.content_id) ? safeHexColor : '#d1d5db',
                                        '--tw-ring-color': safeHexColor,
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
                                                setComponentState((prev) => ({
                                                  ...prev,
                                                  parameters: {
                                                    ...prev.parameters,
                                                    contents: prev.parameters.contents.map((c) =>
                                                      c.content_id === content.content_id
                                                        ? { ...c, file_name: editingBase + editingExt }
                                                        : c
                                                    ),
                                                  },
                                                }));
                                                setEditingId(null);
                                                setEditingBase("");
                                                setEditingExt("");
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  setComponentState((prev) => ({
                                                    ...prev,
                                                    parameters: {
                                                      ...prev.parameters,
                                                      contents: prev.parameters.contents.map((c) =>
                                                        c.content_id === content.content_id
                                                          ? { ...c, file_name: editingBase + editingExt }
                                                          : c
                                                      ),
                                                    },
                                                  }));
                                                  setEditingId(null);
                                                  setEditingBase("");
                                                  setEditingExt("");
                                                } else if (e.key === "Escape") {
                                                  setEditingId(null);
                                                  setEditingBase("");
                                                  setEditingExt("");
                                                }
                                              }}
                                              // style={{ width: "auto", minWidth: 60 }}
                                              style={{ minWidth: 120, maxWidth: 350, width: Math.max(120, editingBase.length * 10) }}
                                            />
                                            <span className="ml-1 text-gray-500 select-none">{editingExt}</span>
                                          </span>
                                        );
                                      })()
                                    ) : (
                                      <>
                                        <span className="text-sm text-gray-900">
                                          {content.file_name}
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
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
                                        content.source &&
                                        content.source !== "local"
                                      }
                                      onClick={() => {
                                        if (
                                          !content.source ||
                                          content.source === "local"
                                        ) {
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
                                      onClick={() => {
                                        setComponentState((prev) => ({
                                          ...prev,
                                          parameters: {
                                            ...prev.parameters,
                                            contents:
                                              prev.parameters.contents.filter(
                                                (c) =>
                                                  c.content_id !==
                                                  content.content_id
                                              ),
                                          },
                                        }));
                                        setSelectedRows((prev) => {
                                          const newSet = new Set(prev);
                                          newSet.delete(content.content_id);
                                          return newSet;
                                        });
                                      }}
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
                      <tr>
                        <td colSpan="5" className="px-4 py-3">
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 font-medium hover:underline"
                            style={{ color: safeHexColor }}
                          >
                            <FaPlus
                              className="w-4 h-4"
                              style={{ color: safeHexColor }}
                            />
                            Add Files & Links
                          </button>
                        </td>
                      </tr>
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </table>
            </div>
          </div>
          <div className="flex justify-end space-x-2 border-t mr-4 mb-4 pt-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
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
              let created_by_name = "Current User";
              let userData = cookies.userData;
              if (userData) {
                if (typeof userData === "string") {
                  try {
                    userData = JSON.parse(userData);
                  } catch (e) {
                    userData = null;
                  }
                }
                if (userData && userData.user) {
                  created_by_name =
                    userData.user.first_name && userData.user.last_name
                      ? `${userData.user.first_name} ${userData.user.last_name}`
                      : userData.user.username;
                }
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
                    created_by_name,
                    mimetype: file.mimetype,
                    source: file.source,
                    contentLink: file.contentLink,
                    viewer_id,
                    internal: 1,
                    created_by_id: viewer_id,
                    description: file.contentDescription || "A LocalUpload content",
                  }));
                  setComponentState((prev) => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      contents: [...prev.parameters.contents, ...newContents],
                    },
                  }));
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
              // Logic from handlePublicURLUpload
              if (!formData.name || !formData.url) {
                alert("Please fill in all required fields");
                return;
              }
              setIsLoading(true);
              let created_by_name = "Current User";
              let userData = cookies.userData;
              if (userData) {
                if (typeof userData === "string") {
                  try {
                    userData = JSON.parse(userData);
                  } catch (e) {
                    userData = null;
                  }
                }
                if (userData && userData.user) {
                  created_by_name =
                    userData.user.first_name && userData.user.last_name
                      ? `${userData.user.first_name} ${userData.user.last_name}`
                      : userData.user.username;
                }
              }
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
                    created_by_id: viewer_id,
                    created_by_name,
                    mimetype: response.data.mimeType,
                    ...(response.data.source !== "Public" && { source: response.data.source }),
                    source: response.data.source,
                    contentLink: response.data.contentLink,
                    description: response.data.contentDescription || "Youtube/Vimeo video or a PublicURL",
                    internal: 1,

                  };
                  setComponentState((prev) => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      contents: [...prev.parameters.contents, newContent],
                    },
                  }));
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
      </div>
    </DragDropContext>
  );
};

export default FileUploader;
