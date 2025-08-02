import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonArrowDownToLine } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const DeactivateUser = ({ onClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true); // Set loading state to true when the button is clicked
    await onClick(); // Call the onClick function passed from the parent component
    setIsLoading(false); // Reset loading state when the request is completed
    toast.error("User Deactivated successfully");
  };

  return (
    <button
      type="button"
      className=" text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
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

export default DeactivateUser;
