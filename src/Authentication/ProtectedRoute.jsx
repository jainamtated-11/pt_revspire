import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const [cookies] = useCookies(["userData", "revspireToken"]);
  const { setIsUsernameValid } = useContext(AuthContext);

  useEffect(() => {
    if (!cookies.userData || !cookies.revspireToken) {
      setIsUsernameValid(false);
    }
  }, [cookies.userData, cookies.revspireToken, setIsUsernameValid]);

  const urlParams = new URLSearchParams(window.location.search);
  const pitchId = urlParams.get("pitchId");
  const routeToPitch = urlParams.get("routeToPitch");

  const shouldSaveRedirect =
    !cookies.userData &&
    !cookies.revspireToken &&
    pitchId &&
    routeToPitch === "true";

  if (shouldSaveRedirect) {
    localStorage.setItem("postLoginRedirect", window.location.href);
  }

  if (!cookies.userData || !cookies.revspireToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
