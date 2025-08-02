import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { useSelector, useDispatch } from "react-redux";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import ContentTableModal from "./ContentTableModal.jsx";
import {
  SearchContent,
  fetchModalContentsAsync,
  ModalUnSelectAllItem,
} from "../../../features/content/contentSlice.js";
import { UnSelectAll } from "../../../features/tag/tagSlice.js";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { LuLoaderCircle } from "react-icons/lu";
import { useCookies } from "react-cookie";
const AddContentToTagModal = () => {
  const { viewer_id, setAddContentToTag, baseURL, addContentToTag } =
    useContext(GlobalContext);

  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  // getting data from the store
  const contents = useSelector((state) => state.contents.modalContents);
  const selectedContents = useSelector(
    (state) => state.contents.modalSelectedContents
  );
  const selectedTags = useSelector((state) => state.tags.selectedTags);
  const [isLoading, setIsLoading] = useState(false);
  const [searchContent, setSearchContent] = useState("");
  const [existingContentIds, setExistingContentIds] = useState([]);

  const fetchExistingAssociations = async () => {
    const tag_id = selectedTags.length > 0 ? selectedTags[0].id : null;
    try {
      const response = await axiosInstance.post("/view-tag-content", {
        tag_id,
        viewer_id: viewer_id,
      });

      if (response) {
        const existingIds = response.data.tagContent.map(
          (content) => content.content
        );
        setExistingContentIds(existingIds);
        console.log(existingContentIds);
      }
    } catch (error) {
      console.error("Failed to fetch existing associations:", error);
      setExistingContentIds([]);
    }
  };

  const AddContentToPopUpHandler = async () => {
    const tag_ids = selectedTags.map((tag) => tag.id);

    const tagContentAssociations = {};

    const filteredContentIds = selectedContents
      .filter((content) => {
        return !tag_ids.some(
          (tagId) =>
            tagContentAssociations[tagId] &&
            tagContentAssociations[tagId].includes(content.id)
        );
      })
      .map((content) => content.id);

    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/insert-tag-content", {
        viewer_id,
        content_ids: filteredContentIds,
        tag_ids,
      });
      if (response) {
        setAddContentToTag(false);
        dispatch(ModalUnSelectAllItem());
        dispatch(UnSelectAll());
        console.log(response.data);
      }
      console.log(response.data.success);
      if (response.data.success) {
        console.log("success");
        toast.success("Content added to tag successfully");
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error.message);
      toast.error("please select selected");
      setAddContentToTag(false);
      dispatch(ModalUnSelectAllItem());
      dispatch(UnSelectAll());
    }
  };

  const CancelHandler = () => {
    dispatch(ModalUnSelectAllItem());
    setAddContentToTag(false);
  };

  useEffect(() => {
    fetchExistingAssociations();

    if (searchContent.length > 0) {
      const content = contents.filter((content) =>
        content.name.toLowerCase().includes(searchContent.toLowerCase())
      );
      dispatch(SearchContent(content));
    } else if (searchContent.length === 0 && addContentToTag) {
      dispatch(
        fetchModalContentsAsync({ viewer_id, folder_id: "", baseURL: baseURL,organisation_id })
      );
    }
  }, [searchContent, addContentToTag]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="bg-white rounded-lg z-10 w-[900px] shadow-xl">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-gray-200 mb-2 shadow-md">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Select Content</h2>
            <button
              onClick={CancelHandler}
              className="text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon
                className="text-gray-500 text-2xl"
                icon={faXmark}
              />
            </button>
          </div>
        </div>

        {/* Search Box */}
        <div className="px-5 mr-2 mb-3 mt-3">
          <input
            value={searchContent}
            className=" w-full px-4 py-2 border border-gray-400 rounded focus:ring-2 focus:ring-[#0369a1] focus:border-transparent outline-none"
            type="text"
            placeholder="Enter the name of content"
            onChange={(e) => setSearchContent(e.target.value)}
          />
        </div>

        {/* Content Table */}
        {/* <div className="px-6"> */}
        <div className="">
          <div className="h-[400px] overflow-y-auto">
            <ContentTableModal />
          </div>
        </div>
        {/* </div> */}

        {/* Footer */}
        <div
          className="space-x-8 flex justify-end p-2 border-t mb-2 shadow-md z-10 pr-6"
          style={{ boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)" }}
        >
          <button
            onClick={CancelHandler}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={AddContentToPopUpHandler}
            className="px-6 py-2 rounded bg-[#014d83] hover:bg-[#015896] text-white transition-colors"
          >
            {isLoading ? (
              <LuLoaderCircle className="animate-spin h-5 w-5 inline" />
            ) : (
              "Add"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContentToTagModal;
