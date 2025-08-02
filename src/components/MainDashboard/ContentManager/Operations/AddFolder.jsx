import React, { useRef, useContext, useCallback, useState } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { useSelector, useDispatch } from "react-redux";
import { fetchContents } from "../../../../features/content/contentApi.js";
import { fetchContentsAsync } from "../../../../features/content/contentSlice.js";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import useOutsideClick from "../../../../hooks/useOutsideClick.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { LuLoaderCircle } from "react-icons/lu";
import { useEffect } from "react";
import { navigateToFolder, } from "../../../../features/content/contentSlice.js";
import { UpdateBreadCrumbs } from "../../../../features/content/contentSlice.js";
import { useCookies } from "react-cookie";


export function AddFolder({ folderModalOpen, setFolderModalOpen }) {
  const { viewer_id, baseURL,setBreadcrumbs,setFolder_id} = useContext(GlobalContext);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosInstance = useAxiosInstance();
  const [isDisable, setIsDisable] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;


  const dispatch = useDispatch();

  const folder_id = useSelector((state) => state.contents.breadcrumbs
);
  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
  const Breadcrumbsfolder_id = breadcrumbs[breadcrumbs.length - 1].id;
  const Breadcrumbsfolder_name = breadcrumbs[breadcrumbs.length - 1].name;
  const [value, setValue] = useState(Breadcrumbsfolder_id);

  useEffect(() => {
    setValue(Breadcrumbsfolder_id);
  }, [Breadcrumbsfolder_id]);
  const handleSave = () => {
    if (name.trim() === "") {
      setError("Name is required!");
      setIsDisable(true);
    } else {
      setError("");
    }
  };

  const renameInputRef = useRef(null);
  
  
  const addNewFolder = useCallback(
    async (newFolderName) => {
      let trimmedFolderName = newFolderName;
      setLoading(true);
      if (newFolderName.length > 70) {
        trimmedFolderName = newFolderName.slice(0, 70);
      }
      try {
        setIsSubmitting(true);
        const res = await axiosInstance.post(
          `/create-folder`,
          {
            parent_folder: Breadcrumbsfolder_id,
            name: trimmedFolderName,
            created_by: viewer_id,
          },
          { withCredentials: true }
        );

        
        const createdFolder = res.data.folder
        
        toast.success("Folder created successfully");
        setIsDisable(false);
        setIsSubmitting(false);
        setLoading(false);
        
   
        
        setBreadcrumbs((prevBreadcrumbs) => [
          ...prevBreadcrumbs,
          { id: res.data.folder.id, name: res.data.folder.name },
        ])

        dispatch(
          navigateToFolder({ folderId: res.data.folder.id, folderName: res.data.folder.name })
        );
        
        
       console.log("Folderid",createdFolder.id)

        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: res.data.folder.id,
            baseURL,
            organisation_id
          })
        );

  
      } catch (error) {
        console.error("Could not create folder", error);
        toast.error("Adding Folder Failed");
        setIsSubmitting(false);
        setIsDisable(false);
      } finally {
        setFolderModalOpen(false);
        setName("");
        setLoading(false);
        
        
        
      }
    },
    [
      viewer_id,
      Breadcrumbsfolder_id,
      axiosInstance,
      setFolderModalOpen,
      baseURL,
    ]
  );

  const handleCloseDialog = () => {
    setFolderModalOpen(false);
    setName("");
    setError("");
  };

  const modalRef = useOutsideClick([handleCloseDialog]);

  return (
    <div>
      {/* Add folder modal */}
      {folderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Add Folder
              </h2>
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
                  error
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setIsDisable(false);
                    setName(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSubmitting) {
                      const folderName = e.target.value.trim();
                      if (folderName !== "") {
                        addNewFolder(folderName);
                        handleSave();
                      } else {
                        setError("Name is required!");
                      }
                    }
                  }}
                  ref={renameInputRef}
                  required
                  className="flex-grow px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 focus:outline-none"
                  placeholder="Enter folder name"
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                disabled={isDisable || isSubmitting}
                onClick={() => {
                  const folderName = renameInputRef.current.value.trim();
                  if (folderName !== "") {
                    addNewFolder(folderName);
                    handleSave();
                  } else {
                    setError("Name is required!");
                  }
                  setIsDisable(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-700 rounded-md hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}

export default AddFolder;
