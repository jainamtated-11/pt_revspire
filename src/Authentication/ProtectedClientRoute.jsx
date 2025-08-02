import React from "react";
import { Navigate, useParams, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";

const ProtectedClientRoute = ({ children }) => {
  const [cookies] = useCookies(["userData", "revspireToken"]);
  const { pitchId } = useParams();
  const location = useLocation();

  // Parse the apiURL from the URL search params
  const searchParams = new URLSearchParams(location.search);
  const apiURL = searchParams.get("apiURL");

  // Check if both cookies are present
  if (!cookies.userData || !cookies.revspireToken) {
    // Redirect to the pitchlogin page with the pitchId and apiURL extracted from the URL
    return <Navigate to={`/pitchlogin/${pitchId}?apiURL=${encodeURIComponent(apiURL)}`} replace />;
  }

  // If both cookies are present, render the children components
  return children;
};

export default ProtectedClientRoute;
