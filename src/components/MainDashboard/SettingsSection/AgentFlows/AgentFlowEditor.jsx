import { useState, useEffect, useCallback, useRef } from "react";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Panel,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { toast } from "react-hot-toast";
import {
  Plus,
  Settings,
  Play,
  Save,
  ArrowLeft,
  ChevronDown,
  Search,
  X,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Copy,
  MoreVertical,
} from "lucide-react";

// Custom Node Component with Salesforce-like styling
const AgentNode = ({ id, data, selected }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const nodeRef = useRef(null);

  // Add native event listener
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const handleClick = (e) => {
      if (e.target.closest("button, [data-no-propagate]")) {
        return;
      }
      console.log("Node clicked", id);
    };

    node.addEventListener("click", handleClick);
    return () => node.removeEventListener("click", handleClick);
  }, [id]);

  return (
    <div
      ref={nodeRef}
      className={`relative px-4 py-3 shadow-lg rounded-xl bg-gradient-to-br from-white to-gray-50 border-2 transition-all duration-200 min-w-[280px] max-w-[320px] ${
        selected
          ? "border-blue-500 ring-4 ring-blue-100 shadow-xl transform scale-105"
          : "border-gray-200 hover:border-gray-300 hover:shadow-xl"
      }`}
      style={{
        pointerEvents: "all",
        transform: "translate(0,0)", // Critical for Chrome/Safari
        willChange: "transform",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setShowAddButton(true)}
      onMouseLeave={() => setShowAddButton(false)}
    >
      {/* Plus button for adding new agent */}
      {showAddButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            data.onAddNew(data.id);
          }}
          className="absolute -right-3 -bottom-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors z-10"
          data-no-propagate
        >
          <Plus size={16} className="text-white" />
        </button>
      )}

      {/* Status indicator */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
        <CheckCircle size={12} className="text-white" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">
              {data.name}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Agent #{data.agent_id?.slice(-6)}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              console.log("Menu button clicked - guaranteed to work!");
              setShowMenu(!showMenu);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
            data-no-propagate
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-8 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[120px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  data.onEdit(data.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                data-no-propagate
              >
                <Settings size={12} className="mr-2" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  data.onDuplicate?.(data.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                data-no-propagate
              >
                <Copy size={12} className="mr-2" />
                Duplicate
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  data.onDelete?.(data.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                data-no-propagate
              >
                <Trash2 size={12} className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <div className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {data.description}
        </div>
      )}

      {/* Parameters Preview */}
      {data.parameters && Object.keys(data.parameters).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Configuration
            </span>
            <ChevronDown size={12} className="text-gray-400" />
          </div>
          <div className="space-y-1.5">
            {Object.entries(data.parameters)
              .slice(0, 3)
              .map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 truncate max-w-[100px] capitalize">
                    {key.replace(/_/g, " ")}:
                  </span>
                  <span className="text-xs text-gray-800 font-mono bg-white px-2 py-0.5 rounded border truncate max-w-[120px]">
                    {typeof value === "object"
                      ? JSON.stringify(value).substring(0, 20) + "..."
                      : String(value).substring(0, 20)}
                  </span>
                </div>
              ))}
            {Object.keys(data.parameters).length > 3 && (
              <div className="text-xs text-gray-400 text-center pt-1 border-t border-gray-200">
                +{Object.keys(data.parameters).length - 3} more parameters
              </div>
            )}
          </div>
        </div>
      )}

      {/* Execution Status */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 text-gray-500">
          <Clock size={10} />
          <span>Ready</span>
        </div>
        <div className="text-gray-400">Order: {data.order || "N/A"}</div>
      </div>
    </div>
  );
};

// Enhanced Agent Selection Modal
const AgentSelectionModal = ({
  isOpen,
  onClose,
  agents,
  onSelect,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const inputRef = useRef(null);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const categories = [
    { id: "all", name: "All Agents", count: agents.length },
    {
      id: "analysis",
      name: "Analysis",
      count: agents.filter(
        (a) =>
          a.name.toLowerCase().includes("spotter") ||
          a.name.toLowerCase().includes("researcher")
      ).length,
    },
    {
      id: "communication",
      name: "Communication",
      count: agents.filter(
        (a) =>
          a.name.toLowerCase().includes("email") ||
          a.name.toLowerCase().includes("notifier")
      ).length,
    },
    {
      id: "content",
      name: "Content",
      count: agents.filter(
        (a) =>
          a.name.toLowerCase().includes("content") ||
          a.name.toLowerCase().includes("translator")
      ).length,
    },
    {
      id: "automation",
      name: "Automation",
      count: agents.filter(
        (a) =>
          a.name.toLowerCase().includes("builder") ||
          a.name.toLowerCase().includes("dispatcher")
      ).length,
    },
  ];

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedCategory === "all") return matchesSearch;

    const agentName = agent.name.toLowerCase();
    switch (selectedCategory) {
      case "analysis":
        return (
          matchesSearch &&
          (agentName.includes("spotter") || agentName.includes("researcher"))
        );
      case "communication":
        return (
          matchesSearch &&
          (agentName.includes("email") || agentName.includes("notifier"))
        );
      case "content":
        return (
          matchesSearch &&
          (agentName.includes("content") || agentName.includes("translator"))
        );
      case "automation":
        return (
          matchesSearch &&
          (agentName.includes("builder") || agentName.includes("dispatcher"))
        );
      default:
        return matchesSearch;
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{category.name}</span>
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                      {category.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Select an Agent
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search agents by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Agent Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mb-4"></div>
                <div className="text-gray-600">Loading agents...</div>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <div className="text-gray-500 text-lg font-medium mb-2">
                  No agents found
                </div>
                <div className="text-gray-400 text-sm text-center max-w-md">
                  {searchTerm ? (
                    <>
                      No agents match your search criteria. Try adjusting your
                      search or{" "}
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        clear the search
                      </button>
                    </>
                  ) : (
                    "No agents available in this category"
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => onSelect(agent)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg cursor-pointer transition-all duration-200 bg-white group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {agent.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {agent.description}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100">
                              {agent.parameter?.length || 0} parameters
                            </span>
                            <span>Order: {agent.order}</span>
                          </div>
                          <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Parameter Configuration Modal
const ParameterConfigModal = ({
  isOpen,
  onClose,
  agent,
  onSave,
  existingNodes,
  previousAgentResponses,
}) => {
  const [parameters, setParameters] = useState({});
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (agent) {
      setAgentName(agent.name || "");
      setAgentDescription(agent.description || "");

      const initialParams = {};
      if (agent.parameter) {
        agent.parameter.forEach((param) => {
          initialParams[param.name] =
            agent.existingParameters?.[param.name] || param.default || "";
        });
      }
      setParameters(initialParams);
    }
  }, [agent]);

  const handleParameterChange = (paramName, value) => {
    setParameters((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const renderParameterField = (param) => {
    const value = parameters[param.name] || "";

    const baseInputClasses =
      "w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";

    switch (param.field_type) {
      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className={baseInputClasses}
            placeholder={`Enter ${param.label.toLowerCase()}`}
          />
        );

      case "number":
        return (
          <div className="space-y-2">
            <input
              type="number"
              value={value}
              onChange={(e) =>
                handleParameterChange(param.name, e.target.value)
              }
              className={baseInputClasses}
              placeholder={`Enter ${param.label.toLowerCase()}`}
            />
            {param.operators && (
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm">
                <option value="">Select operator</option>
                {param.operators.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            )}
          </div>
        );

      case "dropdown":
        return (
          <select
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className={baseInputClasses}
          >
            <option value="">Select {param.label}</option>
            {param.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "list<string>":
        return (
          <div className="space-y-2">
            <textarea
              value={Array.isArray(value) ? value.join("\n") : value}
              onChange={(e) =>
                handleParameterChange(
                  param.name,
                  e.target.value.split("\n").filter((v) => v.trim())
                )
              }
              className={`${baseInputClasses} font-mono text-sm`}
              placeholder="Enter one item per line"
              rows={4}
            />
            <div className="text-xs text-gray-500">
              Enter each item on a new line
            </div>
          </div>
        );

      case "json":
        return (
          <div className="space-y-3">
            {previousAgentResponses.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quick Select from Previous Agent
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const selectedResponse = previousAgentResponses.find(
                        (r) => r.id === e.target.value
                      );
                      if (selectedResponse) {
                        handleParameterChange(
                          param.name,
                          selectedResponse.response
                        );
                      }
                    }
                  }}
                  className={`${baseInputClasses} text-sm`}
                >
                  <option value="">Select previous agent response</option>
                  {previousAgentResponses.map((response) => (
                    <option key={response.id} value={response.id}>
                      {response.name} Response
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                JSON Data
              </label>
              <textarea
                value={
                  typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : value
                }
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleParameterChange(param.name, parsed);
                  } catch {
                    handleParameterChange(param.name, e.target.value);
                  }
                }}
                className={`${baseInputClasses} font-mono text-xs`}
                placeholder='{"key": "value"}'
                rows={6}
              />
              <div className="text-xs text-gray-500 mt-1">
                Enter valid JSON or select from previous agent responses
              </div>
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className={baseInputClasses}
            placeholder={`Enter ${param.label.toLowerCase()}`}
          />
        );
    }
  };

  const handleSave = () => {
    if (!agentName.trim()) {
      toast.error("Please enter an agent name");
      return;
    }

    if (agent?.parameter) {
      const missingRequired = agent.parameter
        .filter((param) => param.required && !parameters[param.name])
        .map((param) => param.label);

      if (missingRequired.length > 0) {
        toast.error(
          `Missing required parameters: ${missingRequired.join(", ")}`
        );
        return;
      }
    }

    onSave({
      name: agentName,
      description: agentDescription,
      parameters,
      agent_id: agent.id,
      agent_data: agent,
    });
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "basic", name: "Basic Info", icon: Settings },
    { id: "parameters", name: "Parameters", icon: Zap },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Configure Agent
              </h2>
              <div className="text-sm text-gray-600 mt-1">{agent?.name}</div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name *
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter a descriptive name for this agent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  rows={3}
                  placeholder="Describe what this agent will do in your flow"
                />
              </div>

              {/* Agent Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Agent Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium">{agent?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Order:</span>
                    <span className="ml-2 font-medium">{agent?.order}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Parameters:</span>
                    <span className="ml-2 font-medium">
                      {agent?.parameter?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "parameters" && (
            <div className="space-y-6">
              {agent?.parameter && agent.parameter.length > 0 ? (
                agent.parameter.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {param.label}
                      {param.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderParameterField(param)}
                    {param.description && (
                      <div className="text-xs text-gray-500">
                        {param.description}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings size={24} className="text-gray-400" />
                  </div>
                  <div className="text-gray-500">
                    No parameters required for this agent
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            >
              Save Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Flow Editor Component
const FlowEditor = ({ agentFlowId, agentFlowName, onBack }) => {
  const reactFlowWrapper = useRef(null);
  const { fitView } = useReactFlow();

  // State for flow elements
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // State for available agents and modals
  const [availableAgents, setAvailableAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [error, setError] = useState(null);

  const axiosInstance = useAxiosInstance();
  const [sourceNodeForNewAgent, setSourceNodeForNewAgent] = useState(null);

  // Debug node types
  useEffect(() => {
    console.log("Current nodes:", nodes);
  }, [nodes]);

  // Fixed: Remove fitView from dependencies to prevent infinite loop
  // In the fetchFlowData function, replace the processHierarchy part with this:

  const fetchFlowData = useCallback(async () => {
    if (!agentFlowId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(
        "/user-agent/get-hierarchical-user-agent-flows",
        {
          agent_flow_id: agentFlowId,
        }
      );

      const data = await response.data;

      if (data.success !== false) {
        const hierarchies = data.hierarchies || [];
        const newNodes = [];
        const newEdges = [];
        const xPos = 100;
        let yPos = 100;

        if (hierarchies.length === 0) {
          setNodes([]);
          setEdges([]);
          setLoading(false);
          return;
        }

        // Create a map of nodes by their ID for quick lookup
        const nodeMap = {};

        // First pass: create all nodes
        hierarchies.forEach((item) => {
          const nodeId = item.id;
          nodeMap[nodeId] = {
            id: nodeId,
            type: "agentNode",
            position: { x: 0, y: 0 }, // Will be calculated later
            data: {
              id: nodeId,
              name: item.agent_name || item.name,
              description: item.agent_description || item.description,
              parameters: item.parameter_value || {},
              agent_id: item.agent,
              order: item.order,
              onEdit: handleEditNode,
              onDuplicate: handleDuplicateNode,
              onDelete: handleDeleteNode,
              onAddNew: handleAddNewAgent,
            },
          };
        });

        // Second pass: calculate positions and create edges
        const processedNodes = new Set();
        let currentX = xPos;

        // Find root nodes (nodes with no previous_agent_flow)
        const rootNodes = hierarchies.filter(
          (item) => !item.previous_user_agent_flow
        );

        // Process each root node and its descendants
        rootNodes.forEach((rootNode, rootIndex) => {
          const stack = [{ node: rootNode, level: 0 }];
          let currentY = yPos + rootIndex * 300; // Offset each root branch vertically

          while (stack.length > 0) {
            const { node, level } = stack.pop();
            const nodeId = node.id;

            if (processedNodes.has(nodeId)) continue;
            processedNodes.add(nodeId);

            // Set node position
            nodeMap[nodeId].position = {
              x: currentX + level * 350,
              y: currentY,
            };
            newNodes.push(nodeMap[nodeId]);

            // Find children (nodes where this node is the previous_agent_flow)
            const children = hierarchies.filter(
              (item) => item.previous_user_agent_flow === nodeId
            );

            // Add edges for children
            children.forEach((child) => {
              newEdges.push({
                id: `edge-${nodeId}-${child.id}`,
                source: nodeId,
                target: child.id,
                animated: true,
                style: { stroke: "#3b82f6", strokeWidth: 2 },
              });
            });

            // Push children to stack in reverse order to maintain left-to-right processing
            for (let i = children.length - 1; i >= 0; i--) {
              stack.push({ node: children[i], level: level + 1 });
            }

            // Increment Y position for next node at this level
            currentY += 200;
          }
        });

        setNodes(newNodes);
        setEdges(newEdges);

        setTimeout(() => {
          if (newNodes.length > 0) {
            fitView({ padding: 0.2, duration: 800 });
          }
        }, 100);
      } else {
        throw new Error(data.message || "Failed to fetch flow data");
      }
    } catch (err) {
      console.error("Error fetching flow data:", err);
      setError("Failed to load flow data");
      if (!err.message?.includes("hierarchies")) {
        toast.error("Failed to load flow data");
      }
    } finally {
      setLoading(false);
    }
  }, [agentFlowId]);

  // Fetch available agents
  const fetchAvailableAgents = useCallback(async () => {
    setAgentsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/user-agent/get-all-agents", {
        agent_flow_id: agentFlowId,
      });

      const data = await response.data;

      if (data.success) {
        setAvailableAgents(data.agents || []);
      } else {
        throw new Error(data.message || "Failed to fetch agents");
      }
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError("Failed to load available agents");
      toast.error("Failed to load available agents");
      setAvailableAgents([]); // Set empty array on error
    } finally {
      setAgentsLoading(false);
    }
  }, []);

  // Initialize flow editor
  useEffect(() => {
    fetchAvailableAgents();
    fetchFlowData();
  }, [fetchAvailableAgents, fetchFlowData]);

  // Handle adding a new agent
  const handleAddAgent = () => {
    if (availableAgents.length === 0 && !agentsLoading) {
      toast.error("No agents available to add");
      return;
    }
    setShowAgentModal(true);
  };

  // Handle agent selection from modal
  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setShowAgentModal(false);
    setShowConfigModal(true);
  };

  // Handle editing an existing node
  const handleEditNode = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      const agentData = availableAgents.find(
        (a) => a.id === node.data.agent_id
      );
      if (agentData) {
        setSelectedAgent({
          ...agentData,
          name: node.data.name,
          description: node.data.description,
          existingParameters: node.data.parameters,
        });
        setEditingNode(node);
        setShowConfigModal(true);
      }
    }
  };

  // Handle duplicating a node
  const handleDuplicateNode = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      const agentData = availableAgents.find(
        (a) => a.id === node.data.agent_id
      );
      if (agentData) {
        setSelectedAgent({
          ...agentData,
          name: `${node.data.name} (Copy)`,
          description: node.data.description,
          existingParameters: node.data.parameters,
        });
        setShowConfigModal(true);
      }
    }
  };

  // Handle deleting a node
  const handleDeleteNode = (nodeId) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      toast.success("Agent deleted successfully");
    }
  };

  const handleAddNewAgent = (sourceNodeId) => {
    setShowAgentModal(true);
    // Store the source node ID to connect later
    setSourceNodeForNewAgent(sourceNodeId);
  };

  // Handle saving agent configuration
  const handleSaveAgent = async (agentConfig) => {
    try {
      if (editingNode) {
        // Call edit endpoint
        const response = await axiosInstance.post(
          "/user-agent/edit-user-agent-flow",
          {
            user_agent_flow_id: editingNode.id,
            viewer_id: "current_user_id", // Replace with actual user ID
            name: agentConfig.name,
            description: agentConfig.description,
            parameter_value: agentConfig.parameters,
            previous_agent_flow_id:
              edges.find((e) => e.target === editingNode.id)?.source || null,
          }
        );

        if (response.data.success) {
          // Update existing agent in state
          setNodes((nds) =>
            nds.map((node) =>
              node.id === editingNode.id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      name: agentConfig.name,
                      description: agentConfig.description,
                      parameters: agentConfig.parameters,
                    },
                  }
                : node
            )
          );
          toast.success("Agent updated successfully");
        }
      } else {
        // Call create endpoint
        const response = await axiosInstance.post(
          "/user-agent/create-user-agent-flow",
          {
            agent_flow_id: agentFlowId,
            agent_id: agentConfig.agent_id,
            agent_name: agentConfig.name,
            agent_description: agentConfig.description,
            parameter_value: agentConfig.parameters,
            previous_agent_flow_id:
              nodes.length > 0 ? nodes[nodes.length - 1].id : null,
          }
        );

        if (response.data.success) {
          const newNodeId = response.data.flow.id;
          const lastNode = nodes[nodes.length - 1];
          const newPosition = {
            x: lastNode ? lastNode.position.x + 350 : 100,
            y: lastNode ? lastNode.position.y : 100,
          };

          const newNode = {
            id: newNodeId,
            type: "agentNode",
            position: newPosition,
            data: {
              id: newNodeId,
              name: agentConfig.name,
              description: agentConfig.description,
              parameters: agentConfig.parameters,
              agent_id: agentConfig.agent_id,
              order: nodes.length + 1,
              onEdit: handleEditNode,
              onDuplicate: handleDuplicateNode,
              onDelete: handleDeleteNode,
              onAddNew: handleAddNewAgent, // Add this new handler
            },
          };

          setNodes((nds) => [...nds, newNode]);

          // Add edge if there's a previous node
          if (lastNode) {
            const newEdge = {
              id: `edge-${lastNode.id}-${newNodeId}`,
              source: lastNode.id,
              target: newNodeId,
              animated: true,
              style: { stroke: "#3b82f6", strokeWidth: 2 },
            };
            setEdges((eds) => [...eds, newEdge]);
          }

          toast.success("Agent added successfully");
        }
      }
    } catch (err) {
      console.error("Error saving agent:", err);
      toast.error("Error saving agent");
    } finally {
      setShowConfigModal(false);
      setSelectedAgent(null);
      setEditingNode(null);
    }
  };

  // Handle connecting nodes
  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#3b82f6", strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Handle saving the entire flow
  const handleSaveFlow = async () => {
    try {
      // In a real implementation, you might want to:
      // 1. Validate the flow structure
      // 2. Send all nodes and edges to the backend
      // 3. Handle any necessary updates

      toast.success("Flow saved successfully");
    } catch (err) {
      console.error("Error saving flow:", err);
      toast.error("Error saving flow");
    }
  };

  // Handle running the flow
  const handleRunFlow = async () => {
    try {
      toast.success("Flow execution started");
    } catch (err) {
      console.error("Error running flow:", err);
      toast.error("Error starting flow execution");
    }
  };

  // Get previous agent responses for parameter configuration
  const getPreviousAgentResponses = () => {
    return nodes.map((node) => ({
      id: node.id,
      name: node.data.name,
      response: node.data.response,
    }));
  };

  // Add debug useEffect
  useEffect(() => {
    // Debug SVG layers
    document.querySelectorAll(".react-flow__node").forEach((node) => {
      node.style.outline = "1px solid rgba(255,0,0,0.3)";
    });
  }, [nodes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600 text-center">
            Loading flow editor...
          </div>
        </div>
      </div>
    );
  }

  if (error && availableAgents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-red-50 to-orange-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Flow
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Back to Flows
            </button>
            <button
              onClick={() => {
                setError(null);
                fetchAvailableAgents();
                fetchFlowData();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Enhanced Header */}
      <div className="  bg-gray-50 border-b border-gray-200 px-6 pt-4 pb-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Flows
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                {agentFlowName}
              </h1>
              <div className="text-sm text-gray-500">
                {nodes.length} agents • {edges.length} connections
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 ">
            <button
              onClick={handleAddAgent}
              disabled={agentsLoading}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Plus size={16} className="mr-2" />
              Add Agent
            </button>
            <button
              onClick={handleSaveFlow}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              <Save size={16} className="mr-2" />
              Save Flow
            </button>
            <button
              onClick={handleRunFlow}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
            >
              <Play size={16} className="mr-2" />
              Run Flow
            </button>
          </div>
        </div>
      </div>

      {/* Flow Editor */}
      <div className="flex-1 mb-12 " ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={{ agentNode: AgentNode }}
          proOptions={{
            handleElementEvents: true, // Crucial
            handlePositionEvents: true,
          }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Controls className="!bg-white !shadow-lg !border !border-gray-200 !rounded-xl" />
          <MiniMap
            className="!bg-white !shadow-lg !border !border-gray-200 !rounded-xl"
            nodeColor={(n) => (n.selected ? "#3b82f6" : "#9ca3af")}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Background
            variant="dots"
            gap={20}
            size={2}
            color="#515254"
            className="opacity-100"
          />

          {/* Empty state */}
          {nodes.length === 0 && !loading && (
            <Panel position="center">
              <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl max-w-md">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Start Building Your Agent Flow
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Create powerful automation workflows by connecting AI agents.
                  Each agent can process data and pass results to the next.
                </p>
                <button
                  onClick={handleAddAgent}
                  disabled={agentsLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                >
                  <Plus size={16} className="mr-2 inline" />
                  Add Your First Agent
                </button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Modals */}
      <AgentSelectionModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        agents={availableAgents}
        onSelect={handleAgentSelect}
        loading={agentsLoading}
      />

      <ParameterConfigModal
        isOpen={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          setSelectedAgent(null);
          setEditingNode(null);
        }}
        agent={selectedAgent}
        onSave={handleSaveAgent}
        previousAgentResponses={getPreviousAgentResponses()}
      />
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const AgentFlowEditor = ({ agentFlowId, agentFlowName, onBack }) => {
  return (
    <ReactFlowProvider>
      <FlowEditor
        agentFlowId={agentFlowId}
        agentFlowName={agentFlowName}
        onBack={onBack}
      />
    </ReactFlowProvider>
  );
};

export default AgentFlowEditor;
