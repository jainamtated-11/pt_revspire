import React, { useEffect, useContext, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import CRUDprofile from "./CRUDprofile.jsx";
import AddProfileDialog from "./AddProfileDialog.jsx";
import EditProfileDialog from "./EditProfileDialog.jsx";
import AssignUsersDialog from "./AssignUsersDialog.jsx";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";
import { useSelector, useDispatch } from "react-redux";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";

function ProfileManagement() {
  const {
    viewer_id,
    selectedProfiles,
    setSelectedProfiles,
    addProfileClicked,
    editProfileClicked,
    profiles,
    setProfiles,
    assignUsersClicked,
  } = useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(true);
  const axiosInstance = useAxiosInstance();
  const [sortConfig, setSortConfig] = useState({ key: "Updated At", direction: "desc" });
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const filter = useSelector((state) => state.filter);
  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);
  const dispatch = useDispatch();

  useEffect(() => {
    if (filter.filterApplied) {
      dispatch(SetInitialData(filter.filterData));
      dispatch(SetSearchData(filter.filterData));
    } else {
      dispatch(SetInitialData(profiles));
      dispatch(SetSearchData(profiles));
    }
    dispatch(SetSearchTable("profile"));
    dispatch(SetSearchFields(["name"]));
  }, [profiles, dispatch, searchValue]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axiosInstance.post(`/view-all-profiles`, {
          viewer_id,
        });
        setProfiles(response.data.profiles);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };

    fetchProfiles();

    // Cleanup function
    return () => {
      // Cleanup logic if necessary
    };
  }, [viewer_id, setProfiles]);

  const transformedConnections = profiles.map((connection) => ({
    ...connection,
    "Created At": connection.created_at,
    "Created By": connection.created_by_name,
    "Updated By": connection.updated_by_name,
    "Updated At": connection.updated_at,
  }));

  const transformedFilterData = filter?.filterData?.map((connection) => ({
    ...connection,
    "Created At": connection.created_at,
    "Created By": connection.created_by_name,
    "Updated By": connection.updated_by_name,
    "Updated At": connection.updated_at,
  }));

  const transformedSearchData = searchData?.map((connection) => ({
    ...connection,
    "Created At": connection.created_at,
    "Created By": connection.created_by_name,
    "Updated By": connection.updated_by_name,
    "Updated At": connection.updated_at,
  }));

  // Update the columnsHeading and rowData
  const columnsHeading = [
    "name",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
    "Active",
  ];

  const rowKeys = [
    "name",
    "created_by_name",
    "created_at",
    "updated_by_name",
    "updated_at",
    "active",
  ];

  // Add a click handler for row clicks (if needed)
  const handleRowClick = (rowId) => {
    console.log("Row clicked:", rowId);
    // Add your row click logic here
  };

  const OnChangeHandler = (data) => {
    if (data.length == profiles.length || data.length == 0) {
      setSelectedProfiles(data);
      return;
    }
    const idx = selectedProfiles.findIndex(
      (selectedItem) => selectedItem.id === data.id
    );

    if (idx === -1) {
      setSelectedProfiles((prevState) => [...prevState, data]);
    } else {
      const updatedSelectedItems = selectedProfiles.filter(
        (items) => items.id != data.id
      );
      setSelectedProfiles(updatedSelectedItems);
    }
  };

  const groupByOptions = [
    { value: null, label: "No grouping" },
    { value: "name", label: "Name" },
    { value: "created_by_name", label: "Created By" },
    { value: "updated_by_name", label: "Updated By" },
    { value: "active", label: "Active Status" }
  ];

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

  return (
    <>
      <CRUDprofile 
        groupByColumn={groupByColumn}
        setGroupByColumn={setGroupByColumn}
        groupByOptions={groupByOptions}
        customStyles={customStyles}
      />
      <div>{addProfileClicked && <AddProfileDialog />}</div>
      <div>{editProfileClicked && <EditProfileDialog />}</div>
      <div>{assignUsersClicked && <AssignUsersDialog />}</div>
      <div className="-m-0.5">
        <ResizableTable
          data={
            searchApplied
              ? transformedSearchData
              : filter.filterApplied
              ? transformedFilterData
              : transformedConnections
          }
          loading={filter.loading || isLoading}
          columnsHeading={columnsHeading}
          selectedItems={selectedProfiles}
          rowKeys={rowKeys}
          OnChangeHandler={OnChangeHandler}
          OnClickHandler={handleRowClick}
          searchTerm={searchValue}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          groupByColumn={groupByColumn}
          expandedGroups={expandedGroups}
          setExpandedGroups={setExpandedGroups}
        />
      </div>
    </>
  );
}

export default ProfileManagement;
