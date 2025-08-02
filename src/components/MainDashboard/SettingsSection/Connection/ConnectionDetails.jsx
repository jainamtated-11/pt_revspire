import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import ResizableTable from "../../../../utility/CustomComponents/ResizableTable.jsx";
function ConnectionDetailsTable() {
  const { connectionDetails } = useContext(GlobalContext);

  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});

  const [connectionDetailsArray, setConnectionDetailsArray] = useState([]);
  console.log("connectionDetails", connectionDetails);
  useEffect(() => {
    // Convert the connectionDetails object into an array of objects
    const detailsArray = connectionDetails ? [connectionDetails] : [];
    setConnectionDetailsArray(detailsArray);
  }, [connectionDetails]);

  console.log("Original connections:", connectionDetails);
  const transformedUsers = connectionDetailsArray.map((connection) => ({
    ...connection,
    "Created At": connection.created_at || "N/A",
    "Created By": connection.created_by || "N/A",
    "Updated By": connection.updated_by || "N/A",
    "Updated At": connection.updated_at || "NA",
    "Is Primary": connection.is_primary,
  }));
  console.log("Transformed Users:", transformedUsers);

  const columnsHeading = [
    "name",
    "crm",
    "owner",
    "created By",
    "Created At",
    "Updated By",
    "Updated At",
    "active",
    "Is Primary",
  ];

  const rowData = [
    "name",
    "crm",
    "owner_name",
    "created_by_name",
    "created_at",
    "updated_by_name",
    "updated_at",
    "active",
    "is_primary",
  ];


  const data = [connectionDetails];
  console.log("[connectionDetails]", data);
  console.log("columnsHeading", columnsHeading);
  console.log("rowData", rowData);
  return (
    <div> 
      <ResizableTable
        data={[connectionDetails]}
        columnsHeading={columnsHeading}
        rowKeys={rowData}
        noCheckbox={true}
        heightNotFixed={true}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />
    </div>
  );
}

export default ConnectionDetailsTable;
