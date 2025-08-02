import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { Grid } from "react-loader-spinner";
import toast from 'react-hot-toast';
import useOutsideClick from "../../../hooks/useOutsideClick.js";

function EditProfileDialog() {
  const {
    setEditProfileClicked,
    viewer_id,
    profiles,
    setProfiles,
    selectedProfiles,
  } = useContext(GlobalContext);
  const [profileData, setProfileData] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedName, setEditedName] = useState(""); // State for edited name
  const [editedPermissions, setEditedPermissions] = useState([]); // State for edited permissions
  const [expandedFeatures, setExpandedFeatures] = useState({});
  const axiosInstance = useAxiosInstance();

  const actions = () => {
    setEditProfileClicked(false);
    setPermissions([]);
    setProfileData(null)
    setEditedName("");
    setExpandedFeatures({});
  }

  const modalRef = useOutsideClick([actions])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await axiosInstance.post(
          `/view-profile-and-permission/${selectedProfiles[0].id}`,
          { viewer_id }
        );
        const fetchedProfileData = profileResponse.data.profile;
        setProfileData(fetchedProfileData);
        setEditedName(fetchedProfileData.name); // Initialize edited name

        const permissionsResponse = await axiosInstance.post(
          `/view-all-permissions`,
          { viewer_id }
        );
        const allPermissions = permissionsResponse.data.permissions;

        const updatedPermissions = allPermissions.map((permission) => {
          const isSelected = fetchedProfileData.permissions.some(
            (p) => p.id === permission.id
          );
          return { ...permission, selected: isSelected };
        });

        setPermissions(updatedPermissions);
        setEditedPermissions(updatedPermissions.filter((p) => p.selected)); // Initialize edited permissions
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [viewer_id, selectedProfiles]);

  const refreshProfiles = () => {
    axiosInstance
      .post(`/view-all-profiles`, {
        viewer_id: viewer_id,
      })
      .then((response) => {
        if (response.data.success) {
          setProfiles(response.data.profiles);
        } else {
          console.error("Error fetching users:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
      });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`/edit-profile`, {
        profileId: selectedProfiles[0].id,
        name: editedName,
        updated_by: viewer_id,
        permissions: editedPermissions.map((permission) => permission.id),
      });

      toast.success("Profile Updated Successfully!");
      refreshProfiles();
      setEditProfileClicked(false); 
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionSelect = (permissionId) => {
    const updatedPermissions = permissions.map((permission) => {
      if (permission.id === permissionId) {
        return { ...permission, selected: !permission.selected };
      }
      return permission;
    });
    setPermissions(updatedPermissions);
    setEditedPermissions(updatedPermissions.filter((p) => p.selected));
  };

  const handleFeatureSelect = (feature, perms) => {
    const allSelected = perms.every(permission => permission.selected);
    const updatedPermissions = permissions.map(permission => {
      if (perms.some(p => p.id === permission.id)) {
        return { ...permission, selected: !allSelected };
      }
      return permission;
    });
    setPermissions(updatedPermissions);
    setEditedPermissions(updatedPermissions.filter((p) => p.selected));
  };

  const groupPermissionsByFeature = (permissions) => {
    return permissions.reduce((acc, permission) => {
      const { feature } = permission;
      if (!acc[feature]) {
        acc[feature] = [];
      }
      acc[feature].push(permission);
      acc[feature].sort((a, b) => a.order - b.order); // Sorting by value in ascending order
      return acc;
    }, {});
  };  

  const toggleFeature = (feature) => {
    setExpandedFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const groupedPermissions = groupPermissionsByFeature(permissions);

  if (loading) {
    return (
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
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center z-30">
        <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
        <div  ref={modalRef} className="bg-white p-6 rounded-md z-10 w-auto">
          <div className="font-bold pb-4">Edit Profile</div>
          <div className="flex flex-row items-center gap-4 mb-4">
            <label className="w-24 text-sm font-bold">Name:</label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="border border-gray-400 rounded-md py-1 px-2"
            />
          </div>

          <div className="font-bold text-sm mb-2">Permissions:</div>
          <div className="h-[250px] overflow-y-auto overflow-x-hidden scrollbar-hide">
            {Object.entries(groupedPermissions).map(([feature, perms]) => (
              <div key={feature} className="mb-4">
                <div
                  className="cursor-pointer font-bold bg-gray-200 px-4 py-2 rounded-md flex justify-between items-center"
                  onClick={() => toggleFeature(feature)}
                >
                  <div className="flex space-x-2 items-center justify-center">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        e.stopPropagation();
                        handleFeatureSelect(feature, perms);
                      }}
                      checked={perms.every(permission => permission.selected)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                    />
                    <span className="font-medium">{feature}</span>
                  </div>
                  <FontAwesomeIcon
                    icon={expandedFeatures[feature] ? faCaretUp : faCaretDown}
                    className="ml-2"
                  />
                </div>
                {expandedFeatures[feature] && (
                  <div className="mt-2 ml-[10%]">
                    {perms.map((permission) => (
                      <div key={permission.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          onChange={() => handlePermissionSelect(permission.id)}
                          checked={permission.selected}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-4"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{permission.name}</span>
                          <span className="text-sm text-gray-600">{permission.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              className="flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid border-red-500 bg-red-300 text-red-800"
              onClick={() => setEditProfileClicked(false)}
            >
              Cancel
            </button>
            <button
              className={`flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid ${
                editedName.trim() === ""
                  ? "border-gray-400 bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "border-gray-400 bg-white text-gray-800"
              }`}
              onClick={handleSaveProfile}
              disabled={editedName.trim() === ""}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfileDialog;
