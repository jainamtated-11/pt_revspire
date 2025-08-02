import React, { useState, useEffect, useCallback, useContext } from 'react';
import { toast } from 'react-hot-toast';
import useAxiosInstance from '../../../Services/useAxiosInstance';
import { GlobalContext } from '../../../context/GlobalState';

const MicrosoftClarity = () => {
  const {
    viewer_id,
    selectedOrganisationId,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const [isToggleOn, setIsToggleOn] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasCustomDomain, setHasCustomDomain] = useState(true); // New state to track custom domain

  // Fetch initial values for toggle and input
  useEffect(() => {
    const fetchInitialValues = async () => {
      console.log("Fetching organisation details...");
      try {
        const response = await axiosInstance.post(`/view-organisation-details`, {
          viewer_id: viewer_id,
          organisation_id: selectedOrganisationId,
        });

        if (response.data && response.data.organisation) {
          const fetchedClarityValue = response.data.organisation.microsoft_clarity_project_id;
          const orgLevelClarity = response.data.organisation.org_level_microsoft_clarity;
          const customTenantName = response.data.organisation?.custom_tenant_name;
          const customTenantApiName = response.data.organisation?.custom_tenant_api_name;

          // Check if custom domain is set
          const domainSet = customTenantName && customTenantApiName;
          setHasCustomDomain(domainSet);

          setInputValue(fetchedClarityValue || "");
          console.log("Fetched Clarity Value:", fetchedClarityValue);
          console.log("Org Level Microsoft Clarity:", orgLevelClarity);
          setIsToggleOn((orgLevelClarity === "1" || orgLevelClarity === 1) && domainSet); 
        }
      } catch (error) {
        console.error("Error fetching organisation details:", error);
        toast.error("Failed to fetch organisation details.");
      }
    };

    fetchInitialValues();
  }, [viewer_id, selectedOrganisationId]);

  const handleToggleChange = async () => {
    if (!hasCustomDomain) {
      toast.error("Please setup a custom domain first before enabling Microsoft Clarity.");
      return;
    }

    console.log("Toggle changed:", isToggleOn);
    const newToggleState = !isToggleOn;
    setIsToggleOn(newToggleState);

    try {
      const response = await axiosInstance.post('/update-company-info', {
        viewer_id,
        organisation_id: selectedOrganisationId,
        org_level_microsoft_clarity: !isToggleOn ? "1" : "0", 
        microsoft_clarity_project_id: inputValue,
      });

      if (response.status === 200) {
        toast.success("Organisation details updated");
      } else {
        toast.error("Failed to update organisation details.");
      }
    } catch (error) {
      console.error("Error updating organisation details:", error);
      toast.error("Error updating organisation details.");
    }
  };

  const handleUpdateClick = async () => {
    if (!hasCustomDomain) {
      toast.error("Please setup a custom domain first before updating Microsoft Clarity settings.");
      return;
    }

    if (!isToggleOn) {
      toast.error("Please enable the toggle to submit the Project ID.");
      return;
    }

    try {
      const response = await axiosInstance.post('/update-company-info', {
        viewer_id,
        organisation_id: selectedOrganisationId,
        microsoft_clarity_project_id: inputValue, 
        org_level_microsoft_clarity: isToggleOn ? "1" : "0",
      });

      if (response.status === 200) {
        toast.success("Project ID updated successfully.");
      } else {
        toast.error("Failed to update Project ID.");
      }
    } catch (error) {
      console.error("Error updating Project ID:", error);
      toast.error("Error updating Project ID.");
    }
  };

  return (
    <div className='pb-10'>
      {!hasCustomDomain && (
        <div className="ml-6 mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p>Please setup a custom domain first before configuring Microsoft Clarity.</p>
        </div>
      )}

      <div className="ml-6 flex-1">
        <label className="inline-flex items-center cursor-pointer">
          <p className='font-semibold py-2 mr-5'>Org Level Microsoft Clarity :</p>
          <input
            type="checkbox"
            checked={isToggleOn}
            onChange={handleToggleChange}
            className="sr-only peer"
            disabled={!hasCustomDomain}
          />
          <div className={`relative w-11 h-6 ${isToggleOn ? 'bg-blue-600' : 'bg-gray-200'} peer-focus:outline-none rounded-full`}>
            <div className={`absolute top-[2px] ${isToggleOn ? 'translate-x-full' : 'translate-x-0'} transition-transform bg-white border border-gray-300 rounded-full h-5 w-5`}></div>
          </div>
        </label>
      </div>

      <div className="shadow-sm flex flex-col justify-center w-[98%] ml-2 mt-3 py-3 px-4 pb-8 rounded-md">
        <div className='flex flex-row items-center justify-start'>
          <p className="font-normal mt-2" htmlFor="projectId">Microsoft Clarity Project ID :</p>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)} 
            disabled={!isToggleOn || !hasCustomDomain}
            placeholder={hasCustomDomain ? "Enter your Project ID here ..." : "Setup custom domain first"}
            className={`mt-4 p-2 ml-5 border rounded min-w-[300px] ${!isToggleOn || !hasCustomDomain ? 'bg-gray-200/80' : 'bg-white'}`}
          />

          {isToggleOn && hasCustomDomain && (
            <button
              className="bg-gray-200 hover:bg-gray-300 border border-gray-800 w-[100px] h-[30px] rounded-md mt-3 ml-20"
              onClick={handleUpdateClick}
            >
              Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicrosoftClarity;