import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import AddPitchPopUPV2 from "./AddPitchV2/AddPitchPopUPV2.jsx";
import EditPitchPupUpV2 from "./EditPitchV2/EditPitchPopUpV2.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import FilterModal from "../../../utility/FilterModal.jsx";
import { CRUDButton } from "../../../utility/CustomComponents/index.js";
import { useSelector, useDispatch } from "react-redux";
import useCheckUserLicense from "../../../Services/checkUserLicense.jsx";
import { FaUserFriends } from "react-icons/fa";
import {
  clearSelectedPitch,
  fetchPitchesAsync,
} from "../../../features/pitch/pitchSlice.js";
import { setIsOpen } from "../../../features/pitch/editPitchSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faTag,
  faFileCircleCheck,
  faFileCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
// import toast from "react-hot-toast";
import useCheckFrontendPermission from "../../../Services/checkFrontendPermission.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  SetFilterLoading,
  SetFilterApplied,
  SetFilterAppliedOn,
  fetchFilterDataAsync,
} from "../../../features/filter/fliterSlice.js";
import { useCookies } from "react-cookie";
import SearchBar from "../../../utility/SearchBar.jsx";
import MailDropdown from "../ContentManager/Operations/MailDropdown.jsx";
import Select from "react-select";
import { X } from "lucide-react";
import { FaClone } from "react-icons/fa";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

export default function PitchCRUD({
  pitchToEdit,
  setPitchToEdit,
  groupByColumn,
  setGroupByColumn,
  groupByOptions,
  customStyles,
}) {
  const { baseURL, viewer_id, TableNameHandler } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const checkFrontendPermission = useCheckFrontendPermission();
  const pitchState = useSelector((state) => state.editPitchSlice);
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  const checkUserLicense = useCheckUserLicense();
  const selectedPitches = useSelector((state) => state.pitches.selectedPitches);
  const activePitchCount = useSelector(
    (state) => state.pitches.selectedPitchesActiveCount
  );
  const deactivePitchCount = useSelector(
    (state) => state.pitches.selectedPitchesDeactiveCount
  );

  const [isDiasble, setIsDisable] = useState(false);
  const [showMailDropdown, setShowMailDropdown] = useState(false); // State for MailDropdown visibility
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [newPitchName, setNewPitchName] = useState("");

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (pitchToEdit) {
      dispatch(setIsOpen(true));
    }
  }, [pitchToEdit]);

  const deActivateButtonHandler = async () => {
    setIsDisable(true);
    const pitchIds = [];

    for (let i = 0; i < selectedPitches.length; i++) {
      pitchIds.push(selectedPitches[i].id);
    }
    try {
      const response = await axiosInstance.post(
        `/deactivate-pitch`,
        {
          pitchIds: pitchIds,
          updated_by: viewer_id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      dispatch(clearSelectedPitch());
      dispatch(
        fetchPitchesAsync({
          sortColumn: "name",
          sortOrder: "ASC",
          viewer_id: viewer_id,
          baseURL: baseURL,
          organisation_id,
        })
      );
      toast.success("Pitch deactivated Successfully");
    } catch (error) {
      console.log(error.message);
      toast.error("not working");
    } finally {
      setIsDisable(false);
      await fetchFilterCondition();
    }
  };

  const getFilterCondition = async () => {
    const [
      { data: tableData },
      { data: fieldData },
      { data: conditionTypeData },
      { data: conditionValueTypeData },
    ] = await Promise.all([
      axiosInstance.post(`${baseURL}/get-table-id`, { tablename: "pitch" }),
      axiosInstance.post(`${baseURL}/get-filter-field-id`, {
        field_name: "owner",
      }),
      axiosInstance.post(`${baseURL}/get-condition-type-id`, {
        condition_type: "equals",
      }),
      axiosInstance.post(`${baseURL}/get-condition-value-type-id`, {
        condition_value_type: "Absolute",
      }),
    ]);
    return {
      order: 1,
      filterTable: tableData.id,
      filterField: fieldData.id,
      conditionType: conditionTypeData.id,
      conditionValueType: conditionValueTypeData.id,
      filterTableName: "pitch",
      filterFieldName: "owner",
      filterFieldType: "string",
      conditionName: "equals",
      conditionValueTypeName: "Absolute",
      valueId: "",
      valueName: "",
      relativeValue: null,
      value: viewer_id,
    };
  };
  const fetchFilterCondition = async () => {
    try {
      const filterCondition = await getFilterCondition();
      console.log("filterCondition", filterCondition);

      if (filterCondition) {
        dispatch(
          fetchFilterDataAsync({
            axiosInstance: axiosInstance,
            queryTable: filterCondition.filterTable,
            filtersets: [filterCondition],
            filter_logic: "1",
            baseURL: baseURL,
            organisation_id,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching filter condition:", error);
    }
  };

  const activateButtonHandler = async () => {
    setIsDisable(true);
    const pitchIds = [];
    for (let i = 0; i < selectedPitches.length; i++) {
      pitchIds.push(selectedPitches[i].id);
    }
    try {
      const response = await axiosInstance.post(
        `/activate-pitch`,
        {
          pitchIds: pitchIds,
          updated_by: viewer_id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      console.log(response.data);
      toast.success("Pitch activated Successfully");
      dispatch(clearSelectedPitch());
      console.log("===> pitchids ", pitchIds);
      // setPitchToEdit(pitchIds[0]);
      console.log("=====>Activated Pitch ID:", pitchIds[0]);
      dispatch(
        fetchPitchesAsync({
          sortColumn: "name",
          sortOrder: "ASC",
          viewer_id: viewer_id,
          baseURL: baseURL,
          organisation_id,
        })
      );
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsDisable(false);
      await fetchFilterCondition();
    }
  };

  const demo = selectedPitches?.every((item) => item.demo === 1);
  const handleDemoUser = () => {
    if (demo == true) {
      toast.warning("Demo content can't be editable");
    }
  };

  const openCloneModal = () => {
    if (selectedPitches.length === 1) {
      const selectedPitchName = selectedPitches[0].name;
      setNewPitchName(`Copy of ${selectedPitchName}`);
      setShowCloneModal(true);
    }
  };

  const closeCloneModal = () => {
    setShowCloneModal(false);
    dispatch(clearSelectedPitch());
  };

  const handleClone = async () => {
    if (!newPitchName.trim()) {
      toast.error("New name cannot be empty");
      return;
    }

    try {
      setIsDisable(true);
      const pitchId = selectedPitches[0].id;

      const response = await axiosInstance.post(`/clone-pitch`, {
        pitch_id: pitchId,
        new_name: newPitchName,
        viewer_id: viewer_id,
        organisation_id: organisation_id,
      });

      console.log(response.data);

      if (response.data.success) {
        toast.success(response.data.message || "Pitch cloned successfully");

        // Clear selected pitch
        dispatch(clearSelectedPitch());

        dispatch(
          fetchPitchesAsync({
            sortColumn: "name",
            sortOrder: "ASC",
            viewer_id: viewer_id,
            baseURL: baseURL,
            organisation_id,
          })
        );
      } else {
        toast.error(response.data.message || "Failed to clone pitch");
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.response?.data?.message || "Failed to clone pitch");
    } finally {
      setIsDisable(false);
      setShowCloneModal(false);
      await fetchFilterCondition();
    }
  };

  // FUnciton to fetch active users
  const fetchActiveUsers = async () => {
    try {
      const response = await axiosInstance.post("/view-all-users", {
        is_active: 1,
      });
      setUsersList(
        response.data.users.map((user) => ({
          value: user.id,
          label: `${user.first_name} ${user.last_name} (${user.username})`,
        }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  //Fucniotn to transfer pitch ownership
  const handleOwnerTransfer = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    try {
      setIsDisable(true);
      const pitchIds = selectedPitches.map((pitch) => pitch.id);

      const response = await axiosInstance.post("/update-pitch-owners", {
        pitch_ids: pitchIds,
        owner_id: selectedUser.value,
      });

      if (response.data.success) {
        toast.success("Pitch ownership transferred successfully");
        dispatch(clearSelectedPitch());
        dispatch(
          fetchPitchesAsync({
            sortColumn: "name",
            sortOrder: "ASC",
            viewer_id: viewer_id,
            baseURL: baseURL,
            organisation_id,
          })
        );
      } else {
        toast.error(response.data.message || "Failed to transfer ownership");
      }
    } catch (error) {
      console.log(error.message);
      toast.error(
        error.response?.data?.message || "Failed to transfer ownership"
      );
    } finally {
      setIsDisable(false);
      setShowTransferModal(false);
      setSelectedUser(null);
      await fetchFilterCondition();
    }
  };

  return (
    <div className="container w-full flex gap-4 items-center justify-between mx-auto px-4 pt-7">
      <div className=" overflow-x-auto h-full  rounded-md bg-white shadow-md  scroll-none">
        <div className="flex  justify-between ">
          <div className="flex space-x-1 transition-all">
            {checkFrontendPermission("Create Pitch") == "1" &&
              Object.keys(selectedPitches).length === 0 && (
                <div className="transition-all mt-[1px] ">
                  {/* <AddPitchPopUp /> */}
                  <AddPitchPopUPV2 />
                </div>
              )}
          </div>
        </div>
        <div
          className={`flex flex-row transition-all   ${
            selectedPitches.length > 0
              ? " bg-white dark:bg-gray-600 rounded-md p-0.5 shadow-md w-[60vw] items-center pl-1"
              : ""
          }`}
        >
          {checkFrontendPermission("Edit Pitch") == "1" &&
            selectedPitches.length <= 1 &&
            Object.keys(selectedPitches).length > 0 && (
              <div className="transition-all ">
                <CRUDButton
                  label="Edit"
                  onClickHandle={() => {
                    dispatch(setIsOpen(true));
                  }}
                  icon={faEdit}
                  btn="mr-2"
                  isDiasble={isDiasble}
                />
              </div>
            )}

          {selectedPitches.length == 1 &&
            selectedPitches.length == activePitchCount && (
              <>
                <MailDropdown selectedPitches={selectedPitches} />
                {/* Spacer for thw mail button  */}
              </>
            )}

          {selectedPitches.length == 1 && (
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

          {selectedPitches.length > 0 &&
            checkFrontendPermission("Edit Pitch") == "1" && (
              <div className="flex items-center">
                <button
                  className="flex items-center justify-center text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
                  onClick={() => {
                    setShowTransferModal(true);
                    fetchActiveUsers();
                  }}
                >
                  <FaUserFriends className="mr-2" />
                  Transfer
                </button>
              </div>
            )}
          {selectedPitches.length > 0 && (
            <>
              {checkFrontendPermission("View Tag; View All Tag") == "1" &&
                (checkUserLicense("Revenue Enablement Elevate") == "1" ||
                  checkUserLicense("Revenue Enablement Spark") == "1") && (
                  <div className="space-x-1 transition-all">
                    <button
                      className="flex flex-row items-center text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
                      onClick={() => {
                        dispatch(clearSelectedPitch());
                        TableNameHandler("tag", "filter", "pitch");
                        navigate(`/content/tag-manager`);
                        dispatch(SetFilterLoading(true));
                        dispatch(SetFilterApplied(true));
                        dispatch(SetFilterAppliedOn("tag"));
                      }}
                    >
                      <FontAwesomeIcon icon={faTag} className="mr-2" />
                      Show Tag
                    </button>
                  </div>
                )}
              {checkFrontendPermission("View Content; View all Content") ==
                "1" &&
                (checkUserLicense("Revenue Enablement Elevate") == "1" ||
                  checkUserLicense("Revenue Enablement Spark") == "1") && (
                  <div className="space-x-1 transition-all">
                    <button
                      className="flex flex-row items-center text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
                      onClick={async () => {
                        dispatch(clearSelectedPitch());
                        TableNameHandler("content", "filter", "pitch");
                        navigate(`/content/content-portal`);
                        dispatch(SetFilterLoading(true));
                        dispatch(SetFilterApplied(true));
                        dispatch(SetFilterAppliedOn("content"));
                      }}
                    >
                      <FontAwesomeIcon icon={faEye} className="mr-2" />
                      Show Content
                    </button>
                  </div>
                )}
            </>
          )}
          {checkFrontendPermission("Activate/Deactivate Pitch") == "1" &&
            selectedPitches.length == activePitchCount &&
            selectedPitches.length >= 1 && (
              <div className="transition-all ">
                <CRUDButton
                  label="Deactivate"
                  onClickHandle={() => {
                    deActivateButtonHandler();
                    handleDemoUser();
                  }}
                  icon={faFileCircleXmark}
                  btn="mr-2"
                  isDiasble={isDiasble}
                />
              </div>
            )}
          {checkFrontendPermission("Activate/Deactivate Pitch") == "1" &&
            selectedPitches.length == deactivePitchCount &&
            selectedPitches.length >= 1 && (
              <div className="transition-all">
                <CRUDButton
                  isDiasble={isDiasble}
                  label="Activate"
                  onClickHandle={() => {
                    activateButtonHandler();
                    handleDemoUser();
                  }}
                  icon={faFileCircleCheck}
                  btn="mr-2"
                />
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
                className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 mr-1 text-sm"
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
                    label:
                      groupByOptions.find(
                        (option) => option.value === groupByColumn
                      )?.label || groupByColumn,
                    isCustom: groupByOptions.some(
                      (option) =>
                        option.value === groupByColumn && option.isCustom
                    ),
                  }
                : null
            }
            onChange={(selected) => setGroupByColumn(selected?.value || null)}
            styles={customStyles}
            className="min-w-[200px] text-sm"
          />
        </div>

        {pitchState.isOpen && (
          <EditPitchPupUpV2
            pitchToEdit={pitchToEdit || selectedPitches[0].id}
            activatePitch={activateButtonHandler}
            setPitchToEdit={setPitchToEdit}
          />
        )}

        {/* search bar  */}
        <div className="w-[200px] mt-0.5">
          <SearchBar applySearch="pitches" />
        </div>

        {/* filter modal  */}
        <FilterModal queryTable="pitch" />
      </div>

      {/* Clone Modal */}
      {showCloneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Clone Pitch</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Name
              </label>
              <input
                type="text"
                value={newPitchName}
                onChange={(e) => setNewPitchName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeCloneModal}
                className="px-6 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                className={`px-6 py-2 w-[101px] h-[38px] flex justify-center items-center text-sm btn-secondary text-white  rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={isDiasble}
              >
                Clone
              </button>
            </div>
          </div>
        </div>
      )}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              Transfer Pitch Ownership
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select New Owner
              </label>
              <Select
                options={usersList}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="Select a user..."
                className="basic-single"
                classNamePrefix="select"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedUser(null);
                }}
                className="px-6 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
              >
                Cancel
              </button>
              <button
                onClick={handleOwnerTransfer}
                className={`px-6 py-2 w-[101px] h-[38px] flex justify-center items-center text-sm btn-secondary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={isDiasble || !selectedUser}
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
