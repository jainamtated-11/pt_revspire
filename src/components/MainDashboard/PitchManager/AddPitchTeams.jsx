import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable";

const AddPitchTeams = ({
  onCancel,
  selectedGroups,
  setSelectedGroups,
  selectedUsers,
  setSelectedUsers,
}) => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const axiosInstance = useAxiosInstance();
  const [activeTab, setActiveTab] = useState("groups");

  // Local state for selected items
  const [localSelectedGroups, setLocalSelectedGroups] = useState([]);
  const [localSelectedUsers, setLocalSelectedUsers] = useState([]);

  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});

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

  const columnsPeople = [
    "First Name",
    "Last Name",
    "email",
    "username",
    "Profile Name",
    "Currency Name",
    "Timezone Name",
    "active",
  ];

  const rowKeysPeople = [
    "first_name",
    "last_name",
    "email",
    "username",
    "profile_name",
    "currency_name",
    "timezone_name",
    "active",
  ];

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupsResponse, usersResponse] = await Promise.all([
          axiosInstance.post("/groups/get-groups", {}, { signal: controller.signal }),
          axiosInstance.post("/view-all-users", {}, { signal: controller.signal }),
        ]);

        // Filter for active groups and users
        const activeGroups = (groupsResponse.data.groups || [])
        .filter(group => group.is_active === 1)
        .map(group => ({
          ...group,
          active: group.is_active, // Add the 'active' property
        }));
      
        const activeUsers = (usersResponse.data.users || []).filter(user => user.active === 1);


        setGroups(activeGroups);
        setUsers(activeUsers);
        updateLocalSelection(activeGroups, activeUsers);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false); // Ensure loading is set to false regardless of success/failure
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const updateLocalSelection = (groups, users) => {
    if (selectedGroups.length > 0) {
      // Match ids in selectedGroups with objects in groups
      const matchingGroups = groups.filter((group) =>
        selectedGroups.includes(group.id)
      );
      console.log("matching GROUPS", matchingGroups);
      // Set matching groups to localSelectedGroups
      setLocalSelectedGroups(matchingGroups);
    }

    if (selectedUsers.length > 0) {
      // Match ids in selectedUsers with objects in users
      const matchingUsers = users.filter((user) =>
        selectedUsers.includes(user.id)
      );
      // Set matching users to localSelectedUsers
      setLocalSelectedUsers(matchingUsers);
    }

    setLoading(false);
  };

  const resetAllStates = () => {
    setGroups([]);
    setUsers([]);
    setLocalSelectedGroups([]);
    setLocalSelectedGroups([]);
    setActiveTab("groups");
  };

  const handleSelection = (data, selectedItems, setSelectedItems) => {
    if (data === selectedItems || data.length === 0) {
      setSelectedItems(data);
      return;
    }
    const idx = selectedItems.findIndex((item) => item.id === data.id);
    if (idx === -1) {
      setSelectedItems((prev) => [...prev, data]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item.id !== data.id));
    }
  };

  const addPitchTeamsData = () => {
    const userIds = localSelectedUsers.map((user) => user.id); // Extract only the ids
    const groupIds = localSelectedGroups.map((group) => group.id); // Extract only the ids

    setSelectedUsers(userIds);
    setSelectedGroups(groupIds);
    resetAllStates();
    onCancel();
  };

  // Usage
  const OnChangeHandler = (data) =>
    handleSelection(data, localSelectedGroups, setLocalSelectedGroups);
  const OnChangeHandlerPeople = (data) =>
    handleSelection(data, localSelectedUsers, setLocalSelectedUsers);

  const renderContent = () => {
    switch (activeTab) {
      case "people":
        return (
          <div className="h-96">
            {" "}
            <ResizableTable
              data={users}
              columnsHeading={columnsPeople}
              rowKeys={rowKeysPeople}
              heightNotFixed={true}
              selectedItems={localSelectedUsers}
              OnChangeHandler={OnChangeHandlerPeople}
              loading={loading}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
            />
          </div>
        );
      case "groups":
        return (
          <div className="h-96">
            <ResizableTable
              data={groups}
              columnsHeading={columns}
              rowKeys={rowKeys}
              heightNotFixed={true}
              selectedItems={localSelectedGroups}
              OnChangeHandler={OnChangeHandler}
              loading={loading}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 shadow-xl w-full max-w-4xl">
        <div className="flex flex-col justify-between items-center">
          <div className="sticky top-0 bg-white border-b px-6 py-3 shadow-md z-10 w-full">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Create Pitch Teams
              </h3>
              <button
                type="button"
                className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => {
                  onCancel();
                  resetAllStates();
                }}
              >
                <FontAwesomeIcon
                  className="text-gray-500 text-2xl"
                  icon={faXmark}
                />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 w-full">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <ul className="flex flex-wrap  text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                <li className="me-2">
                  <a
                    href="#"
                    onClick={() => setActiveTab("groups")}
                    className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg hover:text-sky-700 hover:border-sky-700 dark:hover:text-gray-300 group ${
                      activeTab === "groups"
                        ? "border-sky-800 text-sky-800 "
                        : "border-transparent"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 me-2  group-hover:text-sky-700 dark:text-sky-700  dark:group-hover:text-gray-300 ${
                        activeTab === "groups"
                          ? "text-sky-800"
                          : "text-gray-400"
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                    </svg>
                    Groups
                  </a>
                </li>

                <li className="me-2">
                  <a
                    href="#"
                    onClick={() => setActiveTab("people")}
                    className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg hover:text-sky-700 hover:border-sky-700 dark:hover:text-gray-300 group ${
                      activeTab === "people"
                        ? "border-sky-800 text-sky-800"
                        : "border-transparent"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 me-2 text-gray-400 group-hover:text-sky-700 dark:text-sky-700 dark:group-hover:text-gray-300 ${
                        activeTab === "people"
                          ? "text-sky-800"
                          : "text-gray-400"
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                    </svg>
                    People
                  </a>
                </li>
              </ul>
            </div>
            <div className="mt-4">{renderContent()}</div>
          </div>
          <div
            className="space-x-16 flex justify-end p-2 border-t shadow-md z-10 w-full"
            style={{ boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)" }}
          >
            {/* Cancel Button */}
            <div className=" mt-1 flex space-x-[20px] justify-between mr-6 ">
              <button
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => {
                  onCancel();
                  resetAllStates();
                }}
              >
                Cancel
              </button>
              <button
                className={`px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md  focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                // disabled={
                //   localSelectedGroups.length == 0 &&
                //   localSelectedUsers.length == 0
                // }
                onClick={addPitchTeamsData}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPitchTeams;