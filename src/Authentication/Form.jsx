import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/RevSpire-logo.svg";
import bg from "../assets/Bg.png"; // Background image
import MiniLogoLoader from "../assets/LoadingAnimation/MiniLogoLoader";
import { LuLoaderCircle } from "react-icons/lu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Import icons for show/hide

const Form = ({
  heading,
  fields,
  handleSubmit,
  successMessage,
  errorMessage,
  links,
  onResetForm, // New prop to handle form reset
  isUsernameDisabled,
  setIsUsernameDisabled,
}) => {
 
  const [isLoading, setIsLoading] = useState(false); // Loader during form submission
  const [loadingScreen, setLoadingScreen] = useState(true); // Loading screen before content is rendered
  const [showPassword, setShowPassword] = useState(false); // Control password visibility

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Show loader during submission

    // Reset the error message if needed to clear out old errors
    const submissionSuccess = await handleSubmit(e);
    setIsLoading(false); // Hide loader after submission

    console.log("submissionsucess ===",submissionSuccess)

    if (submissionSuccess) {
      // Only disable username if the submission was successful

      if (fields.length >= 1) {
        const usernameField = fields.find((field) => field.id === "username");
        if (usernameField) {
          setIsUsernameDisabled(true);
        }
      }
    } else {
      // If submission fails, ensure the username is not disabled
      setIsUsernameDisabled(false);
    }
  };

  // Called when the hidden image (background image) is loaded
  const handleImageLoaded = () => {
    // Add a slight delay to ensure rendering is complete
    setTimeout(() => {
      setLoadingScreen(false); // Hide the loading screen
    }, 300); // Adjust delay as needed
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {loadingScreen && (
        <div className="flex justify-center items-center h-screen">
          <MiniLogoLoader />
        </div>
      )}

      <div
        className={`flex flex-row h-screen transition-opacity duration-500 ${
          loadingScreen ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundColor: "#f4f6f9" }}
      >
        {/* Left Section */}
        <div className="flex items-center justify-center lg:w-1/2 p-6 sm:p-12 bg-grey-600 w-[80%]">
          <div className="w-[70%] sm:max-w-md md:max-w-lg lg:max-w-xl rounded-lg shadow-md mx-10">
            <div className="px-6 py-2 space-y-3">
              <img
                src={logo}
                alt="RevSpire Logo"
                className="mx-auto mb-1 h-11 pt-3"
                onLoad={handleImageLoaded}
              />
              <h1 className="text-xl font-bold leading-tight text-gray-900">
                {heading}
              </h1>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              {successMessage && <p>{successMessage}</p>}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {fields.map((field, index) => (
                  <div key={index}>
                    <label
                      htmlFor={field.id}
                      className="block mb-1 text-sm font-medium text-gray-900"
                    >
                      {field.label}
                    </label>

                    {field.type === "password" ? (
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id={field.id}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-800 focus:outline-none"
                          placeholder={field.placeholder}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        <span
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                        >
                          <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                          />
                        </span>
                      </div>
                    ) : (
                      <>
                        <input
                        type={field.type}
                        id={field.id}
                        className={`w-full p-2 border border-gray-300 rounded-lg focus:ring focus:ring-sky-800 focus:outline-none ${
                          field.id === "username" && isUsernameDisabled
                            ? "bg-gray-200 cursor-not-allowed"
                            : ""
                        }`}
                        placeholder={field.placeholder}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        readOnly={field.id === "username" && isUsernameDisabled}
                        disabled={field.id === "username" && isUsernameDisabled}
                      />
                      </>
                    
                    )}
                  </div>
                ))}
                
                <button
                  type="submit"
                  className="w-full px-4 py-2 mt-6 text-white btn-secondary rounded-lg flex justify-center items-center"
                  disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? (
                    <LuLoaderCircle className="animate-spin text-white size-[24px]" />
                  ) : (
                    "Submit"
                  )}
                </button>

                {!(heading === "Sign In" && fields.length === 1) && (
                  <div className="flex items-center justify-between mt-4">
                    {links.map((link, index) => (
                      <Link
                        key={index}
                        to={link.LinkPath}
                        onClick={link.onClick} // Handle custom link clicks like resetting form
                        className="text-sm font-medium text-slate-600 hover:underline hover:text-teal-950"
                      >
                        {link.LinkName}
                      </Link>
                    ))}
                  </div>
                )}
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
          <div className="p-6 sm:p-12 text-right"></div>
        </div>
        <img
          src={bg}
          alt="Background"
          className="hidden"
          onLoad={handleImageLoaded}
        />
      </div>
    </>
  );
};

export default Form;
