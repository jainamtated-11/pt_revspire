import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonArrowUpFromLine } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { LuLoaderCircle } from "react-icons/lu";

function ActivateConnections({
  connectionDetails,
  selectedConnections,
  viewer_id,
  onAction,
  onActivateSuccess,
  isPopupVisible,
  setIsPopupVisible
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [loader, setLoader] = useState(false);

  const { setConnections, setSelectedConnections } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const handleActivateClick = () => {
    setIsPopupVisible(true);
  };

  const handleCancel = () => {
    setIsPopupVisible(false);
  };

  const fetchConnections = async () => {
    // ... (keep the existing fetchConnections logic)
  };

  const handleConfirmActivate = async () => {
    setIsDisable(true);
    setLoader(true);
    try {
      const data = selectedConnections;

      for (const item of data) {
        try {
          const response = await axiosInstance.post("/edit-crm-connection", {
            connection_id: item.id,
            viewer_id: viewer_id,
            active: 1,
          });

          if (response.status === 200) {
            toast.success("Connection Activated Successfully");
          } else {
            toast.error("Failed to activate connection.");
          }
        } catch (error) {
          console.error(`Error in POST request for ID: ${item.id}`, error);
          toast.error("An error occurred while activating the connection.");
        }
      }

      await onActivateSuccess(); //fetch connections and apply filter
      setSelectedConnections([]);
      setIsPopupVisible(false);
    } catch (error) {
      console.error("Error activating connections:", error);
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
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Are you sure?
            </h2>
          </div>
          <p className="mb-8 text-lg text-gray-600">
            Activating a connection will enable all the objects and ref
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
              className="px-6 py-3 text-base w-[100px] font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirmActivate}
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

export default ActivateConnections;
