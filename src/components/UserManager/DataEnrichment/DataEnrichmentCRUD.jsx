import React, { useEffect, useState, useContext } from "react";
import GlobalAddButton from "../../../utility/CustomComponents/GlobalAddButton.jsx";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {
  activateProviderAsync,
  deactivateProviderAsync,
  makePrimaryProviderAsync,
  fetchProvidersAsync,
} from "../../../features/dataEnrichment/dataEnrichmentSlice";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPersonArrowUpFromLine,
  faPersonArrowDownToLine,
  faCircleUp,
} from "@fortawesome/free-solid-svg-icons";

function DataEnrichmentCRUD({ selectedItems, setSelectedItems, setAddDialog }) {
  const dispatch = useDispatch();
  const { baseURL, viewer_id } = useContext(GlobalContext);
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const [areAllActive, setAreAllActive] = useState(false);
  const [areAllInactive, setAreAllInactive] = useState(false);

  useEffect(() => {
    if (selectedItems.length === 0) {
      setAreAllActive(false);
      setAreAllInactive(false);
      return;
    }
    let allActive = true;
    let allInactive = true;
    selectedItems.forEach((item) => {
      if (!item.active) allActive = false;
      else allInactive = false;
    });
    setAreAllActive(allActive);
    setAreAllInactive(allInactive);
  }, [selectedItems]);

  const handleActivate = async () => {
    try {
      let allSuccess = true;
      for (const item of selectedItems) {
        const result = await dispatch(activateProviderAsync({
          baseURL,
          viewer_id,
          organisation_id,
          id: item.id,
        })).unwrap();
        if (!result.success) allSuccess = false;
      }
      if (allSuccess) {
        toast.success("Providers activated!");
      } else {
        toast.error("Some providers could not be activated.");
      }
      setSelectedItems([]);
      dispatch(fetchProvidersAsync({ baseURL, viewer_id, organisation_id }));
    } catch (err) {
      toast.error(err?.message || "Failed to activate providers");
    }
  };

  const handleDeactivate = async () => {
    try {
      let allSuccess = true;
      for (const item of selectedItems) {
        const result = await dispatch(deactivateProviderAsync({
          baseURL,
          viewer_id,
          organisation_id,
          id: item.id,
        })).unwrap();
        if (!result.success) allSuccess = false;
      }
      if (allSuccess) {
        toast.success("Providers deactivated!");
      } else {
        toast.error("Some providers could not be deactivated.");
      }
      setSelectedItems([]);
      dispatch(fetchProvidersAsync({ baseURL, viewer_id, organisation_id }));
    } catch (err) {
      toast.error(err?.message || "Failed to deactivate providers");
    }
  };

  const handleMakePrimary = async () => {
    if (selectedItems.length !== 1) return;
    try {
      const item = selectedItems[0];
      const result = await dispatch(makePrimaryProviderAsync({
        baseURL,
        viewer_id,
        organisation_id,
        id: item.id,
      })).unwrap();
      if (result.success) {
        toast.success(result.message || "Provider set as primary!");
      } else {
        toast.error(result.message || "Failed to set provider as primary");
      }
      setSelectedItems([]);
      dispatch(fetchProvidersAsync({ baseURL, viewer_id, organisation_id }));
    } catch (err) {
      toast.error(err?.message || "Failed to set provider as primary");
    }
  };

  return (
    <div className="container w-full flex gap-4 items-center justify-between mx-auto ">
      <div className="container relative flex justify-between">
        {selectedItems.length === 0 ? (
          <GlobalAddButton onClick={() => setAddDialog(true)} />
        ) : (
          <div
            className={`flex flex-row ${
              selectedItems.length > 0
                ? " dark:bg-gray-600 rounded-md w-full"
                : ""
            }`}
          >
            <div className="overflow-x-auto pl-2 h-full rounded-md bg-white shadow-md scroll-none items-center flex flex-row">
              {selectedItems.length >= 1 && areAllInactive && (
                <div className="transition-all mb-0">
                  <button
                    className="text-secondary flex flex-nowrap justify-center items-center text-[14px] pt-1 pb-1 pl-4 pr-4 mt-1 mb-1 ml-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                    onClick={handleActivate}
                  >
                    <FontAwesomeIcon
                      icon={faPersonArrowUpFromLine}
                      className="mr-2"
                    />
                    Activate
                  </button>
                </div>
              )}
              {selectedItems.length >= 1 && areAllActive && (
                <div>
                  <button
                    className="text-secondary flex flex-nowrap justify-center items-center text-[14px] pt-1 pb-1 pl-4 pr-4 mt-1 mb-1 ml-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                    onClick={handleDeactivate}
                  >
                    <FontAwesomeIcon
                      icon={faPersonArrowDownToLine}
                      className="mr-2"
                    />
                    Deactivate
                  </button>
                </div>
              )}
              {selectedItems.length === 1 && !selectedItems[0].is_primary && (
                <div>
                  <button
                    type="button"
                    className="text-secondary flex flex-nowrap justify-center items-center text-[14px] pt-1 pb-1 pl-4 pr-4 mt-1 mb-1 ml-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                    onClick={handleMakePrimary}
                  >
                    <FontAwesomeIcon icon={faCircleUp} className="mr-2" />
                    Make Primary
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataEnrichmentCRUD;