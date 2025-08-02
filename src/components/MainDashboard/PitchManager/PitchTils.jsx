import {
  useState,

  useRef,
 
} from "react";
import "./Table.css";

import { MdVideoFile } from "react-icons/md";
import { TbFileTypeDocx } from "react-icons/tb";
import { SiGooglesheets } from "react-icons/si";
import { BsFillFileEarmarkPptFill } from "react-icons/bs";
import { BsFiletypePptx } from "react-icons/bs";
import { BsFileEarmarkWordFill } from "react-icons/bs";
import { BsFileEarmarkExcelFill } from "react-icons/bs";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { RiVideoFill } from "react-icons/ri";
import { BsFilePdfFill } from "react-icons/bs";
import { FaImage } from "react-icons/fa6";
import { FaRegFile, FaRegFileExcel } from "react-icons/fa";
import { IoLinkOutline } from "react-icons/io5";
import {
  faCircleInfo,
  faFolder,
  faFile,
  faFilePdf,
  faFileImage,
  faFileVideo,
  faSort,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import ContentModal from "./ContentModal.jsx";
import LoadingSpinner from "../../../../utility/LoadingSpinner.jsx";
import EmptyFolderComponent from "./EmptyFolderComponent.jsx";
import AddTagToContentModal from "../Operations/AddTagToContentModal.jsx";
import { Tooltip } from "react-tooltip";
import { formatDate } from "../../../../constants.js";

import TilsLoading from "./TilsLoading.jsx";
import "../../../MainDashboard/ContentManager/ContentTable/Table.css";
import { useCookies } from "react-cookie";
import AdobeExpress from "../AdobeExpress/AdobeExpress.jsx";
import toast from "react-hot-toast";
import SuccessButton from "../../../../utility/SuccessButton.jsx";



const getThumbnailUrl = (thumbnailData) => {
  if (!thumbnailData || !thumbnailData.data) return null;
  try {
    const uint8Array = new Uint8Array(thumbnailData.data);
    const binaryString = uint8Array.reduce(
      (acc, byte) => acc + String.fromCharCode(byte),
      ""
    );
    return `data:image/jpeg;base64,${btoa(binaryString)}`;
  } catch (error) {
    console.error("Error converting thumbnail:", error);
    return null;
  }
};

function PitchTils({ data, page }) {
  const wrapperRef = useRef(null);

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

  const handleTileClick = (e, item) => {
    e.stopPropagation();
    handleToggleCheckbox(item.id, item);
  };

  const handleContentOpen = (e, item) => {
    e.stopPropagation();
    console.log("i am inside handle content open", item);
    handleContentClick(item);
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

      <div className="container overflow-auto">
        <div className="table-wrapper overflow-auto">
          <div
            className={`shadow-md border-2 tiles-container bg-white ${
              contents.length < 8 ? "h-auto" : "h-[650px] overflow-y-auto"
            }`}
          >
            {loading ? (
              <TilsLoading />
            ) : data.length === 0 ? (
              <div className="flex justify-center items-center">
                <EmptyFolderComponent />
              </div>
            ) : (
              <div className="grid justify-center items-center grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 mt-[10px]">
                {data.map((item, index) => {
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
                          >
                            { item.mimetype === "image/jpeg" ||
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
                                    onError={() =>
                                      setFailedThumbnails((prev) => ({
                                        ...prev,
                                        [item.id]: true,
                                      }))
                                    }
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
                           : null}
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

                      
                      </div>
                    </div>
                  );
                })}

              </div>
            ):null}
          </div>
        </div>
      </div>
    </>
  );
}

export default PitchTils;
