import React, { useState, useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import { AddTagPopUp2 } from "./AddTagPopUp2.jsx";
import toast from "react-hot-toast";
import Button from "../../ui/Button.jsx";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import { LuLoaderCircle } from "react-icons/lu";
import GlobalButton from "../ContentManager/ContentTable/GlobalButton.jsx";

export const AddTagPopUp1 = () => {
  // Loading States for various fields
  const [isLoading, setIsLoading] = useState({
    crmConnections: false,
    salesforceObjects: false,
    proceedButton: false,
  });

  const axiosInstance = useAxiosInstance();
  const firstDialogRef = useRef();

  // Global State variables
  const { viewer_id, rawCookie } = useContext(GlobalContext);
  // state for creating the new tags and contain all the popup data

  const [addNewTag, setAddNewTag] = useState({
    name: "",
    description: "",
    addTagPopUp1: false,
    addTagPopUp2: false,
    addTagPopUp3: false,
    addTagPopUp4: false,
    crmConnections: [],
    crmConnection: "",
    crmConnectionId: "",
    connectionName: "",
    salesForceObjects: [],
    primaryObjectId: "",
    primaryObjectName: "",
    fieldDate: "",
    conditionTypes: [],
    conditionType: "",
    conditionTypeId: "",
    valueTypes: [],
    valueType: "Relative",
    relativeTypes: [],
    relativeType: "",
    absoluteType: "",
    advanceTagLogic: "",
    users: [],
    userFields: [],
    userField: "",
    tagConditions: [],
    order: "",
    fieldType: "",
    fieldId: "",
    value: "",
    conditionValueTypeId: "",
    selectedTag: {},
    editTagCondition: false,
    editTagConditionId: "",
    picklistfield: [],
    picklistValue: "",
    referencefield: [],
    referenceValue: "",
  });

  // Add Tag button Function
  const addTagButtonHandler = () => {
    crmConnectionHandler();
    fetchServiceUser();
    salesForceObjectHandler();
    setAddNewTag((prevState) => ({ ...prevState, addTagPopUp1: true }));
  };

  // Fetch CRM Connection
  const crmConnectionHandler = async () => {
    setIsLoading({ ...isLoading, crmConnections: true });
    try {
      const response = await axiosInstance.post(`/view-all-crm-connections`, {
        viewer_id,
      });

      setAddNewTag((prevState) => ({
        ...prevState,
        crmConnections: response.data.connections,
      }));
    } catch (error) {
      toast.error("Failed to fetch CRM connections");
    } finally {
      setIsLoading({ ...isLoading, crmConnections: false });
    }
  };

  const [serviceUserData, setServiceUserData] = useState(null);
  const [organisationId, setOrganisationId] = useState("");
  const [serviceId, setServiceId] = useState("");

  useEffect(() => {
    // Assuming rawCookie is fetched asynchronously, handle state update here
    if (rawCookie && rawCookie.organisation.id) {
      setOrganisationId(rawCookie.organisation.id);
    }
  }, [rawCookie]);

  useEffect(() => {
    if (organisationId) {
      fetchServiceUser();
    }
  }, [organisationId]);

  useEffect(() => {
    if (serviceId) {
      salesForceObjectHandler();
    }
  }, [serviceId]);

  useEffect(() => {
    // Assuming rawCookie is fetched asynchronously, handle state update here
    if (serviceUserData && serviceUserData.length > 0) {
      setServiceId(serviceUserData[0].id);
    }
  }, [serviceUserData]);

  const fetchServiceUser = async () => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(`/get-service-user`, {
        organisation: organisationId,
        viewer_id: viewer_id,
      });

      const crmConnectionId = response.data[0].id;

      // Update addNewTag state with the CRM connection ID
      setAddNewTag((prevState) => ({
        ...prevState,
        crmConnectionId: crmConnectionId,
      }));

      setServiceUserData(response.data);

      if (response.data === "CRM connection not found") {
        // setError("CRM connection not found");
      } else if (
        response.data === "Service CRM user not found in organisation"
      ) {
        // setError("Service CRM user not found in organisation");
      }
    } catch (error) {
      console.error("Error fetching service user:", error);
      // setError("An error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  };

  // View salesforce objects based on crm connection ID
  const salesForceObjectHandler = async (id) => {
    setIsLoading({ ...isLoading, salesforceObjects: true });
    try {
      const response = await axiosInstance.post(`/view-salesforce-objects`, {
        viewer_id: viewer_id,
        crm_connection: serviceId,
      });

      setAddNewTag((prevState) => ({
        ...prevState,
        salesForceObjects: response.data.salesforceObjects,
      }));
    } catch (error) {
      //  toast.error("Failed to fetch Salesforce objects");
    } finally {
      setIsLoading({ ...isLoading, salesforceObjects: false });
    }
  };

  // Define handleChange function
  const handleChange = (e) => {
    const selectedId = e.target.value;
    const selectedObj = addNewTag.salesForceObjects.find(
      (obj) => obj.id === selectedId
    );
    setAddNewTag((prevState) => ({
      ...prevState,
      primaryObjectId: selectedId,
      primaryObjectName: selectedObj.name,
    }));
  };
  // console.log(crm_username)
  // console.log(crmConnectionId)
  // Next Button for advance tag conditions popup (addTagPopUp2)

  const nextButtonHandler = async () => {
    if (!addNewTag.primaryObjectId) {
      toast.error("Primary Object ID is not valid.");
      return;
    }
    try {
      console.log("CRM Connection ID:", serviceId);
      // Fetch data from the first endpoint
      setIsLoading({ ...isLoading, proceedButton: true });
      const fieldsResponse = await axiosInstance.post(
        `/view-fieldsplusreffields`,
        {
          viewer_id,
          salesforce_object: addNewTag.primaryObjectId,
        }
      );

      // Fetch data from the other endpoints
      const conditionTypesResponse = await axiosInstance.post(
        `/retrieve-condition-types`,
        {
          viewer_id: viewer_id,
        }
      );

      // Fetch value types
      const valueTypesResponse = await axiosInstance.post(
        `/retrieve-condition-value-types`,
        {
          viewer_id: viewer_id,
        }
      );

      // Fetch relative types
      const relativeTypesResponse = await axiosInstance.post(
        `/retrieve-relative-values`,
        {
          viewer_id: viewer_id,
        }
      );

      // Update the state with the fetched data
      setAddNewTag((prevState) => ({
        ...prevState,
        conditionTypes: conditionTypesResponse.data.data,
        valueTypes: valueTypesResponse.data.data,
        relativeTypes: relativeTypesResponse.data.data,
        userFields: fieldsResponse.data.data,
        // crmConnection: crmConnection,
        // connectionName: connectionName,
        addTagPopUp1: false,
        addTagPopUp2: true,
      }));
    } catch (error) {
      toast.error("Please try again!");
    } finally {
      setIsLoading({ ...isLoading, proceedButton: false });
    }
  };

  // Define cancelButtonHandler function
  const cancelButtonHandlerPopup1 = (props) => {
    function getdata() {
      <FontAwesomeIcon icon={faPlus} className=" mr-2" />;
    }
    setAddNewTag((prevState) => ({
      ...prevState,
      addTagPopUp1: false,
      addTagPopUp2: false,
      name: "",
      description: "",
      crmConnectionId: "",
      salesForceObjects: [],
      primaryObjectId: "",
      primaryObjectName: "",
    }));
    setIsLoading({ ...isLoading, proceedButton: false });
  };

  const [formSubmitted, setFormSubmitted] = useState(false);

  const areRequiredFieldsFilled = () => {
    return (
      addNewTag.name !== "" &&
      addNewTag.description !== "" &&
      addNewTag.primaryObjectId !== ""
    );
  };

  const handleNextStep = () => {
    if (areRequiredFieldsFilled()) {
      nextButtonHandler();
    } else {
      setFormSubmitted(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        firstDialogRef.current &&
        !firstDialogRef.current.contains(event.target)
      ) {
        cancelButtonHandlerPopup1();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="absolute">
      <GlobalButton handleToggleDropdown={addTagButtonHandler} />
      {addNewTag.addTagPopUp1 && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-800 bg-opacity-50"></div>
          <div
            ref={firstDialogRef}
            className="bg-white p-8 rounded-lg shadow-xl max-w-lg  w-full relative"
          >
            {/* Popup Header */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-center text-neutral-800">
                Create New Tag
              </h3>
              {/* Popup Body */}
              <div>
                {/* Form for Add Tag */}
                <div className="text-xs gap-2 mb-3 flex items-center border border-cyan-100 px-2 py-1 rounded-md bg-cyan-50 text-cyan-800  w-fit">
                  <span>Service User ID :</span>
                  {serviceUserData ? (
                    <div className=" font-semibold">
                      {serviceUserData[0].name}
                    </div>
                  ) : (
                    <div>
                      <LuLoaderCircle className="text-base animate-spin" />
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleNextStep();
                  }}
                >
                  {serviceUserData[0].crm == "Zoho" ? (
                    <>
                      <div
                        className="flex flex-col items-center justify-center bg-gray-100 mt-6 rounded-md"
                        style={{ height: "30vh" }}
                      >
                        <p className="text-center text-xl font-semibold text-gray-400  dark:text-white">
                          Adding Tags for Zoho CRM Will be Available Soon..
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      {/* Tag Name */}
                      <div className="mt-4">
                        <label className="block mb-2 text-sm font-medium text-neutral-800 dark:text-white">
                          Tag Name
                        </label>
                        <input
                          value={addNewTag.name}
                          onChange={(e) => {
                            setAddNewTag((prevState) => ({
                              ...prevState,
                              name: e.target.value,
                            }));
                          }}
                          type="text"
                          className="p-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500 w-full"
                        />
                        {formSubmitted && addNewTag.name === "" && (
                          <p className="text-red-500 text-xs mt-1 ">
                            Please enter tag name
                          </p>
                        )}
                      </div>
                      {/* Tag Description */}
                      <div className="mt-4">
                        <label className="block mb-2 text-sm font-medium text-neutral-800 dark:text-white">
                          Description
                        </label>
                        <input
                          value={addNewTag.description}
                          onChange={(e) => {
                            setAddNewTag((prevState) => ({
                              ...prevState,
                              description: e.target.value,
                            }));
                          }}
                          type="text"
                          className="p-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500 w-full"
                        />
                        {formSubmitted && addNewTag.description === "" && (
                          <p className="text-red-500  text-xs mt-1">
                            Please enter Description.
                          </p>
                        )}
                      </div>
                      <div className="col-span-2 sm:col-span-1 mt-4">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Primary Object
                        </label>
                        {isLoading.salesforceObjects ? (
                          <div className="border border-neutral-200 rounded-lg p-2 bg-neutral-100 text-sm h-[42px] flex items-center  font-medium text-neutral-700 justify-center gap-2">
                            <LuLoaderCircle className="text-base animate-spin" />
                          </div>
                        ) : (
                          <select
                            className="p-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500 w-full h-[42px]"
                            value={addNewTag.primaryObjectId}
                            onChange={(e) => {
                              handleChange(e);
                            }}
                          >
                            <option value="" disabled>
                              Select Object
                            </option>
                            {addNewTag.salesForceObjects &&
                              addNewTag.salesForceObjects.map((ob) => (
                                <option key={ob.id} value={ob.id}>
                                  {ob.name}
                                </option>
                              ))}
                          </select>
                        )}
                        {formSubmitted && addNewTag.primaryObjectId === "" && (
                          <p className="text-red-600  text-xs ">
                            Please select primary Object.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-10">
                    <button
                      type="button"
                      className="px-6 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                      onClick={cancelButtonHandlerPopup1}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2 w-[101px] h-[38px] flex justify-center items-center text-sm btn-secondary text-white ${
                        areRequiredFieldsFilled()
                          ? ""
                          : "opacity-70 cursor-not-allowed"
                      } rounded-lg transition-colors`}
                      disabled={!areRequiredFieldsFilled()}
                    >
                      {isLoading.proceedButton ? (
                        <div className="flex items-center justify-center">
                          <LuLoaderCircle className="animate-spin text-lg" />
                        </div>
                      ) : (
                        "Proceed"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Pass the data and open second popup addNewTag.addTagPopUp2 */}
      {addNewTag.addTagPopUp2 && (
        <>
          <AddTagPopUp2
            cancelButtonHandlerPopup1={cancelButtonHandlerPopup1}
            addNewTag={addNewTag}
            setAddNewTag={setAddNewTag}
          />
        </>
      )}
    </div>
  );
};
