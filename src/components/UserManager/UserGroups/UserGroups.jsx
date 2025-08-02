import { GlobalContext } from "../../../context/GlobalState";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable";
import { useState, useEffect, useContext } from "react";
import CRUDGroup from "./CRUDGroup";
import { useSelector, useDispatch } from "react-redux";
import { fetchGroupsAsync } from "../../../features/group/groupSlice.js";
import TableLoading from "../../MainDashboard/ContentManager/ContentTable/TableLoading";
import {
  SelectGroup,
  UnselectGroup,
  UnselectAllGroup,
  SelectAllGroup,
} from "../../../features/group/groupSlice";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";

function UserGroups() {
  const { viewer_id, baseURL, globalOrgId } = useContext(GlobalContext);
  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const dispatch = useDispatch();
  const groups = useSelector((state) => state?.groups?.groups);
  const loading = useSelector((state) => state?.groups?.loading);
  const selectedGroups = useSelector((state) => state?.groups?.selectedGroups);
  const filter = useSelector((state) => state?.filter);

  const searchData = useSelector((state) => state?.search?.searchData);
  const searchApplied = useSelector((state) => state?.search?.searchApplied);
  const searchValue = useSelector((state) => state?.search?.searchValue);

  useEffect(() => {
    if (filter?.filterApplied) {
      dispatch(SetInitialData(filter?.filterData));
      dispatch(SetSearchData(filter?.filterData));
    } else {
      dispatch(SetInitialData(groups));
      dispatch(SetSearchData(groups));
    }
    groups;
    dispatch(SetSearchTable("group"));
    dispatch(SetSearchFields(["name"]));
  }, [groups, dispatch, searchValue]);

  useEffect(() => {
    dispatch(
      fetchGroupsAsync({
        viewer_id,
        baseURL: baseURL,
        organisation_id: globalOrgId,
      })
    );
  }, []);

  const includedFields = [
    "name",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
    "Active",
  ];

  const columns = [
    "Name",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
    "Active",
  ];

  const rowData = [
    "name",
    "created_by_name",
    "created_at",
    "updated_by_name",
    "updated_at",
    "is_active",
  ];

  const transformData = (data) => {
    return data?.map((item) => ({
      ...item,
      "Created At": item?.created_at
        ? new Date(item.created_at).toISOString().split("T")[0]
        : "",
      "Created By": item?.created_by_name,
      "Updated By": item?.updated_by_name,
      "Updated At": item?.updated_at
        ? new Date(item?.updated_at).toISOString().split("T")[0]
        : "",
    }));
  };

  const transformedConnections = transformData(groups);
  const transformedFilterData = transformData(filter?.filterData);
  const transformedSearchData = transformData(searchData);

  const handleRowClick = (id) => {
    console.log("Row clicked:", id);
  };

  const handleSelectionChange = (data) => {
    if (data?.length === groups?.length) {
      dispatch(SelectAllGroup(data));
      return;
    }
    if (data.length === 0) {
      dispatch(UnselectAllGroup());
      return;
    }

    const idx = selectedGroups.findIndex(
      (selectedItem) => selectedItem.id === data.id
    );
    if (idx === -1) {
      dispatch(SelectGroup(data));
    } else {
      dispatch(UnselectGroup(data));
    }
  };

  const groupByOptions = [
    { value: "name", label: "Name" },
    { value: "created_by_name", label: "Created By" },
    { value: "updated_by_name", label: "Updated By" },
    { value: "is_active", label: "Active Status" }
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

  if (loading) {
    return <TableLoading />;
  }

  return (
    <>
      <CRUDGroup 
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
            selectedItems={selectedGroups}
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
            selectedItems={selectedGroups}
            loading={filter.loading}
            rowKeys={rowData}
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
            columnsHeading={columns}
            OnClickHandler={handleRowClick}
            OnChangeHandler={handleSelectionChange}
            selectedItems={selectedGroups}
            loading={loading}
            rowKeys={rowData}
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

export default UserGroups;
