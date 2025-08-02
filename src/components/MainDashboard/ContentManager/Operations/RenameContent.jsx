import React, { useState, useContext, useRef, useEffect } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";
import { LuLoaderCircle } from "react-icons/lu";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchContentsAsync,
  UnSelectItem,
} from "../../../../features/content/contentSlice.js";
import useOutsideClick from "../../../../hooks/useOutsideClick.js";
import { useCookies } from "react-cookie";

const RenameContent = () => {
  const dispatch = useDispatch();
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const selectedItems = useSelector((state) => state.contents.selectedItems);
  const [fileName, setFileName] = useState("");
  const [fileExtension, setFileExtension] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const renameInputRef = useRef(null);

  useEffect(() => {
    if (renameModalOpen && selectedItems.length === 1) {
      const name = selectedItems[0].name;
      const extensionIndex = name.lastIndexOf(".");
      if (extensionIndex !== -1) {
        setFileName(name.substring(0, extensionIndex));
        setFileExtension(name.substring(extensionIndex));
      } else {
        setFileName(name);
        setFileExtension("");
      }
    } else {
      setFileName("");
      setFileExtension("");
      setErrorMessage("");
    }
  }, [renameModalOpen, selectedItems]);

  const renameFilesAndFolders = async () => {
    setIsLoading(true);
    const item = selectedItems[0];
    let newName = fileName.trim() + fileExtension;

    if (newName === item.name) {
      toast.error("Choose a different name");
      setIsLoading(false);
      return;
    }

    try {
      await axiosInstance.post(`/rename-item`, {
        id: item.id,
        name: newName,
        folder_id: item.folder,
        viewer_id: viewer_id,
      });
      toast.success("Rename Successful!");
      dispatch(UnSelectItem(item));
      dispatch(
        fetchContentsAsync({
          viewer_id,
          folder_id: item.parent_folder || item.folder,
          baseURL: baseURL,
          organisation_id,
        })
      );
    } catch (error) {
      toast.error("Failed to rename item");
    } finally {
      setRenameModalOpen(false);
      setIsLoading(false);
    }
  };

  const handleRenameClick = () => {
    if (fileName.trim() === "") {
      setErrorMessage("Name is required!");
    } else {
      setErrorMessage("");
      renameFilesAndFolders();
    }
  };

  const handleCloseDialog = () => {
    setRenameModalOpen(false);
  };

  const modalRef = useOutsideClick([handleCloseDialog]);

  const handleDemoUser = () => {
    if (selectedItems[0].demo == 1) {
      toast.warning("Demo content can't be editable");
    }
  };

  console.log("selectedItems[0].demo", selectedItems[0].demo);

  return (
    <>
      {renameModalOpen &&
        selectedItems[0].demo == 0 &&
        selectedItems.length === 1 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              ref={modalRef}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
            >
              <div className="flex justify-between items-center mb-4">
                {fileExtension && (
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Rename Content
                  </h2>
                )}
                {!fileExtension && (
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Rename Folder
                  </h2>
                )}
                <button
                  onClick={handleCloseDialog}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="flex mb-4">
                <div
                  className={`flex w-full border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-sky-700 ${
                    errorMessage
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    ref={renameInputRef}
                    className="flex-grow px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 focus:outline-none"
                    placeholder="Enter new name"
                  />
                  {fileExtension && (
                    <span className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                      {fileExtension}
                    </span>
                  )}
                </div>
              </div>
              {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
              )}
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={handleCloseDialog}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameClick}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md  focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <LuLoaderCircle className="animate-spin h-5 w-5 inline" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      <button
        type="button"
        // className="text-sky-700 text-[14px] py-2 px-3 mt-1 rounded-md border-solid hover:bg-gray-200 dark:text-sky-400 dark:hover:bg-gray-700 dark:border-gray-500 flex items-center"
        className="flex items-center text-secondary text-[14px] py-1 px-2 my-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
        onClick={() => {
          setRenameModalOpen(true);
          handleDemoUser();
        }}
      >
        <FontAwesomeIcon icon={faEdit} className="mr-2" />
        Rename
      </button>
    </>
  );
};

export default RenameContent;
