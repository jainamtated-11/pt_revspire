import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [id, setId] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPasswordToken, setResetPasswordToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [isUsernameValid, setIsUsernameValid] = useState(false);

  const AuthURL = `https://${userData?.organisation?.tenant_api_name}.${userData?.organisation?.domain}`;
  const UserDataLoginAPI = "https://login.api.revspire.io";

  const [baseURL, setBaseURL] = useState("");
  const [frontendBaseURL, setFrontendBaseUrl] = useState("");

  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies([
    "userData",
    "baseURL",
  ]);

  useEffect(() => {
    // Create a new URLSearchParams object with the current URL's query string
    const queryParams = new URLSearchParams(window.location.search);

    // Extract the 'username' parameter from the URL
    const username = queryParams.get("username");

    // Check if username exists and perform your action
    if (username) {
      // Perform the desired action here
      handleUserName({ userName: username });
    }
  }, []);

  useEffect(() => {
    // Check if we have userData cookie
    if (cookies.userData) {
      try {
        // Parse the userData cookie (it's already URL decoded by react-cookie)
        const userData =
          typeof cookies.userData === "string"
            ? JSON.parse(cookies.userData)
            : cookies.userData;

        // Construct the URLs from organisation data
        const frontendURL = `https://${userData.organisation.tenant_name}.${userData.organisation.domain}`;
        const apiURL = `https://${userData.organisation.tenant_api_name}.${userData.organisation.domain}`;

        // Create the baseURL cookie value (matching your exact format)
        const baseURLCookieValue = JSON.stringify([
          {
            frontend: frontendURL,
            baseURL: apiURL,
          },
        ]);

        // Set/refresh both cookies for current domain with 7-day expiration
        setCookie("userData", JSON.stringify(userData), {
          path: "/",
          maxAge: 604800, // 7 days
          sameSite: "None",
          secure: true,
        });

        setCookie("baseURL", baseURLCookieValue, {
          path: "/",
          maxAge: 604800, // 7 days
          sameSite: "None",
          secure: true,
        });

        if (!cookies.revspireClient || cookies.revspireClient === "0") {
          setCookie("revspireClient", "0", {
            path: "/",
            maxAge: 604800,
            sameSite: "None",
            secure: true,
          });
        }

        // Update application state
        setUserName(userData.user?.username || "");
        setBaseURL(apiURL);
        setFrontendBaseUrl(frontendURL);
        setUserData(userData);
        setIsUsernameValid(true);

        console.log("username", userName);
        console.log("baseURL", baseURL);
        console.log("frotnednBaseURL", frontendBaseURL);
        console.log("userdata", userData);
        console.log("isUsernameValid", isUsernameValid);
      } catch (error) {
        console.error("Error processing cookies:", error);
      }
    }
  }, []);

  const handleErrorResponse = (data) => {
    if (data.error) {
      return data.error;
    } else if (data.message) {
      return data.message;
    } else {
      return "An unexpected error occurred.";
    }
  };

  const handleUserName = async ({ userName }, callback) => {
    if (!userName) {
      setErrorMessage("User Name is required.");
      return null;
    }

    try {
      setErrorMessage("");
      const response = await fetch(`${UserDataLoginAPI}/login-org-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: userName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(handleErrorResponse(data));
        return data;
      }

      const FrontendBaseURL = `https://${data.organisation.tenant_name}.${data.organisation.domain}`;
      const windowURL = new URL(window.location.href);

      if (windowURL.origin !== "http://localhost:5173") {
        if (windowURL.origin !== FrontendBaseURL) {
          const newURL = `${FrontendBaseURL}?username=${encodeURIComponent(
            userName
          )}`;
          window.location.href = newURL;
        }
      }

      setUserData(data);

      // Safely handle `data.organisationSso` if it's null, undefined, or not an array
      const organisationSso = Array.isArray(data.organisationSso)
        ? data.organisationSso
        : [];
      const filteredOrganisationSso = organisationSso.filter(
        (sso) => sso.is_primary === 1
      );
      const dataWithoutNonPrimarySso = {
        ...data,
        organisationSso: filteredOrganisationSso,
      };

      setCookie("userData", JSON.stringify(dataWithoutNonPrimarySso), {
        path: "/",
        maxAge: 86400,
        SameSite: "None",
        secure: true,
      });

      if (!data?.user?.active) {
        setErrorMessage("Contact admin to activate your account.");
        return;
      }

      const { domain, tenant_api_name, tenant_name } = data.organisation;
      const newBaseURL = `https://${tenant_api_name}.${domain}`;
      const newFrontendBaseURL = `https://${tenant_name}.${domain}`;

      setBaseURL(newBaseURL);
      setFrontendBaseUrl(newFrontendBaseURL);

      const existingBaseURLs = cookies.baseURLs
        ? JSON.parse(cookies.baseURLs)
        : [];

      const matchingEntry = existingBaseURLs.find(
        (entry) =>
          entry.baseURL === newBaseURL &&
          entry.frontendBaseURL === newFrontendBaseURL
      );

      if (!matchingEntry) {
        const updatedBaseURLs = [
          ...existingBaseURLs,
          { frontend: newFrontendBaseURL, baseURL: newBaseURL },
        ];

        setCookie("baseURL", JSON.stringify(updatedBaseURLs), {
          path: "/",
          maxAge: 86400,
          sameSite: "None",
          secure: true,
        });
      }

      if (data?.organisation?.sso_only === 1) {
        const primarySso = filteredOrganisationSso.find(
          (sso) => sso.is_primary === 1
        );
        if (primarySso) {
          // Redirect to the primary SSO issuer URL
          window.location.href = primarySso.sso_url;
          return;
        } else {
          setErrorMessage("Primary SSO provider not found.");
        }
        return;
      }

      if (callback) {
        callback(data);
      }

      return data;
    } catch (error) {
      setErrorMessage("Network error or validation failed.");
      console.error(error);
      throw error;
    }
  };

  const handleLogin = async ({ userName, password }) => {
    try {
      if (!userData) {
        await handleUserName({ userName });
        if (errorMessage) return;
      }

      if (!userData?.user?.active) {
        setErrorMessage("Contact admin to activate your account.");
        return;
      }

      if (userData?.organisation?.sso_only === 1) {
        const filteredOrganisationSso = Array.isArray(userData?.organisationSso)
          ? userData.organisationSso.filter((sso) => sso.is_primary === 1)
          : [];

        const primarySso = filteredOrganisationSso.find(
          (sso) => sso.is_primary === 1
        );
        if (primarySso) {
          window.location.href = primarySso.sso_url;
        } else {
          setErrorMessage("Primary SSO provider not found.");
        }
        return;
      }

      if (!userName) {
        setErrorMessage("User Name is required.");
        return;
      } else if (!password) {
        setErrorMessage("Password is required.");
        return;
      }

      const endpoint = "/login";
      const body = { username: userName, password };

      const response = await fetch(`${AuthURL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const responseData = await response.json();

      if (response.ok) {
        setAuthenticated(true);
        setSuccessMessage("Login successful!");

        const filteredOrganisationSso = Array.isArray(userData?.organisationSso)
          ? userData.organisationSso.filter((sso) => sso.is_primary === 1)
          : [];
        const userDataWithoutNonPrimarySso = {
          ...userData,
          organisationSso: filteredOrganisationSso,
        };

        const serializableUserData = JSON.parse(
          JSON.stringify(userDataWithoutNonPrimarySso)
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
          sameSite: "None",
          secure: true,
        });

        setCookie("revspireLicense", responseData.userLicenseInfo, {
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
          sameSite: "None",
          secure: true,
        });

        setCookie("revspireClient", 0, {
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
          sameSite: "None",
          secure: true,
        });
        const redirectUrl = localStorage.getItem("postLoginRedirect");
        if (redirectUrl) {
          localStorage.removeItem("postLoginRedirect");
          window.location.href = redirectUrl; // Navigate back to original URL with pitchID, etc.
        } else navigate("/content/content-portal");
      } else {
        // Handle specific error messages from the backend
        setErrorMessage(handleErrorResponse(responseData));
        setAuthenticated(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Network error or validation failed:", error.message);
      setErrorMessage("Network error or validation failed.");
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    removeCookie("userData", { path: "/" });
    removeCookie("revspireToken", { path: "/" });
    removeCookie("revspireRefreshToken", { path: "/" });
    removeCookie("revspirePermissions", { path: "/" });
    removeCookie("revspireLicense", { path: "/" });
    setUserData(null);
    setErrorMessage("");
    setSuccessMessage("");
    setIsUsernameValid(false);
    setPassword("");
    navigate("/");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${AuthURL}/auth/creator/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, email }),
        credentials: "include",
      });

      if (response.ok) {
        setSuccessMessage("Mail sent! You can safely close this window.");
        setErrorMessage("");
      } else {
        const errorMessage = await response.text();
        setErrorMessage(errorMessage);
      }
    } catch (error) {
      setErrorMessage("Failed to signup");
    }
  };

  const handlePasswordReset = async ({
    resetPasswordToken,
    password,
    userId,
  }) => {
    try {
      // Get the full URL of the page
      const currentURL = new URL(window.location.href);

      // Extract the 'backendURL' query parameter from the URL
      const backendURL = currentURL.searchParams.get("backendURL");

      // Log for debugging purposes
      console.log("Backend URL from URL params:", backendURL);

      if (!backendURL) {
        throw new Error("Backend URL is missing from the URL.");
      }

      // Proceed with the password reset request to the backend
      const response = await fetch(`${backendURL}/token-password-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          encryptedAppToken: resetPasswordToken,
          userId,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
        setSuccessMessage(data.message + " You can login here now.");
      } else {
        throw new Error(data.message || "Failed to reset password.");
      }

      setErrorMessage("");
      console.log(data);
    } catch (error) {
      console.log(error.message);
      setErrorMessage(error.message);
      setSuccessMessage("");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        setAuthenticated,
        id,
        setId,
        email,
        setEmail,
        userName,
        setUserName,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        resetPasswordToken,
        setResetPasswordToken,
        handleUserName,
        handleLogin,
        handleLogout,
        handleSignup,
        handlePasswordReset,
        errorMessage,
        setErrorMessage,
        successMessage,
        setSuccessMessage,
        userData,
        setUserData,
        baseURL,
        frontendBaseURL,
        isUsernameValid,
        setIsUsernameValid,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
