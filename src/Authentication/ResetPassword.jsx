import React, { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext.jsx";
import logo from "../assets/RevSpire-logo.svg";
import bg from "../assets/Bg.png";
import MiniLogoLoader from "../assets/LoadingAnimation/MiniLogoLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
 
import { GoCircle } from "react-icons/go";
 

const Dot = ({ isActive }) => (
  <span
    className={`h-2 w-2 rounded-full ${
      isActive ? "btn-secondary" : "bg-gray-400"
    }`}
  />
);

function ResetPassword() {
  const {
    successMessage,
    errorMessage,
    setErrorMessage,
    setSuccessMessage,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    setResetPasswordToken,
    handlePasswordReset,
  } = useContext(AuthContext);

  const [validationStatus, setValidationStatus] = useState({
    minLength: false,
    hasDigit: false,
    hasSpecialChar: false,
    hasAlphabet: false,
  });
  const [imageLoaded, setImageLoaded] = useState(false); // Track image loading

  // Show/Hide Password States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasAlphabet = /[a-zA-Z]/.test(password);

    setValidationStatus({
      minLength: password.length >= minLength,
      hasDigit,
      hasSpecialChar,
      hasAlphabet,
    });

    if (password.length < minLength) {
      return "Password must be at least 8 characters long.";
    }
    if (!hasDigit) {
      return "Password must contain at least one digit.";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character.";
    }
    if (!hasAlphabet) {
      return "Password must contain at least one letter.";
    }
    return null;
  };

 

  const getUrlParams = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const resetPasswordTokenParam = searchParams.get("token");
    const userId = searchParams.get("userId");
    return { resetPasswordTokenParam, userId };
  };

  const { resetPasswordTokenParam, userId } = getUrlParams();

  useEffect(() => {
    if (resetPasswordTokenParam) {
      setResetPasswordToken(resetPasswordTokenParam);
    }
  }, [resetPasswordTokenParam, setResetPasswordToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    await handlePasswordReset({
      resetPasswordToken: resetPasswordTokenParam,
      password,
      userId,
    });
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setErrorMessage("");
    validatePassword(value);
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setErrorMessage("");
  };

  return (
    <div
      className="flex flex-row h-screen"
      style={{ backgroundColor: "#f4f6f9" }}
    >
      {/* Left Section */}
      <div className="flex items-center justify-center w-[80%] lg:w-1/2 p-8  bg-grey-600">
        <div className="w-[70%] sm:max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-lg shadow-md mx-12">
          <div className="pb-6 pt-3 px-5 space-y-4">
            <img src={logo} alt="RevSpire Logo" className="mx-auto h-8 mt-2" />
            <h1 className="text-lg font-bold leading-tight text-gray-900">
              Reset Password
            </h1>

            <div className="flex flex-col">
              <p className= { ` flex  gap-2 items-center ${validationStatus.minLength ? 'text-green-400': ''}`}><span> {validationStatus.minLength ? <IoCheckmarkCircleSharp /> :  <GoCircle /> }</span> 8 characters</p>
              <p className= { ` flex  gap-2 items-center ${validationStatus.hasAlphabet ? 'text-green-400': ''}`}><span> {validationStatus.hasAlphabet ? <IoCheckmarkCircleSharp /> :  <GoCircle /> }</span> 1 letter</p>
              <p className= { ` flex  gap-2 items-center ${validationStatus.hasDigit ? 'text-green-400': ''}`}><span> {validationStatus.hasDigit ? <IoCheckmarkCircleSharp /> :  <GoCircle /> }</span> 1 number</p>
              <p className= { ` flex  gap-2 items-center ${validationStatus.hasSpecialChar ? 'text-green-400': ''}`}><span> {validationStatus.hasSpecialChar ? <IoCheckmarkCircleSharp /> :  <GoCircle /> }</span> 1 special characters</p>
              
             <p className="mt-2">
             {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && (
              <p className="text-green-500">{successMessage}</p>
            )}
             </p>
              
              
            </div>
            <form onSubmit={handleSubmit} className="space-y-1 flex flex-col gap-2">
              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2  text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-800 focus:outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                   >
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                    />
                  </span>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-800 focus:outline-none"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                    />
                  </span>
                </div>
              </div>


              <button
                type="submit"
                className="w-full  flex justify-center items-center  px-4 py-2 mt-16 text-white btn-secondary rounded-lg"
              >
                Submit
              </button>
              <div className="flex items-center justify-between mt-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:underline hover:text-teal-950"
                >
                  Back to Login?
                </Link>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-slate-600 hover:underline hover:text-teal-950"
                >
                  Resend Forgot-Password Link
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div
        className="hidden lg:flex items-center justify-center w-full lg:w-1/2"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!imageLoaded ? (
          <img
            src={MiniLogoLoader} // Display the mini logo loader
            alt="Loading"
            className="h-20 w-20"
          />
        ) : null}
        <img
          src={bg}
          alt="Background"
          className="h-full w-full object-cover"
          onLoad={() => setImageLoaded(true)} // Set image as loaded once it's fully loaded
          style={{ display: imageLoaded ? "block" : "none" }} // Hide image while it's loading
        />
      </div>
    </div>
  );
}

export default ResetPassword;
