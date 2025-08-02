import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchSalesforcePitchContentsRecommendationAsync } from "../../../../features/pitch/editPitchSlice";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../context/GlobalState";
import { useDispatch } from "react-redux";
import ResizableTable from "../../../../utility/CustomComponents/ResizableTable";
import toast from "react-hot-toast";
import Select from "react-select";
import { MdClose } from "react-icons/md";
import { addContentToSection } from "../../../../features/pitch/editPitchSlice";

function ContentRecommendations() {
  const pitchState = useSelector((state) => state.editPitchSlice);
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();
  const { viewer_id } = useContext(GlobalContext);

  const [selectedContentItem, setSelectedContentItem] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedContent, setSelectedContent] = useState({
    sectionName: "",
    content: "",
    name: "",
    tagline: "",
    arrangement: 0,
    mimetype: "",
  });

  const path = window.location.href;
  useEffect(() => {
    console.log("PITCH STATE ID ", pitchState.entityId);
    if (pitchState.entityId) {
      dispatch(
        fetchSalesforcePitchContentsRecommendationAsync({
          axiosInstance,
          viewer_id,
          salesforceId: pitchState.entityId,
          path,
        })
      );
    }
  }, [pitchState.entityId]);

  const handleCheckboxChange = (contentItem) => {
    console.log("CONTENT ITEM in functions", contentItem);
    if (!selectedContentItem.length) {
      // If no items are selected, add the new contentItem
      setSelectedContentItem([contentItem]);
    } else {
      // If there is already an item, check if it matches the id
      if (selectedContentItem[0].id == contentItem.id) {
        // If it matches, remove it
        setSelectedContentItem([]);
      } else {
        // If it doesn't match, replace it with the new contentItem
        setSelectedContentItem([]);
        setSelectedContentItem([contentItem]);
      }
    }
  };

  const handleAddContentToPitch = () => {
    const sectionIndex = pitchState.sections.findIndex(
      (section) => section.name === selectedContent.sectionName
    );
    if (sectionIndex !== -1 && selectedContentItem) {
      const newContent = {
        name: selectedContentItem[0].name,
        content: selectedContentItem[0].id,
        tagline: selectedContent.tagline,
        arrangement: pitchState.sections[sectionIndex].contents.length + 1,
        mimetype: selectedContentItem[0].mimetype,
      };
      const nameExists = pitchState.sections[sectionIndex].contents.some(
        (existingContent) => existingContent.name === newContent.name
      );

      if (nameExists) {
        // setNameExist(true);
        toast.error("Content already present in section");
        // setCheckedItems(new Set());
        setSelectedContent((prevState) => ({
          ...prevState,
          tagline: "",
        }));
      } else {
        dispatch(
          addContentToSection({
            data: {
              index: sectionIndex,
              content: {
                ...newContent,
                arrangement:
                  pitchState.sections[sectionIndex].contents.length + 1,
              },
            },
          })
        );
        setSelectedContentItem(null);
        setSelectedContent((prevState) => ({
          ...prevState,
          tagline: "",
        }));
      }
    }
    setSelectedContentItem([]);
    setIsPopupOpen(false);
  };

  const sectionOptions = pitchState.sections.map((section) => ({
    label: section.name,
    value: section.name,
  }));

  console.log("selectedContentItem", selectedContentItem);
  const NormalDropdownStyles = {
    // Control (main container) styles
    control: (base, { isFocused }) => ({
      ...base,
      minHeight: "40px",
      width: "100%",
      border: "1px solid #e2e8f0",
      borderRadius: "0.375rem",
      boxShadow: isFocused ? "0 0 0 1px #A1C0D5" : "none", // Accent glow
      "&:hover": {
        borderColor: "#D5ABAD", // Primary color on hover
      },
      backgroundColor: "#F8F9FA", // Light background

      fontSize: "0.870rem", // Match your text-sm
    }),

    // Option (individual items) styles
    option: (base, { isSelected, isFocused }) => ({
      ...base,
      backgroundColor: isSelected
        ? "#D5ABAD" // Primary color for selected
        : isFocused
        ? "#f3f4f6"
        : "white",
      color: isSelected ? "white" : "#1F2937", // Dark text
      "&:active": {
        backgroundColor: "#D5ABAD", // Primary color when clicking
      },
      fontSize: "0.875rem", // Match your text-sm
    }),

    multiValue: (base) => ({
      ...base,
      backgroundColor: "#D5ABAD",
      borderRadius: "4px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#FFFFFF",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#FFFFFF",
      "&:hover": {
        backgroundColor: "#D5ABAD",
        color: "#FFFFFF",
      },
    }),
  };
  return (
    <div className="h-[98%] overflow-y-auto p-2">
      {pitchState.isTofu ? (
        <div className="h-full w-full flex flex-grow items-center justify-center bg-gray-100 min-h-0  border-2 rounded-md  border-gray-300">
          <p className="text-center font-semibold text-gray-400 px-6">
            Can't Have Content Recommendations While Creating TOFU Pitch
          </p>
        </div>
      ) : (
        <div className="h-full w-full ">
          {pitchState.crmType == "zoho" && (
            <div className="h-full w-full flex flex-grow items-center justify-center bg-gray-100 min-h-0  border-2 rounded-md  border-gray-300 mr-4">
              <p className="text-center font-semibold text-gray-400 px-6">
                Content Recommendations for Zoho Pitches are Coming Soon
              </p>
            </div>
          )}
          {pitchState.crmType == "hubspot" && (
            <div className=" h-full w-full  flex flex-grow items-center justify-center bg-gray-100  min-h-0  border-2 rounded-md  border-gray-300 mr-4">
              <p className="text-center font-semibold text-gray-400 px-6">
                Content Recommendations for HubSpot Pitches are Coming Soon
              </p>
            </div>
          )}
          {pitchState.crmType == "pipedrive" && (
            <div className=" h-full w-full  flex flex-grow items-center justify-center bg-gray-100  min-h-0  border-2 rounded-md  border-gray-300 mr-4">
              <p className="text-center font-semibold text-gray-400 px-6">
                Content Recommendations for Pipedrive Pitches are Coming Soon
              </p>
            </div>
          )}
          {pitchState.crmType == "salesforce" && (
            <div>
              <div className="flex flex-row">
                <button
                  className={`btn-secondary px-4 py-1 rounded-md border-2 disabled:cursor-not-allowed`}
                  title={
                    selectedContentItem.length === 0
                      ? "First select a content to add"
                      : ""
                  }
                  onClick={() => setIsPopupOpen(true)}
                  disabled={selectedContentItem.length === 0}
                >
                  Add Content to Section
                </button>
              </div>

              <div className=" pt-2">
                <ResizableTable
                  data={pitchState.contentRecommendations}
                  loading={pitchState.contentRecommendationsLoading}
                  columnsHeading={["Name", "Source", "Type", "Description"]}
                  rowKeys={["name", "source", "mimetype", "description"]}
                  selectedItems={selectedContentItem}
                  OnChangeHandler={handleCheckboxChange}
                  heightNotFixed={true}
                />
              </div>
            </div>
          )}

          {isPopupOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-black opacity-40 backdrop-blur-sm"></div>
              <div className="bg-white rounded-lg shadow-xl z-50 w-[360px]">
                <div className="sticky top-0 bg-white border-b px-6 py-2 shadow-md z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Add to Sections
                    </h2>
                    <button
                      onClick={() => setIsPopupOpen(false)}
                      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                    >
                      <MdClose size={24} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className=" px-4 pt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Section
                    </label>
                    <Select
                      options={sectionOptions}
                      value={sectionOptions.find(
                        (opt) => opt.value === selectedSection
                      )}
                      onChange={(selected) => {
                        setSelectedSection(selected.value);
                        setSelectedContent((prevState) => ({
                          ...prevState,
                          sectionName: selected.value,
                        }));
                      }}
                      styles={{
                        ...NormalDropdownStyles,
                        control: (base, { isFocused }) => ({
                          ...base,
                          minHeight: "40px",
                          width: "100%",
                          border: "1px solid #99A1AF",
                          borderRadius: "0.375rem",
                          boxShadow: isFocused ? "0 0 0 1px #A1C0D5" : "none",
                          "&:hover": {
                            borderColor: "#D5ABAD",
                          },
                          backgroundColor: "#F8F9FA",
                          fontSize: "0.870rem",
                        }),
                      }}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tagline
                    </label>
                    <input
                      value={selectedContent.tagline}
                      onChange={(e) =>
                        setSelectedContent((prevState) => ({
                          ...prevState,
                          tagline: e.target.value,
                        }))
                      }
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none "
                      placeholder="Enter tagline..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-1 mb-3 mr-4">
                  <button
                    onClick={() => setIsPopupOpen(false)}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddContentToPitch}
                    className="ml-2 px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md disabled:cursor-not-allowed"
                    disabled={
                      selectedContent.tagline == "" || selectedSection == ""
                    }
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContentRecommendations;
