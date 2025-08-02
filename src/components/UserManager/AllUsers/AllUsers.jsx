import React, { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { CRUDAllUser } from "./CRUDAllUser.jsx";
import AddUserDialog from "./AddUserDialog.jsx";
import EditUserDialog from "./EditUserDialog.jsx";
import toast from "react-hot-toast";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import { useSelector, useDispatch } from "react-redux";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";

const UsersTable = () => {
  const [loading, setLoading] = useState(true);
  const { viewer_id, selectedUsers, setSelectedUsers, users, setUsers } =
    useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  
  const [sortConfig, setSortConfig] = useState({key:"Updated At",direction:"desc"});
  
  // Add group by state
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Define rowData and groupByOptions
  const rowData = [
    "First Name",
    "Last Name",
    "email",
    "username",
    "Profile Name",
    "Currency Name",
    "Timezone Name",
    "active"
  ];

  const groupByOptions = [
    { value: "", label: "No grouping" },
    ...rowData.map(column => ({
      value: column,
      label: column.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    }))
  ];

  // Custom styles for the Select component
  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "38px",
      width: "200px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
    option: (base) => ({
      ...base,
      backgroundColor: "white",
      color: "#1F2937",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
    }),
  };

  // Add this state to control the AddUserDialog
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);

  const filter = useSelector((state) => state.filter);
  const dispatch = useDispatch();

  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  useEffect(() => {
    axiosInstance
      .post(`/view-all-users`, {
        viewer_id: viewer_id,
      })
      .then((response) => {
        if (response.data.success) {
          const transformedUsers = response.data.users.map((user) => ({
            ...user,
            "First Name": user.first_name || "N/A",
            "Last Name": user.last_name || "N/A",
            "Profile Name": user.profile_name || "N/A",
            "Currency Name": user.currency_name || "NA",
            "Timezone Name": user.timezone_name || "NA",
          }));
          setUsers(transformedUsers);
          setLoading(false);
        } else {
          console.error("Error fetching users:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
      });
  }, [setUsers, viewer_id]);

  useEffect(() => {
    if (filter.filterApplied) {
      dispatch(SetInitialData(filter.filterData));
      dispatch(SetSearchData(filter.filterData));
    } else {
      dispatch(SetInitialData(users));
      dispatch(SetSearchData(users));
    }
    dispatch(SetSearchTable("user"));
    dispatch(
      SetSearchFields([
        "first_name",
        "last_name",
        "email",
        "username",
        "profile_name",
        "currency_name",
        "timezone_name",
      ])
    );
  }, [users, dispatch, searchValue]);

  const transformedFilterData = filter?.filterData?.map((user) => ({
    ...user,
    "First Name": user.first_name || "N/A",
    "Last Name": user.last_name || "N/A",
    "Profile Name": user.profile_name || "N/A",
    "Currency Name": user.currency_name || "NA",
    "Timezone Name": user.timezone_name || "NA",
  }));

  const transformedSearchData = searchData?.map((user) => ({
    ...user,
    "First Name": user.first_name || "N/A",
    "Last Name": user.last_name || "N/A",
    "Profile Name": user.profile_name || "N/A",
    "Currency Name": user.currency_name || "NA",
    "Timezone Name": user.timezone_name || "NA",
  }));

  const OnChangeHandler = (data) => {
    if (data === users || data.length === 0) {
      setSelectedUsers(data);
      return;
    }
    const idx = selectedUsers.findIndex(
      (selectedItem) => selectedItem.id === data.id
    );

    if (idx === -1) {
      setSelectedUsers((prevState) => [...prevState, data]);
    } else {
      const updatedSelectedItems = selectedUsers.filter(
        (items) => items.id !== data.id
      );
      setSelectedUsers(updatedSelectedItems);
    }
  };

  const columns = [
    "First Name",
    "Last Name",
    "email",
    "username",
    "Profile Name",
    "Currency Name",
    "Timezone Name",
    "active",
  ];

  const rowKeys = [
    "first_name",
    "last_name",
    "email",
    "username",
    "profile_name",
    "currency_name",
    "timezone_name",
    "active",
  ];

  const handleClick = (id) => {
    // Implement if needed
    console.log("Clicked row with id:", id);
  };

  // Add this function to open the AddUserDialog
  const handleOpenAddUserDialog = () => {
    setIsAddUserDialogOpen(true);
  };

  // Add this function to close the AddUserDialog
  const handleCloseAddUserDialog = () => {
    setIsAddUserDialogOpen(false);
  };

  const handleOpenEditUserDialog = () => {
    setIsEditUserDialogOpen(true);
  };

  const handleCloseEditUserDialog = () => {
    setIsEditUserDialogOpen(false);
  };

  return (
    <>
      <CRUDAllUser
        onAddUser={handleOpenAddUserDialog}
        onEditUser={handleOpenEditUserDialog}
        groupByColumn={groupByColumn}
        setGroupByColumn={setGroupByColumn}
        groupByOptions={groupByOptions}
        customStyles={customStyles}
      />
      <AddUserDialog
        open={isAddUserDialogOpen}
        onClose={handleCloseAddUserDialog}
        size="small"
      />
      <EditUserDialog
        open={isEditUserDialogOpen}
        onClose={handleCloseEditUserDialog}
      />

      <ResizableTable
        data={
          searchApplied
            ? transformedSearchData
            : filter.filterApplied
            ? transformedFilterData
            : users
        }
        loading={filter.filterApplied ? filter.loading : loading}
        columnsHeading={columns}
        selectedItems={selectedUsers}
        rowKeys={rowKeys}
        OnChangeHandler={OnChangeHandler}
        OnClickHandler={handleClick}
        searchTerm={searchValue}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        groupByColumn={groupByColumn}
        expandedGroups={expandedGroups}
        setExpandedGroups={setExpandedGroups}
      />
    </>
  );
};

export default UsersTable;
