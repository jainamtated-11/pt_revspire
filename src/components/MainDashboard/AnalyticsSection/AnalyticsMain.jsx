import React, { useContext, useEffect, useRef, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState";
import { useCookies } from "react-cookie";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import toast from "react-hot-toast";
import TableLoading from "../ContentManager/ContentTable/TableLoading";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  SetSearchTable,
  SetInitialData,
  SetSearchData,
  SetSearchFields,
} from "../../../features/search/searchSlice.js";
import HighlightText from "../../../utility/HighlightText.jsx";
import AnalyticsCrud from "./AnalyticsCRUD.jsx";
import { useNavigate } from "react-router-dom";

const AnalyticsMain = () => {
  const { viewer_id } = useContext(GlobalContext);
  const [reports, setReports] = useState([]); // State to store fetched reports
  const [expandedRow, setExpandedRow] = useState(null); // State to manage expanded row
  const cookies = useCookies("userData");
  const organisation_id = cookies.userData?.organisation?.id;
  const axiosInstance = useAxiosInstance();
  const [loadingReports, setLoadingReports] = useState(true); // Set initial loading state to true
  const [isInitialLoad, setIsInitialLoad] = useState(true); // New state to track initial load
  const [generatingReportId, setGeneratingReportId] = useState(null);

  const navigate = useNavigate();

  // searching functionality
  const dispatch = useDispatch();
  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  const columnsHeading = [
    "Name",
    "Description",
    "Created At",
    "Updated At",
    "Active",
  ];
  const rowKeys = ["name", "description", "created_at", "updated_at", "active"];

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const thRefs = useRef([]);
  const [resizing, setResizing] = useState(false);
  const [resizeIndex, setResizeIndex] = useState(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  const fetchReports = async () => {
    setLoadingReports(true);
    setIsInitialLoad(true);

    const payload = {
      viewer_id: viewer_id,
      organisation_id: organisation_id,
    };

    try {
      const response = await axiosInstance.post(
        "/powerBI-embedding/retrieve-reports",
        payload
      );
      console.log(response.status);

      if (response.data.success) {
        console.log("fetched the data successfully");
        setReports(response.data.data);
      }
    } catch (error) {
      console.error(error);
      console.error("Error fetching the reports");
      toast.error("Error fetching reports");
    } finally {
      setLoadingReports(false);
      setIsInitialLoad(false);
    }
  };

  const handleLaunchReport = async (report_id) => {
    try {
      setGeneratingReportId(report_id); // Set the generating report ID
      toast.loading("Generating report...");

      const payload = {
        power_bi_report_id: report_id,
        viewer_id: viewer_id,
        organisation_id: organisation_id,
      };

      const response = await axiosInstance.post(
        "/powerBI-embedding/embed-report",
        payload
      );

      if (
        response.status === 200 &&
        response.data.embedUrl &&
        response.data.accessToken
      ) {
        toast.dismiss();
        toast.success("Report generated successfully");

        navigate(`/content/analytics/reports/view_report?id=${report_id}`, {
          state: {
            embedUrl: response.data.embedUrl,
            accessToken: response.data.accessToken,
          },
        });
      } else {
        toast.dismiss();
        toast.error("Failed to generate report");
      }
    } catch (error) {
      console.error("Error launching report:", error);
      toast.dismiss();

      if (error.response?.status === 403) {
        toast.error("You don't have permission to access this report");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
      } else {
        toast.error("Failed to launch report. Please try again");
      }
    } finally {
      setGeneratingReportId(null); // Reset the generating report ID
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRowClick = (report) => {
    setExpandedRow(expandedRow?.id === report.id ? null : report); // Toggle expanded row
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
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

  useEffect(() => {
    const sortedData = [...displayReports].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.direction === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    if (searchApplied) {
      dispatch(SetSearchData(sortedData));
    } else {
      setReports(sortedData);
    }
  }, [sortConfig, searchApplied]);

  useEffect(() => {
    dispatch(SetInitialData(reports));
    dispatch(SetSearchData(reports));
    dispatch(SetSearchTable("analytics"));
    dispatch(SetSearchFields(["name", "description"])); // Fields to search in
  }, [reports, dispatch]);

  const displayReports = searchApplied ? searchData : reports;

  const renderExpandedContent = (report) => {
    return (
      <tr>
        <td colSpan={rowKeys.length} className="p-0 border-t border-gray-200">
          <div className="w-full">
            <div className="max-w-full p-6">
              <div className="flex gap-6">
                <div className="flex-[0.65] flex items-center justify-center bg-gray-50 rounded-lg p-4">
                  <img
                    src={`data:image/png;base64,${btoa(
                      String.fromCharCode.apply(
                        null,
                        new Uint8Array(report.thumbnail.data)
                      )
                    )}`}
                    alt={report.name}
                    className="w-full h-auto object-contain rounded-lg shadow-sm"
                  />
                </div>

                <div className="flex-[0.35] flex flex-col justify-center space-y-8 min-w-[300px]">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {report.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {report.description}
                  </p>
                  <button
                    className={`inline-flex items-center w-[150px] justify-center px-4 py-2 text-sm font-medium text-white 
                                        bg-secondary border border-transparent rounded-md sfocus:ring-2 focus:ring-offset-2 
                                        
                                        ${
                                          generatingReportId === report.id
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                        }`}
                    onClick={() => {
                      if (generatingReportId !== report.id) {
                        handleLaunchReport(report.id);
                      }
                    }}
                    disabled={generatingReportId === report.id}
                  >
                    {generatingReportId === report.id
                      ? "Generating..."
                      : "Launch Report"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderTableRow = (report) => (
    <tr
      className={`bg-white hover:bg-gray-50 transition-colors cursor-pointer`}
      onClick={() => {
        handleRowClick(report);
        console.log(report);
      }}
    >
      {rowKeys.map((column, index) => (
        <td
          key={column}
          className={`p-3 border-b border-gray-200 ${
            index === 0 ? "flex items-center" : ""
          }`}
        >
          {index === 0 && (
            <svg
              className={`w-4 h-4 mr-2 transition-transform duration-200 ease-in-out text-gray-500 flex-shrink-0 ${
                expandedRow?.id === report.id ? "transform rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          <div className="truncate">
            {["created_at", "updated_at"].includes(column) ? (
              new Date(report[column]).toLocaleDateString()
            ) : column === "active" ? (
              <span className="flex justify-center items-center">
                <span
                  className={`w-3 h-3 rounded-full ${
                    report[column] === 1 ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
              </span>
            ) : (
              <HighlightText text={report[column]} searchTerm={searchValue} />
            )}
          </div>
        </td>
      ))}
    </tr>
  );

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

  if (loadingReports || isInitialLoad) {
    return (
      <div className="container mx-auto px-4 ml-auto py-2.5 pt-16">
        <TableLoading columns={columnsHeading.length} rows={7} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 ml-auto py-2.5">
      <div className="flex justify-end">
        <AnalyticsCrud />
      </div>
      <div className="flex flex-col">
        <div className={`w-full relative border-2 rounded-md`}>
          <div className="overflow-auto max-h-[calc(100vh-200px)] scrollbar-thin">
            <table className="w-full table-fixed border-collapse relative">
              <thead className="sticky top-0 bg-gray-100 shadow-md z-10">
                <tr>
                  {columnsHeading.map((column, index) => (
                    <th
                      key={index}
                      ref={(el) => (thRefs.current[index] = el)}
                      className="relative font-semibold text-left border-b overflow-hidden whitespace-nowrap hover:bg-gray-200 bg-gray-100"
                      style={{ width: "200px" }}
                    >
                      <div className="flex items-center justify-between overflow-hidden hover:bg-gray-200">
                        <button
                          onClick={() => handleSort(rowKeys[index])}
                          className="flex items-center justify-between w-full h-full p-3 text-left focus:outline-none transition-colors duration-200"
                        >
                          <span className="text-sm font-bold text-gray-700 capitalize truncate">
                            {column}
                          </span>
                          {getSortIcon(rowKeys[index])}
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
                {!loadingReports && displayReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columnsHeading.length}
                      className="text-center p-4"
                    >
                      {searchApplied
                        ? "No matching reports found."
                        : "No reports found."}
                    </td>
                  </tr>
                ) : (
                  displayReports.map((report) => (
                    <React.Fragment key={report.id}>
                      {renderTableRow(report)}
                      {expandedRow?.id === report.id &&
                        renderExpandedContent(report)}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsMain;

// expanded content with fixed size

// const renderExpandedContent = (report) => {
//     return (
//         <tr>
//             <td colSpan={rowKeys.length} className="p-0 border-t border-gray-200">
//                 <div className="relative w-full overflow-x-auto"> {/* Wrapper for scroll if needed */}
//                     <div className="mx-auto" style={{ width: '1200px', minWidth: 'max-content' }}> {/* Fixed width container */}
//                         <div className="flex gap-6 p-6">
//                             {/* Image container - 60% of 1200px */}
//                             <div className="w-[720px] flex items-center justify-center bg-gray-50 rounded-lg p-4">
//                                 <img
//                                     src={`data:image/png;base64,${btoa(String.fromCharCode.apply(null, new Uint8Array(report.thumbnail.data)))}`}
//                                     alt={report.name}
//                                     className="max-w-full h-auto object-contain rounded-lg shadow-sm"
//                                 />
//                             </div>

//                             {/* Content container - 40% of 1200px */}
//                             <div className="w-[480px] flex flex-col justify-center space-y-4">
//                                 <h3 className="text-xl font-semibold text-gray-800">{report.name}</h3>
//                                 <p className="text-gray-600 leading-relaxed">{report.description}</p>
//                                 <button
//                                     className="inline-flex items-center w-[150px] justify-center px-4 py-2 text-sm font-medium text-white
//                                     bg-[#20a2b0DD] border border-transparent rounded-md shadow-sm
//                                     hover:bg-[#1a8a96] focus:outline-none focus:ring-2 focus:ring-offset-2
//                                     focus:ring-[#20a2b0DD] transition-colors duration-200 ease-in-out"
//                                 >
//                                     Launch Report
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </td>
//         </tr>
//     );
// };
