import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import toast from "react-hot-toast";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import { fetchRolesAsync, UnselectAllRole } from "../../../features/role/roleSlice.js";
import { useDispatch, useSelector } from "react-redux";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

function EditRole() {
  const { viewer_id, baseURL, globalOrgId } = useContext(GlobalContext);
  const selectedRoles = useSelector((state) => state.roles.selectedRoles);
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedParentRole, setSelectedParentRole] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const axiosInstance = useAxiosInstance();
  const [sortConfig, setSortConfig] = useState({ key: "Updated At", direction: "desc" });
  const [crossRecordVisibility, setCrossRecordVisibility] = useState(true);

  const dispatch = useDispatch();

  const columns = [
    "First Name",
    "Last Name",
    "Current Role",
    "username",
    "Profile Name",
  ];

  const rowKeys = [
    "first_name",
    "last_name",
    "role_name",
    "username",
    "profile_name",
  ];

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.post(`/user-role/view-active-roles`, {
          viewer_id: viewer_id,
          organisation_id: globalOrgId,
        });

        if (response.data.success) {
          setRoles(response.data.data);
          // Set the parent role if it exists
          if (selectedRoles?.[0]?.parent_role) {
            const parentRole = response.data.data.find(role => role.id === selectedRoles[0].parent_role);
            setSelectedParentRole(parentRole || null);
          }
        } else {
          toast.error(response.data.message || "Failed to fetch roles");
        }
      } catch (error) {
        toast.error("Failed to fetch roles. Please try again later.");
        console.error("Network error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.post(`/view-all-users`, {
          viewer_id: viewer_id,
        });

        if (response.data.success) {
          const transformedUsers = response.data.users
            .filter(user => user.active === 1)
            .map((user) => ({
              ...user,
              "First Name": user.first_name || "N/A",
              "Last Name": user.last_name || "N/A",
              "Profile Name": user.profile_name || "N/A",
            }));
          setUsers(transformedUsers);

          // Fetch users assigned to this role
          if (selectedRoles?.[0]?.id) {
            const roleInfoResponse = await axiosInstance.post('/user-role/get-role-info', {
              role_id: selectedRoles[0].id,
              organisation_id: globalOrgId
            });

            if (roleInfoResponse.data.users) {
              // Transform and set the preselected users
              const roleUsers = roleInfoResponse.data.users;
              const preselectedUsers = transformedUsers.filter(user => 
                roleUsers.some(roleUser => roleUser.id === user.id)
              );
              setSelectedUsers(preselectedUsers);
            }
          }
        } else {
          toast.error(response.data.message || "Failed to fetch users");
        }
      } catch (error) {
        toast.error("Failed to fetch users. Please try again later.");
        console.error("Network error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchRoles();
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedRoles?.[0]) {
      setName(selectedRoles[0].name || "");
      setCrossRecordVisibility(selectedRoles[0].cross_record_visibility === 1);
    }
  }, [selectedRoles]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDisable(true);

    try {
      const payload = {
        role_id: selectedRoles[0].id,
        name: name,
        parent_role: selectedParentRole?.id || null,
        cross_record_visibility: crossRecordVisibility ? 1 : 0,
        viewer_id: viewer_id,
        organisation_id: globalOrgId,
        user_ids: selectedUsers.map(user => user.id)
      };

      const response = await axiosInstance.post(`/user-role/edit-role`, payload);

      if (response.status >= 200 && response.status < 300) {
        setIsOpen(false);
        dispatch(
          fetchRolesAsync({
            viewer_id,
            baseURL: baseURL,
            organisation_id: globalOrgId,
          })
        );
        dispatch(UnselectAllRole());
        setName("");
        setSelectedParentRole(null);
        setSelectedUsers([]);
        setCrossRecordVisibility(false);
        toast.success(response.data.message || "Role updated successfully");
      } else {
        toast.error(response.data.error || response.data.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 400) {
        toast.error(error.response.data.error || "Invalid request");
      } else {
        toast.error("Failed to update role");
      }
    } finally {
      setIsDisable(false);
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setName("");
    setSelectedParentRole(null);
    setSelectedUsers([]);
    setCrossRecordVisibility(false);
  };

  const handleOpenDialog = () => {
    if (selectedRoles?.[0]) {
      setName(selectedRoles[0].name || "");
      setCrossRecordVisibility(selectedRoles[0].cross_record_visibility === 1);
    }
    setIsOpen(true);
  };

  const handleClick = (id) => {
    console.log("Clicked row with id:", id);
  };

  return (
    <>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div 
                className="absolute inset-0 bg-black/60"
                onClick={handleCloseModal}
              ></div>
              <div className="bg-white p-8 rounded-lg z-50 max-h-[90vh] w-[80vw] shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-xl font-semibold text-gray-800">
                    Edit Role
                  </h1>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-between gap-4 mb-4 w-full">
                  <div className="flex-1 flex items-center">
                    <label className="text-sm font-medium text-gray-900 dark:text-white min-w-[100px]">
                      Role Name:
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all"
                      placeholder="Enter role name..."
                      required
                    />
                  </div>
                  <div className="flex-1 flex items-center">
                    <label className="text-sm font-medium text-gray-900 dark:text-white min-w-[100px]">
                      Parent Role:
                    </label>
                    <select
                      value={selectedParentRole?.id || ""}
                      onChange={(e) => {
                        const selected = roles.find(role => role.id === e.target.value);
                        setSelectedParentRole(selected || null);
                      }}
                      title={!selectedParentRole?.id ? "This is the topmost role" : ""}
                      className="flex-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all"
                    >
                      <option value="" title="This is the topmost role" className="text-center text-lg font-bold">
                        ─
                      </option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4 flex items-center">
                  <label className="text-sm font-medium text-gray-900 dark:text-white min-w-[100px] max-w-[100px]">
                    Cross Record Visibility:
                  </label>
                  <input
                    type="checkbox"
                    checked={crossRecordVisibility}
                    onChange={(e) => setCrossRecordVisibility(e.target.checked)}
                    className="w-4 h-4 ml-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>


                <div className="h-[calc(84vh-250px)] overflow-hidden pb-2 rounded-lg border border-gray-200">
                  <ResizableTable
                    data={users}
                    loading={loading}
                    columnsHeading={columns}
                    selectedItems={selectedUsers}
                    rowKeys={rowKeys}
                    OnChangeHandler={OnChangeHandler}
                    OnClickHandler={handleClick}
                    sortConfig={sortConfig}
                    setSortConfig={setSortConfig}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium flex justify-center items-center w-[100px] text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <form onSubmit={handleSubmit}>
                    <button
                      type="submit"
                      disabled={isDisable}
                      className="px-4 py-2 text-sm font-medium flex justify-center items-center w-[100px] text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleOpenDialog}
        className="text-secondary flex flex-nowrap justify-center items-center text-[14px] mt-2 pt-1 pb-1 pl-4 pr-4 mr-2 mb-2 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
      >
        <FontAwesomeIcon icon={faEdit} className="mr-2" />
        Edit
      </button>
    </>
  );
}

export default EditRole;