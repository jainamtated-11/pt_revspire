import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { Grid } from "react-loader-spinner";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import useOutsideClick from "../../../hooks/useOutsideClick.js";

function AssignUsersDialog() {
  const {
    viewer_id,
    setSelectedProfiles,
    selectedProfiles,
    setAssignUsersClicked,
  } = useContext(GlobalContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [profileData, setProfileData] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const axiosInstance = useAxiosInstance();

  const actions = () => {
    setUsers([]);
    setProfileData([]);
    setSelectedUsers([]);
    setAssignUsersClicked(false);
  };

  const modalRef = useOutsideClick([actions]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await axiosInstance.post(
          `/view-profile-and-permission/${selectedProfiles[0].id}`,
          { viewer_id },
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        const fetchedProfileData = profileResponse.data.profile;
        setProfileData(fetchedProfileData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    const fetchAssignableUsers = async () => {
      try {
        const response = await axiosInstance.post(
          `/assignable-users/${selectedProfiles[0].id}`,
          {
            viewer_id: viewer_id,
          },
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        if (response.data.success) {
          setUsers(response.data.users);
        } else {
          console.error(
            "Error fetching assignable users:",
            response.data.message
          );
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assignable users:", error);
        setLoading(false);
      }
    };
    fetchData();
    fetchAssignableUsers();
  }, [viewer_id]);

  const handleUserSelection = (userId) => {
    const updatedSelectedUsers = [...selectedUsers];
    const index = updatedSelectedUsers.indexOf(userId);
    if (index > -1) {
      updatedSelectedUsers.splice(index, 1); // Unselect user if already selected
    } else {
      updatedSelectedUsers.push(userId); // Select user if not selected
    }
    setSelectedUsers(updatedSelectedUsers);
  };

  const handleSave = async () => {
    try {
      setButtonLoading(true);
      const response = await axiosInstance.put(
        `/assign-profile`,
        {
          userIds: selectedUsers,
          profileId: selectedProfiles[0].id,
          viewer_id: viewer_id,
        },
        {
          withCredentials: true, // Include credentials if necessary
        }
      );
      if (response.data.success) {
        console.log("Profiles assigned successfully.");
        toast.success("Profiles assigned successfully.");
        setSelectedProfiles([]);
        setButtonLoading(false);
        setTimeout(() => {
          setAssignUsersClicked(false); // Close the dialog after saving
        }, 3000);
      } else {
        console.error("Error assigning profiles:", response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error assigning profiles:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="fixed inset-0 flex items-center justify-center z-30">
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
          <div className="bg-transparent p-6 rounded-md z-10 w-auto">
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
    <div className="fixed inset-0 flex items-center justify-center z-30">
      <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-md z-10 w-auto max-w-2xl"
      >
        <h1 className="text-xl font-bold mb-4">Assign Users</h1>
        <div className="flex flex-row items-center gap-4 mb-4">
          <label className="w-24 text-sm font-bold">Name:</label>
          <input
            type="text"
            value={profileData.name}
            readOnly
            className="border border-gray-400 rounded-md py-1 px-2"
          />
        </div>
        <div>
          <div className="font-bold text-sm mt-6 mb-4">Assignable Users:</div>
          <div className="table-container max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 mb-12">
              <thead className="bg-gray-50">
                <tr>
                  <th></th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Current Profile
                  </th>
                </tr>
              </thead>
              <tbody className=" bg-white divide-y divide-gray-200 ">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="pr-6 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelection(user.id)}
                      />
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap">
                      {user.profile_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => setAssignUsersClicked(false)}
            className="flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid border-red-500 bg-red-300 text-red-800"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSave}
            className="flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid border-gray-400 bg-white text-gray-800"
          >
            {buttonLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignUsersDialog;
