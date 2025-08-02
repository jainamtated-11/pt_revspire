import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";

function Authenticate() {
  const { baseURL, viewer_id, connectionDetails } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  console.log("Connection details in authenticate", connectionDetails);
  const handleClick = async () => {
    const path = window.location.href;

    // Promise-based toast
    const promise = new Promise(async (resolve, reject) => {
      if (connectionDetails.crm?.toLowerCase() === "salesforce") {
        try {
          if (!viewer_id || !connectionDetails || !connectionDetails.id) {
            console.error("viewer_id and connectionDetails.id are required.");
            reject("Viewer ID and connection details are required.");
            return;
          }

          const url = `${baseURL}/salesforce-authorisation`;

          const fullUrl = new URL(url);

          fullUrl.searchParams.append(
            "crm_connection_id",
            connectionDetails.id
          );
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
          // catch any errors during data handling
          console.error("Error authorizing connection:", error.message);
          reject("Error authorizing connection: " + error.message);
        }
      } else if (connectionDetails.crm?.toLowerCase() === "zoho") {
        try {
          if (!viewer_id || !connectionDetails || !connectionDetails.id) {
            console.error("viewer_id and connectionDetails.id are required.");
            reject("Viewer ID and connection details are required.");
            return;
          }

          const requestBody = {
            crm_connection_id: connectionDetails.id,
            viewer_id: viewer_id,
            originURL: path,
          };

          try {
            const authResponse = await axiosInstance.post(
              "/zoho-authorization",
              requestBody
            );
            const authData = authResponse.data;

            if (authData.authUrl) {
              console.log("Authorization URL:", authData.authUrl);
              // Redirect user to the authorization URL
              window.location.href = authData.authUrl;
            } else {
              if (authResponse.data == "Zoho data synchronized successfully.") {
                resolve("Zoho data synchronized successfully.");
                return;
              }
              console.error("Failed to retrieve authorization URL");
              // Additional error handling logic
            }
          } catch (error) {
            console.error("Error during authorization:", error);
            // Handle error (e.g., show a toast notification or retry)
          }
        } catch (error) {
          // catch any errors during data handling
          console.error("Error authorizing connection:", error.message);
          reject("Error authorizing connection: " + error.message);
        }
      } else if (connectionDetails.crm?.toLowerCase() === "hubspot") {
        try {
          if (!viewer_id || !connectionDetails || !connectionDetails.id) {
            console.error("viewer_id and connectionDetails.id are required.");
            reject("Viewer ID and connection details are required.");
            return;
          }

          const requestBody = {
            crm_connection_id: connectionDetails.id,
            viewer_id: viewer_id,
            originURL: path,
          };

          try {
            const authResponse = await axiosInstance.post(
              "/hubspot-authorization",
              requestBody
            );
            const authData = authResponse.data;

            if (authData.authUrl) {
              console.log("Authorization URL:", authData.authUrl);
              // Redirect user to the authorization URL
              window.location.href = authData.authUrl;
            } else {
              if (
                authResponse.data == "HubSpot data synchronized successfully."
              ) {
                resolve("HubSpot data synchronized successfully.");
                return;
              }
              console.error("Failed to retrieve authorization URL");
              // Additional error handling logic
            }
          } catch (error) {
            console.error("Error during authorization:", error);
            // Handle error (e.g., show a toast notification or retry)
          }
        } catch (error) {
          // catch any errors during data handling
          console.error("Error authorizing connection:", error.message);
          reject("Error authorizing connection: " + error.message);
        }
      } else if (connectionDetails.crm?.toLowerCase() === "pipedrive") {
        try {
          if (!viewer_id || !connectionDetails || !connectionDetails.id) {
            console.error("viewer_id and connectionDetails.id are required.");
            reject("Viewer ID and connection details are required.");
            return;
          }

          const requestBody = {
            crm_connection_id: connectionDetails.id,
            viewer_id: viewer_id,
            originURL: path,
          };

          try {
            const authResponse = await axiosInstance.post(
              "/pipedrive-authorization",
              requestBody
            );
            const authData = authResponse.data;

            if (authData.authUrl) {
              console.log("Authorization URL:", authData.authUrl);
              // Redirect user to the authorization URL
              window.location.href = authData.authUrl;
            } else {
              if (
                authResponse.data == "Pipedrive data synchronized successfully."
              ) {
                resolve("Pipedrive data synchronized successfully.");
                return;
              }
              console.error("Failed to retrieve authorization URL");
              // Additional error handling logic
            }
          } catch (error) {
            console.error("Error during authorization:", error);
            // Handle error (e.g., show a toast notification or retry)
          }
        } catch (error) {
          // catch any errors during data handling
          console.error("Error authorizing connection:", error.message);
          reject("Error authorizing connection: " + error.message);
        }
      } else if (connectionDetails.crm?.toLowerCase() === "dynamics 365") {
        try {
          if (!viewer_id || !connectionDetails || !connectionDetails.id) {
            console.error("viewer_id and connectionDetails.id are required.");
            reject("Viewer ID and connection details are required.");
            return;
          }

          const requestBody = {
            crm_connection_id: connectionDetails.id,
            viewer_id: viewer_id,
            originURL: path,
          };

          try {
            const authResponse = await axiosInstance.post(
              "/dynamics-authorization",
              requestBody
            );
            const authData = authResponse.data;

            if (authData.authUrl) {
              console.log("Authorization URL:", authData.authUrl);
              // Redirect user to the authorization URL
              window.location.href = authData.authUrl;
            } else {
              if (
                authResponse.data ===
                  "Data synchronized successfully with new access token." ||
                authResponse.data ===
                  "Data synchronized successfully with existing access token."
              ) {
                resolve("Dynamics data synchronized successfully.");
                return;
              }
              console.error("Failed to retrieve authorization URL");
              // Additional error handling logic
            }
          } catch (error) {
            console.error("Error during authorization:", error);
            // Handle error (e.g., show a toast notification or retry)
          }
        } catch (error) {
          // catch any errors during data handling
          console.error("Error authorizing connection:", error.message);
          reject("Error authorizing connection: " + error.message);
        }
      }
    });

    toast.promise(promise, {
      loading: `Authorizing ${connectionDetails.crm} connection...`,
      success: (msg) => `${msg}`,
      error: (err) => `Failed: ${err}`,
    });
  };

  return (
    <button
      type="button"
      className="bg-white text-sky-800 px-4 py-2 rounded-2xl shadow-md mr-4 hover:bg-sky-800 hover:text-white transition duration-300 ease-in-out"
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={faLink} className="mr-2" />
      Authorise
    </button>
  );
}

export default Authenticate;
