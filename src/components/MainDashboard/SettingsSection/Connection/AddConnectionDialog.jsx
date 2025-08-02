import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import Dynamics from "../../../../assets/dynamics_365.png";
import Salesforce from "../../../../assets/salesforce_logo.png";
import Zoho from "../../../../assets/zoho.png";
import HubSpot from "../../../../assets/HubSpotLogo.png";
import pipedriveLogo from "../../../../assets/pipedriveLogo.svg";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { InfinitySpin } from "react-loader-spinner";
import useOutsideClick from "../../../../hooks/useOutsideClick.js";

const CRM_PROVIDERS = [
  { name: "Salesforce", logo: Salesforce },
  { name: "Dynamics 365", logo: Dynamics },
  { name: "Zoho", logo: Zoho },
  { name: "HubSpot", logo: HubSpot },
  { name: "Pipedrive", logo: pipedriveLogo },
];

function AddConnectionDialog() {
  const {
    setConnectionDetails,
    setAddConnectionsClicked,
    viewer_id,
    baseURL,
    step,
    setStep,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const [selectedCRM, setSelectedCRM] = useState(""); // State to store the selected CRM option
  const [connectionName, setConnectionName] = useState("");
  const [instanceURL, setInstanceURL] = useState("");
  const [instanceType, setInstanceType] = useState("Production");
  const [primary, setPrimary] = useState(true);
  const [queryParameters, setQueryParameters] = useState({});
  const [connectionId, setConnectionId] = useState("");
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  useEffect(() => {
    // Extract and store query parameters when the component mounts
    const queryParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of queryParams.entries()) {
      params[key] = value;
    }
    setQueryParameters(params);

    // Check for query parameters after redirection
    if (params.code && params.state) {
      const state = params.state;
      // Make a GET request using baseURL
      const url = `/getSalesforceAccessToken?code=${params.code}&state=${params.state}&viewer_id=${viewer_id}`;

      axiosInstance
        .get(url)
        .then(async (response) => {
          console.log("GET Request Response:", response.data);
          // Log the message returned by the endpoint
          console.log("Message:", response.data.message);
          // Handle the response data as needed
          if (response.data.message === "Access token updated successfully") {
            try {
              const response = await axiosInstance.post(
                `/view-crm-connection`,
                {
                  viewer_id: viewer_id,
                  connection_id: state,
                }
              );
              if (response.data.success) {
                console.log(
                  "CRM Connection details:",
                  response.data.connection
                );
                setConnectionDetails(response.data.connection);
                setAddConnectionsClicked(false);
                // Handle the retrieved CRM connection details as needed
              } else {
                console.error(
                  "Failed to retrieve CRM connection:",
                  response.data.message
                );
              }
            } catch (error) {
              console.error("Error retrieving CRM connection:", error);
              // Handle errors
            }
          }
        })
        .catch((error) => {
          console.error("Error making GET request:", error);
          // Handle errors
        });
    }
  }, [
    baseURL,
    connectionId,
    setAddConnectionsClicked,
    setConnectionDetails,
    viewer_id,
  ]);


  useEffect(() => {
    let loaded = 0;
    CRM_PROVIDERS.forEach((provider) => {
      const img = new window.Image();
      img.src = provider.logo;
      img.onload = img.onerror = () => {
        loaded += 1;
        if (loaded === CRM_PROVIDERS.length) {
          setAllImagesLoaded(true);
        }
      };
    });
  }, []);




  // Function to handle submission of step 1
  const handleStep1Submit = () => {
    setStep(2); // Move to next step
  };

  const handleStep2Submit = async () => {
    setStep(3); // Move to next step

    try {
      const url = `/create-crm-connection`;
      const requestBody = {
        viewer_id: viewer_id,
        name: connectionName,
        crm: selectedCRM,
        instance_type: selectedCRM === "Zoho" ? "production" : instanceType,
        is_primary: primary ? 1 : 0,
        external_url: instanceURL,
      };

      const response = await axiosInstance.post(url, requestBody);

      console.log("Response", response.data); // Logging response data

      if (
        response.data.message ===
        "Record created in crm_connection table successfully."
      ) {
        // Your code for authorization endpoint should go here
        const connectionID = response.data.connection[0].id;

        setConnectionId(connectionID); //storing connection id to use while fetching connection details

        const path = window.location.href;

        if (selectedCRM?.toLowerCase() == "salesforce") {
          // Make a GET request to /salesforce-authorisation
          const authResponse = await axiosInstance.get(
            "/salesforce-authorisation",
            {
              params: {
                crm_connection_id: connectionID,
                viewer_id: viewer_id,
                originURL: path,
              },
            }
          );
          const authData = await authResponse.data;

          if (authData.authUrl) {
            console.log("Authorization URL:", authData.authUrl);
            // Redirect user to the authorization URL
            window.location.href = authData.authUrl;
          } else {
            console.error("Failed to retrieve authorization URL");
            // Additional error handling logic
          }
        } else if (selectedCRM?.toLowerCase() == "zoho") {
          const requestBody = {
            crm_connection_id: connectionID,
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
              console.error("Failed to retrieve authorization URL");
              // Additional error handling logic
            }
          } catch (error) {
            console.error("Error during authorization:", error);
            // Handle error (e.g., show a toast notification or retry)
          }
        } else if (selectedCRM?.toLowerCase() == "hubspot") {
          const authResponse = await axiosInstance.post(
            "/hubspot-authorization",
            {
              crm_connection_id: connectionID,
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
              authResponse.data == "HubSpot data synchronized successfully."
            ) {
              // resolve("HubSpot data synchronized successfully.");
            } else {
              console.error("Failed to retrieve authorization URL");
            }
            // Additional error handling logic
          }
        }  else if (selectedCRM?.toLowerCase() == "pipedrive") {
          const authResponse = await axiosInstance.post(
            "/pipedrive-authorization",
            {
              crm_connection_id: connectionID,
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
              authResponse.data == "Pipedrive data synchronized successfully."
            ) {
              // resolve("HubSpot data synchronized successfully.");
            } else {
              console.error("Failed to retrieve authorization URL");
            }
            // Additional error handling logic
          }
        } else if (selectedCRM?.toLowerCase() === "dynamics 365") {
          const path = window.location.href;

          const authResponse = await axiosInstance.post(
            "/dynamics-authorization",
            {
              crm_connection_id: connectionID,
              viewer_id: viewer_id,
              originURL: path,
            }
          );

          const authData = authResponse.data;

          if (authData.authUrl) {
            console.log("Authorization URL:", authData.authUrl);
            // Redirect user to the authorization URL
            window.location.href = authData.authUrl;
          }
        }
      } else {
        console.error("Failed to create connection:", response.data.message);
        // Additional error handling logic
      }

      if (response.status === 200) {
        console.log(
          "Connection created successfully:",
          response.data.connection
        );
        // Additional logic if needed after successful connection creation
      } else {
        console.error("Failed to create connection:", response.data.message);
        // Additional error handling logic
      }
    } catch (error) {
      console.error("Error creating connection:", error);
      // Additional error handling logic
    }
    // Check if the query parameters contain the necessary data
    if (queryParameters.code && queryParameters.state) {
      // Make a new request using the query parameters
      console.log("Code:", queryParameters.code);
      console.log("State:", queryParameters.state);
      // Perform additional logic here based on the extracted parameters
    }
  };

  // Function to handle selection of CRM option
  const handleCRMOptionSelect = (crm) => {
    setSelectedCRM(crm);
  };

  const actions = () => {
    setAddConnectionsClicked(false);
  };
  const modalRef = useOutsideClick([actions]);

  // Render content based on the current step
  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CRM_PROVIDERS.map((crm) => (
                <button
                  key={crm.name}
                  onClick={() => handleCRMOptionSelect(crm.name)}
                  className={`flex items-center p-3 rounded-md border transition-all duration-200 ${
                    selectedCRM === crm.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <img
                    className="h-10 w-10 mr-3 object-contain"
                    src={crm.logo}
                    alt={crm.name}
                  />
                  <span className="text-base font-medium text-gray-900">
                    {crm.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex flex-col">
              <div>
                <label
                  htmlFor="connectionName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Connection Name
                </label>
                <input
                  id="connectionName"
                  type="text"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
                  onChange={(e) => setConnectionName(e.target.value)}
                />
              </div>
              {selectedCRM == "Dynamics 365" && (
                <div>
                  <label
                    htmlFor="instanceURL"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Instance URL
                  </label>
                  <input
                    id="instanceURL"
                    type="text"
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
                    onChange={(e) => setInstanceURL(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instance Type
              </label>
              {selectedCRM !== "Zoho" && (
                <div className="flex space-x-4">
                  {["Production", "Sandbox"].map((type) => (
                    <label key={type} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="instanceType"
                        value={type}
                        checked={instanceType === type} // Add checked property
                        onChange={() => setInstanceType(type)}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center">
              <input
                id="primary"
                type="checkbox"
                checked={primary} // Add checked property
                onChange={() => setPrimary((prev) => !prev)}
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
              />
              <label htmlFor="primary" className="ml-2 text-sm text-gray-700">
                Set as Primary Connection
              </label>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <InfinitySpin
              visible={true}
              width="80"
              color="#3B82F6"
              ariaLabel="infinity-spin-loading"
            />
            <p className="text-base font-medium text-gray-800">
              {selectedCRM
                ? `Connecting to ${selectedCRM}...`
                : "Finalizing connection..."}
            </p>
          </div>
        );
      default:
        return null;
    }
  };
  console.log(primary);
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 z-10"
      >
        <div className="p-5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {step === 1
              ? "Choose a CRM to connect"
              : step === 2
              ? `Configure ${selectedCRM} Connection`
              : "Establishing Connection"}
          </h2>
          {!allImagesLoaded ? (
            <div className="flex justify-center items-center h-40">
              <InfinitySpin
                visible={true}
                width="80"
                color="#3B82F6"
                ariaLabel="infinity-spin-loading"
              />

            </div>
          ) : (
            renderContent()
          )}
        </div>
        {step !== 3 && allImagesLoaded && (
          <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2 rounded-b-lg">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              onClick={() => setAddConnectionsClicked(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              onClick={step === 1 ? handleStep1Submit : handleStep2Submit}
            >
              {step === 1 ? "Next" : "Create Connection"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddConnectionDialog;
