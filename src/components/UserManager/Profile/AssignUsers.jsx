import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPersonCirclePlus } from "@fortawesome/free-solid-svg-icons";

function AssignUsers({ onClick }) {
  return (
    <button
      type="button"
      className="text-secondary flex items-center whitespace-nowrap text-[14px] my-0.5 pt-1 pb-1 pl-4 pr-4 mr-2 rounded-md ml-0.1 border-solid hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-500"
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faPersonCirclePlus} className="mr-2" />
      <span>Assign Users</span>
    </button>
  );
}

export default AssignUsers;
