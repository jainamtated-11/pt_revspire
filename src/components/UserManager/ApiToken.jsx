import React, {
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { formatDate } from "../../constants.js";
import { useDispatch, useSelector } from "react-redux";
import { GlobalContext } from "../../context/GlobalState.jsx";
import { fetchApiTokensAsync } from "../../features/ApiToken/apiTokenSlice.js";
import EmptyFolderComponent from "../MainDashboard/ContentManager/ContentTable/EmptyFolderComponent.jsx";
import { TbClipboard, TbClipboardCheck } from "react-icons/tb";
import useAxiosInstance from "../../Services/useAxiosInstance.jsx";
import { LuLoaderCircle } from "react-icons/lu";
import "../MainDashboard/ContentManager/ContentTable/Table.css";
import {
  TbSortAscending,
  TbSortDescending,
  TbArrowsSort,
} from "react-icons/tb";
import toast from "react-hot-toast";
import Select from "react-select";
import { X } from "lucide-react";

const createHeaders = (headers) => {
  return headers.map((item) => ({
    text: item,
    ref: useRef(),
  }));
};
// const axiosInstance = useAxiosInstance();

function ApiToken() {
  const axiosInstance = useAxiosInstance();
  const { viewer_id, baseURL, selectedOrganisationId } =
    useContext(GlobalContext);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  console.log("organisation id " + selectedOrganisationId);

  const { organisationDetails } = useContext(GlobalContext);

  const organisation_id = organisationDetails.organisation.id;

  useEffect(() => {
    dispatch(
      fetchApiTokensAsync({
        viewer_id: viewer_id,
        organisation_id: organisation_id,
        baseURL: baseURL,
      })
    );
  }, [dispatch, viewer_id]);

  const apiTokens = useSelector((state) => state.apiTokens.apiTokens);
  const loading = useSelector((state) => state.apiTokens.loading);

  const columnsHeading = [
    "App Token",
    "created at",
    "Exp Date",
    "type",
    "Status",
  ];

  const row = ["app_token", "created_at", "exp_date", "type", "status"];

  const [hoveredRow, setHoveredRow] = useState(null);

  const [copied, setCopied] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const groupByOptions = [
    { value: null, label: "No grouping" },
    { value: "type", label: "Type" },
    { value: "status", label: "Status" },
    { value: "created_at", label: "Created At" },
    { value: "exp_date", label: "Expiry Date" }
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

  const sliceToken = (token) => {
    if (token.length > 50) {
      return token.slice(0, 50) + "...";
    }
    return token;
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedTokens = [...apiTokens].sort((a, b) => {
    if (sortConfig.key === null) return 0;
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "ascending" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "ascending" ? 1 : -1;
    return 0;
  });

  const groupedTokens = groupByColumn
    ? sortedTokens.reduce((groups, token) => {
        const key = token[groupByColumn];
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(token);
        return groups;
      }, {})
    : { "": sortedTokens };

  const CopyApiTokenHandler = (token) => {
    navigator.clipboard.writeText(token);
    setCopied(true);
  };

  const GenerateApiHandler = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(`/generate-api-token`, {
        viewer_id,
        organisation_id: selectedOrganisationId,
      });
      if (response) {
        dispatch(
          fetchApiTokensAsync({
            viewer_id: viewer_id,
            organisation_id: organisation_id,
            baseURL: baseURL,
          })
        );
        toast.success("Token created successfully");
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-6 pb-6">
      <div className="w-full flex justify-between items-center transition-all py-4">
        <button
          className={`btn-secondary w-[150px] h-[38px] flex justify-center items-center ${
            isLoading ? "cursor-not-allowed opacity-70" : ""
          }`}
          onClick={GenerateApiHandler}
        >
          {isLoading ? (
            <LuLoaderCircle className="text-lg animate-spin" />
          ) : (
            "Generate Token"
          )}
        </button>

        <div className="flex items-center ml-4">
  <div className="w-[30px] flex-1">
    {groupByColumn && (
      <button
        onClick={() => setGroupByColumn(null)}
        className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 mr-1 text-sm"
        title="Clear grouping"
      >
        <X size={16} />
      </button>
    )}
  </div>
  <Select
    value={groupByOptions.find(option => option.value === groupByColumn)}
    onChange={(option) => setGroupByColumn(option?.value || null)}
    options={groupByOptions}
    styles={customStyles}
    placeholder="Group by"
    className="w-[200px]"
  />
</div>
      </div>

      <div className="w-full relative h-[500px] overflow-auto border-2 rounded-md">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-100 shadow-md z-10">
            <tr>
              {columnsHeading.map((text, i) => (
                <th
                  key={text}
                  className={`p-3 font-semibold text-left border-b ${
                    i === 0 ? "w-[350px]" : "w-[150px]"
                  }`}
                >
                  <div className="flex items-center justify-between pr-3">
                    <span className="text-sm font-bold text-gray-700 capitalize">
                      {text}
                    </span>
                    <button
                      onClick={() => requestSort(row[i])}
                      className="ml-2"
                    >
                      {sortConfig.key === row[i] ? (
                        sortConfig.direction === "ascending" ? (
                          <TbSortAscending className="w-4 h-4" />
                        ) : (
                          <TbSortDescending className="w-4 h-4" />
                        )
                      ) : (
                        <TbArrowsSort className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="font-sans text-sm">
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, idx) => (
                  <tr key={idx}>
                    {columnsHeading.map((_, index) => (
                      <td key={index} className="p-3 border-b">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
            ) : apiTokens.length === 0 ? (
              <tr>
                <td className="" colSpan={columnsHeading.length}>
                  <div className="flex justify-center items-center ">
                  <EmptyFolderComponent />
                  </div>
                </td>
              </tr>
            ) : (
              Object.entries(groupedTokens).map(([groupKey, groupTokens]) => (
                <React.Fragment key={groupKey}>
                  {groupByColumn && (
                    <tr className="bg-gray-50">
                      <td
                        colSpan={columnsHeading.length}
                        className="p-2 border-b cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          setExpandedGroups((prev) => ({
                            ...prev,
                            [groupKey]: !prev[groupKey],
                          }))
                        }
                      >
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700">
                            {groupKey || "No Group"}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({groupTokens.length})
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {(!groupByColumn || expandedGroups[groupKey]) &&
                    groupTokens.map((item, index) => (
                      <tr
                        key={index}
                        className="bg-white hover:bg-gray-100 transition-colors duration-150"
                      >
                        {row.map((r, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="p-3 border-b relative"
                            onMouseEnter={() => setHoveredRow(item.id)}
                            onMouseLeave={() => {
                              setCopied(false);
                              setHoveredRow(null);
                            }}
                          >
                            {r === "app_token" ? (
                              <div className="flex items-center h-[24px]">
                                <span className="block w-[200px]" title={item[r]}>
                                  {sliceToken(item[r])}
                                </span>
                                {hoveredRow === item.id && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      CopyApiTokenHandler(item.app_token);
                                    }}
                                    className="flex-shrink-0 ml-2 p-1 hover:bg-gray-100 rounded-md transition-colors absolute right-2"
                                  >
                                    {copied ? (
                                      <TbClipboardCheck className="text-sky-700 w-4 h-4" />
                                    ) : (
                                      <TbClipboard className="text-gray-600 w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            ) : r === "created_at" || r === "exp_date" ? (
                              formatDate(item[r])
                            ) : r === "status" ? (
                              // insteadofactiveuse the colors for consistency
                              <div className="flex justify-center items-center">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    item[r] === "Active" ? "bg-green-500" : "bg-red-500"
                                  }`}
                                ></div>
                              </div>
                            ) : (
                              item[r]
                            )}
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
}

export default ApiToken;
