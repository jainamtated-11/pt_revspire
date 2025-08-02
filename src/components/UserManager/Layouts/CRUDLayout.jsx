import React, { useContext, useState, useEffect } from "react";
import ActivateLayout from "./ActivateLayout.jsx";
import AddLayout from "./AddLayout.jsx";
import DeactivateLayout from "./DeactivateLayout.jsx";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { 
  fetchLayoutsAsync, 
  clearSelectedLayout
} from "../../../features/layout/layoutSlice";
import { useDispatch } from "react-redux";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import FilterModal from "../../../utility/FilterModal.jsx";
import SearchBar from "../../../utility/SearchBar.jsx";
import Select from "react-select";
import { X } from "lucide-react";
import EditLayout from "./EditLayout.jsx";

function CRUDLayout({ groupByColumn, setGroupByColumn, groupByOptions, customStyles }) {
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const selectedLayouts = useSelector((state) => state.layouts.selectedLayouts);
  const axiosInstance = useAxiosInstance();
  const [areAllActive, setAreAllActive] = useState(false);
  const [areAllInactive, setAreAllInactive] = useState(false);
  const [selectedLayoutIds, setSelectedLayoutIds] = useState([]);

  const storeSelectedLayoutIds = () => {
    const layoutId = selectedLayouts.map((Layout) => Layout.id);
    setSelectedLayoutIds(layoutId);
  };

  const dispatch = useDispatch();

  useEffect(() => {
    checkLayoutStatus();
    storeSelectedLayoutIds();
  }, [selectedLayouts]);

  const checkLayoutStatus = () => {
    if (selectedLayouts.length === 0) {
      setAreAllActive(false);
      setAreAllInactive(false);
      return;
    }

    let allActive = true;
    let allInactive = true;

    selectedLayouts.forEach((Layout) => {
      if (Layout.active !== 1) {
        allActive = false;
      } else {
        allInactive = false;
      }
    });

    setAreAllActive(allActive);
    setAreAllInactive(allInactive);
  };

  const handleDeactivateLayouts = async () => {
    try {
      const response = await axiosInstance.post(`/deactivate-pitch-layout`, {
        layoutIds: selectedLayoutIds,
        viewer_id: viewer_id,
      });

      const data = response.data;
      if (response.status >= 200 && response.status < 300) {
        if (data.skipped?.length > 0) {
          toast.success("Some layouts deactivated. Standard layouts cannot be deactivated.");
        } else {
          toast.success(`${data.deactivated?.length}`+" Layouts deactivated successfully!");
        }
        dispatch(fetchLayoutsAsync({ viewer_id, baseURL: baseURL }));
        dispatch(clearSelectedLayout());
      } else {
        toast.error("Error deactivating layouts");
      }
    } catch (error) {
      console.error("Error deactivating Layouts:", error);
      toast.error("Error deactivating layouts");
    }
  };

  const handleActivateLayouts = async () => {
    try {
      const response = await axiosInstance.post(`/activate-pitch-layout`, {
        layoutIds: selectedLayoutIds,
        viewer_id: viewer_id,
      });

      const data = response.data;
      if (response.status >= 200 && response.status < 300) {
        if (data.skipped?.length > 0) {
          toast.success("Some layouts activated. Others were skipped.");
        } else {
          toast.success(`${data.activated?.length}`+" Layouts activated successfully!");
        }
        dispatch(fetchLayoutsAsync({ viewer_id, baseURL: baseURL }));
        dispatch(clearSelectedLayout());
      } else {
        toast.error("Error activating layouts");
      }
    } catch (error) {
      console.error("Error activating Layouts:", error);
      toast.error("Error activating layouts");
    }
  };

  return (
    <>
      <div className="flex justify-between mx-auto">
        <div className="flex justify-between items-start">
          {selectedLayouts.length === 0 && (
            <div>
              <AddLayout />
            </div>
          )}

          <div className="flex">
            <div
              className={`flex flex-row items-center border-solid h-[40px] mt-1 ${
                selectedLayouts.length > 0
                  ? "bg-white dark:bg-gray-600 rounded-md shadow-md w-[40vw] pl-2 "
                  : ""
              }`}
            >
              {selectedLayouts.length === 1 && (
                <div>
                  <EditLayout
                    layoutId={selectedLayouts[0].id}
                    layoutName={selectedLayouts[0].name}
                  />
                </div>
              )}
              {areAllInactive && (
                <div>
                  <ActivateLayout onClick={handleActivateLayouts} />
                </div>
              )}
              {areAllActive && (
                <div>
                  <DeactivateLayout onClick={handleDeactivateLayouts} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-row flex-nowrap space-x-2 my-2">
          <div className="flex items-center">
            <div className="w-[30px] flex-1">
              {groupByColumn && (
                <button
                  onClick={() => setGroupByColumn(null)}
                  className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 mr-1 text-sm"
                  title="Clear grouping"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Select
              value={groupByOptions.find(option => option.value === groupByColumn)}
              onChange={(option) => setGroupByColumn(option?.value || null)}
              options={groupByOptions}
              styles={customStyles}
              placeholder="Group by..."
              className="min-w-[200px] text-sm"
            />
          </div>
          <SearchBar applySearch={"pitch_layout"} />
          <FilterModal queryTable="pitch_layout" />
        </div>
      </div>
    </>
  );
}

export default CRUDLayout;
