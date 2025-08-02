import { useContext, useState } from "react";
import { MdClose } from "react-icons/md";
import { FiUploadCloud } from "react-icons/fi";
import { GlobalContext } from "../../../context/GlobalState";
import { fetchLayoutsAsync } from "../../../features/layout/layoutSlice";
import { useDispatch } from "react-redux";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import toast from "react-hot-toast";
import useOutsideClick from "../../../hooks/useOutsideClick";
import GlobalAddButton from "../../../utility/CustomComponents/GlobalAddButton";

const AddLayout = () => {
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const axiosInstance = useAxiosInstance();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    html_code: null,
    background_image: null,
    background_login_image: null,
    created_by: viewer_id,
  });

  const modalRef = useOutsideClick([() => setIsOpen(false)]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [key]: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisable(true);
    setErrors({});

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("html_code", formData.html_code);
    formDataToSend.append("background_image", formData.background_image);
    formDataToSend.append(
      "background_login_image",
      formData.background_login_image
    );
    formDataToSend.append("created_by", formData.created_by);

    try {
      await axiosInstance.post("/add-pitch-layout", formDataToSend, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Layout added successfully");
      setIsOpen(false);
      dispatch(fetchLayoutsAsync({ viewer_id, baseURL }));
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload layout.");
    } finally {
      setIsLoading(false);
      setIsDisable(false);
    }
  };

  const handleOpenDialog = () => setIsOpen(true);

  const renderStyledFileInput = (label, id, key) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <div className="w-full">
        <input
          id={id}
          onChange={(e) => handleFileChange(e, key)}
          type="file"
          accept="image/*,.svg"
          className="hidden"
        />
        <label
          htmlFor={id}
          className={`flex items-center justify-between w-full h-10 bg-white border ${
            errors[key] ? "border-red-500" : "border-gray-400"
          } text-gray-700 text-sm rounded-lg px-3 shadow-sm hover:shadow-md transition cursor-pointer`}
        >
          <span
            className={`truncate ${
              formData[key] ? "text-gray-700" : "text-gray-400"
            }`}
          >
            {formData[key]?.name || `Choose a ${label}`}
          </span>
          <FiUploadCloud className="text-gray-400 text-xl" />
        </label>
        {errors[key] && (
          <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <form onSubmit={handleSubmit}>
          <div className="modal fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-gray-800 opacity-50" />
            <div
              ref={modalRef}
              className="bg-white rounded-md shadow-lg w-full max-w-2xl z-50"
            >
              <div className="sticky top-0 flex flex-row justify-between  bg-white border-b px-6 py-4 shadow-md z-10">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Layout
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MdClose size={24} />
                </button>
              </div>

              <div className="px-6 py-4">
                {/* Name Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-lg p-2.5"
                    placeholder="Enter Layout Name"
                    required
                  />
                </div>

                {/* HTML Code File Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Layout File
                  </label>
                  <div className="w-full">
                    <input
                      id="htmlCode"
                      onChange={(e) => handleFileChange(e, "html_code")}
                      type="file"
                      accept="*"
                      className="hidden"
                    />
                    <label
                      htmlFor="htmlCode"
                      className={`flex items-center justify-between w-full h-10 bg-white border ${
                        errors.html_code ? "border-red-500" : "border-gray-400"
                      } text-gray-700 text-sm rounded-lg px-3 shadow-sm hover:shadow-md transition cursor-pointer`}
                    >
                      <span
                        className={`truncate ${
                          formData.html_code ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {formData.html_code?.name || "Choose a Layout File"}
                      </span>
                      <FiUploadCloud className="text-gray-400 text-xl" />
                    </label>
                    {errors.html_code && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.html_code}
                      </p>
                    )}
                  </div>
                </div>

                {/* Image Inputs */}
                {renderStyledFileInput(
                  "Background Image",
                  "backgroundImage",
                  "background_image"
                )}
                {renderStyledFileInput(
                  "Background Login Image",
                  "backgroundLoginImage",
                  "background_login_image"
                )}
              </div>

              <div className="flex justify-end gap-4 px-6 py-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 text-sm font-medium py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDisable}
                  className="px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
      <GlobalAddButton onClick={handleOpenDialog} />
    </>
  );
};

export default AddLayout;
