import { useState, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { navigateToFolder } from "../../../../features/content/contentSlice.js";

const useContentHandler = ({ viewer_id }) => {
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();

  // Destructure context values here
  const {
    setContentModalOpen,
    setViewContent,
    setContentModalLoading,
    setFolder_id,
  } = useContext(GlobalContext);

  const [selectedContent, setSelectedContent] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [viewContent, setViewContentState] = useState(null);
  const [contentModalOpen, setContentModalOpenState] = useState(false);
  const tableElement = useRef(null);
  const contents = useSelector((state) => state.contents.contents);
  const [loadPublicLink, setLoadPublicLink] = useState(false);
  const [publicLink, setPublicLink] = useState(null);

  // Sort Rows Logic
  const sortRows = (newContent, key, direction) => {
    if (!key) return newContent;

    const sortedRows = [...newContent].sort((a, b) => {
      if (
        key.toLowerCase() === "created_at" ||
        key.toLowerCase() === "updated_at"
      ) {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === "ascending" ? dateA - dateB : dateB - dateA;
      } else {
        const valueA = String(a[key]).toLowerCase();
        const valueB = String(b[key]).toLowerCase();
        return direction === "ascending"
          ? valueA < valueB
            ? -1
            : 1
          : valueA > valueB
          ? -1
          : 1;
      }
    });

    return sortedRows;
  };

  // Handle Sorting
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Handle Content Click
  const handleContentClick = async (item, source) => {
    setSelectedContent(item);
    try {
      if (source != "modal") {
        setContentModalLoading(true); // Set loading to true when initiating the action
      }

      if (item.mimetype) {
        if (
          item.mimetype.includes("application/vnd") ||
          item.mimetype.includes("application/msword") ||
          item.mimetype.includes("video/")
        ) {
          // For Microsoft Office, and videos files, get the SAS URL
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item.id,
              viewerId: viewer_id,
            },
            {
              withCredentials: true, // Include cookies in the request
            }
          );
          const sasURL = res.data.sasUrl;
          setViewContent(sasURL);
        } else if (
          item.mimetype.includes("application/url") &&
          item.source.toLowerCase() !== "youtube" &&
          item.source.toLowerCase() !== "canva link" &&
          item.source.toLowerCase() !== "microsoft stream" &&
          item.source.toLowerCase() !== "vimeo"
        ) {
          setLoadPublicLink(true);
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item.id,
              viewerId: viewer_id,
            },
            {
              withCredentials: true,
            }
          );
          const publicURL = res.data.content;
          setPublicLink(publicURL);
        } else if (
          item.mimetype.includes("application/url") &&
          (item.source.toLowerCase() === "youtube" ||
          item.source.toLowerCase() !== "canva link" ||
          item.source.toLowerCase() !== "microsoft stream" ||
            item.source.toLowerCase() === "vimeo")
        ) {
          console.log("");
        } else {
          // For other file types, get the blob
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item.id,
              viewerId: viewer_id,
            },
            {
              responseType: "blob",
              withCredentials: true,
            }
          );

          const contentBlob = new Blob([res.data], {
            type: `${item.mimetype}`,
          });

          setViewContent(contentBlob);
        }

        setContentModalOpen(true);
      } else {
        setFolder_id(item.id);

        dispatch(
          navigateToFolder({ folderId: item.id, folderName: item.name })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContentModalLoading(false); // Set loading to false when the action completes (whether successful or not)
      loadPublicLink && setLoadPublicLink(false);
    }
  };

  return {
    contents,
    handleSort,
    handleContentClick,
    sortRows,
    selectedContent,
    setSelectedContent,
    contentModalOpen,
    setContentModalOpen: setContentModalOpenState,
    viewContent,
    setViewContent: setViewContentState,
    sortConfig,
    tableElement,
    setLoadPublicLink,
    loadPublicLink,
    publicLink,
    setPublicLink,
  };
};

export default useContentHandler;
