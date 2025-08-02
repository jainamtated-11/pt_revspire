import React, { useContext, useState, useEffect, useRef } from "react";
import AddDropdown from "../Operations/AddDropdown.jsx";
import RenameContent from "../Operations/RenameContent.jsx";
import MoveContent from "../Operations/MoveContent.jsx";
import CopyContent from "../Operations/CopyContent.jsx";
import DownloadContent from "../Operations/DownloadContent.jsx";
import DeleteContent from "../Operations/DeleteContent.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import FilterModal from "../../../../utility/FilterModal.jsx";
import { useSelector, useDispatch } from "react-redux";
import { fetchTagsAsync } from "../../../../features/tag/tagSlice.js";
import { UnSelectAllItems } from "../../../../features/content/contentSlice.js";
import canvaImage from "../../../../assets/canva.svg";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTag,
  faTags,
  faMagnifyingGlass,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { useCookies } from "react-cookie";
import { CgCloseO } from "react-icons/cg";
import { RxHamburgerMenu } from "react-icons/rx";
import { BiGridAlt } from "react-icons/bi";
import useCheckFrontendPermission from "../../../../Services/checkFrontendPermission.jsx";
import VersionButton from "../VersionButton.jsx";
import useCheckUserLicense from "../../../../Services/checkUserLicense.jsx";
import { useNavigate } from "react-router-dom";
import {
  SetFilterApplied,
  SetFilterLoading,
  SetFilterAppliedOn,
} from "../../../../features/filter/fliterSlice.js";
import SearchBar from "../../../../utility/SearchBar.jsx";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/gif",
  "image/tiff",
  "image/webp",
];

export const CRUD = () => {
  const [tils, setTils] = useState(true);
  const [showMoreDialog, setShowMoreDialog] = useState(false); //state for More ... dialog button

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const dialogRef = useRef(null); //for more dialog
  const moreButtonRef = useRef(null); //for more button ref
  const navigate = useNavigate();

  const checkFrontendPermission = useCheckFrontendPermission();
  const axiosInstance = useAxiosInstance();
  const {
    setRenameModalOpen,
    TableNameHandler,
    setAddTagToContent,
    viewer_id,
    baseURL,
  } = useContext(GlobalContext);

  const checkUserLicense = useCheckUserLicense();

  const [cookies] = useCookies(["canvaAccessToken", "userData"]);
  const organisation_id = cookies.userData?.organisation?.id;
  const dispatch = useDispatch();
  const [showCanvaButton, setShowCanvaButton] = useState(false);
  const [showCanvaDesignModel, setShowCanvaDesignModel] = useState(false);

  const selectedContents = useSelector(
    (state) => state.contents.selectedContents
  );
  const selectedFolders = useSelector(
    (state) => state.contents.selectedFolders
  );
  const selectedItems = useSelector((state) => state.contents.selectedItems);
  const filterApplied = useSelector((state) => state.filter.filterApplied);
  const filterAppliedOn = useSelector((state) => state.filter.filterAppliedOn);

  const modalRef = useRef(null);

  const showDownloadContent = !selectedItems.some(
    (item) => item.source === "Public URL"
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowCanvaDesignModel(false);
      }
    };

    if (showCanvaDesignModel) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCanvaDesignModel]);

  useEffect(() => {
    setShowCanvaButton(
      selectedItems.length === 1 &&
        ALLOWED_MIME_TYPES.includes(selectedItems[0].mimetype) &&
        selectedItems[0].canva_id === null
    );
  }, [selectedItems]);

  const handleTils = () => {
    setTils((prev) => {
      const newTils = !prev;
      localStorage.setItem("myTils", newTils);
      window.dispatchEvent(new Event("storageUpdated")); // Dispatch custom event
      return newTils;
    });
  };

  useEffect(() => {
    const fetchValue = () => {
      const storedTils = localStorage.getItem("myTils");
      setTils(storedTils === "true");
    };

    // Fetch the initial value when the component mounts
    fetchValue();

    // Listen for the custom 'storageUpdated' event
    window.addEventListener("storageUpdated", fetchValue);

    // Optionally, listen for the `storage` event for cross-tab/window updates
    window.addEventListener("storage", fetchValue);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("storageUpdated", fetchValue);
      window.removeEventListener("storage", fetchValue);
    };
  }, []);

  // Track screen size changes
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [screenWidth]);

  // Define breakpoints
  const isDeleteInDialog = selectedItems.length === 1 && screenWidth < 1050;
  const isDownloadInDialog = selectedItems.length === 1 && screenWidth < 926;
  const isPitchInDialog = selectedItems.length === 1 && screenWidth < 1385;
  const isTagInDialog = selectedItems.length === 1 && screenWidth < 821;
  const isMoveInDialog = selectedItems.length === 1 && screenWidth < 722;
  const isRenameInDialog = selectedItems.length === 1 && screenWidth < 649;
  const isShowVersionInDialog =
    selectedItems.length === 1 && screenWidth < 1316;
  const isCopyInDialog = selectedItems.length === 1 && screenWidth < 1182;
  const isAddTagInDialog = selectedItems.length === 1 && screenWidth < 1125;

  const removeDot =
    (isDeleteInDialog ||
      isDownloadInDialog ||
      isPitchInDialog ||
      isTagInDialog ||
      isRenameInDialog ||
      isAddTagInDialog ||
      isMoveInDialog ||
      isCopyInDialog ||
      isShowVersionInDialog) &&
    selectedItems.length > 0;

  if (removeDot == false) {
    if (showMoreDialog == true) {
      setShowMoreDialog(false);
    }
  }

  const handleToggleDialog = (event) => {
    event.stopPropagation();
    setShowMoreDialog(!showMoreDialog); // Toggle the dialog state
  };

  const handleCloseDialog = () => {
    setShowMoreDialog(false);
  };

  useEffect(() => {
    // Function to handle clicks outside of the dialog
    const handleClickOutside = (event) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target)
      ) {
        // when we are outside the dialog container and more button - only then close the dialog
        handleCloseDialog();
      }
    };
    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="pt-7">
      <div className="container flex justify-between mx-auto px-4  gap-4 w-full flex-nowrap">
        <div className="overflow-x-auto scroll-none rounded-md flex flex-row">
          <div className="flex justify-between rounded-md">
            <div className="flex space-x-1 transition-all bg-yellow-500 py-0.5">
              {checkFrontendPermission("Create Content") == "1" &&
                !(filterApplied && filterAppliedOn === "content") &&
                selectedItems.length === 0 && (
                  <div className="transition-all">
                    <AddDropdown />
                  </div>
                )}
            </div>

            <div
              className={`flex flex-row transition-all shadow-md ${
                selectedItems.length > 0
                  ? "bg-white dark:bg-gray-600 rounded-md pl-1 shadow-md w-[60vw] items-center"
                  : ""
              }`}
            >
              {(isDeleteInDialog ||
                isDownloadInDialog ||
                isPitchInDialog ||
                isTagInDialog ||
                isRenameInDialog ||
                isAddTagInDialog ||
                isMoveInDialog ||
                isCopyInDialog ||
                isShowVersionInDialog) &&
              selectedItems.length > 0 ? (
                <div className="relative flex justify-center items-center">
                  <button
                    ref={moreButtonRef}
                    className="flex h-[27px]  text-sky-800 justify-center items-center text-center text-[14px] px-3   rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                    onClick={handleToggleDialog}
                  >
                    <FontAwesomeIcon icon={faEllipsisH} className=" " />
                  </button>
                </div>
              ) : (
                ""
              )}

              {!isRenameInDialog &&
                checkFrontendPermission("Edit Content") == "1" &&
                selectedItems.length === 1 && (
                  <div className="transition-all">
                    <RenameContent
                      onClick={() => {
                        setRenameModalOpen(true);
                      }}
                    />
                  </div>
                )}

              {!isAddTagInDialog &&
                selectedContents.length > 0 &&
                selectedContents.length === selectedItems.length && (
                  <div className="flex">
                    {checkFrontendPermission(";Add Tag to Content") == "1" &&
                      selectedItems.length === 1 &&
                      (checkUserLicense("Revenue Enablement Elevate") == "1" ||
                        checkUserLicense("Revenue Enablement Spark") ==
                          "1") && (
                        <div>
                          <button
                            className="flex min-w-[90px] justify-center    items-center text-secondary text-[14px]  px-2 my-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                            onClick={() => {
                              setAddTagToContent(true);
                              dispatch(
                                fetchTagsAsync({
                                  viewer_id: viewer_id,
                                  baseURL: baseURL,
                                  organisation_id,
                                })
                              );
                            }}
                          >
                            <FontAwesomeIcon icon={faTags} className="mr-1" />
                            Add Tag
                          </button>
                        </div>
                      )}
                  </div>
                )}

              {selectedItems.length > 0 && (
                <>
                  <div className="">
                    {!isMoveInDialog &&
                      checkFrontendPermission("Edit Content") == "1" && (
                        <MoveContent
                          viewer_id={viewer_id}
                          selectedItems={selectedItems}
                        />
                      )}
                  </div>

                  {!isCopyInDialog &&
                    checkFrontendPermission("Create Content; Edit Content") ==
                      "1" &&
                    selectedContents.length > 0 &&
                    selectedContents.length === selectedItems.length && (
                      <>
                        <div className="">
                          <CopyContent selectedItems={selectedItems} />
                        </div>
                      </>
                    )}

                  {!isShowVersionInDialog &&
                    selectedItems.length === 1 &&
                    selectedItems[0].mimetype &&
                    (checkUserLicense("Revenue Enablement Elevate") == "1" ||
                      checkUserLicense("Revenue Enablement Spark") == "1") && (
                      <>
                        <VersionButton selectedItems={selectedItems} />
                      </>
                    )}

                  {!isTagInDialog &&
                    checkFrontendPermission("View Tag; View All Tag") == "1" &&
                    (checkUserLicense("Revenue Enablement Elevate") == "1" ||
                      checkUserLicense("Revenue Enablement Spark") == "1") && (
                      <div className=" ">
                        <button
                          className="flex min-w-[100px] justify-center items-center text-secondary text-[14px] py-1 px-2 my-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                          onClick={() => {
                            navigate(`/content/tag-manager`);
                            dispatch(SetFilterLoading(true));
                            dispatch(UnSelectAllItems());
                            dispatch(SetFilterApplied(true));
                            dispatch(SetFilterAppliedOn("tag"));
                            dispatch(UnSelectAllItems());
                            TableNameHandler("tag", "filter", "content");
                          }}
                        >
                          <FontAwesomeIcon icon={faTag} className="mr-2" />
                          Show Tag
                        </button>
                      </div>
                    )}

                  {!isPitchInDialog &&
                    checkFrontendPermission("View Pitch; View all Pitch") ==
                      "1" &&
                    (checkUserLicense("Revenue Enablement Elevate") == "1" ||
                      checkUserLicense("Revenue Enablement Spark") == "1") && (
                      <div>
                        <button
                          className="flex min-w-[110px] justify-center items-center text-secondary text-[14px] py-1 px-2 my-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                          onClick={() => {
                            navigate(`/content/pitch-manager`);
                            dispatch(SetFilterLoading(true));
                            dispatch(UnSelectAllItems());
                            dispatch(SetFilterApplied(true));
                            dispatch(SetFilterAppliedOn("tag"));
                            dispatch(UnSelectAllItems());
                            TableNameHandler("pitch", "filter", "content");
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="mr-2"
                          />
                          Show Pitch
                        </button>
                      </div>
                    )}

                  {checkFrontendPermission("Add Content to Tag") == "1" &&
                    selectedItems.length === 1 && (
                      <div className="transition-all">
                        <button
                          className=" text-secondary text-[14px] my-0.5 px-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
                          onClick={() => {
                            setAddTagToContent(true);
                            dispatch(
                              fetchTagsAsync({
                                viewer_id: viewer_id,
                                baseURL: baseURL,
                                organisation_id,
                              })
                            );
                          }}
                        >
                          <FontAwesomeIcon icon={faTags} className="mr-2" />
                          Add Tag
                        </button>
                      </div>
                    )}

                  <div className="transition-all">
                    {!isDeleteInDialog &&
                      checkFrontendPermission("Delete Content") == "1" && (
                        <DeleteContent inDialog={false} />
                      )}
                  </div>

                  {!isDownloadInDialog &&
                    checkFrontendPermission("Download Content") == "1" &&
                    showDownloadContent && (
                      <div className="transition-all">
                        <DownloadContent inDialog={false} />
                      </div>
                    )}

                  {/* More Dialog */}
                  {selectedItems.length > 0 && showMoreDialog ? (
                    <div
                      ref={dialogRef}
                      className="absolute  top-[120px] left-[45px] mt-2 z-[999]  bg-slate-50 dark:bg-gray-800 p-2 rounded-lg shadow-lg flex justify-start items-start flex-col space-y-1"
                    >
                      {/* Buttons inside the dialog */}
                      <div className="flex min-w-0 min-h-0 flex-col gap-[1px] items-center ">
                        {isTagInDialog &&
                          checkFrontendPermission("View Tag; View All Tag") ==
                            "1" &&
                          (checkUserLicense("Revenue Enablement Elevate") ==
                            "1" ||
                            checkUserLicense("Revenue Enablement Spark") ==
                              "1") && (
                            <div className=" flex justify-start items-start">
                              <button
                                className="flex items-center text-secondary text-[14px] py-1 px-2 my-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                                onClick={() => {
                                  dispatch(SetFilterLoading(true));
                                  dispatch(UnSelectAllItems());
                                  dispatch(SetFilterApplied(true));
                                  dispatch(SetFilterAppliedOn("tag"));
                                  TableNameHandler("tag", "filter", "content");

                                  setShowMoreDialog(false);
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faTag}
                                  className="mr-2"
                                />
                                Show Tag
                              </button>
                            </div>
                          )}

                        {isPitchInDialog &&
                          checkFrontendPermission(
                            "View Pitch; View all Pitch"
                          ) == "1" &&
                          (checkUserLicense("Revenue Enablement Elevate") ==
                            "1" ||
                            checkUserLicense("Revenue Enablement Spark") ==
                              "1") && (
                            <div className="flex items-start justify-start">
                              <button
                                className="flex items-center text-secondary text-[14px] py-1 px-2 my-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                                onClick={() => {
                                  navigate(`/content/pitch-manager`);
                                  dispatch(SetFilterLoading(true));
                                  dispatch(UnSelectAllItems());
                                  dispatch(SetFilterApplied(true));
                                  dispatch(SetFilterAppliedOn("pitch"));
                                  dispatch(UnSelectAllItems());
                                  TableNameHandler(
                                    "pitch",
                                    "filter",
                                    "content"
                                  );
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faMagnifyingGlass}
                                  className="mr-2"
                                />
                                Show Pitch
                              </button>
                            </div>
                          )}

                        {isDeleteInDialog &&
                          checkFrontendPermission("Delete Content") == "1" && (
                            <div className="">
                              <DeleteContent
                                inDialog={true}
                                className="border border-red-600"
                              />
                            </div>
                          )}

                        {isDownloadInDialog &&
                          checkFrontendPermission("Download Content") == "1" &&
                          showDownloadContent && (
                            <div className="">
                              <DownloadContent inDialog={true} />
                            </div>
                          )}

                        <div className="">
                          {isMoveInDialog &&
                            checkFrontendPermission("Edit Content") == "1" && (
                              <MoveContent viewer_id={viewer_id} />
                            )}
                        </div>

                        {isRenameInDialog &&
                          checkFrontendPermission("Edit Content") == "1" &&
                          selectedItems.length === 1 && (
                            <div className="transition-all">
                              <RenameContent
                                onClick={() => {
                                  setRenameModalOpen(true);
                                }}
                              />
                            </div>
                          )}

                        {isShowVersionInDialog &&
                          selectedItems.length === 1 &&
                          selectedItems[0].mimetype &&
                          (checkUserLicense("Revenue Enablement Elevate") ==
                            "1" ||
                            checkUserLicense("Revenue Enablement Spark") ==
                              "1") && (
                            <>
                              <VersionButton />
                            </>
                          )}

                        {isCopyInDialog &&
                          checkFrontendPermission(
                            "Create Content; Edit Content"
                          ) == "1" &&
                          selectedContents.length > 0 &&
                          selectedContents.length === selectedItems.length && (
                            <>
                              <div className="">
                                <CopyContent />
                              </div>
                            </>
                          )}

                        {isAddTagInDialog &&
                          selectedContents.length > 0 &&
                          selectedContents.length === selectedItems.length && (
                            <div className="flex">
                              {checkFrontendPermission(";Add Tag to Content") ==
                                "1" &&
                                selectedItems.length === 1 &&
                                (checkUserLicense(
                                  "Revenue Enablement Elevate"
                                ) == "1" ||
                                  checkUserLicense(
                                    "Revenue Enablement Spark"
                                  ) == "1") && (
                                  <div>
                                    <button
                                      className="flex min-w-[90px] justify-center    items-center text-secondary text-[14px] py-1 px-2 my-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
                                      onClick={() => {
                                        setAddTagToContent(true);
                                        dispatch(
                                          fetchTagsAsync({
                                            viewer_id: viewer_id,
                                            baseURL: baseURL,
                                            organisation_id,
                                          })
                                        );
                                      }}
                                    >
                                      <FontAwesomeIcon
                                        icon={faTags}
                                        className="mr-1"
                                      />
                                      Add Tag
                                    </button>
                                  </div>
                                )}
                            </div>
                          )}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-row items-center flex-nowrap h-10">
          <div className="flex justify-center gap-4 items-center">
            <SearchBar applySearch={"contents"} />
            <button
              onClick={handleTils}
              className="flex justify-center items-center border h-[35px] w-[60px] rounded  border-[#cfcece]"
            >
              {tils ? (
                <RxHamburgerMenu className="h-6 w-6 " />
              ) : (
                <BiGridAlt className="h-6 w-6 " />
              )}
            </button>
            <FilterModal queryTable="content" />
          </div>
        </div>
      </div>
      <div>
        {showCanvaDesignModel && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50  justify-center items-center ">
            <div
              ref={modalRef}
              className="max-w-[400px] w-full p-5 h-[300px] bg-neutral-200 border rounded-lg border-neutral-100 "
            >
              <button
                className="text-2xl transition-all mr-6 text-neutral-700 active:scale-75"
                onClick={() => setShowCanvaDesignModel(false)}
              >
                {" "}
                <CgCloseO />{" "}
              </button>
              <button className="px-2 py-1 bg-blue-500 rounded-md text-white border border-blue-400">
                Edit with Canva
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
