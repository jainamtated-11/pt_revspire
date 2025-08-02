import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";
import Form from "./Form.jsx";
import { useCookies } from "react-cookie";

const Login = () => {
  const {
    userData,
    handleLogin,
    handleUserName,
    userName,
    setUserName,
    password,
    setPassword,
    successMessage,
    errorMessage,
    isUsernameValid,
    setIsUsernameValid,
    setErrorMessage,
    setSuccessMessage,
  } = useContext(AuthContext);
  const [cookies, setCookie, removeCookie] = useCookies(["userData", "revspireToken"]);
  const [isUsernameDisabled, setIsUsernameDisabled] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName) {
      setErrorMessage("User Name is required");
      return false;
    }
    if (!isUsernameValid) {
      try {
        const res = await handleUserName({ userName });
       
        if(res.user && res.user.id){
        setIsUsernameValid(true);
       
        return true;
       }else{
        return false;
       }

       
      } catch (error) {
        console.error("Username validation failed:", error.message);
        return false;
      }
    } else {
      const loginSuccess = await handleLogin({ userName, password });
      return loginSuccess;
    }
  };

  // Reset the form fields, cookies, and clear error/success messages
  const handleResetForm = () => {
    setUserName(""); // Reset username
    setPassword(""); // Reset password
    setIsUsernameValid(false); // Reset validation state
    setErrorMessage(""); // Clear any error messages
    setSuccessMessage(""); // Clear any success messages
    setIsUsernameDisabled(false);

    // Function to remove cookie from the current domain and higher-level domain
    const clearCookie = (cookieName) => {
      // Remove cookie from current domain
      removeCookie(cookieName);
      // Remove cookie from parent domain
      removeCookie(cookieName, { path: "/", domain: ".revspire.io" });
    };

    // Remove all userData-related cookies
    clearCookie("userData");

    // Remove other specific cookies
    removeCookie("revspireToken");
  };

  const fields = [
    {
      id: "username",
      label: "Username",
      type: "text",
      placeholder: "support@revspire.io",
      value: userName,
      onChange: setUserName,
    },
  ];

  if (
    isUsernameValid &&
    userData?.user?.active === 1 &&
    userData?.organisation?.sso_only === 0
  ) {
    fields.push({
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "••••••••",
      value: password,
      onChange: setPassword,
    });
  }

  // Conditionally show "Sign in as different user" only after username validation
  const links = [
    { LinkPath: "/forgot-password", LinkName: "Forgot Password?" },
    isUsernameValid && {
      LinkPath: "#",
      LinkName: "Sign in as a different user",
      onClick: (e) => {
        e.preventDefault();
        handleResetForm(); // Call reset function on click
      },
    },
  ].filter(Boolean); // Filter out falsy values so that the link only shows when valid

  return (
    <Form
      heading="Sign-In"
      fields={fields}
      handleSubmit={handleSubmit}
      successMessage={successMessage}
      errorMessage={errorMessage}
      links={links}
      onResetForm={handleResetForm} // Pass down reset function
      isUsernameDisabled={isUsernameDisabled}
      setIsUsernameDisabled={setIsUsernameDisabled}
    />
  );
};

export default Login;
