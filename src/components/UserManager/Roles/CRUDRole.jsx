import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { fetchRolesAsync } from "../../../features/role/roleSlice.js";
import { useDispatch } from "react-redux";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import FilterModal from "../../../utility/FilterModal.jsx";
import SearchBar from "../../../utility/SearchBar.jsx";
import AddRole from "./AddRole.jsx";
import EditRole from "./EditRole.jsx";
import { UnselectAllRole } from "../../../features/role/roleSlice.js";
import ActivateRole from "./ActivateRole.jsx";
import DeactivateRole from "./DeactivateRole.jsx";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTable, faSitemap } from "@fortawesome/free-solid-svg-icons";

function CRUDRole({ viewMode, setViewMode }) {
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const selectedRoles = useSelector((state) => state.roles.selectedRoles);
  const axiosInstance = useAxiosInstance();
  const [areAllActive, setAreAllActive] = useState(false);
  const [areAllInactive, setAreAllInactive] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    checkRoleStatus();
  }, [selectedRoles]);

  const checkRoleStatus = () => {
    if (selectedRoles.length === 0) {
      setAreAllActive(false);
      setAreAllInactive(false);
      return;
    }

    let allActive = true;
    let allInactive = true;

    selectedRoles.forEach((Role) => {
      if (Role.active !== 1) {
        allActive = false;
      } else {
        allInactive = false;
      }
    });

    setAreAllActive(allActive);
    setAreAllInactive(allInactive);
  };

  const handleDeactivateRoles = async () => {
    try {
      const response = await axiosInstance.post(
        `/user-role/deactivate-role`,
        {
          role_ids: selectedRoles.map(role => role.id),
          viewer_id: viewer_id,
          organisation_id: organisation_id,
        }
      );

      if (response.data.results[0].status === "success") {
        toast.success("Roles Deactivated Successfully!");
        dispatch(
          fetchRolesAsync({
            viewer_id,
            baseURL: baseURL,
            organisation_id: organisation_id,
          })
        );
        dispatch(UnselectAllRole());
      } else {
        const errorResult = response.data.results[0];
        if (errorResult.message === "Role has assigned users") {
          toast.error("Cannot deactivate role with assigned users");
        } else {
          toast.error(errorResult.message);
        }
      }
    } catch (error) {
      console.error("Error deactivating Roles:", error);
      toast.error("Error Deactivating!");
    }
  };

  const handleActivateRoles = async () => {
    try {
      const response = await axiosInstance.post(`/user-role/activate-role`, {
        role_ids: selectedRoles.map(role => role.id),
        viewer_id: viewer_id,
        organisation_id: organisation_id,
      });

      if (response.data.results[0].status === "success") {
        toast.success("Roles Activated Successfully!");
        dispatch(
          fetchRolesAsync({
            viewer_id,
            baseURL: baseURL,
            organisation_id: organisation_id,
          })
        );
        dispatch(UnselectAllRole());
      } else {
        toast.error(response.data.results[0].message);
      }
    } catch (error) {
      console.error("Error activating Roles:", error);
      toast.error("Error Activating!");
    }
  };

  return (
    <>
      <div className="flex justify-between mx-auto">
        <div className="flex justify-between items-start">
          {selectedRoles.length === 0 && (
            <div>
              <AddRole />
            </div>
          )}

          <div className="flex">
            <div
              className={`flex flex-row items-center border-solid gap-3 h-[40px] mt-1 ${
                selectedRoles.length > 0
                  ? "bg-white dark:bg-gray-600 rounded-md shadow-md w-[40vw] pl-2 "
                  : ""
              }`}
            >
              {selectedRoles.length === 1 && (
                <div>
                  <EditRole />
                </div>
              )}
              {areAllInactive && (
                <div>
                  <ActivateRole onClick={handleActivateRoles} />
                </div>
              )}
              {areAllActive && (
                <div>
                  <DeactivateRole onClick={handleDeactivateRoles} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-row flex-nowrap space-x-2 my-2 items-center">
          <SearchBar applySearch={"role"} />
          <button
            onClick={() => setViewMode(viewMode === 'tree' ? 'table' : 'tree')}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <FontAwesomeIcon 
              icon={viewMode === 'tree' ? faSitemap : faTable} 
              className="text-gray-700 text-md p-2 h-5 w-5 px-4 "
            />
          </button>
          <FilterModal queryTable="role" />
        </div>
      </div>
    </>
  );
}

export default CRUDRole; 