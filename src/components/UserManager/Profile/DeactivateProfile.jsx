import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonArrowDownToLine } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const DeactivateProfile = ({
  onClick,
  deactivateSuccess,
  deactivateErrorMessage,
  issetDeactivateSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true); // Set loading state to true when the button is clicked
    await onClick(); // Call the onClick function passed from the parent component
    // toast.success('Profile Deactivated!');
    // console.log("deactivateSuccess", deactivateErrorMessage);

    setIsLoading(false); // Reset loading state when the request is completed
    // issetDeactivateSuccess(null)
  };

  // const handleClick = async () => {
  //   setIsLoading(true); // Set loading state to true
  //   const result = await onClick(); // Call the onClick function passed from the parent component
  //   setIsLoading(false); // Reset loading state

  //   // Check if the onClick function returned a success message
  //   if (result.success) {
  //     toast.success('Profile Deactivated!');
  //   } else {
  //     toast.error(result.message); // Show error message if any
  //   }
  // };

  // console.log("deactivateSuccess", deactivateErrorMessage);

  return (
    <button
      type="button"
      className="text-secondary flex items-center text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
      onClick={handleClick} // Call handleClick when the button is clicked
      disabled={isLoading} // Disable the button when loading
    >
      {isLoading ? ( // Display "Deactivating" when loading, otherwise "Deactivate"
        <span className="flex items-center">
          Deactivating <div className="animate-spin ml-1">...</div>
        </span>
      ) : (
        <>
          <FontAwesomeIcon icon={faPersonArrowDownToLine} className="mr-2" />
          Deactivate
        </>
      )}
    </button>
  );
};

export default DeactivateProfile;
