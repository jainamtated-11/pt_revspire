import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";
import { LuLoaderCircle } from "react-icons/lu";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchLayoutsAsync,
  clearSelectedLayout,
} from "../../../features/layout/layoutSlice";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import useOutsideClick from "../../../hooks/useOutsideClick.js";

const RenameLayout = () => {
  const { setSelectedLayouts, viewer_id, baseURL } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const selectedLayouts = useSelector((state) => state.layouts.selectedLayouts);
  const [selectedLayoutIds, setSelectedLayoutIds] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [loader, setLoader] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const layout = useSelector((state) => state.layouts.layouts);
  const dispatch = useDispatch();
  const storeSelectedLayoutIds = () => {
    const layoutId = selectedLayouts.map((Layout) => Layout.id);
    setSelectedLayoutIds(layoutId);
  };

  useEffect(() => {
    storeSelectedLayoutIds();
  }, [selectedLayouts]);

  const renameInputRef = useRef(null);

  const renameFilesAndFolders = async () => {
    const renameText = renameInputRef.current.value.trim();

    if (!renameText) {
      setErrorMessage("Name is required");
      return;
    }

    const item = selectedLayouts[0];
    setIsDisable(true);
    setLoader(true);

    if (renameText === item.name) {
      toast.error("Choose a different name");
      setIsDisable(false);
      setLoader(false);
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/rename-pitch-layout`,
        {
          layoutId: selectedLayoutIds,
          newName: renameText,
          viewer_id: viewer_id,
        },
        {
          withCredentials: true,
        }
      );

      if (response) {
        toast.success("Layouts Renamed Successfully!");
        dispatch(fetchLayoutsAsync({ viewer_id, baseURL }));
        dispatch(clearSelectedLayout());
      } else {
        toast.error("Error Renaming Layout!");
      }
    } catch (error) {
      console.error("Error renaming layout:", error);
      toast.error("Error occurred while renaming!");
    } finally {
      setIsOpen(false);
      setSelectedLayouts([]);
      setLoader(false);
      setIsDisable(false);
    }
  };

  const handleRenameClick = (e) => {
    e.preventDefault();
    setErrorMessage("");
    renameFilesAndFolders();
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setErrorMessage("");
  };

  const modalRef = useOutsideClick([handleCloseDialog]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Rename Layout
              </h2>
              <button
                onClick={handleCloseDialog}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <input
              type="text"
              autoFocus
              ref={renameInputRef}
              className={`w-full px-3 py-2 text-gray-700 dark:text-gray-200 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-700 dark:bg-gray-700 dark:border-gray-600 ${
                errorMessage ? "border-red-500" : ""
              }`}
              placeholder="Enter new name"
            />
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
                disabled={isDisable}
                onClick={handleRenameClick}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-700 rounded-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loader ? (
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
        className=" text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
        onClick={handleOpenDialog}
      >
        <FontAwesomeIcon icon={faEdit} className="mr-2" />
        Rename
      </button>
    </>
  );
};

export default RenameLayout;
