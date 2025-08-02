import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonArrowUpFromLine } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const ActivateUser = ({ onClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true); // Set loading state to true when the button is clicked
    await onClick(); // Call the onClick function passed from the parent component
    toast.success("User Activated successfully");
    setIsLoading(false); // Reset loading state when the request is completed
  };

  return (
    <button
      type="button"
      className=" text-secondary text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200  dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 "
      disabled={isLoading} // Disable the button when loading
    >
      {isLoading ? ( // Display "Activating" when loading, otherwise "Activate"
        <span className="flex items-center">
          Activating <div className="animate-spin ml-1">..</div>
        </span>
      ) : (
        <>
          <FontAwesomeIcon icon={faPersonArrowUpFromLine} className="mr-2" />
          Activate
        </>
      )}
    </button>
  );
};

export default ActivateUser;
