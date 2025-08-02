import { useState, useEffect, useContext } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiChevronRight,
  FiUser,
  FiCheck,
  FiX,
  FiMenu,
  FiExternalLink,
  FiCalendar,
} from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { GlobalContext } from "../../../../../context/GlobalState";
import useAxiosInstance from "../../../../../Services/useAxiosInstance";

const ItemType = "ACTION";

// Custom scrollbar and animation styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
  
  .stage-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateY(0);
  }
  
  .stage-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .action-item {
    transition: all 0.2s ease-in-out;
  }
  
  .action-item:hover {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }
  
  .progress-bar {
    background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e0 100%);
  }
  
  .progress-fill {
    background: linear-gradient(90deg, var(--progress-color) 0%, var(--progress-color-light) 100%);
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .pulse-success {
    animation: pulseSuccess 0.6s ease-in-out;
  }
  
  @keyframes pulseSuccess {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
  
  .gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
`;

function DraggableAction({ action, index, stageId, moveAction, children }) {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: ItemType,
    item: { id: action.id, index, stageId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.id !== action.id && draggedItem.stageId === stageId) {
        moveAction(draggedItem.index, index, stageId);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => dragPreview(drop(node))}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="relative"
    >
      <div className="flex items-center">
        <div
          ref={drag}
          className="cursor-move p-1 text-gray-400 hover:text-gray-600 mr-2"
        >
          <FiMenu size={14} />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

const ActionPlanPreview = ({ data, hexColor = "#28747d", contentId }) => {
  // Local state management
  const [actionPlan, setActionPlan] = useState({
    name: "Action Plan",
    stages: [],
  });

  const [collapsedStages, setCollapsedStages] = useState(new Set());
  const [editingItems, setEditingItems] = useState(new Set());
  const [taskModal, setTaskModal] = useState(null);
  const [assigneePopup, setAssigneePopup] = useState(null);
  const [newActions, setNewActions] = useState(new Set());
  const [editingPlanName, setEditingPlanName] = useState(false);

  const [tempAssignee, setTempAssignee] = useState({
    name: "",
    email: "",
  });
  const [emailError, setEmailError] = useState("");

  // Organization users state
  const [orgUsers, setOrgUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigneeMode, setAssigneeMode] = useState("manual");
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // API and context
  const { viewer_id } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  // Load initial data
  useEffect(() => {
    if (data) {
      try {
        // Parse the string data to object
        const parsedData = typeof data === "string" ? JSON.parse(data) : data;

        if (parsedData && parsedData.stages) {
          setActionPlan({
            name: parsedData.name || "Action Plan",
            stages: parsedData.stages.map((stage) => ({
              id: stage.id,
              stageName: stage.stageName,
              actions: stage.actions.map((action) => ({
                id: action.id,
                name: action.name,
                description: action.description || "",
                dueDate: action.dueDate || "",
                assignedTo: {
                  name: action.assignedTo?.name || "",
                  email: action.assignedTo?.email || "",
                },
                internal: action.internal || 0,
                completed: action.completed || false,
              })),
            })),
          });
        }
      } catch (error) {
        console.error("Error parsing action plan data:", error);
      }
    }
  }, [data]);

  // Calculate progress
  const totalActions = actionPlan.stages.reduce(
    (sum, stage) => sum + stage.actions.length,
    0
  );
  const completedActions = actionPlan.stages.reduce(
    (sum, stage) =>
      sum + stage.actions.filter((action) => action.completed).length,
    0
  );
  const progressPercentage =
    totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Check if there are any unsaved new actions
  const hasUnsavedActions = newActions.size > 0;

  // API call to save changes
  const saveToAPI = async (updatedActionPlan) => {
    try {
      const payload = {
        name: updatedActionPlan.name,
        description: "Action Plan with stages and tasks",
        parameters: {
          Type: "ActionPlan",
          name: updatedActionPlan.name,
          stages: updatedActionPlan.stages.map((stage) => ({
            id: stage.id,
            stageName: stage.stageName,
            actions: stage.actions.map((action) => ({
              id: action.id,
              name: action.name,
              description: action.description,
              dueDate: action.dueDate,
              assignedTo: {
                name: action.assignedTo.name,
                email: action.assignedTo.email,
              },
              internal: action.internal,
              completed: action.completed,
            })),
          })),
        },
        content_id: contentId,
      };

      await axiosInstance.post("/pitch-content-feature/edit-feature", payload);
    } catch (error) {
      console.error("Error saving action plan:", error);
    }
  };

  // Stage Functions
  const handleAddStage = async () => {
    if (hasUnsavedActions) return;

    const newStage = {
      id: Date.now(),
      stageName: "New Stage",
      actions: [],
    };

    const updatedActionPlan = {
      ...actionPlan,
      stages: [...actionPlan.stages, newStage],
    };

    setActionPlan(updatedActionPlan);
    await saveToAPI(updatedActionPlan);
  };

  const handleUpdateStage = async (stageId, updates) => {
    const updatedActionPlan = {
      ...actionPlan,
      stages: actionPlan.stages.map((stage) =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      ),
    };

    setActionPlan(updatedActionPlan);
    await saveToAPI(updatedActionPlan);
  };

  const handleDeleteStage = async (stageId) => {
    const updatedActionPlan = {
      ...actionPlan,
      stages: actionPlan.stages.filter((stage) => stage.id !== stageId),
    };

    setActionPlan(updatedActionPlan);
    await saveToAPI(updatedActionPlan);
  };

  // Action Functions
  const handleAddAction = (stageId) => {
    if (hasUnsavedActions) return;

    const newActionId = Date.now();
    setNewActions((prev) => new Set([...prev, newActionId]));
    setEditingItems((prev) => new Set([...prev, `action-${newActionId}`]));

    const newAction = {
      id: newActionId,
      name: "",
      description: "",
      dueDate: "",
      assignedTo: { name: "", email: "" },
      internal: 0,
      completed: false,
    };

    const updatedActionPlan = {
      ...actionPlan,
      stages: actionPlan.stages.map((stage) =>
        stage.id === stageId
          ? { ...stage, actions: [...stage.actions, newAction] }
          : stage
      ),
    };

    setActionPlan(updatedActionPlan);
  };

  const handleUpdateAction = async (stageId, actionId, updates) => {
    const updatedActionPlan = {
      ...actionPlan,
      stages: actionPlan.stages.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              actions: stage.actions.map((action) =>
                action.id === actionId ? { ...action, ...updates } : action
              ),
            }
          : stage
      ),
    };

    setActionPlan(updatedActionPlan);
    await saveToAPI(updatedActionPlan);
  };

  const handleDeleteAction = async (stageId, actionId) => {
    const updatedActionPlan = {
      ...actionPlan,
      stages: actionPlan.stages.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              actions: stage.actions.filter((action) => action.id !== actionId),
            }
          : stage
      ),
    };

    setActionPlan(updatedActionPlan);

    // Clean up local states
    setEditingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(`action-${actionId}`);
      return newSet;
    });
    setNewActions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(actionId);
      return newSet;
    });

    await saveToAPI(updatedActionPlan);
  };

  const handleMoveAction = async (dragIndex, hoverIndex, stageId) => {
    const stageIndex = actionPlan.stages.findIndex(
      (stage) => stage.id === stageId
    );
    if (stageIndex === -1) return;

    const stage = actionPlan.stages[stageIndex];
    const draggedAction = stage.actions[dragIndex];

    const newActions = [...stage.actions];
    newActions.splice(dragIndex, 1);
    newActions.splice(hoverIndex, 0, draggedAction);

    const updatedActionPlan = {
      ...actionPlan,
      stages: actionPlan.stages.map((s, index) =>
        index === stageIndex ? { ...s, actions: newActions } : s
      ),
    };

    setActionPlan(updatedActionPlan);
    await saveToAPI(updatedActionPlan);
  };

  const saveNewAction = async (actionId, stageId) => {
    const stage = actionPlan.stages.find((s) => s.id === stageId);
    const action = stage?.actions.find((a) => a.id === actionId);

    if (!action?.name.trim()) {
      await handleUpdateAction(stageId, actionId, { name: "New Action" });
    }

    setNewActions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(actionId);
      return newSet;
    });
    setEditingItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(`action-${actionId}`);
      return newSet;
    });

    await saveToAPI(actionPlan);
  };

  const cancelNewAction = async (stageId, actionId) => {
    await handleDeleteAction(stageId, actionId);
  };

  const handleUpdatePlanName = async (newName) => {
    const updatedActionPlan = {
      ...actionPlan,
      name: newName,
    };

    setActionPlan(updatedActionPlan);
    await saveToAPI(updatedActionPlan);
  };

  // UI Functions
  const toggleStageCollapse = (stageId) => {
    setCollapsedStages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  const toggleEditing = (key) => {
    setEditingItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const openTaskModal = (stageId, actionId) => {
    const stage = actionPlan.stages.find((s) => s.id === stageId);
    const action = stage?.actions.find((a) => a.id === actionId);
    if (action) {
      setTaskModal({ stageId, actionId, action: { ...action } });
    }
  };

  const updateTaskModal = (updates) => {
    if (taskModal) {
      setTaskModal({
        ...taskModal,
        action: { ...taskModal.action, ...updates },
      });
    }
  };

  const saveTaskModal = async () => {
    if (taskModal) {
      await handleUpdateAction(
        taskModal.stageId,
        taskModal.actionId,
        taskModal.action
      );
      setTaskModal(null);
    }
  };

  // Organization users functions
  const fetchOrgUsers = async () => {
    if (orgUsers.length > 0) return;

    setLoadingUsers(true);
    try {
      const response = await axiosInstance.post(`/view-all-users`, {
        viewer_id: viewer_id,
      });

      if (response.data.success) {
        const activeUsers = response.data.users
          .filter((user) => user.active === 1)
          .map((user) => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`.trim(),
            email: user.email,
            role: user.role_name,
          }));
        setOrgUsers(activeUsers);
      }
    } catch (error) {
      console.error("Error fetching organization users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const openAssigneePopup = (stageId, actionId) => {
    const stage = actionPlan.stages.find((s) => s.id === stageId);
    const action = stage?.actions.find((a) => a.id === actionId);
    if (action) {
      setAssigneePopup({ stageId, actionId, action });
      setTempAssignee({
        name: action.assignedTo.name || "",
        email: action.assignedTo.email || "",
      });
      setAssigneeMode("manual");
      setUserSearchTerm("");
      fetchOrgUsers();
    }
  };

  const updateAssignee = async (updates) => {
    if (assigneePopup) {
      await handleUpdateAction(
        assigneePopup.stageId,
        assigneePopup.actionId,
        updates
      );
      setAssigneePopup({
        ...assigneePopup,
        action: { ...assigneePopup.action, ...updates },
      });
    }
  };

  const selectOrgUser = async (user) => {
    if (assigneePopup) {
      await updateAssignee({
        assignedTo: {
          name: user.name,
          email: user.email,
        },
      });
      setAssigneePopup(null);
    }
  };

  // Utility functions
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "";

    // Handle both string and Date objects
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;

    if (isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const filteredUsers = orgUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <>
      <style 
        dangerouslySetInnerHTML={{ 
          __html: scrollbarStyles.replace('var(--progress-color)', hexColor).replace('var(--progress-color-light)', hexColor + '80') 
        }} 
      />
      <DndProvider backend={HTML5Backend}>
        {/* Main Content */}
        <div className="w-full bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm overflow-hidden">
          {/* Enhanced Header with Progress */}
          <div className="bg-gradient-to-r from-white to-gray-50 px-4 sm:px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Plan Name - Responsive */}
              <div className="flex-1 min-w-0">
                {editingPlanName ? (
                  <input
                    type="text"
                    value={actionPlan.name}
                    onChange={(e) =>
                      setActionPlan({ ...actionPlan, name: e.target.value })
                    }
                    onBlur={() => {
                      setEditingPlanName(false);
                      handleUpdatePlanName(actionPlan.name);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        setEditingPlanName(false);
                        handleUpdatePlanName(actionPlan.name);
                      }
                    }}
                    className="text-xl sm:text-2xl font-bold bg-transparent border-b-2 focus:outline-none w-full truncate"
                    style={{ borderBottomColor: hexColor }}
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-xl sm:text-2xl font-bold text-gray-800 cursor-pointer hover:text-opacity-80 transition-colors truncate"
                    onClick={() => setEditingPlanName(true)}
                    style={{ color: hexColor }}
                  >
                    {actionPlan.name}
                  </h2>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {totalActions} {totalActions === 1 ? 'task' : 'tasks'} • {actionPlan.stages.length} {actionPlan.stages.length === 1 ? 'stage' : 'stages'}
                </p>
              </div>
              
              {/* Progress Section - Enhanced */}
              <div className="flex items-center space-x-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: hexColor }}>
                    {progressPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {completedActions}/{totalActions} complete
                  </div>
                </div>
                <div className="w-20 sm:w-32 h-3 progress-bar rounded-full overflow-hidden">
                  <div
                    className="h-full progress-fill rounded-full"
                    style={{
                      width: `${progressPercentage}%`,
                      '--progress-color': hexColor,
                      '--progress-color-light': hexColor + '80'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stages Content */}
          <div className="p-4 sm:p-6 max-h-full">
            <div className="space-y-4">
              {actionPlan.stages.map((stage, stageIndex) => {
                const stageCompleted = stage.actions.filter(
                  (a) => a.completed
                ).length;
                const stageTotal = stage.actions.length;
                const stageStatus =
                  stageCompleted === stageTotal && stageTotal > 0
                    ? "Complete"
                    : "On Track";
                const stageProgress = stageTotal > 0 ? (stageCompleted / stageTotal) * 100 : 0;

                return (
                  <div
                    key={stage.id}
                    className="stage-card bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md fade-in"
                    style={{ animationDelay: `${stageIndex * 0.1}s` }}
                  >
                    {/* Stage Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <button
                            onClick={() => toggleStageCollapse(stage.id)}
                            className="text-gray-500 hover:text-gray-700 flex-shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            {collapsedStages.has(stage.id) ? (
                              <FiChevronRight size={18} />
                            ) : (
                              <FiChevronDown size={18} />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            {editingItems.has(`stage-${stage.id}`) ? (
                              <input
                                type="text"
                                value={stage.stageName}
                                onChange={(e) =>
                                  setActionPlan({
                                    ...actionPlan,
                                    stages: actionPlan.stages.map((s) =>
                                      s.id === stage.id
                                        ? { ...s, stageName: e.target.value }
                                        : s
                                    ),
                                  })
                                }
                                onBlur={() => {
                                  toggleEditing(`stage-${stage.id}`);
                                  handleUpdateStage(stage.id, {
                                    stageName: stage.stageName,
                                  });
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    toggleEditing(`stage-${stage.id}`);
                                    handleUpdateStage(stage.id, {
                                      stageName: stage.stageName,
                                    });
                                  }
                                }}
                                className="text-lg font-semibold bg-transparent border-b-2 focus:outline-none w-full"
                                style={{ borderBottomColor: hexColor }}
                                autoFocus
                              />
                            ) : (
                              <h3
                                className="text-lg font-semibold text-gray-800 cursor-pointer hover:opacity-80 transition-opacity truncate"
                                onClick={() => toggleEditing(`stage-${stage.id}`)}
                                style={{ color: hexColor }}
                              >
                                {stage.stageName}
                              </h3>
                            )}
                            
                            {/* Stage Progress Bar */}
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500 ease-out"
                                  style={{
                                    width: `${stageProgress}%`,
                                    backgroundColor: stageStatus === "Complete" ? "#10b981" : hexColor,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600 min-w-[3rem] text-right">
                                {Math.round(stageProgress)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {stageCompleted}/{stageTotal} tasks
                            </span>
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-medium ${
                                stageStatus === "Complete"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-blue-100 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {stageStatus}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteStage(stage.id)}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-md hover:bg-red-50 transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stage Actions */}
                    {!collapsedStages.has(stage.id) && (
                      <div className="p-4">
                        <div className="space-y-2">
                          {stage.actions.map((action, index) => {
                            return (
                              <DraggableAction
                                key={action.id}
                                action={action}
                                index={index}
                                stageId={stage.id}
                                moveAction={handleMoveAction}
                              >
                                <div className="action-item bg-white hover:shadow-sm transition-all duration-200 rounded-lg border border-gray-100 hover:border-gray-200 group">
                                  {/* Desktop Layout */}
                                  <div className="hidden sm:flex items-center justify-between py-3 px-4">
                                  {/* Left side: Checkbox + Action Name */}
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    {/* Checkbox */}
                                    <button
                                      onClick={() =>
                                        handleUpdateAction(stage.id, action.id, {
                                          completed: !action.completed,
                                        })
                                      }
                                      className={`flex-shrink-0 transition-all duration-200 ${action.completed ? 'pulse-success' : ''}`}
                                    >
                                      {action.completed ? (
                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                          <FiCheck
                                            size={12}
                                            className="text-white"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-green-500 transition-colors" />
                                      )}
                                    </button>

                                    {/* Action Name */}
                                    <div className="flex-1 min-w-0">
                                      {editingItems.has(`action-${action.id}`) ? (
                                        <input
                                          type="text"
                                          value={action.name}
                                          onChange={(e) =>
                                            setActionPlan({
                                              ...actionPlan,
                                              stages: actionPlan.stages.map((s) =>
                                                s.id === stage.id
                                                  ? {
                                                      ...s,
                                                      actions: s.actions.map(
                                                        (a) =>
                                                          a.id === action.id
                                                            ? {
                                                                ...a,
                                                                name: e.target
                                                                  .value,
                                                              }
                                                            : a
                                                      ),
                                                    }
                                                  : s
                                              ),
                                            })
                                          }
                                          onBlur={() => {
                                            if (!newActions.has(action.id)) {
                                              toggleEditing(
                                                `action-${action.id}`
                                              );
                                              handleUpdateAction(
                                                stage.id,
                                                action.id,
                                                { name: action.name }
                                              );
                                            }
                                          }}
                                          onKeyPress={(e) => {
                                            if (
                                              e.key === "Enter" &&
                                              !newActions.has(action.id)
                                            ) {
                                              toggleEditing(
                                                `action-${action.id}`
                                              );
                                              handleUpdateAction(
                                                stage.id,
                                                action.id,
                                                { name: action.name }
                                              );
                                            }
                                          }}
                                          className="w-full bg-transparent border-b-2 focus:outline-none text-sm font-medium"
                                          style={{ borderBottomColor: hexColor }}
                                          placeholder={
                                            newActions.has(action.id)
                                              ? "Enter step name..."
                                              : ""
                                          }
                                          autoFocus
                                        />
                                      ) : (
                                        <span
                                          className={`cursor-pointer text-sm font-medium transition-colors truncate block ${
                                            action.completed
                                              ? "line-through text-gray-500"
                                              : "text-gray-800 hover:opacity-80"
                                          }`}
                                          onClick={() =>
                                            !newActions.has(action.id) &&
                                            toggleEditing(`action-${action.id}`)
                                          }
                                        >
                                          {action.name || "Untitled Step"}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right side: Controls in order - Internal/External, Calendar, User, Details */}
                                  <div className="flex items-center space-x-2 flex-shrink-0">
                                    {/* Save/Cancel buttons for new actions */}
                                    {newActions.has(action.id) && (
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={() =>
                                            saveNewAction(action.id, stage.id)
                                          }
                                          className="p-1 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                                        >
                                          <FaCheck size={14} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            cancelNewAction(stage.id, action.id)
                                          }
                                          className="p-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                                        >
                                          <ImCross size={10} />
                                        </button>
                                      </div>
                                    )}

                                    {!newActions.has(action.id) && (
                                      <>
                                        {/* Internal/External Badge */}
                                        <button
                                          onClick={() =>
                                            handleUpdateAction(
                                              stage.id,
                                              action.id,
                                              {
                                                internal:
                                                  action.internal === 1 ? 0 : 1,
                                              }
                                            )
                                          }
                                          className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                                            action.internal === 1
                                              ? "bg-purple-100 text-purple-700"
                                              : "bg-gray-100 text-gray-600"
                                          }`}
                                        >
                                          {action.internal === 1
                                            ? "Internal"
                                            : "External"}
                                        </button>

                                        {/* Due Date Calendar */}
                                        <div className="flex items-center">
                                          {action.dueDate ? (
                                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                              {formatDate(action.dueDate)}
                                            </span>
                                          ) : (
                                            <div className="relative">
                                              <input
                                                type="date"
                                                value=""
                                                onChange={(e) =>
                                                  handleUpdateAction(
                                                    stage.id,
                                                    action.id,
                                                    { dueDate: e.target.value }
                                                  )
                                                }
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                              />
                                              <button className="text-gray-400 hover:text-gray-600 p-1 transition-colors pointer-events-none">
                                                <FiCalendar size={16} />
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                        {/* Assignee Avatar */}
                                        <button
                                          onClick={() =>
                                            openAssigneePopup(stage.id, action.id)
                                          }
                                          className="flex items-center transition-transform hover:scale-105"
                                        >
                                          {action.assignedTo.name ? (
                                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                              {getInitials(action.assignedTo.name)}
                                            </div>
                                          ) : (
                                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors">
                                              <FiUser
                                                size={12}
                                                className="text-gray-500"
                                              />
                                            </div>
                                          )}
                                        </button>

                                        {/* Details/Expand Button */}
                                        <button
                                          onClick={() =>
                                            openTaskModal(stage.id, action.id)
                                          }
                                          className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                                        >
                                          <FiExternalLink size={14} />
                                        </button>

                                        {/* Delete Action (hidden, shows on hover) */}
                                        <button
                                          onClick={() =>
                                            handleDeleteAction(stage.id, action.id)
                                          }
                                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-all"
                                        >
                                          <FiTrash2 size={14} />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                  </div>

                                  {/* Mobile Layout */}
                                  <div className="sm:hidden">
                                    <div className="flex items-center justify-between py-3 px-4">
                                      {/* Left side: Checkbox + Action Name */}
                                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        {/* Checkbox */}
                                        <button
                                          onClick={() =>
                                            handleUpdateAction(stage.id, action.id, {
                                              completed: !action.completed,
                                            })
                                          }
                                          className={`flex-shrink-0 transition-all duration-200 ${action.completed ? 'pulse-success' : ''}`}
                                        >
                                          {action.completed ? (
                                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                                              <FiCheck
                                                size={12}
                                                className="text-white"
                                              />
                                            </div>
                                          ) : (
                                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-green-500 transition-colors" />
                                          )}
                                        </button>

                                        {/* Action Name */}
                                        <div className="flex-1 min-w-0">
                                          {editingItems.has(`action-${action.id}`) ? (
                                            <input
                                              type="text"
                                              value={action.name}
                                              onChange={(e) =>
                                                setActionPlan({
                                                  ...actionPlan,
                                                  stages: actionPlan.stages.map((s) =>
                                                    s.id === stage.id
                                                      ? {
                                                          ...s,
                                                          actions: s.actions.map(
                                                            (a) =>
                                                              a.id === action.id
                                                                ? {
                                                                    ...a,
                                                                    name: e.target.value,
                                                                  }
                                                                : a
                                                          ),
                                                        }
                                                      : s
                                                  ),
                                                })
                                              }
                                              onBlur={() => {
                                                if (!newActions.has(action.id)) {
                                                  toggleEditing(`action-${action.id}`);
                                                  handleUpdateAction(stage.id, action.id, { name: action.name });
                                                }
                                              }}
                                              onKeyPress={(e) => {
                                                if (e.key === "Enter" && !newActions.has(action.id)) {
                                                  toggleEditing(`action-${action.id}`);
                                                  handleUpdateAction(stage.id, action.id, { name: action.name });
                                                }
                                              }}
                                              className="w-full bg-transparent border-b-2 focus:outline-none text-xs font-medium"
                                              style={{ borderBottomColor: hexColor }}
                                              placeholder={newActions.has(action.id) ? "Enter step name..." : ""}
                                              autoFocus
                                            />
                                          ) : (
                                            <span
                                              className={`cursor-pointer text-xs font-medium transition-colors block ${
                                                action.completed ? "line-through text-gray-500" : "text-gray-800 hover:opacity-80"
                                              }`}
                                              onClick={() => !newActions.has(action.id) && toggleEditing(`action-${action.id}`)}
                                            >
                                              {action.name || "Untitled Step"}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Right side: All Controls in same line */}
                                      <div className="flex items-center space-x-1 flex-shrink-0">
                                        {newActions.has(action.id) ? (
                                          <div className="flex items-center space-x-1">
                                            <button
                                              onClick={() => saveNewAction(action.id, stage.id)}
                                              className="p-1.5 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
                                            >
                                              <FaCheck size={12} />
                                            </button>
                                            <button
                                              onClick={() => cancelNewAction(stage.id, action.id)}
                                              className="p-1.5 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                                            >
                                              <ImCross size={10} />
                                            </button>
                                          </div>
                                        ) : (
                                          <>
                                            {/* Internal/External Badge */}
                                            <button
                                              onClick={() =>
                                                handleUpdateAction(stage.id, action.id, {
                                                  internal: action.internal === 1 ? 0 : 1,
                                                })
                                              }
                                              className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                                                action.internal === 1
                                                  ? "bg-purple-100 text-purple-700"
                                                  : "bg-gray-100 text-gray-600"
                                              }`}
                                            >
                                              {action.internal === 1 ? "Internal" : "External"}
                                            </button>

                                            {/* Calendar */}
                                            <div className="flex items-center">
                                              {action.dueDate ? (
                                                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                  {formatDate(action.dueDate)}
                                                </span>
                                              ) : (
                                                <div className="relative">
                                                  <input
                                                    type="date"
                                                    value=""
                                                    onChange={(e) =>
                                                      handleUpdateAction(stage.id, action.id, { dueDate: e.target.value })
                                                    }
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                  />
                                                  <button className="text-gray-400 hover:text-gray-600 p-1 transition-colors pointer-events-none">
                                                    <FiCalendar size={14} />
                                                  </button>
                                                </div>
                                              )}
                                            </div>

                                            {/* User */}
                                            <button
                                              onClick={() => openAssigneePopup(stage.id, action.id)}
                                              className="flex items-center transition-transform hover:scale-105"
                                            >
                                              {action.assignedTo.name ? (
                                                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                                  {getInitials(action.assignedTo.name)}
                                                </div>
                                              ) : (
                                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors">
                                                  <FiUser size={12} className="text-gray-500" />
                                                </div>
                                              )}
                                            </button>

                                            {/* Details/Extend */}
                                            <button
                                              onClick={() => openTaskModal(stage.id, action.id)}
                                              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                                            >
                                              <FiExternalLink size={14} />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                            </DraggableAction>
                          );
                        })}

                        {/* Add Action */}
                        <button
                          onClick={() => handleAddAction(stage.id)}
                          disabled={hasUnsavedActions}
                          className={`flex items-center space-x-2 py-2 px-2 w-full text-left ${
                            hasUnsavedActions
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500"
                          }`}
                          onMouseEnter={(e) =>
                            !hasUnsavedActions &&
                            (e.target.style.color = hexColor)
                          }
                          onMouseLeave={(e) =>
                            !hasUnsavedActions &&
                            (e.target.style.color = "#6b7280")
                          }
                          title={
                            hasUnsavedActions
                              ? "Please save the current step before adding a new one"
                              : ""
                          }
                        >
                          <FiPlus size={16} />
                          <span className="text-sm">
                            {hasUnsavedActions
                              ? "Save current step first"
                              : "Add Step"}
                          </span>
                        </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Stage */}
              <button
                onClick={handleAddStage}
                disabled={hasUnsavedActions}
                className={`flex items-center space-x-2 py-3 px-4 w-full text-left border-2 border-dashed rounded-lg ${
                  hasUnsavedActions
                    ? "text-gray-300 cursor-not-allowed border-gray-200"
                    : "text-gray-500 border-gray-300"
                }`}
                onMouseEnter={(e) => {
                  if (!hasUnsavedActions) {
                    e.target.style.color = hexColor;
                    e.target.style.borderColor = hexColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!hasUnsavedActions) {
                    e.target.style.color = "#6b7280";
                    e.target.style.borderColor = "#d1d5db";
                  }
                }}
                title={
                  hasUnsavedActions
                    ? "Please save the current step before adding a new stage"
                    : ""
                }
              >
                <FiPlus size={16} />
                <span>
                  {hasUnsavedActions ? "Save current step first" : "Add Stage"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Task Details Modal */}
        {taskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-5 pb-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Task Details</h3>
                <button
                  onClick={() => setTaskModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* First Row - Name and Due Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Task Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Name
                    </label>
                    <input
                      type="text"
                      value={taskModal.action.name}
                      onChange={(e) =>
                        updateTaskModal({ name: e.target.value })
                      }
                      className="w-full p-2 border border-gray-400 rounded-md"
                      placeholder="Enter task name"
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskModal.action.dueDate}
                      onChange={(e) =>
                        updateTaskModal({ dueDate: e.target.value })
                      }
                      className="w-full p-2 border rounded-md border-gray-400"
                    />
                  </div>
                </div>

                {/* Second Row - Description (full width) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={taskModal.action.description}
                    onChange={(e) =>
                      updateTaskModal({ description: e.target.value })
                    }
                    className="w-full p-2 border rounded-md border-gray-400"
                    rows={3}
                    placeholder="Enter task description..."
                  />
                </div>

                {/* Third Row - Assigned Name and Email */}
                {taskModal.action.assignedTo.name &&
                  taskModal.action.assignedTo.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned To
                      </label>
                      <div className="flex flex-row gap-2">
                        <p className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                          {taskModal.action.assignedTo.name}
                        </p>
                        <p className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800">
                          {taskModal.action.assignedTo.email}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Task Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={taskModal.action.internal === 1}
                        onChange={() => updateTaskModal({ internal: 1 })}
                        className="mr-2"
                      />
                      <span className="text-sm">Internal</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={taskModal.action.internal === 0}
                        onChange={() => updateTaskModal({ internal: 0 })}
                        className="mr-2"
                      />
                      <span className="text-sm">External</span>
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => setTaskModal(null)}
                    className="px-4 sm:px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTaskModal}
                    className="ml-4 px-4 sm:px-6 py-2 text-sm font-medium text-white rounded-md"
                    style={{ backgroundColor: hexColor }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = `${hexColor}dd`)
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = hexColor)
                    }
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Assignee Popup */}
        {assigneePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Assignee</h3>
                <button
                  onClick={() => setAssigneePopup(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setAssigneeMode("manual")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    assigneeMode === "manual"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Add Manually
                </button>
                <button
                  onClick={() => setAssigneeMode("organization")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    assigneeMode === "organization"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  From Organization
                </button>
              </div>

              {assigneeMode === "manual" ? (
                <div className="space-y-4 h-64">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={tempAssignee.name}
                      onChange={(e) =>
                        setTempAssignee((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                      style={{ "--tw-ring-color": `${hexColor}40` }}
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={tempAssignee.email}
                      onChange={(e) => {
                        setTempAssignee((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }));
                        if (emailError) setEmailError("");
                      }}
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:outline-none ${
                        emailError ? "border-red-500" : ""
                      }`}
                      style={{ "--tw-ring-color": `${hexColor}40` }}
                      placeholder="Enter email"
                    />
                    {emailError && (
                      <p className="text-red-500 text-xs mt-1">{emailError}</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Organization Users Mode */
                <div className="space-y-4 h-72">
                  {/* Search Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Users
                    </label>
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:outline-none"
                      style={{ "--tw-ring-color": `${hexColor}40` }}
                      placeholder="Search by name or email..."
                    />
                  </div>

                  {/* Users List */}
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    {loadingUsers ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
                        Loading users...
                      </div>
                    ) : filteredUsers.length > 0 ? (
                      <div className="divide-y">
                        {filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => selectOrgUser(user)}
                            className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                {getInitials(user.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {user.email}
                                </p>
                                {user.role && (
                                  <p className="text-xs text-gray-400 truncate">
                                    {user.role}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        {userSearchTerm
                          ? "No users found matching your search."
                          : "No users available."}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                {assigneeMode == "manual" && (
                  <button
                    onClick={() => setAssigneePopup(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                {assigneeMode === "manual" && (
                  <button
                    onClick={async () => {
                      // Validate email before closing
                      if (
                        tempAssignee.email &&
                        !validateEmail(tempAssignee.email)
                      ) {
                        setEmailError("Please enter a valid email address");
                        return;
                      }

                      // Only update if values changed
                      if (
                        assigneePopup.action.assignedTo.name !==
                          tempAssignee.name ||
                        assigneePopup.action.assignedTo.email !==
                          tempAssignee.email
                      ) {
                        await handleUpdateAction(
                          assigneePopup.stageId,
                          assigneePopup.actionId,
                          {
                            assignedTo: {
                              name: tempAssignee.name,
                              email: tempAssignee.email,
                            },
                          }
                        );
                      }
                      setAssigneePopup(null);
                    }}
                    className="px-4 py-2 text-white rounded transition-colors"
                    style={{ backgroundColor: hexColor }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = `${hexColor}dd`)
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = hexColor)
                    }
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </DndProvider>
    </>
  );
};

export default ActionPlanPreview;