import React, { useEffect, useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import ResizableTable from "../../../utility/CustomComponents/ResizableTable.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchPitchStreamsAsync } from "../../../features/pitchStreams/pitchStreamsSlice.js";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import WarningDialog from "../../../utility/WarningDialog.jsx";
import toast from "react-hot-toast";
import { LuLoaderCircle } from "react-icons/lu";
import { IoImagesOutline } from "react-icons/io5";
import { MdOutlineSlowMotionVideo } from "react-icons/md";
import { FcFolder } from "react-icons/fc";
import { FaRegFileExcel, FaRegFilePdf, FaRegFileWord } from "react-icons/fa";
import { BsFiletypePptx } from "react-icons/bs";
import { GrDocumentPpt } from "react-icons/gr";
import { LuFileSpreadsheet } from "react-icons/lu";
import { TbFileTypeDocx } from "react-icons/tb";
import { FiLink } from "react-icons/fi";
import { CiFileOn } from "react-icons/ci";
import { AiOutlineYoutube } from "react-icons/ai";
import { RiVimeoLine } from "react-icons/ri";

function AddPitchStreams({ onCancel, sections, setSections }) {
  const dispatch = useDispatch();
  const pitchStreams = useSelector((state) => state.pitchStreams.pitchStreams);
  const loading = useSelector((state) => state.pitchStreams.loading);
  const { viewer_id, baseURL, globalOrgId } = useContext(GlobalContext);
  const [streamSections, setStreamSections] = useState([]);
  const [placeholderData, setPlaceholderData] = useState([]);
  const [showPlaceholderScreen, setShowPlaceholderScreen] = useState(false);
  const [replacements, setReplacements] = useState({});
  const axiosInstance = useAxiosInstance();
  const [TemplateError, setTemplateError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeContentIndex, setActiveContentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [localSearchInput, setLocalSearchInput] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "Updated At",
    direction: "desc",
  });

  useEffect(() => {
    dispatch(
      fetchPitchStreamsAsync({
        sortColumn: "name",
        sortOrder: "ASC",
        viewer_id: viewer_id,
        baseURL: baseURL,
        organisation_id: globalOrgId,
      })
    );
  }, [dispatch]);

  // Transform pitch streams for display
  const transformPitchStream = (pitchStream) => ({
    ...pitchStream,
    "Created At": pitchStream.created_at || "N/A",
    "Created By": pitchStream.created_by_name || "N/A",
    "Updated By": pitchStream.updated_by_name || "N/A",
    "Updated At": pitchStream.updated_at || "N/A",
  });

  const transformedPitchStreams = pitchStreams.map(transformPitchStream);

  // Filter pitch streams based on local search
  const filteredPitchStreams = localSearchInput
    ? transformedPitchStreams.filter((stream) =>
        stream.name.toLowerCase().includes(localSearchInput.toLowerCase())
      )
    : transformedPitchStreams;

  const columns = [
    "name",
    "owner",
    "Created By",
    "Created At",
    "Updated By",
    "Updated At",
    "Active",
  ];

  const rowData = [
    "name",
    "owner_name",
    "created_by_name",
    "created_at",
    "updated_by_name",
    "updated_at",
    "active",
  ];

  const OnClickHandler = async (id) => {
    setIsLoading(true);
    const loadingToastId = toast.loading("Loading Placeholders...");
    try {
      const response = await axiosInstance.get(
        `/retrieve-pitch-sections-and-contents/${id}`
      );

      // Transform pitchSections data: rename content_mimetype to mimetype
      const transformedPitchSections = response.data.pitchSections.map(
        (section) => ({
          ...section,
          contents: section.contents.map((content) => ({
            ...content,
            mimetype: content.content_mimetype, // Add mimetype field
            // content_mimetype: undefined, // Optionally remove the original field
          })),
        })
      );
      setStreamSections(transformedPitchSections);
      const placeHolderStatus = await fetchPlaceholders(
        transformedPitchSections
      );

      if (response.status === 200) {
        toast.dismiss(loadingToastId);
        toast.success("Pitch Streams fetched Successfully");
      }

      if (placeHolderStatus) {
        setShowPlaceholderScreen(true);
      } else {
        const cleanedTransformedSections = transformedPitchSections.map(
          (section) => {
            return {
              name: section.name,
              contents: section.contents.map((content) => ({
                content_link: content.content_link,
                content_mimetype: content.content_mimetype,
                mimetype: content.content_mimetype,
                tagline: content.tagline,
                arrangement: content.arrangement,
                content: content.content_id,
                content_id: content.content_id,
                content_source: content.content_source,
                content_size: 0.0,
                name: content.content_name,
              })),
            };
          }
        );
        console.log(
          "cleanedTransformedSections>>>>",
          cleanedTransformedSections
        );
        const mergedSections = [...sections, ...cleanedTransformedSections];
        setSections(mergedSections);
        onCancel();
      } // Show the placeholder replacement screen
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Error Adding Pitch Streams");
      console.log("Response.error", error);
    } finally {
      toast.dismiss(loadingToastId);
      setIsLoading(false);
    }
  };

  const getIcon = (content) => {
    if (content.source?.toLowerCase() === "youtube") {
      return <AiOutlineYoutube className="w-5 h-5 text-red-600" />;
    }
    if (content.source?.toLowerCase() === "vimeo") {
      return <RiVimeoLine className="w-5 h-5 text-secondary" />;
    }

    const iconMap = {
      folder: <FcFolder className="w-5 h-5" />,
      "application/pdf": <FaRegFilePdf className="w-5 h-5 text-gray-500" />,
      "image/jpeg": <IoImagesOutline className="w-5 h-5 text-gray-500" />,
      "image/png": <IoImagesOutline className="w-5 h-5 text-gray-500" />,
      "application/vnd.ms-excel": (
        <FaRegFileExcel className="w-5 h-5 text-gray-500" />
      ),
      "application/msword": <FaRegFileWord className="w-5 h-5 text-gray-500" />,
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        <BsFiletypePptx className="w-5 h-5 text-gray-500" />,
      "application/vnd.ms-powerpoint": (
        <GrDocumentPpt className="w-5 h-5 text-gray-500" />
      ),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (
        <LuFileSpreadsheet className="w-5 h-5 text-gray-500" />
      ),
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        <TbFileTypeDocx className="w-5 h-5 text-gray-500" />,
      "application/url": <FiLink className="w-5 h-5 text-gray-500" />,
      "application/octet-stream": (
        <CiFileOn className="w-5 h-5 text-gray-500" />
      ),
      "video/mp4": (
        <MdOutlineSlowMotionVideo className="w-5 h-5 text-gray-500" />
      ),
    };

    return (
      iconMap[content.mimetype] || (
        <CiFileOn className="w-5 h-5 text-gray-500" />
      )
    );
  };

  const loadPreview = async (content) => {
    try {
      setIsProcessing(true);
      setPreviewContent(content);

      // If we already have a SAS URL, use it directly
      if (content.sasUrl) {
        setPreviewUrl(content.sasUrl);
        setIsProcessing(false);
        return;
      }

      // Otherwise fetch the preview URL
      const res = await axiosInstance.post(
        "/retrieve-document-placeholders",
        { contentId: content.contentId },
        { withCredentials: true }
      );

      if (res.data?.sasUrl) {
        setPreviewUrl(res.data.sasUrl);
        // Update the content with the SAS URL
        setPlaceholderData((prev) =>
          prev.map((item) =>
            item.contentId === content.contentId
              ? { ...item, sasUrl: res.data.sasUrl }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error loading preview:", error);
      toast.error("Failed to load document preview");
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchPlaceholders = async (sections) => {
    const placeholderPromises = sections.flatMap((section) =>
      section.contents
        .filter(
          (content) =>
            content.mimetype ===
              "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
            content.mimetype ===
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        .map((content) =>
          axiosInstance
            .post("/retrieve-document-placeholders", {
              contentId: content.content_id,
              viewer_id: viewer_id,
              organisation_id: globalOrgId,
            })
            .then((response) => ({
              sectionId: section.id,
              contentId: content.content_id,
              contentName: content.content_name,
              placeholders: response.data.placeholders || [],
              placeholdersLength: response.data.placeholders.length || 0, // Store length
              sasUrl: response.data.sasUrl,
            }))
            .catch(() => ({
              sectionId: section.id,
              contentId: content.content_id,
              contentName: content.content_name,
              placeholders: [],
              placeholdersLength: 0, // Ensure 0 if request fails
              sasUrl: null,
            }))
        )
    );

    console.log("Placeholder Promises =====", placeholderPromises);

    try {
      const responses = await Promise.all(placeholderPromises);
      const validPlaceholderData = responses.filter(
        (response) => response.placeholders.length > 0
      );

      setPlaceholderData(validPlaceholderData);

      return validPlaceholderData.length > 0;
    } catch (error) {
      console.error("Error fetching placeholders:", error);
    }
  };

  const handleReplacementChange = (contentId, placeholder, value) => {
    setReplacements((prev) => ({
      ...prev,
      [`${contentId}-${placeholder}`]: value, // Store replacement value
    }));
  };

  const handleSaveReplacements = async () => {
    setIsLoading(true);
    const loadingToastId = toast.loading("Saving Replacements...");

    try {
      let updatedStreamSections = JSON.parse(JSON.stringify(streamSections));

      for (const item of placeholderData) {
        const payload = {
          originalContentId: item.contentId,
          folder_id: "",
          replacements: Object.keys(replacements).reduce((acc, key) => {
            if (key.startsWith(`${item.contentId}-`)) {
              const placeholder = key.split("-")[1];
              // Only include if value exists
              if (replacements[key]) {
                acc[placeholder] = replacements[key];
              }
            }
            return acc;
          }, {}),
          sasUrl: item.sasUrl,
          created_by: viewer_id,
          viewer_id: viewer_id,
          organisation_id: globalOrgId,
        };

        const response = await axiosInstance.post(
          "/render-document-with-placeholders",
          payload
        );

        updatedStreamSections = updatedStreamSections.map((section) => ({
          name: section.name,
          contents: section.contents.map((content) => {
            if (content.content_id === item.contentId) {
              const updatedContent = {
                content_link: content.content_link,
                content_mimetype: response.data.result.newContentMimetype,
                mimetype: response.data.result.newContentMimetype,
                tagline: content.tagline,
                arrangement: content.arrangement,
                content: response.data.result.newContentId,
                content_id: response.data.result.newContentId,
                content_source: response.data.result.newContentSource,
                name: response.data.result.contentName,
                content_name: response.data.result.contentName,
                content_size: 0.0,
              };

              if (updatedContent.id) {
                delete updatedContent.id;
              }

              return updatedContent;
            } else {
              const otherContent = {
                ...content,
                name: content.content_name,
                content: content.content_id,
              };

              if (otherContent.id) {
                delete otherContent.id;
              }
              if (otherContent.content_id) {
                delete otherContent.content_id;
              }

              return otherContent;
            }
          }),
        }));
      }

      setStreamSections(updatedStreamSections);
      const mergedSections = [...sections];

      updatedStreamSections.forEach((newSection) => {
        const existingSectionIndex = mergedSections.findIndex(
          (section) => section.name === newSection.name
        );

        if (existingSectionIndex !== -1) {
          mergedSections[existingSectionIndex].contents = [
            ...mergedSections[existingSectionIndex].contents,
            ...newSection.contents,
          ];
        } else {
          mergedSections.push(newSection);
        }
      });

      setSections(mergedSections);
      onCancel();
      toast.dismiss(loadingToastId);
      toast.success("Replacements saved successfully");
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error("Error saving replacements:", error);
      toast.error("Error saving replacements");
      if (error.response?.data?.error?.name == "TemplateError") {
        setTemplateError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Use effect to select the default first content and render it
  useEffect(() => {
    if (placeholderData.length > 0) {
      // Auto-select the first file
      setActiveContentIndex(0);
      loadPreview(placeholderData[0]);
    }
  }, [placeholderData]);

  return (
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 shadow-xl w-full max-w-6xl rounded-2xl">
          {TemplateError && (
            <WarningDialog
              title="Template Error "
              content="One or more of your placeholder files are not properly formatted make sure you have added placeholders in correct format, i.e. {placeholder name} "
              onCancel={() => {
                setTemplateError(false);
                onCancel();
              }}
            />
          )}

          <div className="flex flex-col justify-between items-center">
            <div className="sticky top-0 bg-white border-b px-6 py-3 shadow-md z-10 w-full rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {showPlaceholderScreen
                    ? "Replace Placeholders"
                    : "Choose Pitch Streams"}
                </h3>
                <button
                  type="button"
                  className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => {
                    onCancel();
                  }}
                >
                  <FontAwesomeIcon
                    className="text-gray-500 text-2xl"
                    icon={faXmark}
                  />
                </button>
              </div>
            </div>

            {!showPlaceholderScreen && (
              <div className="w-full pl-4 pr-6 pt-4 pb-4">
                <input
                  type="text"
                  className="bg-white w-full border border-gray-300 text-gray-900 text-sm rounded-lg block h-10 pl-3 pr-3 transition-all"
                  placeholder="Search pitch streams..."
                  value={localSearchInput}
                  onChange={(e) => setLocalSearchInput(e.target.value)}
                />
              </div>
            )}

            {showPlaceholderScreen ? (
              <div className="w-full flex flex-col md:flex-row h-[calc(90vh-120px)] ">
                {/* Document Preview */}
                <div className="w-full md:w-1/2 h-1/2 sm:h-full border-r border-gray-200 p-4 bg-gray-50 overflow-y-auto ">
                  <div className="h-full w-full flex flex-col ">
                    <h4 className="text-md font-semibold text-gray-700 mb-3">
                      Document Preview: {previewContent?.contentName}
                    </h4>
                    <div className="flex-1 border border-gray-300 rounded-lg bg-white overflow-hidden relative">
                      {previewUrl ? (
                        <iframe
                          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                            previewUrl
                          )}`}
                          className="w-full h-full"
                          frameBorder="0"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                          {isProcessing ? (
                            <div className="text-center">
                              <p>Loading preview...</p>
                              <LuLoaderCircle className="animate-spin mx-auto mt-2" />
                            </div>
                          ) : (
                            <p>No preview available</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Placeholder Replacement Form */}
                <div className="w-full md:w-1/2 h-1/2 sm:h-full p-4 overflow-y-auto">
                  <div className="space-y-6 border border-gray-500">
                    {placeholderData.map((item, contentIndex) => (
                      <div
                        key={item.contentId}
                        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
                          contentIndex === activeContentIndex
                            ? "border-secondary"
                            : ""
                        }`}
                        onClick={() => {
                          setActiveContentIndex(contentIndex);
                          loadPreview(item);
                        }}
                      >
                        <div className="flex items-center mb-4">
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 mr-3">
                            {getIcon(item)}
                          </div>
                          <div>
                            <h4 className="text-md font-bold text-gray-800">
                              {item.contentName}
                            </h4>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.placeholders.length} placeholders
                            </div>
                          </div>
                        </div>

                        {contentIndex === activeContentIndex && (
                          <div className="grid grid-cols-1 gap-4">
                            {item.placeholders.map((placeholder, index) => (
                              <div key={index} className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Replace "{placeholder}" (optional)
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary transition-colors"
                                  placeholder={`Leave blank to keep "${placeholder}"`}
                                  value={
                                    replacements[
                                      `${item.contentId}-${placeholder}`
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleReplacementChange(
                                      item.contentId,
                                      placeholder,
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 pt-0 w-full h-96 overflow-y-auto">
                <ResizableTable
                  data={filteredPitchStreams}
                  columnsHeading={columns}
                  loading={loading}
                  rowKeys={rowData}
                  heightNotFixed={true}
                  noCheckbox={true}
                  OnClickHandler={OnClickHandler}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  searchTerm={localSearchInput}
                />
              </div>
            )}

            <div
              className="space-x-16 flex justify-end p-2 border-t shadow-md z-10 w-full"
              style={{ boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="mt-1 flex space-x-[20px] justify-between mr-6 ">
                <button
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  onClick={() => {
                    onCancel();
                  }}
                >
                  Cancel
                </button>

                {showPlaceholderScreen ? (
                  <button
                    className={`px-6 py-2 text-sm font-medium w-[100px] flex justify-center items-center text-white ${
                      isLoading
                        ? "bg-gray-400 text-black"
                        : "bg-[#014d83] hover:bg-[#015896]"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500`}
                    onClick={handleSaveReplacements}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LuLoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <p>Save</p>
                    )}
                  </button>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPitchStreams;
