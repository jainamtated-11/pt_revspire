import React, { useContext, useEffect, useState } from "react";
// import ResizableTable from "../../../../utility/ResizableTable.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import RefTable from "./RefTable.jsx";
import { Grid } from "react-loader-spinner";
import ResizableTable from "../../../../utility/CustomComponents/ResizableTable.jsx";

function ObjectTable() {
  const {
    objectDetails,
    refDetails,
    setRefDetails,
    viewer_id,
    setSelectedFieldId,
    selectedFieldId,
    connectionObjectLoading,
    setConnectionObjectLoading,
  } = useContext(GlobalContext);

  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});

  const [objectDetailsArray, setObjectDetailsArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    const detailsArray = objectDetails
      ? Object.keys(objectDetails).map((key) => ({
          id: objectDetails[key].id,
          Name: objectDetails[key].name,
          api_name: objectDetails[key].api_name,
          relevant: objectDetails[key].relevant,
        }))
      : [];
    detailsArray.sort((a, b) => b.relevant - a.relevant);

    setObjectDetailsArray(detailsArray);
  }, [objectDetails]);

  const includedFields = ["Name", "API Name", "Relevant"];
  const row = ["Name", "api_name", "relevant"];

  const handleRowClick = async (id) => {
    setLoading(true);
    console.log("Hey consdfkshksh");
    setSelectedFieldId(id);

    // Check if viewer_id and salesforce_object are not null or undefined
    if (viewer_id && id) {
      try {
        const response = await axiosInstance.post(`/view-fieldsplusreffields`, {
          viewer_id: viewer_id,
          salesforce_object: id,
        });
        if (response.data.success) {
          setRefDetails(response.data.data);
        } else {
          console.error(
            "Failed to retrieve CRM object details:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error retrieving CRM object details:", error);
      }
    } else {
      // console.log("viewer_id or salesforce_object is null or undefined, skipping fetch");
    }

    setLoading(false);
  };

  const clearLoaderTimeout = () => {
    clearTimeout(loaderTimeout);
  };

  let loaderTimeout;

  if (loading || connectionObjectLoading) {
    return (
      <div className="flex justify-center items-center h-96 mr-24  ">
        <div className="flex justify-center items-center">
          <Grid
            visible={true}
            height={40}
            width={40}
            color="#075985"
            ariaLabel="grid-loading"
            radius={12.5}
          />
        </div>
      </div>
    );
  }

  console.log("objectDetailsArray", objectDetailsArray);

  if (refDetails) {
    return (
      <div className="container mx-auto p-4">
        <button
          className="bg-white text-sky-800 px-4 py-2 rounded-2xl shadow-md mr-4 hover:bg-sky-800 hover:text-white transition duration-300 ease-in-out"
          onClick={() => setRefDetails(null)}
        >
          Back
        </button>
        <div>
          <RefTable />
        </div>
      </div>
    );
  }

  if (objectDetails) {
    return (
      <ResizableTable
        data={objectDetailsArray}
        columnsHeading={includedFields}
        rowKeys={row}
        OnClickHandler={handleRowClick}
        noCheckbox={true}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />
    );
  }
}

export default ObjectTable;
