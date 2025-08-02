import { useContext, useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faXmark,
  faCheck,
  faGripVertical,
  faObjectGroup,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ContentTableModal from "../ContentTableModal";
import { TbEdit } from "react-icons/tb";
import { MdRemoveCircleOutline } from "react-icons/md";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { GlobalContext } from "../../../../context/GlobalState";
import {
  addNewSection,
  addContentToSection,
  reorderContentsWithinSection,
  moveContentBetweenSections,
  reorderSections,
  removeSection,
  removeContentFromSection,
  updateContentTagline,
  updateAllSections,
  setIsAddingSection,
  setIsTaglineFormOpen,
  updateSectionName,
  insertContentsIntoSection,
  addContentGroup,
  renameContentGroup,
  removeContentGroup,
  updateFeatureInSection,
  onSignatureRevoke
} from "../../../../features/pitch/editPitchSlice";
import { useDispatch, useSelector } from "react-redux";
import AddPitchStreams from "../AddPitchStreams";
import EmptySection from "../EmptySection";
import ContentModal from "../../ContentManager/ContentTable/ContentModal";
import LoadingSpinner from "../../../../utility/LoadingSpinner";
import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";
import toast from "react-hot-toast";
import { LuGoal } from "react-icons/lu";
import { FaRegFileImage } from "react-icons/fa";
import ProcessOverViewModal from "../PitchContentFeatures/ProcessOverview/ProcessOverViewModal";
import ActionPlanEditor from "../PitchContentFeatures/ActionPlan/ActionPlanEditor";
import { PiLineSegmentsBold } from "react-icons/pi";
import { FaFileSignature } from "react-icons/fa6";
import { MdMessage } from "react-icons/md";
import EsignerModal from "../PitchContentFeatures/Esigner/EsignerModal";
import UserMessage from "../PitchContentFeatures/UserMessage/UserMessage";
import HTMLBlock from "../PitchContentFeatures/HTMLBlock/HTMLBlock";
import FileUploader from "../PitchContentFeatures/FileUploader/FileUploader";
import { FaCode } from "react-icons/fa";
import { FaUpload } from "react-icons/fa6";

function SectionsAndContents() {
  const pitchState = useSelector((state) => state.editPitchSlice);
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();
  const { viewer_id, setContentModalOpen, setViewContent } =
    useContext(GlobalContext);
  const containerRef = useRef(null);

  const [isContentTableModalOpen, setIsContentTableModalOpen] = useState(false);
  const [error, setError] = useState(false);
  const [autoScroll, setAutoScroll] = useState({
    active: false,
    speed: 0,
    direction: 0,
  });
  const [actionPlaneModalOpen, setActionPlanModalOpen] = useState(false);
  const [eSignerModalOpen, setESignerModalOpen] = useState(false);
  const [userMessageModal, setUserMessageModal] = useState(false);
  const [htmlBlockModalOpen, setHtmlBlockModalOpen] = useState(false);
  const [fileUploaderModalOpen, setFileUploaderModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState({
    name: "",
    tagline: "",
    content: "",
    mimetype: "",
    source: "",
    content_link: "",
  });

  // New state for tracking which content is being edited
  const [editingContent, setEditingContent] = useState({
    sectionIndex: null,
    contentIndex: null,
    content: null,
  });

  const [contentModalLoading, setContentModalLoading] = useState(false);
  const [pitchStreamsOpen, setPitchStreamsOpen] = useState(false);
  const [sectionData, setSectionData] = useState({
    name: "",
    contents: [],
  });

  const [currentSectionIndex, setCurrentSectionIndex] = useState(null);

  // Content Grouping States
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupingSectionIndex, setGroupingSectionIndex] = useState(null);
  const [selectedContentsForGroup, setSelectedContentsForGroup] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [showGroupNameInput, setShowGroupNameInput] = useState(false);
  const [editingGroupName, setEditingGroupName] = useState(null); // Holds the group being edited
  const [newGroupName, setNewGroupName] = useState(""); // Holds the new name input
  const [addMenuOpenSectionIndex, setAddMenuOpenSectionIndex] = useState(null); // Track which section's add menu is open
  const [processOverViewModalOpen, setProcessOverviewModalOpen] =
    useState(false);
  const [currentSectionIndexForFeatures, setCurrentSectionIndexForFeatures] =
    useState(false);
  // Auto-scroll effect
  useEffect(() => {
    if (!autoScroll.active || !containerRef.current) return;

    const scrollContainer = containerRef.current;
    const scrollInterval = setInterval(() => {
      scrollContainer.scrollTop += autoScroll.speed * autoScroll.direction;
    }, 10);

    return () => clearInterval(scrollInterval);
  }, [autoScroll]);

  // Content Grouping Functions
  const startGrouping = (sectionIndex) => {
    setIsCreatingGroup(true);
    setGroupingSectionIndex(sectionIndex);
    setSelectedContentsForGroup([]);
  };

  const cancelGrouping = () => {
    setIsCreatingGroup(false);
    setGroupingSectionIndex(null);
    setSelectedContentsForGroup([]);
    setGroupName("");
    setShowGroupNameInput(false);
  };

  const toggleContentSelection = (sectionIndex, contentIndex, content) => {
    const contentId = content.content;
    const key = `${sectionIndex}-${contentId}`;

    if (selectedContentsForGroup.some((item) => item.key === key)) {
      setSelectedContentsForGroup((prev) =>
        prev.filter((item) => item.key !== key)
      );
    } else {
      if (selectedContentsForGroup.length < 4) {
        setSelectedContentsForGroup((prev) => [
          ...prev,
          {
            key,
            sectionIndex,
            contentIndex,
            contentId,
            content,
          },
        ]);
      }
    }
  };

  const proceedToNaming = () => {
    if (selectedContentsForGroup.length > 0) {
      setShowGroupNameInput(true);
    }
  };

  const RenameGroup = (oldName, newName) => {
    if (oldName.trim() === newName.trim()) {
      toast.error("Old Name and New Name are Same");
      return;
    }

    const isDuplicateGroup = pitchState.content_groups.some(
      (group) => group.name?.trim() === newName.trim()
    );

    if (isDuplicateGroup) {
      toast.error("A group with this exact name already exists.");
      return;
    }

    dispatch(
      renameContentGroup({
        oldName: oldName,
        newName: newName,
      })
    );
  };

  const createGroup = () => {
    const isDuplicateGroup = pitchState.content_groups.some(
      (group) => group.name?.trim() === groupName.trim()
    );

    if (isDuplicateGroup) {
      console.warn("A group with this exact name already exists.");
      toast.error("A group with this exact name already exists.");
      return;
    }
    if (
      groupName.trim() &&
      selectedContentsForGroup.length > 0 &&
      groupingSectionIndex !== null
    ) {
      dispatch(addContentGroup({ name: groupName }));
      // Update the contents with the new group name
      const updatedContents = pitchState.sections[
        groupingSectionIndex
      ].contents.map((content) => {
        const selectedContent = selectedContentsForGroup.find(
          (item) => item.contentId === content.content
        );
        if (selectedContent) {
          return { ...content, group_name: groupName };
        }
        return content;
      });

      // Find the minimum arrangement number among selected contents
      const selectedArrangements = selectedContentsForGroup.map((item) => {
        const content = updatedContents.find(
          (c) => c.content === item.contentId
        );
        return content ? content.arrangement : Infinity;
      });
      const minArrangement = Math.min(...selectedArrangements);

      // Get the newly grouped contents (those that just got the group_name)
      const newlyGroupedContents = updatedContents.filter((content) =>
        selectedContentsForGroup.some(
          (item) => item.contentId === content.content
        )
      );

      // Get contents that are not part of the new group
      const nonGroupedContents = updatedContents.filter(
        (content) =>
          !selectedContentsForGroup.some(
            (item) => item.contentId === content.content
          )
      );

      // Sort newly grouped contents by their original arrangement
      const sortedNewlyGrouped = newlyGroupedContents.sort(
        (a, b) => a.arrangement - b.arrangement
      );

      // Create a map to track which positions are taken by grouped items
      const groupedPositions = new Set();
      for (let i = 0; i < sortedNewlyGrouped.length; i++) {
        groupedPositions.add(minArrangement + i);
      }

      // Create the final reordered array
      const reorderedContents = [];
      let groupIndex = 0;

      // First, place all grouped items in their consecutive positions
      for (let i = 0; i < sortedNewlyGrouped.length; i++) {
        reorderedContents.push({
          ...sortedNewlyGrouped[i],
          arrangement: minArrangement + i,
        });
      }

      // Then, place non-grouped items in remaining positions
      let currentPosition = 1;
      for (const content of nonGroupedContents.sort(
        (a, b) => a.arrangement - b.arrangement
      )) {
        // Skip positions occupied by grouped items
        while (groupedPositions.has(currentPosition)) {
          currentPosition++;
        }

        reorderedContents.push({
          ...content,
          arrangement: currentPosition,
        });
        currentPosition++;
      }

      // Sort by arrangement to get final order
      const finalContents = reorderedContents.sort(
        (a, b) => a.arrangement - b.arrangement
      );

      // Update the section with modified and reordered contents
      dispatch(
        updateAllSections(
          pitchState.sections.map((section, index) =>
            index === groupingSectionIndex
              ? { ...section, contents: finalContents }
              : section
          )
        )
      );

      // Reset grouping state
      setIsCreatingGroup(false);
      setGroupingSectionIndex(null);
      setSelectedContentsForGroup([]);
      setGroupName("");
      setShowGroupNameInput(false);
    }
  };

  const removeGroup = (groupName) => {
    // Find the section containing this group
    const sectionIndex = pitchState.sections.findIndex((section) =>
      section.contents.some((content) => content.group_name === groupName)
    );

    if (sectionIndex !== -1) {
      dispatch(removeContentGroup(groupName));
      // Remove multiple fields from all contents in this group
      const updatedContents = pitchState.sections[sectionIndex].contents.map(
        (content) => {
          if (content.group_name === groupName) {
            // Destructure and omit group_name, pitch_content_group, and pitch_content_group_name
            const {
              group_name,
              pitch_content_group,
              pitch_content_group_name,
              ...contentWithoutGroup
            } = content;
            return contentWithoutGroup;
          }
          return content;
        }
      );

      // Update the section with modified contents
      dispatch(
        updateAllSections(
          pitchState.sections.map((section, index) =>
            index === sectionIndex
              ? { ...section, contents: updatedContents }
              : section
          )
        )
      );
    }
  };

  // Modified function to get contents in arrangement order with groups
  const getContentsInArrangementOrder = (sectionIndex) => {
    const section = pitchState.sections[sectionIndex];
    if (!section) return { groups: [], ungrouped: [] };

    // Sort contents by arrangement
    const sortedContents = [...section.contents].sort(
      (a, b) => a.arrangement - b.arrangement
    );

    const result = {
      groups: [],
      ungrouped: [],
    };

    let currentGroup = null;

    for (let i = 0; i < sortedContents.length; i++) {
      const content = sortedContents[i];

      if (content.group_name) {
        if (!currentGroup || currentGroup.name !== content.group_name) {
          // New group found
          if (currentGroup) {
            // Push the previous group before starting new one
            result.groups.push(currentGroup);
          }
          currentGroup = {
            name: content.group_name,
            contents: [content],
            startIndex: i,
            arrangement: content.arrangement,
          };
        } else {
          // Add to current group
          currentGroup.contents.push(content);
        }
      } else {
        if (currentGroup) {
          // Push the current group before adding ungrouped content
          result.groups.push(currentGroup);
          currentGroup = null;
        }
        result.ungrouped.push(content);
      }
    }

    // Push the last group if it exists
    if (currentGroup) {
      result.groups.push(currentGroup);
    }

    return result;
  };

  // New handler for editing content
  const handleEditContent = (sectionIndex, contentIndex, content) => {
    setEditingContent({
      sectionIndex,
      contentIndex,
      content: {
        ...content,
        name: content.name,
        tagline: content.tagline,
      },
    });
    setCurrentSectionIndex(null);
  };

  // Handler to save edited content
  const handleSaveEditedContent = () => {
    if (!editingContent.content) return;

    dispatch(
      updateContentTagline({
        sectionIndex: editingContent.sectionIndex,
        contentIndex: editingContent.contentIndex,
        tagline: editingContent.content.tagline,
      })
    );

    setEditingContent({
      sectionIndex: null,
      contentIndex: null,
      content: null,
    });

    dispatch(setIsTaglineFormOpen(false));
  };

  // Handler to cancel editing
  const handleCancelEditContent = () => {
    setEditingContent({
      sectionIndex: null,
      contentIndex: null,
      content: null,
    });
    dispatch(setIsTaglineFormOpen(false));
  };

  // Handler for removing a section
  const handleRemoveSection = (index) => {
    dispatch(setIsTaglineFormOpen(false));
    dispatch(removeSection(index));
  };

  // Handler for removing content from a section
  const handleRemoveContent = (sectionIndex, contentIndex) => {
    dispatch(removeContentFromSection({ sectionIndex, contentIndex }));
  };

  const handleCancelAddSection = () => {
    dispatch(setIsAddingSection(false));
    setSectionData({ name: "", contents: [] });
    setError(false);
  };

  const handleAddContentToSection = (content) => {
    if (!content.name.trim()) return;

    if (currentSectionIndex === -1) {
      const newSection = {
        name: sectionData.name,
        contents: [
          {
            ...content,
            arrangement: 1,
          },
        ],
      };
      dispatch(addNewSection({ section: newSection }));
    } else {
      dispatch(
        addContentToSection({
          data: {
            index: currentSectionIndex,
            content: {
              ...content,
              arrangement:
                pitchState.sections[currentSectionIndex].contents.length + 1,
            },
          },
        })
      );
    }

    dispatch(setIsAddingSection(false));
    setSectionData({ name: "", contents: [] });
    setSelectedContent({
      name: "",
      tagline: "",
      content: "",
      mimetype: "",
      source: "",
      content_link: "",
    });
    setCurrentSectionIndex(null);
    dispatch(setIsTaglineFormOpen(false));
  };

  const contentSelectHandler = (content) => {
    const isValidId = content?.id !== "-1";
    if (!isValidId) {
      setIsContentTableModalOpen(false);
      setCurrentSectionIndex(null);
      dispatch(setIsTaglineFormOpen(false));
      return;
    }
    setSelectedContent({
      content: content?.id || content?.contentId,
      content_id: content?.id || content.contentId,
      name: content?.name || content?.contentName,
      tagline: "",
      mimetype: content?.mimetype || "",
      content_mimetype: content?.mimetype || "",
      source: content?.source || "",
      content_source: content?.source || "",
      content_size: 0.0,
      content_link: content?.content || "",
    });

    setIsContentTableModalOpen(false);
  };
  const onMultiSelectHandler = (contents) => {
    const transformedContents = contents.map((content) => ({
      content: content?.id || content?.contentId,
      content_id: content?.id || content.contentId,
      name: content?.name || content?.contentName,
      tagline: content.tagline,
      mimetype: content?.mimetype || "",
      content_mimetype: content?.mimetype || "",
      source: content?.source || "",
      content_source: content?.source || "",
      content_size: 0.0,
      content_link: content?.content || "",
    }));

    if (currentSectionIndex === -1) {
      const newSection = {
        name: sectionData.name,
        contents: transformedContents,
      };
      dispatch(addNewSection({ section: newSection }));
    } else {
      dispatch(
        insertContentsIntoSection({
          sectionIndex: currentSectionIndex,
          contentsToAdd: transformedContents,
        })
      );
    }

    setIsContentTableModalOpen(false);
    dispatch(setIsAddingSection(false));
    setSectionData({ name: "", contents: [] });
    setSelectedContent({
      name: "",
      tagline: "",
      content: "",
      mimetype: "",
      source: "",
      content_link: "",
    });
    setCurrentSectionIndex(null);
    dispatch(setIsTaglineFormOpen(false));
  };

  const handleAddContentToExistingSection = (index) => {
    setCurrentSectionIndex(index);
    setSelectedContent({
      name: "",
      tagline: "",
      content: "",
      mimetype: "",
      source: "",
      content_link: "",
    });
  };

  const handleDragStart = () => {
    setAutoScroll({ active: false, speed: 0, direction: 0 });
  };

  const handleDragUpdate = (update) => {
    if (!containerRef.current || !update.clientY) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollSensitiveAreaSize = 100;

    const distanceFromTop = update.clientY - containerRect.top;
    const distanceFromBottom = containerRect.bottom - update.clientY;

    if (distanceFromTop < scrollSensitiveAreaSize) {
      const scrollSpeed = Math.max(
        1,
        (scrollSensitiveAreaSize - distanceFromTop) / 10
      );
      setAutoScroll({ active: true, speed: scrollSpeed, direction: -1 });
    } else if (distanceFromBottom < scrollSensitiveAreaSize) {
      const scrollSpeed = Math.max(
        1,
        (scrollSensitiveAreaSize - distanceFromBottom) / 10
      );
      setAutoScroll({ active: true, speed: scrollSpeed, direction: 1 });
    } else {
      setAutoScroll({ active: false, speed: 0, direction: 0 });
    }
  };

  const handleDragEnd = (result) => {
    setAutoScroll({ active: false, speed: 0, direction: 0 });

    const { source, destination, type } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === "SECTION") {
      dispatch(
        reorderSections({
          sourceIndex: source.index,
          destinationIndex: destination.index,
        })
      );
    } else {
      if (source.droppableId === destination.droppableId) {
        const sectionIndex = Number.parseInt(
          source.droppableId.replace("section-", "")
        );
        dispatch(
          reorderContentsWithinSection({
            sectionIndex,
            sourceIndex: source.index,
            destinationIndex: destination.index,
          })
        );
      } else {
        const sourceSectionIndex = Number.parseInt(
          source.droppableId.replace("section-", "")
        );
        const destinationSectionIndex = Number.parseInt(
          destination.droppableId.replace("section-", "")
        );

        dispatch(
          moveContentBetweenSections({
            sourceSectionIndex,
            destinationSectionIndex,
            sourceIndex: source.index,
            destinationIndex: destination.index,
          })
        );
      }
    }

    setCurrentSectionIndex(null);
    setSelectedContent({
      name: "",
      tagline: "",
      content: "",
      mimetype: "",
      source: "",
      content_link: "",
    });
  };

  // Handle Content Click
  const handleContentClick = async (item) => {
    setSelectedContent(item);
    if (item?.mimetype == "/pitchfeature") {
      const contentLinkJSON = JSON.parse(item.content_link);
      if (contentLinkJSON.Type === "ActionPlan") {
        setActionPlanModalOpen(true);
      } else if (contentLinkJSON.Type === "ProcessOverview") {
        setProcessOverviewModalOpen(true);
      } else if (contentLinkJSON.Type === "ESign") {
        setESignerModalOpen(true);
      } else if (contentLinkJSON.Type === "UserMessage") {
        setUserMessageModal(true);
      } else if (contentLinkJSON.Type === "HtmlBlock") {
        setHtmlBlockModalOpen(true);
      } else if (contentLinkJSON.Type === "FileUploader") {
        setFileUploaderModalOpen(true);
      }

      return;
    }
    try {
      setContentModalLoading(true);

      if (item?.content_mimetype) {
        if (
          item.content_mimetype?.includes("application/vnd") ||
          item.content_mimetype?.includes("application/msword") ||
          item.content_mimetype?.includes("video/")
        ) {
          const res = await axiosInstance.post(`/open-content`, {
            contentId: item?.content || item?.id || item?.contentId,
            viewerId: viewer_id,
          });
          if (res.data && res.data.sasUrl) {
            setViewContent(res.data.sasUrl);
          } else {
            console.warn("sasURL not found in response. Falling back to blob.");
            const blobRes = await axiosInstance.post(
              `/open-content`,
              {
                contentId: item?.content || item?.id || item?.contentId,
                viewerId: viewer_id,
              },
              {
                responseType: "blob",
              }
            );
            const contentBlob = new Blob([blobRes.data], {
              type: item.content_mimetype || "application/octet-stream",
            });
            setViewContent(contentBlob);
          }
        } else if (item.content_mimetype?.includes("application/url")) {
          setViewContent(item.content);
        } else {
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

          const contentBlob = new Blob([res.data], {
            type: `${item.content_mimetype}`,
          });
          setViewContent(contentBlob);
        }

        setContentModalOpen(true);
      } else {
        if (
          ["png", "jpg", "jpeg", "webp", "bmp", "gif", "svg"].some((format) =>
            item.name.toLowerCase().includes(format)
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
        } else if (item.name.toLowerCase().includes(".mp4")) {
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
              responseType: "blob",
            }
          );
          const contentBlob = new Blob([res.data], {
            type: `application/pdf`,
          });
          const url = URL.createObjectURL(contentBlob);

          setViewContent(url);
        }
        setContentModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContentModalLoading(false);
    }
  };

  // Updated TaglineForm component
  const TaglineForm = ({
    sectionIndex,
    contentIndex,
    content,
    onSubmit,
    onCancel,
    isEditing = false,
  }) => (
    <div className="border-2 flex flex-col p-1 rounded-xl mt-2 border-border">
      <div className="flex items-center gap-2 flex-grow min-w-0 ml-2 mr-20">
        <span className="flex-shrink-0 mr-2 border-neutral-400 border size-[20px] flex justify-center items-center text-xs rounded-full bg-neutral-50 text-neutral-700 font-bold">
          {isEditing
            ? contentIndex + 1
            : sectionIndex === -1
            ? 1
            : pitchState.sections[sectionIndex]?.contents.length + 1 || 1}
        </span>
        <label className="flex-shrink-0 font-semibold whitespace-nowrap">
          Name :
        </label>
        <div className="ml-2 py-0.5 px-1 flex-grow min-w-0 text-normal-500 truncate outline-none bg-neutral-100 border border-neutral-300 rounded-md text-neutral-800">
          {isEditing
            ? editingContent.content.name || content.content_name
            : content.name}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-grow min-w-0 ml-[2.75rem] mt-1">
        <label className="flex-shrink-0 font-semibold whitespace-nowrap">
          Tagline :
        </label>
        <input
          value={isEditing ? editingContent.content.tagline : content.tagline}
          onChange={(e) => {
            if (isEditing) {
              setEditingContent((prev) => ({
                ...prev,
                content: {
                  ...prev.content,
                  tagline: e.target.value,
                },
              }));
            } else {
              setSelectedContent((prevState) => ({
                ...prevState,
                tagline: e.target.value,
              }));
            }
          }}
          type="text"
          className="py-0.5 px-1 flex-grow min-w-0 text-normal-500 truncate outline-none bg-neutral-100 border border-neutral-300 hover:border-cyan-600 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-cyan-600"
          placeholder="Tagline..."
          autoFocus
        />
        <div className="flex ml-1 gap-1">
          <button
            type="button"
            onClick={onSubmit}
            className={`text-sky-700 bg-transparent rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white ${
              !(isEditing ? editingContent.content.tagline : content.tagline)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={
              !(isEditing ? editingContent.content.tagline : content.tagline)
            }
          >
            <FontAwesomeIcon className="text-xl" icon={faCheck} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-red-500 mx-0 bg-transparent hover:bg-red-500 hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <FontAwesomeIcon className="text-xl" icon={faXmark} />
          </button>
        </div>
      </div>
    </div>
  );

  // Add this function before the return statement
  const renderContentItem = (content, sectionIndex, originalIndex) => {
    return (
      <Draggable
        key={`content-${content.content}`}
        draggableId={`content-${content.content}`}
        index={originalIndex}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`border-2 flex flex-col p-0.5 rounded-xl bg-neutral-100 hover:bg-neutral-100 transition-all mb-1 ${
              snapshot.isDragging ? "opacity-75 z-10" : ""
            } ${
              isCreatingGroup &&
              groupingSectionIndex === sectionIndex &&
              selectedContentsForGroup.some(
                (item) =>
                  item.contentId === content.content &&
                  item.sectionIndex === sectionIndex
              )
                ? "border-cyan-500 bg-cyan-50"
                : ""
            }`}
          >
            <div className="flex items-center gap-2 flex-grow min-w-0 ml-2 mr-2 ">
              <span className="flex-shrink-0 mr-2 border-neutral-400 border size-[20px] flex justify-center items-center text-xs rounded-full bg-neutral-50 text-neutral-700 font-bold">
                {content.arrangement}
              </span>
              <div
                className="cursor-pointer ml-2 py-0.5 px-1 flex-grow min-w-0 text-normal-500 truncate outline-none text-sm text-neutral-800"
                onClick={() => {
                  setSelectedContent({
                    name: "",
                    tagline: "",
                    content: "",
                    mimetype: "",
                    source: "",
                    content_link: "",
                  });
                  setCurrentSectionIndexForFeatures(sectionIndex);
                  handleContentClick(content);
                }}
              >
                {content.tagline}
              </div>

              {isCreatingGroup &&
                groupingSectionIndex === sectionIndex &&
                !content.group_name &&
                content?.mimetype !== "/pitchfeature" && ( // Added condition here
                  <button
                    onClick={() =>
                      toggleContentSelection(
                        sectionIndex,
                        originalIndex,
                        content
                      )
                    }
                    className={`px-2 ${
                      selectedContentsForGroup.some(
                        (item) =>
                          item.contentId === content.content &&
                          item.sectionIndex === sectionIndex
                      )
                        ? "text-cyan-600"
                        : "text-gray-400"
                    }`}
                  >
                    <FontAwesomeIcon icon={faObjectGroup} />
                  </button>
                )}

              {content?.mimetype !== "/pitchfeature" && (
                <button
                  onClick={() => {
                    handleEditContent(sectionIndex, originalIndex, content);
                    dispatch(setIsTaglineFormOpen(true));
                  }}
                  className="px-2 text-cyan-600 hover:text-cyan-700"
                >
                  <TbEdit />
                </button>
              )}

              <button
                onClick={() => {
                  handleRemoveContent(sectionIndex, originalIndex);
                }}
                className="text-red-500 hover:text-red-600"
              >
                <MdRemoveCircleOutline />
              </button>

              <span
                {...provided.dragHandleProps}
                className="flex-shrink-0 cursor-grab"
              >
                <FontAwesomeIcon
                  icon={faGripVertical}
                  className="text-gray-400 h-5 w-5 mt-1"
                />
              </span>
            </div>

            {editingContent.sectionIndex === sectionIndex &&
              editingContent.contentIndex === originalIndex && (
                <TaglineForm
                  sectionIndex={sectionIndex}
                  contentIndex={originalIndex}
                  content={content}
                  onSubmit={handleSaveEditedContent}
                  onCancel={handleCancelEditContent}
                  isEditing={true}
                />
              )}
          </div>
        )}
      </Draggable>
    );
  };

  // Handler for Add Process Overview (for now, just log)
  const handleAddProcessOverview = (index) => {
    handleAddContentToExistingSection(index);
    setProcessOverviewModalOpen(true);
    setAddMenuOpenSectionIndex(null);
  };

  const handleAddActionPlan = (index) => {
    handleAddContentToExistingSection(index);
    setActionPlanModalOpen(true);
    setAddMenuOpenSectionIndex(null);
  };

  const handleESignPlan = (index) => {
    handleAddContentToExistingSection(index);
    setESignerModalOpen(true);
    setAddMenuOpenSectionIndex(null);
  };

  const handleUserMessage = (index) => {
    handleAddContentToExistingSection(index);
    setUserMessageModal(true);
    setAddMenuOpenSectionIndex(null);
  };

  const handleHtmlBlock = (index) => {
    handleAddContentToExistingSection(index);
    setHtmlBlockModalOpen(true);
    setAddMenuOpenSectionIndex(null);
  };

  const handleFileUploader = (index) => {
    handleAddContentToExistingSection(index);
    setFileUploaderModalOpen(true);
    setAddMenuOpenSectionIndex(null);
  };

  console.log("PITCH STATEL ASEDSJ", pitchState.sections);
  // Close dropdown on outside click
  useEffect(() => {
    if (addMenuOpenSectionIndex === null) return;
    const handleClick = (e) => {
      if (!e.target.closest(".add-menu-dropdown")) {
        setAddMenuOpenSectionIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [addMenuOpenSectionIndex]);

  const onProcessEdit = ({ editedContentId, editedData }) => {
    dispatch(
      updateFeatureInSection({
        sectionIndex: currentSectionIndexForFeatures,
        contentId: editedContentId,
        editedData,
        type: "process-overview",
      })
    );
    setCurrentSectionIndex(null);
    setProcessOverviewModalOpen(false);
  };

  const onActionPlanEdit = ({ editedContentId, editedData }) => {
    dispatch(
      updateFeatureInSection({
        sectionIndex: currentSectionIndexForFeatures,
        contentId: editedContentId,
        editedData,
        type: "action-plan",
      })
    );
    setCurrentSectionIndex(null);
    setActionPlanModalOpen(false);
  };

  const onUserMessageEdit = ({ editedContentId, editedData }) => {
    dispatch(
      updateFeatureInSection({
        sectionIndex: currentSectionIndexForFeatures,
        contentId: editedContentId,
        editedData,
        type: "user-message",
      })
    );
    setCurrentSectionIndex(null);
    setUserMessageModal(false);
  };

  const onEsignerEdit = ({ editedContentId, editedData }) => {
    dispatch(
      updateFeatureInSection({
        sectionIndex: currentSectionIndexForFeatures,
        contentId: editedContentId,
        editedData,
        type: "esigner",
      })
    );
    setCurrentSectionIndex(null);
    setUserMessageModal(false);
  };
  const onSignRevoke = ({editedContentId , editedData}) => {
    dispatch(
      onSignatureRevoke ({
        sectionIndex: currentSectionIndexForFeatures,
        contentId: editedContentId,
        editedData: editedData
      })
    )
  }
  const onHtmlBlockEdit = ({ editedContentId, editedData }) => {
    dispatch(
      updateFeatureInSection({
        sectionIndex: currentSectionIndexForFeatures,
        contentId: editedContentId,
        editedData,
        type: "html-block",
      })
    );
    setCurrentSectionIndex(null);
    setHtmlBlockModalOpen(false);
  };

  const onFileUploaderEdit = ({ editedContentId, editedData }) => {
    dispatch(
      updateFeatureInSection({
        sectionIndex: currentSectionIndexForFeatures,
        contentId: editedContentId,
        editedData,
        type: "file-uploader",
      })
    );
    setCurrentSectionIndex(null);
    setHtmlBlockModalOpen(false);
  };

  // Add refs for each section
  const sectionRefs = useRef([]);
  // Add a ref for the new section form
  const newSectionRef = useRef(null);
  // Add a ref for the new section plus button
  const newSectionPlusButtonRef = useRef(null);

  // useDropdownPosition hook (copied from AddPitchV2)
  const useDropdownPosition = (triggerRef, isOpen) => {
    const [position, setPosition] = useState({});

    useEffect(() => {
      if (!isOpen || !triggerRef.current) return;

      const calculatePosition = () => {
        const buttonRect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const dropdownHeight = 250; // Approximate dropdown height

        if (spaceBelow > dropdownHeight || spaceBelow > buttonRect.top) {
          // Position below
          return {
            top: `${buttonRect.bottom + window.scrollY}px`,
            left: `${buttonRect.left + window.scrollX}px`,
            position: "fixed",
          };
        } else {
          // Position above
          return {
            top: `${buttonRect.top + window.scrollY - dropdownHeight}px`,
            left: `${buttonRect.left + window.scrollX}px`,
            position: "fixed",
          };
        }
      };

      setPosition(calculatePosition());

      const handleScrollResize = () => {
        setPosition(calculatePosition());
      };

      window.addEventListener("scroll", handleScrollResize);
      window.addEventListener("resize", handleScrollResize);

      return () => {
        window.removeEventListener("scroll", handleScrollResize);
        window.removeEventListener("resize", handleScrollResize);
      };
    }, [isOpen, triggerRef]);

    return position;
  };

  const dropdownPosition = useDropdownPosition(
    newSectionPlusButtonRef,
    addMenuOpenSectionIndex === -1
  );

  // Close dropdown on outside click and scroll section/new section into view
  useEffect(() => {
    if (addMenuOpenSectionIndex === null) return;

    // Scroll the section into view when opening the add menu
    if (
      addMenuOpenSectionIndex !== null &&
      addMenuOpenSectionIndex !== -1 &&
      sectionRefs.current[addMenuOpenSectionIndex]
    ) {
      sectionRefs.current[addMenuOpenSectionIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    // Scroll the new section form into view if adding to new section
    if (addMenuOpenSectionIndex === -1 && newSectionRef.current) {
      newSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

    // Ensure dropdown is visible after rendering
    const ensureDropdownVisible = () => {
      const container = containerRef.current;
      const dropdown = container?.querySelector(
        ".add-menu-dropdown:not([hidden])"
      );

      if (container && dropdown) {
        const containerRect = container.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();

        // Check if dropdown is out of view at the bottom
        if (dropdownRect.bottom > containerRect.bottom) {
          const scrollAmount = dropdownRect.bottom - containerRect.bottom + 10;
          container.scrollBy({
            top: scrollAmount,
            behavior: "smooth",
          });
        }
        // Check if dropdown is out of view at the top
        else if (dropdownRect.top < containerRect.top) {
          const scrollAmount = dropdownRect.top - containerRect.top - 10;
          container.scrollBy({
            top: scrollAmount,
            behavior: "smooth",
          });
        }
      }
    };

    // Run after dropdown renders
    setTimeout(ensureDropdownVisible, 50);

    const handleClick = (e) => {
      if (!e.target.closest(".add-menu-dropdown")) {
        setAddMenuOpenSectionIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [addMenuOpenSectionIndex]);

  return (
    <div ref={containerRef} className="h-[100%] overflow-y-auto p-2">
      {isContentTableModalOpen && (
        <ContentTableModal
          onClickHandler={contentSelectHandler}
          onMultiSelectHandler={onMultiSelectHandler}
        />
      )}
      {pitchStreamsOpen && (
        <AddPitchStreams
          onCancel={() => {
            setPitchStreamsOpen(false);
          }}
          sections={pitchState.sections}
          setSections={(data) => {
            dispatch(updateAllSections(data));
          }}
        />
      )}

      {processOverViewModalOpen && (
        <ProcessOverViewModal
          onClose={() => setProcessOverviewModalOpen(false)}
          hexColor={pitchState.primaryColor}
          onClickHandler={onMultiSelectHandler}
          contentWhileEditing={selectedContent}
          onProcessEdit={onProcessEdit}
        />
      )}

      {actionPlaneModalOpen && (
        <ActionPlanEditor
          onClose={() => setActionPlanModalOpen(false)}
          hexColor={pitchState.primaryColor}
          onClickHandler={onMultiSelectHandler}
          contentWhileEditing={selectedContent}
          onActionEdit={onActionPlanEdit}
        />
      )}

      {eSignerModalOpen && (
        <EsignerModal
          onClose={() => setESignerModalOpen(false)}
          hexColor={pitchState.primaryColor}
          onClickHandler={onMultiSelectHandler}
          contentWhileEditing={selectedContent}
          onActionEdit={onEsignerEdit}
          onSignRevoke = {onSignRevoke}
        />
      )}

      {userMessageModal && (
        <UserMessage
          onClose={() => setUserMessageModal(false)}
          hexColor={pitchState.primaryColor}
          onClickHandler={onMultiSelectHandler}
          contentWhileEditing={selectedContent}
          onActionEdit={onUserMessageEdit}
        />
      )}

      {htmlBlockModalOpen && (
        <HTMLBlock
          onClose={() => setHtmlBlockModalOpen(false)}
          hexColor={pitchState.primaryColor}
          onClickHandler={onMultiSelectHandler}
          contentWhileEditing={selectedContent}
          onActionEdit={onHtmlBlockEdit}
        />
      )}

      {fileUploaderModalOpen && (
        <FileUploader
          isOpen={fileUploaderModalOpen}
          onClose={() => setFileUploaderModalOpen(false)}
          hexColor={pitchState.primaryColor}
          onClickHandler={onMultiSelectHandler}
          contentWhileEditing={selectedContent}
          onActionEdit={onFileUploaderEdit}
        />
      )}
      {contentModalLoading ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 ">
          <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <ContentModal
            content={selectedContent}
            isOpen={setContentModalOpen}
            closeModal={() => setContentModalOpen(false)}
            setSelectedContent={setSelectedContent}
            isPitch={true}
          />
        </>
      )}
      <div className="flex flex-col h-full">
        <div className="overflow-y-auto flex-grow">
          {/* Action Buttons */}
          <div className="flex gap-2 mb-2">
            <button
              className="btn-secondary px-4 py-1 rounded-md border-2"
              disabled={pitchState.isAddingSection}
              onClick={() => dispatch(setIsAddingSection(true))}
            >
              Add Section
            </button>

            <button
              className="btn-secondary px-4 py-1 rounded-md border-2"
              onClick={() => setPitchStreamsOpen(true)}
            >
              Add Stream
            </button>
          </div>

          {pitchState.sections.length === 0 && !pitchState.isAddingSection && (
            <EmptySection
              title="No Sections Added Yet"
              description="Get started by creating your first section to organize your pitch content"
              icon={
                <FontAwesomeIcon
                  icon={faFolderOpen}
                  className="text-2xl text-secondary"
                />
              }
            />
          )}

          {/* Sections List with Drag and Drop */}
          <DragDropContext
            onDragStart={handleDragStart}
            onDragUpdate={handleDragUpdate}
            onDragEnd={handleDragEnd}
          >
            <Droppable droppableId="sections" type="SECTION">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {pitchState.sections.map((section, index) => (
                    <Draggable
                      key={`section-${index}`}
                      draggableId={`section-${index}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={(el) => {
                            provided.innerRef(el);
                            sectionRefs.current[index] = el;
                          }}
                          {...provided.draggableProps}
                          className={`mb-2.5 ${
                            snapshot.isDragging ? "opacity-75" : ""
                          }`}
                        >
                          <div className="mb-1 bg-gray-50 rounded-lg flex flex-row justify-between items-center gap-2 flex-wrap md:flex-nowrap">
                            <div className="flex items-center gap-2 flex-grow min-w-0 ml-2">
                              <span
                                {...provided.dragHandleProps}
                                className="flex-shrink-0 cursor-grab"
                              >
                                <FontAwesomeIcon
                                  icon={faGripVertical}
                                  className="text-gray-400 h-5 w-5 mt-1"
                                />
                              </span>
                              <span className="flex-shrink-0 font-semibold whitespace-nowrap border-red-400">
                                {`Section ${index + 1} Title : `}
                              </span>
                              <input
                                type="text"
                                value={section.name}
                                onChange={(e) =>
                                  dispatch(
                                    updateSectionName({
                                      sectionIndex: index,
                                      newName: e.target.value,
                                    })
                                  )
                                }
                                className="py-0.5 px-1 flex-grow min-w-0 text-normal-500 truncate outline-none bg-neutral-100 border border-neutral-300 hover:border-cyan-600 hover:bg-neutral-100 transition-all rounded-md text-neutral-800 focus:border-cyan-600"
                              />
                            </div>
                            <div className="flex-shrink-0 flex gap-1 mr-2 relative">
                              {pitchState.contentGrouping &&
                                !isCreatingGroup && (
                                  <button
                                    onClick={() => startGrouping(index)}
                                    className="h-8 w-8 mx-1 text-white bg-cyan-600 rounded-lg transition-colors border border-white"
                                    title="Create Content Group"
                                  >
                                    <FontAwesomeIcon icon={faObjectGroup} />
                                  </button>
                                )}
                              {/* Add Dropdown Button */}
                              <div className="relative">
                                <button
                                  onClick={() => {
                                    if (
                                      pitchState.processOverVeiw ||
                                      pitchState.eSigner ||
                                      pitchState.actionPlan ||
                                      pitchState.userMessage
                                    ) {
                                      // If any are true, go here
                                      setAddMenuOpenSectionIndex(
                                        addMenuOpenSectionIndex === index
                                          ? null
                                          : index
                                      );
                                    } else {
                                      handleAddContentToExistingSection(index);
                                      setIsContentTableModalOpen(true);
                                      dispatch(setIsTaglineFormOpen(true));
                                      setAddMenuOpenSectionIndex(null);
                                    }
                                  }}
                                  className="h-8 w-8 mx-1 text-white bg-sky-800 rounded-lg transition-colors border border-white"
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                </button>
                                {addMenuOpenSectionIndex === index && (
                                  <div className=" add-menu-dropdown absolute right-0 mt-2 z-20 bg-white border border-gray-200 rounded shadow-lg min-w-[180px] p-1">
                                    <button
                                      className="flex flex-row items-center  text-sm font-semibold  text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                                      onClick={() => {
                                        handleAddContentToExistingSection(
                                          index
                                        );
                                        setIsContentTableModalOpen(true);
                                        dispatch(setIsTaglineFormOpen(true));
                                        setAddMenuOpenSectionIndex(null);
                                      }}
                                    >
                                      <FaRegFileImage className="mr-2" />
                                      Content
                                    </button>
                                    <button
                                      className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                                      onClick={() =>
                                        handleAddProcessOverview(index)
                                      }
                                    >
                                      <LuGoal className="mr-2" />
                                      Process Overview
                                    </button>

                                    {pitchState.actionPlan && (
                                      <button
                                        className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                                        onClick={() =>
                                          handleAddActionPlan(index)
                                        }
                                      >
                                        <PiLineSegmentsBold className="mr-2" />
                                        Action Plan
                                      </button>
                                    )}
                                    {/* {pitchState.eSigner && (
                                      <button
                                        className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                                        onClick={() => handleESignPlan(index)}
                                      >
                                        <FaFileSignature className="mr-2" />
                                        eSign
                                      </button>
                                    )} */}
                                    {pitchState.userMessage && (
                                      <button
                                        className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                                        onClick={() => handleUserMessage(index)}
                                      >
                                        <MdMessage className="mr-2" />
                                        UserMessage
                                      </button>
                                    )}
                                    {pitchState.htmlBlock && (
                                      <button
                                        className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                                        onClick={() => handleHtmlBlock(index)}
                                      >
                                        <FaCode className="mr-2" />
                                        HTML Block
                                      </button>
                                    )}
                                    {pitchState.fileUploader && (
                                      <button
                                        className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                                        onClick={() =>
                                          handleFileUploader(index)
                                        }
                                      >
                                        <FaUpload className="mr-2" />
                                        File Uploader
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              {/* End Add Dropdown Button */}
                              <button
                                onClick={() => {
                                  handleRemoveSection(index);
                                  dispatch(setIsTaglineFormOpen(false));
                                }}
                                className="h-8 w-8 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                              >
                                <FontAwesomeIcon icon={faXmark} />
                              </button>
                            </div>
                          </div>

                          {/* Section Contents */}
                          <Droppable
                            droppableId={`section-${index}`}
                            type="CONTENT"
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{
                                  minHeight: "60px",
                                  border:
                                    section.contents.length === 0
                                      ? "2px dashed #06b6d4"
                                      : undefined,
                                  background:
                                    section.contents.length === 0
                                      ? "#ecfeff"
                                      : undefined,
                                  margin:
                                    section.contents.length === 0
                                      ? "8px 0"
                                      : undefined,
                                }}
                              >
                                {pitchState.contentGrouping ? (
                                  // Render content with grouping feature
                                  <>
                                    {/* Render grouped contents */}
                                    {(() => {
                                      const { groups, ungrouped } =
                                        getContentsInArrangementOrder(index);
                                      let currentUngroupedIndex = 0;
                                      let renderedItems = [];

                                      // Process all groups and ungrouped contents in arrangement order
                                      groups.forEach((group) => {
                                        // Add any ungrouped contents that come before this group
                                        while (
                                          currentUngroupedIndex <
                                            ungrouped.length &&
                                          ungrouped[currentUngroupedIndex]
                                            .arrangement < group.arrangement
                                        ) {
                                          const content =
                                            ungrouped[currentUngroupedIndex];
                                          renderedItems.push(
                                            renderContentItem(
                                              content,
                                              index,
                                              content.arrangement - 1
                                            )
                                          );
                                          currentUngroupedIndex++;
                                        }

                                        // Render the group
                                        renderedItems.push(
                                          <div
                                            key={`group-${group.name}`}
                                            className="border-2 border-cyan-500 p-2 rounded-xl mb-2 bg-cyan-50"
                                          >
                                            <div className="flex justify-between items-center mb-2 bg-cyan-100 p-1 rounded">
                                              <div className="flex items-center">
                                                <FontAwesomeIcon
                                                  icon={faLayerGroup}
                                                  className="text-cyan-600 mr-2"
                                                />

                                                {editingGroupName ===
                                                group.name ? (
                                                  <input
                                                    type="text"
                                                    value={newGroupName}
                                                    onChange={(e) =>
                                                      setNewGroupName(
                                                        e.target.value
                                                      )
                                                    }
                                                    className="py-0.5 px-1 flex-grow min-w-0 text-normal-500 truncate outline-none bg-neutral-100 border border-neutral-300 hover:border-cyan-600 hover:bg-neutral-100 transition-all rounded-md text-sm text-neutral-800 focus:border-cyan-600"
                                                    autoFocus
                                                  />
                                                ) : (
                                                  <span className="font-medium text-cyan-800">
                                                    {group.name}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex flex-row gap-2 mr-1">
                                                {editingGroupName ===
                                                group.name ? (
                                                  <div>
                                                    <button
                                                      className="px-2 text-cyan-600 hover:text-cyan-700"
                                                      onClick={() => {
                                                        setEditingGroupName(
                                                          null
                                                        );
                                                        setNewGroupName(null);
                                                      }}
                                                    >
                                                      <FontAwesomeIcon
                                                        icon={faXmark}
                                                      />
                                                    </button>
                                                    <button
                                                      className="px-2 text-cyan-600 hover:text-cyan-700"
                                                      onClick={() =>
                                                        RenameGroup(
                                                          group.name,
                                                          newGroupName
                                                        )
                                                      }
                                                    >
                                                      <FontAwesomeIcon
                                                        className="text-lg"
                                                        icon={faCheck}
                                                      />
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <button
                                                    onClick={() => {
                                                      setEditingGroupName(
                                                        group.name
                                                      );
                                                    }}
                                                    className="px-2 text-cyan-600 hover:text-cyan-700"
                                                  >
                                                    <TbEdit />
                                                  </button>
                                                )}

                                                <button
                                                  onClick={() =>
                                                    removeGroup(group.name)
                                                  }
                                                  className="text-red-500 hover:text-red-600"
                                                >
                                                  <FontAwesomeIcon
                                                    icon={faXmark}
                                                  />
                                                </button>
                                              </div>
                                            </div>

                                            {/* Group contents */}
                                            {group.contents.map((content) =>
                                              renderContentItem(
                                                content,
                                                index,
                                                content.arrangement - 1
                                              )
                                            )}
                                          </div>
                                        );
                                      });

                                      // Add any remaining ungrouped contents
                                      while (
                                        currentUngroupedIndex < ungrouped.length
                                      ) {
                                        const content =
                                          ungrouped[currentUngroupedIndex];
                                        renderedItems.push(
                                          renderContentItem(
                                            content,
                                            index,
                                            content.arrangement - 1
                                          )
                                        );
                                        currentUngroupedIndex++;
                                      }

                                      // If there are no contents at all, show a drop zone
                                      if (
                                        groups.length === 0 &&
                                        ungrouped.length === 0
                                      ) {
                                        renderedItems.push(
                                          <div
                                            key="empty-drop-zone"
                                            style={{
                                              textAlign: "center",
                                              color: "#64748b",
                                              padding: "16px 0",
                                            }}
                                            className="flex items-center justify-center"
                                          >
                                            Drop contents here
                                          </div>
                                        );
                                      }

                                      return renderedItems;
                                    })()}
                                  </>
                                ) : (
                                  // Original content rendering without grouping
                                  <>
                                    {section.contents.length === 0 ? (
                                      <div
                                        className="flex items-center justify-center"
                                        style={{
                                          textAlign: "center",
                                          color: "#64748b",
                                          padding: "16px 0",
                                        }}
                                      >
                                        Drop contents here
                                      </div>
                                    ) : (
                                      section.contents.map(
                                        (content, contentIndex) =>
                                          renderContentItem(
                                            content,
                                            index,
                                            contentIndex
                                          )
                                      )
                                    )}
                                  </>
                                )}
                                {provided.placeholder}

                                {/* Group creation UI */}
                                {pitchState.contentGrouping &&
                                  isCreatingGroup &&
                                  groupingSectionIndex === index && (
                                    <div className="mt-2 mb-4 border-2 border-cyan-500 p-3 rounded-lg bg-cyan-50">
                                      {!showGroupNameInput ? (
                                        <>
                                          <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center">
                                              <FontAwesomeIcon
                                                icon={faObjectGroup}
                                                className="text-cyan-600 mr-2"
                                              />
                                              <span className="font-medium">
                                                Select up to 4 contents to group
                                              </span>
                                            </div>
                                            <div className="text-sm text-cyan-700">
                                              {selectedContentsForGroup.length}
                                              /4 selected
                                            </div>
                                          </div>
                                          <div className="flex justify-end gap-2 mt-3">
                                            <button
                                              onClick={cancelGrouping}
                                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={proceedToNaming}
                                              disabled={
                                                selectedContentsForGroup.length ===
                                                0
                                              }
                                              className={`px-3 py-1 rounded ${
                                                selectedContentsForGroup.length ===
                                                0
                                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                  : "bg-cyan-600 text-white hover:bg-cyan-700"
                                              }`}
                                            >
                                              Next
                                            </button>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="flex items-center mb-3">
                                            <FontAwesomeIcon
                                              icon={faLayerGroup}
                                              className="text-cyan-600 mr-2"
                                            />
                                            <span className="font-medium">
                                              Name your group
                                            </span>
                                          </div>
                                          <input
                                            type="text"
                                            value={groupName}
                                            onChange={(e) =>
                                              setGroupName(e.target.value)
                                            }
                                            placeholder="Enter group name"
                                            className="w-full p-2 border border-cyan-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            autoFocus
                                          />
                                          <div className="flex justify-end gap-2 mt-3">
                                            <button
                                              onClick={() =>
                                                setShowGroupNameInput(false)
                                              }
                                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                            >
                                              Back
                                            </button>
                                            <button
                                              onClick={cancelGrouping}
                                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={createGroup}
                                              disabled={!groupName.trim()}
                                              className={`px-3 py-1 rounded ${
                                                !groupName.trim()
                                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                  : "bg-cyan-600 text-white hover:bg-cyan-700"
                                              }`}
                                            >
                                              Create Group
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}

                                {/* Tagline form for EXISTING sections */}
                                {currentSectionIndex === index &&
                                  selectedContent.name && (
                                    <TaglineForm
                                      sectionIndex={index}
                                      contentIndex={-1}
                                      content={selectedContent}
                                      onSubmit={() =>
                                        handleAddContentToSection(
                                          selectedContent
                                        )
                                      }
                                      onCancel={() => {
                                        dispatch(setIsTaglineFormOpen(false));
                                        setSelectedContent({
                                          ...selectedContent,
                                          name: "",
                                        });
                                      }}
                                    />
                                  )}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* New Section Form */}
          {pitchState.isAddingSection && (
            <div
              ref={newSectionRef}
              className="mb-1.5 bg-gray-50 rounded-lg flex flex-row justify-between items-center gap-2 flex-wrap md:flex-nowrap "
            >
              <div className="flex items-center gap-2 flex-grow min-w-0 ml-2">
                <span className="flex-shrink-0 font-semibold whitespace-nowrap ">{`Section ${
                  pitchState.sections.length + 1
                } Title : `}</span>
                <input
                  type="text"
                  value={sectionData.name}
                  onChange={(e) =>
                    setSectionData({
                      ...sectionData,
                      name: e.target.value,
                    })
                  }
                  className={`${
                    error && "border-red-500"
                  } py-0.5 px-1 flex-grow min-w-0 text-normal-500 truncate outline-none bg-neutral-100 border border-neutral-300 hover:border-cyan-600 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-cyan-600`}
                  placeholder="Enter section name"
                  autoFocus
                />
              </div>

              <div className="flex-shrink-0 flex gap-1 mr-2">
                <div className="relative">
                  <button
                    ref={newSectionPlusButtonRef}
                    onClick={() => {
                      if (!pitchState.processOverVeiw) {
                        handleAddContentToExistingSection(-1);
                        setIsContentTableModalOpen(true);
                        dispatch(setIsTaglineFormOpen(true));
                        setAddMenuOpenSectionIndex(null);
                      } else {
                        setAddMenuOpenSectionIndex(
                          addMenuOpenSectionIndex === -1 ? null : -1
                        );
                      }
                    }}
                    className="h-8 w-8 mx-1 text-white bg-sky-800 rounded-lg transition-colors border border-white"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                  {addMenuOpenSectionIndex === -1 && (
                    <div
                      className="add-menu-dropdown z-50 bg-white border border-gray-200 rounded shadow-lg min-w-[180px] p-1 transition-all duration-200"
                      style={{
                        ...dropdownPosition,
                        maxHeight: "calc(100vh - 20px)",
                        overflowY: "auto",
                      }}
                    >
                      <button
                        className="flex flex-row items-center  text-sm font-semibold  text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                        onClick={() => {
                          handleAddContentToExistingSection(-1);
                          setIsContentTableModalOpen(true);
                          dispatch(setIsTaglineFormOpen(true));
                          setAddMenuOpenSectionIndex(null);
                        }}
                      >
                        <FaRegFileImage className="mr-2" />
                        Content
                      </button>
                      <button
                        className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                        onClick={() => handleAddProcessOverview(-1)}
                      >
                        <LuGoal className="mr-2" />
                        Process Overview
                      </button>
                      {pitchState.actionPlan && (
                        <button
                          className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                          onClick={() => handleAddActionPlan(-1)}
                        >
                          <PiLineSegmentsBold className="mr-2" />
                          Action Plan
                        </button>
                      )}
                      {/* {pitchState.eSigner && (
                        <button
                          className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                          onClick={() => handleESignPlan(-1)}
                        >
                          <FaFileSignature className="mr-2" />
                          eSign
                        </button>
                      )} */}
                      {pitchState.userMessage && (
                        <button
                          className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                          onClick={() => handleUserMessage(-1)}
                        >
                          <MdMessage className="mr-2" />
                          UserMessage
                        </button>
                      )}
                      {pitchState.htmlBlock && (
                        <button
                          className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                          onClick={() => handleHtmlBlock(-1)}
                        >
                          <FaCode className="mr-2" />
                          HTML Block
                        </button>
                      )}
                      {pitchState.fileUploader && (
                        <button
                          className="flex flex-row items-center text-sm font-semibold text-gray-600  w-full text-left px-4 py-2 my-0.5  hover:bg-gray-100 rounded-md"
                          onClick={() => handleFileUploader(-1)}
                        >
                          <FaUpload className="mr-2" />
                          File Uploader
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCancelAddSection}
                  className="h-8 w-8 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>
          )}

          {/* Tagline form for NEW sections */}
          {currentSectionIndex === -1 && selectedContent.name && (
            <TaglineForm
              sectionIndex={-1}
              content={selectedContent}
              onSubmit={() => handleAddContentToSection(selectedContent)}
              onCancel={() => {
                dispatch(setIsTaglineFormOpen(false));
                setSelectedContent({ ...selectedContent, name: "" });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SectionsAndContents;
