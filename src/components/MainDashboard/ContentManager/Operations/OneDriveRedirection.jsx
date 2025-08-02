import React, { useState, useEffect, useContext } from "react";
import { ThreeDots } from "react-loader-spinner";
import logo from "../../../../assets/Logo.png";
import { GlobalContext } from "../../../../context/GlobalState";
import { useNavigate } from "react-router-dom";
import { breadcrumbSetter } from "../../../../features/content/contentSlice";
import { useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import useAxiosInstance from "../../../../Services/useAxiosInstance";
import MiniLogoLoader from "../../../../assets/LoadingAnimation/MiniLogoLoader";

function OneDriveRedirection() {
  const [loading, setLoading] = useState(true);
  const {
    setOneDrivePickerOpen,
    setFolderPath,
    setFolder_id,
    viewer_id,
    baseURL,
  } = useContext(GlobalContext);

  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  const dispatch = useDispatch();
  const axiosInstance = useAxiosInstance();
  const [cookies, setCookie, removeCookie] = useCookies([
    "OneDriveAccessToken",
    "OneDriveData",
    "accessToken",
    "scope",
    "nameSpace",
    "folderPath",
    "refreshToken",
  ]);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const accessToken = cookies.accessToken;
        const refreshToken = cookies.refreshToken;
        const scope = cookies.scope;
        const nameSpace = cookies.nameSpace;
        const encodedFolderPath = cookies.folderPath;

         // Store nameSpace in local storage
         if (nameSpace) {
          localStorage.setItem("nameSpace", nameSpace);
          console.log("Namespace stored in local storage:", nameSpace);
      } else {
          console.warn("Namespace is not available to store.");
          console.error("Name space is not available")
      }

        console.log("Encoded folder path (raw):", encodedFolderPath);

        // Proceed only if all required parameters are present
        if (
          accessToken &&
          scope &&
          nameSpace &&
          encodedFolderPath &&
          refreshToken
        ) {
          let folderID;

          // Check if encodedFolderPath is already an array of objects
          if (
            Array.isArray(encodedFolderPath) &&
            encodedFolderPath.length > 0
          ) {
            console.log(
              "Detected encodedFolderPath as array of objects:",
              encodedFolderPath
            );

            // Directly access the last item in the array to get folder ID
            const lastFolder = encodedFolderPath[encodedFolderPath.length - 1];
            console.log("Extracted Last Flder: ", lastFolder);

            folderID = lastFolder.id;
            console.log("Extracted Folder ID:", folderID);
          } else {
            console.warn(
              "encodedFolderPath is not an array or is empty:",
              encodedFolderPath
            );
          }

          // Set the folder ID and path in context if found
          if (folderID) {
            setFolder_id(folderID);
            setFolderPath(folderID);
            dispatch(breadcrumbSetter(encodedFolderPath));
          } else {
            console.error("Folder ID could not be determined.");
          }

          const cookieData = {
            nameSpace,
            folderPath: JSON.stringify(encodedFolderPath),
            folderID,
          };

          removeCookie("OneDriveAccessToken");

          setCookie("OneDriveAccessToken", accessToken, {
            path: "/",
            maxAge: 3600,
            SameSite: "None",
          });

          removeCookie("OneDriveData");

          setCookie("OneDriveData", JSON.stringify(cookieData), {
            path: "/",
            maxAge: 3600,
            SameSite: "None",
          });
          // New API call to update OneDrive token
          await axiosInstance.post(
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
          setOneDrivePickerOpen(true);

          // Navigate to the home page
          navigate("/");
        } else {
          console.warn("Missing required parameters in the URL.");
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
      } finally {
        // Perform cookie cleanup
        removeCookie("accessToken", { path: "/" });
        removeCookie("scope", { path: "/" });
        removeCookie("nameSpace", { path: "/" });
        removeCookie("folderPath", { path: "/" });
        removeCookie("refreshToken", { path: "/" });

        setLoading(false);
      }
    };

    handleRedirect();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
     {loading ? <MiniLogoLoader /> : <div id="pickedFiles"></div>}
    </div>
  );
}

export default OneDriveRedirection;
