import React, { useContext, useState, useRef } from "react";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import toast from "react-hot-toast";
import useOutsideClick from "../../../../hooks/useOutsideClick";
import { GlobalContext } from "../../../../context/GlobalState";
import ImageCropperModal from "../../../../utility/CustomComponents/ImageCropperModal";

const EditLogoModal = ({ isOpen, onClose, viewer_id, organisation_id }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const axiosInstance = useAxiosInstance();
  const { setIsSvg } = useContext(GlobalContext);
  const fileInputRef = useRef(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);

  const handleResetState = () => {
    setSelectedFile(null);
    setLoading(false);
    setIsSvg(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation(); // Add this line
    handleResetState();
    onClose();
  };

  const modalRef = useOutsideClick(handleClose);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPng =
      file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    const isSvgFile =
      file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
    setIsSvg(isSvgFile);

    if (isSvgFile) {
      setSelectedFile(file);
      // Immediately upload SVG
      await handleUpdateLogo(file);
      return;
    }

    if (!isPng) {
      toast.error("Please upload a PNG or SVG file only");
      return;
    }

    // For PNG, open cropper
    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImageSave = (blob) => {
    const file = new File([blob], "cropped.png", { type: "image/png" });
    setSelectedFile(file);
    setShowCropper(false);
    handleUpdateLogo(file);
  };

  const handleUpdateLogo = async (file = selectedFile) => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("company_logo", file);
    formData.append("viewer_id", viewer_id);
    formData.append("organisation_id", organisation_id);

    try {
      await axiosInstance.post("/update-company-logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Logo updated successfully!");
      handleClose();
    } catch (error) {
      console.error("Error updating company logo:", error);
      toast.error("An error occurred while updating the logo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-100"
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={handleClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Update Company Logo
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Upload a high-quality PNG logo
          </p>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50 transition-all hover:border-secondary relative">
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-secondary mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-medium text-secondary">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                PNG only (Recommended: 500x500px, transparent background)
              </p>
            </div>
            <input
              type="file"
              accept="image/png"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              ref={fileInputRef}
            />
          </div>

          {selectedFile && (
            <div className="bg-blue-50 p-3 rounded-lg flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-secondary mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-secondary truncate">
                {selectedFile.name}
              </span>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => handleUpdateLogo()}
              disabled={!selectedFile || loading}
              className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-colors ${
                !selectedFile || loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-secondary hover:bg-secondary/95"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                "Update Logo"
              )}
            </button>
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 rounded-xl font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <ImageCropperModal
        open={showCropper}
        image={cropperImage}
        // aspect={1}
        onClose={() => setShowCropper(false)}
        onSave={handleCroppedImageSave}
      />
    </div>
  );
};

export default EditLogoModal;
