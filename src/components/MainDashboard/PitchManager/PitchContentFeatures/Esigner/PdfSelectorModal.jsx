import { useContext, useState, useCallback, useEffect, useRef } from "react";
import { GlobalContext } from "../../../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../../../Services/useAxiosInstance.jsx";
import { formatDate } from "../../../../../constants.js";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FcFolder } from "react-icons/fc";
import { FaRegFilePdf } from "react-icons/fa";
import TableLoading from "../../../ContentManager/ContentTable/TableLoading.jsx";
import EmptyFolderComponent from "../../../ContentManager/ContentTable/EmptyFolderComponent.jsx";
import toast from "react-hot-toast";
import { LuLoaderCircle } from "react-icons/lu";

const PdfSelectorModal = ({ onClose, onPdfSelected }) => {
  const { viewer_id } = useContext(GlobalContext);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "", name: "Home" }]);
  const [folder_id, setFolder_id] = useState("");
  const [contents, setContents] = useState([]);
  const axiosInstance = useAxiosInstance();
  const [localSearchInput, setLocalSearchInput] = useState("");
  const [isContentLoading, setIsContentLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchContentData = useCallback(
    async (id = "") => {
      setIsContentLoading(true);
      try {
        const response = await axiosInstance.post(
          `/view-content-and-folders-sorted`,
          { viewer_id, folder_id: id },
          { withCredentials: true }
        );
        if (response.data) {
          // Filter to only show PDFs and folders
          const filteredItems = response.data.items.filter(
            (item) =>
              item.table_identifier === "folder" ||
              item.mimetype === "application/pdf"
          );
          setContents(filteredItems);
          setIsContentLoading(false);
        }
      } catch (error) {
        console.error(error.message);
        setIsContentLoading(false);
      }
    },
    [viewer_id, axiosInstance]
  );

  useEffect(() => {
    fetchContentData();
  }, []);

  const navigateToFolder = useCallback(
    async (folderId, folderName) => {
      if (
        folderId !== folder_id ||
        (folderName &&
          !breadcrumbs.find((breadcrumb) => breadcrumb.id === folderId))
      ) {
        try {
          if (folderName) {
            if (folderId === "") {
              setBreadcrumbs([{ id: "", name: "Home" }]);
            } else {
              let found = false;
              const updatedBreadCrumbs = [];
              for (let i = 0; i < breadcrumbs.length; i++) {
                updatedBreadCrumbs.push(breadcrumbs[i]);
                if (breadcrumbs[i].id === folderId) {
                  found = true;
                  break;
                }
              }
              if (found) {
                setBreadcrumbs(updatedBreadCrumbs);
              } else {
                setBreadcrumbs((prevBreadcrumbs) => [
                  ...prevBreadcrumbs,
                  { id: folderId, name: folderName },
                ]);
              }
            }
          }
          setFolder_id(folderId);
          fetchContentData(folderId);
        } catch (err) {
          console.error(err);
        }
      }
    },
    [folder_id, breadcrumbs]
  );

  const handleContentClick = async (data) => {
    if (isUploading) {
      toast("Please wait until the upload is complete.");
      return;
    }

    if (data.table_identifier === "folder") {
      navigateToFolder(data.id, data.name);
    } else {
      // If it's a PDF, close the modal and send the data back
      onPdfSelected(data);
    }
  };

  const handleFileUpload = async (file) => {
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("created_by", viewer_id);
      formData.append("description", "Content");
      formData.append("direct_pitch_content", 1);

      const response = await toast.promise(
        axiosInstance.post(`/local-upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }),
        {
          loading: `Uploading ${file.name} ...`,
          success: `Successfully uploaded: ${file.name}`,
          error: "An error occurred during file upload.",
        }
      );

      if (response.data && response.data.uploadedFiles) {
        const uploadedFile = response.data.uploadedFiles[0];
        onPdfSelected({
          id: uploadedFile.contentId,
          name: uploadedFile.contentName,
          mimetype: uploadedFile.mimetype,
        });
      }
    } catch (error) {
      console.error("Error in handleFileUpload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleAddPdfClick = () => {
    fileInputRef.current.click();
  };

  const getIcon = (content) => {
    if (content.table_identifier === "folder") {
      return <FcFolder className="w-5 h-5" />;
    }
    return <FaRegFilePdf className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in duration-300 relative">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Select PDF</h3>
          <div className="flex space-x-4">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,application/pdf"
                style={{ display: "none" }}
              />
              <button
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleAddPdfClick}
              >
                {isUploading ? (
                  <LuLoaderCircle className="animate-spin w-4 h-4" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                Upload PDF
              </button>
            </div>
            <button
              className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
              onClick={onClose}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mx-5 my-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.id} className="inline-flex items-center">
                  {index > 0 && (
                    <svg
                      className="w-4 h-4 text-gray-400 mx-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  )}
                  <button
                    onClick={() => navigateToFolder(crumb.id, crumb.name)}
                    className={`text-sm font-medium hover:text-secondary transition-colors ${
                      index === breadcrumbs.length - 1
                        ? "text-secondary"
                        : "text-gray-500"
                    }`}
                  >
                    {crumb.name}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="px-5 mb-4">
          <div className="flex w-full">
            <div className="w-full flex items-center">
              <input
                type="text"
                className="bg-white w-full border border-gray-300 text-gray-900 text-sm rounded-lg block h-10 pl-3 pr-3 transition-all"
                placeholder="Search in this folder..."
                value={localSearchInput}
                onChange={(e) => setLocalSearchInput(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="px-5">
          <div className="overflow-y-auto border border-gray-200 rounded-lg h-96 shadow-sm">
            {isContentLoading ? (
              <TableLoading columns={3} rows={7} />
            ) : (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                  <tr>
                    <th className="p-3 font-semibold text-left border-b">
                      <div className="flex items-center justify-between pr-3">
                        <span className="text-sm font-bold text-gray-700">
                          Name
                        </span>
                      </div>
                    </th>
                    <th className="p-3 font-semibold text-left border-b">
                      <div className="flex items-center justify-between pr-3">
                        <span className="text-sm font-bold text-gray-700">
                          Created By
                        </span>
                      </div>
                    </th>
                    <th className="p-3 font-semibold text-left border-b">
                      <div className="flex items-center justify-between pr-3">
                        <span className="text-sm font-bold text-gray-700">
                          Created At
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="font-sans text-sm divide-y divide-gray-200">
                  {(() => {
                    // Filter contents by localSearchInput (case-insensitive, name match)
                    const filteredContents = localSearchInput
                      ? contents.filter((c) =>
                          (c.name || "")
                            .toLowerCase()
                            .includes(localSearchInput.toLowerCase())
                        )
                      : contents;
                    if (filteredContents.length === 0) {
                      return (
                        <tr>
                          <td colSpan={3}>
                            <EmptyFolderComponent />
                          </td>
                        </tr>
                      );
                    }
                    return filteredContents.map((content) => (
                      <tr
                        key={content.id}
                        onClick={() => handleContentClick(content)}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                          isUploading
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        style={{
                          pointerEvents: isUploading ? "none" : "auto",
                        }}
                      >
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-gray-100">
                              {getIcon(content)}
                            </div>
                            <span className="ml-3 font-medium text-gray-900 truncate max-w-xs">
                              {content.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-500">
                          {content.created_by}
                        </td>
                        <td className="p-3 text-gray-500">
                          {formatDate(content.created_at)}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="p-5 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfSelectorModal;
