import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../context/GlobalState";
import {
  fetchGroupsAsync,
  UnselectAllGroup,
} from "../../../features/group/groupSlice";
import { useDispatch } from "react-redux";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import toast from "react-hot-toast";
import useOutsideClick from "../../../hooks/useOutsideClick";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable";
import { useSelector } from "react-redux";

const EditGroup = ({ isOpen, setIsOpen }) => {
  const { viewer_id, baseURL, globalOrgId } = useContext(GlobalContext);

  const selectedGroups = useSelector((state) => state.groups.selectedGroups);
  const [name, setName] = useState(selectedGroups?.[0]?.name || "");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const axiosInstance = useAxiosInstance();
  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});

  const dispatch = useDispatch();

  const columns = [
    "First Name",
    "Last Name",
    "email",
    "username",
    "Profile Name",
  ];

  const rowKeys = [
    "first_name",
    "last_name",
    "email",
    "username",
    "profile_name",
  ];

  useEffect(() => {
    if (isOpen) {
      const fetchGroupUsers = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.post(
            `/groups/get-user-group-assignments`,
            {
              viewer_id: viewer_id,
              group_id: selectedGroups[0].id,
            }
          );

          if (response) {
            const transformedUsers = response.data.user_assignments.map(
              (user) => ({
                ...user,
                id: user.user_id,
              })
            );
            setSelectedUsers(transformedUsers);
          }
        } catch (error) {
          toast.error("Failed to fetch users. Please try again later.");
          console.error("Network error:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchGroupUsers();
    }
  }, [isOpen]);

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
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.post(`/view-all-users`, {
            viewer_id: viewer_id,
          });

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

      fetchUsers();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDisable(true);

    try {
      const userIds = selectedUsers.map((user) => user.id);
      const payload = {
        id: selectedGroups[0].id,
        name: name,
        userIds: userIds,
        created_by: viewer_id,
        organisation_id: globalOrgId,
      };
      const response = await axiosInstance.post(
        `/groups/create-and-edit-group`,
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setIsOpen(false);
      dispatch(
        fetchGroupsAsync({
          viewer_id,
          baseURL: baseURL,
          organisation_id: globalOrgId,
        })
      );
      dispatch(UnselectAllGroup());
      setName("");
      setSelectedUsers([]);
      toast.success("Group updated successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update group");
    } finally {
      setIsDisable(false);
    }
  };

  const actions = () => {
    setIsOpen(false);
  };

  const modalRef = useOutsideClick([actions]);

  const handleClick = (id) => {
    console.log("Clicked row with id:", id);
  };

  if (!isOpen) return null;

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal">
        <div className="modal-content">
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/60"></div>
            <div
              ref={modalRef}
              className="bg-white p-8 rounded-lg z-50 max-h-[90vh] w-[80vw] shadow-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-gray-800">
                  Edit Group
                </h1>
                <button
                  onClick={() => setIsOpen(false)}
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
              <div className="mb-4 flex items-center">
                <label className="text-sm font-medium text-gray-900 dark:text-white min-w-[100px]">
                  Group Name:
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 max-w-md bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 transition-all"
                  placeholder="Enter group name..."
                  required
                />
              </div>

              <div className="h-[calc(90vh-250px)] overflow-hidden rounded-lg border border-gray-200">
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
                  type="submit"
                  disabled={isDisable}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditGroup;
