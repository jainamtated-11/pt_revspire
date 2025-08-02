import { useCallback, useEffect, useRef, useState } from "react";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
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
import AddAgentFlowDialog from "./AddAgentFlowDialog.jsx";
import CrudAgentFlow from "./CRUDAgentFlow.jsx";
import Select from "react-select";
import { X } from "lucide-react";
import EditAgentFlowDialog from "./EditAgentFlowDialog.jsx";
import AgentFlowEditorWrapper from "./AgentFlowEditor.jsx";

function AgentFlowDashboard() {
  const [agentFlows, setAgentFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { viewer_id, organisation_id } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();
  const [addAgentFlow, setAddAgentFlow] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "updated_at",
    direction: "desc",
  });
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [showAgentFlowModal, setShowAgentFlowModal] = useState(false);
  const [showFlowEditor, setShowFlowEditor] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);

  const tableRef = useRef(null);

  // Group by state
  const [groupByColumn, setGroupByColumn] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const dispatch = useDispatch();
  const searchData = useSelector((state) => state.search.searchData);
  const searchApplied = useSelector((state) => state.search.searchApplied);
  const searchValue = useSelector((state) => state.search.searchValue);

  // Define rowData for grouping options
  const rowData = [
    "name",
    "description",
    "created_at",
    "updated_at",
    "created_by_name",
    "updated_by_name",
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
      backgroundColor: data.isCustom ? "#F0F9FF" : "white",
      color: "#1F2937",
      "&:hover": {
        backgroundColor: data.isCustom ? "#E1F0FF" : "#f3f4f6",
      },
    }),
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

  const openAgentFlowModal = () => {
    setShowAgentFlowModal(true);
  };

  const fetchAgentFlows = useCallback(async () => {
    try {
      const response = await axiosInstance.post(
        "user-agent/get-all-agent-flows",
        { organisation_id }
      );

      if (response.data.success) {
        setAgentFlows(response.data.agent_flows);
        dispatch(SetInitialData(response.data.agent_flows));
        dispatch(SetSearchData(response.data.agent_flows));
      } else {
        toast.error("Failed to fetch agent flows");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching agent flows");
    } finally {
      setLoading(false);
    }
  }, [dispatch, organisation_id]);

  // Fetch agent flows when the component mounts
  useEffect(() => {
    fetchAgentFlows();
  }, [viewer_id, organisation_id]);

  useEffect(() => {
    dispatch(SetInitialData(agentFlows));
    dispatch(SetSearchData(agentFlows));
    dispatch(SetSearchTable("allAgentFlows"));
    dispatch(
      SetSearchFields([
        "name",
        "description",
        "created_at",
        "updated_at",
        "created_by_name",
        "updated_by_name",
      ])
    );
  }, [searchValue]);

  const OnChangeHandler = (data) => {
    if (data === agentFlows || data.length === 0) {
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
    "Name",
    "Description",
    "Created At",
    "Updated At",
    "Created By",
    "Updated By",
  ];

  // Transform the agent flows data into rows for the table
  const rows = [
    "name",
    "description",
    "created_at",
    "updated_at",
    "created_by_name",
    "updated_by_name",
  ];

  const OnClickHandler = (row) => {
    // Open the flow editor instead of the modal
    setSelectedFlow(row);
    setShowFlowEditor(true);
  };

  const handleBackToFlows = () => {
    setShowFlowEditor(false);
    setSelectedFlow(null);
    // Refresh the flows data
    fetchAgentFlows();
  };

  if (showFlowEditor && selectedFlow) {
    return (
      <AgentFlowEditorWrapper
        agentFlowId={selectedFlow}
        agentFlowName={
          agentFlows.find((flow) => flow.id === selectedFlow)?.name || "" //finds agentFlow with matching id as selectedFlow and sends it's name
        }
        onBack={handleBackToFlows}
      />
    );
  }

  return (
    <div className="flex flex-col pt-2">
      {addAgentFlow && (
        <AddAgentFlowDialog
          setAddAgentFlow={setAddAgentFlow}
          fetchAgentFlows={fetchAgentFlows}
        />
      )}
      <div className="container flex flex-row justify-between mx-auto px-4 pt-4 w-full">
        <div className="flex w-full items-center justify-between space-x-4">
          <CrudAgentFlow
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            setAddAgentFlow={setAddAgentFlow}
            fetchAgentFlows={fetchAgentFlows}
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
                className="min-w-[200px]"
              />
            </div>

            <div className="w-[200px] mt-0.5">
              <SearchBar searchTable="allAgentFlows" />
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
              data={searchApplied ? searchData : agentFlows}
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
              OnClickHandler={(row) => OnClickHandler(row)}
            />
          </div>
        </div>
      </div>

      {showAgentFlowModal && (
        <EditAgentFlowDialog
          showAgentFlowModal={showAgentFlowModal}
          setShowAgentFlowModal={setShowAgentFlowModal}
          agentFlowData={selectedRowData}
          fetchAgentFlows={fetchAgentFlows}
        />
      )}
    </div>
  );
}

export default AgentFlowDashboard;
