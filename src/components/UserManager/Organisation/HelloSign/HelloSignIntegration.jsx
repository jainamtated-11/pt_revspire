import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import useAxiosInstance from '../../../../Services/useAxiosInstance';
import { GlobalContext } from '../../../../context/GlobalState';
import HelloSignLogo from '../../../../assets/hellosign.png';

export const handleHelloSignAuth = async (code, viewer_id, axiosInstance) => {
  try {
    const decodedCode = decodeURIComponent(code);
    const response = await axiosInstance.post('/hellosign/oauth-callback', {
      code: decodedCode,
      viewer_id: viewer_id
    });

    if (response.status === 200) {
      toast.success("HelloSign connected successfully!");
    } else {
      toast.error("Failed to connect HelloSign");
    }
  } catch (error) {
    console.error("Error during HelloSign authorization:", error);
    toast.error("Error connecting to HelloSign");
  }
};

const HelloSignIntegration = () => {
  const {
    viewer_id,
    selectedOrganisationId,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const [isConnected, setIsConnected] = useState(false);  
  const [accountName, setAccountName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Check if HelloSign is already connected
  useEffect(() => {
    const checkHelloSignConnection = async () => {
      try {
        const response = await axiosInstance.post('/hellosign/check-connection', {
          viewer_id: viewer_id,
          organisation_id: selectedOrganisationId,
        });

        if (response.data && response.data.connected) {
          setIsConnected(true);
          setAccountName(response.data.account_name || "");
        }
      } catch (error) {
        console.error("Error checking HelloSign connection:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkHelloSignConnection();
  }, [viewer_id, selectedOrganisationId]);

  const handleDisconnect = async () => {
      setIsLoading(true);
      try {
          const response = await axiosInstance.post('hellosign/disconnect', {
              viewer_id: viewer_id
          });

          if (response.data.success) {
              toast.success("Disconnected from HelloSign");
              setIsConnected(false);
          } else {
              toast.error("Failed to disconnect");
          }
      } catch (error) {
          console.error("Error disconnecting:", error);
          toast.error("Error disconnecting from Teams");
      } finally {
          setIsLoading(false);
      }
  };


  const currentUrl = window.location.href;

  const stateObject = {
    currentUrl
  };

  const clientId = "26ca0a24e7c1085f3f6aefa4d7d4afeb";
  const hellosignOAuthUrl = `https://app.hellosign.com/oauth/authorize?client_id=${clientId}&response_type=code&state=${encodeURIComponent(JSON.stringify(stateObject))}`;
  
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
        <h2 className="font-semibold text-lg mb-4">HelloSign Integration</h2>
        
        {isConnected ? (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <span className="font-medium mr-2">Connected to:</span>
              <span>{accountName}</span>
            </div>
            
            <div className="flex space-x-4 pt-4 border-t">
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white w-[200px] h-[40px] rounded-md flex items-center justify-center"
              >
                {isLoading ? 'Disconnecting...' : 'Disconnect HelloSign'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <p className="text-gray-600">Connect your HelloSign account to enable e-signature capabilities</p>
            <a 
              href={hellosignOAuthUrl} 
              className="w-fit"
            >
              <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 rounded-md px-6 py-3 flex items-center justify-center space-x-2 transition-colors duration-200 shadow-sm hover:shadow-md">                <img 
                  src={HelloSignLogo} 
                  alt="HelloSign Logo" 
                  className="h-5 w-auto" 
                />
                <span>Connect to HelloSign</span>
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelloSignIntegration;