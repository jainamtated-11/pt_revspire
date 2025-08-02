// EditPlaceholdersDialog.jsx
import React, { useState } from "react";
import { MdClose } from "react-icons/md";

const EditEmailPlaceholdersDialog = ({
  isOpen,
  onClose,
  placeholders,
  onSave,
}) => {
  const [placeholderValues, setPlaceholderValues] = useState({});

  const handleInputChange = (placeholder, value) => {
    setPlaceholderValues((prev) => ({
      ...prev,
      [placeholder]: value,
    }));
  };

  const handleSave = () => {
    onSave(placeholderValues);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[100]">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Placeholders</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <p className="text-sm text-gray-600 mb-4">
            Please provide values for the following placeholders:
          </p>
          <div className="space-y-4">
            {placeholders.map((placeholder) => (
              <div key={placeholder} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  {placeholder}
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Enter value for ${placeholder}`}
                  value={placeholderValues[placeholder] || ""}
                  onChange={(e) =>
                    handleInputChange(placeholder, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end space-x-4">
          <button
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[85px] flex items-center justify-center`}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmailPlaceholdersDialog;
