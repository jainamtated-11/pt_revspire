import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "../../../../context/GlobalState.jsx";
import { useSelector, useDispatch } from "react-redux";
import { UnSelectAllItems } from "../../../../features/content/contentSlice.js";
import useAxiosInstance from "../../../../Services/useAxiosInstance.jsx";
import toast from "react-hot-toast";
import axios from "axios";

const DownloadContent = ({ inDialog = false }) => {
  const { viewer_id, baseURL } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const dispatch = useDispatch();

  const selectedItems = useSelector((state) => state.contents.selectedItems);

  const downloadPopUpHandler = async () => {
    let ids = selectedItems.map((item) => item.id);
    let idsParameter = `contentIds=${ids.join(",")}&viewerId=${viewer_id}`;

    console.log(idsParameter);

    // Promise-based toast
    const promise = new Promise(async (resolve, reject) => {
      try {
        // Create a new Axios instance
        const instance = axios.create();

        // Setup the response interceptor
        instance.interceptors.response.use((response) => {
          resolve("File downloaded successfully!");
          return response;
        });

        // Send the GET request
        const response = await instance.get(
          `${baseURL}/download-files?${idsParameter}`,
          {
            responseType: "blob",
            withCredentials: true, // Add this line to send cookies with the request
          }
        );

        // Get the file name from the first selected item
        const fileName =
          selectedItems.length === 1
            ? selectedItems[0].name
            : "downloaded_files";

        // Get the MIME type from the response headers
        const contentType = response.headers["content-type"];

        // Determine the file extension based on the content type
        let fileExtension = "";
        switch (contentType) {
          case "application/zip":
            fileExtension = ".zip";
            break;
          case "application/pdf":
            fileExtension = ".pdf";
            break;
          // Add more cases as needed
        }

        // Download the file
        downloadSingleFile(response.data, `${fileName}${fileExtension}`);
      } catch (error) {
        console.error(error);
        reject("Download failed!");
      } finally {
        dispatch(UnSelectAllItems());
      }
    });

    toast.promise(promise, {
      loading: "Downloading files...",
      success: (msg) => `${msg}`,
      error: (err) => `Failed: ${err}`,
    });

    // Function for downloading a file
    function downloadSingleFile(blob, fileName) {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <button
      type="button"
      className="flex items-center text-secondary text-[14px] py-1 px-2 my-1 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
      // className={`flex text-sky-800 text-[14px] rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 transition duration-300 ease-in-out ${
      //   !inDialog
      //     ? " my-2 px-3 py-2 "
      //     : "py-2 pr-3 tracking-tight justify-start items-start "
      // }`}
      onClick={downloadPopUpHandler}
    >
      <FontAwesomeIcon icon={faDownload} className="mr-2" />
      Download
    </button>
  );
};

export default DownloadContent;
