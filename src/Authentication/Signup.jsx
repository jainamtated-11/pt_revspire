import React, { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { useLocation } from "react-router-dom";
import Form from "./Form.jsx";

const Signup = () => {
  const {
    id,
    setId,
    email,
    setEmail,
    successMessage,
    errorMessage,
    handleSignup,
  } = useContext(AuthContext);

  // Use useLocation to get the current path
  const location = useLocation();
  const isForgotPassword = location.pathname.includes("forgot-password");

  const heading = isForgotPassword ? "Forgot Password" : "Sign-Up";

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSignup({ id, email });
  };

  const fields = [
    {
      id: "id",
      label: "ID",
      type: "text",
      placeholder: "ID",
      value: id,
      onChange: setId,
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "Email",
      value: email,
      onChange: setEmail,
    },
  ];

  const links = [{ LinkPath: "/login", LinkName: "Return To Login..." }];

  return (
    <Form
      heading={heading}
      fields={fields}
      handleSubmit={handleSubmit}
      successMessage={successMessage}
      errorMessage={errorMessage}
      links={links}
    />
  );
};

export default Signup;
