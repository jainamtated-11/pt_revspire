import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import ActivateConnections from "./ActivateConnections.jsx";
import DeactivateConnections from "./DeactivateConnections.jsx";
import AddConnections from "./AddConnections.jsx";
import AllConnections from "./AllConnections.jsx";
import Authenticate from "./Authenticate.jsx";
import MakePrimary from "./MakePrimary.jsx";
import toast from "react-hot-toast";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import useCheckFrontendPermission from "../../../../Services/checkFrontendPermission.jsx";
import FilterModal from "../../../../utility/FilterModal.jsx";
import SearchBar from "../../../../utility/SearchBar.jsx";
import GlobalButton from "../../ContentManager/ContentTable/GlobalButton.jsx";
import Select from "react-select";
import { X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPersonArrowUpFromLine,
  faPersonArrowDownToLine,
} from "@fortawesome/free-solid-svg-icons";

import { fetchConnectionsAsync } from "../../../../features/connections/connectionsSlice.js";
import { useDispatch } from "react-redux";
import { fetchFilterDataAsync } from "../../../../features/filter/fliterSlice.js";

function CRUDConnections({
  onAction,
  fetchFilterCondition,
  groupByColumn,
  setGroupByColumn,
  groupByOptions,
  customStyles,
}) {
  const {
    selectedConnections,
    setAddConnectionsClicked,
    baseURL,
    viewer_id,
    setStep,
    connectionDetails,
    setRefDetails,
    setConnectionDetails,
    setShowConnectionButtons,
    setObjectDetails,
  } = useContext(GlobalContext);

  const dispatch = useDispatch();

  const [showFilter, setShowFilter] = useState(true); // show filter or not
  const [areAllActive, setAreAllActive] = useState(false);
  const [areAllInactive, setAreAllInactive] = useState(false);
  const [isActivatePopupVisible, setIsActivatePopupVisible] = useState(false);
  const [isDeactivatePopupVisible, setIsDeactivatePopupVisible] =
    useState(false);

  const axiosInstance = useAxiosInstance();
  const checkFrontendPermission = useCheckFrontendPermission();

  useEffect(() => {
    const checkConnectionStatus = () => {
      if (selectedConnections.length === 0) {
        setAreAllActive(false);
        setAreAllInactive(false);
        return;
      }
      let hasActive = false;
      let hasInactive = false;

      selectedConnections.forEach((connection) => {
        if (connection.active === 1) {
          hasActive = true;
        } else {
          hasInactive = true;
        }
      });

      // Only set areAllActive true if we have at least one active connection and no inactive ones
      setAreAllActive(hasActive && !hasInactive);
      // Only set areAllInactive true if we have at least one inactive connection and no active ones
      setAreAllInactive(hasInactive && !hasActive);
    };
    checkConnectionStatus();
  }, [selectedConnections]);

  const handleAddConnectionClick = () => {
    setStep(1);
    setAddConnectionsClicked(true);
    setShowFilter(false);
  };

  const handleActivateClick = () => {
    setIsActivatePopupVisible(true);
  };

  const handleDeactivateClick = () => {
    setIsDeactivatePopupVisible(true);
  };

  const handleRefetchConnections = () => {
    if (viewer_id && baseURL) {
      dispatch(fetchConnectionsAsync({ viewerId: viewer_id, baseURL }));
      console.log("refetching the filter conditions");
      fetchFilterCondition();
    } else {
      console.error("viewer_id or baseURL is undefined");
    }
  };

  const makePrimary = async () => {
    if (!viewer_id || !connectionDetails || !connectionDetails.id) {
      console.error("viewer_id and connectionDetails.id are required.");
      return;
    }

    try {
      console.log("id:", viewer_id);

      const response = await axiosInstance.post(`/make-primary`, {
        viewer_id: viewer_id,
        connection_id: connectionDetails.id,
      });

      const data = await response.data;

      if (response.status >= 200 && response.status < 300) {
        console.log(data.message);
        toast.success("Primary Connection Updated Successfully ");
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error making primary connection:", error);
    }
  };

  return (
    <div className="container w-full flex gap-4 items-center justify-between mx-auto  pt-5">
      {!connectionDetails ? (
        <div className="container relative flex justify-between">
          {selectedConnections.length === 0 &&
            checkFrontendPermission("Add Connections") == "1" && (
              <GlobalButton handleToggleDropdown={handleAddConnectionClick} />
            )}

          {/* Control Panel */}
          {selectedConnections.length > 0 &&
            (areAllActive || areAllInactive) && (
              <div className="flex flex-row gap-2 w-full sm:w-[20vw] md:w-[15vw] lg:w-[20vw] xl:w-[35vw] bg-white dark:bg-gray-600 rounded-md p-0.5 shadow-md">
                {/* Activate Button */}
                {areAllInactive &&
                  checkFrontendPermission("Activate/Deactivate Connections") ==
                    "1" && (
                    <button
                      type="button"
                      className="text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                      onClick={handleActivateClick}
                    >
                      <FontAwesomeIcon
                        icon={faPersonArrowUpFromLine}
                        className="mr-2"
                      />
                      Activate
                    </button>
                  )}

                {/* Deactivate Button */}
                {areAllActive &&
                  checkFrontendPermission("Activate/Deactivate Connections") ==
                    "1" && (
                    <button
                      type="button"
                      className="text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                      onClick={handleDeactivateClick}
                    >
                      <FontAwesomeIcon
                        icon={faPersonArrowDownToLine}
                        className="mr-2"
                      />
                      Deactivate
                    </button>
                  )}
              </div>
            )}
        </div>
      ) : (
        <div className="container relative flex flex-row">
          <AllConnections
            onClick={() => {
              setConnectionDetails(null);
              setShowConnectionButtons(true);
              setObjectDetails(null);
              setRefDetails(null);
            }}
          />
          {checkFrontendPermission("Edit Connections") == "1" && (
            <Authenticate />
          )}
          {connectionDetails.first_auth_success === 1 &&
            !areAllInactive &&
            checkFrontendPermission("Edit Connections") == "1" && (
              <>
                {console.log("connection details here ", connectionDetails)}
                {connectionDetails.is_primary !== 1 &&
                  connectionDetails.active !== 0 && (
                    <MakePrimary onClick={makePrimary} />
                  )}
              </>
            )}
        </div>
      )}

      {/* group by element */}
      <div className="flex items-center">
        <div className="w-[30px] flex-1">
          {groupByColumn && (
            <button
              onClick={() => setGroupByColumn(null)}
              className="ml-2 p-1 rounded-full hover:bg-gray-200"
              title="Clear grouping"
            >
              <X size={16} className="mr-2" />
            </button>
          )}
        </div>
        <Select
          value={groupByOptions?.find(
            (option) => option.value === groupByColumn
          )}
          onChange={(option) => setGroupByColumn(option.value)}
          options={groupByOptions}
          placeholder="Group by..."
          styles={customStyles}
        />
      </div>

      {/* search bar */}
      <div className="min-w-[200px]">
        <SearchBar applySearch={"connections"} />
      </div>

      {/* filter modal */}
      <div className="py-2">
        {showFilter && <FilterModal queryTable="crm_connection" />}
      </div>

      {/* Activate Modal */}
      {isActivatePopupVisible && (
        <ActivateConnections
          selectedConnections={selectedConnections}
          viewer_id={viewer_id}
          connectionDetails={connectionDetails}
          onAction={onAction}
          onActivateSuccess={handleRefetchConnections}
          isPopupVisible={isActivatePopupVisible}
          setIsPopupVisible={setIsActivatePopupVisible}
        />
      )}

      {/* Deactivate Modal */}
      {isDeactivatePopupVisible && (
        <DeactivateConnections
          selectedConnections={selectedConnections}
          viewer_id={viewer_id}
          onAction={onAction}
          connectionDetails={connectionDetails}
          onDeactivateSuccess={handleRefetchConnections}
          isPopupVisible={isDeactivatePopupVisible}
          setIsPopupVisible={setIsDeactivatePopupVisible}
        />
      )}
    </div>
  );
}

export default CRUDConnections;
