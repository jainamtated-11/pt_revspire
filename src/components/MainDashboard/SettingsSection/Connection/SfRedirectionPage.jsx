import React, { useState, useEffect, useContext } from "react";
import { ThreeDots } from "react-loader-spinner";
import logo from "../../../../assets/Logo.png";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { useNavigate } from "react-router-dom";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import MiniLogoLoader from "../../../../assets/LoadingAnimation/MiniLogoLoader.jsx";
function SfRedirectionPage() {
  const [code, setCode] = useState("");
  const [state, setState] = useState("");
  const { baseURL, setAuthURL, viewer_id } = useContext(GlobalContext);
  const navigate = useNavigate(); // Initialize useNavigate hook
  const axiosInstance = useAxiosInstance(); // Initialize axiosInstance hook
  const [active, setActive] = useState(false);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    const getUrlParams = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const codeParam = searchParams.get("code");
      const stateParam = searchParams.get("state");
      return { code: codeParam, state: stateParam };
    };

    const { code, state } = getUrlParams();
    setCode(code);
    setState(state);
    if (code && state) {
      fetchAccessToken(code, state);
    }
  }, []);

  const fetchAccessToken = async (code, state) => {
    try {
      // Construct the URL with query parameters
      const url = `/getSalesforceAccessToken?code=${code}&state=${state}&viewer_id=${viewer_id}`;

      // Send GET request using axios
      const response = await axiosInstance.get(url);

      // Access the response data
      const data = response.data;

      // Update state and log success message
      setAuthURL("");
      console.log("Access token updated successfully:", data.message);

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Error fetching access token:", error);
      // Optionally show an error message or handle the error appropriately
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
     {loading ? <MiniLogoLoader /> : <div id="pickedFiles"></div>}
    </div>
  );
}

export default SfRedirectionPage;
