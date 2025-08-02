import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import LoadingSpinner from "../../../utility/LoadingSpinner.jsx";
import PitchStreamCRUD from "./PitchStreamCRUD.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPitchStreamsAsync,
  SelectPitchStream,
  UnselectPitchStream,
  DeactivePitchStreamCount,
  ActivePitchStreamCount,
  SelectAllPitchStream,
  SortPitchStreamData,
} from "../../../features/pitchStreams/pitchStreamsSlice.js";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";

const getGroupByOptions = (pitchStreams) => {
  const customFields = new Set();

  pitchStreams.forEach((pitchStream) => {
    if (pitchStream.custom_field_value && pitchStream.custom_field_value.length > 0) {
      pitchStream.custom_field_value.forEach((field) => {
        const fieldName = field.custom_field_name
          .replace(/_/g, " ") // Replace underscores with spaces
          .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letters
        customFields.add(fieldName);
      });
    }
  });

  return Array.from(customFields);
};

export default function PitchStreams() {
  
  const { viewer_id, showButtonLoading, baseURL, globalOrgId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [pitchStreamToEdit, setPitchStreamToEdit] = useState(null);

  const pitchStreams = useSelector((state) => state.pitchStreams.pitchStreams);
  const loading = useSelector((state) => state.pitchStreams.loading);

  const filter = useSelector((state) => state.filter);
  const filterData = useSelector((state) => state.filter.filterData);
  const selectedPitchStreams = useSelector((state) => state.pitchStreams.selectedPitchStreams);

  const dispatch = useDispatch();

  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  // Define rowData before using it in groupByOptions
  const rowData = [
    "name",
    "owner_name",
    "created_by_name",
    "created_at",
    "updated_by_name",
    "updated_at",
    "active",
  ];
  
  // Group by state and options
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  
  // Get custom fields for grouping
  const customFieldsForGrouping = getGroupByOptions(pitchStreams);
  
  // Group by options with custom field flag
  const groupByOptions = [
    { value: "", label: "No grouping", isCustom: false },
    ...(rowData?.map((column) => ({
      value: column,
      label: column.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      isCustom: false,
    })) || []),
    ...(customFieldsForGrouping.map((field) => ({
      value: field,
      label: field,
      isCustom: true,
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

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const pitchStreamId = searchParams.get("pitchStream");
    if (pitchStreamId) {
      setPitchStreamToEdit(pitchStreamId);
    }
    if (searchParams.has("pitchStream")) {  
      searchParams.delete("pitchStream");
      navigate(`${location.pathname}`, { replace: true });
    }
  }, [location]);

  useEffect(() => {
    if (selectedPitchStreams.length > 0) {
      let activeCount = 0;
      let deActiveCount = 0;
      for (let i = 0; i < selectedPitchStreams.length; i++) {
        if (selectedPitchStreams[i].active == 1) {
          activeCount++;
        } else {
          deActiveCount = deActiveCount + 1;
        }
      }
      dispatch(ActivePitchStreamCount(activeCount));
      dispatch(DeactivePitchStreamCount(deActiveCount));
    }
  }, [selectedPitchStreams]);

  useEffect(() => {
    dispatch(
      fetchPitchStreamsAsync({
        sortColumn: "name",
        sortOrder: "ASC",
        viewer_id: viewer_id,
        baseURL: baseURL,
        organisation_id:globalOrgId,
      })
    );
  }, []);

  useEffect(() => {
    dispatch(SelectAllPitchStream([]));
  }, [dispatch]);

  useEffect(() => {
    if (filter.filterApplied) {
      dispatch(SetInitialData(filter.filterData));
      dispatch(SetSearchData(filter.filterData));
    } else {
      console.log("Filter Not Applied");
      dispatch(SetInitialData(pitchStreams));
      dispatch(SetSearchData(pitchStreams));
    }
    dispatch(SetSearchTable("pitchStream"));
    dispatch(SetSearchFields(["name"]));
  }, [pitchStreams, dispatch, searchValue]);

  // Transform pitch streams to include custom field values with proper keys
  const transformPitchStreamForGrouping = (pitchStream) => {
    const transformed = {
      ...pitchStream,
      "Created At": pitchStream.created_at || "N/A",
      "Created By": pitchStream.created_by_name || "N/A",
      "Updated By": pitchStream.updated_by_name || "N/A",
      "Updated At": pitchStream.updated_at || "N/A",
    };

    // Add custom fields with formatted keys
    if (pitchStream.custom_field_value && pitchStream.custom_field_value.length > 0) {
      pitchStream.custom_field_value.forEach((field) => {
        const fieldKey = field.custom_field_name
          .replace(/_/g, " ") // Replace underscores with spaces
          .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letters
        transformed[fieldKey] = field.value || "N/A";
      });
    }

    return transformed;
  };

  const transformedPitchStreams = pitchStreams.map(transformPitchStreamForGrouping);
  const transformedFilterPitchStreams = filterData.map(transformPitchStreamForGrouping);
  const transformedSearchPitchStreams = searchData.map(transformPitchStreamForGrouping);

  const columns = [
    "name",
    "owner",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
    "Active",
  ];

  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});

  const OnChangeHandler = (data) => {
    console.log("data", data);
    if (data?.length == 0) dispatch(SelectAllPitchStream(data));
    else if (data == pitchStreams) dispatch(SelectAllPitchStream([]));
    const idx = selectedPitchStreams.findIndex(
      (selectedItem) => selectedItem.id === data.id
    );

    if (Array.isArray(data)) {
      dispatch(SelectAllPitchStream(data));
    } else if (idx === -1) {
      dispatch(SelectPitchStream(data));
    } else {
      dispatch(UnselectPitchStream(data));
    }
  };

  const SortHandler = (data) => {
    dispatch(SortPitchStreamData(data));
  };

  const OnClickHandler = (id) => {
    console.log("id", id);
  };

  if (showButtonLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <PitchStreamCRUD 
          pitchStreamToEdit={pitchStreamToEdit} 
          setPitchStreamToEdit={setPitchStreamToEdit}
          groupByColumn={groupByColumn}
          setGroupByColumn={setGroupByColumn}
          groupByOptions={groupByOptions}
          customStyles={customStyles}
        />
      </div>
      <div className="container mx-auto px-4 ml-auto py-2.5">
        <div className="flex flex-col">
          <div className="rounded-lg">
            {searchApplied ? (
              <ResizableTable
                data={transformedSearchPitchStreams}
                columnsHeading={columns}
                loading={false}
                rowKeys={rowData}
                OnChangeHandler={OnChangeHandler}
                selectedItems={selectedPitchStreams}
                SortHandler={SortHandler}
                OnClickHandler={OnClickHandler}
                searchTerm={searchValue}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                groupByColumn={groupByColumn}
                expandedGroups={expandedGroups}
                setExpandedGroups={setExpandedGroups}
              />
            ) : filter.filterApplied ? (
              <ResizableTable
                data={transformedFilterPitchStreams}
                columnsHeading={columns}
                loading={loading}
                rowKeys={rowData}
                OnChangeHandler={OnChangeHandler}
                selectedItems={selectedPitchStreams}
                SortHandler={SortHandler}
                OnClickHandler={OnClickHandler}
                searchTerm={searchValue}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                groupByColumn={groupByColumn}
                expandedGroups={expandedGroups}
                setExpandedGroups={setExpandedGroups}
              />
            ) : (
              <ResizableTable
                data={transformedPitchStreams}
                columnsHeading={columns}
                loading={loading}
                rowKeys={rowData}
                OnChangeHandler={OnChangeHandler}
                selectedItems={selectedPitchStreams}
                OnClickHandler={OnClickHandler}
                searchTerm={searchValue}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                groupByColumn={groupByColumn}
                expandedGroups={expandedGroups}
                setExpandedGroups={setExpandedGroups}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
