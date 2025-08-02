import { useContext, useState, useEffect, useRef } from "react";
import { GlobalContext } from "../../../context/GlobalState";
import { fetchRolesAsync } from "../../../features/role/roleSlice";
import { useDispatch } from "react-redux";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import toast from "react-hot-toast";
import GlobalAddButton from "../../../utility/CustomComponents/GlobalAddButton";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";

const AddRole = () => {
  const { viewer_id, baseURL, globalOrgId } = useContext(GlobalContext);

  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedParentRole, setSelectedParentRole] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [crossRecordVisibility, setCrossRecordVisibility] = useState(false);
  const axiosInstance = useAxiosInstance();
  const dispatch = useDispatch();
  const modalRef = useRef(null);

  const [sortConfig, setSortConfig] = useState({ key: "Updated At", direction: "desc" });

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

    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
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
              "Current Role": user.role_name || "N/A",
              "Profile Name": user.profile_name || "N/A",
            }));

            setUsers(transformedUsers);
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
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDisable(true);

    try {
      const payload = {
        name: name,
        parent_role: selectedParentRole?.id || null,
        cross_record_visibility: crossRecordVisibility ? 1 : 0,
        viewer_id: viewer_id,
        organisation_id: globalOrgId,
        user_ids: selectedUsers.map(user => user.id)
      };

      const response = await axiosInstance.post(
        `/user-role/create-role`,
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setIsOpen(false);
        setName("");
        setSelectedParentRole(null);
        setSelectedUsers([]);
        setCrossRecordVisibility(false);
        dispatch(
          fetchRolesAsync({
            viewer_id,
            baseURL: baseURL,
            organisation_id: globalOrgId,
          })
        );
        toast.success("Role added successfully");
      } else {
        toast.error("Error creating role!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error creating role!");
    } finally {
      setIsDisable(false);
    }
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setName("");
    setSelectedParentRole(null);
    setSelectedUsers([]);
    setCrossRecordVisibility(false);
  };

  const handleClick = (id) => {
    console.log("Clicked row with id:", id);
  };

  return (
    <>
      <GlobalAddButton onClick={handleOpenDialog} />
      {isOpen && (
        <form onSubmit={handleSubmit}>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/60"></div>
            <div
              ref={modalRef}
              className="bg-white p-8 rounded-lg z-50 max-h-[90vh] w-[80vw] shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-gray-800">
                  Add Role
                </h1>
                <button
                  onClick={handleCancel}
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
                    className="flex-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all"
                  >
                    <option value="">Select a parent role</option>
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
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium flex justify-center items-center w-[100px] text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDisable}
                  className="px-4 py-2 w-[100px] flex justify-center items-center text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default AddRole; 