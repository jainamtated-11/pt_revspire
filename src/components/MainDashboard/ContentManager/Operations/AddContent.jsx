import React, { useContext, useState, useEffect, useRef } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { fetchContentsAsync } from "../../../../features/content/contentSlice.js";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { useCookies } from "react-cookie";
import { store } from "../../../../store/store.js"; // Import Redux store

const isValidFileType = (file) => {
  const validExtensions = [
    "jpg",
    "jpeg",
    "png",
    "doc",
    "docx",
    "pdf",
    "ppt",
    "pptx",
    "mp4",
    "txt",
    "xls",
    "xlsx",
    "mov",
    "gif",
    "webp",
  ];
  const fileName = file.name;
  const fileExtension = fileName.split(".").pop().toLowerCase();
  return validExtensions.includes(fileExtension);
};

const verifyFileSize = (file, MAX_FILE_SIZE) => {
  return file.size <= MAX_FILE_SIZE;
};
// Function to limit file name length to 70 characters (excluding extension)
const limitFileNameLength = (fileName, maxLength = 70) => {
  const fileExtension = fileName.split(".").pop(); // Get file extension
  const baseName = fileName.substring(0, fileName.lastIndexOf(".")); // Get base file name without extension
  if (baseName.length > maxLength) {
    const truncatedBaseName = baseName.slice(0, maxLength); // Truncate base name
    return `${truncatedBaseName}.${fileExtension}`; // Reconstruct file name with extension
  }
  return fileName; // If within the limit, return the original name
};

export function AddContent({
  fileUpload,
  setDriveSelection,
  setContentPlaceHolders,
  setContentPlaceHolderModal,
}) {
  const dispatch = useDispatch();

  const {
    viewer_id,
    baseURL,
    directContentUpload,
    setDirectContentUpload,
    setDirectContent,
  } = useContext(GlobalContext);
  const breadcrumb = useSelector((state) => state.contents.breadcrumbs);
  const currentFolderId = breadcrumb[breadcrumb.length - 1]?.id || null;

  const [currBreadcrumb, setCurrBreadcrumb] = useState("");
  const axiosInstance = useAxiosInstance();
  const [breadcrumbs, setBreadcrumbs] = useState("");

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  useEffect(() => {
    setCurrBreadcrumb(breadcrumb);
  }, []);

  useEffect(() => {
    setBreadcrumbs(breadcrumb);
  }, [breadcrumb]);

  // Function to get the latest breadcrumb from Redux store
  const getLatestBreadcrumb = () => {
    const state = store.getState();
    return state.contents.breadcrumbs;
  };

  const handleFileUpload = async (formData, viewer_id, folder_id, onUploadProgress) => {
    formData.append("created_by", viewer_id);
    formData.append("description", "Content");

    if (!directContentUpload) {
      formData.append("folder", folder_id);
    } else {
      formData.append("direct_pitch_content", 1);
    }

    setDriveSelection(false);

    return axiosInstance.post(`/local-upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
      onUploadProgress, // Add progress callback
    });
  };

  const MAX_FILE_SIZE = 4000 * 1024 * 1024;

  const handleFileChange = async (e) => {
    const allFiles = Array.from(e.target.files);
    const supportedFiles = allFiles.filter(isValidFileType);

    if (supportedFiles.length === 0) {
      toast.error("No supported files were selected.");
      return;
    }

    // Show toast with the number of files being uploaded
    const formData = new FormData();
    const toastId = toast.loading(
      supportedFiles.length > 1 
        ? `Uploading ${supportedFiles.length} files 0%` 
        : `Uploading ${supportedFiles[0].name} 0%`
    );

    for (const file of supportedFiles) {
      if (verifyFileSize(file, MAX_FILE_SIZE)) {
        const modifiedFileName = limitFileNameLength(file.name);
        const renamedFile = new File([file], modifiedFileName, {
          type: file.type,
        });
        formData.append("files", renamedFile);
      } else {
        toast.error(`${file.name} file too large!`);
      }
    }

    try {
      const response = await handleFileUpload(
        formData,
        viewer_id,
        currentFolderId,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          toast.loading(
            supportedFiles.length > 1
              ? `Uploading ${supportedFiles.length} files ${percentCompleted}%`
              : `Uploading ${supportedFiles[0].name} ${percentCompleted}%`,
            { id: toastId }
          );
        }
      );

      if (response.data) {
        const uploadedFiles = response.data.uploadedFiles;
        const contentPlacedHolder = uploadedFiles.filter(
          (file) => file.placeholders.length > 0
        );
        if (contentPlacedHolder.length > 0) {
          setContentPlaceHolderModal(true);
          setContentPlaceHolders(contentPlacedHolder);
        }
      }

      // Get the latest breadcrumb directly from Redux store
      const latestBreadcrumb = getLatestBreadcrumb();
      console.log("Latest breadcrumb from store:", latestBreadcrumb);
      console.log("Current folder ID:", currentFolderId);

      // Check if we're still in the same folder
      if (
        latestBreadcrumb[latestBreadcrumb.length - 1]?.id === currentFolderId
      ) {
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: currentFolderId,
            baseURL: baseURL,
            organisation_id: organisation_id,
            thumbnail:1,
          })
        );
      } else {
        console.log("Folder changed, not fetching contents");
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("An error occurred during file upload.");
    }

    // Update toast to success
    toast.success(
      supportedFiles.length > 1
        ? `Successfully uploaded ${supportedFiles.length} files`
        : `Successfully uploaded ${supportedFiles[0].name}`,
      { id: toastId }
    );

    // Get the latest breadcrumb directly from Redux store for the final check
    const latestBreadcrumb = getLatestBreadcrumb();
    const latestFolderId = latestBreadcrumb[latestBreadcrumb.length - 1]?.id;

    if (!directContentUpload && currentFolderId === latestFolderId) {
      if (currBreadcrumb !== breadcrumbs) {
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: latestFolderId,
            baseURL,
            organisation_id,
          })
        );
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileUpload}
        accept=".jpg,.jpeg,.png,.doc,.docx,.pdf,.ppt,.pptx,.mp4,.xls,.xlsx,.mov,.gif,.webp"
        style={{ display: "none" }}
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
}

export default AddContent;
