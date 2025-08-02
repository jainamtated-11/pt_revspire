import React, { useEffect, useState, useContext } from "react";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable";
import axios from "axios";
import { GlobalContext } from "../../../context/GlobalState";
import AddNamespaceDialog from "./AddNamespaceDialog";
import AddNamespace from "./AddNamespace";
import DeactivateNamespace from "./DeactivateNamespace";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import toast from "react-hot-toast";
import GlobalAddButton from "../../../utility/CustomComponents/GlobalAddButton";
import { IoAddCircleOutline } from "react-icons/io5";
import {
  faDeleteLeft,
  faRecycle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useCheckFrontendPermission from "../../../Services/checkFrontendPermission";
import { useCookies } from 'react-cookie';
import Select from "react-select";
import { X } from "lucide-react";

const OnedriveSettings = () => {
  const {
    viewer_id,
    baseURL,
    selectedNamespace,
    setSelectedNamespace,
    selectedOrganisationId,
    organisationDetails,
  } = useContext(GlobalContext);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [namespaces, setNamespaces] = useState([]);
  const [oneDriveTenantRestriction, setOneDriveTenantRestriction] = useState(organisationDetails?.organisation?.onedrive_tenant_restrict);
  const [oneDriveTenantRestrictionPermission , setOneDriveTenantRestrictionPermission] = useState(false);
  const axiosInstance = useAxiosInstance();
  const checkFrontendPermission = useCheckFrontendPermission();
  const [cookies,setCookie,removeCookie] = useCookies(['userData']);

  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});

  const [groupByColumn, setGroupByColumn] = useState(null);
const [expandedGroups, setExpandedGroups] = useState({});

// Define group by options based on available columns
const groupByOptions = [
  { value: null, label: "No grouping" },
  { value: "namespace", label: "Namespace" },
  { value: "created_at", label: "Created At" },
  { value: "updated_at", label: "Updated At" }
];

// Custom styles for the Select component
const customStyles = {
  option: (base, { data }) => ({
    ...base,
    backgroundColor: data.isCustom ? "#F0F9FF" : "white",
    color: "#1F2937",
    "&:hover": {
      backgroundColor: data.isCustom ? "#E1F0FF" : "#f3f4f6",
    },
  }),
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
    const permission = checkFrontendPermission("View All Company Settings;Edit Company Settings;");
    setOneDriveTenantRestrictionPermission(permission);
  }, [checkFrontendPermission]);

  useEffect(()=>{
    console.log("ONE DRIVE TENANT ",oneDriveTenantRestriction);
  })

  const fetchNamespaces = async () => {
    setIsLoading(true);
    try {
      console.log(
        "Fetching namespaces for organisation:",
        selectedOrganisationId
      );
      const response = await axiosInstance.post(`/view-authorised-namespace`, {
        viewer_id: viewer_id,
        organisation_id: selectedOrganisationId,
      });
      if (response.data.success) {
        setNamespaces(response.data.data);
        console.log("Fetched namespaces:", response.data.data);
      } else {
        console.error("Failed to fetch namespaces: ", response.data.message);
      }
      setSelectedNamespace([]);
    } catch (error) {
      console.log("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    fetchNamespaces();
  }, [viewer_id, selectedOrganisationId]);

  const SortHandler = (sortedData) => {
    setNamespaces(sortedData);
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
    sortRows(namespaces, key, direction);
    setSortConfig({ key, direction });
  };

  const transformedConnections = namespaces.map((connection) => ({
    ...connection,
    "Created At": connection.created_at || "N/A",
    "Updated At": connection.updated_at || "NA",
  }));

  const columns = [
    // "organisation",
    "Namespace",
    "Created At",
    "Updated At",
  ];

  const rowData = [
    // "organisation",
    "namespace",
    "created_at",
    "updated_at",
  ];

  function OnChangeHandler(data) {
    if (selectedNamespace.some((item) => item.id === data.id)) {
      setSelectedNamespace([]);
    } else {
      setSelectedNamespace([data]);
    }
  }

  const refreshData = async () => {
    await fetchNamespaces();
  };

  const handleDeactivate = async () => {
    const response = await axiosInstance.post(`/delete-authorised-namespace`, {
      id: selectedNamespace[0].id,
      viewer_id: viewer_id,
    });
    if (response.status == 200) {
      selectedNamespace.length = 0;
      refreshData();
      toast.success("Namespace deleted successfully", {});
    } else {
      const errorData = await response.data;
      setError(errorData.message || "Failed to delete namespace");
      toast.error(errorData.message || "Failed to delete namespace");
    }
  };

  const handleOneDriveTenantRestriction = async () => {
    const response = await axiosInstance.post(
      `/update-onedrive-tenant-restriction`,
      {
        organisation_id: selectedOrganisationId,
        viewer_id: viewer_id,
        restrict: oneDriveTenantRestriction ? 0 : 1,
      }
    );
    if (response.status == 200) {
      toast.success("OneDrive tenant restriction updated successfully", {});
      setOneDriveTenantRestriction(!oneDriveTenantRestriction);

            // Update the userData cookie, setting the oneDrive_restrict_tenant when toggled 
            const userData = cookies.userData; 
            console.log("USERDATA",userData)
            if (userData) {
              try {
                  const parsedUserData = userData; // Parse the cookie value
                  console.log("PARSED USERDATA", parsedUserData);
                 // Toggle the onedrive_tenant_restrict value
                 parsedUserData.organisation.onedrive_tenant_restrict = oneDriveTenantRestriction ? 0 : 1; 

                  removeCookie('userData', { path: '/' }); // Remove the existing cookie

                  setCookie('userData', JSON.stringify(parsedUserData), {
                      path: '/',
                      maxAge: 86400, 
                      sameSite: 'None',
                      secure: true,
                  }); 
              } catch (error) {
                  console.error("Error updating userData cookie:", error);
              }
          }

      refreshData();
    } else {
      const errorData = await response.data;
      setError(
        errorData.message || "Failed to update OneDrive tenant restriction"
      );
      toast.error(
        errorData.message || "Failed to update OneDrive tenant restriction"
      );
    }
  };

  return (
    <div className="pb-5">
      <div className="flex items-center mb-2 justify-between">
        <div className="flex items-center">
          {oneDriveTenantRestriction ? (
            <div className="flex items-center px-2 py-1 mx-4">
              {selectedNamespace.length === 0 ? (
                <div className="mb-1">
                  <GlobalAddButton onClick={() => setShowPopup(true)} />
                </div>
              ) : (
                <button
                  type="button"
                  className="bg-gray-100 text-sky-800 px-4 py-2 rounded-2xl shadow-md hover:bg-sky-800 hover:text-white transition duration-300 ease-in-out"
                  onClick={handleDeactivate}
                  disabled={selectedNamespace.length === 0}
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Deactivate
                </button>
              )}
            </div>
          ) : ("")}

          <div className={`flex items-center py-1 ${oneDriveTenantRestriction ? "mx-1" : ""}`}>
            <span className="ml-5 pr-2 text-base font-normal text-gray-500">
              Restrict OneDrive Tenant
            </span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                disabled={!oneDriveTenantRestrictionPermission}
                type="checkbox"
                value=""
                className="sr-only peer"
                checked={oneDriveTenantRestriction}
                onChange={handleOneDriveTenantRestriction}
              />
              <div className="relative w-11 h-6 bg-gray-300 border-white peer-focus:outline-none peer-focus:ring-4 outline-white rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Group By Section */}
        <div className="flex items-center mr-5">
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
            placeholder="Group by"
            className="w-[200px]"
          />
        </div>
      </div>
      {showPopup && (
        <AddNamespaceDialog
          onClose={() => setShowPopup(false)}
          onSuccess={refreshData}
        />
      )}
      <div className="w-full pl-5 pr-5">
        <ResizableTable
          disableSelectAll={true}
          data={transformedConnections}
          loading={isLoading}
          columnsHeading={columns}
          selectedItems={selectedNamespace}
          rowKeys={rowData}
          // SortHandler={SortHandler}
          // handleSort={handleSort}
          OnChangeHandler={OnChangeHandler} // Added to handle row selection
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

export default OnedriveSettings;
