import React, { useState, useContext, useEffect } from "react";
import Gmail from "../../../../assets/MailServices/gmail.png";
import Outlook from "../../../../assets/MailServices/outlook.png";
import Yahoo from "../../../../assets/MailServices/yahoo.png";
import Zoho from "../../../../assets/MailServices/zoho.png";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../context/GlobalState";
import { LuLoaderCircle } from "react-icons/lu";

function AddMailDialog({ setAddMail }) {
  const axiosInstance = useAxiosInstance();
  const [selectedMail, setSelectedMail] = useState("");
  const { viewer_id, organisation_id } = useContext(GlobalContext);
  const [loading, setLoding] = useState(false);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  const MAIL_PROVIDERS = [
    { name: "Gmail", logo: Gmail },
    { name: "Outlook", logo: Outlook },
    { name: "Yahoo", logo: Yahoo },
    { name: "Zoho", logo: Zoho },
  ];

  useEffect(() => {
    let loaded = 0;
    MAIL_PROVIDERS.forEach((mail) => {
      const img = new window.Image();
      img.src = mail.logo;
      img.onload = img.onerror = () => {
        loaded += 1;
        if (loaded === MAIL_PROVIDERS.length) {
          setAllImagesLoaded(true);
        }
      };
    });
  }, []);

  const handleMailOptionSelect = (crm) => {
    setSelectedMail(crm);
  };

  const handleNext = async () => {
    if (!selectedMail) {
      console.error("No mail provider selected");
      return;
    }

    const providerMap = {
      Gmail: "Google",
      Outlook: "Microsoft",
      Yahoo: "Yahoo",
      Zoho: "Zoho",
    };

    const provider = providerMap[selectedMail];

    const payload = {
      viewer_id: viewer_id,
      provider: provider,
      originUrl: window.location.origin,
      primary: true,
      organisation_id: organisation_id,
    };

    try {
      setLoding(true);
      const response = await axiosInstance.post(
        "/email/connect-email",
        payload,
        {
          withCredentials: true,
        }
      );

      if (response.data.oauthUrl) {
        window.location.href = response.data.oauthUrl; // Redirect to OAuth URL
        setLoding(false);
      } else {
        console.error("No OAuth URL received");
      }
    } catch (error) {
      console.error(
        "Error connecting email:",
        error.response?.data || error.message
      );
      setLoding(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 z-10">
        <div className="p-5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Choose a Mail to Continue
          </h2>
          {!allImagesLoaded ? (
            <div className="flex justify-center items-center h-40">
              <LuLoaderCircle className="animate-spin text-blue-600 size-[48px]" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MAIL_PROVIDERS.map((mail) => (
                    <button
                      key={mail.name}
                      onClick={() => handleMailOptionSelect(mail.name)}
                      className={`flex items-center p-3 rounded-md border transition-all duration-200 ${
                        selectedMail === mail.name
                          ? "border-secondary bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <img
                        className="h-10 w-10 mr-3 object-contain"
                        src={mail.logo}
                        alt={mail.name}
                      />
                      <span className="text-base font-medium text-gray-900">
                        {mail.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="  flex justify-end space-x-2 rounded-b-lg">
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition-colors duration-150"
                  onClick={() => setAddMail(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md focus:outline-none transition-colors duration-150"
                  onClick={handleNext}
                >
                  {loading ? (
                    <LuLoaderCircle className="animate-spin text-white size-[24px]" />
                  ) : (
                    "Add"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddMailDialog;
