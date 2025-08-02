import React, { useCallback, useEffect, useRef, useState } from "react";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import Emails from "./Emails-Mailbox.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { useContext } from "react";
import toast from "react-hot-toast";
import ResizableTable from "../../../../utility/CustomComponents/ResizableTable.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../../features/search/searchSlice.js";
import SearchBar from "../../../../utility/SearchBar.jsx";
import AddMailDialog from "./AddMailDialog.jsx";
import CrudMail from "./CrudMail.jsx";
import Select from "react-select";
import { X } from "lucide-react";
import EmailInterface from "./EmailInterface.jsx";

function AllMails() {
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { viewer_id, organisation_id } = useContext(GlobalContext); // Access global context
  const axiosInstance = useAxiosInstance(); // Use the axios instance
  const [addMail, setAddMail] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const [sortConfig, setSortConfig] = useState({key:"Updated At",direction:"desc"});
  const [selectedRowData, setSelectedRowData] = useState(null);

  // Email Modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Group by state
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const dispatch = useDispatch();

  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  // Define rowData for grouping options
  const rowData = [
    "full_name",
    "email",
    "provider",
    "primary",
    "created_at",
    "updated_at",
    "is_active",
  ];

  // Group by options
  const groupByOptions = [
    { value: "", label: "No grouping", isCustom: false },
    ...(rowData?.map((column) => ({
      value: column,
      label: column.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      isCustom: false,
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
  
  const openEmailModal = () => {
    setShowEmailModal(true);
    // Reset pagination when opening modal
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const mailType = urlParams.get("mailType");
    const urlViewerId = urlParams.get("viewer_id");
    
    if (code && mailType && urlViewerId) {
      // Clear URL parameters after extracting them
      window.history.replaceState({}, document.title, window.location.pathname);

      const provider =
        mailType === "Gmail"
          ? "Google"
          : mailType === "Outlook"
          ? "Microsoft"
          : mailType === "Yahoo"
          ? "Yahoo"
          : mailType === "Zoho"
          ? "Zoho"
          : null;

      if (!provider) {
        toast.error("Invalid mail provider.");
        return;
      }

      const updateTokens = async () => {
        return axiosInstance.post("/email/update-tokens", {
          viewer_id: urlViewerId,
          code,
          provider,
          organisation_id,
        });
      };

      toast.promise(updateTokens(), {
        loading: "Linking email account...",
        success: "Email account linked successfully!",
        error: "Failed to update tokens.",
      });
    }
  }, []); // Runs only once

  const fetchEmailAccounts = useCallback(async () => {
    try {
      const response = await axiosInstance.post(
        "/email/view-email-accounts",
        {
          viewer_id,
          organisation_id,
        }
      );

      if (response.data.success) {
        setEmailAccounts(response.data.emailAccounts);
        dispatch(SetInitialData(response.data.emailAccounts));
        dispatch(SetSearchData(response.data.emailAccounts));
      } else {
        toast.error("Failed to fetch email accounts");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching email accounts");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Fetch email accounts when the component mounts
  useEffect(() => {
    fetchEmailAccounts();
  }, [viewer_id, organisation_id]); // Dependencies for useEffect

  useEffect(() => {
    dispatch(SetInitialData(emailAccounts));
    dispatch(SetSearchData(emailAccounts));
    dispatch(SetSearchTable("allMails"));
    dispatch(
      SetSearchFields([
        "full_name",
        "email",
        "provider",
        "primary",
        "created_at",
        "updated_at",
        "is_active",
      ])
    );
  }, [searchValue]);

  const OnChangeHandler = (data) => {
    if (data === emailAccounts || data.length === 0) {
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

  // Define the columns for the table
  const columns = [
    "Full Name",
    "Email",
    "Provider",
    "Primary",
    "Created At",
    "Updated At",
    "Active",
  ];

  // Transform the email accounts data into rows for the table
  const rows = [
    "full_name",
    "email",
    "provider",
    "primary",
    "created_at",
    "updated_at",
    "is_active",
  ];

  const OnClickHandler = (row) => {
    console.log("Clicked row data:", row);
    // Later we can use this to open the email modal
    setSelectedRowData(row);
    openEmailModal(row);
  };



  console.log("Selected Items", selectedItems);
  return (
    <div className="flex flex-col pt-2">
      {addMail && <AddMailDialog setAddMail={setAddMail} fetchEmailAccounts={fetchEmailAccounts} />}
      <div className="container flex flex-row justify-between mx-auto px-4 pt-4 w-full">
        <div className="flex w-full  items-center justify-between space-x-4">
          <CrudMail 
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            setAddMail={setAddMail}
            fetchEmailAccounts={fetchEmailAccounts}
          />
         <div className="w-full flex items-center justify-end space-x-2">
           
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
              className="min-w-[200px]"
            />
          </div>


          <div className="w-[200px] mt-0.5">
            <SearchBar searchTable="allMails" />
            </div>

            
         </div>
        </div>
      </div>

      <div className="container mx-auto px-4 ml-auto py-2">
        <div className="flex flex-col">
          <div className={`rounded-lg`}>
            <ResizableTable
              rowKeys={rows}
              columnsHeading={columns}
              data={searchApplied ? searchData : emailAccounts}
              OnChangeHandler={OnChangeHandler}
              selectedItems={selectedItems}
              isMultiSelect={true}
              highlightText={true}
              searchTerm={searchValue}
              loading={loading}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
              groupByColumn={groupByColumn}
              expandedGroups={expandedGroups}
              setExpandedGroups={setExpandedGroups}
              OnClickHandler={(row) => OnClickHandler(row)} // Updated this line
            />
          </div>
        </div>
      </div>

      {/* the one with no paginations */}

      {/* {showEmailModal && (
        <Emails
          showEmailModal={showEmailModal}
          setShowEmailModal={setShowEmailModal}
          emailData={selectedRowData}
        />
      )} */}

      {/* the one with paginations */}
      {showEmailModal && (
        <EmailInterface
          showEmailModal={showEmailModal}
          setShowEmailModal={setShowEmailModal}
          emailData={selectedRowData}
        />
      )}


    </div>
  );
}

export default AllMails;
