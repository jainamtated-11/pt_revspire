// useFetchWrapper.js
import { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";
import { useNavigate } from "react-router-dom";

const useFetchWrapper = () => {
  const navigate = useNavigate();
  const { baseURL, revspireClient} = useContext(GlobalContext);

  const fetchWrapper = async (url, options = {}) => {
    try {
      const fullUrl = `${baseURL}${url}`;
      const response = await fetch(fullUrl, {
        ...options,
        credentials: "include", // Ensure cookies are included in the request
      });
      
      if (response.status === 401) {

        if (revspireClient === 1) {
          navigate("/revspire-client-error");
        }


        // Extract the domain from the current URL
        const { protocol, host } = window.location;
        const loginUrl = `${protocol}//${host}/login`;

        // Optionally, you could log the user out or dispatch an action
        // store.dispatch({ type: 'LOGOUT_USER' }); // Example action to log out user

        // Redirect to login page
        window.location.href = loginUrl;
        return null; // Return null or handle as needed after redirect
      }

      return response;
    } catch (error) {
      console.error("Error in fetchWrapper:", error);
      throw error; // Re-throw the error to be handled by the calling function
    }
  };

  return fetchWrapper;
};

export default useFetchWrapper;
