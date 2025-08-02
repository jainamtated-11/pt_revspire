import React, { useEffect, useState } from "react";
import { ChromePicker } from "react-color";
import useOutsideClick from "../../../../hooks/useOutsideClick";
import useAxiosInstance from "../../../../Services/useAxiosInstance";

function ColorPickerModal({ isOpen, onClose, color, onColorChange, onSubmit, viewer_id, organisation_id }) {
  const [localColor, setLocalColor] = useState(color);
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  const handleResetState = () => {
    setLocalColor(color);
  }
  const modalRef = useOutsideClick([onClose, handleResetState]);
  
  if (!isOpen) return null;

  const handleColorChange = (color) => {
    setLocalColor(color.hex);
    onColorChange(color);
  };

  const handleCancel = () => {
    setLocalColor(color);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(localColor);
    handleUpdateLogo();
    onClose();
  };

  const handleUpdateLogo = async () => {
    try {
      const response = await axiosInstance.post("/view-organisation-details", {
        viewer_id: viewer_id,
        organisation_id: organisation_id,
      });

      const updatedColor = response.data.organisation.company_primary_color_hex;
      color = updatedColor;
      setLocalColor(color.hex);
    } catch (error) {
      console.error("Error updating company hex color:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-white p-10 rounded-lg shadow-lg">
        <ChromePicker color={localColor} onChangeComplete={handleColorChange} />
        <div className="flex justify-center mt-6 gap-4">
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

export default ColorPickerModal;