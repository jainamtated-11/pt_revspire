import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie"; // Import useCookies
import { GlobalContext } from "../../../../context/GlobalState";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import LogoAnimation from "../../../ui/LogoAnimation";
import { useDispatch, useSelector } from "react-redux";
import { fetchContentsAsync } from "../../../../features/content/contentSlice";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import { breadcrumbSetter } from "../../../../features/content/contentSlice";

function GoogleDriveRedirection() {
  const [cookies, setCookie, removeCookie] = useCookies([
    "GoogleDirveAccessToken",
    "googleClientId",
    "userData",
  ]); // Initialize cookies and setCookie function

  const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

  const organisation_id = cookies.userData?.organisation?.id;

  const { setDriveSelection, viewer_id, baseURL } = useContext(GlobalContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();
  const breadcrumbsState = useSelector((state) => state.contents.breadcrumbs);
  const [tokenClient, setTokenClient] = useState(null);
  const [pickerInited, setPickerInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [GoogleDriveApiKey, setGoogleDriveApiKey] = useState("");
  const [gdriveClientID, setGdriveClientID] = useState("");
  const [folderId, setFolderId] = useState("");

  const breadcrumbs = useSelector((state) => state.contents.breadcrumbs);
  const currentFolder =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : null;
  const currentFolderId = currentFolder ? currentFolder.id : "";

  //UseEffect for Google Drive Picker
  useEffect(() => {
    console.log(
      "==============from inside the google drive redirection component==============="
    );
    axiosInstance
      .post(`/google-credentials`, {
        viewer_id: viewer_id,
      })
      .then((response) => {
        if (
          response.data.message === "Google credentials generated successfully"
        ) {
          setGoogleDriveApiKey(response.data.googleApiKey);
          setGdriveClientID(response.data.googleClientId);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch namespace", error);
      });
  }, [viewer_id]);

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
    console.log(
      "==============from inside the google drive redirection component==============="
    );
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
        .setDeveloperKey(GoogleDriveApiKey)
        .setCallback((data) => pickerCallback(data, token))
        .build();
      picker.setVisible(true);
    }
  };

  //Picker callback to upload picked file to our database
  const pickerCallback = async (data, token) => {
    console.log(
      "==============from inside the google drive redirection component==============="
    );
    const source_sync = localStorage.getItem("source_sync");
    if (data.action === window.google.picker.Action.PICKED) {
      // const fileId = data.docs[0].id;
      const fileIDs = data.docs.map((doc) => doc.id);
      console.log("fileIDs: ", fileIDs);

      setDriveSelection(false);

      toast
        .promise(
          axiosInstance.post(`/googledrive-upload`, {
            // fileID: fileId,
            fileIDs: fileIDs,
            created_by: viewer_id,
            accessToken: token,
            folder_id: currentFolderId,
            ...(source_sync == 0 && { source_sync: source_sync }),
          }),
          {
            loading: "Uploading file...", // Corrected the key to "loading"
            success: "Content Added Successfully!",
            error: "Failed to Add Some Content",
          }
        )
        .then(() => {
          console.log(
            "CONDITIONSSSS",
            breadcrumbs[breadcrumbs.length - 1].id,
            currentFolderId
          );
          if (breadcrumbs[breadcrumbs.length - 1].id == currentFolderId) {
            dispatch(
              fetchContentsAsync({
                viewer_id,
                folder_id: currentFolderId,
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

  useEffect(() => {
    // Step 1: Extract the access token from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("accessToken");

    const breadcrumbStateEncoded = urlParams.get("breadcrumbState");
    let folderPathArray = [];
    // Step 2: Decode and parse the JSON string
    if (breadcrumbStateEncoded) {
      try {
        const breadcrumbArray = JSON.parse(
          decodeURIComponent(breadcrumbStateEncoded)
        );
        folderPathArray = breadcrumbArray;
      } catch (error) {
        console.error("Failed to parse breadcrumb state:", error);
      }
    }
    const folderID = folderPathArray[folderPathArray.length - 1]?.id;
    setFolderId(folderID);
    dispatch(breadcrumbSetter(folderPathArray));

    if (accessToken) {
      removeCookie("GoogleDirveAccessToken");

      // Step 2: Store the access token in a cookie with an expiration time of 3599 seconds
      setCookie("GoogleDirveAccessToken", accessToken, {
        path: "/",
        secure: true,
        sameSite: "Lax",
        maxAge: 3599, // Set expiration time to 3599 seconds
      });

      // Add the new API call before creating picker
      axiosInstance
        .post("/googledrive-file-sync", { accessToken })
        .catch((error) => {
          console.error("File sync failed, but continuing with picker:", error);
        })
        .finally(() => {
          // Create picker regardless of API call success/failure
          createPicker(accessToken);
        });
    }

    if (pickerInited && gisInited) {
      navigate("/");
    }

    // Remove the googleClientId cookie
    removeCookie("googleClientId", {
      path: "/",
      domain: ".revspire.io", // Must match the domain set when the cookie was created
      secure: true,
      sameSite: "Lax",
    });
  }, [setCookie, pickerInited, gisInited]); // Dependency array includes setCookie to avoid any warnings

  return (
    <div>
      <LogoAnimation size={100} />
    </div>
  );
}

export default GoogleDriveRedirection;
