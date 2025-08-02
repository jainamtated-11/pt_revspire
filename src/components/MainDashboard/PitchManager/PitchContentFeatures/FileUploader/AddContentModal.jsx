import { useState, useRef } from "react";
import {
  FaUpload,
  FaYoutube,
  FaTimes,
  FaLink,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { SiVimeo } from "react-icons/si";

const AddContentModal = ({
  isOpen,
  onClose,
  hexColor,
  onLocalUpload,
  onPublicURLUpload,
}) => {
  const [modalStep, setModalStep] = useState(1);
  const [selectedSource, setSelectedSource] = useState(null);
  const [localFiles, setLocalFiles] = useState(null);
  const [formData, setFormData] = useState({
    youtube: { name: "", url: "", description: "" },
    vimeo: { name: "", url: "", description: "" },
    public: { name: "", url: "", description: "" },
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const uploadSources = [
    {
      id: "local",
      name: "Local Upload",
      description: "Upload files from your device",
      icon: <FaUpload className="w-8 h-8" />,
      color: "bg-blue-500",
    },
    {
      id: "youtube",
      name: "YouTube",
      description: "Add YouTube videos",
      icon: <FaYoutube className="w-8 h-8" />,
      color: "bg-red-500",
    },
    {
      id: "vimeo",
      name: "Vimeo",
      description: "Add Vimeo videos",
      icon: <SiVimeo className="w-8 h-8" />,
      color: "bg-blue-600",
    },
    {
      id: "public",
      name: "Public Link",
      description: "Add any public URL",
      icon: <FaLink className="w-8 h-8" />,
      color: "bg-green-500",
    },
  ];

  const resetForms = () => {
    setLocalFiles(null);
    setFormData({
      youtube: { name: "", url: "", description: "" },
      vimeo: { name: "", url: "", description: "" },
      public: { name: "", url: "", description: "" },
    });
  };

  const closeModal = () => {
    onClose();
    setModalStep(1);
    setSelectedSource(null);
    resetForms();
  };

  const handleSourceSelect = (source) => {
    setSelectedSource(source);
    setModalStep(2);
  };

  const goBackToSourceSelection = () => {
    setModalStep(1);
    setSelectedSource(null);
    resetForms();
  };

  const handleFormChange = (source, field, value) => {
    setFormData(prev => ({
      ...prev,
      [source]: {
        ...prev[source],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (selectedSource.id === "local") {
        await onLocalUpload(localFiles);
      } else if (selectedSource.id === "public") {
        await onPublicURLUpload("Public URL", formData["public"]);
      } else {
        await onPublicURLUpload(selectedSource.id, formData[selectedSource.id]);
      }
      closeModal();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {modalStep === 2 && (
              <button
                onClick={goBackToSourceSelection}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <FaArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-xl font-semibold">
              {modalStep === 1
                ? "Choose Content Source"
                : `Add ${selectedSource?.name}`}
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {modalStep === 1 ? (
          <div className="grid grid-cols-1 gap-4">
            {uploadSources.map((source) => (
              <button
                key={source.id}
                onClick={() => handleSourceSelect(source)}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className={`${source.color} text-white p-3 rounded-lg`}>
                  {source.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{source.name}</h3>
                  <p className="text-sm text-gray-600">{source.description}</p>
                </div>
                <FaArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            ))}
          </div>
        ) : (
          <div>
            {selectedSource?.id === "local" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Files <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => setLocalFiles(e.target.files)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {localFiles && (
                  <p className="text-sm text-gray-600 mt-2">
                    {localFiles.length} file(s) selected
                  </p>
                )}
              </div>
            )}

            {selectedSource?.id === "youtube" && (
              <FormSection
                source="youtube"
                formData={formData.youtube}
                onChange={handleFormChange}
                hexColor={hexColor}
              />
            )}

            {selectedSource?.id === "vimeo" && (
              <FormSection
                source="vimeo"
                formData={formData.vimeo}
                onChange={handleFormChange}
                hexColor={hexColor}
              />
            )}

            {selectedSource?.id === "public" && (
              <FormSection
                source="public"
                formData={formData.public}
                onChange={handleFormChange}
                hexColor={hexColor}
              />
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  backgroundColor: hexColor,
                  color: "#fff",
                  borderColor: hexColor,
                }}
                className="px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FormSection = ({ source, formData, onChange, hexColor }) => {
  const sourceLabels = {
    youtube: { name: "YouTube", url: "YouTube URL" },
    vimeo: { name: "Vimeo", url: "Vimeo URL" },
    public: { name: "Public", url: "URL" },
  };

  return (
    <div className="mb-6">
      <FormInput
        label="Name"
        value={formData.name}
        onChange={(e) => onChange(source, "name", e.target.value)}
        placeholder={`Enter ${sourceLabels[source].name.toLowerCase()} name`}
        required
        hexColor={hexColor}
      />
      <FormInput
        label={sourceLabels[source].url}
        value={formData.url}
        onChange={(e) => onChange(source, "url", e.target.value)}
        placeholder={
          source === "youtube"
            ? "https://www.youtube.com/watch?v=..."
            : source === "vimeo"
            ? "https://vimeo.com/..."
            : "https://example.com/..."
        }
        required
        hexColor={hexColor}
      />
      <FormInput
        label="Description"
        value={formData.description}
        onChange={(e) => onChange(source, "description", e.target.value)}
        placeholder="Enter description"
        hexColor={hexColor}
      />
    </div>
  );
};

const FormInput = ({ label, value, onChange, placeholder, required, hexColor }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
        required={required}
        style={{ borderColor: hexColor }}
      />
    </div>
  );
};

export default AddContentModal;