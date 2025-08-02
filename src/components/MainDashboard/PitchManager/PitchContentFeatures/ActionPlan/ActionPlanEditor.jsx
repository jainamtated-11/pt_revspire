import { useState, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  FiPlus,
  FiEdit2,
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

// Redux actions and selectors
import {
  updateActionPlanName,
  addActionPlanStage,
  updateActionPlanStage,
  deleteActionPlanStage,
  addActionPlanAction,
  updateActionPlanAction,
  deleteActionPlanAction,
  reorderActionPlanActions,
  selectActionPlan,
  selectActionPlanJSON,
  resetActionPlan,
  setStages,
} from "../../../../../features/pitch/pitchFeaturesSlice";
import { GlobalContext } from "../../../../../context/GlobalState";
import useAxiosInstance from "../../../../../Services/useAxiosInstance";

const ItemType = "ACTION";

// Custom scrollbar styles
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

const ActionPlanEditor = ({
  onClose,
  hexColor,
  onClickHandler,
  contentWhileEditing,
  onDataChange,
  onActionEdit, // New prop similar to onProcessEdit
}) => {
  const dispatch = useDispatch();

  // Redux state
  const actionPlan = useSelector(selectActionPlan);
  const actionPlanJSON = useSelector(selectActionPlanJSON);
  const { viewer_id } = useContext(GlobalContext);
  // Add new state for saving
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const axiosInstance = useAxiosInstance();
  const [tempAssignee, setTempAssignee] = useState({
    name: "",
    email: "",
  });
  const [emailError, setEmailError] = useState("");

  // Local UI state only
  const [editingPlanName, setEditingPlanName] = useState(false);
  const [collapsedStages, setCollapsedStages] = useState(new Set());
  const [editingItems, setEditingItems] = useState(new Set());
  const [taskModal, setTaskModal] = useState(null);
  const [assigneePopup, setAssigneePopup] = useState(null);
  const [newActions, setNewActions] = useState(new Set());

  const [orgUsers, setOrgUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigneeMode, setAssigneeMode] = useState("manual"); // 'manual' or 'organization'
  const [userSearchTerm, setUserSearchTerm] = useState("");

  useEffect(() => {
    // console.log("contentWhileEditing", contentWhileEditing);
    if (contentWhileEditing) {
      const stringContentLink = contentWhileEditing?.content_link;
      try {
        // Parse the string to object if it's a string
        const contentData =
          typeof stringContentLink === "string"
            ? JSON.parse(stringContentLink)
            : stringContentLink;

        // Verify we have Steps array before dispatching
        if (contentData?.stages && Array.isArray(contentData.stages)) {
          dispatch(setStages(contentData.stages));
        } else {
          console.error("Invalid Steps data:", contentData);
        }
      } catch (error) {
        console.error("Error parsing contentWhileEditing:", error);
      }
    }
  }, [contentWhileEditing, dispatch]);

  // Calculate overall progress
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

  // Notify parent of data changes
  const notifyDataChange = () => {
    if (onDataChange) {
      setTimeout(() => {
        onDataChange(actionPlanJSON);
      }, 0);
    }
  };

  // Stage Functions
  const handleAddStage = () => {
    dispatch(addActionPlanStage());
    notifyDataChange();
  };

  const handleUpdateStage = (stageId, updates) => {
    dispatch(updateActionPlanStage({ stageId, updates }));
    notifyDataChange();
  };

  const handleDeleteStage = (stageId) => {
    dispatch(deleteActionPlanStage(stageId));
    notifyDataChange();
  };

  // Action Functions - FIXED: Ensure consistent ID usage
  const handleAddAction = (stageId) => {
    // Prevent adding new action if there are unsaved actions
    if (hasUnsavedActions) {
      return;
    }

    const newActionId = Date.now();

    // Set local state first to ensure it's ready when component re-renders
    setNewActions((prev) => new Set([...prev, newActionId]));
    setEditingItems((prev) => new Set([...prev, `action-${newActionId}`]));

    // Then dispatch Redux action with the same ID
    dispatch(
      addActionPlanAction({
        stageId,
        actionData: {
          id: newActionId, // Pass the ID to Redux
          name: "", // Start with empty name
        },
      })
    );

    notifyDataChange();
  };

  const handleUpdateAction = (stageId, actionId, updates) => {
    dispatch(updateActionPlanAction({ stageId, actionId, updates }));
    notifyDataChange();
  };

  const handleDeleteAction = (stageId, actionId) => {
    dispatch(deleteActionPlanAction({ stageId, actionId }));

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
    notifyDataChange();
  };

  const handleMoveAction = (dragIndex, hoverIndex, stageId) => {
    dispatch(reorderActionPlanActions({ stageId, dragIndex, hoverIndex }));
    notifyDataChange();
  };

  const saveNewAction = (actionId, stageId) => {
    // Find the action to check if name is empty
    const stage = actionPlan.stages.find((s) => s.id === stageId);
    const action = stage?.actions.find((a) => a.id === actionId);

    if (!action?.name.trim()) {
      // If name is empty, set a default name
      handleUpdateAction(stageId, actionId, { name: "New Action" });
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
  };

  const cancelNewAction = (stageId, actionId) => {
    handleDeleteAction(stageId, actionId);
  };

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

  const saveTaskModal = () => {
    if (taskModal) {
      handleUpdateAction(
        taskModal.stageId,
        taskModal.actionId,
        taskModal.action
      );
      setTaskModal(null);
    }
  };

  const fetchOrgUsers = async () => {
    console.log(" I AM HREE ");
    if (orgUsers.length > 0) return; // Don't fetch if already loaded
    console.log(" I AM HREE 2");
    setLoadingUsers(true);
    try {
      const response = await axiosInstance.post(`/view-all-users`, {
        viewer_id: viewer_id,
      });
      if (response.data.success) {
        // Filter only active users and format them
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

  const updateAssignee = (updates) => {
    if (assigneePopup) {
      handleUpdateAction(
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

  const selectOrgUser = (user) => {
    if (assigneePopup) {
      updateAssignee({
        assignedTo: {
          name: user.name,
          email: user.email,
        },
      });
      setAssigneePopup(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const filteredUsers = orgUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Function to handle saving the action plan
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = {
        name: actionPlan.name,
        description: "Action Plan with stages and tasks",
        parameters: {
          Type: "ActionPlan",
          name: actionPlan.name,
          stages: actionPlan.stages.map((stage) => ({
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
      };

      let response;
      if (contentWhileEditing?.content) {
        // Edit existing feature
        response = await axiosInstance.post(
          "/pitch-content-feature/edit-feature",
          {
            ...payload,
            content_id: contentWhileEditing.content_id,
          }
        );

        // const editedProcessOverview = pitchState.processOverview;
        // const editedContentId = contentWhileEditing.content_id;
        // onProcessEdit({ editedContentId, editedProcessOverview });

        const editedData = actionPlan;
        const editedContentId = contentWhileEditing.content_id;
        // console.log("editedActionPlan", editedActionPlan, editedContentId);
        onActionEdit({ editedContentId, editedData });
        dispatch(resetActionPlan());
        onClose();
        return;
      } else {
        // Create new feature
        response = await axiosInstance.post(
          "/pitch-content-feature/create-feature",
          payload
        );
      }

      const contentWithTagline = {
        ...response.data.content,
        tagline: response.data.content.name,
      };

      // Wrap in array and pass to handler
      onClickHandler([contentWithTagline]);
      dispatch(resetActionPlan());
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      setSaveError(error.response?.data?.message || error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <DndProvider backend={HTML5Backend}>
        {/* Modal Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Modal Container */}
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center space-x-3">
                {editingPlanName ? (
                  <input
                    type="text"
                    value={actionPlan.name}
                    onChange={(e) => {
                      dispatch(updateActionPlanName(e.target.value));
                      notifyDataChange();
                    }}
                    onBlur={() => setEditingPlanName(false)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && setEditingPlanName(false)
                    }
                    className="text-2xl font-semibold bg-transparent border-b focus:outline-none text-gray-800"
                    style={{
                      borderBottomColor: hexColor ? `#${hexColor}` : "#3b82f6",
                    }}
                    autoFocus
                  />
                ) : (
                  <h1
                    className="text-2xl font-semibold text-gray-800 cursor-pointer"
                    style={{ color: editingPlanName ? "#374151" : "#374151" }}
                    onMouseEnter={(e) =>
                      !editingPlanName &&
                      (e.target.style.color = hexColor
                        ? `#${hexColor}`
                        : "#2563eb")
                    }
                    onMouseLeave={(e) =>
                      !editingPlanName && (e.target.style.color = "#374151")
                    }
                  >
                    {actionPlan.name}
                  </h1>
                )}
                <FiEdit2
                  className="text-gray-400 cursor-pointer"
                  size={18}
                  onClick={() => setEditingPlanName(true)}
                  onMouseEnter={(e) =>
                    (e.target.style.color = hexColor
                      ? `#${hexColor}`
                      : "#2563eb")
                  }
                  onMouseLeave={(e) => (e.target.style.color = "#9ca3af")}
                />
              </div>

              <div className="flex items-center space-x-4">
                {/* Progress */}
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-medium text-gray-700">
                    {progressPercentage}%
                  </span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${progressPercentage}%`,
                        backgroundColor: hexColor ? `#${hexColor}` : "#10b981", // green-500 fallback
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    dispatch(resetActionPlan());
                    onClose();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Stages Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-1">
                {actionPlan.stages.map((stage) => {
                  const stageCompleted = stage.actions.filter(
                    (a) => a.completed
                  ).length;
                  const stageTotal = stage.actions.length;
                  const stageStatus =
                    stageCompleted === stageTotal && stageTotal > 0
                      ? "Complete"
                      : "On Track";

                  return (
                    <div
                      key={stage.id}
                      className="bg-white rounded-lg border border-gray-300"
                    >
                      {/* Stage Header */}
                      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleStageCollapse(stage.id)}
                            className="text-gray-500"
                          >
                            {collapsedStages.has(stage.id) ? (
                              <FiChevronRight />
                            ) : (
                              <FiChevronDown />
                            )}
                          </button>

                          {editingItems.has(`stage-${stage.id}`) ? (
                            <input
                              type="text"
                              value={stage.stageName}
                              onChange={(e) =>
                                handleUpdateStage(stage.id, {
                                  stageName: e.target.value,
                                })
                              }
                              onBlur={() => toggleEditing(`stage-${stage.id}`)}
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                toggleEditing(`stage-${stage.id}`)
                              }
                              className="font-medium bg-transparent border-b focus:outline-none"
                              style={{
                                borderBottomColor: hexColor
                                  ? `#${hexColor}`
                                  : "#3b82f6",
                              }}
                              autoFocus
                            />
                          ) : (
                            <span
                              className="font-medium text-gray-800 cursor-pointer"
                              onClick={() => toggleEditing(`stage-${stage.id}`)}
                              onMouseEnter={(e) =>
                                (e.target.style.color = hexColor
                                  ? `#${hexColor}`
                                  : "#2563eb")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.color = "#374151")
                              }
                            >
                              {stage.stageName}
                            </span>
                          )}

                          <span className="text-sm text-gray-500">
                            {stageCompleted}/{stageTotal}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              stageStatus === "Complete"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {stageStatus}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteStage(stage.id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>

                      {/* Stage Actions */}
                      {!collapsedStages.has(stage.id) && (
                        <div className="p-2">
                          {stage.actions.map((action, index) => {
                            return (
                              <DraggableAction
                                key={action.id}
                                action={action}
                                index={index}
                                stageId={stage.id}
                                moveAction={handleMoveAction}
                              >
                                <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded group">
                                  <div className="flex items-center space-x-3 flex-1">
                                    {/* Checkbox */}
                                    <button
                                      onClick={() =>
                                        handleUpdateAction(
                                          stage.id,
                                          action.id,
                                          { completed: !action.completed }
                                        )
                                      }
                                      className="flex-shrink-0"
                                    >
                                      {action.completed ? (
                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                          <FiCheck
                                            size={12}
                                            className="text-white"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-green-500" />
                                      )}
                                    </button>

                                    {/* Action Name and Details */}
                                    <div className="flex items-center space-x-2 flex-1">
                                      {editingItems.has(
                                        `action-${action.id}`
                                      ) ? (
                                        <input
                                          type="text"
                                          value={action.name}
                                          onChange={(e) =>
                                            handleUpdateAction(
                                              stage.id,
                                              action.id,
                                              { name: e.target.value }
                                            )
                                          }
                                          onBlur={() =>
                                            !newActions.has(action.id) &&
                                            toggleEditing(`action-${action.id}`)
                                          }
                                          onKeyPress={(e) =>
                                            e.key === "Enter" &&
                                            !newActions.has(action.id) &&
                                            toggleEditing(`action-${action.id}`)
                                          }
                                          className="flex-1 bg-transparent border-b focus:outline-none"
                                          style={{
                                            borderBottomColor: hexColor
                                              ? `#${hexColor}`
                                              : "#3b82f6",
                                          }}
                                          placeholder={
                                            newActions.has(action.id)
                                              ? "Enter step name..."
                                              : ""
                                          }
                                          autoFocus
                                        />
                                      ) : (
                                        <span
                                          className={`flex-1 cursor-pointer ${
                                            action.completed
                                              ? "line-through text-gray-500"
                                              : "text-gray-800"
                                          }`}
                                          onClick={() =>
                                            !newActions.has(action.id) &&
                                            toggleEditing(`action-${action.id}`)
                                          }
                                          onMouseEnter={(e) =>
                                            !action.completed &&
                                            (e.target.style.color = hexColor
                                              ? `#${hexColor}`
                                              : "#2563eb")
                                          }
                                          onMouseLeave={(e) =>
                                            !action.completed &&
                                            (e.target.style.color = "#374151")
                                          }
                                        >
                                          {action.name || "Untitled Step"}
                                        </span>
                                      )}

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
                                        className={`text-xs px-2 py-1 rounded-full ${
                                          action.internal === 1
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        {action.internal === 1
                                          ? "Internal"
                                          : "External"}
                                      </button>

                                      {/* Expand Button */}
                                      <button
                                        onClick={() =>
                                          openTaskModal(stage.id, action.id)
                                        }
                                        className="text-xs flex items-center space-x-1"
                                        style={{
                                          color: hexColor
                                            ? `#${hexColor}`
                                            : "#3b82f6",
                                        }}
                                        onMouseEnter={(e) =>
                                          (e.target.style.color = hexColor
                                            ? `#${hexColor}aa`
                                            : "#1d4ed8")
                                        }
                                        onMouseLeave={(e) =>
                                          (e.target.style.color = hexColor
                                            ? `#${hexColor}`
                                            : "#3b82f6")
                                        }
                                      >
                                        <FiExternalLink size={12} />
                                        <span>Expand</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3 ">
                                    {/* Save/Cancel buttons for new actions */}
                                    {newActions.has(action.id) && (
                                      <div className="flex items-center space-x-1 ml-2">
                                        <button
                                          onClick={() =>
                                            saveNewAction(action.id, stage.id)
                                          }
                                          className="p-1 text-green-600 hover:text-green-700 bg-green-50 rounded"
                                        >
                                          <FaCheck size={16} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            cancelNewAction(stage.id, action.id)
                                          }
                                          className="p-1 text-red-600 hover:text-red-700 bg-red-50 rounded"
                                        >
                                          <ImCross size={12} />
                                        </button>
                                      </div>
                                    )}

                                    {!newActions.has(action.id) && (
                                      <div className="min-w-[60px] text-right">
                                        {action.dueDate ? (
                                          <span className="text-sm text-gray-600">
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
                                            <button
                                              className="text-gray-400 p-1 pointer-events-none"
                                              onMouseEnter={(e) =>
                                                (e.target.style.color = hexColor
                                                  ? `#${hexColor}`
                                                  : "#2563eb")
                                              }
                                              onMouseLeave={(e) =>
                                                (e.target.style.color =
                                                  "#9ca3af")
                                              }
                                            >
                                              <FiCalendar size={16} />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Assignee */}
                                    <button
                                      onClick={() =>
                                        openAssigneePopup(stage.id, action.id)
                                      }
                                      className="flex items-center space-x-2"
                                    >
                                      {action.assignedTo.name ? (
                                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                          {getInitials(action.assignedTo.name)}
                                        </div>
                                      ) : (
                                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400">
                                          <FiUser
                                            size={12}
                                            className="text-gray-500"
                                          />
                                        </div>
                                      )}
                                    </button>
                                    {/* Delete Action */}
                                    {!newActions.has(action.id) && (
                                      <button
                                        onClick={() =>
                                          handleDeleteAction(
                                            stage.id,
                                            action.id
                                          )
                                        }
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1"
                                      >
                                        <FiTrash2 size={14} />
                                      </button>
                                    )}
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
                              (e.target.style.color = hexColor
                                ? `#${hexColor}`
                                : "#2563eb")
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
                      e.target.style.color = hexColor
                        ? `#${hexColor}`
                        : "#2563eb";
                      e.target.style.borderColor = hexColor
                        ? `#${hexColor}`
                        : "#93c5fd";
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
                    {hasUnsavedActions
                      ? "Save current step first"
                      : "Add Stage"}
                  </span>
                </button>
              </div>
            </div>
            {/* Action Buttons at Bottom */}
            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
              <div />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    dispatch(resetActionPlan());
                    onClose();
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Task Details Modal */}
        {taskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-5 pb-4 w-[600px] max-h-[70vh] overflow-y-auto shadow-xl">
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
                <div className="grid grid-cols-2 gap-4">
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTaskModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-hidden shadow-xl">
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
                <div className="space-y-4 h-72">
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
                      style={{
                        "--tw-ring-color": hexColor
                          ? `#${hexColor}40`
                          : "#3b82f640",
                      }}
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
                      style={{
                        "--tw-ring-color": hexColor
                          ? `#${hexColor}40`
                          : "#3b82f640",
                      }}
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
                      style={{
                        "--tw-ring-color": hexColor
                          ? `#${hexColor}40`
                          : "#3b82f640",
                      }}
                      placeholder="Search by name or email..."
                    />
                  </div>

                  {/* Users List */}
                  <div className="max-h-56 overflow-y-auto border rounded-md">
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
                <button
                  onClick={() => setAssigneePopup(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                {assigneeMode === "manual" && (
                  <button
                    onClick={() => {
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
                        handleUpdateAction(
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
                    className="px-4 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
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

export default ActionPlanEditor;
