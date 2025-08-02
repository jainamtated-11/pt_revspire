import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
  useMemo,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Table.css";
import CanvaDesignsGallery from "../Canva/CanvaDesignGallery.jsx";
import useContentHandler from "./useContentHandler.js";
import Canva from "../Canva/Canva.jsx";
import { BsFiletypePptx } from "react-icons/bs";
import { BsFileEarmarkWordFill } from "react-icons/bs";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { RiVideoFill } from "react-icons/ri";
import { BsFilePdfFill } from "react-icons/bs";
import { FaImage } from "react-icons/fa6";
import { FaFolder } from "react-icons/fa6";
import { IoLinkOutline } from "react-icons/io5";
import { SiCanva } from "react-icons/si";
import { SiStreamrunners } from "react-icons/si";
import ContentModal from "./ContentModal.jsx";
import LoadingSpinner from "../../../../utility/LoadingSpinner.jsx";
import EmptyFolderComponent from "./EmptyFolderComponent.jsx";
import AddTagToContentModal from "../Operations/AddTagToContentModal.jsx";
import {
  fetchContentsAsync,
  UnSelectItem,
  SelectItem,
} from "../../../../features/content/contentSlice.js";
import TilsLoading from "./TilsLoading.jsx";
import "../../../MainDashboard/ContentManager/ContentTable/Table.css";
import { useCookies } from "react-cookie";
import AdobeExpress from "../AdobeExpress/AdobeExpress.jsx";
import toast from "react-hot-toast";
import SuccessButton from "../../../../utility/SuccessButton.jsx";

import {
  SetSearchTable,
  SetSearchFields,
  SetSearchData,
  SetInitialData,
} from "../../../../features/search/searchSlice.js";
import { FaYoutube, FaVimeo } from "react-icons/fa";
import ReactDOM from "react-dom";

const getThumbnailUrl = (thumbnailData) => {
  if (!thumbnailData || !thumbnailData.data) {
    return null;
  }
  try {
    const uint8Array = new Uint8Array(thumbnailData.data);
    const binaryString = uint8Array.reduce(
      (acc, byte) => acc + String.fromCharCode(byte),
      ""
    );

    // Determine the correct MIME type
    let mimeType = "jpeg";
    if (thumbnailData.mimetype) {
      mimeType = thumbnailData.mimetype.split("/")[1];
    } else {
      // Check for PNG signature
      const isPNG =
        uint8Array[0] === 0x89 &&
        uint8Array[1] === 0x50 &&
        uint8Array[2] === 0x4e &&
        uint8Array[3] === 0x47;
      if (isPNG) mimeType = "png";
    }

    return `data:image/${mimeType};base64,${btoa(binaryString)}`;
  } catch (error) {
    console.error("Error converting thumbnail:", error);
    console.log("Problematic thumbnail data:", thumbnailData);
    return null;
  }
};

function ContentTils({ viewer_id, minCellWidth }) {
  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
  const [activeContent, setActiveContent] = useState("");
  const [showCanvaOptions, setShowCanvaOptions] = useState("");
  const [showAdobeOptions, setShowAdobeOptions] = useState("");
  const [progress, setProgress] = useState(0);
  const [breadcrumb, setBreadcrumb] = useState("");
  const [currBreadcrumb, setCurrBreadcrumb] = useState("");
  const [invalidFiles, setInvalidFiles] = useState([]); // For tracking invalid files
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const wrapperRef = useRef(null);
  const breadcrumbsRef = useRef(breadcrumbs);
  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);

  const handleCloseDialog = () => {
    setShowErrorDialog(false);
    setInvalidFiles([]); // Reset invalid files after closing the dialog
  };
  useEffect(() => {
    breadcrumbsRef.current = breadcrumbs;
  }, [breadcrumbs]);
  const handleOnMouseEnter = (item) => {
    if (!item.mimetype || !item.mimetype.includes("image/")) return;
    setActiveContent(item.id);
  };
  const handleOnMouseLeave = (item) => {
    if (!item.mimetype || !item.mimetype.includes("image/")) return;
    setActiveContent("");
  };

  useEffect(() => {
    setCurrBreadcrumb(breadcrumbs);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setBreadcrumb(breadcrumbs); // Update breadcrumb every interval
    }, 100); // Run every 100ms

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [breadcrumbs]);

  const {
    setContentModalOpen,
    addTagToContent,
    contentModalLoading,
    folderPath,
    baseURL,
    setFolder_id,
    frontendBaseURL,
    folder_id,
    oneDrivePickerOpen,
    setOneDrivePickerOpen,
  } = useContext(GlobalContext);

  const folder_ids = useSelector((state) => state.contents.folder_id);

  const {
    contents,
    mouseMove,
    handleContentClick,
    sortRows,
    mouseUp,
    sortConfig,
    selectedContent,
    setSelectedContent,
  } = useContentHandler({ viewer_id, minCellWidth });
  const [contentModalMount, setContentModalMount] = useState(false);

  const dispatch = useDispatch();

  const filter = useSelector((state) => state.filter);
  const filterData = useSelector((state) => state.filter.filterData);
  const loading = useSelector((state) => state.contents.loading);

  useEffect(() => {
    if (filter.filterApplied) {
      dispatch(SetInitialData(filter.filterData));
      dispatch(SetSearchData(filter.filterData));
    } else {
      dispatch(SetInitialData(contents));
      dispatch(SetSearchData(contents));
    }
    dispatch(SetSearchTable("content"));
    dispatch(SetSearchFields(["name", "source"]));
  }, [contents, filter.filterApplied, dispatch]);

  const [cookies] = useCookies([
    "OneDriveData",
    "OneDriveAccessToken",
    "canvaAccessToken",
    "userData",
  ]);

  const canvaAccessToken = cookies.canvaAccessToken;
  const closeModal = () => {
    setContentModalOpen(false);
    setContentModalMount(false);
  };

  const onDragEnter = (e) => {
    if (wrapperRef.current) {
      wrapperRef.current.classList.add("dragover");
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = (e) => {
    if (wrapperRef.current) {
      wrapperRef.current.classList.remove("dragover");
    }
    e.preventDefault();
    e.stopPropagation();
  };

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
    ];
    const fileName = file.name;
    const fileExtension = fileName.split(".").pop().toLowerCase();
    return validExtensions.includes(fileExtension);
  };

  const isFileExists = async (file) => {
    try {
      const response = await axiosInstance.post(
        `/view-content-and-folders-sorted`,
        {
          viewer_id: viewer_id,
          folder_id: folder_id,
          thumbnail: 1,
        }
      );

      const items = response.data.items; // Access the 'items' array from the response
      const fileNamesInFolder = items.map((item) => item.name); // Extract file names

      // Example: Check if a specific file name exists in the folder
      const fileNameToCheck = file.name; // Replace with the file name you want to check

      const isFilePresent = fileNamesInFolder.includes(fileNameToCheck);

      if (isFilePresent) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const countFilesAndFolders = (folderStructure) => {
    let count = 0;
    const countRecursively = (folder) => {
      count++; // Count the folder itself
      if (folder.subFolders) {
        for (const subFolder of folder.subFolders) {
          countRecursively(subFolder);
        }
      }
    };

    for (const folder of folderStructure) {
      countRecursively(folder);
    }
    return count;
  };

  const uploadFiles = async (files, createdFolderStructure, totalTasks) => {
    let uploadedCount = 0;
    let isError = false;

    for (const { file, folderPath } of files) {
      const folderId =
        getFolderIdFromPath(folderPath, createdFolderStructure) || folder_ids;

      try {
        await handleFileUpload(file, folderId);
      } catch (error) {
        isError = true;
      }

      uploadedCount++;
      const currentProgress = Math.floor((uploadedCount / totalTasks) * 100);
      setProgress(currentProgress);
    }

    if (!isError) {
      toast.success("Content uploaded successfully!");
    } else {
      toast.error("Content not uploaded successfully.");
    }

    setProgress(100);

    // Add a small delay before fetching to ensure server has processed thumbnails
    setTimeout(() => {
      if (currBreadcrumb == breadcrumb) {
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: breadcrumbs[breadcrumbs.length - 1].id,
            baseURL: baseURL,
            thumbnail: 1, // Explicitly request thumbnails
            organisation_id: cookies.userData?.organisation?.id,
          })
        );
      }
    }, 500);
  };

  const getFolderIdFromPath = (
    folderPath,
    folderStructure,
    parentPath = ""
  ) => {
    for (const folder of folderStructure) {
      const currentPath = `${parentPath}/${folder.name}`;
      if (currentPath === folderPath) {
        return folder.id;
      }
      if (folder.subFolders && folder.subFolders.length > 0) {
        const result = getFolderIdFromPath(
          folderPath,
          folder.subFolders,
          currentPath
        );
        if (result) return result;
      }
    }
    return null;
  };

  const createNestedFolders = async (folderStructure, parentFolderId) => {
    const createdFolderIds = [];
    for (const folder of folderStructure) {
      const res = await axiosInstance.post(`/create-folder`, {
        name: folder.name,
        parent_folder: parentFolderId,
        created_by: viewer_id,
      });
      createdFolderIds.push(res.data.folderId);

      if (folder.files && folder.files.length > 0) {
        await createNestedFolders(folder.files, res.data.folderId);
      }
    }
    return createdFolderIds;
  };

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setProgress(0);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [progress]);

  const handleFileUpload = async (file, folderId = null) => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("created_by", viewer_id);
    formData.append("description", "Content");
    if (folderId) {
      formData.append("folder", folderId);
    }

    await axiosInstance.post(`/local-upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
  };

  const onDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const items = event.dataTransfer.items;
    let folderStructure = [];
    let tempFilesToUpload = [];
    let invalidFilesList = [];
    let allFiles = [];

    // Collect all files and folders before processing duplicates
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();

        if (item.isFile) {
          const file = items[i].getAsFile();

          if (!isValidFileType(file)) {
            invalidFilesList.push(file.name);
            continue;
          }

          allFiles.push(file);
        } else if (item.isDirectory) {
          // Check if the item is a directory
          const folderFiles = await getFilesFromFolder(item); // New function to get files from the folder
          folderStructure.push({ name: item.name, files: folderFiles }); // Add folder structure
          allFiles.push(...folderFiles); // Add folder files to the allFiles array
        }
      }

      // Handle invalid files (if any)
      if (invalidFilesList.length > 0) {
        setInvalidFiles(invalidFilesList);
        setShowErrorDialog(true);

        // Show toast for invalid files and stop further execution
        if (invalidFilesList.length === 1) {
          toast.error(`${invalidFilesList[0]} can't be uploaded`);
        } else {
          toast.error(`${invalidFilesList.length} files can't be uploaded`);
        }
      }

      // Handle renaming duplicate files
      const renamedFiles = await renameDuplicates(allFiles);

      // Push renamed files into the upload list
      for (let file of renamedFiles) {
        tempFilesToUpload.push({
          file,
          folderPath: "", // Set folder path if needed
          folderId: folder_ids,
        });
      }

      // If no valid files, show toast and return
      if (tempFilesToUpload.length === 0) {
        if (showErrorDialog) toast.error("No files selected for upload.");
        return;
      }

      // Count total files and folders
      const totalTasks =
        countFilesAndFolders(folderStructure) + tempFilesToUpload.length;

      // Toast to display the number of files
      if (tempFilesToUpload.length > 1) {
        toast.loading(`Uploading ${tempFilesToUpload.length} files...`);
      } else if (tempFilesToUpload.length === 1) {
        toast.loading(`Uploading ${tempFilesToUpload[0].file.name}...`);
      }

      // Handle folder structure creation and file upload
      if (folderStructure.length > 0) {
        const createdFolderStructure = await createNestedFolders(
          folderStructure,
          folder_ids
        );
        await uploadFiles(
          tempFilesToUpload,
          createdFolderStructure,
          totalTasks
        );
      } else {
        await uploadFiles(tempFilesToUpload, folder_ids, totalTasks);
      }

      // Upload progress and success
      toast.dismiss();
      toast.success(`Successfully uploaded ${tempFilesToUpload.length} files.`);
    }
  };

  // New function to get files from a folder
  const getFilesFromFolder = async (folderEntry) => {
    const files = [];
    const reader = folderEntry.createReader();
    const entries = await new Promise((resolve) => {
      reader.readEntries(resolve);
    });

    for (const entry of entries) {
      if (entry.isFile) {
        const file = await new Promise((resolve) => {
          entry.file(resolve);
        });
        files.push(file);
      } else if (entry.isDirectory) {
        const folderFiles = await getFilesFromFolder(entry); // Recursively get files from subfolders
        files.push(...folderFiles);
      }
    }
    return files;
  };

  const renameDuplicates = async (files) => {
    let renamedFiles = [];
    let fileNameMap = {}; // Keep track of used file names (local batch)

    for (let file of files) {
      let originalFileName = file.name;
      const fileExtension =
        originalFileName.substring(originalFileName.lastIndexOf(".")) || ""; // Get extension
      let fileNameWithoutExtension =
        originalFileName.substring(0, originalFileName.lastIndexOf(".")) ||
        originalFileName;

      let uniqueFileName = originalFileName; // Start with the original file name to check duplicacy
      let counter = 1;

      // Check if the file name is already in use locally or on the server
      let fileExists =
        fileNameMap[uniqueFileName] ||
        (await isFileExists({ name: uniqueFileName }));

      // If a duplicate is found locally or on the server, rename it
      while (fileExists) {
        // Rename the file with (1), (2), etc.
        uniqueFileName = `${fileNameWithoutExtension} (${counter})${fileExtension}`;
        counter++;
        fileExists =
          fileNameMap[uniqueFileName] ||
          (await isFileExists({ name: uniqueFileName })); // Check again for the updated name
      }

      // Mark the name as used
      fileNameMap[uniqueFileName] = true;

      // Create a new File object with the updated name (if it was changed)
      const renamedFile = new File([file], uniqueFileName, { type: file.type });
      renamedFiles.push(renamedFile);
    }

    return renamedFiles;
  };

  useEffect(() => {
    const accessToken = cookies.OneDriveAccessToken;
    const OneDriveData = cookies.OneDriveData;
    var OneDriveNamespace;
    if (OneDriveData) {
      OneDriveNamespace = OneDriveData.nameSpace;
    }

    if (accessToken && oneDrivePickerOpen) {
      setFolder_id(folderPath);
      dispatch(
        fetchContentsAsync({
          viewer_id: viewer_id,
          folder_id: folder_id,
          baseURL: baseURL,
          organisation_id: cookies.userData?.organisation?.id,
        })
      );

      let scope;
      scope = `https://${OneDriveNamespace}-my.sharepoint.com`;

      const openOneDrivePicker = (accessToken) => {
        const baseUrl = scope;

        function combine(...paths) {
          return paths
            .map((path) => path.replace(/^[\\|/]/, "").replace(/[\\|/]$/, ""))
            .join("/")
            .replace(/\\/g, "/");
        }
        const params = {
          sdk: "8.0",
          entry: {
            oneDrive: {
              files: {}, // Removed filters from here
            },
          },
          authentication: {},
          messaging: {
            origin: frontendBaseURL,
            channelId: "27",
          },
          typesAndSources: {
            mode: "files",
            pivots: {
              oneDrive: true,
              recent: true,
            },
            // Added filters here with valid ExtFilter format
            filters: [
              ".jpg",
              ".jpeg",
              ".png",
              ".mp4",
              ".mov",
              ".mkv",
              ".pdf",
              ".pptx",
              ".docx",
              ".webp",
              ".gif",
              ".xlsx",
            ],
          },
          selection: {
            mode: "multiple",
          },
        };

        let win = null;
        let port = null;

        async function launchPicker(e) {
          e.preventDefault();

          win = window.open("", "Picker", "width=800,height=600");

          const queryString = new URLSearchParams({
            filePicker: JSON.stringify(params),
          });

          const url = combine(
            baseUrl,
            `_layouts/15/FilePicker.aspx?${queryString}`
          );

          const form = win.document.createElement("form");
          form.setAttribute("action", url);
          form.setAttribute("method", "POST");
          win.document.body.append(form);

          const input = win.document.createElement("input");
          input.setAttribute("type", "hidden");
          input.setAttribute("name", "access_token");
          input.setAttribute("value", accessToken);
          form.appendChild(input);

          win.addEventListener("beforeunload", () => {
            setOneDrivePickerOpen(false);
          });

          form.submit();
          window.addEventListener("message", (event) => {
            if (event.source && event.source === win) {
              const message = event.data;

              if (
                message.type === "initialize" &&
                message.channelId === params.messaging.channelId
              ) {
                port = event.ports[0];

                port.addEventListener("message", messageListener);

                port.start();

                port.postMessage({
                  type: "activate",
                });
              }
            }
          });
        }

        async function messageListener(message) {
          switch (message.data.type) {
            case "notification":
              break;

            case "command":
              port.postMessage({
                type: "acknowledge",
                id: message.data.id,
              });
              const command = message.data.data;

              switch (command.command) {
                case "authenticate":
                  const token = accessToken;

                  if (typeof token !== "undefined" && token !== null) {
                    port.postMessage({
                      type: "result",
                      id: message.data.id,
                      data: {
                        result: "token",
                        token,
                      },
                    });
                  } else {
                    console.error(
                      `Could not get auth token for command: ${JSON.stringify(
                        command
                      )}`
                    );
                  }
                  break;

                case "close":
                  win.close();
                  setOneDrivePickerOpen(false);
                  break;

                case "pick":
                  const fileIds = command.items.map((item) => item.id); // Map all selected file IDs into an array
                  handleOnedriveUpload(fileIds);
                  port.postMessage({
                    type: "result",
                    id: message.data.id,
                    data: {
                      result: "success",
                    },
                  });
                  win.close();
                  setOneDrivePickerOpen(false);
                  break;

                default:
                  console.warn(
                    `Unsupported command: ${JSON.stringify(command)}`
                  );
                  port.postMessage({
                    result: "error",
                    error: {
                      code: "unsupportedCommand",
                      message: command.command,
                    },
                    isExpected: true,
                  });
                  setOneDrivePickerOpen(false);
                  break;
              }
              break;
          }
        }

        launchPicker({ preventDefault: () => {} });
      };
      openOneDrivePicker(accessToken);
    }
  }, [oneDrivePickerOpen]);

  const axiosInstance = useAxiosInstance();

  const handleOnedriveUpload = async (fileIds) => {
    const source_sync = localStorage.getItem("source_sync");

    const OneDriveData = cookies.OneDriveData;
    const accessToken = cookies.OneDriveAccessToken;
    const nameSpace = OneDriveData.nameSpace;

    try {
      await axiosInstance.post(`/onedrive-upload`, {
        fileIDs: fileIds, // Send the array of file IDs
        accessToken: accessToken,
        nameSpace: nameSpace,
        created_by: viewer_id,
        folder_id: folder_id,
        ...(source_sync == 0 && { source_sync: source_sync }),
      });

      setOneDrivePickerOpen(false);
      toast.success("Content Added Successfully!");

      // Check if the user is still in the same folder
      const currentFolder =
        breadcrumbsRef.current.length > 0
          ? breadcrumbsRef.current[breadcrumbsRef.current.length - 1]
          : null;
      const folderId = currentFolder ? currentFolder.id : folder_id || "";

      if (
        breadcrumbsRef.current[breadcrumbsRef.current.length - 1].id == folderId
      ) {
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: folderId,
            baseURL: baseURL,
            organisation_id: cookies.userData?.organisation?.id,
          })
        );
      }
    } catch (error) {
      setOneDrivePickerOpen(false);
      console.error("Error:", error);
      toast.error("Failed to Add Content");
    }
  };

  useEffect(() => {
    const fetchContents = () => {
      const currentFolder =
        breadcrumbsRef.current.length > 0
          ? breadcrumbsRef.current[breadcrumbsRef.current.length - 1]
          : null;
      const folderId = currentFolder ? currentFolder.id : folder_id || "";

      if (
        breadcrumbsRef.current[breadcrumbsRef.current.length - 1].id == folderId
      ) {
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: folderId,
            baseURL: baseURL,
            thumbnail: 1, // Make sure this is set
            organisation_id: cookies.userData?.organisation?.id,
          })
        );
      }
    };

    fetchContents();
  }, [dispatch, breadcrumbs, viewer_id, folder_id, baseURL]);

  const selectedItems = useSelector((state) => state.contents.selectedItems);

  const [activeIndex, setActiveIndex] = useState(null);

  const transformedContents = useMemo(() => {
    return contents.map((user) => ({
      ...user,
      "Created At": user.created_at || "N/A",
      "Created By": user.created_by || "N/A",
      "Updated By": user.updated_by || "N/A",
      "Updated At": user.updated_at || "N/A",
    }));
  }, [contents]);

  const transformedFilterContents = filterData.map((user) => ({
    ...user,
    "Created At": user.created_at || "N/A",
    "Created By": user.created_by || "N/A",
    "Updated By": user.updated_by || "N/A",
    "Updated At": user.updated_at || "N/A",
  }));

  const transformedSearchContents = searchData.map((item) => ({
    ...item,
    "Created At": item.created_at || "N/A",
    "Created By": item.created_by_name || "N/A",
    "Updated By": item.updated_by_name || "N/A",
    "Updated At": item.updated_at || "N/A",
  }));

  const handleToggleCheckbox = (itemId, item) => {
    if (!selectedItems.some((selectedItem) => selectedItem.id === itemId)) {
      dispatch(SelectItem(item));
    } else {
      dispatch(UnSelectItem(item));
    }
  };

  const removeListeners = useCallback(() => {
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", removeListeners);
  }, [mouseMove]);

  useEffect(() => {
    if (activeIndex !== null) {
      window.addEventListener("mousemove", mouseMove);
      window.addEventListener("mouseup", mouseUp);
    }

    return () => {
      removeListeners();
    };
  }, [activeIndex, mouseMove, mouseUp, removeListeners]);

  const handleTileClick = (e, item) => {
    e.stopPropagation();
    handleToggleCheckbox(item.id, item);
  };

  const handleContentOpen = (e, item) => {
    e.stopPropagation();
    handleContentClick(item);
    setContentModalMount(true);
  };

  const handleCanvaOrAdobeClick = (e) => {
    e.stopPropagation();
  };

  const [failedThumbnails, setFailedThumbnails] = useState({});

  const getVideoThumbnail = (url, source) => {
    try {
      if (source.toLowerCase() === "youtube") {
        // Handle both embed and regular YouTube URLs
        const embedId = url.match(
          /(?:embed\/|v=|v\/|youtu\.be\/)([^\/&\?]{11})/
        );
        if (embedId?.[1]) {
          return `https://img.youtube.com/vi/${embedId[1]}/mqdefault.jpg`;
        }
      } else if (source.toLowerCase() === "vimeo") {
        // Handle both embed and regular Vimeo URLs
        const embedId = url.match(
          /(?:video\/|embed\/|player\.vimeo\.com\/)(\d+)/
        );
        if (embedId?.[1]) {
          return `https://vumbnail.com/${embedId[1]}.jpg`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting video thumbnail:", error);
      return null;
    }
  };

  useEffect(() => {
    // Reset failed thumbnails when contents change
    setFailedThumbnails({});
  }, [contents]);

  const handleImageError = (item) => {
    // Check if the item is a PNG
    if (item.mimetype === "image/png") {
      console.log("PNG load failed, checking thumbnail data:", item.thumbnail);
    }
    setFailedThumbnails((prev) => ({
      ...prev,
      [item.id]: true,
    }));
  };

  return (
    <>
      {showErrorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-lg font-semibold mb-4">
              Unsupported file types
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              The following files have unsupported file types:
              <br />
              {invalidFiles.join(", ")}
            </p>

            <SuccessButton
              onClickHandle={handleCloseDialog}
              label="OK" // You want OK in place of the label
            />
          </div>
        </div>
      )}

      {contentModalMount &&
        (contentModalLoading ? (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
            <LoadingSpinner />
          </div>
        ) : (
          <ContentModal
            content={selectedContent}
            isOpen={setContentModalOpen}
            closeModal={closeModal}
            setSelectedContent={setSelectedContent}
            // publicLink={publicLink}
            // setPublicLink={setPublicLink}
            contents={transformedContents} // Pass the array of contents
            handleContentClick={handleContentClick} // Pass the handleContentClick function
          />
        ))}

      {addTagToContent && <AddTagToContentModal />}
      <div
        className="container overflow-auto"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="table-wrapper overflow-auto">
          <div
            className={`shadow-md border-2 tiles-container bg-white ${
              contents.length < 8 ? "h-auto" : "h-[650px] overflow-y-auto"
            }`}
          >
            {searchApplied ? (
              transformedSearchContents.length === 0 ? (
                <div className="flex justify-center items-center">
                  <EmptyFolderComponent />
                </div>
              ) : (
                <div className="grid justify-center items-center grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 mt-[10px]">
                  {sortRows(
                    transformedSearchContents,
                    sortConfig.key,
                    sortConfig.direction
                  ).map((item, index) => {
                    // Calculate the number of columns based on the screen size
                    const columns =
                      window.innerWidth >= 1280
                        ? 6
                        : window.innerWidth >= 1024
                        ? 5
                        : window.innerWidth >= 768
                        ? 4
                        : window.innerWidth >= 640
                        ? 3
                        : 2;

                    // Check if the current item is in the last column
                    const isLastColumn = (index + 1) % columns === 0;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => handleOnMouseEnter(item)}
                        onMouseLeave={() => handleOnMouseLeave(item)}
                        className="relative group"
                      >
                        <div
                          onClick={(e) => handleTileClick(e, item)}
                          className={`hover:bg-gray-100 hover:shadow-md h-[180px] w-full flex flex-col justify-between items-center rounded transition-all duration-200 ${
                            selectedItems.some(
                              (selectedItem) => selectedItem.id === item.id
                            )
                              ? "border-blue-500 shadow-md"
                              : "border-gray-200"
                          }`}
                        >
                          <div
                            className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center transition-opacity duration-200 ${
                              selectedItems.some(
                                (selectedItem) => selectedItem.id === item.id
                              )
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {selectedItems.some(
                              (selectedItem) => selectedItem.id === item.id
                            ) && (
                              <div className="w-4 h-4 bg-primary rounded-full"></div>
                            )}
                          </div>

                          <div className="font-medium text-gray-700 cursor-pointer flex flex-col items-center w-full px-2 pt-4">
                            <div
                              className="mb-2 h-[100px] w-[100px] flex items-center justify-center"
                              onClick={(e) => handleContentOpen(e, item)}
                            >
                              {item.table_identifier === "folder" ? (
                                <FaFolder className="w-20 h-20 text-yellow-400" />
                              ) : item.source.toLowerCase() === "youtube" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  {item.content ? (
                                    <img
                                      className="w-full h-full object-contain"
                                      src={getVideoThumbnail(
                                        item.content,
                                        item.source
                                      )}
                                      alt="youtube thumbnail"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = "none";
                                        const parent = e.target.parentElement;
                                        parent.innerHTML = "";
                                        const icon =
                                          document.createElement("div");
                                        icon.className =
                                          "w-20 h-20 text-red-500";
                                        const youtubeIcon =
                                          document.createElement("i");
                                        parent.appendChild(icon);
                                        ReactDOM.render(
                                          <FaYoutube className="w-20 h-20 text-red-500" />,
                                          icon
                                        );
                                      }}
                                    />
                                  ) : (
                                    <FaYoutube className="w-20 h-20 text-red-500" />
                                  )}
                                </div>
                              ) : item.source.toLowerCase() === "vimeo" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  {item.content ? (
                                    <img
                                      className="w-full h-full object-contain"
                                      src={getVideoThumbnail(
                                        item.content,
                                        item.source
                                      )}
                                      alt="vimeo thumbnail"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = "none";
                                        const parent = e.target.parentElement;
                                        parent.innerHTML = "";
                                        const icon =
                                          document.createElement("div");
                                        icon.className =
                                          "w-20 h-20 text-blue-500";
                                        const vimeoIcon =
                                          document.createElement("i");
                                        parent.appendChild(icon);
                                        ReactDOM.render(
                                          <FaVimeo className="w-20 h-20 text-blue-500" />,
                                          icon
                                        );
                                      }}
                                    />
                                  ) : (
                                    <FaVimeo className="w-20 h-20 text-blue-500" />
                                  )}
                                </div>
                              ) : item.source?.toLowerCase() === "canva link" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <SiCanva className="w-20 h-20 text-blue-600" />
                                </div>
                              ) : item.source?.toLowerCase() === "microsoft stream" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <SiStreamrunners className="w-20 h-20 text-red-600" />
                                </div>
                              ) : item.source.toLowerCase() === "public url" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <IoLinkOutline className="w-20 h-20 text-gray-500" />
                                </div>
                              ) : item.mimetype === "application/pdf" ? (
                                item.thumbnail && !failedThumbnails[item.id] ? (
                                  <img
                                    className="w-full h-full object-contain"
                                    src={getThumbnailUrl(item.thumbnail)}
                                    alt="pdf thumbnail"
                                    onError={(e) => handleImageError(item, e)}
                                  />
                                ) : (
                                  <BsFilePdfFill className="w-20 h-20 text-red-500" />
                                )
                              ) : item.mimetype ===
                                "application/vnd.openxmlformats-officedocument.presentationml.presentation" ? (
                                item.thumbnail && !failedThumbnails[item.id] ? (
                                  <img
                                    className="w-full h-full object-contain"
                                    src={getThumbnailUrl(item.thumbnail)}
                                    alt="pptx thumbnail"
                                    onError={(e) => handleImageError(item, e)}
                                  />
                                ) : (
                                  <BsFiletypePptx className="w-20 h-20 text-orange-600" />
                                )
                              ) : item.mimetype ===
                                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                                item.mimetype === "application/msword" ? (
                                item.thumbnail && !failedThumbnails[item.id] ? (
                                  <img
                                    className="w-full h-full object-contain"
                                    src={getThumbnailUrl(item.thumbnail)}
                                    alt="doc thumbnail"
                                    onError={(e) => handleImageError(item, e)}
                                  />
                                ) : (
                                  <BsFileEarmarkWordFill className="w-20 h-20 text-blue-600" />
                                )
                              ) : item.mimetype === "image/jpeg" ||
                                item.mimetype === "image/png" ||
                                item.mimetype === "image/webp" ||
                                item.mimetype === "image/gif" ||
                                item.mimetype === "image/svg+xml" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  {item.thumbnail &&
                                  !failedThumbnails[item.id] ? (
                                    <img
                                      className="w-full h-full object-contain"
                                      src={getThumbnailUrl(item.thumbnail)}
                                      alt={`${
                                        item.mimetype.split("/")[1]
                                      } thumbnail`}
                                      onError={(e) => handleImageError(item, e)}
                                    />
                                  ) : (
                                    <FaImage className="w-20 h-20 text-blue-400" />
                                  )}
                                  {item.mimetype === "image/gif" && (
                                    <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded">
                                      GIF
                                    </span>
                                  )}
                                </div>
                              ) : item.mimetype === "video/mp4" ||
                                item.mimetype === "video/mov" ? (
                                item.thumbnail && !failedThumbnails[item.id] ? (
                                  <img
                                    className="w-full h-full object-contain"
                                    src={getThumbnailUrl(item.thumbnail)}
                                    alt="video thumbnail"
                                    onError={(e) => handleImageError(item, e)}
                                  />
                                ) : (
                                  <RiVideoFill className="w-20 h-20 text-pink-500" />
                                )
                              ) : null}
                            </div>
                            <span
                              className="text-center truncate w-full mt-2"
                              title={item.name}
                              onClick={(e) => handleContentOpen(e, item)}
                            >
                              {item.name.length > 15
                                ? `${item.name.substring(0, 15)}...`
                                : item.name}
                            </span>
                          </div>

                          {item.mimetype &&
                            item.mimetype.includes("image/") && (
                              <div className="flex flex-col border-2 ">
                                {canvaAccessToken && (
                                  <div
                                    className="absolute top-1 right-0"
                                    onClick={handleCanvaOrAdobeClick}
                                  >
                                    <Canva
                                      item={item}
                                      activeContent={activeContent}
                                      setActiveContent={setActiveContent}
                                      showCanvaOptions={showCanvaOptions}
                                      setShowCanvaOptions={setShowCanvaOptions}
                                      lastColumn={isLastColumn}
                                    />
                                  </div>
                                )}
                                {
                                  <div
                                    className="absolute top-1  right-6"
                                    onClick={handleCanvaOrAdobeClick}
                                  >
                                    <AdobeExpress
                                      item={item}
                                      activeContent={activeContent}
                                      setActiveContent={setActiveContent}
                                      showAdobeOptions={showAdobeOptions}
                                      setShowAdobeOptions={setShowAdobeOptions}
                                      lastColumn={isLastColumn} // Passing lastColumn as prop
                                    />
                                  </div>
                                }
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}

                  <CanvaDesignsGallery />
                </div>
              )
            ) : filter.filterApplied && filter.filterAppliedOn === "content" ? (
              transformedFilterContents.length === 0 ? (
                <div className="flex justify-center items-center">
                  <EmptyFolderComponent />
                </div>
              ) : (
                <div className="grid justify-center items-center grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 mt-[10px]">
                  {sortRows(
                    transformedFilterContents,
                    sortConfig.key,
                    sortConfig.direction
                  ).map((item, index) => {
                    const totalItems = sortRows(
                      transformedFilterContents,
                      sortConfig.key,
                      sortConfig.direction
                    ).length;

                    // Calculate the number of columns based on the screen size
                    const columns =
                      window.innerWidth >= 1280
                        ? 6
                        : window.innerWidth >= 1024
                        ? 5
                        : window.innerWidth >= 768
                        ? 4
                        : window.innerWidth >= 640
                        ? 3
                        : 2;

                    // Check if the current item is in the last column
                    const isLastColumn = (index + 1) % columns === 0;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => handleOnMouseEnter(item)}
                        onMouseLeave={() => handleOnMouseLeave(item)}
                        className="relative group"
                      >
                        <div
                          onClick={(e) => handleTileClick(e, item)}
                          className={`hover:bg-gray-100 hover:shadow-md h-[180px] w-full flex flex-col justify-between items-center rounded transition-all duration-200 ${
                            selectedItems.some(
                              (selectedItem) => selectedItem.id === item.id
                            )
                              ? "border-blue-500 shadow-md"
                              : "border-gray-200"
                          }`}
                        >
                          <div
                            className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center transition-opacity duration-200 ${
                              selectedItems.some(
                                (selectedItem) => selectedItem.id === item.id
                              )
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {selectedItems.some(
                              (selectedItem) => selectedItem.id === item.id
                            ) && (
                              <div className="w-4 h-4 bg-primary rounded-full"></div>
                            )}
                          </div>

                          <div className="font-medium text-gray-700 cursor-pointer flex flex-col items-center w-full px-2 pt-4">
                            <div
                              className="mb-2 h-[100px] w-[100px] flex items-center justify-center"
                              onClick={(e) => handleContentOpen(e, item)}
                            >
                              {item.table_identifier === "folder" ? (
                                <FaFolder className="w-20 h-20 text-yellow-400" />
                              ) : item.source.toLowerCase() === "youtube" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  {item.content ? (
                                    <img
                                      className="w-full h-full object-contain"
                                      src={getVideoThumbnail(
                                        item.content,
                                        item.source
                                      )}
                                      alt="youtube thumbnail"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = "none";
                                        const parent = e.target.parentElement;
                                        parent.innerHTML = "";
                                        const icon =
                                          document.createElement("div");
                                        icon.className =
                                          "w-20 h-20 text-red-500";
                                        const youtubeIcon =
                                          document.createElement("i");
                                        parent.appendChild(icon);
                                        ReactDOM.render(
                                          <FaYoutube className="w-20 h-20 text-red-500" />,
                                          icon
                                        );
                                      }}
                                    />
                                  ) : (
                                    <FaYoutube className="w-20 h-20 text-red-500" />
                                  )}
                                </div>
                              ) : item.source.toLowerCase() === "vimeo" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  {item.content ? (
                                    <img
                                      className="w-full h-full object-contain"
                                      src={getVideoThumbnail(
                                        item.content,
                                        item.source
                                      )}
                                      alt="vimeo thumbnail"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = "none";
                                        const parent = e.target.parentElement;
                                        parent.innerHTML = "";
                                        const icon =
                                          document.createElement("div");
                                        icon.className =
                                          "w-20 h-20 text-blue-500";
                                        const vimeoIcon =
                                          document.createElement("i");
                                        parent.appendChild(icon);
                                        ReactDOM.render(
                                          <FaVimeo className="w-20 h-20 text-blue-500" />,
                                          icon
                                        );
                                      }}
                                    />
                                  ) : (
                                    <FaVimeo className="w-20 h-20 text-blue-500" />
                                  )}
                                </div>
                              ) : item.source.toLowerCase() === "public url" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <IoLinkOutline className="w-20 h-20 text-gray-500" />
                                </div>
                              ) : item.source?.toLowerCase() === "canva link" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <SiCanva className="w-20 h-20 text-blue-600" />
                                </div>
                              ) : item.source?.toLowerCase() === "microsoft stream" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <SiStreamrunners className="w-20 h-20 text-red-600" />
                                </div>
                              ) : item.mimetype === "application/pdf" ? (
                                item.thumbnail && !failedThumbnails[item.id] ? (
                                  <img
                                    className="w-full h-full object-contain"
                                    src={getThumbnailUrl(item.thumbnail)}
                                    alt="pdf thumbnail"
                                    onError={(e) => handleImageError(item, e)}
                                  />
                                ) : (
                                  <BsFilePdfFill className="w-20 h-20 text-red-500" />
                                )
                              ) : item.mimetype ===
                                "application/vnd.openxmlformats-officedocument.presentationml.presentation" ? (
                                item.thumbnail && !failedThumbnails[item.id] ? (
                                  <img
                                    className="w-full h-full object-contain"
                                    src={getThumbnailUrl(item.thumbnail)}
                                    alt="pptx thumbnail"
                                    onError={(e) => handleImageError(item, e)}
                                  />
                                ) : (
                                  <BsFiletypePptx className="w-20 h-20 text-orange-600" />
                                )
                              ) : item.mimetype ===
                                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                                item.mimetype === "application/msword" ? (
                                item.thumbnail && !failedThumbnails[item.id] ? (
                                  <img
                                    className="w-full h-full object-contain"
                                    src={getThumbnailUrl(item.thumbnail)}
                                    alt="doc thumbnail"
                                    onError={(e) => handleImageError(item, e)}
                                  />
                                ) : (
                                  <BsFileEarmarkWordFill className="w-20 h-20 text-blue-600" />
                                )
                              ) : item.mimetype === "image/jpeg" ||
                                item.mimetype === "image/png" ||
                                item.mimetype === "image/webp" ||
                                item.mimetype === "image/gif" ||
                                item.mimetype === "image/svg+xml" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  {item.thumbnail &&
                                  !failedThumbnails[item.id] ? (
                                    <img
                                      className="w-full h-full object-contain"
                                      src={getThumbnailUrl(item.thumbnail)}
                                      alt={`${
                                        item.mimetype.split("/")[1]
                                      } thumbnail`}
                                      onError={(e) => handleImageError(item, e)}
                                    />
                                  ) : (
                                    <FaImage className="w-20 h-20 text-blue-400" />
                                  )}
                                  {item.mimetype === "image/gif" && (
                                    <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded">
                                      GIF
                                    </span>
                                  )}
                                </div>
                              ) : item.mimetype === "video/mp4" ||
                                item.mimetype === "video/mov" ? (
                                item.thumbnail && !failedThumbnails[item.id] ? (
                                  <img
                                    className="w-full h-full object-contain"
                                    src={getThumbnailUrl(item.thumbnail)}
                                    alt="video thumbnail"
                                    onError={(e) => handleImageError(item, e)}
                                  />
                                ) : (
                                  <RiVideoFill className="w-20 h-20 text-pink-500" />
                                )
                              ) : null}
                            </div>
                            <span
                              className="text-center truncate w-full mt-2"
                              title={item.name}
                              onClick={(e) => handleContentOpen(e, item)}
                            >
                              {item.name.length > 15
                                ? `${item.name.substring(0, 15)}...`
                                : item.name}
                            </span>
                          </div>

                          {item.mimetype &&
                            item.mimetype.includes("image/") && (
                              <div className="flex flex-col border-2 ">
                                {canvaAccessToken && (
                                  <div
                                    className="absolute top-1 right-0"
                                    onClick={handleCanvaOrAdobeClick}
                                  >
                                    <Canva
                                      item={item}
                                      activeContent={activeContent}
                                      setActiveContent={setActiveContent}
                                      showCanvaOptions={showCanvaOptions}
                                      setShowCanvaOptions={setShowCanvaOptions}
                                      lastColumn={isLastColumn}
                                    />
                                  </div>
                                )}

                                <div
                                  className="absolute top-1  right-6"
                                  onClick={handleCanvaOrAdobeClick}
                                >
                                  <AdobeExpress
                                    item={item}
                                    activeContent={activeContent}
                                    setActiveContent={setActiveContent}
                                    showAdobeOptions={showAdobeOptions}
                                    setShowAdobeOptions={setShowAdobeOptions}
                                    lastColumn={isLastColumn} // Passing lastColumn as prop
                                  />
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}

                  <CanvaDesignsGallery />
                </div>
              )
            ) : loading ? (
              <TilsLoading />
            ) : contents.length === 0 ? (
              <div className="flex justify-center items-center">
                <EmptyFolderComponent />
              </div>
            ) : (
              <div className="grid justify-center items-center grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 mt-[10px]">
                {sortRows(
                  transformedContents,
                  sortConfig.key,
                  sortConfig.direction
                ).map((item, index) => {
                  // Calculate the number of columns based on the screen size
                  const columns =
                    window.innerWidth >= 1280
                      ? 6
                      : window.innerWidth >= 1024
                      ? 5
                      : window.innerWidth >= 768
                      ? 4
                      : window.innerWidth >= 640
                      ? 3
                      : 2;

                  // Check if the current item is in the last column
                  const isLastColumn = (index + 1) % columns === 0;

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => handleOnMouseEnter(item)}
                      onMouseLeave={() => handleOnMouseLeave(item)}
                      className="relative group"
                    >
                      <div
                        onClick={(e) => handleTileClick(e, item)}
                        className={`hover:bg-gray-100 hover:shadow-md h-[180px] w-full flex flex-col justify-between items-center rounded transition-all duration-200 ${
                          selectedItems.some(
                            (selectedItem) => selectedItem.id === item.id
                          )
                            ? "border-blue-500 shadow-md"
                            : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center transition-opacity duration-200 ${
                            selectedItems.some(
                              (selectedItem) => selectedItem.id === item.id
                            )
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {selectedItems.some(
                            (selectedItem) => selectedItem.id === item.id
                          ) && (
                            <div className="w-4 h-4 bg-primary rounded-full"></div>
                          )}
                        </div>

                        <div className="font-medium text-gray-700 cursor-pointer flex flex-col items-center w-full px-2 pt-4">
                          <div
                            className="mb-2 h-[100px] w-[100px] flex items-center justify-center"
                            onClick={(e) => handleContentOpen(e, item)}
                          >
                            {item.table_identifier === "folder" ? (
                              <FaFolder className="w-20 h-20 text-yellow-400" />
                            ) : item.source.toLowerCase() === "youtube" ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                {item.content ? (
                                  <img
                                    className="w-full h-full object-contain"
                                    src={getVideoThumbnail(
                                      item.content,
                                      item.source
                                    )}
                                    alt="youtube thumbnail"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = "none";
                                      const parent = e.target.parentElement;
                                      parent.innerHTML = "";
                                      const icon =
                                        document.createElement("div");
                                      icon.className = "w-20 h-20 text-red-500";
                                      const youtubeIcon =
                                        document.createElement("i");
                                      parent.appendChild(icon);
                                      ReactDOM.render(
                                        <FaYoutube className="w-20 h-20 text-red-500" />,
                                        icon
                                      );
                                    }}
                                  />
                                ) : (
                                  <FaYoutube className="w-20 h-20 text-red-500" />
                                )}
                              </div>
                            ) : item.source.toLowerCase() === "vimeo" ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                {item.content ? (
                                  <img
                                    className="w-full h-full object-contain"
                                    src={getVideoThumbnail(
                                      item.content,
                                      item.source
                                    )}
                                    alt="vimeo thumbnail"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = "none";
                                      const parent = e.target.parentElement;
                                      parent.innerHTML = "";
                                      const icon =
                                        document.createElement("div");
                                      icon.className =
                                        "w-20 h-20 text-blue-500";
                                      const vimeoIcon =
                                        document.createElement("i");
                                      parent.appendChild(icon);
                                      ReactDOM.render(
                                        <FaVimeo className="w-20 h-20 text-blue-500" />,
                                        icon
                                      );
                                    }}
                                  />
                                ) : (
                                  <FaVimeo className="w-20 h-20 text-blue-500" />
                                )}
                              </div>
                            ) : item.source.toLowerCase() === "public url" ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                <IoLinkOutline className="w-20 h-20 text-gray-500" />
                              </div>
                            ) : item.source?.toLowerCase() === "canva link" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <SiCanva className="w-20 h-20 text-blue-600" />
                                </div>
                            ) : item.source?.toLowerCase() === "microsoft stream" ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                  <SiStreamrunners className="w-20 h-20 text-red-600" />
                                </div>
                            ) : item.mimetype === "application/pdf" ? (
                              item.thumbnail && !failedThumbnails[item.id] ? (
                                <img
                                  className="w-full h-full object-contain"
                                  src={getThumbnailUrl(item.thumbnail)}
                                  alt="pdf thumbnail"
                                  onError={(e) => handleImageError(item, e)}
                                />
                              ) : (
                                <BsFilePdfFill className="w-20 h-20 text-red-500" />
                              )
                            ) : item.mimetype ===
                              "application/vnd.openxmlformats-officedocument.presentationml.presentation" ? (
                              item.thumbnail && !failedThumbnails[item.id] ? (
                                <img
                                  className="w-full h-full object-contain"
                                  src={getThumbnailUrl(item.thumbnail)}
                                  alt="pptx thumbnail"
                                  onError={(e) => handleImageError(item, e)}
                                />
                              ) : (
                                <BsFiletypePptx className="w-20 h-20 text-orange-600" />
                              )
                            ) : item.mimetype ===
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                              item.mimetype === "application/msword" ? (
                              item.thumbnail && !failedThumbnails[item.id] ? (
                                <img
                                  className="w-full h-full object-contain"
                                  src={getThumbnailUrl(item.thumbnail)}
                                  alt="doc thumbnail"
                                  onError={(e) => handleImageError(item, e)}
                                />
                              ) : (
                                <BsFileEarmarkWordFill className="w-20 h-20 text-blue-600" />
                              )
                            ) : item.mimetype === "image/jpeg" ||
                              item.mimetype === "image/png" ||
                              item.mimetype === "image/webp" ||
                              item.mimetype === "image/gif" ||
                              item.mimetype === "image/svg+xml" ? (
                              <div className="relative w-full h-full flex items-center justify-center">
                                {item.thumbnail &&
                                !failedThumbnails[item.id] ? (
                                  <img
                                    className="w-full h-full object-contain"
                                    src={getThumbnailUrl(item.thumbnail)}
                                    alt={`${
                                      item.mimetype.split("/")[1]
                                    } thumbnail`}
                                    onError={(e) => handleImageError(item, e)}
                                  />
                                ) : (
                                  <FaImage className="w-20 h-20 text-blue-400" />
                                )}
                                {item.mimetype === "image/gif" && (
                                  <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded">
                                    GIF
                                  </span>
                                )}
                              </div>
                            ) : item.mimetype === "video/mp4" ||
                              item.mimetype === "video/mov" ? (
                              item.thumbnail && !failedThumbnails[item.id] ? (
                                <img
                                  className="w-full h-full object-contain"
                                  src={getThumbnailUrl(item.thumbnail)}
                                  alt="video thumbnail"
                                  onError={(e) => handleImageError(item, e)}
                                />
                              ) : (
                                <RiVideoFill className="w-20 h-20 text-pink-500" />
                              )
                            ) : null}
                          </div>
                          <span
                            className="text-center truncate w-full mt-2"
                            title={item.name}
                            onClick={(e) => handleContentOpen(e, item)}
                          >
                            {item.name.length > 15
                              ? `${item.name.substring(0, 15)}...`
                              : item.name}
                          </span>
                        </div>

                        {item.mimetype && item.mimetype.includes("image/") && (
                          <div className="flex flex-col border-2 ">
                            {canvaAccessToken && (
                              <div
                                className="absolute top-1 right-0"
                                onClick={handleCanvaOrAdobeClick}
                              >
                                <Canva
                                  item={item}
                                  activeContent={activeContent}
                                  setActiveContent={setActiveContent}
                                  showCanvaOptions={showCanvaOptions}
                                  setShowCanvaOptions={setShowCanvaOptions}
                                  lastColumn={isLastColumn}
                                />
                              </div>
                            )}
                            <div
                              className="absolute top-1  right-6"
                              onClick={handleCanvaOrAdobeClick}
                            >
                              <AdobeExpress
                                item={item}
                                activeContent={activeContent}
                                setActiveContent={setActiveContent}
                                showAdobeOptions={showAdobeOptions}
                                setShowAdobeOptions={setShowAdobeOptions}
                                lastColumn={isLastColumn} // Passing lastColumn as prop
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <CanvaDesignsGallery />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ContentTils;
