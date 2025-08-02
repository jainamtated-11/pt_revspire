import React, { useState, useRef, useEffect } from "react";
import { LuLoaderCircle } from "react-icons/lu";
import MiniLogin from "./MiniLogin"; // Import MiniLogin component
import useAxiosInstance from "../../../Services/useAxiosInstance";
import toast from "react-hot-toast";
import { useCookies } from "react-cookie";
import * as CompanyEmailValidator from "company-email-validator";
import { useNavigate } from "react-router-dom";

const LoginForm = ({
  step: initialStep = 1,
  orgHex,
  uiStrings,
  onBack: handleParentBack,
  isDomainLogin, // Add a flag for domain-specific logic
  companyLogo, // Pass company logo as a prop
  clientImageUrl,
  pitchDomains,
  baseURL,
  pitchData,
  pitchLoginfields, // Add pitchLoginfields prop
}) => {

  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies([
    "baseURL",
    "revspireToken",
  ]);
  const [publicAccessCookieRevspireToken, setPublicAccessRevspireToken] =
    useCookies(["revspireToken"]);
  const getQueryParam = (name, url = window.location.href) => {
    const params = new URLSearchParams(url.split("?")[1]);
    return params.get(name);
  };
  const axiosInstance = useAxiosInstance();
  // State for form fields
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [privacyPolicySelected, setPrivacyPolicySelected] = useState(false);

  // State for OTP
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [isOtpValid, setIsOtpValid] = useState(false); // Add isOtpValid state
  const inputRefs = useRef([]);

  // State for loading and errors
  const [checkUserEmailLoading, setCheckUserEmailLoading] = useState(false);
  const [verifyOtpLoding, setVerifyOtpLoding] = useState(false);
  const [isOTPerror, setOTPerrror] = useState(false);

  // State for internal user and mini login
  const [internalUser, setInternalUser] = useState(false);
  const [miniLogin, setMiniLogin] = useState(false);

  // Step management
  const [step, setStep] = useState(initialStep);

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const isFormValid = () => {
    // Check if all required fields are filled
    const requiredFields = pitchLoginfields.filter(
      (field) => field.field_type_name !== "checkbox"
    );
    const allFieldsFilled = requiredFields.every((field) => {
      const value = formValues[field.name.toLowerCase().replace(/\s+/g, "_")];
      return value && value.trim() !== "";
    });

    // Check email validation for email type fields
    const emailFields = pitchLoginfields.filter(
      (field) =>
        field.field_type_description === "Email input field with validation"
    );
    const emailValid = emailFields.every((field) => {
      const value = formValues[field.name.toLowerCase().replace(/\s+/g, "_")];
      return isValidEmail(value);
    });

    // Privacy policy must be checked
    const privacyPolicyAccepted = privacyPolicySelected;

    return allFieldsFilled && emailValid && privacyPolicyAccepted;
  };

  // OTP validation
  useEffect(() => {
    const allOtpFieldsFilled = otp.every((digit) => digit !== "");
    setIsOtpValid(allOtpFieldsFilled);
  }, [otp]);

  // OTP handlers
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (event.key === "ArrowRight" && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Back handler
  const handleBack = () => {
    setStep(1);
    setOtp(new Array(4).fill(""));
    if (handleParentBack) handleParentBack(); // Call parent handler if provided
  };

  // Handle mini login
  const handleGoToMiniLogin = () => {
    setMiniLogin(true);
  };

  const checkUserEmail = async () => {
    setCheckUserEmailLoading(true);

    try {
      // Find the email field
      const emailField = pitchLoginfields.find(
        (field) =>
          field.field_type_description === "Email input field with validation"
      );
      if (!emailField) {
        toast.error("Email field not found");
        setCheckUserEmailLoading(false);
        return;
      }

      const emailValue =
        formValues[emailField.name.toLowerCase().replace(/\s+/g, "_")];

      // Check if business email is required and validate
      if (
        pitchData?.pitch?.business_email_only &&
        !CompanyEmailValidator.isCompanyEmail(emailValue)
      ) {
        toast.error("Please use a business email address");
        setCheckUserEmailLoading(false);
        return;
      }

      // Check domain if isDomainLogin is true
      if (isDomainLogin) {
        // Extract the domain from the email
        const domain = emailValue.split("@")[1];
        // Add '@' to the extracted domain so it matches the format in allowedDomains
        const fullDomain = `@${domain}`;
        // Check if the domain exists in pitchDomains
        const domainExists = pitchDomains.some(
          (pitchDomain) => pitchDomain.domain === fullDomain
        );

        if (!domainExists) {
          // Show error toast and return
          toast.error("Domain not allowed");
          setCheckUserEmailLoading(false);
          return; // Exit the function early
        }
      }

      // Rest of the function remains the same...
      const response = await axiosInstance.post(`${baseURL}/check-user-type`, {
        username: emailValue, // Using the email field value
      });

      // Handle the response based on userType
      if (response.data.userType === "Internal user") {
        setInternalUser(true);
      } else if (response.data.userType === "Client") {
        sendOTP();
      }

    } catch (error) {
      console.error("Error checking user email:", error);
      toast.error("An error occurred while checking user email");
    } finally {
      setCheckUserEmailLoading(false);
    }
  };

  const sendOTP = async () => {
    // Find the email field with otp_field = 1
    const otpEmailField = pitchLoginfields.find(
      (field) => field.field_type_name === "email" && field.otp_field === 1
    );

    if (!otpEmailField) {
      toast.error("OTP email field not found");
      return;
    }

    const emailValue =
      formValues[otpEmailField.name.toLowerCase().replace(/\s+/g, "_")];

    if (pitchData.pitch.disable_otp) {
      try {
        const response = await axiosInstance.post(
          `${baseURL}/verify-login-otp`,
          {
            username: emailValue,
            pitch_id: pitchData.pitch.id,
          }
        );
        if (response.status === 200) {

          setCookie("revspireToken", response.data.access_token, {
            path: "/",
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
          });

          setCookie("revspireLicense", JSON.stringify(response.data.userLicenseInfoArray), {
            path: "/",
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60,
          });

          handleContinue();
        }
      } catch (error) {
        setOTPerrror(true);
      }
    } else {
      try {
        const response = await axiosInstance.post(
          `${baseURL}/generate-public-or-domain-login-otp`,
          {
            email: emailValue,
            pitch_id: pitchData.pitch.id,
          }
        );

        if (response.status === 200) {
          toast.success(`OTP sent to ${emailValue}`);
          setStep(2);
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast.error("Failed to send OTP");
      }
    }
  };

  const fetchIPAddress = async () => {
    try {
      const response = await fetch("https://ipinfo.io/json");
      const data = await response.json();
      return data.ip; // Return the IP address
    } catch (error) {
      console.error("Error fetching IP address:", error);
      return "Unknown"; // Fallback in case of an error
    }
  };

  const handleContinue = async () => {
    // Find the email field
    const emailField = pitchLoginfields.find(
      (field) =>
        field.field_type_description === "Email input field with validation"
    );
    if (!emailField) {
      toast.error("Email field not found");
      return;
    }

    const emailValue =
      formValues[emailField.name.toLowerCase().replace(/\s+/g, "_")];

    // Check if email is company or personal using CompanyEmailValidator
    const isCompanyMail = CompanyEmailValidator.isCompanyEmail(emailValue)
      ? 1
      : 0;

    // Get browser and user details
    const userAgent = navigator.userAgent;
    const browserName =
      navigator.userAgentData?.brands?.[0]?.brand || "Unknown";
    const browserVersion =
      navigator.userAgentData?.brands?.[0]?.version || "Unknown";
    const deviceType = /Mobi|Android/i.test(userAgent) ? "Mobile" : "Desktop";

    // Fetch the IP address
    const ipAddress = await fetchIPAddress();

    // Format the form values before storing in cookie
    const formattedValues = {};
    for (const [fieldName, value] of Object.entries(formValues)) {
      // Find the corresponding field definition
      const field = pitchLoginfields.find(
        (f) => f.name.toLowerCase().replace(/\s+/g, "_") === fieldName
      );

      if (field && value) {
        switch (field.field_type_name) {
          case "datetime":
            // Convert to YYYY-MM-DD HH:MM:SS format
            formattedValues[fieldName] = new Date(value)
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
            break;
          case "date":
            // Keep date as YYYY-MM-DD
            formattedValues[fieldName] = value;
            break;
          default:
            formattedValues[fieldName] = value;
        }
      } else {
        formattedValues[fieldName] = value;
      }
    }

    // Store contact info and browser details in cookie with formatted values
    setCookie(
      "publicPitchContact",
      JSON.stringify({
        ...formattedValues,
        isCompanyMail,
        privacyPolicy: {
          accepted: true,
          acceptedAt: new Date().toISOString(),
        },
        browserInfo: {
          browserName,
          browserVersion,
          userAgent,
          deviceType,
          ipAddress,
        },
      }),
      {
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 2 hours
        secure: true,
        sameSite: "None",
      }
    );

    const apiURL = encodeURIComponent(getQueryParam("apiURL"));
    navigate(`/dsr/${pitchData.pitch.id}?apiURL=${apiURL}`);
  };

  const verifyOTP = async () => {
    try {
      setVerifyOtpLoding(true);
      const enteredOtp = otp.join("");

      // Find the email field
      const emailField = pitchLoginfields.find(
        (field) =>
          field.field_type_description === "Email input field with validation"
      );
      if (!emailField) {
        toast.error("Email field not found");
        setVerifyOtpLoding(false);
        return;
      }

      const emailValue =
        formValues[emailField.name.toLowerCase().replace(/\s+/g, "_")];

      const response = await axiosInstance.post(`${baseURL}/verify-login-otp`, {
        username: emailValue,
        otp: enteredOtp,
        pitch_id: pitchData?.pitch?.id,
        viewer_id: pitchData?.pitch?.owner,
        organisation_id: pitchData?.userDetails[0]?.organisation
      });

      if (response.status === 200) {

        setCookie("revspireToken", response.data.access_token, {
          path: "/",
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60,
        });

        setCookie("revspireLicense", JSON.stringify(response.data.userLicenseInfoArray), {
          path: "/",
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60,
        });

        setVerifyOtpLoding(false);
        handleContinue();
      }
    } catch (error) {
      setVerifyOtpLoding(false);
      setOTPerrror(true);
    }
  };

  // Render Step 1 (Form)
  const renderStep1 = () => {
    // Sort fields by order
    const sortedFields = [...pitchLoginfields].sort(
      (a, b) => a.order - b.order
    );

    // Group fields into rows based on share_width
    const rows = [];
    let currentRow = [];

    sortedFields.forEach((field) => {
      if (field.field_type_share_width === 0) {
        // If current row has fields, add it to rows
        if (currentRow.length > 0) {
          rows.push([...currentRow]);
          currentRow = [];
        }
        // Add full-width field as its own row
        rows.push([field]);
      } else {
        currentRow.push(field);
        if (currentRow.length === 2) {
          rows.push([...currentRow]);
          currentRow = [];
        }
      }
    });

    // Add any remaining fields
    if (currentRow.length > 0) {
      rows.push([...currentRow]);
    }

    return (
      <form className="flex flex-col h-full">
        <div className="flex flex-col gap-2 mt-2 flex-grow">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((field) => {
                const fieldName = field.name.toLowerCase().replace(/\s+/g, "_");
                const fieldValue = formValues[fieldName] || "";
                const isEmailField =
                  field.field_type_description ===
                  "Email input field with validation";
                const isCheckbox = field.field_type_name === "checkbox";
                const isPicklist = field.field_type_name === "picklist";
                const picklistOptions = isPicklist
                  ? field.picklist_value.split(";")
                  : [];

                return (
                  <div
                    key={field.id}
                    className={`${
                      field.field_type_share_width === 0 ? "w-full" : "w-1/2"
                    }`}
                  >
                    {isCheckbox ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          id={fieldName}
                          checked={fieldValue}
                          onChange={(e) =>
                            setFormValues((prev) => ({
                              ...prev,
                              [fieldName]: e.target.checked,
                            }))
                          }
                          className="w-3 h-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label
                          htmlFor={fieldName}
                          className="text-xs font-medium text-gray-700"
                        >
                          {field.name}
                        </label>
                      </div>
                    ) : isPicklist ? (
                      <div className="flex flex-col gap-0.5">
                        <label className="text-xs font-medium text-gray-700">
                          {field.name}
                        </label>
                        <select
                          value={fieldValue}
                          onChange={(e) =>
                            setFormValues((prev) => ({
                              ...prev,
                              [fieldName]: e.target.value,
                            }))
                          }
                          className="font-[Montserrat] w-full px-2 py-1.5 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">{field.name}</option>
                          {picklistOptions.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <label className="text-xs font-medium text-gray-700">
                            {field.name}
                          </label>
                          {pitchData.pitch.disable_otp == 0 &&
                            isEmailField &&
                            field.otp_field === 1 && (
                              <span
                                className="text-xs"
                                style={{ color: orgHex }}
                              >
                                (OTP)
                              </span>
                            )}
                        </div>
                        <input
                          type={
                            field.field_type_name === "email"
                              ? "email"
                              : field.field_type_name === "number"
                              ? "number"
                              : field.field_type_name === "date"
                              ? "date"
                              : field.field_type_name === "datetime"
                              ? "datetime-local"
                              : "text"
                          }
                          placeholder={`Enter ${field.name}`}
                          value={fieldValue}
                          onChange={(e) =>
                            setFormValues((prev) => ({
                              ...prev,
                              [fieldName]: e.target.value,
                            }))
                          }
                          className={`font-[Montserrat] w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                            isEmailField &&
                            fieldValue &&
                            !isValidEmail(fieldValue)
                              ? "border-red-500"
                              : "border-neutral-300"
                          }`}
                        />
                        {isEmailField &&
                          fieldValue &&
                          !isValidEmail(fieldValue) && (
                            <p className="text-red-500 text-xs mt-0.5">
                              {uiStrings.pleaseEnterValidEmail}
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Privacy Policy and Continue Button */}
          <div className="mt-2 border-t border-neutral-200 pt-2">
            <div className="flex justify-start gap-1 items-start mb-2">
              <input
                type="checkbox"
                className="w-3 h-3 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-0.5"
                checked={privacyPolicySelected}
                onChange={() =>
                  setPrivacyPolicySelected(!privacyPolicySelected)
                }
              />
              <p className="font-[Montserrat] text-xs text-neutral-700">
                {uiStrings.privacyText}
                <a
                  href={pitchData.orgDetails?.[0].privacy_policy}
                  target="_blank"
                  style={{ color: orgHex }}
                  className="font-semibold hover:underline ml-0.5"
                >
                  {uiStrings.privacyPolicy}
                </a>
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid() || checkUserEmailLoading}
                onClick={(e) => {
                  e.preventDefault();
                  checkUserEmail();
                }}
                style={{ backgroundColor: isFormValid() ? orgHex : undefined }}
                className={`px-3  text-xs rounded-lg text-white font-medium transition-all duration-300 w-[100px] py-2 ${
                  isFormValid()
                    ? "hover:scale-105 active:scale-95 hover:shadow-lg"
                    : "disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-400"
                }`}
                title={!isFormValid() ? uiStrings.fillAllFields : ""}
              >
                {checkUserEmailLoading ? (
                  <LuLoaderCircle className="animate-spin h-3 w-3 inline" />
                ) : (
                  uiStrings.continue
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  };

  // Render Step 2 (OTP)
  const renderStep2 = () => (
    <div className="flex flex-col items-center justify-between h-full">
      <div className="flex flex-col items-center justify-center mt-10 space-y-6 px-4 md:px-6">
        <h2 className="text-lg font-semibold text-gray-800">{uiStrings.otp}</h2>
        <p className="text-sm text-gray-600">
          {isOTPerror ? uiStrings.InvalideOTP : uiStrings.enterOtp}
        </p>
        <div className="flex space-x-2 justify-center">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              inputMode="numeric"
              pattern="[0-9]*"
              className="size-10 text-center border border-neutral-300 rounded-lg shadow focus:outline-none text-neutral-700"
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between w-full mt-10">
        <button
          className="flex border hover:scale-105 transition-all duration-300 ease-in-out transform hover:shadow-lg border-neutral-300 hover:border-neutral-400 py-1 w-[87px] px-4 bg-gradient-to-b from-neutral-100 to-neutral-200 rounded-lg font-medium items-center gap-2 text-neutral-800 justify-center active:scale-95 disabled:opacity-90"
          onClick={handleBack}
        >
          {uiStrings.back}
        </button>
        <button
          disabled={!isOtpValid || verifyOtpLoding}
          style={{ backgroundColor: isOtpValid ? orgHex : undefined }}
          className={`font-[Montserrat] w-28  active:scale-95 transition-all duration-300 ease-in-out transform hover:shadow-lg border px-3 rounded-lg py-2 text-neutral-100 ${
            !isOtpValid
              ? "disabled:opacity-50 disabled:cursor-not-allowed bg-neutral-400"
              : ""
          }`}
          onClick={verifyOTP}
        >
          {verifyOtpLoding ? (
            <LuLoaderCircle className="animate-spin h-5 w-5 inline" />
          ) : (
            <p className="font-[Montserrat]">{uiStrings.submit}</p>
          )}
        </button>
      </div>
    </div>
  );

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      default:
        return null;
    }
  };

  // Add this modal component
  const UserAlertModal = ({ isOpen, onContinue, onGoToLogin }) => {
    // if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl relative">
          {/* Close Button */}
          <button
            onClick={() => setInternalUser(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>

          {/* Title */}
          <h3 className="text-xl font-semibold mb-4">
            {uiStrings.InternalUserDetected}
          </h3>

          {/* Warning Message */}
          <p className="text-gray-600 mb-6">{uiStrings.InternalUserWarning}</p>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onContinue}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {uiStrings.continue}
            </button>
            <button
              onClick={onGoToLogin}
              style={{ backgroundColor: orgHex }}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              {uiStrings.Login}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center bg-white max-w-[450px] w-[calc(100%-32px)] mx-4 sm:mx-auto p-4 rounded-xl border border-neutral-200 shadow-lg">
      {" "}
      {miniLogin && (
        <MiniLogin
          onClose={() => {
            // setInternalUser(false);
            setMiniLogin(false);
          }}
        />
      )}
      {internalUser && (
        <UserAlertModal
          onContinue={() => {
            setInternalUser(false);
            sendOTP();
          }}
          onGoToLogin={handleGoToMiniLogin}
        />
      )}
      <div className="flex flex-col w-full items-stretch px-1">
        <img
          src={clientImageUrl || companyLogo}
          alt="Company Logo"
          className="mx-auto mb-4 h-10 w-auto"
        />

        <div className="font-[Montserrat] text-2xl sm:text-3xl mt-2 text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-neutral-600 to-neutral-800">
          {uiStrings.welcomeTitle}
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default LoginForm;
