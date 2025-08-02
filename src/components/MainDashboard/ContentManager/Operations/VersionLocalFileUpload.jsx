import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import useAxiosInstance from '../../../../Services/useAxiosInstance';
import Button from '../../../ui/Button';

const VersionLocalFileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input
  const axiosInstance = useAxiosInstance(); // Your custom Axios instance

  // Trigger file input click when the button is clicked
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Handle file input change
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]); // Store the selected file
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData(); // Create a new FormData object
    formData.append('files', selectedFile); // Append the selected file
    formData.append('info', 'additional info'); // Append additional info if needed

    try {
      const response = await axiosInstance.post('/upload-endpoint', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      if (response.status === 200) {
        toast.success("File uploaded successfully");
        console.log(response.data); // Handle success response
      } else {
        toast.error("Failed to upload file");
        console.error(response.data.message); // Handle failure
      }
    } catch (error) {
      toast.error("Error uploading file");
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" // Hide the file input
        accept=".pdf,.doc,.docx,.txt,.jpeg,.png" // Accept specific file types
      />
      <Button type="submit" onClick={handleButtonClick} className={'btn-primary relative flex'}>
        Browse
      </Button>
    </form>
  );
};

export default VersionLocalFileUpload;
