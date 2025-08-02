import React, { useContext, useEffect, useState } from "react";
import Logo from "../../../../assets/Logo.png";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { useNavigate } from "react-router-dom";
import useCheckUserLicense from "../../../../Services/checkUserLicense";
import RevspireLogo from "../../../../assets/revspire.svg";

function WarningStickyBanner() {
  const {
    aiCreditUsageWarning,
    storageUsageWarning,
    authURL,
    isServiceUserConnected,
    isMatchingCRMFound,
    serviceUserAuthUrl,
    setDisableDefaultNavigation,
  } = useContext(GlobalContext);
  const [redBannerPresent, setRedBannerPresent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (
      authURL ||
      !isServiceUserConnected ||
      !isMatchingCRMFound ||
      serviceUserAuthUrl
    ) {
      setRedBannerPresent(true);
    } else {
      setRedBannerPresent(false);
    }
  }, [authURL, isServiceUserConnected, isMatchingCRMFound, serviceUserAuthUrl]);

  const navigateToOrganisation = () => {
    setDisableDefaultNavigation(true);
    navigate("/user/organisation");
    setActiveTab("ai");
    // setDisableDefaultNavigation(false);
  };

  let bannerContent;
  if (aiCreditUsageWarning) {
    bannerContent = (
      <span>
        You have run out of AI credits. To continue using AI services{" "}
        <a
          className="inline font-bold text-sky-800 underline underline-offset-2 decoration-600 decoration-solid hover:no-underline cursor-pointer"
          onClick={navigateToOrganisation}
        >
          purchase
        </a>
        {" more tokens."}
      </span>
    );
  } else if (storageUsageWarning) {
    bannerContent = (
      <span>
        You have run out of storage. To continue using the application{" "}
        <a
          className="inline font-bold text-sky-800 underline underline-offset-2 decoration-600 decoration-solid hover:no-underline cursor-pointer"
          onClick={navigateToOrganisation}
        >
          purchase
        </a>
        {" more storage or clear existing content."}
      </span>
    );
  }

  return (
    <div>
      {aiCreditUsageWarning || storageUsageWarning ? (
        <div>
          <div
            id="sticky-banner"
            tabIndex="-1"
            className={`fixed pt-2 ${
              redBannerPresent ? "mt-28" : "mt-8"
            } left-1/2 transform -translate-x-1/2 z-50 flex justify-between w-auto px-4 py-2   bg-warning bg-opacity-50 shadow-lg rounded-lg`}
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

export default WarningStickyBanner;
