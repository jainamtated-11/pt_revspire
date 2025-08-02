import React, { useContext, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faXmark,
  faCheck,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons";
import { TbEdit } from "react-icons/tb";
import { MdRemoveCircleOutline } from "react-icons/md";
import GlobalButton from "../ContentManager/ContentTable/GlobalButton";
import ContentTableModal from "./ContentTableModal";
import EmptySection from "../PitchManager/EmptySection";
import ContentModal from "../ContentManager/ContentTable/ContentModal";
import LoadingSpinner from "../../../utility/LoadingSpinner";
import { useDispatch, useSelector } from "react-redux";
import { GlobalContext } from "../../../context/GlobalState";
import useAxiosInstance from "../../../Services/useAxiosInstance";
import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";
import toast from "react-hot-toast";
import {
  setPitchStreamData,
  setLayouts,
  setSelectedContent,
  setModalState,
  setIsModalOpen,
  setContentModalLoading,
  resetPitchStreamState,
  reorderSections,
  reorderContentsWithinSection,
  moveContentBetweenSections,
  updateContentTagline,
  updateSectionName,
  addContentToSection,
  removeContentFromSection,
  addNewSection,
  removeSection,
  fetchPitchLayouts,
  createPitchStream,
  addMultipleContentsToSection,
} from "../../../features/pitchStreams/addPitchStreamSlice";

export default function AddPitchStreamPopUp() {
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();
  const containerRef = useRef(null);

  const {
    viewer_id,
    baseURL,
    setContentModalOpen,
    setViewContent,
    globalOrgId,
  } = useContext(GlobalContext);

  const {
    pitchStreamData,
    layouts,
    sections = [],
    selectedContent,
    modalState,
    isModalOpen,
    contentModalLoading,
  } = useSelector((state) => state.addpitchStreamSlice);

  const [autoScroll, setAutoScroll] = React.useState({
    active: false,
    speed: 0,
    direction: 0,
  });
  const [editingContent, setEditingContent] = React.useState({
    sectionIndex: null,
    contentIndex: null,
    content: null,
  });
  const [newSectionName, setNewSectionName] = React.useState("");

  // Auto-scroll effect during drag operations
  useEffect(() => {
    if (!autoScroll.active || !containerRef.current) return;

    const scrollContainer = containerRef.current;
    const scrollInterval = setInterval(() => {
      scrollContainer.scrollTop += autoScroll.speed * autoScroll.direction;
    }, 10);

    return () => clearInterval(scrollInterval);
  }, [autoScroll]);

  const addPitchStreamButtonHandler = () => {
    dispatch(fetchPitchLayouts({ axiosInstance, viewer_id }));
    dispatch(setIsModalOpen(true));
  };

  const AddPitchStreamHandler = async () => {
    if (!pitchStreamData.name.trim()) {
      toast.error("Pitch Stream name is required");
      return;
    }

    if (!layouts.selectedLayoutId) {
      toast.error("Please select a layout");
      return;
    }

    const invalidSections = sections.filter((section) => !section.name.trim());
    if (invalidSections.length > 0) {
      toast.error("All sections must have a name");
      return;
    }

    const data = {
      name: pitchStreamData.name.trim(),
      created_by: viewer_id,
      title: pitchStreamData.name.trim(),
      headline: pitchStreamData.name.trim(),
      description: pitchStreamData.name.trim(),
      pitch_layout: layouts.selectedLayoutId,
      sections: (sections || []).map((section, index) => ({
        ...section,
        order: index + 1,
        contents: (section.contents || []).map((content, contentIndex) => ({
          ...content,
          arrangement: contentIndex + 1,
        })),
      })),
      pitch_stream: 1,
    };

    dispatch(
      createPitchStream({
        axiosInstance,
        data,
        viewer_id,
        baseURL,
        globalOrgId,
      })
    ).then(() => {
      dispatch(resetPitchStreamState());
    });
  };

  // Content selection handler
  const contentSelectHandler = (content) => {
    const isValidId = content?.id !== "-1";
    dispatch(
      setSelectedContent({
        content: isValidId ? content?.id || content.contentId : "",
        name: isValidId ? content?.name || content.contentName : "",
        tagline: "",
        mimetype: isValidId ? content?.mimetype || "" : "",
        source: isValidId ? content?.source || "" : "",
        content_link: isValidId ? content?.content || "" : "",
      })
    );

    if (isValidId) {
      dispatch(
        setModalState({
          isOpen: true,
          type: "content",
          sectionIndex: modalState.sectionIndex,
        })
      );
    }
  };

  // Content editing handlers
  const handleEditContent = (sectionIndex, contentIndex, content) => {
    setEditingContent({
      sectionIndex,
      contentIndex,
      content: { ...content },
    });
  };

  const handleSaveEditedContent = () => {
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
  };

  // Drag and drop handlers
  const handleDragStart = () => {
    setAutoScroll({ active: false, speed: 0, direction: 0 });
  };

  const onMultiSelectHandler = (contents) => {
    const transformedContents = contents.map((content) => ({
      content: content?.id || content?.contentId,
      name: content?.name || content?.contentName,
      tagline: content.tagline,
      mimetype: content?.mimetype || "",
      source: content?.source || "",
      content_link: content?.content || "",
    }));
    console.log(
      "TRANSFOREMD DFCONTEN ",
      modalState.sectionIndex,
      transformedContents
    );
    dispatch(
      addMultipleContentsToSection({
        sectionIndex: modalState.sectionIndex,
        contents: transformedContents,
      })
    );
    dispatch(
      setModalState({
        isOpen: false,
      })
    );
  };

  const onCancelContentTableModal = () => {
    dispatch(
      setModalState({
        isOpen: true,
        type: null,
        sectionIndex: null,
      })
    );
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
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === "SECTION") {
      dispatch(
        reorderSections({
          sourceIndex: source.index,
          destinationIndex: destination.index,
        })
      );
    } else {
      if (source.droppableId === destination.droppableId) {
        const sectionIndex = parseInt(
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
        const sourceSectionIndex = parseInt(
          source.droppableId.replace("section-", "")
        );
        const destinationSectionIndex = parseInt(
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
  };

  // Content click handler
  const handleContentClick = async (item) => {
    dispatch(setSelectedContent(item));
    try {
      dispatch(setContentModalLoading(true));

      if (
        item?.mimetype?.includes("video/") ||
        item?.mimetype?.includes("application/vnd") ||
        item?.mimetype?.includes("application/msword")
      ) {
        const res = await axiosInstance.post(
          `/open-content`,
          {
            contentId: item.content,
            viewerId: viewer_id,
          },
          { withCredentials: true }
        );
        setViewContent(res.data.sasUrl);
      } else if (item?.mimetype?.includes("application/url")) {
        setViewContent(item.content);
      } else {
        const res = await axiosInstance.post(
          `/open-content`,
          { contentId: item.content, viewerId: viewer_id },
          { responseType: "blob", withCredentials: true }
        );
        const contentBlob = new Blob([res.data], {
          type: item.mimetype || "application/pdf",
        });
        const url = URL.createObjectURL(contentBlob);
        setViewContent(url);
      }

      setContentModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setContentModalLoading(false));
    }
  };

  // Tagline Form Component
  const TaglineForm = ({
    contentIndex,
    content,
    onSubmit,
    onCancel,
    isEditing,
  }) => (
    <div className="border-2 flex flex-col p-1 rounded-xl mt-2">
      <div className="flex items-center gap-2 flex-grow min-w-0 ml-2 mr-20">
        <span className="flex-shrink-0 mr-2 border-neutral-400 border size-[20px] flex justify-center items-center text-xs rounded-full bg-neutral-50 text-neutral-700 font-bold">
          {contentIndex + 1}
        </span>
        <label className="flex-shrink-0 font-semibold whitespace-nowrap">
          Name:
        </label>
        <div className="ml-2 py-0.5 px-1 flex-grow min-w-0 text-normal-500 truncate outline-none bg-neutral-100 border border-neutral-300 rounded-md text-neutral-800">
          {content.name}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-grow min-w-0 ml-[2.75rem] mt-1">
        <label className="flex-shrink-0 font-semibold whitespace-nowrap">
          Tagline:
        </label>
        <input
          value={content.tagline}
          onChange={(e) =>
            isEditing
              ? setEditingContent((prev) => ({
                  ...prev,
                  content: { ...prev.content, tagline: e.target.value },
                }))
              : dispatch(setSelectedContent({ tagline: e.target.value }))
          }
          type="text"
          className="py-0.5 px-1 flex-grow min-w-0 text-normal-500 truncate outline-none bg-neutral-100 border border-neutral-300 hover:border-cyan-600 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-cyan-600"
          placeholder="Enter tagline..."
          autoFocus
        />
        <div className="flex ml-1 gap-1">
          <button
            onClick={onSubmit}
            className="text-sky-700 bg-transparent rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <FontAwesomeIcon className="text-xl" icon={faCheck} />
          </button>
          <button
            onClick={onCancel}
            className="text-red-500 mx-0 bg-transparent hover:bg-red-500 hover:text-white rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <FontAwesomeIcon className="text-xl" icon={faXmark} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
        <div className="relative bg-white rounded-lg shadow w-[90%] md:w-[70%] lg:w-[50%] max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-3 md:px-6 py-4 shadow-md z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Create Pitch Stream
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                onClick={() => dispatch(resetPitchStreamState())}
              >
                <FontAwesomeIcon
                  className="text-gray-500 text-2xl"
                  icon={faXmark}
                />
              </button>
            </div>
          </div>

          {contentModalLoading && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="absolute bg-gray-800 opacity-50 inset-0"></div>
              <LoadingSpinner />
            </div>
          )}

          <ContentModal
            content={selectedContent}
            isOpen={setContentModalOpen}
            setSelectedContent={(content) =>
              dispatch(setSelectedContent(content))
            }
            isPitch={true}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-2 md:p-4" ref={containerRef}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pitch Name */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-900 mb-1">
                      Pitch Name
                    </label>
                    <input
                      value={pitchStreamData.name}
                      onChange={(e) =>
                        dispatch(setPitchStreamData({ name: e.target.value }))
                      }
                      type="text"
                      className="border text-gray-900 text-sm rounded-lg p-2 bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter pitch name..."
                    />
                  </div>

                  {/* Layout Selection */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-900 mb-1">
                      Pitch Layout
                    </label>
                    {layouts.loading ? (
                      <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2">
                        <option>Loading layouts...</option>
                      </select>
                    ) : (
                      <select
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                        value={layouts.selectedLayoutName}
                        onChange={(e) => {
                          const selected = layouts.data.find(
                            (l) => l.name === e.target.value
                          );
                          dispatch(
                            setLayouts({
                              selectedLayoutId: selected?.id || "",
                              selectedLayoutName: e.target.value,
                            })
                          );
                        }}
                      >
                        <option value="" disabled>
                          Select layout
                        </option>
                        {layouts.data.map((layout) => (
                          <option key={layout.id} value={layout.name}>
                            {layout.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Sections */}
                <div>
                  <button
                    className="btn-secondary px-4 py-1.5 rounded-md border-2 mb-2"
                    onClick={() => {
                      dispatch(
                        setModalState({
                          isOpen: true,
                          type: "section",
                          sectionIndex: sections.length,
                        })
                      );
                    }}
                  >
                    Add Section
                  </button>

                  <div className="border-2 rounded-lg p-3 h-[calc(100vh-400px)] overflow-y-auto">
                    {sections.length === 0 && !modalState.isOpen && (
                      <EmptySection
                        title="No Pitch Streams Added Yet"
                        description="Create content streams for your ICP and get started"
                        icon={
                          <FontAwesomeIcon
                            icon={faFolderOpen}
                            className="text-2xl text-secondary"
                          />
                        }
                      />
                    )}

                    <DragDropContext
                      onDragStart={handleDragStart}
                      onDragUpdate={handleDragUpdate}
                      onDragEnd={handleDragEnd}
                    >
                      <Droppable droppableId="sections" type="SECTION">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {sections.map((section, index) => (
                              <Draggable
                                key={`section-${index}`}
                                draggableId={`section-${index}`}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`mb-3 ${
                                      snapshot.isDragging ? "opacity-75" : ""
                                    }`}
                                  >
                                    <div className=" mb-2 bg-gray-50 rounded-lg flex flex-row justify-between items-center gap-2 flex-wrap md:flex-nowrap">
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
                                        <span className="flex-shrink-0 font-semibold whitespace-nowrap">
                                          Section {index + 1} Title:
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
                                          className="py-1 px-2 flex-grow min-w-0 text-normal-500 truncate outline-none bg-neutral-100 border border-neutral-300 hover:border-cyan-600 hover:bg-neutral-100 transition-all rounded-md text-neutral-800 focus:border-cyan-600"
                                        />
                                      </div>
                                      <div className="flex-shrink-0 flex gap-1 mr-2">
                                        <button
                                          onClick={() => {
                                            dispatch(
                                              setModalState({
                                                isOpen: true,
                                                type: "content",
                                                sectionIndex: index,
                                              })
                                            );
                                            dispatch(
                                              setSelectedContent({
                                                content: "",
                                                name: "",
                                                tagline: "",
                                              })
                                            );
                                          }}
                                          className="h-8 w-8 mx-1 text-white bg-sky-800 rounded-lg transition-colors border border-white"
                                        >
                                          <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            dispatch(removeSection(index))
                                          }
                                          className="h-8 w-8 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                                        >
                                          <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                      </div>
                                    </div>

                                    <Droppable
                                      droppableId={`section-${index}`}
                                      type="CONTENT"
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.droppableProps}
                                        >
                                          {section.contents.map(
                                            (content, contentIndex) => (
                                              <Draggable
                                                key={`content-${content.content}`}
                                                draggableId={`content-${content.content}`}
                                                index={contentIndex}
                                              >
                                                {(provided, snapshot) => (
                                                  <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`border-2 flex flex-col p-0.5 rounded-xl bg-neutral-100 hover:bg-neutral-100 transition-all mb-1 ${
                                                      snapshot.isDragging
                                                        ? "opacity-75 z-10"
                                                        : ""
                                                    }`}
                                                  >
                                                    <div className="flex items-center gap-2 flex-grow min-w-0 ml-2 mr-2">
                                                      <span className="flex-shrink-0 mr-2 border-neutral-400 border size-[20px] flex justify-center items-center text-xs rounded-full bg-neutral-50 text-neutral-700 font-bold">
                                                        {contentIndex + 1}
                                                      </span>
                                                      <div
                                                        className="cursor-pointer ml-2 py-0.5 px-1 flex-grow min-w-0 text-normal-500 truncate outline-none text-sm text-neutral-800"
                                                        onClick={() =>
                                                          handleContentClick(
                                                            content
                                                          )
                                                        }
                                                      >
                                                        {content.tagline ||
                                                          content.name}
                                                      </div>
                                                      <button
                                                        onClick={() =>
                                                          handleEditContent(
                                                            index,
                                                            contentIndex,
                                                            content
                                                          )
                                                        }
                                                        className="px-2 text-cyan-600 hover:text-cyan-700"
                                                      >
                                                        <TbEdit />
                                                      </button>
                                                      <button
                                                        onClick={() =>
                                                          dispatch(
                                                            removeContentFromSection(
                                                              {
                                                                sectionIndex:
                                                                  index,
                                                                contentIndex,
                                                              }
                                                            )
                                                          )
                                                        }
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

                                                    {editingContent.sectionIndex ===
                                                      index &&
                                                      editingContent.contentIndex ===
                                                        contentIndex && (
                                                        <TaglineForm
                                                          contentIndex={
                                                            contentIndex
                                                          }
                                                          content={
                                                            editingContent.content
                                                          }
                                                          onSubmit={
                                                            handleSaveEditedContent
                                                          }
                                                          onCancel={() =>
                                                            setEditingContent({
                                                              sectionIndex:
                                                                null,
                                                              contentIndex:
                                                                null,
                                                              content: null,
                                                            })
                                                          }
                                                          isEditing={true}
                                                        />
                                                      )}
                                                  </div>
                                                )}
                                              </Draggable>
                                            )
                                          )}
                                          {provided.placeholder}

                                          {modalState.isOpen &&
                                            modalState.type === "content" &&
                                            modalState.sectionIndex ===
                                              index && (
                                              <>
                                                {selectedContent.name ? (
                                                  <TaglineForm
                                                    contentIndex={
                                                      section.contents.length
                                                    }
                                                    content={selectedContent}
                                                    onSubmit={() => {
                                                      dispatch(
                                                        addContentToSection({
                                                          sectionIndex: index,
                                                          content:
                                                            selectedContent,
                                                        })
                                                      );
                                                      dispatch(
                                                        setModalState({
                                                          isOpen: false,
                                                        })
                                                      );
                                                      dispatch(
                                                        setSelectedContent({
                                                          content: "",
                                                          name: "",
                                                          tagline: "",
                                                        })
                                                      );
                                                    }}
                                                    onCancel={() => {
                                                      dispatch(
                                                        setModalState({
                                                          isOpen: false,
                                                        })
                                                      );
                                                      dispatch(
                                                        setSelectedContent({
                                                          content: "",
                                                          name: "",
                                                          tagline: "",
                                                        })
                                                      );
                                                    }}
                                                  />
                                                ) : (
                                                  <ContentTableModal
                                                    onClickHandler={
                                                      contentSelectHandler
                                                    }
                                                    onMultiSelectHandler={
                                                      onMultiSelectHandler
                                                    }
                                                    onCancel={
                                                      onCancelContentTableModal
                                                    }
                                                    queryTable="pitchStream"
                                                  />
                                                )}
                                              </>
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
                    {modalState.isOpen && modalState.type === "section" && (
                      <div className="mb-1.5 bg-gray-50 rounded-lg flex flex-row justify-between items-center gap-2 flex-wrap md:flex-nowrap">
                        <div className="flex items-center gap-2 flex-grow min-w-0 ml-2">
                          <span className="flex-shrink-0 font-semibold whitespace-nowrap">
                            Section {sections.length + 1} Title:
                          </span>
                          <input
                            type="text"
                            value={newSectionName || ""}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            className="py-1 px-2 flex-grow min-w-0 text-normal-500 truncate outline-none bg-neutral-100 border border-neutral-300 hover:border-cyan-600 hover:bg-neutral-100 transition-all rounded-md placeholder:text-neutral-400 text-neutral-800 focus:border-cyan-600"
                            placeholder="Enter section name"
                            autoFocus
                          />
                        </div>
                        <div className="flex-shrink-0 flex gap-1 mr-2">
                          <button
                            onClick={() => {
                              if (newSectionName?.trim()) {
                                dispatch(
                                  addNewSection({
                                    section: {
                                      name: newSectionName,
                                      contents: [],
                                    },
                                  })
                                );
                                setNewSectionName("");
                                dispatch(
                                  setModalState({
                                    isOpen: true,
                                    type: "content",
                                    sectionIndex: sections.length,
                                  })
                                );
                              }
                            }}
                            className="h-8 w-8 mx-1 text-white bg-sky-800 rounded-lg transition-colors border border-white"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                          <button
                            onClick={() => {
                              setNewSectionName("");
                              dispatch(setModalState({ isOpen: false }));
                            }}
                            className="h-8 w-8 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t px-3 md:px-6 py-4 bg-white">
            <div className="flex justify-end space-x-4">
              <button
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={() => dispatch(resetPitchStreamState())}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                onClick={AddPitchStreamHandler}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (layouts.loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="absolute">
      {isModalOpen && renderContent()}
      <GlobalButton addPitch={addPitchStreamButtonHandler} />
    </div>
  );
}
