import React, { useContext, useState, useCallback, useEffect } from "react";
import Breadcrumbs from "../../../utility/Breadcrumbs";
import { GlobalContext } from "../../../context/GlobalState";
import { useSelector, useDispatch } from "react-redux";
import {
  Loader,
  fetchModalContentsAsync,
  ModalSelectItem,
  ModalUnSelectItem,
} from "../../../features/content/contentSlice";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import { FcFolder } from "react-icons/fc";
import { formatDate } from "../../../constants";
import { useCookies } from "react-cookie";

const ContentTableModal = () => {
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const dispatch = useDispatch();

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "", name: "Home" }]);
  const [folder_id, setFolder_id] = useState("");

  const loading = useSelector((state) => state.contents.modalLoading);
  const contents = useSelector((state) => state.contents.modalContents);
  const selectedContents = useSelector(
    (state) => state.contents.modalSelectedContents
  );
  const selectedTags = useSelector((state) => state.tags.selectedTags);

  const fetchExistingAssociations = async () => {
    const tag_id = selectedTags.length > 0 ? selectedTags[0].id : null;
    try {
      const response = await axiosInstance.post("/view-tag-content", {
        tag_id,
        viewer_id: viewer_id,
      });
      if (response) {
        console.log(response);
      }
      const existingContentIds = response.data.tagContent.map(
        (content) => content.content
      );
      return existingContentIds;
    } catch (error) {
      console.error("Failed to fetch existing associations:", error);
      return [];
    }
  };

  useEffect(() => {
    const updateSelectedContents = async () => {
      if (selectedTags.length > 0) {
        const tag_id = selectedTags[0].id;
        const existingContentIds = await fetchExistingAssociations(tag_id);
        const contentsToSelect = contents.filter((content) =>
          existingContentIds.includes(content.id)
        );
        contentsToSelect.forEach((content) => {
          if (
            !selectedContents.some((selected) => selected.id === content.id)
          ) {
            dispatch(ModalSelectItem(content));
          }
        });
      }
    };

    updateSelectedContents();
  }, [selectedTags, contents, dispatch, viewer_id]);

  const navigateToFolder = useCallback(
    async (folderId, folderName) => {
      dispatch(Loader());
      if (
        folderId !== folder_id ||
        (folderName &&
          !breadcrumbs.find((breadcrumb) => breadcrumb.id === folderId))
      ) {
        try {
          if (folderName) {
            setBreadcrumbs((prevBreadcrumbs) => [
              ...prevBreadcrumbs,
              { id: folderId, name: folderName },
            ]);
          }
          setFolder_id(folderId);
          dispatch(
            fetchModalContentsAsync({ viewer_id, folder_id: folderId, baseURL,organisation_id })
          );
        } catch (err) {
          console.error(err);
        }
      }
    },
    [folder_id, breadcrumbs, dispatch, viewer_id, baseURL]
  );

  const handleRowClick = (id) => {
    const content = contents.find((item) => item.id === id);
    if (content && content.id[0] === "W") {
      navigateToFolder(content.id, content.name);
    }
  };

  const handleSelectionChange = (content) => {
    if (content.id[0] === "W") return; // Prevent folder selection

    const isSelected = selectedContents.some((item) => item.id === content.id);
    if (isSelected) {
      dispatch(ModalUnSelectItem(content));
    } else {
      dispatch(ModalSelectItem(content));
    }
  };

  const CustomCheckbox = ({ checked, onChange, disabled }) => (
    <div
      className={`w-4 h-4 border rounded cursor-pointer flex items-center justify-center
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${
          checked ? "bg-[#0369a1] border-[#0369a1]" : "border-gray-300 bg-white"
        }`}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange();
      }}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </div>
  );

  return (
    <div className="px-4">
      <div className="bg-white mb-4">
        <Breadcrumbs
          className="border border-gray-200"
          onBreadcrumbClick={navigateToFolder}
          breadcrumbs={breadcrumbs}
          setBreadcrumbs={setBreadcrumbs}
        />
      </div>

      <div className="border border-gray-300 rounded">
        <div className="h-[300px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#0369a1] border-t-transparent"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 shadow-md z-10 text-sm text-gray-600 sticky top-0">
                <tr>
                  <th className="w-8 px-4 py-3">
                    <CustomCheckbox
                      disabled
                      checked={false}
                      onChange={() => {}}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Created By</th>
                  <th className="px-4 py-3 text-left">Created At</th>
                </tr>
              </thead>
              <tbody>
                {contents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-8 text-gray-500 border-b border-gray-200"
                    >
                      No items in this folder
                    </td>
                  </tr>
                ) : (
                  contents.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      onClick={() => handleRowClick(item.id)}
                    >
                      <td className="w-8 px-4 py-2">
                        <CustomCheckbox
                          checked={selectedContents.some(
                            (selected) => selected.id === item.id
                          )}
                          onChange={() => handleSelectionChange(item)}
                          disabled={item.id[0] === "W"}
                        />
                      </td>
                      <td className="px-4 py-2 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          {item.id[0] === "W" && (
                            <FcFolder className="flex-shrink-0 w-5 h-5" />
                          )}
                          <span
                            className="truncate cursor-default"
                            title={item.name}
                          >
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">{item.source}</td>
                      <td className="px-4 py-2">{item.created_by}</td>
                      <td className="px-4 py-2">
                        {formatDate(item.created_at)}
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
  );
};

export default ContentTableModal;
