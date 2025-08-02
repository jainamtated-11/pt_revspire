import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { formatDate } from "../../constants";
import TableLoading from "../../components/MainDashboard/ContentManager/ContentTable/TableLoading";
import EmptyFolderComponent from "../../components/MainDashboard/ContentManager/ContentTable/EmptyFolderComponent";
import { getIcon } from "../../components/MainDashboard/ContentManager/ContentTable/ContentTable";
import { useContext } from "react";
import { GlobalContext } from "../../context/GlobalState";
import HighlightText from "../../utility/HighlightText.jsx";
import { FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import CopyIcon from "../../../src/assets/icons8-copy-50.png";
import { ChevronDown, ChevronRight } from "lucide-react";
import ReactDOM from "react-dom";

const createHeaders = (headers) => {
  return headers.map((item) => ({
    header: item,
    accessorKey: item,
  }));
};

const ResizableTable = ({
  data,
  isRecycleBin,
  isPitchComponent=false,
  columnsHeading,
  OnClickHandler,
  OnChangeHandler,
  selectedItems,
  loading,
  rowKeys,
  disableSelectAll,
  noCheckbox,
  heightNotFixed,
  searchTerm,
  table,
  pitchesWithCustomLinks,
  sortConfig,
  setSortConfig,
  groupByColumn,
  expandedGroups,
  setExpandedGroups,
}) => {
  const [hoveredPitchId, setHoveredPitchId] = useState(null); // State to track hovered pitch
  const [copied, setCopied] = useState(false);

  const [tableData, setTableData] = useState(data);

  const { setHideFilter, setHelpHideFilter } =
    useContext(GlobalContext);
  const thRefs = useRef([]);
  const [resizing, setResizing] = useState(false);
  const [resizeIndex, setResizeIndex] = useState(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  useEffect(() => {
    if (!sortConfig || !sortConfig.key) {
      // If sortConfig is not defined or key is not set, do not sort
      setTableData(data); // Use the original data
      return;
    }

    // console.log(`sortConfig ${sortConfig}  and setSortConfig ${setSortConfig} `)

    // Sort the data based on the sortConfig
    const sortedData = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key] !== undefined ? a[sortConfig.key] : ""; // Fallback to empty string
      const bValue = b[sortConfig.key] !== undefined ? b[sortConfig.key] : ""; // Fallback to empty string

      // Handle date fields specifically if needed
      if (sortConfig.key === "created_at" || sortConfig.key === "updated_at") {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      // For other fields, ensure they are strings before calling localeCompare
      return sortConfig.direction === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    setTableData(sortedData);
  }, [data, sortConfig]);

  const [groupedData, setGroupedData] = useState([]);

  useEffect(() => {
    if (!groupByColumn) {
      setGroupedData([]);
      return;
    }

    // Group the data by the selected column
    const groups = {};
    tableData.forEach((row) => {
      const groupValue = row[groupByColumn] || "No Value Found";
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(row);
    });

    // Convert to array format for rendering
    const groupedArray = Object.entries(groups).map(([key, rows]) => ({
      groupKey: key,
      rows: rows,
      count: rows.length,
    }));

    // Sort the groups alphabetically by group key
    groupedArray.sort((a, b) => a.groupKey.localeCompare(b.groupKey));

    setGroupedData(groupedArray);

    // Initialize all groups as expanded if not already set
    if (Object.keys(expandedGroups).length === 0) {
      const newExpandedGroups = {};
      groupedArray.forEach((group) => {
        newExpandedGroups[group.groupKey] = true;
      });
      setExpandedGroups(newExpandedGroups);
    }
  }, [tableData, groupByColumn, expandedGroups, setExpandedGroups]);

  const columns = createHeaders(columnsHeading);
  useEffect(() => {
    thRefs.current = thRefs.current.slice(0, columns.length);
  }, []);

  const handleSort = (key) => {
    console.log("Sorting by:", key); // Log the key being sorted
    const direction =
      sortConfig && sortConfig.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    console.log("New direction:", direction); // Log the new direction

    // Update the sort configuration
    setSortConfig({ key, direction });

    // Update tableData based on the new sort configuration
    setTableData((prevTableData) => {
      return [...prevTableData].sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        console.log(`Comparing aValue: ${aValue} and bValue: ${bValue}`); // Log values being compared

        // Handle undefined values
        const aValueStr = aValue !== undefined ? String(aValue) : "";
        const bValueStr = bValue !== undefined ? String(bValue) : "";

        // Sort logic
        if (aValueStr < bValueStr) return direction === "asc" ? -1 : 1;
        if (aValueStr > bValueStr) return direction === "asc" ? 1 : -1;
        return 0;
      });
    });
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-4 h-4 ml-2 text-gray-500" />; // Default both arrows
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-2 text-gray-500" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-2 text-gray-500" />
    );
  };

  const handleResizeStart = (index, event) => {
    setResizing(true);
    setResizeIndex(index);
    setResizeStartX(event.pageX);
    setResizeStartWidth(thRefs.current[index]?.offsetWidth || 0);
  };

  const handleResizeMove = (event) => {
    if (!resizing || resizeIndex === null) return;

    const diff = event.pageX - resizeStartX;
    const newWidth = Math.max(resizeStartWidth + diff, 50);

    if (thRefs.current[resizeIndex]) {
      thRefs.current[resizeIndex].style.minWidth = `${newWidth}px`;
      thRefs.current[resizeIndex].style.width = `${newWidth}px`;
      thRefs.current[resizeIndex].style.maxWidth = `${newWidth}px`;
    }
  };

  const handleResizeEnd = () => {
    if (!resizing || resizeIndex === null) return;
    setResizing(false);
    setResizeIndex(null);
  };

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [resizing]);

  const isAllSelected =
    selectedItems?.length === tableData?.length &&
    Object.values(selectedItems).every(Boolean);

  const handleClick = (row) => {
    OnClickHandler(row?.id);
    setHideFilter(false);
    setHelpHideFilter(false);
  };

  const handleChange = (row) => {
    OnChangeHandler(row);
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const CrmStatusDot = ({ row }) => {
    const [showPopover, setShowPopover] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const dotRef = useRef(null);
    const timeoutRef = useRef(null);

    const show = () => {
      clearTimeout(timeoutRef.current);
      const rect = dotRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY + 20,
        left: rect.left + window.scrollX,
      });
      setShowPopover(true);
    };

    const hide = () => {
      timeoutRef.current = setTimeout(() => setShowPopover(false), 200);
    };

    const crmStatusDotStyle = {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      marginLeft: "6px",
      display: "inline-block",
      flexShrink: 0,
      backgroundColor: row.crm_stage_color,
      border: `1px solid ${row.crm_stage_color}`,
      boxShadow: `0 0 0 1px white, 0 0 4px ${row.crm_stage_color}`,
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "pointer",
    };

    const popoverStyle = {
      position: "absolute",
      top: `${position.top}px`,
      left: `${position.left}px`,
      backgroundColor: "#fff",
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "10px",
      zIndex: 9999,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      fontSize: "12px",
      whiteSpace: "nowrap",
      minWidth: "200px",
    };

    return (
      <>
        <div
          ref={dotRef}
          style={crmStatusDotStyle}
          onMouseEnter={show}
          onMouseLeave={hide}
        />
        {showPopover &&
          ReactDOM.createPortal(
            <div
              style={popoverStyle}
              onMouseEnter={() => clearTimeout(timeoutRef.current)}
              onMouseLeave={hide}
              onClick={(e) => e.stopPropagation()}
            >
              <div><strong>Stage:</strong> {row.crm_stage_name || "N/A"}</div>
              <div><strong>Currency:</strong> {row.crm_currency_iso || "N/A"}</div>
              <div><strong>Amount:</strong> {row.crm_amount || "N/A"}</div>
              <div><strong>CRM Record:</strong>{" "}
                {row.crm_record_link ? (
                  <a href={row.crm_record_link} target="_blank" rel="noopener noreferrer">
                    View Record
                  </a>
                ) : (
                  "N/A"
                )}
              </div>
            </div>,
            document.body
          )}
      </>
    );
  };

  if (loading) {
    return (
      <TableLoading
        columns={columnsHeading.length}
        rows={table === "pitch" ? 6 : 10}
      />
    );
  }
  return (
    <div
      className={`w-full relative ${
        !heightNotFixed && (table === "pitch" ? "h-[44vh]" : "h-[80vh]")
      } `}
    >
      <div className="overflow-auto h-full scrollbar-thin border-2 rounded-md">
        <table className="w-full table-fixed border-collapse relative">
          <thead className="sticky top-0 bg-gray-100 shadow-md z-10">
            <tr>
              {!noCheckbox && (
                <th className="p-3 font-semibold text-left border-b w-[50px] whitespace-nowrap bg-gray-100">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={() => {
                        if (disableSelectAll) return;
                        if (isAllSelected) OnChangeHandler([]);
                        else OnChangeHandler(tableData);
                      }}
                      className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-[#d0acad] checked:border-[#d0acad] focus:outline-none focus:ring-2 focus:ring-[#d0acad] focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                      disabled={disableSelectAll}
                    />
                  </div>
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={column.accessorKey || index}
                  ref={(el) => (thRefs.current[index] = el)}
                  className="relative font-semibold text-left border-b overflow-hidden whitespace-nowrap hover:bg-gray-200 bg-gray-100"
                  style={{ width: "200px" }}
                >
                  <div className="flex items-center justify-between overflow-hidden hover:bg-gray-200">
                    <button
                      onClick={() => handleSort(column.accessorKey)}
                      className="flex items-center justify-between w-full h-full px-2 py-1 text-left focus:outline-none transition-colors duration-200"
                    >
                      <span className="text-sm font-bold text-gray-700 capitalize truncate">
                        {column.header}
                      </span>
                      {getSortIcon(column.accessorKey)}
                    </button>
                  </div>
                  <div
                    className="absolute top-0 right-0 w-3 h-full cursor-col-resize group"
                    onMouseDown={(e) => handleResizeStart(index, e)}
                  >
                    <div
                      className={`absolute right-1 w-px h-full bg-gray-300 transition-all duration-200
                        ${
                          (resizing && resizeIndex === index) ||
                          "group-hover:bg-[#014d83] group-hover:w-1"
                        }
                        ${
                          resizing && resizeIndex === index
                            ? "bg-[#014d83] w-1.5"
                            : ""
                        }
                      `}
                    ></div>
                    <div className="absolute right-1 w-0.5 h-full bg-[#014d83] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-sans text-sm">
            {data?.length === 0 ? (
              <EmptyFolderComponent />
            ) : !groupByColumn ? (
              tableData?.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  id={`row-${row.id}`}
                  className="bg-white hover:bg-gray-100 transition-colors duration-150"
                  onMouseEnter={() => {
                    if (
                      pitchesWithCustomLinks &&
                      pitchesWithCustomLinks.some(
                        (pitch) => pitch.id === row.id
                      )
                    ) {
                      setHoveredPitchId(row.id);
                      const rowElement = document.getElementById(
                        `row-${row.id}`
                      );
                      if (rowElement) {
                        // We're not using buttonPosition anymore, but keeping the code for future use
                        // setButtonPosition({
                        //   top: rect.top + window.scrollY + 500,
                        //   left: rect.left + window.scrollX + rect.width + 200,
                        // });
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    if (pitchesWithCustomLinks) {
                      setHoveredPitchId(null);
                      // We're not using buttonPosition anymore, but keeping the code for future use
                      // setButtonPosition({ top: 20, left: 20 });
                    }
                  }}
                >
                  {!noCheckbox && (
                    <td className="p-3 border-b whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems?.some(
                          (item) =>
                            item.id === row.id ||
                            item.contact_sfdc_id === row.id
                        )}
                        onChange={() => handleChange(row)}
                        className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-[#d0acad] checked:border-[#d0acad] focus:outline-none focus:ring-2 focus:ring-[#d0acad] focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                      />
                    </td>
                  )}
                  {rowKeys?.map((column) => (
                    <td
                      key={`${row.id || rowIndex}-${column}`}
                      className={`p-3 border-b overflow-hidden whitespace-nowrap ${
                        OnClickHandler ? "cursor-pointer" : ""
                      }`}
                      onClick={(e) => {
                        if ( (column === "name" || column == "full_name" || column == "email" )  && !e.target.closest("button")) {
                          handleClick(row);
                        }
                      }}
                    >
                      <div
                        className={`truncate ${
                          column === "name"
                            ? "flex justify-between items-center"
                            : ""
                        }`}
                      >
                        {column === "active" || column === "is_active" || column == "status" ? (
                          <div className="flex justify-center items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                row[column] === 1
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                          </div>
                        ) : column === "is_primary" ||
                          column == "primary" ? (
                          <div className="flex justify-center items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                row[column] === 1
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                          </div>
                        ) : [
                            "created_at",
                            "updated_at",
                            "delete_date",
                            "Consumed On",
                          ].includes(column) ? (
                          formatDate(row[column])
                        ) : isRecycleBin && column === "name" ? (
                          <div className="flex gap-2">
                            {getIcon(row)}
                            <HighlightText
                              text={row[column]}
                              searchTerm={searchTerm}
                            />
                          </div>
                        ) : column == "Cost" ? (
                          row[column].toFixed(8)
                        ) : column == "Rate USD" ? (
                          row[column].toFixed(8)
                        ) : (
                          <>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                minWidth: "150px",
                                justifyContent: "space-between",
                              }}
                            >
                              {/* Truncated Text */}
                              <div
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  flexGrow: 1,
                                  paddingRight: "2px",
                                }}
                              >
                                <HighlightText text={row[column]} searchTerm={searchTerm} />
                              </div>

                              {/* Always-visible Copy Button and Color Dot */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  flexShrink: 0,
                                  gap: "6px", // Adds spacing between dot and copy button
                                }}
                              >
                                {/* Copy Button */}
                                {column === "name" &&
                                  hoveredPitchId === row.id &&
                                  row.pitch_custom_link && (
                                    <button
                                      className="relative text-white rounded z-[999]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const row = data.find((item) => item.id === hoveredPitchId);
                                        if (row?.pitch_custom_link) {
                                          navigator.clipboard
                                            .writeText(row.pitch_custom_link)
                                            .then(() => {
                                              setCopied(true);
                                              setTimeout(() => setCopied(false), 1000);
                                              toast.success("Copied Link Successfully");
                                            })
                                            .catch((err) => {
                                              console.error("Failed to copy: ", err);
                                            });
                                        }
                                      }}
                                    >
                                      <div className="flex text-gray-800 font-semibold">
                                        {copied ? (
                                          <FaCheck />
                                        ) : (
                                          <img
                                            src={CopyIcon || "/placeholder.svg"}
                                            height="8px"
                                            width="12px"
                                          />
                                        )}
                                      </div>
                                    </button>
                                  )}

                                {/* Colored Dot - show only if crm_stage_color is present */}
                                {column === "name" && isPitchComponent && row.crm_stage_color && (
                                  <CrmStatusDot row={row} />
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              groupedData.map((group) => (
                <React.Fragment key={group.groupKey}>
                  <tr className="bg-gray-50 group-header">
                    {!noCheckbox && (
                      <td className="p-3 border-b whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={group.rows.every((row) =>
                            selectedItems?.some(
                              (item) =>
                                item.id === row.id ||
                                item.contact_sfdc_id === row.id
                            )
                          )}
                          onChange={() => {
                            const allSelected = group.rows.every((row) =>
                              selectedItems?.some(
                                (item) =>
                                  item.id === row.id ||
                                  item.contact_sfdc_id === row.id
                              )
                            );

                            if (allSelected) {
                              // Remove all rows in this group from selection
                              const newSelection = selectedItems.filter(
                                (item) =>
                                  !group.rows.some(
                                    (row) =>
                                      row.id === item.id ||
                                      row.contact_sfdc_id === item.id
                                  )
                              );
                              OnChangeHandler(newSelection);
                            } else {
                              // Add all rows in this group to selection
                              const newSelection = [
                                ...selectedItems,
                                ...group.rows.filter(
                                  (row) =>
                                    !selectedItems.some(
                                      (item) =>
                                        item.id === row.id ||
                                        item.contact_sfdc_id === row.id
                                    )
                                ),
                              ];
                              OnChangeHandler(newSelection);
                            }
                          }}
                          className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-[#d0acad] checked:border-[#d0acad] focus:outline-none focus:ring-2 focus:ring-[#d0acad] focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                        />
                      </td>
                    )}
                    <td
                      colSpan={rowKeys.length}
                      className="p-3 border-b font-medium text-gray-800 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleGroup(group.groupKey)}
                    >
                      <div className="flex items-center gap-2">
                        {expandedGroups[group.groupKey] ? (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="font-semibold">
                          {["created_at", "updated_at", "delete_date", "Consumed On"].includes(groupByColumn) 
                            ? formatDate(group.groupKey)
                            : group.groupKey}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full ml-2">
                          {group.count} {group.count === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {expandedGroups[group.groupKey] &&
                    group.rows.map((row, rowIndex) => (
                      <tr
                        key={row.id || `${group.groupKey}-${rowIndex}`}
                        id={`row-${row.id}`}
                        className="bg-white hover:bg-gray-100 transition-colors duration-150 group-row"
                        onMouseEnter={() => {
                          if (
                            pitchesWithCustomLinks &&
                            pitchesWithCustomLinks.some(
                              (pitch) => pitch.id === row.id
                            )
                          ) {
                            setHoveredPitchId(row.id);
                            const rowElement = document.getElementById(
                              `row-${row.id}`
                            );
                            if (rowElement) {
                              // We're not using buttonPosition anymore, but keeping the code for future use
                              // setButtonPosition({
                              //   top: rect.top + window.scrollY + 500,
                              //   left:
                              //     rect.left + window.scrollX + rect.width + 200,
                              // });
                            }
                          }
                        }}
                        onMouseLeave={() => {
                          if (pitchesWithCustomLinks) {
                            setHoveredPitchId(null);
                            // We're not using buttonPosition anymore, but keeping the code for future use
                            // setButtonPosition({ top: 20, left: 20 });
                          }
                        }}
                      >
                        {!noCheckbox && (
                          <td className="p-3 border-b whitespace-nowrap pl-6">
                            <input
                              type="checkbox"
                              checked={selectedItems?.some(
                                (item) =>
                                  item.id === row.id ||
                                  item.contact_sfdc_id === row.id
                              )}
                              onChange={() => handleChange(row)}
                              className="w-4 h-4 rounded-md border-2 border-gray-300 checked:bg-[#d0acad] checked:border-[#d0acad] focus:outline-none focus:ring-2 focus:ring-[#d0acad] focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
                            />
                          </td>
                        )}
                        {rowKeys?.map((column) => (
                          <td
                            key={`${row.id || rowIndex}-${column}`}
                            className={`p-3 border-b overflow-hidden whitespace-nowrap ${
                              OnClickHandler ? "cursor-pointer" : ""
                            }`}
                            onClick={(e) => {
                              if ((column === "name" || column == "full_name" || column == "email") && !e.target.closest("button")) {
                                handleClick(row);
                              }
                            }}
                          >
                            <div
                              className={`truncate ${
                                column === "name" ? "flex justify-between items-center" : ""
                              }`}
                            >
                              {column === "active" || column === "is_active" ? (
                                <div className="flex justify-center items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      row[column] === 1
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                </div>
                              ) : column === "is_primary" ||
                                column == "primary" ? (
                                <div className="flex justify-center items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      row[column] === 1
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                </div>
                              ) : [
                                  "created_at",
                                  "updated_at",
                                  "delete_date",
                                  "Consumed On",
                                ].includes(column) ? (
                                formatDate(row[column])
                              ) : isRecycleBin && column === "name" ? (
                                <div className="flex gap-2">
                                  {getIcon(row)}
                                  <HighlightText
                                    text={row[column]}
                                    searchTerm={searchTerm}
                                  />
                                </div>
                              ) : column == "Cost" ? (
                                row[column].toFixed(8)
                              ) : column == "Rate USD" ? (
                                row[column].toFixed(8)
                              ) : (
                                <>
                                  <HighlightText
                                    text={row[column]}
                                    searchTerm={searchTerm}
                                  />

                                  {column == "name" &&
                                    hoveredPitchId == row.id &&
                                    row.pitch_custom_link && (
                                      <button
                                        className="relative text-white rounded z-[999] ml-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const row = data.find(
                                            (item) => item.id === hoveredPitchId
                                          );
                                          if (row && row.pitch_custom_link) {
                                            navigator.clipboard
                                              .writeText(row.pitch_custom_link)
                                              .then(() => {
                                                setCopied(true);
                                                setTimeout(
                                                  () => setCopied(false),
                                                  1000
                                                );
                                                toast.success(
                                                  "Copied Link Successfully"
                                                );
                                              })
                                              .catch((err) => {
                                                console.error(
                                                  "Failed to copy: ",
                                                  err
                                                );
                                              });
                                          }
                                        }}
                                      >
                                        <div className="flex text-gray-800 font-semibold">
                                          {copied ? (
                                            <FaCheck />
                                          ) : (
                                            <img
                                              src={
                                                CopyIcon || "/placeholder.svg"
                                              }
                                              height={"8px"}
                                              width={"12px"}
                                            />
                                          )}
                                        </div>
                                      </button>
                                    )}
                                    {column === "name" && isPitchComponent && row.crm_stage_color && (
                                      <CrmStatusDot row={row} />
                                    )}
                                </>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResizableTable;
