import { useState, useEffect } from "react";
import { ChromePicker } from "react-color";
import useOutsideClick from "../../../hooks/useOutsideClick";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import { useContext } from "react";
import { GlobalContext } from "../../../context/GlobalState";
import { useCookies } from "react-cookie";
import toast from "react-hot-toast";

export default function ColorPicker({
  isOpen,
  setIsOpen,
  updateType = "both",
  setColor,
  currentColor // Add this new prop to receive the current color
}) {
  const { organisationDetails, viewer_id } = useContext(GlobalContext);
  const [cookies] = useCookies(["userData"]);

  const axiosInstance = useAxiosInstance();

  const defaultColor =
    organisationDetails?.organisation?.company_primary_color_hex ||
    cookies?.userData?.organisation?.company_primary_color_hex ||
    "FFFFFF";

  // Initialize with the currentColor prop if available, otherwise use default
  const [localColor, setLocalColor] = useState(`#${currentColor || defaultColor}`);

  // Update localColor when currentColor changes
  useEffect(() => {
    if (currentColor) {
      setLocalColor(`#${currentColor}`);
    }
  }, [currentColor]);

  const predefinedColors = [
    "#003F5C", // Deep Indigo — reliable, strong
    "#2F4B7C", // Slate Blue — balanced and modern
    "#665191", // Muted Purple — creative, premium feel
    "#FFA600", // Vibrant Amber — energetic, attention-grabbing
    "#F95D6A", // Coral Red — bold, assertive
    "#00BFAE", // Aqua Teal — fresh, tech-friendly
    "#247BA0", // Steel Blue — trustworthy, professional
    "#70C1B3", // Soft Teal — approachable, calm
  ];

  const handleResetState = () => {
    setLocalColor(`#${currentColor || defaultColor}`);
  };

  const modalRef = useOutsideClick([handleResetState]);

  const handleColorChange = (color) => {
    setLocalColor(color.hex);
  };

  const handleSelectPredefinedColor = (preColor) => {
    setLocalColor(preColor);
  };

  const handleCancel = () => {
    handleResetState();
    setIsOpen(false);
  };

  const handleUpdateColor = () => {
    const colorWithoutHash = localColor.replace("#", "");

    // Update Redux store if updateType is 'redux' or 'both'
    if (updateType === "redux" || updateType === "both") {
      setColor(colorWithoutHash);
    }

    // Make axios call if updateType is 'axios' or 'both'
    if (updateType === "axios" || updateType === "both") {
      handleColorSubmit();
    }

    setIsOpen(false);
  };

  const handleColorSubmit = async () => {
    try {
      const response = await axiosInstance.post("/update-company-info", {
        viewer_id,
        organisation_id: organisationDetails.organisation.id,
        company_color_hex: localColor.replace("#", ""),
      });
      setIsOpen(false);
      if (response.data.success) {
        setColor(localColor.replace("#", ""));
        toast.success("Company info updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update company info.");
      }
    } catch (error) {
      console.error("Error while updating company color:", error);
      toast.error("Error while updating company color.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div 
        ref={modalRef} 
        className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 w-full max-w-md"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Color</h3>
        
        <div className="mb-4 flex justify-center items-center">
          <ChromePicker
            color={localColor}
            onChangeComplete={handleColorChange}
            disableAlpha={true}
            width="100%"
          />
        </div>

        {/* Current Color Preview */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Selected Color:</span>
          <div className="flex items-center">
            <div 
              className="w-8 h-8 rounded-md mr-2 border border-gray-300"
              style={{ backgroundColor: localColor }}
            />
            <span className="font-mono text-sm">{localColor.toUpperCase()}</span>
          </div>
        </div>

        {/* Predefined Colors Section */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Quick picks:
          </p>
          <div className="grid grid-cols-8 gap-2">
            {predefinedColors.map((preColor) => (
              <button
                key={preColor}
                className="w-8 h-8 rounded-md cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                style={{
                  backgroundColor: preColor,
                  border: localColor === preColor ? '2px solid #000' : '2px solid transparent',
                  boxShadow: localColor === preColor ? '0 0 0 2px white inset' : 'none'
                }}
                onClick={() => handleSelectPredefinedColor(preColor)}
                aria-label={`Select color ${preColor}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors"
            onClick={handleUpdateColor}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}