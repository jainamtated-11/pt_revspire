import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useContext,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import useContentHandler from "./useContentHandler.js";
import toast from "react-hot-toast";
import "./Table.css";
import { CiFileOn } from "react-icons/ci";
import { TbFileTypeDocx } from "react-icons/tb";
import { LuFileSpreadsheet } from "react-icons/lu";
import { GrDocumentPpt } from "react-icons/gr";
import { BsFiletypePptx } from "react-icons/bs";
import { FaRegFileWord } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { SiCanva } from "react-icons/si";
import { SiStreamrunners } from "react-icons/si";
import { FaRegFilePdf } from "react-icons/fa6";
import { IoImagesOutline } from "react-icons/io5";
import { AiOutlineYoutube } from "react-icons/ai";
import { RiVimeoLine } from "react-icons/ri";
import { FiLink } from "react-icons/fi";
import { TfiLayoutMediaOverlay } from "react-icons/tfi";
import { BsFileEarmarkText } from "react-icons/bs";
import {
  faFolder,
  faFile,
  faFilePdf,
  faFileImage,
  faFileVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FcFolder } from "react-icons/fc";
import ContentModal from "./ContentModal.jsx";
import LoadingSpinner from "../../../../utility/LoadingSpinner.jsx";
import EmptyFolderComponent from "./EmptyFolderComponent.jsx";
import AddTagToContentModal from "../Operations/AddTagToContentModal.jsx";
import { formatDate } from "../../../../constants.js";
import {
  fetchContentsAsync,
  SelectAllItems,
  UnSelectAllItems,
  UnSelectItem,
  SelectItem,
  fetchModalContentsAsync,
  SetSelectedItems,
} from "../../../../features/content/contentSlice.js";
import TableLoading from "./TableLoading.jsx";
import { fetchContents } from "../../../../features/content/contentApi.js";
import "../../../MainDashboard/ContentManager/ContentTable/Table.css";
import { useCookies } from "react-cookie";
import Canva from "../Canva/Canva.jsx";
import CanvaDesignsGallery from "../Canva/CanvaDesignGallery.jsx";
import AdobeExpress from "../AdobeExpress/AdobeExpress.jsx";
import SuccessButton from "../../../../utility/SuccessButton.jsx";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { LiaFilterSolid } from "react-icons/lia";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../../features/search/searchSlice.js";
import HighlightText from "../../../../utility/HighlightText.jsx";

const createHeaders = (headers) => {
  return headers.map((item) => ({
    header: item,
    accessorKey: item,
  }));
};

export const getIcon = (item, className) => {
  switch (
    item.source == "Youtube"
      ? "youtube"
      : item.source == "Vimeo"
      ? "vimeo"
      : item.source == "Microsoft Stream"
      ? "microsoftStream"
      : item.source == "Canva Link"
      ? "canvaLink"
      : item.mimetype || item.content_mimetype || item.source
  ) {
    case "application/pdf":
      return (
        <FaRegFilePdf
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "image/jpeg":
    case "image/png":
    case "image/jpg":
    case "image/gif":
    case "image/webp":
      return (
        <IoImagesOutline
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.ms-excel":
      return (
        <FaRegFileExcel
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/msword":
      return (
        <FaRegFileWord
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return (
        <BsFiletypePptx
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.ms-powerpoint":
      return (
        <GrDocumentPpt
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return (
        <LuFileSpreadsheet
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return (
        <TbFileTypeDocx
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/url":
      return (
        <FiLink
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/octet-stream":
      return (
        <CiFileOn
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "video/mp4":
      return (
        <MdOutlineSlowMotionVideo
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    case "application/x-javascript":
      return (
        <TfiLayoutMediaOverlay
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );
    case "application/vnd.ms-visio.drawing":
      return (
        <BsFileEarmarkText
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    case "youtube":
      return (
        <AiOutlineYoutube
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    case "vimeo":
      return (
        <RiVimeoLine
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    case "microsoftStream":
      return (
        <SiStreamrunners
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    case "canvaLink":
      return (
        <SiCanva
          className={twMerge("text-gray-500 w-5 h-5 flex-shrink-0", className)}
          style={{ width: "20px" }}
        />
      );

    default:
      return (
        <FcFolder
          className="text-yellow-300 w-5 h-5 flex-shrink-0"
          style={{ width: "20px" }}
        />
      );
  }
};

const ContentTable = ({
  viewer_id,
  minCellWidth,
  setContentPlaceHolders,
  setContentPlaceHolderModal,
}) => {
  const {
    setContentModalOpen,
    addTagToContent,
    contentModalLoading,
    folderPath,
    baseURL,
    showButtonLoading,
    setFolder_id,
    frontendBaseURL,
    folder_id,
    oneDrivePickerOpen,
    setOneDrivePickerOpen,
    setDriveSelection,
    name,
    contentCollabration,
    setContentId,
  } = useContext(GlobalContext);

  const {
    contents,
    handleContentClick,
    selectedContent,
    setSelectedContent,
    publicLink,
    setPublicLink,
  } = useContentHandler({ viewer_id, minCellWidth });
  const [contentModalMounted, setContentModaMounted] = useState(false);

  const dispatch = useDispatch();
  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
  const [breadcrumb, setBreadcrumb] = useState("");
  const [currBreadcrumb, setCurrBreadcrumb] = useState("");
  const [activeContent, setActiveContent] = useState("");
  const [showCanvaOptions, setShowCanvaOptions] = useState("");
  const [showAdobeOptions, setShowAdobeOptions] = useState("");
  const [sameFolderUsers, setSameFolderUsers] = useState([]);
  const [userDownStreamFolders, setUserDownStreamFolders] = useState([]);
  const [userDownStreamFolderNames, setUserDownStreamFolderNames] = useState(
    []
  );
  const [userOnFolder, setUserOnFolder] = useState({
    users: [],
    folderName: "",
  });

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [invalidFiles, setInvalidFiles] = useState([]); // For tracking invalid files
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tableData, setTableData] = useState(contents);
  const [sortConfig, setSortConfig] = useState({
    key: "Updated At",
    direction: "desc",
  });
  const thRefs = useRef([]);
  const [resizing, setResizing] = useState(false);
  const [resizeIndex, setResizeIndex] = useState(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const selectedItems = useSelector((state) => state.contents.selectedItems);
  const selectedContents = useSelector(
    (state) => state.contents.selectedContents
  );

  const folder_ids = useSelector((state) => state.contents.folder_id);

  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  const currentFolder =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
  const folderId = currentFolder ? currentFolder.id : folder_id || "";

  const wrapperRef = useRef(null);
  const breadcrumbsRef = useRef(breadcrumbs);

  const columnHeading = [
    "name",
    "source",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
  ];

  const [selectionMode] = useState("multiple");

  const filter = useSelector((state) => state.filter);
  const filterData = useSelector((state) => state.filter.filterData);
  const loading = useSelector((state) => state.contents.loading);

  const [cookies] = useCookies([
    "OneDriveData",
    "OneDriveAccessToken",
    "GoogleDirveAccessToken",
    "googleApiKey",
    "canvaAccessToken",
    "userData",
    "revspireToken",
  ]);

  const organisation_id = cookies.userData?.organisation?.id;

  const canvaAccessToken = cookies.canvaAccessToken;

  const token = cookies.revspireToken;

  useEffect(() => {
    breadcrumbsRef.current = breadcrumbs;
  }, [breadcrumbs]);

  useEffect(() => {
    setTableData(contents);
  }, [contents]);

  const columns = createHeaders(columnHeading);

  useEffect(() => {
    thRefs.current = thRefs.current.slice(0, columns.length);
    setCurrBreadcrumb(breadcrumbs);
  }, []);

  useEffect(() => {
    localStorage.removeItem("currentFolderId");
    localStorage.setItem("currentFolderId", folderId);
  }, [breadcrumbs]);

  const [socket, setSocket] = useState(null);

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

  useEffect(() => {
    if (contentCollabration) {
      const wsBaseURL = baseURL.replace("https://", "wss://") + "/wss/";
      // Format the protocol header with "token=" prefix
      const ws = new WebSocket(wsBaseURL, [token]);
      ws.onopen = () => {
        setSocket(ws);
        console.log("WebSocket connected");
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.status == "success") {
          setSameFolderUsers(response?.sameFolderUsers);
          const userDownStreamFolders = response?.downstreamUsers?.map((user) =>
            user.folderPath.split(":;<>;:").pop()
          );
          const userDownStreamFolderNames = response?.downstreamUsers?.map(
            (user) => {
              return {
                ...user,
                folderName: user.folderPath.split(":;<>;:").pop(),
              };
            }
          );
          setUserDownStreamFolders(userDownStreamFolders);
          setUserDownStreamFolderNames(userDownStreamFolderNames);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
      };

      return () => {
        if (ws) {
          ws.close();
        }
      };
    }
  }, [baseURL, contentCollabration]);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setProgress(0);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [progress]);

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN && contentCollabration) {
      // Function to send the data
      const sendData = () => {
        let folderPath = breadcrumbs.map((b) => b.name).join(":;<>;:");
        const data = {
          type: "set_folder_state",
          payload: {
            userId: viewer_id,
            folderPath: folderPath,
            fullName: name,
          },
        };

        socket.send(JSON.stringify(data));
      };

      sendData();

      const intervalId = setInterval(sendData, 3000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [socket, breadcrumbs, contentCollabration, viewer_id, name]);

  const handleSort = (key) => {
    const direction =
      sortConfig && sortConfig.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key, direction });

    setTableData(
      [...tableData].sort((a, b) => {
        // Map the column header to the actual data property
        let aValue, bValue;

        switch (key) {
          case "name":
            aValue = a.name;
            bValue = b.name;
            break;
          case "source":
            aValue = a.source;
            bValue = b.source;
            break;
          case "Created By":
            // Use created_by instead of created_by_name
            aValue = a.created_by || "";
            bValue = b.created_by || "";
            break;
          case "Created At":
            aValue = new Date(a.created_at);
            bValue = new Date(b.created_at);
            return direction === "asc" ? aValue - bValue : bValue - aValue;
          case "Updated By":
            // Use updated_by instead of updated_by_name
            aValue = a.updated_by || "";
            bValue = b.updated_by || "";
            break;
          case "Updated At":
            aValue = new Date(a.updated_at);
            bValue = new Date(b.updated_at);
            return direction === "asc" ? aValue - bValue : bValue - aValue;
          default:
            aValue = a[key];
            bValue = b[key];
        }

        // Convert to lowercase strings for comparison (except for dates which are handled above)
        if (!(aValue instanceof Date)) {
          aValue = (aValue || "").toString().toLowerCase();
          bValue = (bValue || "").toString().toLowerCase();
        }

        if (aValue < bValue) return direction === "asc" ? -1 : 1;
        if (aValue > bValue) return direction === "asc" ? 1 : -1;
        return 0;
      })
    );
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-2 text-gray-500" />;
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

  const handleResizeMove = useCallback(
    (event) => {
      if (!resizing || resizeIndex === null) return;

      const diff = event.pageX - resizeStartX;
      const newWidth = Math.max(resizeStartWidth + diff, 50);

      if (thRefs.current[resizeIndex]) {
        thRefs.current[resizeIndex].style.minWidth = `${newWidth}px`;
        thRefs.current[resizeIndex].style.width = `${newWidth}px`;
        thRefs.current[resizeIndex].style.maxWidth = `${newWidth}px`;
      }
    },
    [resizing, resizeIndex, resizeStartX, resizeStartWidth]
  );

  const handleResizeEnd = useCallback(() => {
    setResizing(false);
    setResizeIndex(null);
  }, []);

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [resizing, handleResizeMove, handleResizeEnd]);

  const handleCloseDialog = () => {
    setShowErrorDialog(false);
    setInvalidFiles([]); // Reset invalid files after closing the dialog
  };

  const handleOnMouseEnter = (item, event) => {
    if (item.mimetype && item.mimetype.includes("image/")) {
      setActiveContent(item.id);
    }
    const users = userDownStreamFolderNames.filter(
      (user) => user.folderName === item.name
    );
    setUserOnFolder({
      users: users,
      folderName: item.name,
    });

    if (users.length > 0) {
      setPopupPosition({ x: event.clientX, y: event.clientY });
      setPopupVisible(true);
    }
  };

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

  const handleOnMouseLeave = (item) => {
    if (item.mimetype && item.mimetype.includes("image/")) {
      setActiveContent("");
    }
    setPopupVisible(false);
    setUserOnFolder({
      users: [],
      folderName: "",
    });
  };

  const closeModal = () => {
    setContentModalOpen(false);
    setContentModaMounted(false);
  };

  useEffect(() => {
    setBreadcrumb(breadcrumbs);
    if (currBreadcrumb == breadcrumb)
      dispatch(
        fetchModalContentsAsync({
          viewer_id,
          folderId,
          baseURL,
          organisation_id,
        })
      );
  }, [folder_id, viewer_id, baseURL]);

  useEffect(() => {
    const accessToken = cookies.OneDriveAccessToken;
    const OneDriveData = cookies.OneDriveData;
    var OneDriveNamespace;
    if (OneDriveData) {
      OneDriveNamespace = OneDriveData.nameSpace;
    }
    if (accessToken && oneDrivePickerOpen) {
      setFolder_id(folderPath);

      let scope = `https://${OneDriveNamespace}-my.sharepoint.com`;

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
            mode: selectionMode,
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
          setDriveSelection(false);

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
              console.log(`notification: ${message.data}`);
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
                  handleOnedriveUpload(fileIds); // Pass the array to the upload handler
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
  }, [oneDrivePickerOpen, selectionMode]);

  const axiosInstance = useAxiosInstance();

  const handleOnedriveUpload = async (fileIds) => {
    const source_sync = localStorage.getItem("source_sync");
    const versionUpload = localStorage.getItem("versionUpload");

    const OneDriveData = cookies.OneDriveData;
    const accessToken = cookies.OneDriveAccessToken;
    const nameSpace = OneDriveData.nameSpace;

    setOneDrivePickerOpen(false);

    const currentFolder =
      breadcrumbsRef.current.length > 0
        ? breadcrumbsRef.current[breadcrumbsRef.current.length - 1]
        : null;
    const folderId = currentFolder ? currentFolder.id : folder_id || "";

    if (versionUpload === 1 || versionUpload === "1") {
      toast
        .promise(
          axiosInstance.post(
            `/onedrive-version-upload`,
            {
              fileIDs: fileIds,
              accessToken: accessToken,
              nameSpace: nameSpace,
              created_by: viewer_id,
              folder_id: folderId,
              version_parent: selectedItems[0].id,
              source_sync: "1",
            },
            { withCredentials: true } // <== Added this
          ),
          {
            loading: `Uploading files ...`,
            success: "Content Added Successfully!",
            error: "Failed to Add Content",
          }
        )
        .then((response) => {
          if (
            breadcrumbsRef.current[breadcrumbsRef.current.length - 1].id ==
            folderId
          ) {
            dispatch(
              fetchContentsAsync({
                viewer_id,
                folder_id: folderId,
                baseURL: baseURL,
                organisation_id: cookies.userData?.organisation?.id,
              })
            );
            setContentId(response?.data?.newContent[0]?.id);
            dispatch(SetSelectedItems(response?.data?.newContent));
          }
        });
      localStorage.setItem("versionUpload", 0);
      const vafter = localStorage.getItem("versionUpload");
    } else {
      toast
        .promise(
          axiosInstance.post(`/onedrive-upload`, {
            fileIDs: fileIds, // Send the array of file IDs
            accessToken: accessToken,
            nameSpace: nameSpace,
            created_by: viewer_id,
            folder_id: folderId,
            ...(source_sync == 0 && { source_sync: source_sync }),
          }),
          {
            loading: `Uploading files ...`,
            success: "Content Added Successfully!",
            error: "Failed to Add Content",
          }
        )
        .then((response) => {
          // Check for placeholders in the uploaded content
          const uploadedFiles = response.data.uploadedFiles;
          const contentPlaceHolder = uploadedFiles.filter(
            (file) => file.placeholders.length > 0
          );
          if (contentPlaceHolder.length > 0) {
            setContentPlaceHolderModal(true); // Show the modal
            setContentPlaceHolders(contentPlaceHolder); // Set the placeholders
          }
          if (
            breadcrumbsRef.current[breadcrumbsRef.current.length - 1].id ==
            folderId
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
        });
    }
  };
  // console.log("FOLDER IDDDD", breadcrumbs[breadcrumbs.length - 1].id);
  useEffect(() => {
    if (currBreadcrumb == breadcrumb)
      fetchContents(dispatch, breadcrumbs, viewer_id, folderId, baseURL);
  }, [dispatch, breadcrumbs, viewer_id, folder_id, baseURL]);

  useEffect(() => {
    const fetchContents = () => {
      const currentFolder =
        breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;

      const folderId = currentFolder ? currentFolder.id : folder_id || "";
      dispatch(
        fetchContentsAsync({
          viewer_id,
          folder_id: folderId,
          baseURL: baseURL,
          organisation_id: cookies.userData?.organisation?.id,
        })
      );
    };
    fetchContents();
  }, [breadcrumbs, viewer_id, folder_id, baseURL]);

  function getIconByMimeType(mimeType) {
    switch (mimeType) {
      case "application/pdf":
        return faFilePdf;
      case "image/jpeg":
      case "image/png":
      case "image/gif":
      case "image/webp":
        return faFileImage;
      case "video/mp4":
        return faFileVideo;
      case "video/mov":
        return faFileVideo;
      default:
        return faFile;
    }
  }

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

  // Function to recursively build folder structure and collect files
  const buildFolderStructure = async (
    directoryEntry,
    filesToUpload,
    parentPath = ""
  ) => {
    if (directoryEntry.isDirectory) {
      if (directoryEntry.name === "desktop.ini") return null; // Skip desktop.ini

      const folder = {
        name: directoryEntry.name,
        subFolders: [],
      };

      const reader = directoryEntry.createReader();
      const entries = await new Promise((resolve) =>
        reader.readEntries(resolve)
      );

      for (const entry of entries) {
        if (entry.isDirectory) {
          const subFolder = await buildFolderStructure(
            entry,
            filesToUpload,
            `${parentPath}/${folder.name}`
          );
          if (subFolder) folder.subFolders.push(subFolder);
        } else if (entry.isFile) {
          if (entry.name === "desktop.ini") continue;

          entry.file((file) => {
            // Collect file along with its folder path
            filesToUpload.push({
              file,
              folderPath: `${parentPath}/${folder.name}`, // Save file's folder path
            });
          });
        }
      }

      return folder;
    }

    return null;
  };

  const createNestedFolders = async (
    folderStructure,
    parentFolderId,
    totalTasks,
    completedTasks
  ) => {
    try {
      const res = await axiosInstance.post(
        `/create-nested-folders`,
        {
          folderStructure,
          parent_folder: parentFolderId,
          created_by: viewer_id,
        },
        {
          withCredentials: true,
        }
      );

      const createdFolderStructure = res.data.folderStructure;
      return createdFolderStructure;
    } catch (error) {
      console.error("Failed to create nested folders:", error);
      toast.error("Failed to create nested folders.");
      return null;
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

  const onDrop = async (event) => {
    event.preventDefault();
    const items = event.dataTransfer.items;

    let folderStructure = [];
    let tempFilesToUpload = [];

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();

        if (item.isDirectory) {
          const folder = await buildFolderStructure(item, tempFilesToUpload);
          if (folder) {
            folderStructure.push(folder);
          }
        } else if (item.isFile) {
          const file = items[i].getAsFile();
          tempFilesToUpload.push({
            file,
            folderPath: "",
            folderId: folder_ids,
          });
        }
      }

      // Count total files and folders
      const totalTasks =
        countFilesAndFolders(folderStructure) + tempFilesToUpload.length;
      let completedTasks = 0;

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
    }
  };

  const uploadFiles = async (files, createdFolderStructure, totalTasks) => {
    let uploadedCount = 0;
    let isError = false;

    for (const { file } of files) {
      // const folderId =
      //   getFolderIdFromPath(folderPath, createdFolderStructure) || folder_ids;

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
    dispatch(
      fetchContentsAsync({
        viewer_id,
        folder_id: breadcrumbs[breadcrumbs.length - 1].id,
        baseURL: baseURL,
        organisation_id: cookies.userData?.organisation?.id,
      })
    );
  };

  const transformedContents = tableData?.map((data) => ({
    ...data,
    "Created At": data.created_at || "N/A",
    "Created By": data.created_by_name || "N/A",
    "Updated By": data.updated_by_name || "N/A",
    "Updated At": data.updated_at || "N/A",
  }));

  const transformedFilterContents = filterData?.map((data) => ({
    ...data,
    "Created At": data.created_at || "N/A",
    "Created By": data.created_by_name || "N/A",
    "Updated By": data.updated_by_name || "N/A",
    "Updated At": data.updated_at || "N/A",
  }));

  const transformedSearchContents = searchData?.map((data) => ({
    ...data,
    "Created At": data.created_at || "N/A",
    "Created By": data.created_by_name || "N/A",
    "Updated By": data.updated_by_name || "N/A",
    "Updated At": data.updated_at || "N/A",
  }));

  if (showButtonLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
        <LoadingSpinner />
      </div>
    );
  }

  if (loading || filter?.loading) {
    return <TableLoading columns={columns.length} rows={7} />;
  }

  // const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);

  return (
    <div className="flex flex-col gap-2">
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

      {contentModalMounted &&
        (contentModalLoading ? (
          <div className="fixed inset-0 flex items-center justify-center z-50 ">
            <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
            <LoadingSpinner />
          </div>
        ) : (
          <ContentModal
            content={selectedContent}
            isOpen={setContentModalOpen}
            closeModal={closeModal}
            setSelectedContent={setSelectedContent}
            publicLink={publicLink}
            setPublicLink={setPublicLink}
            contents={transformedContents} // Pass the array of contents
            handleContentClick={handleContentClick} // Pass the handleContentClick function
          />
        ))}
      {addTagToContent && <AddTagToContentModal />}
      {popupVisible && (
        <Popup content={userOnFolder.users} position={popupPosition} />
      )}
      <div
        className={`w-full relative border-2 rounded-md ${
          sameFolderUsers?.length > 0 ? "mt-12 border-red-200" : ""
        }`}
      >
        {sameFolderUsers?.length > 0 && (
          <div className="absolute -top-10 left-0 right-0 flex justify-center z-[5]">
            <div className="rounded-full bg-red-100 border border-red-200 shadow-sm px-4 py-1.5 flex items-center space-x-2 pointer-events-none text-red-800 text-sm font-medium">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {sameFolderUsers.length === 1
                  ? `${sameFolderUsers[0].fullName} is here`
                  : `${sameFolderUsers[0].fullName} +${
                      sameFolderUsers.length - 1
                    } are here`}
              </span>
            </div>
          </div>
        )}
        <div
          className={`overflow-auto scrollbar-thin ${
            sameFolderUsers?.length > 0 ? "h-[72vh]" : "h-[75vh]"
          }`}
        >
          <table className="w-full table-fixed border-collapse relative">
            <thead className="sticky top-0 bg-gray-100 shadow-md z-10">
              <tr>
                <th className="p-3 font-semibold text-left border-b w-[50px] whitespace-nowrap bg-gray-100">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === contents.length}
                      onChange={() => {
                        if (selectedItems.length === contents.length) {
                          dispatch(UnSelectAllItems([]));
                        } else {
                          dispatch(SelectAllItems(contents));
                        }
                      }}
                      className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-[#d0acad] checked:border-[#d0acad] focus:outline-none focus:ring-2 focus:ring-[#d0acad] focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                    />
                  </div>
                </th>
                {columns.map((column, index) => (
                  <th
                    key={column.accessorKey}
                    ref={(el) => (thRefs.current[index] = el)}
                    className="relative font-semibold text-left border-b overflow-hidden whitespace-nowrap hover:bg-gray-200 bg-gray-100"
                    style={{ width: "200px" }}
                  >
                    <div className="flex items-center justify-between overflow-hidden hover:bg-gray-200">
                      <button
                        onClick={() =>
                          !resizing && handleSort(column.accessorKey)
                        }
                        className="flex items-center justify-between w-full h-full px-2 py-1 text-left focus:outline-none transition-colors duration-200"
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

            <tbody className="bg-white transition-colors duration-150 divide-y divide-gray-200">
              {searchApplied ? (
                searchData.length === 0 ? (
                  <EmptyFolderComponent />
                ) : (
                  transformedSearchContents.map((item, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`hover:bg-gray-100 text-[0.875rem] leading-[1.25rem] relative`}
                      style={{
                        border: userDownStreamFolders.some(
                          (folder) =>
                            folder.toLowerCase() === item.name.toLowerCase()
                        )
                          ? "2px solid #fecaca"
                          : "",
                      }}
                      onMouseEnter={(event) => handleOnMouseEnter(item, event)}
                      onMouseLeave={() => handleOnMouseLeave(item)}
                    >
                      <td className="p-3 border-b">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-[#d0acad] checked:border-[#d0acad] focus:outline-none focus:ring-2 focus:ring-[#d0acad] focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                          checked={selectedItems.some(
                            (selectedItem) => selectedItem.id === item.id
                          )}
                          onChange={() => {
                            setPopupVisible(false);
                            const idx = selectedItems.findIndex(
                              (selectedItem) => selectedItem.id === item.id
                            );

                            if (idx === -1) {
                              dispatch(SelectItem(item));
                            } else {
                              dispatch(UnSelectItem(item));
                            }
                          }}
                        />
                      </td>
                      <td className="gap-2">
                        <div className="flex items-center justify-left gap-2">
                          {getIcon(item)}
                          <p
                            className="line-clamp-1 text-[0.875rem] leading-[1.25rem] cursor-pointer"
                            onClick={() => {
                              setPopupVisible(false);
                              handleContentClick(item);
                              setContentModaMounted(true);
                            }}
                          >
                            <HighlightText
                              text={item.name}
                              highlight={searchValue?.toString() || ""}
                            />
                          </p>
                          <div className="flex relative gap-2">
                            {canvaAccessToken && (
                              <div className="flex relative">
                                <Canva
                                  item={item}
                                  activeContent={activeContent}
                                  setActiveContent={setActiveContent}
                                  showCanvaOptions={showCanvaOptions}
                                  setShowCanvaOptions={setShowCanvaOptions}
                                />
                              </div>
                            )}

                            {
                              <div className="flex relative">
                                <AdobeExpress
                                  item={item}
                                  activeContent={activeContent}
                                  setActiveContent={setActiveContent}
                                  showAdobeOptions={showAdobeOptions}
                                  setShowAdobeOptions={setShowAdobeOptions}
                                />
                              </div>
                            }
                          </div>
                        </div>
                      </td>

                      <td className="p-3 border-b ">{item.source}</td>
                      <td className="p-3 border-b">{`${item.created_by}`}</td>
                      <td className="p-3 border-b">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="p-3 border-b">{item.updated_by}</td>
                      <td className="p-3 border-b">
                        {formatDate(item.updated_at)}
                      </td>
                    </tr>
                  ))
                )
              ) : filter.filterApplied &&
                filter.filterAppliedOn == "content" ? (
                transformedFilterContents.length === 0 ? (
                  <EmptyFolderComponent />
                ) : (
                  transformedFilterContents.map((item, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-200">
                      <td className="p-3 border-b">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-[#014d83] checked:border-[#014d83] focus:outline-none focus:ring-2 focus:ring-[#014d83] focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                          checked={selectedContents.some(
                            (selectedItem) => selectedItem.id === item.id
                          )}
                          onChange={() => {
                            const idx = selectedContents.findIndex(
                              (selectedItem) => selectedItem.id === item.id
                            );

                            if (idx === -1) {
                              dispatch(SelectItem(item));
                            } else {
                              dispatch(UnSelectItem(item));
                            }
                          }}
                        />
                      </td>
                      <td
                        className="p-3 border-b flex items-center justify-center gap-2 "
                        onClick={() => {
                          handleContentClick(item);
                          setContentModaMounted(true);
                        }}
                      >
                        {item.table_identifier === "folder" ? (
                          <FontAwesomeIcon
                            icon={faFolder}
                            className="text-slate-400 pr-2 w-4 h-4"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={getIconByMimeType(item.mime_type)}
                            className="text-slate-400 pr-2 w-4 h-4 "
                          />
                        )}
                        {item.name}
                      </td>
                      <td className="px-6 py-4 truncate whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                        {item.source}
                      </td>
                      <td className="px-6 py-4 truncate whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                        {`${item.created_by}`}
                      </td>
                      <td className="px-6 py-4 truncate  whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4 truncate whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                        {item.updated_by}
                      </td>
                      <td className="px-6 py-4 truncate whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                        {formatDate(item.updated_at)}
                      </td>
                    </tr>
                  ))
                )
              ) : contents.length === 0 ? (
                // <div className="w-full bg-red-200">
                <EmptyFolderComponent />
              ) : (
                transformedContents.map((item, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`hover:bg-gray-100 text-[0.875rem] leading-[1.25rem] relative`}
                    style={{
                      border: userDownStreamFolders.some(
                        (folder) =>
                          folder.toLowerCase() === item.name.toLowerCase()
                      )
                        ? "2px solid #fecaca"
                        : "",
                    }}
                    onMouseEnter={(event) => handleOnMouseEnter(item, event)}
                    onMouseLeave={() => handleOnMouseLeave(item)}
                  >
                    <td className="p-3 border-b">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-[#d0acad] checked:border-[#d0acad] focus:outline-none focus:ring-2 focus:ring-[#d0acad] focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                        checked={selectedItems.some(
                          (selectedItem) => selectedItem.id === item.id
                        )}
                        onChange={() => {
                          setPopupVisible(false);
                          const idx = selectedItems.findIndex(
                            (selectedItem) => selectedItem.id === item.id
                          );

                          if (idx === -1) {
                            dispatch(SelectItem(item));
                          } else {
                            dispatch(UnSelectItem(item));
                          }
                        }}
                      />
                    </td>
                    <td className="gap-2">
                      <div className="flex items-center justify-left gap-2">
                        {getIcon(item)}
                        <p
                          className="line-clamp-1 text-[0.875rem] leading-[1.25rem] cursor-pointer"
                          onClick={() => {
                            setPopupVisible(false);
                            handleContentClick(item);
                            setContentModaMounted(true);
                          }}
                        >
                          <HighlightText
                            text={item.name}
                            highlight={searchValue?.toString() || ""}
                          />
                        </p>
                        <div className="flex relative gap-2">
                          {canvaAccessToken && (
                            <div className="flex relative">
                              <Canva
                                item={item}
                                activeContent={activeContent}
                                setActiveContent={setActiveContent}
                                showCanvaOptions={showCanvaOptions}
                                setShowCanvaOptions={setShowCanvaOptions}
                              />
                            </div>
                          )}

                          <div className="flex relative">
                            <AdobeExpress
                              item={item}
                              activeContent={activeContent}
                              setActiveContent={setActiveContent}
                              showAdobeOptions={showAdobeOptions}
                              setShowAdobeOptions={setShowAdobeOptions}
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 border-b ">{item.source}</td>
                    <td className="p-3 border-b">{`${item.created_by}`}</td>
                    <td className="p-3 border-b">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="p-3 border-b">{item.updated_by}</td>
                    <td className="p-3 border-b">
                      {formatDate(item.updated_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CanvaDesignsGallery />
    </div>
  );
};

export default ContentTable;

const Popup = ({ content, position }) => {
  LiaFilterSolid;
  return (
    <div
      className="absolute bg-red-100 border  rounded-lg shadow-lg p-2 z-50 border-red-200"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="transition-opacity duration-300 ease-in-out">
        <div className=" text-red-800 text-sm font-medium px-4 py-2   flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {content.length === 1
              ? `${content[0].fullName} is here`
              : `${content[0].fullName} +${content.length - 1} are here`}
          </span>
        </div>
      </div>
    </div>
  );
};
