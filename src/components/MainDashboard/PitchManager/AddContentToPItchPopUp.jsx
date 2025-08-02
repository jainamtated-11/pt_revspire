import React, { useState, useEffect, useContext } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import Breadcrumbs from "../../../utility/Breadcrumbs.jsx";
import toast from "react-hot-toast";

function AddContentToPitchPopUp() {
  const [folders, setFolders] = useState([]);
  const [sortedItems, setSortedItems] = useState([]);

  const {
    selectedItems,
    folder_id,
    viewer_id,
    setContents,
    dialogBreadcrumbs,
    setDialogBreadcrumbs,
    isMoveButtonClicked,
    baseURL,
    contents,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  //---------------------- Populating all folders on mount---------------------//
  useEffect(() => {
    const fetchContentsAndFolders = async () => {
      try {
        const response = await axiosInstance.post(
          `/view-content-and-folders-sorted`,
          {
            viewer_id,
            folder_id: folder_id,
          },
          {
            withCredentials: true, // Include credentials in the request
          }
        );

        const { items } = response.data;
        console.log("from add content to pitch");
        setContents(items);
        setFolders(items);
      } catch (error) {
        console.error("Error fetching contents and folders:", error.message);
      }
    };

    fetchContentsAndFolders();
  }, [viewer_id, folder_id, baseURL]);

  //-----------------------------useEffect to update sortedItems only when isMoveButtonClicked changes-----------------//
  useEffect(() => {
    if (isMoveButtonClicked) {
      const sortedContents = folders.filter((folder) => {
        // Check if the folder's id is not included in selectedItems
        return !selectedItems.some(
          (selectedItem) => selectedItem.id === folder.id
        );
      });

      // Check if the sortedContents array is different before updating state
      if (!arraysAreEqual(sortedContents, sortedItems)) {
        setSortedItems(sortedContents);
      }
    }
  }, [isMoveButtonClicked, folders, selectedItems, sortedItems]);

  // Helper function to compare two arrays of objects by their id property
  function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i].id !== arr2[i].id) return false;
    }
    return true;
  }

  //-------------------------------------Function to navigate to a folder----------------------------
  const navigateToFolderInDialog = async (folderId, folderName) => {
    try {
      const response = await axiosInstance.post(
        `/view-content-and-folders-sorted`,
        {
          viewer_id,
          folder_id: folderId,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );

      const { items } = response.data;
      setContents(items);
      setFolders(items);

      // Updating Breadcrumb while navigating only if folderName is provided
      if (folderName) {
        setDialogBreadcrumbs((prevBreadcrumbs) => [
          ...prevBreadcrumbs,
          { id: folderId, name: folderName },
        ]);
      }
    } catch (error) {
      console.error("Error navigating to folder:", error.message);
      // Handle error
    }
  };

  // Function to refresh folders after move cancel or move sucess
  const fetchFolders = async () => {
    try {
      const response = await axiosInstance.post(
        `/get-child-folders`,
        {
          folderId: folder_id,
          viewer_id: viewer_id,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      const { success, childFolders } = response.data;

      if (success) {
        setFolders(childFolders);
      } else {
        console.error("Failed to fetch folders:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching folders:", error.message);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center z-10">
        <div className="absolute inset-0 bg-gray-800 opacity-50 "></div>
        <div className="bg-white p-6 rounded-md z-10 h-4/5">
          {/* <Breadcrumbs onBreadcrumbClick={navigateToFolderInDialog} /> */}
          Move {selectedItems.length} item
          <Breadcrumbs
            onBreadcrumbClick={navigateToFolderInDialog}
            breadcrumbs={dialogBreadcrumbs}
            setBreadcrumbs={setDialogBreadcrumbs}
          />
          <div className="flex gap-4 flex-col ">
            <table className="w-full text-left overflow-hidden rounded-lg shadow-lg">
              {/* table head */}
              <thead className="text-xs text-white uppercase bg-sky-800">
                <tr>
                  <th className="px-6 py-3 w-64">Name</th>
                  <th className="px-6 py-3 w-52">Source</th>
                  <th className="px-6 py-3 w-52">Created By</th>
                  <th className="px-6 py-3">Size</th>
                </tr>
              </thead>
              {/* table body */}
              <tbody>
                {contents.length > 0 &&
                  contents.map((item) => (
                    <tr
                      key={item.id}
                      className="odd:bg-white even:bg-gray-50  border-b  hover:bg-gray-100"
                    >
                      <td
                        className="px-4 py-2 cursor-pointer hover:text-sky-500 w-64"
                        onClick={() =>
                          item.id[0] === "W" &&
                          navigateToFolderInDialog(item.id, item.name)
                        }
                      >
                        {item.name}
                      </td>
                      <td
                        onClick={() => {}}
                        className="px-4 py-2 cursor-pointer hover:text-sky-500 w-52"
                      >
                        {item.source || "Home"}
                      </td>
                      <td className="px-4 py-2 cursor-pointer hover:text-sky-500 w-52">
                        {item.created_by}
                      </td>
                      <td className="px-4 py-2 cursor-pointer hover:text-sky-500 w-52">
                        {item.size}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setDialogBreadcrumbs([{ id: folder_id, name: "Root" }]);
                  fetchFolders();
                }}
                className="flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid border-red-500 bg-red-300 text-red-800"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  fetchFolders();
                }}
                className="flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid border-gray-400 bg-white text-gray-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddContentToPitchPopUp;
