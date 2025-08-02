import React, { useEffect, useState, useContext, useCallback } from "react";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable";
import axios from "axios";
import { GlobalContext } from "../../../context/GlobalState";
import AddSsoDialog from "./Sso/AddSsoDialog";
import DeleteSso from "./Sso/DeleteSso";
import toast from "react-hot-toast";
import MakePrimary from "./Sso/MakePrimary";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import { LuLoaderCircle } from "react-icons/lu";
import { IoSaveOutline } from "react-icons/io5";
import { RiSave2Line } from "react-icons/ri";
import AddSSO from "./Sso/AddSso";
import Select from "react-select";
import { X } from "lucide-react";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const SsoSettings = () => {
  const {
    viewer_id,
    selectedOrganisation,
    setSelectedOrganisation,
    selectedOrganisationId,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});

  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [organisations, setOrganisations] = useState([]);
  const [passedOrgId, setPassedOrgId] = useState(null);
  const [currentState, setCurrentState] = useState(0);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);

  const [isToggleOn, setIsToggleOn] = useState(false); // State for toggle
  const [isToggling, setIsToggling] = useState(false); // State to manage loading
  const [ssoOnly, setSsoOnly] = useState(""); // State to hold the sso_only value

  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Define group by options based on available columns
  const groupByOptions = [
    { value: null, label: "No grouping" },
    { value: "provider", label: "Provider" },
    { value: "issuer", label: "Issuer" },
    { value: "is_primary", label: "Is Primary" }
  ];

  // Custom styles for the Select component
  const customStyles = {
    option: (base, { data }) => ({
      ...base,
      backgroundColor: data.isCustom ? "#F0F9FF" : "white", // Light blue for custom, white for normal
      color: "#1F2937", // Standard text color
      "&:hover": {
        backgroundColor: data.isCustom ? "#E1F0FF" : "#f3f4f6", // Slightly darker blue on hover
      },
    }),
    // Keep all other styles default
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

  useEffect(() => {
    const fetchOrginfo = async () => {
      try {
        const response = await axiosInstance.post(`/get-organisation_sso`, {
          organisation: selectedOrganisationId,
          viewer_id: viewer_id,
        });
        if (response.status === 200) {
          setOrganisations(response.data);
          setIsLoading(false);
        } else {
          console.error(
            "Failed to fetch organisation details: ",
            response.data.message
          );
        }
        setSelectedOrganisation([]);
        setIsLoading(false);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
    };
    fetchOrginfo();
  }, [viewer_id, selectedOrganisationId]);

  const OnChangeHandler = (selectedRow) => {
    if (selectedOrganisation.some((item) => item.id === selectedRow.id)) {
      setSelectedOrganisation([]);
    } else {
      setSelectedOrganisation([selectedRow]);
      setCurrentState(selectedRow.is_primary);
      setPassedOrgId(selectedRow.id);
    }
  };

  const SortHandler = (sortedData) => {
    setOrganisations(sortedData);
  };

  const sortRows = (newContent, key, direction) => {
    const sortedRows = [...newContent].sort((a, b) => {
      return 0;
    });

    SortHandler(sortedRows);
    return sortedRows;
  };

  const handleSort = (key) => {
    let direction = "ascending";

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    sortRows(organisations, key, direction);
    setSortConfig({ key, direction });
  };

  const refreshData = async () => {
    setIsLoading(true);
   
    const response = await axiosInstance.post(`/get-organisation_sso`, {
      viewer_id: viewer_id,
      organisation: selectedOrganisationId,
    });
    if (response.status === 200) {
      setOrganisations(response.data);
      setIsLoading(false);
    } else {
      console.error("failed to refresh organisations: ", response.data.message);
    }
  };

  const handleMakePrimary = async (id, isPrimary) => {
    if (isPrimary) {
      toast.error("This SSO is already primary.");
      return;
    }

    const loadingToast = toast.loading("Setting SSO as primary...");

    try {
      setIsSettingPrimary(true);
      const response = await axiosInstance.post(
        `/set-primary-sso`,
        {
          organisation_sso_id: id,
          viewer_id,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        toast.dismiss(loadingToast);
        toast.success("SSO set to primary successfully.");
        setSelectedOrganisation([]);
        await refreshData();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to set SSO to primary.");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      setIsSettingPrimary(false);
      console.error("Error setting SSO to primary:", error);
      toast.error("Error setting SSO to primary.");
    }finally{
      setIsSettingPrimary(false);
    }
  };

  const transformDataForTable = (data) => {
    return data.map((item) => ({
      ...item,
      certificate: "*****",
    }));
  };

  const transformedConnections = organisations.map((connection) => ({
    ...connection,
    "Is Primary": connection.is_primary,
  }));

  const columns = [
    "Provider",
    "issuer",
    // "organisation",
    // "id",
    "certificate",
    "Is Primary",
  ];

  const rowData = [
    "provider",
    "issuer",
    // "organisation",
    // "id",
    "certificate",
    "is_primary",
  ];

  // Fetch SSO value and set toggle state
  useEffect(() => {
    const fetchSsoValue = async () => {
      console.log("fetching the sso value");
      try {
        const response = await axiosInstance.post(
          `/view-organisation-details`,
          {
            viewer_id: viewer_id,
            organisation_id: selectedOrganisationId,
          }
        );

        if (response.data && response.data.organisation) {
          const fetchedSsoOnly = response.data.organisation.sso_only;
          console.log("fetched sso value is ", fetchedSsoOnly);
          setSsoOnly(fetchedSsoOnly);
          setIsToggleOn(fetchedSsoOnly === 1); // Set toggle state based on fetched value
          console.log("Fetched ssoOnly value:", fetchedSsoOnly);
        }
      } catch (error) {
        console.error("Error fetching SSO value:", error);
        toast.error("Failed to fetch SSO value.");
      }
    };

    fetchSsoValue();
  }, [viewer_id, selectedOrganisationId]);

  const handleToggleChange = async () => {
    if (isToggling) {
      toast.error("Cannot toggle while updating info."); // Show error if already toggling
      return;
    }
    setIsToggling(true); // Set loading state

    try {
      const newSsoOnly = isToggleOn ? "0" : "1"; // Determine new sso_only value
      console.log("Updated sso value to:", newSsoOnly);

      // Proceed with the update request
      const response = await axiosInstance.post("/update-company-info", {
        viewer_id,
        organisation_id: selectedOrganisationId,
        sso_only: newSsoOnly,
      });

      toast.dismiss(); //dismiss any prev toast

      if (response.status === 200) {
        setIsToggleOn(newSsoOnly === "1"); // Update toggle state based on new sso_only value
        toast.success("Company info updated successfully.");
      } else {
        toast.error("Failed to update company info.");
      }
    } catch (error) {
      console.error("Error updating company info:", error);
      toast.error("Error updating company info.");
    } finally {
      setIsToggling(false); // Reset loading state
    }
  };

  const handleToggleInteraction = () => {
    setIsToggleOn(!isToggleOn); // Update the toggle state immediately
    handleToggleChange(); // Call the function to update the company info
  };

  // Debounced toast function
  const showToast = useCallback(
    debounce(() => {
      toast.error("Cannot toggle while updating info.", {
        style: { width: "400px" },
      });
    }, 500),
    []
  );

  return (
    <div className="flex flex-col space-y-2 px-4 py-2">
      {/* SSO Mandatory Toggle Section */}
      <div className="flex items-center">
        <label
          className="inline-flex items-center cursor-pointer"
          onClick={() => {
            if (isToggling) {
              showToast();
            }
          }}
        >
          <p className="font-semibold pr-2">SSO Mandatory :</p>
          <input
            type="checkbox"
            checked={isToggleOn}
            onChange={handleToggleInteraction}
            className="sr-only peer"
            disabled={isToggling}
          />
          <div className={`relative w-11 h-6 ${isToggleOn ? "bg-blue-600" : "bg-gray-200"} peer-focus:outline-none rounded-full`}>
            <div className={`absolute top-[2px] ${isToggleOn ? "translate-x-full" : "translate-x-0"} transition-transform bg-white border border-gray-300 rounded-full h-5 w-5`}></div>
          </div>
        </label>
      </div>

      {/* Actions and Group By Section */}
      <div className="flex justify-between items-center">
        {/* Left side - SSO Actions */}
        <div className="flex items-center justify-center">
          {selectedOrganisation.length === 1 ? (
            <div className="flex justify-start items-center space-x-1 overflow-x-auto w-[40vw] py-0.5  rounded-lg pl-2 border-b shadow-lg dropdown-container">
              <button
                disabled={isSettingPrimary}
                onClick={() => handleMakePrimary(passedOrgId, currentState)}
                className="flex items-center text-secondary text-[14px] my-0.5 px-1 pl-4 pr-4 py-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
              >
                <RiSave2Line className="mr-1" style={{ fontSize: "16px" }} />
                Make Primary
              </button>
              <DeleteSso
                selectedProvider={passedOrgId}
                onDeleteSuccess={() => {
                  setSelectedOrganisation([]); // Clear selection after successful delete
                  refreshData();
                }}
              />
            </div>
          ) : (
            <div>
              <AddSSO onClick={() => setShowPopup(true)} />
            </div>
          )}
        </div>

        {/* Right side - Group By */}
        <div className="flex items-center space-x-2">
          {groupByColumn && (
            <button
              onClick={() => setGroupByColumn(null)}
              className="p-1.5 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Clear grouping"
            >
              <X size={16} />
            </button>
          )}
          <Select
            value={groupByOptions.find(option => option.value === groupByColumn)}
            onChange={(option) => setGroupByColumn(option?.value || null)}
            options={groupByOptions}
            styles={customStyles}
            placeholder="Group by"
            className="w-[200px]"
          />
        </div>
      </div>

      {/* Dialog */}
      {showPopup && (
        <AddSsoDialog
          onClose={() => setShowPopup(false)}
          onSuccess={refreshData}
        />
      )}

      {/* Table Section */}
      <div className="w-full">
        <ResizableTable
          data={transformDataForTable(transformedConnections)}
          loading={isLoading}
          columnsHeading={columns}
          selectedItems={selectedOrganisation}
          rowKeys={rowData}
          disableSelectAll={true}
          OnChangeHandler={OnChangeHandler}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
          groupByColumn={groupByColumn}
          expandedGroups={expandedGroups}
          setExpandedGroups={setExpandedGroups}
        />
      </div>
    </div>
  );
};

export default SsoSettings;
