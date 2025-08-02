import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { fetchGroupsAsync } from "../../../features/group/groupSlice.js";
import { useDispatch } from "react-redux";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import FilterModal from "../../../utility/FilterModal.jsx";
import SearchBar from "../../../utility/SearchBar.jsx";
import EditGroup from "./EditGroup.jsx";
import { UnselectAllGroup } from "../../../features/group/groupSlice.js";
import Select from "react-select";
import { X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPersonArrowUpFromLine, faPersonArrowDownToLine } from "@fortawesome/free-solid-svg-icons";
import AddGroup from "./AddGroup.jsx";

function CRUDGroup({ groupByColumn, setGroupByColumn, groupByOptions, customStyles }) {
  const { viewer_id, baseURL, globalOrgId } = useContext(GlobalContext);
  const selectedGroups = useSelector((state) => state.groups.selectedGroups);
  const axiosInstance = useAxiosInstance();
  const [areAllActive, setAreAllActive] = useState(false);
  const [areAllInactive, setAreAllInactive] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    checkGroupStatus();
    storeSelectedGroupIds();
  }, [selectedGroups]);

  const checkGroupStatus = () => {
    if (selectedGroups.length === 0) {
      setAreAllActive(false);
      setAreAllInactive(false);
      return;
    }

    let allActive = true;
    let allInactive = true;

    selectedGroups.forEach((group) => {
      if (group.is_active === 1) {
        allInactive = false;
      } else {
        allActive = false;
      }
    });

    setAreAllActive(allActive);
    setAreAllInactive(allInactive);
  };

  const storeSelectedGroupIds = () => {
    const groupId = selectedGroups.map((Group) => Group.id);
    setSelectedGroupIds(groupId);
  };

  const handleDeactivateGroups = async () => {
    setIsDeactivating(true);
    try {
      const response = await axiosInstance.post(
        `/groups/deactivate-user-group`,
        {
          id: selectedGroupIds,
          viewer_id: viewer_id,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Groups Deactivated Successfully!");
        dispatch(
          fetchGroupsAsync({
            viewer_id,
            baseURL: baseURL,
            organisation_id: globalOrgId,
          })
        );
        dispatch(UnselectAllGroup());
        setSelectedGroupIds([]);
      } else {
        toast.error("Error Deactivating!");
      }
    } catch (error) {
      console.error("Error deactivating Groups:", error);
      toast.error("Error Deactivating!");
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleActivateGroups = async () => {
    setIsActivating(true);
    try {
      const response = await axiosInstance.post(`/groups/activate-user-group`, {
        id: selectedGroupIds,
        viewer_id: viewer_id,
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success("Groups Activated Successfully!");
        dispatch(
          fetchGroupsAsync({
            viewer_id,
            baseURL: baseURL,
            organisation_id: globalOrgId,
          })
        );
        dispatch(UnselectAllGroup());
        setSelectedGroupIds([]);
      } else {
        toast.error("Error Activating!");
      }
    } catch (error) {
      console.error("Error activating Groups:", error);
      toast.error("Error Activating!");
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <>
      <div className="flex justify-between mx-auto">
        <div className="flex justify-between items-start">
          {selectedGroups.length === 0 && (
            <div>
              <AddGroup />
            </div>
          )}

          <div className="flex">
            <div
              className={`flex flex-row items-center border-solid gap-3 h-[40px] mt-1 ${
                selectedGroups.length > 0
                  ? "bg-white dark:bg-gray-600 rounded-md shadow-md w-[30vw] pl-2"
                  : ""
              }`}
            >
              {selectedGroups.length === 1 && (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="text-secondary flex flex-nowrap justify-center items-center text-[14px] mt-2 pt-1 pb-1 pl-4 pr-4 mr-2 mb-2 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Edit
                </button>
              )}
              {areAllInactive && (
                <button
                  onClick={handleActivateGroups}
                  disabled={isActivating}
                  className={`text-sky-800 text-[14px] pt-1 pb-1 pl-3 pr-3 mr-3 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 ${
                    isActivating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isActivating ? (
                    <span className="flex items-center">
                      Activating <div className="animate-spin ml-1">..</div>
                    </span>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPersonArrowUpFromLine} className="mr-2" />
                      Activate
                    </>
                  )}
                </button>
              )}
              {areAllActive && (
                <button
                  onClick={handleDeactivateGroups}
                  disabled={isDeactivating}
                  className="text-secondary flex flex-nowrap justify-center items-center text-[14px] mt-2 pt-1 pb-1 pl-4 pr-4 mr-2 mb-2 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                >
                  {isDeactivating ? (
                    <span className="flex items-center">
                      Deactivating <div className="animate-spin ml-1">...</div>
                    </span>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPersonArrowDownToLine} className="mr-2" />
                      Deactivate
                    </>
                  )}
                </button>
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

          <div className="w-[200px]">
            <SearchBar applySearch={"group"} />
          </div>

          <FilterModal queryTable="group" />
        </div>
      </div>

      <EditGroup isOpen={isEditOpen} setIsOpen={setIsEditOpen} />
    </>
  );
}

export default CRUDGroup;
