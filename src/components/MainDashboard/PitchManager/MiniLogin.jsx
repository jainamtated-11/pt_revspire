import React, { useState } from "react";
import Logo from "../../../assets/RevSpire-logo.svg";
import { useCookies } from "react-cookie";
const UserDataLoginAPI = "https://login.api.revspire.io";
import { useNavigate, Navigate } from "react-router-dom";
import { LuLoaderCircle } from "react-icons/lu";

function MiniLogin({ onClose }) {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [authURL, setAuthURL] = useState("");
  const [cookies, setCookie] = useCookies([
    "userData",
    "revspireToken",
    "revspireRefreshToken",
    "revspirePermissions",
    "revspireLicense",
    "revspireClient",
  ]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUsernameSubmit = async () => {
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await fetch(`${UserDataLoginAPI}/login-org-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName }),
      });

      const data = await response.json();
      setUserData(data);
      if (!response.ok) {
        setErrorMessage(data.message || "Failed to fetch organization details");
        setLoading(false);
        return;
      }

      setUserData(data);
      const baseURL = `https://${data?.organisation?.tenant_api_name}.${data?.organisation?.domain}`;
      setAuthURL(baseURL);
      setCookie("userData", JSON.stringify(data), {
        path: "/",
        maxAge: 86400,
        SameSite: "None",
        secure: true,
      });

      if (!data?.user?.active) {
        setErrorMessage("Contact admin to activate your account.");
        setLoading(false);
        return;
      }
      setStep(2);
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setErrorMessage("");
    setLoading(true);
    try {
      const response = await fetch(`${authURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.message || "Invalid username or password.");
        setLoading(false);
        return;
      }

      const responseData = await response.json();
      const filteredOrganisationSso = Array.isArray(userData?.organisationSso)
        ? userData.organisationSso.filter((sso) => sso.is_primary === 1)
        : [];

      const serializableUserData = JSON.parse(
        JSON.stringify({
          ...userData,
          organisationSso: filteredOrganisationSso,
        })
      );

      setCookie("userData", JSON.stringify(serializableUserData), {
        path: "/",
        maxAge: 86400,
        SameSite: "None",
        secure: true,
      });

      setCookie("revspireToken", responseData.revspireToken, {
        path: "/",
        maxAge: 24 * 60 * 60,
        SameSite: "None",
        secure: true,
      });

      setCookie("revspireRefreshToken", responseData.revspireRefreshToken, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        SameSite: "None",
        secure: true,
      });

      setCookie("revspirePermissions", responseData.userPermission, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        SameSite: "None",
        secure: true,
      });

      setCookie("revspireLicense", responseData.userLicenseInfo, {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        SameSite: "None",
        secure: true,
      });

      setCookie("revspireClient", "0", {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        SameSite: "None",
        secure: true,
      });

      const currentPath = window.location.pathname;
      const searchParams = window.location.search;
      const pathSegments = currentPath.split("/");
      const pitchId = pathSegments.length > 2 ? pathSegments[2] : "";

      if (searchParams && pitchId) {
        navigate(`/dsr/${pitchId}${searchParams}`);
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl max-w-xl py-4 px-8 relative">
        {/* Close Button */}
        <div className="absolute top-2 right-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col items-center justify-center bg-gray-100">
          <div className="bg-white p-6 rounded-lg w-96">
            <img src={Logo} alt="RevSpire" className="mx-auto mb-4 h-10" />

            {step === 1 ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Login</h2>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full p-2 border rounded mb-4"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    setErrorMessage(""); // Reset error on input change
                  }}
                />
                {errorMessage && (
                  <p className="text-red-500 text-sm mb-3">{errorMessage}</p>
                )}
                <button
                  onClick={handleUsernameSubmit}
                  className={`w-full bg-secondary text-white p-2 rounded ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <LuLoaderCircle className="animate-spin h-5 w-5 inline" />
                  ) : (
                    "Next"
                  )}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Sign-In</h2>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-4 bg-gray-200"
                  value={userName}
                  disabled
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-2 border rounded mb-4"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(""); // Reset error on input change
                  }}
                />
                {errorMessage && (
                  <p className="text-red-500 text-sm mb-3">{errorMessage}</p>
                )}
                <button
                  onClick={handleLogin}
                  className={`w-full bg-secondary text-white p-2 rounded ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <LuLoaderCircle className="animate-spin h-5 w-5 inline" />
                  ) : (
                    "Login"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MiniLogin;
