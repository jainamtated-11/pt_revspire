import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";
import SearchBar from "../../../utility/SearchBar.jsx";
import Select from "react-select";
import { X } from "lucide-react";
import DataEnrichmentCRUD from "./DataEnrichmentCRUD.jsx";
import AddDataEnrichmentDialog from "./AddDataEnrichmentDialog.jsx";
import {
  fetchProvidersAsync,
} from "../../../features/dataEnrichment/dataEnrichmentSlice.js";
import { useCookies } from "react-cookie";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from '../../../features/search/searchSlice';

function DataEnrichmentMain() {
  const [addDialog, setAddDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "updated_at", direction: "desc" });

  const { viewer_id,  baseURL} = useContext(GlobalContext);
  const [cookies] = useCookies("userData");
  const organisation_id = cookies.userData?.organisation?.id;

  useEffect(() => {
    console.log("orgid here", organisation_id);
  }, []);

  const dispatch = useDispatch();
  const { providers, loading } = useSelector((state) => state.dataEnrichment);
  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  useEffect(() => {
    dispatch(fetchProvidersAsync({ baseURL, viewer_id, organisation_id }));
    console.log("this is the baseurl :", baseURL);
  }, [viewer_id, organisation_id, dispatch, baseURL]);

  // Set up search slice like ProfileManagement
  useEffect(() => {
    dispatch(SetSearchTable("dataEnrichment"));
    dispatch(SetSearchFields([
      "name",
      "provider",
      "username",
      "active",
      "is_primary",
      "created_at",
      "updated_at",
      "owner_name"
    ]));
    dispatch(SetInitialData(providers));
    dispatch(SetSearchData(providers));
  }, [providers, dispatch]);

  // Table columns and rows
  const columns = [
    "Name", "Provider", "Username", "Active", "Primary", "Created At", "Updated At", "Owner"
  ];
  const rows = [
    "name", "provider", "username", "active", "is_primary", "created_at", "updated_at", "owner_name"
  ];

  // Group by options
  const groupByOptions = [
    { value: "", label: "No grouping" },
    ...rows.map((col) => ({
      value: col,
      label: col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    })),
  ];

  const handleSelectedItemsChange = (items) => {
    if (Array.isArray(items)) {
      setSelectedItems(items);
    } else if (items) {
      setSelectedItems([items]);
    } else {
      setSelectedItems([]);
    }
  };

  return (
    <div className="flex flex-col pt-2">
      {addDialog && <AddDataEnrichmentDialog setAddDialog={setAddDialog} />}
      <div className="container flex flex-row justify-between mx-auto px-4 pt-4 w-full">
        <div className="flex w-full items-center justify-between space-x-4">
          <DataEnrichmentCRUD
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            setAddDialog={setAddDialog}
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
                value={groupByOptions.find(option => option.value === groupByColumn) || null}
                onChange={(selected) => setGroupByColumn(selected?.value || null)}
                className="min-w-[200px]"
              />
            </div>
            <div className="w-[200px] mt-0.5">
              <SearchBar searchTable="dataEnrichment" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 ml-auto py-2">
        <div className="flex flex-col">
          <div className="rounded-lg">
            <ResizableTable
              rowKeys={rows}
              columnsHeading={columns}
              data={searchApplied ? searchData : providers}
              OnChangeHandler={handleSelectedItemsChange}
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
              OnClickHandler={() => {}} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataEnrichmentMain;