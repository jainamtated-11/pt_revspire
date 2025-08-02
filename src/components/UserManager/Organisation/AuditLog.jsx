import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { GlobalContext } from "../../../context/GlobalState";
import { Grid } from "react-loader-spinner";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import Select from "react-select";
import { X } from "lucide-react";

function AuditLog() {
  const { viewer_id } = useContext(GlobalContext);
  console.log("view", viewer_id);
  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});

  const { organisationDetails } = useContext(GlobalContext);

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const axiosInstance = useAxiosInstance();
  
  // Add group by state
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Define group by options based on available columns
  const groupByOptions = [
    { value: null, label: "No grouping" },
    { value: "action", label: "Action" },
    { value: "user_name", label: "User" },
    { value: "ip_address", label: "IP Address" },
    { value: "organisation_name", label: "Organisation" },
    { value: "timestamp", label: "Timestamp" }
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
    const fetchAuditLogs = async () => {
      try {
        const response = await axiosInstance.post(`/retrieve-audit-logs`, {
          viewer_id: viewer_id,
          organisation_id: organisationDetails.organisation.id,
        });
        if (response.data.success) {
          console.log("response data ", response.data.data);
          setAuditLogs(response.data.data);
          setLoading(false);
        } else {
          console.error("Failed to fetch audit logs:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      }
    };

    fetchAuditLogs();
  }, [viewer_id]);

  const columnsHeading = [
    "Action",
    "User",
    "Timestamp",
    "IP Address",
    "Organisation",
  ];

  const rows = [
    "action",
    "user_name",
    "timestamp",
    "ip_address",
    "organisation_name",
  ];

  return (
    <div className="w-full  px-8 py-2">
      <div className="flex justify-end mb-4">
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
            placeholder="Group by"
            className="w-[200px]"
          />
        </div>
      </div>
      <ResizableTable
        data={auditLogs}
        columnsHeading={columnsHeading}
        rowKeys={rows}
        loading={loading}
        noCheckbox={true}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        groupByColumn={groupByColumn}
        expandedGroups={expandedGroups}
        setExpandedGroups={setExpandedGroups}
      />
    </div>
  );
}

export default AuditLog;
