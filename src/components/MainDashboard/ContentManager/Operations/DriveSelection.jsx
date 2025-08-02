import React, { useRef, useState, useEffect, useContext } from "react";
import onedrive from "../../../../assets/onedrive.svg";
import googleDrive from "../../../../assets/google-drive.svg";
import localDrive from "../../../../assets/upload.svg";
import link from "../../../../assets/link.svg";
import AddContent from "./AddContent.jsx";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import toast from "react-hot-toast";
import TenantSelection from "./TenantSelection.jsx";
import { useSelector, useDispatch } from "react-redux";
import { fetchContentsAsync } from "../../../../features/content/contentSlice.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useCookies } from "react-cookie";
import useOutsideClick from "../../../../hooks/useOutsideClick.js";
import { LuLoaderCircle } from "react-icons/lu";
import OneDriveLogo from "../../../../assets/OneDrive-Logo.wine.svg";
import GoogleDriveLogo from "../../../../assets/google-drive.svg";
import DropBoxLogo from "../../../../assets/DropBoxLogo.svg";
import CanvaLogo from "../../../../assets/canva.svg";
import MicrosoftStreamLogo from "../../../../assets/MicrosoftStreamLogo.png";

import { LiaGoogleDrive } from "react-icons/lia";
import {
  faExclamationTriangle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { LuUpload } from "react-icons/lu";
import { IoLinkSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { SiVimeo } from "react-icons/si";
import { SiYoutube } from "react-icons/si";
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

const drives = [
  {
    name: "One Drive",
    icon: (props) => (
      <img
        src={OneDriveLogo}
        alt="One Drive Logo"
        {...props}
        className={`${props.className} h-8 w-8`}
      />
    ),
  },
  {
    name: "Google Drive",
    icon: (props) => (
      <img
        src={GoogleDriveLogo}
        alt="Google Drive Logo"
        {...props}
        className={`${props.className} h-6 w-6`}
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
        className={`${props.className} h-6 w-6`}
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
    name: "Vimeo Link",
    icon: (props) => <SiVimeo {...props} className="text-[#1AB7EA] text-3xl" />,
  },
  { name: "Local Drive", icon: LuUpload },
  { name: "Public Link", icon: IoLinkSharp },
];

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

const isValidCanvaUrl = (input) => {
  if (!input || typeof input !== 'string') return null;

  let url = input.trim();

  // If it's an HTML block, extract <iframe src="">
  const iframeSrcMatch = url.match(/<iframe[^>]+src="([^"]+)"/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    url = iframeSrcMatch[1]; // extracted iframe src
  }

  // Validate and normalize Canva design link
  const canvaRegex = /^https?:\/\/(www\.)?canva\.com\/design\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)\/(view|edit)(\?.*)?$/i;
  const match = url.match(canvaRegex);
  if (!match) return null;

  const designId = match[2];
  const token = match[3];

  // Construct clean embed URL
  return `https://www.canva.com/design/${designId}/${token}/view?embed`;
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

function DriveSelection({
  setContentPlaceHolders,
  setContentPlaceHolderModal,
  driveSelection,
}) {
  const [selectedCRM, setSelectedCRM] = useState("");
  const breadcrumb = useSelector((state) => state.contents.breadcrumbs);
  const dispatch = useDispatch();
  const {
    setDriveSelection,
    baseURL,
    viewer_id,
    frontendBaseURL,
    folder_id,
    setOneDrivePickerOpen,
    setDropBoxPickerOpen,
    selectedOrganisationId,
    directContentUpload,
    setDirectContentUpload,
    onedriveTenantRestrict,
    setDisableDefaultNavigation,
    setActiveTab,
    organisationDetails,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const [cookies, setCookie, removeCookie] = useCookies([
    "OneDriveAccessToken",
    "GoogleDirveAccessToken",
    "DropBoxAccessToken",
    "userData",
  ]);

  const organisation_id = cookies.userData?.organisation?.id;

  const fileUpload = useRef(); // Reference to the file input in AddContent component
  const [isLoading, setIsLoading] = useState(false);
  const [isOneDriveSync, setIsOneDriveSync] = useState(false);
  const [isGoogleDriveSync, setIsGoogleDriveSync] = useState(false); // New state for Google Drive sync
  const [isDropBoxSync, setIsDropBoxSync] = useState(false);

  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);

  const currentFolder =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
  const folderId = currentFolder ? currentFolder.id : folder_id || "";

  const breadcrumbsState = useSelector((state) => state.contents.breadcrumbs);
  const [gdriveApiKey, setGdriveApiKey] = useState("");
  const [gdriveClientID, setGdriveClientID] = useState("");
  const [dropBoxAppKey, setDropBoxAppKey] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);
  const [pickerInited, setPickerInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [nameSpace, setNameSpace] = useState("");
  const [nameSpacesList, setNameSpacesList] = useState([]);
  const [displayTenantChoice, setDisplayTenantChoice] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [allowUploadLink, setAllowUploadLink] = useState(true);
  const [isUploadLink, setIsUploadLink] = useState(false);
  const [isYoutubeLink, setIsYoutubeLink] = useState(false);
  const [isMicrosoftStreamLink, setIsMicrosoftStreamLink] = useState(false);
  const [isCanvaLink, setIsCanvaLink] = useState(false);

  const [isVimeoLink, setIsVimeoLink] = useState(false);
  const [displayMessage, setDisplayMessage] = useState(false);
  // const folder_id = breadcrumbs[breadcrumbs.length - 1]?.id || null;

  const [linkUploadModal, setLinkUploadModal] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [link, setLink] = useState("");

  const [youtubeLinkModal, setYoutubeLinkModal] = useState(false);
  const [youtubeLinkName, setYoutubeLinkName] = useState("");
  const [youtubeLinkDescription, setYoutubeLinkDescription] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");

  const [canvaLinkModal, setCanvaLinkModal] = useState(false);
  const [canvaLinkName, setCanvaLinkName] = useState("");
  const [canvaLinkDescription, setCanvaLinkDescription] = useState("");
  const [canvaLink, setCanvaLink] = useState("");

  const [microsoftStreamLinkModal, setMicrosoftStreamLinkModal] = useState(false);
  const [microsoftStreamLinkName, setMicrosoftStreamLinkName] = useState("");
  const [microsoftStreamLinkDescription, setMicrosoftStreamLinkDescription] = useState("");
  const [microsoftStreamLink, setMicrosoftStreamLink] = useState("");

  const [vimeoLinkModal, setVimeoLinkModal] = useState(false);
  const [vimeoLinkName, setVimeoLinkName] = useState("");
  const [vimeoLinkDescription, setVimeoLinkDescription] = useState("");
  const [vimeoLink, setVimeoLink] = useState("");

  const [sourceSync, setSourceSync] = useState(true); // Default to true
  const navigate = useNavigate();

  const [allowUploadYoutubeLink, setAllowUploadYoutubeLink] = useState(true);
  const [isUploadYoutubeLink, setIsUploadYoutubeLink] = useState(false);

  const [allowUploadCanvaLink, setAllowUploadCanvaLink] = useState(true);
  const [isUploadCanvaLink, setIsUploadCanvaLink] = useState(false);

  const [allowUploadMicrosoftStreamLink, setAllowUploadMicrosoftStreamLink] = useState(true);
  const [isUploadMicrosoftStreamLink, setIsUploadMicrosoftStreamLink] = useState(false);

  const [allowUploadVimeoLink, setAllowUploadVimeoLink] = useState(true);
  const [isUploadVimeoLink, setIsUploadVimeoLink] = useState(false);

  const [oneDriveTenantRestriction, setOneDriveTenantRestriction] =
    useState(null);
  // console.log("One Drive tentat resitction in drive sleection:",oneDriveTenantRestriction);
  const breadcrumbsRef = useRef(breadcrumbs);

  useEffect(() => {
    localStorage.setItem("versionUpload", 0); // Set versionUpload to 0 when the modal opens
    // localStorage.setItem("source_sync", 1); // Set source_sync to 1 by default
    // return () => {
    //   localStorage.setItem("source_sync", 1); // Reset source_sync to 1 when the modal closes
    // };
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
    console.log("One Drive tenant restriction", oneDriveTenantRestriction);
  }, []);

  // Function to extract the domain from a URL
  const extractDomain = (url) => {
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
    } catch (error) {
      console.error("Invalid URL", error);
      return null;
    }
  };

  useEffect(() => {
    breadcrumbsRef.current = breadcrumbs;
  }, [breadcrumbs]);

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
          localStorage.setItem("nameSpace", response.data.data[0].namespace);
          setNameSpacesList(response.data.data);
        }
        setNameSpacesList(response.data.data);
      })
      .catch((error) => {
        console.error("Failed to fetch namespace", error);
      });
    console.log("Namespace lsits here  ==> ", nameSpacesList);
  }, [viewer_id]);

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
      console.error(
        "Error starting OneDrive authentication with namespace:",
        error
      );
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
      console.error(
        "Error starting OneDrive authentication without namespace:",
        error
      );
    }
  };

  const handleOneDriveAuthorize = async () => {
    setIsLoading(true);
    try {
      console.log("onedrive authorize");
      localStorage.setItem("versionUpload", 0);
      const accessToken = cookies.OneDriveAccessToken;
      const refreshToken = cookies.refreshToken;
      let nameSpace = cookies.nameSpace || localStorage.getItem("nameSpace");

      console.log("==== nameSpace value is ==", nameSpace);

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
          const syncToast = toast.loading("One Drive File Sync initiated...");
          axiosInstance
            .post(
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
            )
            .then((response) => {
              console.log("===Onedrive files sync status", response.status);
              console.log(" ===response of the onedrive file sync ", response);
              toast.success("One Drive File Sync completed");
            })
            .catch((error) => {
              console.error("Error during OneDrive sync:", error);
              toast.error("Error during OneDrive sync.");
            })
            .finally(() => {
              toast.dismiss(syncToast);
            });
        }

        // Open the OneDrive picker after ensuring sync
        setOneDrivePickerOpen(true);
      } else if (
        oneDriveTenantRestriction === false ||
        oneDriveTenantRestriction === 0
      ) {
        console.log("onedriveTenantRestrict === 0 || false ");
        await handleOneDriveAuthWithoutNamespace();
      } else if (
        oneDriveTenantRestriction === true ||
        oneDriveTenantRestriction === 1
      ) {
        console.log("onedriveTenantRestrict === 1 || true");
        console.log("NameSpaces List :", nameSpacesList);
        // now check for namespace
        if (nameSpacesList.length > 1) {
          console.log("==Multiple namespaces available===");
          setDisplayTenantChoice(true);
          // in this case we will call the handleNameSpaceSelection which is called from the tenentSelection
        } else if (nameSpacesList.length === 1) {
          console.log("==Only one namespace available ==");
          await handleOneDriveAuthWithNamespace(nameSpacesList[0].namespace);
        } else if (nameSpacesList.length == 0) {
          toast.error("Please create a namsespace or tenant");
          // window.location.href = "https://dev.revspire.io/user/organisation";
        }
      } else {
        toast.error("Please go to onedrive tab in organisation and try again");
        console.error("Get the tenant restriction");
        // window.location.href = "https://dev.revspire.io/user/organisation";
      }
    } catch (error) {
      console.error("OneDrive authorization error:", error);
      toast.error("Error during OneDrive authorization.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle namespace selection from TenantSelection
  const handleNamespaceSelection = (namespace) => {
    setNameSpace(namespace); // Set the selected namespace

    handleOneDriveAuthWithNamespace(namespace); // Call the auth function with the selected namespace
    setDisplayTenantChoice(false); // Close the tenant selection modal
  };

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

  //Accepts accessToken to open google drive picker
  const createPicker = (token) => {
    setDriveSelection(false);
    if (pickerInited && gisInited && token) {
      const view = new window.google.picker.DocsView(
        window.google.picker.ViewId.DOCS
      )
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true);

      const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setOAuthToken(token)
        .addView(view)
        .setDeveloperKey(gdriveApiKey)
        .setCallback((data) => pickerCallback(data, token))
        .build();
      picker.setVisible(true);
    }
  };

  //Picker callback to upload picked file to our database
  const pickerCallback = async (data, token) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const source_sync = localStorage.getItem("source_sync");
      const fileIDs = data.docs.map((doc) => doc.id);
      console.log("fileIDs: ", fileIDs);

      setDriveSelection(false);

      toast
        .promise(
          axiosInstance.post(`/googledrive-upload`, {
            fileIDs: fileIDs,
            created_by: viewer_id,
            accessToken: token,
            folder_id: folderId,
            ...(source_sync == 0 && { source_sync: source_sync }),
          }),
          {
            loading: "Uploading file...",
            success: "Content Added Successfully!",
            error: "Failed to Add Some Content",
          }
        )
        .then((response) => {
          // Check for placeholders in the uploaded files
          const results = response.data.results;
          const contentPlaceHolder = results.filter(
            (file) => file.placeholders && file.placeholders.length > 0
          );
          if (contentPlaceHolder.length > 0) {
            setContentPlaceHolderModal(true);
            setContentPlaceHolders(contentPlaceHolder);
          }

          // Check if the user is still in the same folder
          // const currentFolder =
          //   breadcrumbsRef.current.length > 0
          //     ? breadcrumbsRef.current[breadcrumbsRef.current.length - 1]
          //     : null;
          // const folderId = currentFolder ? currentFolder.id : folder_id || "";
          console.log(
            "CONDITIONSSSS::::::",
            breadcrumbsRef.current[breadcrumbsRef.current.length - 1]?.id,
            folderId
          );
          if (
            breadcrumbsRef.current[breadcrumbsRef.current.length - 1]?.id ===
            folderId
          ) {
            dispatch(
              fetchContentsAsync({
                viewer_id,
                folder_id: folderId,
                baseURL: baseURL,
                organisation_id,
              })
            );
          }
        })
        .catch((error) => {
          console.error("Google Drive upload error:", error);
        });
    }
  };
  // console.log(
  //   "FOLDER IDD:::::::::::::::",
  //   breadcrumbs[breadcrumbs.length - 1]?.id,
  //   breadcrumbsRef.current[breadcrumbsRef.current.length - 1]?.id
  // );
  const handleGoogleDriveAuthorize = async () => {
    console.log("FOLDER ID here", folderId);
    setIsLoading(true);
    // Cookies.set("FolderID", folder_id);
    try {
      const accessToken = cookies.GoogleDirveAccessToken;

      const response = await axiosInstance.post("/google-credentials", {
        viewer_id: viewer_id,
      });

      if (
        !accessToken &&
        response.data.message === "Google credentials generated successfully"
      ) {
        const { googleClientId, googleDriveRedirectUrl } = response.data;

        removeCookie("googleClientId");

        // Set cookies for googleClientId and googleApiKey, accessible across all subdomains
        setCookie("googleClientId", googleClientId, {
          path: "/",
          domain: ".revspire.io", // Makes the cookie available across all subdomains of revspire.io
          secure: true,
          sameSite: "Lax",
        });

        // Get the current URL and extract the domain part
        const currentPath = window.location.href;
        const domain = extractDomain(currentPath); // Extract domain from the current path
        // Convert breadcrumbsState array to a JSON string and encode it
        const encodedBreadcrumbsState = encodeURIComponent(
          JSON.stringify(breadcrumbsState)
        );

        // Construct the redirect URL with the current path and encoded breadcrumbsState as parameters
        const redirectUrl = `${googleDriveRedirectUrl}?redirectDomain=${encodeURIComponent(
          domain
        )}&breadcrumbState=${encodedBreadcrumbsState}`;

        window.location.href = redirectUrl;
      } else {
        if (gdriveClientID) {
          axiosInstance
            .post("/googledrive-file-sync", { accessToken })
            .catch((error) => {
              console.error(
                "File sync failed, but continuing with picker:",
                error
              );
            })
            .finally(() => {
              // Create picker regardless of API call success/failure
              if (gdriveClientID) {
                createPicker(accessToken);
              }
            });
        }
      }
    } catch (error) {
      console.error("Google Drive authorization error:", error);
      toast.error("Error during Google Drive authorization.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDropBoxAuthorize = async () => {
    setIsLoading(true);
    try {
      // Fetch Dropbox API Key dynamically
      const credentialsResponse = await axiosInstance.post(
        "/dropbox-credentials",
        {}
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
          setDriveSelection(false);

          const options = {
            success: async (files) => {
              const fileLinks = files.map((file) => file.link);
              const postData = {
                files: fileLinks,
                created_by: viewer_id, // Replace with appropriate user ID
                description: "Dropbox file upload",
                folder: folderId,
              };

              // Axios POST call to upload files to backend
              toast
                .promise(axiosInstance.post("/dropbox-upload", postData), {
                  loading: "Uploading file...", // Corrected the key to "loading"
                  success: "Content Added Successfully!",
                  error: "Failed to Add Some Content",
                })
                .then((response) => {
                  // Check for placeholders in the uploaded files
                  const uploadedFiles = response.data.uploadedFiles; // Access the uploadedFiles array
                  const contentPlaceHolder = uploadedFiles.filter(
                    (file) => file.placeholders && file.placeholders.length > 0 // Check for placeholders
                  );
                  if (contentPlaceHolder.length > 0) {
                    setContentPlaceHolderModal(true); // Show the modal
                    setContentPlaceHolders(contentPlaceHolder); // Set the placeholders
                  }
                  dispatch(
                    fetchContentsAsync({
                      viewer_id,
                      folder_id: folderId,
                      baseURL: baseURL,
                      organisation_id,
                    })
                  );
                })
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
      toast.error("Error during Dropbox authorization.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploadClick = () => {
    fileUpload.current.click();
  };

  const handleLinkUploadClick = () => {
    switch (selectedCRM) {
      case "Public Link":
        setLinkUploadModal(true);
        break;
      case "Canva":
        setCanvaLinkModal(true);
        break;
      case "Microsoft Stream":
        setMicrosoftStreamLinkModal(true);
        break;
      case "Youtube":
        setYoutubeLinkModal(true);
        break;
      case "Vimeo Link":
        setVimeoLinkModal(true);
        break;
      default:
        break;
    }
  };

  const action = () => {
    setDriveSelection(false);
  };

  const containerRef = useOutsideClick([action]);

  const renderButton = () => {
    switch (selectedCRM) {
      case "One Drive":
        return (
          <button
            className="px-6 py-2 text-sm text-white btn-secondary"
            onClick={handleOneDriveAuthorize}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? <LuLoaderCircle className="animate-spin" /> : "Authorise"}
          </button>
        );
      case "Google Drive":
        return (
          <button
            className="px-6 py-2 text-sm text-white btn-secondary"
            onClick={handleGoogleDriveAuthorize}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? <LuLoaderCircle className="animate-spin" /> : "Authorise"}
          </button>
        );
      case "DropBox":
        return (
          <button
            className="px-6 py-2 text-sm text-white btn-secondary w-[112px] flex justify-center items-center"
            onClick={handleDropBoxAuthorize}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? <LuLoaderCircle className="animate-spin" /> : "Authorise"}
          </button>
        );
      case "Local Drive":
        return (
          <button
            className="px-6 py-2 text-sm text-white btn-secondary"
            onClick={handleFileUploadClick}
          >
            Browse
          </button>
        );
      case "Public Link":
      case "Canva":
      case "Microsoft Stream":
      case "Youtube":
      case "Vimeo Link":
        return (
          <button
            className="px-6 py-2 text-sm text-white btn-secondary"
            onClick={handleLinkUploadClick}
          >
            Next
          </button>
        );
      default:
        return null;
    }
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
      const response = await axiosInstance.post(`/publicURL-upload`, data, {
        withCredentials: true, // Include credentials in the request
      });
      if (response) {
        console.log(response.data);
        setLink("");
        setLinkName("");
        setLinkDescription("");
        toast.success("Url Upload Successfully");
        setLinkUploadModal(false);
        setSelectedCRM("");
        setDriveSelection(false);
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
      source: "youtube",
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
      const response = await axiosInstance.post(`/publicURL-upload`, data, {
        withCredentials: true, // Include credentials in the request
      });
      if (response) {
        console.log(response.data);
        setYoutubeLink("");
        setYoutubeLinkName("");
        setYoutubeLinkDescription("");
        toast.success("Url Upload Successfully");
        setYoutubeLinkModal(false);
        setSelectedCRM("");
        setDriveSelection(false);
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
    }
  };

  // Funciton to upload a microosft stream link
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
      const response = await axiosInstance.post(`/publicURL-upload`, data, {
        withCredentials: true, // Include credentials in the request
      });
      if (response) {
        console.log(response.data);
        setMicrosoftStreamLink("");
        setMicrosoftStreamLinkName("");
        setMicrosoftStreamLinkDescription("");
        toast.success("Url Upload Successfully");
        setMicrosoftStreamLinkModal(false);
        setSelectedCRM("");
        setDriveSelection(false);
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
    }
  };

  // Function to upload a Canva Link
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
      const response = await axiosInstance.post(`/publicURL-upload`, data, {
        withCredentials: true, // Include credentials in the request
      });
      if (response) {
        console.log(response.data);
        setCanvaLink("");
        setCanvaLinkName("");
        setCanvaLinkDescription("");
        toast.success("Url Upload Successfully");
        setCanvaLinkModal(false);
        setSelectedCRM("");
        setDriveSelection(false);
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
      const response = await axiosInstance.post(`/publicURL-upload`, data, {
        withCredentials: true,
      });
      if (response) {
        setVimeoLink("");
        setVimeoLinkName("");
        setVimeoLinkDescription("");
        toast.success("Url Upload Successfully");
        setVimeoLinkModal(false);
        setSelectedCRM("");
        setDriveSelection(false);
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
    }
  };

  const handleSourceSyncChange = (e) => {
    const checked = e.target.checked;
    setSourceSync(checked);
    setIsOneDriveSync(!isOneDriveSync);
    localStorage.setItem("source_sync", checked ? 1 : 0); // Update local storage based on toggle state
    setIsGoogleDriveSync(!isGoogleDriveSync); // Toggle Google Drive sync state
  };

  const actions = () => {
    setDriveSelection(false);
  };

  const modalRef = useOutsideClick([actions]);
  if (linkUploadModal) {
    return (
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
    );
  }

  if (youtubeLinkModal) {
    return (
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
    );
  }

  if (microsoftStreamLinkModal) {
    return (
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
              <span className="font-semibold">Note:</span> 
              <strong> Microsoft Stream embed links are only supported for internal (Microsoft 365 authenticated) users.</strong> 
              If you need to share a video with external viewers, please import the file from OneDrive and use this on your Pitch.
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
                  label: "Microsoft Stream Embed Code",
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
    );
  }


  if (canvaLinkModal) {
    return (
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
              <span className="font-semibold">Note:</span> Only{" "}
              <strong>public view Canva links or Embed Codes</strong> will work. Private or
              restricted links will not load inside iframes.
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
                {isUploadCanvaLink ? (
                  <LuLoaderCircle className="animate-spin" />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (vimeoLinkModal) {
    return (
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
    );
  }

  const navigateToOrganisation = () => {
    setDisableDefaultNavigation(true);
    navigate("/user/organisation");
    setActiveTab("onedrive");
    setDriveSelection(false);
    // setDisableDefaultNavigation(false);
  };

  const CrmCLicked = (CrmName) => {
    setSelectedCRM(CrmName);
    if (CrmName == "One Drive" || CrmName == "Google Drive") {
      localStorage.setItem("source_sync", 1);
    }
  };

  const renderDriveOptions = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        {drives.map((drive) => (
          <div
            key={drive.name}
            className={`flex justify-center items-center p-4 gap-3 rounded-lg cursor-pointer transition-colors border ${
              selectedCRM === drive.name
                ? "bg-cyan-100 dark:bg-cyan-900 border-cyan-200 dark:border-cyan-800"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700"
            }`}
            onClick={() => CrmCLicked(drive.name)}
          >
            <drive.icon className="dark:text-cyan-500 text-3xl text-cyan-700" />
            <div className="flex justify-between items-center w-full">
              <span className="text-xl dark:text-gray-200 whitespace-nowrap">
                {drive.name}
              </span>

              {selectedCRM === drive.name &&
                (drive.name === "One Drive" ||
                  drive.name === "Google Drive") && (
                  <div className="flex items-center ml-4">
                    <span className="text-sm text-gray-500 mr-2">
                      {drive.name === "One Drive"
                        ? isOneDriveSync
                          ? "Sync OneDrive"
                          : "Sync Off"
                        : isGoogleDriveSync
                        ? "Sync Google Drive"
                        : "Sync Off"}
                    </span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        onChange={handleSourceSyncChange}
                        value=""
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-[#044a7b] rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {driveSelection && (
        <>
          {displayTenantChoice && (
            <TenantSelection
              nameSpacesList={nameSpacesList}
              handleOneDriveAuthorize={handleOneDriveAuthorize}
              setNameSpace={setNameSpace}
              nameSpace={nameSpace}
              setDisplayTenantChoice={setDisplayTenantChoice}
              handleNamespaceSelection={handleNamespaceSelection}
            />
          )}
          {displayMessage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="text-sky-700 dark:text-sky-400 mr-2"
                    />
                    Warning
                  </h2>
                  <button
                    onClick={() => setDisplayMessage(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You have OneDrive Restricted turned ON and no tenant has been
                  setup. Please setup a new tenant or turn OFF OneDrive
                  Restricted.
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setDisplayMessage(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                  <button
                    onClick={navigateToOrganisation}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#014d83] hover:bg-[#015896] rounded-md  focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Setup Now
                  </button>
                </div>
              </div>
            </div>
          )}
          <div
            className="fixed inset-0 flex items-center justify-center z-40"
            style={{ zIndex: 40 }}
          >
            <div className="absolute inset-0 bg-gray-800 dark:bg-gray-900 opacity-50"></div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-md z-10 max-w-3xl w-full">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-center text-neutral-800 dark:text-gray-200">
                  Add Content
                </h3>
                {renderDriveOptions()}
                <div className="flex justify-between mt-6">
                  <button
                    className="px-6 py-2 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors border border-red-200 dark:border-red-800"
                    onClick={() => {
                      localStorage.setItem("source_sync", 1);
                      setDriveSelection(false);
                    }}
                  >
                    Cancel
                  </button>
                  {/* Authorize button for selected drive */}
                  {renderButton()}
                </div>
              </div>
            </div>
            <AddContent
              fileUpload={fileUpload}
              setDriveSelection={setDriveSelection}
              setContentPlaceHolders={setContentPlaceHolders}
              setContentPlaceHolderModal={setContentPlaceHolderModal}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default DriveSelection;
