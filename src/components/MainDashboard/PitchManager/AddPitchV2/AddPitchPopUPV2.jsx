import React, { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import AddPitchStep1 from "./AddPitchStep1";
import AddPitchStep2 from "./AddPitchStep2";
import { MdClose } from "react-icons/md";
import GlobalButton from "../../ContentManager/ContentTable/GlobalButton";
import toast from "react-hot-toast";
import { resetPitchForm } from "../../../../features/pitch/addPitchSlice";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../context/GlobalState";
import useCheckUserLicense from "../../../../Services/checkUserLicense";
import { fetchPitchesAsync } from "../../../../features/pitch/pitchSlice";
import { fetchFilterDataAsync } from "../../../../features/filter/fliterSlice";
import DynamicsPreview from "./DynamicsPreview";

function AddPitchPopUPV2() {
  const checkUserLicense = useCheckUserLicense();
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();
  const [step, setStep] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pitchState = useSelector((state) => state.addPitchSlice);
  const { viewer_id, organisation_id, baseURL } = useContext(GlobalContext);
  const [translateAccess, setTranslateAccess] = useState(false);

  useEffect(() => {
    if (
      checkUserLicense("Revenue Enablement Elevate;Revenue Enablement Spark") ==
      "1"
    ) {
      setTranslateAccess(true);
    }
  }, []);

  const renderStep = () => {
    return step === 1 ? (
      <AddPitchStep1 errors={validationErrors} />
    ) : (
      <AddPitchStep2 />
    );
  };

  const validateStep1 = () => {
    const errors = {};
    let isValid = true;

    if (!pitchState.pitchName.trim()) {
      errors.pitchName = "Pitch name is required";
      isValid = false;
    }

    if (!pitchState.pitchLayout.id) {
      errors.pitchLayout = "Please select a layout";
      isValid = false;
    }

    if (!pitchState.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    if (!pitchState.headline.trim()) {
      errors.headline = "Headline is required";
      isValid = false;
    }

    if (!pitchState.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    if (!pitchState.images.background.file) {
      errors.backgroundImage = "Background image is required";
      isValid = false;
    }

    if (!pitchState.images.loginBackground.file) {
      errors.loginBackground = "Login Background image is required";
      isValid = false;
    }

    if (!pitchState.isTofu) {
      if (!pitchState.selectedConnectionId) {
        errors.crmConnection = "Please select a CRM connection";
        isValid = false;
      }

      if (!pitchState.entityId && pitchState.selectedConnectionId) {
        errors.entityId = `Please select a ${
          pitchState.entityType === "account" ||
          pitchState.entityType === "company"
            ? pitchState.entityType
            : pitchState.entityType === "opportunity"
            ? "opportunity"
            : "deal"
        }`;
        isValid = false;
      }
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(2);
        setIsTransitioning(false);
      }, 300);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(1);
      setIsTransitioning(false);
    }, 300);
  };

  const getFilterCondition = async () => {
    const [
      { data: tableData },
      { data: fieldData },
      { data: conditionTypeData },
      { data: conditionValueTypeData },
    ] = await Promise.all([
      axiosInstance.post(`${baseURL}/get-table-id`, { tablename: "pitch" }),
      axiosInstance.post(`${baseURL}/get-filter-field-id`, {
        field_name: "owner",
      }),
      axiosInstance.post(`${baseURL}/get-condition-type-id`, {
        condition_type: "equals",
      }),
      axiosInstance.post(`${baseURL}/get-condition-value-type-id`, {
        condition_value_type: "Absolute",
      }),
    ]);

    return {
      order: 1,
      filterTable: tableData.id,
      filterField: fieldData.id,
      conditionType: conditionTypeData.id,
      conditionValueType: conditionValueTypeData.id,
      filterTableName: "pitch",
      filterFieldName: "owner",
      filterFieldType: "string",
      conditionName: "equals",
      conditionValueTypeName: "Absolute",
      valueId: "",
      valueName: "",
      relativeValue: null,
      value: viewer_id,
    };
  };

  const fetchFilterCondition = async () => {
    try {
      const filterCondition = await getFilterCondition();
      if (filterCondition) {
        dispatch(
          fetchFilterDataAsync({
            axiosInstance: axiosInstance,
            queryTable: filterCondition.filterTable,
            filtersets: [filterCondition],
            filter_logic: "1",
            baseURL: baseURL,
            organisation_id,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching filter condition:", error);
    }
  };

  const handleSave = async () => {
    // Validate mandatory custom fields
    if (pitchState.fieldValues && pitchState.fieldValues.length > 0) {
      const missingMandatoryFields = pitchState.fieldValues.filter(
        (field) =>
          field.mandatory === 1 &&
          (field.value === undefined ||
            field.value === null ||
            (typeof field.value === "string" && !field.value.trim()))
      );

      if (missingMandatoryFields.length > 0) {
        const fieldNames = missingMandatoryFields
          .map((field) => `"${field.field_name}"`)
          .join(", ");
        toast.error(`Please fill in all mandatory fields: ${fieldNames}`);
        return;
      }
    }

    setIsSaving(true);
    const capitalizeFirstLetter = (str) =>
      str.charAt(0).toUpperCase() + str.slice(1);

    try {
      // Prepare custom field values object exactly as they come from state
      const customFieldValues = {};
      if (pitchState.fieldValues && pitchState.fieldValues.length > 0) {
        pitchState.fieldValues.forEach((field) => {
          if (field.value !== undefined && field.value !== null) {
            // Format datetime fields to YYYY-MM-DD HH:MM:SS
            if (field.id === "datetime" || field.id == "ZNQ534302620714") {
              customFieldValues[field.id] = field.value
                ? new Date(field.value)
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " ")
                : "";
            }
            // Format date fields to YYYY-MM-DD (keep as is since it's already correct)
            else if (
              field.field_type === "date" ||
              field.id == "ZNQ462542650720"
            ) {
              customFieldValues[field.id] = field.value;
            }
            // For all other field types
            else {
              customFieldValues[field.id] = field.value;
            }
          }
        });
      }

      // Validate contacts if pitch is restricted access
      if (
        pitchState.pitchAccess === 0 &&
        pitchState.pitchContacts.length === 0
      ) {
        toast.error("Add at least one Contact for Restricted Access Pitch");
        setIsSaving(false);
        return;
      }

      const createPitchData = {
        name: pitchState.pitchName,
        opportunity_id:
          pitchState.entityType === "opportunity" ||
          pitchState.entityType === "deal"
            ? pitchState.entityId
            : null,
        account_id:
          pitchState.entityType === "account" ||
          pitchState.entityType === "company"
            ? pitchState.entityId
            : null,
        created_by: viewer_id,
        title: pitchState.title,
        headline: pitchState.headline,
        description: pitchState.description,
        pitch_layout: pitchState.pitchLayout.id,
        content_groups: pitchState.content_groups,
        sections: pitchState.sections.map((section, index) => ({
          name: section.name,
          order: index + 1,
          contents: section.contents.map((content, contentIndex) => ({
            sectionName: section.name,
            content: content.content || content.id,
            name: content.name,
            tagline: content.tagline,
            arrangement: contentIndex + 1,
            mimetype: content.mimetype,
            source: content.source,
            content_link: content.content_link,
            group_name: content.group_name,
          })),
        })),
        public_access: pitchState.pitchAccess,
        primary_color: pitchState.primaryColor,
        crm_type: pitchState.isTofu
          ? "TOFU"
          : capitalizeFirstLetter(pitchState.crmType),
        disable_otp: pitchState.disableOTP ? 1 : 0,
        business_email_only: pitchState.businessEmailOnly ? 1 : 0,
        viewer_id: viewer_id,
        organisation_id: organisation_id,
        pitch_translate: [],
        custom_field_values: customFieldValues, // Add custom fields exactly as they are
      };

      if (translateAccess && pitchState.languages.length > 0) {
        createPitchData.pitch_translate = pitchState.languages.map(
          (lang) => lang.value
        );
      }

      const createPitchResponse = await axiosInstance.post(
        "/create-pitch-with-sections-and-contents",
        createPitchData
      );

      const pitchId = createPitchResponse.data.pitch.id;

      // Upload images
      const formData = new FormData();
      formData.append("pitch_id", pitchId);
      formData.append("background_image", pitchState.images.background.file);
      formData.append(
        "background_login_image",
        pitchState.images.loginBackground.file
      );
      if (pitchState.images.clientLogo?.file) {
        formData.append("client_logo", pitchState.images.clientLogo.file);
      }
      formData.append("viewer_id", viewer_id);
      formData.append("organisation_id", organisation_id);

      await axiosInstance.post("/upload-bg-and-client-logo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update pitch contacts
      const formattedContactsData = {
        viewerId: viewer_id,
        pitchId: pitchId,
        contacts: [],
        domains: [],
      };

      pitchState?.pitchContacts?.forEach((item) => {
        const { id, contactId, firstName, lastName, email, domain } = item;
        if (domain) formattedContactsData.domains.push(domain);
        if (email) {
          const contact = { email, firstName, lastName };
          if (contactId) contact.contactId = contactId;
          formattedContactsData.contacts.push(contact);
        }
      });
      await axiosInstance.post("/updatePitchContacts", formattedContactsData);

      // Upload highlight videos
      if (pitchState.highlightVideos.length > 0) {
        const videoFormData = new FormData();
        videoFormData.append("created_by", viewer_id);
        videoFormData.append("pitch_id", pitchId);
        videoFormData.append(
          "tagline",
          JSON.stringify(
            pitchState.highlightVideos.map((video) => video.tagline)
          )
        );
        pitchState.highlightVideos.forEach((video) => {
          videoFormData.append("files", video.file);
        });
        await axiosInstance.post("/highlight-video-upload", videoFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Update pitch teams
      if (
        pitchState.selectedUsers.length > 0 ||
        pitchState.selectedGroups.length > 0
      ) {
        await axiosInstance.post("/update-pitch-teams", {
          pitch_id: pitchId,
          userIds: pitchState.selectedUsers,
          groupIds: pitchState.selectedGroups,
          viewer_id: viewer_id,
          organisation_id: organisation_id,
        });
      }

      toast.success("Pitch created successfully!");
      setIsOpen(false);
      setValidationErrors({});
      dispatch(resetPitchForm());
    } catch (error) {
      console.error("Error creating pitch:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create pitch. Please try again."
      );
    } finally {
      setIsSaving(false);
      dispatch(
        fetchPitchesAsync({
          sortColumn: "name",
          sortOrder: "ASC",
          viewer_id: viewer_id,
          baseURL: baseURL,
          organisation_id,
        })
      );
      await fetchFilterCondition();
    }
  };

  return (
    <div className="absolute">
      <GlobalButton
        addPitch={() => {
          setStep(1);
          setValidationErrors({});
          setIsOpen(true);
        }}
      />

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[99] ">
          <div className="shadow-2xl w-[98%]  h-[98%] relative bg-white flex flex-col rounded-md ">
            <div className="sticky top-0 bg-white border-b px-6 py-4 shadow-md z-10 rounded-md">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {step === 1
                    ? "Create Pitch - Basic Info"
                    : "Create Pitch - Advanced Configuration"}
                </h2>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setValidationErrors({});
                    dispatch(resetPitchForm());
                  }}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                >
                  <MdClose size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full cursor-pointer ${
                      step >= 1
                        ? "bg-[#014d83] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={handleBack}
                  >
                    1
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      step >= 1 ? "text-[#014d83] font-medium" : "text-gray-500"
                    }`}
                  >
                    Basic Information
                  </span>
                </div>
                <div
                  className={`w-12 h-1 mx-2 ${
                    step >= 2 ? "bg-[#014d83]" : "bg-gray-200"
                  }`}
                ></div>
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full cursor-pointer ${
                      step >= 2
                        ? "bg-[#014d83] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={handleNext}
                  >
                    2
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      step >= 2 ? "text-[#014d83] font-medium" : "text-gray-500"
                    }`}
                  >
                    Advanced Configuration
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-hidden flex flex-row">
              <div
                className={`h-full transition-opacity duration-300 w-[35%] ${
                  isTransitioning ? "opacity-0" : "opacity-100"
                }`}
              >
                {renderStep()}
              </div>

              {/* Vertical divider */}
              <div className="w-px bg-gray-300" />

              <div className="w-[65%]">
                <DynamicsPreview />
              </div>
            </div>

            <div className="flex justify-end p-2 border-t shadow-md ">
              {step === 1 ? (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setValidationErrors({});
                      dispatch(resetPitchForm());
                    }}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={
                      pitchState.activePitchCheck.exists || pitchState.isLoading
                    }
                    className={`ml-4 px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md ${
                      pitchState.activePitchCheck.exists || pitchState.isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Next
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleBack}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={
                      isSaving ||
                      pitchState.isAddingSection ||
                      pitchState.isTaglineFormOpen
                    }
                    className={`ml-4 px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md ${
                      isSaving ||
                      pitchState.isAddingSection ||
                      pitchState.isTaglineFormOpen
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddPitchPopUPV2;
