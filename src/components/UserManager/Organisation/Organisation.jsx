import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { Grid } from "react-loader-spinner";
import ResizableTable from "../../../utility/ResizableTable.jsx";
import AllInfo from "./AllInfo.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import useCheckUserLicense from "../../../Services/checkUserLicense.jsx";
import toast from "react-hot-toast";
import { TbChevronsDownLeft } from "react-icons/tb";

function General() {
  const {
    viewer_id,
    setMoreInfoClicked,
    moreInfoClicked,
    setOrganisationDetails,
    selectedOrganisationId,
    setSelectedOrganisationId,
    organisationDetails,
    organisations,
    setOrganisations,
    activeTab,
    setActiveTab,
    baseURL,
    checkUserStatus,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const checkUserLicense = useCheckUserLicense();
  console.log("Organisation Details", organisationDetails?.organisation.id);
  const [loading, setLoading] = useState(true);

  const [orgUsers, setOrgUsers] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "Updated At",
    direction: "desc",
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const crmType = searchParams.get("crmType");
    const code = searchParams.get("code");
    const crmConnectionId = searchParams.get("crmConnectionId");
    const existingCrmId = searchParams.get("existingCrmId");
    console.log("GETTTIN INSIDEEEE", crmType, crmConnectionId, code);
    if (crmType === "dynamics" && code && crmConnectionId) {
      setActiveTab("Dynamics");

      const payload = {
        state: JSON.stringify({
          crmConnectionId,
          originURL: window.location.href,
        }),
        code,
      };

      // Clean up URL params
      searchParams.delete("crmType");
      searchParams.delete("code");
      searchParams.delete("crmConnectionId");
      searchParams.delete("existingCrmId");
      const newUrl = window.location.pathname + "?" + searchParams.toString();
      window.history.replaceState({}, "", newUrl);

      // Step 1: Get Dynamics access token
      const getDynamicsAccessToken = new Promise(async (resolve, reject) => {
        try {
          const response = await axiosInstance.post(
            "/getDynamicsAccessToken",
            payload,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          if (response.status === 200) {
            const organisationId = JSON.parse(payload.state).organisationId;
            resolve({ organisationId });
          } else {
            throw new Error("Failed to retrieve Dynamics access token.");
          }
        } catch (error) {
          reject(error.message);
        }
      });

      toast.promise(getDynamicsAccessToken, {
        loading: "Retrieving Dynamics access token...",
        success: "Dynamics access token retrieved successfully!",
        error: (err) => `Failed: ${err}`,
      });

      getDynamicsAccessToken
        .then(async ({ organisationId }) => {
          // Step 2: Update service CRM connection
          const updateServiceCrmConnection = new Promise(
            async (resolve, reject) => {
              try {
                const updatePayload = {
                  crm_connection: crmConnectionId,
                  organisation: organisationId,
                  viewer_id,
                };

                const response = await axiosInstance.post(
                  "/update-service-crm-connection",
                  updatePayload,
                  {
                    headers: { "Content-Type": "application/json" },
                  }
                );

                if (response.status === 200) {
                  resolve("Service CRM connection updated successfully!");
                } else {
                  throw new Error("Failed to update service CRM connection.");
                }
              } catch (error) {
                reject(error.message);
              }
            }
          );

          toast.promise(updateServiceCrmConnection, {
            loading: "Updating service CRM connection...",
            success: "Service CRM connection updated successfully!",
            error: (err) => `Failed: ${err}`,
          });

          return updateServiceCrmConnection.then(() => ({ organisationId }));
        })
        .then(async ({ organisationId }) => {
          // Step 3: Optional - Migrate Dynamics service user if `existingCrmId` is present
          if (existingCrmId && existingCrmId !== "null") {
            const migrateDynamicsServiceUser = new Promise(
              async (resolve, reject) => {
                try {
                  const migratePayload = {
                    old_crm_connection_id: existingCrmId,
                    new_crm_connection_id: crmConnectionId,
                    viewer_id,
                    organisation_id: organisationId,
                  };

                  // TODO: Fill in this migration logic or endpoint if applicable
                  // Example:
                  // const response = await axiosInstance.post(
                  //   "/migrate-dynamics-service-user",
                  //   migratePayload,
                  //   { headers: { "Content-Type": "application/json" } }
                  // );
                  //
                  // if (response.status === 200) {
                  //   resolve("Dynamics service user migrated successfully!");
                  // } else {
                  //   throw new Error("Failed to migrate Dynamics service user.");
                  // }

                  resolve("Migration logic to be implemented."); // Placeholder
                } catch (error) {
                  reject(error.message);
                }
              }
            );

            toast.promise(migrateDynamicsServiceUser, {
              loading: "Migrating Dynamics service user...",
              success: "Dynamics service user migrated successfully!",
              error: (err) => `Failed: ${err}`,
            });

            return migrateDynamicsServiceUser;
          }
        })
        .then(async () => {
          // Step 4: Authorize and synchronize Dynamics data
          const dynamicsAuthorization = new Promise(async (resolve, reject) => {
            try {
              const path = window.location.href;

              const authResponse = await axiosInstance.post(
                "/dynamics-authorization",
                {
                  crm_connection_id: crmConnectionId,
                  viewer_id,
                  originURL: path,
                }
              );

              const authData = authResponse.data;

              if (authData.authUrl) {
                console.log("Redirecting to Dynamics authorization URL...");
                window.location.href = authData.authUrl;
              } else if (
                authData ===
                  "Data synchronized successfully with new access token." ||
                authData ===
                  "Data synchronized successfully with existing access token."
              ) {
                resolve(authData);
              } else {
                throw new Error(
                  "Unknown response from Dynamics authorization."
                );
              }
            } catch (error) {
              reject(error.message);
            }
          });

          toast.promise(dynamicsAuthorization, {
            loading: "Authorizing Dynamics connection...",
            success: "Dynamics data synchronized successfully!",
            error: (err) => `Failed: ${err}`,
          });

          return dynamicsAuthorization;
        })
        .catch((error) => {
          console.error("Error during Dynamics integration steps:", error);
        });
    }

    if (
      checkUserLicense("Revenue Enablement Elevate") === "1" ||
      checkUserLicense("Revenue Enablement Spark") === "1"
    ) {
      checkUserStatus();
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const crmType = searchParams.get("crmType");
    const code = searchParams.get("code");
    const crmConnectionId = searchParams.get("crmConnectionId");
    const accountsServer = searchParams.get("accountsServer");
    const location = searchParams.get("location");
    const existingCrmId = searchParams.get("existingCrmId");

    if (crmType === "Zoho" && code && crmConnectionId) {
      setActiveTab("Zoho");

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

      // First call: Get Zoho access token
      const getZohoAccessToken = new Promise(async (resolve, reject) => {
        try {
          const response = await axiosInstance.post(
            "/getZohoAccessToken",
            payload,
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          if (response.status === 200) {
            const organisationId = JSON.parse(
              response.config.data
            ).organisation_id;
            resolve({ organisationId });
          } else {
            throw new Error("Failed to retrieve Zoho access token.");
          }
        } catch (error) {
          reject(error.message);
        }
      });

      toast.promise(getZohoAccessToken, {
        loading: "Retrieving Zoho access token...",
        success: "Zoho access token retrieved successfully!",
        error: (err) => `Failed: ${err}`,
      });

      getZohoAccessToken
        .then(async ({ organisationId }) => {
          // Second call: Update service CRM connection
          const updateServiceCrmConnection = new Promise(
            async (resolve, reject) => {
              try {
                const updatePayload = {
                  crm_connection: crmConnectionId,
                  organisation: organisationId,
                  viewer_id,
                };

                const response = await axiosInstance.post(
                  "/update-service-crm-connection",
                  updatePayload,
                  {
                    headers: { "Content-Type": "application/json" },
                  }
                );

                if (response.status === 200) {
                  resolve("Service CRM connection updated successfully!");
                } else {
                  throw new Error("Failed to update service CRM connection.");
                }
              } catch (error) {
                reject(error.message);
              }
            }
          );

          toast.promise(updateServiceCrmConnection, {
            loading: "Updating service CRM connection...",
            success: "Service CRM connection updated successfully!",
            error: (err) => `Failed: ${err}`,
          });

          return updateServiceCrmConnection.then(() => ({ organisationId }));
        })
        .then(async ({ organisationId }) => {
          // Optional Call: Migrate Zoho service user if existingCrmId is present
          if (existingCrmId && existingCrmId !== "null") {
            const migrateZohoServiceUser = new Promise(
              async (resolve, reject) => {
                try {
                  const migratePayload = {
                    old_crm_connection_id: existingCrmId,
                    new_crm_connection_id: crmConnectionId,
                    viewer_id,
                    organisation_id: organisationId,
                  };

                  const response = await axiosInstance.post(
                    "/migrate-zoho-service-user",
                    migratePayload,
                    {
                      headers: { "Content-Type": "application/json" },
                    }
                  );

                  if (response.status === 200) {
                    resolve("Zoho service user migrated successfully!");
                  } else {
                    throw new Error("Failed to migrate Zoho service user.");
                  }
                } catch (error) {
                  reject(error.message);
                }
              }
            );

            toast.promise(migrateZohoServiceUser, {
              loading: "Migrating Zoho service user...",
              success: "Zoho service user migrated successfully!",
              error: (err) => `Failed: ${err}`,
            });

            return migrateZohoServiceUser;
          }
        })
        .then(async () => {
          // Third call: Zoho authorization
          const zohoAuthorization = new Promise(async (resolve, reject) => {
            try {
              const path = window.location.href;

              const authResponse = await axiosInstance.post(
                "/zoho-authorization",
                {
                  crm_connection_id: crmConnectionId,
                  viewer_id: viewer_id,
                  originURL: path,
                }
              );

              const authData = authResponse.data;

              if (authData.authUrl) {
                console.log("Authorization URL:", authData.authUrl);
                // Redirect user to the authorization URL
                window.location.href = authData.authUrl;
              } else {
                if (
                  authResponse.data === "Zoho data synchronized successfully."
                ) {
                  resolve("Zoho data synchronized successfully.");
                } else {
                  console.error("Failed to retrieve authorization URL");
                }
              }
            } catch (error) {
              reject(error.message);
            }
          });

          toast.promise(zohoAuthorization, {
            loading: "Authorizing Zoho connection...",
            success: "Zoho connection authorized successfully!",
            error: (err) => `Failed: ${err}`,
          });

          return zohoAuthorization;
        })
        .catch((error) => {
          console.error("Error during one of the steps:", error);
        });
    }

    if (
      checkUserLicense("Revenue Enablement Elevate") == "1" ||
      checkUserLicense("Revenue Enablement Spark") == "1"
    ) {
      checkUserStatus();
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const crmType = searchParams.get("crmType");
    const code = searchParams.get("code");
    const crmConnectionId = searchParams.get("crmConnectionId");
    const existingCrmId = searchParams.get("existingCrmId");

    // Update the URL without reloading the page
    const newUrl = `${window.location.pathname}${
      searchParams.toString() ? "?" + searchParams.toString() : ""
    }`;
    window.history.replaceState(null, "", newUrl);

    if (crmType === "HubSpot" && code && crmConnectionId) {
      setActiveTab("HubSpot");
      console.log("Reached Inside the if Condition ");
      const stateObject = {
        crmConnectionId,
        originURL: window.location.href,
      };

      // Remove the parameters from the URL
      searchParams.delete("crmType");
      searchParams.delete("code");
      searchParams.delete("crmConnectionId");
      searchParams.delete("existingCrmId");

      const payload = {
        state: encodeURIComponent(JSON.stringify(stateObject)),
        code,
        viewer_id,
      };

      console.log("Payload", payload);

      [
        // Clear URL params after extraction
        ("crmType", "code", "crmConnectionId", "existingCrmId"),
      ].forEach((param) => searchParams.delete(param));
      const newUrl = window.location.pathname + "?" + searchParams.toString();
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
            const organisationId = response.data.organisationId;
            resolve({ organisationId });
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
        .then(async ({ organisationId }) => {
          // Step 2: Update Service CRM Connection
          const updateServiceCrmConnection = new Promise(
            async (resolve, reject) => {
              try {
                const updatePayload = {
                  crm_connection: crmConnectionId,
                  organisation: organisationId,
                  viewer_id,
                };

                const response = await axiosInstance.post(
                  "/update-service-crm-connection",
                  updatePayload,
                  { headers: { "Content-Type": "application/json" } }
                );

                if (response.status === 200) {
                  resolve("Service CRM connection updated successfully!");
                } else {
                  throw new Error("Failed to update service CRM connection.");
                }
              } catch (error) {
                reject(error.message);
              }
            }
          );

          toast.promise(updateServiceCrmConnection, {
            loading: "Updating service CRM connection...",
            success: "Service CRM connection updated successfully!",
            error: (err) => `Failed: ${err}`,
          });

          return updateServiceCrmConnection.then(() => ({ organisationId }));
        })
        .then(async ({ organisationId }) => {
          // Step 3 (Optional): Migrate HubSpot Service User if `existingCrmId` exists
          if (existingCrmId && existingCrmId !== "null") {
            const migrateHubSpotServiceUser = new Promise(
              async (resolve, reject) => {
                try {
                  const migratePayload = {
                    old_crm_connection_id: existingCrmId,
                    new_crm_connection_id: crmConnectionId,
                    viewer_id,
                    organisation_id: organisationId,
                  };

                  const response = await axiosInstance.post(
                    "/migrate-hubspot-service-user",
                    migratePayload,
                    { headers: { "Content-Type": "application/json" } }
                  );

                  if (response.status === 200) {
                    resolve("HubSpot service user migrated successfully!");
                  } else {
                    throw new Error("Failed to migrate HubSpot service user.");
                  }
                } catch (error) {
                  reject(error.message);
                }
              }
            );

            toast.promise(migrateHubSpotServiceUser, {
              loading: "Migrating HubSpot service user...",
              success: "HubSpot service user migrated successfully!",
              error: (err) => `Failed: ${err}`,
            });

            return migrateHubSpotServiceUser;
          }
        })
        .then(async () => {
          // Step 4: Authorize HubSpot Connection
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
    const existingCrmId = searchParams.get("existingCrmId");

    // Update the URL without reloading the page
    const newUrl = `${window.location.pathname}${
      searchParams.toString() ? "?" + searchParams.toString() : ""
    }`;
    window.history.replaceState(null, "", newUrl);

    if (crmType === "Pipedrive" && code && crmConnectionId) {
      console.log("Reached Inside the if Condition ");
      setActiveTab("Pipedrive");
      const stateObject = {
        crmConnectionId,
        originURL: window.location.href,
      };

      // Remove the parameters from the URL
      searchParams.delete("crmType");
      searchParams.delete("code");
      searchParams.delete("crmConnectionId");
      searchParams.delete("existingCrmId");

      const payload = {
        state: encodeURIComponent(JSON.stringify(stateObject)),
        code,
        viewer_id,
      };

      console.log("Payload", payload);

      [
        // Clear URL params after extraction
        ("crmType", "code", "crmConnectionId", "existingCrmId"),
      ].forEach((param) => searchParams.delete(param));
      const newUrl = window.location.pathname + "?" + searchParams.toString();
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
            const organisationId = response.data.organisationId;
            resolve({ organisationId });
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
        .then(async ({ organisationId }) => {
          // Step 2: Update Service CRM Connection
          const updateServiceCrmConnection = new Promise(
            async (resolve, reject) => {
              try {
                const updatePayload = {
                  crm_connection: crmConnectionId,
                  organisation: organisationId,
                  viewer_id,
                };

                const response = await axiosInstance.post(
                  "/update-service-crm-connection",
                  updatePayload,
                  { headers: { "Content-Type": "application/json" } }
                );

                if (response.status === 200) {
                  resolve("Service CRM connection updated successfully!");
                } else {
                  throw new Error("Failed to update service CRM connection.");
                }
              } catch (error) {
                reject(error.message);
              }
            }
          );

          toast.promise(updateServiceCrmConnection, {
            loading: "Updating service CRM connection...",
            success: "Service CRM connection updated successfully!",
            error: (err) => `Failed: ${err}`,
          });

          return updateServiceCrmConnection.then(() => ({ organisationId }));
        })
        .then(async ({ organisationId }) => {
          // Step 3 (Optional): Migrate Pipedrive Service User if `existingCrmId` exists
          if (existingCrmId && existingCrmId !== "null") {
            const migratePipedriveServiceUser = new Promise(
              async (resolve, reject) => {
                try {
                  const migratePayload = {
                    old_crm_connection_id: existingCrmId,
                    new_crm_connection_id: crmConnectionId,
                    viewer_id,
                    organisation_id: organisationId,
                  };

                  const response = await axiosInstance.post(
                    "/migrate-pipedrive-service-user",
                    migratePayload,
                    { headers: { "Content-Type": "application/json" } }
                  );

                  if (response.status === 200) {
                    resolve("Pipedrive service user migrated successfully!");
                  } else {
                    throw new Error("Failed to migrate Pipedrive service user.");
                  }
                } catch (error) {
                  reject(error.message);
                }
              }
            );

            toast.promise(migratePipedriveServiceUser, {
              loading: "Migrating Pipedrive service user...",
              success: "Pipedrive service user migrated successfully!",
              error: (err) => `Failed: ${err}`,
            });

            return migratePipedriveServiceUser;
          }
        })
        .then(async () => {
          // Step 4: Authorize Pipedrive Connection
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

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const crmConnectionId = searchParams.get("crmConnectionId");
    const existingCRMid = searchParams.get("existingCRMid");
    const organisation_id = searchParams.get("OrgId");
    const crmType = searchParams.get("crmType");
    if (existingCRMid && crmConnectionId && organisation_id && !crmType) {
      setActiveTab("Salesforce");

      const path = window.location.href;

      const promise = new Promise(async (resolve, reject) => {
        try {
          const response = await axiosInstance.post(`/migrate-service-user`, {
            old_crm_connection_id: existingCRMid,
            new_crm_connection_id: crmConnectionId,
            viewer_id: viewer_id,
            organisation_id: organisation_id,
          });

          if (response.status !== 200) {
            throw new Error("Failed to migrate service user");
          }

          const data = await response.data;
          if (data.success) {
            resolve("Service user migrated successfully.");

            // Authorisation call after successful migration
            const authorisePromise = new Promise(async (resolve, reject) => {
              try {
                if (!viewer_id || !crmConnectionId) {
                  console.error("viewer_id and crmConnectionId are required.");
                  reject("Viewer ID and connection details are required.");
                  return;
                }

                const url = `${baseURL}/salesforce-authorisation`;

                const fullUrl = new URL(url);

                fullUrl.searchParams.append(
                  "crm_connection_id",
                  crmConnectionId
                );
                fullUrl.searchParams.append("viewer_id", viewer_id);
                fullUrl.searchParams.append("originURL", path);

                const requestUrl = fullUrl.toString().replace(baseURL, "");

                const response = await axiosInstance.get(requestUrl);

                const responseText = await response.data;

                if (response.status < 200 || response.status >= 300) {
                  throw new Error("Failed to authorize connection");
                }

                try {
                  const data = JSON.parse(responseText);
                  window.location.href = data.authUrl;
                  resolve("Salesforce data synchronized successfully.");
                } catch (jsonError) {
                  console.log("Not a valid JSON response");
                  resolve("Salesforce data synchronized successfully.");
                }
              } catch (error) {
                console.error("Error authorizing connection:", error.message);
                reject("Error authorizing connection: " + error.message);
              }
            });

            toast.promise(authorisePromise, {
              loading: "Authorizing Salesforce connection...",
              success: (msg) => {
                // Remove crmConnectionId from the URL after success
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete("crmConnectionId");
                window.history.replaceState(
                  {},
                  document.title,
                  newUrl.toString()
                );

                return `${msg}`;
              },
              error: (err) => `Failed: ${err}`,
            });
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          console.error("Error migrating service user:", error.message);
          reject("Error migrating service user: " + error.message);
        }
        if (
          checkUserLicense("Revenue Enablement Elevate") == "1" ||
          checkUserLicense("Revenue Enablement Spark") == "1"
        )
          checkUserStatus();
      });

      toast.promise(promise, {
        loading: "Migrating service user...",
        success: (msg) => {
          // Remove crmConnectionId and existingCRMid from the URL after success
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("crmConnectionId");
          newUrl.searchParams.delete("existingCRMid");
          newUrl.searchParams.delete("OrgId");
          window.history.replaceState({}, document.title, newUrl.toString());

          return `${msg}`;
        },
        error: (err) => `Failed: ${err}`,
      });
      if (
        checkUserLicense("Revenue Enablement Elevate") == "1" ||
        checkUserLicense("Revenue Enablement Spark") == "1"
      )
        checkUserStatus();
    } else if (crmConnectionId && !crmType) {
      setActiveTab("Salesforce");

      const path = window.location.href;

      // Authorisation call directly
      const promise = new Promise(async (resolve, reject) => {
        try {
          if (!viewer_id || !crmConnectionId) {
            console.error("viewer_id and crmConnectionId are required.");
            reject("Viewer ID and connection details are required.");
            return;
          }

          const url = `${baseURL}/salesforce-authorisation`;

          const fullUrl = new URL(url);
          console.log("Working till here 3");

          fullUrl.searchParams.append("crm_connection_id", crmConnectionId);
          fullUrl.searchParams.append("viewer_id", viewer_id);
          fullUrl.searchParams.append("originURL", path);

          const requestUrl = fullUrl.toString().replace(baseURL, "");

          const response = await axiosInstance.get(requestUrl);

          const responseText = await response.data;

          if (response.status < 200 || response.status >= 300) {
            throw new Error("Failed to authorize connection");
          }

          try {
            const data = JSON.parse(responseText);
            window.location.href = data.authUrl;
            resolve("Salesforce data synchronized successfully.");
          } catch (jsonError) {
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
          // Remove crmConnectionId from the URL after success
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("crmConnectionId");
          window.history.replaceState({}, document.title, newUrl.toString());

          return `${msg}`;
        },
        error: (err) => `Failed: ${err}`,
      });
      if (
        checkUserLicense("Revenue Enablement Elevate") == "1" ||
        checkUserLicense("Revenue Enablement Spark") == "1"
      )
        checkUserStatus();
    }
    if (
      checkUserLicense("Revenue Enablement Elevate") == "1" ||
      checkUserLicense("Revenue Enablement Spark") == "1"
    )
      checkUserStatus();
  }, []);

  const handleGeneralClick = () => {
    setActiveTab("general");
  };

  const handleInfoClick = () => {
    setActiveTab("info");
  };

  useEffect(() => {
    setLoading(true);
    const fetchOrganisations = async () => {
      try {
        const response = await axiosInstance.post(`/view-organisations`, {
          viewer_id: viewer_id,
        });

        if (response.data.success) {
          const transformedProfiles = response.data.organisations.map(
            (user) => ({
              ...user,
              "Created At": user.created_at || "N/A",
              "Created By": user.created_by || "N/A",
              "Updated By": user.updated_by || "N/A",
              "Updated At": user.updated_at || "N/A",
            })
          );
          setOrganisations(transformedProfiles);
          setLoading(false);

          const firstOrgId = response.data.organisations[0].id;
          try {
            const response = await axiosInstance.post(
              `/view-organisation-details`,
              {
                viewer_id: viewer_id,
                organisation_id: firstOrgId,
              }
            );
            // Handle response data as needed
            setOrganisationDetails(response.data);
            setSelectedOrganisationId(firstOrgId);
            setMoreInfoClicked(true);
            setOrgUsers(response?.data?.users?.length);
          } catch (error) {
            console.error("Error fetching organisation details:", error);
          }
        } else {
          console.error(
            "Failed to fetch organisations:",
            response.data.message
          );
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching organisations:", error);
      }
    };

    fetchOrganisations();
  }, [viewer_id]);

  const handleRowClick = async (id) => {
    console.log(id);
    try {
      const response = await axiosInstance.post(`/view-organisation-details`, {
        viewer_id: viewer_id,
        organisation_id: id,
      });
      // Handle response data as needed
      setOrganisationDetails(response.data);
      setSelectedOrganisationId(id);
      setMoreInfoClicked(true);
    } catch (error) {
      console.error("Error fetching organisation details:", error);
    }
  };

  let includedFields = [
    "id",
    "name",
    "primary_contact",
    "currency_name",
    "modified_by_name",
    "created_by_name",
    "Updated At",
    "timezone_name",
  ];
  // Map each object in contents array to a row object containing only the included fields
  const rows = organisations.map((content) => {
    const row = {};

    includedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(content, field)) {
        // Check if the field is created_at or updated_at and format the date
        if (field === "created_at" || field === "updated_at") {
          row[field] = new Date(content[field]).toISOString().split("T")[0];
        } else {
          row[field] = content[field];
        }
      }
    });
    return row;
  });
  includedFields = [
    "id",
    "name",
    "contact",
    "currency_name",
    "Updated At",
    "timezone_name",
  ];

  const columns = includedFields;

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <div className=" mt-[30px] w-full h-[40px] bg-gray-200 animate-pulse rounded-lg" />
        <div className=" w-full h-[40px] bg-gray-200 animate-pulse rounded-lg" />
        <div className=" w-full h-[40px] bg-gray-200 animate-pulse rounded-lg" />
        <div className=" w-full h-[40px] bg-gray-200 animate-pulse rounded-lg" />
        <div className="mt-4  animate-pulse rounded-lg flex items-center">
          <div className=" w-[90px] h-[40px] bg-gray-300 animate-pulse rounded-lg" />
          <div className="ml-2 w-[90px] h-[40px] bg-gray-300 animate-pulse rounded-lg" />
          <div className="ml-2 w-[90px] h-[40px] bg-gray-300 animate-pulse rounded-lg" />
          <div className="ml-2 w-[100px] h-[40px] bg-gray-300 animate-pulse rounded-lg" />
          <div className="ml-2 w-[90px] h-[40px] bg-gray-300 animate-pulse rounded-lg" />
          <div className="ml-2 w-[100px] h-[40px] bg-gray-300 animate-pulse rounded-lg" />
          <div className="ml-2 w-[110px] h-[40px] bg-gray-300 animate-pulse rounded-lg" />
          <div className="ml-2 w-[110px] h-[40px] bg-gray-300 animate-pulse rounded-lg" />
        </div>
        <div className="w-full h-[350px] bg-gray-200 animate-pulse rounded-lg mt-2 pl-6">
          <div>
            <div className=" mt-[40px] ml-4 mr-4 w-[200px] h-[40px] bg-gray-300 animate-pulse rounded-lg" />
            <div className="flex justify-left">
              <div className="ml-4 mt-2 mb-4 h-[220px] w-[600px] bg-gray-300 animate-pulse rounded-lg" />
              <div className="mt-2 mb-4 ml-2 h-[220px] w-[600px] bg-gray-300 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-[0.5px] ">
      <div className="w-full">
        <ResizableTable
          rows={rows}
          columns={columns}
          data={organisations}
          onClick={handleRowClick}
          highlightText={true}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
        />
      </div>
      <div className="bg-white mt-2 w-full rounded-2xl">
        <AllInfo />
      </div>
    </div>
  );
}

export default General;
