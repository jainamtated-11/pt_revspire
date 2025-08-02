import { useState, useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../../../context/GlobalState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faXmark,
  faCheck,
  faPlus,
  faArrowDown,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../../assets/mini-logo.png";
import TableLoading from "../ContentManager/ContentTable/TableLoading.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import ContentTableModal from "./ContentTableModal.jsx";
import {
  fetchPitchesAsync,
  clearSelectedPitch,
} from "../../../features/pitch/pitchSlice.js";
import VideoRecorder from "./VideoRecorder.jsx";
import LoadingSpinner from "../../../utility/LoadingSpinner.jsx";
import EmptyFolderComponent from "../ContentManager/ContentTable/EmptyFolderComponent.jsx";
import { Grid } from "react-loader-spinner";
import { TbEdit, TbPrompt } from "react-icons/tb";
import { MdRemoveCircleOutline } from "react-icons/md";
import { MdSlowMotionVideo } from "react-icons/md";
import ContentModal from "../ContentManager/ContentTable/ContentModal.jsx";
import VersionContentModal from "../ContentManager/ContentTable/VersionContentModal.jsx";
import MiniLogoLoader1 from "../../../assets/LoadingAnimation/MiniLogoLoader1.jsx";
import DriveSelection from "../ContentManager/Operations/DriveSelection.jsx";
import EmptyFolder from "../../../assets/empty-folder.jpg";
import SectionContainer from "./SectionContainer.jsx";
import { useCookies } from "react-cookie";

export default function EditPitchPopUp() {
  // Global State variables
  const {
    viewer_id,
    baseURL,
    setViewContent,
    setContentModalOpen,
    driveSelection,
    directContent,
  } = useContext(GlobalContext);

  const axiosInstance = useAxiosInstance();
  const closeModal = () => {
    setContentModalOpen(false);
  };
  const dispatch = useDispatch();
  const selectedPitches = useSelector((state) => state.pitches.selectedPitches);
  const [cookies] = useCookies(["userData"]);
  const organisation_id = cookies.userData?.organisation?.id;

  // state for conditionally rendering the popup
  const [step, setStep] = useState(0);
  // states for holding image data
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [clientLogo, setClientLogo] = useState(null);
  const [backgroundLoginImage, setBackgroundLoginImage] = useState(null);
  const [crmConnectionName, setCrmConnectionName] = useState("Loading..");
  const [opportunityName, setOpportunityName] = useState("Loading..");

  const [pitchContacts, setPitchContacts] = useState([]);
  const [pitchAccess, setPitchAccess] = useState(0);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [pitchContactsLoading, setPitchContactsLoading] = useState(false);

  const [editImageData, setEditImageData] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [contentVersion, setContentVersion] = useState([]);

  const [viewVersionContent, setViewVersionContent] = useState(null);
  const [selectedVersionContent, setSelectedVersionContent] = useState({});
  const [modalTwoError, setModalTwoError] = useState(false);
  const [newSection, setNewSection] = useState(false);

  const [addSection, setAddSection] = useState({
    addSection: false,
    modalOne: false,
    modalTwo: false,
    sectionName: "",
  });

  const areRequiredFieldsFilled = () => {
    //   // Check if any required field is empty
    if (
      crmConnectionName === "" ||
      // OpportunityName === "" ||
      step1data.name === "" ||
      layouts.selectedLayoutId === "" ||
      step1data.title === "" ||
      step1data.headline === "" ||
      step1data.description === ""
    ) {
      return false;
    }
    // Otherwise, return true
    return true;
  };

  const handleNextStep = () => {
    if (!areRequiredFieldsFilled()) {
      return;
    }

    setEditPitchLoading(true);

    setTimeout(() => {
      fetchData();
      setStep(2);
      setEditPitchLoading(false);
    }, 3000);
  };

  const [isLoading, setIsLoading] = useState(false);
  // states for holding all the layouts
  const [layouts, setLayouts] = useState({
    layouts: [],
    selectedLayoutId: "",
    selectedLayoutName: "",
  });

  const [accounts, setAccounts] = useState({
    accounts: [],
    selectedAccountId: "",
    selectedAccountName: "",
  });

  // Loading States for various fieldsHan
  const [pitchIsLoading, setPitchIsLoading] = useState({
    crmConnections: false,
    opportunityName: false,
    pitchLayouts: false,
  });

  const [editSection, setEditSection] = useState({
    editSection: false,
    modalOne: false,
    modalTwo: false,
    sectionName: "",
    index: -1,
  });

  //-------------------------------Add video States ---------------------------------------------
  const [accessType, setAccessType] = useState("");

  const [videoTagline, setVideoTagline] = useState("");
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // New state for video preview
  const [showPreview, setShowPreview] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null); // To store index of video being previewed
  const [deleteHightlightVideoIds, setDeleteHighlightVideoIds] = useState([]);

  const [contentModalLoading, setContentModalLoading] = useState(false);
  const [versionContentModalLoading, setVersionContentModalLoading] =
    useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  const contentSelectHandler = (content) => {
    const isValidId = content?.id !== "-1";
    setSelectedContent((prevState) => ({
      ...prevState,
      content: isValidId ? content?.id || content.contentId : "",
      name: isValidId ? content?.name || content.contentName : "",
      sectionName: isValidId ? sectionData.name : "",
      arrangement: isValidId ? sectionData.contents.length + 1 : "",
    }));
    setAddSection((prevState) => ({
      ...prevState,
      modalOne: false,
      modalTwo: isValidId ? true : false,
    }));

    if (!isValidId) {
      setSectionData({
        name: "",
        contents: [],
      });
    }
  };

  useEffect(() => {
    if (!Object.keys(directContent).length) return; // Check if directContent is an empty object
    contentSelectHandler(directContent);
  }, [directContent]);

  const handleVideoReady = (url) => {
    setVideoUrl(url);
  };
  console.log("data recieved as prop ", pitchToEdit);
  const deleteVideoHandler = async () => {
    try {
      const response = await axiosInstance.post(
        `/highlight-video-delete
 `,
        {
          viewerId: viewer_id,
          video_ids: deleteHightlightVideoIds,
          originURL: path,
        }
      );
      console.log("Pitch conatcted updated ");
    } catch (error) {
      console.log(
        "Error from  the edit-pitch-with-sections-and-contents",
        error
      );
    }
  };

  const handlePlusButtonClick = () => {
    setShowVideoRecorder(true);
  };

  const handleCloseVideoRecorder = () => {
    setShowVideoRecorder(false);
  };

  const handleHighlightVideoFiles = (file) => {
    const videoUrl = URL.createObjectURL(file);
    setSelectedVideos((prev) => [
      ...prev,
      { video: file, tagline: videoTagline, url: videoUrl },
    ]);
    setShowVideoRecorder(false);

    setVideoTagline("");
    // // Close the !video recorder modal
  };

  const handleVideoTagline = (videoTagline) => {
    setVideoTagline(videoTagline);
  };

  const handleTaglineChange = (index, newTagline) => {
    setSelectedVideos((prev) =>
      prev.map((videoObj, i) =>
        i === index ? { ...videoObj, tagline: newTagline } : videoObj
      )
    );
  };

  const handleVideoDelete = (video, index) => {
    if (video.id) {
      const updateVideos = selectedVideos.filter(
        (item) => item.id !== video.id
      );
      setSelectedVideos(updateVideos);
      setDeleteHighlightVideoIds((prev) => [...prev, video.id]);
    } else {
      const updateVideos = selectedVideos.filter(
        (item, Index) => Index !== index
      );
      setSelectedVideos(updateVideos);
    }
  };

  const handleVideoEdit = (index) => {
    const videoUrl = selectedVideos[index].url;
    console.log("Selected video url", videoUrl);
    console.log("Selected video index", selectedVideos);
    if (videoUrl) {
      setPreviewUrl(videoUrl);
      setPreviewIndex(index);
      setShowPreview(true);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
  };

  //-------------------------------Add Section States ---------------------------------------------

  // state for showing content based add section value

  const [hasError, setHasError] = useState(false);

  // state for holding a section data
  const [sectionData, setSectionData] = useState({ name: "", contents: [] });

  // states holds the data of a selected content
  const [selectedContent, setSelectedContent] = useState({
    sectionName: "",
    content: "",
    name: "",
    tagline: "",
    arrangement: 0,
  });

  const [sections, setSections] = useState([]);

  // ----------------------------------pitch recommendations section---------------------------------------------
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [nameExist, setNameExist] = useState(false);
  const [selectedContentItem, setSelectedContentItem] = useState(null);
  const [selectedSection, setSelectedSection] = useState("");
  const [checkedItems, setCheckedItems] = useState(new Set());

  const handleCheckboxChange = (contentItem) => {
    setCheckedItems((prevCheckedItems) => {
      const newCheckedItems = new Set(prevCheckedItems);
      if (newCheckedItems.has(contentItem.id)) {
        newCheckedItems.delete(contentItem.id);
      } else {
        newCheckedItems.add(contentItem.id);
        setSelectedContentItem(contentItem); // Update selectedContentItem when checked
      }

      setIsButtonEnabled(newCheckedItems.size > 0);
      return newCheckedItems;
    });
  };

  // Function to handle saving content
  const handleSave = () => {
    const sectionIndex = sections.findIndex(
      (section) => section.name === selectedContent.sectionName
    );

    if (sectionIndex !== -1 && selectedContentItem) {
      const newContent = {
        name: selectedContentItem.name,
        content: selectedContentItem.id,
        tagline: selectedContent.tagline,
        arrangement: sections[sectionIndex].contents.length + 1,
      };

      const nameExists = sections[sectionIndex].contents.some(
        (existingContent) => existingContent.name === newContent.name
      );

      if (nameExists) {
        setNameExist(true);
        toast.error("Content already present in section");
        setCheckedItems(new Set());
        setSelectedContent((prevState) => ({
          ...prevState,
          tagline: "",
        }));
      } else {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].contents.push(newContent);

        setCheckedItems(new Set());
        setSections(updatedSections);
        setSelectedContentItem(null);
        setIsButtonEnabled(false); // Disable the button after saving
        setSelectedContent((prevState) => ({
          ...prevState,
          tagline: "",
        }));
      }
    }

    setIsPopupOpen(false);
    setIsButtonEnabled(false);
  };

  useEffect(() => {
    if (sections.length > 0) {
      // Set the first section as the default
      setSelectedSection(sections[0].name);
      setSelectedContent((prevState) => ({
        ...prevState,
        sectionName: sections[0].name,
      }));
    }
  }, [sections, setSelectedContent]);

  const handleChange = (e) => {
    const selectedSectionName = e.target.value;
    setSelectedSection(selectedSectionName);
    setSelectedContent((prevState) => ({
      ...prevState,
      sectionName: selectedSectionName,
    }));
  };

  const [pitchContent, setPitchContent] = useState([]);
  let opportunityId = "";
  selectedPitches.map((pitch) => {
    opportunityId = pitch.opportunity_id;
  });

  const fetchData = async () => {
    try {
      if (!isToggle) {
        const response = await axiosInstance.get(
          `/retrieve-pitch-content-recommendation`,
          {
            params: {
              viewer_id: viewer_id, // replace with actual viewer ID
              opportunity_id: opportunityId, // replace with actual opportunity ID
            },
            withCredentials: true, // Include credentials in the request if necessary
          }
        );
        setPitchContent(response.data);
        console.log(response.data);
        setIsLoading(false); // Update state with fetched data
      }
    } catch (error) {
      console.error("Error fetching pitch content:", error);
    }
  };

  const columns = [
    "",
    "name",
    "created_by",
    "Mimetype",
    "Description",
    "Folder",
  ];
  const contactColumns = ["name", "email", "job title", "country"];

  const tableRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const cols = table.querySelectorAll("th");
    cols.forEach((col) => {
      const resizer = document.createElement("div");
      resizer.className = "resizer";
      resizer.style.height = `${table.offsetHeight}px`;
      col.appendChild(resizer);

      const mouseDownHandler = (e) => {
        setStartX(e.clientX);
        setStartWidth(col.offsetWidth);
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
      };

      const mouseMoveHandler = (e) => {
        const dx = e.clientX - startX;
        col.style.width = `${startWidth + dx}px`;
      };

      const mouseUpHandler = () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      };

      resizer.addEventListener("mousedown", mouseDownHandler);

      return () => {
        resizer.removeEventListener("mousedown", mouseDownHandler);
      };
    });
  }, [startWidth, startX]);

  // ----------------------------------Handler Functions---------------------------------------------

  //handler function for  fetch pitch layouts
  const pitchLayoutHandler = async () => {
    setPitchIsLoading({
      ...pitchIsLoading,
      pitchLayouts: true,
      isLoading: true,
    });
    try {
      const response = await axiosInstance.post(`/all-pitch-layout-names`, {
        withCredentials: true, // Include credentials in the request if necessary
      });
      setLayouts((prevState) => ({
        ...prevState,
        layouts: response.data.pitchLayoutNames,
      }));
    } catch (error) {
      toast.error("Failed to fetch Pitch Layouts");
    } finally {
      setPitchIsLoading({
        ...pitchIsLoading,
        pitchLayouts: false,
        isLoading: false,
      });
    }
  };
  // -------------------------------------------edit States and handler funtions-------------------

  // state for holding the step 1 data or popup one data
  const [step1data, setStep1Data] = useState({
    name: "",
    opportunity_id: "",
    opportunity_name: "",
    account_id: "",
    account_name: "",
    client_logo: null,
    created_by: "",
    title: "",
    headline: "",
    description: "",
    pitch_layout: "",
    background_image: null,
  });

  const [editContentTable, setEditContentTable] = useState(false);

  const path = window.location.href;
  //   handler function for fetching the selected pitch data

  const [editPitchLoading, setEditPitchLoading] = useState(false);

  const [pitchType, setPitchType] = useState(""); //"Account" or "Opportunity"

  const selectedPitchButtonHandler = async (pitchToEdit) => {
    setEditPitchLoading(true);
    try {
      const response = await axiosInstance.get(
        `/retrieve-pitch-sections-and-contents/${
          pitchToEdit ? pitchToEdit : selectedPitches[0].id
        }`,
        {
          withCredentials: true,
        }
      );

      console.log("Pitch data from response:", response.data.pitch);

      setContentVersion(response.data.contentVersionUpdate);
      setSelectedContacts(response.data.pitchContacts);
      const opportunity_id = response.data.pitch.opportunity_id;

      if (opportunity_id) {
        const response2 = await axiosInstance.post(
          `/getSalesforceRecordName`,
          {
            viewerId: viewer_id,
            salesforceId: opportunity_id,
            originURL: path,
          },
          { withCredentials: true }
        );

        // Set the pitch type based on the response
        setPitchType(response2.data.Type || "Unknown");
        setOpportunityName(response2.data.Name);

        if (response2.status === 200) {
          setIsToggle(false);
        }
      } else {
        setOpportunityName("No opportunity");
        setPitchType("TOF");
        handleToggleChange();
      }

      const response3 = await axiosInstance.post(
        `/view-pitch-highlight-video`,
        {
          viewer_id: viewer_id,
          pitch_id: selectedPitches[0].id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );

      setCrmConnectionName(
        response.data.crm_connection_details[0].connection_name
      );
      setSelectedVideos(response3.data.data);

      //setOpportunityName(response2.data.Name);

      setSections(response.data.pitchSections);
      setLayouts((prevState) => ({
        ...prevState,
        selectedLayoutId: response.data.pitch.pitch_layout,
      }));
      setStep1Data({
        id: response.data.pitch.id,
        name: response.data.pitch.name,
        client_logo: response.data.pitch.client_logo,
        created_by: response.data.pitch.created_by,
        title: response.data.pitch.title,
        headline: response.data.pitch.headline,
        description: response.data.pitch.description,
        pitch_layout: response.data.pitch.pitch_layout,
        background_image: response.data.pitch.background_image,
        pitch_layout_salesforce_id:
          response.data.pitch.pitch_layout_salesforce_id,
      });
      setPitchAccess(response.data.pitch.public_access);
    } catch (error) {
      console.log(error.message);
    } finally {
      setEditPitchLoading(false);
    }
  };

  const fetchVideoData = async (videoId, index) => {
    try {
      const response = await axiosInstance.post(
        `/pitch-preview-content`,
        {
          content_name: videoId,
          viewerId: viewer_id,
        },
        {
          withCredentials: true,
        }
      );
      setPreviewUrl(response.data.sasUrl);
      setPreviewIndex(index);
      setShowPreview(true);
      console.log("Video data", response.data.sasUrl);
      return response.data.sasUrl;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    } finally {
      setPitchToEdit(null);
    }
  };

  const UpddateContactHandler = async () => {
    const contactIds = selectedContacts.map(
      (contact) => contact.Id || contact.contact_sfdc_id
    );
    console.log(selectedContacts);
    try {
      const response = await axiosInstance.post(
        `/updatePitchContacts`,
        {
          viewerId: viewer_id,
          pitchId: selectedPitches[0].id,
          contactIds: contactIds,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      console.log("Pitch conatcted updated ");
    } catch (error) {
      console.log(
        "Error from  the edit-pitch-with-sections-and-contents",
        error
      );
    }
  };

  // handler function for editing the pitch data pitch section
  const editPitchHandler = async () => {
    setIsLoading(true);
    const sec = [];
    for (let i = 0; i < sections.length; i++) {
      sec.push({
        ...sections[i],
        order: i + 1,
      });
    }
    const data = {
      pitchId: selectedPitches[0].id,
      updated_by: viewer_id,
      pitchData: {
        name: step1data.name,
        title: step1data.title,
        headline: step1data.headline,
        description: step1data.description,
        pitch_layout: step1data.pitch_layout,
        public_access: pitchAccess,
      },
      sections: sec,
    };

    console.log(data);

    if (pitchAccess == 0) {
      UpddateContactHandler();
    }
    try {
      const response = await axiosInstance.post(
        `/edit-pitch-with-sections-and-contents
      `,
        data,
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      if (selectedVideos && selectedVideos.length > 0) {
        const videoFormData = new FormData();
        videoFormData.append("created_by", viewer_id);
        videoFormData.append("pitch_id", selectedPitches[0].id);

        const taglines = [];

        selectedVideos.forEach((videoObj) => {
          // Append the tagline
          // Append the video file correctly
          if (!videoObj.id) {
            videoFormData.append("files", videoObj.video);
            taglines.push(videoObj.tagline);
          }
        });

        videoFormData.append("tagline", JSON.stringify(taglines));
        const response3 = await axiosInstance.post(
          `/highlight-video-upload
            `,
          videoFormData,
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        console.log(response3);
      }

      if (editImageData) {
        const formData = new FormData();
        formData.append("pitch_id", selectedPitches[0].id);
        formData.append("background_image", backgroundImage);
        formData.append("background_login_image", backgroundLoginImage);
        formData.append("client_logo", clientLogo);

        const response2 = await axiosInstance.post(
          `/upload-bg-and-client-logo`,
          formData,
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        console.log("response2", response2);
        setEditImageData(false);
      }

      if (response.data) {
        dispatch(
          fetchPitchesAsync({
            sortColumn: "name",
            sortOrder: "ASC",
            viewer_id: viewer_id,
            baseURL: baseURL,
            organisation_id,
          })
        );
        toast.success("Pitch Updated Successfully");

        dispatch(clearSelectedPitch());
      }
    } catch (error) {
      console.log(
        "Error from  the edit-pitch-with-sections-and-contents",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const EditContentSelectHandler = (id, name) => {
    setSelectedContent((prevState) => ({
      ...prevState,
      content: id,
      name: name,
      sectionName: sectionData.name,
      arrangement: sectionData.contents.length + 1,
    }));
    setEditContentTable(false);
  };

  const RemoveContentHandler = (content, sectionName) => {
    const updatedSection = [];
    for (let i = 0; i < sections.length; i++) {
      if (sectionName === sections[i].name) {
        let newArrangement = 1;
        const updatedContent = [];
        for (let j = 0; j < sections[i].contents.length; j++) {
          if (content.arrangement != sections[i].contents[j].arrangement) {
            updatedContent.push({
              ...sections[i].contents[j],
              arrangement: newArrangement,
            });
            newArrangement++;
          }
        }
        updatedSection.push({
          ...sections[i],
          contents: updatedContent,
        });
      } else {
        updatedSection.push(sections[i]);
      }
    }

    setSections(updatedSection);
  };

  const EditContentHandler = (content, index) => {
    const updatedSection = [];
    for (let i = 0; i < sections.length; i++) {
      if (editSection.sectionName === sections[i].name) {
        const updatedContent = [];
        for (let j = 0; j < sections[i].contents.length; j++) {
          if (j == editSection.index) {
            updatedContent.push(selectedContent);
          } else {
            updatedContent.push(sections[i].contents[j]);
          }
        }

        updatedSection.push({
          ...sections[i],
          contents: updatedContent,
        });
      } else {
        updatedSection.push(sections[i]);
      }
    }
    setSections(updatedSection);
    setSelectedContent({
      content: "",
      name: "",
      tagline: "",
      sectionName: "",
    });
    setEditSection({
      editSection: false,
      modalOne: false,
      modalTwo: false,
      sectionName: "",
      index: -1,
    });
  };

  const swapContent = (sectionName, index, direction) => {
    console.log(sectionName);
    setSections(
      sections.map((section) => {
        if (section.name === sectionName) {
          const contents = [...section.contents];
          if (direction === "up" && index > 0) {
            [contents[index], contents[index - 1]] = [
              contents[index - 1],
              contents[index],
            ];
          } else if (direction === "down" && index < contents.length - 1) {
            [contents[index], contents[index + 1]] = [
              contents[index + 1],
              contents[index],
            ];
          }
          return { ...section, contents };
        }
        return section;
      })
    );
  };

  const swapSections = (direction, sectionName) => {
    setSections((prevSections) => {
      // Find index of the section to be swapped
      const index = prevSections.findIndex(
        (section) => section.name === sectionName
      );
      if (index === -1) return prevSections; // Section not found

      // Determine the target index based on direction
      const targetIndex =
        direction === "up" ? index - 1 : direction === "down" ? index + 1 : -1;

      // Check if the target index is valid
      if (targetIndex < 0 || targetIndex >= prevSections.length)
        return prevSections;

      // Create a copy of the sections array to avoid direct mutation
      const updatedSections = [...prevSections];

      // Swap sections
      const temp = updatedSections[index];
      updatedSections[index] = updatedSections[targetIndex];
      updatedSections[targetIndex] = temp;

      return updatedSections;
    });
  };

  const FetchContacts = async () => {
    setPitchContactsLoading(true);
    let opportunityId = "";
    selectedPitches.map((pitch) => {
      opportunityId = pitch.opportunity_id;
    });
    try {
      if (!isToggle) {
        const response = await axiosInstance.post(
          `/getContactsForOpportunityAccount`,

          {
            viewerId: viewer_id,
            salesforceId: salesforceId,
            // opportunityId: opportunityId,
            originURL: path,
          }
        );
        console.log("Contacts", response.data);
        setPitchContacts(response.data);
      }
    } catch (error) {
      console.log("Error fetching contacts", error.message);
    } finally {
      setPitchContactsLoading(false);
    }
  };

  const [showPrompt, setShowPrompt] = useState(false);
  const [openPromptPopup, setOpenPromptPopup] = useState(false);
  const [focusArea, setFocusArea] = useState("");
  const [aiContent, setAiContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isToggle, setIsToggle] = useState(false);
  const [checkToggle, setCheckToggle] = useState(true);
  const [stateValue, setStateValue] = useState(0);

  const removeAsteriskLabels = (text) => {
    // Define patterns for different label formats
    const format1Pattern = /\*\*[^*]+\:\*\*/g; // Matches **Label:**
    const format2Pattern = /"[^"]+":/g; // Matches "Label":
    const format3Pattern = /[^":]+:/g;
    const simpleLabelPattern = /^[^\n]+\:/; // Matches Label:

    // Remove labels based on detected format
    let cleanedText = text
      .replace(format1Pattern, "") // Remove **Label:** format
      .replace(format2Pattern, "") // Remove "Label": format
      .replace(format3Pattern, "")
      .replace(simpleLabelPattern, ""); // Remove Label: format

    // Trim any leading or trailing whitespace
    return cleanedText.trim();
  };

  const handleAIResponse = (aiContent) => {
    // Split the AI content into sections by new lines
    const lines = aiContent.split("\n\n");

    // Handle each section based on the expected format
    const title = removeAsteriskLabels(lines[0]);
    const headline = removeAsteriskLabels(lines[1]);
    const description = removeAsteriskLabels(lines[2]); // Join remaining lines for description
    const cleanedDescription = removeAsteriskLabels(description);

    // Update the state with the cleaned values
    setStep1Data((prevState) => ({
      ...prevState,
      name: title,
      title: title,
      headline: headline,
      description: cleanedDescription,
    }));

    // Log the updated state for debugging
    console.log("Updated Step1Data:", {
      name: title,
      title: title,
      headline: headline,
      description: description,
    });
  };

  const generateAIOpportunityDetails = async () => {
    setLoading(true);
    try {
      console.log(focusArea);
      // Make the POST request to the API
      const response = await axiosInstance.post(
        `${baseURL}/geenrateAIOpportunityDetails`, // The endpoint URL
        {
          viewerId: viewer_id, // The viewer ID from the request body
          originURL: path, // The origin URL from the request body
          opportunityId: opportunityId,
          focus_area: focusArea, // The opportunity ID from the request body
        },
        {
          headers: {
            "Content-Type": "application/json", // Ensure the content type is JSON
          },
          withCredentials: true,
        }
      );

      // Handle the response
      console.log("ai data", response.data.aiContent);
      setAiContent(response.data.aiContent);
      handleAIResponse(response.data.aiContent); // Update state with AI content
    } catch (error) {
      // Handle errors
      console.error("Error generating AI opportunity details:", error);
    } finally {
      setLoading(false);
      setFocusArea("");
    }
  };

  const handleContentClick = async (item) => {
    setSelectedContent(item);

    try {
      setContentModalLoading(true); // Set loading to true when initiating the action
      if (item.content_mimetype) {
        console.log("if");
        console.log("mimetpye", item?.content_mimetype);

        if (
          item?.content_mimetype.includes("application/vnd") ||
          item?.content_mimetype.includes("application/msword") ||
          item?.content_mimetype.includes("video/mp4")
        ) {
          // For Microsoft Office, and videos files, get the SAS URL
          console.log("aaaa");
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item.content,
              viewerId: viewer_id,
            },
            {
              withCredentials: true, // Include cookies in the request
            }
          );
          const sasURL = res.data.sasUrl;
          setViewContent(sasURL);
        } else if (item?.content_mimetype.includes("application/url")) {
          setViewContent(item.content);
        } else if (item?.content_mimetype == "application/pdf") {
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item?.content || item?.id || item?.contentId,
              viewerId: viewer_id,
            },
            {
              responseType: "blob",
            }
          );

          const blob = new Blob([res.data], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          console.log("Url", url);
          setViewContent(url);
        } else {
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item?.content || item?.id || item?.contentId,
              viewerId: viewer_id,
            },
            {
              responseType: "blob",
              withCredentials: true,
            }
          );
          const contentBlob = new Blob([res.data], {
            type: `${res.data.type}`,
          });
          const url = URL.createObjectURL(contentBlob);
          setViewContent(url);
        }

        setContentModalOpen(true);
      } else {
        if (
          ["png", "jpg", "jpeg", "webp", "bmp", "gif", "svg"].some((format) =>
            item?.name?.includes(format)
          )
        ) {
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item?.content || item?.id || item?.contentId,
              viewerId: viewer_id,
            },
            {
              responseType: "blob",
              withCredentials: true,
            }
          );
          const contentBlob = new Blob([res.data], {
            type: `${res.data.type}`,
          });
          const url = URL.createObjectURL(contentBlob);
          setViewContent(url);
        } else if (item.name.includes(".mp4")) {
          const res = await axiosInstance.post(`/open-content`, {
            contentId: item?.content || item?.id || item?.contentId,
            viewerId: viewer_id,
          });
          if (res.data && res.data.sasUrl) {
            setViewContent(res.data.sasUrl);
          } else {
            console.error("sasURL not found in response:", res.data);
          }
        } else {
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item?.content || item?.id || item?.contentId,
              viewerId: viewer_id,
            },
            {
              withCredentials: true,
              responseType: "blob",
            }
          );
          console.log("Res", res.data);
          const isPDF = res.headers["content-type"] === "application/pdf";

          if (isPDF) {
            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setViewContent(url);
          } else {
            // If it's not a PDF, try to parse it as JSON
            const textDecoder = new TextDecoder("utf-8");
            const jsonString = textDecoder.decode(res.data);
            try {
              const jsonData = JSON.parse(jsonString);
              // Handle JSON data (e.g., display an error message)
              console.error("Received JSON instead of PDF:", jsonData);
              toast.error("Unable to load PDF. Please try again later.");
            } catch (jsonError) {
              console.error("Error parsing response as JSON:", jsonError);
              toast.error(
                "Unexpected response format. Please try again later."
              );
            }
          }
        }
        setContentModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContentModalLoading(false); // Set loading to false when the action completes (whether successful or not)
    }
  };

  useEffect(() => {
    if (pitchToEdit) {
      pitchLayoutHandler();
      selectedPitchButtonHandler(pitchToEdit);
      setStep(1);
    }
  }, [pitchToEdit]);

  const handleVersionContentClick = async (item) => {
    try {
      setVersionContentModalLoading(true); // Set loading to true when initiating the action
      if (item.latest_content_mimetype) {
        if (
          item?.latest_content_mimetype.includes("application/vnd") ||
          item?.latest_content_mimetype.includes("application/msword") ||
          item?.latest_content_mimetype.includes("video/")
        ) {
          // For Microsoft Office, and videos files, get the SAS URL
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item.latest_content_id,
              viewerId: viewer_id,
            },
            {
              withCredentials: true, // Include cookies in the request
            }
          );
          const sasURL = res.data.sasUrl;
          setViewVersionContent(sasURL);
        } else if (item?.latest_content_mimetype.includes("application/url")) {
          setViewVersionContent(item.latest_content_content);
        } else {
          // For other file types, get the blob
          const res = await axiosInstance.post(
            `/open-content`,
            {
              contentId: item.latest_content_id,
              viewerId: viewer_id,
            },
            {
              responseType: "blob",
              withCredentials: true,
            }
          );

          const contentBlob = new Blob([res.data], {
            type: `${item.latest_content_mimetype}`,
          });

          setViewVersionContent(contentBlob);
        }

        setVersionModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVersionContentModalLoading(false); // Set loading to false when the action completes (whether successful or not)
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
          <div className="bg-transparent p-6 rounded-md z-50 w-auto">
            <Grid
              visible={true}
              height="40"
              width="40"
              color="#075985"
              ariaLabel="grid-loading"
              radius="12.5"
              wrapperStyle={{}}
              wrapperClass="grid-wrapper"
            />
          </div>
        </div>
      </div>
    );
  }

  const PitchAccessOnchangeHandler = (e) => {
    if (!isToggle) {
      // Only allow changes if isToggle is false
      if (e.target.id === "public") {
        setPitchAccess(1);
      }
      if (e.target.id === "restricted") {
        setPitchAccess(0);
      }
    }
  };
  const handleToggleChange = () => {
    console.log("hii");

    if (!isToggle) {
      setPitchAccess(1); // Automatically set to public when toggled on
    }
    return isToggle;
  };

  const UpdateContentVersionHandler = () => {
    // console.log("Selected Version"  , selectedVersionContent)
    console.log("pitch sections", sections);
    const updatedSections = [];

    for (let i = 0; i < sections.length; i++) {
      const updatedContents = [];
      for (let j = 0; j < sections[i].contents.length; j++) {
        if (
          selectedVersionContent.pitch_content_id === sections[i].contents[j].id
        ) {
          console.log(selectedVersionContent);
          console.log(sections[i].contents[j]);
          updatedContents.push({
            ...sections[i].contents[j],
            content: selectedVersionContent.latest_content_id,
            content_created_at: selectedSection.latest_content_created_at,
            content_created_by_name:
              selectedVersionContent.latest_content_created_by_name,
            content_description:
              selectedVersionContent.latest_content_description,
            content_id: selectedVersionContent.latest_content_id,
            content_link: selectedVersionContent.latest_content_content,
            content_mimetype: selectedVersionContent.latest_content_mimetype,
            content_name: selectedVersionContent.latest_content_name,
            content_updated_at:
              selectedVersionContent.latest_content_updated_at,
            content_updated_by_name:
              selectedVersionContent.latest_content_updated_by_name,
          });
        } else {
          updatedContents.push(sections[i].contents[j]);
        }
      }
      updatedSections.push({
        ...sections[i],
        contents: updatedContents,
      });
    }
    setSections(updatedSections);
    setVersionModalOpen(false);
  };

  if (editPitchLoading) {
    return (
      <div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
          <div className="bg-transparent p-6 rounded-md z-50 w-auto">
            <Grid
              visible={true}
              height="40"
              width="40"
              color="#075985"
              ariaLabel="grid-loading"
              radius="12.5"
              wrapperStyle={{}}
              wrapperClass="grid-wrapper"
            />
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Add console log here
    console.log("step1data:", {
      name: step1data.name,
      opportunity_id: step1data.opportunity_id,
      opportunity_name: step1data.opportunity_name,
      client_logo: step1data.client_logo,
      created_by: step1data.created_by,
      title: step1data.title,
      headline: step1data.headline,
      description: step1data.description,
      pitch_layout: step1data.pitch_layout,
      background_image: step1data.background_image,
    });

    switch (step) {
      case 1:
        return (
          <div>
            {/* Main Container - Full screen overlay */}
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
              {/* Popup Container - Responsive width */}
              <div className="relative bg-white rounded-lg shadow w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] max-h-[90vh] flex flex-col">
                {/* Content Wrapper */}
                <div
                  // className="sticky top-0  bg-white border-b border-gray-200  px-6 py-4 shadow-lg z-20"
                  // style={{ boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)" }}
                  className="relative z-10 p-4 bg-white"
                  style={{ boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Edit Pitch
                    </h3>
                    <button
                      type="button"
                      className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => setStep(0)}
                    >
                      <FontAwesomeIcon
                        className="text-gray-500 text-2xl"
                        icon={faXmark}
                      />
                    </button>
                  </div>

                  {/* Form Body - Scrollable */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                      <form
                        className="space-y-4"
                        onSubmit={(e) => e.preventDefault()}
                      >
                        {/* Responsive Column Layout */}
                        <div className="flex flex-col lg:flex-row gap-8">
                          {/* Left Column - Form Fields */}
                          <div className="w-full lg:w-[55%] space-y-4 lg:border-r lg:pr-4">
                            <div className="flex flex-row gap-8">
                              {/* TOF Toggle */}
                              <div className="flex items-center space-x-2">
                                <label className="min-w-36 text-sm font-medium">
                                  Top of Funnel Pitch:
                                </label>
                                {/* Toggle Switch component */}
                                <label className="inline-block cursor-pointer ms-2">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    // checked={isToggle} // Adjusted to match your state
                                    // readOnly // Ensures the toggle cannot be changed by the user
                                    defaultChecked={isToggle}
                                  />

                                  <div
                                    className={`relative w-11 h-6 rounded-full peer ${
                                      isToggle ? "bg-[#014d83]" : "bg-gray-200"
                                    }`}
                                  >
                                    <div
                                      className={`absolute top-0.5 start-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all ${
                                        isToggle ? "translate-x-full" : ""
                                      }`}
                                    ></div>
                                  </div>
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <label className="min-w-32 text-sm font-medium">
                                  {pitchType !== "Opportunity"
                                    ? "Account Name :"
                                    : "Opportunity Name :"}
                                </label>
                                {/* Toggle Switch component */}
                                <label className="inline-block cursor-pointer ms-2">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    // checked={isToggle} // Adjusted to match your state
                                    // readOnly // Ensures the toggle cannot be changed by the user
                                    defaultChecked={pitchType !== "Opportunity"}
                                  />

                                  <div
                                    className={`relative w-11 h-6 rounded-full peer ${
                                      pitchType !== "Opportunity"
                                        ? "bg-[#014d83]"
                                        : "bg-gray-200"
                                    }`}
                                  >
                                    <div
                                      className={`absolute top-0.5 start-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all ${
                                        pitchType !== "Opportunity"
                                          ? "translate-x-full"
                                          : ""
                                      }`}
                                    ></div>
                                  </div>
                                </label>
                              </div>
                            </div>

                            {/* Opportunity/Account Name with AI Prompt */}
                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
                              {/* Label and Input Container */}
                              <label className="w-36 inline-block mb-2 mt-2.5 text-sm font-medium text-gray-900 dark:text-white">
                                {pitchType !== "Opportunity"
                                  ? "Account Search :"
                                  : "Opportunity Search :"}
                              </label>
                              <div
                                className={`w-80 h-10 border text-gray-900 text-sm rounded-lg inline-block p-2.5 ${
                                  isToggle
                                    ? "bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-50 border-gray-300  focus:border-[#014d83]"
                                } dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white`}
                                aria-disabled={true}
                              >
                                {pitchType !== "Opportunity"
                                  ? opportunityName || "No Account"
                                  : opportunityName || "No Opportunity"}
                              </div>
                              {!isToggle && opportunityName && (
                                <div className=" flex space-x-2 ">
                                  <button
                                    className="ml-2 px-1 py-1 bg-white   dark:bg-white dark:focus:ring-white hover:border-white transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-white"
                                    onClick={() => {
                                      generateAIOpportunityDetails();
                                    }}
                                    disabled={loading}
                                  >
                                    {loading ? (
                                      <div className="flex items-center h-5 w-5">
                                        <MiniLogoLoader1 />
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <img
                                          src={logo}
                                          alt="RevSpire Logo"
                                          className="w-5 h-5 z transition-opacity -opacity-30" // Adjust size and margin as needed
                                        />
                                      </div>
                                    )}
                                  </button>

                                  <button
                                    disabled={loading}
                                    className="h-5 w-5 flex mt-2  text-2xl"
                                    onClick={() => setOpenPromptPopup(true)}
                                  >
                                    <TbPrompt />
                                  </button>
                                </div>
                              )}
                              {/* AI Prompt Popup */} {/* AI Prompt Popup */}
                              {openPromptPopup && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                                  <div className="bg-white  rounded-lg border-2 shadow-lg max-w-sm w-full flex flex-col max-h-[90vh]">
                                    {/* Header */}
                                    <h2 className="text-xl font-semi sticky  top-0  p-2 border-b-1 z-10">
                                      Write your prompt below
                                    </h2>

                                    <textarea
                                      className=" h-40 mx-1.5 font-thin rounded-md border-2 transition-colors p-1"
                                      value={focusArea}
                                      placeholder="What should the AI focus on ?"
                                      onChange={(e) =>
                                        setFocusArea(e.target.value)
                                      }
                                    />
                                    {/* Button */}

                                    <div className=" flex justify-center space-x-10 my-2 ">
                                      <button
                                        onClick={() =>
                                          setOpenPromptPopup(false)
                                        }
                                        className="px-4 py-2 w-20 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                                      >
                                        Close
                                      </button>
                                      <button
                                        onClick={() => {
                                          generateAIOpportunityDetails();
                                          setOpenPromptPopup(false);
                                        }}
                                        className={`px-6 py-2 w-20 flex justify-center items-center text-sm btn-secondary text-white rounded-lg transition-colors`}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Pitch Name */}
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                              <label className="w-36 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Pitch Name :
                              </label>
                              <div className="flex-1">
                                <input
                                  value={step1data.name}
                                  onChange={(e) => {
                                    setStep1Data((prevState) => ({
                                      ...prevState,
                                      name: e.target.value,
                                    }));
                                  }}
                                  type="text"
                                  className={`w-80 border text-gray-900 text-sm rounded-lg inline-block p-2.5 ${
                                    loading
                                      ? "bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed"
                                      : "bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                  } dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white`}
                                  placeholder="Enter the Pitch Name...."
                                  required
                                  disabled={loading}
                                />
                                {formSubmitted && step1data.name === "" && (
                                  <p className="text-red-600 mx-36 text-xs ">
                                    Please enter the pitch name.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Pitch Layout */}
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                              <label className="w-36 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Pitch Layout :
                              </label>
                              {pitchIsLoading.pitchLayouts ? (
                                <select
                                  className="w-80 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 inline-block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                  disabled
                                >
                                  <option value="Loading">
                                    Loading Layouts...
                                  </option>
                                </select>
                              ) : (
                                <select
                                  className="w-80 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 inline-block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                  required
                                  value={
                                    layouts.layouts.find(
                                      (layout) =>
                                        layout.id === layouts.selectedLayoutId
                                    )?.name || ""
                                  }
                                  onChange={(e) => {
                                    const selectedPitchLayoutName =
                                      e.target.value;
                                    const selectedPitchLayoutId =
                                      layouts.layouts.find(
                                        (layout) =>
                                          layout.name ===
                                          selectedPitchLayoutName
                                      ).id;
                                    // Update only the selectedLayoutName without affecting the rest of the state
                                    setLayouts((prevState) => ({
                                      ...prevState,
                                      selectedLayoutName:
                                        selectedPitchLayoutName,
                                      selectedLayoutId: selectedPitchLayoutId,
                                    }));
                                    // Update the pitch_layout value in step1Data
                                    setStep1Data((prevState) => ({
                                      ...prevState,
                                      pitch_layout: selectedPitchLayoutId,
                                    }));
                                  }}
                                >
                                  <option value="" disabled>
                                    Select Layout
                                  </option>
                                  {layouts.layouts &&
                                    layouts.layouts.map((layout) => (
                                      <option
                                        key={layout.id}
                                        value={layout.name}
                                      >
                                        {layout.name}
                                      </option>
                                    ))}
                                </select>
                              )}
                              {formSubmitted &&
                                layouts.selectedLayoutId === "" && (
                                  <p className="text-red-600 mx-36 text-xs ">
                                    Please select Pitch Layout.
                                  </p>
                                )}
                            </div>

                            {/* Pitch Title */}
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                              <label className="w-36 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Title :
                              </label>
                              <input
                                value={step1data.title}
                                onChange={(e) => {
                                  setStep1Data((prevState) => ({
                                    ...prevState,
                                    title: e.target.value,
                                  }));
                                }}
                                type="text"
                                className={`w-80 border text-gray-900 text-sm rounded-lg inline-block p-2.5 ${
                                  loading
                                    ? "bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                } dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white`}
                                placeholder="Pitch Title..."
                                required
                                disabled={loading}
                              />
                              {formSubmitted && step1data.title === "" && (
                                <p className="text-red-600 mx-36 text-xs ">
                                  Please select Pitch Title
                                </p>
                              )}
                            </div>

                            {/* Pitch Headline */}
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                              <label className="w-36 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Headline :
                              </label>
                              <input
                                value={step1data.headline}
                                onChange={(e) => {
                                  setStep1Data((prevState) => ({
                                    ...prevState,
                                    headline: e.target.value,
                                  }));
                                }}
                                type="text"
                                className={`w-80 border text-gray-900 text-sm rounded-lg inline-block p-2.5 ${
                                  loading
                                    ? "bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                } dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white`}
                                placeholder="Pitch Headline..."
                                required
                                disabled={loading}
                              />
                              {formSubmitted && step1data.headline === "" && (
                                <p className="text-red-600 mx-36 text-xs ">
                                  Please select Pitch headline
                                </p>
                              )}
                            </div>

                            {/* Pitch Description */}
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                              <label className="w-36 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Description :
                              </label>
                              <textarea
                                value={step1data.description}
                                onChange={(e) => {
                                  setStep1Data((prevState) => ({
                                    ...prevState,
                                    description: e.target.value,
                                  }));
                                }}
                                type="text"
                                className={`w-80 border text-gray-900 text-sm h-40 text-start rounded-lg inline-block p-2.5 ${
                                  loading
                                    ? "bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                } dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white`}
                                placeholder="Pitch Description..."
                                required
                                disabled={loading}
                              />
                              {formSubmitted &&
                                step1data.description === "" && (
                                  <p className="text-red-600 mx-36 text-xs ">
                                    Please select an opportunity.
                                  </p>
                                )}
                            </div>
                          </div>

                          {/* -------------------------------Right Column------------------------------- */}

                          {/* Right Column - Images */}
                          <div className="w-full lg:w-[45%] space-y-4 mt-6 lg:mt-0">
                            {/* Edit Images Toggle */}
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={editImageData}
                                onChange={() => {
                                  setEditImageData(!editImageData);
                                }}
                              />
                              <label className="text-sm font-medium">
                                Edit Background and Client Logo
                              </label>
                            </div>

                            {/* Image Upload Fields */}
                            <div className="space-y-4">
                              {/* Background Image */}
                              <div>
                                <label className="w-36 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Background :
                                </label>
                                <input
                                  id="backgroundImage"
                                  disabled={!editImageData}
                                  onChange={(e) => {
                                    setBackgroundImage(e.target.files[0]);
                                  }}
                                  type="file"
                                  accept="image/*"
                                  className="w-80 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 inline-block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                  required
                                />
                              </div>

                              {/* Login Background */}
                              <div>
                                <label className="w-36 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Login Background :
                                </label>
                                <input
                                  id="backgroundLoginImage"
                                  disabled={!editImageData}
                                  onChange={(e) => {
                                    setBackgroundLoginImage(e.target.files[0]);
                                  }}
                                  type="file"
                                  accept="image/*"
                                  className="w-80 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 inline-block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                  required
                                />
                              </div>

                              {/* Client Logo - Only show if not TOF */}
                              <div>
                                <label className="w-36 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  Client Logo :
                                </label>
                                <input
                                  id="clientLogo"
                                  disabled={!editImageData}
                                  onChange={(e) => {
                                    setClientLogo(e.target.files[0]);
                                  }}
                                  type="file"
                                  accept="image/*"
                                  className="w-80 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 inline-block p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Footer - Fixed at bottom */}
                  <div
                    className="space-x-16 flex justify-end p-2 border-t mb-2 shadow-md z-10"
                    // style="box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);"
                    style={{ boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="flex justify-end space-x-4">
                      <button
                        className="border-2 py-2 rounded-xl px-8 te bg-red-300"
                        onClick={() => {
                          setStep(0);
                          setStep1Data({});
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="border-2 py-2 rounded-xl px-8 te bg-white"
                        disabled={loading}
                        onClick={() => {
                          setFormSubmitted(true);
                          handleNextStep();
                          FetchContacts();
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div
            className=" fixed inset-0 flex items-center justify-center z-30 bg-gray-500 bg-opacity-50 "
            tabIndex="-1"
          >
            <div className="relative bg-white rounded-lg shadow  dark:bg-gray-700 lg:w-[83vw] xl:w-[90vw]">
              {/* Popup Header */}
              <div className="flex items-center justify-between p-4 md:p-3 border-b rounded-t dark:border-gray-600">
                {/* Heading */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Pitch
                </h3>
                {/* Cancel Button */}
                <button
                  type="button"
                  className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => {
                    setStep(0);
                  }}
                >
                  <FontAwesomeIcon
                    className="text-red-500 text-2xl"
                    icon={faXmark}
                  />
                </button>
              </div>

              {/* Popup Body */}
              <div className=" flex mt-2">
                {/* left part  */}
                <div className="w-1/2 px-2 ">
                  <div className=" border-gray-300 px-2 rounded-2xl ">
                    <button
                      className="border-2 rounded-md btn-secondary px-4 py-1"
                      onClick={handlePlusButtonClick}
                    >
                      Add Highlight
                    </button>
                    <div
                      className={`${
                        selectedVideos.length == 0
                          ? "overflow-hidden border-2 p-2 my-2  border-gray-300  rounded-md"
                          : "overflow-y-auto border-2 p-2 my-2 border-gray-300  rounded-md"
                      } overflow-x-hidden`}
                      style={{ height: "20vh" }}
                    >
                      <div className="align-center">
                        {selectedVideos.length === 0 ? (
                          <div className="px-4 mt-2 ">
                            <div className="p-2 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 ">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center justify-center h-28 rounded bg-gray-50 dark:bg-gray-800">
                                  <p className="text-2xl text-gray-400 dark:text-gray-500">
                                    <svg
                                      className="w-3.5 h-3.5"
                                      aria-hidden="true"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 18 18"
                                    >
                                      <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 1v16M1 9h16"
                                      />
                                    </svg>
                                  </p>
                                </div>
                                <div className="flex items-center justify-center h-28 rounded bg-gray-50 dark:bg-gray-800">
                                  <p className="text-2xl text-gray-400 dark:text-gray-500">
                                    <svg
                                      className="w-3.5 h-3.5"
                                      aria-hidden="true"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 18 18"
                                    >
                                      <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 1v16M1 9h16"
                                      />
                                    </svg>
                                  </p>
                                </div>
                                <div className="flex items-center justify-center h-28 rounded bg-gray-50 dark:bg-gray-800">
                                  <p className="text-2xl text-gray-400 dark:text-gray-500">
                                    <svg
                                      className="w-3.5 h-3.5"
                                      aria-hidden="true"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 18 18"
                                    >
                                      <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 1v16M1 9h16"
                                      />
                                    </svg>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {}
                        {showVideoRecorder && (
                          <VideoRecorder
                            onCancel={handleCloseVideoRecorder}
                            highlightVideoFiles={handleHighlightVideoFiles}
                            videoTaglines={handleVideoTagline}
                            onVideoReady={handleVideoReady}
                          />
                        )}

                        <div className="">
                          <div className=" space-y-1">
                            {selectedVideos.map((item, index) => (
                              <div key={index}>
                                <div className="flex border bg-neutral-100 border-neutral-300    items-center rounded-md gap-3 px-4 py-0.5 justify-between w-full ">
                                  <div className=" flex items-center">
                                    <span className="border-neutral-400 flex border  size-[20px]   justify-center items-center text-xs rounded-full bg-neutral-50  text-neutral-700 font-bold">
                                      {index + 1}
                                    </span>
                                    <label className="w-40  ml-10 truncate text-sm font-medium mx-4 text-gray-900 dark:text-white">
                                      Highlight video Tagline :
                                    </label>

                                    {editingIndex === index ? (
                                      <span>
                                        {" "}
                                        <input
                                          type="text"
                                          className=" relative w-60 ml-2"
                                          value={item.tagline}
                                          onChange={(e) =>
                                            handleTaglineChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                          onBlur={() => setEditingIndex(null)}
                                        />
                                      </span>
                                    ) : (
                                      <span className=" ">{item.tagline}</span>
                                    )}
                                  </div>
                                  <span className="  relative">
                                    <button
                                      className="px-2 text-cyan-600 hover:text-cyan-700"
                                      onClick={() => {
                                        setVideoTagline(item.tagline);

                                        if (item.id) {
                                          fetchVideoData(item.id, index);
                                        } else {
                                          handleVideoEdit(index);
                                        }
                                      }}
                                    >
                                      <MdSlowMotionVideo />
                                    </button>
                                    <button
                                      className="text-red-500 hover:text-red-600"
                                      onClick={() => {
                                        handleVideoDelete(item, index);
                                      }}
                                    >
                                      <MdRemoveCircleOutline />
                                    </button>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {showPreview && previewUrl && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-75">
                              <div className="bg-white rounded-xl shadow-2xl w-10/12 max-w-3xl overflow-hidden border border-sky-200">
                                <div className="flex justify-between items-center p-3 bg-sky-100 border-b border-sky-200">
                                  <h2 className="text-xl font-semibold text-sky-800">
                                    Video Preview
                                  </h2>
                                  <button
                                    className="text-sky-600 hover:text-sky-800 transition-colors"
                                    onClick={handleCancelPreview}
                                  >
                                    <FontAwesomeIcon
                                      icon={faXmark}
                                      className="text-xl"
                                    />
                                  </button>
                                </div>
                                <div className="p-4 bg-gray-50">
                                  <div className="aspect-w-16 aspect-h-9 mb-3 rounded-lg overflow-hidden shadow-md">
                                    <video
                                      src={previewUrl}
                                      controls
                                      autoPlay
                                      loop
                                      className="w-full h-full object-contain bg-black"
                                    />
                                  </div>
                                  {previewIndex !== null && (
                                    <div className="bg-white border border-sky-200 rounded-md p-3 shadow-sm">
                                      <h3 className="text-base font-medium text-sky-800 mb-1">
                                        Video Details
                                      </h3>
                                      <div className="flex items-center">
                                        <span className="font-semibold text-gray-700 mr-2">
                                          Tagline:
                                        </span>
                                        <span className="text-gray-600">
                                          {videoTagline}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-full ">
                    {/* Add Section Button */}
                    <button
                      className="border-2 rounded-md btn-secondary px-4 py-1  mx-2 "
                      disabled={
                        addSection.modalOne ||
                        addSection.modalTwo ||
                        editSection.modalOne ||
                        editSection.modalTwo
                      }
                      onClick={() => {
                        setNewSection(true);
                        setSectionData({ name: "", contents: [] });
                      }}
                    >
                      Add Section
                    </button>
                    <div
                      className={`${
                        sections.length == 0
                          ? "overflow-hidden border-2 p-2 m-2 border-gray-300  rounded-md"
                          : "overflow-y-auto border-2 rounded-md m-2 p-2 border-gray-300"
                      } overflow-x-hidden `}
                      style={{ height: "42vh" }}
                    >
                      <div className="h-full overflow-y-auto overflow-x-hidden">
                        <div className="">
                          {/* popup for showing the existing section */}
                          {sections.length > 0 &&
                            sections.map((section, index) => (
                              <div key={index} className="mt-1">
                                <div className="inline-block  px-2  rounded-2xl">
                                  <span className="font-semibold">{`Section ${
                                    index + 1
                                  } Title : `}</span>
                                  <input
                                    value={section.name}
                                    onChange={(e) => {
                                      const newName = e.target.value;
                                      setSections((prevSections) =>
                                        prevSections.map((section, i) =>
                                          i === index
                                            ? {
                                                ...section,
                                                name: newName,
                                              }
                                            : section
                                        )
                                      );
                                    }}
                                    className={`${
                                      section.name.length > 0
                                        ? ""
                                        : "border-red-500"
                                    } py-0.5 ml-2 text-normal-500 px-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500`}
                                    type="text"
                                    placeholder="Enter the section Name"
                                  />
                                  <button
                                    disabled={
                                      section.name.length === 0 ||
                                      editSection.index != -1
                                    }
                                    className="h-8 w-8 mx-1  text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition-colors border border-white"
                                    onClick={() => {
                                      if (!addSection.modalTwo) {
                                        setAddSection((prevState) => ({
                                          ...prevState,
                                          modalOne: true,
                                          modalTwo: false,
                                          sectionName: section.name,
                                        }));
                                        setSectionData(section);
                                      } else {
                                        setModalTwoError(true);
                                      }
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faPlus} />
                                  </button>
                                  <button
                                    className="h-8 w-8  text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                                    disabled={
                                      addSection.modalOne ||
                                      addSection.modalTwo ||
                                      editSection.modalOne ||
                                      editSection.modalTwo
                                    }
                                    onClick={() => {
                                      setAddSection((prevState) => ({
                                        ...prevState,
                                        addSection: false,
                                        modalTwo: false,
                                      }));
                                      setSelectedContent({
                                        sectionName: "",
                                        content: "",
                                        name: "",
                                        tagline: "",
                                        arrangement: 0,
                                      });
                                      setSections((prevState) =>
                                        prevState.filter(
                                          (sec) => sec.name != section.name
                                        )
                                      );
                                    }}
                                  >
                                    <FontAwesomeIcon
                                      className=" text-lg"
                                      icon={faXmark}
                                    />
                                  </button>
                                  {sections.length > 1 && (
                                    <div className=" inline-block">
                                      {index === 0 && (
                                        // First section, only show the down arrow
                                        <button
                                          className="mx-2 text-gray-600 hover:text-gray-800"
                                          onClick={() =>
                                            swapSections("down", section.name)
                                          }
                                          disabled={sections.length <= 1}
                                        >
                                          <FontAwesomeIcon icon={faArrowDown} />
                                        </button>
                                      )}
                                      {index === sections.length - 1 && (
                                        // Last section, only show the up arrow
                                        <button
                                          className=" mx-2 text-gray-600 hover:text-gray-800"
                                          onClick={() =>
                                            swapSections("up", section.name)
                                          }
                                          disabled={sections.length <= 1}
                                        >
                                          <FontAwesomeIcon icon={faArrowUp} />
                                        </button>
                                      )}
                                      {index > 0 &&
                                        index < sections.length - 1 && (
                                          // Sections in between, show both arrows
                                          <div className=" inline-block mx-2">
                                            <button
                                              className="  text-gray-600  hover:text-gray-800"
                                              onClick={() =>
                                                swapSections("up", section.name)
                                              }
                                            >
                                              <FontAwesomeIcon
                                                icon={faArrowUp}
                                              />
                                            </button>
                                            <button
                                              className=" mx-2 text-gray-600 hover:text-gray-800"
                                              onClick={() =>
                                                swapSections(
                                                  "down",
                                                  section.name
                                                )
                                              }
                                            >
                                              <FontAwesomeIcon
                                                icon={faArrowDown}
                                              />
                                            </button>
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </div>
                                {section.contents.map((content, index) => (
                                  <div
                                    key={index}
                                    className=" flex  flex-col  mt-1"
                                  >
                                    {editSection.index == index &&
                                    editSection.sectionName == section.name ? (
                                      <div className="border-2 inline-block rounded-xl py-1 px-2 w-[90%] 2xl:w-3/5">
                                        <div className="flex">
                                          <span className="mr-2 border-neutral-400 border size-[20px] flex justify-center items-center text-xs rounded-full bg-neutral-50  text-neutral-700 font-bold">
                                            {index + 1}
                                          </span>

                                          <label className="w-20  inline-block text-sm font-medium text-gray-900 dark:text-white">
                                            Name :
                                          </label>
                                          <div
                                            onClick={() => {
                                              setEditContentTable(true);
                                            }}
                                            className="truncate w-56 py-0.5 ml-2 text-normal-500 px-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500"
                                          >
                                            {selectedContent.name ||
                                              selectedContent.content_name}
                                          </div>
                                        </div>

                                        <div className="mt-1">
                                          <label className="w-20 ml-7 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Tagline :
                                          </label>
                                          <input
                                            value={selectedContent.tagline}
                                            onChange={(e) => {
                                              setSelectedContent(
                                                (prevState) => {
                                                  return {
                                                    ...prevState,
                                                    tagline: e.target.value,
                                                  };
                                                }
                                              );
                                            }}
                                            type="text"
                                            className="truncate w-56 py-0.5 ml-2 text-normal-500 px-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500"
                                            placeholder="Tagline...."
                                            required
                                          />
                                        </div>

                                        <div className="flex justify-between">
                                          <div className="flex items-center">
                                            <label className="w-20 ml-7 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                              Section :
                                            </label>
                                            <h1 className="truncate w-56 py-0.5 ml-2 text-normal-500 px-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500">
                                              {section.name}
                                            </h1>
                                          </div>

                                          {/* tick cancel button */}
                                          <div className="flex">
                                            <button
                                              type="button"
                                              className="text-cyan-600 bg-transparent hover:bg-cyan-600 hover:text-white rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                              onClick={() => {
                                                EditContentHandler(
                                                  content,
                                                  index
                                                );
                                                setSectionData({
                                                  name: "",
                                                  contents: [],
                                                });
                                              }}
                                            >
                                              <FontAwesomeIcon
                                                className=" text-xl"
                                                icon={faCheck}
                                              />
                                            </button>{" "}
                                            <button
                                              type="button"
                                              className="end-2.5 text-red-500 mx-0 bg-transparent hover:bg-red-500 hover:text-white rounded-lg text-sm w-8 h-8  inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                              onClick={() => {
                                                setSelectedContent({
                                                  content: "",
                                                  name: "",
                                                  tagline: "",
                                                  sectionName: "",
                                                });

                                                setEditSection((prevState) => ({
                                                  ...prevState,
                                                  modalOne: false,
                                                  modalTwo: false,
                                                  sectionName: "",
                                                  index: -1,
                                                }));
                                              }}
                                            >
                                              <FontAwesomeIcon
                                                className=" text-xl"
                                                icon={faXmark}
                                              />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="flex border bg-neutral-100 border-neutral-300 items-center rounded-md gap-3 px-4 py-0.5 justify-between w-full">
                                        <span className="border-neutral-400 border size-[20px] flex justify-center items-center text-xs rounded-full bg-neutral-50  text-neutral-700 font-bold">
                                          {index + 1}
                                        </span>
                                        <span className=" flex justify-between w-full">
                                          <span
                                            className=" w-60 truncate ml-2 pointer"
                                            onClick={() => {
                                              handleContentClick(content);
                                            }}
                                          >
                                            {content.name ||
                                              content.content_name}
                                          </span>
                                          <span className="">
                                            {(() => {
                                              const currentContent =
                                                contentVersion.find(
                                                  (item) =>
                                                    item.original_content_id ===
                                                    content.content
                                                );

                                              if (
                                                currentContent &&
                                                currentContent.latest_content_id !==
                                                  currentContent.original_content_id
                                              ) {
                                                return (
                                                  <span
                                                    onClick={() => {
                                                      setSelectedVersionContent(
                                                        currentContent
                                                      );
                                                      handleVersionContentClick(
                                                        currentContent
                                                      );
                                                    }}
                                                  >
                                                    update
                                                  </span>
                                                );
                                              }

                                              return null; // or any other fallback JSX element if needed
                                            })()}

                                            {index > 0 && (
                                              <button
                                                className="text-gray-600 mx-1 hover:text-gray-800"
                                                onClick={() =>
                                                  swapContent(
                                                    section.name,
                                                    index,
                                                    "up"
                                                  )
                                                }
                                              >
                                                <FontAwesomeIcon
                                                  icon={faArrowUp}
                                                />
                                              </button>
                                            )}
                                            {index <
                                              section.contents.length - 1 && (
                                              <button
                                                className="text-gray-600 mx-1 hover:text-gray-800"
                                                onClick={() =>
                                                  swapContent(
                                                    section.name,
                                                    index,
                                                    "down"
                                                  )
                                                }
                                              >
                                                <FontAwesomeIcon
                                                  icon={faArrowDown}
                                                />
                                              </button>
                                            )}
                                            <button
                                              className="px-2 text-cyan-600 hover:text-cyan-700"
                                              disabled={
                                                addSection.modalOne ||
                                                addSection.modalTwo ||
                                                editSection.modalOne ||
                                                editSection.modalTwo
                                              }
                                              onClick={() => {
                                                setEditSection((prevState) => ({
                                                  ...prevState,
                                                  sectionName: section.name,
                                                  modalOne: false,
                                                  modalTwo: true,
                                                  index: index,
                                                }));
                                                setSelectedContent(content);
                                              }}
                                            >
                                              <TbEdit />
                                            </button>
                                            <button
                                              className="text-red-500 hover:text-red-600"
                                              onClick={() => {
                                                RemoveContentHandler(
                                                  content,
                                                  section.name
                                                );
                                              }}
                                            >
                                              <MdRemoveCircleOutline />
                                            </button>
                                          </span>
                                        </span>
                                      </span>
                                    )}

                                    {editContentTable && (
                                      <ContentTableModal
                                        onClickHandler={
                                          EditContentSelectHandler
                                        }
                                      />
                                    )}

                                    {addSection.modalOne &&
                                      addSection.sectionName === section.name &&
                                      section.contents.length - 1 === index && (
                                        <ContentTableModal
                                          onClickHandler={contentSelectHandler}
                                        />
                                      )}
                                    {addSection.modalTwo &&
                                      addSection.sectionName === section.name &&
                                      section.contents.length - 1 === index && (
                                        <div className="mt-2 border-2 inline-block rounded-xl py-1  px-2 w-[90%] 2xl:w-4/6">
                                          <div className="flex ">
                                            <span className="mr-2 border-neutral-400 border size-[20px] flex justify-center items-center text-xs rounded-full bg-neutral-50  text-neutral-700 font-bold">
                                              {section.contents.length + 1}
                                            </span>
                                            <label className="w-16 inline-block text-sm font-medium text-gray-900 dark:text-white">
                                              Name :
                                            </label>

                                            <div className="truncate w-56 py-0.5 ml-2 text-normal-500 px-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500">
                                              {selectedContent.name}
                                            </div>
                                          </div>

                                          <div className="mt-1">
                                            <label className="ml-7 w-16 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                              Tagline :
                                            </label>
                                            <input
                                              value={selectedContent.tagline}
                                              onChange={(e) => {
                                                setSelectedContent(
                                                  (prevState) => {
                                                    return {
                                                      ...prevState,
                                                      tagline: e.target.value,
                                                    };
                                                  }
                                                );
                                              }}
                                              type="text"
                                              className="truncate w-56 py-0.5 ml-2 text-normal-500 px-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500"
                                              placeholder="Tagline...."
                                              required
                                            />
                                          </div>

                                          <div className=" flex justify-between">
                                            <div className="flex items-center">
                                              <label className="w-16 ml-7 inline-block  text-sm font-medium text-gray-900 dark:text-white">
                                                Section :
                                              </label>
                                              <h1 className="truncate w-56 py-0.5 ml-2 text-normal-500 px-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500">
                                                {section.name}
                                              </h1>
                                            </div>
                                            <div className="flex">
                                              <button
                                                type="button"
                                                className="text-cyan-600 bg-transparent hover:bg-cyan-600 hover:text-white rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                                onClick={() => {
                                                  setAddSection(
                                                    (prevState) => ({
                                                      ...prevState,
                                                      modalTwo: false,
                                                      modalOne: false,
                                                      sectionName: "",
                                                    })
                                                  );

                                                  setSections((prevState) => {
                                                    const data = [];
                                                    for (
                                                      index = 0;
                                                      index < prevState.length;
                                                      index++
                                                    ) {
                                                      if (
                                                        prevState[index]
                                                          .name === section.name
                                                      ) {
                                                        data.push({
                                                          ...prevState[index],
                                                          contents: [
                                                            ...prevState[index]
                                                              .contents,
                                                            selectedContent,
                                                          ],
                                                        });
                                                      } else {
                                                        data.push(
                                                          prevState[index]
                                                        );
                                                      }
                                                    }
                                                    return data;
                                                  });
                                                  setSelectedContent({
                                                    content: "",
                                                    name: "",
                                                    tagline: "",
                                                    sectionName: "",
                                                  });
                                                }}
                                              >
                                                <FontAwesomeIcon
                                                  className=" text-xl"
                                                  icon={faCheck}
                                                />
                                              </button>{" "}
                                              <button
                                                type="button"
                                                className="end-2.5 text-red-500 mx-0 bg-transparent hover:bg-red-500 hover:text-white rounded-lg text-sm w-8 h-8  inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                                onClick={() => {
                                                  setSelectedContent({
                                                    content: "",
                                                    name: "",
                                                    tagline: "",
                                                    sectionName: "",
                                                  });
                                                  setSectionData({
                                                    name: "",
                                                    contents: [],
                                                  });
                                                  setAddSection(
                                                    (prevState) => ({
                                                      ...prevState,
                                                      modalTwo: false,
                                                      modalOne: false,
                                                      addSection: false,
                                                    })
                                                  );
                                                }}
                                              >
                                                <FontAwesomeIcon
                                                  className=" text-xl"
                                                  icon={faXmark}
                                                />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                ))}

                                {addSection.modalOne &&
                                  addSection.sectionName === section.name && (
                                    <ContentTableModal
                                      onClickHandler={contentSelectHandler}
                                    />
                                  )}

                                {!addSection.modalOne &&
                                  addSection.modalTwo &&
                                  addSection.sectionName === section.name &&
                                  section.contents.length == 0 && (
                                    <SectionContainer
                                      id={1}
                                      selectedContent={selectedContent}
                                      setSelectedContent={setSelectedContent}
                                      sectionData={sectionData}
                                      setSectionData={setSectionData}
                                      setAddSection={setAddSection}
                                      sections={sections}
                                      setSections={setSections}
                                      modalTwoError={modalTwoError}
                                      setModalTwoError={setModalTwoError}
                                    />
                                  )}
                              </div>
                            ))}

                          {/* popup for the new Add Section */}
                          {newSection && (
                            <div className={`${sections.length > 0 && "mt-2"}`}>
                              <span className="inline-block font-semibold">{`Section ${
                                sections.length + 1
                              } Title : `}</span>
                              <input
                                value={sectionData.name}
                                onChange={(e) => {
                                  if (e.target.value.length > 0) {
                                    setHasError;
                                  } else {
                                    setHasError(false);
                                  }
                                  setSectionData({
                                    name: e.target.value,
                                    contents: [],
                                  });
                                }}
                                className={`${
                                  hasError && "border-red-500"
                                } py-0.5 ml-2 text-normal-500 px-2 outline-none bg-neutral-100 border border-neutral-300 hover:border-blue-400 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-blue-500`}
                                type="text"
                                placeholder="Enter the section Name"
                              />
                              <button
                                onClick={() => {
                                  if (sectionData.name.length == 0) {
                                    setHasError(true);
                                  } else {
                                    setSections((prevState) => [
                                      ...prevState,
                                      sectionData,
                                    ]);
                                    setAddSection((prevState) => ({
                                      ...prevState,
                                      modalOne: true,
                                      modalTwo: false,
                                      sectionName: sectionData.name,
                                    }));
                                    setNewSection(false);
                                  }
                                }}
                                className="h-8 w-8 mx-1  text-white bg-cyan-500 rounded-lg hover:bg-cyan-600 transition-colors border border-white"
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </button>
                              <div className="inline-block">
                                <button
                                  className="h-8 w-8  text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                                  onClick={() => {
                                    setAddSection((prevState) => ({
                                      ...prevState,
                                      addSection: false,
                                    }));
                                    setSectionData({
                                      name: "",
                                      contents: [],
                                    });
                                    setSelectedContent({
                                      sectionName: "",
                                      content: "",
                                      name: "",
                                      tagline: "",
                                      arrangement: 0,
                                    });
                                    setNewSection(false);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faXmark} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-1/2">
                  {console.log("isToggle value is ,", isToggle)}
                  {!isToggle && (
                    <button
                      className={`border-2 mb-2 rounded-md px-4 py-1 mx-4 transition-colors duration-300 ${
                        !isButtonEnabled ? "bg-gray-300" : "btn-secondary"
                      }`}
                      onClick={() => setIsPopupOpen(true)}
                      disabled={!isButtonEnabled}
                    >
                      Add Content to Section
                    </button>
                  )}
                  <div className="container  px-4">
                    <div className="inline-block align-middle w-full overflow-y-auto overflow-x-hidden">
                      {!isToggle && (
                        <div className="flex flex-col">
                          <div className="inline-block align-middle w-full overflow-y-auto overflow-x-hidden">
                            <div className="flex flex-col">
                              <div className="rounded-lg border-2">
                                <div className="overflow-hidden shadow sm:rounded-lg">
                                  <div
                                    className="overflow-y-auto"
                                    style={{ height: "30vh" }}
                                  >
                                    <table
                                      ref={tableRef}
                                      className="table min-w-full divide-y divide-gray-200 rounded-lg border-2"
                                    >
                                      <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                          {columns.map(
                                            (column, index) =>
                                              column !== "id" && (
                                                <th
                                                  className="px-6 py-3 pl-4 text-left text-xs font-medium text-sky-800 uppercase tracking-wide"
                                                  key={index}
                                                >
                                                  {column}
                                                  <span
                                                    className="ml-2 cursor-pointer"
                                                    role="button"
                                                    tabIndex={0}
                                                  ></span>
                                                </th>
                                              )
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {isLoading ? (
                                          <tr>
                                            <td colSpan="100%">
                                              <div className="w-full py-4">
                                                <LoadingSpinner />
                                              </div>
                                            </td>
                                          </tr>
                                        ) : Array.isArray(pitchContent) ? (
                                          pitchContent.length === 0 ? (
                                            <tr
                                              className={
                                                !isButtonEnabled
                                                  ? "bg-gray-300"
                                                  : "btn-secondary"
                                              }
                                            >
                                              <td colSpan="100%">
                                                <div className="h-96 flex justify-center items-center">
                                                  <div className="h-4/5 overflow-hidden">
                                                    <img
                                                      src={EmptyFolder}
                                                      className="max-w-full max-h-[80%]"
                                                      alt="Empty Folder"
                                                      width={200}
                                                      height={200}
                                                      style={{
                                                        "mix-blend-mode":
                                                          "darken",
                                                      }}
                                                    />
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          ) : (
                                            pitchContent.map((item) =>
                                              item.content.map(
                                                (contentItem) => (
                                                  <tr
                                                    key={contentItem.id}
                                                    className="bg-white divide-y cursor-pointer"
                                                  >
                                                    <td className=" px-6 py-4 whitespace-nowrap text-center">
                                                      <input
                                                        type="checkbox"
                                                        checked={checkedItems.has(
                                                          contentItem.id
                                                        )}
                                                        onChange={() =>
                                                          handleCheckboxChange(
                                                            contentItem
                                                          )
                                                        }
                                                      />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm font-bold tracking-wider">
                                                      {contentItem.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                                                      {contentItem.created_by}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                                                      {contentItem.mimetype}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                                                      {contentItem.description}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                                                      {contentItem.folder}
                                                    </td>
                                                  </tr>
                                                )
                                              )
                                            )
                                          )
                                        ) : (
                                          <tr>
                                            <td colSpan="100%">
                                              <div className="w-full py-4">
                                                <p>Content not found</p>
                                              </div>
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isPopupOpen && (
                        <div className="fixed inset-0 flex items-center justify-center z-10">
                          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
                          <div className="bg-white p-6 rounded-md z-10">
                            <div className="h-24 ml-2 justify-center">
                              <label className="w-44 inline-block mb-4 font-semibold text-lg text-gray-900 dark:text-white">
                                Section Selector:
                              </label>
                              <br />
                              <label className="w-20 mt-2 ml-2 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Section:
                              </label>
                              <select
                                className="w-56 mt-1 bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 inline-block p-1 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                value={selectedSection}
                                onChange={handleChange}
                              >
                                {sections.map((section, index) => (
                                  <option key={index} value={section.name}>
                                    {section.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="w-20 mt-2 ml-4 inline-block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Tagline:
                              </label>
                              <input
                                value={selectedContent.tagline}
                                onChange={(e) => {
                                  setSelectedContent((prevState) => ({
                                    ...prevState,
                                    tagline: e.target.value,
                                  }));
                                }}
                                type="text"
                                className="w-56 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 inline-block p-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Enter the tagline Name...."
                                required
                              />
                            </div>

                            <div className="flex gap-4 justify-center">
                              <button
                                onClick={() => setIsPopupOpen(false)}
                                className="text-back mr-6 mt-6 border border-red-900 bg-red-200 hover:bg-red-300 focus:ring-4 font-medium focus:outline-none focus:ring-red-900 font-full rounded-full text-sm w-full sm:w-auto px-8 py-2 text-center dark"
                              >
                                Cancel
                              </button>
                              <button
                                className="text-black border mt-6 border-black bg-white-300 ml-2 focus:ring-4 focus:ring-black-800 font-medium rounded-full text-sm w-full sm:w-auto px-10 border-black-900 py-2 text-center dark:bg-black-600 dark:hover:bg-black-700"
                                onClick={handleSave}
                                disabled={!isButtonEnabled} // Disable button based on state
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Access control section */}
                      <div className=" ">
                        <div className="p-0 ">
                          <h2 className="text-xl font-semibold">
                            Select Access Type
                          </h2>
                          <div className="flex space-x-4">
                            {/* Public Access - Always visible */}
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="public"
                                name="access"
                                value="public"
                                checked={pitchAccess === 1}
                                onClick={PitchAccessOnchangeHandler}
                                className="form-radio text-blue-500"
                              />
                              <label
                                htmlFor="public"
                                className="ml-2 text-gray-700"
                              >
                                Public Access
                              </label>
                            </div>
                            {/* Restricted Access - Only show if not TOF */}
                            {!isToggle && (
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="restricted"
                                  name="access"
                                  value="restricted"
                                  checked={pitchAccess === 0}
                                  onClick={PitchAccessOnchangeHandler}
                                  className="form-radio text-blue-500"
                                />
                                <label
                                  htmlFor="restricted"
                                  className="ml-2 text-gray-700"
                                >
                                  Restricted Access
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                        {pitchAccess === 0 && (
                          <div className="overflow-x-auto rounded-lg border-2 mt-1.5 ">
                            <div className="inline-block align-middle w-full ">
                              <div className="overflow-hidden shadow sm:rounded-lg ">
                                <div
                                  className="overflow-y-auto "
                                  style={{ height: "30vh" }}
                                >
                                  <table
                                    ref={tableRef}
                                    className="table min-w-full divide-y  divide-gray-200 rounded-lg border-2"
                                  >
                                    <thead className="bg-gray-50 sticky top-0">
                                      <tr>
                                        <td className="whitespace-nowrap">
                                          <input
                                            type="checkbox"
                                            checked={
                                              selectedContacts === pitchContacts
                                            }
                                            onChange={() => {
                                              if (
                                                selectedContacts ===
                                                pitchContacts
                                              ) {
                                                setSelectedContacts([]);
                                              } else {
                                                setSelectedContacts(
                                                  pitchContacts
                                                );
                                              }
                                            }}
                                          />
                                        </td>
                                        {contactColumns.map(
                                          (column, index) =>
                                            column !== "id" && (
                                              <th
                                                className="px-6 py-3 pl-4 text-left text-xs font-medium text-sky-800 uppercase tracking-wide "
                                                key={index}
                                              >
                                                {column}
                                                <span
                                                  className="ml-2 cursor-pointer"
                                                  onKeyDown={(e) => {
                                                    if (
                                                      e.key === "Enter" ||
                                                      e.key === " "
                                                    ) {
                                                      e.stopPropagation();
                                                    }
                                                  }}
                                                  role="button"
                                                  tabIndex={0}
                                                ></span>
                                              </th>
                                            )
                                        )}
                                        <th></th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {pitchContactsLoading ? (
                                        <tr>
                                          <td colSpan="100%">
                                            <div className="w-full py-4">
                                              <TableLoading len={2} />
                                            </div>
                                          </td>
                                        </tr>
                                      ) : pitchContacts.length === 0 ? (
                                        <tr>
                                          <td colSpan="100%">
                                            <EmptyFolderComponent />
                                          </td>
                                        </tr>
                                      ) : (
                                        pitchContacts?.length > 0 &&
                                        pitchContacts?.map((item) => (
                                          <tr
                                            key={item.id}
                                            className="bg-white divide-y group"
                                          >
                                            <>
                                              <td className="whitespace-nowrap">
                                                <input
                                                  type="checkbox"
                                                  checked={
                                                    selectedContacts?.some(
                                                      (selectedItem) =>
                                                        selectedItem.Id ===
                                                        item.Id
                                                    ) ||
                                                    selectedContacts?.some(
                                                      (selectedItem) =>
                                                        selectedItem.contact_sfdc_id ===
                                                        item.Id
                                                    )
                                                  }
                                                  onChange={() => {
                                                    if (
                                                      selectedContacts?.some(
                                                        (selectedItem) =>
                                                          selectedItem.Id ===
                                                            item.Id ||
                                                          selectedItem.contact_sfdc_id ===
                                                            item.Id
                                                      )
                                                    ) {
                                                      setSelectedContacts(
                                                        (prevState) =>
                                                          prevState.filter(
                                                            (contact) =>
                                                              contact?.Id !==
                                                                item.Id &&
                                                              contact?.contact_sfdc_id !==
                                                                item?.Id
                                                          )
                                                      );
                                                    } else {
                                                      setSelectedContacts(
                                                        (prevState) => [
                                                          ...prevState,
                                                          item,
                                                        ]
                                                      );
                                                    }
                                                  }}
                                                />
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-sm font-bold cursor-pointer tracking-wider">
                                                {item.Name}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                                                {item.Email}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                                                {item.Title}
                                              </td>
                                              <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm font-normal tracking-wider">
                                                {item.MailingCountry}
                                              </td>
                                            </>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="line absolute top-4 left-1/2 w-0.5 h-[71%] mt-28 bg-gray-200 transform -translate-x-1/2"></div>
              </div>

              {/* cancel save button  */}
              <div className="flex justify-end mr-5 space-x-8 mb-4 ">
                <button
                  className="px-6 py-2 w-20 text-sm text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                  onClick={() => {
                    setStep(1);
                  }}
                >
                  Back
                </button>

                <button
                  className={`px-6 py-2 w-20 flex justify-center items-center text-sm btn-secondary text-white rounded-lg transition-colors`}
                  onClick={() => {
                    if (deleteHightlightVideoIds.length > 0) {
                      deleteVideoHandler();
                    }
                    editPitchHandler();
                    // FetchContacts();
                    setStep(0);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {contentModalLoading ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 ">
          <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
          <LoadingSpinner />
        </div>
      ) : (
        <ContentModal
          content={selectedContent}
          isOpen={setContentModalOpen}
          closeModal={closeModal}
          setSelectedContent={setSelectedContent}
        />
      )}

      {driveSelection && <DriveSelection />}

      {versionContentModalLoading ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 ">
          <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
          <LoadingSpinner />
        </div>
      ) : (
        <VersionContentModal
          versionModalOpen={versionModalOpen}
          viewVersionContent={viewVersionContent}
          setViewVersionContent={setViewVersionContent}
          content={selectedContent}
          setVersionModalOpen={setVersionModalOpen}
          selectedVersionContent={selectedVersionContent}
          setSelectedVersionContent={setSelectedVersionContent}
          UpdateContentVersionHandler={UpdateContentVersionHandler}
        />
      )}

      <button
        className="text-secondary text-[14px] mt-2 pt-1 pb-1 pl-4 pr-4 mr-2 mb-2 rounded-md border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
        onClick={() => {
          pitchLayoutHandler();
          selectedPitchButtonHandler(), setStep(1);
        }}
      >
        <FontAwesomeIcon icon={faEdit} className=" mr-2" />
        Edit
      </button>
      <div className="absolute">
        <div>
          <div>{renderContent()}</div>
        </div>
      </div>
    </>
  );
}
