import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import toast from "react-hot-toast";
import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SlCalender } from "react-icons/sl";
import Chart from "react-apexcharts";
import Select from "react-select";
import { X } from "lucide-react";

const AiData = () => {
  const { organisationDetails, viewer_id } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const [loading, setLoading] = useState(true);
  const [AiData, setAiData] = useState([]);
  const [filterItem, setFilterItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [modelName, setModelName] = useState([]);
  const [selectedModel, setSelectedModel] = useState("All");
  const [pieChartData, setPieChartData] = useState([]);
  const [id, setId] = useState();
  const [rows, setRows] = useState([]);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setresponseData] = useState([]);
  const [sortConfig , setSortConfig] = useState({key:"Updated At",direction:"desc"});
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const groupByOptions = [
    { value: null, label: "No grouping" },
    { value: "Consumed By", label: "Consumed By" },
    { value: "Rate USD", label: "Rate USD" },
    { value: "Consumed On", label: "Consumed On" }
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
    if (organisationDetails && organisationDetails.organisation) {
      const singleId = organisationDetails.organisation.id || null;
      setId(singleId);

      setLoading(false);
    }
  }, [organisationDetails]);

  console.log("id", id);
  useEffect(() => {
    if (id) {
      const getAiData = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.post(
            "/ai/get-ai-model-consumption",
            {
              viewer_id: viewer_id,
              organisation_id: id,
            }
          );

          console.log("response");
          if (response.data) {
            if (
              response.data ===
              "No AI models found for the provided organisation."
            ) {
              setAiData([]);
              setModelName([]);
              setSelectedModel();
            } else {
              setAiData(response.data);
              // setSelectedModel(response.data[0].model_name);
              console.log("Ai console", response.data);
              setSelectedModel(selectedModel);
              setresponseData(response.data);
              console.log("ram ", responseData);
            }
            console.log(response.data);
          } else {
            toast.error("Failed to fetch AI details.");
            setAiData([]);
          }
        } catch (error) {
          console.error("Network error:", error);
          toast.error("Network error. Please try again.");
          setAiData([]);
        } finally {
          setLoading(false);
        }
      };

      getAiData();
    }
  }, [id]);

  const rowData = ["Consumed By", "Rate USD", "Cost", "Consumed On"];
  const colsData = ["Consumed By", "Rate USD", "Cost", "Consumed On"];

  useEffect(() => {
    const updatedModelName = AiData?.map((Ai) => Ai.model_name) || [];
    setModelName(["All", ...updatedModelName]); // Prepend "All" to the array
  }, [AiData]);

  const defaultData = {
    model_name: "All",
    total_cost_usd: null,
    available_credits_usd: null,
    user_consumptions: [
      {
        created_by_name: "",
        user_id: "",
        consumed_on: "",
        total_tokens: null,
        rate_usd: null,
        cost: null,
      },
    ],
  };

  useEffect(() => {
    console.log("Ai Data", responseData[0]?.available_credits_usd);
    // const total_creadit = AiData.reduce((acc, item) => {
    //   return acc + item.available_credits_usd;
    // }, 0);
    defaultData.available_credits_usd = responseData[0]?.available_credits_usd;

    const total_cost_usd = AiData.reduce((acc, item) => {
      return acc + item.total_cost_usd;
    }, 0);
    defaultData.total_cost_usd = total_cost_usd;

    const allUserConsumptions = responseData
      .map((item) => item.user_consumptions)
      .flat();

    console.log("allUserConsumptions", allUserConsumptions);
    defaultData.user_consumptions = allUserConsumptions;
  }, [selectedModel, AiData]);

  useEffect(() => {
    if (selectedModel) {
      if (selectedModel === "All") {
        setFilterItem(defaultData);
        console.log("filterItem", filterItem);

        const { total_cost_usd, available_credits_usd, user_consumptions } =
          defaultData;

        const filteredConsumptions = user_consumptions.filter((consumption) => {
          const consumptionDate = new Date(consumption.consumed_on);
          return (
            (!startDate || consumptionDate >= new Date(startDate)) &&
            (!endDate || consumptionDate <= new Date(endDate))
          );
        });

        const totalConsumption = filteredConsumptions.reduce(
          (acc, consumption) => acc + consumption.cost,
          0
        );

        const data = [
          { name: "used", value: total_cost_usd },
          {
            name: "remaining",
            value: available_credits_usd - totalConsumption,
          },
        ];

        setPieChartData(data);

        const transformedLogs = user_consumptions.map((consumption) => ({
          ...consumption,
          "Consumed By": consumption.created_by_name,
          "User Id": consumption.user_id,
          "Rate USD": consumption.rate_usd,
          Cost: consumption.cost,
          "Consumed On": consumption.consumed_on,
        }));

        setRows(transformedLogs);
        console.log("transformedLogs", transformedLogs);
      } else {
        const selectedData = AiData?.find(
          (item) => item.model_name === selectedModel
        );

        setFilterItem(selectedData);

        if (selectedData) {
          const { total_cost_usd, available_credits_usd, user_consumptions } =
            selectedData;

          const filteredConsumptions = user_consumptions.filter(
            (consumption) => {
              const consumptionDate = new Date(consumption.consumed_on);
              return (
                (!startDate || consumptionDate >= new Date(startDate)) &&
                (!endDate || consumptionDate <= new Date(endDate))
              );
            }
          );

          const totalConsumption = filteredConsumptions.reduce(
            (acc, consumption) => acc + consumption.cost,
            0
          );

          const data = [
            { name: "used", value: total_cost_usd },
            {
              name: "remaining",
              value: available_credits_usd - totalConsumption,
            },
          ];

          setPieChartData(data);

          const transformedLogs = user_consumptions.map((consumption) => ({
            ...consumption,
            "Consumed By": consumption.created_by_name,
            "User Id": consumption.user_id,
            "Rate USD": consumption.rate_usd,
            Cost: consumption.cost,
            "Consumed On": consumption.consumed_on,
          }));

          setRows(transformedLogs);
        } else {
          setPieChartData([]);
          setRows([]);
        }
      }
    }
  }, [selectedModel, AiData, startDate, endDate]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    const total = pieChartData.reduce((sum, entry) => sum + entry.value, 0);
    const percentage = ((value / total) * 100).toFixed(2);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        label={renderCustomizedLabel}
      >
        {`${percentage}%`}
      </text>
    );
  };

  const colors = ["#007bff", "#9061F9"];

  const lightenColor = (color, percent) => {
    const num = parseInt(color.slice(1), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) + amt,
      G = ((num >> 8) & 0x00ff) + amt,
      B = (num & 0x0000ff) + amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  };
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload; // Extract name and value from the payload
      return (
        <div className="bg-white border border-gray-300 p-1 rounded shadow text-sm">
          <p className="label">{`${name}: $${value.toFixed(2)}`}</p>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col p-10 gap-2">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="w-full h-[30px] bg-neutral-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }
  console.log("SelectedModel", selectedModel);

  let totalCost = filterItem.total_cost_usd.toFixed(2);

  const getChartOptions = () => {
    return {
      series: [
        parseFloat(filterItem.total_cost_usd.toFixed(2)),
        parseFloat(
          (
            filterItem.available_credits_usd - filterItem.total_cost_usd
          ).toFixed(2)
        ),
      ],
      colors: ["#1C64F2", "#16BDCA", "#9061F9"],
      chart: {
        height: 420,
        width: "100%",
        type: "pie",
      },
      stroke: {
        colors: ["white"],
      },
      plotOptions: {
        pie: {
          labels: {
            show: true,
          },
          size: "100%",
          dataLabels: {
            offset: -25,
          },
        },
      },
      labels: ["Total Cost Used", "Avaliable Credits"],
      dataLabels: {
        enabled: true,
        style: {
          fontFamily: "Inter, sans-serif",
        },
      },
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
      },
    };
  };
  console.log("AiData", filterItem);

  const OnChangeHandler = (data) => {
    if (data === organisationDetails?.users || data.length === 0) {
      setSelectedItems(data);
      return;
    }

    const idx = selectedItems.findIndex(
      (selectedItem) => selectedItem.username === data.username
    );

    if (idx === -1) {
      setSelectedItems((prevState) => [...prevState, data]);
    } else {
      const updatedSelectedItems = selectedItems.filter(
        (item) => item.username !== data.username
      );
      setSelectedItems(updatedSelectedItems);
    }
  };

  return (
    <div>
      <div className="h-full flex flex-col border  rounded-lg mx-8 ">
        <div className="flex flex-row items-start mt-6 ml-6 w-3/12">
          <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white me-1 ">
            AI Credit Consumption
          </h5>
          <svg
            data-popover-target="chart-info"
            data-popover-placement="bottom"
            className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer ms-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z" />
          </svg>
        </div>
        {pieChartData.length > 0 && (
          <div className="flex flex-row items-center justify-items-start gap-10  w-full ">
            <div className="flex flex-col ml-12 mb-36">
              <p className="text-gray-600 font-semibold mb-3 text-md">
                Select Model to View Consumption:
              </p>
              <select
                className="cursor-pointer text-white btn-secondary  focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm px-7 py-2.5 w-64 "
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                title={selectedModel}
              >
                <option value="" disabled>
                  Select Model
                </option>
                {modelName.map((item, i) => (
                    <option className="block text-left px-4 py-2 hover:bg-gray-100 overflow-hidden text-ellipsis whitespace-nowrap" key={i} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {selectedModel == "All" && (
              <div className="border shadow-sm flex flex-row items-center   justify-items-center gap-10 mx-4 px-10 rounded-md  mb-5">
                <div className="mb-6 border border-gray-200  flex justify-center items-start flex-col shadow-lg p-6 rounded-md ">
                  <p>
                    Total Credit Available (USD) :{" "}
                    {filterItem.available_credits_usd}
                  </p>
                  <p>
                    Total Credit Used (USD) :{" "}
                    {Math.round(filterItem.total_cost_usd * 100) / 100}
                  </p>
                </div>
                <div className="pb-2">
                  <Chart
                    options={getChartOptions()}
                    series={getChartOptions().series}
                    type="pie"
                    height={420}
                  />
                </div>
              </div>
            )}

            {selectedModel !== "All" && filterItem && (
              <div className="border shadow-sm flex flex-row items-center justify-center rounded-md px-8 py-5 ml-28 ">
                <div className=" border border-gray-300 flex justify-start items-start flex-col shadow-lg px-4 py-3  rounded-md">
                  <p className="flex">
                  <span className="w-56">Total Credit Available (USD):</span> {filterItem.available_credits_usd}
                  </p>
                  <p className="flex">
                  <span className="w-56">Total Credit Used (USD):</span> {filterItem.total_cost_usd}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="w-full px-8 pt-2 pb-5">
        {console.log("data in ai", rows)}
        {console.log("colsData in ai ", colsData)}
        {console.log("rowData in ai ", rowData)}
        <div className="w-full">
          <div className="flex items-center justify-end mb-4 mt-2">
          <div className="flex items-center">
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
              className="w-[200px]"
              placeholder="Group by"
            />
          </div>
          
          </div>
      
        </div>
        {rows.length > 0 ? (
          <ResizableTable
            data={rows}
            loading={isLoading}
            rowKeys={rowData}
            columnsHeading={colsData}
            selectedItems={[]}
            OnChangeHandler={OnChangeHandler}
            noCheckbox={true}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            groupByColumn={groupByColumn}
            expandedGroups={expandedGroups}
            setExpandedGroups={setExpandedGroups}
          />
        ) : (
          <div className="w-full h-full shadow-lg mx-auto">
         <ResizableTable
              data={[]}
              columnsHeading={colsData}
              rowKeys={rowData}
              loading={isLoading}
              noCheckbox={true}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
            />

      </div>
        )}
      </div>
    </div>
  );
};

export default AiData;
