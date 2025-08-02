import { useContext } from "react";
import React from "react";
import { GlobalContext } from "../../../context/GlobalState";
import { AddTagPopUp1 } from "./AddTagPopUp1";
import FilterModal from "../../../utility/FilterModal";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import EditTagModal from "./EditTagModal";
import { useSelector, useDispatch } from "react-redux";
import { UnSelectAll, fetchTagsAsync } from "../../../features/tag/tagSlice";
import { fetchContentsAsync } from "../../../features/content/contentSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faUserXmark,
  faEye,
  faMagnifyingGlass,
  faFileSignature,
} from "@fortawesome/free-solid-svg-icons";
import useCheckFrontendPermission from "../../../Services/checkFrontendPermission";
import useCheckUserLicense from "../../../Services/checkUserLicense";
import { useNavigate } from "react-router-dom";
import {
  SetFilterLoading,
  SetFilterApplied,
  SetFilterAppliedOn,
} from "../../../features/filter/fliterSlice";
import { useCookies } from "react-cookie";
import SearchBar from "../../../utility/SearchBar";
import Select from "react-select";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export const CRUDTag = ({ 
  tagToEdit, 
  setTagToEdit,
  groupByColumn,
  setGroupByColumn,
  groupByOptions,
  customStyles
}) => {
  const {
    TableNameHandler,
    setAddContentToTag,
    viewer_id,
    folder_id,
    baseURL,
  } = useContext(GlobalContext);

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const checkFrontendPermission = useCheckFrontendPermission();
  const checkUserLicense = useCheckUserLicense();

  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();
  const navigate = useNavigate();

  const selectedTags = useSelector((state) => state.tags.selectedTags);
  const selectedTagsActiveCount = useSelector(
    (state) => state.tags.selectedTagsActiveCount
  );
  const selectedTagsDeactiveCount = useSelector(
    (state) => state.tags.selectedTagsDeactiveCount
  );

  const ActivateTagHandler = async () => {
    const tagIds = selectedTags.map((tag) => tag.id);
    try {
      const response = await axiosInstance.post(
        `/activate-tags`,
        {
          tagIds,
          viewer_id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      console.log(response.data);
      if (response) {
        dispatch(
          fetchTagsAsync({
            viewer_id: viewer_id,
            baseURL: baseURL,
            organisation_id,
          })
        );
        dispatch(UnSelectAll());
        toast.success("Tag Activated Successfully !!");
      }
    } catch (error) {
      toast.error("Error Activating !!");
      console.log(error);
    }
  };

  const DeActivateTagHandler = async () => {
    const tagIds = selectedTags.map((tag) => tag.id);
    try {
      const response = await axiosInstance.post(
        `/deactivate-tags`,
        {
          tagIds,
          viewer_id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      if (response) {
        dispatch(
          fetchTagsAsync({
            viewer_id: viewer_id,
            baseURL: baseURL,
            organisation_id,
          })
        );
        dispatch(UnSelectAll());
        toast.success("Tag Deactivated Successfully !!");
      }
      console.log(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Error Deactivating !!");
    }
  };

  return (
    <div className="container w-full flex gap-4 items-center justify-between mx-auto px-4 pt-7">
      <div className="overflow-x-auto h-full  rounded-md bg-white shadow-md  scroll-none items-center">
        <div className="flex justify-between">
          {checkFrontendPermission("Create Tag") == "1" &&
            selectedTags.length === 0 && (
              <div className="transition-all mb-[2rem]">
                <AddTagPopUp1 />
              </div>
            )}

          <div
            className={`flex flex-row   ${
              selectedTags.length > 0
                ? " dark:bg-gray-600 rounded-md p-0.5  w-full"
                : ""
            }`}
          >
            {/* edit tag button  */}
            <div className="">
              {checkFrontendPermission("Edit Tag") == "1" &&
                selectedTags.length == 1 && (
                  <div className="transition-all ">
                    <EditTagModal
                      tagToEdit={tagToEdit}
                      setTagToEdit={setTagToEdit}
                    />
                  </div>
                )}
            </div>

            {tagToEdit && (
              <div className="transition-all">
                <EditTagModal
                  tagToEdit={tagToEdit}
                  setTagToEdit={setTagToEdit}
                />
              </div>
            )}

            {/* activate button */}
            {checkFrontendPermission("Activate/Deactivate Tag") == "1" &&
              selectedTags.length >= 1 &&
              selectedTags.length == selectedTagsDeactiveCount && (
                <div className=" transition-all mb-0">
                  <button
                    onClick={ActivateTagHandler}
                    className=" text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 flex items-center whitespace-nowrap"
                  >
                    <FontAwesomeIcon icon={faCircleCheck} className="mr-2" />
                    Activate Tag
                  </button>
                </div>
              )}

            {/* Deactivate button */}
            {checkFrontendPermission("Activate/Deactivate Tag") == "1" &&
              selectedTags.length == selectedTagsActiveCount &&
              selectedTags.length >= 1 && (
                <div className="">
                  <button
                    onClick={DeActivateTagHandler}
                    className=" text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 flex items-center whitespace-nowrap"
                  >
                    <FontAwesomeIcon icon={faUserXmark} className="mr-2" />
                    Deactivate Tag
                  </button>
                </div>
              )}

            {selectedTags.length >= 1 &&
              selectedTags.length === selectedTagsActiveCount && (
                <div className="flex justify-center items-center">
                  {checkFrontendPermission("View Pitch; View all pitch") ==
                    "1" &&
                    (checkUserLicense("Revenue Enablement Elevate") == "1" ||
                      checkUserLicense("Revenue Enablement Spark") == "1") && (
                      <div className=" transition-all">
                        <button
                          className=" text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 flex items-center whitespace-nowrap"
                          onClick={() => {
                            TableNameHandler("pitch", "filter", "tag");
                            dispatch(UnSelectAll());
                            navigate(`/content/pitch-manager`);
                            dispatch(SetFilterLoading(true));
                            dispatch(SetFilterApplied(true));
                            dispatch(SetFilterAppliedOn("content"));
                          }}
                        >
                          <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
                          Show Pitch
                        </button>
                      </div>
                    )}
                  {checkFrontendPermission("View Content; View All Content") ==
                    "1" &&
                    (checkUserLicense("Revenue Enablement Elevate") == "1" ||
                      checkUserLicense("Revenue Enablement Spark") == "1") && (
                      <div className="transition-all">
                        <button
                          className=" text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 flex items-center whitespace-nowrap"
                          onClick={async () => {
                            dispatch(UnSelectAll());
                            navigate(`/content/content-portal`);
                            dispatch(SetFilterLoading(true));
                            dispatch(SetFilterApplied(true));
                            dispatch(SetFilterAppliedOn("content"));
                            TableNameHandler("content", "filter", "tag");
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-2" />
                          Show Content
                        </button>
                      </div>
                    )}
                </div>
              )}

            {/* add content button  */}
            {checkFrontendPermission("Add Content To Tag") == "1" &&
              selectedTags.length > 0 && (
                <div>
                  <button
                    type="button"
                    className=" text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 flex items-center whitespace-nowrap"
                    onClick={() => {
                      dispatch(
                        fetchContentsAsync({
                          viewer_id: viewer_id,
                          folder_id: folder_id,
                          sortOption: "type",
                          order: "ASC",
                          baseURL: baseURL,
                          organisation_id,
                        })
                      );
                      setAddContentToTag(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faFileSignature} className="mr-2" />
                    Add Content
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-row flex-nowrap space-x-2">
      
        {/* group by */}
        <div className="flex items-center">
          <div className="w-[30px] flex-1">
          {groupByColumn && (
            <button
              onClick={() => setGroupByColumn(null)}
              className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 mr-1"
              title="Clear grouping"
            >
              <X size={16} />
            </button>
          )}
          </div>
          <Select
            value={groupByOptions.find(option => option.value === groupByColumn)}
            onChange={(option) => setGroupByColumn(option?.value || null)}
            options={groupByOptions}
            styles={customStyles}
            placeholder="Group by..."
             className="min-w-[200px] text-sm"
          />
        </div>

          {/* Search bar */}
        <div className="w-[200px] mt-0.5">
          <SearchBar searchTable="tags" />
        </div>

        {/* filter modal */}

        <FilterModal queryTable="tag" />
      </div>
    </div>
  );
};
