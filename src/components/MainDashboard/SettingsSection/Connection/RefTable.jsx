import React, { useContext, useEffect, useState } from "react";

import { toast } from "react-hot-toast";

import ResizableTable from "../../../../utility/ResizableTable.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Grid } from "react-loader-spinner";
import {
  faCaretDown,
  faPlus,
  faTrash,
  faCaretRight,
} from "@fortawesome/free-solid-svg-icons";

function RefTable() {
  const {
    refDetails,
    setRefDetails,
    connectionDetails,
    setFieldDetails,
    fieldDetails,
    viewer_id,
    selectedFieldId,
  } = useContext(GlobalContext);

  const [selectedRow, setSelectedRow] = useState(null);
  const [searchFields, setSearchFields] = useState(fieldDetails);
  const [showTable, setShowTable] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const axiosInstance = useAxiosInstance();

  const [selectedField, setSelectedField] = useState({ name: "" });
  const [referenceFieldId, setReferenceFiledId] = useState("");

  const handleRowClick = async () => {
    if (viewer_id && selectedFieldId) {
      try {
        const response = await axiosInstance.post(`/view-fieldsplusreffields`, {
          viewer_id: viewer_id,
          salesforce_object: selectedFieldId,
        });
        if (response.data.success) {
          toast.success("Record Inserted Successfully");
          setRefDetails(response.data.data);
          console.log("table data: ", response.data.data);
        } else {
          console.error(
            "Failed to retrieve CRM object details:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error retrieving CRM object details:", error);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setSearchFields(refDetails);
  }, [refDetails]);

  const handlePlusClick = async (data) => {
    setIsLoading(true); // Set loading state to true when the plus icon is clicked
    setReferenceFiledId(data.id);
    const path = window.location.href;

    try {
      const response = await axiosInstance.post(`/retrieveReferenceFields`, {
        crmConnectionId: connectionDetails.id,
        fieldId: data.id,
        originURL: path,
        viewerId: viewer_id,
      });
      if (response.data.authUrl) {
        toast.error("Please authorize your connection");
        setIsLoading(false); 
        return; // Exit the function to prevent opening the modal
      }

      if (response.data) {
        setFieldDetails(response.data);
        setSelectedRow(data);
        console.log("our data: ", fieldDetails);
        setIsLoading(false); // Set loading state to false after data is retrieved
      } else {
        console.error(
          "Failed to retrieve CRM object details:",
          response.data.message
        );
        setIsLoading(false); // Set loading state to false if there is an error
      }
    } catch (error) {
      console.error("Error retrieving CRM object details:", error);
      setIsLoading(false); // Set loading state to false if there is an error
    }
  };

  const handleFieldSelection = (field) => {
    console.log("inside field selection ");
    setSelectedField(field);
    setShowTable(true);
  };

  const searchHandler = (event) => {
    const inputValue = event.toLowerCase();
    setSelectedField({ name: event });
    if (event !== "") {
      const filteredDetails = fieldDetails.filter((detail) =>
        detail.name.toLowerCase().includes(inputValue)
      );
      setSearchFields(filteredDetails);
    } else {
      setSearchFields(fieldDetails);
    }
  };

  const handleIconClick = () => {
    console.log("handle icon click");
    setShowTable(true);
  };

  const createHandler = async () => {
    const data = {
      name: selectedField.name,
      api_name: selectedField.apiName,
      type: selectedField.type,
      salesforce_field: referenceFieldId,
      created_by: viewer_id,
    };

    const response = await axiosInstance.post(
      `/insertReferenceLevelOneField`,
      data
    );
    if (response) {
      handleRowClick();
      setShowTable(true);
      setReferenceFiledId("");
      setSelectedField({ name: "" });
      setSelectedRow(null);
    }
  };
  console.log("Selected Field:", selectedField);

  const filterHandler = (filteredFieldDetails) => {
    const data = [];
    let flag = true;
    console.log("selectedRow.referenceFieldLevelOne?.length", selectedRow);
    for (let i = 0; i < filteredFieldDetails.length; i++) {
      flag = true;
      for (let j = 0; j < selectedRow.reference_level; j++) {
        if (
          filteredFieldDetails[i].api_name ===
            selectedRow.referenceFieldLevelOne[j].api_name &&
          filteredFieldDetails[i].name ===
            selectedRow.referenceFieldLevelOne[j].name &&
          filteredFieldDetails[i].type ===
            selectedRow.referenceFieldLevelOne[j].type
        ) {
          flag = false;
          break;
        }
      }

      if (flag) {
        data.push(filteredFieldDetails[i]);
      }
    }

    // Sort the data array alphabetically by name
    return data.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  };

  const handleDeleteClick = (item) => async () => {
    try {
      const response = await axiosInstance.delete(
        "/deleteReferenceLevelOneField",
        {
          data: {
            viewer_id: viewer_id,
            id: item.id,
          },
          withCredentials: true, // Include credentials in the request
        }
      );

      if (response.status === 200) {
        toast.success("Record deleted successfully");
        setRefDetails((prevDetails) =>
          prevDetails.filter((detail) => detail.id !== item.id)
        );
        handleRowClick(); // Refresh the table after deletion
      } else {
        toast.error("Record not found");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Internal Server Error");
    }
  };

  const renderData = (data, reference_level = 0) => {
    return data.map((item) => (
      <React.Fragment key={item.id}>
        <tr
          className={`${
            item.reference_level > 0 ? "bg-primary-light" : "bg-white"
          }`}
          onMouseEnter={() => setHoveredRow(item.id)}
          onMouseLeave={() => setHoveredRow(null)}
        >
          <td
            className={`px-6 py-4 whitespace-nowrap text-slate-600 text-sm font-bold cursor-pointer tracking-wider ${
              reference_level > 0 ? "pl-6" : ""
            }`}
          >
            {reference_level === 0 && item.type === "reference" ? (
              <FontAwesomeIcon
                className="text-cyan-700 cursor-pointer"
                icon={faPlus}
                onClick={() => {
                  handlePlusClick(item);
                }}
              />
            ) : (
              hoveredRow === item.id &&
              reference_level > 0 && (
                <FontAwesomeIcon
                  className="text-cyan-700 cursor-pointer"
                  icon={faTrash}
                  onClick={handleDeleteClick(item)}
                />
              )
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm font-bold cursor-pointer tracking-wider">
            {item.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm font-bold cursor-pointer tracking-wider">
            {item.api_name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm font-bold cursor-pointer tracking-wider">
            {item.type}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm font-bold cursor-pointer tracking-wider">
            {item.reference_level + "  "}
          </td>
        </tr>
        {item.referenceFieldLevelOne &&
          item.referenceFieldLevelOne.length > 0 &&
          renderData(item.referenceFieldLevelOne, reference_level + 1)}
        {item.referenceFieldLevelTwo &&
          item.referenceFieldLevelTwo.length > 0 &&
          renderData(item.referenceFieldLevelTwo, reference_level + 2)}
      </React.Fragment>
    ));
  };

  if (isLoading) {
    return (
      <div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
          <div className="bg-transparent p-6 rounded-md z-50 w-auto">
            <Grid
              visible={true}
              height="40"
              width="40"
              color="#075985"
              ariaLabel="grid-loading"
              radius="12.5"
              wrapperStyle={{}}
              wrapperClass="grid-wrapper"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {selectedRow && (
        <div className="fixed inset-0 flex items-center justify-center z-50 ">
          <div className="absolute inset-0 bg-gray-800 opacity-30"></div>

          <div className="w-1/3 border-2 bg-white pt-4 relative rounded-lg ">
            <div className=" rounded-lg mb-4 ml-4 mr-4">
              <div className="text-lg font-medium m-2">
                Add New Lookup field for {selectedRow.name}
              </div>
              <div className="border b-2 border-gray-300 rounded-lg">
                <div className="text-base font-medium text-gray-600 mb-2 p-2">
                  {selectedField.name ? (
                    <div>
                      Selected Field:{" "}
                      <span className="ml-1 font-semibold">
                        {selectedField.name}
                      </span>
                    </div>
                  ) : (
                    "Select a field"
                  )}
                </div>

                {showTable && ( //code for dropdown box size
                  <div className="relative w-full max-h-48 overflow-y-auto border-t border-gray-300 bg-white z-10 mt-1">
                    <table className="relative w-[27rem] bg-white mx-2 mt-2">
                      <tbody className="">
                        {filterHandler(fieldDetails).map((field, index) => (
                          <tr
                            key={field.name}
                            onClick={() => handleFieldSelection(field)}
                            className={`cursor-pointer ${
                              selectedField.name === field.name
                                ? "bg-blue-100 hover:bg-blue-200"
                                : "hover:bg-gray-200"
                            }`}
                          >
                            <td className="p-2">{field.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {/* {code for dropdown height & button} */}
              <div
                className={`flex justify-center my-2 mx-10 space-x-3 mt-4 transition-all duration-300 mt-22 max-[800px]:mt-15`}
              >
                <button
                  className="flex w-28 h-10 px-6 text-sm rounded-xl justify-center items-center border border-solid border-red-500 bg-red-300 hover:bg-red-400 text-red-800 hover:text-red-900"
                  onClick={() => {
                    setShowTable(true);
                    setSelectedRow(null);
                    setSelectedField({ name: "" });
                  }}
                >
                  Close
                </button>
                <button
                  className="flex w-28 h-10 px-6 text-sm rounded-xl justify-center items-center border border-solid border-gray-400 bg-white hover:bg-gray-300 text-gray-800 hover:text-gray-900"
                  onClick={createHandler}
                  disabled={selectedField.name.length === 0}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="container overflow-auto my-2">
        <div className="table-wrapper overflow-auto h-[300px] 2xl:h-[450px] bg-gray-100 ">
          <table className="bg-white rounded-xl border-2 overflow-auto w-full h-[100px] ">
            <thead className="w-full">
              <tr className="">
                <th className="sticky top-0 bg-gray-100 py-5 table-heading px-6 border-b text-left whitespace-nowrap text-xs font-medium text-sky-800 uppercase tracking-wide"></th>
                <th className="sticky top-0 bg-gray-100 py-5 table-heading px-6 border-b text-left whitespace-nowrap text-xs font-medium text-sky-800 uppercase tracking-wide">
                  Name
                </th>
                <th className="sticky top-0 bg-gray-100 py-5 table-heading px-6 border-b text-left whitespace-nowrap text-xs font-medium text-sky-800 uppercase tracking-wide">
                  API Name
                </th>
                <th className="sticky top-0 bg-gray-100 py-5 table-heading px-6 border-b text-left whitespace-nowrap text-xs font-medium text-sky-800 uppercase tracking-wide">
                  Type
                </th>
                <th className="sticky top-0 bg-gray-100 py-5 table-heading px-6 border-b text-left whitespace-nowrap text-xs font-medium text-sky-800 uppercase tracking-wide">
                  Level
                </th>
              </tr>
            </thead>
            <tbody
              className={`bg-white divide-y divide-gray-200 ${
                refDetails.length >= 8 ? "h-72 overflow-y-scroll" : "h-auto"
              }`}
            >
              {refDetails.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No data available
                  </td>
                </tr>
              ) : (
                renderData(refDetails)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RefTable;
