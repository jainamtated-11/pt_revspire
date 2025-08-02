import React, { useState } from "react";
import useOutsideClick from "../../../../hooks/useOutsideClick";

function ContactEmail({ onClose, isOpen, OnChangeHandler, onSubmit, updateEmail }) {
  const [isContactEmail, setIsContactEmail] = useState(updateEmail);

  
  const modalRef = useOutsideClick([onClose]);
  if (!isOpen) return null;

  const handleCancel = () => {
    onClose();
  };

  const handleInput = (e) => {
    setIsContactEmail(e.target.value);
    OnChangeHandler(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-white p-10 rounded-lg shadow-lg">
        <div className="flex justify-center items-start flex-col gap-2">
          <label className="font-bold text-xl">Update You Contact Email :</label>
          <input
          placeholder="Update you email"
            className="border-[1px] w-[300px] p-2 h-[30px] rounded-sm border-gray-300 focus:outline-none "
            value={isContactEmail}
            onChange={handleInput}
            type="text"
          />
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

export default ContactEmail;
