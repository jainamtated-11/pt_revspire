import React, { useState, useEffect, useContext } from "react";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import ZoominfoLogo from "../../../assets/zoominfo.jpeg"; // Replace with actual path
import LushaLogo from "../../../assets/lusha6138 (1).jpg"; // Replace with actual path
import DnBDirectLogo from "../../../assets/dandb (1).jpeg"; // Replace with actual path
import DnBHooversLogo from "../../../assets/dandb (1).jpeg"; // Replace with actual path
import { InfinitySpin } from "react-loader-spinner";
import { useDispatch } from "react-redux";
import { fetchProviders } from "../../../features/dataEnrichment/dataEnrichmentApi.js";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import { useCookies } from "react-cookie";
import { fetchProvidersAsync } from "../../../features/dataEnrichment/dataEnrichmentSlice.js";

const PROVIDERS = [
  {
    name: "Zoominfo",
    logo: ZoominfoLogo,
    fields: ["name", "username", "client_id", "client_secret"],
  },
  {
    name: "Lusha",
    logo: LushaLogo,
    fields: ["name", "username", "api_key"],
  },
  {
    name: "D&B Direct+",
    logo: DnBDirectLogo,
    fields: ["name", "username", "client_id", "client_secret"],
  },
  {
    name: "D&B Hoovers",
    logo: DnBHooversLogo,
    fields: ["name", "username", "client_id", "client_secret"],
  },
];

function AddDataEnrichmentDialog({ setAddDialog }) {
  const { baseURL , viewer_id} = useContext(GlobalContext);
  const [cookies] = useCookies("userData");
  const organisation_id = cookies.userData?.organisation?.id;
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const axiosInstance = useAxiosInstance();
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    let loaded = 0;
    PROVIDERS.forEach((provider) => {
      const img = new window.Image();
      img.src = provider.logo;
      img.onload = img.onerror = () => {
        loaded += 1;
        if (loaded === PROVIDERS.length) {
          setAllImagesLoaded(true);
        }
      };
    });
  }, []);

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setStep(2);
    setForm({});
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setForm(prev => ({ ...prev, is_active:1 , is_primary:0}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStep(3);
    console.log("formdata here :", form);
    try {
      const response = await axiosInstance.post("/data-enrichment/create-data-enrichment", {
        ...form,
        provider: selectedProvider.name,
        // viewer_id, organisation_id, is_active, is_primary
      });
      console.log("this is the response :", response);

      if (response.data && response.data.success) {
        toast.success(response.data.message || "Provider added!");
        setTimeout(() => setAddDialog(false), 1000);
      } else {
        toast.error(response.data?.message || "Failed to add provider");
        setStep(2);
      }
    } catch (err) {
      toast.error("Failed to add provider");
      setLoading(false);
      setStep(2);
    }finally{
      setLoading(false);
      dispatch(fetchProvidersAsync({ baseURL, viewer_id, organisation_id }));
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.name}
              onClick={() => handleProviderSelect(provider)}
              className={`flex items-center p-3 rounded-md border transition-all duration-200 hover:border-blue-300 hover:bg-gray-50`}
            >
              <img
                className="h-10 w-10 mr-3 object-contain"
                src={provider.logo}
                alt={provider.name}
              />
              <span className="text-base font-medium text-gray-900">
                {provider.name}
              </span>
            </button>
          ))}
        </div>
      );
    }
    if (step === 2 && selectedProvider) {
      return (
        <form onSubmit={handleSubmit} className="space-y-4 ">
          {selectedProvider.fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </label>
              <input
                name={field}
                value={form[field] || ""}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
              />
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className=" w-[100px] px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="submit"
              className="w-[100px] px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      );
    }
    if (step === 3) {
      return (
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <InfinitySpin visible={true} width="80" color="#3B82F6" ariaLabel="infinity-spin-loading" />
          <p className="text-base font-medium text-gray-800">
            {selectedProvider
              ? `Adding ${selectedProvider.name}...`
              : "Finalizing..."}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 z-10 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {step === 1
            ? "Choose a Data Enrichment Provider"
            : step === 2
            ? `Configure ${selectedProvider.name}`
            : "Adding Provider"}
        </h2>
        {!allImagesLoaded ? (
          <div className="flex justify-center items-center h-40">
            <InfinitySpin visible={true} width="80" color="#3B82F6" ariaLabel="infinity-spin-loading" />
          </div>
        ) : (
          renderStep()
        )}
        {allImagesLoaded && (
          <div className="flex justify-end mt-4">
            {step === 1 && (
              <button
                className="w-[100px] px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setAddDialog(false)}
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddDataEnrichmentDialog;