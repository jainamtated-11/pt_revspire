import React, { useState, useContext, useRef, useEffect } from "react";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../context/GlobalState";
import OKTA_ICON from "../../../../assets/okta-icon.svg";
import ONELOGIN_ICON from "../../../../assets/onelogin-icon.png";
import AZURE_ICON from "../../../../assets/azure-icon.svg";
import toast from "react-hot-toast";
import { FaCheck } from "react-icons/fa6";
import { LuLoaderCircle } from "react-icons/lu";

const PROVIDERS = [
  { name: "Okta", icon: OKTA_ICON },
  { name: "One Login", icon: ONELOGIN_ICON },
  { name: "Azure", icon: AZURE_ICON },
];

const AddSsoDialog = ({ onClose, onSuccess }) => {
  const { baseURL, viewer_id, selectedOrganisationId } =
    useContext(GlobalContext);
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [certificate, setCertificate] = useState("");
  const [issuer, setIssuer] = useState("");
  const [ssoUrl, setSsoUrl] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef(null);
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post(`/insert-organisation_sso`, {
        viewer_id,
        organisation: selectedOrganisationId,
        provider: selectedProvider,
        certificate,
        issuer,
        sso_url: ssoUrl,
        is_primary: isPrimary ? 1 : 0,
      });
      if (response.status === 200) {
        onSuccess();
        toast.success("Inserted Data Successfully");
        onClose();
      } else {
        console.error("Failed to add SSO:", response.data.message);
        toast.error("failed please try again!!");
      }
    } catch (error) {
      console.error("Error adding SSO:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return certificate.trim() && issuer.trim() && ssoUrl.trim();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-800 bg-opacity-50"></div>
      <div
        ref={dialogRef}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative"
      >
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-center text-neutral-800">
              Select Service Provider
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {PROVIDERS.map((provider) => (
                <div
                  key={provider.name}
                  className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors border ${
                    selectedProvider === provider.name
                      ? "bg-blue-100 border-blue-200"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleProviderSelect(provider.name)}
                >
                  <img
                    src={provider.icon}
                    alt={provider.name}
                    className="w-10 h-10 mr-4"
                  />
                  <span className="text-xl">{provider.name}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <button
                className="px-6 py-2 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`px-6 py-2 text-sm text-white btn-secondary ${
                  !selectedProvider && "opacity-80 cursor-not-allowed"
                }`}
                onClick={() => setStep(2)}
                disabled={!selectedProvider}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex relative items-center justify-center">
              <div className="absolute left-0">
                {PROVIDERS.map(({ name, icon }) =>
                  name === selectedProvider ? (
                    <img key={name} src={icon} alt={name} className="size-8" />
                  ) : null
                )}
              </div>
              <h3 className="text-2xl font-semibold text-center text-neutral-800">
                Add SSO Details
              </h3>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: "Certificate",
                  value: certificate,
                  onChange: setCertificate,
                },
                { label: "Issuer", value: issuer, onChange: setIssuer },
                { label: "SSO URL", value: ssoUrl, onChange: setSsoUrl },
              ].map((field) => (
                <div key={field.label} className="flex flex-col">
                  <label
                    htmlFor={field.label}
                    className="text-sm font-medium text-gray-700 mb-1"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.label}
                    type="text"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="p-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500"
                  />
                </div>
              ))}

              <div className="flex gap-1 relative items-center">
                <input
                  type="checkbox"
                  id="primary"
                  checked={isPrimary}
                  onChange={() => setIsPrimary(!isPrimary)}
                  className="appearance-none h-4 w-4 border border-gray-500 rounded checked:bg-cyan-700 checked:border-transparent focus:outline-none transition-all duration-200 ease-in-out cursor-pointer"
                />
                <FaCheck className="absolute text-[13px] top-0.7 left-0.5 pointer-events-none text-white z-50" />
                <label
                  className="font-medium select-none text-neutral-600 text-[15px]"
                  htmlFor="primary"
                >
                  Primary
                </label>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                className="px-6 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className={`px-6 py-2 flex items-center justify-center text-sm text-white btn-secondary w-[96px] h-[38px] ${
                  !isFormValid() && "opacity-80 cursor-not-allowed"
                }`}
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <LuLoaderCircle className="text-lg animate-spin" />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSsoDialog;
