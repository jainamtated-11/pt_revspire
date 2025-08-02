import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { InfinitySpin } from "react-loader-spinner";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";

function AddConnectionDialog({
  onClose,
  defaultConnectionName,
  defaultInstanceType,
  extraParam = "", // New optional prop
  tittle,
}) {
  const {
    setConnectionDetails,
    setAddConnectionsClicked,
    viewer_id,
    selectedOrganisationId,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const [selectedCRM, setSelectedCRM] = useState("Zoho");
  const [connectionName, setConnectionName] = useState(defaultConnectionName);
  const [instanceType, setInstanceType] = useState(defaultInstanceType);
  const [primary, setPrimary] = useState(false);
  const [connectionId, setConnectionId] = useState("");
  const [step, setStep] = useState(2);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleStep2Submit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleStep2Submit = async () => {
    setStep(3);

    try {
      const url = `/create-crm-connection`;
      const requestBody = {
        viewer_id: viewer_id,
        name: connectionName,
        crm: selectedCRM,
        instance_type: instanceType,
        is_primary: primary ? 1 : 0,
        service_user: 1,
      };

      const response = await axiosInstance.post(url, requestBody);
      console.log("crm body: ", requestBody);

      if (
        response.data.message ===
        "Record created in crm_connection table successfully."
      ) {
        const connectionID = response.data.connection[0].id;
        setConnectionId(connectionID);

        const path = window.location.href;
        const encodedOriginURL = encodeURIComponent(
          `${path}|${selectedOrganisationId}${
            extraParam ? `|${extraParam}` : ""
          }`
        );

        console.log(
          `id: ${connectionID}, path: ${encodedOriginURL},viewer_id: ${viewer_id}`
        );

        const requestBody = {
          crm_connection_id: connectionID,
          viewer_id: viewer_id,
          originURL: encodedOriginURL,
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
      } else {
        console.error("Failed to create connection:", response.data.message);
      }
      console.log("connection is establishing...");
    } catch (error) {
      console.error("Error creating connection:", error);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 2:
        return (
          <>
            <div className="font-semibold pb-4">{tittle}</div>
            <div className="border border-gray-300 rounded-lg px-4 pt-3 mb-4">
              <div className="flex flex-row items-center gap-4 mb-4 z">
                <label className="w-46 text-sm font-bold">
                  Connection Name
                </label>
                <input
                  type="text"
                  value={connectionName}
                  className="border border-gray-400 rounded-md py-1 px-2 text-sm"
                  onChange={(e) => setConnectionName(e.target.value)}
                />
              </div>
              <div className="flex flex-col">
                <table>
                  <thead>
                    <tr>
                      <th className="w-16"></th>
                      <th className="ml-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <label
                          htmlFor="production"
                          className="text-sm font-bold mr-16"
                        >
                          Production
                        </label>
                      </td>
                      <td>
                        <input
                          type="radio"
                          id="production"
                          name="instanceType"
                          value="Production"
                          checked={instanceType === "Production"}
                          onChange={() => setInstanceType("Production")}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label
                          htmlFor="sandbox"
                          className="text-sm font-bold mr-16"
                        >
                          Sandbox
                        </label>
                      </td>
                      <td>
                        <input
                          type="radio"
                          id="sandbox"
                          name="instanceType"
                          value="Sandbox"
                          onChange={() => setInstanceType("Sandbox")}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-12 mb-2 flex justify-center items-center gap-4 ">
                  <table>
                    <tr>
                      <td className="">
                        <label
                          htmlFor="primary"
                          className="text-sm font-semibold mr-4"
                        >
                          Primary
                        </label>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          id="primary"
                          name="primary"
                          disabled
                          onChange={() =>
                            setPrimary((prevPrimary) => !prevPrimary)
                          }
                        />
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center gap-4">
              <button
                className="flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid border-red-500 bg-red-300 text-red-800"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid border-gray-400 bg-white text-gray-800"
                onClick={handleStep2Submit}
              >
                Create
              </button>
            </div>
          </>
        );
      case 3:
        return (
          <div>
            <div className="fixed inset-0 flex items-center justify-center z-10">
              <div className="absolute inset-0 bg-gray-800 opacity-50 z-10"></div>
              <div className="bg-white px-24 py-8 rounded-md z-10 w-auto">
                <InfinitySpin
                  visible={true}
                  width="200"
                  color="#075985"
                  ariaLabel="infinity-spin-loading"
                />
                <div className="font-bold pb-4">
                  Connecting to {selectedCRM}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
          <div className="bg-white p-6 rounded-md z-10 w-auto">
            <div>{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddConnectionDialog;
