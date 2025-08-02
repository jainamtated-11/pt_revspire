import React, { useState, useEffect, useContext } from "react";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import CRUDconnections from "./CRUDconnections.jsx";
import AddConnectionDialog from "./AddConnectionDialog.jsx";
import ConnectionDetailsTable from "./ConnectionDetails.jsx";
import ObjectTable from "./ObjectTable.jsx";
import ResizableTable from "../../../../utility/CustomComponents/ResizableTable.jsx";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchConnectionsAsync } from "../../../../features/connections/connectionsSlice.js";
import { fetchFilterDataAsync } from "../../../../features/filter/fliterSlice.js";
import { useCookies } from "react-cookie";
import {
  SetSearchData,
  SetInitialData,
  SetSearchTable,
  SetSearchFields,
} from "../../../../features/search/searchSlice.js";

function Connections() {
  const {
    viewer_id,
    setSelectedConnections,
    selectedConnections,
    addConnectionsClicked,
    connectionDetails,
    setConnectionDetails,
    setObjectDetails,
    baseURL,
    showConnectionButtons,
    setShowConnectionButtons,
    connectionObjectLoading,
    setConnectionObjectLoading,
  } = useContext(GlobalContext);

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies?.userData?.organisation?.id;

  const dispatch = useDispatch();
  const connections = useSelector((state) => state.connections.connections);
  const connectionsLoading = useSelector((state) => state.connections.loading);
  const filter = useSelector((state) => state.filter);

  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchData = useSelector((state) => state.search.searchData);
  const searchValue = useSelector((state) => state.search.searchValue);

  const axiosInstance = useAxiosInstance();
  const [updateActivateAndDeactivate, setUpdateActivateAndDeactivate] =
    useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: "Updated At",
    direction: "desc",
  });

  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState([]);

  const groupData = [
    { field: "name", header: "Name" },
    { field: "crm", header: "CRM" },
    { field: "owner_name", header: "Owner" },
    { field: "created_at", header: "Created At" },
    { field: "updated_at", header: "Updated At" },
  ];

  const groupByOptions = [
    { value: null, label: "No grouping" },
    ...groupData.map((col) => ({
      value: col.field,
      label: col.header,
    })),
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

  const getFilterCondition = async () => {
    const [
      { data: tableData },
      { data: fieldData },
      { data: conditionTypeData },
      { data: conditionValueTypeData },
    ] = await Promise.all([
      axiosInstance.post(`${baseURL}/get-table-id`, {
        tablename: "crm_connection",
      }),
      axiosInstance.post(`${baseURL}/get-filter-field-id`, {
        field_name: "owner",
      }),
      axiosInstance.post(`${baseURL}/get-condition-type-id`, {
        condition_type: "equals",
      }),
      axiosInstance.post(`${baseURL}/get-condition-value-type-id`, {
        condition_value_type: "Absolute",
      }),
    ]);

    return {
      order: 1,
      filterTable: tableData.id,
      filterField: fieldData.id,
      conditionType: conditionTypeData.id,
      conditionValueType: conditionValueTypeData.id,
      filterTableName: "connection",
      filterFieldName: "owner",
      filterFieldType: "string",
      conditionName: "equals",
      conditionValueTypeName: "Absolute",
      valueId: "",
      valueName: "",
      relativeValue: null,
      value: viewer_id,
    };
  };

  const fetchFilterCondition = async () => {
    try {
      const filterCondition = await getFilterCondition();

      if (filterCondition) {
        dispatch(
          fetchFilterDataAsync({
            axiosInstance: axiosInstance,
            queryTable: filterCondition.filterTable,
            filtersets: [filterCondition],
            filter_logic: "( 1 AND 2 )",
            baseURL: baseURL,
            organisation_id,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching filter condition:", error);
    }
  };

  useEffect(() => {
    if (viewer_id && baseURL) {
      fetchFilterCondition();
      dispatch(fetchConnectionsAsync({ viewerId: viewer_id, baseURL }));
    }
  }, [viewer_id, baseURL, dispatch]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const crmType = searchParams.get("crmType");
    const code = searchParams.get("code");
    const crmConnectionId = searchParams.get("crmConnectionId");

    if (crmType === "dynamics" && code && crmConnectionId) {
      console.log("Reached Inside Dynamics redirection handler");

      const stateObject = {
        crmConnectionId,
        originURL: window.location.href,
      };

      const payload = {
        state: encodeURIComponent(JSON.stringify(stateObject)),
        code,
        viewer_id,
      };

      console.log("Dynamics Payload", payload);

      // Clean URL
      ["crmType", "code", "crmConnectionId"].forEach((param) =>
        searchParams.delete(param)
      );
      const newUrl = window.location.pathname + "?" + searchParams.toString();
      window.history.replaceState({}, "", newUrl);

      // Step 1: Get Access Token
      const fetchDynamicsAccessToken = new Promise(async (resolve, reject) => {
        try {
          const response = await axiosInstance.post(
            "/getDynamicsAccessToken",
            payload,
            { headers: { "Content-Type": "application/json" } }
          );

          if (response.status === 200) {
            resolve();
          } else {
            throw new Error("Failed to retrieve Dynamics access token.");
          }
        } catch (error) {
          reject(error.message);
        }
      });

      toast.promise(fetchDynamicsAccessToken, {
        loading: "Retrieving Dynamics access token...",
        success: "Dynamics access token retrieved!",
        error: (err) => `Access Token Failed: ${err}`,
      });

      fetchDynamicsAccessToken
        .then(() => {
          // Step 2: Authorize Dynamics Connection
          const authorizeDynamics = new Promise(async (resolve, reject) => {
            try {
              const response = await axiosInstance.post(
                "/dynamics-authorization",
                {
                  crm_connection_id: crmConnectionId,
                  viewer_id,
                  originURL: window.location.href,
                },
                { headers: { "Content-Type": "application/json" } }
              );

              if (response.status === 200) {
                resolve("Dynamics authorized successfully!");
              } else {
                throw new Error("Failed to authorize Dynamics connection.");
              }
            } catch (error) {
              reject(error.message);
            }
          });

          toast.promise(authorizeDynamics, {
            loading: "Authorizing Dynamics connection...",
            success: "Dynamics connection authorized!",
            error: (err) => `Authorization Failed: ${err}`,
          });

          return authorizeDynamics;
        })
        .catch((error) => {
          console.error("Error in Dynamics flow:", error);
        });
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const crmType = searchParams.get("crmType");
    const code = searchParams.get("code");
    const crmConnectionId = searchParams.get("crmConnectionId");
    const accountsServer = searchParams.get("accountsServer");
    const location = searchParams.get("location");
    OnClickHandler(crmConnectionId);
    if (crmType === "Zoho" && code && crmConnectionId) {
      const payload = {
        state: JSON.stringify({
          crmConnectionId,
          originURL: window.location.href,
        }),
        code,
        viewer_id,
        crmConnectionId,
        account_server: accountsServer,
      };

      // Clear URL params
      searchParams.delete("crmType");
      searchParams.delete("code");
      searchParams.delete("crmConnectionId");
      searchParams.delete("accountsServer");
      searchParams.delete("location");

      const newUrl = window.location.pathname + "?" + searchParams.toString();
      window.history.replaceState({}, "", newUrl);

      // Call endpoint to get Zoho access token
      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await axiosInstance.post(
            "/getZohoAccessToken",
            payload,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          if (response.status >= 200 && response.status < 300) {
            resolve("Zoho access token retrieved successfully.");
          } else {
            throw new Error("Failed to retrieve Zoho access token.");
          }
        } catch (error) {
          console.error("Error fetching Zoho access token:", error.message);
          reject("Error fetching Zoho access token: " + error.message);
        }
      });

      toast.promise(promise, {
        loading: "Retrieving Zoho access token...",
        success: (msg) => msg,
        error: (err) => `Failed: ${err}`,
      });
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const crmType = searchParams.get("crmType");
    const code = searchParams.get("code");
    const crmConnectionId = searchParams.get("crmConnectionId");

    if (crmType === "HubSpot" && code && crmConnectionId) {
      console.log("Reached Inside the if Condition");
      const stateObject = {
        crmConnectionId,
        originURL: window.location.href,
      };

      const payload = {
        state: encodeURIComponent(JSON.stringify(stateObject)),
        code,
        viewer_id,
      };

      console.log("Payload", payload);

      // Clear URL params after extraction
      ["crmType", "code", "crmConnectionId"].forEach((param) =>
        searchParams.delete(param)
      );

      // Optional: remove existingCrmId if it's null or not needed
      if (
        searchParams.get("existingCrmId") === null ||
        searchParams.get("existingCrmId") === "null"
      ) {
        searchParams.delete("existingCrmId");
      }

      // If nothing is left in the query string, avoid adding "?"
      const newUrl =
        window.location.pathname +
        (searchParams.toString() ? "?" + searchParams.toString() : "");

      window.history.replaceState({}, "", newUrl);

      // Step 1: Fetch HubSpot Access Token
      const fetchHubSpotAccessToken = new Promise(async (resolve, reject) => {
        try {
          const response = await axiosInstance.post(
            "/getHubSpotAccessToken",
            payload,
            { headers: { "Content-Type": "application/json" } }
          );

          if (response.status === 200) {
            resolve();
          } else {
            throw new Error("Failed to retrieve HubSpot access token.");
          }
        } catch (error) {
          reject(error.message);
        }
      });

      toast.promise(fetchHubSpotAccessToken, {
        loading: "Retrieving HubSpot access token...",
        success: "HubSpot access token retrieved successfully!",
        error: (err) => `Failed: ${err}`,
      });

      fetchHubSpotAccessToken
        .then(async () => {
          // Step 2: Authorize HubSpot Connection
          const authorizeHubSpotConnection = new Promise(
            async (resolve, reject) => {
              try {
                const authPayload = {
                  crm_connection_id: crmConnectionId,
                  viewer_id,
                  originURL: window.location.href,
                };

                const response = await axiosInstance.post(
                  "/hubspot-authorization",
                  authPayload,
                  { headers: { "Content-Type": "application/json" } }
                );

                if (response.status === 200) {
                  resolve("HubSpot authorized successfully!");
                } else {
                  throw new Error("Failed to authorize HubSpot connection.");
                }
              } catch (error) {
                reject(error.message);
              }
            }
          );

          toast.promise(authorizeHubSpotConnection, {
            loading: "Authorizing HubSpot connection...",
            success: "HubSpot connection authorized successfully!",
            error: (err) => `Failed: ${err}`,
          });

          return authorizeHubSpotConnection;
        })
        .catch((error) => {
          console.error("Error during one of the steps:", error);
        });
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const crmType = searchParams.get("crmType");
    const code = searchParams.get("code");
    const crmConnectionId = searchParams.get("crmConnectionId");

    if (crmType === "Pipedrive" && code && crmConnectionId) {
      console.log("Reached Inside the if Condition");
      const stateObject = {
        crmConnectionId,
        originURL: window.location.href,
      };

      const payload = {
        state: encodeURIComponent(JSON.stringify(stateObject)),
        code,
        viewer_id,
      };

      console.log("Payload", payload);

      // Clear URL params after extraction
      ["crmType", "code", "crmConnectionId"].forEach((param) =>
        searchParams.delete(param)
      );

      // Optional: remove existingCrmId if it's null or not needed
      if (
        searchParams.get("existingCrmId") === null ||
        searchParams.get("existingCrmId") === "null"
      ) {
        searchParams.delete("existingCrmId");
      }

      // If nothing is left in the query string, avoid adding "?"
      const newUrl =
        window.location.pathname +
        (searchParams.toString() ? "?" + searchParams.toString() : "");

      window.history.replaceState({}, "", newUrl);

      // Step 1: Fetch Pipedrive Access Token
      const fetchPipedriveAccessToken = new Promise(async (resolve, reject) => {
        try {
          const response = await axiosInstance.post(
            "/getPipedriveAccessToken",
            payload,
            { headers: { "Content-Type": "application/json" } }
          );

          if (response.status === 200) {
            resolve();
          } else {
            throw new Error("Failed to retrieve Pipedrive access token.");
          }
        } catch (error) {
          reject(error.message);
        }
      });

      toast.promise(fetchPipedriveAccessToken, {
        loading: "Retrieving Pipedrive access token...",
        success: "Pipedrive access token retrieved successfully!",
        error: (err) => `Failed: ${err}`,
      });

      fetchPipedriveAccessToken
        .then(async () => {
          // Step 2: Authorize Pipedrive Connection
          const authorizePipedriveConnection = new Promise(
            async (resolve, reject) => {
              try {
                const authPayload = {
                  crm_connection_id: crmConnectionId,
                  viewer_id,
                  originURL: window.location.href,
                };

                const response = await axiosInstance.post(
                  "/pipedrive-authorization",
                  authPayload,
                  { headers: { "Content-Type": "application/json" } }
                );

                if (response.status === 200) {
                  resolve("Pipedrive authorized successfully!");
                } else {
                  throw new Error("Failed to authorize Pipedrive connection.");
                }
              } catch (error) {
                reject(error.message);
              }
            }
          );

          toast.promise(authorizePipedriveConnection, {
            loading: "Authorizing Pipedrive connection...",
            success: "Pipedrive connection authorized successfully!",
            error: (err) => `Failed: ${err}`,
          });

          return authorizePipedriveConnection;
        })
        .catch((error) => {
          console.error("Error during one of the steps:", error);
        });
    }
  }, []);

  const OnClickHandler = async (id) => {
    setShowConnectionButtons(true);

    if (viewer_id && id) {
      try {
        const response = await axiosInstance.post(`/view-crm-connection`, {
          viewer_id: viewer_id,
          connection_id: id,
        });
        if (response.data.success) {
          setConnectionDetails(response.data.connection);
        } else {
          console.error(
            "Failed to retrieve CRM connection:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error retrieving CRM connection:", error);
      }
      if (viewer_id && id) {
        try {
          setConnectionObjectLoading(true);
          const response = await axiosInstance.post(
            `/view-all-crm-salesforce-objects`,
            {
              viewer_id: viewer_id,
              crm_connection: id,
            }
          );
          if (response.data.success) {
            setObjectDetails(response.data.salesforceObjects);
          } else {
            console.error(
              "Failed to retrieve CRM object details:",
              response.data.message
            );
          }
          setConnectionObjectLoading(false);
        } catch (error) {
          console.error("Error retrieving CRM object details:", error);
        }
      }
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const crmConnectionId = searchParams.get("crmConnectionId");
    const crmType = searchParams.get("crmType");
    // setShowConnectionButtons(true);
    if (crmConnectionId && !crmType) {
      OnClickHandler(crmConnectionId);

      const path = window.location.href;

      // Promise-based toast
      const promise = new Promise(async (resolve, reject) => {
        try {
          if (!viewer_id || !crmConnectionId) {
            console.error("viewer_id and crmConnectionId are required.");
            reject("Viewer ID and connection details are required.");
            return;
          }

          const url = `${baseURL}/salesforce-authorisation`;

          const fullUrl = new URL(url);

          // Append query params
          fullUrl.searchParams.append("crm_connection_id", crmConnectionId);
          fullUrl.searchParams.append("viewer_id", viewer_id);
          fullUrl.searchParams.append("originURL", path);

          const requestUrl = fullUrl.toString().replace(baseURL, "");

          const response = await axiosInstance.get(requestUrl);

          const data = await response.data;

          if (!(response.status >= 200 && response.status < 300)) {
            throw new Error("Failed to authorize connection");
          }

          if (data && data.authUrl) {
            window.location.href = data.authUrl;
            resolve("Salesforce data synchronized successfully.");
          } else {
            console.log("Not a valid JSON response");
            resolve("Salesforce data synchronized successfully.");
          }
        } catch (error) {
          console.error("Error authorizing connection:", error.message);
          reject("Error authorizing connection: " + error.message);
        }
      });

      toast.promise(promise, {
        loading: "Authorizing Salesforce connection...",
        success: (msg) => {
          searchParams.delete("crmConnectionId");
          const newUrl =
            window.location.pathname + "?" + searchParams.toString();
          window.history.replaceState({}, "", newUrl);
          return `${msg}`;
        },
        error: (err) => `Failed: ${err}`,
      });
      OnClickHandler();
    }
  }, []);

  useEffect(() => {
    if (filter.filterApplied) {
      dispatch(SetSearchData(filter.filterData));
      dispatch(SetInitialData(filter.filterData));
    } else {
      dispatch(SetSearchData(connections));
      dispatch(SetInitialData(connections));
    }

    dispatch(SetSearchTable("crm_connection"));
    dispatch(SetSearchFields(["name", "crm", "owner"]));
  }, [connections, dispatch, searchValue]);

  const transformedFilterConnections = filter?.filterData?.map(
    (connection) => ({
      ...connection,
      "Created At": connection.created_at || "N/A",
      "Created By": connection.created_by || "N/A",
      "Updated By": connection.updated_by || "N/A",
      "Updated At": connection.updated_at || "NA",
      "Is Primary": connection.is_primary,
    })
  );

  const transformedSearchConnections = searchData?.map((connection) => ({
    ...connection,
    "Created At": connection.created_at || "N/A",
    "Created By": connection.created_by || "N/A",
    "Updated By": connection.updated_by || "N/A",
    "Updated At": connection.updated_at || "NA",
    "Is Primary": connection.is_primary,
  }));

  if (connectionDetails) {
    return (
      <div className="container mx-auto p-4">
        <div className="">
          {showConnectionButtons && <CRUDconnections />}
          <ConnectionDetailsTable />
          <ObjectTable />
        </div>
      </div>
    );
  }

  const columns = [
    "name",
    "crm",
    "owner",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
    "active",
    "Is Primary",
  ];

  const rowData = [
    "name",
    "crm",
    "owner_name",
    "created_by_name",
    "created_at",
    "updated_by_name",
    "updated_at",
    "active",
    "is_primary",
  ];

  const OnChangeHandler = (data) => {
    if (filter.filterApplied) {
      if (
        data.length == transformedFilterConnections.length ||
        data?.length == 0
      ) {
        setSelectedConnections(data);
        return;
      }
    } else {
      if (data.length == connections.length || data?.length == 0) {
        setSelectedConnections(data);
        return;
      }
    }

    const idx = selectedConnections.findIndex(
      (selectedItem) => selectedItem.id === data.id
    );

    if (idx === -1) {
      setSelectedConnections((prevState) => [...prevState, data]);
    } else {
      const updatedSelectedConnectinos = selectedConnections.filter(
        (items) => items.id != data.id
      );
      setSelectedConnections(updatedSelectedConnectinos);
    }
  };

  const updatetable = () => {
    setUpdateActivateAndDeactivate((prev) => {
      return !prev;
    });
  };

  return (
    <div className="container mx-auto px-4">
      <CRUDconnections
        onAction={updatetable}
        fetchFilterCondition={fetchFilterCondition}
        groupByColumn={groupByColumn}
        setGroupByColumn={setGroupByColumn}
        groupByOptions={groupByOptions}
        customStyles={customStyles}
      />
      {addConnectionsClicked && <AddConnectionDialog />}

      <ResizableTable
        data={
          searchApplied
            ? transformedSearchConnections
            : filter.filterApplied
            ? transformedFilterConnections
            : connections
        }
        columnsHeading={columns}
        loading={filter.filterApplied ? filter.loading : connectionsLoading}
        rowKeys={rowData}
        OnChangeHandler={OnChangeHandler}
        selectedItems={selectedConnections}
        OnClickHandler={OnClickHandler}
        searchTerm={searchValue}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        groupByColumn={groupByColumn}
        expandedGroups={expandedGroups}
        setExpandedGroups={setExpandedGroups}
      />
    </div>
  );
}

export default Connections;
