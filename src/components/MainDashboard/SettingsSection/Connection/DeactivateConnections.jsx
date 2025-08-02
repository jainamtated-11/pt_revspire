import React, { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonArrowDownToLine } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { LuLoaderCircle } from "react-icons/lu";

function DeactivateConnections({
  connectionDetails,
  selectedConnections,
  viewer_id,
  onAction,
  onDeactivateSuccess,
  isPopupVisible,
  setIsPopupVisible
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [loader, setLoader] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false); // New state to trigger refresh

  const { setConnections, setSelectedConnections } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const handleDeactivateClick = () => {
    setIsPopupVisible(true);
  };

  const handleCancel = () => {
    setIsPopupVisible(false);
  };

  // Add useEffect to handle data refresh
  useEffect(() => {
    console.log("fetcin conenctions");
    const fetchConnections = async () => {
      try {
        const response = await axiosInstance.post(`/view-all-crm-connections`, {
          viewer_id: viewer_id,
        });

        if (response.data.success) {
          const transformedConnections = response.data.connections.map(
            (connection) => ({
              ...connection,
              "Created At": connection.created_at || "N/A",
              "Created By": connection.created_by || "N/A",
              "Updated By": connection.updated_by || "N/A",
              "Updated At": connection.updated_at || "NA",
              "Is Primary": connection.is_primary,
            })
          );
          setConnections(transformedConnections);
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
        toast.error("Failed to refresh connections list");
      }
    };

    if (refreshTrigger) {
      fetchConnections();
      setRefreshTrigger(false); // Reset the trigger
    }
  }, [refreshTrigger, viewer_id, connectionDetails]);

  const handleConfirmDeactivate = async () => {
    setIsDisable(true);
    setLoader(true);
    try {
      const data = selectedConnections;

      for (const item of data) {
        try {
          const response = await axiosInstance.post("/edit-crm-connection", {
            connection_id: item.id,
            viewer_id: viewer_id,
            active: 0,
          });

          if (response.status === 200) {
            toast.success("Connection Deactivated Successfully");
            onAction();
          } else {
            toast.error("Failed to deactivate connection.");
          }
        } catch (error) {
          console.error(`Error in POST request for ID: ${item.id}`, error);
          toast.error("An error occurred while deactivating the connection.");
        }
      }

      onDeactivateSuccess(); //refetchconnections and apply filter
      setRefreshTrigger(true);
      setSelectedConnections([]);
      setIsPopupVisible(false);
    } catch (error) {
      console.error("Error deactivating connections:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoader(false);
      setIsDisable(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Are you sure?
            </h2>
          </div>
          <p className="mb-8 text-lg text-gray-600">
            Deactivating a connection will remove all the objects and ref
            fields related to it.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              className="px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="px-6 py-3 text-base font-medium w-[100px] text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirmDeactivate}
              disabled={isDisable}
            >
              {loader ? (
                <>
                <div className="flex items-center justify-center">
                  <LuLoaderCircle className="animate-spin" />
                </div>
                </>
              ) : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeactivateConnections;
