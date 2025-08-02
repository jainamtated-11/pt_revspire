import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";

const EditAgentFlowDialog = ({
  showAgentFlowModal,
  setShowAgentFlowModal,
  agentFlowData,
  fetchAgentFlows,
}) => {
  const [name, setName] = useState(agentFlowData?.name || "");
  const [description, setDescription] = useState(
    agentFlowData?.description || ""
  );
  const axiosInstance = useAxiosInstance();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("user-agent/edit-agent-flow", {
        flow_id: agentFlowData.id,
        name,
        description,
      });

      if (response.data.success) {
        toast.success("Agent flow updated successfully!");
        setShowAgentFlowModal(false);
        await fetchAgentFlows();
      } else {
        toast.error(response.data.error || "Failed to update agent flow");
      }
    } catch (error) {
      toast.error("An error occurred while updating agent flow");
      console.error(error);
    }
  };

  return (
    <Dialog
      open={showAgentFlowModal}
      onClose={() => setShowAgentFlowModal(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium text-gray-900">
            Edit Agent Flow
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
                maxLength="45"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
                maxLength="255"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAgentFlowModal(false)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditAgentFlowDialog;
