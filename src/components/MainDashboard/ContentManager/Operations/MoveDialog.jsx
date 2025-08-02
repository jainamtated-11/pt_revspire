import React, { useState, useEffect, useContext, useCallback } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import Breadcrumbs from "../../../../utility/Breadcrumbs.jsx";
import FailureButton from "../../../../utility/FailureButton.jsx";
import SuccessButton from "../../../../utility/SuccessButton.jsx";
import {
  fetchContentsAsync,
  ModalNavigateToFolder,
  UnSelectAllItems,
  UpdateModalBreadcrumbs,
  fetchModalContentsAsync,
  Loader,
  UpdateBreadCrumbs,
} from "../../../../features/content/contentSlice.js";
import { useSelector, useDispatch } from "react-redux";
import { Tooltip } from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

import { FcFolder } from "react-icons/fc";
import { TbFileTypeDocx } from "react-icons/tb";
import { LuFileSpreadsheet } from "react-icons/lu";
import { GrDocumentPpt } from "react-icons/gr";
import { BsFiletypePptx } from "react-icons/bs";
import { FaRegFileWord } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { FaRegFilePdf } from "react-icons/fa6";
import { IoImagesOutline } from "react-icons/io5";
import { FaRegFile } from "react-icons/fa";
import { FiLink } from "react-icons/fi";
import useOutsideClick from "../../../../hooks/useOutsideClick.js";
import { navigateToFolder } from "../../../../features/content/contentSlice.js";
import { useCookies } from "react-cookie";

function MoveDialog({ setIsMoveButtonClicked }) {
  const dispatch = useDispatch();

  const { viewer_id, baseURL } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const modalContents = useSelector((state) => state.contents.modalContents);
  const loading = useSelector((state) => state.contents.modalLoading);
  const modalLoading = useSelector((state) => state.contents.modalLoading);
  const selectedItems = useSelector((state) => state.contents.selectedItems);
  const breadcrumbs = useSelector((state) => state.contents.modalBreadCrumbs);
  const [newFolderName, setNewFolderName] = useState("");
  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [tooltipVisible, setTooltipVisible] = useState(false);

  console.log("breadcrumbs", breadcrumbs[breadcrumbs.length - 1].id);
  console.log("breadcrumbs", breadcrumbs);
  useEffect(() => {
    if (selectedItems.length > 1) {
      setTooltipVisible(true);
    } else {
      setTooltipVisible(false);
    }
  }, [selectedItems]);

  //------------------Function to move selected items to folders----------------------------------
  const moveContents = async () => {
    setIsDisable(true);
    setIsLoading(true);
    if (selectedItems.length === 0) {
      console.log("Invalid move request");
      toast.error("Invalid move request");
      return;
    }

    try {
      const ids = selectedItems.map((item) => item.id);

      const moveLocationId = breadcrumbs[breadcrumbs.length - 1].id;

      // Make a PATCH request to the backend endpoint
      const response = await axiosInstance.patch(
        `/move-folder`,
        {
          ids,
          moveFolderId: moveLocationId,
          viewer_id: viewer_id,
        },
        {
          withCredentials: true, // Include credentials if necessary
        }
      );

      if (response.data.success) {
        toast.success("Items moved successfully");
        dispatch(UnSelectAllItems());
        setIsMoveButtonClicked(false);
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: moveLocationId,
            baseURL: baseURL,
            organisation_id
          })
        );

        console.log("breadcrumbs :::>>", breadcrumbs);

        dispatch(
          navigateToFolder({
            folderId: breadcrumbs[breadcrumbs.length - 1].id,
            folderName: breadcrumbs[breadcrumbs.length - 1].name,
          })
        );
        dispatch(UpdateBreadCrumbs(breadcrumbs));
      } else {
        // Handle the case where the move was not successful
        console.error("Move failed:", response.data.message);
      }
    } catch (error) {
      // Handle any errors that occur during the move process
      console.error("Error moving contents:", error);
      toast.error("Error moving items, try again!");
    } finally {
      setIsDisable(false);
      setIsLoading(false);
    }
  };

  // if (modalLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen w-screen  ">
  //       <div className="flex justify-center items-center mr-20 mb-48">
  //         <Grid
  //           visible={true}
  //           height={40}
  //           width={40}
  //           color="#075985"
  //           ariaLabel="grid-loading"
  //           radius={12.5}
  //         />
  //       </div>
  //     </div>
  //   );
  // }
  
  const ContentNameClickHandler = (name, id) => {
    console.log(" === contant handler ")
    dispatch(ModalNavigateToFolder({ folderId: id, folderName: name }));
    dispatch(
      fetchModalContentsAsync({ viewer_id, folder_id: id, baseURL: baseURL,organisation_id })
    );
    
  };

  const addNewFolder = useCallback(async () => {
    if (!newFolderName) {
      toast.error("Folder name cannot be empty.");
      return;
    }

    const nearestParentFolderId = breadcrumbs[breadcrumbs.length - 1]?.id;

    try {
      const res = await axiosInstance.post(
        `/create-folder`,
        {
          parent_folder: nearestParentFolderId, // Ensure this is correctly set
          name: newFolderName,
          created_by: viewer_id,
        },
        {
          withCredentials: true,
        }
      );
         console.log("res", res.data.folder.id);
      if (res.status === 200) {
        toast.success("Folder created successfully");
        setNewFolderName("");

        ContentNameClickHandler(res.data.folder.name, nearestParentFolderId)
        setFolderModalOpen(false);
       

        // Fetch updated folder contents
        // dispatch(fetchModalContentsAsync({ viewer_id, nearestParentFolderId, baseURL }));
      } else {
        throw new Error("Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Adding Folder Failed");
    }
  }, [newFolderName, viewer_id, baseURL, axiosInstance, dispatch]);

  const UpdateBreadcrumbs = (breadcrumb) => {
    dispatch(UpdateModalBreadcrumbs(breadcrumb));
    dispatch(
      fetchModalContentsAsync({
        viewer_id,
        folder_id: breadcrumb[breadcrumb.length - 1].id,
        baseURL: baseURL,
        organisation_id
      })
    );
  };

  const ShimmerTable = () => (
    <table className="w-[100%] bg-gray-100 max-w-[700px] min-w-[300px] table-fixed text-left overflow-hidden rounded-lg">
      <thead className="text-black uppercase bg-white">
        <tr>
          <th className="px-6 py-3 bg-gray-300 animate-pulse rounded"></th>
          <th className="px-6 py-3 bg-gray-300 animate-pulse rounded"></th>
          <th className="px-6 py-3 bg-gray-300 animate-pulse rounded"></th>
        </tr>
      </thead>
      <tbody>
        {[...Array(20)].map((_, index) => (
          <tr
            key={index}
            className={`animate-pulse ${
              index % 2 === 0 ? "bg-gray-200" : "bg-gray-300"
            }`}
          >
            <td className="px-4 py-2 bg-gray-100 animate-pulse rounded"></td>
            <td className="px-4 py-2 bg-gray-100 animate-pulse  rounded"></td>
            <td className="px-4 py-2 bg-gray-100 animate-pulse  rounded"></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const actions = () => {
    setIsMoveButtonClicked(false);
  };
  const modalRef = useOutsideClick([actions]);

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/50"></div>
        <div
          ref={modalRef}
          className="bg-white rounded-lg z-10 w-[800px] shadow-xl"
        >
          {/* Header - Fixed height */}
          <div className="p-6 pb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl">
                Move {selectedItems.length}{" "}
                {selectedItems.length === 1 ? "item" : "items"}
              </h2>
              <button
                onClick={() => setIsMoveButtonClicked(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          {/* Create Folder Section - Fixed height container */}
          <div className="px-6 h-[52px]">
            {" "}
            {/* Fixed height container */}
            {!isFolderModalOpen ? (
              <button
                className="inline-flex items-center text-[#0369a1] hover:text-[#0284c7] transition-colors"
                onClick={() => setFolderModalOpen(true)}
              >
                <span className="mr-1">+</span> Create Folder
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="flex-1 border border-[#0369a1] p-2 rounded focus:ring-2 focus:ring-[#0369a1] focus:border-transparent outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setFolderModalOpen(false);
                    setNewFolderName("");
                  }}
                  className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewFolder}
                  className="px-4 py-2 rounded bg-[#0369a1] text-white hover:bg-[#0284c7] transition-colors"
                >
                  Create
                </button>
              </div>
            )}
          </div>

          {/* Content Area with Fixed Height */}
          <div className="px-6">
            <div className="mb-4">
              <Breadcrumbs
                onBreadcrumbClick={ModalNavigateToFolder}
                breadcrumbs={breadcrumbs}
                setBreadcrumbs={UpdateBreadcrumbs}
              />
            </div>

            <div className="border border-gray-200 rounded">
              <div className="h-[300px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#0369a1] border-t-transparent"></div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-100 shadow-md z-10 text-sm text-gray-600 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left">Name</th>
                        <th className="px-6 py-3 text-left">Source</th>
                        <th className="px-6 py-3 text-left">Created By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalContents.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="text-center py-8 text-gray-500"
                          >
                            No items in this folder
                          </td>
                        </tr>
                      ) : (
                        modalContents.map((item) => (
                          <tr
                            key={item.id}
                            className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td
                              className={
                                item.parent_folder
                                  ? "px-4 flex gap-2 py-2 truncate cursor-pointer hover:text-sky-500 w-64"
                                  : "px-4 flex gap-2 py-2 truncate opacity-35 w-64"
                              }
                              onClick={() =>
                                item.parent_folder
                                  ? ContentNameClickHandler(item.name, item.id)
                                  : null
                              }
                            >
                              <span>
                                {item.table_identifier === "folder" ? (
                                  <FcFolder
                                    className="text-yellow-300 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : item.mimetype === "application/pdf" ? (
                                  <FaRegFilePdf
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : item.mimetype === "image/jpeg" ||
                                  item.mimetype === "image/png" ? (
                                  <IoImagesOutline
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : item.mimetype ===
                                  "application/vnd.ms-excel" ? (
                                  <FaRegFileExcel
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : item.mimetype === "application/msword" ? (
                                  <FaRegFileWord
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : item.mimetype ===
                                  "application/vnd.openxmlformats-officedocument.presentationml.presentation" ? (
                                  <BsFiletypePptx
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : item.mimetype ===
                                  "application/vnd.ms-powerpoint" ? (
                                  <GrDocumentPpt
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : item.mimetype ===
                                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ? (
                                  <LuFileSpreadsheet
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : item.mimetype ===
                                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
                                  <TbFileTypeDocx
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : item.mimetype === "application/url" ? (
                                  <FiLink
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : item.mimetype === "video/mov" ? (
                                  <MdOutlineSlowMotionVideo
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : item.mimetype === "video/mp4" ? (
                                  <MdOutlineSlowMotionVideo
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                ) : (
                                  <FaRegFile
                                    className="text-gray-500 w-5 h-5 flex-shrink-0"
                                    style={{ width: "20px" }}
                                  />
                                )}
                              </span>
                              {item.name}
                            </td>
                            <td
                              className={
                                item.parent_folder
                                  ? "px-4 py-2 cursor-pointer hover:text-sky-500 w-52"
                                  : "px-4 py-2 opacity-35 w-52"
                              }
                            >
                              {item.source}
                            </td>
                            <td
                              className={
                                item.parent_folder
                                  ? "px-4 py-2 cursor-pointer hover:text-sky-500 w-52"
                                  : "px-4 py-2 opacity-35 w-52"
                              }
                            >
                              {item.created_by}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 mt-4">
            <button
              onClick={() => setIsMoveButtonClicked(false)}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={isDisable}
              onClick={moveContents}
              className={`px-4 py-2 rounded text-white transition-colors ${
                isDisable
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#014d83] hover:bg-[#015896]"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Moving...</span>
                </div>
              ) : (
                "Move Here"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoveDialog;
