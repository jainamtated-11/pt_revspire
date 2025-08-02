import { useContext, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import EditPitchStep2 from "./EditPitchStep2";
import EditPitchStep1 from "./EditPitchStep1";
import { MdClose } from "react-icons/md";
import toast from "react-hot-toast";
import {
  resetPitchForm,
  clearAuthUrl,
  setIsOpen,
} from "../../../../features/pitch/editPitchSlice";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../context/GlobalState";
import {
  fetchPitchLayoutsAsync,
  fetchPitchSectionsAndContentsAsync,
  fetchRecordNameThunk,
} from "../../../../features/pitch/editPitchSlice";
import { setPitchId } from "../../../../features/pitch/editPitchSlice";
import WarningDialog from "../../../../utility/WarningDialog";
import { fetchPitchesAsync } from "../../../../features/pitch/pitchSlice";
import { fetchFilterDataAsync } from "../../../../features/filter/fliterSlice";
import DynamicsPreview from "./DynamicsPreview";

function EditPitchPupUpV2({ pitchToEdit, setPitchToEdit, activatePitch }) {
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();
  const [step, setStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pitchState = useSelector((state) => state.editPitchSlice);
  const { viewer_id, organisation_id, baseURL } = useContext(GlobalContext);
  const [openWarningDialog, setOpenWarningDialog] = useState(false); // State to control the warning dialog
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const path = window.location.href;
  // Open modal effect
  useEffect(() => {
    if (pitchToEdit) {
      dispatch(setPitchId(pitchToEdit));
    }
  }, [pitchToEdit, dispatch]);

  const pitchId = pitchState.pitchId;

  useEffect(() => {
    dispatch(fetchPitchLayoutsAsync({ axiosInstance, viewer_id }));
  }, []);

  useEffect(() => {
    if (pitchId)
      dispatch(fetchPitchSectionsAndContentsAsync({ axiosInstance, pitchId }));
  }, [pitchId]);

  useEffect(() => {
    if (pitchState.entityId) {
      dispatch(
        fetchRecordNameThunk({
          axiosInstance,
          data: {
            viewer_id,
            entityId: pitchState.entityId,
            path,
            pitch: pitchState.crmType, // should include `crm_type` and optionally `organisation`
            organisation_id,
          },
        })
      );
    }
  }, [pitchState.entityId]);

  // Function to render the step content
  const renderStep = () => {
    return step === 1 ? (
      <EditPitchStep1 errors={validationErrors} />
    ) : (
      <EditPitchStep2 />
    );
  };

  // Validate required fields for step 1
  const validateStep1 = () => {
    const errors = {};
    let isValid = true;

    // Check pitch name
    if (!pitchState.pitchName.trim()) {
      errors.pitchName = "Pitch name is required";
      isValid = false;
    }

    // Check pitch layout
    if (!pitchState.pitchLayout.id) {
      errors.pitchLayout = "Please select a layout";
      isValid = false;
    }

    // Check title
    if (!pitchState.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    // Check headline
    if (!pitchState.headline.trim()) {
      errors.headline = "Headline is required";
      isValid = false;
    }

    // Check description
    if (!pitchState.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Handle next button click with transition
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

  // Handle back button click with transition
  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(1);
      setIsTransitioning(false);
    }, 300);
  };

  // Funciton to capitalize
  const capitalizeFirstLetter = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

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

  // Handle save button click
  const handleSave = async () => {
    setIsSaving(true);
    setPitchToEdit(null);
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

    try {
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

      const updatedSections = pitchState.sections.map(
        (section, sectionIndex) => ({
          ...section,
          order: sectionIndex + 1,
          contents: section.contents.map((content, contentIndex) => {
            const { pitch_content_group, pitch_content_group_name, ...rest } =
              content;

            const isValidGroup =
              pitch_content_group && !pitch_content_group.startsWith("temp-");

            return {
              ...rest,
              ...(isValidGroup
                ? { group_id: pitch_content_group }
                : pitch_content_group_name
                ? { group_name: pitch_content_group_name }
                : {}),
              arrangement: contentIndex + 1,
            };
          }),
        })
      );

      // Prepare data for edit pitch
      const editPitchData = {
        pitchId: pitchState.pitchId,
        updated_by: viewer_id,
        pitchData: {
          name: pitchState.pitchName,
          title: pitchState.title,
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
          crm_type: pitchState.isTofu
            ? "TOFU"
            : capitalizeFirstLetter(pitchState.crmType),
          headline: pitchState.headline,
          description: pitchState.description,
          pitch_layout: pitchState.pitchLayout.id,
          disable_otp: pitchState.disableOTP ? 1 : 0,
          business_email_only: pitchState.businessEmailOnly ? 1 : 0,
          public_access: pitchState.pitchAccess,
          primary_color: pitchState.primaryColor,
          ...(pitchState.languages.length > 0 && {
            pitch_translate: pitchState.languages.map((lang) => lang.value),
          }),
        },
        content_groups: pitchState.content_groups,
        sections: updatedSections,
        custom_field_values: customFieldValues, // Add custom fields exactly as they are
      };

      // 1. First API call: Edit pitch with sections and contents
      await axiosInstance.post(
        `/edit-pitch-with-sections-and-contents`,
        editPitchData
      );

      // 2. Upload images if editing images
      if (pitchState.isEditingImages) {
        const formData = new FormData();
        formData.append("pitch_id", pitchState.pitchId);
        formData.append("background_image", pitchState.images.background.file);
        formData.append(
          "background_login_image",
          pitchState.images.loginBackground.file
        );
        if (pitchState.images.clientLogo.file) {
          formData.append("client_logo", pitchState.images.clientLogo.file);
        }
        formData.append("viewer_id", viewer_id);
        formData.append("organisation_id", organisation_id);

        await axiosInstance.post("/upload-bg-and-client-logo", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // 3. Handle highlight videos

      const newVideos = pitchState.highlightVideos.filter(
        (video) => video.file
      );
      if (newVideos.length > 0) {
        const videoFormData = new FormData();
        videoFormData.append("created_by", viewer_id);
        videoFormData.append("pitch_id", pitchState.pitchId);

        const taglines = newVideos.map((video) => video.tagline);
        videoFormData.append("tagline", JSON.stringify(taglines));

        newVideos.forEach((video) => {
          videoFormData.append("files", video.file);
        });

        await axiosInstance.post("/highlight-video-upload", videoFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const path = window.location.href;
      //DELETE HIGHLIGHT VIDEOS
      if (
        pitchState.deleteHightlightVideoIds &&
        pitchState.deleteHightlightVideoIds.length > 0
      ) {
        await axiosInstance.post(`/highlight-video-delete`, {
          viewerId: viewer_id,
          video_ids: pitchState.deleteHightlightVideoIds,
          originURL: path,
        });
      }

      // 4. Update pitch contacts
      const formattedContactsData = {
        viewerId: viewer_id,
        pitchId: pitchState.pitchId,
        contacts: [],
        domains: [],
      };

      pitchState.pitchContacts.forEach((item) => {
        if (item.domain) {
          formattedContactsData.domains.push(item.domain);
        }

        // Only include contacts with an email
        if (item.email) {
          const contact = {
            id: item.id,
            firstName: item.firstName || undefined,
            lastName: item.lastName || undefined,
            email: item.email,
            contactId: item.contactId || undefined,
          };

          formattedContactsData.contacts.push(contact);
        }
      });

      // Remove duplicates from domains array
      formattedContactsData.domains = [
        ...new Set(formattedContactsData.domains),
      ];

      await axiosInstance.post("/updatePitchContacts", formattedContactsData);

      // 5. Update pitch teams
      if (
        pitchState.selectedUsers.length > 0 ||
        pitchState.selectedGroups.length > 0
      ) {
        await axiosInstance.post("/update-pitch-teams", {
          pitch_id: pitchState.pitchId,
          userIds: pitchState.selectedUsers,
          groupIds: pitchState.selectedGroups,
          viewer_id,
          organisation_id,
        });
      }

      toast.success("Pitch updated successfully!");
      dispatch(setIsOpen(false));
      setValidationErrors({});
      dispatch(resetPitchForm());
    } catch (error) {
      console.error("Error updating pitch:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update pitch. Please try again."
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
    <div className="">
      {pitchState.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[99]">
          <div className="shadow-2xl w-[98%] h-[98%] relative bg-white flex flex-col rounded-md">
            {openWarningDialog && (
              <WarningDialog
                title="Pitch is deactivated !"
                content="This pitch is deactivated and cannot be edited. Would you like to activate this pitch. Click on confirm to activate the pitch."
                onCancel={() => {
                  dispatch(resetPitchForm());
                  setPitchToEdit(null);
                  setOpenWarningDialog(false);
                }}
                onConfirm={async () => {
                  await activatePitch(); // Call the passed handler
                  setOpenWarningDialog(false); // Close the dialog after activation
                }}
                confrimMessage="Activate"
              />
            )}

            {/* Modal Content Wrapper */}
            {!pitchState.serviceCrmAndUserCrmMatch && (
              <WarningDialog
                title="CRMs are not Matching !!"
                content="Service CRM and User CRM are not matching. Please check your service CRM or contact your admin to edit this pitch."
                onCancel={() => {
                  dispatch(resetPitchForm());
                  setPitchToEdit(null);
                  dispatch(setIsOpen(false));
                }}
                isLoading={false}
              />
            )}

            {pitchState.authUrl && (
              <WarningDialog
                title="Warning"
                content="Access tokens for your Service User are expired. Reconnect Service User to keep editing the pitch."
                onCancel={() => clearAuthUrl("")}
                onConfirm={() => (window.location.href = pitchState.authUrl)}
                isLoading={false}
              />
            )}
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 shadow-md z-10 rounded-md">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {step === 1
                    ? "Edit Pitch - Basic Info"
                    : "Edit Pitch - Advanced Configuration"}
                </h2>
                <button
                  onClick={() => {
                    dispatch(setIsOpen(false));
                    setPitchToEdit(null);
                    setValidationErrors({});
                    dispatch(resetPitchForm());
                  }}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                >
                  <MdClose size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Progress indicator */}
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
                  ></div>
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
            {/* Step Content with transition */}
            <div className="h-full overflow-hidden flex flex-row">
              <div
                className={`h-full transition-opacity duration-300 w-[35%] ${
                  isTransitioning ? "opacity-0" : "opacity-100"
                }`}
              >
                {renderStep()}
              </div>
              {/* Vertical divider */}
              <div className="w-px bg-gray-300" />

              <div className="w-[65%] h-full">
                {!pitchState.pitchDataLoading && (
                  <DynamicsPreview setLoadingState={setIsPreviewLoading} />
                )}
              </div>
            </div>
            {/* Footer Navigation */}
            <div className="flex justify-end p-4 border-t shadow-md">
              {step === 1 ? (
                <>
                  <button
                    onClick={() => {
                      dispatch(setIsOpen(false));
                      setPitchToEdit(null);
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
                      pitchState.pitchDataLoading ||
                      pitchState.layoutsLoading ||
                      isPreviewLoading
                    }
                    className={`ml-4 px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md ${
                      pitchState.pitchDataLoading ||
                      pitchState.layoutsLoading ||
                      isPreviewLoading
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

export default EditPitchPupUpV2;
