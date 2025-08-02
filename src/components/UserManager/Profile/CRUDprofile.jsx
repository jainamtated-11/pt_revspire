import React, { useContext, useState, useEffect } from "react";
import ActivateProfile from "./ActivateProfile.jsx";
import EditProfile from "./EditProfile.jsx";
import AssignUsers from "./AssignUsers.jsx";
import DeactivateProfile from "./DeactivateProfile.jsx";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import FilterModal from "../../../utility/FilterModal.jsx";
import GlobalAddButton from "../../../utility/CustomComponents/GlobalAddButton.jsx";
import SearchBar from "../../../utility/SearchBar.jsx";
import Select from "react-select";
import { X } from "lucide-react";

function CRUDprofile({ groupByColumn, setGroupByColumn, groupByOptions, customStyles }) {
  const {
    setSelectedProfiles,
    selectedProfiles,
    setAddProfileClicked,
    setEditProfileClicked,
    viewer_id,
    setProfiles,
    setAssignUsersClicked,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const [areAllActive, setAreAllActive] = useState(false);
  const [areAllInactive, setAreAllInactive] = useState(false);
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);
  const [deactivateSuccess, issetDeactivateSuccess] = useState(null);
  const [deactivateErrorMessage, issetDeactivateErrorMessage] = useState("");
  const storeSelectedProfileIds = () => {
    const profileIds = selectedProfiles.map((profile) => profile.id);
    setSelectedProfileIds(profileIds);
  };

  const RefreshProfiles = async () => {
    try {
      const response = await axiosInstance.post(`/view-all-profiles`, {
        viewer_id,
      });

      setProfiles(response.data.profiles);
      setSelectedProfiles([]);
      storeSelectedProfileIds();
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  useEffect(() => {
    checkProfileStatus();
    storeSelectedProfileIds();
  }, [selectedProfiles]);

  const checkProfileStatus = () => {
    if (selectedProfiles.length === 0) {
      setAreAllActive(false);
      setAreAllInactive(false);
      return;
    }

    let allActive = true;
    let allInactive = true;

    selectedProfiles.forEach((profile) => {
      if (profile.active !== 1) {
        allActive = false;
      } else {
        allInactive = false;
      }
    });

    setAreAllActive(allActive);
    setAreAllInactive(allInactive);
  };

  const handleDeactivateProfiles = async () => {
    try {
      const response = await axiosInstance.post(`/deactivate-profiles`, {
        profileIds: selectedProfileIds,
        viewer_id: viewer_id,
      });
      const data = await response.data;
      if (response.status >= 200 && response.status < 300) {
        toast.success("Profile Deactivated!");

        console.log(data.message); // Log success message or update UI accordingly
        RefreshProfiles();
        // Perform any additional actions after deactivation
      } else {
        console.error("Error:", data.message);
        toast.error("Error Deactivating !!");
        // Handle error response
      }
    } catch (error) {
      const errorData = error.response.data;
      const successStatus = errorData.success;
      issetDeactivateSuccess(successStatus);
      console.log("errorData", deactivateSuccess);
      const extractedMessage = errorData.message.match(
        /Cannot deactivate profile/
      )[0];
      issetDeactivateErrorMessage(extractedMessage);
      console.log("errorData", deactivateErrorMessage);
      if (successStatus === false) {
        toast.error(
          `Warning: ${extractedMessage}. More than one active user found.`
        );
      }
    }
  };

  const handleActivateProfiles = async () => {
    try {
      const response = await axiosInstance.post(`/activate-profiles`, {
        profileIds: selectedProfileIds,
        viewer_id: viewer_id,
      });

      const data = await response.data;

      if (response.status >= 200 && response.status < 300) {
        toast.success("Profiles Activated Successfully!");
        console.log(data.message); // Log success message or update UI accordingly
        RefreshProfiles();
        // Perform any additional actions after activation
      } else {
        console.error("Error:", data.message);
        toast.error("Error Activating !!");

        // Handle error response
      }
    } catch (error) {
      console.error("Error activating profiles:", error);
      // Handle any unexpected errors that might occur during the fetch operation
    }
  };
  const handleAssignUserClicked = () => {
    setAssignUsersClicked(true);
  };

  return (
    <>
      <div className="container flex justify-between mx-auto pt-0 w-full my-2">
        <div className="flex transition-all">
          {selectedProfiles.length === 0 && (
            <div>
              <GlobalAddButton onClick={() => setAddProfileClicked(true)} />
            </div>
          )}

          {selectedProfiles.length >= 1 && (
            <div
              className={`flex flex-row py-0.5 pl-1 bg-white rounded-md p-0 m-0 overflow-x-auto dropdown-container ${
                selectedProfiles.length === 1
                  ? "bg-white dark:bg-gray-600 rounded-md shadow-md w-[25vw]"
                  : ""
              }`}
            >
              {selectedProfiles.length === 1 && (
                <div>
                  <EditProfile onClick={() => setEditProfileClicked(true)} />
                </div>
              )}
              {areAllInactive && (
                <div>
                  <ActivateProfile onClick={handleActivateProfiles} />
                </div>
              )}
              {areAllActive && (
                <div>
                  <DeactivateProfile onClick={handleDeactivateProfiles} />
                </div>
              )}
              {selectedProfiles.length === 1 && (
                <div>
                  <AssignUsers onClick={handleAssignUserClicked} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-row flex-nowrap space-x-2">
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
           <div className="w-[200px]">
           <SearchBar searchTable="profile" />
           </div>
          <FilterModal queryTable="profile" />
        </div>
      </div>
    </>
  );
}

export default CRUDprofile;
