import { useState, useRef, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Edit2,
  Plus,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  X,
  Check,
  MapPin,
  Trash2,
} from "lucide-react";
import {
  updateProcessTitle,
  updateProcessDescription,
  updateStep,
  setCurrentStep,
  addStep,
  deleteStep,
  reorderSteps,
  selectProcessOverview,
  selectCurrentStepIndex,
  resetToInitialState, // New action
  setSteps, // New action
} from "../../../../../features/pitch/pitchFeaturesSlice";
import useAxiosInstance from "../../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../../context/GlobalState";

function ProcessOverViewModal({
  onClose,
  hexColor,
  onClickHandler,
  contentWhileEditing,
  onProcessEdit,
}) {
  // Redux state and dispatch
  const dispatch = useDispatch();
  const processData = useSelector(selectProcessOverview);
  const currentStepIndex = useSelector(selectCurrentStepIndex);

  // Local UI states (these should remain local as they're UI-specific)
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [editingStepField, setEditingStepField] = useState(null);
  const [newStepDialog, setNewStepDialog] = useState(false);
  const [newStep, setNewStep] = useState({ heading: "", description: "" });
  const [draggedStep, setDraggedStep] = useState(null);
  const pitchState = useSelector((state) => state.pitchFeaturesSlice);
  const scrollContainerRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const { viewer_id, organisation_id } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    if (contentWhileEditing) {
      const stringContentLink = contentWhileEditing?.content_link;
      try {
        // Parse the string to object if it's a string
        const contentData =
          typeof stringContentLink === "string"
            ? JSON.parse(stringContentLink)
            : stringContentLink;

        // Verify we have Steps array before dispatching
        if (contentData?.Steps && Array.isArray(contentData.Steps)) {
          dispatch(setSteps(contentData.Steps));
        } else {
          console.error("Invalid Steps data:", contentData);
        }
      } catch (error) {
        console.error("Error parsing contentWhileEditing:", error);
      }
    }
  }, [contentWhileEditing, dispatch]);
  // Dynamic color utilities
  const hexToRgb = (hex) => {
    const cleanHex = hex.replace("#", "");
    const r = Number.parseInt(cleanHex.substr(0, 2), 16);
    const g = Number.parseInt(cleanHex.substr(2, 2), 16);
    const b = Number.parseInt(cleanHex.substr(4, 2), 16);
    return { r, g, b };
  };

  const createColorVariations = (hexColor) => {
    const baseColor = hexToRgb(hexColor || "28747d");
    const { r, g, b } = baseColor;

    return {
      base: `rgb(${r}, ${g}, ${b})`,
      light: `rgb(${Math.min(255, r + 40)}, ${Math.min(
        255,
        g + 40
      )}, ${Math.min(255, b + 40)})`,
      dark: `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(
        0,
        b - 30
      )})`,
      gradient: `linear-gradient(90deg, rgb(${r}, ${g}, ${b}), rgb(${Math.min(
        255,
        r + 20
      )}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 20)}))`,
      gradientBr: `linear-gradient(135deg, rgb(${r}, ${g}, ${b}), rgb(${Math.min(
        255,
        r + 30
      )}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)}))`,
      shadow: `rgba(${r}, ${g}, ${b}, 0.3)`,
      lightShadow: `rgba(${r}, ${g}, ${b}, 0.1)`,
    };
  };

  const colors = createColorVariations(hexColor);

  const colorStyles = {
    "--primary-base": colors.base,
    "--primary-light": colors.light,
    "--primary-dark": colors.dark,
    "--primary-50": colors.lightShadow,
  };

  // Redux action handlers
  const handleUpdateTitle = (newTitle) => {
    dispatch(updateProcessTitle(newTitle));
    setEditingTitle(false);
  };

  const handleUpdateDescription = (newDescription) => {
    dispatch(updateProcessDescription(newDescription));
    setEditingDescription(false);
  };

  const handleUpdateStep = (index, field, value) => {
    dispatch(updateStep({ index, field, value }));
  };

  const finishEditingStep = () => {
    setEditingStep(null);
    setEditingStepField(null);
  };

  const handleSetCurrentStep = (index) => {
    dispatch(setCurrentStep(index));
  };

  const handleDeleteStep = (index) => {
    dispatch(deleteStep(index));
  };

  const handleAddNewStep = () => {
    if (newStep.heading.trim() && newStep.description.trim()) {
      dispatch(
        addStep({
          heading: newStep.heading,
          description: newStep.description,
        })
      );
      setNewStep({ heading: "", description: "" });
      setNewStepDialog(false);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleDragStart = (index) => {
    setDraggedStep(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedStep === null) return;

    dispatch(
      reorderSteps({
        draggedIndex: draggedStep,
        dropIndex: dropIndex,
      })
    );
    setDraggedStep(null);
  };

  // Function to handle saving the process overview
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = {
        name: pitchState.processOverview.name,
        description: pitchState.processOverview.description,
        parameters: {
          Type: "ProcessOverview",
          Steps: pitchState.processOverview.steps.map((step) => ({
            Heading: step.Heading,
            Description: step.Description,
            Arrangement: step.Arrangement,
            CurrentStep: step.CurrentStep,
          })),
        },
        viewer_id: viewer_id,
        organisation_id: organisation_id,
      };

      let response;
      if (contentWhileEditing.content) {
        // Edit existing feature
        response = await axiosInstance.post(
          "/pitch-content-feature/edit-feature",
          {
            ...payload,
            content_id: contentWhileEditing.content_id,
          }
        );
        const editedData = pitchState.processOverview;
        const editedContentId = contentWhileEditing.content_id;
        onProcessEdit({ editedContentId, editedData });
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
      dispatch(resetToInitialState());
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      setSaveError(error.response?.data?.message || error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      style={colorStyles}
    >
      <div className="w-full max-w-5xl mx-auto bg-gray-50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with close button */}

        <div className="flex justify-between items-start p-8 pb-6 border-b border-gray-100">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {editingTitle ? (
                <input
                  type="text"
                  value={processData.name}
                  onChange={(e) => dispatch(updateProcessTitle(e.target.value))}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleUpdateTitle(e.target.value)
                  }
                  className="text-3xl font-bold bg-transparent border-none outline-none focus:bg-gray-50 rounded-lg px-2 py-1 transition-all duration-200"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-3xl font-bold text-gray-800 cursor-pointer hover:text-[var(--primary-base)] transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-gray-50"
                  onClick={() => setEditingTitle(true)}
                >
                  {processData.name}
                </h1>
              )}
              <Edit2
                className="w-5 h-5 text-gray-400 cursor-pointer hover:text-[var(--primary-light)] transition-colors duration-200"
                onClick={() => setEditingTitle(true)}
              />
            </div>

            <div className="flex items-start gap-3">
              {editingDescription ? (
                <textarea
                  value={processData.description}
                  onChange={(e) =>
                    dispatch(updateProcessDescription(e.target.value))
                  }
                  onBlur={() => setEditingDescription(false)}
                  className="text-gray-600 bg-transparent border-none outline-none focus:bg-gray-50 rounded-lg px-2 py-1 resize-none w-full transition-all duration-200"
                  autoFocus
                  rows={1}
                />
              ) : (
                <p
                  className="text-gray-600 cursor-pointer hover:text-gray-500 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-gray-50"
                  onClick={() => setEditingDescription(true)}
                >
                  {processData.description}
                </p>
              )}
              <Edit2
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-[var(--primary-light)] transition-colors duration-200 mt-1 flex-shrink-0"
                onClick={() => setEditingDescription(true)}
              />
            </div>
          </div>

          <button
            onClick={() => {
              dispatch(resetToInitialState());
              onClose();
            }}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Timeline Container */}
        <div className="relative p-4 pt-0">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl p-3 rounded-full border border-gray-200 hover:border-[var(--primary-light)] hover:bg-[var(--primary-50)] transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:shadow-xl p-3 rounded-full border border-gray-200 hover:border-[var(--primary-light)] hover:bg-[var(--primary-50)] transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Timeline with custom scrollbar */}
          <div className="px-8">
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto custom-scrollbar"
              style={{
                scrollbarWidth: "thin",
              }}
            >
              <div className="relative min-w-max py-8">
                {/* Progressive Horizontal Timeline */}
                <div className="absolute top-12 left-8 right-20 h-1 z-0">
                  {/* Background line (full length, light gray) */}
                  <div className="absolute inset-0 bg-gray-200 rounded-full" />

                  {/* Progress line (colored up to current step) */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-full shadow-sm transition-all duration-500"
                    style={{
                      width: `${
                        ((currentStepIndex + 1) / processData.steps.length) *
                        100
                      }%`,
                      background: colors.gradient,
                    }}
                  />
                </div>

                {/* Steps Container */}
                <div className="flex items-start relative z-10">
                  {processData.steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = step.CurrentStep;
                    const isFuture = index > currentStepIndex;

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center min-w-[200px]"
                      >
                        {/* Step */}
                        <div
                          className="relative flex flex-col items-center group"
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                        >
                          {/* Controls Container */}
                          <div className="flex items-center gap-2 mb-3 h-5">
                            {/* Drag Handle */}
                            <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-move" />

                            {/* Delete Button - Only show if more than 1 step */}
                            {processData.steps.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStep(index);
                                }}
                                className="w-5 h-5 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                title="Delete step"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Vertical Connector Line */}
                          <div
                            className={`w-0.5 h-8 mb-2 rounded-full shadow-sm transition-all duration-300 ${
                              isCompleted || isCurrent ? "" : "bg-gray-300"
                            }`}
                            style={
                              isCompleted || isCurrent
                                ? { background: colors.gradient }
                                : {}
                            }
                          />

                          {/* Enhanced Circle with Icons */}
                          <div className="relative">
                            {/* Glow effect for current step */}
                            {isCurrent && (
                              <div
                                className="absolute inset-0 w-24 h-24 -m-4 rounded-full bg-[var(--primary-50)] opacity-30 animate-pulse"
                                style={{ backgroundColor: colors.light }}
                              />
                            )}
                            {isCurrent && (
                              <div
                                className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-[var(--primary-50)] opacity-30 animate-pulse"
                                style={{ backgroundColor: colors.light }}
                              />
                            )}

                            <div
                              className={`relative  rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                                isCurrent ? "w-16 h-16" : "w-14 h-14"
                              }`}
                              onClick={() => handleSetCurrentStep(index)}
                              style={
                                isCurrent
                                  ? {
                                      background: colors.gradientBr,
                                      boxShadow: `0 10px 25px ${colors.shadow}`,
                                    }
                                  : isCompleted
                                  ? {
                                      background: colors.gradientBr,
                                      boxShadow: `0 4px 15px ${colors.lightShadow}`,
                                    }
                                  : {
                                      backgroundColor: "white",
                                      borderWidth: "3px",
                                      borderColor: "#e5e7eb",
                                    }
                              }
                            >
                              {/* Step Icons */}
                              {isCurrent ? (
                                <MapPin className="w-7 h-7 text-white drop-shadow-sm" />
                              ) : isCompleted ? (
                                <Check className="w-7 h-7 text-white drop-shadow-sm" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-gray-300" />
                              )}
                            </div>
                          </div>

                          {/* Step Content */}
                          <div className="mt-8 text-center w-48">
                            {editingStep === index &&
                            editingStepField === "heading" ? (
                              <input
                                type="text"
                                value={step.Heading}
                                onChange={(e) =>
                                  handleUpdateStep(
                                    index,
                                    "Heading",
                                    e.target.value
                                  )
                                }
                                onBlur={finishEditingStep}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && finishEditingStep()
                                }
                                className="text-center font-semibold text-base bg-transparent border-none outline-none focus:bg-[var(--primary-50)] rounded-lg px-3 py-2 w-full transition-all duration-200"
                                autoFocus
                              />
                            ) : (
                              <h3
                                className={`font-semibold text-base mb-1 cursor-pointer transition-colors duration-200 group flex items-center justify-center gap-2 px-3 py-1 rounded-lg hover:bg-[var(--primary-50)] ${
                                  isCurrent
                                    ? "text-[var(--primary-dark)] font-bold"
                                    : isCompleted
                                    ? "text-gray-800 hover:text-[var(--primary-base)]"
                                    : "text-gray-600 hover:text-[var(--primary-base)]"
                                }`}
                                onClick={() => {
                                  setEditingStep(index);
                                  setEditingStepField("heading");
                                }}
                              >
                                {step.Heading}
                                <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              </h3>
                            )}

                            {editingStep === index &&
                            editingStepField === "description" ? (
                              <textarea
                                value={step.Description}
                                onChange={(e) =>
                                  handleUpdateStep(
                                    index,
                                    "Description",
                                    e.target.value
                                  )
                                }
                                onBlur={finishEditingStep}
                                className="text-center text-sm bg-transparent border-none outline-none focus:none rounded-lg px-3 py-2 w-full resize-none transition-all duration-200"
                                autoFocus
                                rows={4}
                              />
                            ) : (
                              <p
                                className={`text-sm cursor-pointer transition-colors duration-200 group flex items-start justify-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--primary-50)] ${
                                  isCurrent
                                    ? "text-gray-700"
                                    : isCompleted
                                    ? "text-gray-600 hover:text-gray-500"
                                    : "text-gray-500 hover:text-gray-500"
                                }`}
                                onClick={() => {
                                  setEditingStep(index);
                                  setEditingStepField("description");
                                }}
                              >
                                <span className="leading-relaxed">
                                  {step.Description}
                                </span>
                                <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 mt-1" />
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Step Button */}
                  <div className="flex flex-col items-center min-w-[120px]">
                    <div className="h-5 mb-3" /> {/* Spacer for drag handle */}
                    <div className="w-0.5 h-8 bg-gray-300 mb-2 rounded-full" />{" "}
                    {/* Vertical connector */}
                    <button
                      onClick={() => setNewStepDialog(true)}
                      className="w-20 h-20 rounded-full border-3 border-dashed border-gray-300  hover:bg-[var(--primary-50)] transition-all duration-300 flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-8 h-8 text-gray-400 hover:text-[var(--primary-base)] transition-colors duration-200" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start pr-6 pb-4  border-b border-gray-100">
          <div />
          <div className="flex gap-2">
            <button
              onClick={() => {
                dispatch(resetToInitialState());
                onClose();
              }}
              disabled={isSaving}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2.5 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <>Saving...</> : "Save "}
            </button>
          </div>
        </div>
        {/* Enhanced Dialog */}
        {newStepDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl transform transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Add New Step
                </h3>
                <button
                  onClick={() => setNewStepDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Step Heading
                  </label>
                  <input
                    type="text"
                    value={newStep.heading}
                    onChange={(e) =>
                      setNewStep((prev) => ({
                        ...prev,
                        heading: e.target.value,
                      }))
                    }
                    placeholder="Enter step heading"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2  focus:outline-none transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Step Description
                  </label>
                  <textarea
                    value={newStep.description}
                    onChange={(e) =>
                      setNewStep((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter step description"
                    rows={4}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none resize-none transition-colors duration-200"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-0">
                  <button
                    onClick={() => setNewStepDialog(false)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewStep}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Step
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #14b8a6, #06b6d4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #0f766e, #0891b2);
        }
      `}</style>
    </div>
  );
}

export default ProcessOverViewModal;
