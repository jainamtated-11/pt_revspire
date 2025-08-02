import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import LoadingSpinner from "../../../utility/LoadingSpinner.jsx";
import PitchCRUD from "./PitchCRUD.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPitchesAsync,
  SelectPitch,
  UnselectPitch,
  DeactivePitchCount,
  ActivePitchCount,
  SelectAllPitch,
  SortPitchData,
} from "../../../features/pitch/pitchSlice.js";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";
import { useCookies } from "react-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";

const getGroupByOptions = (pitches) => {
  const customFields = new Set();

  pitches.forEach((pitch) => {
    if (pitch.custom_field_value && pitch.custom_field_value.length > 0) {
      pitch.custom_field_value.forEach((field) => {
        const fieldName = field.custom_field_name
          .replace(/_/g, " ") // Replace underscores with spaces
          .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letters
        customFields.add(fieldName);
      });
    }
  });

  return Array.from(customFields);
};

export default function PitchContent() {
  const { viewer_id, showButtonLoading, baseURL } = useContext(GlobalContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [pitchToEdit, setPitchToEdit] = useState(null);

  const pitches = useSelector((state) => state.pitches.pitches);
  const loading = useSelector((state) => state.pitches.loading);

  const filter = useSelector((state) => state.filter);
  const filterData = useSelector((state) => state.filter.filterData);
  const selectedPitches = useSelector((state) => state.pitches.selectedPitches);

  const dispatch = useDispatch();

  const [cookies] = useCookies(["userData", "revspireToken"]);
  const organisation_id = cookies.userData?.organisation?.id;
  const rawCookie = cookies?.userData;
  const cookieValue = cookies?.revspireToken;

  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  // Highlighted: State for pitches with custom links
  const [pitchesWithCustomLinks, setPitchesWithCustomLinks] = useState([]);

  const customFieldsForGrouping = getGroupByOptions(pitches);

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
    const pitchId = searchParams.get("pitchId");
    const routeToPitch = searchParams.get("routeToPitch");

    // Proceed only if both params are present and routeToPitch is true
    if (pitchId && routeToPitch === "true") {
      setPitchToEdit(pitchId);

      // Clean up URL by removing both params
      searchParams.delete("pitchId");
      searchParams.delete("routeToPitch");
      navigate(`${location.pathname}`, { replace: true });
    }
  }, [location]);

  useEffect(() => {
    if (selectedPitches.length > 0) {
      let activeCount = 0;
      let deActiveCount = 0;
      for (let i = 0; i < selectedPitches.length; i++) {
        if (selectedPitches[i].active == 1) {
          activeCount++;
        } else {
          deActiveCount = deActiveCount + 1;
        }
      }
      dispatch(ActivePitchCount(activeCount));
      dispatch(DeactivePitchCount(deActiveCount));
    }
  }, [selectedPitches]);

  useEffect(() => {
    dispatch(
      fetchPitchesAsync({
        sortColumn: "name",
        sortOrder: "ASC",
        viewer_id: viewer_id,
        baseURL: baseURL,
        organisation_id,
      })
    );
  }, []);

  useEffect(() => {
    dispatch(SelectAllPitch([]));
  }, [dispatch]);

  useEffect(() => {
    if (filter.filterApplied) {
      dispatch(SetInitialData(filter.filterData));
      dispatch(SetSearchData(filter.filterData));
    } else {
      console.log("Filter Not Applied");
      dispatch(SetInitialData(pitches));
      dispatch(SetSearchData(pitches));
    }
    dispatch(SetSearchTable("pitch"));
    dispatch(SetSearchFields(["name"]));
  }, [pitches, dispatch, searchValue]);

  // Transform pitches to include custom field values with proper keys
  const transformPitchForGrouping = (pitch) => {
    const transformed = {
      ...pitch,
      "Created At": pitch.created_at || "N/A",
      "Created By": pitch.created_by_name || "N/A",
      "Updated By": pitch.updated_by_name || "N/A",
      "Updated At": pitch.updated_at || "N/A",
    };

    // Add custom fields with formatted keys
    if (pitch.custom_field_value && pitch.custom_field_value.length > 0) {
      pitch.custom_field_value.forEach((field) => {
        const fieldKey = field.custom_field_name
          .replace(/_/g, " ") // Replace underscores with spaces
          .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letters
        transformed[fieldKey] = field.value || "N/A";
      });
    }

    return transformed;
  };

  const transformedPitches = pitches.map(transformPitchForGrouping);
  const transformedFilterPitches = filterData.map(transformPitchForGrouping);
  const transformedSearchPitches = searchData.map(transformPitchForGrouping);

  const columns = [
    "name",
    "owner",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
    "Active",
  ];

  const OnChangeHandler = (data) => {
    if (data?.length == 0) dispatch(SelectAllPitch(data));
    else if (data == pitches) dispatch(SelectAllPitch([]));
    const idx = selectedPitches.findIndex(
      (selectedItem) => selectedItem.id === data.id
    );

    if (Array.isArray(data)) {
      dispatch(SelectAllPitch(data));
    } else if (idx === -1) {
      dispatch(SelectPitch(data));
    } else {
      dispatch(UnselectPitch(data));
    }
  };

  const [sortConfig, setSortConfig] = useState({
    key: "Updated At",
    direction: "desc",
  });

  const SortHandler = (data) => {
    const direction =
      sortConfig.key === data && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ key: data, direction });
    // dispatch(SortPitchData({ key: data, direction })); // Pass the sort config to the dispatch
    dispatch(SortPitchData(data));
  };

  const encodedBaseURL = encodeURIComponent(baseURL);

  const OnClickHandler = (id) => {
    if (rawCookie && cookieValue) {
      window.open(`/dsr/${id}?apiURL=${encodedBaseURL}`, "_blank");
    } else {
      window.open(`/pitchlogin/${id}?apiURL=${encodedBaseURL}`, "_blank");
    }
  };

  // Update pitches with custom links whenever pitches change
  useEffect(() => {
    const filteredPitches = pitches.filter(
      (pitch) => pitch.pitch_custom_link !== null
    );
    setPitchesWithCustomLinks(filteredPitches);
  }, [pitches]);

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
        <PitchCRUD
          pitchToEdit={pitchToEdit}
          setPitchToEdit={setPitchToEdit}
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
                data={transformedSearchPitches}
                isPitchComponent={true}
                columnsHeading={columns}
                loading={false}
                rowKeys={rowData}
                OnChangeHandler={OnChangeHandler}
                selectedItems={selectedPitches}
                SortHandler={SortHandler}
                OnClickHandler={OnClickHandler}
                searchTerm={searchValue}
                pitchesWithCustomLinks={pitchesWithCustomLinks}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                customGroupByOptions={customFieldsForGrouping}
                groupByColumn={groupByColumn}
                expandedGroups={expandedGroups}
                setExpandedGroups={setExpandedGroups}
              />
            ) : filter.filterApplied ? (
              <ResizableTable
                data={transformedFilterPitches}
                isPitchComponent={true}
                columnsHeading={columns}
                loading={loading}
                rowKeys={rowData}
                OnChangeHandler={OnChangeHandler}
                selectedItems={selectedPitches}
                SortHandler={SortHandler}
                OnClickHandler={OnClickHandler}
                searchTerm={searchValue}
                pitchesWithCustomLinks={pitchesWithCustomLinks}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                customGroupByOptions={customFieldsForGrouping}
                groupByColumn={groupByColumn}
                expandedGroups={expandedGroups}
                setExpandedGroups={setExpandedGroups}
              />
            ) : (
              <ResizableTable
                data={transformedPitches}
                isPitchComponent={true}
                columnsHeading={columns}
                loading={loading}
                rowKeys={rowData}
                OnChangeHandler={OnChangeHandler}
                selectedItems={selectedPitches}
                OnClickHandler={OnClickHandler}
                searchTerm={searchValue}
                pitchesWithCustomLinks={pitchesWithCustomLinks}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                customGroupByOptions={customFieldsForGrouping}
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
