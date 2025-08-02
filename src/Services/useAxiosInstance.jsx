import axios from "axios";
import { useContext } from "react";
import { useCookies } from "react-cookie";
import { GlobalContext } from "../context/GlobalState";
import { useNavigate } from "react-router-dom";

const useAxiosInstance = () => {
  const navigate = useNavigate();
  const { baseURL, revspireClient, viewer_id, globalOrgId } =
    useContext(GlobalContext);
  const [, , removeCookie] = useCookies([
    "revspireToken",
    "revspireRefreshToken",
  ]);

  if (!baseURL) {
    throw new Error("baseURL is not defined in GlobalContext");
  }

  // Create an Axios instance
  const axiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
  });

  // Add a request interceptor to include viewer_id and organisation_id in the request body
  axiosInstance.interceptors.request.use(
    (config) => {
      // Ensure viewer_id and organisation_id exist
      if (viewer_id && globalOrgId) {
        // If the request method supports a body (e.g., POST, PUT, PATCH), add to the body
        if (
          config.method === "post" ||
          config.method === "put" ||
          config.method === "patch"
        ) {
          if (config.data instanceof FormData) {
            // Add viewer_id only if it does not already exist in FormData
            if (!config.data.has("viewer_id")) {
              config.data.append("viewer_id", viewer_id);
            }
            // Add organisation_id only if it does not already exist in FormData
            if (!config.data.has("organisation_id")) {
              config.data.append("organisation_id", globalOrgId);
            }
          } else {
            // For non-FormData requests, merge the parameters into the body
            config.data = {
              ...config.data,
              ...(config.data.viewer_id ? {} : { viewer_id }), // Add viewer_id if not present
              ...(config.data.organisation_id
                ? {}
                : { organisation_id: globalOrgId }), // Add organisation_id if not present
            };
          }
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add a response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        const currentURL = window.location.href;

        // Check if the URL contains '/dsr/' and handle redirect to /pitchlogin
        if (currentURL.includes("/dsr/")) {
          // Clear the tokens using react-cookie's removeCookie
          removeCookie("revspireToken", { path: "/" });
          removeCookie("revspireRefreshToken", { path: "/" });

          // Decode the URL components
          const url = new URL(currentURL);
          const pathSegments = url.pathname.split("/");
          const id = pathSegments[pathSegments.length - 1];
          const apiURL = decodeURIComponent(url.searchParams.get("apiURL"));

          // Redirect to the new page format
          const { protocol, host } = window.location;
          const redirectUrl = `${protocol}//${host}/pitchlogin/${id}?apiURL=${encodeURIComponent(
            apiURL
          )}`;

          // Prevent further redirection by stopping here
          window.location.href = redirectUrl;

          return Promise.reject(error);
        }

        if (revspireClient === 1) {
          navigate("/revspire-client-error");
        } else {
          // Default redirect if the URL does not contain '/dsr/'
          const { protocol, host } = window.location;
          const loginUrl = `${protocol}//${host}/login`;
          window.location.href = loginUrl;
        }
      }

      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxiosInstance;
