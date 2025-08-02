import React, {
  memo,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import Breadcrumbs from "../../../../utility/Breadcrumbs.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchContentsAsync,
  UnSelectAllItems,
  ModalNavigateToFolder,
  UpdateModalBreadcrumbs,
  fetchModalContentsAsync,
  UpdateBreadCrumbs,
} from "../../../../features/content/contentSlice.js";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
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
import { navigateToFolder } from "../../../../features/content/contentSlice.js";
import { useCookies } from "react-cookie";

function CopyDialog({ setIsCopyButtonClicked }) {
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const { viewer_id, baseURL } = useContext(GlobalContext);
  const breadcrumbs = useSelector((state) => state.contents.modalBreadCrumbs);
  const selectedItems = useSelector((state) => state.contents.selectedItems);
  const contents = useSelector((state) => state.contents.modalContents);
  const loading = useSelector((state) => state.contents.modalLoading);
  const modalBreadCrumbs = useSelector(
    (state) => state.contents.modalBreadCrumbs
  );

  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const folder_id = useSelector((state) => state.contents.folder_id);
  const [isdisable, setIsDisable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchModalContentsAsync({ viewer_id, folder_id: breadcrumbs[breadcrumbs.length - 1].id, baseURL,organisation_id }));
  }, [dispatch, viewer_id, baseURL, folder_id,organisation_id]);

  const handleCopy = async () => {
    setIsDisable(true);
    setIsLoading(true);
    try {
      // Check if copyLocation and selectedItems are available
      if (!selectedItems || selectedItems.length === 0) {
        toast.error("Invalid copy location or no items selected.");
        return;
      }

      // Extract content IDs from selectedItems
      const contentIds = selectedItems.map((item) => item.id);

      const copyLocationId = modalBreadCrumbs[modalBreadCrumbs.length - 1].id;

      // Make the request to the backend endpoint
      await axiosInstance.post(`/duplicate-content`, {
        folderId: copyLocationId,
        contentIds,
        viewer_id,
      });

      // Handle the response
      setIsCopyButtonClicked(false);
      dispatch(UnSelectAllItems());
      toast.success("Copy Successful!");

      dispatch(
        navigateToFolder({
          folderId: breadcrumbs[breadcrumbs.length - 1].id,
          folderName: breadcrumbs[breadcrumbs.length - 1].name,
        })
      );

      dispatch(UpdateBreadCrumbs(breadcrumbs));
      dispatch(fetchContentsAsync({ viewer_id, folder_id: copyLocationId, baseURL,organisation_id }));
    } catch (error) {
      toast.error("Can't Copy Try Again");
    } finally {
      setIsDisable(false);
      setIsLoading(false);
    }
  };

  const UpdateBreadcrumbs = (breadcrumb) => {
    dispatch(UpdateModalBreadcrumbs(breadcrumb));
    dispatch(
      fetchModalContentsAsync({
        viewer_id,
        folder_id: breadcrumb[breadcrumb.length - 1].id,
        baseURL,
        organisation_id
      })
    );
  };

  const ContentNameClickHandler = (name, id) => {
    dispatch(ModalNavigateToFolder({ folderId: id, folderName: name }));
    dispatch(fetchModalContentsAsync({ viewer_id, folder_id: id, baseURL,organisation_id }));
  };

  const addNewFolder = useCallback(async () => {
    if (!newFolderName) {
      toast.error("Folder name cannot be empty.");
      return;
    }

    const nearestParentFolderId =
      modalBreadCrumbs[modalBreadCrumbs.length - 1]?.id;

    try {
      const res = await axiosInstance.post(
        `/create-folder`,
        {
          parent_folder: nearestParentFolderId,
          name: newFolderName,
          created_by: viewer_id,
        },
        {
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        toast.success("Folder created successfully");
        console.log("res of folder :", res);
        setNewFolderName("");
        setFolderModalOpen(false);
        // dispatch(ModalNavigateToFolder({ folderId: nearestParentFolderId, folderName }));
        // dispatch(fetchModalContentsAsync({ viewer_id,nearestParentFolderId, baseURL }));
        ContentNameClickHandler(res.data.folder.name, res.data.folder.id);

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
            <td className="px-4 py-2 bg-gray-100 animate-pulse rounded"></td>
            <td className="px-4 py-2 bg-gray-100 animate-pulse rounded"></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="bg-white rounded-lg z-10 w-[800px] shadow-xl">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl">
                Copy {selectedItems.length}{" "}
                {selectedItems.length === 1 ? "item" : "items"}
              </h2>
              <button
                onClick={() => setIsCopyButtonClicked(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          {/* Create Folder Section */}
          <div className="px-6 h-[52px]">
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

          {/* Content Area */}
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
                      {contents.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="text-center py-8 text-gray-500"
                          >
                            No items in this folder
                          </td>
                        </tr>
                      ) : (
                        contents.map((item) => (
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
              onClick={() => setIsCopyButtonClicked(false)}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={isdisable}
              onClick={handleCopy}
              className={`px-4 py-2 rounded text-white transition-colors ${
                isdisable
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#014d83] hover:bg-[#015896]"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Copying...</span>
                </div>
              ) : (
                "Copy Here"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(CopyDialog);
