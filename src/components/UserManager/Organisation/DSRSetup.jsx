import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState";
import toast from "react-hot-toast";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import { LuLoaderCircle } from "react-icons/lu";
import { Edit } from "lucide-react";
import { useCookies } from "react-cookie";
import useCheckUserLicense from "../../../Services/checkUserLicense";
import LoginFieldModal from "./LoginFieldModal";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CrmStageMappingModal from "../CrmStageMapping/CrmStageMappingModal";

function DSRSetup() {
  const {
    organisationDetails,
    viewer_id,
    selectedOrganisationId,
    setOrganisationDetails,
  } = useContext(GlobalContext);

  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [organisationsData, setOrganisationsData] = useState([]);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempPrivacyPolicy, setTempPrivacyPolicy] = useState("");
  const [isEditingInactivity, setIsEditingInactivity] = useState(false);
  const [tempInactivitySeconds, setTempInactivitySeconds] = useState("");
  const [isLoginFieldModalOpen, setIsLoginFieldModalOpen] = useState(false);
  const [loginFields, setLoginFields] = useState([]);
  const [availableFieldTypes, setAvailableFieldTypes] = useState([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const axiosInstance = useAxiosInstance();
  const checkUserLicense = useCheckUserLicense();
  const [emailTemplates, setEmailTemplates] = useState([]); // State for email templates
  const [selectedTemplate, setSelectedTemplate] = useState(
    "No template selected"
  ); // State for selected template
  const [isEditingTemplate, setIsEditingTemplate] = useState(false); // State for edit mode

  // States to edit CRM Stage Color Mapping
  const [isCrmStageModalOpen, setIsCrmStageModalOpen] = useState(false);
  const [crmStages, setCrmStages] = useState([]);
  const [stageColors, setStageColors] = useState([]);
  const [InitialWonStages, setInitialWonStages] = useState([]);
  const [InitialLostStages, setInitialLostStages] = useState([]);

  const [isLoadingCrmStages, setIsLoadingCrmStages] = useState(false);

  
  const [isEmailTemplateSaving, setIsEmailTemplateSaving] = useState(false); // State for email template saving
  const [isPrivacyPolicyLinkSaving, setIsPrivacyPolicyLinkSaving] =
    useState(false); // State for privacy policy saving
  const [isPitchInactivitySaving, setIsPitchInactivitySaving] = useState(false); // State for pitch inactivity saving

  useEffect(() => {
    refreshOrganisations();
    if (
      checkUserLicense("Revenue Enablement Elevate") == 1 ||
      checkUserLicense("Revenue Enablement Spark") == 1
    ) {
      fetchEmailTemplates();
    }
  }, []);

  useEffect(() => {
    if (organisationDetails && organisationDetails.organisation) {
      const orgData = Array.isArray(organisationDetails.organisation)
        ? organisationDetails.organisation
        : [organisationDetails.organisation];

      setOrganisationsData(
        orgData.map((org) => ({
          id: org.id,
          apply_privacy_policy: org.apply_privacy_policy,
          privacy_policy: org?.privacy_policy,
          pitch_inactivity_seconds: org.pitch_inactivity_seconds,
          instant_message_dsr: org.instant_message_dsr,
          agent_dsr: org.agent_dsr,
        }))
      );
      setLoading(false);
    }
  }, [organisationDetails]);

  const handleIMCheckboxChange = async (index) => {
    const updatedOrganisations = [...organisationsData];
    updatedOrganisations[index] = {
      ...updatedOrganisations[index],
      instant_message_dsr:
        updatedOrganisations[index].instant_message_dsr === 1 ? 0 : 1,
    };
    setOrganisationsData(updatedOrganisations);

    try {
      setIsSaving(true);
      await axiosInstance.post(
        `/update-company-info`,
        {
          id: updatedOrganisations[index].id,
          instant_message_dsr:
            updatedOrganisations[index].instant_message_dsr,
          viewer_id: viewer_id,
        },
        {
          withCredentials: true,
        }
      );
      toast.success("Instant Messaging updated successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to update Instant Messaging toggle.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAgentCheckboxChange = async (index) => {
    const updatedOrganisations = [...organisationsData];
    updatedOrganisations[index] = {
      ...updatedOrganisations[index],
      agent_dsr:
        updatedOrganisations[index].agent_dsr === 1 ? 0 : 1,
    };
    setOrganisationsData(updatedOrganisations);

    try {
      setIsSaving(true);
      await axiosInstance.post(
        `/update-company-info`,
        {
          id: updatedOrganisations[index].id,
          agent_dsr:
            updatedOrganisations[index].agent_dsr,
          viewer_id: viewer_id,
        },
        {
          withCredentials: true,
        }
      );
      toast.success("Agent enabled successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to update Agent toggle.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrivacyCheckboxChange = async (index) => {
    const updatedOrganisations = [...organisationsData];
    updatedOrganisations[index] = {
      ...updatedOrganisations[index],
      apply_privacy_policy:
        updatedOrganisations[index].apply_privacy_policy === 1 ? 0 : 1,
    };
    setOrganisationsData(updatedOrganisations);

    try {
      setIsSaving(true);
      await axiosInstance.post(
        `/update-organisation-privacy`,
        {
          id: updatedOrganisations[index].id,
          apply_privacy_policy:
            updatedOrganisations[index].apply_privacy_policy,
          viewer_id: viewer_id,
        },
        {
          withCredentials: true,
        }
      );
      toast.success("Privacy policy toggle updated successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to update privacy policy toggle.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (index) => {
    setIsEditing(true);
    setTempPrivacyPolicy(organisationsData[index]?.privacy_policy);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setTempPrivacyPolicy("");
  };

  const handleSaveClick = async (index) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])?)\\.)+([a-z]{2,}|[a-z\\d-]{2,})|" + // domain name
        "localhost|" + // localhost
        "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}|" + // IP address
        "\\[?[a-fA-F0-9]*:[a-fA-F0-9:%.~+\\-]*\\])" + // IPv6
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+:]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );

    if (!urlPattern.test(tempPrivacyPolicy)) {
      setError("Please enter a valid URL.");
      return;
    }
    setError(null);

    try {
      setIsPrivacyPolicyLinkSaving(true);
      const updatedOrganisations = [...organisationsData];
      updatedOrganisations[index] = {
        ...updatedOrganisations[index],
        privacy_policy: tempPrivacyPolicy,
      };
      setOrganisationsData(updatedOrganisations);

      await axiosInstance.post(
        `/update-organisation-privacy`,
        {
          privacy_policy: tempPrivacyPolicy,
          id: organisationsData[index].id,
          apply_privacy_policy: organisationsData[index].apply_privacy_policy,
          viewer_id: viewer_id,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Privacy policy updated successfully!");
      setIsEditing(false);
      setTempPrivacyPolicy("");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to update privacy policy. Please try again.");
    } finally {
      setIsPrivacyPolicyLinkSaving(false);
    }
  };

  const handleEditInactivityClick = (index) => {
    setIsEditingInactivity(true);
    setTempInactivitySeconds(organisationsData[index].pitch_inactivity_seconds);
  };

  const handleCancelInactivityClick = () => {
    setIsEditingInactivity(false);
    setTempInactivitySeconds("");
  };

  const handleSaveInactivityClick = async (index) => {
    if (isNaN(tempInactivitySeconds)) {
      setError("Please enter a valid number.");
      return;
    }
    setError(null);

    try {
      setIsPitchInactivitySaving(true);
      const updatedOrganisations = [...organisationsData];
      updatedOrganisations[index] = {
        ...updatedOrganisations[index],
        pitch_inactivity_seconds: tempInactivitySeconds,
      };
      setOrganisationsData(updatedOrganisations);

      await axiosInstance.post(
        `/update-company-info`,
        {
          pitch_inactivity_seconds: tempInactivitySeconds,
          id: organisationsData[index].id,
          viewer_id: viewer_id,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Pitch inactivity seconds updated successfully!");
      setIsEditingInactivity(false);
      setTempInactivitySeconds("");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error(
        "Failed to update pitch inactivity seconds. Please try again."
      );
    } finally {
      setIsPitchInactivitySaving(false);
    }
  };

  const refreshOrganisations = () => {
    setLoading(true);
    axiosInstance
      .post(`/view-organisation-details`, {
        viewer_id: viewer_id,
        organisation_id: selectedOrganisationId,
      })
      .then((response) => {
        if (response.data.success) {
          setOrganisationDetails(response.data);
        } else {
          console.error(
            "Error fetching organisation details:",
            response.data.message
          );
          toast.error("Failed to fetch organisation details.");
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
        toast.error("Network error. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchEmailTemplates = async () => {
    console.log("fetchign email templates :::::");
    try {
      const response = await axiosInstance.post(
        "/email-template/get-all-email-templates",
        {
          viewer_id,
          organisation_id,
        }
      );
      if (response.data.success) {
        console.log("response data ", response.data);
        setEmailTemplates(response.data.templates);
        console.log("emailtemplates here ", response.data.templates);
      } else {
        console.error("Failed to email templates:", response.data.message);
        toast.error("Failed in fetching email templates");
      }
    } catch (error) {
      console.error("Error fetching email templates:", error);
      toast.error("Error in fetching email templates");
    }
  };

  const handleSaveTemplateClick = async () => {
    try {
      setIsEmailTemplateSaving(true);
      // Prepare the data to be sent
      const selectedTemplateId = emailTemplates.find(
        (template) => template.name === selectedTemplate
      )?.id;

      await axiosInstance.post(
        `/update-company-info`,
        {
          send_pitch_email_template: selectedTemplateId,
          id: organisationsData[0].id,
          viewer_id: viewer_id,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Email template updated successfully!");
      setIsEditingTemplate(false);
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to update email template. Please try again.");
    } finally {
      setIsEmailTemplateSaving(false);
    }
  };

  const handleTemplateSelect = async (templateName) => {
    setSelectedTemplate(templateName); // Update selected template

    // Find the selected template ID
    const selectedTemplateId = emailTemplates.find(
      (template) => template.name === templateName
    )?.id;

    // Send the update request if the template is valid
    if (selectedTemplateId) {
      try {
        setIsSaving(true);
        await axiosInstance.post(
          `/update-company-info`, // Replace with your actual endpoint
          {
            send_pitch_email_template: selectedTemplateId,
            id: organisationsData[0].id, // Assuming you want to update the first organisation
            viewer_id: viewer_id,
          },
          {
            withCredentials: true,
          }
        );

        toast.success("Email template updated successfully!");
      } catch (error) {
        console.error("Error saving data:", error);
        toast.error("Failed to update email template. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  useEffect(() => {
    if (organisationDetails && organisationDetails.organisation) {
      const orgData = organisationDetails.organisation;
      setSelectedTemplate(
        orgData.send_pitch_email_template_name || "No template selected"
      ); // Set initial template
    }
  }, [organisationDetails]);

  const handleTemplateEditClick = () => {
    setIsEditingTemplate(true); // Enable edit mode
  };

  const handleLoginFieldEdit = async () => {
    setIsLoginFieldModalOpen(true);
    setIsLoadingFields(true);
    try {
      const response = await axiosInstance.post(
        "/pitch-login-field/get-fields-and-types",
        {
          viewer_id,
          organisation_id,
        }
      );
      if (response.data) {
        console.log("Fetched fields:", response.data);
        setLoginFields(response.data.fields || []);
        setAvailableFieldTypes(response.data.availableFieldTypes || []);
      }
    } catch (error) {
      console.error("Error fetching login fields:", error);
      toast.error("Failed to fetch login fields");
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleSaveLoginFields = async (updatedFields) => {
    try {
      setIsSaving(true);
      // TODO: Replace with actual API endpoint
      await axiosInstance.post("/pitch-login-field/update-fields", {
        fields: updatedFields.map((field, index) => ({
          ...field,
          order: index + 1,
          organisation: organisation_id,
        })),
        viewer_id,
        organisation_id,
      });
      toast.success("Login fields updated successfully!");
      setIsLoginFieldModalOpen(false);
    } catch (error) {
      console.error("Error saving login fields:", error);
      toast.error("Failed to save login fields");
    } finally {
      setIsSaving(false);
    }
  };

  // Update the fetchCrmStages function to return white as default
  const fetchCrmStages = async () => {
    setIsLoadingCrmStages(true);
    try {
      const response = await axiosInstance.post("/crm-stage-map/get-stage-mappings", {
        organisation_id,
        viewer_id
      });
      
      if (response.data.success) {
        const validStages = response.data.mappings.filter(stage => stage.stage_id !== null);
        const colorMappings = {};
        const wonStages = response.data.wonStages || [];
        const lostStages = response.data.lostStages || [];
        
        validStages.forEach(stage => {
          colorMappings[stage.stage_id] = stage.color || "#FFFFFF"; // Default to white
        });
        
        setCrmStages(validStages);
        
        // Return both color mappings and won/lost stages
        return {
          colors: colorMappings,
          wonStages,
          lostStages
        };
      }
      return { colors: {}, wonStages: [], lostStages: [] };
    } catch (error) {
      toast.error("Failed to fetch CRM stages");
      console.error("Fetch error:", error);
      return { colors: {}, wonStages: [], lostStages: [] };
    } finally {
      setIsLoadingCrmStages(false);
    }
  };

  // Update the updateStageMappings function to ensure white is sent when no color selected
  const updateStageMappings = async (stageColors) => {
    try {
      const colorsToUpdate = {};
      for (const [stageId, color] of Object.entries(stageColors)) {
        colorsToUpdate[stageId] = color || "#FFFFFF"; // Ensure white is sent when null
      }

      const response = await axiosInstance.post("/crm-stage-map/update-stage-mappings", {
        organisation_id,
        viewer_id,
        stage_colors: colorsToUpdate
      });
      
      if (response.data.success) {
        toast.success("Stage colors updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update stage colors");
      }
    } catch (error) {
      toast.error("Failed to update stage colors");
      console.error("Update error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="w-[200px] h-[30px] bg-neutral-200 animate-pulse rounded-lg" />
        <div className="max-w-[500px] w-full h-[30px] bg-neutral-200 animate-pulse rounded-lg" />
        <div className="max-w-[500px] w-full h-[30px] bg-neutral-200 animate-pulse rounded-lg" />
        <div className="max-w-[500px] w-full h-[30px] bg-neutral-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="">
      <div className="pt-3">
        <div className="bg-white rounded-lg overflow-hidden border border-neutral-200">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gray-50">
                <th
                  colSpan="2"
                  className="py-3 px-4 text-left text-lg font-semibold text-gray-700"
                >
                  Pitch Settings
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Apply Privacy Policy Toggle */}
              <tr className="border-b last:border-0 border-gray-200">
                <td className="py-3 px-4 text-sm font-medium text-gray-500">
                  Apply Privacy Policy
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePrivacyCheckboxChange(0)}
                      disabled={isSaving}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        organisationsData[0]?.apply_privacy_policy === 1
                          ? "bg-cyan-700"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          organisationsData[0]?.apply_privacy_policy === 1
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      ></span>
                    </button>
                    {isSaving && <LuLoaderCircle className="text-lg animate-spin" />}
                  </div>
                </td>
              </tr>

              {/* Privacy Policy Link */}
              <tr className="border-b last:border-0 border-gray-200">
                <td className="py-3 px-4 text-sm font-medium text-gray-500">
                  Privacy Policy Link
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <textarea
                        value={tempPrivacyPolicy}
                        onChange={(e) => setTempPrivacyPolicy(e.target.value)}
                        rows={2}
                        className="p-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 text-neutral-800"
                        placeholder="Add your privacy link here"
                        style={{ width: "300px", height: "40px" }} // Fixed width for the input
                      />
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <button
                        onClick={handleCancelClick}
                        className="text-gray-600 hover:text-gray-800"
                        // className="px-3 py-1.5 text-sm font-medium text-neutral-600 bg-neutral-100 border border-neutral-300 rounded-lg hover:bg-neutral-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveClick(0)}
                        disabled={isPrivacyPolicyLinkSaving}
                        // className="px-3 py-1.5 text-sm font-medium text-white bg-cyan-700 rounded-lg hover:bg-cyan-800 disabled:opacity-50"
                      >
                        {isPrivacyPolicyLinkSaving ? (
                          <LuLoaderCircle className="animate-spin" />
                        ) : (
                          <div className="text-sky-700 hover:text-sky-800">
                            Save
                          </div>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p
                        className="p-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-800"
                        style={{ height: "40px", width: "300px" }}
                      >
                        {organisationsData[0]?.privacy_policy ||
                          "No privacy policy link set"}
                      </p>
                      <button
                        onClick={() => handleEditClick(0)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>

              {/* Pitch Inactivity Seconds */}

              <tr className="border-b last:border-0 border-gray-200">
                <td className="py-3 px-4 text-sm font-medium text-gray-500">
                  Pitch Inactivity Seconds
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">
                  {isEditingInactivity ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={tempInactivitySeconds}
                        onChange={(e) =>
                          setTempInactivitySeconds(e.target.value)
                        }
                        className="p-2 pt-1 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 text-neutral-800"
                        placeholder="Enter pitch inactivity seconds"
                        style={{ width: "300px", height: "40px" }} // Fixed width and height for the input
                      />
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <button
                        onClick={handleCancelInactivityClick}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveInactivityClick(0)}
                        disabled={isPitchInactivitySaving}
                      >
                        {isPitchInactivitySaving ? (
                          <LuLoaderCircle className="animate-spin" />
                        ) : (
                          <div className="text-sky-700 hover:text-sky-800">
                            Save
                          </div>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p
                        className="p-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-800"
                        style={{ height: "40px", width: "300px" }}
                      >
                        {organisationsData[0]?.pitch_inactivity_seconds ||
                          "No pitch inactivity seconds set"}
                      </p>
                      <button
                        onClick={() => handleEditInactivityClick(0)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>

              {/* Pitch Email Template */}

              {(checkUserLicense("Revenue Enablement Elevate") == 1 ||
                checkUserLicense("Revenue Enablement Spark") == 1) && (
                <tr className="border-b last:border-0 border-gray-200">
                  <td className="py-3 px-4 text-sm font-medium text-gray-500">
                    Pitch Email Template
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {isEditingTemplate ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)} // Update state without triggering save
                          className="p-2 pl-[4px]  pt-1 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 transition-all rounded-lg text-neutral-800"
                          style={{ width: "300px", height: "40px" }} // Fixed width and height for the select
                        >
                          <option value="No template selected">
                            No template selected
                          </option>
                          {emailTemplates.map((template) => (
                            <option key={template.id} value={template.name}>
                              {template.name}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => setIsEditingTemplate(false)} // Cancel editing
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleSaveTemplateClick} // Save the selected template
                          disabled={isEmailTemplateSaving}
                        >
                          {isEmailTemplateSaving ? (
                            <LuLoaderCircle className="animate-spin" />
                          ) : (
                            <div className="text-sky-700 hover:text-sky-800">
                              Save
                            </div>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p
                          className="p-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-800"
                          style={{ height: "40px", width: "300px" }}
                        >
                          {selectedTemplate}
                        </p>
                        <button
                          onClick={handleTemplateEditClick}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}

              {/* Pitch Login Field Row */}
              <tr className="border-b last:border-0 border-gray-200">
                 <td className="py-3 px-4 text-sm font-medium text-gray-500">
                   Pitch Login Field
                 </td>
                 <td className="py-3 px-4 text-sm text-gray-900">
                 <div className="flex items-center gap-2"> 
                   </div>
                   <button
                     type="button"
                     onClick={handleLoginFieldEdit}
                     className={`text-primary border border-primary  rounded-lg px-3 py-2 items-center font-semibold`}
                   >
                      <FontAwesomeIcon
                         icon={faPencilAlt}
                         className="text-primary w-3 h-3 mr-2"
                       />
                     Edit Fields
                   </button>
                 </td>
              </tr>

              {/* CRM Stage Color Mapping Row */}

              {checkUserLicense("Revenue Enablement Spark") == 1 && (
                <tr className="border-b last:border-0 border-gray-200">
                  <td className="py-3 px-4 text-sm font-medium text-gray-500">
                    CRM Stage Mapping
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    <button
                      onClick={async () => {
                        setIsCrmStageModalOpen(true);
                        const { colors, wonStages, lostStages } = await fetchCrmStages();
                          setStageColors(colors);
                          setInitialWonStages(wonStages);
                          setInitialLostStages(lostStages);
                      }}
                      className="text-primary border border-primary rounded-lg px-3 py-2 items-center font-semibold"
                    >
                      <FontAwesomeIcon
                        icon={faPencilAlt}
                        className="text-primary w-3 h-3 mr-2"
                      />
                      Map
                    </button>
                  </td>
                </tr>
              )}

              {/* Instant Message Toggle */}
              {(checkUserLicense("Revenue Enablement Elevate") == 1 ||
              checkUserLicense("Revenue Enablement Spark") == 1) && (
                <tr className="border-b last:border-0 border-gray-200">
                  <td className="py-3 px-4 text-sm font-medium text-gray-500">
                    Instant Messaging
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleIMCheckboxChange(0)}
                        disabled={isSaving}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                          organisationsData[0]?.instant_message_dsr === 1
                            ? "bg-cyan-700"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                            organisationsData[0]?.instant_message_dsr === 1
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                      {isSaving && <LuLoaderCircle className="text-lg animate-spin" />}
                    </div>
                  </td>
                </tr>
              )}


              {/* DSR Agent Toggle */}
              {(checkUserLicense("Revenue Enablement Elevate") == 1 ||
              checkUserLicense("Revenue Enablement Spark") == 1) && (
                <tr className="border-b last:border-0 border-gray-200">
                  <td className="py-3 px-4 text-sm font-medium text-gray-500">
                    Sales Room Agent
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAgentCheckboxChange(0)}
                        disabled={isSaving}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                          organisationsData[0]?.agent_dsr === 1
                            ? "bg-cyan-700"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                            organisationsData[0]?.agent_dsr === 1
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                      {isSaving && <LuLoaderCircle className="text-lg animate-spin" />}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LoginFieldModal
        isOpen={isLoginFieldModalOpen}
        onClose={() => setIsLoginFieldModalOpen(false)}
        fields={loginFields}
        fieldTypes={availableFieldTypes}
        isLoading={isLoadingFields}
        onSave={handleSaveLoginFields}
      />

      <CrmStageMappingModal
        isOpen={isCrmStageModalOpen}
        onClose={() => setIsCrmStageModalOpen(false)}
        stages={crmStages}
        isLoading={isLoadingCrmStages}
        onSave={updateStageMappings}
        initialColors={stageColors}
        initialWonStages={InitialWonStages}
        initialLostStages={InitialLostStages}
      />
    </div>
  );
}

export default DSRSetup;