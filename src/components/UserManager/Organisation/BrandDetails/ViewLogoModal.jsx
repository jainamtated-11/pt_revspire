import React, { useContext, useEffect, useState } from "react";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import useOutsideClick from "../../../../hooks/useOutsideClick";
import { GlobalContext } from "../../../../context/GlobalState";

const ViewLogoModal = ({ isOpen, onClose, viewer_id, organisation_id }) => {
  const [companyLogo, setCompanyLogo] = useState(null);
  const { isSvg, setIsSvg } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const handleResetState = () => {
    setCompanyLogo(null);
  };

  const modalRef = useOutsideClick([onClose, handleResetState]);

  useEffect(() => {
    if (isOpen && organisation_id) {
      handleLogo();
    }
  }, [isOpen, organisation_id]);

  const isSvgFormat = (base64String) => {    
    try {
      const decodedData = atob(base64String);
      console.log("decodedData: ", decodedData);
      // Check for both <?xml and <svg tags
      return decodedData.includes('<?xml') || decodedData.toLowerCase().includes('<svg');
    } catch (error) {
      console.error('Error decoding base64:', error);
      return false;
    }
  };

  const handleLogo = async () => {
    try {
      const response = await axiosInstance.post("/view-organisation-logo", {
        viewer_id,
        organisation_id,
      });

      const logoData = response.data.company_logo;
      
      // Don't try to remove data URL prefix if it doesn't exist
      const base64Content = logoData.includes('base64,') 
        ? logoData.split('base64,')[1] 
        : logoData;

      const svgCheck = isSvgFormat(base64Content);
      setIsSvg(svgCheck);
      console.log("Is SVG:", svgCheck); // Debug log

      let finalLogoUrl;
      if (svgCheck) {
        // Ensure proper SVG MIME type and encoding
        finalLogoUrl = `data:image/svg+xml;base64,${base64Content}`;
        console.log("SVG URL created"); // Debug log
      } else {
        finalLogoUrl = `data:image/png;base64,${base64Content}`;
        console.log("PNG URL created"); // Debug log
      }

      console.log("Final Logo URL:", finalLogoUrl); // Debug log
      setCompanyLogo(finalLogoUrl);
    } catch (error) {
      console.error("Error fetching company logo:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-white p-4 md:p-6 rounded-lg shadow-lg relative max-w-md w-full">
        <button
          className="absolute top-0 right-2 m-2 text-gray-500 hover:text-red-700 text-3xl"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex flex-col items-center justify-center p-4">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt="Company Logo"
              className="object-contain w-full h-48 md:h-64"
              style={{ minHeight: '72px' }}
            />
          ) : (
            <div className="min-h-72 p-4 items-center justify-center">
              <p className="text-gray-500 mt-20">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewLogoModal;
