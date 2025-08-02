import React, { useState, useEffect, useContext, useRef } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import AddConnectionDialog from "./AddConnectionDialog.jsx";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import WarningDialog from "../../../../utility/WarningDialog.jsx";
import { useNavigate } from "react-router-dom";
import useCheckUserLicense from "../../../../Services/checkUserLicense.jsx";

const ServiceUser = () => {
  const [serviceUserData, setServiceUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMigrateDialog, setShowMigrateDialog] = useState(false);

  const {
    viewer_id,
    selectedOrganisationId,
    setConnectionDetails,
    setObjectDetails,
    setShowConnectionButtons,
    checkUserStatus,
    showConnectServiceUserDialog,
    setShowConnectServiceUserDialog,
  } = useContext(GlobalContext);
  const [disconnectDialog, setDisconnectDialog] = useState(false);
  const axiosInstance = useAxiosInstance();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const checkUserLicense = useCheckUserLicense();

  const fetchServiceUser = async () => {
    setLoading(true);
    setError(null); //clear previous errors
    try {
      // fetch the swervice user data
      const response = await axiosInstance.post(`/get-service-user`, {
        organisation: selectedOrganisationId,
        viewer_id: viewer_id,
      });

      setServiceUserData(response.data);
      if (response.data === "CRM connection not found") {
        setError("CRM connection not found");
      } else if (
        response.data === "Service CRM user not found in organisation"
      ) {
        setError("Service CRM user not found in organisation");
      }
    } catch (error) {
      console.error("Error fetching service user:", error);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceUser();
  }, [selectedOrganisationId, viewer_id]);

  const handleConnect = () => {
    setShowConnectServiceUserDialog(true);
    if (
      checkUserLicense("Revenue Enablement Elevate") == "1" ||
      checkUserLicense("Revenue Enablement Spark") == "1"
    )
      checkUserStatus();
  };

  const handleReconnect = async () => {
    try {
      if (!serviceUserData || !serviceUserData[0]) {
        throw new Error("No service user data available for reconnection.");
      }

      const crmConnectionId = serviceUserData[0].id;
      const originURL = window.location.href;
      const encodedOriginURL = encodeURIComponent(
        `${originURL}|${selectedOrganisationId}`
      );

      console.log("Sending API data to Salesforce auth:", {
        crm_connection_id: crmConnectionId,
        viewer_id: viewer_id,
        originURL: originURL,
      });

      await toast.promise(
        axiosInstance
          .get(`/salesforce-authorisation`, {
            params: {
              crm_connection_id: crmConnectionId,
              viewer_id: viewer_id,
              originURL: originURL,
            },
          })
          .then(async (response) => {
            if (response.data.authUrl) {
              const authData = await response.data;
              if (authData.authUrl) {
                window.location.href = authData.authUrl;
                return "Redirecting to Salesforce ..";
              } else {
                throw new Error("Failed to retrieve authorization URL");
              }
            } else {
              const text = await response.data;
              if (text.includes("Salesforce data synchronized successfully.")) {
                return "Salesforce data synchronized successfully.";
              } else {
                throw new Error(`Unexpected response found hereee: ${text}`);
              }
            }
          })
          .catch((error) => {
            console.error("Error during Salesforce authorisation:", error);
            throw error;
          }),
        {
          loading: "Synchronizing Salesforce data...",
          success: (message) => `Success: ${message}`,
          error: (error) =>
            `Error: ${error.message || "Failed to synchronize."}`,
        }
      );
    } catch (error) {
      console.error("Error during Salesforce authorisation:", error);
    }

    checkUserStatus();

    // check status after attempting reconnection
    if (
      checkUserLicense("Revenue Enablement Elevate") == "1" ||
      checkUserLicense("Revenue Enablement Spark") == "1"
    )
      checkUserStatus();
  };

  const handleDisconnect = async () => {
    setDisconnectDialog(false);
    const disconnectPromise = axiosInstance.post(`/disconnect-service-user`, {
      organisation: selectedOrganisationId,
      viewer_id: viewer_id,
    });

    toast.promise(
      disconnectPromise,
      {
        loading: "Disconnecting...",
        success: "Disconnected successfully!",
        error: "Error disconnecting!",
      },
      {
        style: {
          minWidth: "250px",
        },
        success: {
          duration: 5000,
        },
      }
    );

    try {
      const response = await disconnectPromise;

      if (response.data.success) {
        setServiceUserData(null);
        setDisconnectDialog(false);
        setError("CRM connection not found");
        console.log("Successfully disconnected.");
        fetchServiceUser();
      } else {
        console.error("Failed to disconnect:", response.data.message);
      }
    } catch (error) {
      console.error("Error during disconnection:", error);
    }
    if (
      checkUserLicense("Revenue Enablement Elevate") == "1" ||
      checkUserLicense("Revenue Enablement Spark") == "1"
    )
      checkUserStatus();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };



  const handleMigrateServiceUser = () => {
    setShowMigrateDialog(true);
  };

  const handleRefFields = async () => {
    const id = serviceUserData[0].id;
    setShowConnectionButtons(false);

    navigate("/content/settings/connection", { replace: true });

    toggleDropdown();
    if (viewer_id && id) {
      try {
        const response = await axiosInstance.post(`/view-crm-connection`, {
          viewer_id: viewer_id,
          connection_id: id,
        });
        if (response.data.success) {
          // Set connection details if API call is successful
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
        } catch (error) {
          console.error("Error retrieving CRM object details:", error);
        }
      }
    }
  };

  return (
    <div className="p-4">
      {disconnectDialog && (
        <WarningDialog
          title="Disconnect Service User?"
          content="Are you sure you want to disconnect? This will delete all tags related to this connection. If not, use the migrate button."
          onConfirm={handleDisconnect}
          onCancel={() => setDisconnectDialog(false)}
          onEnter={handleDisconnect}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-800">Service User</h2>
        <div>
          <div className="relative mr-4" ref={dropdownRef}>
            <button
              id="dropdownMenuIconHorizontalButton"
              onClick={toggleDropdown}
              data-dropdown-toggle="dropdownDotsHorizontal"
              className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              type="button"
            >
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 3"
              >
                <path d="M0 1.5A1.5 1.5 0 1 0 1.5 0 1.5 1.5 0 0 0 0 1.5ZM8 0a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 8 0Zm6.5 0a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 14.5 0Z" />
              </svg>
              <span className="sr-only">Open options</span>
            </button>

            {dropdownOpen && (
              <div
                id="dropdownDotsHorizontal"
                className="border border-gray-200 z-10 absolute right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-md w-44 dark:bg-gray-700 dark:divide-gray-600"
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownMenuIconHorizontalButton"
                >
                  {!error &&
                    serviceUserData &&
                    serviceUserData[0].crm == "Salesforce" && (
                      <>
                        <li>
                          <button
                            onClick={() => {
                              handleReconnect();
                              toggleDropdown();
                            }}
                            className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            Reconnect
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setDisconnectDialog(true);
                              toggleDropdown();
                            }}
                            className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            Disconnect
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              handleMigrateServiceUser();
                              toggleDropdown();
                            }}
                            className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            Migrate User
                          </button>
                        </li>
                       
                        <li>
                          <button
                            onClick={() => {
                              handleRefFields();
                            }}
                            className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            Edit Ref Fields
                          </button>
                        </li>
                      </>
                    )}
                  {(error === "CRM connection not found" ||
                    error === "Service CRM user not found in organisation" ||
                    serviceUserData[0].crm !== "Salesforce") && (
                    <li>
                      <button
                        onClick={() => {
                          handleConnect();
                          toggleDropdown();
                        }}
                        className="w-full text-left block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        Connect
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          <div className="w-[200px] h-[30px] bg-neutral-200 animate-pulse rounded-lg" />
          <div className="max-w-[500px] w-full h-[30px] bg-neutral-200 animate-pulse rounded-lg" />
          <div className="max-w-[500px] w-full h-[30px] bg-neutral-200 animate-pulse rounded-lg" />
        </div>
      ) : !error &&
        serviceUserData &&
        serviceUserData[0].crm == "Salesforce" ? (
        <div className="p-4 max-w-md">
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-24  font-medium text-gray-500">Name:</span>
              <span className=" text-gray-900">{serviceUserData[0].name}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-medium text-gray-500">ID:</span>
              <span className=" text-gray-900">{serviceUserData[0].id}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 font-medium text-gray-500">Username:</span>
              <span className=" text-gray-900">
                {serviceUserData[0].crm_username}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <>
          Existing Service User is from different CRM other than Salesforce.
          <br />
          Connect New to use Salesforce as Service User.
        </>
      )}
      {showConnectServiceUserDialog && (
        <AddConnectionDialog
          onClose={() => setShowConnectServiceUserDialog(false)}
          defaultConnectionName={`Service User ${viewer_id}`}
          defaultInstanceType="Production"
          tittle="Connect Service User"
        />
      )}
    
      {showMigrateDialog && (
        <AddConnectionDialog
          onClose={() => setShowMigrateDialog(false)}
          defaultConnectionName={`Service User ${viewer_id}`}
          defaultInstanceType="Production"
          extraParam={serviceUserData[0].id}
          tittle="Migrate Service User"
        />
      )}
    
    </div>
  );
};

export default ServiceUser;
