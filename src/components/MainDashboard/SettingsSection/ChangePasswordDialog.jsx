import React, { useState, useContext } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import toast from "react-hot-toast";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import useOutsideClick from "../../../hooks/useOutsideClick.js";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { GoCircle } from "react-icons/go";
import logo from "../../../assets/RevSpire-logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Dot = ({ isActive }) => (
  <span
    className={`h-2 w-2 rounded-full ${
      isActive ? "bg-sky-700" : "bg-gray-400"
    }`}
  />
);

const validatePassword = (password) => {
  const minLength = 8;
  const hasDigit = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasAlphabet = /[a-zA-Z]/.test(password);

  return {
    minLength: password.length >= minLength,
    hasDigit,
    hasSpecialChar,
    hasAlphabet,
  };
};

function ChangePasswordDialog() {
  const { setResetPasswordDialogOpen, user_name } = useContext(GlobalContext);
  // const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationStatus, setValidationStatus] = useState({
    minLength: false,
    hasDigit: false,
    hasSpecialChar: false,
    hasAlphabet: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const axiosInstance = useAxiosInstance();

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setNewPassword(newPassword);
    setValidationStatus(validatePassword(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match");
    } else if (newPassword === currentPassword) {
      setError("New Password cannot be the same as the Current Password");
    } else {
      const validationError = validatePassword(newPassword);
      if (Object.values(validationError).includes(false)) {
        setError("New Password does not meet all the criteria.");
      } else {
        setError("");

        try {
          const response = await axiosInstance.post(`/change-password`, {
            username: user_name,
            currentPassword,
            newPassword,
          });

          const data = await response.data;
          if (response.status === 200) {
            toast.success("Password changed successfully");
            setSuccessMessage(data.message);
            setResetPasswordDialogOpen(false);
          } else {
            setError(data.message);
            toast.error("Password change failed. Please try again later");
          }
        } catch (error) {
          toast.error("An error occurred. Please try again later.");
          setError(
            "An error occurred while changing password. PLease try again later."
          );
        }
      }
    }
  };

  const actions = () => {
    setResetPasswordDialogOpen(false);
  };
  const modalRef = useOutsideClick([actions]);

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
        <div
          ref={modalRef}
          className="bg-white p-2 pb-8 rounded-md z-50 w-[27rem] lg:w-[27rem]"
        >
          <div className="flex flex-row justify-between w-full">
            <div />
            <button
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setResetPasswordDialogOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex  flex-col items-start justify-center px-6 py-8 mx-auto lg:py-0">
            <div className="block w-full  justify-center items-center h-[50px] mb-3">
              <img
                src={logo}
                alt="RevSpire Logo"
                className="mx-auto h-8 mt-2"
              />
            </div>
            <h2 className="text-lg font-bold leading-tight text-gray-900">
              Change Password
            </h2>

            <div className="flex flex-col mt-2">
              <p
                className={` flex  gap-2 items-center ${
                  validationStatus.minLength ? "text-green-400" : ""
                }`}
              >
                <span>
                  {" "}
                  {validationStatus.minLength ? (
                    <IoCheckmarkCircleSharp />
                  ) : (
                    <GoCircle />
                  )}
                </span>{" "}
                8 characters
              </p>
              <p
                className={` flex  gap-2 items-center ${
                  validationStatus.hasAlphabet ? "text-green-400" : ""
                }`}
              >
                <span>
                  {" "}
                  {validationStatus.hasAlphabet ? (
                    <IoCheckmarkCircleSharp />
                  ) : (
                    <GoCircle />
                  )}
                </span>{" "}
                1 letter
              </p>
              <p
                className={` flex  gap-2 items-center ${
                  validationStatus.hasDigit ? "text-green-400" : ""
                }`}
              >
                <span>
                  {" "}
                  {validationStatus.hasDigit ? (
                    <IoCheckmarkCircleSharp />
                  ) : (
                    <GoCircle />
                  )}
                </span>{" "}
                1 number
              </p>
              <p
                className={` flex  gap-2 items-center ${
                  validationStatus.hasSpecialChar ? "text-green-400" : ""
                }`}
              >
                <span>
                  {" "}
                  {validationStatus.hasSpecialChar ? (
                    <IoCheckmarkCircleSharp />
                  ) : (
                    <GoCircle />
                  )}
                </span>{" "}
                1 special characters
              </p>

              <p className="mt-2 mb-[-10px]">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {successMessage && (
                  <p className="text-green-500 text-sm">{successMessage}</p>
                )}
              </p>
            </div>
            <form
              className="mt-4 flex flex-col gap-[2px] space-y-4 lg:mt-5 md:space-y-5 w-full"
              onSubmit={handleSubmit}
            >
              <div className="">
                <label
                  htmlFor="current-password"
                  className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  name="current-password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="new-password"
                  className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                >
                  New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="new-password"
                  id="new-password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  value={newPassword}
                  onChange={handlePasswordChange}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 top-5 right-3 flex items-center cursor-pointer"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </span>
              </div>
              <div className="relative">
                <label
                  htmlFor="confirm-password"
                  className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm-password"
                  id="confirm-password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white focus:ring-secondary focus:border-secondary"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 top-5 right-3 flex items-center cursor-pointer"
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-secondary text-white  mt-2 items-center focus:ring-1 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center "
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordDialog;
