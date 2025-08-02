import React, { useContext, useState, useEffect } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import CRUDbulk from "./CRUDbulk.jsx";
import AddBulkDialog from "./AddBulkDialog.jsx";
import toast from "react-hot-toast";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";
import { useSelector, useDispatch } from "react-redux";

function BulkUsers() {
  const {
    viewer_id,
    addBulkUserClicked,
    selectedUploadId,
    setSelectedUploadId,
    isDownloadLogClicked,
    setIsDownloadLogClicked,
    bulkUserUploads,
    setBulkUserUploads,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  
  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});

  const [loading, setLoading] = useState(true);
  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  const dispatch = useDispatch();
  const filter = useSelector((state) => state.filter);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.post(
          `/view-bulk-user-create`,
          {
            viewer_id: viewer_id,
          },
          {
            withCredentials: true, // Include credentials in the request
          }
        );

        if (response.data.success) {
          console.log("Original connections:", response.data.exports);
          const transformedUsers = response.data.exports.map((user) => ({
            ...user,
            "Total Record": user.total_record || "N/A",
            "Added User": user.added_user || "N/A",
            "Error Number": user.error_number || "N/A",
            "Created By": user.created_by || "NA",
          }));
          console.log("Transformed Users:", transformedUsers);
          setBulkUserUploads(transformedUsers);
          setLoading(false);
        } else {
          console.error(
            "Error fetching bulk user exports:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error fetching bulk user exports:", error);
      }
    };

    fetchData();
  }, [viewer_id]);

  useEffect(() => {
    if (filter.filterApplied) {
      dispatch(SetInitialData(filter.filterData));
      dispatch(SetSearchData(filter.filterData));
    } else {
      dispatch(SetInitialData(bulkUserUploads));
      dispatch(SetSearchData(bulkUserUploads));
    }
    dispatch(SetSearchTable("bulk_user"));
    dispatch(SetSearchFields(["name"]));
  }, [bulkUserUploads, dispatch, searchValue]);

  const handleDownload = async () => {
    try {
      if (selectedUploadId.length === 0) {
        toast.error("No file selected for download.");
        return;
      }

      const response = await axiosInstance.post(
        `/download-log/${selectedUploadId[0].id}`,
        { viewer_id: viewer_id },
        {
          withCredentials: true,
          responseType: "blob", // to handle binary data
        }
      );

      // Create a blob object from the response data
      const blob = new Blob([response.data], { type: "text/csv" });

      // Create a URL for the blob object
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const a = document.createElement("a");
      a.href = url;
      a.download = "log.csv"; // Set the filename for the downloaded file
      document.body.appendChild(a);

      // Click the anchor element programmatically to trigger the download
      a.click();

      // Clean up
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); // Clean up object URL

      // reset state and toast
      toast.success("Download Completed!");
      setIsDownloadLogClicked(false);

      setSelectedUploadId([]);
    } catch (error) {
      console.error("Error downloading log:", error);
      toast.error("Error Downloading Log!");
    }
  };

  if (isDownloadLogClicked) {
    handleDownload();
  }

  // Extract columns based on the included fields
  const columnsHeading = [
    "name",
    "Total Record",
    "Added User",
    "Error Number",
    "Created By",
  ];

  const rowKeys = [
    "name",
    "total_record",
    "added_user",
    "error_number",
    "created_by_name",
  ];

  const OnChangeHandler = (data) => {
    if (Array.isArray(data)) {
      // Handling bulk selection/deselection
      setSelectedUploadId(data);
    } else {
      // Handling individual row selection/deselection
      const idx = selectedUploadId.findIndex((item) => item.id === data.id);
      if (idx === -1) {
        setSelectedUploadId((prevState) => [...prevState, data]);
      } else {
        setSelectedUploadId((prevState) =>
          prevState.filter((item) => item.id !== data.id)
        );
      }
    }
  };

  const OnClickHandler = (id) => {
    // Implement if you need row click functionality
    console.log("Row clicked:", id);
  };

  return (
    <>
      <CRUDbulk />
      {addBulkUserClicked && <AddBulkDialog />}
      <ResizableTable
        data={searchApplied ? searchData : bulkUserUploads}
        loading={loading}
        columnsHeading={columnsHeading}
        selectedItems={selectedUploadId}
        rowKeys={rowKeys}
        OnChangeHandler={OnChangeHandler}
        OnClickHandler={OnClickHandler}
        searchTerm={searchValue}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />
    </>
  );
}

export default BulkUsers;
