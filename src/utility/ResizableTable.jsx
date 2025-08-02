import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import "../../src/utility/ResizableTable.css";
import { GlobalContext } from "../context/GlobalState";
import { twMerge } from "tailwind-merge";
import { formatDate } from "../constants";

const ResizableTable = ({
  rows,
  columns,
  data,
  setter,
  onClick,
  isMultiSelect,
  highlightText,
}) => {


  const tableRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [selectedRows, setSelectedRows] = useState({});
  const [finalSelected, setFinalSelected] = useState([]);
  const { organisationDetails } = useContext(GlobalContext);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const cols = table.querySelectorAll("th");
    cols.forEach((col) => {
      const resizer = document.createElement("div");
      resizer.className = "resizer";
      resizer.style.height = `${table.offsetHeight}px`;
      col.appendChild(resizer);

      const mouseDownHandler = (e) => {
        setStartX(e.clientX);
        setStartWidth(col.offsetWidth);
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
      };

      const mouseMoveHandler = (e) => {
        const dx = e.clientX - startX;
        col.style.width = `${startWidth + dx}px`;
      };

      const mouseUpHandler = () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };

      resizer.addEventListener("mousedown", mouseDownHandler);

      return () => {
        resizer.removeEventListener("mousedown", mouseDownHandler);
      };
    });
  }, [startWidth, startX]);

  const sortRows = (rows, key, direction) => {
    if (!key) {
      return rows;
    }

    const sortedRows = [...rows].sort((a, b) => {
      if (key.toLowerCase().includes("date")) {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);

        return dateA < dateB
          ? direction === "ascending"
            ? -1
            : 1
          : dateA > dateB
          ? direction === "ascending"
            ? 1
            : -1
          : 0;
      } else {
        return a[key] < b[key]
          ? direction === "ascending"
            ? -1
            : 1
          : a[key] > b[key]
          ? direction === "ascending"
            ? 1
            : -1
          : 0;
      }
    });

    return sortedRows;
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleCheckboxChange = (rowId) => {
    setSelectedRows((prevSelectedRows) => {
      if (isMultiSelect) {
        if (prevSelectedRows[rowId]) {
          const { [rowId]: _, ...rest } = prevSelectedRows;
          return rest;
        } else {
          return { ...prevSelectedRows, [rowId]: true };
        }
      } else {
        if (prevSelectedRows[rowId]) {
          const { [rowId]: _, ...rest } = prevSelectedRows;
          return rest;
        } else {
          return { [rowId]: true };
        }
      }
    });
  };

  const handleMasterCheckboxChange = () => {
    setSelectedRows((prevSelectedRows) => {
      const allSelected = Object.keys(prevSelectedRows).length === rows.length;

      if (allSelected) {
        return {};
      } else {
        return rows.reduce((acc, row) => ({ ...acc, [row.id]: true }), {});
      }
    });
  };

  const isRowHighlighted = (row) => {
    return (
      highlightText &&
      organisationDetails &&
      organisationDetails.organisation &&
      organisationDetails.organisation.id === row.id
    );
  };

  useEffect(() => {
    const updatedFinalSelected = rows
      .filter((row) => selectedRows[row.id])
      .map((row) => ({
        id: row.id,
        active: data.find((item) => item.id === row.id)?.active || false,
      }));

    const isDifferent =
      JSON.stringify(updatedFinalSelected) !== JSON.stringify(finalSelected);

    if (isDifferent) {
      setter(updatedFinalSelected);
      setFinalSelected(updatedFinalSelected);
    }
  }, [selectedRows, data, rows, finalSelected, setter]);

  return (
    <div className="flex flex-col mt-2">
      <div className="overflow-x-auto border rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow sm:rounded-lg">
            <div
              className="overflow-y-auto overflow-x-hidden"
              style={{ maxHeight: "55vh" }}
            >
              <table
                ref={tableRef}
                className="table min-w-full divide-y divide-gray-200"
              >
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {setter && (
                      <th className="px-6 py-3">
                        {isMultiSelect && (
                          <input
                            type="checkbox"
                            onChange={handleMasterCheckboxChange}
                          />
                        )}
                      </th>
                    )}
                    {columns?.map(
                      (column, index) =>
                        column !== "id" && (
                          <th
                            key={index}
                            className="text-left text-xs font-[999] text-sky-800 uppercase tracking-wider cursor-pointer"
                            onClick={() =>handleSort(column)}
                          >
                            {column}
                            {sortConfig.key === column && (
                              <span className="ml-2">
                                <FontAwesomeIcon icon={faSort} />
                              </span>
                            )}
                          </th>
                        )
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortRows(rows, sortConfig.key, sortConfig.direction).map(
                    (row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={twMerge(
                          "cursor-pointer hover:bg-gray-100 ",
                          isRowHighlighted(row) && "bg-blue-50 hover:bg-blue-50"
                        )}
                      >
                        {setter && (
                          <td className="whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedRows[row.id] || false}
                              onChange={() => handleCheckboxChange(row.id)}
                            />
                          </td>
                        )}
                        {columns.map((column, cellIndex) => {
                          // console.log("column", row[column]);

                          return (
                            column !== "id" && (
                              <td
                                key={cellIndex}
                                className={twMerge(
                                  "whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider",
                                  isRowHighlighted(row) &&
                                    "font-semibold text-neutral-700"
                                )}
                                onClick={() => {
                                  if (onClick) {
                                    onClick(row.id);
                                  }
                                }}
                              >
                                {column === "active" ? (
                                  <span
                                    style={{
                                      display: "inline-block",
                                      width: "10px",
                                      height: "10px",
                                      borderRadius: "50%",
                                      backgroundColor:
                                        row.active === 1 ? "#77DD77" : "red",
                                    }}
                                  />
                                ) : column === "created_at" ||
                                  column === "Updated At" ? (
                                    formatDate(row[column])
                                ) : (
                                  row[column]
                                )}
                              </td>
                            )
                          );
                        })}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResizableTable;
