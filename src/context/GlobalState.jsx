import React, { useState, useEffect, createContext, useCallback } from "react";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "react-query";
import { useCookies } from "react-cookie";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  SetFilterData,
  SetFilterApplied,
  SetFilterConditions,
  SetFilterLogic,
  SetFilterAppliedOn,
  SetFilterLoading,
} from "../features/filter/fliterSlice";

const useIsLoggedIn = () => {
  const [cookies] = useCookies(["userData"]);
  return !!cookies.userData;
};

export const GlobalContext = createContext();

export const GlobalState = ({ children }) => {
  const [cookies] = useCookies(["userData"]);
  //license check

  const isLoggedIn = useIsLoggedIn();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialChecksDone, setIsInitialChecksDone] = useState(false);

  const [connections, setConnections] = useState([]);

  const baseURL = `https://${cookies.userData?.organisation?.tenant_api_name}.${cookies.userData?.organisation?.domain}`;

  const userPermission = cookies?.revspirePermissions;
  const userLicense = cookies?.revspireLicense;
  const collaboration = cookies?.userData?.user?.content_collaboration_mode;

  const [contentCollabration, setContentCollabration] = useState(
    collaboration == "1" ? true : false
  );

  const frontendBaseURL = `https://${cookies.userData?.organisation?.tenant_name}.${cookies.userData?.organisation?.domain}`;

  const viewer_id = cookies.userData?.user?.id;
  const globalOrgId = cookies.userData?.user?.organisation;

  const [disableDefaultNavigation, setDisableDefaultNavigation] =
    useState(false);

  const onedriveTenantRestrict =
    cookies.userData?.organisation?.onedrive_tenant_restrict;

  const user_name = cookies.userData?.user?.username;
  const name =
    cookies.userData?.user?.first_name +
    " " +
    cookies.userData?.user?.last_name;

  const [userData, setUserData] = useState(null);
  const [rawCookie, setRawCookie] = useState(undefined);
  const [directContent, setDirectContent] = useState({});

  useEffect(() => {
    if (cookies.userData) {
      setRawCookie(cookies.userData);
    }
  }, [cookies.userData]);

  const isLoginPage = () => {
    const path = window.location.pathname;
    return (
      path === "/login" || path.includes("/dsr") || path.includes("/pitchlogin")
    );
  };

  const [filterField, setFilterField] = useState("");
  const [conditionType, setConditionType] = useState("");
  const [conditionValueType, setConditionValueType] = useState("");

  const [showButtonLoading, setShowButtonLoading] = useState(false);
  const [showConnectionButtons, setShowConnectionButtons] = useState(true);
  const [directContentUpload, setDirectContentUpload] = useState(false);

  const selectedPitches = useSelector((state) => state.pitches.selectedPitches);
  const selectedTags = useSelector((state) => state.tags.selectedTags);
  const selectedContents = useSelector(
    (state) => state.contents.selectedContents
  );

  const queryClient = new QueryClient();

  const [folder_id, setFolder_id] = useState("");
  const [contentSelected, setContentSelected] = useState(0);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [isMoveButtonClicked, setIsMoveButtonClicked] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [contents, setContents] = useState([]);

  const [contentModalOpen, setContentModalOpen] = useState(false);

  const [driveSelection, setDriveSelection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contentModalLoading, setContentModalLoading] = useState(false);
  const [recycleBin, setRecycleBin] = useState({ contents: [], folders: [] });
  const [sortValueType, setSortValueType] = useState("");
  const [sortProperty, setSortProperty] = useState("");

  const [viewContent, setViewContent] = useState(null);
  const [isCopyButtonClicked, setIsCopyButtonClicked] = useState(false);

  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "", name: "Home" }]);
  const [dialogBreadcrumbs, setDialogBreadcrumbs] = useState([
    { id: "", name: "Home" },
  ]);

  const [dashboardState, setDashboardState] = useState("home");

  const path = window.location.pathname;

  useEffect(() => {
    if (path.startsWith("/user")) {
      setDashboardState("setup");
    } else {
      setDashboardState("home");
    }
  }, [path]);

  const [tagContent, setTagContent] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
  const [hideFilter, setHideFilter] = useState(true);
  const [helpHideFilter, setHelpHideFilter] = useState(true);

  const [selectedCanvaItemId, setSelectedCanvaItemId] = useState(null);

  const [integrationsConnection, setIntegrationsConnection] = useState({
    canva: false,
    adobe: false,
  });

  const [isSvg, setIsSvg] = useState(false);

  const [addNewTag, setAddNewTag] = useState({
    name: "",
    description: "",
    addTagPopUp1: false,
    addTagPopUp2: false,
    addTagPopUp3: false,
    addTagPopUp4: false,
    crmConnections: [],
    crmConnection: "",
    crmConnectionId: "",
    connectionName: "",
    salesForceObjects: [],
    primaryObjectId: "",
    primaryObjectName: "",
    fieldDate: "",
    conditionTypes: [],
    conditionType: "",
    conditionTypeId: "",
    valueTypes: [],
    valueType: "Relative",
    relativeTypes: [],
    relativeType: "",
    absoluteType: "",
    advanceTagLogic: "",
    users: [],
    userFields: [],
    userField: "",
    tagConditions: [],
    order: "",
    fieldType: "",
    fieldId: "",
    value: "",
    conditionValueTypeId: "",
    selectedTag: {},
    editTagCondition: false,
    editTagConditionId: "",
  });

  const initializeAdobeSdk = async () => {
    // fetch the adobe credentials
    const getAdobeExpressCredentials = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(
          `${baseURL}/adobe-parameters`,
          {
            viewer_id,
            organisation_id: cookies.userData?.organisation?.id,
          },
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        if (response.status === 200) {
          return response.data;
        }
      } catch (error) {
        console.error("Error fetching Adobe Express details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const adobeCredentials = await getAdobeExpressCredentials();

    // If the credentials are not available, return early
    if (!adobeCredentials) {
      console.error("Adobe credentials are missing");
      return null;
    }

    let ccEverywhere;

    // Load the SDK script dynamically
    const loadCCEverywhereScript = () => {
      return new Promise((resolve, reject) => {
        if (window.CCEverywhere) {
          resolve(window.CCEverywhere);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://cc-embed.adobe.com/sdk/v4/CCEverywhere.js";
        script.async = true;

        script.onload = () => resolve(window.CCEverywhere);
        script.onerror = () => reject(new Error("Failed to load Adobe SDK"));

        document.body.appendChild(script);
      });
    };

    try {
      // Load the script and wait for the SDK to be available
      ccEverywhere = await loadCCEverywhereScript();

      // If the SDK is still not available, exit
      if (!ccEverywhere) {
        console.error("Failed to load Adobe SDK");
        return null;
      }

      const initializeParams = {
        clientId: adobeCredentials.adobeAPIKey,
        appName: adobeCredentials.adobeAppName,
      };

      const configParams = {
        loginMode: "delayed",
      };

      // Initialize the SDK
      const sdk = await ccEverywhere.initialize(initializeParams, configParams);
      console.log("sdk call", sdk);
      setAdobeSdk(sdk);
      return sdk;
    } catch (error) {
      console.error("Error initializing Adobe SDK:", error);
    }
  };

  // states for pitches
  const [addNewPitch, setAddNewPitch] = useState({
    addPitchPopUp: false,
    crmConnections: [],
    crmConnection: "",
    crmConnectionId: "",
    opportunityNames: [],
    opportunityName: "",
    opportunityId: "",
    pitchName: "",
    pitchLayouts: [],
    pitchLayoutId: "",
    pitchLayoutName: "",
    pitchTitle: "",
    pitchHeadline: "",
    pitchDescription: "",
    backgroundImage: null,
    clientLogo: null,
    selectedContent: [],
  });

  const [users, setUsers] = useState([]);
  const [bulkUserUploads, setBulkUserUploads] = useState([]);
  const [addUserClicked, setAddUserClicked] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editUserClicked, setEditUserClicked] = useState(false);

  //Profile Management
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [addProfileClicked, setAddProfileClicked] = useState(false);
  const [editProfileClicked, setEditProfileClicked] = useState(false);
  const [editLayoutClicked, setEditLayoutClicked] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [assignUsersClicked, setAssignUsersClicked] = useState(false);

  //Layout Management
  const [layouts, setLayouts] = useState([]);
  const [selectedLayouts, setSelectedLayouts] = useState([]);
  const [addLayoutClicked, setAddLayoutClicked] = useState(false);
  const [renameLayoutClicked, setRenameLayoutClicked] = useState(false);

  // Bulk User
  const [addBulkUserClicked, setAddBulkUserClicked] = useState(false);
  const [selectedUploadId, setSelectedUploadId] = useState([]);
  const [isDownloadLogClicked, setIsDownloadLogClicked] = useState(false);

  // Company Information
  const [moreInfoClicked, setMoreInfoClicked] = useState(false);
  const [organisationDetails, setOrganisationDetails] = useState(null);
  const [selectedOrganisationId, setSelectedOrganisationId] = useState("");
  const [selectedOrganisation, setSelectedOrganisation] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [activeTab, setActiveTab] = useState("general"); //default tab to show

  //Namespace
  const [selectedNamespace, setSelectedNamespace] = useState([]);

  // Connections
  const [selectedConnections, setSelectedConnections] = useState([]);
  const [addConnectionsClicked, setAddConnectionsClicked] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [objectDetails, setObjectDetails] = useState(null);
  const [refDetails, setRefDetails] = useState(null);
  const [fieldDetails, setFieldDetails] = useState(null);
  const [insertDetails, setInsertDetails] = useState(null);
  const [plusClick, setPlusClick] = useState(false);
  const [step, setStep] = useState(3);
  const [selectedFieldId, setSelectedFieldId] = useState("");
  const [connectionObjectLoading, setConnectionObjectLoading] = useState(false);

  const [hoverPopUp, setHoverPopUp] = useState(false);

  // add tag to content
  const [hoverPlusIconId, setHoverPlusIconId] = useState("");
  const [contentId, setContentId] = useState("");

  const [microsoftClarityProjectId, setMicrosoftClarityProjectId] =
    useState("");

  const [revspireClient, setRevspireClient] = useState("");

  const [addTagToContent, setAddTagToContent] = useState(false);
  const [addContentToTag, setAddContentToTag] = useState(false);
  const [activeTags, setActiveTags] = useState([]);
  const [selectedActiveTags, setSelectedActiveTags] = useState([]);
  const [searchTag, setSearchTag] = useState("");
  const [popUpContent, setPopUpContent] = useState([]);
  const [selectedPopUpContent, setSelectedPopUpContent] = useState([]);
  const [searchContent, setSearchContent] = useState("");

  // filter popup tag manager states
  const [filterPopUp, setFilterPopUp] = useState(false);
  const [filterPopUpObjects, setFilterPopUpObjects] = useState([]);
  const [filterPopUpObject, setFilterPopUpObject] = useState("");
  const [filterPopUpFields, setFilterPopUpFileds] = useState([]);
  const [filterPopUpField, setFilterPopUpField] = useState("");
  const [filterPopUpConditions, setFilterPopUpConditions] = useState([]);
  const [filterPopUpCondition, setFilterPopUpCondition] = useState([]);
  const [filterPopUpValueTypes, setFilterPopUpValueTypes] = useState([]);

  const [filterPopUpValues, setFilterPopUpValues] = useState([]);
  const [filterPopUpValue, setFilterPopUpValue] = useState("");
  const [filterPopUpCriteriaConditions, setFilterPopUpCriteriaConditions] =
    useState([]);
  const [filterPopUpFieldName, setFilterPopUpFieldName] =
    useState("Select Field");
  const [filterPopUpConditionName, setFilterPopUpConditionName] =
    useState("Select Condition");
  const [filterPopUpValueName, setFilterPopUpValueName] =
    useState("Select Value");
  const [successBanner, setSuccessBanner] = useState(false);
  const [showFilterPopUpField, setShowFilterPopUpField] = useState(false);
  const [showFilterPopUpCondition, setShowFilterPopUpCondition] =
    useState(false);
  const [showFilterPopUpValueType, setShowFilterPopUpValueType] =
    useState(false);
  const [showFilterPopUpValue, setShowFilterPopUpValue] = useState(false);

  const [selectedFilterFields, setSelectedFilterFields] = useState(0);
  const [cloneTag, setCloneTag] = useState(false);

  // states for holding the quertTable and filterTable names and id for filtering
  const [queryTable, setQueryTable] = useState({
    queryTableName: "",
    queryTableId: "",
  });
  const [filterTable, setFilterTable] = useState({
    filterTableName: "",
    filterTableId: "",
  });

  const [selectedContent, setSelectedContent] = useState([]);
  const [localStorageData, setLocalStorageData] = useState({});
  const [filterOrigin, setFilterOrigin] = useState("");

  //OneDrive Integration
  const [oneDrivePickerOpen, setOneDrivePickerOpen] = useState(false);
  const [folderPath, setFolderPath] = useState("");

  //GoogleDrive Integration
  const [googleDrivePickerOpen, setGoogleDrivePickerOpen] = useState(false);

  // DropBox integrztion
  const [dropBoxPickerOpen, setDropBoxPickerOpen] = useState(false);

  //Profile Settings
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

  // Canva
  const [canvaDesigns, setCanvaDesigns] = useState(null);

  // Adobe Express
  const [adobeSdk, setAdobeSdk] = useState(null);

  //SlectedPitchContentId
  const [selectedPitchContent, setSelectedPitchContent] = useState(null);

  const NewTabHandler = (url) => {
    navigate(url, { target: "_blank" });
  };

  //  handler function for getting the table id
  const TableNameHandler = async (tablename, id, origin) => {
    if (
      tablename == "content" ||
      tablename == "tag" ||
      tablename == "pitch" ||
      tablename == "pitch_layout"
    ) {
      try {
        const response = await axios.post(
          `${baseURL}/get-table-id`,
          {
            tablename: tablename,
            organisation_id: cookies.userData?.organisation?.id,
            viewer_id,
          },
          {
            withCredentials: true, // Include credentials in the request
          }
        );

        const field = await axios.post(
          `${baseURL}/get-filter-field-id`,
          {
            field_name: "id",
            organisation_id: cookies.userData?.organisation?.id,
            viewer_id,
          },
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        const conditionType = await axios.post(
          `${baseURL}/get-condition-type-id`,
          {
            condition_type: "equals",
            organisation_id: cookies.userData?.organisation?.id,
            viewer_id,
          },
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        const conditionValueType = await axios.post(
          `${baseURL}/get-condition-value-type-id`,
          {
            condition_value_type: "Absolute",
            organisation_id: cookies.userData?.organisation?.id,
            viewer_id,
          },
          {
            withCredentials: true, // Include credentials in the request
          }
        );

        setFilterField(field.data.id);
        setConditionType(conditionType.data.id);
        setConditionValueType(conditionValueType.data.id);
        if (id == "sideBarTableName") {
          setQueryTable({
            queryTableName: tablename,
            queryTableId: response.data.id,
          });
        } else {
          setFilterTable({
            filterTableName: tablename,
            filterTableId: response.data.id,
          });
        }
        if (tablename == "tag" && id != "sideBarTableName") {
          ShowTagHandler(response.data.id, origin);
        } else if (tablename == "pitch" && id != "sideBarTableName") {
          ShowPitchHandler(response.data.id, origin);
        } else if ((tablename == "content", id != "sideBarTableName")) {
          ShowContentHandler(response.data.id, origin);
        }
      } catch (error) {
        console.log("Error ", error.message);
      }
    }
  };

  // handler function for the show tag manager filtered data
  const ShowTagHandler = async (id, origin) => {
    const filterConditions = [];
    let filterLogic = "";
    if (origin === "content") {
      for (let i = 0; i < selectedContents.length; i++) {
        filterConditions.push({
          filterTable: queryTable.queryTableId,
          filterTableName: queryTable.queryTableName,
          fieldName: "id",
          filterField: filterField,
          filterFieldType: "char",
          filterFieldName: "id",
          conditionName: "Equals",
          conditionType: conditionType,
          conditionValueType: conditionValueType,
          conditionValueTypeName: "Absolute",
          value: selectedContents[i].id,
          valueName: selectedContents[i].id,
          relativeValue: null,
          order: i + 1,
        });
        if (selectedContents.length == 1) {
          filterLogic += "1";
        } else if (i == 0) {
          filterLogic += `( ${i + 1} OR`;
        } else if (i + 1 == selectedContents.length) {
          filterLogic += ` ${i + 1} )`;
        } else {
          filterLogic += ` ${i + 1} OR`;
        }
      }
    } else if (origin === "pitch") {
      for (let i = 0; i < selectedPitches.length; i++) {
        filterConditions.push({
          filterTable: queryTable.queryTableId,
          filterTableName: queryTable.queryTableName,
          fieldName: "id",
          filterField: filterField,
          filterFieldType: "char",
          filterFieldName: "id",
          conditionName: "Equals",
          conditionType: conditionType,
          conditionValueType: conditionValueType,
          conditionValueTypeName: "Absolute",
          value: selectedPitches[i].id,
          valueName: selectedPitches[i].id,
          relativeValue: null,
          order: i + 1,
        });
        if (selectedPitches.length == 1) {
          filterLogic += "1";
        } else if (i == 0) {
          filterLogic += `( ${i + 1} OR`;
        } else if (i + 1 == selectedPitches.length) {
          filterLogic += ` ${i + 1} )`;
        } else {
          filterLogic += ` ${i + 1} OR`;
        }
      }
    }
    const data = {
      queryTable: id,
      filtersets: filterConditions,
      filter_logic: filterLogic,
      organisation_id: cookies.userData?.organisation?.id,
      viewer_id,
    };
    try {
      const response = await axios.post(`${baseURL}/filter`, data, {
        withCredentials: true,
      });
      if (response) {
        dispatch(SetFilterData(response.data.data));
        dispatch(SetFilterConditions(filterConditions));
        dispatch(SetFilterLogic(filterLogic));
        dispatch(SetFilterLoading(false));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // handler function for the show pitch manager filtered data
  const ShowPitchHandler = async (id, origin) => {
    const filterConditions = [];
    let filterLogic = "";
    if (origin === "tag") {
      for (let i = 0; i < selectedTags.length; i++) {
        filterConditions.push({
          filterTable: queryTable.queryTableId,
          filterTableName: queryTable.queryTableName,
          fieldName: "id",
          filterField: filterField,
          conditionName: "Equals",
          filterFieldType: "char",
          filterFieldName: "id",
          conditionType: conditionType,
          conditionValueType: conditionValueType,
          conditionValueTypeName: "Absolute",
          value: selectedTags[i].id,
          valueName: selectedTags[i].id,
          relativeValue: null,
          order: i + 1,
        });
        if (selectedTags.length == 1) {
          filterLogic += "1";
        } else if (i == 0) {
          filterLogic += `( ${i + 1} OR`;
        } else if (i + 1 == selectedTags.length) {
          filterLogic += ` ${i + 1} )`;
        } else {
          filterLogic += ` ${i + 1} OR`;
        }
      }
    } else if (origin === "content") {
      for (let i = 0; i < selectedContents.length; i++) {
        filterConditions.push({
          filterTable: queryTable.queryTableId,
          filterTableName: queryTable.queryTableName,
          fieldName: "id",
          filterField: filterField,
          conditionName: "Equals",
          filterFieldType: "char",
          filterFieldName: "id",
          conditionType: conditionType,
          conditionValueType: conditionValueType,
          conditionValueTypeName: "Absolute",
          value: selectedContents[i].id,
          valueName: selectedContents[i].id,
          relativeValue: null,
          order: i + 1,
        });
        if (selectedContents.length == 1) {
          filterLogic += "1";
        } else if (i == 0) {
          filterLogic += `( ${i + 1} OR`;
        } else if (i + 1 == selectedContents.length) {
          filterLogic += ` ${i + 1} )`;
        } else {
          filterLogic += ` ${i + 1} OR`;
        }
      }
    }

    const data = {
      queryTable: id,
      filtersets: filterConditions,
      filter_logic: filterLogic,
      organisation_id: cookies.userData?.organisation?.id,
      viewer_id,
    };
    try {
      const response = await axios.post(`${baseURL}/filter`, data, {
        withCredentials: true,
      });
      if (response) {
        dispatch(SetFilterData(response.data.data));
        dispatch(SetFilterConditions(filterConditions));
        dispatch(SetFilterLogic(filterLogic));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const ShowContentHandler = async (id, origin) => {
    const filterConditions = [];
    let filterLogic = "";
    if (origin === "tag") {
      for (let i = 0; i < selectedTags.length; i++) {
        filterConditions.push({
          filterTable: queryTable.queryTableId,
          filterTableName: queryTable.queryTableName,
          fieldName: "id",
          filterField: filterField,
          conditionName: "equals",
          filterFieldType: "char",
          filterFieldName: "id",
          conditionType: conditionType,
          conditionValueType: conditionValueType,
          conditionValueTypeName: "Absolute",
          value: selectedTags[i].id,
          valueName: selectedTags[i].id,
          relativeValue: null,
          order: i + 1,
        });
        if (selectedTags.length == 1) {
          filterLogic += "1";
        } else if (i == 0) {
          filterLogic += `( ${i + 1} OR`;
        } else if (i + 1 == selectedTags.length) {
          filterLogic += ` ${i + 1} )`;
        } else {
          filterLogic += ` ${i + 1} OR`;
        }
      }
    } else if (origin === "pitch") {
      for (let i = 0; i < selectedPitches.length; i++) {
        filterConditions.push({
          filterTable: queryTable.queryTableId,
          filterTableName: queryTable.queryTableName,
          fieldName: "id",
          filterField: filterField,
          conditionName: "equals",
          filterFieldType: "char",
          filterFieldName: "id",
          conditionType: conditionType,
          conditionValueType: conditionValueType,
          conditionValueTypeName: "Absolute",
          value: selectedPitches[i].id,
          valueName: selectedPitches[i].id,
          relativeValue: null,
          order: i + 1,
        });
        if (selectedPitches.length == 1) {
          filterLogic += "1";
        } else if (i == 0) {
          filterLogic += `( ${i + 1} OR`;
        } else if (i + 1 == selectedPitches.length) {
          filterLogic += ` ${i + 1} )`;
        } else {
          filterLogic += ` ${i + 1} OR`;
        }
      }
    }

    const data = {
      queryTable: id,
      filtersets: filterConditions,
      filter_logic: filterLogic,
      organisation_id: cookies.userData?.organisation?.id,
      viewer_id,
    };
    // console.log(data);
    try {
      const response = await axios.post(`${baseURL}/filter`, data, {
        withCredentials: true, // Include credentials in the request
      });
      console.log(response.data.data);
      if (response) {
        dispatch(SetFilterData(response.data.data));
        dispatch(SetFilterConditions(filterConditions));
        dispatch(SetFilterLogic(filterLogic));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // ----------------------------filtrerModal states and handler function---------------
  const [filterModal, setFilterModal] = useState(false);
  const [criteriaConditons, setCriteriaConditions] = useState([]);
  const [conditionModal, setConditionModal] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  const [toggleSlider, setToggleSlider] = useState(false);
  const [advanceLogic, setAdvanceLogic] = useState("1");

  // versions

  // data for the content manager
  const [oldPopUpContent, setOldPopUpContent] = useState([]);

  const [popUpTags, setPopUpTags] = useState([]);
  const [oldPopUpTags, setOldPopUpTags] = useState([]);
  const [selectedPopUpTags, setSelectedPopUpTags] = useState([]);

  const [authURL, setAuthURL] = useState("");
  const [serviceUserAuthUrl, setServiceUserAuthUrl] = useState("");
  const [isMatchingCRMFound, setIsMatchinCRMFound] = useState(true);
  const [isServiceUserConnected, setIsServiceUserConnected] = useState(true);
  const [showConnectServiceUserDialog, setShowConnectServiceUserDialog] =
    useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [nextVersionNumber, setNextVersionNumber] = useState(1);

  // Warnign Sticky banner
  const [aiCreditUsageWarning, setAiCreditUsageWarning] = useState("");
  const [storageUsageWarning, setStorageUsageWarning] = useState("");

  const navigateToFolder = useCallback(
    async (folderId, folderName) => {
      // Check if the folderId has changed or if the breadcrumbs need to be updated
      if (
        folderId !== folder_id ||
        (folderName &&
          !breadcrumbs.find((breadcrumb) => breadcrumb.id === folderId))
      ) {
        try {
          // Update the breadcrumb while navigating only if folderName is provided
          if (folderName) {
            setBreadcrumbs((prevBreadcrumbs) => [
              ...prevBreadcrumbs,
              { id: folderId, name: folderName },
            ]);
          }
          console.log("Folder Id to Navigate", folderId);
          // Update the folder_id state
          setFolder_id(folderId);
        } catch (err) {
          console.error(err);
        }
      } else {
        // If folderId hasn't changed, we can assume it's the same folder, so we don't need to load again
        setIsLoading(false);
      }
    },
    [folder_id, breadcrumbs]
  );

  const cloneTagButtonHandler = async () => {
    setAddNewTag((prevState) => ({
      ...prevState,
      addTagPopUp2: true,
      addTagPopUp4: true,
    }));
    try {
      const response = await axios.get(
        `${baseURL}/retrieve-tag-and-conditions/${selectedTag[0].id}`,
        {
          params: {
            organisation_id: cookies.userData?.organisation?.id,
            viewer_id,
          },
          withCredentials: true, // Include credentials in the request if necessary
        }
      );
      if (response) {
        setCloneTag(true);
        console.log(response.data);
        setSelectedTag([]);
        setAddNewTag((prevState) => ({
          ...prevState,
          primaryObjectId: response.data.tag.salesforce_primary_object,
          name: response.data.tag.name,
          tagConditions: response.data.tagConditions,
        }));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const mouseOverToolTipHandler = async (id) => {
    addNewTag.addTagPopUp2(true);
    addNewTag.addTagPopUp4(true);
    addNewTag.hoverPopUp(true);
    addNewTag.addTagPopUp2(true);
    addNewTag.addTagPopUp4(true);
    addNewTag.hoverPopUp(true);
    try {
      const response = await axios.get(
        `${baseURL}/retrieve-tag-and-conditions/${selectedTag[0].id}`,
        {
          params: {
            organisation_id: cookies.userData?.organisation?.id,
            viewer_id,
          },
          withCredentials: true,
        }
      );
      addNewTag.primaryObjectId(response.data.tag.salesforce_primary_object);
      addNewTag.name(response.data.tag.name);
      addNewTag.tagConditions(response.data.tagConditions);
      addNewTag.primaryObjectId(response.data.tag.salesforce_primary_object);
      addNewTag.name(response.data.tag.name);
      addNewTag.tagConditions(response.data.tagConditions);
      if (response) {
        console.log(response.data);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const addTagToContentSearchHandler = () => {
    const tags = [];
    for (let i = 0; i < activeTags.length; i++) {
      let tagName = activeTags[i]?.name?.toLowerCase();
      let tagDescription = activeTags[i]?.description?.toLowerCase();
      if (tagName?.includes(searchTag) || tagDescription?.includes(searchTag)) {
        let tagName = activeTags[i]?.name?.toLowerCase();
        let tagDescription = activeTags[i]?.description?.toLowerCase();
        if (
          tagName?.includes(searchTag) ||
          tagDescription?.includes(searchTag)
        ) {
          tags.push(activeTags[i]);
        }
      }
      setActiveTags(tags);
    }
  };

  const mouseOutToolTipHandler = () => {
    setAddNewTag((prevState) => ({
      ...prevState,
      addTagPopUp2: false,
      addTagPopUp4: false,
    }));
  };

  // handler function for handling add criteria button of filter popup of tag manager
  const FilterAddCriteriaButtonHandler = async () => {
    try {
      const response = await axios.post(
        `${baseURL}/retrieve-filter-object`,
        {
          viewer_id,
          organisation_id: cookies.userData?.organisation?.id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      if (response) {
        setFilterPopUpObjects(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const FilterPopUpFieldHandler = async () => {
    // console.log(viewer_id, filterPopUpObject , "dfsdf");
    try {
      const response = await axios.post(
        `${baseURL}/retrieve-field-values`,
        {
          viewer_id: viewer_id,
          tableName: filterPopUpObject,
          organisation_id: cookies.userData?.organisation?.id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      console.log(response.data.data);
      if (response) {
        setFilterPopUpFileds(response.data.data);
        setShowFilterPopUpField(true);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const FilterPopUpConditionHandler = async () => {
    try {
      const response = await axios.post(
        `${baseURL}/retrieve-condition-types`,
        {
          viewer_id: viewer_id,
          organisation_id: cookies.userData?.organisation?.id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      if (response) {
        setFilterPopUpConditions(response.data.data);
        setShowFilterPopUpCondition(true);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const FilterPopUpValueTypeHandler = async () => {
    try {
      const response = await axios.post(
        `${baseURL}/retrieve-condition-value-types`,
        {
          viewer_id: viewer_id,
          organisation_id: cookies.userData?.organisation?.id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      if (response) {
        setFilterPopUpValueTypes(response.data.data);
        setShowFilterPopUpValueType(true);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const FilterPopUpValueHandler = async () => {
    try {
      const response = await axios.post(
        `${baseURL}/retrieve-relative-values`,
        {
          viewer_id: viewer_id,
          organisation_id: cookies.userData?.organisation?.id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      if (response) {
        setFilterPopUpValues(response.data.data);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const FilterPopUpDeleteConditionHandler = (condition) => {
    const data = [];
    for (let i = 0; i < filterPopUpCriteriaConditions.length; i++) {
      if (
        condition.filterTable !==
          filterPopUpCriteriaConditions[i].filterTable ||
        condition.filterField !==
          filterPopUpCriteriaConditions[i].filterField ||
        condition.conditionType !==
          filterPopUpCriteriaConditions[i].conditionType ||
        condition.value !== filterPopUpCriteriaConditions[i].value ||
        condition.relativeValue !==
          filterPopUpCriteriaConditions[i].relativeValue ||
        condition.order !== filterPopUpCriteriaConditions[i].order
      ) {
        data.push(filterPopUpCriteriaConditions[i]);
      }
    }
    setFilterPopUpCriteriaConditions(data);
  };

  ////////////////////////////////////////////////////////////////////
  //////////////////    MAKE SURE SFDC SYNC FLOW  ////////////////////
  ////////////////////////////////////////////////////////////////////
  // console.log("AuthURL", authURL);
  // Function to handle the response from the endpoint
  function handleResponse(response) {
    let responseData;
    let authUrl;
    if (response === "No matching CRM connection found for the viewer") {
      setIsMatchinCRMFound(false);
      return;
    }
    try {
      responseData = JSON.parse(response);
      authUrl = responseData.authUrl;
    } catch (error) {
      // Response is not JSON, handle accordinglyc
    }
    if (
      response === "User is active" ||
      response === "Access token has been refreshed and user is active"
    ) {
      setAuthURL("");
      setIsMatchinCRMFound(true);
    } else if (authUrl) {
      setAuthURL(authUrl);
    }
  }

  function handleServiceUserData(serviceUserData) {
    let jsonData = null;
    try {
      jsonData = JSON?.parse(serviceUserData);
    } catch (error) {
      jsonData = null;
    }

    if (serviceUserData === "CRM connection not found") {
      setIsServiceUserConnected(false);
    } else if (jsonData?.authUrl) {
      setServiceUserAuthUrl(jsonData?.authUrl);
    } else if (
      serviceUserData ===
        "Access token has been refreshed and Serviceuser is active" ||
      serviceUserData === "User is active"
    ) {
      setIsServiceUserConnected(true);
    }
  }

  async function checkUserStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const mailType = urlParams.get("mailType");
    if (isLoginPage() || mailType) return;
    // Check if user has the required licenses
    const hasValidLicense = userLicense.products.some(
      (product) =>
        product.productName === "Revenue Enablement Elevate" ||
        product.productName === "Revenue Enablement Spark"
    );
    if (!hasValidLicense) {
      return;
    }

    const path = window.location.href;
    let userData;
    let serviceUserData;

    try {
      const response = await fetch(
        `${baseURL}/is-user-sfdc-connected?viewer_id=${viewer_id}&originURL=${path}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      userData = await response.text();
    } catch (error) {
      console.error("Error checking user status:", error);
    }

    try {
      const serviceResponse = await fetch(
        `${baseURL}/is-org-service-user-sfdc-connected?viewer_id=${viewer_id}&originURL=${path}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      serviceUserData = await serviceResponse.text();
    } catch (error) {
      console.error("Error checking service user status:", error);
    }
    handleResponse(userData);
    handleServiceUserData(serviceUserData);
  }

  useEffect(() => {
    if (baseURL && globalOrgId) {
      checkConsumptionDetails();
    }
  }, [baseURL, globalOrgId]);

  function handleConsumptionResponse(responseData) {
    if (
      responseData?.aiCreditStatus ===
      "No credits available. Please purchase credits to continue."
    ) {
      setAiCreditUsageWarning(true);
    } else if (
      responseData?.aiCreditStatus === "Sufficient credits available."
    ) {
      setAiCreditUsageWarning(false);
    }

    if (responseData?.storageUsage === "Storage is within the limit.") {
      setStorageUsageWarning(false);
    } else if (responseData?.storageUsage === "Storage is within the limit.") {
      setStorageUsageWarning(true);
    }
  }

  async function checkConsumptionDetails() {
    try {
      const response = await fetch(
        `${baseURL}/check-consumption-details?organisation_id=${globalOrgId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch consumption details");
        return;
      }

      const responseData = await response.json();

      handleConsumptionResponse(responseData);
    } catch (error) {
      console.error("Error fetching consumption details:", error);
    }
  }

  const checkUserLicense = (userLicense) => {
    if (
      !userLicense ||
      !userLicense.products ||
      !Array.isArray(userLicense.products)
    ) {
      console.warn(
        "userLicense or userLicense.products is invalid or undefined."
      );
      return 0;
    }

    const userProducts = userLicense.products.map(
      (product) => product.productName
    );

    const requiredLicenses = [
      "Revenue Enablement Elevate",
      "Revenue Enablement Spark",
    ];

    const hasAllLicenses = requiredLicenses.some((license) =>
      userProducts.includes(license.trim())
    );

    return hasAllLicenses ? 1 : 0;
  };

  useEffect(() => {
    if (isLoggedIn && !isLoginPage() && !isInitialChecksDone) {
      setIsInitialChecksDone(true);

      const userLicenseJSON = cookies.revspireLicense;

      let userLicense;
      try {
        userLicense =
          typeof userLicenseJSON === "string"
            ? JSON.parse(userLicenseJSON)
            : userLicenseJSON;
      } catch (error) {
        console.error("Failed to parse userLicense JSON:", error);
        return;
      }

      if (checkUserLicense(userLicense) === 1) {
        checkUserStatus();
      }

      const intervalId = setInterval(checkUserStatus, 1000 * 60 * 60);

      return () => clearInterval(intervalId);
    }
  }, [isLoggedIn, location, isInitialChecksDone]);

  const TagCleanerHandler = () => {
    setAddNewTag({
      name: "",
      description: "",
      addTagPopUp1: false,
      addTagPopUp2: false,
      addTagPopUp3: false,
      addTagPopUp4: false,
      crmConnections: [],
      crmConnection: "",
      crmConnectionId: "",
      connectionName: "",
      salesForceObjects: [],
      primaryObjectId: "",
      primaryObjectName: "",
      fieldDate: "",
      conditionTypes: [],
      conditionType: "",
      conditionTypeId: "",
      valueTypes: [],
      valueType: "Relative",
      relativeTypes: [],
      relativeType: "",
      absoluteType: "",
      advanceTagLogic: "",
      users: [],
      userFields: [],
      userField: "",
      tagConditions: [],
      order: "",
      fieldType: "",
      fieldId: "",
      value: "",
      conditionValueTypeId: "",
      selectedTag: {},
      editTagCondition: false,
      editTagConditionId: "",
    });
    setSelectedTag([]);
    setAddContentToTag(false);
    setSelectedPopUpContent([]);
    setSearchContent("");
    setFilterModal(false);
    setConditionModal(false);
    setToggleSlider(false);
    setAdvanceLogic("");
    setCriteriaConditions([]);
  };

  const ContentCleanerHandler = () => {
    setSelectedItems([]);
  };

  return (
    <GlobalContext.Provider
      value={{
        globalOrgId,
        directContent,
        setDirectContent,
        directContentUpload,
        setDirectContentUpload,
        showButtonLoading,
        setShowButtonLoading,
        ContentCleanerHandler,
        TagCleanerHandler,
        selectedPopUpTags,
        setSelectedPopUpTags,
        popUpTags,
        setPopUpTags,
        oldPopUpTags,
        oldPopUpContent,
        setOldPopUpContent,
        setPopUpContent,
        filterOrigin,
        setFilterOrigin,
        localStorageData,
        setLocalStorageData,
        filterModal,
        setFilterModal,
        criteriaConditons,
        setCriteriaConditions,
        conditionModal,
        setConditionModal,
        filterApplied,
        setFilterApplied,
        toggleSlider,
        setToggleSlider,
        advanceLogic,
        setAdvanceLogic,
        addNewPitch,
        setAddNewPitch,
        selectedFilterFields,
        setSelectedFilterFields,
        showFilterPopUpValue,
        showFilterPopUpValueType,
        showFilterPopUpCondition,
        showFilterPopUpField,
        filterPopUpFieldName,
        filterPopUpConditionName,
        successBanner,
        setSuccessBanner,
        setFilterPopUpConditionName,
        setFilterPopUpValueName,
        setFilterPopUpFieldName,
        FilterPopUpDeleteConditionHandler,
        queryTable,
        setQueryTable,
        filterTable,
        setFilterTable,
        selectedContent,
        setSelectedContent,
        TableNameHandler,
        NewTabHandler,
        ShowTagHandler,
        ShowPitchHandler,
        ShowContentHandler,
        filterPopUpCriteriaConditions,
        filterPopUpValues,
        filterPopUpValue,
        setFilterPopUpValue,
        FilterPopUpValueHandler,
        filterPopUpValueTypes,
        FilterPopUpValueTypeHandler,
        filterPopUpCondition,
        setFilterPopUpCondition,
        filterPopUpConditions,
        FilterPopUpConditionHandler,
        filterPopUpFields,
        filterPopUpField,
        setFilterPopUpField,
        FilterPopUpFieldHandler,
        filterPopUpObject,
        setFilterPopUpObject,
        filterPopUpObjects,
        FilterAddCriteriaButtonHandler,
        filterPopUp,
        setFilterPopUp,
        searchContent,
        setSearchContent,
        selectedPopUpContent,
        setSelectedPopUpContent,
        popUpContent,
        searchTag,
        setSearchTag,
        addTagToContentSearchHandler,
        contentId,
        setContentId,
        hoverPlusIconId,
        setHoverPlusIconId,
        addContentToTag,
        setAddContentToTag,
        selectedActiveTags,
        setSelectedActiveTags,
        activeTags,
        addTagToContent,
        setAddTagToContent,
        hoverPopUp,
        mouseOutToolTipHandler,
        mouseOverToolTipHandler,
        setHoverPopUp,
        cloneTag,
        setCloneTag,
        cloneTagButtonHandler,
        sortValueType,
        sortProperty,
        setSortValueType,
        setSortProperty,
        tagContent,
        setTagContent,
        viewer_id,
        userPermission,
        userLicense,
        user_name,
        name,
        folder_id,
        setFolder_id,
        contentSelected,
        setContentSelected,
        renameModalOpen,
        setRenameModalOpen,
        isMoveButtonClicked,
        setIsMoveButtonClicked,
        selectedItems,
        setSelectedItems,
        contents,
        setContents,
        navigateToFolder,
        contentModalOpen,
        setContentModalOpen,
        isLoading,
        setIsLoading,
        contentModalLoading,
        setContentModalLoading,
        breadcrumbs,
        setBreadcrumbs,
        dialogBreadcrumbs,
        setDialogBreadcrumbs,
        recycleBin,
        setRecycleBin,
        baseURL,
        frontendBaseURL,
        viewContent,
        setViewContent,
        isCopyButtonClicked,
        setIsCopyButtonClicked,
        dashboardState,
        setDashboardState,
        selectedUsers,
        setSelectedUsers,
        users,
        setUsers,
        bulkUserUploads,
        setBulkUserUploads,
        addUserClicked,
        setAddUserClicked,
        // version modal
        versionModalOpen,
        setVersionModalOpen,
        nextVersionNumber,
        setNextVersionNumber,

        editUserClicked,
        setEditUserClicked,
        selectedProfiles,
        setSelectedProfiles,
        layouts,
        setLayouts,
        selectedLayouts,
        setSelectedLayouts,
        addLayoutClicked,
        setAddLayoutClicked,
        renameLayoutClicked,
        setRenameLayoutClicked,
        addProfileClicked,
        setAddProfileClicked,
        editProfileClicked,
        setEditProfileClicked,
        editLayoutClicked,
        setEditLayoutClicked,
        profiles,
        setProfiles,
        assignUsersClicked,
        setAssignUsersClicked,
        addBulkUserClicked,
        setAddBulkUserClicked,
        selectedUploadId,
        setSelectedUploadId,
        isDownloadLogClicked,
        setIsDownloadLogClicked,
        addNewTag,
        setAddNewTag,
        selectedTag,
        setSelectedTag,
        moreInfoClicked,
        setMoreInfoClicked,
        organisationDetails,
        setOrganisationDetails,
        organisations,
        setOrganisations,
        selectedConnections,
        setSelectedConnections,
        userData,
        setUserData,
        rawCookie,
        setRawCookie,
        addConnectionsClicked,
        setAddConnectionsClicked,
        connectionDetails,
        setConnectionDetails,
        objectDetails,
        connectionObjectLoading,
        setConnectionObjectLoading,
        setObjectDetails,
        refDetails,
        setRefDetails,
        fieldDetails,
        setFieldDetails,
        plusClick,
        setPlusClick,
        insertDetails,
        setInsertDetails,
        step,
        setStep,

        selectedFieldId,
        setSelectedFieldId,

        authURL,
        setAuthURL,

        microsoftClarityProjectId,
        setMicrosoftClarityProjectId,

        revspireClient,
        setRevspireClient,

        handleResponse,
        driveSelection,
        setDriveSelection,
        oneDrivePickerOpen,
        setOneDrivePickerOpen,
        folderPath,
        setFolderPath,

        googleDrivePickerOpen,
        setGoogleDrivePickerOpen,

        dropBoxPickerOpen,
        setDropBoxPickerOpen,

        selectedOrganisationId,
        setSelectedOrganisationId,
        selectedNamespace,
        setSelectedNamespace,

        isMatchingCRMFound,
        setIsMatchinCRMFound,
        isServiceUserConnected,
        setIsServiceUserConnected,
        serviceUserAuthUrl,
        showConnectServiceUserDialog,
        setShowConnectServiceUserDialog,

        aiCreditUsageWarning,
        setAiCreditUsageWarning,
        storageUsageWarning,
        setStorageUsageWarning,

        resetPasswordDialogOpen,
        setResetPasswordDialogOpen,
        selectedOrganisation,
        setSelectedOrganisation,

        activeTab,
        setActiveTab,

        integrationsConnection,
        setIntegrationsConnection,
        showConnectionButtons,
        setShowConnectionButtons,
        checkUserStatus,

        canvaDesigns,
        setCanvaDesigns,

        adobeSdk,
        initializeAdobeSdk,

        connections,
        setConnections,
        selectedCanvaItemId,
        setSelectedCanvaItemId,

        isSvg,
        setIsSvg,
        hideFilter,
        setHideFilter,
        helpHideFilter,
        setHelpHideFilter,

        onedriveTenantRestrict,

        disableDefaultNavigation,
        setDisableDefaultNavigation,
        contentCollabration,
        setContentCollabration,

        selectedPitchContent,
        setSelectedPitchContent,
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </GlobalContext.Provider>
  );
};
