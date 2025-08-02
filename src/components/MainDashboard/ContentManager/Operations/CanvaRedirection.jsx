import React, { useState, useEffect, useContext } from "react";
import { ThreeDots } from "react-loader-spinner";
import logo from "../../../../assets/RevSpire-logo.svg";
import { GlobalContext } from "../../../../context/GlobalState";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useCookies } from "react-cookie";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { LuLoaderCircle } from "react-icons/lu";
function CanvaRedirection() {
  const [loading, setLoading] = useState(true);
  const {
    viewer_id,
    setIntegrationsConnection,
    integrationsConnection,
    baseURL,
  } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["canvaAccessToken"]);
  const axiosInstance = useAxiosInstance();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const canvaCodeVerifier = params.get("canvaCodeVerifier");
        console.log({
          canvaCodeVerifier,
          viewer_id,
          code,
        });

        const res = await axiosInstance.post("/get-canva-access-token", {
          viewer_id: viewer_id,
          code: code,
          canvaCodeVerifier: canvaCodeVerifier,
        });

        const { data } = res;

        removeCookie("canvaAccessToken");

        setCookie("canvaAccessToken", data.tokenData.access_token, {
          path: "/",
          maxAge: data.tokenData.expires_in,
          secure: true,
          SameSite: "Strict",
        });

        removeCookie("canvaRefreshToken");

        setCookie("canvaRefreshToken", data.tokenData.refresh_token, {
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
          secure: true,
          SameSite: "Strict",
        });

        removeCookie("canvaUserID");

        setCookie("canvaUserID", data.userDetails.team_user.user_id, {
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
          secure: true,
          SameSite: "Strict",
        });
        setIntegrationsConnection({ ...integrationsConnection, canva: true });
        toast.success("Canva authentication successful!");
      } catch (error) {
        toast.error("Something went wrong!!");
        console.error(error);
      } finally {
        setLoading(false);
        navigate("/");
      }
    };

    handleRedirect();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      {loading ? (
          <div className={`mini-logo ${active ? "logoActive" : ""}`}>
          <div className="app-container w-[300px]">
            <div className="loader-container gap-2 justify-center items-center flex flex-col h-full bg-cover w-full">
              <img className="logos h-full bg-cover w-[220px] bg-white p-2" src={logo} alt="Logo" />
              <div>
                <LuLoaderCircle className=" animate-spin text-xl text-neutral-800" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div id="pickedFiles"></div>
      )}
    </div>
  );
}

export default CanvaRedirection;
