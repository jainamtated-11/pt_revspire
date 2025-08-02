import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonArrowUpFromLine } from "@fortawesome/free-solid-svg-icons";

const ActivateRole = ({ onClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await onClick();
    setIsLoading(false);
  };

  return (
    <button
      type="button"
      className={`text-sky-800 text-[14px] pt-1 pb-1 pl-3 pr-3 mr-3 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500 ${
        isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
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

export default ActivateRole; 