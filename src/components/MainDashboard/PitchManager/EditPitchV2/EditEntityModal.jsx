import React, { useEffect, useState, useRef, useContext } from "react";
import { MdClose } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleEntityModal,
  setEntityDetails,
  setSelectedCrm,
  setEntityType,
  toggleEntityType,
} from "../../../../features/pitch/editPitchSlice";
import ZohoSquare from "../../../../assets/zoho_square.png";
import HubspotLogo from "../../../../assets/HubSpotLogo.png";
import pipedriveLogo from "../../../../assets/pipedriveLogo.svg";
import Salesforce from "../../../../assets/salesforce_logo.png";
import logo from "../../../../assets/mini-logo.svg";
import Select from "react-select";
import {
  fetchCrmConnectionsAsync,
  checkActivePitchForCrmRecordAsync,
} from "../../../../features/pitch/editPitchSlice";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../context/GlobalState";
import { useCookies } from "react-cookie";
import { LuLoaderCircle } from "react-icons/lu";
import Dynamics from "../../../../assets/dynamics_365.png";

function EditEntityModal() {
  const axiosInstance = useAxiosInstance();
  const pitchState = useSelector((state) => state.editPitchSlice);
  const dispatch = useDispatch();

  // Local state for form fields
  const [localState, setLocalState] = useState({
    searchInput: "",
    selectedConnection: null,
    entityType: "deal",
    entityDetails: {
      id: "",
      name: "",
    },
  });

  const [entitySearchResult, setEntitySearchResult] = useState([]);
  const [wssFailedForTokens, setWssFailedForTokens] = useState(false);
  const socketRef = useRef(null);
  const [isSearchingEntity, setIsSearchingEntity] = useState(false);
  const { viewer_id, baseURL, setDisableDefaultNavigation, setActiveTab } =
    useContext(GlobalContext);
  const [tokenCookies] = useCookies(["revspireToken"]);
  const [isFormValid, setIsFormValid] = useState(false);

  const token = tokenCookies.revspireToken;

  // Check if form is valid whenever local state changes
  useEffect(() => {
    const isValid =
      localState.selectedConnection !== null &&
      localState.entityDetails.id !== "" &&
      localState.entityDetails.name !== "";
    setIsFormValid(isValid);
  }, [localState]);

  useEffect(() => {
    dispatch(fetchCrmConnectionsAsync({ viewer_id, axiosInstance }));
  }, []);

  useEffect(() => {
    let wsInstance = null;

    const normalizeResults = (results, crmType, isAccount) => {
      if (crmType === "salesforce") {
        return results.searchRecords || [];
      } else if (crmType === "zoho") {
        return results.map((record) => ({
          Id: record.id,
          Name: isAccount ? record.Account_Name : record.Deal_Name,
          EntityType: isAccount ? "account" : "deal",
        }));
      } else if (crmType === "hubspot") {
        return results.map((record) => ({
          Id: record.id,
          Name: isAccount ? record.properties.name : record.properties.dealname,
          EntityType: isAccount ? "company" : "deal",
        }));
      }  else if (crmType === "pipedrive") {
        return results.map((record) => ({
          Id: record.global_id,
          Name: isAccount ? record.name : record.title,
          EntityType: isAccount ? "company" : "deal",
        }));
      }else if (crmType === "dynamics 365") {
        return results.map((record) => ({
          Id: record.opportunityid || record.accountid,
          Name: record.name,
          EntityType: isAccount ? "account" : "opportunities",
        }));
      } 
      return [];
    };

    const setupWebSocket = () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      if (
        localState.searchInput.length >= 3 &&
        localState.selectedConnection &&
        !localState.entityDetails.id
      ) {
        const entityType = localState.entityType;
        console.log(`Setting up WebSocket for ${entityType} search`);

        const wsBaseURL = baseURL.replace("https://", "wss://") + "/wss/";
        wsInstance = new WebSocket(`${wsBaseURL}`, [token]);
        socketRef.current = wsInstance;

        wsInstance.onopen = () => {
          console.log(`WebSocket connected for ${entityType} search`);

          const requestPayload = {
            crmConnectionId: localState.selectedConnection.id,
            searchTerm: localState.searchInput,
          };

          if (
            localState.selectedConnection.crm.toLowerCase() === "salesforce"
          ) {
            requestPayload.type = "salesforce_search";
            requestPayload.payload = {
              ...requestPayload,
              objectName: entityType == "account" ? "Account" : "Opportunity",
              fieldNames: ["Name", "Description", "Id"],
            };
          } else if (
            localState.selectedConnection.crm.toLowerCase() === "zoho"
          ) {
            requestPayload.type = "zoho_search";
            requestPayload.payload = {
              ...requestPayload,
              moduleName: entityType == "account" ? "Accounts" : "Deals",
            };
          } else if (
            localState.selectedConnection.crm.toLowerCase() === "dynamics 365"
          ) {
            requestPayload.type = "dynamics_search";
            requestPayload.payload = {
              ...requestPayload,
              objectName: entityType == "account" ? "Accounts" : "opportunities",
            };
          } else if (
            localState.selectedConnection.crm.toLowerCase() === "hubspot"
          ) {
            requestPayload.type = "hubspot_search";
            requestPayload.payload = {
              ...requestPayload,
              objectName: entityType == "company" ? "companies" : "deals",
            };
          } else if (
            localState.selectedConnection.crm.toLowerCase() === "pipedrive"
          ) {
            requestPayload.type = "pipedrive_search";
            requestPayload.payload = {
              ...requestPayload,
              objectName: entityType == "company" ? "companies" : "deals",
            };
          }

          wsInstance.send(JSON.stringify(requestPayload));
          setIsSearchingEntity(true);
        };

        wsInstance.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("Data fetched from wss", data);

          if (data.error === "expired access/refresh token") {
            setWssFailedForTokens(true);
            console.log("Received auth Error from webSocket:", data.error);
            return;
          }
          const isAccountMode =
            localState.entityType == "account" ||
            localState.entityType == "company";
          if (data.status === "success" && data.searchResults) {
            const normalizedRecords = normalizeResults(
              data.searchResults,
              localState.selectedConnection.crm.toLowerCase(),
              isAccountMode
            );
            console.log("Normalised Records", normalizedRecords);
            setEntitySearchResult(normalizedRecords);
          }

          setIsSearchingEntity(false);
        };

        wsInstance.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsSearchingEntity(false);
        };

        wsInstance.onclose = () => {
          console.log("WebSocket disconnected");
          socketRef.current = null;
          setIsSearchingEntity(false);
        };
      }
    };

    const debounceTimeout = setTimeout(setupWebSocket, 300);

    return () => {
      clearTimeout(debounceTimeout);
      if (wsInstance) {
        wsInstance.close();
        socketRef.current = null;
      }
    };
  }, [
    localState.searchInput,
    localState.selectedConnection,
    baseURL,
    localState.entityDetails.id,
    localState.entityType,
    token,
  ]);

  const CustomOption = ({ data, innerProps }) => (
    <div
      {...innerProps}
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
    >
      <img
        src={
          data.crmType === "salesforce"
            ? Salesforce
            : data.crmType === "zoho"
            ? ZohoSquare
            : data.crmType === "hubspot"
            ? HubspotLogo
            : data.crmType === "pipedrive"
            ? pipedriveLogo
            : data.crmType === "dynamics 365"
            ? Dynamics
            : logo
        }
        alt={data.crmType}
        className="w-5 h-5 object-contain"
      />
      <span>{data.label}</span>
    </div>
  );

  const handleEntitySelection = (result) => {
    // Immediately update local state
    setLocalState((prev) => ({
      ...prev,
      entityDetails: { id: result.Id, name: result.Name },
      searchInput: result.Name,
    }));
    setEntitySearchResult([]);

    // Fire off the check in background (no response handling)
    dispatch(
      checkActivePitchForCrmRecordAsync({
        axiosInstance,
        record_id: result.Id,
      })
    );
  };

  const handleSave = () => {
    if (!isFormValid) return;

    // Dispatch all the actions to update the global state
    dispatch(
      setSelectedCrm({
        selectedCrmId: localState.selectedConnection.id,
        crmType: localState.selectedConnection.crm.toLowerCase(),
        selectedCrmName: localState.selectedConnection.name,
      })
    );
    dispatch(setEntityType(localState.entityType));
    dispatch(setEntityDetails(localState.entityDetails));
    dispatch(toggleEntityModal(false));
  };

  const handleCrmConnectionChange = (selected) => {
    // Find the full connection object from the Redux state
    const selectedConnection = pitchState.crmConnections.find((connection) => {
      if (selected.crmType === "hubspot") {
        return connection.name === selected.value;
      } else if (selected.crmType === "pipedrive") {
        return connection.name === selected.value;
      } else {
        const selectedConnectionUsername = selected.value;
        const [selectedCrmUsername, selectedName] = selectedConnectionUsername
          .split(" (")
          .map((value) => value.replace(")", ""));

        return (
          connection.crm_username === selectedCrmUsername &&
          connection.name === selectedName
        );
      }
    });

    if (selectedConnection) {
      setLocalState((prev) => ({
        ...prev,
        selectedConnection,
        entityType: selected.crmType === "salesforce" ? "opportunity" : "deal",
        entityDetails: { id: "", name: "" },
        searchInput: "",
      }));
      setEntitySearchResult([]);
      setIsSearchingEntity(false);
    }
  };

  const toggleLocalEntityType = () => {
    setLocalState((prev) => ({
      ...prev,
      entityType:
        prev.entityType === "account" || prev.entityType === "company"
          ? prev.selectedConnection?.crm.toLowerCase() === "salesforce"
            ? "opportunity"
            : "deal"
          : prev.selectedConnection?.crm.toLowerCase() === "salesforce"
          ? "account"
          : "company",
      entityDetails: { id: "", name: "" },
      searchInput: "",
    }));
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "40px",
      width: "320px",
      border: "1px solid #e2e8f0",
      borderRadius: "0.375rem",
      boxShadow: "0 0 0 1px #e2e8f0",
      "&:hover": {
        borderColor: "#D5ABAD",
      },
      fontSize: "0.870rem",
    }),
    container: (base) => ({
      ...base,
      width: "320px",
    }),
    menu: (base) => ({
      ...base,
      width: "320px",
    }),
    option: (base, state) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: state.isFocused ? "#f3f4f6" : "white",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
      fontSize: "0.875rem",
    }),
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[99] transition-opacity duration-200">
      <div className="w-[500px] max-w-4xl bg-white rounded-md shadow-lg flex flex-col animate-fadeIn justify-between">
        {/* Header */}
        <div className="shadow-md px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800">
            Edit Crm Connection
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
            onClick={() => {
              dispatch(toggleEntityModal(false));
            }}
          >
            <MdClose size={22} className="text-gray-500" />
          </button>
        </div>

        {/* Main */}
        <div className="mb-5 mt-3 px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 inline-block w-32 text-left">
              {!localState.selectedConnection
                ? "Select CRM First"
                : localState.selectedConnection.crm.toLowerCase() ===
                  "salesforce"
                ? localState.entityType === "account"
                  ? "Account Search"
                  : "Opportunity Search"
                : localState.selectedConnection.crm.toLowerCase() === "hubspot" ||
                  localState.selectedConnection.crm.toLowerCase() === "pipedrive"
                ? localState.entityType === "company"
                  ? "Company Search"
                  : "Deal Search"
                : localState.entityType === "account"
                ? "Account Search"
                : "Deal Search"}
            </span>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={
                  localState.entityType === "account" ||
                  localState.entityType === "company"
                }
                onChange={toggleLocalEntityType}
                disabled={!localState.selectedConnection}
              />
              <div
                className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${
                  !localState.selectedConnection
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              ></div>
            </label>
          </div>
        </div>

        <div className="mb-5 px-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            CRM Connection
          </label>
          <div>
            {pitchState.crmConnectionsLoading ? (
              <select
                className={`w-full border text-gray-900 text-sm rounded-lg p-2.5 ${"bg-gray-50 border-gray-400"}`}
                disabled
              >
                <option value="Loading">Loading Connections...</option>
              </select>
            ) : (
              <Select
                options={pitchState.crmConnections.map((connection) => ({
                  value:
                    connection.crm.toLowerCase() === "hubspot" || connection.crm.toLowerCase() === "pipedrive"
                      ? connection.name
                      : `${connection.crm_username} (${connection.name})`,
                  label:
                    connection.crm.toLowerCase() === "hubspot" || connection.crm.toLowerCase() === "pipedrive"
                      ? connection.name
                      : `${
                          connection.crm_username?.length > 35
                            ? connection.crm_username?.substring(0, 40) + "..."
                            : connection.crm_username
                        } (${connection.name})`,
                  crmType: connection.crm.toLowerCase(),
                }))}
                styles={{
                  ...customStyles,
                  control: (base) => ({
                    ...base,
                    minHeight: "40px",
                    width: "100%",
                    borderRadius: "0.375rem",
                    boxShadow: "0 0 0 1px #e2e8f0",
                    fontSize: "0.870rem",
                  }),
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                  menu: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
                placeholder="Select Connection"
                components={{
                  Option: CustomOption,
                }}
                onChange={handleCrmConnectionChange}
              />
            )}
          </div>
        </div>

        {/* Entity Search */}
        <div className="mb-5 px-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {localState.entityType == "account" ||
            localState.entityType == "company" ? (
              localState.selectedConnection?.crm.toLowerCase() === "hubspot" || localState.selectedConnection?.crm.toLowerCase() === "pipedrive"? (
                <>Company Name</>
              ) : (
                <>Account Name</>
              )
            ) : localState.selectedConnection?.crm.toLowerCase() ===
              "salesforce" ? (
              <>Opportunity Name</>
            ) : (
              <>Deal Name</>
            )}
          </label>

          <div>
            {pitchState.crmConnectionsLoading ? (
              <select
                id="opportunityDropdown"
                className={`w-full border text-gray-900 text-sm rounded-lg p-2.5 
                    "bg-gray-50 border-gray-400 focus:ring-blue-500 focus:border-blue-500"
                }`}
                disabled
              >
                <option value="Loading">
                  {localState.selectedConnection?.crm.toLowerCase() ===
                  "salesforce"
                    ? "Loading Opportunities..."
                    : "Loading Deals..."}
                </option>
              </select>
            ) : (
              <div className="relative w-full">
                <input
                  type="text"
                  value={localState.searchInput}
                  onChange={(e) => {
                    setLocalState((prev) => ({
                      ...prev,
                      searchInput: e.target.value,
                      entityDetails:
                        e.target.value === ""
                          ? { id: "", name: "" }
                          : prev.entityDetails,
                    }));
                  }}
                  placeholder={
                    localState.entityType == "account" ||
                    localState.entityType == "company"
                      ? "Search accounts..."
                      : localState.selectedConnection?.crm.toLowerCase() ==
                        "zoho"
                      ? "Search Deals..."
                      : "Search Opportunities..."
                  }
                  disabled={!localState.selectedConnection}
                  className={`w-full border text-gray-900 text-sm rounded-lg p-2.5 
                      disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed
                      bg-gray-50 ${
                        pitchState.activePitchCheck.exists
                          ? "border-red-500 "
                          : "border-gray-400"
                      }`}
                  title={
                    !localState.selectedConnection
                      ? "Please select a CRM connection first"
                      : ""
                  }
                />

                <>
                  {localState.searchInput.length >= 3 &&
                    entitySearchResult.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-400 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {entitySearchResult.map((result) => (
                          <div
                            key={result.Id}
                            onClick={() => handleEntitySelection(result)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            {result.Name}
                          </div>
                        ))}
                      </div>
                    )}

                  {localState.searchInput.length >= 3 &&
                    !isSearchingEntity &&
                    !localState.entityDetails.id &&
                    entitySearchResult.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-400 rounded-lg shadow-lg p-4">
                        <div className="text-center text-gray-500">
                          No {localState.entityType} found
                        </div>
                      </div>
                    )}

                  {isSearchingEntity && (
                    <div className="absolute right-3 top-3">
                      <LuLoaderCircle className="animate-spin text-primary text-xl" />
                    </div>
                  )}

                  {pitchState.activePitchCheck?.exists && (
                    <p className="mt-1 text-xs text-red-600">
                      An active pitch already exists for this record.{" "}
                      <a
                        href={`?pitchId=${pitchState.activePitchCheck.pitchId}&routeToPitch=true`}
                        className="text-red-600 font-bold hover:underline"
                      >
                        Open
                      </a>
                    </p>
                  )}
                </>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-300 flex justify-end">
          <div className="flex space-x-3">
            <button
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => {
                dispatch(toggleEntityModal(false));
              }}
            >
              Cancel
            </button>
            <button
              className={`ml-4 px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md ${
                !isFormValid ||
                pitchState.isLoading ||
                pitchState.activePitchCheck.exists
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleSave}
              disabled={
                !isFormValid ||
                pitchState.isLoading ||
                pitchState.activePitchCheck.exists
              }
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditEntityModal;
