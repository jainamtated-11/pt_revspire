import React, { useState, useEffect, useContext } from "react";
import useCheckUserLicense from "../../../../Services/checkUserLicense";
import { useSelector, useDispatch } from "react-redux";
import {
  addLanguage,
  setPrimaryColor,
  setAiLoading,
  setPitchName,
  setPitchLayout,
  setTitle,
  setHeadline,
  setDescription,
  setBackgroundImage,
  setLoginBackgroundImage,
  setClientLogo,
  toggleImageEditing,
  toggleEntityModal,
  toggleTofu,
} from "../../../../features/pitch/editPitchSlice";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { generateAIContentAsync } from "../../../../features/pitch/editPitchSlice";
import { GlobalContext } from "../../../../context/GlobalState";
import logo from "../../../../assets/mini-logo.svg";
import TbPrompt from "../../../../assets/terminal.png";
import MiniLogoLoader1 from "../../../../assets/LoadingAnimation/MiniLogoLoader1";
import Select from "react-select";
import toast from "react-hot-toast";
import ColorPicker from "../ColorPicker";
import { FiUploadCloud } from "react-icons/fi";
import { useCookies } from "react-cookie";
import { MdEdit } from "react-icons/md";
import EditEntityModal from "./EditEntityModal";
import ImageCropperModal from "../../../../utility/CustomComponents/ImageCropperModal";
import { LuLoaderCircle } from "react-icons/lu";

function EditPitchStep1({ errors = {} }) {
  const axiosInstance = useAxiosInstance();
  const checkUserLicense = useCheckUserLicense();
  const dispatch = useDispatch();
  const pitchState = useSelector((state) => state.editPitchSlice);
  const [isNotSparkLicense, setIsNotSparkLicense] = useState(false);
  const [openPromptPopup, setOpenPromptPopup] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [focusArea, setFocusArea] = useState("");
  const { viewer_id } = useContext(GlobalContext);
  const path = window.location.href;
  const cookies = useCookies("userData");
  const organisation_id = cookies.userData?.organisation?.id;
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  const [cropperType, setCropperType] = useState(""); // "background" or "loginBackground"

  useEffect(() => {
    if (!checkUserLicense("Revenue Enablement Spark") == "1") {
      setIsNotSparkLicense(true);
    }
  }, []);

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

  const setPitchColor = (color) => {
    dispatch(setPrimaryColor(color));
  };

  console.log("entity", pitchState?.crmType);

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

  const generateAIOpportunityDetails = async () => {
    dispatch(setAiLoading(true));
    try {
      await dispatch(
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
      ).unwrap();

      // If you need to do something with the response:
      // handleAIResponse(pitchState.aiContent);
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast.error("Failed to generate AI content");
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
  const getEntityLabel = (crmType, isAccountMode) => {
    if (crmType === "salesforce") {
      return isAccountMode ? "Account Name" : "Opportunity Name";
    } else if (crmType === "hubspot") {
      return isAccountMode ? "Company Name" : "Deal Name";
    } else if (crmType === "pipedrive") {
      return isAccountMode ? "Company Name" : "Deal Name";
    } else if (crmType === "zoho") {
      return isAccountMode ? "Account Name" : "Deal Name";
    } else if (crmType === "dynamics 365") {
      return isAccountMode ? "Account Name" : "Opportunity Name";
    } else {
      return "Record Name"; // fallback
    }
  };

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

  if (pitchState.pitchDataLoading || pitchState.layoutsLoading) {
    return (
      <div className="flex h-full w-full justify-center items-center flex-col">
        <LuLoaderCircle className="animate-spin text-gray-500 size-[28px]" />
        <p className="text-gray-500 text-sm font-medium mt-2">Loading..</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full flex flex-col  gap-6 overflow-auto">
        <div className="w-full p-4 rounded-md bg-white px-10">
          {!isNotSparkLicense && (
            //Toggles
            <div className="flex flex-row gap-3">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex items-center">
                  <div className="block text-sm font-medium mr-2">
                    Top of Funnel Pitch
                  </div>
                  <label className="flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={pitchState?.isTofu}
                      onChange={() => {
                        dispatch(toggleTofu());
                      }}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary transition-colors duration-200 ease-in-out">
                      <div
                        className={`absolute top-0.5 start-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all duration-200 ease-in-out transform ${
                          pitchState?.isTofu ? "translate-x-full" : ""
                        }`}
                      ></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {pitchState.entityModalOpen && <EditEntityModal />}

          {/* Entity Input */}
          {!pitchState.isTofu ? (
            <div className="mb-6">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => {
                  dispatch(toggleEntityModal(true));
                }}
              >
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {getEntityLabel(pitchState.crmType, pitchState.isAccountMode)}
                </label>
                <div className="flex flex-row text-xs items-center font-medium gap-1 mr-1">
                  <MdEdit className="text-sky-800 text-base" />
                  Edit
                </div>
              </div>
              <div>
                <input
                  value={pitchState.entityName}
                  disabled={true}
                  type="text"
                  className={`w-full border ${
                    pitchState.entityNameLoading
                      ? "border-gray-500 bg-gray-100"
                      : "border-gray-400 bg-gray-50"
                  } text-gray-900 text-sm rounded-lg p-2.5  focus:ring-blue-500 focus:border-blue-500`}
                  placeholder={
                    pitchState.entityFetchingFailed && !pitchState.entityName
                      ? "Record not Found"
                      : "Loading Entity..."
                  }
                  title={
                    pitchState.entityFetchingFailed && !pitchState.entityName
                      ? "Record not Found"
                      : pitchState.entityName || "Loading Entity..."
                  }
                />
              </div>
            </div>
          ) : (
            <></>
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
                <p className="mt-1 text-xs text-red-600">
                  {errors.pitchLayout}
                </p>
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
                <p className="mt-1 text-xs text-red-600">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="w-ful p-4 rounded-md bg-white px-10">
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
                className="relative w-9 h-9 mr-2 rounded-full cursor-pointer border-2"
                style={{
                  backgroundColor: `#${
                    pitchState.primaryColor
                      ? pitchState.primaryColor
                      : pitchState.orgColor
                  }`,
                }}
                onClick={() => setIsColorPickerOpen(true)}
              >
                {/* Pencil Icon positioned in the bottom-right */}
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

              {/* Color Hex Value */}
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

          <div className="flex items-center flex-row space-x-2 mb-6 gap-6">
            <label className="text-sm font-medium">
              Edit Background and Client Logo
            </label>
            <input
              type="checkbox"
              checked={pitchState.isEditingImages}
              onChange={() => {
                dispatch(toggleImageEditing(!pitchState.isEditingImages));
              }}
              className="w-5 h-5 rounded-md border-2 border-gray-300 checked:bg-cyan-700 checked:border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2 transition-all duration-200 ease-in-out appearance-none cursor-pointer"
            />
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
                disabled={!pitchState.isEditingImages}
              />
              <label
                htmlFor="backgroundImage"
                className={`flex items-center justify-between w-full h-10  ${
                  errors.backgroundImage ? "border-red-500" : "border-gray-400"
                } text-gray-700 text-sm rounded-lg px-3 shadow-sm hover:shadow-md transition  ${
                  !pitchState.isEditingImages
                    ? "bg-gray-200 border cursor-not-allowed"
                    : "bg-white border cursor-pointer"
                }`}
              >
                <span
                  className={`truncate text-gray-400 ${
                    pitchState.images.background.name
                      ? "text-gray-700"
                      : "text-gray-400"
                  }`}
                >
                  {pitchState.images.background.name
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
                disabled={!pitchState.isEditingImages}
              />
              <label
                htmlFor="loginBackgroundImage"
                className={`flex items-center justify-between w-full h-10  ${
                  errors.loginBackground ? "border-red-500" : "border-gray-400"
                } text-gray-700 text-sm rounded-lg px-3 shadow-sm hover:shadow-md transition  ${
                  !pitchState.isEditingImages
                    ? "bg-gray-200 border cursor-not-allowed"
                    : "bg-white border cursor-pointer"
                }`}
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
                disabled={!pitchState.isEditingImages}
              />
              <label
                htmlFor="clientLogo"
                className={`flex items-center justify-between w-full h-10 border border-gray-400 text-gray-700 text-sm rounded-lg px-3 shadow-sm hover:shadow-md transition ${
                  !pitchState.isEditingImages
                    ? "bg-gray-200 border cursor-not-allowed"
                    : "bg-white border cursor-pointer"
                }`}
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
      </div>

      <ImageCropperModal
        open={showCropper}
        image={cropperImage}
        aspect={cropperType === "background" ? 4 / 1 : 16 / 9}
        onClose={() => setShowCropper(false)}
        onSave={handleCroppedImageSave}
      />
    </>
  );
}

export default EditPitchStep1;
