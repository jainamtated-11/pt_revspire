import React, { useState, useEffect, useContext, useRef } from "react";
import useCheckUserLicense from "../../../../Services/checkUserLicense";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleTofu,
  toggleEntityType,
  addLanguage,
  setPrimaryColor,
  setAiLoading,
  setEntityType,
  setEntityDetails,
  setActivePitchCheck,
  setPitchName,
  setPitchLayout,
  setTitle,
  setHeadline,
  setDescription,
  setBackgroundImage,
  setLoginBackgroundImage,
  setClientLogo,
  setSelectedCrm,
} from "../../../../features/pitch/addPitchSlice";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import {
  fetchCrmConnectionsAsync,
  fetchPitchLayoutsAsync,
  generateAIContentAsync,
  fetchOrgColorAsync,
  fetchUserProfile,
  checkActivePitchForCrmRecordAsync,
} from "../../../../features/pitch/addPitchSlice";
import { GlobalContext } from "../../../../context/GlobalState";
import ZohoSquare from "../../../../assets/zoho_square.png";
import HubspotLogo from "../../../../assets/HubSpotLogo.png";
import PipedriveLogo from "../../../../assets/pipedriveLogo.svg";
import Salesforce from "../../../../assets/salesforce_logo.png";
import Dynamics from "../../../../assets/dynamics_365.png";
import logo from "../../../../assets/mini-logo.svg";
import TbPrompt from "../../../../assets/terminal.png";
import MiniLogoLoader1 from "../../../../assets/LoadingAnimation/MiniLogoLoader1";
import Select from "react-select";
import { LuLoaderCircle } from "react-icons/lu";
import toast from "react-hot-toast";
import ColorPicker from "../ColorPicker";
import { FiUploadCloud } from "react-icons/fi";
import WarningDialog from "../../../../utility/WarningDialog";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import ImageCropperModal from "../../../../utility/CustomComponents/ImageCropperModal";

function AddPitchStep1({ errors = {} }) {
  const navigate = useNavigate();
  const axiosInstance = useAxiosInstance();
  const checkUserLicense = useCheckUserLicense();
  const dispatch = useDispatch();
  const pitchState = useSelector((state) => state.addPitchSlice);
  const [isNotSparkLicense, setIsNotSparkLicense] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [entitySearchResult, setEntitySearchResult] = useState([]);
  const [isSearchingEntity, setIsSearchingEntity] = useState(false);
  const [openPromptPopup, setOpenPromptPopup] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [focusArea, setFocusArea] = useState("");
  const { viewer_id, baseURL, setDisableDefaultNavigation, setActiveTab } =
    useContext(GlobalContext);
  const [wssFailedForTokens, setWssFailedForTokens] = useState(false);
  const socketRef = useRef(null);

  const [tokenCookies] = useCookies(["revspireToken"]);

  const token = tokenCookies.revspireToken;

  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  const [cropperType, setCropperType] = useState(""); // "background" or "loginBackground"

  const [isCrmDropdownOpen, setIsCrmDropdownOpen] = useState(false);

  const handleToggleTofu = () => {
    dispatch(toggleTofu());
    // If toggling TOFU ON, clear CRM and entity fields and local search state
    if (!pitchState.isTofu) {
      // isTofu is about to become true
      dispatch(
        setSelectedCrm({ selectedCrmId: "", crmType: "", selectedCrmName: "" })
      );
      dispatch(setEntityDetails({ id: "", name: "" }));
      dispatch(setEntityType("")); // Optional: reset entity type
      setSearchInput("");
      setEntitySearchResult([]);
    }
  };

  useEffect(() => {
    if (!checkUserLicense("Revenue Enablement Spark") == "1") {
      setIsNotSparkLicense(true);
      dispatch(toggleTofu());
    }
  }, []);

  useEffect(() => {
    dispatch(fetchCrmConnectionsAsync({ viewer_id, axiosInstance }));
    dispatch(fetchPitchLayoutsAsync({ axiosInstance, viewer_id }));
    dispatch(fetchOrgColorAsync({ axiosInstance }));
    dispatch(fetchUserProfile({ axiosInstance, viewer_id }));
  }, []);

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: "40px",
      width: "320px", // Set fixed width to match other inputs
      border: "1px solid #e2e8f0",
      borderRadius: "0.375rem",
      boxShadow: "0 0 0 1px #e2e8f0", // Accent glow
      "&:hover": {
        borderColor: "#D5ABAD", // Primary color on hover
      },
      fontSize: "0.870rem", // Match your text-sm
    }),
    container: (base) => ({
      ...base,
      width: "320px", // Ensure container matches control width
    }),
    menu: (base) => ({
      ...base,
      width: "320px", // Make dropdown menu match input width
    }),
    option: (base, state) => ({
      ...base,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      backgroundColor: state.isFocused ? "#f3f4f6" : "white",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
      fontSize: "0.875rem",
    }),
  };

  const NormalDropdownStyles = {
    // Control (main container) styles
    control: (base, { isFocused }) => ({
      ...base,
      minHeight: "40px",
      width: "100%",
      border: "1px solid #e2e8f0",
      borderRadius: "0.375rem",
      boxShadow: isFocused ? "0 0 0 1px #A1C0D5" : "none", // Accent glow
      "&:hover": {
        borderColor: "#D5ABAD", // Primary color on hover
      },
      backgroundColor: "#F8F9FA", // Light background

      fontSize: "0.870rem", // Match your text-sm
    }),

    // Option (individual items) styles
    option: (base, { isSelected, isFocused }) => ({
      ...base,
      backgroundColor: isSelected
        ? "#D5ABAD" // Primary color for selected
        : isFocused
        ? "#f3f4f6"
        : "white",
      color: isSelected ? "white" : "#1F2937", // Dark text
      "&:active": {
        backgroundColor: "#D5ABAD", // Primary color when clicking
      },
      fontSize: "0.875rem", // Match your text-sm
    }),

    multiValue: (base) => ({
      ...base,
      backgroundColor: "#D5ABAD",
      borderRadius: "4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#FFFFFF",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#FFFFFF",
      "&:hover": {
        backgroundColor: "#D5ABAD",
        color: "#FFFFFF",
      },
    }),
  };

  const CustomOption = ({ data, innerProps }) => (
    <div
      {...innerProps}
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
    >
      {console.log("CRM ", data.crmType)}
      <img
        src={
          data.crmType === "salesforce"
            ? Salesforce
            : data.crmType === "zoho"
            ? ZohoSquare
            : data.crmType === "hubspot"
            ? HubspotLogo
            : data.crmType === "pipedrive"
            ? PipedriveLogo
            : data.crmType === "dynamics 365"
            ? Dynamics
            : logo
        }
        alt={data.crmType}
        className="w-5 h-5 object-contain"
      />

      <span>{data.label}</span>
    </div>
  );

  const languageOptions = [
    { value: "en-EN", label: "English" },
    { value: "fr-FR", label: "French" },
    { value: "es-ES", label: "Spanish" },
    { value: "it-IT", label: "Italian" },
    { value: "zh-CN", label: "Mandarin" },
    { value: "ja-JA", label: "Japanese" },
    { value: "de-DE", label: "German" },
    { value: "ru-RU", label: "Russian" },
    { value: "ar-AR", label: "Arabic" },
  ];

    const clearCrmEntitySelection = () => {
      dispatch(setEntityDetails({ id: "", name: "" }));
      dispatch(setActivePitchCheck({ exists: false, pitchId: null }));
      setSearchInput("");
    };

  const handleCrmConnectionChange = async (e) => {
    // setSelectedCrmType(e.crmType);
    setEntitySearchResult([]);
    setSearchInput("");
    setIsSearchingEntity(false);
    dispatch(setEntityDetails({ id: "", name: "" }));
    try {
      let selectedConnection;

      if (e.crmType === "hubspot") {
        // For HubSpot, use only the name for selection
        selectedConnection = pitchState.crmConnections.find(
          (connection) => connection.name === e.value
        );
      } else if (e.crmType === "pipedrive") {
        // For Pipedrive, use only the name for selection
        selectedConnection = pitchState.crmConnections.find(
          (connection) => connection.name === e.value
        );
      } else {
        // For other CRMs, split value to get username and name
        const selectedConnectionUsername = e.value;
        const [selectedCrmUsername, selectedName] = selectedConnectionUsername
          .split(" (")
          .map((value) => value.replace(")", ""));

        selectedConnection = pitchState.crmConnections.find(
          (connection) =>
            connection.crm_username === selectedCrmUsername &&
            connection.name === selectedName
        );
      }

      if (selectedConnection) {
        const selectedCrmId = selectedConnection.id;
        const crmType = e.crmType;
        const selectedCrmName = e.value;
        dispatch(setSelectedCrm({ selectedCrmId, crmType, selectedCrmName }));
        const entity = e.crmType == "salesforce" ? "opportunity" : "deal";
        dispatch(setEntityType(entity));
      } else {
        console.error("Selected connection not found");
      }
    } catch (error) {
      console.error("Error handling CRM connection change:", error);
    }
  };

  const setPitchColor = (color) => {
    console.log("COLROR", color);
    dispatch(setPrimaryColor(color));
  };

  const handleBackgroundImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is webp or gif
    const fileExt = file.name.split(".").pop().toLowerCase();
    if (fileExt === "webp" || fileExt === "gif") {
      // Directly add the file without cropping
      dispatch(setBackgroundImage({ file, name: file.name }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result);
      setCropperType("background");
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleLoginBackgroundImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is webp or gif
    const fileExt = file.name.split(".").pop().toLowerCase();
    if (fileExt === "webp" || fileExt === "gif") {
      // Directly add the file without cropping
      dispatch(setLoginBackgroundImage({ file, name: file.name }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropperImage(reader.result);
      setCropperType("loginBackground");
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleClientLogo = (e) => {
    const file = e.target.files[0];
    dispatch(
      setClientLogo({
        file: file,
        name: file.name,
      })
    );
  };

  useEffect(() => {
    let wsInstance = null;

    // Normalize results from different CRMs to common format
    const normalizeResults = (results, crmType, isAccount) => {
      console.log("results", results)
      if (crmType === "salesforce") {
        return results.searchRecords || [];
      } else if (crmType === "zoho") {
        return results.map((record) => ({
          Id: record.id,
          Name: isAccount ? record.Account_Name : record.Deal_Name,
          EntityType: isAccount ? "account" : "deal",
        }));
      } else if (crmType === "hubspot") {
        return results.map((record) => ({
          Id: record.id,
          Name: isAccount ? record.properties.name : record.properties.dealname,
          EntityType: isAccount ? "company" : "deal",
        }));
      }  else if (crmType === "pipedrive") {
        return results.map((record) => ({
          Id: record.global_id,
          Name: isAccount ? record.name : record.title,
          EntityType: isAccount ? "company" : "deal",
        }));
      } else if (crmType === "dynamics 365") {
        return results.map((record) => ({
          Id: record.opportunityid || record.accountid,
          Name: record.name,
          EntityType: isAccount ? "account" : "opportunities",
        }));
      }
      return [];
    };

    const setupWebSocket = () => {
      // Close existing connection
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }

      if (
        searchInput.length >= 3 &&
        pitchState.selectedConnectionId &&
        !pitchState.entityId
      ) {
        const entityType = pitchState.entityType;
        console.log(`Setting up WebSocket for ${entityType} search`);

        const wsBaseURL = baseURL.replace("https://", "wss://") + "/wss/";
        // Format the protocol header with "token=" prefix
        wsInstance = new WebSocket(`${wsBaseURL}`, [token]);
        socketRef.current = wsInstance;

        wsInstance.onopen = () => {
          console.log(`WebSocket connected for ${entityType} search`);

          const requestPayload = {
            crmConnectionId: pitchState.selectedConnectionId,
            searchTerm: searchInput,
          };

          // Add CRM-specific fields based on entity type
          if (pitchState.crmType === "salesforce") {
            requestPayload.type = "salesforce_search";
            requestPayload.payload = {
              ...requestPayload,
              objectName: entityType == "account" ? "Account" : "Opportunity",
              fieldNames: ["Name", "Description", "Id"],
            };
          } else if (pitchState.crmType === "zoho") {
            requestPayload.type = "zoho_search";
            requestPayload.payload = {
              ...requestPayload,
              moduleName: entityType == "account" ? "Accounts" : "Deals",
            };
          } else if (pitchState.crmType === "hubspot") {
            requestPayload.type = "hubspot_search";
            requestPayload.payload = {
              ...requestPayload,
              objectName: entityType == "company" ? "companies" : "deals",
            };
          } else if (pitchState.crmType === "pipedrive") {
            requestPayload.type = "pipedrive_search";
            requestPayload.payload = {
              ...requestPayload,
              objectName: entityType == "company" ? "companies" : "deals",
            };
          } else if (pitchState.crmType === "dynamics 365") {
            requestPayload.type = "dynamics_search";
            requestPayload.payload = {
              ...requestPayload,
              objectName: entityType == "account" ? "account" : "opportunities",
            };
          }

          wsInstance.send(JSON.stringify(requestPayload));
          setIsSearchingEntity(true);
        };

        wsInstance.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("Data fetched from wss", data);

          if (data.error === "expired access/refresh token") {
            setWssFailedForTokens(true);
            console.log("Received auth Error from webSocket:", data.error);
            return;
          }
          const isAccountMode =
            pitchState.entityType == "account" ||
            pitchState.entityType == "company";
          if (data.status === "success" && data.searchResults) {
            const normalizedRecords = normalizeResults(
              data.searchResults,
              pitchState.crmType,
              isAccountMode
            );
            console.log("Normalised Records", normalizedRecords);
            setEntitySearchResult(normalizedRecords);
          }

          setIsSearchingEntity(false);
        };

        wsInstance.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsSearchingEntity(false);
        };

        wsInstance.onclose = () => {
          console.log("WebSocket disconnected");
          socketRef.current = null;
          setIsSearchingEntity(false);
        };
      }
    };

    // Debounce the WebSocket setup
    const debounceTimeout = setTimeout(setupWebSocket, 300);

    // Cleanup
    return () => {
      clearTimeout(debounceTimeout);
      if (wsInstance) {
        wsInstance.close();
        socketRef.current = null;
      }
    };
  }, [
    searchInput,
    pitchState.selectedConnectionId,
    baseURL,
    pitchState.entityId,
    pitchState.entityType,
    pitchState.crmType,
  ]);

  const handleEntitySelection = (result) => {
    // Immediately dispatch the entity details without waiting
    dispatch(setEntityDetails({ id: result.Id, name: result.Name }));
    setEntitySearchResult([]);

    // Fire-and-forget the check (no await, no error handling needed)
    dispatch(
      checkActivePitchForCrmRecordAsync({
        axiosInstance,
        record_id: result.Id,
      })
    );
  };

  const path = window.location.href;
  const generateAIOpportunityDetails = async () => {
    dispatch(setAiLoading(true));
    try {
      const resultAction = await dispatch(
        generateAIContentAsync({
          axiosInstance,
          viewer_id,
          selectedCrmType: pitchState.crmType,
          isAccountMode:
            pitchState.entityType === "account" ||
            pitchState.entityType === "company",
          entityId: pitchState.entityId,
          focusArea,
          path,
        })
      );

      if (generateAIContentAsync.fulfilled.match(resultAction)) {
        // Success case - no need to do anything extra as reducer handles it
        toast.success("AI content generated successfully!");
      } else {
        throw new Error("Failed to generate AI content");
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast.error(error.message || "Failed to generate AI content");
    } finally {
      setFocusArea("");
      dispatch(setAiLoading(false));
    }
  };

  const ShimmerLoader = (field) => (
    <>
      <div className="flex ml-0 relative overflow-hidden">
        <div className="flex w-full">
          {field == "headline" ? (
            <span className="h-[35px] w-full rounded-lg bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-300 bg-[length:200%_100%] animate-shimmer border border-gray-400"></span>
          ) : field == "title" ? (
            <span className="h-[35px] w-full rounded-lg bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-300 bg-[length:200%_100%] animate-shimmer border border-gray-400"></span>
          ) : (
            <span className="h-[140px] w-full rounded-lg bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-300 bg-[length:200%_100%] animate-shimmer border border-gray-400"></span>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0; /* Start from right */
          }
          100% {
            background-position: -200% 0; /* Move to left */
          }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </>
  );

  const navigateToOrganisation = () => {
    setDisableDefaultNavigation(true);
    navigate("/user/organisation");
    setActiveTab("Salesforce");
    // setDisableDefaultNavigation(false);
  };

  console.log("PITCH STATW", pitchState.images.background);

  // Handle cropped image save
  const handleCroppedImageSave = (blob) => {
    const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
    if (cropperType === "background") {
      dispatch(setBackgroundImage({ file, name: file.name }));
    } else if (cropperType === "loginBackground") {
      dispatch(setLoginBackgroundImage({ file, name: file.name }));
    }
    setShowCropper(false);
    setCropperImage(null);
    setCropperType("");
  };

  if (
    pitchState.userDetailsLoading ||
    pitchState.crmConnectionsLoading ||
    pitchState.layoutsLoading
  ) {
    return (
      <div className="flex h-full w-full justify-center items-center flex-col">
        <LuLoaderCircle className="animate-spin text-gray-500 size-[28px]" />
        <p className="text-gray-500 text-sm font-medium mt-2">Loading..</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 overflow-auto">
      {wssFailedForTokens && (
        <WarningDialog
          title="Warning"
          content="Access tokens for your Service User are Expired, Reconnect Service
              User to keep editing the pitch."
          onCancel={() => setWssFailedForTokens(false)}
          onConfirm={navigateToOrganisation}
          isLoading={false}
        />
      )}

      <div className="w-full p-4 rounded-md bg-white px-10">
        {!isNotSparkLicense && (
          //Toggles
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center">
              <div className="block text-sm font-medium mr-2">
                Top of Funnel Pitch
              </div>
              <label className="flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={pitchState.isTofu}
                  onChange={handleToggleTofu}
                />
                <div className="relative w-11 h-6 bg-gray-200 rounded-full dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 inline-block w-32 text-left">
                {!pitchState.crmType
                  ? "Select CRM First"
                  : pitchState.crmType === "salesforce"
                  ? pitchState.entityType === "account"
                    ? "Account Search"
                    : "Opportunity Search"
                  : pitchState.crmType === "hubspot"
                  ? pitchState.entityType === "company"
                    ? "Company Search"
                    : "Deal Search"
                  : pitchState.crmType === "pipedrive"
                  ? pitchState.entityType === "company"
                    ? "Company Search"
                    : "Deal Search"
                  : pitchState.entityType === "account"
                  ? "Account Search"
                  : "Deal Search"}
              </span>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={
                    pitchState.entityType === "account" ||
                    pitchState.entityType === "company"
                  }
                  onChange={() => {
                    dispatch(toggleEntityType());
                    dispatch(setEntityDetails({ id: "", name: "" }));
                    setSearchInput("");
                  }}
                  disabled={!pitchState.crmType || pitchState.isTofu}
                />
                <div
                  className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${
                    !pitchState.crmType || pitchState.isTofu
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                ></div>
              </label>
            </div>
          </div>
        )}

        {/* CRM Connection Dropdown */}
        {!isNotSparkLicense && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              CRM Connection
            </label>
            <div>
              {pitchState.crmConnectionsLoading ? (
                // Loading state
                <select
                  className={`z-50 w-full border text-gray-900 text-sm rounded-lg p-2.5 ${
                    pitchState.isTofu
                      ? "bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed"
                      : "bg-gray-50 border-gray-400"
                  } dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white`}
                  disabled
                >
                  <option value="Loading">Loading Connections...</option>
                </select>
              ) : (
                <Select
                  options={pitchState.crmConnections.map((connection) => ({
                    value:
                      connection.crm.toLowerCase() === "hubspot" || connection.crm.toLowerCase() === "pipedrive"
                        ? connection.name
                        : `${connection.crm_username} (${connection.name})`,
                    label:
                      connection.crm.toLowerCase() === "hubspot" || connection.crm.toLowerCase() === "pipedrive"
                        ? connection.name
                        : `${
                            connection.crm_username?.length > 35
                              ? connection.crm_username?.substring(0, 40) +
                                "..."
                              : connection.crm_username
                          } (${connection.name})`,
                    crmType: connection.crm.toLowerCase(),
                  }))}
                  styles={{
                    ...customStyles,
                    control: (base) => ({
                      ...base,
                      minHeight: "40px",
                      width: "100%",
                      border: errors.crmConnection
                        ? "1px solid #ef4444"
                        : "1px solid #99A1AF",
                      borderRadius: "0.375rem",
                      boxShadow: "0 0 0 1px #e2e8f0",
                      "&:hover": {
                        borderColor: errors.crmConnection
                          ? "#f87171"
                          : "#D5ABAD",
                      },
                      fontSize: "0.870rem",
                    }),
                    container: (base) => ({
                      ...base,
                      width: "100%",
                    }),
                    menu: (base) => ({
                      ...base,
                      width: "100%",
                    }),
                  }}
                  placeholder="Select Connection"
                  components={{
                    Option: CustomOption,
                  }}
                  value={
                    pitchState.selectedConnectionId
                      ? pitchState.crmConnections
                          .map((connection) => ({
                            value:
                              connection.crm.toLowerCase() === "hubspot" || connection.crm.toLowerCase() === "pipedrive"
                                ? connection.name
                                : `${connection.crm_username} (${connection.name})`,
                            label:
                              connection.crm.toLowerCase() === "hubspot" || connection.crm.toLowerCase() === "pipedrive"
                                ? connection.name
                                : `${
                                    connection.crm_username?.length > 35
                                      ? connection.crm_username?.substring(
                                          0,
                                          40
                                        ) + "..."
                                      : connection.crm_username
                                  } (${connection.name})`,
                            crmType: connection.crm.toLowerCase(),
                          }))
                          .find(
                            (option) =>
                              option.value === pitchState.selectedCrmName &&
                              option.crmType === pitchState.crmType
                          )
                      : null
                  }
                  onChange={(selected) => {
                    handleCrmConnectionChange(selected);
                  }}
                  isDisabled={pitchState.isTofu}
                  onMenuOpen={() => setIsCrmDropdownOpen(true)}
                  onMenuClose={() => setIsCrmDropdownOpen(false)}
                />
              )}
              {errors.crmConnection && !pitchState.isTofu && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.crmConnection}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Entity Search */}
        {!isNotSparkLicense && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {pitchState.entityType == "account" ||
              pitchState.entityType == "company" ? (
                pitchState.crmType === "hubspot" || pitchState.crmType === "pipedrive" ? (
                  <>Company Name</>
                ) : (
                  <>Account Name</>
                )
              ) : pitchState.crmType === "salesforce" ? (
                <>Opportunity Name</>
              ) : (
                <>Deal Name</>
              )}
            </label>

            <div>
              {pitchState.crmConnectionsLoading ? (
                <select
                  id="opportunityDropdown"
                  className={`w-full border text-gray-900 text-sm rounded-lg p-2.5 z-50 ${
                    pitchState.isTofu
                      ? "bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed"
                      : "bg-gray-50 border-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  } dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white`}
                  disabled
                >
                  <option value="Loading">
                    {pitchState.crmType === "salesforce"
                      ? "Loading Opportunities..."
                      : "Loading Deals..."}
                  </option>
                </select>
              ) : (
                <div className="relative w-full">
                  <input
                    type="text"
                    value={
                      pitchState.entityName
                        ? pitchState.entityName
                        : searchInput
                    }
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                    }}
                    placeholder={
                      pitchState.entityType == "account" ||
                      pitchState.entityType == "company"
                        ? "Search accounts..."
                        : pitchState.crmType == "zoho"
                        ? "Search Deals..."
                        : "Search Opportunities..."
                    }
                    disabled={
                      pitchState.selectedConnectionId == "" || pitchState.isTofu
                    }
                    className={`w-full border text-gray-900 text-sm rounded-lg p-2.5 
                      disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400 disabled:cursor-not-allowed
                      bg-gray-50 ${
                        pitchState.activePitchCheck.exists
                          ? "border-red-500 "
                          : "border-gray-400"
                      }`}
                    title={
                      pitchState.isTofu
                        ? "Disabled in Top of Funnel mode"
                        : !pitchState.selectedConnectionId
                        ? "Please select a CRM connection first"
                        : ""
                    }
                  />
                  {/* Clear button when entity is selected */}
                  {pitchState.entityName && (
                    <button
                      onClick={clearCrmEntitySelection}
                      className="absolute right-3 top-3 text-xs text-gray-500 hover:text-primary"
                      disabled={pitchState.isTofu}
                    >
                      Clear
                    </button>
                  )}
                  {/* Only show dropdowns when not in TOF mode */}
                  {!pitchState.isTofu && (
                    <>
                      {/* Combined Search Results Dropdown */}
                      {!isCrmDropdownOpen &&
                        searchInput.length >= 3 &&
                        entitySearchResult.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-400 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {entitySearchResult.map((result) => (
                              <div
                                key={result.Id}
                                onClick={() => handleEntitySelection(result)}
                                className="flex flex-row justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              >
                                {result.Name}
                              </div>
                            ))}
                          </div>
                        )}

                      {/* No Results State */}
                      {!isCrmDropdownOpen &&
                        searchInput.length >= 3 &&
                        !isSearchingEntity &&
                        !pitchState.entityId &&
                        entitySearchResult.length === 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-400 rounded-lg shadow-lg p-4">
                            <div className="text-center text-gray-500">
                              No {pitchState.entityType} found
                            </div>
                          </div>
                        )}

                      {/* Loading Indicator */}
                      {isSearchingEntity && (
                        <div className="absolute right-3 top-3">
                          <LuLoaderCircle className="animate-spin text-primary text-xl" />
                        </div>
                      )}
                    </>
                  )}

                  {errors.entityId && !pitchState.isTofu && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.entityId}
                    </p>
                  )}
                  {pitchState.activePitchCheck?.exists && (
                    <p className="mt-1 text-xs text-red-600">
                      An active pitch already exists for this record.{" "}
                      <a
                        href={`?pitchId=${pitchState.activePitchCheck.pitchId}&routeToPitch=true`}
                        className="text-red-600 font-bold hover:underline"
                      >
                        Open
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pitch Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Pitch Name
          </label>
          <div>
            <input
              value={pitchState.pitchName}
              onChange={(e) => {
                dispatch(setPitchName(e.target.value));
              }}
              type="text"
              className={`w-full border ${
                errors.pitchName ? "border-red-500" : "border-gray-400"
              } text-gray-900 text-sm rounded-lg p-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter the Pitch Name...."
              disabled={pitchState.crmConnectionsLoading}
              title={
                pitchState.crmConnectionsLoading
                  ? "Loading..."
                  : pitchState.pitchName || "Enter the name for your pitch"
              }
            />
            {errors.pitchName && (
              <p className="mt-1 text-xs text-red-600">{errors.pitchName}</p>
            )}
          </div>
        </div>

        {/* Pitch Layout Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Pitch Layout
          </label>
          <div className="w-full">
            {pitchState.layoutsLoading ? (
              <select
                className={`w-full border ${
                  errors.pitchLayout ? "border-red-500" : "border-gray-400"
                } text-gray-900 text-sm rounded-lg p-2.5 bg-gray-50`}
                disabled
              >
                <option>Loading layouts...</option>
              </select>
            ) : (
              <Select
                options={pitchState.layouts.map((layout) => ({
                  value: layout.id,
                  label: layout.name,
                  data: layout,
                }))}
                styles={{
                  ...NormalDropdownStyles,
                  control: (base, { isFocused }) => ({
                    ...base,
                    minHeight: "40px",
                    width: "100%",
                    border: errors.pitchLayout
                      ? "1px solid #ef4444"
                      : "1px solid #99A1AF",
                    borderRadius: "0.375rem",
                    boxShadow: isFocused ? "0 0 0 1px #A1C0D5" : "none",
                    "&:hover": {
                      borderColor: errors.pitchLayout ? "#f87171" : "#D5ABAD",
                    },
                    backgroundColor: "#F8F9FA",
                    fontSize: "0.870rem",
                  }),
                }}
                placeholder="Select a layout..."
                onChange={(selected) => {
                  if (selected) {
                    dispatch(
                      setPitchLayout({
                        id: selected.value,
                        name: selected.label,
                      })
                    );
                  }
                }}
                value={
                  pitchState.pitchLayout.id
                    ? {
                        value: pitchState.pitchLayout.id,
                        label: pitchState.pitchLayout.name,
                      }
                    : null
                }
                isDisabled={pitchState.layoutsLoading}
              />
            )}
            {errors.pitchLayout && (
              <p className="mt-1 text-xs text-red-600">{errors.pitchLayout}</p>
            )}
          </div>
        </div>

        {/* Pitch Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Title
          </label>
          <div className="flex flex-row items-center">
            <div className="flex-grow">
              {pitchState.aiLoading ? (
                <>{ShimmerLoader("title")}</>
              ) : (
                <input
                  value={pitchState.title}
                  onChange={(e) => {
                    dispatch(setTitle(e.target.value));
                  }}
                  type="text"
                  className={`w-full border ${
                    errors.title ? "border-red-500" : "border-gray-400"
                  } text-gray-900 text-sm rounded-lg p-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter the Pitch Title...."
                  title={pitchState.title || "Enter the name for your pitch"}
                />
              )}
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
            </div>
            <div className="flex items-center ml-2 space-x-2">
              <button
                disabled={pitchState.aiLoading}
                className="bg-white p-1 focus:outline-none focus:ring-2 focus:ring-white dark:bg-white dark:focus:ring-white hover:border-white transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-white"
                onClick={() => {
                  generateAIOpportunityDetails();
                }}
              >
                {pitchState.aiLoading ? (
                  <div className="flex items-center h-6 w-6">
                    <MiniLogoLoader1 />
                  </div>
                ) : (
                  <div className="flex items-center">
                    <img
                      src={logo}
                      alt="RevSpire Logo"
                      className="w-6 h-6 transition-opacity -opacity-30"
                    />
                  </div>
                )}
              </button>

              <button
                className="flex text-2xl relative items-center p-1"
                disabled={pitchState.aiLoading}
                onClick={() => setOpenPromptPopup(true)}
              >
                <img
                  src={TbPrompt}
                  alt="Prompt Logo"
                  className="w-7 h-6 transition-opacity -opacity-30"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Headline Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Headline
          </label>
          <div>
            {pitchState.aiLoading ? (
              <>{ShimmerLoader("headline")}</>
            ) : (
              <input
                value={pitchState.headline}
                onChange={(e) => {
                  dispatch(setHeadline(e.target.value));
                }}
                type="text"
                className={`w-full border ${
                  errors.headline ? "border-red-500" : "border-gray-400"
                } text-gray-900 text-sm rounded-lg p-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Pitch Headline..."
                title={pitchState.headline || "Enter the name for your pitch"}
              />
            )}
            {errors.headline && (
              <p className="mt-1 text-xs text-red-600">{errors.headline}</p>
            )}
          </div>
        </div>
      </div>

      <div className="w-ful   p-4 rounded-md bg-white px-10">
        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Description
          </label>
          <div>
            {pitchState.aiLoading ? (
              <>{ShimmerLoader("description")}</>
            ) : (
              <textarea
                value={pitchState.description}
                onChange={(e) => {
                  dispatch(setDescription(e.target.value));
                }}
                type="text"
                className={`w-full border ${
                  errors.description ? "border-red-500" : "border-gray-400"
                } text-gray-900 text-sm h-40 text-start rounded-lg p-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Pitch Description..."
              />
            )}
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {!isNotSparkLicense && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Languages
            </label>
            <div>
              <Select
                isMulti
                options={languageOptions}
                value={pitchState.languages}
                onChange={(selected) => {
                  dispatch(addLanguage(selected || []));
                }}
                styles={{
                  ...NormalDropdownStyles,
                  control: (base, { isFocused }) => ({
                    ...base,
                    minHeight: "40px",
                    width: "100%",
                    border: "1px solid #99A1AF",
                    borderRadius: "0.375rem",
                    boxShadow: isFocused ? "0 0 0 1px #A1C0D5" : "none",
                    "&:hover": {
                      borderColor: "#D5ABAD",
                    },
                    backgroundColor: "#F8F9FA",
                    fontSize: "0.870rem",
                  }),
                  container: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                  menu: (base) => ({
                    ...base,
                    width: "100%",
                  }),
                }}
                classNamePrefix="select"
                placeholder="Select languages..."
              />
            </div>
          </div>
        )}

        {/* Primary Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Primary Color
          </label>
          <div className="flex flex-row items-center">
            {/* Color Circle with Pencil Icon */}
            <div
              className={`relative w-9 h-9 mr-2 rounded-full cursor-pointer border-2 ${
                pitchState.orgColorLoading
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
              style={{
                backgroundColor: `#${
                  pitchState.primaryColor
                    ? pitchState.primaryColor
                    : pitchState.orgColor
                }`,
              }}
              onClick={() => {
                if (!pitchState.orgColorLoading) setIsColorPickerOpen(true);
              }}
            >
              {/* Pencil Icon */}
              <div className="absolute bottom-[-6px] right-[-6px] bg-white rounded-full p-0.5 shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536M4 20h4l10.293-10.293a1 1 0 000-1.414l-2.586-2.586a1 1 0 00-1.414 0L4 16v4z"
                  />
                </svg>
              </div>
            </div>

            {/* Hex Color Text */}
            <p className="flex items-center">
              #
              {pitchState.primaryColor
                ? pitchState.primaryColor
                : pitchState.orgColor}
            </p>

            {/* Color Picker Component */}
            <ColorPicker
              isOpen={isColorPickerOpen}
              setIsOpen={setIsColorPickerOpen}
              updateType="redux"
              setColor={setPitchColor}
              currentColor={
                pitchState.primaryColor
                  ? pitchState.primaryColor
                  : pitchState.orgColor
              }
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Background
          </label>
          <div className="w-full">
            <input
              id="backgroundImage"
              onChange={handleBackgroundImage}
              type="file"
              accept="image/*,.svg"
              className="hidden"
            />
            <label
              htmlFor="backgroundImage"
              className={`flex items-center justify-between w-full h-10 bg-white border ${
                errors.backgroundImage ? "border-red-500" : "border-gray-400"
              } text-gray-700 text-sm rounded-lg px-3 shadow-sm hover:shadow-md transition cursor-pointer`}
            >
              <span
                className={`truncate text-gray-400 ${
                  pitchState.images.background.file
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {pitchState.images.background.file
                  ? pitchState.images.background.name
                  : "Choose a Background Image"}
              </span>
              <FiUploadCloud className="text-gray-400 text-xl" />
            </label>
            {errors.backgroundImage && (
              <p className="mt-1 text-xs text-red-600">
                {errors.backgroundImage}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Login Background
          </label>
          <div className="w-full">
            <input
              id="loginBackgroundImage"
              onChange={handleLoginBackgroundImage}
              type="file"
              accept="image/*,.svg"
              className="hidden"
            />
            <label
              htmlFor="loginBackgroundImage"
              className={`flex items-center justify-between w-full h-10 bg-white border ${
                errors.loginBackground ? "border-red-500" : "border-gray-400"
              } text-gray-700 text-sm rounded-lg px-3 shadow-sm hover:shadow-md transition cursor-pointer`}
            >
              <span
                className={`truncate text-gray-400 ${
                  pitchState.images.loginBackground.file
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {pitchState.images.loginBackground.file
                  ? pitchState.images.loginBackground.name
                  : "Choose a Login Background Image"}
              </span>
              <FiUploadCloud className="text-gray-400 text-xl" />
            </label>
            {errors.loginBackground && (
              <p className="mt-1 text-xs text-red-600">
                {errors.loginBackground}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6 pb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Client Logo
          </label>
          <div className="w-full">
            <input
              id="clientLogo"
              onChange={handleClientLogo}
              type="file"
              accept="image/*,.svg"
              className="hidden"
            />
            <label
              htmlFor="clientLogo"
              className="flex items-center justify-between w-full h-10 bg-white border border-gray-400 text-gray-700 text-sm rounded-lg px-3 shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <span
                className={`truncate text-gray-400 ${
                  pitchState.images.clientLogo.file
                    ? "text-gray-700"
                    : "text-gray-400"
                }`}
              >
                {pitchState.images.clientLogo.file
                  ? pitchState.images.clientLogo.name
                  : "Choose a Client Logo"}
              </span>
              <FiUploadCloud className="text-gray-400 text-xl" />
            </label>
          </div>
        </div>
      </div>

      {openPromptPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 border border-gray-200">
            {/* Header */}
            <div className="px-6 py-3 border-b">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-[#014D83]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                AI Prompt Generator
              </h2>
            </div>

            {/* Textarea */}
            <div className="px-3 py-2">
              <textarea
                className="w-full h-48 p-4 text-gray-700 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#014D83] focus:border-transparent transition-all"
                value={focusArea}
                placeholder="Describe what you want the AI to focus on..."
                onChange={(e) => setFocusArea(e.target.value)}
              />
            </div>

            {/* Footer */}
            <div className="px-6 pb-2 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setOpenPromptPopup(false)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  generateAIOpportunityDetails();
                  setOpenPromptPopup(false);
                }}
                disabled={!focusArea.trim() || pitchState.aiLoading}
                className="ml-4 px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
      {console.log("Cropper cropperType", cropperType)}
      <ImageCropperModal
        open={showCropper}
        image={cropperImage}
        aspect={cropperType === "background" ? 4 / 1 : 16 / 9}
        onClose={() => setShowCropper(false)}
        onSave={handleCroppedImageSave}
      />
    </div>
  );
}

export default AddPitchStep1;
