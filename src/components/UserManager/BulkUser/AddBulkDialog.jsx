import React, { useContext, useState } from "react";
import { GlobalContext } from "../../../context/GlobalState.jsx";
import toast from "react-hot-toast";
import { Grid } from "react-loader-spinner";
import useAxiosInstance from "../../../Services/useAxiosInstance.jsx";
import useOutsideClick from "../../../hooks/useOutsideClick.js";
function AddBulkDialog() {
  const {
    viewer_id,
    setAddBulkUserClicked,
    bulkUserUploads,
    setBulkUserUploads,
  } = useContext(GlobalContext);
  const axiosInstance = useAxiosInstance();

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  // Helper function to check if the file has a .csv extension
  const isValidFileType = (file) => {
    const validExtension = "csv";
    const fileName = file.name;
    const fileExtension = fileName.split(".").pop().toLowerCase();
    return fileExtension === validExtension;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (isValidFileType(file)) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      alert("Please select a .csv file.");
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      toast.warning("Please select a file !");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("csvFile", selectedFile);
      formData.append("created_by", viewer_id);

      const response = await axiosInstance.post(
        `/bulk-create-users`,
        formData,
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      console.log(response.data);
      refreshBulkUsers();
      toast.success("Users created sucessfully !");
      setAddBulkUserClicked(false); // Log response for debugging or feedback
      // Optionally, you can handle success or display a message to the user
    } catch (error) {
      toast.error("Error occurred while saving:");
      console.error("Error occurred while saving:", error);
      // Optionally, you can display an error message to the user
    } finally {
      setLoading(false);
    }
  };

  const refreshBulkUsers = () => {
    axiosInstance
      .post(`/view-bulk-user-create`, {
        viewer_id: viewer_id,
      })
      .then((response) => {
        if (response.data.success) {
          setBulkUserUploads(response.data.exports);
        } else {
          console.error("Error fetching users:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
      });
  };

  const resetState = () => {
    setAddBulkUserClicked(false);
    setSelectedFile(null);
  };

  const modalRef = useOutsideClick([resetState]);

  if (loading) {
    return (
      <div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
          <div className="bg-white p-6 rounded-md z-50 w-auto">
            <Grid
              visible={true}
              height="40"
              width="40"
              color="#075985"
              ariaLabel="grid-loading"
              radius="12.5"
              wrapperStyle={{}}
              wrapperClass="grid-wrapper"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-gray-800 opacity-50"></div>
          <div ref={modalRef} className="bg-white p-6 rounded-md z-50 w-auto">
            <div className="font-bold pb-4">Bulk Upload Users</div>
            <div className="flex flex-row items-center gap-4 mb-16">
              <label className="w-24 text-sm font-bold" htmlFor="fileInput">
                File:
              </label>
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                className="border border-gray-400 rounded-md py-1 px-2"
                accept=".csv"
              />
            </div>
            <div className="flex justify-center items-center gap-4">
              <button
                className="flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid border-red-500 bg-red-300 text-red-800"
                onClick={() => setAddBulkUserClicked(false)}
              >
                Cancel
              </button>
              <button
                className="flex w-48 h-8 px-6 text-sm justify-center items-center rounded-xl border border-solid border-gray-400 bg-white text-gray-800"
                onClick={handleSave} // Step 3: Attach the handleSave function to the onClick event
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBulkDialog;
