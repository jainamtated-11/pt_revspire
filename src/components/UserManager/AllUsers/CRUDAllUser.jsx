import React, { useContext, useState, useEffect } from "react";
import EditUser from "./EditUser.jsx";
import ActivateUser from "./ActivateUser.jsx";
import DeactivateUser from "./DeavtivateUser.jsx";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { Grid } from "react-loader-spinner";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import useCheckFrontendPermission from "../../../Services/checkFrontendPermission.jsx";
import useCheckUserLicense from "../../../Services/checkUserLicense.jsx";
import FilterModal from "../../../utility/FilterModal.jsx";
import GlobalAddButton from "../../../utility/CustomComponents/GlobalAddButton.jsx";
import SearchBar from "../../../utility/SearchBar.jsx";
import Select from "react-select";
import { X } from "lucide-react";

export const CRUDAllUser = ({ 
  onAddUser, 
  onEditUser, 
  groupByColumn,
  setGroupByColumn,
  groupByOptions,
  customStyles
}) => {
  const { selectedUsers, viewer_id, setSelectedUsers, setUsers, users } =
    useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const checkUserLicense = useCheckUserLicense();
  const [areAllActive, setAreAllActive] = useState(false);
  const [areAllInactive, setAreAllInactive] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkFrontendPermission = useCheckFrontendPermission();

  useEffect(() => {
    if (
      checkUserLicense("Revenue Enablement Elevate") == "1" ||
      checkUserLicense("Revenue Enablement Spark") == "1"
    )
      checkUserStatus();
  }, [selectedUsers]);

  const checkUserStatus = () => {
    if (selectedUsers.length === 0) {
      setAreAllActive(false);
      setAreAllInactive(false);
      return;
    }

    let allActive = true;
    let allInactive = true;

    selectedUsers.forEach((user) => {
      if (user.active !== 1) {
        allActive = false;
      } else {
        allInactive = false;
      }
    });

    setAreAllActive(allActive);
    setAreAllInactive(allInactive);
  };

  const handleActivateClick = async () => {
    try {
      const tempUsernames = [];
      // Iterate over selected users to collect their usernames
      for (let i = 0; i < selectedUsers.length; i++) {
        const selectedUserId = selectedUsers[i].id;
        const selectedUser = users.find((user) => user.id === selectedUserId);
        if (!selectedUser) {
          console.error("Selected user not found in users state");
          continue; // Move to the next selected user
        }

        const selectedUsername = selectedUser.username;

        // Check if the username already exists in the temporary array
        if (tempUsernames.includes(selectedUsername)) {
          setSelectedUsers([]);
          refreshUsers();
          toast.error("More than one user with the same username is selected.");
          return; // Stop further processing
        }

        tempUsernames.push(selectedUsername);
      }

      for (let i = 0; i < selectedUsers.length; i++) {
        const selectedUserId = selectedUsers[i].id;
        const selectedUser = users.find((user) => user.id === selectedUserId);
        if (!selectedUser) {
          console.error("Selected user not found in users state");
          continue; // Move to the next selected user
        }

        const selectedUsername = selectedUser.username;

        // Check if any user with the same username is active
        const userWithSameUsername = users.find(
          (user) => user.username === selectedUsername && user.active === 1
        );
        if (userWithSameUsername) {
          setSelectedUsers([]);
          refreshUsers();
          toast.error("User with the same username is already active.");
          return; // Stop further processing
        }
      }
      setLoading(true);
      // If no active users with the same username are found, proceed with activation
      const user_ids = selectedUsers.map((user) => user.id);
      const response = await axiosInstance.patch(`/activate-users`, {
        user_ids: user_ids,
        updated_by: viewer_id,
      });

      const data = await response.data;

      if (response.status >= 200 && response.status < 300) {
        console.log(data.message);
        setSelectedUsers([]);
        refreshUsers();
        toast.success("Users Activated Successfully !");
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error activating users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateClick = async () => {
    setLoading(true);
    try {
      const user_ids = selectedUsers.map((user) => user.id); // Assuming user IDs are stored in 'id' field
      const response = await axiosInstance.patch(`/deactivate-users`, {
        user_ids: user_ids,
        updated_by: viewer_id,
      });

      const data = await response.data;

      if (response.status >= 200 && response.status < 300) {
        // Handle success response
        setSelectedUsers([]);
        refreshUsers();
        toast.success("User Deactivated Sucessfully !");
      } else {
        // Handle error response
        console.error("Error:", data.message);
        // Display error message to user or handle the error scenario appropriately
      }
    } catch (error) {
      console.error("Error deactivating users:", error);
      // Handle any unexpected errors that might occur during the fetch operation
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = () => {
    axiosInstance
      .post(`/view-all-users`, {
        viewer_id: viewer_id,
      })
      .then((response) => {
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          console.error("Error fetching users:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
      });
  };

  if (loading) {
    return (
      <div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
          <div className="bg-transparent p-6 rounded-md z-50 w-auto">
            <Grid
              visible={true}
              height="40"
              width="40"
              color="#075985"
              ariaLabel="grid-loading"
              radius="12.5"
              wrapperStyle={{}}
              wrapperClass="grid-wrapper"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container flex justify-between mx-auto pt-0 pb-4 w-full">
        <div className="flex transition-all">
          {selectedUsers.length === 0 &&
            checkFrontendPermission("Create Users") == "1" && (
              <GlobalAddButton onClick={onAddUser} />
            )}
          <div
            className={`flex flex-row mb-1  ${
              selectedUsers.length > 0 &&
              checkFrontendPermission(
                "Create Users;Edit Users;Activate/Deactivate Users"
              ) == "1"
                ? "overflow-x-auto pl-2 h-full  rounded-md bg-white shadow-md  scroll-none items-center"
                : ""
            }`}
          >
            {selectedUsers.length === 1 &&
              checkFrontendPermission("Edit Users") == "1" && (
                <div className="transition-all flex items-center whitespace-nowrap" onClick={onEditUser}>
                  <EditUser />
                </div>
              )}
            {areAllInactive &&
              checkFrontendPermission("Activate/Deactivate Users") == "1" && (
                <div className="transition-all flex items-center whitespace-nowrap" onClick={handleActivateClick}>
                  <ActivateUser />
                </div>
              )}
            {areAllActive &&
              checkFrontendPermission("Activate/Deactivate Users") == "1" && (
                <div className="transition-all flex items-center whitespace-nowrap" onClick={handleDeactivateClick}>
                  <DeactivateUser />
                </div>
              )}
          </div>
        </div>
        <div className="flex flex-row space-x-2">
          <div className="flex items-center">
            <div className="w-[30px] flex-1">
              {groupByColumn && (
                <button
                  onClick={() => setGroupByColumn(null)}
                  className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 mr-1 text-sm"
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
          <div className="w-[200px] mt-0.5">
            <SearchBar searchTable="user" />
          </div>
          <FilterModal queryTable="user" />
        </div>
      </div>
    </>
  );
};
