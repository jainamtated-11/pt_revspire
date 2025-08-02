import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  processOverview: {
    name: "Process Overview",
    description:
      "This is based on our typical process. Let's sync further as we go.",
    steps: [
      {
        Heading: "Evaluation",
        Description:
          "Deep dive and a 2-week free trial. Workshop, team custom demo, evaluate & test integrations and capabilities.",
        Arrangement: 1,
        CurrentStep: false,
      },
      {
        Heading: "Aligned",
        Description: "Align on value, process, requirements, and stakeholders.",
        Arrangement: 2,
        CurrentStep: false,
      },
      {
        Heading: "Formalize Partnership",
        Description: "Legal, infosec, and contract signature.",
        Arrangement: 3,
        CurrentStep: true,
      },
      {
        Heading: "Implementation",
        Description:
          "Setup, configuration, and initial deployment of the solution.",
        Arrangement: 4,
        CurrentStep: false,
      },
      {
        Heading: "Go Live",
        Description:
          "Launch the solution and begin full operations with support.",
        Arrangement: 5,
        CurrentStep: false,
      },
    ],
  },
  // New Action Plan Attachment feature
  actionPlanAttachment: {
    name: "Action Plan",
    stages: [
      {
        id: 1,
        stageName: "Discovery & Alignment",
        actions: [
          {
            id: 1,
            name: "Kick-off call with key stakeholders",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 1,
            completed: false,
          },
          {
            id: 2,
            name: "Share discovery questionnaire",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 1,
            completed: false,
          },
          {
            id: 3,
            name: "Internal needs assessment & stakeholder mapping",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 0,
            completed: false,
          },
          {
            id: 4,
            name: "Solution overview & high-level demo",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 1,
            completed: false,
          },
        ],
      },
      {
        id: 2,
        stageName: "Evaluation & Validation",
        actions: [
          {
            id: 1,
            name: "Deep-dive product demo tailored to use case",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 1,
            completed: false,
          },
          {
            id: 2,
            name: "Security & IT review / Due diligence",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 0,
            completed: false,
          },
          {
            id: 3,
            name: "ROI case & success plan walkthrough",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 1,
            completed: false,
          },
          {
            id: 4,
            name: "Reference call with existing customer",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 1,
            completed: false,
          },
        ],
      },
      {
        id: 3,
        stageName: "Procurement & Launch Planning",
        actions: [
          {
            id: 1,
            name: "Final pricing proposal & legal review",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 1,
            completed: false,
          },
          {
            id: 2,
            name: "Agreement signature",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 0,
            completed: false,
          },
          {
            id: 3,
            name: "Kickoff implementation planning call",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 0,
            completed: false,
          },
          {
            id: 4,
            name: "Go-live milestone & onboarding schedule",
            description: "",
            dueDate: "",
            assignedTo: { name: "", email: "" },
            internal: 0,
            completed: false,
          },
        ],
      },
    ],
  },
};

const pitchFeaturesSlice = createSlice({
  name: "pitchFeaturesSlice",
  initialState,
  reducers: {
    // Process Overview Actions
    updateProcessTitle: (state, action) => {
      state.processOverview.name = action.payload;
    },

    updateProcessDescription: (state, action) => {
      state.processOverview.description = action.payload;
    },

    updateStep: (state, action) => {
      const { index, field, value } = action.payload;
      if (state.processOverview.steps[index]) {
        state.processOverview.steps[index][field] = value;
      }
    },

    setCurrentStep: (state, action) => {
      const targetIndex = action.payload;
      state.processOverview.steps.forEach((step, index) => {
        step.CurrentStep = index === targetIndex;
      });
    },

    addStep: (state, action) => {
      const { heading, description } = action.payload;
      const newStep = {
        Heading: heading,
        Description: description,
        Arrangement: state.processOverview.steps.length + 1,
        CurrentStep: false,
      };
      state.processOverview.steps.push(newStep);
    },

    deleteStep: (state, action) => {
      const indexToDelete = action.payload;

      // Don't allow deletion if there's only one step
      if (state.processOverview.steps.length <= 1) {
        return;
      }

      const currentStepIndex = state.processOverview.steps.findIndex(
        (step) => step.CurrentStep
      );

      // Remove the step
      state.processOverview.steps.splice(indexToDelete, 1);

      // Update arrangement numbers and handle current step logic
      state.processOverview.steps.forEach((step, index) => {
        step.Arrangement = index + 1;

        // Handle current step logic
        if (indexToDelete < currentStepIndex) {
          // Keep current step if we deleted before it
          step.CurrentStep = step.CurrentStep;
        } else if (indexToDelete === currentStepIndex) {
          // Move current to previous step or last available
          step.CurrentStep =
            index ===
            Math.min(currentStepIndex, state.processOverview.steps.length - 1);
        } else {
          // Keep as is if we deleted after current
          step.CurrentStep = step.CurrentStep;
        }
      });

      // Ensure at least one step is marked as current
      const hasCurrentStep = state.processOverview.steps.some(
        (step) => step.CurrentStep
      );
      if (!hasCurrentStep && state.processOverview.steps.length > 0) {
        state.processOverview.steps[0].CurrentStep = true;
      }
    },

    reorderSteps: (state, action) => {
      const { draggedIndex, dropIndex } = action.payload;

      const draggedStep = state.processOverview.steps[draggedIndex];

      // Remove dragged step
      state.processOverview.steps.splice(draggedIndex, 1);

      // Insert at new position
      state.processOverview.steps.splice(dropIndex, 0, draggedStep);

      // Update arrangement numbers
      state.processOverview.steps.forEach((step, index) => {
        step.Arrangement = index + 1;
      });
    },

    // Reset process overview to initial state
    resetProcessOverview: (state) => {
      state.processOverview = initialState.processOverview;
    },

    // Load process overview data (for when loading from API)
    loadProcessOverview: (state, action) => {
      state.processOverview = action.payload;
    },

    // New reducer: Reset entire slice to initial state
    resetToInitialState: (state) => {
      return initialState; // This completely replaces the state
    },

    // New reducer: Set steps array with provided array
    setSteps: (state, action) => {
      // Validate the payload is an array
      if (!Array.isArray(action.payload)) {
        console.error("setSteps payload must be an array");
        return;
      }

      // Update steps while maintaining immutability
      state.processOverview.steps = action.payload.map((step, index) => ({
        // Ensure each step has required fields with defaults
        Heading: step.Heading || `Step ${index + 1}`,
        Description: step.Description || "",
        Arrangement:
          typeof step.Arrangement === "number" ? step.Arrangement : index + 1,
        CurrentStep:
          typeof step.CurrentStep === "boolean" ? step.CurrentStep : false,
      }));

      // Ensure at least one step is marked as current
      const hasCurrentStep = state.processOverview.steps.some(
        (step) => step.CurrentStep
      );
      if (!hasCurrentStep && state.processOverview.steps.length > 0) {
        state.processOverview.steps[0].CurrentStep = true;
      }
    },

    // ==================== ACTION PLAN ATTACHMENT REDUCERS ====================

    // Action Plan Name
    updateActionPlanName: (state, action) => {
      state.actionPlanAttachment.name = action.payload;
    },

    // Stage Management
    addActionPlanStage: (state, action) => {
      const newStage = {
        id: Date.now(),
        stageName: action.payload || "New Stage",
        actions: [],
      };
      state.actionPlanAttachment.stages.push(newStage);
    },

    updateActionPlanStage: (state, action) => {
      const { stageId, updates } = action.payload;
      const stageIndex = state.actionPlanAttachment.stages.findIndex(
        (stage) => stage.id === stageId
      );
      if (stageIndex !== -1) {
        state.actionPlanAttachment.stages[stageIndex] = {
          ...state.actionPlanAttachment.stages[stageIndex],
          ...updates,
        };
      }
    },

    deleteActionPlanStage: (state, action) => {
      const stageId = action.payload;
      state.actionPlanAttachment.stages =
        state.actionPlanAttachment.stages.filter(
          (stage) => stage.id !== stageId
        );
    },

    // Action Management - FIXED: Use the ID passed from component
    addActionPlanAction: (state, action) => {
      const { stageId, actionData } = action.payload;
      const stageIndex = state.actionPlanAttachment.stages.findIndex(
        (stage) => stage.id === stageId
      );
      if (stageIndex !== -1) {
        const newAction = {
          id: actionData.id, // Use the ID from component instead of generating new one
          name: actionData?.name !== undefined ? actionData.name : "New Action",
          description: actionData?.description || "",
          dueDate: actionData?.dueDate || "",
          assignedTo: actionData?.assignedTo || { name: "", email: "" },
          internal: actionData?.internal || 0,
          completed: actionData?.completed || false,
        };
        state.actionPlanAttachment.stages[stageIndex].actions.push(newAction);
      }
    },

    updateActionPlanAction: (state, action) => {
      const { stageId, actionId, updates } = action.payload;
      const stageIndex = state.actionPlanAttachment.stages.findIndex(
        (stage) => stage.id === stageId
      );
      if (stageIndex !== -1) {
        const actionIndex = state.actionPlanAttachment.stages[
          stageIndex
        ].actions.findIndex((action) => action.id === actionId);
        if (actionIndex !== -1) {
          state.actionPlanAttachment.stages[stageIndex].actions[actionIndex] = {
            ...state.actionPlanAttachment.stages[stageIndex].actions[
              actionIndex
            ],
            ...updates,
          };
        }
      }
    },

    deleteActionPlanAction: (state, action) => {
      const { stageId, actionId } = action.payload;
      const stageIndex = state.actionPlanAttachment.stages.findIndex(
        (stage) => stage.id === stageId
      );
      if (stageIndex !== -1) {
        state.actionPlanAttachment.stages[stageIndex].actions =
          state.actionPlanAttachment.stages[stageIndex].actions.filter(
            (action) => action.id !== actionId
          );
      }
    },

    // Reorder Actions within a stage
    reorderActionPlanActions: (state, action) => {
      const { stageId, dragIndex, hoverIndex } = action.payload;
      const stageIndex = state.actionPlanAttachment.stages.findIndex(
        (stage) => stage.id === stageId
      );
      if (stageIndex !== -1) {
        const actions = state.actionPlanAttachment.stages[stageIndex].actions;
        const draggedAction = actions[dragIndex];

        // Remove dragged action
        actions.splice(dragIndex, 1);

        // Insert at new position
        actions.splice(hoverIndex, 0, draggedAction);
      }
    },

    // Load entire action plan (for API data)
    loadActionPlan: (state, action) => {
      state.actionPlanAttachment = action.payload;
    },

    // Reset action plan to initial state
    resetActionPlan: (state) => {
      state.actionPlanAttachment = initialState.actionPlanAttachment;
    },
    setStages: (state, action) => {
      // Validate the payload is an array
      console.log("Stages", action.payload);
      if (!Array.isArray(action.payload)) {
        console.error("setSteps payload must be an array");
        return;
      }
      state.actionPlanAttachment.stages = action.payload;
    },

    // Set entire action plan data
    setActionPlan: (state, action) => {
      if (action.payload && typeof action.payload === "object") {
        state.actionPlanAttachment = {
          actionPlanName: action.payload.name || "Action Plan",
          stages: Array.isArray(action.payload.stages)
            ? action.payload.stages
            : [],
        };
      }
    },
  },
});

export const {
  // Process Overview actions
  updateProcessTitle,
  updateProcessDescription,
  updateStep,
  setCurrentStep,
  addStep,
  deleteStep,
  reorderSteps,
  resetProcessOverview,
  loadProcessOverview,
  resetToInitialState,
  setSteps,

  // Action Plan Attachment actions
  updateActionPlanName,
  addActionPlanStage,
  updateActionPlanStage,
  deleteActionPlanStage,
  addActionPlanAction,
  updateActionPlanAction,
  deleteActionPlanAction,
  reorderActionPlanActions,
  loadActionPlan,
  resetActionPlan,
  setActionPlan,
  setStages,
} = pitchFeaturesSlice.actions;

// Process Overview Selectors
export const selectProcessOverview = (state) =>
  state.pitchFeaturesSlice.processOverview;
export const selectProcessSteps = (state) =>
  state.pitchFeaturesSlice.processOverview.steps;
export const selectCurrentStepIndex = (state) =>
  state.pitchFeaturesSlice.processOverview.steps.findIndex(
    (step) => step.CurrentStep
  );

// Action Plan Attachment Selectors
export const selectActionPlan = (state) =>
  state.pitchFeaturesSlice.actionPlanAttachment;
export const selectActionPlanName = (state) =>
  state.pitchFeaturesSlice.actionPlanAttachment.name;
export const selectActionPlanStages = (state) =>
  state.pitchFeaturesSlice.actionPlanAttachment.stages;
export const selectActionPlanJSON = (state) => {
  const actionPlan = state.pitchFeaturesSlice.actionPlanAttachment;
  return {
    name: actionPlan.name,
    stages: actionPlan.stages.map((stage) => ({
      stageName: stage.stageName,
      actions: stage.actions.map((action) => ({
        name: action.name,
        description: action.description,
        dueDate: action.dueDate,
        assignedTo: {
          name: action.assignedTo.name,
          email: action.assignedTo.email,
        },
        internal: action.internal,
      })),
    })),
  };
};

export default pitchFeaturesSlice.reducer;
