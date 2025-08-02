import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import useAxiosInstance from '../../../../Services/useAxiosInstance';
import { GlobalContext } from '../../../../context/GlobalState';
import DocuSignLogo from '../../../../assets/docusign.png';

export const handleDocuSignAuth = async (code, viewer_id, axiosInstance) => {
  try {
    const decodedCode = decodeURIComponent(code);
    const response = await axiosInstance.post('/docusign/oauth-callback', {
      code: decodedCode,
      viewer_id: viewer_id
    });

    if (response.status === 200) {
      toast.success("DocuSign connected successfully!");
    } else {
      toast.error("Failed to connect DocuSign");
    }
  } catch (error) {
    console.error("Error during DocuSign authorization:", error);
    toast.error("Error connecting to DocuSign");
  }
};

const DocuSignIntegration = () => {
  const {
    viewer_id,
    selectedOrganisationId,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const [isConnected, setIsConnected] = useState(false);  
  const [accountName, setAccountName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const checkDocuSignConnection = async () => {
      try {
        const response = await axiosInstance.post('/docusign/check-connection', {
          viewer_id: viewer_id,
          organisation_id: selectedOrganisationId,
        });

        if (response.data && response.data.connected) {
          setIsConnected(true);
          setAccountName(response.data.account_name || "");
        }
      } catch (error) {
        console.error("Error checking DocuSign connection:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkDocuSignConnection();
  }, [viewer_id, selectedOrganisationId]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const currentUrl = window.location.href;
      const response = await axiosInstance.post('/docusign/generate-auth-url', {
        redirect_url: currentUrl
      });

      if (response.data?.authUrl) {
        // Redirect to the OAuth URL
        window.location.href = response.data.authUrl;
      } else {
        console.error("Invalid response from /docusign/get-auth-url");
        toast.error("Failed to get authentication URL");
      }
    } catch (error) {
      console.error("Error fetching DocuSign auth URL:", error);
      toast.error("Failed to connect to DocuSign");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/docusign/disconnect', {
        viewer_id: viewer_id
      });

      if (response.data.success) {
        toast.success("Disconnected from DocuSign");
        setIsConnected(false);
        setAccountName("");
      } else {
        toast.error("Failed to disconnect");
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Error disconnecting from DocuSign");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className='pb-10'>
      <div className="shadow-sm flex flex-col justify-center w-[98%] ml-2 mt-3 py-3 px-4 pb-8 rounded-md">
        <h2 className="font-semibold text-lg mb-4">DocuSign Integration</h2>

        {isConnected ? (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <span className="font-medium mr-2">Connected to:</span>
              <span>{accountName}</span>
            </div>

            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 text-white w-[200px] h-[40px] rounded-md flex items-center justify-center"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect DocuSign'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <p className="text-gray-600">Connect your DocuSign account to enable e-signature capabilities</p>
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-md px-6 py-3 flex items-center justify-center space-x-2 transition-colors duration-200 shadow-sm hover:shadow-md w-fit"
            >
              <img src={DocuSignLogo} alt="DocuSign Logo" className="h-5 w-auto" />
              <span>{isConnecting ? 'Connecting...' : 'Connect to DocuSign'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocuSignIntegration;