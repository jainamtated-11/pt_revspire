import React, { useContext } from "react";
import Logo from "../../../../assets/Logo.png";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { useNavigate } from "react-router-dom";
import useCheckUserLicense from "../../../../Services/checkUserLicense";
import RevspireLogo from "../../../../assets/revspire.svg";

function StickyBanner() {
  const {
    authURL,
    handleResponse,
    isMatchingCRMFound,
    isServiceUserConnected,
    serviceUserAuthUrl,
    setActiveTab,
    setShowConnectServiceUserDialog,
  } = useContext(GlobalContext);

  const navigate = useNavigate();
  const checkUserLicense = useCheckUserLicense();

  // Check if the user has the "Spark" license
  const hasSparkLicense = checkUserLicense("Revenue Enablement Spark;") === 1;
  let bannerContent;

  if (!hasSparkLicense) {
    // If no Spark license, do not display the banner
    return null;
  }

  if (authURL) {
    bannerContent = (
      <span>
        Your CRM connection has expired. Please{" "}
        <a
          href={authURL}
          className="inline font-bold text-sky-800 underline underline-offset-2 decoration-600 decoration-solid hover:no-underline"
        >
          Refresh
        </a>
        {" your connection"}
      </span>
    );
  } else if (!isMatchingCRMFound) {
    bannerContent = (
      <span>
        You do not have a valid CRM connection. Please{" "}
        <a
          className="inline font-bold text-sky-800 underline underline-offset-2 decoration-600  decoration-solid hover:no-underline cursor-pointer"
          onClick={() => navigate("content/settings/connection")}
        >
          create
        </a>{" "}
        one or make an existing one primary.
      </span>
    );
  } else if (!isServiceUserConnected) {
    console.log("serviceuser is not connected");
    bannerContent = (
      <span>
        Service User is not connected. Please{" "}
        <a
          className="inline font-bold text-sky-800 underline underline-offset-2 decoration-600  decoration-solid hover:no-underline cursor-pointer"
          onClick={() => {
            navigate("user/organisation");
            setShowConnectServiceUserDialog(true);
            setActiveTab("Salesforce");
          }}
        >
          connect
        </a>{" "}
        new one or reconnect an existing one.
      </span>
    );
  } else if (serviceUserAuthUrl) {
    bannerContent = (
      <span>
        Your Access tokens for Service User are Expired. Please{" "}
        <a
          href={serviceUserAuthUrl}
          className="inline font-bold text-sky-800 underline underline-offset-2 decoration-600 decoration-solid hover:no-underline"
        >
          Reconnect
        </a>{" "}
      </span>
    );
  }

  return (
    <div>
      {authURL ||
      !isServiceUserConnected ||
      !isMatchingCRMFound ||
      serviceUserAuthUrl ? (
        <div>
          <div
            id="sticky-banner"
            tabIndex="-1"
            className="fixed pt-2 mt-8 left-1/2 transform -translate-x-1/2 z-50 flex justify-between w-auto px-4 py-2   bg-primary bg-opacity-50 shadow-lg rounded-lg"
          >
            <div className="flex items-center mx-auto">
              <p className="flex items-center text-sm font-semibold text-gray-900">
                <span className="inline-flex p-1 mr-2">
                  <img src={RevspireLogo} className="h-8 me-2" alt="Logo" />
                </span>
                {bannerContent}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default StickyBanner;
