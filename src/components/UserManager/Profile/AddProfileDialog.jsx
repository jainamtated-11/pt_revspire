import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { Grid } from "react-loader-spinner";
import toast from "react-hot-toast";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import useOutsideClick from "../../../hooks/useOutsideClick.js";

function AddProfileDialog() {
  const { setProfiles, setAddProfileClicked, viewer_id } =
    useContext(GlobalContext);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [profileName, setProfileName] = useState("");// State for the profile name
  const [loading, setLoading] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(true);
  const [expandedFeatures, setExpandedFeatures] = useState({});
  const axiosInstance = useAxiosInstance();

  const actions = () => {
    setAddProfileClicked(false);
    setPermissions([]);
    setSelectedPermissions([]);
    setProfileName("");
    setExpandedFeatures({});
  }

  const modalRef = useOutsideClick([actions])
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axiosInstance.post(`/view-all-permissions`, {
          viewer_id,
        });
        setPermissions(response.data.permissions); //set permissions from the response
        setDialogLoading(false);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();

    //Cleanup Function
    return () => {};
    // Cleanup logic if necessary
  }, [viewer_id]);

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

  const handlePermissionSelect = (permissionId) => {
    const selectedIndex = selectedPermissions.indexOf(permissionId);
    let newSelectedPermissions = [...selectedPermissions];

    if (selectedIndex === -1) {
      newSelectedPermissions.push(permissionId);
    } else {
      newSelectedPermissions.splice(selectedIndex, 1);
    }

    setSelectedPermissions(newSelectedPermissions);
  };

  const handleSaveProfile = async () => {
    if (profileName.trim() === "") {
      toast.error("Profile name is required!");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/create-profile`, {
        name: profileName,
        created_by: viewer_id,
        permissions: selectedPermissions,
      });
      toast.success("Profile Added Successfully!");
      refreshProfiles();
      setAddProfileClicked(false); //close the dialog after saving
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfiles = async () => {
    try {
      const response = await axiosInstance.post(`/view-all-profiles`, {
        viewer_id,
      });
      setProfiles(response.data.profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleFeatureSelect = (feature, perms) => {
    const allSelected = perms.every(permission => selectedPermissions.includes(permission.id));
    let newSelectedPermissions;

    if (allSelected) {
      // If all permissions are selected, deselect them
      newSelectedPermissions = selectedPermissions.filter(id => !perms.some(permission => permission.id === id));
    } else {
      // If not all are selected, select them
      newSelectedPermissions = [...new Set([...selectedPermissions, ...perms.map(permission => permission.id)])];
    }

    setSelectedPermissions(newSelectedPermissions);
  };

  const groupedPermissions = groupPermissionsByFeature(permissions);

  if (loading || dialogLoading) {
    return (
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
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div  className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
        <div ref={modalRef} className="bg-white p-6 rounded-md z-10 w-auto">
          <div className="font-bold pb-4">Add Profile</div>
          <div className="flex flex-row items-center gap-4 mb-4">
            <label className="w-24 text-sm font-bold">Name:</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="border border-gray-400 rounded-md py-1 px-2"
            />
          </div>

          <div className="font-bold text-sm mb-2">Permissions:</div>
          <div className="h-[250px] overflow-y-auto overflow-x-hidden">
            {Object.entries(groupedPermissions).map(([feature, perms]) => (
              <div key={feature} className="mb-4">
                <div
                  className="cursor-pointer font-medium bg-gray-200 px-4 py-2 rounded-md flex justify-between items-center"
                  onClick={() => toggleFeature(feature)}
                >
                  <div className="flex space-x-2 items-center justify-center">
                  <input
                    type="checkbox"
                    onChange={() => handleFeatureSelect(feature, perms)}
                    checked={perms.every(permission => selectedPermissions.includes(permission.id))}
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
                          checked={selectedPermissions.includes(permission.id)}
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

          <div className="flex justify-center items-center gap-4 pt-6">
            <button
              className="flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid border-red-500 bg-red-300 text-red-800"
              onClick={() => setAddProfileClicked(false)}
            >
              Cancel
            </button>
            <button
              className={`flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid ${
                profileName.trim() === ""
                  ? "border-gray-400 bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "border-gray-400 bg-white text-gray-800"
              }`}
              onClick={handleSaveProfile}
              disabled={profileName.trim() === ""}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProfileDialog;