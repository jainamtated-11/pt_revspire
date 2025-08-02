import { GlobalContext } from "../../../context/GlobalState";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable";
import { useState, useEffect, useContext } from "react";
import CRUDRole from "./CRUDRole";
import { useSelector, useDispatch } from "react-redux";
import { fetchRolesAsync } from "../../../features/role/roleSlice.js";
import TableLoading from "../../MainDashboard/ContentManager/ContentTable/TableLoading";
import {
  SelectRole,
  UnselectRole,
  UnselectAllRole,
  SelectAllRole,
} from "../../../features/role/roleSlice";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";
import { useCookies } from "react-cookie";
import TreeView from "./TreeView";
import EditRole from "./EditRole";

function RolesMain() {
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'table'
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: "Updated At", direction: "desc" });

  const dispatch = useDispatch();
  const roles = useSelector((state) => state?.roles?.roles);
  const loading = useSelector((state) => state?.roles?.loading);
  const selectedRoles = useSelector((state) => state?.roles?.selectedRoles);
  const filter = useSelector((state) => state?.filter);

  const searchData = useSelector((state) => state?.search?.searchData);
  const searchApplied = useSelector((state) => state?.search?.searchApplied);
  const searchValue = useSelector((state) => state?.search?.searchValue);

  useEffect(() => {
    if (filter?.filterApplied) {
      dispatch(SetInitialData(filter?.filterData));
      dispatch(SetSearchData(filter?.filterData));
    } else {
      dispatch(SetInitialData(roles));
      dispatch(SetSearchData(roles));
    }
    roles;
    dispatch(SetSearchTable("role"));
    dispatch(SetSearchFields(["name"]));
  }, [roles, dispatch, searchValue]);

  useEffect(() => {
    dispatch(
      fetchRolesAsync({
        viewer_id,
        baseURL: baseURL,
        organisation_id,
      })
    );
  }, []);

  const includedFields = [
    "name",
    "parent_role_name",
    "user_count",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
    "Active",
  ];

  const columns = [
    "Name",
    "Parent Role",
    "User Count",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
    "Active",
  ];

  const rowData = [
    "name",
    "parent_role_name",
    "user_count",
    "created_by_name",
    "created_at",
    "updated_by_name",
    "updated_at",
    "active",
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

  const transformedConnections = transformData(roles);
  const transformedFilterData = transformData(filter?.filterData);
  const transformedSearchData = transformData(searchData);

  const handleRowClick = (row) => {
    setSelectedRole(row);
    setIsEditOpen(true);
  };

  const handleSelectionChange = (data) => {
    if (data?.length === roles?.length) {
      dispatch(SelectAllRole(data));
      return;
    }
    if (data.length === 0) {
      dispatch(UnselectAllRole());
      return;
    }

    const idx = selectedRoles.findIndex(
      (selectedItem) => selectedItem.id === data.id
    );
    if (idx === -1) {
      dispatch(SelectRole(data));
    } else {
      dispatch(UnselectRole(data));
    }
  };

  if (loading) {
    return <TableLoading />;
  }

  return (
    <>
      <CRUDRole viewMode={viewMode} setViewMode={setViewMode} />
      <div className="w-full">
        {viewMode === 'tree' ? (
          <TreeView />
        ) : searchApplied ? (
          <ResizableTable
            data={transformedSearchData}
            columnsHeading={includedFields}
            OnClickHandler={handleRowClick}
            OnChangeHandler={handleSelectionChange}
            selectedItems={selectedRoles}
            loading={filter.loading}
            rowKeys={includedFields}
            searchTerm={searchValue}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
          />
        ) : filter.filterApplied ? (
          <ResizableTable
            data={transformedFilterData}
            columnsHeading={includedFields}
            OnClickHandler={handleRowClick}
            OnChangeHandler={handleSelectionChange}
            selectedItems={selectedRoles}
            loading={filter.loading}
            rowKeys={rowData}
            searchTerm={searchValue}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
          />
        ) : (
          <ResizableTable
            data={transformedConnections}
            columnsHeading={columns}
            OnClickHandler={handleRowClick}
            OnChangeHandler={handleSelectionChange}
            selectedItems={selectedRoles}
            loading={loading}
            rowKeys={rowData}
            searchTerm={searchValue}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
          />
        )}
        {isEditOpen && selectedRole && (
          <EditRole
            role={selectedRole}
            onClose={() => {
              setIsEditOpen(false);
              setSelectedRole(null);
            }}
          />
        )}
      </div>
    </>
  );
}

export default RolesMain;
