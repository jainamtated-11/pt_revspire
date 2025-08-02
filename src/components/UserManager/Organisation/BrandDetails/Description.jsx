import React, { useState } from "react";
import useOutsideClick from "../../../../hooks/useOutsideClick";

function Description({ isOpen, OnChangeHandler, onClose, onSubmit }) {
  const [description, setDescription] = useState("");

  const modalRef = useOutsideClick([onClose]);
  const handleDescription = (e) => {
    setDescription(e.target.value);
    OnChangeHandler(e.target.value);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSubmit = () => {
    onSubmit();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-white p-10 rounded-lg shadow-lg">
        <div className="flex justify-center items-start flex-col gap-2">
          <label
            htmlFor="description"
            className="block text-lg font-medium mb-2"
          >
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={description}
            onChange={handleDescription}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-transparent"
            placeholder="Enter your description here..."
          ></textarea>
        </div>
        <div className="flex  justify-center mt-10 gap-[150px]">
          <button
            className="bg-red-300 hover:bg-red-400 border border-red-600 px-4 py-1 rounded-md"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded-md"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default Description;
