import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import logo from "../assets/RevSpire-logo.svg";
import { AuthContext } from "./AuthContext";
import { useCookies } from "react-cookie";
import bg from "../assets/Bg.png";
import { LuLoaderCircle } from "react-icons/lu";
import MiniLogoLoader from "../assets/LoadingAnimation/MiniLogoLoader"; // Add this import
import toast from "react-hot-toast";

function EmailSent() {
  const [cookies] = useCookies(["userData"]);
  const { baseURL, frontendBaseURL } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State for form loader
  const [loadingScreen, setLoadingScreen] = useState(true); // Loading screen state

  const [username, setUsername] = useState(""); // State to store the username
  const navigate = useNavigate(); // Initialize navigate
  let domain;
  if (!frontendBaseURL) {
    const rawCookie = cookies.userData;
    if (rawCookie) {
      const fdomain = rawCookie.organisation?.domain || "";
      const tenantName = rawCookie.organisation?.tenant_name || "";
      const frontendBaseURL = `https://${tenantName}.${fdomain}`;
      domain = new URL(frontendBaseURL).host;
    }
  } else {
    domain = new URL(frontendBaseURL).host;
  }

  const handleSendEmail = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!username) {
      setErrorMessage("User Name is required");
      return;
    }
    setIsLoading(true); // Start the form loader
    try {
      const response = await fetch(`${baseURL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are included in the request
        body: JSON.stringify({ username, frontendURL: domain }),
      });

      const result = await response.json();

      if (response.ok) {
        setErrorMessage("");
        toast.success(result.message);
        // Set a timer to redirect after 5 seconds
        setSuccessMessage(result.message);
        setTimeout(() => {
          navigate("/login");
        }, 7000);
      } else {
        toast.error(result.message || "An error occurred. Please try again.");
        setErrorMessage(
          result.message || "An error occurred. Please try again."
        );
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Error:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Stop the form loader
    }
  };

  // Called when the hidden image (background image) is loaded
  const handleImageLoaded = () => {
    setTimeout(() => {
      setLoadingScreen(false); // Hide the loading screen after a short delay
    }, 300); // Adjust delay as needed
  };

  return (
    <div>
      {/* Display loader before the content is loaded */}
      {loadingScreen && (
        <div className="flex justify-center items-center h-screen">
          <MiniLogoLoader />
        </div>
      )}

      {/* Main content */}
      <div
        className={`flex flex-row h-screen transition-opacity duration-500 ${
          loadingScreen ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundColor: "#f4f6f9" }}
      >
        {/* Left Section */}
        <div className="flex items-center justify-center w-full lg:w-1/2 p-6 sm:p-12 bg-grey-600">
          <div className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-lg shadow-md mx-14">
            <div className="p-8 space-y-6">
              <img
                src={logo}
                alt="RevSpire Logo"
                className="mx-auto mb-6 h-12"
                onLoad={handleImageLoaded} // Track when the logo is loaded
              />
              <h1 className="text-2xl font-bold leading-tight text-gray-900">
                Forgot Password
              </h1>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              {successMessage && (
                <p className="text-green-500">{successMessage}</p>
              )}
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <p className="text-base font-semibold text-sky-900">
                    An email will be sent to your registered email address with
                    instructions to reset your password.
                  </p>
                  <label className="block mb-2 mt-2 text-sm font-medium text-gray-900">
                    Username
                  </label>

                  <input
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-sky-800 focus:outline-none"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 mt-6 text-white btn-secondary rounded-lg flex justify-center items-center"
                >
                  {isLoading ? (
                    <LuLoaderCircle className="animate-spin text-white size-[24px]" />
                  ) : (
                    "Submit"
                  )}
                </button>
                <div className="flex items-center justify-between mt-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-600 italic hover:underline hover:text-teal-950"
                  >
                    Back to Login
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
          <div className="p-6 sm:p-12 text-right">
            <h1 className="text-4xl font-bold text-white"></h1>
          </div>
        </div>

        {/* Hidden Image for Background Loading */}
        <img
          src={bg}
          alt="Background"
          className="hidden" // Hide the image, it's just for tracking load
          onLoad={handleImageLoaded} // Track when the background image is fully loaded
        />
      </div>
    </div>
  );
}

export default EmailSent;
