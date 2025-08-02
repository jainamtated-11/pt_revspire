import { useContext, useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { FiUploadCloud } from "react-icons/fi";
import { GlobalContext } from "../../../context/GlobalState";
import { fetchLayoutsAsync } from "../../../features/layout/layoutSlice";
import { useDispatch } from "react-redux";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import toast from "react-hot-toast";
import useOutsideClick from "../../../hooks/useOutsideClick";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

const EditLayout = ({ layoutId, layoutName }) => {
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();

  const [isOpen, setIsOpen] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const modalRef = useOutsideClick([() => setIsOpen(false)]);
  const [formData, setFormData] = useState({
    name: layoutName,
    html_code: null,
    background_image: null,
    login_background_image: null,
    viewer_id: viewer_id,
    layoutId: layoutId,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: layoutName,
      layoutId: layoutId,
    }));
  }, [layoutName, layoutId]);

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
    setIsDisable(true);
    setIsLoading(true);
    setErrors({});

    // Validate name isn't "Standard Layout"
    if (formData.name.trim().toLowerCase() === "standard layout") {
      setErrors({ name: 'The name "Standard Layout" is not allowed' });
      setIsDisable(false);
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("layoutId", layoutId);
    formDataToSend.append("viewer_id", viewer_id);
    formDataToSend.append("newName", formData.name);

    if (formData.html_code) {
      formDataToSend.append("html_code", formData.html_code);
    }
    if (formData.background_image) {
      formDataToSend.append("background_image", formData.background_image);
    }
    if (formData.login_background_image) {
      formDataToSend.append(
        "login_background_image",
        formData.login_background_image
      );
    }

    try {
      const response = await axiosInstance.post(
        "/edit-pitch-layout",
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Layout updated successfully");
        setIsOpen(false);
        dispatch(fetchLayoutsAsync({ viewer_id, baseURL }));
      } else {
        toast.error(response.data.message || "Failed to update layout");
      }
    } catch (error) {
      console.error("Edit failed:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update layout. Please try again.");
      }
    } finally {
      setIsDisable(false);
      setIsLoading(false);
    }
  };

  const renderStyledFileInput = (
    label,
    id,
    key,
    acceptType = "image/*,.svg"
  ) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <div className="w-full">
        <input
          id={id}
          onChange={(e) => handleFileChange(e, key)}
          type="file"
          accept={acceptType}
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
                  Edit Layout
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
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-50 border ${
                      errors.name ? "border-red-500" : "border-gray-400"
                    } text-gray-900 text-sm rounded-lg p-2.5`}
                    placeholder="Enter Layout Name"
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                {renderStyledFileInput(
                  "Layout File (.jsx only)",
                  "editHtmlCode",
                  "html_code",
                  ".jsx"
                )}

                {renderStyledFileInput(
                  "Background Image",
                  "editBackgroundImage",
                  "background_image"
                )}

                {renderStyledFileInput(
                  "Login Background Image",
                  "editLoginBackgroundImage",
                  "login_background_image"
                )}
              </div>

              <div className="flex justify-end gap-4 px-6 py-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDisable}
                  className="px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save "}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <button
        type="button"
        className="text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
        onClick={() => setIsOpen(true)}
      >
        <FontAwesomeIcon icon={faEdit} className="mr-2" />
        Edit
      </button>
    </>
  );
};

export default EditLayout;
