import React, { useState, useEffect, useContext } from "react";
import { ThreeDots } from "react-loader-spinner";
import logo from "../../../../assets/Logo.png";
import { GlobalContext } from "../../../../context/GlobalState";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useCookies } from 'react-cookie';
import axios from 'axios'; // Direct axios import

function SSORedirection() {
  const [loading, setLoading] = useState(true);
  const { setIntegrationsConnection, integrationsConnection } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [, setCookie, removeCookie] = useCookies(['userData', 'revspireToken', 'revspireRefreshToken', 'revspireLicense', 'revspirePermission']);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const userData = params.get("userData");
        const revspireToken = params.get("revspireToken");
        const revspireRefreshToken = params.get("revspireRefreshToken");

        removeCookie("userData");

        // Set the cookies for userData, token, and refresh token from URL params
        setCookie('userData', userData, {
          path: '/',
          maxAge: 7 * 24 * 60 * 60, // 1 week
          secure: true,
          SameSite: "None",
        });

        setCookie('revspireToken', revspireToken, {
          path: '/',
          maxAge: 24 * 60 * 60, // 1 day
          secure: true,
          SameSite: "None",
        });

        setCookie('revspireRefreshToken', revspireRefreshToken, {
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 1 month
          secure: true,
          SameSite: "None",
        });

        setCookie("revspireClient", 0, {
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
          sameSite: "None",
          secure: true,
        });

        // Parse userData as it is assumed to be a JSON string
        const parsedUserData = JSON.parse(decodeURIComponent(userData));
        const viewerId = parsedUserData.user.id; // Extract viewer_id (user id)

        // Retrieve tenant API name and domain from the parsed user data
        const tenantApiName = parsedUserData.organisation.tenant_api_name;
        const domain = parsedUserData.organisation.domain;
        const organisation_id = parsedUserData.organisation.id;


        // Construct the API endpoint URL
        const apiEndpoint = `https://${tenantApiName}.${domain}/login-information`;

        // Make an API call to /login-information with viewer_id in the request body
        const response = await axios.post(apiEndpoint, {
          viewer_id: viewerId,
          organisation_id: organisation_id
        });

        if (response.status === 200 && response.data.success) {
          const revspireLicense = response.data.userLicenseInfo;
          const revspirePermissions = response.data.userPermission;

          // Set the cookies for license and permission based on API response
          setCookie('revspireLicense', revspireLicense, {
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 1 month
            secure: true,
            SameSite: "None",
          });

          setCookie('revspirePermissions', revspirePermissions, {
            path: '/',
            maxAge: 30 * 24 * 60 * 60, // 1 month
            secure: true,
            SameSite: "None",
          });

          setIntegrationsConnection({ ...integrationsConnection, "sso": true });
          toast.success("SSO authentication successful!");
        } else {
          throw new Error(response.data.message || "Failed to retrieve license and permission data");
        }

      } catch (error) {
        toast.error("Something went wrong during authentication!!");
        console.error(error);
      } finally {
        setLoading(false);
        navigate("/content/content-portal");
      }
    };

    handleRedirect();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      {loading ? (
          <div className={`mini-logo ${active ? "logoActive" : ""}`}>
          <div className="app-container h-[500px] w-[900px]">
            <div className="loader-container h-full bg-cover w-full">
              <img className="logos h-full w-full bg-cover  bg-white p-2" src={logo} alt="Logo" />
            </div>
          </div>
        </div>
      ) : (
        <div id="pickedFiles"></div>
      )}
    </div>
  );
}

export default SSORedirection;