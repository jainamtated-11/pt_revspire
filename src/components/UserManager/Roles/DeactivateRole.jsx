import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonArrowDownToLine } from "@fortawesome/free-solid-svg-icons";

const DeactivateRole = ({ onClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await onClick();
    setIsLoading(false);
  };

  return (
    <button
      type="button"
      className="text-secondary flex flex-nowrap justify-center items-center text-[14px] mt-2 pt-1 pb-1 pl-4 pr-4 mr-2 mb-2 rounded-md border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
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

export default DeactivateRole; 