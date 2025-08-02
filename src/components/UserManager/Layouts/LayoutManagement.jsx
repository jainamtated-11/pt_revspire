import { GlobalContext } from "../../../context/GlobalState";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable";
import { useState, useEffect, useContext } from "react";
import CRUDLayout from "./CRUDLayout";
import { useSelector, useDispatch } from "react-redux";
import { fetchLayoutsAsync } from "../../../features/layout/layoutSlice";
import TableLoading from "../../MainDashboard/ContentManager/ContentTable/TableLoading";
import {
  SelectLayout,
} from "../../../features/layout/layoutSlice";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";

function LayoutManagement() {
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const [selectedLayouts, setSelectedLayouts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "Updated At", direction: "desc" });
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const dispatch = useDispatch();
  const layouts = useSelector((state) => state.layouts.layouts);
  const loading = useSelector((state) => state.layouts.loading);
  const filter = useSelector((state) => state.filter);
  const selectedLayout = useSelector((state) => state.layouts.selectedLayouts);

  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  useEffect(() => {
    if (filter.filterApplied) {
      dispatch(SetInitialData(filter.filterData));
      dispatch(SetSearchData(filter.filterData));
    } else {
      dispatch(SetInitialData(layouts));
      dispatch(SetSearchData(layouts));
    }
    dispatch(SetSearchTable("pitch_layout"));
    dispatch(SetSearchFields(["name"]));
  }, [layouts, dispatch, searchValue]);

  // Update local state when Redux store changes
  useEffect(() => {
    setSelectedLayouts(selectedLayout);
  }, [selectedLayout]);

  useEffect(() => {
    dispatch(SelectLayout(selectedLayouts));
  }, [selectedLayouts]);

  useEffect(() => {
    dispatch(fetchLayoutsAsync({ viewer_id, baseURL: baseURL }));
  }, [viewer_id, dispatch]);

  // Define the fields you want to include in the table
  const includedFields = [
    "name",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
    "active",
  ];

  const transformData = (data) => {
    return data?.map((item) => ({
      ...item,
      "Created At": item.created_at
        ? new Date(item.created_at).toISOString().split("T")[0]
        : "",
      "Created By": item.created_by_name,
      "Updated By": item.updated_by_name,
      "Updated At": item.updated_at
        ? new Date(item.updated_at).toISOString().split("T")[0]
        : "",
    }));
  };

  const transformedConnections = transformData(layouts);
  const transformedFilterData = transformData(filter?.filterData);
  const transformedSearchData = transformData(searchData);

  const handleRowClick = (id) => {
    console.log("Row clicked:", id);
  };

  const handleSelectionChange = (selectedRows) => {
    if (selectedRows.length == layouts.length || selectedRows.length == 0) {
      setSelectedLayouts(selectedRows);
      return;
    }
    const idx = selectedLayouts.findIndex(
      (selectedItem) => selectedItem.id === selectedRows.id
    );
    if (idx === -1) {
      setSelectedLayouts((prevState) => [...prevState, selectedRows]);
    } else {
      const updatedSelectedItems = selectedLayouts.filter(
        (items) => items.id != selectedRows.id
      );
      setSelectedLayouts(updatedSelectedItems);
    }
  };

  const groupByOptions = [
    { value: null, label: "No grouping" },
    { value: "name", label: "Name" },
    { value: "created_by_name", label: "Created By" },
    { value: "updated_by_name", label: "Updated By" },
    { value: "active", label: "Active Status" }
  ];

  // Custom styles for the Select component
  const customStyles = {
    option: (base, { data }) => ({
      ...base,
      backgroundColor: data.isCustom ? "#F0F9FF" : "white",
      color: "#1F2937",
      "&:hover": {
        backgroundColor: data.isCustom ? "#E1F0FF" : "#f3f4f6",
      },
    }),
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

  if (loading) {
    return <TableLoading />;
  }

  return (
    <>
      <CRUDLayout 
        groupByColumn={groupByColumn}
        setGroupByColumn={setGroupByColumn}
        groupByOptions={groupByOptions}
        customStyles={customStyles}
      />
      <div className="w-full">
        {searchApplied ? (
          <ResizableTable
            data={transformedSearchData}
            columnsHeading={includedFields}
            OnClickHandler={handleRowClick}
            OnChangeHandler={handleSelectionChange}
            selectedItems={selectedLayouts}
            loading={filter.loading}
            rowKeys={includedFields}
            searchTerm={searchValue}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            groupByColumn={groupByColumn}
            expandedGroups={expandedGroups}
            setExpandedGroups={setExpandedGroups}
          />
        ) : filter.filterApplied ? (
          <ResizableTable
            data={transformedFilterData}
            columnsHeading={includedFields}
            OnClickHandler={handleRowClick}
            OnChangeHandler={handleSelectionChange}
            selectedItems={selectedLayouts}
            loading={filter.loading}
            rowKeys={includedFields}
            searchTerm={searchValue}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            groupByColumn={groupByColumn}
            expandedGroups={expandedGroups}
            setExpandedGroups={setExpandedGroups}
          />
        ) : (
          <ResizableTable
            data={transformedConnections}
            columnsHeading={includedFields}
            OnClickHandler={handleRowClick}
            OnChangeHandler={handleSelectionChange}
            selectedItems={selectedLayouts}
            loading={loading}
            rowKeys={includedFields}
            searchTerm={searchValue}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            groupByColumn={groupByColumn}
            expandedGroups={expandedGroups}
            setExpandedGroups={setExpandedGroups}
          />
        )}
      </div>
    </>
  );
}

export default LayoutManagement;
