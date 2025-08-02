import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashArrowUp } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import useCheckFrontendPermission from "../../../Services/checkFrontendPermission.jsx";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";
import { useDispatch, useSelector } from "react-redux";
import SearchBar from "../../../utility/SearchBar.jsx";
import Select from "react-select";
import { X } from "lucide-react";

const RecycleBin = () => {
  const isRecycleBin = true;
  const [recycleBinData, setRecycleBinData] = useState([]);
  const { viewer_id, baseURL, recycleBin } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const checkFrontendPermission = useCheckFrontendPermission();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [allItems, setAllItems] = useState([]); // State to store allItems

  // Group by state
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const dispatch = useDispatch();

  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  // Function to fetch recycle bin data
  const fetchRecycleBin = async () => {
    try {
      const res = await axiosInstance.post(`/view-recycle-bin`, {
        viewer_id: viewer_id,
      });
      if (res.data.success) {
        setRecycleBinData(res.data.data);
      } else {
        console.error("Failed to fetch audit logs:", res.data.message);
      }
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    dispatch(SetInitialData(recycleBinData));
    dispatch(SetSearchData(recycleBinData));
    dispatch(SetSearchTable("recycleBin"));
    dispatch(
      SetSearchFields([
        "name",
        "parent_folder",
        "source",
        "delete_by_name",
        "delete_date",
      ])
    );
  }, [recycleBinData, dispatch, searchValue]);

  useEffect(() => {
    fetchRecycleBin();
  }, [baseURL, viewer_id]);

  const transformedLogs = recycleBinData.map((connection) => ({
    ...connection,
    "Full Name": connection.full_name,
    "Ip Address": connection.ip_address,
  }));

  const transformedSearchData = searchData?.map((connection) => ({
    ...connection,
    "Full Name": connection.full_name,
    "Ip Address": connection.ip_address,
  }));

  // Update allItems state whenever recycleBin.contents or recycleBin.folders change
  useEffect(() => {
    setAllItems([...recycleBin.contents, ...recycleBin.folders]);
  }, [recycleBin.contents, recycleBin.folders]);

  const handleUndoDelete = async () => {
    try {
      await axiosInstance.post(
        `/unflag-for-deletion`,
        {
          ids: selectedItems.map((item) => item.id),
          updated_by: viewer_id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      toast.success("Restored successfully");
      setSelectedItems([]);
      fetchRecycleBin(); // Refresh recycle bin data after restoration
    } catch {
      toast.error("An error occurred while restoring the files.");
    }
  };

  const OnChangeHandler = (data) => {
    if (data === allItems || data.length === 0) {
      setSelectedItems(data);
      return;
    }
    const idx = selectedItems.findIndex(
      (selectedItem) => selectedItem.id === data.id
    );

    if (idx === -1) {
      setSelectedItems((prevState) => [...prevState, data]);
    } else {
      const updatedSelectedItems = selectedItems.filter(
        (item) => item.id !== data.id
      );

      setSelectedItems(updatedSelectedItems);
    }
  };

  const columns = [
    "Name",
    "Delete Date",
    "Parent Folder",
    "Source",
    "Deleted By",
  ];

  const rowData = ["name", "delete_date", "folder", "source", "delete_by_name"];

  const [sortConfig, setSortConfig] = useState({
    key: "Updated At",
    direction: "desc",
  });

  // Function to format date for grouping
  const formatDateForGrouping = (dateString) => {
    if (!dateString) return "No Date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Group by options
  const groupByOptions = [
    { value: "", label: "No grouping", isCustom: false },
    ...(rowData?.map((column) => ({
      value: column,
      label: column.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      isCustom: false,
      isDate: column === "delete_date", // Mark date fields
    })) || []),
  ];

  // Custom styles for the Select component
  const customStyles = {
    option: (base, { data }) => ({
      ...base,
      backgroundColor: data.isCustom ? "#F0F9FF" : "white", // Light blue for custom, white for normal
      color: "#1F2937", // Standard text color
      "&:hover": {
        backgroundColor: data.isCustom ? "#E1F0FF" : "#f3f4f6", // Slightly darker blue on hover
      },
    }),
    // Keep all other styles default
    control: (base) => ({
      ...base,
      minHeight: "38px",
      width: "200px",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
  };

  // Transform data for grouping
  const transformDataForGrouping = (data) => {
    if (!data || !groupByColumn) return data;

    return data.map((item) => {
      const newItem = { ...item };

      // If grouping by a date field, format the date
      if (groupByOptions.find((opt) => opt.value === groupByColumn)?.isDate) {
        newItem[groupByColumn] = formatDateForGrouping(item[groupByColumn]);
      }

      return newItem;
    });
  };

  return (
    <>
      <div className="flex flex-col pt-2">
        <div className="container  flex justify-between mx-auto px-4 pt-4 w-full ">
          <div>
            {checkFrontendPermission("Restore Content") == "1" && (
              <div
                className={`flex flex-row  ${
                  selectedItems.length > 0
                    ? "bg-white dark:bg-gray-600 rounded-md p-0.5 shadow-md sm:w-[20vw] md:w-[30vw] xl:w-[40vw] items-center"
                    : ""
                }`}
              >
                {selectedItems.length > 0 && (
                  <button
                    type="button"
                    className=" text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
                    onClick={handleUndoDelete}
                  >
                    <FontAwesomeIcon icon={faTrashArrowUp} className="mr-2" />
                    Restore
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* group by elment */}
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
                onChange={(selected) =>
                  setGroupByColumn(selected?.value || null)
                }
                styles={customStyles}
                className="min-w-[200px] text-sm"
              />
            </div>

            {/* search bar */}
            <div className="w-[200px] mt-0.5">
              <SearchBar searchTable="recycleBin" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 ml-auto py-2">
          <div className="flex flex-col">
            <div className={`rounded-lg `}>
              <ResizableTable
                data={transformDataForGrouping(
                  searchApplied ? transformedSearchData : transformedLogs
                )}
                loading={isLoading}
                columnsHeading={columns}
                selectedItems={selectedItems}
                rowKeys={rowData}
                OnChangeHandler={OnChangeHandler}
                isRecycleBin={isRecycleBin}
                searchTerm={searchValue}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                groupByColumn={groupByColumn}
                expandedGroups={expandedGroups}
                setExpandedGroups={setExpandedGroups}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecycleBin;
