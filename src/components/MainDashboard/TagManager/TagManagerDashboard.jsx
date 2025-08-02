import { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";

import LoadingSpinner from "../../../utility/LoadingSpinner.jsx";
import { CRUDTag } from "./CRUDTag.jsx";
import AddContentToTagModal from "./AddContentToTagModal.jsx";
import {
  fetchTagsAsync,
  fetchFilterTagsAsync,
} from "../../../features/tag/tagSlice.js";
import { useDispatch, useSelector } from "react-redux";
import {
  SelectTag,
  UnSelectTag,
  SelectAll,
  ActiveTagsCount,
  DeactiveTagsCount,
} from "../../../features/tag/tagSlice.js";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

import {
  SetSearchData,
  SetInitialData,
  SetSearchTable,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";

export const TagManagerDashBoard = () => {
  const columns = [
    "name",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
    "active",
  ];

  const rowKeys = [
    "name",
    "created_by_name",
    "created_at",
    "updated_by_name",
    "updated_at",
    "active",
  ];

  
  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});

  const { addContentToTag, viewer_id, showButtonLoading, baseURL } =
    useContext(GlobalContext);

  const dispatch = useDispatch();

  // getting the data from the global store
  const loading = useSelector((state) => state.tags.loading);
  const tags = useSelector((state) => state.tags.tags);
  const filterTags = useSelector((state) => state.tags.filterTags);
  const filter = useSelector((state) => state.filter);
  const selectedTags = useSelector((state) => state.tags.selectedTags);
  const navigate = useNavigate();
  const location = useLocation();
  const filterLoading = useSelector((state) => state.filter.loading);
  const [tagToEdit, setTagToEdit] = useState(null);
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchData = useSelector((state) => state.search.searchData);
  const searchValue = useSelector((state) => state.search.searchValue);

  // Group by state and options
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  
  // Group by options
  const groupByOptions = [
    { value: "", label: "No grouping", isCustom: false },
    ...(rowKeys?.map((column) => ({
      value: column,
      label: column.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      isCustom: false,
    })) || []),
  ];

  // Custom styles for the Select component
  const customStyles = {
    option: (base, { data }) => ({
      ...base,
      backgroundColor: data.isCustom ? "#F0F9FF" : "white", // Light blue for custom, white for normal
      color: "#1F2937", // Standard text color
      "&:hover": {
        backgroundColor: data.isCustom ? "#E1F0FF" : "#f3f4f6", // Slightly darker blue on hover
      },
    }),
    // Keep all other styles default
    control: (base) => ({
      ...base,
      minHeight: "38px",
      width: "200px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
  };

  useEffect(() => {
    if (filter.filterApplied) {
      dispatch(SetSearchData(filter.filterData));
      dispatch(SetInitialData(filter.filterData));
    } else {
      dispatch(SetSearchData(tags));
      dispatch(SetInitialData(tags));
    }
    dispatch(SetSearchFields(["name"]));
    dispatch(SetSearchTable("tags"));
  }, [tags, dispatch, searchValue]);

  useEffect(() => {
    dispatch(
      fetchTagsAsync({
        viewer_id: viewer_id,
        baseURL: baseURL,
        organisation_id,
      })
    );
    dispatch(fetchFilterTagsAsync());
  }, []);

  useEffect(() => {
    let activeTagsCount = 0;
    let deactiveTagsCount = 0;
    for (let i = 0; i < selectedTags.length; i++) {
      if (selectedTags[i].active) {
        activeTagsCount++;
      } else {
        deactiveTagsCount++;
      }
    }
    dispatch(ActiveTagsCount(activeTagsCount));
    dispatch(DeactiveTagsCount(deactiveTagsCount));
  }, [selectedTags]);

  const tableRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const cols = table.querySelectorAll("th");
    cols.forEach((col) => {
      const resizer = document.createElement("div");
      resizer.className = "resizer";
      resizer.style.height = `${table.offsetHeight}px`;
      col.appendChild(resizer);

      const mouseDownHandler = (e) => {
        setStartX(e.clientX);
        setStartWidth(col.offsetWidth);
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
      };

      const mouseMoveHandler = (e) => {
        const dx = e.clientX - startX;
        col.style.width = `${startWidth + dx}px`;
      };

      const mouseUpHandler = () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };

      resizer.addEventListener("mousedown", mouseDownHandler);

      return () => {
        resizer.removeEventListener("mousedown", mouseDownHandler);
      };
    });
  }, [startWidth, startX]);

  const OnChangeHandler = (data) => {
    if (Array.isArray(data)) {
      dispatch(SelectAll(data));
      return;
    }
    const idx = selectedTags.findIndex(
      (selectedItem) => selectedItem.id === data.id
    );

    if (idx === -1) {
      dispatch(SelectTag(data));
    } else {
      dispatch(UnSelectTag(data));
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tagId = searchParams.get("tag");
    if (tagId) {
      setTagToEdit(tagId);
    }
    if (searchParams.has("tag")) {
      searchParams.delete("tag");
      navigate(`${location.pathname}`, { replace: true });
    }
  }, [location]);

  const transformedTags = tags.map((user) => ({
    ...user,
    "Created At": user.created_at || "N/A",
    "Created By": user.created_by_name || "N/A",
    "Updated By": user.updated_by_name || "N/A",
    "Updated At": user.updated_at || "N/A",
  }));

  const transformedSearchTags = searchData.map((user) => ({
    ...user,
    "Created At": user.created_at || "N/A",
    "Created By": user.created_by_name || "N/A",
    "Updated By": user.updated_by_name || "N/A",
    "Updated At": user.updated_at || "N/A",
  }));

  if (showButtonLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
        <LoadingSpinner />
      </div>
    );
  }

  if (filter.filterAppliedOn === "tag") {
    return (
      <>
        <div className="flex justify-end h-[60px]">
          <CRUDTag 
            tagToEdit={tagToEdit} 
            setTagToEdit={setTagToEdit}
            groupByColumn={groupByColumn}
            setGroupByColumn={setGroupByColumn}
            groupByOptions={groupByOptions}
            customStyles={customStyles}
          />
        </div>
        <div>
          {addContentToTag && <AddContentToTagModal />}
          <div className="container mx-auto px-4  py-2.5 ml-auto">
            <div className="flex flex-col">
              <div className="overflow-x-auto rounded-lg">
                {searchApplied ? (
                  <ResizableTable
                    data={transformedSearchTags}
                    columnsHeading={columns}
                    rowKeys={rowKeys}
                    OnChangeHandler={OnChangeHandler}
                    selectedItems={selectedTags}
                    loading={filterLoading}
                    searchTerm={searchValue}
                    sortConfig={sortConfig}
                    setSortConfig={setSortConfig}
                    groupByColumn={groupByColumn}
                    expandedGroups={expandedGroups}
                    setExpandedGroups={setExpandedGroups}
                  />
                ) : (
                  <ResizableTable
                    data={transformedTags}
                    columnsHeading={columns}
                    rowKeys={rowKeys}
                    OnChangeHandler={OnChangeHandler}
                    selectedItems={selectedTags}
                    loading={loading}
                    searchTerm={searchValue}
                    sortConfig={sortConfig}
                    setSortConfig={setSortConfig}
                    groupByColumn={groupByColumn}
                    expandedGroups={expandedGroups}
                    setExpandedGroups={setExpandedGroups}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <CRUDTag 
          tagToEdit={tagToEdit} 
          setTagToEdit={setTagToEdit}
          groupByColumn={groupByColumn}
          setGroupByColumn={setGroupByColumn}
          groupByOptions={groupByOptions}
          customStyles={customStyles}
        />
      </div>
      <div>
        {addContentToTag && <AddContentToTagModal />}
        <div className="container mx-auto px-4  py-2.5 ml-auto">
          <div className="flex flex-col">
            <div className="overflow-x-auto rounded-lg">
              {searchApplied ? (
                <ResizableTable
                  data={transformedSearchTags}
                  columnsHeading={columns}
                  rowKeys={rowKeys}
                  OnChangeHandler={OnChangeHandler}
                  selectedItems={selectedTags}
                  loading={filterLoading}
                  searchTerm={searchValue}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  groupByColumn={groupByColumn}
                  expandedGroups={expandedGroups}
                  setExpandedGroups={setExpandedGroups}
                />
              ) : filterTags.filterApplied ? (
                <ResizableTable
                  data={filterTags.data}
                  columnsHeading={columns}
                  rowKeys={rowKeys}
                  OnChangeHandler={OnChangeHandler}
                  selectedItems={selectedTags}
                  loading={filterLoading}
                  searchTerm={searchValue}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  groupByColumn={groupByColumn}
                  expandedGroups={expandedGroups}
                  setExpandedGroups={setExpandedGroups}
                />
              ) : (
                <ResizableTable
                  data={transformedTags}
                  columnsHeading={columns}
                  rowKeys={rowKeys}
                  OnChangeHandler={OnChangeHandler}
                  selectedItems={selectedTags}
                  loading={loading}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  groupByColumn={groupByColumn}
                  expandedGroups={expandedGroups}
                  setExpandedGroups={setExpandedGroups}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TagManagerDashBoard;
