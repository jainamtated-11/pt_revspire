import React, { useState, useEffect, useRef, useContext } from "react";
import PropTypes from "prop-types";
import onedrive from "../../../../assets/onedrive.svg";
import googleDrive from "../../../../assets/google-drive.svg";
import localDrive from "../../../../assets/local-storage-S.svg";
import { toast } from "react-hot-toast";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import Button from "../../../ui/Button";
import { GlobalContext } from "../../../../context/GlobalState";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchContentsAsync,
  SetSelectedItems,
  UnSelectAllItems,
} from "../../../../features/content/contentSlice";
import { useCookies } from "react-cookie";
import TenantSelection from "./TenantSelection";
import DropBoxLogo from "../../../../assets/DropBoxLogo.svg";
import { IoLinkSharp } from "react-icons/io5";
import { SiVimeo, SiYoutube } from "react-icons/si";
import { LuLoaderCircle, LuUpload } from "react-icons/lu";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CanvaLogo from "../../../../assets/canva.svg";
import MicrosoftStreamLogo from "../../../../assets/MicrosoftStreamLogo.png";

const VersionUploadModal = ({ onClose, onClick }) => {
  const {
    viewer_id,
    folder_id,
    baseURL,
    frontendBaseURL,
    selectedOrganisationId,
    setOneDrivePickerOpen,
    nextVersionNumber,
    versionModalOpen,
    setVersionModalOpen,
    setGoogleDrivePickerOpen,
    setContentId,
    organisationDetails,
    directContentUpload,
  } = useContext(GlobalContext);

  const [selectedDrive, setSelectedDrive] = useState("");
  const [showLocalUpload, setShowLocalUpload] = useState(false); // State to control local upload form visibility

  const modalRef = useRef(null);
  const axiosInstance = useAxiosInstance();

  const contents = useSelector((state) => state.contents.contents);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState(""); //for storing the file name
  const fileInputRef = useRef(null); // Ref for the hidden file input
  const selectedItems = useSelector((state) => state.contents.selectedItems);
  const selectedItemId = selectedItems[0].id;
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false); //disable upload button while loading
  const [nameSpace, setNameSpace] = useState("");
  const [nameSpacesList, setNameSpacesList] = useState([]);
  const breadcrumbsState = useSelector((state) => state.contents.breadcrumbs);
  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
  const currentFolder = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
  const folderId = currentFolder ? currentFolder.id : folder_id || "";


  const [displayTenantChoice, setDisplayTenantChoice] = useState(false);
  const [cookies, setCookie,removeCookie] = useCookies([
    "OneDriveAccessToken",
    "GoogleDirveAccessToken",
    "source_sync",
    "userData"
  ]);

  const organisation_id = cookies.userData?.organisation?.id;
  const [gdriveClientID, setGdriveClientID] = useState("");
  const [gdriveApiKey, setGdriveApiKey] = useState("");
  const [tokenClient, setTokenClient] = useState(null);

  const [pickerInited, setPickerInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);

  const [showAuthorizeButton, setShowAuthorizeButton] = useState(false);

  const uploadMethods = [
    {
      name: "One Drive",
      icon: (props) => (
        <img
          src={onedrive}
          alt="One Drive Logo"
          {...props}
          className={`${props.className} h-6 w-6`}
        />
      ),
    },
    {
      name: "Google Drive",
      icon: (props) => (
        <img
          src={googleDrive}
          alt="Google Drive Logo"
          {...props}
          className={`${props.className} h-10 w-10`}
        />
      ),
    },
    {
      name: "DropBox",
      icon: (props) => (
        <img
          src={DropBoxLogo}
          alt="DropBox Logo"
          {...props}
          className={`${props.className} h-8 w-8`}
        />
      ),
    },
    {
      name: "Canva",
      icon: (props) => (
        <img
          src={CanvaLogo}
          alt="Canva Logo"
          {...props}
          className={`${props.className} h-6 w-6`}
        />
      ),
    },
    {
      name: "Microsoft Stream",
      icon: (props) => (
        <img
          src={MicrosoftStreamLogo}
          alt="Microsoft Stream Logo"
          {...props}
          className={`${props.className} h-6 w-6`}
        />
      ),
    },
    {
      name: "Youtube",
      icon: (props) => (
        <SiYoutube {...props} className="text-[#FF0000] text-3xl" />
      ),
    },
    {
      name: "Vimeo",
      icon: (props) => (
        <SiVimeo {...props} className="text-[#1AB7EA] text-3xl" />
      ),
    },
    {
      name: "Local Drive",
      icon: LuUpload,
    },
    {
      name: "Public URL",
      icon: IoLinkSharp,
    },
  ];

  const [sourceSyncOneD, setSourceSyncOneD] = useState(true); // Default to true
  const [sourceSyncGD, setSourceSyncGD] = useState(true); // Default to true
  const [syncMessageOneD, setSyncMessageOneD] = useState("Sync On"); // Message for One Drive
  const [syncMessageGD, setSyncMessageGD] = useState("Sync On"); // Message for Google Drive

  const [dropBoxAppKey, setDropBoxAppKey] = useState(null);
  const [sourceSyncDropbox, setSourceSyncDropbox] = useState(true);
  const [syncMessageDropBox,setSyncMessageDropBox] = useState("Sync On");
  const [isLoading ,setIsLoading] = useState(false);

  const [showNextButton, setShowNextButton] = useState(false);


  const [youtubeLinkModal, setYoutubeLinkModal] = useState(false);
  const [youtubeLinkName, setYoutubeLinkName] = useState("");
  const [youtubeLinkDescription, setYoutubeLinkDescription] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");

  const [vimeoLinkModal, setVimeoLinkModal] = useState(false);
  const [vimeoLinkName, setVimeoLinkName] = useState("");
  const [vimeoLinkDescription, setVimeoLinkDescription] = useState("");
  const [vimeoLink, setVimeoLink] = useState("");

  const [canvaLinkModal, setCanvaLinkModal] = useState(false);
  const [canvaLinkName, setCanvaLinkName] = useState("");
  const [canvaLinkDescription, setCanvaLinkDescription] = useState("");
  const [canvaLink, setCanvaLink] = useState("");

  const [microsoftStreamLinkModal, setMicrosoftStreamLinkModal] = useState(false);
  const [microsoftStreamLinkName, setMicrosoftStreamLinkName] = useState("");
  const [microsoftStreamLinkDescription, setMicrosoftStreamLinkDescription] = useState("");
  const [microsoftStreamLink, setMicrosoftStreamLink] = useState("");

const [linkUploadModal, setLinkUploadModal] = useState(false);
const [linkName, setLinkName] = useState("");
const [linkDescription, setLinkDescription] = useState("");
const [link, setLink] = useState("");

const [allowUploadLink, setAllowUploadLink] = useState(true);


const [allowUploadYoutubeLink, setAllowUploadYoutubeLink] = useState(true);
const [isUploadYoutubeLink, setIsUploadYoutubeLink] = useState(false);
const [allowUploadVimeoLink, setAllowUploadVimeoLink] = useState(true);
const [isUploadVimeoLink, setIsUploadVimeoLink] = useState(false);

const [allowUploadCanvaLink, setAllowUploadCanvaLink] = useState(true);
const [isUploadCanvaLink, setIsUploadCanvaLink] = useState(false);

const [allowUploadMicrosoftStreamLink, setAllowUploadMicrosoftStreamLink] = useState(true);
const [isUploadMicrosoftStreamLink, setIsUploadMicrosoftStreamLink] = useState(false);

const [isUploadLink, setIsUploadLink] = useState(false);
const [isYoutubeLink, setIsYoutubeLink] = useState(false);
const [isVimeoLink, setIsVimeoLink] = useState(false);
const [isMicrosoftStreamLink, setIsMicrosoftStreamLink] = useState(false);
const [isCanvaLink, setIsCanvaLink] = useState(false);

  const SCOPES =
    "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly";

    const [oneDriveTenantRestriction, setOneDriveTenantRestriction] = useState(organisationDetails?.organisation?.onedrive_tenant_restrict);
  console.log("One Drive tentat resitction in drive sleection:",oneDriveTenantRestriction);

  // const [showTenantSelection, setShowTenantSelection] = useState(false); // State to control TenantSelection visibility
    // const modalRefTenant = useRef(null);


  useEffect(() => {
    localStorage.setItem("versionUpload", 1); // Set versionUpload to 1 when the modal opens
    localStorage.setItem("source_sync", 1); // Set source_sync to 1 when the modal opens
    const userData = cookies.userData;
    console.log(cookies.userData);
    if (userData) {
      try {
          const tenantRestrict = userData.organisation.onedrive_tenant_restrict; 
          setOneDriveTenantRestriction(tenantRestrict); // Store it in state
          // localStorage.setItem("onedriveTenantRestrict", tenantRestrict); // Optionally store in local storage
      } catch (error) {
          console.error("Error parsing userData cookie:", error);
      }
  }
  console.log("One Drive tenant restriction",oneDriveTenantRestriction)
  }, []);

  // Effect to handle changes in the selected upload method
  useEffect(() => {
    setShowAuthorizeButton(
      selectedDrive === "One Drive" || selectedDrive === "Google Drive" || selectedDrive === "DropBox"
    );

    setShowNextButton(selectedDrive === "Youtube" || selectedDrive === "Vimeo" || selectedDrive === "Public URL" || selectedDrive === "Canva" || selectedDrive === "Microsoft Stream");

    if (selectedDrive === "Local Drive") {
      setShowLocalUpload(true);
      fileInputRef.current.click(); // Automatically open the file picker
    } else {
      setShowLocalUpload(false);
      setSelectedFile(null); // Reset selected file
      setFileName(""); // Reset file name
    }
  }, [selectedDrive]);

  useEffect(() => {
    axiosInstance
      .post(`/view-authorised-namespace`, {
        viewer_id: viewer_id,
        organisation_id: selectedOrganisationId,
      })
      .then((response) => {
        if (response.data.data.length === 1) {
          setNameSpace(response.data.data[0].namespace);
          localStorage.removeItem("nameSpace");
          localStorage.setItem("nameSpace",response.data.data[0].namespace);
          setNameSpacesList(response.data.data);
        } else {
          setNameSpacesList(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch namespace", error);
      });
  }, [viewer_id]);

  useEffect(() => {
    axiosInstance
      .post(`/google-credentials`, {
        viewer_id: viewer_id,
      })
      .then((response) => {
        if (
          response.data.message === "Google credentials generated successfully"
        ) {
          setGdriveApiKey(response.data.googleApiKey);
          setGdriveClientID(response.data.googleClientId);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch namespace", error);
      });
  }, [viewer_id]);

  //UseEffect for Google Drive Picker
  useEffect(() => {
    if (gdriveClientID) {
      const loadPicker = () => {
        window.gapi.load("picker", onPickerApiLoad);
      };

      const onPickerApiLoad = () => {
        setPickerInited(true);
      };

      const gisLoaded = () => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: gdriveClientID,
          scope: SCOPES,
          callback: "",
        });
        setTokenClient(client);
        setGisInited(true);
      };

      window.gapi_onload = loadPicker;
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js?onload=gapi_onload";
      document.body.appendChild(script);

      const gisScript = document.createElement("script");
      gisScript.src = "https://accounts.google.com/gsi/client";
      gisScript.async = true;
      gisScript.defer = true;
      gisScript.onload = gisLoaded;
      document.body.appendChild(gisScript);
    }
  }, [gdriveClientID]);

  useEffect(() => {
    const storedNameSpace = localStorage.getItem("nameSpace");
    if (storedNameSpace) {
      setNameSpace(storedNameSpace);
      console.log("Retrieved nameSpace from localStorage:", storedNameSpace);
    } else {
      console.warn("No nameSpace found in localStorage.");
    }
  }, []);


  const handleOneDriveAuthWithNamespace = async (namespace) => {
    try {
        const response = await axiosInstance.get(`/onedrive-auth`, {
            params: {
                nameSpace: namespace,
                subdomainURL: frontendBaseURL,
                folderPath: breadcrumbsState,
                viewer_id: viewer_id,
            },
        });
        const responseData = response.data;
        window.location.href = responseData;
    } catch (error) {
        console.error("Error starting OneDrive authentication with namespace:", error);
    }
};
const handleOneDriveAuthWithoutNamespace = async () => {
    try {
        const response = await axiosInstance.get(`/onedrive-auth`, {
            params: {
                subdomainURL: frontendBaseURL,
                folderPath: breadcrumbsState,
                viewer_id: viewer_id,
            },
        });
        const responseData = response.data;
        window.location.href = responseData;
    } catch (error) {
        console.error("Error starting OneDrive authentication without namespace:", error);
    }
};
  

const handleOneDriveAuthorize = async () => {
  console.log("onedrive authorize");
  const accessToken = cookies.OneDriveAccessToken;
  const refreshToken = cookies.refreshToken;
  let nameSpace = cookies.nameSpace || localStorage.getItem("nameSpace");

  console.log("==== nameSpace value is ==",nameSpace);

  const currentFolder =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
  const folderId = currentFolder ? currentFolder.id : folder_id || "";

  // Save the current folderId to local storage
  if (folderId) {
    localStorage.setItem("currentFolderId", folderId);
    console.log("Current folder ID saved to local storage:", folderId);
  }

  // if have access token then open picker else check for restrictedtenant
  if (accessToken) {
    // Check if source_sync is on
    const source_sync = localStorage.getItem("source_sync");
    if (source_sync === "1") { 
        try {
            // Call the /onedrive-file-sync endpoint 
            const response = await axiosInstance.post(
                `/onedrive-file-sync`,
                {
                    viewer_id,
                    refresh_token: refreshToken,
                    access_token: accessToken,
                    namespace: nameSpace,
                },
                {
                    withCredentials: true,
                }
            );

            console.log("===Onedrive files sync status", response.status);
            console.log(" ===response of the onedrive file sync ",response);
        } catch (error) {
            console.error("Error during OneDrive sync:", error);
            return; 
        }
    }

    // Open the OneDrive picker after ensuring sync
    setOneDrivePickerOpen(true);
           
  } else if (oneDriveTenantRestriction === false || oneDriveTenantRestriction === 0) {
    console.log("onedriveTenantRestrict === 0 || false ");
    await handleOneDriveAuthWithoutNamespace();
  } else if(oneDriveTenantRestriction === true || oneDriveTenantRestriction ===1){
    console.log("onedriveTenantRestrict === 1 || true");
    console.log("NameSpaces List :",nameSpacesList);
    // now check for namespace 
    if(nameSpacesList.length > 1){
      console.log("==Multiple namespaces available===");
      setDisplayTenantChoice(true);
      // in this case we will call the handleNameSpaceSelection which is called from the tenentSelection

    }else if(nameSpacesList.length === 1){
      console.log("==Only one namespace available ==");
      await handleOneDriveAuthWithNamespace(nameSpacesList[0].namespace);
    }else if(nameSpacesList.length == 0){
      toast.error("Please create a namsespace or tenant");
      // window.location.href = "https://dev.revspire.io/user/organisation";
    }
  } else{
      toast.error("Please go to onedrive tab in organisation and try again");
      console.error("Get the tenant restriction");
      // window.location.href = "https://dev.revspire.io/user/organisation";
  }
  onClose();
}

      // Function to handle namespace selection from TenantSelection
      const handleNamespaceSelection = (namespace) => {
        setNameSpace(namespace); // Set the selected namespace
       
        handleOneDriveAuthWithNamespace(namespace); // Call the auth function with the selected namespace
        setDisplayTenantChoice(false); // Close the tenant selection modal
    };

  const handleGoogleDriveAuthorize = async () => {
    const accessToken = cookies.GoogleDirveAccessToken;
    let response;
    if (!accessToken) {
      response = await axiosInstance.post("/google-credentials", {
        viewer_id: viewer_id,
      });
    }

    if (
      !accessToken &&
      response.data.message === "Google credentials generated successfully"
    ) {
      const { googleClientId, googleDriveRedirectUrl } = response.data;

      setCookie("googleClientId", googleClientId, {
        path: "/",
        domain: ".revspire.io",
        secure: true,
        sameSite: "Lax",
      });

      // Get the current URL and extract the domain part
      const currentPath = window.location.href;
      const domain = extractDomain(currentPath);

      // Encode breadcrumbs state
      const encodedBreadcrumbsState = encodeURIComponent(
        JSON.stringify(breadcrumbsState)
      );

      // Construct redirect URL with all necessary parameters
      const redirectUrl = `${googleDriveRedirectUrl}?redirectDomain=${encodeURIComponent(
        domain
      )}&breadcrumbState=${encodedBreadcrumbsState}`;

      window.location.href = redirectUrl;
    } else {
      // If we have an access token, create picker
      if (gdriveClientID) {
        createVersionPicker(accessToken);
      }
    }
    onClose(); // Close the version upload modal
  };

  // Create picker specifically for version upload
  const createVersionPicker = (token) => {
    setGoogleDrivePickerOpen(false);
    console.log("Inside the create version picker: " + token);

    if (pickerInited && gisInited && token) {
      const view = new window.google.picker.DocsView(
        window.google.picker.ViewId.DOCS
      );

      const picker = new window.google.picker.PickerBuilder()
        // .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED, false) // Disable multiple selection
        .setOAuthToken(token)
        .addView(view)
        .setDeveloperKey(gdriveApiKey)
        .setCallback((data) => versionPickerCallback(data, token))
        .build();
      picker.setVisible(true);
    }
  };

  // Callback  for version upload
  const versionPickerCallback = async (data, token) => {
    console.log(
      "Inside the verison picker callback with data: " + JSON.stringify(data)
    );
    console.log("data.docs.length: " + data.docs.length);

    if (data.action === window.google.picker.Action.PICKED) {
      // Ensure only one file is selected
      if (data.docs.length > 1) {
        toast.error("Please select only one file for version upload");
        return;
      }

      const fileId = data.docs[0].id;
      console.log("here is the fileid" + fileId);
      setGoogleDrivePickerOpen(false);

      console.log("===current folder for gdiveupload is ",folderId);

      toast
        .promise(
          axiosInstance.post(`/googledrive-version-upload`, {
            fileID: fileId,
            accessToken: token,
            created_by: viewer_id,
            folder_id: folderId,
            version_parent: selectedItems[0].id,
            source_sync: localStorage.getItem("source_sync"),
          },
          { withCredentials: true }
        ),
        {
          loading: "Uploading new version...",
          success: "Version added successfully!",
          error: "Failed to add version",
        }
      )
      .then((response) => {
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: breadcrumbsState[breadcrumbsState.length - 1].id,
            baseURL: baseURL,
            organisation_id,
          })
        );
          setContentId(response?.data?.newContent[0]?.id);
          dispatch(SetSelectedItems(response?.data?.newContent));
        })
        .catch((error) => {
          console.error("Version upload error:", error);
        });
    }
  };

  // dropbox verison upload feature
  const handleDropBoxAuthorize = async () => {
    try {
      setIsLoading(true);
  
      // Fetch Dropbox API Key dynamically
      const credentialsResponse = await axiosInstance.post(
        "/dropbox-credentials",
        {},
        { withCredentials: true }
      );
  
      if (
        credentialsResponse.data.message ===
        "Dropbox credentials generated successfully"
      ) {
        const appKey = credentialsResponse.data.dropBoxAppKey;
        setDropBoxAppKey(appKey);
  
        // Load Dropbox Chooser script dynamically with the fetched API key
        const script = document.createElement("script");
        script.src = "https://www.dropbox.com/static/api/2/dropins.js";
        script.id = "dropboxjs";
        script.dataset.appKey = appKey;
        document.body.appendChild(script);
  
        script.onload = () => {
          // Configure and open the Dropbox Chooser
  
          const options = {
            success: async (files) => {
              const fileLinks = files.map((file) => file.link);
              const postData = {
                files: fileLinks,
                created_by: viewer_id,
                description: "Dropbox file version upload",
                folder: folderId,
                version_parent: selectedItems[0].id,
                organisation_id,
              };
  
              // Axios POST call to upload files to backend
              toast
                .promise(
                  axiosInstance.post("/dropbox-version-upload", postData, {
                    withCredentials: true,
                  }),
                  {
                    loading: "Uploading file...",
                    success: "Content Added Successfully!",
                    error: "Failed to Add Some Content",
                  }
                )
                .then(() =>
                  dispatch(
                    fetchContentsAsync({
                      viewer_id,
                      folder_id: folderId,
                      baseURL: baseURL,
                      organisation_id,
                    })
                  )
                )
                .catch((error) => {
                  console.error("Dropbox upload error:", error);
                });
            },
            cancel: () => {
              console.log(
                "Dropbox Chooser was closed without selecting a file."
              );
            },
            linkType: "direct",
            multiselect: true,
            extensions: [
              "images",
              "video",
              ".pdf",
              ".doc",
              ".docx",
              "ppt",
              "pptx",
              "xls",
              "xlsx",
            ],
            folderselect: false,
          };
  
          if (window.Dropbox) {
            window.Dropbox.choose(options);
          } else {
            console.error("Dropbox API script not loaded.");
          }
        };
      } else {
        console.error("Failed to fetch Dropbox credentials");
      }
    } catch (error) {
      console.error("Error during Dropbox authorization process", error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };
  

  // Helper function to extract domain
  const extractDomain = (url) => {
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
    } catch (error) {
      console.error("Invalid URL", error);
      return null;
    }
  };

  const handleUploadMethodClick = (method) => {
    setSelectedDrive(method);
    if (method === "One Drive") {
      setSourceSyncOneD(true); // Set source sync to true
      setSyncMessageOneD("Sync On"); // Set message to Sync On
      localStorage.setItem("source_sync", 1); // Set source_sync to 1
    } else if (method === "Google Drive") {
      setSourceSyncGD(true); // Set source sync to true
      setSyncMessageGD("Sync On"); // Set message to Sync On
      localStorage.setItem("source_sync", 1); // Set source_sync to 1
    } else if( method === "DropBox"){
      setSourceSyncDropbox(true);
      setSyncMessageDropBox("Sync On")
      localStorage.setItem("source_sync",1);
    }
    else if (method === "Youtube") {
    
      setShowNextButton(true); // Show the Next button
    } else if (method === "Vimeo") {
    
      setShowNextButton(true); // Show the Next button
    } else if (method === "Public URL") {
  
      setShowNextButton(true); // Show the Next button
    } else if (method === "Canva") {
  
      setShowNextButton(true); // Show the Next button
    } else if (method === "Microsoft Stream") {
  
      setShowNextButton(true); // Show the Next button
    }  
    
    else if (method === "Local Drive") {
      setShowLocalUpload(true);
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      setShowLocalUpload(false);
      setSelectedFile(null);
      setFileName("");
      onClose();
    }
  };

  // Handle file input change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      // Show toast with the selected file name
      toast.success(`Selected file: ${file.name}`);
    }
  };

  const uploadLocalFile = async () => {
    const formData = new FormData();
    formData.append("created_by", viewer_id);
    formData.append("folder", folderId);
    formData.append("description", "Content");
    formData.append("version_parent", selectedItemId);

    const newFileName = `V-${nextVersionNumber}-${selectedFile.name}`;

    const newFile = new File([selectedFile], newFileName, {
      type: selectedFile.type,
      lastModified: selectedFile.lastModified,
    });

    formData.append("files", newFile);

    const toastId = toast.loading(`Uploading ${newFileName}... 0%`);

    try {
      const response = await axiosInstance.post(
        "/local-version-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            toast.loading(
              `Uploading ${newFileName} ${percentCompleted}%`,
              { id: toastId }
            );
          },
        }
      );

      toast.success(`Successfully uploaded ${newFileName}`, { id: toastId });
      
      if (response.status === 200) {
        console.log("response.data: ", response.data);
        setContentId(response?.data?.newContent[0]?.id);
        dispatch(SetSelectedItems(response?.data?.newContent));
        onClick();
      } else {
        toast.error("Failed to upload the files");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error uploading the files", { id: toastId });
    } finally {
      setIsUploading(false);
      dispatch(fetchContentsAsync({ viewer_id, folderId, baseURL: baseURL, organisation_id }));
      localStorage.setItem("versionUpload", 0);
      onClose();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Set versionUpload to 1 in local storage
    localStorage.setItem("versionUpload", 1);

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    setIsUploading(true);

    if (selectedDrive === "Local Drive") {
      await uploadLocalFile();
    } else if (selectedDrive === "One Drive") {
      // await uploadOneDriveFile();
      handleOneDriveAuthorize();
    } else if (selectedDrive === "Google Drive") {
      await uploadGoogleDriveFile();
    }
  };

  const handleCancel = () => {
    localStorage.setItem("versionUpload", 0);
    localStorage.setItem("source_sync", 1);
    onClose();
  };

  // Update the toggle change handlers
  const handleSourceSyncOneDChange = (e) => {
    const checked = e.target.checked;
    setSourceSyncOneD(checked); // Update the state based on toggle
    localStorage.setItem("source_sync", checked ? 1 : 0); // Update local storage based on toggle state
    setSyncMessageOneD(checked ? "Sync On" : "Sync Off");
    console.log("Toggle changed:", checked);
  };

  const handleSourceSyncGDChange = (e) => {
    const checked = e.target.checked;
    setSourceSyncGD(checked); // Update the state based on toggle
    localStorage.setItem("source_sync", checked ? 1 : 0); // Update local storage based on toggle state
    setSyncMessageGD(checked ? "Sync On" : "Sync Off");
    console.log("Toggle changed:", checked);
  };

  const isValidYoutubeUrl = (url) => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return youtubeRegex.test(url);
  };

  const isValidMicrosoftStreamUrl = (input) => {
    // If input is an iframe tag, extract the src URL
    let urlToCheck = input;
    const iframeMatch = input.match(/<iframe[^>]*src="([^"]*)"/i);
    if (iframeMatch && iframeMatch[1]) {
      urlToCheck = iframeMatch[1];
    }

    // Check for standard Stream URL format
    const streamRegex = /^https:\/\/[\w-]+\.sharepoint\.com\/(:v:\/[a-zA-Z0-9/_.-]+\/[a-zA-Z0-9_-]+\?.*|personal\/[^/]+\/_layouts\/15\/embed\.aspx\?UniqueId=)/;
    return streamRegex.test(urlToCheck);
  };

  const isValidCanvaUrl = (url) => {
    const canvaRegex =
      /^https?:\/\/(www\.)?canva\.com\/design\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/edit\?.*utm_campaign=designshare.*$/;
    return canvaRegex.test(url);
  };
  
  // Function to validate URL
  const isValidUrl = (url) => {
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i; // Regex to validate URL
    return urlRegex.test(url);
  };
  
  const isValidVimeoUrl = (url) => {
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/([0-9]+)/;
    return vimeoRegex.test(url);
  };
  
  const convertToYoutubeEmbed = (url) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };
  
  const convertToVimeoEmbed = (url) => {
    const match = url.match(/vimeo\.com\/([0-9]+)/);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
    return url;
  };

  const handleUploadLink = async () => {

    if (!link || !linkName || !linkDescription) {
      setAllowUploadLink(false);
      toast.error("Please fill  all the fields");
      return;
    }

    // Check if the link is a valid URL
    if (!isValidUrl(link)) {
      toast.error("Please enter a valid URL starting with http or https");
      return;
    }


    setIsUploadLink(true);
    let data = {
      publicURL: link,
      url_name: linkName,
      description: linkDescription,
      created_by: viewer_id,
      source:"Public URL",
      version_parent:selectedItemId,
    };

    if (directContentUpload) {
      data = {
        ...data,
        direct_pitch_content: 1,
      };
    } else {
      data = {
        ...data,
        folder_id: breadcrumbsState[breadcrumbsState.length - 1]?.id || "",
      };
    }

    try {
      const response = await axiosInstance.post(`/publicURL-version-upload`, data, {
        withCredentials: true, // Include credentials in the request
      });
      if (response) {
        console.log(response.data);
        setLink("");
        setLinkName("");
        setLinkDescription("");
        toast.success("Url Upload Successfully");
        setLinkUploadModal(false);
        // setSelectedCRM("");
        // setDriveSelection(false);
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: data.folder_id,
            baseURL: baseURL,
            organisation_id,
          })
        );
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setAllowUploadLink(false);
      setIsUploadLink(false);
      onClose();
    }
  };

  const handleUploadYoutubeLink = async () => {
    if (!youtubeLink || !youtubeLinkName || !youtubeLinkDescription) {
      setAllowUploadYoutubeLink(false);
      toast.error("Please fill in all fields");
      return;
    }

    if (!isValidYoutubeUrl(youtubeLink)) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    setIsYoutubeLink(true);
    setIsUploadYoutubeLink(true);

    const embedLink = convertToYoutubeEmbed(youtubeLink);

    let data = {
      publicURL: embedLink, // Using the converted embed link
      url_name: youtubeLinkName,
      description: youtubeLinkDescription,
      created_by: viewer_id,
      source: "Youtube",
      version_parent:selectedItemId,
    };

    if (directContentUpload) {
      data = {
        ...data,
        direct_pitch_content: 1,
      };
    } else {
      data = {
        ...data,
        folder_id: breadcrumbsState[breadcrumbsState.length - 1]?.id || "",
      };
    }

    try {
      const response = await axiosInstance.post(`/publicURL-version-upload`, data, {
        withCredentials: true, // Include credentials in the request
      });
      if (response) {
        console.log(response.data);
        setYoutubeLink("");
        setYoutubeLinkName("");
        setYoutubeLinkDescription("");
        toast.success("Url Upload Successfully");
        setYoutubeLinkModal(false);
        // setSelectedCRM("");
        // setDriveSelection(false);
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: data.folder_id,
            baseURL: baseURL,
            organisation_id,
          })
        );
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsYoutubeLink(false);
      setIsUploadYoutubeLink(false);
      onClose();
    }
  };

  const handleUploadMicrosoftStreamLink = async () => {
    if (!microsoftStreamLink || !microsoftStreamLinkName || !microsoftStreamLinkDescription) {
      setAllowUploadMicrosoftStreamLink(false);
      toast.error("Please fill in all fields");
      return;
    }

    if (!isValidMicrosoftStreamUrl(microsoftStreamLink)) {
      toast.error("Please enter a valid Microsoft Stream URL");
      return;
    }

    setIsMicrosoftStreamLink(true);
    setIsUploadMicrosoftStreamLink(true);

    let data = {
      publicURL: microsoftStreamLink, // Using the converted embed link
      url_name: microsoftStreamLinkName,
      description: microsoftStreamLinkDescription,
      created_by: viewer_id,
      source: "Microsoft Stream",
      version_parent:selectedItemId,
    };

    if (directContentUpload) {
      data = {
        ...data,
        direct_pitch_content: 1,
      };
    } else {
      data = {
        ...data,
        folder_id: breadcrumbsState[breadcrumbsState.length - 1]?.id || "",
      };
    }

    try {
      const response = await axiosInstance.post(`/publicURL-version-upload`, data, {
        withCredentials: true, // Include credentials in the request
      });
      if (response) {
        console.log(response.data);
        setMicrosoftStreamLink("");
        setMicrosoftStreamLinkName("");
        setMicrosoftStreamLinkDescription("");
        toast.success("Url Upload Successfully");
        setMicrosoftStreamLinkModal(false);
        // setSelectedCRM("");
        // setDriveSelection(false);
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: data.folder_id,
            baseURL: baseURL,
            organisation_id,
          })
        );
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsMicrosoftStreamLink(false);
      setIsUploadMicrosoftStreamLink(false);
      onClose();
    }
  };

  const handleUploadCanvaLink = async () => {
    if (!canvaLink || !canvaLinkName || !canvaLinkDescription) {
      setAllowUploadCanvaLink(false);
      toast.error("Please fill in all fields");
      return;
    }

    if (!isValidCanvaUrl(canvaLink)) {
      toast.error("Please enter a valid Canva URL");
      return;
    }

    setIsCanvaLink(true);
    setIsUploadCanvaLink(true);

    let data = {
      publicURL: canvaLink, // Using the converted embed link
      url_name: canvaLinkName,
      description: canvaLinkDescription,
      created_by: viewer_id,
      source: "Canva Link",
      version_parent:selectedItemId,
    };

    if (directContentUpload) {
      data = {
        ...data,
        direct_pitch_content: 1,
      };
    } else {
      data = {
        ...data,
        folder_id: breadcrumbsState[breadcrumbsState.length - 1]?.id || "",
      };
    }

    try {
      const response = await axiosInstance.post(`/publicURL-version-upload`, data, {
        withCredentials: true, // Include credentials in the request
      });
      if (response) {
        console.log(response.data);
        setCanvaLink("");
        setCanvaLinkName("");
        setCanvaLinkDescription("");
        toast.success("Url Upload Successfully");
        setCanvaLinkModal(false);
        // setSelectedCRM("");
        // setDriveSelection(false);
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: data.folder_id,
            baseURL: baseURL,
            organisation_id,
          })
        );
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setIsCanvaLink(false);
      setIsUploadCanvaLink(false);
      onClose();
    }
  };

  const handleUploadVimeoLink = async () => {
    if (!vimeoLink || !vimeoLinkName || !vimeoLinkDescription) {
      setAllowUploadVimeoLink(false);
      toast.error("Please fill in all fields");
      return;
    }

    if (!isValidVimeoUrl(vimeoLink)) {
      toast.error("Please enter a valid Vimeo URL");
      return;
    }

    setIsVimeoLink(true);

    const embedLink = convertToVimeoEmbed(vimeoLink);

    let data = {
      publicURL: embedLink, // Using the converted embed link
      url_name: vimeoLinkName,
      description: vimeoLinkDescription,
      created_by: viewer_id,
      source: "vimeo",
      version_parent:selectedItemId,
    };

    if (directContentUpload) {
      data = {
        ...data,
        direct_pitch_content: 1,
      };
    } else {
      data = {
        ...data,
        folder_id: breadcrumbsState[breadcrumbsState.length - 1]?.id || "",
      };
    }

    try {
      const response = await axiosInstance.post(`/publicURL-version-upload`, data, {
        withCredentials: true,
      });
      if (response) {
        setVimeoLink("");
        setVimeoLinkName("");
        setVimeoLinkDescription("");
        toast.success("Url Upload Successfully");
        setVimeoLinkModal(false);
        // setSelectedCRM("");
        // setDriveSelection(false);
        dispatch(
          fetchContentsAsync({
            viewer_id,
            folder_id: data.folder_id,
            baseURL: baseURL,
            organisation_id,
          })
        );
      }
    } catch (error) {
      console.error(error.message);
      toast.error("Failed to upload Vimeo link");
    } finally {
      setIsVimeoLink(false);
      onClose();
    }
  };


  return (
    <div
      className={`fixed inset-0 z-50 bg-gray-600 bg-opacity-50 flex justify-center items-center`}
    >
         {console.log("====versionupload value ",localStorage.getItem("versionUpload"))}
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-lg shadow-lg w-[800px]"
        style={{ minHeight: "400px", maxHeight: "80vh", overflowY: "auto" }}
      >
        <h2 className="text-xl font-bold mb-4">Upload New Version</h2>
        <div className="flex flex-col items-center mt-4">
          <div className="grid grid-cols-2 gap-4 w-full">
            {uploadMethods.map((drive, index) => (
              <div
                key={index}
                onClick={() => handleUploadMethodClick(drive.name)}
                className={`flex justify-start items-center p-4 gap-3 rounded-lg cursor-pointer transition-colors border ${selectedDrive === drive.name ? "bg-gray-300" : "hover:bg-gray-100 border-gray-300"
                  }`}
              >

                <drive.icon className="h-6 w-6" />

                <span className="text-lg whitespace-nowrap">{drive.name}</span>


                {/* In case of One Drive */}


                {drive.name === "One Drive" && selectedDrive === "One Drive" && (
                  <div className="flex items-center justify-end ml-[80px] gap-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300 mr-2 whitespace-nowrap">
                      {syncMessageOneD}
                    </span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        onChange={handleSourceSyncOneDChange}
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-[#044a7b] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                )}


                {/* in case of google drive  */}
                {drive.name === "Google Drive" && selectedDrive === "Google Drive" && (
                  <div className="flex items-center justify-end ml-[80px] gap-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-300 mr-2 whitespace-nowrap">
                      {syncMessageGD}
                    </span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        onChange={handleSourceSyncGDChange}
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-[#044a7b] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                )}




                {/* In case of Dropbox */}
                {drive.name === "DropBox" && selectedDrive === "DropBox" && (
                  <div className="flex items-center ml-6 gap-1">
                   
                  </div>
                )}

                {drive.name === "Public URL" && selectedDrive === "Public URL" && (
                  <div className="flex items-center ml-6 gap-1">
                   
                  </div>
                )}

                {drive.name === "Local Drive" && selectedDrive === "Local Drive" && (
                  <div className="flex items-center ml-6 gap-1">
                    
                  </div>
                )}

                {drive.name === "Youtube" && selectedDrive === "Youtube" && (
                  <div className="flex items-center ml-6 gap-1">
                   

                  </div>
                )}

                {drive.name === "Vimeo" && selectedDrive === "Vimeo" && (
                  <div className="flex items-center ml-6 gap-1">
                    
                  </div>
                )}

                {drive.name === "Microsoft Stream" && selectedDrive === "Microsoft Stream" && (
                  <div className="flex items-center ml-6 gap-1">
                    
                  </div>
                )}

                {drive.name === "Canva" && selectedDrive === "Canva" && (
                  <div className="flex items-center ml-6 gap-1">
                    
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

         {/* Conditionally render the TenantSelection component */}
         {displayTenantChoice && (
                   <div className="relative z-[99]">
                    {console.log("display tenent selection modal:",displayTenantChoice)}
                     <TenantSelection
                        // Pass necessary props to TenantSelection
                        // For example:
                        nameSpacesList={nameSpacesList} // Ensure this is defined in your component
                        handleOneDriveAuthorize={handleOneDriveAuthorize} // Ensure this is defined in your component
                        setNameSpace={setNameSpace} // Ensure this is defined in your component
                        nameSpace={nameSpace} // Ensure this is defined in your component
                        setDisplayTenantChoice={setDisplayTenantChoice} // Control visibility
                        handleNamespaceSelection={handleNamespaceSelection} // Ensure this is defined in your component
                    />

                   </div>
                )}

        {showLocalUpload && (
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" // Hide the file input
              accept=".pdf,.doc,.docx,.txt,.jpeg,.png" // Accept specific file types
            />

            <div className="flex w-full flex-col gap-2 mt-4">
              {/* Display the chosen file name */}
              <div className="flex ml-1 mb-1 overflow-hidden h-[30px]">
                {fileName && (
                  <div className="text-xs flex flex-row items-center border border-cyan-100 px-2 py-1 rounded-md bg-cyan-50 text-cyan-800">
                    <p className="font-medium text-[15px] p-1">File name:</p>
                    <span className="ml-1 text-[15px]">{fileName}</span>
                  </div>
                )}
              </div>

              <div className="flex w-full justify-between items-center gap-4 mt-4">

              <button
                  className="flex w-40 h-[35px] px-16 text-sm justify-center items-center rounded-xl border border-solid border-red-500 bg-red-300 hover:bg-red-200 text-red-800"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    "btn-primary relative flex items-center justify-center w-40 h-[35px]"
                  }
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
               
              </div>
            </div>
          </form>
        )}





        {/* Render buttons for OneDrive and Google Drive */}
        {!showLocalUpload && showAuthorizeButton && !showNextButton && (

          <div className="flex justify-between items-center gap-4 mt-11">
            <button
              className="flex w-40 h-[35px] px-16 text-sm justify-center items-center rounded-xl border border-solid border-red-500 bg-red-300 hover:bg-red-200 text-red-800"
              onClick={handleCancel}
            >
              Cancel
            </button>

            {selectedDrive === "One Drive" && (
              <button
                className="btn-primary relative flex items-center justify-center w-40 h-[35px]"
                onClick={handleOneDriveAuthorize}
              >
                Authorize
              </button>
            )}
            {selectedDrive === "Google Drive" && (
              <button
                className="btn-primary relative flex items-center justify-center w-40 h-[35px]"
                onClick={handleGoogleDriveAuthorize}
              >
                Authorize
              </button>
            )}
            {selectedDrive === "DropBox" && (
              <button
                className="btn-primary relative flex items-center justify-center w-40 h-[35px]"
                onClick={handleDropBoxAuthorize}
              >
                Authorize
              </button>
            )}

          </div>
        )}

{showNextButton && (
  <div className="flex justify-between items-center gap-4 mt-11">
    <button
      className="flex w-40 h-[35px] px-16 text-sm justify-center items-center rounded-xl border border-solid border-red-500 bg-red-300 hover:bg-red-200 text-red-800"
      onClick={handleCancel} // Define the handleCancel function to handle the cancel action
    >
      Cancel
    </button>
    <button
      className="btn-primary relative flex items-center justify-center w-40 h-[35px]"
      onClick={() => {
        if (selectedDrive === "Public URL") {
          setLinkUploadModal(true); // Open the public link modal
        } else if (selectedDrive === "Youtube") {
          setYoutubeLinkModal(true); // Open the YouTube link modal
        } else if (selectedDrive === "Vimeo") {
          setVimeoLinkModal(true); // Open the Vimeo link modal
        } else if (selectedDrive === "Canva") {
          setCanvaLinkModal(true); // Open the Canva link modal
        } else if (selectedDrive === "Microsoft Stream") {
          setMicrosoftStreamLinkModal(true); // Open the Stream link modal
        }       
      }} // Define the handleNext function to handle the next step
    >
      Next
    </button>
  </div>
)}

{linkUploadModal && (
      <div
      div
      className="fixed inset-0 flex items-center justify-center z-[40]"
    >
      <div className="absolute inset-0 bg-gray-800 dark:bg-gray-900 opacity-50"></div>
      <div className="bg-white dark:bg-gray-800 p-6 z-[41] w-full rounded-lg max-w-lg">
        <div className="space-y-6">
          <div className="flex relative items-center justify-center">
            <h3 className="text-2xl font-semibold text-center text-neutral-800 dark:text-gray-200">
              Add Public URL
            </h3>
            <button
              type="button"
              className="absolute right-0 text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
              onClick={() => setLinkUploadModal(false)}
            >
              <FontAwesomeIcon
                className="text-neutral-700 dark:text-gray-300 text-2xl"
                icon={faXmark}
              />
            </button>
          </div>
          <div className="bg-orange-100 dark:bg-yellow-900 border text-sm p-2 relative rounded-md border-orange-200 dark:border-yellow-700 text-orange-600 dark:text-yellow-300">
            <span className="font-semibold">Warning:</span> Some URLs may not
            render properly in iframes due to security restrictions set by the
            website owners. Please ensure the URL allows embedding in iframes
            for the best experience.
          </div>
          <div className="space-y-4">
            {[
              { label: "Name", value: linkName, onChange: setLinkName },
              {
                label: "Description",
                value: linkDescription,
                onChange: setLinkDescription,
              },
              {
                label: "Public URL",
                value: link,
                onChange: setLink,
                type: "url",
              },
            ].map((field) => (
              <div key={field.label} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="p-2 outline-none bg-neutral-100 dark:bg-gray-700 border border-neutral-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 dark:placeholder:text-gray-500 text-neutral-800 dark:text-gray-200 focus:border-blue-500"
                  required
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <button
              className="px-6 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
              onClick={() => setLinkUploadModal(false)}
            >
              Back
            </button>
            <button
              className="px-6 py-2 flex items-center justify-center text-sm text-white btn-secondary dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors w-[96px] h-[38px]"
              onClick={handleUploadLink}
            >
              {isUploadLink ? (
                <LuLoaderCircle className="animate-spin" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
)}

{youtubeLinkModal && (
      <div className="fixed inset-0 flex items-center justify-center z-[40]">
      <div className="absolute inset-0 bg-gray-800 dark:bg-gray-900 opacity-50"></div>
      <div className="bg-white dark:bg-gray-800 p-6 z-[41] w-full rounded-lg max-w-lg">
        <div className="space-y-6">
          <div className="flex relative items-center justify-center">
            <h3 className="text-2xl font-semibold text-center text-neutral-800 dark:text-gray-200">
              Add Youtube Link
            </h3>
            <button
              type="button"
              className="absolute right-0 text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
              onClick={() => setYoutubeLinkModal(false)}
            >
              <FontAwesomeIcon
                className="text-neutral-700 dark:text-gray-300 text-2xl"
                icon={faXmark}
              />
            </button>
          </div>
          <div className="bg-orange-100 dark:bg-yellow-900 border text-sm p-2 relative rounded-md border-orange-200 dark:border-yellow-700 text-orange-600 dark:text-yellow-300">
            <span className="font-semibold">Warning:</span> Some URLs may not
            render properly in iframes due to security restrictions set by the
            website owners. Please ensure the URL allows embedding in iframes
            for the best experience.
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Name",
                value: youtubeLinkName,
                onChange: setYoutubeLinkName,
              },
              {
                label: "Description",
                value: youtubeLinkDescription,
                onChange: setYoutubeLinkDescription,
              },
              {
                label: "Youtube Link",
                value: youtubeLink,
                onChange: setYoutubeLink,
                type: "url",
              },
            ].map((field) => (
              <div key={field.label} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="p-2 outline-none bg-neutral-100 dark:bg-gray-700 border border-neutral-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 dark:placeholder:text-gray-500 text-neutral-800 dark:text-gray-200 focus:border-blue-500"
                  required
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <button
              className="px-6 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
              onClick={() => setYoutubeLinkModal(false)}
            >
              Back
            </button>
            <button
              className="px-6 py-2 flex items-center justify-center text-sm text-white btn-secondary dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors w-[96px] h-[38px]"
              onClick={handleUploadYoutubeLink}
            >
              {isUploadYoutubeLink ? (
                <LuLoaderCircle className="animate-spin" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
)}

{canvaLinkModal && (
      <div className="fixed inset-0 flex items-center justify-center z-[40]">
      <div className="absolute inset-0 bg-gray-800 dark:bg-gray-900 opacity-50"></div>
      <div className="bg-white dark:bg-gray-800 p-6 z-[41] w-full rounded-lg max-w-lg">
        <div className="space-y-6">
          <div className="flex relative items-center justify-center">
            <h3 className="text-2xl font-semibold text-center text-neutral-800 dark:text-gray-200">
              Add Canva Link or Embed Code
            </h3>
            <button
              type="button"
              className="absolute right-0 text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
              onClick={() => setCanvaLinkModal(false)}
            >
              <FontAwesomeIcon
                className="text-neutral-700 dark:text-gray-300 text-2xl"
                icon={faXmark}
              />
            </button>
          </div>
          <div className="bg-orange-100 dark:bg-yellow-900 border text-sm p-2 relative rounded-md border-orange-200 dark:border-yellow-700 text-orange-600 dark:text-yellow-300">
            <span className="font-semibold">Warning:</span> Canva
          links should be accessible via browser or embedded apps.
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Name",
                value: canvaLinkName,
                onChange: setCanvaLinkName,
              },
              {
                label: "Description",
                value: canvaLinkDescription,
                onChange: setCanvaLinkDescription,
              },
              {
                label: "Canva Link",
                value: canvaLink,
                onChange: setCanvaLink,
                type: "url",
              },
            ].map((field) => (
              <div key={field.label} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="p-2 outline-none bg-neutral-100 dark:bg-gray-700 border border-neutral-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 dark:placeholder:text-gray-500 text-neutral-800 dark:text-gray-200 focus:border-blue-500"
                  required
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <button
              className="px-6 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
              onClick={() => setCanvaLinkModal(false)}
            >
              Back
            </button>
            <button
              className="px-6 py-2 flex items-center justify-center text-sm text-white btn-secondary dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors w-[96px] h-[38px]"
              onClick={handleUploadCanvaLink}
            >
              {isUploadYoutubeLink ? (
                <LuLoaderCircle className="animate-spin" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
)}

{microsoftStreamLinkModal && (
  <div className="fixed inset-0 flex items-center justify-center z-[40]">
    <div className="absolute inset-0 bg-gray-800 dark:bg-gray-900 opacity-50"></div>
    <div className="bg-white dark:bg-gray-800 p-6 z-[41] w-full rounded-lg max-w-lg">
      <div className="space-y-6">
        <div className="flex relative items-center justify-center">
          <h3 className="text-2xl font-semibold text-center text-neutral-800 dark:text-gray-200">
            Add Microsoft Stream Embed
          </h3>
          <button
            type="button"
            className="absolute right-0 text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
            onClick={() => setMicrosoftStreamLinkModal(false)}
          >
            <FontAwesomeIcon
              className="text-neutral-700 dark:text-gray-300 text-2xl"
              icon={faXmark}
            />
          </button>
        </div>
        <div className="bg-orange-100 dark:bg-yellow-900 border text-sm p-2 relative rounded-md border-orange-200 dark:border-yellow-700 text-orange-600 dark:text-yellow-300">
          <span className="font-semibold">Note:</span> Microsoft Stream
          embed codes should be accessible via browser or embedded apps.
        </div>
        <div className="space-y-4">
          {[
            {
              label: "Name",
              value: microsoftStreamLinkName,
              onChange: setMicrosoftStreamLinkName,
            },
            {
              label: "Description",
              value: microsoftStreamLinkDescription,
              onChange: setMicrosoftStreamLinkDescription,
            },
            {
              label: "Microsoft Teams Embed code",
              value: microsoftStreamLink,
              onChange: setMicrosoftStreamLink,
              type: "url",
            },
          ].map((field) => (
            <div key={field.label} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.label}
              </label>
              <input
                type={field.type || "text"}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="p-2 outline-none bg-neutral-100 dark:bg-gray-700 border border-neutral-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 dark:placeholder:text-gray-500 text-neutral-800 dark:text-gray-200 focus:border-blue-500"
                required
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <button
            className="px-6 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
            onClick={() => setMicrosoftStreamLinkModal(false)}
          >
            Back
          </button>
          <button
            className="px-6 py-2 flex items-center justify-center text-sm text-white btn-secondary dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors w-[96px] h-[38px]"
            onClick={handleUploadMicrosoftStreamLink}
          >
            {isUploadMicrosoftStreamLink ? (
              <LuLoaderCircle className="animate-spin" />
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)}


{vimeoLinkModal && (
      <div className="fixed inset-0 flex items-center justify-center z-[40]">
      <div className="absolute inset-0 bg-gray-800 dark:bg-gray-900 opacity-50"></div>
      <div className="bg-white dark:bg-gray-800 p-6 z-[41] w-full rounded-lg max-w-lg">
        <div className="space-y-6">
          <div className="flex relative items-center justify-center">
            <h3 className="text-2xl font-semibold text-center text-neutral-800 dark:text-gray-200">
              Add Vimeo Link
            </h3>
            <button
              type="button"
              className="absolute right-0 text-gray-400 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
              onClick={() => setVimeoLinkModal(false)}
            >
              <FontAwesomeIcon
                className="text-neutral-700 dark:text-gray-300 text-2xl"
                icon={faXmark}
              />
            </button>
          </div>
          <div className="bg-orange-100 dark:bg-yellow-900 border text-sm p-2 relative rounded-md border-orange-200 dark:border-yellow-700 text-orange-600 dark:text-yellow-300">
            <span className="font-semibold">Warning:</span> Some URLs may not
            render properly in iframes due to security restrictions set by the
            website owners. Please ensure the URL allows embedding in iframes
            for the best experience.
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Name",
                value: vimeoLinkName,
                onChange: setVimeoLinkName,
              },
              {
                label: "Description",
                value: vimeoLinkDescription,
                onChange: setVimeoLinkDescription,
              },
              {
                label: "Vimeo Link",
                value: vimeoLink,
                onChange: setVimeoLink,
                type: "url",
              },
            ].map((field) => (
              <div key={field.label} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="p-2 outline-none bg-neutral-100 dark:bg-gray-700 border border-neutral-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-neutral-100 transition-all rounded-lg placeholder:text-neutral-400 dark:placeholder:text-gray-500 text-neutral-800 dark:text-gray-200 focus:border-blue-500"
                  required
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <button
              className="px-6 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
              onClick={() => setVimeoLinkModal(false)}
            >
              Back
            </button>
            <button
              className="px-6 py-2 flex items-center justify-center text-sm text-white btn-secondary dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg transition-colors w-[96px] h-[38px]"
              onClick={handleUploadVimeoLink}
            >
              {isVimeoLink ? (
                <LuLoaderCircle className="animate-spin" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
)}


        {/* Show Cancel button when no upload method is selected */}
        {!showLocalUpload && !showAuthorizeButton && !showNextButton && (
          <div className="flex flex-col items-center mt-4">
            <p className="text-gray-500 mb-2">
              Please select an upload method.
            </p>{" "}
            {/* Optional message */}
            <button
              className="flex w-40 h-[35px] px-16 text-sm justify-center items-center rounded-xl border border-solid border-red-500 bg-red-300 hover:bg-red-200 text-red-800"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Prop validation
VersionUploadModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default VersionUploadModal;
