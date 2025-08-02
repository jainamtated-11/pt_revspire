import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
// import LoadingSpinner from "../../../../utility/LoadingSpinner.jsx";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTagsAsync,
  SearchTags,
  SelectAll,
  UnSelectAll,
  SelectTag,
  UnSelectTag,
} from "../../../../features/tag/tagSlice.js";
import { UnSelectAllItems } from "../../../../features/content/contentSlice.js";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { Grid } from "react-loader-spinner";

const AddTagToContentModal = () => {
  const { addTagToContent, setAddTagToContent, viewer_id, baseURL } =
    useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const dispatch = useDispatch();
  const [searchTag, setSearchTag] = useState("");

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const loading = useSelector((state) => state.tags.loading);
  const tags = useSelector((state) => state.tags.tags);
  const selectedTags = useSelector((state) => state.tags.selectedTags);
  const selectedContents = useSelector(
    (state) => state.contents.selectedContents
  );



  useEffect(() => {
    if (searchTag.length > 0) {
      const searchTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTag)
      );
      dispatch(SearchTags(searchTags));
    } else if (searchTag.length === 0 && addTagToContent) {
      dispatch(fetchTagsAsync({ viewer_id, baseURL,organisation_id }));
    }
  }, [searchTag]);




  const fetchExistingAssociateTags = async () => {
    const content_id =
      selectedContents.length > 0 ? selectedContents[0].id : null;
    try {
      const response = await axiosInstance.post(
        "/view-content-tags",
        { content_id, viewer_id },
        { withCredentials: true }
      );

      if (response) {
        const existingTagIds = response.data.tags.map((tag) => tag.id);
        return existingTagIds;
      }
    } catch (error) {
      console.error("Failed to fetch existing associations:", error);
      return [];
    }
  };

  useEffect(() => {
    const updateSelectedTags = async () => {
      if (selectedContents.length > 0) {
        const existingTagIds = await fetchExistingAssociateTags();

        // Select tags that match existingTagIds
        const tagsToSelect = tags.filter((tag) =>
          existingTagIds.includes(tag.id)
        );

        dispatch(UnSelectAll());
        dispatch(SelectAll(tagsToSelect));
      }
    };

    updateSelectedTags();
  }, [selectedContents, tags, dispatch, viewer_id]);

  // Simplified checkbox handler
  const handleCheckboxChange = (item) => {
    const isSelected = selectedTags.some(
      (selectedItem) => selectedItem.id === item.id
    );
    if (isSelected) {
      dispatch(UnSelectTag(item));
    } else {
      dispatch(SelectTag(item));
    }
  };

  const AddTagToButtonPopUpHandler = async () => {
    const content_ids = selectedContents.map((items) => items.id);
    const tag_ids = selectedTags.map((tag) => tag.id);
    try {
      const response = await axiosInstance.post(
        `/insert-tag-content`,
        {
          viewer_id,
          content_ids,
          tag_ids,
        },
        {
          withCredentials: true,
        }
      );
      if (response) {
        setAddTagToContent(false);
        dispatch(UnSelectAll());
        dispatch(UnSelectAllItems());
        toast.success("Tag Added Successfully !!");
      }
    } catch (error) {
      toast.error("Error Adding Tag !!");
     
    }
  };

  return (
    <div className="absolute top-48 left-1/4 w-[500px] h-[480px] border-2 rounded-lg z-50  bg-stone-50 shadow-2xl border-groove">
      <h1 className="pl-8 my-2 font-bold sticky top-3 z-50 text-center rounded-lg hover:bg-gray-300">
        <FontAwesomeIcon icon={faTags} className="mr-2" />
        Add Tag
      </h1>
      {/* Search box */}
      <div className="flex items-center justify-center bg-white">
        <input
          value={searchTag}
          className="w-1/2 px-2 py-1 my-2 border-2 rounded-xl border-slate-300"
          type="text"
          placeholder="Enter the name of tag"
          onChange={(e) => {
            setSearchTag(e.target.value);
          }}
        />
      </div>

      {loading ? (

      
      <div className="flex justify-center items-center ">
        <div className="flex justify-center items-center mt-32 ">
          <Grid
            visible={true}
            height={40}
            width={40}
            color="#075985"
            ariaLabel="grid-loading"
            radius={12.5}
          />
        </div>
      </div>
      ) : (
        <div className="overflow-hidden border-2 mx-4 border-groove shadow-md rounded-xl bg-white max-h-[320px]">
  <div className="border-groove rounded-xl shadow-xl bg-white overflow-y-auto max-h-[320px]">
    <table className="w-full text-left rounded-lg shadow-lg">
      <thead className="text-black font-bold sticky top-0 border-b-2 bg-white">
        <tr>
          <td className="px-4">
            <div className="flex items-center">
              <input
                id="checkbox-all-search"
                type="checkbox"
                className="h-4 bg-gray-100 border-gray-300 rounded"
                checked={
                  tags.length > 0 && selectedTags.length === tags.length
                }
              />
              <label htmlFor="checkbox-all-search" className="sr-only">
                Select All
              </label>
            </div>
          </td>
          <td className="px-6 py-3 w-96">
            <div className="flex items-center">
              <span>Name</span>
            </div>
          </td>
        </tr>
      </thead>
      <tbody className="overflow-y-auto">
        {tags.map((item, index) => (
          <tr className="bg-white divide-y hover:bg-slate-100" key={item.id}>
            <td className="w-4 p-4 cursor-pointer">
              <div className="flex items-center">
                <input
                  id={`checkbox-table-${index}`}
                  type="checkbox"
                  className="h-4 bg-gray-100 border-gray-300"
                  checked={selectedTags.some(
                    (selectedItem) => selectedItem.id === item.id
                  )}
                  onChange={() => handleCheckboxChange(item)}
                />
                <label htmlFor={`checkbox-table-${item.id}`} className="sr-only">
                  Select Tag
                </label>
              </div>
            </td>
            <td className="px-6 py-4 w-96">{item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

      )}

      {/* Cancel and Add button */}
      <div className="flex justify-center">
        <div className="flex gap-16 absolute bottom-2">
          <button
            onClick={() => {
              setAddTagToContent(false);
              setSearchTag([]);
            }}
            className="bg-[#f1bdbd] focus:ring-1  focus:outline-none focus:ring-red-300 font-medium text-sm border-2 rounded-full px-16 py-2 mt-2 ml-4"
          >
            Cancel
          </button>

          <button
            disabled={selectedTags.length === 0}
            onClick={AddTagToButtonPopUpHandler}
            className={`focus:ring-1 focus:outline-none font-medium rounded-full text-sm w-full sm:w-auto border-2 border-slate-400 hover:bg-slate-100  px-16 py-2 mt-2 ${
              selectedTags.length === 0 ? "cursor-not-allowed" : ""
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTagToContentModal;
