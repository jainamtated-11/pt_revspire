import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import AddPitchStreamPopUp from "./AddPitchStreamPopUp.jsx";
import EditPitchStreamPopUp from "./EditPitchStreamPopUp.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import FilterModal from "../../../utility/FilterModal.jsx";
import { CRUDButton } from "../../../utility/CustomComponents/index.js";
import { useSelector, useDispatch } from "react-redux";
import useCheckUserLicense from "../../../Services/checkUserLicense.jsx";
import useCheckFrontendPermission from "../../../Services/checkFrontendPermission.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  SetFilterLoading,
  SetFilterApplied,
  SetFilterAppliedOn,
} from "../../../features/filter/fliterSlice.js";
import SearchBar from "../../../utility/SearchBar.jsx";
import Select from "react-select";
import { X } from "lucide-react";
import { FaClone } from "react-icons/fa";
import { useCookies } from "react-cookie";
import { clearSelectedPitchStream, fetchPitchStreamsAsync } from "../../../features/pitchStreams/pitchStreamsSlice.js";

export default function PitchStreamCRUD({ 
  pitchStreamToEdit, 
  setPitchStreamToEdit,
  groupByColumn,
  setGroupByColumn,
  groupByOptions,
  customStyles
}) {
  const { baseURL, viewer_id, TableNameHandler, globalOrgId } =
    useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;
  
  const checkFrontendPermission = useCheckFrontendPermission();
  const checkUserLicense = useCheckUserLicense();
  const selectedPitchStreams = useSelector(
    (state) => state.pitchStreams.selectedPitchStreams
  );
  const [isDiasble, setIsDisable] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [newPitchStreamName, setNewPitchStreamName] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log("selectedPitchStreams", selectedPitchStreams);

  const openCloneModal = () => {
    if (selectedPitchStreams.length === 1) {
      const selectedPitchStreamName = selectedPitchStreams[0].name;
      setNewPitchStreamName(`Copy of ${selectedPitchStreamName}`);
      setShowCloneModal(true);
    }
  };

  const closeCloneModal = () => {
    setShowCloneModal(false);
    dispatch(clearSelectedPitchStream());
  };



 
  const handleClone = async () => {
    if (!newPitchStreamName.trim()) {
      toast.error("New name cannot be empty");
      return;
    }

    try {
      setIsDisable(true);
      const pitchStreamId = selectedPitchStreams[0].id;
      
      // Call your clone API here
      const response = await axiosInstance.post(`/clone-pitch`, {
        pitch_id: pitchStreamId,
        new_name: newPitchStreamName,
        viewer_id: viewer_id,
        organisation_id: organisation_id
      });
      
      console.log("Clone response:", response.data);
      
      if (response.data.success) {
        toast.success(response.data.message || "Pitch Stream cloned successfully");
        
        // Clear selected pitch stream
        dispatch(clearSelectedPitchStream());
        
        // Refetch pitch streams
       
          dispatch(
            fetchPitchStreamsAsync({
              sortColumn: "name",
              sortOrder: "ASC",
              viewer_id: viewer_id,
              baseURL: baseURL,
              organisation_id,
            }));
      } else {
        toast.error(response.data.message || "Failed to clone pitch stream");
      }
    } catch (error) {
      console.error("Error cloning pitch stream:", error);
      toast.error(error.response?.data?.message || "Failed to clone pitch stream");
    } finally {
      setIsDisable(false);
      setShowCloneModal(false);
      
    }
  }

  return (
    <div className="container w-full flex gap-4 items-center justify-between mx-auto px-4 pt-7">
      <div className=" overflow-x-auto h-full  rounded-md bg-white shadow-md  scroll-none items-center">
        <div className="flex  justify-between ">
          <div className="flex space-x-1 transition-all">
            {checkFrontendPermission("Create Pitch Stream") === "1" &&
              Object.keys(selectedPitchStreams).length === 0 && (
                <div className="transition-all mt-[1px] ">
                  <AddPitchStreamPopUp />
                </div>
              )}
          </div>
        </div>
        <div
          className={`flex flex-row   ${
            selectedPitchStreams.length == 1
              ? " bg-white dark:bg-gray-600 rounded-md shadow-md w-[60vw] content-center items-center"
              : ""
          }`}
        >
          {checkFrontendPermission("Edit Pitch Stream") === "1" && selectedPitchStreams.length === 1 && (
            <div className="transition-all">
              <EditPitchStreamPopUp />
            </div>
          )}

          {checkFrontendPermission("Create Pitch Stream;  Edit Pitch Stream") === "1" && selectedPitchStreams.length === 1 && (
            <div className="flex items-center">
              <button
                className="flex items-center justify-center text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
                onClick={openCloneModal}
              >
                <FaClone className="mr-2" />
                Clone
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row flex-nowrap space-x-2">
       

        {/* group by element */}
        <div className="flex items-center">
         <div className="w-[30px] flex-1">
         {groupByColumn && (
            <button
              onClick={() => setGroupByColumn(null)}
              className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 mr-1"
              title="Clear grouping"
            >
              <X size={16} />
            </button>
          )}
         </div>
          <Select
            placeholder="Group by..."
            options={groupByOptions}
            value={
              groupByColumn
                ? {
                    value: groupByColumn,
                    label: groupByOptions.find(option => option.value === groupByColumn)?.label || groupByColumn,
                    isCustom: groupByOptions.some(option => option.value === groupByColumn && option.isCustom),
                  }
                : null
            }
            onChange={(selected) => setGroupByColumn(selected?.value || null)}
            styles={customStyles}
             className="min-w-[200px] text-sm"
          />
        </div>

        {/* search element */}
        <div className="w-[200px] mt-0.5">
        <SearchBar applySearch="pitch" />
        </div>


        {/* <FilterModal queryTable="pitchStream" />   */}
        {/* pass in the correct query table name for the pitchStream , included now for consistency */}
      </div>

      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Clone Pitch Stream</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Name</label>
              <input
                type="text"
                value={newPitchStreamName}
                onChange={(e) => setNewPitchStreamName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new name"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-10">
              <button
                type="button"
                className="px-6 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                onClick={closeCloneModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`px-6 py-2 w-[101px] h-[38px] flex justify-center items-center text-sm btn-secondary text-white  rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={handleClone}
                disabled={isDiasble}
              >
              Clone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
