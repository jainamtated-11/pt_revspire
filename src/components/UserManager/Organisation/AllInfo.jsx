import React, { useContext, useEffect } from "react";
import MoreInfoDialog from "./MoreInfoDialog";
import DSRSetup from "./DSRSetup";
import OnedriveSettings from "./OnedriveSettings";
import SsoSettings from "./SsoSettings";
import Salesforce from "./Salesforce/Salesforce";
import { GlobalContext } from "../../../context/GlobalState";
import AuditLog from "./AuditLog";
import ApiToken from "../ApiToken";
import { FaUser, FaDesktop } from "react-icons/fa";
import { GrShieldSecurity } from "react-icons/gr";
import { AiFillApi } from "react-icons/ai";
import { TbLogs } from "react-icons/tb";
import AiData from "./AiData";
import microsoftlogo from "../../../assets/clarity.png";
import slacklogo from "../../../assets/slacklogo.png";
import AIlogo from "../../../assets/artificial-intelligence (2).png";
import useCheckUserLicense from "../../../Services/checkUserLicense";
import Storage from "./Storage";
import { GrStorage } from "react-icons/gr";
import MicrosoftClarity from "./MicrosoftClarity";
import SlackIntegration from "./SlackIntegration";
import OneDriveLogo from "../../../assets/OneDrive-Logo.wine.svg";
import SalesforceLogo from "../../../assets/salesforce-2.svg";
import ZohoLogo from "../../../assets/zoho_square.png";
import ZohoMain from "./Zoho/ZohoMain";
import HubSpotMain from "./HubSpot/HubSpotMain";
import PipedriveMain from "./Pipedrive/PipedriveMain";
import pipedriveLogo from "../../../assets/pipedriveLogo.svg";
import DynamicsMain from "./Dynamics365/DynamicsMain";
import HubSpotLogo from "../../../assets/HubSpotLogo.png";
import EmailTab from "./EmailTab";
import Dynamics365 from "../../../assets/dynamics_365.png";
const AllInfo = () => {
  const { activeTab, setActiveTab } = useContext(GlobalContext);
  const handleActiveTab = (tab) => {
    setActiveTab(tab);
  };
  const checkUserLicense = useCheckUserLicense();

  useEffect(() => {
    setActiveTab("general");
  }, []);

  return (
    <div>
      <div className="gap-4 flex flex-row mt-2 rounded-2xl">
        <div>
          <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
            <ul
              className="flex flex-wrap -mb-px text-sm font-medium text-center"
              id="default-tab"
              data-tabs-toggle="#default-tab-content"
              role="tablist"
            >
              <li className="me-2" role="general">
                <button
                  className={`flex items-center gap-1 p-4 border-b-2 rounded-t-lg ${
                    activeTab === "general" ? "border-sky-800 text-sky-800" : ""
                  }`}
                  id="general-tab"
                  data-tabs-target="#general"
                  type="button"
                  role="tab"
                  aria-controls="general"
                  aria-selected={activeTab === "general"}
                  onClick={() => handleActiveTab("general")}
                >
                  <FaUser className="w-4 h-4" />
                  General
                </button>
              </li>

              <li className="me-2" role="general">
                <button
                  className={`flex items-center gap-1 p-4 border-b-2 rounded-t-lg ${
                    activeTab === "storage" ? "border-sky-800 text-sky-800" : ""
                  }`}
                  id="storage-tab"
                  data-tabs-target="#storage"
                  type="button"
                  role="tab"
                  aria-controls="storage"
                  aria-selected={activeTab === "storage"}
                  onClick={() => handleActiveTab("storage")}
                >
                  <GrStorage className="w-4 h-4" />
                  Storage
                </button>
              </li>

              <li className="me-2" role="pitch">
                <button
                  className={`flex items-center gap-1 p-4 border-b-2 rounded-t-lg ${
                    activeTab === "pitch" ? "border-sky-800 text-sky-800" : ""
                  }`}
                  id="pitch-tab"
                  data-tabs-target="#pitch"
                  type="button"
                  role="tab"
                  aria-controls="pitch"
                  aria-selected={activeTab === "pitch"}
                  onClick={() => handleActiveTab("pitch")}
                >
                  <FaDesktop className="w-4 h-4" />
                  Pitch
                </button>
              </li>

              {/* Email Tab */}
              {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                checkUserLicense("Revenue Enablement Spark") == "1") && (
                <li className="me-2" role="pitch">
                  <button
                    className={`flex items-center gap-1 p-4 border-b-2 rounded-t-lg ${
                      activeTab === "email" ? "border-sky-800 text-sky-800" : ""
                    }`}
                    id="email-tab"
                    data-tabs-target="#email"
                    type="button"
                    role="tab"
                    aria-controls="email"
                    aria-selected={activeTab === "email"}
                    onClick={() => handleActiveTab("email")}
                  >
                    <BaselineMailOutline className="w-5 h-5" />
                    Email
                  </button>
                </li>
              )}

              <li className="me-2" role="pitch">
                <button
                  className={`flex items-center gap-1 p-4 border-b-2 rounded-t-lg ${
                    activeTab === "api-token"
                      ? "border-sky-800 text-sky-800"
                      : ""
                  }`}
                  id="api-token"
                  data-tabs-target="#api-token"
                  type="button"
                  role="tab"
                  aria-controls="api-token"
                  aria-selected={activeTab === "api-token"}
                  onClick={() => handleActiveTab("api-token")}
                >
                  <AiFillApi className="w-5 h-5" />
                  API Token
                </button>
              </li>


              {/* AI Tab */}
              {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                checkUserLicense("Revenue Enablement Spark") == "1") && (
                <li className="me-2" role="pitch">
                  <button
                    className={`flex items-center gap-[-2px] p-4 border-b-2 rounded-t-lg ${
                      activeTab === "ai-data" ? "border-sky-800 text-sky-800" : ""
                    }`}
                    id="ai-data"
                    data-tabs-target="#ai-data"
                    type="button"
                    role="tab"
                    aria-controls="ai-data"
                    aria-selected={activeTab === "ai-data"}
                    onClick={() => handleActiveTab("ai-data")}
                  >
                    <div className=" flex items-center mr-2">
                      <img
                        src={AIlogo}
                        alt="RevSpire Logo"
                        className="w-5 h-5 z transition-opacity -opacity-30" // Adjust size and margin as needed
                      />
                    </div>
                    AI
                  </button>
                </li>
              )}

              {/* Audit Log Tab */}
              <li className="me-2" role="pitch">
                <button
                  className={`flex items-center gap-1 p-4 border-b-2 rounded-t-lg ${
                    activeTab === "audit-log"
                      ? "border-sky-800 text-sky-800"
                      : ""
                  }`}
                  id="audit-log"
                  data-tabs-target="#audit-log"
                  type="button"
                  role="tab"
                  aria-controls="audit-log"
                  aria-selected={activeTab === "audit-log"}
                  onClick={() => handleActiveTab("audit-log")}
                >
                  <TbLogs className="w-5 h-5" />
                  Audit Log
                </button>
              </li>

              {/* SSO Tab */}
              {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                checkUserLicense("Revenue Enablement Spark") == "1") && (
                <li className="me-2" role="sso">
                  <button
                    className={`flex items-center p-4 gap-1 border-b-2 rounded-t-lg ${
                      activeTab === "sso" ? "border-sky-800 text-sky-800" : ""
                    }`}
                    id="sso-tab"
                    data-tabs-target="#sso"
                    type="button"
                    role="tab"
                    aria-controls="sso"
                    aria-selected={activeTab === "sso"}
                    onClick={() => handleActiveTab("sso")}
                  >
                    <GrShieldSecurity className="text-lg" />
                    SSO
                  </button>
                </li>
              )}

              {/* OneDrive Tab */}
              <li className="me-2" role="onedrive">
                <button
                  className={`flex items-center gap-1 p-4 border-b-2 rounded-t-lg ${
                    activeTab === "onedrive"
                      ? "border-sky-800 text-sky-800"
                      : ""
                  }`}
                  id="onedrive-tab"
                  data-tabs-target="#onedrive"
                  type="button"
                  role="tab"
                  aria-controls="onedrive"
                  aria-selected={activeTab === "onedrive"}
                  onClick={() => handleActiveTab("onedrive")}
                >
                  <img
                    className="w-[1.9rem] h-  transition-opacity "
                    src={OneDriveLogo}
                    alt=""
                  />
                  OneDrive
                </button>
              </li>

              {/* Salesforce Tab */}
              {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                checkUserLicense("Revenue Enablement Spark") == "1") && (
                <li className="me-2" role="Salesforce">
                  <button
                    className={`p-4 border-b-2 flex items-center gap-1 rounded-t-lg ${
                      activeTab === "Salesforce"
                        ? "border-sky-800 text-sky-800"
                        : ""
                    }`}
                    id="Salesforce"
                    data-tabs-target="#Salesforce"
                    type="button"
                    role="tab"
                    aria-controls="Salesforce"
                    aria-selected={activeTab === "Salesforce"}
                    onClick={() => handleActiveTab("Salesforce")}
                  >
                    {/* <SiSalesforce className="w-4 h-4" /> */}
                    <img
                      className="w-6 h-5  transition-opacity "
                      src={SalesforceLogo}
                      alt=""
                    />
                    Salesforce
                  </button>
                </li>
              )}

              {/* Zoho Tab */}
              {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                checkUserLicense("Revenue Enablement Spark") == "1") && (
                <li className="me-2" role="Zoho">
                  <button
                    className={`p-4 border-b-2 flex items-center gap-1 rounded-t-lg ${
                      activeTab === "Zoho" ? "border-sky-800 text-sky-800" : ""
                    }`}
                    id="Zoho"
                    data-tabs-target="#Zoho"
                    type="button"
                    role="tab"
                    aria-controls="Zoho"
                    aria-selected={activeTab === "Zoho"}
                    onClick={() => handleActiveTab("Zoho")}
                  >
                    <img
                      className="w-6 h-5  transition-opacity "
                      src={ZohoLogo}
                      alt=""
                    />
                    Zoho
                  </button>
                </li>
              )}

              {/* Hubspot Tab */}
              {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                checkUserLicense("Revenue Enablement Spark") == "1") && (
                <li className="me-2" role="HubSpot">
                  <button
                    className={`p-4 border-b-2 flex items-center gap-1 rounded-t-lg ${
                      activeTab === "HubSpot"
                        ? "border-sky-800 text-sky-800"
                        : ""
                    }`}
                    id="HubSpot"
                    data-tabs-target="#HubSpot"
                    type="button"
                    role="tab"
                    aria-controls="HubSpot"
                    aria-selected={activeTab === "HubSpot"}
                    onClick={() => handleActiveTab("HubSpot")}
                  >
                    <img
                      className="w-6 h-5  transition-opacity "
                      src={HubSpotLogo}
                      alt=""
                    />
                    HubSpot
                  </button>
                </li>
              )}

              {/* Pipedrive Tab */}
              {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                checkUserLicense("Revenue Enablement Spark") == "1") && (
                <li className="me-2" role="Pipedrive">
                  <button
                    className={`p-4 border-b-2 flex items-center gap-1 rounded-t-lg ${
                      activeTab === "Pipedrive"
                        ? "border-sky-800 text-sky-800"
                        : ""
                    }`}
                    id="Pipedrive"
                    data-tabs-target="#Pipedrive"
                    type="button"
                    role="tab"
                    aria-controls="Pipedrive"
                    aria-selected={activeTab === "Pipedrive"}
                    onClick={() => handleActiveTab("Pipedrive")}
                  >
                    <img
                      className="w-6 h-5  transition-opacity "
                      src={pipedriveLogo}
                      alt=""
                    />
                    Pipedrive
                  </button>
                </li>
              )}

              {/* Dynamics 365 Tab */}
              {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                checkUserLicense("Revenue Enablement Spark") == "1") && (
                <li className="me-2" role="Dynamics 365">
                  <button
                    className={`p-4 border-b-2 flex items-center gap-1 rounded-t-lg ${
                      activeTab === "Dynamics 365"
                        ? "border-sky-800 text-sky-800"
                        : ""
                    }`}
                    id="Dynamics 365"
                    data-tabs-target="#Dynamics 365"
                    type="button"
                    role="tab"
                    aria-controls="Dynamics 365"
                    aria-selected={activeTab === "Dynamics 365"}
                    onClick={() => handleActiveTab("Dynamics 365")}
                  >
                    <img
                      className="w-6 h-5  transition-opacity "
                      src={Dynamics365}
                      alt=""
                    />
                    Dynamics 365
                  </button>
                </li>
              )}

              {/* Microsoft Clarity Tab */}
              {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                checkUserLicense("Revenue Enablement Spark") == "1") && (
                <li className="me-2" role="Microsoft Clarity">
                  <button
                    className={`p-4 border-b-2 flex items-center gap-1 rounded-t-lg ${
                      activeTab === "Microsoft Clarity"
                        ? "border-sky-800 text-sky-800"
                        : ""
                    }`}
                    id="Microsoft Clarity"
                    data-tabs-target="#MicrosoftClarity"
                    type="button"
                    role="tab"
                    aria-controls="Microsoft Clarity"
                    aria-selected={activeTab === "Microsoft Clarity"}
                    onClick={() => handleActiveTab("Microsoft Clarity")}
                  >
                    <div className="flex items-center mr-2">
                      <img
                        src={microsoftlogo}
                        alt="Microsoft Clarity Logo"
                        className="w-5 h-5 z transition-opacity -opacity-30"
                      />
                    </div>
                    Clarity
                  </button>
                </li>
              )}

              {/* Slack Tab */}
              {(checkUserLicense("Revenue Enablement Elevate") == "1" ||
                checkUserLicense("Revenue Enablement Spark") == "1") && (
                <li className="me-2" role="Slack">
                  <button
                    className={`p-4 border-b-2 flex items-center gap-1 rounded-t-lg ${
                      activeTab === "Slack"
                        ? "border-sky-800 text-sky-800"
                        : ""
                    }`}
                    id="Slack"
                    data-tabs-target="#Slack"
                    type="button"
                    role="tab"
                    aria-controls="Slack"
                    aria-selected={activeTab === "Slack"}
                    onClick={() => handleActiveTab("Slack")}
                  >
                    <div className="flex items-center mr-2">
                      <img
                        src={slacklogo}
                        alt="Slack Logo"
                        className="w-5 h-5 z transition-opacity -opacity-30"
                      />
                    </div>
                    Slack
                  </button>
                </li>
              )}
              
            </ul>
          </div>
        </div>
      </div>
      {activeTab === "general" && <MoreInfoDialog />}
      {activeTab === "pitch" && (
        <div className="bg-white p-6 rounded-md shadow-lg h-full">
          <DSRSetup />
        </div>
      )}
      {activeTab === "sso" && <SsoSettings />}
      {activeTab === "onedrive" && <OnedriveSettings />}
      {activeTab === "Salesforce" && <Salesforce />}
      {activeTab === "audit-log" && <AuditLog />}
      {activeTab === "api-token" && <ApiToken />}
      {activeTab === "ai-data" && <AiData />}
      {activeTab === "storage" && <Storage />}
      {activeTab === "Microsoft Clarity" && <MicrosoftClarity />}
      {activeTab === "Slack" && <SlackIntegration />}
      {activeTab === "Zoho" && <ZohoMain />}
      {activeTab === "HubSpot" && <HubSpotMain />}
      {activeTab === "Pipedrive" && <PipedriveMain />}
      {activeTab === "Dynamics 365" && <DynamicsMain />}
      {activeTab === "email" && <EmailTab />}
    </div>
  );
};

export default AllInfo;

// Email SVG Icon
export function BaselineMailOutline(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 14H4V8l8 5l8-5zm-8-7L4 6h16z"
      ></path>
    </svg>
  );
}